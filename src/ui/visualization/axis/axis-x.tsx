import useCurrStore from '../../../store/use-curr-store';
import { colors } from '../../../util/util';
import DatabaseManager from "../../../db/database-manager";
import { Dimension, Label, getDimensionOrder, getOrdinalLabelOrder, nodeColor, normalize } from '../scatter-space/scatter-space.helper';
import { Camera } from '../scatter-space/scatter-space.zui';
import { darkenHexColor, getAxisLabelColor, getCenterAxisLabelFromNodes, getNumericalAxisSteps, labelIsFilteredIn as labelIsFilteredIn, numAxisSteps } from './axis.helper';
import './axis.scss';

import React, { useEffect, useReducer, useState } from "react"
import { addLabelToSpace, growSpace } from '../../../util/space-generation-util';
import { CircularProgress } from '@mui/material';

import DimensionMenu from './dimension-dropdown';

export const AxisX = ({dimension, camera, nodes}: {dimension: Dimension, camera: Camera, nodes: any[]}) => {

  const {currId, nodeMap, setNodeMap, selectedLabelIds, setSelectedLabelIds, dimensionMap, setDimensionMap, addFilteredLabel, removeFilteredLabel} = useCurrStore();
  const [addLabelInput, setAddLabelInput] = useState('');
  const [loadingGrow, setLoadingGrow] = useState(false);
  const [keptLabel, setKeptLabel] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  // console.log('dimension in axis', dimension)

  const toggleDropdown = () => {
    console.log('toggle dropdown')
    setShowDropdown(prev => !prev);
  }

  return (
    <div className="axis x fade-in">
      <div className='axis-box'>
        <div style={{
          position: 'relative',
          // translate: `${camera.z * camera.x}px 0`,
          // transform: `translate(calc((50% * ${camera.z}px) + ${camera.x}px), 0)`,
          // translate: `calc((50% * ${camera.z}px) + ${camera.x}px) 0`,
          // left: `${camera.z*camera.x}px`,
          translate: `calc(${camera.x}px - 10%) 0`,
          scale: `${camera.z}`,
          transformOrigin: `0px 0px`,
        }}>
          {
            dimension.type === 'null' ?
            <></> :
            dimension.values.map((label, i) =>
              <div key={`${label}-${i}`} style={{
                width: '20px',
                position: 'absolute',
                top: 0,
                left: `calc(60% + ${getCenterAxisLabelFromNodes('x', nodes, dimension, label)-85}px)`,
                scale: `${1/camera.z}`,
                // left: `calc(10% + (90% / ${dimension.values.length} * ${i}))`,
                textAlign: 'center',
                // transformOrigin: `0px 0px`,
                color: getAxisLabelColor(nodes[0], i, i, dimension), //colors[getOrdinalLabelOrder(node, axes.x)],
              }}>
                <div className='axis-tick'/>
                <div className='axis-label'
                onClick={() => {
                  if ((dimensionMap[dimension.name]?.filtered as string[])?.includes(label)) {
                    removeFilteredLabel(dimension.name, label);
                  } else {
                    addFilteredLabel(dimension.name, label);
                  }
                }}
                onMouseOver={() => {
                  setSelectedLabelIds(i, -1);
                }}
                onMouseOut={() => {
                  setSelectedLabelIds(-2, -1);
                }}
                style={{
                  zIndex: '10000',
                  background: selectedLabelIds.x === i || labelIsFilteredIn(dimension, label) ? getAxisLabelColor(nodes[0], i, i, dimension) : '',
                  color: selectedLabelIds.x === i || labelIsFilteredIn(dimension, label) ? 'white' : '',
                  borderRadius: '4px',
                  fontWeight: labelIsFilteredIn(dimension, label) ? '600' : '',
                }}
                >{label}</div>
              </div>
            )
          }
        </div>
        {
          dimension.type !== 'null' &&
          <div className='axis-add-label x'>
            {
              loadingGrow ? 
              <>
                <CircularProgress style={{color: '#777'}} size={20} />
                <div>Adding {addLabelInput}...</div>
              </>:
              <form onSubmit={(e) => {
                e.preventDefault()
                if (loadingGrow || !addLabelInput.trim()) return;
                if (dimension.type !== 'null') {
                  dimensionMap[dimension.name].values.push(addLabelInput);
                  setDimensionMap(dimensionMap);
                  setLoadingGrow(true);
                  const prompt = DatabaseManager.getBlock(currId)?.Title;
                  addLabelToSpace(dimensionMap, {
                    dimensionId: dimension.id,
                    name: addLabelInput,
                    type: dimension.type,
                  }, 10, prompt, nodeMap, setNodeMap).then(data => {
                    setLoadingGrow(false);
                    setAddLabelInput('');
                  })
                }
              }}>
                <input type='text' placeholder='Add new label' value={addLabelInput} onChange={(e: any) => {
                  setAddLabelInput(e.target.value)
                }}></input>
                <button>+</button>
              </form>
            }
          </div>
        }
        {/* <div className='axis-title' >{dimension.name}</div> */}
        <div className='axis-title'>
          <DimensionMenu position="x" label={dimension} />
        </div>
      </div>
    </div>
  )
}