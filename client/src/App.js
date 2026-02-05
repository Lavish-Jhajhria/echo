/**
 * Top-level app shell for Echo.
 */

import React from 'react';
import HomePage from './pages/HomePage';

/**
 * Render the main layout.
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <div className="min-h-full bg-gradient-to-b from-navy-900 via-navy-900 to-slate-950 text-slate-100">
      <HomePage />
    </div>
  );
};

export default App;

