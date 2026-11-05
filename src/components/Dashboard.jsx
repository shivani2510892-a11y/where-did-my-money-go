import React, { useState } from 'react';
import { Plus, HelpCircle, ArrowRight, ShieldAlert, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Calendar, RefreshCw } from 'lucide-react';

export default function Dashboard({ 
  user,
  totalBudget, 
  budgetPeriod, 
  categories, 
  expenses, 
  onAddExpense
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [simCategory, setSimCategory] = useState(categories[0]?.id || '');
  const [simAmount, setSimAmount] = useState('');
  const [simResult, setSimResult] = useState(null);
  
  // Expense Form State
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(categories[0]?.id || '');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculations
  const getCategorySpent = (catId) => {
    return expenses
      .filter(exp => exp.categoryId === catId)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const totalSpentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Handle Add Expense
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(expenseAmount) || parseFloat(expenseAmount) <= 0) return;
    
    onAddExpense({
      amount: parseFloat(expenseAmount),
      categoryId: expenseCategory,
      description: expenseDesc.trim(),
      date: expenseDate
    });
    
    // Reset Form
    setExpenseAmount('');
    setExpenseDesc('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);
    
    // Clear simulation if category changed
    setSimResult(null);
  };

  // Handle Simulation
  const handleSimulate = (e) => {
    e.preventDefault();
    const amt = parseFloat(simAmount);
    if (isNaN(amt) || amt <= 0 || !simCategory) return;
    
    const cat = categories.find(c => c.id === simCategory);
    if (!cat) return;
    
    const currentSpent = getCategorySpent(simCategory);
    const simulatedSpent = currentSpent + amt;
    const isOver = simulatedSpent > cat.allocated;
    
    setSimResult({
      categoryName: cat.name,
      allocated: cat.allocated,
      beforeSpent: currentSpent,
      afterSpent: simulatedSpent,
      overrun: simulatedSpent - cat.allocated,
      isOver,
      emoji: cat.emoji,
      color: cat.color
    });
  };

  // Dynamic Insights Generator
  const generateInsights = () => {
    const insights = [];
    if (categories.length === 0) return insights;

    // 1. Overall Budget Check
    if (totalSpent > totalBudget) {
      insights.push({
        type: 'danger',
        text: `🔴 Budget Overrun: You have exceeded your overall budget by ₹${totalSpent - totalBudget}! Consider adjusting your category allocations.`,
        icon: '🚨'
      });
    } else if (totalSpentPercentage >= 90) {
      insights.push({
        type: 'warning',
        text: `⚠️ Critical Budget Level: You have used ${totalSpentPercentage.toFixed(0)}% of your overall budget. Only ₹${remainingBudget} left!`,
        icon: '⚠️'
      });
    } else {
      insights.push({
        type: 'success',
        text: `🟢 On Track: You're currently on track to stay within your overall budget. Keep it up!`,
        icon: '🟢'
      });
    }

    // 2. High spending category finder
    const catSpentList = categories.map(cat => ({
      ...cat,
      spent: getCategorySpent(cat.id)
    }));
    
    const sortedCats = [...catSpentList].sort((a, b) => b.spent - a.spent);
    const topSpender = sortedCats[0];
    
    if (topSpender && topSpender.spent > 0) {
      insights.push({
        type: 'info',
        text: `💡 Major Outlay: ${topSpender.emoji} ${topSpender.name} is currently your highest spending category at ₹${topSpender.spent}.`,
        icon: '💡'
      });
    }

    // 3. Category warning alerts (above 80% used)
    categories.forEach(cat => {
      const spent = getCategorySpent(cat.id);
      const pct = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
      if (spent > cat.allocated) {
        insights.push({
          type: 'danger',
          text: `🚨 Over Category Budget: You have spent ₹${spent - cat.allocated} more than allocated on ${cat.emoji} ${cat.name}.`,
          icon: '🚨'
        });
      } else if (pct >= 80) {
        insights.push({
          type: 'warning',
          text: `⚠️ Near Limits: You've used ${pct.toFixed(0)}% of your ${cat.emoji} ${cat.name} budget (₹${spent} / ₹${cat.allocated}).`,
          icon: '⚠️'
        });
      }
    });

    // 4. Budget Pacing / Velocity (Assume August 12 = 12th day of 30-day cycle, or approx 40% elapsed)
    const currentDay = new Date().getDate();
    const elapsedPercentage = (currentDay / 30) * 100;
    
    if (totalSpent > 0 && totalBudget > 0) {
      if (totalSpentPercentage > elapsedPercentage + 10) {
        insights.push({
          type: 'warning',
          text: `🎯 Budget Velocity: You are at day ${currentDay} of the month (${elapsedPercentage.toFixed(0)}% elapsed) but have spent ${totalSpentPercentage.toFixed(0)}% of your budget. Consider slowing down your spending pace.`,
          icon: '⚠️'
        });
      } else {
        insights.push({
          type: 'success',
          text: `🎯 Budget Velocity: You're spending slower than your expected monthly pacing! You have used ${totalSpentPercentage.toFixed(0)}% in ${currentDay} days.`,
          icon: '🎯'
        });
      }
    }

    return insights;
  };

  const activeInsights = generateInsights();

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Greeting Header */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Here is where your money is going.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="metrics-grid">
        
        {/* Card 1: Total Budget */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
            💰
          </div>
          <div className="metric-details">
            <span className="metric-label">{budgetPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Budget</span>
            <span className="metric-value">₹{totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Spent */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ 
            background: totalSpent > totalBudget ? 'var(--rose-50)' : 'rgba(99, 102, 241, 0.1)', 
            color: totalSpent > totalBudget ? 'var(--rose-500)' : 'var(--indigo-500)' 
          }}>
            💸
          </div>
          <div className="metric-details">
            <span className="metric-label">Spent</span>
            <span className="metric-value" style={{ color: totalSpent > totalBudget ? 'var(--rose-600)' : 'inherit' }}>
              ₹{totalSpent.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Remaining */}
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ 
            background: remainingBudget < 0 ? 'var(--rose-50)' : 'var(--emerald-50)', 
            color: remainingBudget < 0 ? 'var(--rose-500)' : 'var(--emerald-500)' 
          }}>
            🎯
          </div>
          <div className="metric-details">
            <span className="metric-label">Remaining</span>
            <span className="metric-value" style={{ color: remainingBudget < 0 ? 'var(--rose-600)' : 'var(--emerald-600)' }}>
              ₹{remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Overall Progress Meter */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <span>Overall Spending Progress</span>
          <span>{totalSpentPercentage.toFixed(0)}% used</span>
        </div>
        <div className="progress-bar-container" style={{ height: '10px' }}>
          <div 
            className={`progress-bar-fill ${totalSpentPercentage > 100 ? 'warning-critical' : totalSpentPercentage > 80 ? 'warning-medium' : 'warning-light'}`}
            style={{ width: `${Math.min(totalSpentPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Left Column: Categories List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📊</span> Your Category Splits
          </h2>
          
          {categories.length === 0 ? (
            <div className="card empty-state">
              <span className="empty-state-icon">📂</span>
              <span className="empty-state-title">No categories selected</span>
              <p>Go to settings to set up spending categories.</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map(cat => {
                const spent = getCategorySpent(cat.id);
                const pct = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
                const remaining = cat.allocated - spent;
                
                return (
                  <div key={cat.id} className="card cat-card">
                    <div className="cat-header">
                      <div className="cat-info">
                        <div className="cat-icon-box" style={{ background: cat.bgTint || 'var(--slate-100)', color: cat.color }}>
                          {cat.emoji}
                        </div>
                        <span className="cat-name">{cat.name}</span>
                      </div>
                      <span className={`priority-badge priority-${cat.priority}`}>
                        {cat.priority}
                      </span>
                    </div>

                    <div className="cat-amount-row">
                      <div>
                        {spent === 0 ? (
                          <span className="cat-amount-main" style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>Nothing spent yet</span>
                        ) : (
                          <span className="cat-amount-main">₹{spent.toLocaleString()}</span>
                        )}
                        <span className="cat-amount-limit"> / ₹{cat.allocated.toLocaleString()}</span>
                      </div>
                      <span className="cat-percentage">{pct.toFixed(0)}%</span>
                    </div>

                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar-fill ${pct > 100 ? 'warning-critical' : pct > 80 ? 'warning-medium' : 'warning-light'}`}
                        style={{ 
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: pct === 0 ? 'transparent' : (pct > 100 ? 'var(--rose-500)' : pct > 80 ? 'var(--amber-500)' : cat.color)
                        }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: remaining < 0 ? 'var(--rose-600)' : 'var(--slate-600)' }}>
                      <span>{remaining < 0 ? 'Exceeded by' : 'Remaining'}</span>
                      <span>₹{Math.abs(remaining).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Insights & Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Insights Widget */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💡</span> Spending Insights
            </h2>
            <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeInsights.length === 0 ? (
                <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', textAlign: 'center' }}>
                  Insights will appear here once you enter expenses.
                </p>
              ) : (
                <div className="insights-alerts-list">
                  {activeInsights.map((ins, idx) => (
                    <div 
                      key={idx} 
                      className={`insight-alert-item ${
                        ins.type === 'danger' ? 'insight-red' : 
                        ins.type === 'warning' ? 'insight-yellow' : 
                        ins.type === 'success' ? 'insight-green' : 'insight-blue'
                      }`}
                    >
                      <span className="insight-icon">{ins.icon}</span>
                      <span className="insight-item-text">{ins.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Simulation Widget */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎯</span> What If I Spend...?
            </h2>
            
            <div className="card" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSimulate} className="sim-container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Choose Category</label>
                    <select 
                      value={simCategory} 
                      onChange={(e) => {
                        setSimCategory(e.target.value);
                        setSimResult(null);
                      }}
                      className="form-input"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Simulated Spent (₹)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="e.g. 500"
                        value={simAmount}
                        onChange={(e) => {
                          setSimAmount(e.target.value);
                          setSimResult(null);
                        }}
                        className="form-input"
                      />
                      <button type="submit" className="btn btn-primary">Check</button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Simulation Result */}
              {simResult && (
                <div className="sim-results" style={{ marginTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-600)', display: 'block', marginBottom: '0.75rem' }}>
                    Simulation Impact
                  </span>
                  
                  <div className="sim-comparison-grid">
                    <div className="sim-col">
                      <span className="sim-col-title">Before</span>
                      <div className="sim-bar-label">
                        <span>₹{simResult.beforeSpent}</span>
                        <span>{((simResult.beforeSpent / simResult.allocated) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar-container" style={{ height: '6px' }}>
                        <div className="progress-bar-fill warning-light" style={{ 
                          width: `${Math.min((simResult.beforeSpent / simResult.allocated) * 100, 100)}%`,
                          backgroundColor: simResult.color 
                        }}></div>
                      </div>
                    </div>
                    
                    <div className="sim-col">
                      <span className="sim-col-title">After</span>
                      <div className="sim-bar-label">
                        <span>₹{simResult.afterSpent}</span>
                        <span style={{ color: simResult.isOver ? 'var(--rose-600)' : 'inherit', fontWeight: 'bold' }}>
                          {((simResult.afterSpent / simResult.allocated) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="progress-bar-container" style={{ height: '6px' }}>
                        <div className={`progress-bar-fill ${simResult.isOver ? 'warning-critical' : 'warning-light'}`} style={{ 
                          width: `${Math.min((simResult.afterSpent / simResult.allocated) * 100, 100)}%`,
                          backgroundColor: simResult.isOver ? 'var(--rose-500)' : simResult.color 
                        }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'flex-start',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    background: simResult.isOver ? 'var(--rose-50)' : 'var(--emerald-50)',
                    color: simResult.isOver ? 'var(--rose-600)' : 'var(--emerald-600)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 500
                  }}>
                    <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      {simResult.isOver ? (
                        `⚠️ This would put your ${simResult.categoryName} category OVER budget by ₹${simResult.overrun}! Limit: ₹${simResult.allocated}.`
                      ) : (
                        `🟢 Safe to spend! You will still have ₹${simResult.allocated - simResult.afterSpent} remaining in your ${simResult.categoryName} budget.`
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

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
                    placeholder="e.g. Grocery store, subway dinner"
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
