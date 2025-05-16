import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', { 
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true
});

const GroupSession = ({ userId }) => {
  const [sessionData, setSessionData] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to SocketIO server (Group Session)');
      setError(null);
    });
    socket.on('connect_error', (err) => {
      console.error('SocketIO connection error:', err);
      setError('Failed to connect to server: ' + err.message);
    });
    socket.on('session_response', (data) => {
      console.log('Received session_response:', data);
      if (data.error) {
        setError(data.error);
      } else {
        setResponse(`Session joined: ${JSON.stringify(data)}`);
        setError(null);
      }
    });
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('session_response');
    };
  }, []);

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (!sessionData.trim()) {
      setError('Please enter session data');
      return;
    }
    console.log('Sending group_session:', { user_id: userId, session_data: sessionData });
    socket.emit('group_session', { user_id: userId, session_data: sessionData }, (ack) => {
      if (!ack) {
        setError('Failed to send session data to server');
      } else {
        console.log('Session data sent successfully:', ack);
      }
    });
  };

  return (
    <div className="group-session">
      <h2>Group Session</h2>
      <form onSubmit={handleJoinSession}>
        <input 
          type="text" 
          value={sessionData} 
          onChange={(e) => setSessionData(e.target.value)} 
          placeholder="Enter session ID or name..." 
        />
        <button type="submit">Join Session</button>
      </form>
      {error && <p className="error">Error: {error}</p>}
      {response && <p className="response">{response}</p>}
    </div>
  );
};

export default GroupSession;