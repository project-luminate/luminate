import React, { useState, useEffect, useRef } from 'react';
import { Typography, InputBase, Paper, IconButton} from '@mui/material';
import {Send, Close} from '@mui/icons-material/';
import * as bootstrap from 'bootstrap';

import * as GPTUtil from '../../../util/gpt-util';
import * as SpaceUtil from '../../../util/space-generation-util';
import DatabaseManager from '../../../db/database-manager';
import useResponseStore from '../../../store/use-response-store';
import useCurrStore from '../../../store/use-curr-store';
import useSelectedStore from '../../../store/use-selected-store';
import useEditorStore from '../../../store/use-editor-store';


import './ai-form.scss'

  
export default function AiForm({responseHandler, selectedContent}) {
    const [query, setQuery] = useState(selectedContent);        // query is the input from the user
    // const [showButtons, setShowButtons] = useState(false);      // showButtons is a boolean to show the buttons, true if response is not empty
    const aiPanelRef = useRef(null);                            // aiPanelRef is a reference to the AI panel
    const [isSubmitting, setIsSubmitting] = useState(false);    // isSubmitting is a boolean to check if the form is submitting, true when submitting
    let currBlockId = useCurrStore.getState().maxBlockId + 1;   // currBlockId is the id of the new block
    const {response, setResponse, responseId, context} = useResponseStore(); // response is the response from the AI
    const [generationState, setGenerationState] = useState("dimension"); // generationState is the state of the generation, "dimension" or "response"
    const [firstRendered, setFirstRendered] = useState(true);   // firstRendered is a boolean to check if the response is rendered, true when first rendered
    const api = useEditorStore(state => state.api);
    const {selectedResponse, setSelectedResponse} = useSelectedStore();

    const addToast = (d) => {
        const toast = document.createElement('div');
        toast.id = 'fav-toast' + d;
        toast.classList.add('toast', 'align-items-center', 'text-bg-secondary', 'border-0');
        toast.setAttribute('role', 'alert');
        toast.style.margin = '4px'; 
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        // Create the toast content
        const toastContent = `
        <div class="d-flex">
            <div class="toast-body" id="toast-text-${d}">
                Generated a new categorical dimension: ${d}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        `;

        toast.innerHTML = toastContent;
        // Append the toast to the toast container
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            toastContainer.appendChild(toast);
        }
    }
    
    
    // given a query, generate new categorical and numerical dimensions and the combination of the first response
    async function generateDimensions(query, currBlockId) {
        const res = await GPTUtil.generateDimensions(query, context);
        // res status
        // 0: success
        // 1: failed to generate dimensions due to failed API call
        // 2: failed to generate responses due to constant error in parsing API response
        if (res.status === 1) {
            console.log("[Error] failed to generate dimensions due to failed API call");
            let toast = new bootstrap.Toast(document.getElementById('error-toast'));
            document.getElementById('error-toast-text').textContent = "Failed to generate dimensions due to failed API call. Please make sure your API key is correct and try again.";
            toast.show();
            return {result: null, status: 1};
        }
        if (res.status === 2) {
            console.log("[Error] failed to generate dimensions due to constant error in parsing API response");
            let toast = new bootstrap.Toast(document.getElementById('error-toast'));
            document.getElementById('error-toast-text').textContent = "Failed to generate dimensions due to constant error in parsing API response. Please try again.";
            toast.show();
            return {result: null, status: 1};
        }
        try{
            Object.entries(res["categorical"]).forEach(([d, v]) => {
                const data ={
                "name": d,
                "values": v,
                "type": "categorical"
                }
                // randome choose a value from the categorical dimension and
                DatabaseManager.postDimension(currBlockId, d, data);
                // add a new toast to toast-container
                addToast(d);
                // show a toast to indicate that the dimensions are generated
                let toast = new bootstrap.Toast(document.getElementById('fav-toast'+d));
                document.getElementById(`toast-text-${d}`).textContent = "New dimension: " + d;
                toast.show();

            });
            /* comment out when you do not want */
            Object.entries(res["ordinal"]).forEach(([d, v]) => {
                const data ={
                "name": d,
                "values": v,
                "type": "ordinal"
                }
                DatabaseManager.postDimension(currBlockId, d, data);
                addToast(d);
                // show a toast to indicate that the dimensions are generated
                let toast = new bootstrap.Toast(document.getElementById('fav-toast'+d));
                document.getElementById(`toast-text-${d}`).textContent = "New dimension: " + d;
                toast.show();
            });
            setGenerationState("response");
        }
        catch (error) {
            console.log("[Error] error when creating the space", error);
            let toast = new bootstrap.Toast(document.getElementById('error-toast'));
            document.getElementById('error-toast-text').textContent = "Failed to generate dimensions due to error in parsing JSON. Please try again.";
            toast.show();
            // remove all dimensions from the database
            DatabaseManager.deleteAllDimensions(currBlockId);
            return {result: null, status: 1};
        }

        return {result: res, status: 0};
    }

    async function diversifyResponses(currBlockId, query, dims) {
        const startTime = Date.now();

        // generate the space
        const num = DatabaseManager.getBatchSize(); //batch size
        const onFinished = await SpaceUtil.buildSpace(currBlockId, dims, num, query, context);
        // make a toast to indicate that the space is generated
        var toast = new bootstrap.Toast(document.getElementById('fav-toast'));
        document.getElementById('toast-text').textContent = "Generated a space with " + num + " responses";
        toast.show();

        const endTime = Date.now();
        console.log("Time to complete the space generation of " + num + " responses: " + (endTime - startTime) + "ms");
        console.log("Finished generating space", "failed", onFinished["fail_count"], "total", onFinished["total_count"]);
        
    }
    // when user types in the input box, update the query
    const handleInputChange = (e) => {
        setQuery(e.target.value);
    }

    // when user submits the query, generate a response
    const submitListener = async (e) => {
        e.preventDefault();
        useResponseStore.setState({responseId: null});
        if (query === '' || query === undefined || query === null) {
            let toast = new bootstrap.Toast(document.getElementById('error-toast'));
            document.getElementById('error-toast-text').textContent = "Please enter a query";
            toast.show();
            return;
        }

        // set the loading anchor to true and disable the submit button
        setFirstRendered(false);                // after first render, the inputbase value is not the selectedContent but the query
        setIsSubmitting(true);                  // during submission, disable the inputbase
       
        // generate dimensions
        const dims = await generateDimensions(query, currBlockId);
        if (dims.status === 1) {
            setIsSubmitting(false);
            return;
        }
        await diversifyResponses(currBlockId, query, dims.result); // generate new dimensions from the query

        // after generating the space, change the generation state to space
        setIsSubmitting(false);
        setGenerationState("dimension");        // change back to dimension mode
        setQuery('');                           // clear the query for the next query
        // set the context to empty
        useResponseStore.setState({context: ''});
        // put the response into the database
        DatabaseManager.postBlock(currBlockId, query, response, responseId);
    }

    useEffect(() => {
        if (response && query !== '') {
            setGenerationState("space");
            // Add the response to the blocks
            handleResponseFromAiForm({"text": response,"query":query, "id": currBlockId, "resId": responseId, "context": context});
            // reset the responseId to null
            useResponseStore.setState({responseId: null});
        }
    }, [response]);


    useEffect(() => {
        // when context is not empty, then show the context-div; otherwise,hide it
        if (context !== '') {
            document.getElementById('context-div').classList.add('show');
            document.getElementById('chat-input')?.focus();
        } else {
            document.getElementById('context-div').classList.remove('show');
        }
    }, [context]);

      const handleResponseFromAiForm = (response) => {
        // Check if the Editor.js instance is available
        try{
            const blockToAdd = {
                type: 'AiTool', 
                data: {
                  text: response.text,
                  id: response.id,
                  query: response.query,
                  context: response.context,
                  resId: response.resId,
                //   aiPanelRef: response.aiPanelRef
                }
            };
            api.blocks.insert(blockToAdd.type, blockToAdd.data, null, api.blocks.getBlocksCount());
    
        }
        catch (error) {
            console.log("[Error] error when inserting the block", error);
        }
    };

    return (
        // <div ref={aiPanelRef} style={{ width: '100%' , margin: 'auto'}}>
        <>
        <div className="context-div" id="context-div">
            {/* {context} */}
            {context}
            <IconButton id="close-button"
                onClick={() => {
                    // set context to empty
                    useResponseStore.setState({context: ''});
                }}
            >
                <Close/>
            </IconButton>
        </div>
        <Paper
            component="form"
            id = "ai-form"
            sx={{ p: '2px 4px',  display: 'flex', alignItems: 'center', width: '100%', zIndex: '1000' ,
            background: '#fff',
            backdropFilter: 'blur(6px)',
            borderRadius: '12px',
            border: '2px solid #eee',
            outline: 'none',
            // color: #aaa;
            boxShadow: '0 0 35px 4px rgba(0,0,0,0.1)'
        
            }}
            onSubmit={submitListener}
        >
        {isSubmitting 
        ?  (
            <>
            <Typography variant="body1" component="div" style={{ padding: '10px' ,flex: '1'}}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{  textAlign: 'center', marginRight:"24px", color: '#9880ff'}}>
                    {(() => {
                        switch (generationState) {
                            case 'dimension':
                                return 'Determining important apsects ~10s';
                            case 'response':
                                return 'Generating your first response ~10s';
                            case 'space':
                                return 'Maybe you also want to see other responses... ~10s';
                            default:
                                return 'AI Is Generating ~30s';
                        }
                    })()}
                    </span>
                    <div className="dot-flashing"></div>
                </div>
            </Typography>
            </>
        )
        : <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Ask AI for ideas"
            maxRows={6}
            multiline={true}
            inputProps={{ 'aria-label': 'Ask AI for ideas' }}
            id="chat-input"
            defaultValue = {firstRendered ? selectedContent : query}
            onChange={handleInputChange} // Handle input changes
            onKeyDown={
                (e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        document.getElementById('chat-input').value += '\n';
                        // change the rows of the inputbase
                        document.getElementById('chat-input').rows += 1;
                        return
                    }
                    if (e.key === 'Enter') {
                        submitListener(e);
                    }
                }
            }   
        />}
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="submit" disabled={isSubmitting}>
            <Send/>
        </IconButton>
        </Paper>
        </>
    );
}