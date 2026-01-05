import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, CanvasData, BoxData, ColorFilterType } from '../types';

interface AppContextType extends AppState {
  setActiveCanvas: (id: string | null) => void;
  addCanvas: (canvas: CanvasData) => void;
  removeCanvas: (id: string) => void;
  updateCanvasName: (id: string, name: string) => void;
  addBox: (canvasId: string, box: BoxData) => void;
  removeBox: (canvasId: string, boxId: number) => void;
  updateBox: (canvasId: string, box: BoxData) => void;
  selectBox: (canvasId: string, boxId: number | null) => void;
  setColorFilter: (filter: ColorFilterType) => void;
  incrementBoxIdCounter: () => number;
  incrementCanvasIdCounter: () => number;
  importData: (data: any) => void;
  exportData: () => any;
  getCanvas: (id: string) => CanvasData | undefined;
  getSelectedBox: () => BoxData | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [colorFilter, setColorFilterState] = useState<ColorFilterType>('volume');
  const [snapDistance] = useState(0.5);
  const [boxIdCounter, setBoxIdCounter] = useState(0);
  const [canvasIdCounter, setCanvasIdCounter] = useState(0);

  const setActiveCanvas = (id: string | null) => {
    setActiveCanvasId(id);
    // Deselect box when switching canvas
    setSelectedBoxId(null);
    setSelectedCanvasId(null);
  };

  const addCanvas = (canvas: CanvasData) => {
    setCanvases(prev => [...prev, canvas]);
    setActiveCanvasId(canvas.id);
  };

  const removeCanvas = (id: string) => {
    setCanvases(prev => prev.filter(c => c.id !== id));
    if (activeCanvasId === id) {
      const remaining = canvases.filter(c => c.id !== id);
      setActiveCanvasId(remaining.length > 0 ? remaining[0].id : null);
      setSelectedBoxId(null);
      setSelectedCanvasId(null);
    }
  };

  const updateCanvasName = (id: string, name: string) => {
    setCanvases(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const addBox = (canvasId: string, box: BoxData) => {
    setCanvases(prev => prev.map(c =>
      c.id === canvasId
        ? { ...c, boxes: [...c.boxes, box] }
        : c
    ));
  };

  const removeBox = (canvasId: string, boxId: number) => {
    setCanvases(prev => prev.map(c =>
      c.id === canvasId
        ? { ...c, boxes: c.boxes.filter(b => b.id !== boxId) }
        : c
    ));
    if (selectedBoxId === boxId) {
      setSelectedBoxId(null);
      setSelectedCanvasId(null);
    }
  };

  const updateBox = (canvasId: string, box: BoxData) => {
    setCanvases(prev => prev.map(c =>
      c.id === canvasId
        ? { ...c, boxes: c.boxes.map(b => b.id === box.id ? box : b) }
        : c
    ));
  };

  const selectBox = (canvasId: string, boxId: number | null) => {
    setSelectedBoxId(boxId);
    setSelectedCanvasId(canvasId);
    setActiveCanvasId(canvasId);
  };

  const setColorFilter = (filter: ColorFilterType) => {
    setColorFilterState(filter);
  };

  const incrementBoxIdCounter = () => {
    const current = boxIdCounter;
    setBoxIdCounter(prev => prev + 1);
    return current;
  };

  const incrementCanvasIdCounter = () => {
    const current = canvasIdCounter;
    setCanvasIdCounter(prev => prev + 1);
    return current;
  };

  const getCanvas = (id: string) => {
    return canvases.find(c => c.id === id);
  };

  const getSelectedBox = () => {
    if (!selectedCanvasId || selectedBoxId === null) return undefined;
    const canvas = getCanvas(selectedCanvasId);
    return canvas?.boxes.find(b => b.id === selectedBoxId);
  };

  const importData = (data: any) => {
    setCanvases(data.canvases || []);
    setColorFilterState(data.colorFilter || 'volume');
    setBoxIdCounter(data.boxIdCounter || 0);
    setCanvasIdCounter(data.canvasIdCounter || 0);
    setActiveCanvasId(data.canvases?.[0]?.id || null);
    setSelectedBoxId(null);
    setSelectedCanvasId(null);
  };

  const exportData = () => {
    return {
      version: '2.0',
      canvases,
      colorFilter,
      boxIdCounter,
      canvasIdCounter
    };
  };

  const value: AppContextType = {
    canvases,
    activeCanvasId,
    selectedBoxId,
    selectedCanvasId,
    colorFilter,
    snapDistance,
    boxIdCounter,
    canvasIdCounter,
    setActiveCanvas,
    addCanvas,
    removeCanvas,
    updateCanvasName,
    addBox,
    removeBox,
    updateBox,
    selectBox,
    setColorFilter,
    incrementBoxIdCounter,
    incrementCanvasIdCounter,
    importData,
    exportData,
    getCanvas,
    getSelectedBox
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
