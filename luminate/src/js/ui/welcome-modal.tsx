// a modal that shows up on the first visit to the site
// and prompts the user to enter their open ai api key

import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Tooltip } from '@mui/material';
import {Settings} from '@mui/icons-material';
import './welcome-modal.scss';
import DatabaseManager from '../db/database-manager';

export function WelcomeModal() {
  const [open, setOpen] = useState(true);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const apiToken = data.get('openai-api');
    // save data into env variables
    saveEnvVal('VITE_OPENAI_API_KEY', apiToken as string);
    handleClose();
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="setting-modal"
        aria-describedby="setting-modal-api-key-and-batch-size"
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
          <h4>Welcome to Luminate 👋</h4>
          <p>
            Luminate is a research tool for brainstorming and writing.
          </p>
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