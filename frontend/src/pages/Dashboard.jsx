import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService, recordService } from '../services/api';
import TransactionForm from '../components/TransactionForm';
import FilterBar from '../components/FilterBar';
import DashboardCharts from '../components/DashboardCharts';
import { formatDate, formatCurrency } from '../utils/formatters';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [filters, setFilters] = useState({
        record_type: '',
        category: '',
        start_date: '',
        end_date: '',
        search: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activeFilters = Object.fromEntries(
                    Object.entries(filters).filter(([, v]) => v !== '')
                );
                const canViewRecords = user.role === 'analyst' || user.role === 'admin';
                const promises = [analyticsService.getSummary()];
                if (canViewRecords) {
                    promises.push(recordService.getAll({ ...activeFilters, page }));
                }
                const results = await Promise.all(promises);
                setSummary(results[0].data);
                if (canViewRecords) {
                    setRecords(results[1].data.results);
                    setTotalCount(results[1].data.count);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, [filters, user.role, page]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleReset = () => {
        setFilters({ record_type: '', category: '', start_date: '', end_date: '', search: '' });
        setPage(1);
    };

    const handleCreateOrUpdate = async (data) => {
        if (editingRecord) {
            await recordService.update(editingRecord.id, data);
        } else {
            await recordService.create(data);
        }
        setFilters({...filters});
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await recordService.delete(id);
                setFilters({...filters});
            } catch (err) {
                alert('Failed to delete record: ' + (err.message || 'Permission denied'));
            }
        }
    };

    const openCreateModal = () => {
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    if (!summary) return <div className="container">Loading dashboard...</div>;

    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];
    const TYPE_COLORS = { 'income': '#10b981', 'expense': '#ef4444', 'investment': '#3b82f6' };

    const canModify = user.role === 'admin';
    const canDelete = user.role === 'admin';
    const canViewRecords = user.role === 'analyst' || user.role === 'admin';

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1>Finance Dashboard</h1>
                  <p style={{ opacity: 0.6 }}>Welcome, {user.username}. You have {user.role} access.</p>
                </div>
            </div>
            
            <div className="dashboard-grid">
                <div className="glass-card">
                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem' }}>Net Balance</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: summary.total_amount >= 0 ? 'var(--accent)' : '#ef4444' }}>
                      {formatCurrency(summary.total_amount)}
                    </p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem' }}>Total Income</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                      {formatCurrency(summary.total_income)}
                    </p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem' }}>Total Expenses</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                      {formatCurrency(summary.total_expenses)}
                    </p>
                </div>
            </div>

            <DashboardCharts summary={summary} colors={COLORS} typeColors={TYPE_COLORS} />

            {canViewRecords && (
                <div className="glass-card" style={{ marginTop: '2rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <h3 style={{ margin: 0 }}>Transaction History</h3>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.6rem',
                        overflowX: 'auto',
                        paddingBottom: '0.8rem',
                        flexWrap: 'nowrap'
                    }}>
                        {canModify && (
                            <button onClick={openCreateModal} style={{ height: '40px', padding: '0 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 'fit-content' }}>+ Transaction</button>
                        )}
                        <FilterBar 
                            filters={filters} 
                            onFilterChange={handleFilterChange} 
                            onReset={handleReset} 
                        />
                    </div>

                    <div style={{ marginTop: '1rem', flex: 1 }}>
                        {records.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No records found.</div>
                        ) : records.map(record => (
                            <div key={record.id} style={{ 
                                display: 'flex', justifyContent: 'space-between', padding: '1rem 0', 
                                borderBottom: '1px solid var(--glass-border)', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ 
                                        padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', marginRight: '0.8rem',
                                        backgroundColor: TYPE_COLORS[record.record_type] + '33',
                                        color: TYPE_COLORS[record.record_type],
                                        border: `1px solid ${TYPE_COLORS[record.record_type]}`
                                    }}>
                                        {record.record_type.toUpperCase()}
                                    </span>
                                    <div>
                                      <strong>{record.title}</strong>
                                      <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                        {formatDate(record.date)} • {record.category}
                                      </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ fontWeight: '600' }}>
                                        {formatCurrency(record.amount)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {canModify && (
                                            <button className="action-btn" onClick={() => openEditModal(record)} title="Edit">✏️</button>
                                        )}
                                        {canDelete && (
                                            <button className="action-btn delete" onClick={() => handleDelete(record.id)} title="Delete">🗑️</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
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
            )}

            <TransactionForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateOrUpdate}
                initialData={editingRecord}
            />
        </div>
    );
};

export default Dashboard;
