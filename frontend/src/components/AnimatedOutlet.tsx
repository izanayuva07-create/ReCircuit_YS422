import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const AnimatedOutlet: React.FC = () => {
  const location = useLocation();
  return <div key={`${location.pathname}${location.search}`} className="page-enter min-h-full"><Outlet /></div>;
};

export default AnimatedOutlet;
