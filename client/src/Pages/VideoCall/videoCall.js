import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import { CopyToClipboard } from "react-copy-to-clipboard";
import VideocamIcon from "@mui/icons-material/Videocam";
import StopIcon from "@mui/icons-material/Stop";
import { initiateCall , answerCall , endCall , startScreenShare , stopScreenShare , startRecording , stopRecording , fetchCallId} from "../../api";
import "./videoCall.css";

const socket = io.connect("https://internproject-yzv8.onrender.com/");

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
      console.log("Receiving call from:", data.from);
      console.log("Signal data:", data.signal);
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

  
  const handleCopy = () => {
    console.log("ID copied to clipboard: ", me);
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };


  useEffect(() => {
    const fetchId = async () => {
      try {
        const response = await fetchCallId();
        console.log("API Response:", response.data); // Check the structure
        if (response.data) {
          setMe(response.data.id); // Adjust based on actual response structure
          setIdToCall(response.data.id);
        }
      } catch (error) {
        console.error("Error fetching call ID:", error);
      }
    };
    fetchId();
  }, []);

  const handleCallUser = () => {
    initiateCall(socket, idToCall, stream, me, name, setCallAccepted, userVideo, combinedStream, recordedStream, connectionRef);
  };

  const handleAnswerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      console.log("Answering call with signal data:", data);
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

  const handleEndCall = () => {
    endCall(socket, me, endCall);
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    connectionRef.current.destroy();
  };

  const handleStartScreenShare = () => {
    startScreenShare(socket, stream, connectionRef, setScreenSharing, startScreenShare, me);
  };

  const handleStopScreenShare = () => {
    stopScreenShare(socket, stream, connectionRef, setScreenSharing, stopScreenShare, me);
  };

  const handleStartRecording = () => {
    startRecording(setRecording, setMediaRecorder, recordedStream, startRecording, me);
  };

  const handleStopRecording = () => {
    stopRecording(mediaRecorder, setRecording, stopRecording, me);
  };

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
          <CopyToClipboard text={me} onCopy={handleCopy}>
            <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField id="filled-basic" label="ID to call" variant="filled" value={idToCall} onChange={(e) => setIdToCall(e.target.value)} />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton color="primary" aria-label="call" onClick={() => initiateCall(idToCall)} disabled={!isCallAllowed}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
          </div>
        </div>
        {callAccepted && !callEnded && (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ScreenShareIcon />}
              onClick={screenSharing ? stopScreenShare : startScreenShare}
              style={{ marginTop: "20px", width: "150px" }}
            >
              {screenSharing ? "Stop Sharing" : "Share Screen"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideocamIcon />}
              onClick={recording ? stopRecording : startRecording}
              style={{ marginTop: "20px", width: "150px" }}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>
          </>
        )}
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}


export default Videocall;
