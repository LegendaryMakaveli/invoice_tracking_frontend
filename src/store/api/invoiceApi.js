import { baseApi } from './baseApi';

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.get_dashboard',
      transformResponse: (response) => response.message,
      providesTags: ['Dashboard'],
    }),

    getUnpaidInvoices: builder.query({
      query: () => 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.get_unpaid_invoices',
      transformResponse: (response) => response.message,
      providesTags: ['UnpaidInvoices'],
    }),

    getInvoiceSummary: builder.query({
      query: () => 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.get_invoice_summary',
      transformResponse: (response) => response.message,
      providesTags: ['InvoiceSummary'],
    }),

    getCustomerInvoices: builder.query({
      query: (customer) => ({
        url: 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.get_customer_invoices',
        params: { customer },
      }),
      transformResponse: (response) => response.message,
      providesTags: ['Invoices'],
    }),

    filterInvoicesByDate: builder.query({
      query: ({ from_date, to_date, status }) => ({
        url: 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.filter_invoices_by_date',
        params: { from_date, to_date, ...(status && { status }) },
      }),
      transformResponse: (response) => response.message,
      providesTags: ['Invoices'],
    }),

    markAsPaid: builder.mutation({
      query: (invoice_name) => ({
        url: 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.mark_as_paid',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ invoice_name }).toString(),
      }),
      transformResponse: (response) => response.message,
      invalidatesTags: ['Dashboard', 'UnpaidInvoices', 'Invoices', 'InvoiceSummary'],
    }),

    // Custom whitelisted method for creating invoices
    createInvoice: builder.mutation({
      query: ({ customer, invoice, status, items }) => ({
        url: 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.create_invoice',
        method: 'POST',
        body: { customer, invoice, status, items: JSON.stringify(items) },
      }),
      transformResponse: (response) => response.message,
      invalidatesTags: ['Dashboard', 'UnpaidInvoices', 'Invoices', 'InvoiceSummary'],
    }),

    submitInvoice: builder.mutation({
      query: (invoice_name) => ({
        url: 'method/invoice_tracking_app.invoice_tracking_app.doctype.invoice.invoice.submit_invoice',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ invoice_name }).toString(),
      }),
      transformResponse: (response) => response.message,
      invalidatesTags: ['Dashboard', 'UnpaidInvoices', 'Invoices', 'InvoiceSummary'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetUnpaidInvoicesQuery,
  useGetInvoiceSummaryQuery,
  useGetCustomerInvoicesQuery,
  useFilterInvoicesByDateQuery,
  useMarkAsPaidMutation,
  useCreateInvoiceMutation,
  useSubmitInvoiceMutation,
} = invoiceApi;
