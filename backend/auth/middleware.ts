import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { envFiles } from "./env";

interface MyTokenPayload {
  userId: string
}


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(409).json({ message: "Authorization Missing!" })
  }

  if (!authorization.startsWith('Bearer ')) {
    return res.status(409).json({ message: "Bearer Missing" })
  }

  const token = authorization.split(' ')[1]
  if (!token) {
    return res.status(409).json({ message: "Token undefined" })
  }

  try {
    const decoded = jwt.verify(token, envFiles.jwtSecret) as MyTokenPayload
    const userId = decoded.userId

    if (userId) {
      req.userId = userId
      next()
    } else {
      res.status(403).json("Invalid token")
    }
  } catch (error) {
    console.error(error)
    res.status(409).json({ message: "JWT error" })
  }
}

