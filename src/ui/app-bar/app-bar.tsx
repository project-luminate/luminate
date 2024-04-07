import React, { useState, useRef, useEffect }  from 'react';
import { Settings, Info, Help, SupportAgent, Support } from '@mui/icons-material';
import { Tooltip, AppBar, Toolbar} from "@mui/material"
import { ApiInputModal } from './api-input';
import { ContactModal } from './contact';
import { MenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import { startTutorial } from '../../util/util';
import './app-bar.scss';

const LOGO = 'luminate-logo-w-words.svg';

export const LuminateAppBar = () => {
  const handleRedirect = () => {
    window.open('https://luminate-research.github.io/', '_blank');
  };

  return (
    <div className="app-bar-container">
      <AppBar position="relative" elevation={0} sx={{ flexGrow: 1, backgroundColor: "#FFF" , height: '64px', zIndex:10000}}>
        <Toolbar id="tool-bar" sx={{ flexGrow: 1, height: '100%', minHeight: '100%', alignItems: 'center', justifyContent: 'flex-end'}}>
        <img src={LOGO} alt="Logo" style={{ height: '100%', margin: '0 20px', position: 'absolute', left: 0 }} />
          <Tooltip title="Tutorial">
              <button className="appbar-item" onClick={startTutorial}>
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
};