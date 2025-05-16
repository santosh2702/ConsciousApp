import React, { useState, useEffect } from 'react';
import CosmicAvatar from './components/CosmicAvatar';
import ConsciousMode from './components/ConsciousMode';
import GroupSession from './components/GroupSession';
import ProgressBar from './components/ProgressBar';
import './App.css';

function App() {
  const [userId, setUserId] = useState(1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conscious');

  useEffect(() => {
    fetch('http://localhost:5000/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setProgress(data.progress))
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err.message);
      });
  }, [userId]);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="header">
          <div className="awareness-orb"></div>
          <h1>ConsciousApp</h1>
        </div>
        <nav className="navigation">
          <button 
            className={activeTab === 'conscious' ? 'active' : ''} 
            onClick={() => setActiveTab('conscious')}
          >
            Dream Interpreter
          </button>
          <button 
            className={activeTab === 'group' ? 'active' : ''} 
            onClick={() => setActiveTab('group')}
          >
            Group Session
          </button>
          <button 
            className={activeTab === 'progress' ? 'active' : ''} 
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
        </nav>
      </div>
      <div className="main-content">
        {error && <div className="error">Error: {error}</div>}
        <CosmicAvatar progress={progress} />
        {activeTab === 'conscious' && <ConsciousMode userId={userId} setProgress={setProgress} />}
        {activeTab === 'group' && <GroupSession userId={userId} />}
        {activeTab === 'progress' && <ProgressBar progress={progress} />}
      </div>
    </div>
  );
}

export default App;