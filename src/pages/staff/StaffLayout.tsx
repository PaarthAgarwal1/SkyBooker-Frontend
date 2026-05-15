import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@components/staff/Sidebar';
import Topbar from '@components/staff/Topbar';

const StaffLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
