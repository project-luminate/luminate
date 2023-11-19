import React from 'react';
import * as bootstrap from 'bootstrap';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';


import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Box from '@mui/material/Box';

import DatabaseManager from '../../db/database-manager';
import useCurrStore from '../../store/use-curr-store';
import useResponseStore from '../../store/use-response-store';


const ModalHead = ({d}) => {
  const currBlockId = useCurrStore(state => state.currBlockId);
  console.log("currBlockId in modal head",currBlockId);
  const [isFav, setIsFav] = React.useState(DatabaseManager.checkFavorite(currBlockId,d['ID']));
  const { setResponseId, setResponse, setResponseDimensions, setGenerationState } = useResponseStore();

  const onCopyButtonClicked = () => {
    // copy the response text to the clipboard
    navigator.clipboard.writeText(d['Result']);
    // toast the user that the response is copied to the clipboard
    var toast = new bootstrap.Toast(document.getElementById('fav-toast'));
    // change the toast text to the response text
    document.getElementById('toast-text').textContent = "Response copied to clipboard";
    toast.show();
}

  const onAddFavButtonClicked = () => {
      if (isFav){
        DatabaseManager.changeFavorite(currBlockId,d['ID']);
        d.IsMyFav = false;
        var toast = new bootstrap.Toast(document.getElementById('fav-toast'));
        document.getElementById('toast-text').textContent = "Successfully removed the text from My Favourite";
        toast.show();
        setIsFav(!isFav);
      } else {
        DatabaseManager.changeFavorite(currBlockId,d['ID']);
        d.IsMyFav = true;
        var toast = new bootstrap.Toast(document.getElementById('fav-toast'));
        document.getElementById('toast-text').textContent = "Successfully added the text to My Favourite";
        toast.show();
        setIsFav(!isFav);
      }
  }

  const onSelectButtonClicked = () => {
    // set the response text in the editor
    setSelectedResponse(currBlockId, d);
    setResponseId(d['ID']);
  }


  const buttons = [
    <IconButton color="primary" aria-label="copu icon" onClick={onSelectButtonClicked}>
      <TaskAltIcon />
    </IconButton>,
    <IconButton color="primary" aria-label="bookmark icon" onClick={onAddFavButtonClicked}>
      { isFav ? <BookmarkIcon /> : <BookmarkBorderIcon /> }
    </IconButton>,
    <IconButton color="primary" aria-label="copu icon" onClick={onCopyButtonClicked}>
      <ContentCopyIcon />
    </IconButton>
  ];


  return (
    // <div className="d-flex justify-content-between align-items-center">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row', // Align items vertically
          justifyContent: 'space-between',
          alignItems: 'center',
          '& > *': {
            m: 1,
          },
          width: '100%',
        }}
      >
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        <Typography variant="h6" component="div" style={{padding: '10px', flex: '1', textAlign: 'center'}} id="response-id">{d.Title}</Typography>
        <ButtonGroup size="secondary" aria-label="medium secondary button group">
          {buttons}
        </ButtonGroup>
      </Box>
    // </div>
  );
};

export default ModalHead;
