import React from 'react';
import Tracker from './tracker';
import InstallPromptButton from './InstallPromptButton';

function App() {
  return (
    <div>
      {/* <h1 style={{ textAlign: 'center' }}>Habit Tracker</h1> */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <InstallPromptButton />  {/* ✅ Important */}
      </div>
      <Tracker />
    </div>
  );
}

export default App;
