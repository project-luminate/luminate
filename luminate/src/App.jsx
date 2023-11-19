import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ScatterCanvasView} from './js/ui/scatter-canvas-view/scatter-canvas-view';
import { LuminateAppBar } from './js/ui/app-bar/app-bar';
import { ToastContainer } from './js/ui/toasts';
import Editor from './js/ui/editor/text-editor';
import AiForm from './js/ui/editor/ai-panel/ai-form';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="Luminate">
      <LuminateAppBar />
      <div className="container-fluid">
        <div className="text-editor-container" id="text-editor-container">
            <Editor/>
        </div>
        <div className="ai-panel" id="ai-panel">
            <AiForm responseHandler={null} selectedContent={null} api={null}/>
        </div>
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
