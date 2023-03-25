import mongoose from "mongoose";

export const mongoInit = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    mongoose.set("strictQuery", false);
    mongoose.set("strictPopulate", true);
    mongoose.connect(process.env.DATABASE_ACCESS as string);
    const db = mongoose.connection;

    db.once("connected", () => {
      console.log("Mongoose has connected!");
      resolve(db);
    });

    db.once("err", (err) => {
      console.error("Mongoose connection error:\n", err.stack);
      reject(err);
    });

    db.on("disconnected", () => {
      console.warn("Mongoose has disconnected!");
    });
  });
};
