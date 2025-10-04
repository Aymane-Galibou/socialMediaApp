import mongoose, { Schema ,model} from "mongoose";

export const commentSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 3,
      required: true,
      trim: true,
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    pCommentId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"comments",
    },
    attachements: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    isDeleted: Boolean,
  },
  { toJSON:{virtuals:true},toObject:{virtuals:true},timestamps: true }
);

commentSchema.virtual("reply",{
  ref:"comments",
  localField:"_id",
  foreignField:"pCommentId"
})

export const commentModel = mongoose.models.comments|| model("comments", commentSchema);
