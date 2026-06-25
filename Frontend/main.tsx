/// <reference types="./vite-env.d.ts" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css' // Import tĩnh giúp TS nhận diện module CSS

const startApp = () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      document.body.innerHTML = '<h1 style="color:white">Lỗi: Không tìm thấy thẻ #root</h1>';
      return;
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>
    );
  } catch (error: any) {
    // Hiển thị lỗi ra màn hình nếu React bị crash
    document.body.innerHTML = `<div style="color:white;background:red;padding:20px"><h1>Lỗi render: ${error.message}</h1></div>`;
  }
};

startApp();