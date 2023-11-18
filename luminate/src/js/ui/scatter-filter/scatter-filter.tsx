import { Box, Grid, Typography, Slider } from "@mui/material"
import React, { useState } from "react"
import ValueChipArray from "../components/scatter-panel/value-chip-array/value-chip-array";

import useDimStore from '../../store/use-dim-store';
import { FilterBox } from "../components/scatter-panel/filter-box";
import useCurrStore from "../../store/use-curr-store";

import './scatter-filter.scss';

// The only reason why this component is outside of the components directory is because it's on the same UI level as the editor and canvas.
export const ScatterFilter = () => {

  const {dimensionMap} = useCurrStore();

  return (
    <div className='scatter-filter'>
      {
        !dimensionMap || Object.values(dimensionMap).length === 0 ?
        <i>Generate text to view filters!</i> :
        <Grid container>
          {Object.values(dimensionMap).map((dim: any) => {
            return (
              <Grid item sx={{display: 'flex', marginBottom:"5px", width:"100%"}} xs={12}>
                <FilterBox {...{d: dim}} />
              </Grid>
            )
          })}
        </Grid>
      }
    </div>
  )
}