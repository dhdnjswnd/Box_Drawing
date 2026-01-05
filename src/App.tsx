import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import CanvasTabs from './components/CanvasTabs';
import MainContent from './components/MainContent';
import './App.css';

const AppContent: React.FC = () => {
  const { canvases, addCanvas, incrementCanvasIdCounter } = useAppContext();

  // Initialize with one canvas if none exist
  useEffect(() => {
    if (canvases.length === 0) {
      const id = `canvas-${incrementCanvasIdCounter()}`;
      const name = `Canvas ${incrementCanvasIdCounter()}`;
      addCanvas({
        id,
        name,
        boxes: []
      });
    }
  }, []);

  return (
    <div id="app">
      <Header />
      <CanvasTabs />
      <MainContent />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
