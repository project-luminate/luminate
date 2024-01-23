import React, { useCallback, useEffect, useRef, useState } from "react"
import './variation-block.scss';
import { DimensionLabel } from "../dimension-label/dimension-label";
import { Bookmark, AutoAwesome } from "@mui/icons-material";
import useCurrStore from "../../../store/use-curr-store";
import useResponseStore from "../../../store/use-response-store";
import useDimStore from "../../../store/use-dim-store";
import DatabaseManager from "../../../db/database-manager";
import useSelectedStore from "../../../store/use-selected-store";
import { dimensionsToAxes } from "../scatter-space/scatter-space.helper";
import { allDimensionFiltersOff, blockIsFilteredIn } from "./variation-block.helper";
import { addSimilarNodesToSpace } from "../../../util/space-generation-util";
import { CircularProgress } from "@mui/material";
import useEditorStore from "../../../store/use-editor-store";



export const VariationBlock = ({ block, zoom, color, scaleIn }) => {

  const {dimensionMap, selectedLabelIds,  nodeMap, setNodeMap, currBlockId, wantedNodes, keywordNodes } = useCurrStore();
  const {responseId, setResponseId} = useResponseStore();
  const {setSelectedResponse} = useSelectedStore();
  const {dimensions} = useDimStore();
  const [loadingMore, setLoadingMore] = useState(false);
  const {api,editedMap} = useEditorStore();
  const axes = dimensionsToAxes(dimensions)
  const {myFav} = useDimStore();
  const animationClass = scaleIn ? 'scale-in' : 'scale-out';

  // handler for opening detail sidebar
  const onClickHandler = (block: any) => {
    // if the current block in the editedMap is true, add a new block; otherwise, simply set selected response and response id
    if (editedMap[currBlockId]) { // the block is edited
      const pattern = /Prompt: (.*?)\n####/s;
      const match = block["Prompt"].match(pattern);

      let prompt = "";
      if (match && match[0]) {
        // remove Prompt: and ####
        prompt = match[0].substring(8, match[0].length - 5);
      } else {
        prompt = "Prompt not found.";
        console.log("Fail to extract prompt.");
      }

      const blockToAdd = {
        type: 'AiTool', 
        data: {
          text: block.Result,
          id: currBlockId,
          query: prompt,
          context: block.Context,
          resId: block.ID,
        //   aiPanelRef: response.aiPanelRef
        }
      };
      // console.log("block count", api.blocks.getBlocksCount())
      api.blocks.insert(blockToAdd.type, blockToAdd.data, null, api.blocks.getBlocksCount());
      DatabaseManager.postBlock(currBlockId, prompt, block.Result, block.ID);

      setSelectedResponse(currBlockId, block);
      setResponseId(block.ID);
      editedMap[currBlockId] = false; //since new block is added, set the editedMap to false
      
    } else { // the block is not edited
      console.log("edited map", editedMap)
      setSelectedResponse(currBlockId, block);
      setResponseId(block.ID);
    }

  };

  const isWantedNode = (nodeId) => {
    if (keywordNodes.size === 0) {
      if (wantedNodes.size === 0) {
        // If there are no wanted nodes, everything is wanted
        // console.log('isWantedNode empty wanted')
        return true;
      }
      const isNodeInWantedNodes = wantedNodes.has(nodeId);
      return isNodeInWantedNodes;
    } else {
      // console.log('isWantedNode keyword nodes not have')
      return keywordNodes.has(nodeId);
    }
  }
  
  const isNewNode = (nodeId) => {
    if (keywordNodes.size === 0) {
      return false;
    }
    return keywordNodes.has(nodeId);
  }

  const onBookmarkHandler = (block) => {
    // deactive current onclick listener
    block.IsMyFav = !block.IsMyFav;
    // setSelectedResponse(currBlockId, block);
    // setResponseId(block.ID);
  }

  const onSelectedHandler = (block) => {
    // if the current block in the editedMap is true, add a new block; otherwise, simply set selected response and response id
    if (editedMap[currBlockId]) { // the block is edited
      // add a new block
      const blockToAdd = {
        type: 'AiTool', 
        data: {
          text: block.Result,
          id: currBlockId,
          query: block.Result,
          context: block.Context,
          resId: block.ID,
        }
      };
      // set block style that the background color is light blue
      // console.log("blockId is ", this.blockId)
      // this.blockIndex = api.blocks.getCurrentBlockIndex()
      // console.log("block count", api.blocks.getBlocksCount())
      api.blocks.insert(blockToAdd.type, blockToAdd.data, null, api.blocks.getBlocksCount());
      setSelectedResponse(currBlockId, block);
      setResponseId(block.ID);
      
    } else { // the block is not edited
      // console.log("edited map", editedMap)
      setSelectedResponse(currBlockId, block);
      setResponseId(block.ID);
    }
  }

  const nodeHasSelectedLabel = (selectedLabelIds): boolean => {
    if (selectedLabelIds.x >= 0) {
      // Only x axis selected
      return block.Dimension[axes.x.type][axes.x.name] === dimensionMap[axes.x.name].values[selectedLabelIds.x]
    }
    if (selectedLabelIds.y >= 0) {
      // Only y axis selected
      return block.Dimension[axes.y.type][axes.y.name] === dimensionMap[axes.y.name].values[selectedLabelIds.y]
    }
    return false
  }

  const someNodeSelected = (selectedLabelIds) => {
    return selectedLabelIds.x >= 0 || selectedLabelIds.y >= 0
  }

  const nodeClassName = useCallback(() => {
    // if ((nodeHasSelectedLabel(selectedLabelIds) || (blockIsFilteredIn(dimensionMap, block) && !(someNodeSelected(selectedLabelIds) && allDimensionFiltersOff(dimensionMap))))){
    //   // n F
    //   console.log('it is not low opacity because nodehasselectedlabel ' + (nodeHasSelectedLabel(selectedLabelIds) ? 'node has selected label' : 'block is filtered in'));
    //   // b T
    //   console.log('it is not low opacity because block is filtered in ' + (blockIsFilteredIn(dimensionMap, block) ? 'block is filtered in' : 'some node selected and all dimension filters off'));
    //   // s F
    //   console.log('it is not low opacity because some node selected and all dimension filters off ' + (someNodeSelected(selectedLabelIds) && allDimensionFiltersOff(dimensionMap) ? 'some node selected and all dimension filters off' : ''));
    //   // a T
    //   console.log('it is not low opacity because all dimension filters off ' + (allDimensionFiltersOff(dimensionMap) ? 'all dimension filters off' : ''));
    // }

    // if (((myFav && !block.IsMyFav) || !isWantedNode(block.ID))) {
    //   console.log("opacity because of myFav")
    //   console.log("opacity because of" + (!isWantedNode(block.ID) ? 'is wanted node' : 'myFav'))
    // }

    // scale in and out transition -> ${animationClass} 
    return `${block.ID === responseId ? 'outlined' : ''} ${(nodeHasSelectedLabel(selectedLabelIds) || (blockIsFilteredIn(dimensionMap, block) && !(someNodeSelected(selectedLabelIds) && allDimensionFiltersOff(dimensionMap)))) ? '' : 'low-opacity'} ${((myFav && !block.IsMyFav) || !isWantedNode(block.ID)) ? 'low-opacity' : ''}` // Need to add, if no filters present, hover should cover thing.
  }, [block.IsMyFav, myFav, zoom, animationClass, selectedLabelIds, axes])

// b n O
// T T T
// T F T
// F T T
// F F F

  if (zoom <= 1.5) {
    return <div key={block.ID + 'dot'} className={`block block-dot ${nodeClassName()}`} style={{background: color}} onClick= {()=>onClickHandler(block)}/>
  } else if (zoom <= 3) {
    return <div className={`block block-title ${nodeClassName()}`} style={{background: color+'99'}} onClick= {()=>onClickHandler(block)}>
      {block.Title}
      <div className="labels">
          {block.Keywords.map(keyword => <DimensionLabel {...{keyword}} />)}
      </div>
    </div>;
    // Plan: prerender all the keywords, see if that will make things worse or better???
  } else if (zoom <= 7) {
    return <div key={block.ID + 'labels'} className={`block-labels ${nodeClassName()}`} style={{background: color+'99'}} onClick= {()=>onClickHandler(block)}>
      <div className="centered-title">
        <h6>{block.Title}</h6>
      </div>
      {/* <div className="content-section">
        <p className="keywords-title">Keywords:</p>
      </div> */}
      <div className="labels">
          {block.Keywords.map(keyword => <DimensionLabel {...{keyword}} />)}
      </div>
      {/* <DetailsFooter {...{block, loadingMore, setLoadingMore, onBookmarkHandler, onClickHandler, onSelectedHandler, nodeMap, setNodeMap}} /> */}
  </div>;
  } else if (zoom <= 12) {
    return <div key={block.ID + 'sum'} className={`block-sum ${nodeClassName()}`} style={{background: color+'99'}} onClick= {()=>onClickHandler(block)}>
      <div className="centered-title">
        <h6>{block.Title}</h6>
      </div>
      <div className="content-section">
        <p className="summary-title">Summary:</p>
          <p>{block.Summary}</p>
        <p className="summary-title">Structure:</p>
          <p>{block.Structure}</p>
      </div>
      {/* Attributes */}
      <p className="summary-title">Attributes:</p>
      <div className="labels">
        {Object.entries(block.Dimension.categorical).map(([key, value]) => <DimensionLabel {...{keyword: `${key} : ${value}`}} />)}
      </div>
      {/* <DetailsFooter {...{block, loadingMore, setLoadingMore, onBookmarkHandler, onClickHandler, onSelectedHandler, nodeMap, setNodeMap}} /> */}
      <DetailsFooter {...{block, onBookmarkHandler, onClickHandler, onSelectedHandler,}} />
    </div>;
  } else {
    return <div key={block.ID + 'full'} className={`block-full ${nodeClassName()}`} style={{background: color+'99'}} onClick= {()=>onClickHandler(block)}>
      <div>
        <div className="centered-title">
          <h6>{block.Title}</h6>
        </div>
        <p style={{ whiteSpace: 'pre-wrap'}}>{block.Result}</p>
        {/* Attributes */}
        <p className="summary-title">Attributes:</p>
        <div className="labels">
          {Object.entries(block.Dimension.categorical).map(([key, value]) => <DimensionLabel {...{keyword: `${key} : ${value}`}} />)}
        </div>
        {/* <div className="related-sentences">
          <h6>Sentences Related to Response</h6>
          <i>This is a sentence.</i>
        </div> */}
        <DetailsFooter {...{block, loadingMore, setLoadingMore, onBookmarkHandler, onClickHandler, onSelectedHandler, nodeMap, setNodeMap}} />
      </div>
    </div>;
  }
};

const DetailsFooter = ({block, loadingMore, setLoadingMore, onBookmarkHandler, onClickHandler, onSelectedHandler, nodeMap, setNodeMap}) => (
  <div className="details-footer">
    <button onClick={() => {
      if (loadingMore) return;
      setLoadingMore(true)
      addSimilarNodesToSpace(block, nodeMap, setNodeMap).then(data => {
      setLoadingMore(false);
      })
    }}>
      {
        !loadingMore ?
        <div className="icon-button">
          <AutoAwesome style={{color: '#777', width: '20px', height: '20px'}} />
          More Like This
        </div> :
        <div>
          <CircularProgress style={{color: '#777'}} size={20} />
          Generating Similar Responses...
        </div>
      }
    </button>
    <button onClick={() => onBookmarkHandler(block)} style={{
      background: block.IsMyFav ? '#1b1b1b99' : '',
    }}>
      <Bookmark style={{color: block.IsMyFav ? '#fff' : '#aaa', width: '20px', height: '20px'}}/>
    </button>
  </div>
)