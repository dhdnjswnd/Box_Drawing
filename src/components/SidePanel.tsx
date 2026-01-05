import React from 'react';
import PropertiesPanel from './PropertiesPanel';
import ColorFilters from './ColorFilters';

const SidePanel: React.FC = () => {
  return (
    <aside className="side-panel">
      <h2>Box Properties</h2>
      <PropertiesPanel />

      <ColorFilters />

      {/* Legend */}
      <div className="legend">
        <h3>Color Legend</h3>
        <div className="legend-content">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ff0000' }}></span>
            <span>High</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ffff00' }}></span>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#00ff00' }}></span>
            <span>Low</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidePanel;
