import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Pill,
    PlusCircle,
    History,
    Users,
    Settings,
    X,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentPath }) => {
    const menuItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/medicines', label: 'Medicines', icon: Pill },
        { path: '/medicines/add', label: 'Add Medicine', icon: PlusCircle },
        { path: '/history', label: 'History', icon: History },
        { path: '/family', label: 'Family', icon: Users },
        { path: '/profile', label: 'Profile', icon: Settings },
    ];

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 ml-auto block"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-400 text-center">
                        MediTrack v1.0
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

