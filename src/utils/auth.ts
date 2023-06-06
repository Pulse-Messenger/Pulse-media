import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../user/user.schema";

export const getToken = (req: Request) => {
  const token = req.headers.authorization;
  if (token?.startsWith("Bearer ")) return token.substring(7);
  return null;
};

export const getUserID = (req: Request) => {
  try {
    //@ts-ignore
    const { userID } = jwt.verify(
      getToken(req) as string,
      process.env.JWT_SECRET as string
    );
    return userID;
  } catch {
    return false;
  }
};

export const checkSession = async (req: Request) => {
  try {
    const token = getToken(req);
    if (!token) return false;

    const valid = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!valid) return false;

    const user = await User.findOne({
      "sessions.token": token,
    });
    if (!user) return false;

    return true;
  } catch {
    return false;
  }
};

export const getSessionID = async (req: Request) => {
  try {
    const token = getToken(req);
    if (!token) return false;

    const valid = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!valid) return false;

    const user = await User.findOne({
      "sessions.token": token,
    });
    if (!user) return false;

    return user.id;
  } catch {
    return false;
  }
};
