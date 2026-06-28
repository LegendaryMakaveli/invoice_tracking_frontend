import { useState } from 'react';
import {
  useGetUnpaidInvoicesQuery,
  useFilterInvoicesByDateQuery,
  useMarkAsPaidMutation,
  useCreateInvoiceMutation,
  useSubmitInvoiceMutation,
} from '../store/api/invoiceApi';
import { useGetCustomersQuery } from '../store/api/customerApi';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

function InvoicesPage() {
  const [filterMode, setFilterMode] = useState('unpaid');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSearch, setDateSearch] = useState(null);

  // Create invoice form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer: '',
    invoice: '',
    status: 'Draft',
  });
  const [items, setItems] = useState([{ item_name: '', quantity: 1, rate: 0 }]);

  const { data: customers } = useGetCustomersQuery();
  const [createInvoice, { isLoading: creating }] = useCreateInvoiceMutation();

  const {
    data: unpaidInvoices,
    isLoading: unpaidLoading,
  } = useGetUnpaidInvoicesQuery(undefined, { skip: filterMode !== 'unpaid' });

  const {
    data: filteredInvoices,
    isLoading: filteredLoading,
    isFetching: filteredFetching,
  } = useFilterInvoicesByDateQuery(dateSearch, { skip: !dateSearch || filterMode !== 'date' });

  const [markAsPaid, { isLoading: marking }] = useMarkAsPaidMutation();
  const [submitInvoice, { isLoading: submitting }] = useSubmitInvoiceMutation();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { item_name: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInvoice({ ...form, items }).unwrap();
      setForm({ customer: '', invoice: '', status: 'Draft' });
      setItems([{ item_name: '', quantity: 1, rate: 0 }]);
      setShowForm(false);
    } catch (err) {
      alert(err?.data?._server_messages
        ? JSON.parse(JSON.parse(err.data._server_messages)[0]).message
        : 'Failed to create invoice.');
    }
  };

  const handleMarkPaid = async (name) => {
    try {
      await markAsPaid(name).unwrap();
    } catch (err) {
      alert(err?.data?._server_messages
        ? JSON.parse(JSON.parse(err.data._server_messages)[0]).message
        : 'Failed to mark invoice as paid.');
    }
  };

  const handleSubmitInvoice = async (name) => {
    try {
      await submitInvoice(name).unwrap();
    } catch (err) {
      alert(err?.data?._server_messages
        ? JSON.parse(JSON.parse(err.data._server_messages)[0]).message
        : 'Failed to submit invoice.');
    }
  };

  const handleDateFilter = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      alert('Please select both dates.');
      return;
    }
    setDateSearch({ from_date: fromDate, to_date: toDate, status: statusFilter || undefined });
    setFilterMode('date');
  };

  const invoices = filterMode === 'date' ? filteredInvoices : unpaidInvoices;
  const isLoading = filterMode === 'date' ? filteredLoading : unpaidLoading;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-slate-500 mt-1">View and manage all your invoices</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ New Invoice'}
        </button>
      </div>

      {/* New Invoice Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 transform origin-top transition-all">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Create New Invoice</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="customer">Customer *</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  id="customer"
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Customer</option>
                  {customers?.map((c) => (
                    <option key={c.name} value={c.name}>{c.first_name} {c.second_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="invoice">Invoice Date *</label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  type="date"
                  id="invoice"
                  name="invoice"
                  value={form.invoice}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="status">Status *</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Invoice Items Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Invoice Items</h4>
                <button type="button" onClick={addItem} className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors">
                  + Add Item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Item Name *</label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="text"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity *</label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="number"
                        step="any"
                        min="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Rate *</label>
                      <input
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="number"
                        step="any"
                        min="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-32 text-right">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Amount</label>
                      <p className="py-2 text-sm font-bold text-slate-700">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</p>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={creating}
              >
                {creating ? 'Saving...' : '✓ Save Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterMode === 'unpaid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => { setFilterMode('unpaid'); setDateSearch(null); }}
          >
            Unpaid Invoices
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterMode === 'date'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setFilterMode('date')}
          >
            Filter by Date
          </button>
        </div>

        {filterMode === 'date' && (
          <form className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 rounded-xl" onSubmit={handleDateFilter}>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1" htmlFor="from-date">From Date</label>
              <input
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="date"
                id="from-date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1" htmlFor="to-date">To Date</label>
              <input
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="date"
                id="to-date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1" htmlFor="status-filter">Status</label>
              <select
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={filteredFetching}
            >
              {filteredFetching ? 'Searching...' : '🔍 Search'}
            </button>
          </form>
        )}
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{filterMode === 'unpaid' ? 'Unpaid Invoices' : 'Filtered Invoices'}</h2>
          <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold">{invoices?.length || 0}</span>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-lg font-medium text-blue-600">Loading invoices...</span>
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-slate-500 font-medium text-lg">No invoices found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{inv.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{inv.customer_name || inv.customer}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{inv.invoice}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${inv.status === 'Submitted' ? 'bg-yellow-50 text-yellow-700' : inv.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'Draft' ? (
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                          onClick={() => handleSubmitInvoice(inv.name)}
                          disabled={submitting}
                        >
                          {submitting ? 'Processing...' : 'Submit'}
                        </button>
                      ) : inv.status === 'Submitted' ? (
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                          onClick={() => handleMarkPaid(inv.name)}
                          disabled={marking}
                        >
                          {marking ? 'Processing...' : '✓ Mark Paid'}
                        </button>
                      ) : inv.status === 'Paid' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700">Paid ✓</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600">Draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoicesPage;
