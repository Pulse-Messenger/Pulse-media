import type { Request, Response } from "express";
import multer from "multer";

import { routerInstance } from "../utils/app.router";
import { s3Service } from "../services/s3.service";
import { getUserID } from "../utils/auth";
import { MediaService } from "./media.service";
import { User } from "../user/user.schema";
import { authenticatedOnly } from "../utils/express.middleware";

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
          message: "Invalid must be between 128x128 and 4096x4096",
        };

      await s3Service.uploadBuffer(
        `profilePics/${userID}/profilePic.webp`,
        await img.toWebp(256, 256),
        req.file.mimetype
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
        const fileName = Date.now() + "_" + file.originalname;
        await s3Service.uploadBuffer(
          `uploads/${userID}/${fileName}`,
          file.buffer,
          file.mimetype
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
