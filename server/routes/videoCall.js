import { Router } from 'express';
import { 
  initiateCall, 
  answerCall, 
  endCall, 
  startScreenShare, 
  stopScreenShare, 
  startRecording, 
  stopRecording 
} from '../controllers/videoCallController.js'; // Adjust if necessary

const router = Router();

router.post('/call', initiateCall);
router.post('/answer', answerCall);
router.post('/end', endCall);
router.post('/start-screen-share', startScreenShare);
router.post('/stop-screen-share', stopScreenShare);
router.post('/start-recording', startRecording);
router.post('/stop-recording', stopRecording);

export default router;
