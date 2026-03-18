import React, { useContext, useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import ChatBox from '../components/chat/ChatBox';
import useSocket from '../hooks/useSocket';
import { AuthContext } from '../context/AuthContext';

export default function ChatPage(){
  const { user } = useContext(AuthContext);
  const socketRef = useSocket(user);
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div style={{display:'flex'}}>
      <Sidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      {selectedChat ? <ChatBox chat={selectedChat} socketRef={socketRef} /> : <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>Select a chat</div>}
    </div>
  );
}
