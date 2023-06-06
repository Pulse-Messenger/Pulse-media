import type { Request, Response } from "express";
import multer from "multer";

import { routerInstance } from "../utils/app.router";
import { s3Service } from "../services/s3.service";
import { getSessionID, getUserID } from "../utils/auth";
import { MediaService } from "./media.service";
import { User } from "../user/user.schema";
import { authenticatedOnly } from "../utils/express.middleware";
import { Room } from "../room/room.schema";

export const router = routerInstance;

const upload = multer();

router.post(
  "/profilePics",
  authenticatedOnly,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) throw { code: 400, message: "A file is required" };

      if (req.file.size > 20_971_520)
        throw { code: 400, message: "Max size for files is 20MB" };
      const userID = getUserID(req);
      const user = await User.findById(userID);
      if (!user) throw { code: 400, message: "Invalid user" };

      const img = new MediaService(req.file.buffer);

      if (!(await img.validate(1, 4096)))
        throw {
          code: 400,
          message: "Image must be smaller than 4096x4096",
        };

      await s3Service.uploadBuffer(
        `profilePics/${userID}/profilePic.webp`,
        await img.toWebp(256, 256),
        req.file.mimetype,
        {
          "x-amz-meta-ip": req.ip,
          "x-amz-meta-user-id": await getUserID(req),
          "x-amz-meta-session-id": await getSessionID(req),
        }
      );

      const pfpUrl = new URL(
        `https://s3.eu-central-2.wasabisys.com/cdn.pulse-messenger.com/profilePics/${userID}/profilePic.webp`
      );

      user.profilePic = pfpUrl.toString();
      await user.save();

      res.sendStatus(200);
    } catch (err: any) {
      if (err.code && err.message)
        res.status(err.code).send({ errors: [err.message] });
      else res.status(500).send("An error occurred while uploading");
    }
  }
);

router.post(
  "/roomPic/:roomID",
  authenticatedOnly,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) throw { code: 400, message: "A file is required" };

      if (req.file.size > 20_971_520)
        throw { code: 400, message: "Max size for files is 20MB" };
      const userID = getUserID(req);
      const user = await User.findById(userID);
      if (!user) throw { code: 400, message: "Invalid user" };

      const room = await Room.findById(req.params.roomID);
      if (!room) throw { code: 404, message: "Room doesn't exist" };

      if (room.friendship) throw { code: 404, message: "Can't update DM pic" };

      if (room.creatorID.toString() !== userID)
        throw {
          code: 403,
          message: "Only room creators can change the room Pic",
        };

      const img = new MediaService(req.file.buffer);

      if (!(await img.validate(1, 4096)))
        throw {
          code: 400,
          message: "Image must be smaller than 4096x4096",
        };

      await s3Service.uploadBuffer(
        `roomPics/${room.id}/roomPic.webp`,
        await img.toWebp(256, 256),
        req.file.mimetype,
        {
          "x-amz-meta-ip": req.ip,
          "x-amz-meta-user-id": await getUserID(req),
          "x-amz-meta-session-id": await getSessionID(req),
        }
      );

      const roomPicUrl = new URL(
        `https://s3.eu-central-2.wasabisys.com/cdn.pulse-messenger.com/roomPics/${room.id}/roomPic.webp`
      );

      room.profilePic = roomPicUrl.toString();
      await room.save();

      res.sendStatus(200);
    } catch (err: any) {
      if (err.code && err.message)
        res.status(err.code).send({ errors: [err.message] });
      else res.status(500).send("An error occurred while uploading");
    }
  }
);

router.post(
  "/uploads",
  authenticatedOnly,
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files) throw { code: 400, message: "No files were provided" };

      if ((files.length as number) > 10)
        throw { code: 400, message: "A maximum of 10 files is allowed" };

      const userID = getUserID(req);

      const fileURLs: string[] = [];
      for (const file of files) {
        // max 100MB
        if (file.size > 104_857_600) {
          continue;
        }

        const fileName = Date.now() + "_" + file.originalname;
        await s3Service.uploadBuffer(
          `uploads/${userID}/${fileName}`,
          file.buffer,
          file.mimetype,
          {
            "x-amz-meta-ip": req.ip,
            "x-amz-meta-user-id": await getUserID(req),
            "x-amz-meta-session-id": await getSessionID(req),
          }
        );

        fileURLs.push(
          new URL(
            `https://s3.eu-central-2.wasabisys.com/cdn.pulse-messenger.com/uploads/${userID}/${fileName}`
          ).toString()
        );
      }

      res.status(200).send({ files: fileURLs });
    } catch (err: any) {
      if (err.code && err.message)
        res.status(err.code).send({ errors: [err.message] });
      else res.status(500).send("An error occurred while uploading");
    }
  }
);
