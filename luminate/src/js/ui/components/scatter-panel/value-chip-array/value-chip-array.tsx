import * as React from 'react';
import { styled } from '@mui/material/styles';
import * as bootstrap from 'bootstrap';

// components
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import Typography from '@mui/material/Typography';
import ToggleValueChip from './toggle-value-chip';

// utils
import DatabaseManager from '../../../../db/database-manager';
import useDimStore from '../../../../store/use-dim-store';
import useCurrStore from '../../../../store/use-curr-store';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function ValueChipArray({dimension}) {
  const {labels, dimensions, addLabel, setDimensions, toggleCompareMode, isCompareMode, showMyFav, toggleMyFav} = useDimStore();
  const {nodeMap, setNodeMap, allNodeMap, setAllNodeMap} = useCurrStore();
  const {wantedNodes, addWantedNode, removeWantedNode, setWantedNodes} = useCurrStore();
  React.useEffect(()=>{
    if (labels.length === 0) {
      setWantedNodes(new Set());
      return;
    }
    // only add nodes that match any of labels requirements to the wantedNode set
    setWantedNodes(new Set());
    Object.values(allNodeMap).forEach((node: any) => {
      // for all the dimensions in labels, check if the value of the node in that dimension matches the value in labels
      // console.log(labels);
      // console.log(node);
      var match = true;
      Object.entries(labels).forEach(([dimension, value]) => {
        // if (!value?.has(node.Dimension.categorical[dimension]) && !value?.has(!node.Dimension?.ordinal ? '' : node.Dimension?.ordinal[dimension])) {
        if (!value?.has(node.Dimension.categorical[dimension]) && !value?.has(node.Dimension?.ordinal[dimension])) {
          match = false;
          return;
        }
      });
      if (match)
      addWantedNode(node.ID);
    });

    console.log(wantedNodes);
    }, [labels])

     // for (let i = 0; i < labels.length; i++) {
      //   if ((labels[i].dimension in node.Dimension.categorical) && labels[i].value == node.Dimension.categorical[labels[i].dimension]) {
      //     addWantedNode(node.ID);
      //     break;
      //   }
      //   if ((labels[i].dimension in node.Dimension.ordinal) && labels[i].value == node.Dimension.ordinal[labels[i].dimension]) {
      //     addWantedNode(node.ID);
      //     break;
      //   }
      // }

  // React.useEffect(()=>{
  //   updateNodePositions(chipData);
  // }, [chipData])

  // const handleDelete = (chipToDelete) => () => {
  //   setChipData((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
  // };

  // const handleDrop = (event) => {
  //   event.preventDefault();
  //   const draggable = document.querySelector('.dragging');
  //   const dimension = draggable.textContent;
  //   console.log(dimension);
  //   if (dimension) {
  //     if (chipData.length === 2) {
  //       var toast = new bootstrap.Toast(document.getElementById('error-toast'));
  //       document.getElementById('error-toast-text').textContent = "Maximum 2 Dimensions";
  //       toast.show();
  //       return;
  //     }
  //     // add key and label to chipData
  //     setChipData((chips) => [...chips, { key: chips.length, label: dimension }])
  //   }
  // };

  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'start',
        flexWrap: 'wrap',
        listStyle: 'none',
        p: 0.5,
        m: 0,
        maxHeight: '100px',
        width: '100%',
        marginRight: '5px',
        overflow: 'hidden',
        borderRadius: '10px',
      }}
      variant='outlined'
      component="ul"
    >
      {dimension.values.length === 0 ? (
        <Typography
          variant="body2"
          style={{ textAlign: 'center', color: '#999', padding: '10px' }}
        >
          Error: No Dimensions In This Block
        </Typography>
      ) : null}

      {dimension.values.map((value) => {
        return (
          <ListItem key={value}>
            <ToggleValueChip dim={dimension} value={value} />
          </ListItem>
        );
      })}
    </Paper>
  );
}