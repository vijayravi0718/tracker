// src/App.js
import React from 'react';
import Tracker from './tracker';
import InstallPromptButton from './InstallPromptButton';
import { Container, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Habit Tracker
      </Typography>

      {/* 🔽 Install Button */}
      <InstallPromptButton />

      {/* 🔽 Your Main Tracker App */}
      <Tracker />
    </Container>
  );
}

export default App;
