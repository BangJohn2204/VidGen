
import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg">
      <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-slate-300 text-center transition-opacity duration-500">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
