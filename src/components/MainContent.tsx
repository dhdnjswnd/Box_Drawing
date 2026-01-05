import React from 'react';
import { useAppContext } from '../context/AppContext';
import Canvas3DView from './Canvas3DView';
import SidePanel from './SidePanel';

const MainContent: React.FC = () => {
  const { canvases } = useAppContext();

  return (
    <div className="main-content">
      <div id="canvasContainer" className="canvas-container">
        {canvases.map((canvas) => (
          <div key={canvas.id} className="canvas-wrapper" data-canvas-id={canvas.id}>
            <div className="canvas-header">
              <div className="canvas-title">{canvas.name}</div>
            </div>
            <Canvas3DView canvasId={canvas.id} />
          </div>
        ))}
      </div>

      <SidePanel />
    </div>
  );
};

export default MainContent;
