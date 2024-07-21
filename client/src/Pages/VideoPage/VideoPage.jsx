import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Comments from "../../Components/Comments/Comments";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import LikeWatchLaterSaveBtns from "./LikeWatchLaterSaveBtns";
import "./VideoPage.css";
import { addToHistory } from "../../actions/History";
import { viewVideo } from "../../actions/video";
import { updatePoints } from "../../actions/Points";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "../../Components/VideoPlayer/VideoPlayer";
function VideoPage() {
  const { vid } = useParams();
  const vids = useSelector((state) => state.videoReducer);
  const vv = vids?.data.filter((q) => q._id === vid)[0];
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state?.currentUserReducer);
  const [pointsUpdated, setPointsUpdated] = useState(false);
  // const videoRef = useRef(null);
  const commentSectionRef = useRef(null);
  const currentVideoIndex = vids.data.findIndex((q) => q._id === vid);
  const nextVideoIndex = currentVideoIndex + 2;
  const nextVideo = vids.data[nextVideoIndex];
  const navigate = useNavigate();

  const handleHistory = () => {
    dispatch(
      addToHistory({
        videoId: vid,
        Viewer: CurrentUser?.result._id,
      })
    );
  };
  const handleViews = () => {
    dispatch(
      viewVideo({
        id: vid,
      })
    );
  };
  useEffect(() => {
    if (CurrentUser) {
      handleHistory();
      handleViews();
      if (!pointsUpdated) {
        dispatch(updatePoints(CurrentUser?.result._id, { points: 5 }));
        setPointsUpdated(true);
      }
    }
  }, [CurrentUser, vid, dispatch, pointsUpdated]);
  const handleNextVideo = () => {
    if (nextVideo) {
      navigate(`/videopage/${nextVideo._id}`);

    }
  };
  const handleShowComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCloseWebsite = () => {
    window.open('https://google.com', '_self');
  };

 
  return (
    <>
      <div className="container_videoPage">
        <div className="container2_videoPage">
          <div className="video_display_screen_videoPage">
            {/* <video
              ref={videoRef}
              src={http://localhost:5500/${vv?.filePath}}
              className={"video_ShowVideo_videoPage"}
              controls
            /> */}
              <VideoPlayer
              src={`https://internproject-yzv8.onrender.com/${vv?.filePath}`}
              className={"video_ShowVideo_videoPage"}
              onShowComments={handleShowComments}
              onNextVideo={handleNextVideo}
              onCloseWebsite={handleCloseWebsite}
            />
            <div className="video_details_videoPage">
              <div className="video_btns_title_VideoPage_cont">
                <p className="video_title_VideoPage"> {vv?.videoTitle}</p>
                <div className="views_date_btns_VideoPage">
                  <div className="views_videoPage">
                    {vv?.Views} views <div className="dot"></div>{" "}
                    {moment(vv?.createdAt).fromNow()}
                  </div>
                  <LikeWatchLaterSaveBtns vv={vv} vid={vid} />
                </div>
              </div>
              <Link
                to={`/chanel/${vv?.videoChanel}`}
                className="chanel_details_videoPage"
              >
                <b className="chanel_logo_videoPage">
                  <p>{vv?.Uploder.charAt(0).toUpperCase()}</p>
                </b>
                <p className="chanel_name_videoPage">{vv?.Uploder}</p>
              </Link>
              <div
                className="comments_VideoPage"
                tabIndex={0}
                ref={commentSectionRef}
              >
                <h2>
                  <u>Coments</u>
                </h2>
                <Comments videoId={vv._id} />
              </div>
            </div>
          </div>
          <div className="moreVideoBar">More video</div>
        </div>
      </div>
    </>
  );
}

export default VideoPage;