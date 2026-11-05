import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  Settings, 
  TrendingUp, 
  UserCircle2, 
  Wallet,
  LogOut
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import BudgetSettings from './components/BudgetSettings';
import Insights from './components/Insights';
import Profile from './components/Profile';

export default function App() {
  const [view, setView] = useState('landing'); // landing, onboarding, dashboard, expenses, budget, insights, profile
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  // Core Budget State
  const [user, setUser] = useState({
    name: '',
    email: '',
    college: '',
    isLoggedIn: false
  });
  const [totalBudget, setTotalBudget] = useState(0);
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Load state on mount
  useEffect(() => {
    const localData = localStorage.getItem('wheredidmymoneygo_state');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        setUser(parsed.user || { name: '', email: '', college: '', isLoggedIn: false });
        setTotalBudget(parsed.totalBudget || 0);
        setBudgetPeriod(parsed.budgetPeriod || 'monthly');
        setCategories(parsed.categories || []);
        setExpenses(parsed.expenses || []);
        setIsOnboarded(parsed.isOnboarded || false);
        setView(parsed.isOnboarded ? 'dashboard' : 'landing');
      } catch (err) {
        console.error("Error loading local storage data", err);
      }
    }
  }, []);

  // Save state helper
  const saveStateToLocalStorage = (newState) => {
    localStorage.setItem('wheredidmymoneygo_state', JSON.stringify({
      user: newState.user ?? user,
      totalBudget: newState.totalBudget ?? totalBudget,
      budgetPeriod: newState.budgetPeriod ?? budgetPeriod,
      categories: newState.categories ?? categories,
      expenses: newState.expenses ?? expenses,
      isOnboarded: newState.isOnboarded ?? isOnboarded
    }));
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (data) => {
    setUser({ ...data.user, isLoggedIn: true });
    setTotalBudget(data.totalBudget);
    setBudgetPeriod(data.budgetPeriod);
    setCategories(data.categories);
    setExpenses([]);
    setIsOnboarded(true);
    setView('dashboard');

    saveStateToLocalStorage({
      user: { ...data.user, isLoggedIn: true },
      totalBudget: data.totalBudget,
      budgetPeriod: data.budgetPeriod,
      categories: data.categories,
      expenses: [],
      isOnboarded: true
    });
  };

  // Add Expense
  const handleAddExpense = (newExp) => {
    const updatedExpenses = [
      ...expenses,
      {
        id: `exp_${Date.now()}`,
        ...newExp
      }
    ];
    setExpenses(updatedExpenses);
    saveStateToLocalStorage({ expenses: updatedExpenses });
  };

  // Delete Expense
  const handleDeleteExpense = (id) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);
    saveStateToLocalStorage({ expenses: updatedExpenses });
  };

  // Save Settings Changes
  const handleSaveSettings = (settingsData) => {
    setTotalBudget(settingsData.totalBudget);
    setBudgetPeriod(settingsData.budgetPeriod);
    setCategories(settingsData.categories);
    setView('dashboard');

    saveStateToLocalStorage({
      totalBudget: settingsData.totalBudget,
      budgetPeriod: settingsData.budgetPeriod,
      categories: settingsData.categories
    });
  };

  // Start fresh (wipe storage, return to landing page)
  const handleResetApp = () => {
    localStorage.removeItem('wheredidmymoneygo_state');
    
    // Reset to defaults
    setUser({ name: '', email: '', college: '', isLoggedIn: false });
    setTotalBudget(0);
    setBudgetPeriod('monthly');
    setCategories([]);
    setExpenses([]);
    setIsOnboarded(false);
    setView('landing');
  };

  // Render Sub views
  const renderActiveView = () => {
    switch (view) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={() => setView('onboarding')}
            onLoginGoogle={() => setView('onboarding')}
          />
        );
      case 'onboarding':
        return (
          <Onboarding 
            onComplete={handleOnboardingComplete}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            totalBudget={totalBudget}
            budgetPeriod={budgetPeriod}
            categories={categories}
            expenses={expenses}
            onAddExpense={handleAddExpense}
          />
        );
      case 'expenses':
        return (
          <Expenses 
            categories={categories}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'budget':
        return (
          <BudgetSettings 
            totalBudget={totalBudget}
            budgetPeriod={budgetPeriod}
            categories={categories}
            onSave={handleSaveSettings}
          />
        );
      case 'insights':
        return (
          <Insights 
            categories={categories}
            expenses={expenses}
            totalBudget={totalBudget}
            budgetPeriod={budgetPeriod}
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user}
            totalBudget={totalBudget}
            budgetPeriod={budgetPeriod}
            categories={categories}
            onResetApp={handleResetApp}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  // Render Onboarding or Landing pages full screen
  if (!isOnboarded || view === 'landing' || view === 'onboarding') {
    return renderActiveView();
  }

  // Sidebar link items config
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
    { id: 'budget', label: 'Budget Plan', icon: Settings },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: UserCircle2 },
  ];

  return (
    <div className="app-container">
      
      {/* Sidebar - Desktop Layout */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">💸</div>
          <div className="brand-name">
            Where Did My<br />
            <span style={{ fontSize: '0.8rem', color: 'var(--indigo-600)' }}>Money Go?</span>
          </div>
        </div>
        
        <ul className="nav-links">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <a 
                  className={`nav-link ${view === item.id ? 'active' : ''}`}
                  onClick={() => setView(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-profile">
          <div className="avatar">
            {user.name ? user.name[0] : 'U'}
          </div>
          <div className="avatar-info">
            <span className="avatar-name">{user.name || 'Student'}</span>
            <span className="avatar-email">{user.email || ''}</span>
          </div>
          <button 
            onClick={handleResetApp} 
            title="Start Fresh / Reset Data" 
            style={{ 
              marginLeft: 'auto', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile Layout */}
      <nav className="mobile-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <a 
              key={item.id}
              className={`mobile-nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label.split(' ')[0]}</span>
            </a>
          );
        })}
      </nav>

      {/* Main Content View Panel */}
      <main className="main-content">
        {renderActiveView()}
      </main>

    </div>
  );
}
