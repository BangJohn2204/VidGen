
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
        VEO3 Video Generator
      </h1>
      <p className="text-slate-400 mt-2 text-lg">
        Craft stunning videos from text and images with the power of AI.
      </p>
    </header>
  );
};

export default Header;
