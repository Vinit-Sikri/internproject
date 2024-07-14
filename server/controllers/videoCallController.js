import Peer from "simple-peer";


// Call User Controller
export const callUser = (socket, idToCall, stream, me, name, setCallAccepted, userVideo, combinedStream, recordedStream, connectionRef) => {
  console.log("Initiating call to:", idToCall);
  
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream: stream,
  });

  peer.on("signal", (data) => {
    console.log("Signal data before emitting:", data);
    socket.emit("callUser", {
      userToCall: idToCall,
      signalData: data,
      from: me,
      name: name,
    });
  });

  peer.on("stream", (userStream) => {
    console.log("Received user stream");
    if (userVideo.current) {
      userVideo.current.srcObject = userStream;
    }
    userStream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
    recordedStream.current.addTrack(userStream.getVideoTracks()[0]);
    recordedStream.current.addTrack(userStream.getAudioTracks()[0]);
  });

  socket.on("callAccepted", (signal) => {
    console.log("Call accepted signal:", signal);
    setCallAccepted(true);
    peer.signal(signal);
  });

  connectionRef.current = peer;
};

// Additional Controllers for Screen Sharing and Recording
export const startScreenShare = async (socket, stream, connectionRef, setScreenSharing, startScreenShareAPI, me) => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
    setScreenSharing(true);
    const screenTrack = screenStream.getTracks()[0];
    connectionRef.current.replaceTrack(stream.getVideoTracks()[0], screenTrack, stream);
    screenTrack.onended = () => {
      stopScreenShare(socket, stream, connectionRef, setScreenSharing, stopScreenShareAPI, me);
    };
    stream.addTrack(screenTrack);
    await startScreenShareAPI({ userId: me, screenTrack: screenTrack.id });
  } catch (error) {
    console.error("Error starting screen share:", error);
  }
};

export const stopScreenShare = async (socket, stream, connectionRef, setScreenSharing, stopScreenShareAPI, me) => {
  try {
    setScreenSharing(false);
    const videoTrack = stream.getVideoTracks()[0];
    connectionRef.current.replaceTrack(connectionRef.current.streams[0].getVideoTracks()[0], videoTrack, stream);
    stream.getVideoTracks().forEach((track) => {
      if (track.kind === "video" && track.label.includes("screen")) {
        stream.removeTrack(track);
        track.stop();
      }
    });
    await stopScreenShareAPI({ userId: me, videoTrack: videoTrack.id });
  } catch (error) {
    console.error("Error stopping screen share:", error);
  }
};

export const startRecording = async (setRecording, setMediaRecorder, recordedStream, startRecordingAPI, me) => {
  try {
    if (recordedStream) {
      const recorder = new MediaRecorder(recordedStream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
      await startRecordingAPI({ userId: me });
    }
  } catch (error) {
    console.error("Error starting recording:", error);
  }
};

export const stopRecording = async (mediaRecorder, setRecording, stopRecordingAPI, me) => {
  try {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      await stopRecordingAPI({ userId: me });
    }
  } catch (error) {
    console.error("Error stopping recording:", error);
  }
};

export const endCall = async (socket, me, endCallAPI) => {
  try {
    socket.emit("endCall", { userId: me });
    await endCallAPI({ userId: me });
  } catch (error) {
    console.error("Error ending call:", error);
  }
};
