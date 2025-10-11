import { chatModel } from "../../DB/models/chat.model.js";
import { connectionUser } from "../../socket/socket.controller.js";

export const sendMessage = async (socket) => {
  socket.on("sendmessage", async (data) => {
    console.log("💬 Message reçu :", { data, Sender: socket.user._id });

    const receiverSocketId = connectionUser.get(data.receiverId);

    // Save chat in DB
    let chats = await chatModel.findOneAndUpdate(
      {
        $or: [
          { mainUser: socket.user._id, subParticipants: data.receiverId },
          { mainUser: data.receiverId, subParticipants: socket.user._id },
        ],
      },
      { $push: { convs: { senderId: socket.user._id, message: data.message } } },
      { new: true }
    );

    if (!chats) {
      chats = await chatModel.create({
        mainUser: socket.user._id,
        subParticipants: data.receiverId,
        convs: [{ senderId: socket.user._id, message: data.message }],
      });
    }

    // Feedback to sender
    socket.emit("server_message", { message: "Your message has been sent successfully" });



    // Emit to receiver only if online
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("chat", { message: data.message, receiverId: data.receiverId });
    }
  });
};

