import React, { useEffect, useReducer, useState } from "react"
import { ScatterSpace } from "../components/scatter-space/scatter-space"
import CanvasPanel from "../react-flow-canvas/canvas-panel"

import './scatter-canvas-view.scss';
import { ScatterPanel } from "../components/scatter-panel/scatter-panel";
import {SemanticLevelPanel} from "../components/semantic-level-panel/semantic-level-panel";
import DatabaseManager from "../../db/database-manager";
import useCurrStore from "../../store/use-curr-store";
import useDimStore from "../../store/use-dim-store";
import { AxisX } from "../components/axis/axis-x";
import { AxisY } from "../components/axis/axis-y";
import { Camera } from "../components/scatter-space/scatter-space.zui";
import { dimensionsToAxes } from "../components/scatter-space/scatter-space.helper";

export const ScatterCanvasView = () => {

  const {currBlockId, setCurrBlockId, nodeMap, setNodeMap, allNodeMap, setAllNodeMap,setDimensionMap } = useCurrStore();
  const {dimensions, labels, addDimension, setDimensions } = useDimStore();

  const axes = dimensionsToAxes(dimensions);

  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 0,
    z: 1,
  });

  const [,forceUpdate] = useState(0);
  // NOTE: this is essentially an infinite loop to make state change happen every tick.
  useEffect(() => {
    forceUpdate(x => x+1);
  }, [Object.values(nodeMap)]);

  // when currentId change, update the nodes
  React.useEffect(() => {
    const data = DatabaseManager.getAllData(currBlockId);
    if (data === undefined) {
      console.log("currId", currBlockId);
      return;
    }
    console.log(data)
    setNodeMap(data);
    setAllNodeMap(data);
    // remove all dimensions in the store
    setDimensions([]);
    // remove all labels in the store
    // setLabels([]);

    forceUpdate(x => x+1);
  }, [currBlockId]);


  // const setXDim = () => {
  //   setDimensions(prev =>({
  //     ...prev,
  //     x: 'Categorical',
  //   }))
  // }
  // Given the entire list of responses,
  // build an object 

  // how to categorize these clusters
  // 1. consider two ways:
  //    - building clusters first (objects) then separated
  //    - passing in, then cluster through d3.

  // update the nodes when the dimensions are changed
  const updateNodePositions = (selectedDimension) => {
    // setDimensions(selectedDimension);
  };

  return (
    <div className='scatter-canvas-view'>
      <ScatterPanel {...{updateNodePositions, camera, setCamera}} />
      <ScatterSpace {...{camera, setCamera}} />     
      <AxisX {...{dimension: axes.x, camera, nodes: Object.values(nodeMap)}}/>
      <AxisY {...{dimension: axes.y, axes, camera, nodes: Object.values(nodeMap)}}/>
    </div>
  )

}