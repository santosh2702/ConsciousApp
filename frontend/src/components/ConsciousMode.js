import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', { 
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true
});

const ConsciousMode = ({ userId, setProgress }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to SocketIO server (Conscious Mode)');
      setError(null);
    });
    socket.on('connect_error', (err) => {
      console.error('SocketIO connection error:', err);
      setError('Failed to connect to server: ' + err.message);
    });
    socket.on('dream_response', (data) => {
      console.log('Received dream_response:', data);
      if (data.error) {
        setError(data.error);
      } else {
        setResponse(data.response);
        setProgress(data.progress);
        setError(null);
      }
    });
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('dream_response');
    };
  }, [setProgress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please enter a dream');
      return;
    }
    console.log('Sending dream:', { user_id: userId, dream_text: input });
    socket.emit('dream', { user_id: userId, dream_text: input }, (ack) => {
      if (!ack) {
        setError('Failed to send dream to server');
      } else {
        console.log('Dream sent successfully:', ack);
      }
    });
  };

  return (
    <div className="conscious-mode">
      <h2>Dream Interpreter</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Describe your dream..." 
        />
        <button type="submit">Interpret Dream</button>
      </form>
      {error && <p className="error">Error: {error}</p>}
      {response && <p className="response">{response}</p>}
    </div>
  );
};

export default ConsciousMode;