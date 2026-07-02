import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");

export async function generateSessionToken(
  userId: number,
  options: { email: string; name: string; expiresInMs: number }
): Promise<string> {
  const token = await new SignJWT({
    userId,
    email: options.email,
    name: options.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + Math.floor(options.expiresInMs / 1000))
    .sign(secret);

  return token;
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as { userId: number; email: string; name: string };
  } catch (error) {
    return null;
  }
}
