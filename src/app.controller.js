import rateLimit from "express-rate-limit";
import { connectionDB } from "./DB/ConnectionDb.js";
import { commentRouter } from "./modules/comments/comment.controller.js";
import { postRouter } from "./modules/posts/post.controller.js";
import { userRouter } from "./modules/users/user.controller.js";
import { globalErrorHandel } from "./utils/globalErrorHandling/index.js";

export const bootstrap = (app, express) => {
  // this middleware to handle DDOS/DOS
  app.use(
    rateLimit({
      limit: 5,
      legacyHeaders: false,
    })
  );
  // connection to our database
  connectionDB();

  // parsing data coming in the request body
  app.use(express.json());

  // the main Route
  app.get("/", (req, res) => {
    res.send({ StatusMessage: "Welcome to Social Media App" });});

  // handling Routes
  app.use("/users", userRouter);
  app.use("/posts", postRouter);
  app.use("/comments", commentRouter);

  app.use((req, res, next) => {
    return next(new Error("This Endpoint Is Not Defined"));
  });

  // handle global error
  app.use(globalErrorHandel);
};
