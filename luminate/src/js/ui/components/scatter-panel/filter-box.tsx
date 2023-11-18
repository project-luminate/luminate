import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import useDimStore from '../../../store/use-dim-store';
import ValueChipArray from './value-chip-array/value-chip-array';
// import ValueChipArray from './value-chip-array';

export const FilterBox = ({d}) => {
    const {labels, dimensions, addLabel, setDimensions, toggleCompareMode, isCompareMode, showMyFav, toggleMyFav} = useDimStore();
    const [value, setValue] = useState(d.values)
    
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function valuetext(value) {
        return `${value}`;
    }

    return (
        <Box sx={{ display: 'flex', marginTop: '20px', width: '700px', flexDirection: 'row', paddingLeft: '48px', paddingRight: '48px'}}>
            <Grid container>
            <Grid item xs={3}>
                <Typography variant='body2' sx={{marginRight: '10px'}}>
                    {d.name}
                </Typography>
            </Grid>
            <Grid item xs={9}>
            {
                d.type === 'categorical' || d.type ==='ordinal'
                ? <ValueChipArray dimension={d} />
                : (
                < div style={{ display: 'flex', flexDirection: 'row'}}>
                <Typography variant='body2' sx={{marginRight: '24px'}}>
                    {d && d.values && d.values[0] !== undefined ? d.values[0] : "N/A"}
                </Typography>
                <Slider
                    getAriaLabel={() => `${d.name}}range`}
                    value={value}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                    max=  {d && d.values && d.values[1] !== undefined ? d.values[1] : "N/A"}
                    min=  {d && d.values && d.values[0] !== undefined ? d.values[0] : "N/A"}
                />
                <Typography variant='body2' sx={{marginLeft: '24px'}}>
                    {d && d.values && d.values[1] !== undefined ? d.values[1] : "N/A"}
                </Typography>
                </div>
                )
            }
            </Grid>
            </Grid>
        </Box>
    )

}