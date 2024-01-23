import React, { useEffect, useState, useRef } from "react"
import * as bootstrap from 'bootstrap';


import './scatter-panel.scss';
import { styled, alpha } from "@mui/material/styles";
import { Button, Checkbox, FormControl, IconButton, ListItemText, MenuItem, Select, Fab, CircularProgress, InputBase} from '@mui/material';
import {Clear, KeyboardArrowLeft,KeyboardArrowRight, Bookmark, ChevronLeft, ChevronRight, Search} from '@mui/icons-material';

import useDimStore from '../../../store/use-dim-store';
import useCurrStore from "../../../store/use-curr-store";
import DatabaseManager from "../../../db/database-manager";
import { Dimension } from "../scatter-space/scatter-space.helper";

import {addNewDimension} from '../../../util/space-generation-util';

import Fuse from 'fuse.js';


export const ScatterPanel = ({updateNodePositions, camera, setCamera}) => {
  const {currBlockId, setCurrBlockId, nodeMap, setNodeMap, dimensionMap, setDimensionMap, selectedLabelIds, setSelectedLabelIds, keywordNodes, setKeywordNodes, addKeywordNode, removeKeywordNode,  addFilteredLabel, removeFilteredLabel} = useCurrStore();
  const {labels, dimensions, addLabel, setDimensions, myFav, toggleMyFav} = useDimStore();
  const [query, setQuery] = useState('');
  const [addDimensionInput, setAddDimensionInput] = useState('');
  const [loadingGrow, setLoadingGrow] = useState(false);
  const [showFullRow, setShowFullRow] = useState(false);
  const scatterPanelRef = useRef(null); 

  const toggleShowFullRow = () => {
    if(!currBlockId){
      return;
    }
    setShowFullRow(!showFullRow);
  };

  useEffect(() => {
    const dims = DatabaseManager.getAllDimensions(currBlockId);
    console.log('d', dims);
    if (dims === undefined) {
      console.log("undefined dimensions");
      return;
    }
    setDimensionMap(dims);
  }, [currBlockId]);

  useEffect(() => {
    if (query === '') {
      console.log('query is empty');
      setKeywordNodes(new Set());
      return;
    }
    }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  }


  interface Item {
    item: {
        ID: number;
        Dimension: {
          categorical: Record<string, any>; 
          ordinal: Record<string, any>;
          numerical: Record<string, any>;  
        };
        IsMyFav: boolean;
        Keywords: string[];
        Prompt: string;
        Result: string;
        Structure: string;
        Summary: string;
        Title: string;
        index: number;
        vx: number;
        vy: number;
        x: number;
        y: number;
      }
    refIndex: number;
    score: number; 
  }

  // fuzzy search
  const submitListener = (e) => {
    e.preventDefault();
    if (query === '') {
      // setNodeMap(DatabaseManager.getAllData(currBlockId));
      setKeywordNodes(new Set());
      return;
    }
    // config 
    const options = {
      includeScore: true,
      keys: [
        "Dimension",
        "Result",
        "Summary",
        "Keywords",
        "Title",
      ],
      threshold: 0.4
    }
    // change the dictionary to array
    const data = Object.values(DatabaseManager.getAllData(currBlockId));
    // console.log("data in array",data);
    const fuse = new Fuse(data, options)
    const result = fuse.search(query)
    console.log("fuzzy search result",result); 
    // const newMap = {};
    if (result.length === 0) {
      var toast = new bootstrap.Toast(document.getElementById('error-toast'));
      const err = document.getElementById('error-toast-text');
      if (err) {
        err.textContent = "No results found.";
        toast.show();
      }
      return
    }
    for (let i = 0; i < result.length; i++) {
      addKeywordNode((result[i].item as any[])['ID'] ?? 0);
    }
    // setNodeMap(newMap);
    // document.getElementById('full-text-button')?.click();
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (showFullRow && scatterPanelRef.current &&!(scatterPanelRef.current as any)?.contains(event.target)) {
        console.log('click outside');
        toggleShowFullRow();
      }
    }
    // Attach the event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const updateToggleFilterState = (toOpen: 'editor' | 'filter' | 'none') => {
    const editorElm = document.getElementById('text-editor-container');
    const filterElm = document.getElementById('scatter-filter-container');
    const aiPanelElm = document.getElementById('ai-panel');
    if (!editorElm || !filterElm || !aiPanelElm) return;

    if (toOpen === 'editor') {
      editorElm.style.display = 'block';
      aiPanelElm.style.display = 'block';
      filterElm.style.display = 'none';
    } else if (toOpen === 'filter') {
      editorElm.style.display = 'none';
      filterElm.style.display = 'block';
      aiPanelElm.style.display = 'block';
    } else {
      editorElm.style.display = 'none';
      filterElm.style.display = 'none';
      aiPanelElm.style.display = 'none';
    }
  }

  const displayState = (type: 'editor' | 'filter' | 'none') => {
    if (type === 'editor') return document.getElementById('text-editor-container')?.style.display;
    if (type === 'filter') return document.getElementById('scatter-filter-container')?.style.display;
    return (document.getElementById('text-editor-container')?.style.display === 'none' &&
      document.getElementById('scatter-filter-container')?.style.display === 'none') ? 'block' : 'none';
  }

  return (
    <div className='scatter-panel'>
      {/* Filter Labels */}
      <div className='menu'>
        {/* <IconButton type="button" aria-label="editor" onClick={() => {
          updateToggleFilterState('editor')
        }}
        style={{
          background: displayState('editor') === 'none' ? '#ffffff99' : '#1b1b1b99',
        }}
        >
          {
            <Notes style={{
              color: displayState('editor') === 'none' ? '#aaa' : '#fff'
            }}/>
          }
        </IconButton>
        <IconButton type='button' aria-label='filter' onClick={() => {
          updateToggleFilterState('filter')
        }}
        style={{
          background: displayState('filter') === 'none' ? '#ffffff99' : '#1b1b1b99',
        }}>
          {
            <Tune style={{
              color: displayState('filter') === 'none' ? '#aaa' : '#fff'
            }}/>
          }
        </IconButton> */}
        {
          <IconButton type='button' aria-label='hide-bar' onClick={() => {
            displayState('none') === 'none' ? updateToggleFilterState('none' ) :updateToggleFilterState('editor')
          }}
          style={{
            background:'#ffffff99',
          }}>
            {
              displayState('none') === 'none' ? <ChevronLeft style={{color: '#aaa'}}/> : <ChevronRight style={{color: '#aaa'}}/>
            }
          </IconButton>
        }
      </div>

      {/* Keyword Search */}
      <form
        className="searchbar"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',}}
        onSubmit={submitListener}>
        <KeywordSearch>
          <StyledInputBase
            placeholder="Search for nodes using keywords"
            inputProps={{ 'aria-label': 'search' }}
            onChange={handleInputChange} 
            value={query} 
          />
          <SearchIconWrapper>
            <Search style={{color: '#aaa'}} />
          </SearchIconWrapper>
        </KeywordSearch>
      </form>

      {/* Toggle */}
      <div style={{height: '44px'}}>
        <Button className="panel-item" style={{
          height: '44px',
          background: myFav ? '#1b1b1b99' : '#ffffff99',
          backdropFilter: 'blur(6px)',
          borderRadius: '12px',
          border: '2px solid #eee',
          zIndex: 1,
        }}
        onClick={() => {
          toggleMyFav();
        }}
        >
          <Bookmark style={{color: myFav ? '#fff' : '#aaa', width: '44px', padding: 0, margin: 0}}/>
        </Button>
      </div>

      {/* Filter Dimensions & Labels */}
      
      <div className="filter-dims-labels">
        <div className="fab-container-left">
            <Fab size="small" aria-label="add" className="fab" 
              sx ={{
                position: 'relative',
                left: '0px',
              }}
              onClick={()=>{
                const container = document.querySelector('.filter-dims-labels');
                container?.scrollTo({
                  left: 0,
                  behavior: 'smooth',
                });
              }}>
              <KeyboardArrowLeft />
            </Fab>
        </div>
        <div className="filter-dims-labels-container">
          {
            Object.values(dimensionMap as {[id:string]: Dimension}).map((dimension: Dimension) => (
              // <div>{dimension.name}</div>
              <FormControl
                style={{
                  background: 'none',
                  backgroundColor: 'none'
                }}
              >
                <Select
                  id="demo-multiple-checkbox"
                  className={`filter-dim-label`}
                  style={{
                    background: !!dimension.filtered?.length ? '#1b1b1b99' : '#ffffff99',
                    color: !!dimension.filtered?.length ? '#fff' : '#000',
                  }}
                  multiple
                  value={[`${dimension.name}`]}
                  onChange={(event) => {
                    // get all the selected values
                    const {target: { value },} = event;
                    // add the values to the dimension.filtered
                    // for (let i = 1; i < value.length; i++) {
                    //   if ((dimensionMap[dimension.name]?.filtered as string[])?.includes(value?.[i])) {
                    //     removeFilteredLabel(dimension.name, value?.[i]);
                    //   } else {
                    //     addFilteredLabel(dimension.name, value?.[i]);
                    //   }
                    // }
                  }}
                  MenuProps={{
                    style: customStyles,
                  }}
                  renderValue={(selected) => ( !dimension.filtered || dimension.filtered.length===0 ? dimension.name : dimension.filtered.length === 1 ? dimension.filtered[0] : `${dimension.filtered.length} ${dimension.name}`)}
                >
                {dimension.values.map((value) => (
                  <MenuItem key={dimension.id+value} value={value}>
                    <Checkbox checked={dimension.filtered?.includes(value)} onClick={(event) =>{
                      event.stopPropagation();
                      if (dimension.filtered?.includes(value)) {
                        removeFilteredLabel(dimension.name, value);
                      } else {
                        addFilteredLabel(dimension.name, value);
                      }
                    }}/>
                    <ListItemText primary={value} />
                  </MenuItem>
                ))}
                </Select>
              </FormControl>
            ))
          }
        </div>
        {/* add new dimension */}
        {
          dimensionMap && Object.values(dimensionMap).length >0 ?
          <div className='add-dimension'>
          {
            loadingGrow ? 
            <>
              <CircularProgress style={{color: '#777'}} size={20} />
              <div>Adding {addDimensionInput}...</div>
            </>:
            <form onSubmit={(e) => {
              e.preventDefault()
              if (loadingGrow || !addDimensionInput.trim()) return;
              // setDimensionMap(dimensionMap);
              setLoadingGrow(true);
              console.log('currId', currBlockId);
              const prompt = DatabaseManager.getBlock(currBlockId)?.prompt;
              console.log('add new dimension', prompt);
              console.log('add dimension input', addDimensionInput);
              addNewDimension(prompt, addDimensionInput, dimensionMap, setDimensionMap, nodeMap, setNodeMap).then(data => {
                setLoadingGrow(false);
                setAddDimensionInput('');
              })
              }
            }>
              <input type='text' placeholder='Add new dimension' value={addDimensionInput} onChange={(e: any) => {
                setAddDimensionInput(e.target.value)
              }}></input>
              <button>+</button>
            </form>
          }
        </div> 
        : <> </>
        }
        

        <div className="fab-container-right">
            <Fab size="small" aria-label="add" className="fab" 
              sx ={{
                position: 'relative',
                right: '0px',
              }}
              onClick={()=>{
                const container = document.querySelector('.filter-dims-labels');
                if (container) {
                  const scrollWidth = container.scrollWidth - container.clientWidth;
                  // Scroll to the rightmost part with a smooth animation
                  container.scrollTo({
                    left: scrollWidth,
                    behavior: 'smooth',
                  });
                }
              }}>
              <KeyboardArrowRight />
            </Fab>
        </div>
      </div>

      {
        Object.values(dimensionMap).find((d:any) => !!d.filtered?.length) &&
        <button className="panel-item" onClick={() => {
          Object.values(dimensionMap).forEach((d:any) => {
            d.filtered = [];
          })
          setDimensionMap(dimensionMap);
        }}>
          <Clear style={{color: '#aaa'}} />
        </button>
      }
    </div>
  )
}

const customStyles = {
  border: 'none', // Remove the border
};

const KeywordSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  borderRadius: theme.shape.borderRadius,
  // border: '1px solid #888',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: "10px",
  width: '100%',
  [theme.breakpoints.up('sm')]: {
  //   marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '28ch',
      '&:focus': {
        width: '35ch',
      },
    },
  },
}));