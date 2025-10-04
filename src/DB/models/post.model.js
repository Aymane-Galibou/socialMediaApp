import mongoose, { Schema ,model} from "mongoose";

export const postSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 3,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
  { 
  toJSON:{virtuals:true},toObject:{virtuals:true},
  timestamps: true 
}
);

postSchema.virtual("postComments",{
  ref:"comments",
  localField:"_id",
  foreignField:"postId"
})
export const postModel = mongoose.models.posts|| model("posts", postSchema);
