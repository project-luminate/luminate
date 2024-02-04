
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
        this.button.innerHTML = 
            `<span class="material-symbols-outlined">
                add_ad
            </span>`;
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    handleResponseFromAiForm = (response) => {
        // Check if the Editor.js instance is available
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
            this.blockIndex = this.api.blocks.getCurrentBlockIndex()
            this.api.blocks.insert(blockToAdd.type, blockToAdd.data, null, this.blockIndex? this.blockIndex : this.api.blocks.getBlocksCount());

        }
        catch (error) {
            console.log("[Error] when loading inline toolbar", error);
        }
    };

    surround(range) {
        if (this.state) {
            // If highlights is already applied, do nothing for now
            return;
        }
        const selected = range.cloneContents();
        const selectedText = this.extractTextFromFragment(selected);
        // set context in useResponseStore to be the selected text
        useResponseStore.setState({context: selectedText});
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