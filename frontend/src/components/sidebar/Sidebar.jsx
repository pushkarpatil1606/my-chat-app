import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import ChatListItem from './ChatListItem';

export default function Sidebar({ onSelectChat, selectedChat }) {

  const [users, setUsers] = useState([]);

  const loadUsers = async () => {

    try {

      const res = await API.get('/users');

      setUsers(res.data);

    } catch (err) {

      console.error(err);

    }

  };

  useEffect(() => {

    loadUsers();

  }, []);

  const openChat = async (userId) => {

    try {

      const res = await API.post('/chats/access', {
        userId: userId
      });

      onSelectChat(res.data);

    } catch (err) {

      console.error(err);

    }

  };

  return (

    <div style={{ width: '300px', borderRight: '1px solid #ddd', height: '100vh', overflowY: 'auto' }}>

      <h3 style={{ padding: '10px' }}>Users</h3>

      {users.map((user) => (

        <ChatListItem
          key={user._id}
          chat={user}
          onClick={() => openChat(user._id)}
          active={selectedChat && selectedChat._id === user._id}
        />

      ))}

    </div>

  );

}