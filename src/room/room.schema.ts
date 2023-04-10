import { Schema, model } from "mongoose";

export const roomSchema = new Schema({
  profilePic: String,
  creatorID: { type: Schema.Types.ObjectId, ref: "user", index: true },
  friendship: {
    type: {
      friendA: { type: Schema.Types.ObjectId, ref: "user", index: true },
      friendB: { type: Schema.Types.ObjectId, ref: "user", index: true },
    },
    default: null,
  },
});

export interface IRoomSchema {
  id?: string;
  profilePic: string;
  creatorID: string;
  friendship?: {
    friendA: string;
    friendB: string;
  };
}

export interface IRoomDocument extends IRoomSchema, Document {}
export const Room = model<IRoomDocument>("room", roomSchema);
