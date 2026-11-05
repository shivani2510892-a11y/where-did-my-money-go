import React, { useState, useEffect } from 'react';
import { Check, ShieldAlert, Sparkles, ArrowRight, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { categoryLibrary } from '../data/categoryLibrary';

export default function BudgetSettings({ 
  totalBudget: initialTotal, 
  budgetPeriod: initialPeriod, 
  categories: initialCategories, 
  onSave 
}) {
  const [totalBudget, setTotalBudget] = useState(initialTotal);
  const [budgetPeriod, setBudgetPeriod] = useState(initialPeriod);
  
  // Custom states tracking categories and values
  const [categories, setCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  
  // Forms state
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('⭐');
  const [customColor, setCustomColor] = useState('#8b5cf6');

  // Load initial settings
  useEffect(() => {
    // Separate predefined categories and custom ones
    const predefined = [];
    const custom = [];
    
    initialCategories.forEach(cat => {
      if (cat.isCustom) {
        custom.push(cat);
      } else {
        predefined.push(cat);
      }
    });
    
    setCategories(initialCategories);
    setCustomCategories(custom);
  }, [initialCategories]);

  // Priority weights: HIGH = 3, MEDIUM = 2, LOW = 1
  const priorityWeights = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  // Re-run Auto Allocation based on priorities and total budget
  const handleAutoRebalance = () => {
    if (categories.length === 0) return;
    
    let totalWeight = 0;
    categories.forEach(cat => {
      totalWeight += priorityWeights[cat.priority || 'MEDIUM'];
    });
    
    let sumAllocated = 0;
    const rebalanced = categories.map(cat => {
      const weight = priorityWeights[cat.priority || 'MEDIUM'];
      const share = (weight / totalWeight) * totalBudget;
      const roundFactor = totalBudget >= 5000 ? 100 : 50;
      const rounded = Math.round(share / roundFactor) * roundFactor;
      
      sumAllocated += rounded;
      return { ...cat, allocated: rounded };
    });
    
    // Remainder adjustment
    const diff = totalBudget - sumAllocated;
    if (diff !== 0) {
      // Find index of highest priority category
      let highestIdx = 0;
      let highestWeight = 0;
      
      rebalanced.forEach((cat, idx) => {
        const w = priorityWeights[cat.priority || 'MEDIUM'];
        if (w > highestWeight) {
          highestWeight = w;
          highestIdx = idx;
        }
      });
      
      rebalanced[highestIdx].allocated += diff;
    }
    
    setCategories(rebalanced);
  };

  // Handle Manual Allocation changes
  const handleAllocChange = (id, val) => {
    const num = parseInt(val) || 0;
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, allocated: num } : cat
    ));
  };

  // Handle Priority changes
  const handlePriorityChange = (id, newPriority) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, priority: newPriority } : cat
    ));
  };

  // Add custom category in settings
  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    
    const newId = `custom_${Date.now()}`;
    const newCat = {
      id: newId,
      name: customName.trim(),
      emoji: customEmoji || '⭐',
      color: customColor,
      bgTint: `${customColor}15`,
      allocated: 0,
      priority: 'MEDIUM',
      isCustom: true
    };
    
    setCategories(prev => [...prev, newCat]);
    setCustomCategories(prev => [...prev, newCat]);
    setCustomName('');
    setCustomEmoji('⭐');
  };

  // Remove category from settings
  const handleDeleteCategory = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setCustomCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Calculations
  const sumOfAllocations = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const isBalanced = sumOfAllocations === totalBudget;

  const handleSaveSettings = () => {
    if (!isBalanced) return;
    onSave({
      totalBudget,
      budgetPeriod,
      categories
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Budget Settings</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Plan where your money should go. Adjust splits and priorities.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleAutoRebalance}
            title="Auto-calculate distributions based on priorities"
          >
            <RotateCcw size={16} /> Auto Rebalance
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSaveSettings}
            disabled={!isBalanced}
            style={{ opacity: !isBalanced ? 0.6 : 1 }}
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Left Column: Overall parameters and Add custom category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Card 1: Parameters */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Overview Settings</h2>
            
            <div className="form-group">
              <label className="form-label">Plan Cycle</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${budgetPeriod === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setBudgetPeriod('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`btn btn-sm ${budgetPeriod === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setBudgetPeriod('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Total Budget (₹)</label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', fontWeight: 600, color: 'var(--slate-600)' }}>₹</span>
                <input 
                  type="number" 
                  value={totalBudget} 
                  onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)} 
                  className="form-input"
                  style={{ paddingLeft: '2rem', fontWeight: 700 }}
                  min="1000"
                />
              </div>
              {totalBudget < 1000 && (
                <span style={{ color: 'var(--rose-500)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Minimum budget is ₹1,000.
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Custom Category Creator */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add Custom Category</h2>
            
            <form onSubmit={handleAddCustom} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Subscriptions, Gifts"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-row" style={{ margin: 0 }}>
                <div>
                  <label className="form-label">Emoji</label>
                  <input 
                    type="text" 
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    className="form-input"
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label className="form-label">Theme Color</label>
                  <input 
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{ width: '100%', height: '38px', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: 0, cursor: 'pointer' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Create Category
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Category Adjustments & Balance Bar */}
        <div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Category Distributions</h2>
            
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexHeading: 'column', flexDirection: 'column', gap: '1rem' }}>
              {categories.map(cat => (
                <div key={cat.id} className="allocation-row" style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)' }}>
                  
                  {/* Category Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600 }}>
                        <span style={{ fontSize: '1.15rem' }}>{cat.emoji}</span>
                        <span>{cat.name}</span>
                        <Trash2 
                          size={14} 
                          style={{ color: 'var(--rose-500)', marginLeft: '0.5rem', cursor: 'pointer' }} 
                          onClick={() => handleDeleteCategory(cat.id)}
                          title="Remove category"
                        />
                      </span>
                      
                      {/* Priority toggle */}
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                          <button
                            key={p}
                            className={`priority-btn ${cat.priority === p ? `selected ${p}` : ''}`}
                            onClick={() => handlePriorityChange(cat.id, p)}
                            style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}
                          >
                            {p === 'HIGH' ? '🔴 H' : p === 'MEDIUM' ? '🟡 M' : '🟢 L'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <input 
                      type="range"
                      min="0"
                      max={totalBudget}
                      step="50"
                      value={cat.allocated}
                      onChange={(e) => handleAllocChange(cat.id, e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--indigo-600)', margin: '0.25rem 0' }}
                    />
                  </div>

                  {/* Allocated Cash Input Box */}
                  <div className="allocation-input-box" style={{ width: '90px', padding: '0.25rem 0.5rem' }}>
                    <span className="allocation-currency" style={{ fontSize: '0.85rem' }}>₹</span>
                    <input 
                      type="number"
                      value={cat.allocated}
                      onChange={(e) => handleAllocChange(cat.id, e.target.value)}
                      className="allocation-input"
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Balancing Alert Bar */}
            <div className={`balance-card ${isBalanced ? 'balance-exact' : sumOfAllocations < totalBudget ? 'balance-unallocated' : 'balance-over'}`}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ShieldAlert size={18} />
                <span>
                  {isBalanced ? (
                    'Looks good! Your budget matches exactly.'
                  ) : sumOfAllocations < totalBudget ? (
                    `₹${totalBudget - sumOfAllocations} unallocated of ₹${totalBudget}.`
                  ) : (
                    `Over budget by ₹${sumOfAllocations - totalBudget}!`
                  )}
                </span>
              </div>
              <span>
                ₹{sumOfAllocations} / ₹{totalBudget}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
