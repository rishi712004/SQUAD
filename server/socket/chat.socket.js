import * as chatService from "../services/chat.service.js";
import { verifyAccess } from "../utils/tokens.js";

export const registerChatHandlers = (io) => {
  const chatNamespace = io.of("/chat");

  chatNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("No token");
      socket.user = verifyAccess(token);
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  chatNamespace.on("connection", (socket) => {
    // join personal room for notifications
    socket.join(`user:${socket.user.id}`);

    socket.on("join_room", async (room) => {
      socket.join(room);
      const messages = await chatService.getRoomMessages(room);
      socket.emit("room_history", messages);
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
    });

    socket.on("send_message", async ({ room, content, type = "text" }) => {
      try {
        const message = await chatService.saveMessage({
          room,
          senderId: socket.user.id,
          content,
          type,
        });
        chatNamespace.to(room).emit("new_message", message);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("typing_start", ({ room }) => {
      socket.to(room).emit("user_typing", {
        userId: socket.user.id,
        room,
      });
    });

    socket.on("typing_stop", ({ room }) => {
      socket.to(room).emit("user_stopped_typing", {
        userId: socket.user.id,
        room,
      });
    });

    socket.on("mark_read", async ({ room }) => {
      await chatService.markMessagesRead(room, socket.user.id);
      socket.to(room).emit("messages_read", {
        userId: socket.user.id,
        room,
      });
    });

    socket.on("delete_message", async ({ messageId, room }) => {
      try {
        const message = await chatService.deleteMessage(messageId, socket.user.id);
        chatNamespace.to(room).emit("message_deleted", { messageId, message });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Chat: User ${socket.user.id} disconnected`);
    });
  });
};