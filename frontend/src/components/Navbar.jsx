import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
            <div className="flex items-center justify-between h-full px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">MediTrack</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <User size={16} className="text-primary-600" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                        Role: <span className="capitalize text-gray-700">{user?.role}</span>
                                    </p>
                                </div>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <User size={16} />
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowProfileMenu(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-gray-50 w-full text-left"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

