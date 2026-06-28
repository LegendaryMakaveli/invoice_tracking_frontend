import { baseApi } from './baseApi';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Frappe standard resource API for listing customers
    getCustomers: builder.query({
      query: () => ({
        url: 'resource/Customer',
        params: {
          fields: JSON.stringify(['name', 'first_name', 'second_name', 'email', 'address', 'createdat']),
          order_by: 'createdat desc',
          limit_page_length: 0,
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Customers'],
    }),

    getCustomer: builder.query({
      query: (name) => `/api/resource/Customer/${name}`,
      transformResponse: (response) => response.data,
      providesTags: ['Customers'],
    }),

    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: 'resource/Customer',
        method: 'POST',
        body: customerData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Customers', 'Dashboard'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
} = customerApi;
