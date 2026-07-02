import { Router } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { ENV } from "./_core/env";

const JWT_SECRET = ENV.jwtSecret || "your-super-secret-key-change-in-production";
const JWT_EXPIRY = "7d";

export interface AuthPayload {
  id: number;
  email: string;
}

export function createAuthToken(user: AuthPayload): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const authRouter = Router();

// Register
authRouter.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await db.upsertUser({
      email,
      passwordHash,
      name: name || email.split("@")[0],
      loginMethod: "jwt",
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const token = createAuthToken({ id: user.id, email: user.email });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
authRouter.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await db.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update lastSignedIn
    await db.updateUser(user.id, { lastSignedIn: new Date() });

    const token = createAuthToken({ id: user.id, email: user.email });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
authRouter.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ ok: true });
});

// Get current user
authRouter.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.auth_token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await db.getUserById(payload.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});
