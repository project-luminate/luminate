import React, { useEffect, useRef } from "react";

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Code from '@editorjs/code';

import AiTool from './ai-tool';
import AiInlineTool from "./inline-ai-tool";

import useEditorStore from "../../store/use-editor-store";
import useResponseStore from "../../store/use-response-store";

export default function Editor() {
  const ejInstance = useRef();
  const {setContext} = useResponseStore();

  const getEditorInstance = () => {
    return ejInstance.current;
  };

  useEffect(() => {
    if (!ejInstance.current) {
      initEditor();
      // store the editor instance in the store
      ejInstance.current = getEditorInstance();
      useEditorStore.setState({api: ejInstance.current});
    }

    return () => {
        ejInstance.current = null;
    }
},[]);

const initEditor = () => {
  const editor = new EditorJS({
    holder: 'text-editor',
    tools: {
      AiTool: {
          class: AiTool,
          inlineToolbar: true,
      },
      header: {
        class: Header,
        inlineToolbar: true,
      }, 
      list: {
        class: List,
        inlineToolbar: true,
      },
      image: {
        class: ImageTool,
        inlineToolbar: true,
      },
      code: {
        class: Code,
        inlineToolbar: true,
      },
      // gptApiBlockTune: {
      //   class: GptApiBlockTune,
      // },
      AddContext: {
        class: AiInlineTool,
        shortcut: 'CMD+M',
      }
  
    },
    // tunes: ["gptApiBlockTune"],
    placeholder: 'Click here to write down the title',
    // defaultBlock: 'AiTool',
    data: {
      blocks: []
    },
  });
  ejInstance.current = editor;
};

const handleSelectionChange = (e) => {
  const selection = document.getSelection()
  // Ensure the selection exists, has content, and the anchorNode's parent is an element
  if (selection && selection.toString().trim().length > 0 && selection.anchorNode && (selection.anchorNode.parentElement || selection.anchorNode.parentElement.offsetParent)) {
    const classNames = selection.anchorNode.parentElement.className;
    const offsetClassNames = selection.anchorNode.parentElement.offsetParent.className
    // Check if classNames contain either "ce-paragraph" or "cdx-block"
    if (classNames.includes('ce-') || offsetClassNames.includes('ce-')) {
      setContext(selection.toString().trim())
    } else {
      setContext('');
    }
  }
}

  return (
    <div id="text-editor">
    </div> 
  );
}

