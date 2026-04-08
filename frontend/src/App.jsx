import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="container">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="container">Loading...</div>;
    if (!user || user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

const Navbar = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <nav className="nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h2 style={{ color: 'var(--accent)', margin: 0 }}>Zorvyn Finance</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Dashboard</Link>
                    {user.role === 'admin' && (
                        <Link to="/users" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Users</Link>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>{user.role}</div>
                </div>
                {user.role === 'admin' && (
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--accent)', borderRadius: '4px', cursor: 'default', color: 'black', fontWeight: 'bold' }}>
                        ADMIN
                    </span>
                )}
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem 1rem' }}>Logout</button>
            </div>
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'white' }}>
                    <Navbar />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route 
                            path="/" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/users" 
                            element={
                                <AdminRoute>
                                    <UserManagement />
                                </AdminRoute>
                            } 
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
