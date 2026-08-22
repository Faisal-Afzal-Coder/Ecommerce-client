import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const mutationLabels = {
  post: 'Action completed successfully.',
  put: 'Changes saved successfully.',
  patch: 'Changes saved successfully.',
  delete: 'Deleted successfully.'
};

// Every API action gets a consistent toast. Individual requests can supply
// `toastMessage` when they need a more specific success message.
axios.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (mutationLabels[method] && !response.config.silentToast) {
      toast.success(response.config.toastMessage || response.data?.message || mutationLabels[method]);
    }
    return response;
  },
  (error) => {
    if (!error.config?.silentToast && error.code !== 'ERR_CANCELED') {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={3500}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="dark"
            />
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
