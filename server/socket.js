import http from 'http';
import { Server } from 'socket.io';

const createSocketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Emit a unique ID to the connected client
    socket.emit("me", socket.id);

    // Handle disconnection
    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
    });

    // Handle call initiation
    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
    });

    // Handle call acceptance
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });

    // Handle start screen share
    socket.on("startScreenShare", (data) => {
      io.to(data.userId).emit("startScreenShare", data.screenTrack);
    });

    // Handle stop screen share
    socket.on("stopScreenShare", (data) => {
      io.to(data.userId).emit("stopScreenShare", data.videoTrack);
    });

    // Handle start recording
    socket.on("startRecording", (data) => {
      io.to(data.userId).emit("startRecording");
    });

    // Handle stop recording
    socket.on("stopRecording", (data) => {
      io.to(data.userId).emit("stopRecording");
    });
  });

  return { server, io }; // Return both server and io
};

export default createSocketServer;
