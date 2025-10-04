import { authenticate } from "../../middleware/auth.js"
import { fileTypes, multerCloudinary } from "../../middleware/multer.js"
import { validation } from "../../middleware/validation.js"
import { addCommentSchema,updateCommentSchema } from "./comment.validation.js"
import {Router} from 'express'
import * as CS from './index.js'

export const commentRouter=Router()

// add comment 
commentRouter.post(
  "/addComment{/:commentId}",
  multerCloudinary(fileTypes.image).array("images", 3),
  validation(addCommentSchema),
  authenticate,
  CS.createComment
);


// update Comment 
commentRouter.patch(
  "/updateComment/:commentId",
  multerCloudinary(fileTypes.image).array("images", 3),
  validation(updateCommentSchema),
  authenticate,
  CS.updateComment
);
//delete comment
commentRouter.delete("/freezeComment/:commentId",authenticate,CS.freezeComment)

// // freeze post 
// postRouter.delete("/freezePost/:postId",authenticate,PS.freezePost)

// // restore post 
// postRouter.patch("/restorePost/:postId",authenticate,PS.restorePost)

// // Like post 
// postRouter.patch("/likePost/:postId",authenticate,PS.likePost)

// // unLike post 
// postRouter.patch("/unlikePost/:postId",authenticate,PS.unlikePost)

// // get Post 
// postRouter.get("/getPosts",authenticate,PS.getPosts)






