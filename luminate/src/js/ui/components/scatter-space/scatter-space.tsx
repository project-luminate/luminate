import React, { useRef, useState, useEffect, useReducer } from 'react';
import ReactFlow, { Background, BackgroundVariant, Panel, useNodesState, useEdgesState, addEdge, MiniMap, Controls } from 'reactflow';
import DatabaseManager from "../../../db/database-manager";
import { useForceLayout } from '../../hooks/use-force-layout.js';
import { SemanticLevelPanel } from '../semantic-level-panel/semantic-level-panel.jsx';

import './scatter-space.scss';
import { VariationBlock } from '../variation-block/variation-block.js';
import { Box, Camera, getViewport, getViewportFromRect, identityViewport, zoomCamera } from './scatter-space.zui.js';
import { useCanvasViewport } from '../../hooks/use-canvas-viewport.js';
import useCurrStore from '../../../store/use-curr-store';
import useDimStore from '../../../store/use-dim-store.jsx';
import { Label, dimensionsToAxes, nodeColor } from './scatter-space.helper.js';
import { useStore } from 'zustand';
import * as bootstrap from 'bootstrap';
import { growSpace } from '../../../util/space-generation-util.jsx';
import { allDimensionFiltersOff } from '../variation-block/variation-block.helper.js';
import { SwitchAccessShortcutAdd } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

const shift = 620;

