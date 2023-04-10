import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import cors from "cors";

config();
import "./utils/logger";

import { routerInstance } from "./utils/app.router";
import { mongoInit } from "./utils/mongoose";

const app = express();
const port = process.env.APP_PORT!;
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_PATH }));
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    (err.message.includes("JSON") || err.message.includes("syntax"))
  ) {
    res.status(400).json({ error: "Bad Request - Invalid JSON" });
  } else {
    next();
  }
});

app.use("/media", routerInstance);

import "./media/media.controller";

app.listen(port, async () => {
  await mongoInit();
  console.log(`App listening on port`, port);
});
