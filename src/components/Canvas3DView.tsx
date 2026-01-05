import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppContext } from '../context/AppContext';
import { BoxData, Box3D } from '../types';

interface Canvas3DViewProps {
  canvasId: string;
}

const Canvas3DView: React.FC<Canvas3DViewProps> = ({ canvasId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxesRef = useRef<Map<number, Box3D>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const animationIdRef = useRef<number>();

  const {
    getCanvas,
    updateBox,
    selectBox,
    selectedBoxId,
    selectedCanvasId,
    colorFilter,
    snapDistance
  } = useAppContext();

  const canvas = getCanvas(canvasId);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update boxes when canvas data changes
  useEffect(() => {
    if (!sceneRef.current || !canvas) return;

    const scene = sceneRef.current;
    const currentBoxIds = new Set(canvas.boxes.map(b => b.id));
    const existingBoxIds = new Set(boxesRef.current.keys());

    // Remove boxes that no longer exist
    existingBoxIds.forEach(id => {
      if (!currentBoxIds.has(id)) {
        const box3D = boxesRef.current.get(id);
        if (box3D) {
          scene.remove(box3D.mesh);
          box3D.mesh.geometry.dispose();
          (box3D.mesh.material as THREE.Material).dispose();
          boxesRef.current.delete(id);
        }
      }
    });

    // Add or update boxes
    canvas.boxes.forEach(boxData => {
      let box3D = boxesRef.current.get(boxData.id);

      if (!box3D) {
        // Create new box
        box3D = createBox3D(boxData);
        boxesRef.current.set(boxData.id, box3D);
        scene.add(box3D.mesh);
      } else {
        // Update existing box
        updateBox3D(box3D, boxData);
      }

      // Update selection state
      const isSelected = selectedBoxId === boxData.id && selectedCanvasId === canvasId;
      setBoxSelected(box3D, isSelected);
    });

    // Update colors based on filter
    updateBoxColors();
  }, [canvas, selectedBoxId, selectedCanvasId, canvasId]);

  // Update colors when filter changes
  useEffect(() => {
    updateBoxColors();
  }, [colorFilter]);

  const createBox3D = (boxData: BoxData): Box3D => {
    const geometry = new THREE.BoxGeometry(boxData.width, boxData.height, boxData.depth);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(boxData.x, boxData.y, boxData.z);
    mesh.userData.boxId = boxData.id;

    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const edgesMesh = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(edgesMesh);

    return {
      ...boxData,
      mesh,
      edges: edgesMesh
    };
  };

  const updateBox3D = (box3D: Box3D, boxData: BoxData) => {
    // Update geometry if dimensions changed
    if (
      box3D.width !== boxData.width ||
      box3D.height !== boxData.height ||
      box3D.depth !== boxData.depth
    ) {
      box3D.mesh.geometry.dispose();
      box3D.edges.geometry.dispose();

      const geometry = new THREE.BoxGeometry(boxData.width, boxData.height, boxData.depth);
      box3D.mesh.geometry = geometry;

      const edges = new THREE.EdgesGeometry(geometry);
      box3D.edges.geometry = edges;
    }

    // Update position
    box3D.mesh.position.set(boxData.x, boxData.y, boxData.z);

    // Update stored data
    Object.assign(box3D, boxData);
  };

  const setBoxSelected = (box3D: Box3D, selected: boolean) => {
    const material = box3D.mesh.material as THREE.MeshPhongMaterial;
    if (selected) {
      material.emissive.setHex(0x444444);
      (box3D.edges.material as THREE.LineBasicMaterial).color.setHex(0xffff00);
    } else {
      material.emissive.setHex(0x000000);
      (box3D.edges.material as THREE.LineBasicMaterial).color.setHex(0x000000);
    }
  };

  const updateBoxColors = () => {
    if (!canvas) return;

    const boxes = Array.from(boxesRef.current.values());
    const values = boxes.map(box => {
      switch (colorFilter) {
        case 'volume':
          return box.metadata.volume;
        case 'height':
          return box.height;
        case 'area':
          return box.metadata.surfaceArea;
        case 'position':
          return Math.sqrt(box.x * box.x + box.z * box.z);
        default:
          return 0;
      }
    });

    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1);

    boxes.forEach((box, index) => {
      const value = values[index];
      const normalized = maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0.5;
      const hue = (1 - normalized) * 120 / 360;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      (box.mesh.material as THREE.MeshPhongMaterial).color.copy(color);
    });
  };

  // Mouse event handlers
  const handleMouseDown = (event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes = Array.from(boxesRef.current.values()).map(b => b.mesh);
    const intersects = raycasterRef.current.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      isDraggingRef.current = true;
      const boxId = intersects[0].object.userData.boxId;
      selectBox(canvasId, boxId);

      // Setup drag plane
      dragPlaneRef.current.setFromNormalAndCoplanarPoint(
        cameraRef.current.getWorldDirection(dragPlaneRef.current.normal),
        intersects[0].point
      );

      raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, dragOffsetRef.current);
      dragOffsetRef.current.sub(intersects[0].object.position);
    } else {
      selectBox(canvasId, null);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDraggingRef.current || !selectedBoxId || selectedCanvasId !== canvasId) return;
    if (!containerRef.current || !cameraRef.current || !canvas) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersectPoint = new THREE.Vector3();
    raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint);
    intersectPoint.sub(dragOffsetRef.current);

    // Apply snap to grid
    intersectPoint.x = Math.round(intersectPoint.x / snapDistance) * snapDistance;
    intersectPoint.y = Math.max(
      (boxesRef.current.get(selectedBoxId)?.height || 1) / 2,
      Math.round(intersectPoint.y / snapDistance) * snapDistance
    );
    intersectPoint.z = Math.round(intersectPoint.z / snapDistance) * snapDistance;

    // Update box position
    const boxData = canvas.boxes.find(b => b.id === selectedBoxId);
    if (boxData) {
      const updatedBox = {
        ...boxData,
        x: intersectPoint.x,
        y: intersectPoint.y,
        z: intersectPoint.z
      };
      updateBox(canvasId, updatedBox);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Add event listeners
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedBoxId, selectedCanvasId, canvasId, canvas]);

  return <div ref={containerRef} className="canvas-viewport" data-canvas-id={canvasId} />;
};

export default Canvas3DView;
