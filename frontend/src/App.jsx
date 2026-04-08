import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const Navbar = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <nav className="nav">
            <h2 style={{ color: 'var(--accent)' }}>Zorvyn Finance</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>{user.role}</div>
                </div>
                {user.role === 'admin' && (
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--accent)', borderRadius: '4px', cursor: 'default' }}>
                        ADMIN PANEL
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
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
