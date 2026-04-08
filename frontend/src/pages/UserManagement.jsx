import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        is_active: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const activeFilters = Object.fromEntries(
                    Object.entries(filters).filter(([, v]) => v !== '')
                );
                const response = await userService.getAll({ ...activeFilters, page });
                // Handle both paginated and non-paginated responses
                const userData = response.data.results || response.data;
                const count = response.data.count || userData.length;
                
                setUsers(userData);
                setTotalCount(count);
                setLoading(false);
            } catch {
                setError('Failed to load users. You might not have permission.');
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleReset = () => {
        setFilters({ search: '', role: '', is_active: '' });
        setPage(1);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.update(userId, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch {
            alert('Failed to update role');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await userService.update(userId, { is_active: !currentStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
        } catch {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (userId) => {
        if (userId === currentUser.id) {
            alert("You cannot delete yourself!");
            return;
        }
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.delete(userId);
                setUsers(users.filter(u => u.id !== userId));
            } catch {
                alert('Failed to delete user');
            }
        }
    };

    if (loading) return <div className="container">Loading user management...</div>;
    if (error) return <div className="container" style={{ color: '#ef4444' }}>{error}</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>User Management</h1>
                    <p style={{ opacity: 0.6 }}>Manage roles and access for all system users.</p>
                </div>
                <FilterBar 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                    onReset={handleReset}
                    options={{ 
                        showType: false, 
                        showCategory: false, 
                        showDateRange: false,
                        showStatus: true,
                        showRole: true 
                    }}
                />
            </div>

            <div className="glass-card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{u.username} {u.id === currentUser.id && '(You)'}</div>
                                </td>
                                <td style={{ padding: '1rem', opacity: 0.7 }}>{u.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <select 
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        disabled={u.id === currentUser.id}
                                        style={{ margin: 0, padding: '0.3rem', width: 'auto' }}
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="analyst">Analyst</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem',
                                        backgroundColor: u.is_active ? '#10b98133' : '#ef444433',
                                        color: u.is_active ? '#10b981' : '#ef4444',
                                        border: `1px solid ${u.is_active ? '#10b981' : '#ef4444'}`
                                    }}>
                                        {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button 
                                            className="action-btn" 
                                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                                            disabled={u.id === currentUser.id}
                                            title={u.is_active ? "Deactivate" : "Activate"}
                                        >
                                            {u.is_active ? '🚫' : '✅'}
                                        </button>
                                        <button 
                                            className="action-btn delete" 
                                            onClick={() => handleDelete(u.id)}
                                            disabled={u.id === currentUser.id}
                                            title="Delete User"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalCount > 10 && (
                    <div style={{ 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', 
                        marginTop: '2rem', gap: '1rem', paddingTop: '1rem',
                        borderTop: '1px solid var(--glass-border)'
                    }}>
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="action-btn"
                            style={{ padding: '0.4rem 1rem' }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                            Page {page} of {Math.ceil(totalCount / 10)}
                        </span>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= Math.ceil(totalCount / 10)}
                            className="action-btn"
                            style={{ padding: '0.4rem 1rem' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
