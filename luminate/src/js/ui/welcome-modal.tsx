// a modal that shows up on the first visit to the site
// and prompts the user to enter their open ai api key
import './welcome-modal.scss';
import React, { useState } from 'react';
import { Modal, Box, TextField} from '@mui/material';
import { saveEnvVal } from '../util/util';

export function WelcomeModal() {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  }

  const handleSubmit = (event,reason) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const apiToken = data.get('openai-api');
    // save data into env variables
    saveEnvVal('VITE_OPENAI_API_KEY', apiToken as string);
    handleClose(event,reason);
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
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 3
          }}
        >
          <h4>Welcome to Luminate 👋</h4>
          <p>
            Luminate is a research prototype for human-AI text-based co-creation powered by GPT 3.5.
            To start off, please enter your OpenAI API Key in the text field below.
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
              You can find your Secret OpenAI API key in your <a href="https://platform.openai.com/account/api-keys" target="_blank">User Settings</a>
            </p>
            <p className='note'>
              Each prompt will results in around 82 requests and may cost upto $0.8 USD.
              You can find detailed information about the cost in  <a href="https://openai.com/pricing" target="_blank">Pricing</a>
            </p>
            <p className='note'>
              Luminate will not save your OpenAI API key neither in a cookie, localStorage, nor server. 
              You will need to enter it every time you open the app.
              You may also download the source code and run it locally.
            </p>
            <button type="submit" className='submit-button'>
              Play Luminate ⚗️
            </button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}