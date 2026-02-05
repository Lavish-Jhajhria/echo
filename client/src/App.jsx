/**
 * Root application layout for Echo Feedback Collector.
 */

import React from 'react';
import HomePage from './pages/HomePage';

/**
 * Renders the main application shell.
 * @returns {JSX.Element} React component
 */
const App = () => {
  return (
    <div className="min-h-full bg-gradient-to-b from-navy-900 via-navy-900 to-slate-950 text-slate-100">
      <HomePage />
    </div>
  );
};

export default App;

