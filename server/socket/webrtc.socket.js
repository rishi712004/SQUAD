import { verifyAccess } from "../utils/tokens.js";

export const registerWebRTCHandlers = (io) => {
  const rtcNamespace = io.of("/webrtc");
  const rooms = new Map(); // roomId -> Set of socket ids

  rtcNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("No token");
      socket.user = verifyAccess(token);
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  rtcNamespace.on("connection", (socket) => {
    socket.on("join_call", ({ roomId }) => {
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      const room = rooms.get(roomId);

      // send existing peers to the new joiner
      socket.emit("existing_peers", [...room]);

      // notify existing peers
      room.forEach((peerId) => {
        rtcNamespace.to(peerId).emit("new_peer", {
          peerId: socket.id,
          userId: socket.user.id,
        });
      });

      room.add(socket.id);
      socket.join(roomId);
      socket.currentRoom = roomId;
    });

    socket.on("offer", ({ to, offer }) => {
      rtcNamespace.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }) => {
      rtcNamespace.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      rtcNamespace.to(to).emit("ice_candidate", {
        from: socket.id,
        candidate,
      });
    });

    socket.on("toggle_audio", ({ roomId, enabled }) => {
      socket.to(roomId).emit("peer_audio_toggle", {
        peerId: socket.id,
        enabled,
      });
    });

    socket.on("toggle_video", ({ roomId, enabled }) => {
      socket.to(roomId).emit("peer_video_toggle", {
        peerId: socket.id,
        enabled,
      });
    });

    const handleLeave = () => {
      const roomId = socket.currentRoom;
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) rooms.delete(roomId);
        socket.to(roomId).emit("peer_left", { peerId: socket.id });
      }
    };

    socket.on("leave_call", handleLeave);
    socket.on("disconnect", handleLeave);
  });
};