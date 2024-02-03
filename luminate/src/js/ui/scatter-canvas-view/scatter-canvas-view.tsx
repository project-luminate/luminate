import React, { useEffect, useReducer, useState } from "react"
import { ScatterSpace } from "../visualization/scatter-space/scatter-space"

import './scatter-canvas-view.scss';
import { ScatterPanel } from "../visualization/scatter-panel/scatter-panel";
import DatabaseManager from "../../db/database-manager";
import useCurrStore from "../../store/use-curr-store";
import useDimStore from "../../store/use-dim-store";
import { AxisX } from "../visualization/axis/axis-x";
import { AxisY } from "../visualization/axis/axis-y";
import { Camera } from "../visualization/scatter-space/scatter-space.zui";
import { dimensionsToAxes } from "../visualization/scatter-space/scatter-space.helper";

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
      console.log("[Warning] data undefined", " current block Id: " + currBlockId);
      return;
    }
    setNodeMap(data);
    setAllNodeMap(data);
    // remove all dimensions in the store
    setDimensions([]);
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