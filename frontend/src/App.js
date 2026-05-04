import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/AddMedicine';
import MedicineList from './pages/MedicineList';
import MedicineHistory from './pages/MedicineHistory';
import FamilyManagement from './pages/FamilyManagement';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
    return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner fullScreen text="Loading..." />;
    return !user ? children : <Navigate to="/" />;
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <ToastContainer position="top-right" autoClose={3000} />
                    <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                        <Route path="/medicines" element={<PrivateRoute><Layout><MedicineList /></Layout></PrivateRoute>} />
                        <Route path="/medicines/add" element={<PrivateRoute><Layout><AddMedicine /></Layout></PrivateRoute>} />
                        <Route path="/history" element={<PrivateRoute><Layout><MedicineHistory /></Layout></PrivateRoute>} />
                        <Route path="/family" element={<PrivateRoute><Layout><FamilyManagement /></Layout></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
