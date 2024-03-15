import React, { useState } from 'react';

// material ui
import Chip from '@mui/material/Chip';

// util
import useDimStore from '../../../../store/use-dim-store';
import useCurrStore from '../../../../store/use-curr-store';


const ToggleValueChip = ({dim, value}) => {
    // const addDimension = useDimStore((state) => state.addDimension)
    // const dimensions = useDimStore((state) => state.dimensions)
    // const removeDimension = useDimStore((state) => state.removeDimension)
    const addLabel = useDimStore((state) => state.addLabel)
    const labels = useDimStore((state) => state.labels)
    const removeLabel = useDimStore((state) => state.removeLabel)
    const {nodeMap, setNodeMap, dimensionMap, addFilteredLabel, removeFilteredLabel} = useCurrStore();

    const isInLabels = (d) => {
      if (Object.keys(labels).length === 0) {
        return false;
      }
      // if d.dimension is in labels and d.value is in labels[d.dimension]
      if (d.key in labels && labels[d.key].has(d.value)) {
          return true;
      }
      return false;
    };
    const d = {'key': `${dim.id}`, 'value': value};
    // push label to labels
    const [active, setActive] = useState(isInLabels(d));

    // React.useEffect(()=>{
    //     setActive(isInLabels(d));
    // }, [labels])


  return (
    <Chip
      label={value}
      variant={active ? 'filled' : 'outlined'}
      sx={{ margin: '2px' , backgroundColor: active ? '#9CCFE7' : '#FFFFFF'}}
      onClick={() =>{
        if ((dimensionMap[dim.name].filtered as string[])?.includes(value)) {
          removeFilteredLabel(dim.name, value);
        } else {
          addFilteredLabel(dim.name, value);
        }
        setActive(!active);
        if (active) {removeLabel(d);}
        else {addLabel(d);}
      }}
    />
  );
};

export default ToggleValueChip;