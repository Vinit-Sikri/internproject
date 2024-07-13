import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import VideocamIcon from "@mui/icons-material/Videocam"; // Use the correct icon
import StopIcon from "@mui/icons-material/Stop";
import "./videoCall.css";
import { 
  startRecording as startRecordingAPI, 
  stopRecording as stopRecordingAPI, 
  startScreenShare as startScreenShareAPI, 
  stopScreenShare as stopScreenShareAPI, 
  initiateCall as initiateCallAPI, 
  answerCall as answerCallAPI, 
  endCall as endCallAPI 
} from "../../api/index"; 

const socket = io.connect("https://youtube-clone-53sz.onrender.com");

function Videocall() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [screenSharing, setScreenSharing] = useState(false);
  const [isCallAllowed, setIsCallAllowed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const combinedStream = useRef(new MediaStream());
  const recordedStream = useRef(new MediaStream());

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
    });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    const checkCallAvailability = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsCallAllowed(hours >= 18 || hours < 18);
    };

    checkCallAvailability();
    const interval = setInterval(checkCallAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
      userStream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
      recordedStream.current.addTrack(userStream.getVideoTracks()[0]);
      recordedStream.current.addTrack(userStream.getAudioTracks()[0]);
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
      userStream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
      recordedStream.current.addTrack(userStream.getVideoTracks()[0]);
      recordedStream.current.addTrack(userStream.getAudioTracks()[0]);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    endCallAPI({ userId: me }); // Notify the server about ending the call
  };

  const handleCopy = () => {
    console.log("ID copied to clipboard: ", me);
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
      setScreenSharing(true);
      const screenTrack = screenStream.getTracks()[0];
      connectionRef.current.replaceTrack(stream.getVideoTracks()[0], screenTrack, stream);
      screenTrack.onended = () => {
        stopScreenShare();
      };
      combinedStream.current.addTrack(screenTrack);
      recordedStream.current.addTrack(screenTrack);

      await startScreenShareAPI({ userId: me, screenTrack: screenTrack.id });
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };

  const stopScreenShare = async () => {
    try {
      setScreenSharing(false);
      const videoTrack = stream.getVideoTracks()[0];
      connectionRef.current.replaceTrack(connectionRef.current.streams[0].getVideoTracks()[0], videoTrack, stream);
      combinedStream.current.getVideoTracks().forEach((track) => {
        if (track.kind === "video" && track.label.includes("screen")) {
          combinedStream.current.removeTrack(track);
          track.stop();
        }
      });
      recordedStream.current.getVideoTracks().forEach((track) => {
        if (track.kind === "video" && track.label.includes("screen")) {
          recordedStream.current.removeTrack(track);
          track.stop();
        }
      });

      await stopScreenShareAPI({ userId: me, videoTrack: videoTrack.id });
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  };

  const startRecording = async () => {
    try {
      if (recordedStream.current) {
        const recorder = new MediaRecorder(recordedStream.current);
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

  const stopRecording = async () => {
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

  useEffect(() => {
    if (!recording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "recording.webm";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recording, recordedChunks]);

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Video Call</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">{stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "400px" }} />}</div>
          <div className="video">{callAccepted && !callEnded ? <video playsInline ref={userVideo} autoPlay style={{ width: "400px" }} /> : null}</div>
        </div>
        <div className="myId">
          <TextField id="filled-basic" label="Name" variant="filled" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: "20px" }} />
          {me ? (
            <CopyToClipboard text={me} onCopy={handleCopy}>
              <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
                Copy ID
              </Button>
            </CopyToClipboard>
          ) : (
            <Button variant="contained" color="primary" disabled>
              Please Refresh Once to Generate Id
            </Button>
          )}
          <TextField id="filled-basic" label="ID to call" variant="filled" value={idToCall} onChange={(e) => setIdToCall(e.target.value)} />
          {isCallAllowed ? (
            <>
              {callAccepted && !callEnded ? (
                <Button onClick={leaveCall} variant="contained" color="secondary" startIcon={<PhoneIcon />}>
                  End Call
                </Button>
              ) : (
                <Button onClick={() => callUser(idToCall)} variant="contained" color="primary" startIcon={<PhoneIcon />}>
                  Call
                </Button>
              )}
              {receivingCall && !callAccepted ? (
                <Button onClick={answerCall} variant="contained" color="primary" startIcon={<PhoneIcon />}>
                  Answer
                </Button>
              ) : null}
              <div className="buttonGroup">
                <IconButton onClick={startScreenShare} disabled={screenSharing || !callAccepted}>
                  <ScreenShareIcon />
                </IconButton>
                <IconButton onClick={stopScreenShare} disabled={!screenSharing || !callAccepted}>
                  <VideocamIcon />
                </IconButton>
                <IconButton onClick={startRecording} disabled={recording || !callAccepted}>
                  <VideocamIcon /> {/* Updated to a valid icon */}
                </IconButton>
                <IconButton onClick={stopRecording} disabled={!recording || !callAccepted}>
                  <StopIcon />
                </IconButton>
              </div>
            </>
          ) : (
            <p>Video calls are allowed only between 6 PM and 12 AM.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Videocall;
