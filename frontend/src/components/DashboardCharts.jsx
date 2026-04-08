import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { formatChartDate } from '../utils/formatters';

const DashboardCharts = ({ summary, colors, typeColors }) => {
    const pieDataCategory = Object.entries(summary.by_category).map(([name, value]) => ({ name, value }));
    const pieDataType = Object.entries(summary.by_type || {}).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
    }));

    return (
        <>
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
                        <XAxis 
                            dataKey="date" 
                            stroke="rgba(255,255,255,0.5)" 
                            tickFormatter={formatChartDate}
                        />
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
                                {pieDataCategory.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
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
                                    <Cell key={i} fill={typeColors[entry.name.toLowerCase()] || colors[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};

export default DashboardCharts;
