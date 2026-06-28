import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App.jsx'

const initApp = async () => {
  try {
    const res = await fetch('/api/method/frappe.utils.get_csrf_token', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    window.csrf_token = data.message;
  } catch (e) {
    console.error('CSRF fetch failed', e);
  }

  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

initApp();