// src/components/FooterHandler.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const FooterHandler = () => {
  const location = useLocation();

  // Determine if the current route is the message route
  const isMessageRoute = location.pathname.startsWith('/message/');

  // Render Footer only if it's NOT the message route
  if (isMessageRoute) {
    return null; // Don't render anything
  }

  return <Footer />; // Render Footer
};

export default FooterHandler;