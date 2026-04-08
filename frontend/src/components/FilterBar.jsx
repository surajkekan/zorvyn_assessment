import React from 'react';

const FilterBar = ({ filters, onFilterChange, onReset, options = {} }) => {
    const { 
        showSearch = true, 
        showType = true, 
        showCategory = true, 
        showDateRange = true,
        showStatus = false,
        showRole = false 
    } = options;

    return (
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {showSearch && (
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                    className="glass-input"
                    style={{ width: '160px', height: '40px' }}
                />
            )}

            {showRole && (
                <select 
                    value={filters.role || ''} 
                    onChange={(e) => onFilterChange('role', e.target.value)}
                    className="glass-input"
                    style={{ minWidth: '120px', height: '40px' }}
                >
                    <option value="">All Roles</option>
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                </select>
            )}

            {showStatus && (
                <select 
                    value={filters.is_active || ''} 
                    onChange={(e) => onFilterChange('is_active', e.target.value)}
                    className="glass-input"
                    style={{ minWidth: '130px', height: '40px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            )}

            {showType && (
                <select 
                    value={filters.record_type || ''} 
                    onChange={(e) => onFilterChange('record_type', e.target.value)}
                    className="glass-input"
                    style={{ minWidth: '120px', height: '40px' }}
                >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="investment">Investment</option>
                </select>
            )}

            {showCategory && (
                <select 
                    value={filters.category || ''} 
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    className="glass-input"
                    style={{ minWidth: '140px', height: '40px' }}
                >
                    <option value="">All Categories</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Rent">Rent</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Stocks">Stocks</option>
                </select>
            )}

            {showDateRange && (
                <div className="glass-date-range" style={{ height: '40px' }}>
                    <span className="label">From:</span>
                    <input 
                        type={filters.start_date ? "date" : "text"}
                        placeholder="From Date"
                        value={filters.start_date || ''}
                        onFocus={(e) => (e.target.type = 'date')}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        onChange={(e) => onFilterChange('start_date', e.target.value)}
                        style={{ width: '100px' }}
                    />
                    <span className="label" style={{ marginLeft: '0.4rem' }}>To:</span>
                    <input 
                        type={filters.end_date ? "date" : "text"}
                        placeholder="To Date"
                        value={filters.end_date || ''}
                        onFocus={(e) => (e.target.type = 'date')}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        onChange={(e) => onFilterChange('end_date', e.target.value)}
                        style={{ width: '100px' }}
                    />
                </div>
            )}

            <button 
                onClick={onReset}
                className="reset-btn"
                style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem' }}
            >
                Reset
            </button>
        </div>
    );
};

export default FilterBar;
