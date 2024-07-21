// import React, { useRef, useState } from "react";
// import ReactPlayer from "react-player";
// import VideoPage from "../../Pages/VideoPage/VideoPage";

// const VideoPlayer = ({ className, src, srcURL }) => {
//   const [playing, setPlaying] = useState(false);
//   const [position, setPosition] = useState(0);
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);

//   const handleDoubleTap = (event) => {
//     event.preventDefault();

//     if (event.detail === 2) {
//       const containerWidth = containerRef.current.offsetWidth;
//       const positionX = event.nativeEvent.pageX - containerRef.current.offsetLeft;
//       const percentage = (positionX / containerWidth) * 100;

//       if (percentage <= 33) {
//         // Double tap on the left side
//         videoRef.current.seekTo(Math.max(0, position - 10));
//       } else if (percentage > 66) {
//         // Double tap on the right side
//         videoRef.current.seekTo(Math.min(videoRef.current.getDuration(), position + 10));
//       } else {
//         // Double tap in the middle
//         setPlaying(!playing);
//       }
//     }
//   };

//   const handleProgress = (state) => {
//     setPosition(state.playedSeconds);
//   };

//   return (
//     <div ref={containerRef} onClick={handleDoubleTap} className={className}>
//       <ReactPlayer
//         ref={videoRef}
//         url={src}
//         playing={playing}
//         onPlay={() => setPlaying(true)}
//         onPause={() => setPlaying(false)}
//         width="100%"
//         height="100%"
//         controls={true}
//         onProgress={handleProgress}
//       />
//     </div>
//   );
// };

// export default VideoPlayer;

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";

const VideoPlayer = ({ className, src, onShowComments, onNextVideo, onCloseWebsite }) => {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [tapCount, setTapCount] = useState(0);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  //const timerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTapCount(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleTap = (event) => {
    event.preventDefault();
    const containerWidth = containerRef.current.offsetWidth;
    const positionX = event.nativeEvent.pageX - containerRef.current.offsetLeft;
    const percentage = (positionX / containerWidth) * 100;
    const positionY = event.nativeEvent.pageY - containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;

    setTapCount((prevCount) => prevCount + 1);

    if (tapCount === 2) {
      if (percentage <= 33) {
        // Triple-tap on the left side
        onShowComments();
      } else if (percentage > 66) {
        // Triple-tap on the right side
        onCloseWebsite();
      } else {
        // Triple-tap in the middle
        onNextVideo();
      }
    } else if (tapCount === 1) {
      if (percentage <= 33) {
        // Double tap on the left side
        videoRef.current.seekTo(Math.max(0, position - 10));
      } else if (percentage > 66) {
        // Double tap on the right side
        videoRef.current.seekTo(Math.min(videoRef.current.getDuration(), position + 10));
      } else {
        // Double tap in the middle
        setPlaying(!playing);
      }
    } else if (tapCount === 0) {
      if (positionY <= containerHeight * 0.2 && percentage > 66) {
        // Single-tap on top right corner
        showLocationAndTemperature();
      }
    }
  };

  const handleLongPress = (event) => {
    const containerWidth = containerRef.current.offsetWidth;
    const positionX = event.nativeEvent.pageX - containerRef.current.offsetLeft;
    const percentage = (positionX / containerWidth) * 100;

    if (percentage <= 33) {
      // Long-press on the left side
      setPlaybackRate(0.5);
    } else if (percentage > 66) {
      // Long-press on the right side
      setPlaybackRate(2);
    }
  };

  const handleLongPressEnd = () => {
    setPlaybackRate(1);
  };

  const handleProgress = (state) => {
    setPosition(state.playedSeconds);
  };

  
  const showLocationAndTemperature = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const appid = "87f80150fc7f5ba75c9dd9d7dc215b83";
  
          try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}`, {
              params: {
                lat: lat,
                lon: lon,
                appid: appid,
                units: 'metric' // or 'imperial' depending on your preference
              }
            });
  
            const location = response.data.name; // City name
            const temperature = response.data.main.temp; // Temperature in Celsius
  
            alert(`Location: ${location}, Temperature: ${temperature}°C`);
          } catch (error) {
            alert("Unable to fetch weather data. Please try again later.");
            console.error("Weather API Error:", error);
          }
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    } catch (error) {
      alert("An error occurred while fetching the weather data.");
      console.error("Geolocation Error:", error);
    }
  };
  

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      onMouseDown={handleLongPress}
      onMouseUp={handleLongPressEnd}
      className={className}
    >
      <ReactPlayer
        ref={videoRef}
        url={src}
        playing={playing}
        playbackRate={playbackRate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        width="100%"
        height="100%"
        controls={true}
        onProgress={handleProgress}
      />
    </div>
  );
};

export default VideoPlayer;