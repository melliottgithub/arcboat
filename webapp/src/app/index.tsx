import React from 'react';
import Logs from '../logs';

function App() {
  return (
    <div className="flex flex-column m-0 surface-50 min-h-screen">
      <h1 className="ml-2 text-900 font-medium">Upload logs</h1>
      <Logs />
    </div>
  );
}

export default App;
