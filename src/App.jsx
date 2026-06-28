import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import InvoicesPage from './pages/InvoicesPage';
import CustomersPage from './pages/CustomersPage';
import LoginPage from './pages/LoginPage';
import { useCheckAuthQuery, useLogoutMutation } from './store/api/authApi';
import './index.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'invoices', label: 'Invoices', icon: '📄' },
  { key: 'customers', label: 'Customers', icon: '👥' },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const { data: user, isLoading: authLoading, refetch: refetchAuth } = useCheckAuthQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.csrf_token = '';
      window.location.reload();
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'invoices':
        return <InvoicesPage />;
      case 'customers':
        return <CustomersPage />;
      default:
        return <Dashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-lg font-medium text-blue-600">Loading App...</span>
      </div>
    );
  }

  // Check if authenticated (in Frappe, 'Guest' means not logged in)
  const isAuthenticated = user && user.message && user.message !== 'Guest';

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={refetchAuth} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">InvoiceTracker</h2>
          </div>
          <nav className="mt-4 px-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activePage === item.key 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-500 truncate max-w-[120px]">{user.message}</p>
            <button 
              onClick={handleLogout} 
              className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Frappe Backend</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-xs font-medium text-green-700">Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
