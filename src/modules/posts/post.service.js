import { commentModel } from "../../DB/models/comment.model.js";
import { postModel } from "../../DB/models/post.model.js";
import { rolesTypes } from "../../DB/models/user.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";



// START : function that handles creating post
export const createPost=asyncHandler(async (req,res,next)=>{
    const {content}=req.body
const ourFiles = await Promise.all(
  req.files.map(async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "socialMediaApp/posts"
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  })
);

// this convention is slow when for multiples files because it is sequentiql not parallel as well as the promise.All 

// if(req.files.length){
//     let images=[];
// for(const file of req.files){
    
//     const {secure_url,public_id}= await cloudinary.uploader.upload(file.path, {
//       folder: "socialMediaApp/posts"
//     }); 
//     images.push({secure_url,public_id})
// }
// req.body=images

// }


const newPost=await postModel.create({content,attachements:ourFiles,userId:req.user._id})

return res.send({success:true,newPost})
})

// START function that handles post update 
export const updatePost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.params;

  const newPost = await postModel.findOne({
    _id: postId,
    userId: req.user._id,
    isDeleted: { $exists: false },
  });
  if (!newPost) {
    return next(
      new Error("Post not found or you don't have permission to edit it")
    );
  }
  if (req.files && req.files.length > 0) {
    await Promise.all(
      newPost.attachements.map(async (item) => {
        return await cloudinary.uploader.destroy(item.public_id);
      })
    );
    const ourFiles = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "socialMediaApp/posts",
        });
        return {
          secure_url: result.secure_url,
          public_id: result.public_id,
        };
      })
    );

    newPost.attachements = ourFiles;
  }

  if (content) {
    newPost.content = content;
  }
  await newPost.save();

  return res.send({
    success: true,
    message: "post is updated successfuly",
    newPost,
  });
});

// START function that handles post freeze 
export const freezePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const condition =req.user.role === rolesTypes.admin ? {} : { userId: req.user._id };
  const newPost = await postModel.findByIdAndUpdate({
    _id: postId,
    ...condition,
    isDeleted: { $exists: false },
  },{
    isDeleted:true,
    deletedBy:req.user._id
  },
  {
    new:true
  }
);

  if (!newPost) {
    return next(
      new Error("Post not found or you don't have permission to edit it")
    );
  }


  return res.send({
    success: true,
    message: "post is freezed successfuly",
    newPost,
  });
});

// START function that handles post restore 
export const restorePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const condition =req.user.role === rolesTypes.admin ? {} : { userId: req.user._id };

  const newPost = await postModel.findOneAndUpdate(
    { _id: postId, ...condition,isDeleted:{$exists:true},deletedBy:req.user._id},
    { $unset: { isDeleted: 0,deletedBy:0 } },
    { new: true }
  );

  if (!newPost) {
    return next(
      new Error("Post not found or you don't have permission to edit it")
    );
  }

  return res.send({
    success: true,
    message: "post is restored  successfuly",
    newPost,
  });
});

// START function that handles post like 
export const likePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const Post = await postModel.findOneAndUpdate(
    { _id: postId,isDeleted:{$exists:false}},
    {$addToSet:{likes:req.user._id}},
    { new: true }
  );

  if (!Post) {
    return next(
      new Error("Post not found or deleted")
    );
  }

  return res.send({
    success: true,
    message: "You Liked the Post",
    Post,
  });
});

// START function that handles post unlike 
export const unlikePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const Post = await postModel.findOneAndUpdate(
    { _id: postId,isDeleted:{$exists:false}},
    {$pull:{likes:req.user._id}},
    { new: true }
  );

  if (!Post) {
    return next(
      new Error("Post not found or deleted")
    );
  }

  return res.send({
    success: true,
    message: "You unLiked the Post",
    Post,
  });
});

// START function that handles post with comments ( first methode)
export const getPosts = asyncHandler(async (req, res, next) => {
  let postsWithComments = [];
  const cursor = postModel.find({ isDeleted: { $exists: false } }).cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const postComment = await commentModel.find({ postId: doc._id }).lean();
    postsWithComments.push({ ...doc.toObject(), comments: postComment });
  }

  return res.send({
    success: true,
    message: "All posts are fetched successfuly",
    posts: postsWithComments,
  });
});

// START function that return post with it's comments beest option is this but we still have pagination probleme
export const getPostComment = asyncHandler(async (req, res, next) => {
  const postComments = await postModel
    .find({ isDeleted: { $exists: false } })
    .populate([{ path: "postComments",match:{pCommentId:{$exists:false}}, populate: { path: "reply" } }]);


  if (!postComments) {
    return next(new Error("Posts not found or deleted"));
  }

  return res.send({
    success: true,
    message: "All comments in this post are fetched successfuly",
    postComments,
  });
});


// START function that handles post with comments ( the best solution with pagination)
export const paginationPosts = asyncHandler(async (req, res, next) => {

  let {page}=req.query || 1
  if(page<0)page=1
  const limit=2
  const skip=(page - 1)*limit
  const posts = await postModel
    .find({ isDeleted: { $exists: false } })
    .populate([
      {
        path: "postComments",
        match: { pCommentId: { $exists: false } },
        populate: { path: "reply" },
      },
    ])
    .limit(limit)
    .skip(skip);
  if (!posts) {
    return next(new Error("Post not found or deleted"));
  }


  return res.send({
    success: true,
    message: "All posts are fetched successfuly",
    page,
    posts,
  });
});


