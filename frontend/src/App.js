import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatPage from './pages/ChatPage';

export default function App(){
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/chat' element={<ChatPage/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
