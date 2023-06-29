import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { config } from "./config/config";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import { errorHandler, notFound } from "./middleware/errorMiddleware";
import { UserWithId } from "./models/userModel";

import session from "express-session";

const app = express();

declare module "express-serve-static-core" {
  interface Request {
    session: {
      user: UserWithId | null;
      destroy: any;
      cookie: {
        httpOnly: boolean;
        maxAge?: number;
        expires?: Date;
      };
    };
  }
}

mongoose
  .connect(config.mongo.url, { w: "majority", retryWrites: true })
  .then(() => {
    // NOTE Start server if DB is connected
    startServer();
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

const startServer = () => {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(
    session({
      secret: `${process.env.SESSION_SECRET}`,
      saveUninitialized: false,
      resave: false,
      cookie: {
        httpOnly: true,
        maxAge: 3600000,
      },
    })
  );

  app.use("/api/users", userRoutes);

  app.use(notFound);
  app.use(errorHandler);
};

export default app;
