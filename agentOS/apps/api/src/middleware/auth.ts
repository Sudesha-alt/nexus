import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@agentos/shared";
import { getConfig } from "../config";

export interface AuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getConfig().JWT_SECRET) as JwtPayload;
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
