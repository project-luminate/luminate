import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import {Settings, Info, Help, SupportAgent, Support} from '@mui/icons-material';
import { Tooltip, AppBar, Toolbar} from "@mui/material"
import { ApiInputModal } from './api-input';
import { ContactModal } from './contact';
import './app-bar.scss';

const LOGO = '../../assets/luminate-logo-w-words.svg';

export const LuminateAppBar = () => {
  const handleRedirect = () => {
    window.open('https://luminate-research.github.io/', '_blank');
  };

  return (
    <div className="app-bar-container">
      <AppBar position="static" elevation={0} sx={{ flexGrow: 1, backgroundColor: "#FFF" , height: '64px'}}>
        <Toolbar sx={{ flexGrow: 1, height: '100%', minHeight: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
          <img src={LOGO} alt="Logo" style={{ height: '100%', margin: '0 20px', position: 'absolute', left: 0 }} />
          <Tooltip title="Tutorial">
            <button className="appbar-item" onClick={handleRedirect}>
              <Help style={{color: '#aaa'}} />
            </button>
          </Tooltip>
          <ContactModal />
          <ApiInputModal />
          <Tooltip title="About Luminate">
            <button className="appbar-item" onClick={handleRedirect}>
              <Info style={{color: '#aaa'}} />
            </button>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </div>
  );
}

// Render your React component instead
export default function RenderAppBar() {
    const root = createRoot(document.getElementById("app-bar"));
    root.render(<LuminateAppBar/>);
}
