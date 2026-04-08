import React, { useState } from 'react';

const TransactionForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        record_type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (initialData && isOpen) {
            setFormData(initialData);
        } else if (!initialData && isOpen) {
            setFormData({
                title: '',
                amount: '',
                record_type: 'expense',
                category: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Validation failed. Check your inputs.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content" style={{ width: '500px' }}>
                <h2>{initialData ? 'Edit' : 'New'} Transaction</h2>
                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Amount</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required step="0.01" />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select name="record_type" value={formData.record_type} onChange={handleChange}>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                                <option value="investment">Investment</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="submit" style={{ flex: 1 }}>{initialData ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)' }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
