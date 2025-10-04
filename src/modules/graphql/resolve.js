import Joi from "joi"
import { postModel } from "../../DB/models/post.model.js"
import { authGraphql } from "../../middleware/auth.js"
import { validationGraphQL } from "../../middleware/validation.js"
import { likeGraphQLSchema } from "../posts/post.validation.js"



export const getOnePost=async(parent,args)=>{
    const {postId}=args
    const post =await postModel.findOne({_id:postId}).populate([{path:"userId"}])
    return post

}

export const getAllPosts=async(parent,args)=>{
    const posts =await postModel.find()
    return posts
}


export const likePost=async(parent,args)=>{
  const {postId,authorization,accessRole} = args;

  // validation middleware 
    await validationGraphQL({schema:likeGraphQLSchema,body:args})

  // middleware
   const user= await authGraphql({authorization,accessRole})
  const Post = await postModel.findOneAndUpdate(
    { _id:postId,isDeleted:{$exists:false}},
    {$addToSet:{likes:user._id}},
    { new: true }
  );

  if (!Post) {
     throw new Error("Post not found or deleted")
  }

  return Post
  

}