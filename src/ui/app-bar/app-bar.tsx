import React, { useState, useRef, useEffect }  from 'react';
import { Settings, Info, Help, SupportAgent, Support } from '@mui/icons-material';
import { Tooltip, AppBar, Toolbar} from "@mui/material"
import { ApiInputModal } from './api-input';
import { ContactModal } from './contact';
import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton } from '@mui/base/MenuButton';
import { MenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import introJs  from 'intro.js';
import 'intro.js/introjs.css';
import './app-bar.scss';

const LOGO = 'luminate-logo-w-words.svg';

export const LuminateAppBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = () => {
    if (!menuOpen) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
    }
    setMenuOpen(!menuOpen);
  };

  const handleRedirect = () => {
    window.open('https://luminate-research.github.io/', '_blank');
  };

  const startTutorial = () => {
    const intro = introJs();
    intro.setOptions({
      tooltipClass: 'tutorialTooltip',
      steps: [
        {
          title: 'Luminate Tutorial',
          intro: 'This is a walkthrough to get you acquainted with each component of Luminate and help you understand the system.'
        },
        {
          title: 'Text Editor',
          element: document.querySelector('#text-editor-container'),
          intro: "This is the text editor. You might have noticed that the design is similar to Notion, a popular tool many use."
        },
        {
          title: 'Prompt AI',
          element: document.querySelector('#ai-form'),
          intro: "You can also use this input box to ask AI for ideas.\
          The AI takes a few seconds to figure out important attributes to this prompt and generates multiple responses. "
        },
        {
          title: 'Exploration View',
          element: document.querySelector('#my-spaceviz'),
          intro: "This is the exploration view where you can see multiple responses once you prompt AI for ideas."
        },
        {
          title: 'Collapse Text Editor',
          element: document.querySelector('#collapse-button'),
          intro: "You can collapse the text editor to get a better view of the exploration view."
        },
        {
          title: 'Search Bar',
          element: document.querySelector('#searchbar'),
          intro: "You can use the search bar to quickly find responses that contain a specific word or phrase."
        },
        {
          title: 'Favorites',
          element: document.querySelector('#fav-button'),
          intro: "You can click the bookmark icon to see your favorite responses of current space."
        },
        {
          title:'Filter',
          element: document.querySelector('#filter-dims'),
          intro: 'Once the design space is generated, you can see dimensions like the one shown here. You can filter the responses based on these dimensions and the associated values.\
          <img src="filter-bar.png" style="width:100%; height:auto;"/>'
        },
        {
          title:'Semantic Zoom',
          element: document.querySelector('.semantic-level-panel'),
          intro: 'You can use the semantic zoom to see responses at different levels of abstraction (dot,title, keywords, summary, and full text).\
          <img src="semantic-zoom.png" style="width:100%; height:auto;"/>'
        },
        {
          title:'Select Dimension',
          element: document.querySelector('#x-trigger'),
          intro: "You can select a dimension to arrange the responses in the exploration view based on the values in that dimension."
        },
        {
          title: 'Luminate Tutorial',
          intro: 'This is the end of the tutorial. You can also watch a 30s video demo video to get a better understanding of Luminate.\
          <video width="540px" height="360px" controls>\
            <source src="luminate-video-preview.mp4" type="video/mp4">\
            Your browser does not support the video tag.\
          </video>\
          Enjoy using Luminate!'
        },
      ]
    });
    intro.setOption("dontShowAgain", false).start();
  }

  return (
    <div className="app-bar-container">
      <AppBar position="relative" elevation={0} sx={{ flexGrow: 1, backgroundColor: "#FFF" , height: '64px', zIndex:10000}}>
        <Toolbar sx={{ flexGrow: 1, height: '100%', minHeight: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
          <img src={LOGO} alt="Logo" style={{ height: '100%', margin: '0 20px', position: 'absolute', left: 0 }} />
          <Tooltip title="Tutorial">
              <button ref={buttonRef} className="appbar-item" onClick={startTutorial}>
                <Help style={{color: '#aaa'}} />
              </button>
          </Tooltip>
              {/* <div style={{ position: 'absolute', zIndex: 10000, ...menuPosition }}>
                {menuOpen && (
                  <Menu slots={{ listbox: StyledListbox }}>
                    <StyledMenuItem onClick={startTutorial}>
                      Walkthrough
                    </StyledMenuItem>
                    <StyledMenuItem onClick={startTutorial}>
                      Demo Video
                    </StyledMenuItem>
                  </Menu>
                )}
              </div> */}
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

const StyledListbox = styled('ul')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0px 2px 16px ${theme.palette.mode === 'dark' ? grey[900] : grey[200]};
  z-index: 1000000;
  `,
);

const StyledMenuItem = styled(MenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &.${menuItemClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }

  &:hover:not(.${menuItemClasses.disabled}) {
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }
  `,
);



const blue = {
  50: '#F0F7FF',
  100: '#DAECFF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  50: '#f6f8fa',
  100: '#eaeef2',
  200: '#d0d7de',
  300: '#afb8c1',
  400: '#8c959f',
  500: '#6e7781',
  600: '#57606a',
  700: '#424a53',
  800: '#32383f',
  900: '#24292f',
};