import { useGetDashboardQuery, useGetUnpaidInvoicesQuery, useMarkAsPaidMutation, useSubmitInvoiceMutation } from '../store/api/invoiceApi';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

function Dashboard() {
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useGetDashboardQuery();
  const { data: unpaid, isLoading: unpaidLoading } = useGetUnpaidInvoicesQuery();
  const [markAsPaid, { isLoading: marking }] = useMarkAsPaidMutation();
  const [submitInvoice, { isLoading: submitting }] = useSubmitInvoiceMutation();

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

  if (dashLoading || unpaidLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-lg font-medium text-blue-600">Loading Dashboard...</span>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
        <h3 className="font-bold text-lg mb-1">⚠️ Could not load dashboard</h3>
        <p>Make sure your Frappe backend is running and you are logged in.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your invoicing activity</p>
      </div>

      {/* Stats Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md overflow-hidden">
            <div className="bg-blue-100 p-3 rounded-xl text-xl flex-shrink-0">💰</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-base font-black text-green-800 truncate" title={formatCurrency(dashboard.total_revenue)}>{formatCurrency(dashboard.total_revenue)}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md overflow-hidden">
            <div className="bg-green-100 p-3 rounded-xl text-xl flex-shrink-0">👥</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Customers</p>
              <h3 className="text-base font-black text-slate-800 truncate">{dashboard.total_customers}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md overflow-hidden">
            <div className="bg-slate-100 p-3 rounded-xl text-xl flex-shrink-0">📄</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Invoices</p>
              <h3 className="text-base font-black text-slate-800 truncate">{dashboard.total_invoices}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md border-b-4 border-b-red-500 overflow-hidden">
            <div className="bg-red-100 p-3 rounded-xl text-xl flex-shrink-0">⏰</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overdue</p>
              <h3 className="text-base font-black text-slate-800 truncate">{dashboard.overdue_count}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {dashboard?.invoice_counts && (
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Draft: <strong>{dashboard.invoice_counts.Draft || 0}</strong>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full text-sm font-medium text-yellow-700 border border-yellow-100">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Submitted: <strong>{dashboard.invoice_counts.Submitted || 0}</strong>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full text-sm font-medium text-green-700 border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Paid: <strong>{dashboard.invoice_counts.Paid || 0}</strong>
          </div>
        </div>
      )}

      {/* Unpaid Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Unpaid Invoices</h2>
          <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold">{unpaid?.length || 0}</span>
        </div>
        <div className="overflow-x-auto">
          {!unpaid || unpaid.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3">🎉</span>
              <p className="text-slate-500 font-medium">All invoices are paid!</p>
            </div>
          ) : (
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
                {unpaid.map((inv) => (
                  <tr key={inv.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{inv.name}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.customer_name || inv.customer}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{inv.invoice}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${inv.status === 'Submitted' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
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
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600">Draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Overdue Invoices */}
      {dashboard?.overdue_invoices?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden mb-8">
          <div className="bg-red-50 px-6 py-5 border-b border-red-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">🚨 Overdue Invoices (&gt; 30 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.overdue_invoices.map((inv) => (
                  <tr key={inv.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{inv.name}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.customer_name || inv.customer}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{inv.invoice}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(inv.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
