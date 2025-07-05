// src/InstallPromptButton.js
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const InstallPromptButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
  const handler = (e) => {
    e.preventDefault();
    console.log('✅ Install prompt captured'); // 👈 Add this here
    setDeferredPrompt(e);
    setShowButton(true);
  };

  window.addEventListener('beforeinstallprompt', handler);

  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
}, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }

      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  if (!showButton) return null;

  return (
    <Button
      onClick={handleInstallClick}
      variant="contained"
      startIcon={<DownloadIcon />}
      sx={{ mt: 2 }}
    >
      Install App
    </Button>
  );
};

export default InstallPromptButton;