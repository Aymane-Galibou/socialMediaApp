import { socketAuthentication } from "../middleware/auth.js";
import { sendMessage } from "../modules/chat/message.service.js";

export const connectionUser = new Map();

// const regeistreAccount = async (socket) => {
//   const data = await socketAuthentication(socket);
//   if (data.message && data.statusCode === (401 || 404)) {
//     return socket.emit("authError", data);
//   }
//   connectionUser.set(data.user._id.toString(), socket.id);
//   console.log(connectionUser);

//   return "done";
// };

export const startSocket = (io) => { 

    io.use(socketAuthentication)

  io.on("connection", async (socket) => {
    connectionUser.set(socket.user._id.toString(),socket.id)
    console.log("✅ Nouveau client connecté:", socket.handshake.auth);
    await sendMessage(socket)
    console.log(connectionUser);



  });
};
