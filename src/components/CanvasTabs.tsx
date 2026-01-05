import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const CanvasTabs: React.FC = () => {
  const { canvases, activeCanvasId, setActiveCanvas, removeCanvas, updateCanvasName } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleTabClick = (id: string) => {
    setActiveCanvas(id);
  };

  const handleDoubleClick = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingId && editName.trim()) {
      updateCanvasName(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeCanvas(id);
  };

  return (
    <div className="canvas-tabs" id="canvasTabs">
      {canvases.map((canvas) => (
        <div
          key={canvas.id}
          className={`canvas-tab ${canvas.id === activeCanvasId ? 'active' : ''}`}
          data-canvas-id={canvas.id}
          onClick={() => handleTabClick(canvas.id)}
        >
          {editingId === canvas.id ? (
            <input
              type="text"
              className="canvas-tab-name-input"
              value={editName}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="canvas-tab-name"
              onDoubleClick={() => handleDoubleClick(canvas.id, canvas.name)}
            >
              {canvas.name}
            </span>
          )}
          <button
            className="canvas-tab-close"
            onClick={(e) => handleClose(e, canvas.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default CanvasTabs;
