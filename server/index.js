// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import bodyParser from "body-parser";
import userRoutes from './routes/user.js';
import videoRoutes from './routes/video.js';
import commentsRoutes from './routes/comments.js';
import path from 'path';
import createSocketServer from "./socket.js"; // Corrected import

dotenv.config();

function generateRandom10DigitNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

const random10DigitNumber = generateRandom10DigitNumber();
console.log(random10DigitNumber);


const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use('/uploads', express.static(path.join('uploads')));

// Initialize socket server
const { server, io } = createSocketServer(app);



app.get('/', (req, res) => {
  res.send("Hello");
});

app.get('/getId',(req,res)=>{
  function generateRandom10DigitNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  }
  
  const random10DigitNumber = generateRandom10DigitNumber();
  res.json({ number: randomNumber });
  console.log(random10DigitNumber);
})


app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/video', videoRoutes);
app.use('/comment', commentsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Running on the PORT ${PORT}`);
  console.log("Video Call Server is running on port 5000");
});

const DB_URL = process.env.CONNECTION_URL;
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB database connected");
  })
  .catch((error) => {
    console.log(error);
  });
