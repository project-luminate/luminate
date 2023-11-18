import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Code from '@editorjs/code';

import AiTool from './ai-tool';
import GptApiBlockTune from './block-tune';
import AiInlineTool from "./inline-ai-tool";

import DatabaseManager from "../../db/database-manager";
import useCurrStore from "../../store/use-curr-store";
import { Button } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

import useEditorStore from "../../store/use-editor-store";
import useResponseStore from "../../store/use-response-store";

export default function Editor() {
  const ejInstance = useRef();
  const [editorData, setEditorData] = useState([]);
  const {focusedBlockId, setFocusedBlockId} = useCurrStore();
  const {setContext} = useResponseStore();

  const [x, setX] = useState(0);

  const getEditorInstance = () => {
    return ejInstance.current;
  };

  useEffect(() => {
    if (!ejInstance.current) {
      initEditor();
      // store the editor instance in the store
      ejInstance.current = getEditorInstance();
      console.log("editor instance", ejInstance.current);
      useEditorStore.setState({api: ejInstance.current});
      console.log("editor instance", useEditorStore.getState().api);


      // document.addEventListener('selectionchange', handleSelectionChange);
      // document.addEventListener('mouseup', handleSelectionChange);
      // return () => {
      //   // Cleanup
      //   document.removeEventListener('selectionchange', handleSelectionChange);
      //   document.removeEventListener('mouseup', handleSelectionChange);
      // };
    }

    return () => {
      ejInstance.current.destroy();
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
        blocks: [
          // {
          //   type: "header",
          //   data: {
          //     text: "My Story",
          //     level: 1
          //   }
          // },
          // {
          //   type: "paragraph",
          //   data: {
          //     text: "Write a story about a fox",
          //     level: 2
          //   }
          // },
          // {
          //   type: "paragraph",
          //   data: {
          //     text: "Write a copy writing about superconductivity",
          //     level: 2
          //   }
          // },
          // {
          //   type: "paragraph",
          //   data: {
          //     text: "Write an email to Toby on appealing regrade request",
          //     level: 2
          //   }
          // },
        ]
      },
    });
    ejInstance.current = editor;
    console.log(editor);
  };


  const handleSelectionChange = (e) => {
    // if (e.type === 'mouseup') {
    //   document.getElementById('chat-input')?.focus();
    // }

    const selection = document.getSelection();
    // if (!selection || !selection.toString().trim()) {
    //   setContext('')
    // }

    // Ensure the selection exists, has content, and the anchorNode's parent is an element
    if (selection && selection.toString().trim().length > 0 && selection.anchorNode && (selection.anchorNode.parentElement || selection.anchorNode.parentElement.offsetParent)) {
      const classNames = selection.anchorNode.parentElement.className;
      const offsetClassNames = selection.anchorNode.parentElement.offsetParent.className;

      // Check if classNames contain either "ce-paragraph" or "cdx-block"
      if (classNames.includes('ce-') || offsetClassNames.includes('ce-')) {
        setContext(selection.toString().trim())
      } else {
        setContext('');
      }
    }
};

  return (
      <div id="text-editor"></div>
  );
}

