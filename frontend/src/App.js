import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FamilyMemberDashboard from './pages/FamilyMemberDashboard';
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

/**
 * Admin-only route
 */
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner fullScreen text="Loading..." />;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

/**
 * Family-only route
 */
const FamilyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner fullScreen text="Loading..." />;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'family') return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <ToastContainer position="top-right" autoClose={3000} />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                        {/* Admin Routes */}
                        <Route
                            path="/"
                            element={
                                <AdminRoute>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/medicines"
                            element={
                                <AdminRoute>
                                    <Layout>
                                        <MedicineList />
                                    </Layout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/medicines/add"
                            element={
                                <AdminRoute>
                                    <Layout>
                                        <AddMedicine />
                                    </Layout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <AdminRoute>
                                    <Layout>
                                        <MedicineHistory />
                                    </Layout>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/family"
                            element={
                                <AdminRoute>
                                    <Layout>
                                        <FamilyManagement />
                                    </Layout>
                                </AdminRoute>
                            }
                        />

                        {/* Family Member Routes */}
                        <Route
                            path="/my-medicines"
                            element={
                                <FamilyRoute>
                                    <Layout>
                                        <FamilyMemberDashboard />
                                    </Layout>
                                </FamilyRoute>
                            }
                        />

                        {/* Shared Routes */}
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Profile />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
