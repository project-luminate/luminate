import React from 'react';
import { createRoot } from "react-dom/client";
import AiForm from './ai-panel/ai-form.jsx';
import EditorJS from '@editorjs/editorjs';


/*
    * GptApiBlockTune is a class that defines the block tune that contains the AI panel
    * It is used in the Editor.js instance
*/

export default class GptApiBlockTune {
    constructor({api, block}) {
        this.api = api;
        this.block = block;
        this.class = 'cdx-my-block-tune';
        this.handleResponseFromAiForm = this.handleResponseFromAiForm.bind(this);
        this.blockIndex = this.api.blocks.getCurrentBlockIndex()
    }


    static get isTune() {
        return true;
    }

    handleResponseFromAiForm = (response) => {
        // Check if the Editor.js instance is available
        console.log("enter handler", response);
        try{
            const blockToAdd = {
                type: 'AiTool', 
                data: {
                    text: response.text,
                    id: response.id,
                    query: response.query,
                    responseData: response.responseData
                }
            };
            // set block style that the background color is light blue
            console.log("blockId is ", this.blockId)
            this.blockIndex = this.api.blocks.getCurrentBlockIndex()
            this.api.blocks.insert(blockToAdd.type, blockToAdd.data, null, this.blockIndex? this.blockIndex : this.api.blocks.getBlocksCount());
            // get the current block id
        }
        catch (error) {
            console.log("error", error);
        }
    };


    render() {
        return {
            icon: `<i class="material-icons">smart_toy</i>`,
            label: 'AI Brainstorming',
            onActivate: () => {
                try{
                    console.log("onActivate");
                    // if ap-panel exists, remove it
                    if (document.getElementById('ai-panel')) {
                        document.getElementById('ai-panel').remove();
                    }
                    this.api.blocks.getCurrentBlockIndex()
                    const currBlock = this.block.holder
                    // console.log("currBlock", currBlock);
                    const position = currBlock.getBoundingClientRect();
                    // create a div element
                    const wrapper = document.createElement('div');
                    // set the id of the div element
                    wrapper.id = 'ai-panel';
                    // set the position of the div element
                    wrapper.style.position = 'absolute';
                    // wrapper.style.top = position.bottom + 'px';
                    wrapper.style.bottom = '30px';
                    wrapper.style.left = position.left + 'px';
                    // z-index of the div element
                    wrapper.style.zIndex = 1000;
                    // width of the div element is the same as text-editor-container
                    wrapper.style.width = position.width + 'px';
                    document.body.appendChild(wrapper);
                    // render AI panel inside the div element
                    const root = createRoot(document.getElementById("ai-panel"));
                    // console.log("root", root);
                    root.render(<AiForm responseHandler={this.handleResponseFromAiForm}  api={this.api}/>);
                } catch (error) {
                    console.log("error", error);
                }      
            }
        }
    }

    save() {
        return {
            class: this.class,
        };
    }

     
}

