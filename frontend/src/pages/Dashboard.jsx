import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsService, recordService } from '../services/api';
import TransactionForm from '../components/TransactionForm';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [filters, setFilters] = useState({
        record_type: '',
        category: '',
        date: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activeFilters = Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                );

                const [summaryRes, recordsRes] = await Promise.all([
                    analyticsService.getSummary(),
                    recordService.getAll(activeFilters)
                ]);
                setSummary(summaryRes.data);
                setRecords(recordsRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, [filters]);

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

    if (!summary) return <div>Loading dashboard...</div>;

    const pieDataCategory = Object.entries(summary.by_category).map(([name, value]) => ({ name, value }));
    const pieDataType = Object.entries(summary.by_type || {}).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
    }));
    
    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];
    const TYPE_COLORS = { 'income': '#10b981', 'expense': '#ef4444', 'investment': '#3b82f6' };

    const canModify = user.role === 'admin' || user.role === 'analyst';
    const canDelete = user.role === 'admin';

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1>Finance Dashboard</h1>
                  <p style={{ opacity: 0.6 }}>Welcome, {user.username}. You have {user.role} access.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {canModify && (
                        <button onClick={openCreateModal}>+ New Transaction</button>
                    )}
                    <select 
                        value={filters.record_type} 
                        onChange={(e) => setFilters({...filters, record_type: e.target.value})}
                        style={{ margin: 0, width: 'auto' }}
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="investment">Investment</option>
                    </select>
                </div>
            </div>
            
            <div className="dashboard-grid">
                <div className="glass-card">
                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem' }}>Net Balance</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: summary.total_amount >= 0 ? 'var(--accent)' : '#ef4444' }}>
                      ${summary.total_amount.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem' }}>Total Income</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                      ${summary.total_income.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ opacity: 0.7, fontSize: '0.9rem' }}>Total Expenses</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                      ${summary.total_expenses.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '2rem', height: '400px' }}>
                <h3>Financial Trends</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={summary.trends}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                <div className="glass-card" style={{ height: '350px' }}>
                    <h3>Category Analysis</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={pieDataCategory}
                                cx="50%" cy="50%" outerRadius={60}
                                dataKey="value" label
                            >
                                {pieDataCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-card" style={{ height: '350px' }}>
                    <h3>Type Distribution</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={pieDataType}
                                cx="50%" cy="50%" outerRadius={60}
                                dataKey="value" label
                            >
                                {pieDataType.map((entry, i) => (
                                    <Cell key={i} fill={TYPE_COLORS[entry.name.toLowerCase()] || COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h3>Transaction History</h3>
                <div style={{ marginTop: '1rem' }}>
                    {records.map(record => (
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
                                  <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{record.date} • {record.category}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ fontWeight: '600' }}>
                                    ${record.amount}
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
            </div>

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
