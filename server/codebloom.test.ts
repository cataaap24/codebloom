import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB helpers
vi.mock("./db", () => ({
  getCoursesByUser: vi.fn().mockResolvedValue([]),
  getCourseById: vi.fn().mockResolvedValue(undefined),
  createCourse: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateCourse: vi.fn().mockResolvedValue(undefined),
  deleteCourse: vi.fn().mockResolvedValue(undefined),
  getTasksByUser: vi.fn().mockResolvedValue([]),
  createTask: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateTask: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  getNotesByUser: vi.fn().mockResolvedValue([]),
  createNote: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateNote: vi.fn().mockResolvedValue(undefined),
  deleteNote: vi.fn().mockResolvedValue(undefined),
  getStudySessionsByUser: vi.fn().mockResolvedValue([]),
  createStudySession: vi.fn().mockResolvedValue({ insertId: 1 }),
  getStudyStats: vi.fn().mockResolvedValue({ totalMinutes: 120, totalSessions: 3, streak: 2 }),
  getCalendarEventsByUser: vi.fn().mockResolvedValue([]),
  createCalendarEvent: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateCalendarEvent: vi.fn().mockResolvedValue(undefined),
  deleteCalendarEvent: vi.fn().mockResolvedValue(undefined),
  getGardenFlowersByUser: vi.fn().mockResolvedValue([]),
  createGardenFlower: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAchievementsByUser: vi.fn().mockResolvedValue([]),
  createAchievement: vi.fn().mockResolvedValue({ insertId: 1 }),
  getDashboardStats: vi.fn().mockResolvedValue({ activeCourses: 2, completedCourses: 1, pendingTasks: 3, totalHours: 5.5, streak: 2 }),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@codebloom.app",
      name: "Test Bloomie",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("CodeBloom - Courses Router", () => {
  it("returns empty list of courses", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.courses.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("creates a course successfully", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.courses.create({
      name: "React desde cero",
      description: "Aprende React con hooks",
      category: "Frontend",
      progress: 0,
      status: "active",
      color: "#c4b5fd",
      emoji: "🌸",
    });
    expect(result.success).toBe(true);
  });

  it("deletes a course", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.courses.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("CodeBloom - Tasks Router", () => {
  it("returns empty list of tasks", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tasks.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a task with all fields", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tasks.create({
      title: "Completar módulo 3",
      label: "course",
      priority: "high",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });
});

describe("CodeBloom - Notes Router", () => {
  it("creates a snippet note", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notes.create({
      title: "useCallback hook",
      content: "const fn = useCallback(() => {}, [deps]);",
      isSnippet: true,
      language: "TypeScript",
      tags: "react,hooks",
    });
    expect(result.success).toBe(true);
  });
});

describe("CodeBloom - Stats Router", () => {
  it("returns dashboard stats", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.stats.dashboard();
    expect(result).toHaveProperty("activeCourses");
    expect(result).toHaveProperty("completedCourses");
    expect(result).toHaveProperty("pendingTasks");
    expect(result).toHaveProperty("totalHours");
    expect(result).toHaveProperty("streak");
  });

  it("returns study stats with streak", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.stats.study();
    expect(result).toHaveProperty("totalMinutes");
    expect(result).toHaveProperty("streak");
    expect(result.totalMinutes).toBe(120);
    expect(result.streak).toBe(2);
  });
});

describe("CodeBloom - Garden Router", () => {
  it("returns empty garden", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.garden.flowers();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("CodeBloom - Calendar Router", () => {
  it("creates a calendar event", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.calendar.create({
      title: "Sesión de React",
      eventType: "study",
      startTime: new Date("2026-06-20T09:00:00"),
      endTime: new Date("2026-06-20T11:00:00"),
    });
    expect(result.success).toBe(true);
  });
});
