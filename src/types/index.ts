import * as THREE from 'three';

export interface BoxData {
  id: number;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  metadata: {
    volume: number;
    surfaceArea: number;
    createdAt: Date;
  };
}

export interface CanvasData {
  id: string;
  name: string;
  boxes: BoxData[];
}

export interface AppState {
  canvases: CanvasData[];
  activeCanvasId: string | null;
  selectedBoxId: number | null;
  selectedCanvasId: string | null;
  colorFilter: ColorFilterType;
  snapDistance: number;
  boxIdCounter: number;
  canvasIdCounter: number;
}

export type ColorFilterType = 'volume' | 'height' | 'area' | 'position';

export interface ExportData {
  version: string;
  canvases: CanvasData[];
  colorFilter: ColorFilterType;
  boxIdCounter: number;
  canvasIdCounter: number;
}

export interface Box3D {
  id: number;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  metadata: {
    volume: number;
    surfaceArea: number;
    createdAt: Date;
  };
}
