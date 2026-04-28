import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex pt-16">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPath={location.pathname} />
                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0 lg:ml-64'}`}>
                    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;

