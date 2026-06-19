import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  achievements,
  calendarEvents,
  courses,
  gardenFlowers,
  InsertUser,
  notes,
  studySessions,
  tasks,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function getCoursesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.userId, userId)).orderBy(desc(courses.updatedAt));
}

export async function getCourseById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(and(eq(courses.id, id), eq(courses.userId, userId))).limit(1);
  return result[0];
}

export async function createCourse(data: typeof courses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(courses).values(data);
  return result;
}

export async function updateCourse(id: number, userId: number, data: Partial<typeof courses.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(courses).set(data).where(and(eq(courses.id, id), eq(courses.userId, userId)));
}

export async function deleteCourse(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(courses).where(and(eq(courses.id, id), eq(courses.userId, userId)));
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function createTask(data: typeof tasks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(tasks).values(data);
  return result;
}

export async function updateTask(id: number, userId: number, data: Partial<typeof tasks.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNotesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
}

export async function createNote(data: typeof notes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(notes).values(data);
  return result;
}

export async function updateNote(id: number, userId: number, data: Partial<typeof notes.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(notes).set(data).where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

export async function deleteNote(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
}

// ─── Study Sessions ───────────────────────────────────────────────────────────

export async function getStudySessionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.createdAt));
}

export async function createStudySession(data: typeof studySessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(studySessions).values(data);
  return result;
}

export async function getStudyStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalMinutes: 0, totalSessions: 0, streak: 0 };

  const sessions = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.sessionDate));

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalSessions = sessions.length;

  // Calculate streak
  let streak = 0;
  if (sessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const uniqueDates = Array.from(new Set(sessions.map((s) => s.sessionDate))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let current = new Date(today);
    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        current = d;
      } else {
        break;
      }
    }
  }

  return { totalMinutes, totalSessions, streak };
}

// ─── Calendar Events ──────────────────────────────────────────────────────────

export async function getCalendarEventsByUser(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(calendarEvents.userId, userId)];
  if (startDate) conditions.push(gte(calendarEvents.startTime, startDate));
  if (endDate) conditions.push(lte(calendarEvents.startTime, endDate));
  return db.select().from(calendarEvents).where(and(...conditions)).orderBy(calendarEvents.startTime);
}

export async function createCalendarEvent(data: typeof calendarEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(calendarEvents).values(data);
  return result;
}

export async function updateCalendarEvent(id: number, userId: number, data: Partial<typeof calendarEvents.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(calendarEvents).set(data).where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)));
}

export async function deleteCalendarEvent(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(calendarEvents).where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)));
}

// ─── Garden Flowers ───────────────────────────────────────────────────────────

export async function getGardenFlowersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gardenFlowers).where(eq(gardenFlowers.userId, userId)).orderBy(gardenFlowers.bloomedAt);
}

export async function createGardenFlower(data: typeof gardenFlowers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(gardenFlowers).values(data);
  return result;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function getAchievementsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.earnedAt));
}

export async function createAchievement(data: typeof achievements.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(achievements).values(data);
  return result;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { activeCourses: 0, completedCourses: 0, pendingTasks: 0, totalHours: 0, streak: 0 };

  const [userCourses, userTasks, studyStats] = await Promise.all([
    db.select().from(courses).where(eq(courses.userId, userId)),
    db.select().from(tasks).where(eq(tasks.userId, userId)),
    getStudyStats(userId),
  ]);

  const activeCourses = userCourses.filter((c) => c.status === "active").length;
  const completedCourses = userCourses.filter((c) => c.status === "completed").length;
  const pendingTasks = userTasks.filter((t) => t.status !== "completed").length;
  const totalHours = Math.round((studyStats.totalMinutes / 60) * 10) / 10;

  return {
    activeCourses,
    completedCourses,
    pendingTasks,
    totalHours,
    streak: studyStats.streak,
  };
}
