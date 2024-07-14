import { Router } from 'express';
import { callUser , startScreenShare , stopScreenShare , startRecording , stopRecording , endCall} from '../controllers/videoCallController';

const router = Router();

router.post('/call', callUser);
router.post('/end', endCall);
router.post('/start-screen-share', startScreenShare);
router.post('/stop-screen-share', stopScreenShare);
router.post('/start-recording', startRecording);
router.post('/stop-recording', stopRecording);

export default router;
