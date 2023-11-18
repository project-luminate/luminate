
import * as bootstrap from 'bootstrap';
import React, {useState, useEffect} from 'react';
import { createRoot } from "react-dom/client";
import AiForm from './ai-panel/ai-form.jsx';
import useResponseStore from '../../store/use-response-store';
import './ai-panel/ai-form.scss';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';

/*
 * AiInlineTool is a class that defines the inline tool that contains the AI panel
 * It is used in the Editor.js instance
 */
export default class AiInlineTool {

    static get isInline() {
        return true;
    }

    constructor({api, config, block}) {
        this.button = null;
        this.state = false;
        this.api = api;
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerHTML = `<span class="material-symbols-outlined">
        add_ad
        </span>`;
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    handleResponseFromAiForm = (response) => {
        // Check if the Editor.js instance is available
        console.log("entered handler", response);
        try{
            const blockToAdd = {
                type: 'AiTool', 
                data: {
                  text: response.text,
                  id: response.id,
                  query: response.query,
                  aiPanelRef: response.aiPanelRef
                }
            };
            // set block style that the background color is light blue
            console.log("blockId is ", this.blockId)
            this.blockIndex = this.api.blocks.getCurrentBlockIndex()
            this.api.blocks.insert(blockToAdd.type, blockToAdd.data, null, this.blockIndex? this.blockIndex : this.api.blocks.getBlocksCount());

        }
        catch (error) {
            console.log("error", error);
        }
    };

    surround(range) {
        if (this.state) {
            // If highlights is already applied, do nothing for now
            return;
        }
        // if ap-panel exists, remove it
        // if (document.getElementById('ai-panel')) {
        //     document.getElementById('ai-panel').remove();
        // }
        // console.log("api", this.api)
        // const currBlock = this.api.blocks.getBlockByIndex(this.api.blocks.getCurrentBlockIndex()).holder
        // const position = currBlock.getBoundingClientRect();
        // // create a div element
        // const wrapper = document.createElement('div');
        // // Append the container to text-editor-container

        // // append the panel to element by class codex-editor codex-editor--narrow
        // const textEditor = document.getElementsByClassName('codex-editor codex-editor--narrow')[0];

        // const textEditorContainer = document.getElementById('text-editor-container');
        // textEditor.appendChild(wrapper);
        // // set the id of the div element
        // wrapper.id = 'ai-panel';
        // // set the position of the div element
        // wrapper.style.position = 'absolute';
        // // wrapper.style.top = position.bottom + 10 + 'px';
        // // wrapper.style.left = position.left + 'px';
        // wrapper.style.bottom = '30px';
        // wrapper.style.left = position.left + 'px';
        // // z-index of the div element
        // wrapper.style.zIndex = 1000;

        // textEditor.addEventListener('scroll', () => {
        //     const position = currBlock.getBoundingClientRect();
        //     wrapper.style.top = position.bottom + window.scrollY + 10 + 'px';
        //   });
          
        // // Optionally, you can also listen for window resize events to adjust the panel's position.
        // window.addEventListener('resize', () => {
        //   const newPosition = currBlock.getBoundingClientRect();
        //   wrapper.style.top = newPosition.bottom + window.scrollY + 10 + 'px';
        //   wrapper.style.left = newPosition.left + 'px';
        // });

        // wrapper.style.width = position.width + 'px';
        // document.body.appendChild(wrapper);
        // render AI panel inside the div element
        const selected = range.cloneContents();
        const selectedText = this.extractTextFromFragment(selected);
        // set context in useResponseStore to be the selected text
        useResponseStore.setState({context: selectedText});

        
        // const root = createRoot(document.getElementById("ai-panel"));
        // this.api.inlineToolbar.close();
        // root.render(<AiForm responseHandler={this.handleResponseFromAiForm} selectedContent={selectedText} api={this.api}/>); 
    }

    extractTextFromFragment(fragment) {
        const container = document.createElement('div');
        container.appendChild(fragment);
    
        const textNodes = Array.from(container.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE);
    
        return textNodes.map(node => node.textContent).join('');
    }

   
    checkState(selection) {
        const text = selection.anchorNode;
        if (!text) {
            return;
        }
        const anchorElement = text instanceof Element ? text : text.parentElement;
        this.state = !!anchorElement.closest('MARK');
    }
}