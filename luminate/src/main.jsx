import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DatabaseManager from "./js/db/database-manager";
// import './index.css'
import "./scss/styles.scss";

// store data into local storage
DatabaseManager.initTestData();
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
