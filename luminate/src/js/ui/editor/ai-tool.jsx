import { createRoot } from "react-dom/client";
import AiBlock from './ai-block.jsx';
import React from "react";
import useCurrStore from '../../store/use-curr-store';
import useEditorStore from '../../store/use-editor-store.jsx';
import DatabaseManager from '../../db/database-manager';

/* 
  * AiTool is a class that defines the block that contains the AI panel
  * It is used in the Editor.js instance
*/

class AiTool{
    constructor({data, config, api, block}) {
      this.data = data;
      this.api = api;
      this.block = block;
      this.config = config;
    }

    render(){
      try{
        // this.api.blocks.getCurrentBlockIndex()
        const wrapper = document.createElement('div');
        // set the id of the div element
        wrapper.id = 'ai-block';
        // render AI panel inside the div element
        const root = createRoot(wrapper);
        if (this.block.id === 0) {
          useCurrStore.setState({currBlockId: this.block.id + 1}); // store the current block id
        } else {
          useCurrStore.setState({focusedBlockId: this.block.id}); // store the current block id
        }
        root.render(<AiBlock data={this.data} api={this.api} block={this.block}/>);
        return wrapper;
      } catch (error) {
        console.log("[Error]", error);
      }
    }


    save(blockContent){
      const dataDiv = blockContent.querySelector('div#ai-block');
      return {
        text: dataDiv.innerHTML
      }
    }

    removed(){
      const currBlockId = useCurrStore.getState().currBlockId;
      if (DatabaseManager.getBlock(currBlockId).responseId===this.data.resId){
        const {editedMap} = useEditorStore.getState();
        editedMap[currBlockId] = true;
      }
      
    }

    
}

export default AiTool;