import React ,{useState, useEffect, useRef} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CircularProgress from '@mui/material/CircularProgress';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import './ai-block.scss'

import DatabaseManager from '../../db/database-manager';
import useCurrStore from '../../store/use-curr-store';
import useResponseStore from '../../store/use-response-store';
import useSelectedStore from '../../store/use-selected-store';
import useEditorStore from '../../store/use-editor-store';


export default function AiBlock({data, api, block}) {
    
    const query = data.query;                                       // for the query, will not change after the block is created
    const aiPanelRef = data.aiPanelRef;                             // for the ai panel to move to the current block
    const [blockId, setBlockId] = useState(data.id);                  // for space id
    const [anchorEl, setAnchorEl] = useState(null);           // for the popover
    const {currBlockId, setCurrBlockId} = useCurrStore();           // for the current block id, used to change the background color
    const [dataId, setDataId] = useState(data.resId);                  // for the data id, used to update the response
    const {selectedResponse, setSelectedResponse} = useSelectedStore(); // for the selected response, used to update the response
    const [backgroundColor, setBackgroundColor] = useState('#f8f7fa59');  // for the background color
    const [isLoading, setIsLoading] = useState(false);              // for the loading icon
    const [text, setText] = useState(data.text);                    // for the text
    const [context, setContext] = useState(data.context);           // for the context
    const [isEdited, setIsEdited] = useState(false);
    const {editedMap, toggleEdited} = useEditorStore();

    useEffect(() => {
        // when first load the block, add the block to the editedMap if it is not in the editedMap
        if (!editedMap[blockId]) {
            editedMap[blockId] = false;
        }
    }, []);

    console.log("block API", block);
    console.log("editor API", block.holder);

//
    const open = Boolean(anchorEl);
    const popoverId = open ? 'simple-popover' : undefined;
    // const  AiBlockRef = useRef(null);
    const printAllAttributes = (d) => {
        console.log(`print all attributes for ${blockId} ${d}`);
        console.log(`print all attributes for ${blockId} text`, text);
        console.log(`print all attributes for ${blockId} selectedResponse only this`, selectedResponse[blockId]);
        console.log(`print all attributes for ${blockId} dataId`, dataId);
        console.log(`print all attributes for ${blockId} selectedResponse`, selectedResponse);
    }

    useEffect(() => {
        if (text === undefined || text === '') {
            console.log("text is undefined");
            printAllAttributes('text is undefined');
        }
    }, [text]);

    // useEffect(() => {
    //     // move the ai panel down to the current block
    //     if (aiPanelRef.current) {
    //         aiPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //         console.log(block.holder)
    //         const currBlock = block.holder;
    //         const position = currBlock.getBoundingClientRect();
    //         console.log(position.top);
    //         // find the element called ai-panel
    //         const aiPanel = document.getElementById('ai-panel');
    //         console.log(aiPanel);
    //         // bottom + 10px is the distance between the current block and the ai-panel
    //         // aiPanel.style.top = position.bottom + 10 + 'px';
    //         aiPanel.style.bottom = '30px';
    //         aiPanel.style.left = position.left + 'px';
    //         // z-index of the div element
    //         aiPanel.style.zIndex = 1000;
    //         // width of the div element is the same as text-editor-container
    //         // width is the calculated width of the current block
    //         aiPanel.style.width =  'calc(31.5%) !important';
    //         document.body.appendChild(aiPanel);
    //     }
    // }, []);

    const onClickshowSpaceHandler = () => {
        setIsLoading(true);
        setTimeout(() => {
            setCurrBlockId(data.id);
            setIsLoading(false);
          }, 2000);
    }
    const onClickShowPromptHandler = () => {
        // change the current block to id
        setAnchorEl(event.currentTarget);
    }

   // if currBlockId is the same as dataId, then update the response
    useEffect(() => {
        if (currBlockId === blockId && !isEdited) {
            // update the response
            // printAllAttributes('update the response');
            console.log("update the response for blockId: " + blockId);
            setText(selectedResponse[blockId]['Result']);
            setDataId(selectedResponse[blockId]['ID']);
        } else {
            console.log("not update the response for blockId: " + blockId);
            // printAllAttributes('not update the response');
        }
    }, [selectedResponse]);
        // if (aiPanelRef.current) {
        //     aiPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        //     console.log(block.holder)
        //     const currBlock = block.holder;
        //     const position = currBlock.getBoundingClientRect();
        //     console.log(position.top);
        //     // find the element called ai-panel
        //     const aiPanel = document.getElementById('ai-panel');
        //     console.log(aiPanel);
        //     // bottom + 10px is the distance between the current block and the ai-panel
        //     // aiPanel.style.top = position.bottom + 10 + 'px';
        //     aiPanel.style.bottom = '30px';
        //     aiPanel.style.left = position.left + 'px';
        //     // z-index of the div element
        //     aiPanel.style.zIndex = 1000;
        //     // width of the div element is the same as text-editor-container
        //     // width is the calculated width of the current block
        //     aiPanel.style.width =  'calc(31.5%) !important';
        //     document.body.appendChild(aiPanel);
        //     // rerender the ai panel
        //     aiPanelRef.current.style.display = 'none';
        //     aiPanelRef.current.style.display = 'block';
        // }



    useEffect(() => {
        console.log("currBlockId: " + currBlockId);
        console.log("dataId: " + dataId);
        if (currBlockId === blockId) {
            console.log("change the background color to yellow");
            setBackgroundColor('#f6ed8c98');
        } else {
            console.log("change the background color to white");
            setBackgroundColor('#f8f7fa59');
        }
    }, [currBlockId]);

    useEffect(() => {
        console.log("isEdited: " + isEdited);
        if (isEdited) {
            // change the background color to blue
            console.log("change the background color to white");
            setBackgroundColor('#f8f7fa59');
        } 
    }, [isEdited]);



    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOnInput = (e) => {
        console.log("handleOnInput");
        console.log(e.target.innerHTML);
        if (!isEdited) {
            setIsEdited(true);
            editedMap[blockId] = true;
        }
        // DatabaseManager.postBlock(currBlockId, query, e.target.innerHTML, dataId);
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row', // Align items vertically
                width: '100%',
            }}>
            <Paper 
                elevation={0}
                style={{
                    background: backgroundColor,
                    width: '100%',
                }}
                id={"ai-block"}xs
            >     
                <div
                    dangerouslySetInnerHTML={{ __html: text}}
                    contentEditable={true}
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',  
                        whiteSpace: 'pre-wrap'
                    }}
                    id = "data-div"
                    onInput={handleOnInput}
                />
            </Paper>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    marginTop: '10px', // Optional margin between textarea and IconButton
                }}
            >
            <Tooltip title="Show Information">
                <IconButton
                    type="button"
                    aria-label="show prompt"
                    sx={{
                        border: 'none',
                        outline: 'none',
                    }}
                    onClick={onClickShowPromptHandler}
                >
                    <InfoIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Show Space">
                <IconButton 
                onClick={onClickshowSpaceHandler} 
                disabled={isLoading}
                type="button"
                        aria-label="show Space"
                        sx={{
                            border: 'none',
                            outline: 'none',
                        }}
            >
                {isLoading ? <CircularProgress style={{color: '#777'}} size={24} /> : <TravelExploreIcon/> }
            </IconButton>
            </Tooltip>
                <Popover
                    id={popoverId}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                    }}
                >
                    <Typography sx={{ p: 2, maxWidth: '350px' }}>
                        <p>Prompt: {query}</p>
                        {context && <p>Context: {context}</p>}
                        {/* <p>ResId: {dataId}</p> */}
                        <p>Space Id: {blockId}</p>

                        {/* {useEffect(() => {
                            // Initialize an array to collect the elements
                            const elements = [];

                            // for all the dimensions, show the dimension and value
                            if (responseDimensions) {
                            // the categorical dimensions
                            const categoricalDimensions = responseDimensions.categorical;
                            Object.entries(categoricalDimensions).forEach(([key, value]) => {
                                elements.push(<span key={key}>{key}: {value}</span>);
                            });

                            // the numerical dimensions
                            const numericalDimensions = responseDimensions.numerical;
                            Object.entries(numericalDimensions).forEach(([key, value]) => {
                                elements.push(<span key={key}>{key}: {value}</span>);
                            });
                            }

                            // Return the array of elements within the JSX
                            return elements;
                        },[responseDimensions])} */}
                    </Typography>
                </Popover>
            </div>
                
        </Box>         
            
    );
}