import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DatabaseManager from "./db/database-manager.jsx";
import './main.scss'

// store data into local storage
DatabaseManager.initTestData();
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
