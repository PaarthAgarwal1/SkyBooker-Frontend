import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import Footer from '../../components/user/Footer';

const PassengerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PassengerLayout;
