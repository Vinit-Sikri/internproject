import React from "react";
import { FaEdit, FaUpload } from "react-icons/fa";
import { useSelector } from "react-redux";
import "./DescribeChanel.css";
import { getPoints } from "../../actions/Points";
import { useDispatch} from "react-redux";
import { useEffect } from "react";
function DecribeChanel({ setEditCreateChanelBtn, Cid,setVidUploadPage }) {
  const chanels = useSelector((state) => state?.chanelReducers);
  const points = useSelector((state) => state.pointsReducer.points);
  // console.log(Cid)
  const currentChanel = chanels.filter((c) => c._id === Cid)[0];
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state?.currentUserReducer);
  useEffect(() => {
    if (CurrentUser?.result?._id) {
      dispatch(getPoints(CurrentUser.result._id)); 
    }
  }, [dispatch, CurrentUser]); 
  return (
    <div className="container3_chanel">
      <div className="chanel_logo_chanel">
        <b>{currentChanel?.name.charAt(0).toUpperCase()}</b>
      </div>
      <div className="description_chanel">
        <b> {currentChanel?.name} </b>
        <p> {currentChanel?.desc} </p>
        <p> <span>Points: {typeof points === 'number' ? points : 'Loading...'}</span></p>
      </div>
      {CurrentUser?.result._id === currentChanel?._id && (
        <>
          <p
            className="editbtn_chanel"
            onClick={() => {
              setEditCreateChanelBtn(true);
            }}
          >
            <FaEdit />
            <b> Edit Chanel</b>
          </p>
          <p className="uploadbtn_chanel" onClick={()=>setVidUploadPage(true)}>
            <FaUpload />
            <b> Upload Video</b>
          </p>
        </>
      )}
    </div>
  );
}

export default DecribeChanel;