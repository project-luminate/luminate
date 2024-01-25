import React, { useState, useEffect, useRef } from 'react';
import { Typography, InputBase, Paper,} from '@mui/material';

import IconButton from '@mui/material/IconButton';
import {Send, Close} from '@mui/icons-material/';

import * as GPTUtil from '../../../util/gpt-util';
import * as SpaceUtil from '../../../util/space-generation-util';
import DatabaseManager from '../../../db/database-manager';
import useResponseStore from '../../../store/use-response-store';
import useCurrStore from '../../../store/use-curr-store';
import useSelectedStore from '../../../store/use-selected-store';
import useEditorStore from '../../../store/use-editor-store';
import * as bootstrap from 'bootstrap';
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
        console.log("new dimensions for block" + currBlockId ,res);
        // const dpInstance = new DimensionPanel();
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
            console.log("error when creating the space", error);
            let toast = new bootstrap.Toast(document.getElementById('error-toast'));
            document.getElementById('error-toast-text').textContent = "Failed to generate dimensions";
            toast.show();
            // remove all dimensions from the database
            DatabaseManager.deleteAllDimensions(currBlockId);
            return null;
        }

        return res;
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

        console.log("On submit, Query:", query);
        console.log("Form submitted");
        // set the loading anchor to true and disable the submit button
        // canRemove = false;
        setFirstRendered(false);                // after first render, the inputbase value is not the selectedContent but the query
        setIsSubmitting(true);                  // during submission, disable the inputbase
       
        // generate dimensions
        const dims = await generateDimensions(query, currBlockId);
        if (dims === null) {
            setIsSubmitting(false);
            return;
        }
        await diversifyResponses(currBlockId, query, dims); // generate new dimensions from the query

        // after generating the space, change the generation state to space
        setIsSubmitting(false);
        setGenerationState("dimension");        // change back to dimension mode
        setQuery('');                           // clear the query for the next query
        // set the context to empty
        useResponseStore.setState({context: ''});
        // put the response into the database
        DatabaseManager.postBlock(currBlockId, query, response, responseId);
    }

    //  // remove the panel
    //  const onDestroy = () => {
    //     console.log("Destroy query:", query)
    //     console.log("Destroy response:", response)
    //     // remove the panel
    //     aiPanelRef.current.remove();
    //     // remove the block
    //     for (let i = 0; i < api.blocks.getBlocksCount (); i++) {
    //         if (api.blocks.getBlockByIndex(i).id == useCurrStore.getState().focusedBlockId){
    //             api.blocks.delete(i);
    //             break;
    //         }
    //     }
    //     // set focused block id to null
    //     useCurrStore.setState({focusedBlockId: null});
    //     // remove the block from the database
    //     useCurrStore.setState({currBlockId: null});
    //     // remove the data from the database
    // }

    // const onExplore = () => {
        // // Generate new dimensions
        // const dims = DatabaseManager.getAllDimensions("0");
        // const dm = new dimensionPanel();

        // // wait for the dimension panel to be rendered
        // setTimeout(() => {
        //     // add the dimension panel to the canvas
        //     for (const dimension of Object.values(dims)){
        //         dm.addDimensionButton(dimension);
        //     }
        // }, 1000);
        // generateNewDimensions(query);
    // }

    // const onDiscard = () => {
    //     // Remove the response from the blocks
    //     console.log("Discard response:", query);
    //     setShowButtons(false);
    //     canRemove = true;
    // }

    // regenerate the response
    // const onRegenerate = async () => {
    //     setResponse('');
    //     const response = await generateResponse(query)
    //     console.log("On regenerate, New Response:", response);
    //     setResponse(response);   
    // }

    // once the response is generated, show the buttons
    // useEffect(() => {
    //     console.log("anchor Response:", response);
    //     if (response && query !== '') {
    //         setGenerationState("space");
    //         console.log('query in the response', query);
    //         // Add the response to the blocks
    //         handleResponseFromAiForm({"text":response, "query":query, "id": currBlockId});
    //     }
    // }, [response]);
    useEffect(() => {
        console.log("anchor Response:", response);
        if (response && query !== '') {
            setGenerationState("space");
            console.log('query in the response', query);
            console.log('text in the response', selectedResponse[currBlockId]);
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
        console.log("entered handler", response);
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
            console.log("the block will be inserted after", api.blocks.getBlocksCount())
            console.log("error when isnerting the block", error);
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

// generate the first response from the AI
// const generateFirstResponse = async (query, req) => {
//     const message = "Prompt: " + query + "\n" + "####" + "\n" + "Requirements: " + req + "\n" + "####" + "\n";

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: 'gpt-3.5-turbo',
//           messages: [{role: "user", content: `${message}`}],
//           temperature: 0.7,
//           max_tokens: 256,
//           top_p: 1,
//           frequency_penalty: 0.75,
//           presence_penalty: 0,
//           stream: true,
//         }),
//     });
  
//     const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
//     if (!reader) return;
//     // eslint-disable-next-line no-constant-condition
//     let content = '';
//     while (true) {
//       // eslint-disable-next-line no-await-in-loop
//       const { value, done } = await reader.read();
//       if (done) break;
//       let dataDone = false;
//       const arr = value.split('\n');
//       arr.forEach((data) => {
//         if (data.length === 0) return; // ignore empty message
//         if (data.startsWith(':')) return; // ignore sse comment message
//         if (data === 'data: [DONE]') {
//           dataDone = true;
//           return;
//         }
//         // console.log(JSON.parse(data.substring(6)));
//         // ifcontent undefined, then set it to empty string
//         const parsedData = JSON.parse(data.substring(6));
//         content += parsedData["choices"][0]["delta"]["content"] === undefined ? "" : parsedData["choices"][0]["delta"]["content"];
//         // console.log(content);
//         content = content.replace(/^\s+/, '');
//         setResponse(content);
//       });
//       if (dataDone) break;
//     }   
//     setShowButtons(true);
//     return content;
// }

// given a query, generate new categorical and numerical dimensions and the combination of the first response
// async function generateDimensions(query, currBlockId) {
//     const res = await GPTUtil.generateDimensions(query);
//     console.log("new dimensions for block" + currBlockId ,res);
//     // show a toast to indicate that the dimensions are generated
//     let toast = new bootstrap.Toast(document.getElementById('fav-toast'));
//     document.getElementById('toast-text').textContent = "Generated Dimensions";
//     toast.show();

//     // const dpInstance = new DimensionPanel();
//     Object.entries(res["categorical"]).forEach(([d, v]) => {
//         const data ={
//         "name": d,
//         "values": v,
//         "type": "categorical"
//         }
//         // randome choose a value from the categorical dimension and
//         DatabaseManager.postDimension(currBlockId, d, data);
//         // dpInstance.addDimensionButton(data);
//     });

//     Object.entries(res["numerical"]).forEach(([d, v]) => {
//         const data ={
//         "name": d,
//         "values": v,
//         "type": "numerical"
//         }
//         DatabaseManager.postDimension(currBlockId, d, data);
//         // dpInstance.addDimensionButton(data);
//     });

//     return res;
// }

