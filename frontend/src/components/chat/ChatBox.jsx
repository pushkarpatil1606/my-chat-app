import React, { useEffect, useRef, useState } from "react";
import API from "../../api/axios";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatBox({ chat, socketRef }) {

  const [messages,setMessages] = useState([]);
  const [input,setInput] = useState("");
  const [isTyping,setIsTyping] = useState(false);

  const [incomingCall,setIncomingCall] = useState(null);
  const [callActive,setCallActive] = useState(false);
  const [isAudioOnly,setIsAudioOnly] = useState(false);

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidates = useRef([]);

  const scrollRef = useRef();

  const getMe = ()=>JSON.parse(localStorage.getItem("user")||"null");

  const getPartnerId = ()=>{
    const me = getMe();
    if(!chat?.users) return null;

    const partner = chat.users.find(u=>{
      const id = typeof u==="string"?u:(u._id||u.id);
      return String(id)!==String(me?._id);
    });

    return typeof partner==="string"?partner:(partner?._id||partner?.id);
  };



/* -------------------- WEBRTC -------------------- */

const createPeer = (partnerId)=>{

  const pc = new RTCPeerConnection({
    iceServers:[
      {urls:"stun:stun.l.google.com:19302"}
    ]
  });

  pc.onicecandidate=(event)=>{
    if(event.candidate){
      socketRef.current.emit("ice_candidate",{
        to:partnerId,
        candidate:event.candidate
      });
    }
  };

  pc.ontrack=(event)=>{
    const stream = event.streams[0];

    if(remoteVideo.current){
      remoteVideo.current.srcObject = stream;
      remoteVideo.current.play().catch(()=>{});
    }
  };

  pc.onconnectionstatechange=()=>{
    console.log("Connection:",pc.connectionState);

    if(pc.connectionState==="failed" || pc.connectionState==="disconnected"){
      endCall();
    }
  };

  return pc;
};



/* -------------------- START CALL -------------------- */

const startCall = async(audioOnly=false)=>{

  try{

    const partnerId = getPartnerId();
    if(!partnerId) return;

    setIsAudioOnly(audioOnly);

    const stream = await navigator.mediaDevices.getUserMedia({
      video:!audioOnly,
      audio:true
    });

    localStreamRef.current = stream;

    if(localVideo.current){
      localVideo.current.srcObject = stream;
      localVideo.current.muted=true;
    }

    const pc = createPeer(partnerId);

    stream.getTracks().forEach(track=>{
      pc.addTrack(track,stream);
    });

    peerRef.current = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.emit("call_user",{
      to:partnerId,
      offer,
      from:getMe()?._id,
      isAudioOnly:audioOnly
    });

    setCallActive(true);

  }catch(err){
    console.error(err);
  }
};



/* -------------------- ACCEPT CALL -------------------- */

const acceptCall = async()=>{

  try{

    const {offer,from,isAudioOnly} = incomingCall;

    setIsAudioOnly(isAudioOnly);

    const stream = await navigator.mediaDevices.getUserMedia({
      video:!isAudioOnly,
      audio:true
    });

    localStreamRef.current = stream;

    if(localVideo.current){
      localVideo.current.srcObject = stream;
      localVideo.current.muted=true;
    }

    const pc = createPeer(from);

    stream.getTracks().forEach(track=>{
      pc.addTrack(track,stream);
    });

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    while(pendingCandidates.current.length){
      const candidate = pendingCandidates.current.shift();
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit("answer_call",{to:from,answer});

    peerRef.current = pc;

    setIncomingCall(null);
    setCallActive(true);

  }catch(err){
    console.error(err);
  }

};



/* -------------------- END CALL -------------------- */

const endCall = ()=>{

  const partnerId = getPartnerId();

  if(socketRef.current && partnerId){
    socketRef.current.emit("end_call",{to:partnerId});
  }

  if(peerRef.current){
    peerRef.current.close();
    peerRef.current=null;
  }

  if(localStreamRef.current){
    localStreamRef.current.getTracks().forEach(track=>track.stop());
    localStreamRef.current=null;
  }

  pendingCandidates.current=[];

  setCallActive(false);
  setIncomingCall(null);
};



/* -------------------- SOCKET EVENTS -------------------- */

useEffect(()=>{

  const socket = socketRef.current;
  if(!socket) return;

  socket.on("incoming_call",(data)=>{
    setIncomingCall(data);
  });

  socket.on("call_answered",async({answer})=>{

    const pc = peerRef.current;
    if(!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));

    while(pendingCandidates.current.length){
      const candidate = pendingCandidates.current.shift();
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

  });

  socket.on("ice_candidate",async({candidate})=>{

    const pc = peerRef.current;

    if(pc && pc.remoteDescription){
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    else{
      pendingCandidates.current.push(candidate);
    }

  });

  socket.on("call_ended",()=>{
    endCall();
  });

  return()=>{
    socket.off("incoming_call");
    socket.off("call_answered");
    socket.off("ice_candidate");
    socket.off("call_ended");
  };

},[]);



/* -------------------- LOAD MESSAGES -------------------- */

useEffect(()=>{

  const loadMessages = async()=>{

    if(!chat) return;

    try{
      const res = await API.get(`/messages/${chat._id}`);
      setMessages(res.data);
      scrollRef.current?.scrollIntoView({behavior:"smooth"});
    }
    catch{}
  };

  loadMessages();

  socketRef.current?.emit("join_chat",chat?._id);

},[chat]);



/* -------------------- SEND MESSAGE -------------------- */

const send = async()=>{

  if(!input.trim() || !chat) return;

  try{

    const res = await API.post("/messages",{
      content:input,
      chat:chat._id
    });

    setMessages(prev=>[...prev,res.data]);

    socketRef.current?.emit("new_message",res.data);

    setInput("");

  }catch{}

};



/* -------------------- UI -------------------- */

return(

<div style={{display:"flex",flexDirection:"column",height:"100vh"}}>

<div style={{padding:15,borderBottom:"1px solid #ddd",display:"flex",justifyContent:"space-between"}}>

<strong>{chat?.chatName || "Chat"}</strong>

{!callActive && (
<div>
<button onClick={()=>startCall(false)} style={btnStyle}>📹 Video</button>
<button onClick={()=>startCall(true)} style={{...btnStyle,marginLeft:5}}>🎧 Audio</button>
</div>
)}

</div>



<div style={{flex:1,overflowY:"auto",padding:15,background:"#f5f5f5"}}>

{messages.map(m=>(<MessageBubble key={m._id} m={m}/>))}

{isTyping && <TypingIndicator/>}

<div ref={scrollRef}/>

</div>



{incomingCall && !callActive && (

<div style={overlayStyle}>

<p>Incoming {incomingCall.isAudioOnly?"Audio":"Video"} Call</p>

<button onClick={acceptCall} style={{...btnStyle,background:"green"}}>Accept</button>

<button onClick={()=>setIncomingCall(null)} style={{...btnStyle,background:"red",marginLeft:10}}>Decline</button>

</div>

)}



{callActive && (

<div style={videoContainerStyle}>

<video
ref={remoteVideo}
autoPlay
playsInline
style={{width:"100%",height:"100%"}}
/>

{!isAudioOnly && (

<video
ref={localVideo}
autoPlay
muted
playsInline
style={miniVideoStyle}
/>

)}

<button onClick={endCall} style={hangupStyle}>
Hang Up
</button>

</div>

)}



<div style={{padding:10,borderTop:"1px solid #ddd",display:"flex",gap:10}}>

<input
value={input}
onChange={e=>setInput(e.target.value)}
placeholder="Type message"
style={{flex:1,padding:10,borderRadius:20,border:"1px solid #ccc"}}
/>

<button onClick={send} style={btnStyle}>Send</button>

</div>

</div>

);

}



/* -------------------- STYLES -------------------- */

const btnStyle={
background:"#0084ff",
color:"#fff",
border:"none",
padding:"8px 15px",
borderRadius:5,
cursor:"pointer"
};

const overlayStyle={
position:"fixed",
top:"20%",
left:"50%",
transform:"translate(-50%,-50%)",
background:"#fff",
padding:20,
border:"1px solid #ccc",
zIndex:1000,
textAlign:"center",
borderRadius:10
};

const videoContainerStyle={
position:"relative",
height:"300px",
background:"#000"
};

const miniVideoStyle={
position:"absolute",
bottom:10,
right:10,
width:120,
border:"2px solid white",
borderRadius:5
};

const hangupStyle={
position:"absolute",
bottom:10,
left:"50%",
transform:"translateX(-50%)",
background:"red",
color:"white",
border:"none",
padding:"10px 20px",
borderRadius:20
};