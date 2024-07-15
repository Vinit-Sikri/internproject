// socket.js
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
    socket.emit("me", socket.id);


    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
    });

    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);

    });

    socket.on("startScreenShare", (data) => {
      io.to(data.userId).emit("startScreenShare", data.screenTrack);
    });

    socket.on("stopScreenShare", (data) => {
      io.to(data.userId).emit("stopScreenShare", data.videoTrack);
    });

    socket.on("startRecording", (data) => {
      io.to(data.userId).emit("startRecording");
    });

    socket.on("stopRecording", (data) => {
      io.to(data.userId).emit("stopRecording");
    });
  });

  return { server, io }; // Return both server and io
};

export default createSocketServer;
