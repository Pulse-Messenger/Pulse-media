import { NextFunction, Request, Response } from "express";
import { checkSession, getToken } from "./auth";

export const authenticatedOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const valid = await checkSession(req);

  if (valid) return next();

  res.status(401).send({ errors: ["You need to be logged in."] });
  return;
};
