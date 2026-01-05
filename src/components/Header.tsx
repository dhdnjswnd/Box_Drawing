import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const {
    addCanvas,
    incrementCanvasIdCounter,
    activeCanvasId,
    incrementBoxIdCounter,
    addBox,
    exportData,
    importData
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCanvas = () => {
    const id = `canvas-${incrementCanvasIdCounter()}`;
    const name = `Canvas ${incrementCanvasIdCounter()}`;
    addCanvas({
      id,
      name,
      boxes: []
    });
  };

  const handleAddBox = () => {
    if (!activeCanvasId) {
      alert('Please create a canvas first!');
      return;
    }

    const boxId = incrementBoxIdCounter();
    const newBox = {
      id: boxId,
      width: 2,
      height: 2,
      depth: 2,
      x: 0,
      y: 1,
      z: 0,
      metadata: {
        volume: 8,
        surfaceArea: 24,
        createdAt: new Date()
      }
    };

    addBox(activeCanvasId, newBox);
  };

  const handleExport = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `box-visualizer-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
        alert('Data imported successfully!');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  return (
    <header className="header">
      <h1>3D Box Visualizer</h1>
      <div className="header-controls">
        <button onClick={handleAddCanvas} className="btn btn-primary">
          + New Canvas
        </button>
        <button onClick={handleAddBox} className="btn btn-success">
          + Add Box
        </button>
        <button onClick={handleExport} className="btn btn-secondary">
          Export Data
        </button>
        <button onClick={handleImport} className="btn btn-secondary">
          Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </header>
  );
};

export default Header;
