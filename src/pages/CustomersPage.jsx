import { useState } from 'react';
import { useGetCustomersQuery, useCreateCustomerMutation } from '../store/api/customerApi';

function CustomersPage() {
  const { data: customers, isLoading, error } = useGetCustomersQuery();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    second_name: '',
    email: '',
    address: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(form).unwrap();
      setForm({ first_name: '', second_name: '', email: '', address: '' });
      setShowForm(false);
    } catch (err) {
      alert(err?.data?._server_messages
        ? JSON.parse(JSON.parse(err.data._server_messages)[0]).message
        : 'Failed to create customer.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-lg font-medium text-blue-600">Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
        <h3 className="font-bold text-lg mb-1">⚠️ Could not load customers</h3>
        <p>Make sure your Frappe backend is running and you are logged in.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 mt-1">Manage your customer directory</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ New Customer'}
        </button>
      </div>

      {/* New Customer Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 transform origin-top transition-all">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Customer</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="first_name">First Name *</label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="second_name">Last Name *</label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  type="text"
                  id="second_name"
                  name="second_name"
                  value={form.second_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">Email *</label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="address">Address</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="123 Main St, City"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-6">
              <button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Saving...' : '✓ Save Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">All Customers</h2>
          <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold">{customers?.length || 0}</span>
        </div>
        <div className="overflow-x-auto">
          {!customers || customers.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <span className="text-5xl mb-4">👤</span>
              <p className="text-slate-500 font-medium text-lg">No customers yet. Add your first customer above!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{cust.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{cust.first_name} {cust.second_name}</td>
                    <td className="px-6 py-4 text-slate-600">{cust.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">{cust.address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomersPage;
