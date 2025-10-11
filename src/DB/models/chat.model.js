import mongoose, { Schema ,model} from "mongoose";




export const chatSchema = new Schema(
  {
    mainUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    subParticipants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    convs: [
      {
        message: { type: String, required: true },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      },
    ],
  },
  {timestamps:true }
);



export const chatModel = mongoose.models.chats|| model("chats", chatSchema);
