import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { categoryLibrary } from '../data/categoryLibrary';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1); // 1: Google Login, 2: Budget Setting, 3: Categories, 4: Priorities, 5: Allocation
  
  // State for onboarding data
  const [user, setUser] = useState({
    name: '',
    email: '',
    college: '',
    isLoggedIn: false
  });
  
  const [totalBudget, setTotalBudget] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  const [targetCategoryCount, setTargetCategoryCount] = useState(3);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [categoryPriorities, setCategoryPriorities] = useState({});
  const [allocations, setAllocations] = useState({});
  const [isManualAdjust, setIsManualAdjust] = useState(false);
  
  // Custom category form state
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('⭐');
  const [customColor, setCustomColor] = useState('#8b5cf6'); // Default purple
  
  // Flatten predefined categories into a simple lookup array/object
  const allPredefinedCategories = Object.values(categoryLibrary).flatMap(group => group.items);
  
  // Get active categories list (predefined + custom)
  const getActiveCategories = () => {
    const active = [];
    selectedCategoryIds.forEach(id => {
      const found = allPredefinedCategories.find(c => c.id === id);
      if (found) {
        // Find parent group color
        const groupKey = Object.keys(categoryLibrary).find(key => 
          categoryLibrary[key].items.some(item => item.id === id)
        );
        const groupColor = groupKey ? categoryLibrary[groupKey].color : '#6b7280';
        const groupBgTint = groupKey ? categoryLibrary[groupKey].bgTint : 'rgba(107, 114, 128, 0.1)';
        
        active.push({
          ...found,
          color: groupColor,
          bgTint: groupBgTint
        });
      }
    });
    
    // Add custom categories
    customCategories.forEach(c => {
      active.push(c);
    });
    
    return active;
  };

  // Handle Google Login Simulation
  const handleGoogleLogin = (mockName, mockEmail) => {
    setUser(prev => ({ ...prev, name: mockName, email: mockEmail, isLoggedIn: true }));
    setStep(2);
  };
  
  // Handle Category Toggle
  const toggleCategory = (id) => {
    if (selectedCategoryIds.includes(id)) {
      setSelectedCategoryIds(prev => prev.filter(item => item !== id));
    } else {
      // Only allow adding if we haven't reached the target count
      if (getActiveCategories().length < targetCategoryCount) {
        setSelectedCategoryIds(prev => [...prev, id]);
      }
    }
  };
  
  // Add Custom Category
  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    
    const newId = `custom_${Date.now()}`;
    const newCat = {
      id: newId,
      name: customName.trim(),
      emoji: customEmoji || '⭐',
      color: customColor,
      bgTint: `${customColor}15`, // Add opacity hex
      isCustom: true
    };
    
    if (getActiveCategories().length >= targetCategoryCount) return;

    setCustomCategories(prev => [...prev, newCat]);
    setCustomName('');
    setCustomEmoji('⭐');
  };
  
  // Delete Custom Category
  const handleDeleteCustom = (id) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  };
  
  // Initialize Priorities on Step 4
  useEffect(() => {
    if (step === 4) {
      const active = getActiveCategories();
      const updatedPriorities = { ...categoryPriorities };
      
      active.forEach(cat => {
        if (!updatedPriorities[cat.id]) {
          // Pre-set some defaults to make it faster
          if (cat.id === 'groceries' || cat.id === 'books' || cat.id === 'college' || cat.id === 'household') {
            updatedPriorities[cat.id] = 'HIGH';
          } else if (cat.id === 'food' || cat.id === 'fitness' || cat.id === 'cafes') {
            updatedPriorities[cat.id] = 'MEDIUM';
          } else {
            updatedPriorities[cat.id] = 'LOW';
          }
        }
      });
      setCategoryPriorities(updatedPriorities);
    }
  }, [step]);
  
  // Run Auto Allocation Algorithm on Step 5
  useEffect(() => {
    if (step === 5 && !isManualAdjust) {
      calculateAutoAllocation();
    }
  }, [step, isManualAdjust, totalBudget]);
  
  const calculateAutoAllocation = () => {
    const active = getActiveCategories();
    if (active.length === 0) return;
    
    // Priority weights: HIGH = 3, MEDIUM = 2, LOW = 1
    const priorityWeights = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };
    
    // Calculate total weights
    let totalWeight = 0;
    active.forEach(cat => {
      const p = categoryPriorities[cat.id] || 'MEDIUM';
      totalWeight += priorityWeights[p];
    });
    
    // Calculate unrounded allocations
    let roundedAllocations = {};
    let sumAllocated = 0;
    
    active.forEach(cat => {
      const p = categoryPriorities[cat.id] || 'MEDIUM';
      const weight = priorityWeights[p];
      const share = (weight / totalWeight) * totalBudget;
      
      // Round to nearest ₹50 or ₹100 for clean numbers
      const roundFactor = totalBudget >= 5000 ? 100 : 50;
      const rounded = Math.round(share / roundFactor) * roundFactor;
      
      roundedAllocations[cat.id] = rounded;
      sumAllocated += rounded;
    });
    
    // Handle rounding remainder
    let diff = totalBudget - sumAllocated;
    if (diff !== 0) {
      // Find category with highest priority to apply remainder
      // If tie, apply to first category
      const highestPriorityCat = active.reduce((highest, current) => {
        const hp = priorityWeights[categoryPriorities[highest.id] || 'MEDIUM'];
        const cp = priorityWeights[categoryPriorities[current.id] || 'MEDIUM'];
        return cp > hp ? current : highest;
      }, active[0]);
      
      if (highestPriorityCat) {
        roundedAllocations[highestPriorityCat.id] += diff;
      }
    }
    
    setAllocations(roundedAllocations);
  };
  
  // Handle Manual Allocation Input Changes
  const handleAllocationChange = (catId, val) => {
    const numVal = parseInt(val) || 0;
    setAllocations(prev => ({
      ...prev,
      [catId]: numVal
    }));
  };
  
  // Validate allocations
  const sumOfAllocations = Object.values(allocations).reduce((a, b) => a + b, 0);
  const isBalanced = sumOfAllocations === totalBudget;
  
  const handleProceed = () => {
    if (step === 2 && (totalBudget === '' || totalBudget < 1000)) return;
    if (step === 3 && getActiveCategories().length !== targetCategoryCount) return;
    if (step === 5 && !isBalanced) return;
    
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      // Complete onboarding and pass data
      const activeCats = getActiveCategories().map(cat => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        bgTint: cat.bgTint,
        allocated: allocations[cat.id] || 0,
        priority: categoryPriorities[cat.id] || 'MEDIUM',
        isCustom: cat.isCustom || false
      }));
      
      onComplete({
        user,
        totalBudget,
        budgetPeriod,
        categories: activeCats,
        expenses: [] // starts fresh
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        
        {/* Progress Dots */}
        {step > 1 && (
          <div className="onboarding-steps-bar">
            <div className="onboarding-steps-line"></div>
            {[2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`onboarding-step-dot ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}
              >
                {step > s ? <Check size={14} /> : s - 1}
              </div>
            ))}
          </div>
        )}
        
        {/* Step 1: Google Login */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="onboarding-header">
              <span className="brand-icon" style={{ margin: '0 auto 1.5rem auto' }}>💰</span>
              <h1 className="onboarding-title">Where Did My Money Go?</h1>
              <p className="onboarding-subtitle">Log in to create your personal student dashboard.</p>
            </div>
            
            <div className="google-login-box">
              <button className="google-account-btn" onClick={() => handleGoogleLogin('Alex Smith', 'alex.smith@college.edu')}>
                <div className="google-avatar" style={{ background: '#3b82f6' }}>A</div>
                <div className="google-info">
                  <span className="google-name">Alex Smith</span>
                  <span className="google-email">alex.smith@college.edu</span>
                </div>
                <div className="google-logo-icon">🔑</div>
              </button>
              
              <button className="google-account-btn" onClick={() => handleGoogleLogin('Priya Sharma', 'priya.sharma@gmail.com')}>
                <div className="google-avatar" style={{ background: '#10b981' }}>P</div>
                <div className="google-info">
                  <span className="google-name">Priya Sharma (Personal)</span>
                  <span className="google-email">priya.sharma@gmail.com</span>
                </div>
                <div className="google-logo-icon">🔑</div>
              </button>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', textAlign: 'center', marginTop: '1rem' }}>
                Note: In this MVP version, authentication is simulated using your browser's local sandbox storage.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Budget Setting */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="onboarding-header">
              <h1 className="onboarding-title">How much are you managing?</h1>
              <p className="onboarding-subtitle">Decide your total budget and planning cycle.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button 
                  className={`btn ${budgetPeriod === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '1.25rem' }}
                  onClick={() => setBudgetPeriod('weekly')}
                >
                  Weekly Budget
                </button>
                <button 
                  className={`btn ${budgetPeriod === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '1.25rem' }}
                  onClick={() => setBudgetPeriod('monthly')}
                >
                  Monthly Budget
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
                  Enter Overall Amount (₹)
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '2px solid var(--slate-200)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '0.75rem 1.5rem',
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'white'
                }}>
                  <span style={{ color: 'var(--slate-400)', marginRight: '0.5rem' }}>₹</span>
                  <input 
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    style={{ border: 'none', width: '100%', outline: 'none', fontWeight: 800 }}
                    min="0"
                  />
                </div>
                {totalBudget !== '' && totalBudget < 1000 && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', color: 'var(--amber-600)', fontSize: '0.85rem' }}>
                    <ShieldAlert size={16} />
                    <span>Budgets below ₹1,000 may not provide meaningful category-level insights.</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={handleBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={handleProceed} disabled={totalBudget === '' || totalBudget < 1000}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Category Selection */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="onboarding-header">
              <h1 className="onboarding-title">Where does your money usually go?</h1>
              <p className="onboarding-subtitle">Select the categories you'd like to plan for.</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--slate-100)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Target category count:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary btn-icon btn-sm"
                  onClick={() => setTargetCategoryCount(prev => Math.max(1, prev - 1))}
                  disabled={targetCategoryCount <= getActiveCategories().length}
                >-</button>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '1.5rem', textAlign: 'center' }}>{targetCategoryCount}</span>
                <button 
                  className="btn btn-secondary btn-icon btn-sm"
                  onClick={() => setTargetCategoryCount(prev => prev + 1)}
                >+</button>
              </div>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              <div className="cat-picker-grid">
                {Object.entries(categoryLibrary).map(([key, group]) => (
                  <div key={key} className="cat-picker-group">
                    <span className="cat-picker-title" style={{ color: group.color }}>
                      {group.title}
                    </span>
                    <div className="cat-pill-container">
                      {group.items.map(item => {
                        const isSelected = selectedCategoryIds.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            className={`cat-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleCategory(item.id)}
                          >
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Category Section */}
            <form onSubmit={handleAddCustomCategory} className="card glass-panel" style={{ padding: '1rem', border: '1px solid var(--slate-200)', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-600)', display: 'block', marginBottom: '0.5rem' }}>
                ➕ Create Custom Category
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="text"
                  placeholder="e.g. Laundry, Cafe study"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem' }}
                />
                
                <input 
                  type="text" 
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Emoji" 
                  className="form-input"
                  style={{ width: '60px', padding: '0.5rem 0.25rem', textAlign: 'center' }}
                />

                <input 
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-xs)', padding: '0', cursor: 'pointer' }}
                />
                
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1rem' }} disabled={getActiveCategories().length >= targetCategoryCount}>Add</button>
              </div>
              
              {customCategories.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {customCategories.map(c => (
                    <span key={c.id} className="cat-pill selected" style={{ background: c.bgTint, borderColor: c.color, color: c.color }}>
                      {c.emoji} {c.name}
                      <Trash2 size={12} style={{ marginLeft: '0.35rem', cursor: 'pointer' }} onClick={() => handleDeleteCustom(c.id)} />
                    </span>
                  ))}
                </div>
              )}
            </form>
            
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: getActiveCategories().length === targetCategoryCount ? 'var(--emerald-600)' : 'var(--slate-600)', marginBottom: '1rem' }}>
              <span>Selected: {getActiveCategories().length} of {targetCategoryCount} categories</span>
              {getActiveCategories().length === targetCategoryCount && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={14} /> Perfect!</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleProceed} 
                disabled={getActiveCategories().length !== targetCategoryCount}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Priority System */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="onboarding-header">
              <h1 className="onboarding-title">How important is each category to you?</h1>
              <p className="onboarding-subtitle">Your priorities help us suggest how your budget could be divided.</p>
            </div>
            
            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '2rem' }}>
              <div className="priority-list">
                {getActiveCategories().map(cat => {
                  const currentPriority = categoryPriorities[cat.id] || 'MEDIUM';
                  return (
                    <div key={cat.id} className="priority-row">
                      <div className="priority-cat-info">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="priority-options">
                        {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                          <button
                            key={p}
                            className={`priority-btn ${currentPriority === p ? `selected ${p}` : ''}`}
                            onClick={() => setCategoryPriorities(prev => ({ ...prev, [cat.id]: p }))}
                          >
                            {p === 'HIGH' ? '🔴 High' : p === 'MEDIUM' ? '🟡 Medium' : '🟢 Low'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="btn btn-primary" onClick={handleProceed}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Automatic Budget Allocation */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="onboarding-header">
              <h1 className="onboarding-title">Suggested Budget split</h1>
              <p className="onboarding-subtitle">Here is how we divided your ₹{totalBudget} based on priorities.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                className={`btn btn-sm ${!isManualAdjust ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setIsManualAdjust(false);
                  calculateAutoAllocation();
                }}
              >
                Suggested Split
              </button>
              <button 
                className={`btn btn-sm ${isManualAdjust ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setIsManualAdjust(true)}
              >
                Adjust Manually
              </button>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
              <div className="allocation-list">
                {getActiveCategories().map(cat => {
                  const amt = allocations[cat.id] || 0;
                  const priority = categoryPriorities[cat.id] || 'MEDIUM';
                  return (
                    <div key={cat.id} className="allocation-row">
                      <div className="allocation-slider-container">
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                          <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span>{cat.emoji}</span>
                            <span>{cat.name}</span>
                          </span>
                          <span className={`priority-badge priority-${priority}`} style={{ fontSize: '0.65rem' }}>
                            {priority}
                          </span>
                        </div>
                        {isManualAdjust ? (
                          <input 
                            type="range"
                            min="0"
                            max={totalBudget}
                            step="50"
                            value={amt}
                            onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--indigo-600)' }}
                          />
                        ) : (
                          <div className="progress-bar-container" style={{ height: '6px', marginTop: '0.5rem' }}>
                            <div className="progress-bar-fill warning-light" style={{ 
                              width: `${(amt / totalBudget) * 100}%`,
                              backgroundColor: cat.color 
                            }}></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="allocation-input-box">
                        <span className="allocation-currency">₹</span>
                        <input
                          type="number"
                          value={amt}
                          onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
                          disabled={!isManualAdjust}
                          className="allocation-input"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Allocation Balance Check */}
            <div className={`balance-card ${isBalanced ? 'balance-exact' : sumOfAllocations < totalBudget ? 'balance-unallocated' : 'balance-over'}`}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ShieldAlert size={18} />
                <span>
                  {isBalanced ? (
                    'Looks good! Your budget sums up perfectly.'
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleProceed}
                disabled={!isBalanced}
              >
                Let's Go! <Check size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
