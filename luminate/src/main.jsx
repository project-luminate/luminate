import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import DatabaseManager from "./js/db/database-manager.jsx";

// store data into local storage
DatabaseManager.initTestData();
DatabaseManager.getAllDimensions("0");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
