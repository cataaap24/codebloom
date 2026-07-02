import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { verifySessionToken } from "./jwt";
import * as db from "../db";
import { parse as parseCookie } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Parse session token from cookies
    const cookies = parseCookie(opts.req.headers.cookie ?? "");
    const sessionToken = cookies[COOKIE_NAME];

    if (!sessionToken) {
      return { req: opts.req, res: opts.res, user: null };
    }

    // Verify JWT token
    const payload = await verifySessionToken(sessionToken);
    if (!payload) {
      return { req: opts.req, res: opts.res, user: null };
    }

    // Get user from database
    user = await db.getUserById(payload.userId);
  } catch (error) {
    // Authentication is optional for public procedures
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
