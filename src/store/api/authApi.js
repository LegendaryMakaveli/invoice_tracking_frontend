import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'method/login',
        method: 'POST',
        body: {
          usr: credentials.email,
          pwd: credentials.password,
        },
      }),
    }),
    checkAuth: builder.query({
      query: () => 'method/frappe.auth.get_logged_user',
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'method/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCheckAuthQuery,
  useLogoutMutation,
} = authApi;
