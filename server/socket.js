import http from 'http';
import { Server } from 'socket.io';

// Function to generate a random 10-digit ID
const generateRandomId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Generates a 10-digit number
};

const createSocketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Generate and emit a unique 10-digit ID to the connected client
    const callId = generateRandomId(); // Generate a 10-digit ID
    socket.emit("me", { id: socket.id, callId });

    // Handle disconnection
    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
    });

    // Handle call initiation
    socket.on("callUser", (data) => {
      console.log("Server received callUser data:", data); // Debug log
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
        callId: data.callId, // Send the call ID
      });
    });

    // Handle call acceptance
    socket.on("answerCall", (data) => {
      console.log("Server received answerCall data:", data); // Debug log
      io.to(data.to).emit("callAccepted", {
        signal: data.signal,
        callId: data.callId, // Send the call ID
      });
    });

    // Handle start screen share
    socket.on("startScreenShare", (data) => {
      console.log("Server received startScreenShare data:", data); // Debug log
      io.to(data.userId).emit("startScreenShare", data.screenTrack);
    });

    // Handle stop screen share
    socket.on("stopScreenShare", (data) => {
      console.log("Server received stopScreenShare data:", data); // Debug log
      io.to(data.userId).emit("stopScreenShare", data.videoTrack);
    });

    // Handle start recording
    socket.on("startRecording", (data) => {
      console.log("Server received startRecording data:", data); // Debug log
      io.to(data.userId).emit("startRecording");
    });

    // Handle stop recording
    socket.on("stopRecording", (data) => {
      console.log("Server received stopRecording data:", data); // Debug log
      io.to(data.userId).emit("stopRecording");
    });
  });

  return { server, io }; // Return both server and io
};

export default createSocketServer;
