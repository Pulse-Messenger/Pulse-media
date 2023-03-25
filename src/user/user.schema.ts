import { Schema, model } from "mongoose";

export const userSchema = new Schema({
  profilePic: String,
  sessions: [
    {
      id: { type: Schema.Types.ObjectId },
      ip: String,
      useragent: String,
      token: { type: String, index: true },
    },
  ],
});

export interface IUserSession {
  _id?: string;
  ip: string;
  useragent: string;
  token: string;
}

export interface IUserSchema {
  profilePic: string;
  sessions: IUserSession[];
}

export interface IUserDocument extends IUserSchema, Document {}
export const User = model<IUserDocument>("user", userSchema);
