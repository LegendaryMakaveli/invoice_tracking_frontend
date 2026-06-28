import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = '/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      headers.set('X-Frappe-CSRF-Token', window.csrf_token || 'fetch');
      return headers;
    },
  }),
  tagTypes: [
    'Dashboard',
    'Invoices',
    'UnpaidInvoices',
    'Customers',
    'InvoiceSummary',
  ],
  endpoints: () => ({}),
});