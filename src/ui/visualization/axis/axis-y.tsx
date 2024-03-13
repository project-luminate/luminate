import React, { useReducer, useState } from "react"
import { Axes, Dimension, normalize } from "../scatter-space/scatter-space.helper"
import { Camera } from "../scatter-space/scatter-space.zui"
import DatabaseManager from "../../../db/database-manager"
import { darkenHexColor, getAxisLabelColor, getCenterAxisLabelFromNodes, getNumericalAxisSteps, labelIsFilteredIn, numAxisSteps } from "./axis.helper"
import useCurrStore from "../../../store/use-curr-store"
import { colors } from "../../../util/util"
import { addLabelToSpace } from "../../../util/space-generation-util"
import { CircularProgress } from "@mui/material";
import DimensionMenu from './dimension-dropdown';

export const AxisY = ({dimension, axes, camera, nodes}: {dimension: Dimension, axes: Axes, camera: Camera, nodes: any[]}) => {

  const {currId, nodeMap, setNodeMap, selectedLabelIds, setSelectedLabelIds, dimensionMap, setDimensionMap, addFilteredLabel, removeFilteredLabel} = useCurrStore();
  const [addLabelInput, setAddLabelInput] = useState('');
  const [loadingGrow, setLoadingGrow] = useState(false);
  const [keptLabel, setKeptLabel] = useState(-1);

  return (
    <div className="axis y fade-in">
      <div className='axis-box'>
        <div style={{
          position: 'relative',
          height: '100%',
          // left: '30px',
          translate: `0 calc(${camera.y}px - 10%)`,
          scale: `${camera.z}`,
          transformOrigin: `0px 0px`,
        }}>
          {
            dimension.type === 'null' ?
            <></> :
            dimension.values.map((label, i) =>
              <div key={`${label}-${i}`} style={{
                height: '20px',
                position: 'absolute',
                top: `calc(60% + ${getCenterAxisLabelFromNodes('y', nodes, dimension, label)-10}px)`,
                left: 0,
                scale: `${1/camera.z}`,
                textAlign: 'right',
                color: getAxisLabelColor(nodes[0], axes.x.values.length+i, i, dimension),
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
                  setSelectedLabelIds(-1, i);
                }}
                onMouseOut={() => {
                  setSelectedLabelIds(-1, -2);
                }}
                style={{
                  zIndex: '1000',
                  background: selectedLabelIds.y === i || labelIsFilteredIn(dimension, label) ? getAxisLabelColor(nodes[0], axes.x.values.length+i, i, dimension) : '',
                  color: selectedLabelIds.y === i || labelIsFilteredIn(dimension, label) ? 'white' : '',
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
        {
          axes.x.type !== 'null' &&
          <div className='axis-title'><DimensionMenu position="y" label={dimension} /></div>
        }
      </div>
    </div>
  )

}