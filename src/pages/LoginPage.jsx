import { useState } from 'react';
import { useLoginMutation } from '../store/api/authApi';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      onLoginSuccess();
    } catch (err) {
      alert(
        err?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-4xl">⚡</span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">InvoiceTracker</h2>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-700 mb-6 text-center">Sign in to your account</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
