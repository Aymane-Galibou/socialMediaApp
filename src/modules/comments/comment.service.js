import { commentModel } from "../../DB/models/comment.model.js";
import { postModel } from "../../DB/models/post.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";


// START : function that handles creating post
export const createComment=asyncHandler(async (req,res,next)=>{
    const {content,postId}=req.body
    const {commentId}=req.params

    const comment=await commentModel.findOne({_id:commentId,postId})
      if(commentId && !comment){
        return next(new Error("this comment is not available or post not found",{cause:404}))
      }

// we should check if a post with this id is exist or not 
const post=await postModel.find({_id:postId,isDeleted:{$exists:false}}).lean();
if(!post){
  return next(new Error("this post is not found",{cause:404}))
}

const ourFiles = await Promise.all(
  req.files.map(async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "socialMediaApp/comments"
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  })
);

const newComment=await commentModel.create({content,attachements:ourFiles,ownerId:req.user._id,postId,pCommentId:commentId})

return res.send({success:true,message:"You add a comment to this Post",newComment})
})

// START : function that handles updating comment
export const updateComment = asyncHandler(async (req,res,next) => {
  const { content } = req.body;
  const { commentId } = req.params;

  const comment = await commentModel.findOne({_id: commentId,ownerId: req.user._id,isDeleted: { $exists: false }});

  if (!comment) {
    return next(new Error("Comment not found",{cause:404}));
  }
  const post = await postModel.findOne({_id: comment.postId,isDeleted: { $exists: false }});

  if (!post) {
    return next(new Error("Post not found or deleted",{cause:404}));
  }

  if (req.files && req.files.length > 0) {
    await Promise.all(comment.attachements.map(file =>
      cloudinary.uploader.destroy(file.public_id)
    ));

    const ourFiles = await Promise.all(
      req.files.map(file =>
        cloudinary.uploader.upload(file.path, { folder: "socialMediaApp/comments" })
          .then(result => ({
            secure_url: result.secure_url,
            public_id: result.public_id
          }))
      )
    );
    comment.attachements = ourFiles;
  }
  if (content) {
    comment.content = content;
  }

  await comment.save();

  return res.send({success: true,message: "Comment updated successfully",data: comment});
});

// // START function that handles post freeze 
export const freezeComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await commentModel.findOne({
    _id: commentId,
    isDeleted: {$exists:false}
  }).populate([{path:"postId"}, {path:"ownerId"}]); 

  if (!comment) {
    return next(new Error("Comment not found", { cause: 404 }));
  }

  const post = await postModel.findOne({_id: comment.postId,isDeleted: { $exists: false }});

  if (!post) {
    return next(new Error("Post not found or deleted",{cause:404}));
  }
  console.log(comment);
  
  const isCommentOwner=comment.ownerId.toString() === req.user._id.toString()
  const isPostOwner = comment.postId.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin"; 

  if (!(isPostOwner || isAdmin || isCommentOwner)) {
    return next(new Error("You don’t have permission to freeze this comment", { cause: 403 }));
  }
if (isAdmin) {
  comment.deletedBy = "admin";
} else if (isPostOwner) {
  comment.deletedBy = comment.postId.userId;
} else if (isCommentOwner) {
  comment.deletedBy = comment.ownerId;
} 


  comment.isDeleted = true;
  await comment.save();

  return res.status(200).json({
    success: true,
    message: "Comment has been frozen successfully",
    comment,
  });
});