export const ScatterSpace = ({camera, setCamera}) => {

  // ZUI
  const containerRef = useRef<null | HTMLDivElement>(null);
  const canvasRef = useRef<null | HTMLDivElement>(null);

  const { nodeMap, setNodeMap, dimensionMap, selectedLabelIds } = useCurrStore();
  const { labels, dimensions } = useDimStore();

  let {zoom: zoomHelper, gotoLowestSemanticLevel} = useCanvasViewport(setCamera, containerRef)
  let viewport = identityViewport
  const myFav = useDimStore((state) => state.myFav);
  const [prevZoom, setPrevZoom] = useState(1);
  const [scaleIn, setScaleIn] = useState(true);
  const [scrolling, setScrolling] = useState(false);

  const rect = containerRef.current?.getBoundingClientRect()

  const [loadingGrow, setLoadingGrow] = useState(false);

  const {currBlockId} = useCurrStore();

  // if (rect) {
  // const {startSimulation, stopSimulation} = 
  useForceLayout(
    rect,
    true, nodeMap, setNodeMap, camera.z, {x: 0, y: 0},
    dimensionsToAxes(dimensions)
  );
  // const { startSimulation, stopSimulation } = useBlockLayout({width: window.outerWidth-shift, height: window.outerHeight}, true, blockMap, setBlockMap, zoom, {x: 0, y: 0});
  const [currId, setcurrId] = useCurrStore((state) => [state.currBlockId, state.setCurrBlockId]);

  /* ——— CODE TO LISTEN FOR SCALE IN AND OUT ——— */
  // const getCondition = (zoom) => {
  //   if (camera.z <= 1.5) return 'dot';
  //   if (camera.z <= 3) return 'title';
  //   if (camera.z <= 7) return 'labels';
  //   if (camera.z <= 12) return 'sum';
  //   return 'full';
  // };

  // const [currentCondition, setCurrentCondition] = useState(getCondition(camera.z));

  // useEffect(() => {
  //   const newCondition = getCondition(camera.z);
  //   if (currentCondition !== newCondition) {
  //     setScaleIn(camera.z > prevZoom); // Compare current zoom with previous zoom
  //     setCurrentCondition(newCondition);
  //   }
  //   setPrevZoom(camera.z); // Update previous zoom
  // }, [camera.z, currentCondition, prevZoom]);

  /* ——————————————————————————————————————————— */


  if (canvasRef.current) {
    viewport = getViewportFromRect(camera, canvasRef.current.getBoundingClientRect())
  }

  return (
    <div className='scatter-space' id='scatter-space' ref={containerRef}
      onMouseMove={(event) => {
        setScrolling(false)
      }}
      onWheel={(event) => {
        if (!scrolling) {
          setScrolling(true);
        }
      }}
    >
      {
        // If at least one filter is on, show add more nodes
        (!allDimensionFiltersOff(dimensionMap)) &&
        <button className='panel-item' style={{
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 18px',
          position: 'absolute',
          top: '100px',
          left: '50%',
          translate: '-50% 0',
          zIndex: 50,
        }}
          onClick={() => {
            if (loadingGrow) return;
            const axisLabels: Label[] = [];
            const axes = dimensionsToAxes(dimensions)
            if (axes.x && axes.x.type !== 'null' && selectedLabelIds.x) {
              axisLabels.push({
                dimensionId: axes.x.id,
                name: axes.x.values[selectedLabelIds.x],
                type: axes.x.type,
              })
            }
            if (axes.y && axes.y.type !== 'null' && selectedLabelIds.y) {
              axisLabels.push({
                dimensionId: axes.y.id,
                name: axes.y.values[selectedLabelIds.y],
                type: axes.y.type,
              })
            }
            setLoadingGrow(true);
            const prompt = DatabaseManager.getBlock(currId)?.Title;
            growSpace(currId, dimensionMap, axisLabels, 5, prompt, nodeMap, setNodeMap).then(data => {
              setLoadingGrow(false);
            })
        }}
        >
          {
            !loadingGrow ?
            <>
              <SwitchAccessShortcutAdd style={{color: '#777'}} />
              Add More
            </> :
            <>
              <CircularProgress style={{color: '#777'}} size={20} />
              Generating More Responses...
            </>
          }
        </button>
      }
      {/* <CanvasPanel {...{undefined, undefined}}/> */}
      {/* <div style={{width: '4px', height: '4px', position: 'absolute', left: cursorPosition.x, top: cursorPosition.y, background: 'red'}}/>
      <div style={{width: '4px', height: '4px', position: 'absolute', left: zoomCenter.x, top: zoomCenter.y, background: 'blue'}}/>
      <div style={{width: '4px', height: '4px', position: 'absolute', left: prevCursorPosition.x, top: prevCursorPosition.y, background: 'green'}}/> */}
      <div className='scatter-canvas' id='scatter-canvas' ref={canvasRef} style={{
        position: 'absolute',
        translate: `${camera.x}px ${camera.y}px`,
        scale: `${camera.z}`,
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        transformOrigin: `0px 0px`,
        // transformOrigin: `${prevCursorPosition.x}px ${prevCursorPosition.y}px`,
        // transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
      }}>
        {/* <div>
          hello this is just a body
        </div> */}
        {
          Object.values(nodeMap).map((block:any, i) => {
            return(
            <div
              key={`${i}-${block.ID}`}
              style={{
                position: 'absolute',
                top: (rect?.height??0)/2 + block.y??0,
                left: (rect?.width??0)/2 + block.x??0,
                // top: block.y??0,//((block.y ?? 0) - prevCursorPosition.y) * zoom + prevCursorPosition.y,
                // left: block.x??0,//((block.x ?? 0) - prevCursorPosition.x) * zoom + prevCursorPosition.x,
                // top: ((block.y ?? 0) - cursorPosition.y) * zoom + cursorPosition.y,
                // left: ((block.x ?? 0) - cursorPosition.x) * zoom + cursorPosition.x,
                scale: ''+(1/camera.z),
                translate: '-50% -50%',
              }}
            >{
              <VariationBlock {...{block, zoom: camera.z, color: nodeColor(block, dimensionsToAxes(dimensions)), scaleIn: camera.z >= prevZoom}}/>
            }</div>
          )})
        }
      </div>
      {/* <div>
        <div>{Math.floor(camera.z * 100)}%</div>
        <div>x: {Math.floor(viewport.minX)}</div>
        <div>y: {Math.floor(viewport.minY)}</div>
        <div>width: {Math.floor(viewport.width)}</div>
        <div>height: {Math.floor(viewport.height)}</div>
      </div> */}
      <SemanticLevelPanel {...{zoom: camera.z, setZoomLevel: gotoLowestSemanticLevel}}/>

    </div>
  )
}