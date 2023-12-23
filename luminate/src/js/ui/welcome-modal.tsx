// a modal that shows up on the first visit to the site
// and prompts the user to enter their open ai api key

import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Tooltip } from '@mui/material';
import {Settings} from '@mui/icons-material';
import './api-input.scss';
import '../../db/database-manager';


export function ApiInputModal() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    console.log('open');
  }
  const handleClose = () => setOpen(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target.value);
    console.log(data.get('openai-api'));
    console.log('Settings saved');
    handleClose();
  };

  return (
    <div>
      <Tooltip title="Settings">
        <button className="api-input-button" onClick={handleOpen}>
              <Settings style={{color: '#aaa'}} />
        </button>
      </Tooltip>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="setting-modal"
        aria-describedby="etting-modal-api-key-and-batch-size"
        className='api-input-modal'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 3
          }}
        >
          <h4>Settings</h4>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="openai-api"
              label="Enter your OpenAPI Key"
              name="input"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="batch-size"
              label="Generation Batch Size"
              name="input"
              autoFocus
            />
            <p className='note'>
              Luminate will not save your OpenAI API key neither in a cookie, localStorage, nor server. 
              You will need to enter it every time you open the app.
              You may also download the source code and run it locally.
            </p>
            <button type="submit" className='submit-button'>
              Save
            </button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}