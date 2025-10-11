import rateLimit from "express-rate-limit";
import { commentRouter } from "./modules/comments/comment.controller.js";
import { postRouter } from "./modules/posts/post.controller.js";
import { userRouter } from "./modules/users/user.controller.js";
import { globalErrorHandel } from "./utils/globalErrorHandling/index.js";
import { createHandler } from 'graphql-http/lib/use/express';
import {graphSchema} from "./modules/graphql.schema.js"
import cors from 'cors'
import { chatRouter } from "./modules/chat/chat.controller.js";
export const bootstrap = (app, express) => {

  // this middleware to handle DDOS/DOS

  // app.use(
  //   rateLimit({
  //     limit: 15,
  //     legacyHeaders: false,
  //   }) 
  // );

// cors probleme
app.use(cors())

  // parsing data coming in the request body
  app.use(express.json());

  // the main Route
  app.get("/", (req, res) => {
    res.send({ StatusMessage: "Welcome to Social Media App" });});

  // handling Routes
  app.use("/users", userRouter);

  app.use("/posts", postRouter);

  app.use("/comments", commentRouter);

  app.use("/chats", chatRouter);


  app.use("/graphql/posts",createHandler({schema:graphSchema} ))

  app.use((req, res, next) => {
    return next(new Error("This Endpoint Is Not Defined"));
  });

  // handle global error
  app.use(globalErrorHandel);
};
