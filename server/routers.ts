import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAchievement,
  createCalendarEvent,
  createCourse,
  createGardenFlower,
  createNote,
  createStudySession,
  createTask,
  deleteCalendarEvent,
  deleteCourse,
  deleteNote,
  deleteTask,
  getAchievementsByUser,
  getCalendarEventsByUser,
  getCourseById,
  getCoursesByUser,
  getDashboardStats,
  getGardenFlowersByUser,
  getNotesByUser,
  getStudySessionsByUser,
  getStudyStats,
  getTasksByUser,
  updateCalendarEvent,
  updateCourse,
  updateNote,
  updateTask,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Courses Router ───────────────────────────────────────────────────────────
const coursesRouter = router({
  list: protectedProcedure.query(({ ctx }) => getCoursesByUser(ctx.user.id)),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const course = await getCourseById(input.id, ctx.user.id);
    if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
    return course;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        progress: z.number().min(0).max(100).default(0),
        status: z.enum(["active", "completed", "paused"]).default("active"),
        color: z.string().optional(),
        emoji: z.string().optional(),
        courseLink: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createCourse({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        status: z.enum(["active", "completed", "paused"]).optional(),
        color: z.string().optional(),
        emoji: z.string().optional(),
        courseLink: z.string().url().optional().or(z.literal("")),
        totalHours: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await getCourseById(id, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, unknown> = { ...data };

      // If completing course, set completedAt and create garden flower
      if (data.status === "completed" && existing.status !== "completed") {
        updateData.completedAt = new Date();
        updateData.progress = 100;

        // Create garden flower
        const flowers = await getGardenFlowersByUser(ctx.user.id);
        const posX = (flowers.length % 5) * 18 + 8 + Math.random() * 4;
        const posY = Math.floor(flowers.length / 5) * 22 + 10 + Math.random() * 4;
        await createGardenFlower({
          userId: ctx.user.id,
          courseId: id,
          courseName: existing.name,
          flowerType: (flowers.length % 6) + 1,
          positionX: posX,
          positionY: posY,
          bloomedAt: new Date(),
        });

        // Create achievement
        await createAchievement({
          userId: ctx.user.id,
          type: "course_completed",
          title: `¡Curso completado!`,
          description: `Completaste "${existing.name}"`,
          icon: "🌸",
        });
      }

      await updateCourse(id, ctx.user.id, updateData as Parameters<typeof updateCourse>[2]);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCourse(input.id, ctx.user.id);
      return { success: true };
    }),

  extractMetadata: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(input.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No se pudo acceder a la URL" });
        }

        const html = await response.text();
        const titleMatch = html.match(/<meta\s+property=['"']og:title['"']\s+content=['"']([^'"']*)['"']/) ||
                          html.match(/<title>([^<]*)<\/title>/) ||
                          html.match(/<meta\s+name=['"']title['"']\s+content=['"']([^'"']*)['"']/) ||
                          html.match(/<h1[^>]*>([^<]*)<\/h1>/);
        const descriptionMatch = html.match(/<meta\s+property=['"']og:description['"']\s+content=['"']([^'"']*)['"']/) ||
                                html.match(/<meta\s+name=['"']description['"']\s+content=['"']([^'"']*)['"']/) ||
                                html.match(/<meta\s+name=['"']og:description['"']\s+content=['"']([^'"']*)['"']/) ||
                                html.match(/<p[^>]*>([^<]*)<\/p>/);
        const imageMatch = html.match(/<meta\s+property=['"']og:image['"']\s+content=['"']([^'"']*)['"']/) ||
                          html.match(/<meta\s+name=['"']image['"']\s+content=['"']([^'"']*)['"']/) ||
                          html.match(/<img[^>]+src=['"']([^'"']*)['"'][^>]*>/);

        return {
          title: titleMatch?.[1]?.trim().slice(0, 255) || null,
          description: descriptionMatch?.[1]?.trim().slice(0, 500) || null,
          image: imageMatch?.[1] || null,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al extraer metadatos de la URL",
        });
      }
    }),
});

// ─── Tasks Router ─────────────────────────────────────────────────────────────
const tasksRouter = router({
  list: protectedProcedure.query(({ ctx }) => getTasksByUser(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        courseId: z.number().optional(),
        label: z.enum(["course", "project", "practice"]).default("course"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createTask({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        courseId: z.number().optional().nullable(),
        label: z.enum(["course", "project", "practice"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
        dueDate: z.date().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.status === "completed") {
        updateData.completedAt = new Date();
      }
      await updateTask(id, ctx.user.id, updateData as Parameters<typeof updateTask>[2]);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteTask(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Notes Router ─────────────────────────────────────────────────────────────
const notesRouter = router({
  list: protectedProcedure.query(({ ctx }) => getNotesByUser(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().optional(),
        courseId: z.number().optional(),
        isSnippet: z.boolean().default(false),
        language: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createNote({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().optional(),
        courseId: z.number().optional().nullable(),
        isSnippet: z.boolean().optional(),
        language: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateNote(id, ctx.user.id, data as Parameters<typeof updateNote>[2]);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteNote(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Study Sessions Router ────────────────────────────────────────────────────
const studySessionsRouter = router({
  list: protectedProcedure.query(({ ctx }) => getStudySessionsByUser(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        courseId: z.number().optional(),
        durationMinutes: z.number().min(1),
        sessionDate: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createStudySession({
        courseId: input.courseId,
        durationMinutes: input.durationMinutes,
        notes: input.notes,
        userId: ctx.user.id,
        sessionDate: input.sessionDate as unknown as Date,
      });
      // Update course totalHours if courseId provided
      if (input.courseId) {
        const course = await getCourseById(input.courseId, ctx.user.id);
        if (course) {
          const newHours = course.totalHours + input.durationMinutes / 60;
          await updateCourse(input.courseId, ctx.user.id, { totalHours: Math.round(newHours * 10) / 10 });
        }
      }
      return { success: true };
    }),

  stats: protectedProcedure.query(({ ctx }) => getStudyStats(ctx.user.id)),
});

// ─── Calendar Router ──────────────────────────────────────────────────────────
const calendarRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional()
    )
    .query(({ ctx, input }) =>
      getCalendarEventsByUser(ctx.user.id, input?.startDate, input?.endDate)
    ),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        courseId: z.number().optional(),
        taskId: z.number().optional(),
        eventType: z.enum(["study", "deadline", "reminder", "other"]).default("study"),
        startTime: z.date(),
        endTime: z.date().optional(),
        allDay: z.boolean().default(false),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createCalendarEvent({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        eventType: z.enum(["study", "deadline", "reminder", "other"]).optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional().nullable(),
        allDay: z.boolean().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCalendarEvent(id, ctx.user.id, data as Parameters<typeof updateCalendarEvent>[2]);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCalendarEvent(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Garden Router ────────────────────────────────────────────────────────────
const gardenRouter = router({
  flowers: protectedProcedure.query(({ ctx }) => getGardenFlowersByUser(ctx.user.id)),
});

// ─── Stats Router ─────────────────────────────────────────────────────────────
const statsRouter = router({
  dashboard: protectedProcedure.query(({ ctx }) => getDashboardStats(ctx.user.id)),
  study: protectedProcedure.query(({ ctx }) => getStudyStats(ctx.user.id)),
  achievements: protectedProcedure.query(({ ctx }) => getAchievementsByUser(ctx.user.id)),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  courses: coursesRouter,
  tasks: tasksRouter,
  notes: notesRouter,
  studySessions: studySessionsRouter,
  calendar: calendarRouter,
  garden: gardenRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
