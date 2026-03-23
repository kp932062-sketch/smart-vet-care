import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/doctor-dashboard') ||
    location.pathname.startsWith('/admin-dashboard');
  
  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <div className="animate-page-enter">
        <Outlet />
      </div>
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

export default Layout;