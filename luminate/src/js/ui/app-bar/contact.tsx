import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Tooltip } from '@mui/material';
import {SupportAgent} from '@mui/icons-material';
import './contact.scss';

export function ContactModal() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    console.log('open');
  }
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Tooltip title="Contact Us">
        <button className="contact-button" onClick={handleOpen}>
              <SupportAgent style={{color: '#aaa'}} />
        </button>
      </Tooltip>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="contact-modal"
        aria-describedby="contact-modal-api-key-and-batch-size"
        className='contact-modal'
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
          <h4>Contact Us</h4>
          <p className='note'>
            If you have any questions, comments, or concerns, please reach out to us at  
            <a href="mailto:luminate.system@gmail.com"> luminate.system@gmail.com</a>
          </p>
        </Box>
      </Modal>
    </div>
  );
}