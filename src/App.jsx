import {ScatterCanvasView} from './ui/scatter-canvas-view/scatter-canvas-view';
import { LuminateAppBar } from './ui/app-bar/app-bar';
import { ToastContainer } from './ui/toasts';
import { WelcomeModal } from './ui/welcome-modal';
import Editor from './ui/editor/text-editor';
import AiForm from './ui/editor/ai-panel/ai-form';
import React, { useEffect, useState } from 'react';
import { startTutorial } from './util/util';

function App() {
  const [firstTime, setFirstTime] = useState(localStorage.getItem('firstTime') !== 'false');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY);

  useEffect(() => {
    if (firstTime && apiKey) {
      startTutorial();
      localStorage.setItem('firstTime', 'false');
    }
  }, [apiKey]);

  const updateApiKey = (newApiKey) => {
    setApiKey(newApiKey);
  };

  return (
    <>
    {apiKey ? (
      <></>
    ) : (
      /* Render the WelcomeModal when there's no open AI API env value */
      <WelcomeModal updateApiKey={updateApiKey}/>
    )}
    <div className="Luminate">
      <LuminateAppBar />
      <div className="container-fluid">
        <div className="text-editor-container" id="text-editor-container">
          <Editor />
        </div>
        <div className="ai-panel" id="ai-panel">
            <AiForm responseHandler={null} selectedContent={null} api={null}/>
        </div>
        <div className="scatter-filter-container" id="scatter-filter-container" style={{display: 'none'}}></div>
        <div id="my-spaceviz">
            <ScatterCanvasView />
        </div>
      </div>
      <ToastContainer />
    </div>
    </>
  )
}

export default App
