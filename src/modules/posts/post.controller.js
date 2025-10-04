import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { addPostSchema ,updatepostSchema} from "./post.validation.js";
import * as PS from './index.js'
import { fileTypes, multerCloudinary } from "../../middleware/multer.js";
import { authenticate } from "../../middleware/auth.js";

export const postRouter=Router()

// get comment of a specific post
postRouter.get("/:postId/comments",authenticate,PS.getPostComment)

// add Post 
postRouter.post("/addPost",multerCloudinary(fileTypes.image).array("images",3),validation(addPostSchema),authenticate,PS.createPost)

// update Post 
postRouter.patch("/updatePost/:postId",multerCloudinary(fileTypes.image).array("images",3),validation(updatepostSchema),authenticate,PS.updatePost)

// freeze post 
postRouter.delete("/freezePost/:postId",authenticate,PS.freezePost)

// restore post 
postRouter.patch("/restorePost/:postId",authenticate,PS.restorePost)

// Like post 
postRouter.patch("/likePost/:postId",authenticate,PS.likePost)

// unLike post 
postRouter.patch("/unlikePost/:postId",authenticate,PS.unlikePost)

// get Post 
// postRouter.get("/getPosts",authenticate,PS.paginationposts)
postRouter.get("/getPosts",PS.paginationPosts)









