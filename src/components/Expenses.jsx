import React, { useState } from 'react';
import { Search, Plus, Trash2, Download, Filter, Calendar, FileSpreadsheet } from 'lucide-react';

export default function Expenses({ categories, expenses, onAddExpense, onDeleteExpense }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Expense Form State
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(categories[0]?.id || '');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(expenseAmount) || parseFloat(expenseAmount) <= 0) return;
    
    onAddExpense({
      amount: parseFloat(expenseAmount),
      categoryId: expenseCategory,
      description: expenseDesc.trim(),
      date: expenseDate
    });
    
    setExpenseAmount('');
    setExpenseDesc('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);
  };

  // Filter & Sort Logic
  const filteredExpenses = expenses
    .filter(exp => {
      const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? exp.categoryId === categoryFilter : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  // Export to CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    
    // CSV headers
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Description,Category,Amount (INR)\n';
    
    // CSV rows
    expenses.forEach(exp => {
      const cat = categories.find(c => c.id === exp.categoryId);
      const catName = cat ? cat.name : 'Unknown';
      const cleanDesc = exp.description.replace(/"/g, '""'); // escape quotes
      csvContent += `${exp.date},"${cleanDesc}",${catName},${exp.amount}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wheredidmymoneygo_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryDetails = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? { name: cat.name, emoji: cat.emoji, color: cat.color, bgTint: cat.bgTint } : { name: 'Other', emoji: '⚙️', color: '#6b7280', bgTint: 'rgba(107, 114, 128, 0.1)' };
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Expenses</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Search, filter, and export your spending logs.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleExportCSV} 
            disabled={expenses.length === 0}
            style={{ opacity: expenses.length === 0 ? 0.6 : 1 }}
          >
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      {/* Toolbar / Search & Filter Panel */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="expenses-toolbar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input expenses-search-input"
            />
          </div>
          
          <div className="filters-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--slate-600)' }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
                style={{ width: '160px', padding: '0.5rem' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} style={{ color: 'var(--slate-600)' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
                style={{ width: '160px', padding: '0.5rem' }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">📋</span>
          <span className="empty-state-title">No transactions found</span>
          <p>
            {expenses.length === 0 
              ? "You haven't logged any expenses yet! Click '+ Add Expense' to start." 
              : "No search results match your criteria. Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ width: '80px', textItems: 'center', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => {
                  const cat = getCategoryDetails(exp.categoryId);
                  return (
                    <tr key={exp.id}>
                      <td>
                        <span className="exp-cat-badge" style={{ background: cat.bgTint, color: cat.color }}>
                          <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                          <span>{cat.name}</span>
                        </span>
                      </td>
                      <td className="exp-desc-cell">
                        {exp.description || 'Unspecified Expense'}
                      </td>
                      <td>
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="exp-amount-cell">
                        ₹{exp.amount.toLocaleString()}
                      </td>
                      <td style={{ textItems: 'center', textAlign: 'center' }}>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm btn-danger"
                          onClick={() => onDeleteExpense(exp.id)}
                          title="Delete transaction"
                          style={{ padding: '0.25rem', height: '2rem', width: '2rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal Dialog */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-bar">
              <h3 style={{ fontSize: '1.15rem' }}>➕ Add Expense</h3>
              <button 
                className="btn btn-secondary btn-icon btn-sm"
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent' }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', fontWeight: 600, color: 'var(--slate-600)' }}>₹</span>
                    <input 
                      type="number"
                      required
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '2rem' }}
                      min="0.01"
                      step="any"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="form-input"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Subway study meal, bus fare"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input 
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
