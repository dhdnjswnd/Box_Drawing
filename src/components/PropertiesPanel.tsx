import React from 'react';
import { useAppContext } from '../context/AppContext';

const PropertiesPanel: React.FC = () => {
  const { getSelectedBox, selectedCanvasId, selectedBoxId, updateBox, removeBox } = useAppContext();

  const selectedBox = getSelectedBox();

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    if (!selectedBox || !selectedCanvasId) return;

    const updatedBox = {
      ...selectedBox,
      [dimension]: Math.max(0.1, value),
      metadata: {
        ...selectedBox.metadata,
        volume: 0,
        surfaceArea: 0
      }
    };

    // Recalculate metadata
    const { width, height, depth } = updatedBox;
    updatedBox.metadata.volume = width * height * depth;
    updatedBox.metadata.surfaceArea = 2 * (width * height + height * depth + depth * width);

    updateBox(selectedCanvasId, updatedBox);
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedBox || !selectedCanvasId) return;

    const updatedBox = {
      ...selectedBox,
      [axis]: value
    };

    updateBox(selectedCanvasId, updatedBox);
  };

  const handleDelete = () => {
    if (!selectedBoxId || !selectedCanvasId) return;
    removeBox(selectedCanvasId, selectedBoxId);
  };

  if (!selectedBox) {
    return (
      <div className="properties-panel">
        <p className="no-selection">Select a box to view properties</p>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="property-group">
        <label className="property-label">Box ID</label>
        <input type="text" className="property-input" value={selectedBox.id} disabled />
      </div>

      <div className="property-group">
        <label className="property-label">Dimensions</label>
        <div className="property-row">
          <div>
            <label className="property-label">Width</label>
            <input
              type="number"
              className="property-input"
              value={selectedBox.width}
              min="0.1"
              step="0.1"
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="property-label">Height</label>
            <input
              type="number"
              className="property-input"
              value={selectedBox.height}
              min="0.1"
              step="0.1"
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="property-label">Depth</label>
            <input
              type="number"
              className="property-input"
              value={selectedBox.depth}
              min="0.1"
              step="0.1"
              onChange={(e) => handleDimensionChange('depth', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="property-group">
        <label className="property-label">Position</label>
        <div className="property-row">
          <div>
            <label className="property-label">X</label>
            <input
              type="number"
              className="property-input"
              value={selectedBox.x.toFixed(2)}
              step="0.1"
              onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="property-label">Y</label>
            <input
              type="number"
              className="property-input"
              value={selectedBox.y.toFixed(2)}
              step="0.1"
              onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="property-label">Z</label>
            <input
              type="number"
              className="property-input"
              value={selectedBox.z.toFixed(2)}
              step="0.1"
              onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="property-group">
        <label className="property-label">Volume</label>
        <input
          type="text"
          className="property-input"
          value={selectedBox.metadata.volume.toFixed(2)}
          disabled
        />
      </div>

      <div className="property-group">
        <label className="property-label">Surface Area</label>
        <input
          type="text"
          className="property-input"
          value={selectedBox.metadata.surfaceArea.toFixed(2)}
          disabled
        />
      </div>

      <button className="btn btn-danger delete-box-btn" onClick={handleDelete}>
        Delete Box
      </button>
    </div>
  );
};

export default PropertiesPanel;
