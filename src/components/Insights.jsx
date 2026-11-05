import React, { useState } from 'react';
import { ArrowUpRight, TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Insights({ categories, expenses, totalBudget, budgetPeriod }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Group calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const overallUsedPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const categorySpentMap = categories.map(cat => {
    const spent = expenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      ...cat,
      spent,
      pct: cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0
    };
  });

  // Category spending with spent > 0
  const activeCategories = categorySpentMap.filter(c => c.spent > 0);
  const totalActiveSpent = activeCategories.reduce((sum, c) => sum + c.spent, 0);

  // SVG Donut Math
  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius; // ~502.65
  
  let accumulatedPercent = 0;
  const segments = activeCategories.map(cat => {
    const percent = totalActiveSpent > 0 ? (cat.spent / totalActiveSpent) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    
    // Calculate offset. Dash offsets start from circumference and count backward.
    const strokeDashoffset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percent;
    
    return {
      ...cat,
      percent,
      strokeDasharray,
      strokeDashoffset
    };
  });

  // Weekly Trend bar calculations (last 7 days)
  const getPastNDays = (n) => {
    const list = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  };

  const last7Days = getPastNDays(7);
  const dailySpentList = last7Days.map(dateStr => {
    const amount = expenses
      .filter(exp => exp.date === dateStr)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    // Format label as date (e.g. 12 Aug)
    const d = new Date(dateStr);
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    
    return {
      date: dateStr,
      label,
      amount
    };
  });

  const maxDailySpent = Math.max(...dailySpentList.map(d => d.amount), 0) || 1000;

  // Render Daily Bars
  const barChartWidth = 450;
  const barChartHeight = 160;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const chartInnerWidth = barChartWidth - paddingLeft - 20;
  const chartInnerHeight = barChartHeight - paddingBottom - 10;
  const barWidth = 30;
  const colGap = (chartInnerWidth - (barWidth * 7)) / 6;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Visual Insights</h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Deeper visual analytics and trends of your budget.</p>
      </div>

      {/* Overview Cards Row */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>
            Overall Budget Usage
          </span>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {overallUsedPct.toFixed(1)}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              ₹{totalSpent} of ₹{totalBudget}
            </span>
          </div>
          <div className="progress-bar-container" style={{ height: '6px', marginTop: '0.25rem' }}>
            <div 
              className={`progress-bar-fill ${overallUsedPct > 100 ? 'warning-critical' : overallUsedPct > 80 ? 'warning-medium' : 'warning-light'}`}
              style={{ width: `${Math.min(overallUsedPct, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>
            Category Health
          </span>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {categorySpentMap.filter(c => c.spent > c.allocated).length}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Categories over budget
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {categorySpentMap.filter(c => c.spent > c.allocated).length > 0 ? (
              <span style={{ color: 'var(--rose-500)', fontWeight: 600 }}>⚠️ Adjust splits or cut spending</span>
            ) : (
              <span style={{ color: 'var(--emerald-500)', fontWeight: 600 }}>🟢 All categories in safety limits</span>
            )}
          </span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>
            Average Transaction
          </span>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              ₹{expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              across {expenses.length} logs
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
            Planning cycle: {budgetPeriod === 'weekly' ? 'Weekly' : 'Monthly'}
          </span>
        </div>

      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Chart 1: Category Distribution Donut */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🍩</span> Category Outlay Share
          </h2>
          
          {totalSpent === 0 ? (
            <div className="chart-container-box" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'var(--slate-500)', fontSize: '1rem', fontWeight: 500 }}>No spending data yet</p>
              <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Add your first expense to see your spending patterns.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                <svg width="220" height="220" viewBox="0 0 200 200">
                  {/* Gray background circle */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r={radius} 
                    fill="none" 
                    stroke="var(--slate-100)" 
                    strokeWidth={strokeWidth} 
                  />
                  
                  {/* Dynamic segment slices */}
                  {segments.map((seg, idx) => (
                    <circle
                      key={seg.id}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      transform="rotate(-90 100 100)" // Start from top
                      strokeLinecap="round"
                      className="svg-donut-segment"
                      onMouseEnter={() => setHoveredSegment(seg)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  ))}
                </svg>

                {/* Donut Center Info */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  {hoveredSegment ? (
                    <>
                      <span style={{ fontSize: '1.25rem' }}>{hoveredSegment.emoji}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>{hoveredSegment.name}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{hoveredSegment.spent}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{hoveredSegment.percent.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>Total Spent</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800 }}>₹{totalSpent}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{expenses.length} expenses</span>
                    </>
                  )}
                </div>
              </div>

              {/* Legends on Side */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
                {categorySpentMap.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                      <span>{cat.emoji} {cat.name}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>₹{cat.spent}</span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Chart 2: Daily Spending Bar Chart */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📈</span> Last 7 Days Trend
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            
            {totalSpent === 0 ? (
              <div className="chart-container-box" style={{ width: '100%', height: barChartHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--slate-500)', fontSize: '1rem', fontWeight: 500 }}>No spending data yet</p>
                <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Add your first expense to see your spending patterns.</p>
              </div>
            ) : (
              <>
                {/* SVG Responsive Bar Chart */}
                <svg width="100%" height={barChartHeight} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}>
              {/* Y Axis Guide Lines */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = paddingBottom + chartInnerHeight * (1 - ratio);
                const amt = Math.round(maxDailySpent * ratio);
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={barChartWidth - 20} 
                      y2={y} 
                      stroke="var(--slate-100)" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 4} 
                      fill="var(--slate-400)" 
                      fontSize="9" 
                      fontWeight="bold" 
                      textAnchor="end"
                    >
                      ₹{amt >= 1000 ? `${(amt / 1000).toFixed(1)}k` : amt}
                    </text>
                  </g>
                );
              })}

              {/* Day Bars */}
              {dailySpentList.map((day, idx) => {
                const x = paddingLeft + (idx * (barWidth + colGap)) + colGap / 2;
                const barHeight = (day.amount / maxDailySpent) * chartInnerHeight;
                const y = barChartHeight - paddingBottom - barHeight;

                return (
                  <g key={day.date}>
                    {/* Background Bar trigger */}
                    <rect
                      x={x - colGap/4}
                      y={10}
                      width={barWidth + colGap/2}
                      height={chartInnerHeight}
                      fill="transparent"
                      cursor="pointer"
                      onMouseEnter={() => setHoveredBar(day)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    
                    {/* Actual colored bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#indigoGrad)"
                      rx="4"
                      ry="4"
                      cursor="pointer"
                      style={{ transition: 'height 0.4s ease, y 0.4s ease' }}
                      onMouseEnter={() => setHoveredBar(day)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* X axis Date Label */}
                    <text
                      x={x + barWidth / 2}
                      y={barChartHeight - 10}
                      fill="var(--slate-600)"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {day.label.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Base line */}
              <line 
                x1={paddingLeft} 
                y1={barChartHeight - paddingBottom} 
                x2={barChartWidth - 20} 
                y2={barChartHeight - paddingBottom} 
                stroke="var(--slate-200)" 
                strokeWidth="1.5" 
              />

              {/* Definitions for Gradients */}
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--indigo-400)" />
                  <stop offset="100%" stopColor="var(--indigo-600)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover Bar tooltip */}
            {hoveredBar && (
              <div 
                className="chart-tooltip"
                style={{ 
                  position: 'absolute',
                  top: '15px',
                  background: 'var(--slate-900)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.75rem',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <strong>{hoveredBar.label}</strong>: ₹{hoveredBar.amount.toLocaleString()}
              </div>
            )}

            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.5rem', fontWeight: 500 }}>
              Hover over bars to check daily spent totals.
            </p>
            </>
            )}
          </div>

        </div>

      </div>

      {/* Category breakdown listing */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🧾</span> Split Allocation Details
        </h2>
        
        <div className="table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Priority</th>
                <th>Allocated Budget</th>
                <th>Actual Spent</th>
                <th>Status / Used</th>
              </tr>
            </thead>
            <tbody>
              {categorySpentMap.map(cat => {
                const ratio = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
                const isOver = cat.spent > cat.allocated;
                return (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600 }}>
                      {cat.emoji} {cat.name}
                    </td>
                    <td>
                      <span className={`priority-badge priority-${cat.priority}`}>
                        {cat.priority}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{cat.allocated.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{cat.spent.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: isOver ? 'var(--rose-600)' : ratio > 80 ? 'var(--amber-600)' : 'var(--emerald-600)',
                          fontSize: '0.85rem'
                        }}>
                          {ratio.toFixed(0)}%
                        </span>
                        
                        <div className="progress-bar-container" style={{ width: '80px', height: '6px' }}>
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: `${Math.min(ratio, 100)}%`,
                              backgroundColor: isOver ? 'var(--rose-500)' : ratio > 80 ? 'var(--amber-500)' : 'var(--emerald-500)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
