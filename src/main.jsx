import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; // ← 추가
import App from './App.jsx';
import './styles/base.css';
import './styles/pages.css';
import './styles/forms.css';
import './styles/auth.css';
import './styles/detail-map.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider 로 감싸면 App 전체에서 useAuth() 를 쓸 수 있다 */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
