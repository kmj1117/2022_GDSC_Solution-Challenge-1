import { Button, Grid } from "@mui/material";
import LectureCard from "components/body/LectureCard";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService, dbService } from "fbase";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

function Bsearch() {
  let leclist = [];
  const [lid, setLid] = useState();
  const auth = authService;
  const [userLec, setUserLec] = useState([]);
  const [num,setNum]= useState(-1);
  const [trashCan, setTrashCan] = useState([]);

  useEffect(async () => {
    let dummy = [];
    const user = auth.currentUser;
    const userQuery = query(
      collection(dbService, "Users"),
      where("uid", "==", user.uid)
    );
    const querySnapShot = await getDocs(userQuery);
    querySnapShot.forEach((doc) => {
      setUserLec(doc.data().lectures);
      dummy = doc.data().lectures;
    });
    setNum(dummy.length);
  }, []);

  useEffect(async ()=>{
    const lecturesQuery = await getDocs(collection(dbService, "Lectures"));
    if(num > -1){
      lecturesQuery.forEach((doc) => {
        if(!userLec.includes(doc.id) && !trashCan.includes(doc.id)){
          leclist.push(doc.id);
        }
      });
      const randlec = leclist[parseInt(Math.random() * leclist.length)];
      setLid(randlec);
    }
  },[num])

  const onclickleft = () => { 
    const lec = trashCan;  
    lec.push(lid);
    setNum(num + 1);
    setTrashCan(lec);
  };
  const onclickright = async () => {
    const lec = userLec;  
    lec.push(lid);
    setNum(num + 1);
    await updateDoc(doc(dbService, "Users", auth.currentUser.uid), { lectures: lec });
  };


  return (
    <>
    {
    (num > -1 && !lid) ? <h4>모든 강의를 탐색하셨습니다!</h4> 
    : (
        <Grid container sx = {{display : "flex", flexDirection : "row", justifyContent : "space-between"}}>
        <Grid item>
          <Button onClick={onclickleft}>left</Button>
        </Grid>
        <Grid item>
          {lid && <LectureCard lectureId={lid} />}
        </Grid>
        <Grid item>
          <Button onClick={onclickright}>right</Button>
        </Grid>
      </Grid>
      )
    }
    </>
  );
}

export default Bsearch;
