import React from 'react';
import '../App.css';

const CosmicAvatar = ({ progress }) => {
  const avatarStyle = {
    filter: `brightness(${100 + progress}%)`,
    transition: 'filter 0.3s ease'
  };

  return (
    <div className="avatar">
      <img 
        src="/images/avatar2.png" 
        alt="Cosmic Avatar" 
        style={avatarStyle} 
      />
    </div>
  );
};

export default CosmicAvatar;