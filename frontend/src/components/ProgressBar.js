import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-bar">
      <div style={{ width: `${progress}%` }}></div>
      <span>{progress.toFixed(1)}%</span>
    </div>
  );
};

export default ProgressBar;