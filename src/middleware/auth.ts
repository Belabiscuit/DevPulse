import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized Access",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string
      ) as JwtPayload;

      const userData = await pool.query(
        `SELECT * FROM users WHERE id=$1`,
        [decoded.id]
      );

      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Not Founded!",
        });
      }

      const user = userData.rows[0];

     
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission!",
        });
      }

      req.user = decoded;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Token",
      });
    }
  };
};

export default auth;