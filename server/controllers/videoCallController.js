import { io } from '../socket.js'; // Import your Socket.IO instance if needed

// Controller to initiate a call
export const initiateCall = (req, res) => {
  const { userToCall, signalData, from, name } = req.body;
  
  // Emit the call initiation to the specified user
  io.to(userToCall).emit('callUser', { signal: signalData, from, name });
  
  res.status(200).json({ message: 'Call initiated' });
};

// Controller to answer a call
export const answerCall = (req, res) => {
  const { signal, to } = req.body;
  
  // Emit the call acceptance signal to the caller
  io.to(to).emit('callAccepted', signal);
  
  res.status(200).json({ message: 'Call answered' });
};

// Controller to end a call
export const endCall = (req, res) => {
  const { callId } = req.body;

  // Notify all users that the call has ended
  io.emit('callEnded', { callId });
  
  res.status(200).json({ message: 'Call ended' });
};

// Controller to start screen sharing
export const startScreenShare = (req, res) => {
  const { userId, screenTrack } = req.body;

  // Replace the existing video track with the screen share track
  io.to(userId).emit('screenShare', { screenTrack });

  res.status(200).json({ message: 'Screen sharing started' });
};

// Controller to stop screen sharing
export const stopScreenShare = (req, res) => {
  const { userId, videoTrack } = req.body;

  // Revert to the original video track
  io.to(userId).emit('stopScreenShare', { videoTrack });

  res.status(200).json({ message: 'Screen sharing stopped' });
};

// Controller to start recording
export const startRecording = (req, res) => {
  const { userId } = req.body;

  // Notify the client to start recording
  io.to(userId).emit('startRecording');

  res.status(200).json({ message: 'Recording started' });
};

// Controller to stop recording
export const stopRecording = (req, res) => {
  const { userId } = req.body;

  // Notify the client to stop recording
  io.to(userId).emit('stopRecording');

  res.status(200).json({ message: 'Recording stopped' });
};
