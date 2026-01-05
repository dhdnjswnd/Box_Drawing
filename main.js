import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Global state
const state = {
    canvases: [],
    activeCanvas: null,
    selectedBox: null,
    colorFilter: 'volume',
    snapDistance: 0.5,
    isDragging: false,
    boxIdCounter: 0
};

// Box class to manage individual boxes
class Box {
    constructor(id, width = 2, height = 2, depth = 2, x = 0, y = 1, z = 0) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.x = x;
        this.y = y;
        this.z = z;
        this.metadata = {
            volume: width * height * depth,
            surfaceArea: 2 * (width * height + height * depth + depth * width),
            createdAt: new Date()
        };

        // Create Three.js mesh
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.userData.boxId = id;

        // Add edges for better visibility
        const edges = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        this.edges = new THREE.LineSegments(edges, edgeMaterial);
        this.mesh.add(this.edges);
    }

    updateGeometry() {
        // Remove old geometry
        this.mesh.geometry.dispose();
        this.edges.geometry.dispose();

        // Create new geometry
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        this.mesh.geometry = geometry;

        // Update edges
        const edges = new THREE.EdgesGeometry(geometry);
        this.edges.geometry = edges;

        // Update metadata
        this.metadata.volume = this.width * this.height * this.depth;
        this.metadata.surfaceArea = 2 * (this.width * this.height +
                                         this.height * this.depth +
                                         this.depth * this.width);
    }

    updatePosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh.position.set(x, y, z);
    }

    setColor(color) {
        this.mesh.material.color.setHex(color);
    }

    setSelected(selected) {
        if (selected) {
            this.mesh.material.emissive.setHex(0x444444);
            this.edges.material.color.setHex(0xffff00);
        } else {
            this.mesh.material.emissive.setHex(0x000000);
            this.edges.material.color.setHex(0x000000);
        }
    }
}

// Canvas3D class to manage individual 3D scenes
class Canvas3D {
    constructor(id, containerElement) {
        this.id = id;
        this.boxes = [];
        this.containerElement = containerElement;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            containerElement.clientWidth / containerElement.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        containerElement.appendChild(this.renderer.domElement);

        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // Add grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.dragPlane = new THREE.Plane();
        this.dragOffset = new THREE.Vector3();
        this.dragStartPosition = new THREE.Vector3();

        // Bind events
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Start animation loop
        this.animate();
    }

    addBox(box) {
        this.boxes.push(box);
        this.scene.add(box.mesh);
        this.updateBoxColors();
    }

    removeBox(boxId) {
        const index = this.boxes.findIndex(b => b.id === boxId);
        if (index !== -1) {
            const box = this.boxes[index];
            this.scene.remove(box.mesh);
            box.mesh.geometry.dispose();
            box.mesh.material.dispose();
            this.boxes.splice(index, 1);
            this.updateBoxColors();
        }
    }

    getBox(boxId) {
        return this.boxes.find(b => b.id === boxId);
    }

    updateBoxColors() {
        const filter = state.colorFilter;

        // Calculate min and max values for the current filter
        let values = this.boxes.map(box => {
            switch(filter) {
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

        // Update colors
        this.boxes.forEach((box, index) => {
            const value = values[index];
            const normalized = maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0.5;

            // Color gradient: green (low) -> yellow (medium) -> red (high)
            const hue = (1 - normalized) * 120 / 360; // 120° = green, 0° = red
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            box.setColor(color.getHex());
        });
    }

    onMouseDown(event) {
        event.preventDefault();

        // Update mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.boxes.map(b => b.mesh),
            false
        );

        if (intersects.length > 0) {
            state.isDragging = true;
            state.activeCanvas = this;

            const selectedMesh = intersects[0].object;
            const boxId = selectedMesh.userData.boxId;
            selectBox(boxId, this);

            // Setup drag plane
            this.dragPlane.setFromNormalAndCoplanarPoint(
                this.camera.getWorldDirection(this.dragPlane.normal),
                intersects[0].point
            );

            // Calculate drag offset
            this.raycaster.ray.intersectPlane(this.dragPlane, this.dragOffset);
            this.dragOffset.sub(selectedMesh.position);
            this.dragStartPosition.copy(selectedMesh.position);
        } else {
            // Clicked on empty space
            deselectBox();
        }
    }

    onMouseMove(event) {
        if (!state.isDragging || state.selectedBox === null) return;

        event.preventDefault();

        // Update mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Calculate new position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
        intersectPoint.sub(this.dragOffset);

        // Apply snap to grid
        const snapDist = state.snapDistance;
        intersectPoint.x = Math.round(intersectPoint.x / snapDist) * snapDist;
        intersectPoint.y = Math.max(state.selectedBox.height / 2,
                                     Math.round(intersectPoint.y / snapDist) * snapDist);
        intersectPoint.z = Math.round(intersectPoint.z / snapDist) * snapDist;

        // Check for snapping to other boxes
        const snapped = this.checkBoxSnapping(state.selectedBox, intersectPoint);
        if (snapped) {
            intersectPoint.copy(snapped);
        }

        // Update box position
        state.selectedBox.updatePosition(intersectPoint.x, intersectPoint.y, intersectPoint.z);
        updatePropertiesPanel();
    }

    onMouseUp(event) {
        state.isDragging = false;
    }

    checkBoxSnapping(movingBox, newPosition) {
        const threshold = state.snapDistance * 2;

        for (const box of this.boxes) {
            if (box.id === movingBox.id) continue;

            // Check each face of the stationary box
            const faces = [
                { axis: 'x', direction: 1, value: box.x + box.width / 2 },
                { axis: 'x', direction: -1, value: box.x - box.width / 2 },
                { axis: 'z', direction: 1, value: box.z + box.depth / 2 },
                { axis: 'z', direction: -1, value: box.z - box.depth / 2 }
            ];

            for (const face of faces) {
                let snapPos = newPosition.clone();

                if (face.axis === 'x') {
                    const targetX = face.value + (movingBox.width / 2) * face.direction;
                    if (Math.abs(newPosition.x - targetX) < threshold) {
                        snapPos.x = targetX;

                        // Check if boxes are close in Z axis
                        if (Math.abs(newPosition.z - box.z) < box.depth / 2 + movingBox.depth / 2 + threshold) {
                            return snapPos;
                        }
                    }
                } else { // z axis
                    const targetZ = face.value + (movingBox.depth / 2) * face.direction;
                    if (Math.abs(newPosition.z - targetZ) < threshold) {
                        snapPos.z = targetZ;

                        // Check if boxes are close in X axis
                        if (Math.abs(newPosition.x - box.x) < box.width / 2 + movingBox.width / 2 + threshold) {
                            return snapPos;
                        }
                    }
                }
            }
        }

        return null;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const width = this.containerElement.clientWidth;
        const height = this.containerElement.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    destroy() {
        this.renderer.dispose();
        this.controls.dispose();
        this.containerElement.removeChild(this.renderer.domElement);
    }
}

// UI Management Functions
function createCanvasWrapper() {
    const canvasId = `canvas-${state.canvases.length}`;

    // Create wrapper element
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-wrapper';
    wrapper.dataset.canvasId = canvasId;

    // Create header
    const header = document.createElement('div');
    header.className = 'canvas-header';

    const title = document.createElement('div');
    title.className = 'canvas-title';
    title.textContent = `Canvas ${state.canvases.length + 1}`;

    const controls = document.createElement('div');
    controls.className = 'canvas-controls';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-danger btn-small';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => removeCanvas(canvasId);

    controls.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Create viewport
    const viewport = document.createElement('div');
    viewport.className = 'canvas-viewport';
    viewport.dataset.canvasId = canvasId;

    wrapper.appendChild(header);
    wrapper.appendChild(viewport);

    // Add to container
    document.getElementById('canvasContainer').appendChild(wrapper);

    // Create Canvas3D instance
    const canvas3D = new Canvas3D(canvasId, viewport);
    state.canvases.push(canvas3D);

    // Set as active
    setActiveCanvas(canvas3D);

    return canvas3D;
}

function removeCanvas(canvasId) {
    const index = state.canvases.findIndex(c => c.id === canvasId);
    if (index !== -1) {
        const canvas = state.canvases[index];
        canvas.destroy();
        state.canvases.splice(index, 1);

        // Remove DOM element
        const wrapper = document.querySelector(`[data-canvas-id="${canvasId}"]`);
        if (wrapper) {
            wrapper.remove();
        }

        // Set new active canvas
        if (state.activeCanvas === canvas) {
            state.activeCanvas = state.canvases[0] || null;
            if (state.activeCanvas) {
                setActiveCanvas(state.activeCanvas);
            }
        }
    }
}

function setActiveCanvas(canvas) {
    state.activeCanvas = canvas;

    // Update UI
    document.querySelectorAll('.canvas-wrapper').forEach(wrapper => {
        wrapper.classList.remove('active');
    });

    if (canvas) {
        const wrapper = document.querySelector(`.canvas-wrapper[data-canvas-id="${canvas.id}"]`);
        if (wrapper) {
            wrapper.classList.add('active');
        }
    }
}

function addBox() {
    if (!state.activeCanvas) {
        alert('Please create a canvas first!');
        return;
    }

    const id = state.boxIdCounter++;
    const box = new Box(id, 2, 2, 2, 0, 1, 0);
    state.activeCanvas.addBox(box);
    selectBox(id, state.activeCanvas);
}

function selectBox(boxId, canvas) {
    // Deselect previous box
    if (state.selectedBox) {
        state.selectedBox.setSelected(false);
    }

    // Select new box
    const box = canvas.getBox(boxId);
    if (box) {
        state.selectedBox = box;
        box.setSelected(true);
        setActiveCanvas(canvas);
        updatePropertiesPanel();
    }
}

function deselectBox() {
    if (state.selectedBox) {
        state.selectedBox.setSelected(false);
        state.selectedBox = null;
        updatePropertiesPanel();
    }
}

function deleteSelectedBox() {
    if (!state.selectedBox || !state.activeCanvas) return;

    const boxId = state.selectedBox.id;
    state.activeCanvas.removeBox(boxId);
    state.selectedBox = null;
    updatePropertiesPanel();
}

function updatePropertiesPanel() {
    const panel = document.getElementById('propertiesPanel');

    if (!state.selectedBox) {
        panel.innerHTML = '<p class="no-selection">Select a box to view properties</p>';
        return;
    }

    const box = state.selectedBox;

    panel.innerHTML = `
        <div class="property-group">
            <label class="property-label">Box ID</label>
            <input type="text" class="property-input" value="${box.id}" disabled>
        </div>

        <div class="property-group">
            <label class="property-label">Dimensions</label>
            <div class="property-row">
                <div>
                    <label class="property-label">Width</label>
                    <input type="number" id="boxWidth" class="property-input"
                           value="${box.width}" min="0.1" step="0.1">
                </div>
                <div>
                    <label class="property-label">Height</label>
                    <input type="number" id="boxHeight" class="property-input"
                           value="${box.height}" min="0.1" step="0.1">
                </div>
                <div>
                    <label class="property-label">Depth</label>
                    <input type="number" id="boxDepth" class="property-input"
                           value="${box.depth}" min="0.1" step="0.1">
                </div>
            </div>
        </div>

        <div class="property-group">
            <label class="property-label">Position</label>
            <div class="property-row">
                <div>
                    <label class="property-label">X</label>
                    <input type="number" id="boxX" class="property-input"
                           value="${box.x.toFixed(2)}" step="0.1">
                </div>
                <div>
                    <label class="property-label">Y</label>
                    <input type="number" id="boxY" class="property-input"
                           value="${box.y.toFixed(2)}" step="0.1">
                </div>
                <div>
                    <label class="property-label">Z</label>
                    <input type="number" id="boxZ" class="property-input"
                           value="${box.z.toFixed(2)}" step="0.1">
                </div>
            </div>
        </div>

        <div class="property-group">
            <label class="property-label">Volume</label>
            <input type="text" class="property-input"
                   value="${box.metadata.volume.toFixed(2)}" disabled>
        </div>

        <div class="property-group">
            <label class="property-label">Surface Area</label>
            <input type="text" class="property-input"
                   value="${box.metadata.surfaceArea.toFixed(2)}" disabled>
        </div>

        <button class="btn btn-danger delete-box-btn" id="deleteBoxBtn">Delete Box</button>
    `;

    // Add event listeners
    document.getElementById('boxWidth').addEventListener('input', (e) => {
        box.width = parseFloat(e.target.value) || 0.1;
        box.updateGeometry();
        state.activeCanvas.updateBoxColors();
        updatePropertiesPanel();
    });

    document.getElementById('boxHeight').addEventListener('input', (e) => {
        box.height = parseFloat(e.target.value) || 0.1;
        box.updateGeometry();
        state.activeCanvas.updateBoxColors();
        updatePropertiesPanel();
    });

    document.getElementById('boxDepth').addEventListener('input', (e) => {
        box.depth = parseFloat(e.target.value) || 0.1;
        box.updateGeometry();
        state.activeCanvas.updateBoxColors();
        updatePropertiesPanel();
    });

    document.getElementById('boxX').addEventListener('input', (e) => {
        const x = parseFloat(e.target.value) || 0;
        box.updatePosition(x, box.y, box.z);
    });

    document.getElementById('boxY').addEventListener('input', (e) => {
        const y = parseFloat(e.target.value) || 0;
        box.updatePosition(box.x, y, box.z);
    });

    document.getElementById('boxZ').addEventListener('input', (e) => {
        const z = parseFloat(e.target.value) || 0;
        box.updatePosition(box.x, box.y, z);
    });

    document.getElementById('deleteBoxBtn').addEventListener('click', deleteSelectedBox);
}

function updateColorFilter() {
    state.canvases.forEach(canvas => {
        canvas.updateBoxColors();
    });
}

// Event Listeners
document.getElementById('addCanvasBtn').addEventListener('click', createCanvasWrapper);
document.getElementById('addBoxBtn').addEventListener('click', addBox);

// Color filter listeners
document.querySelectorAll('input[name="colorFilter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        state.colorFilter = e.target.value;
        updateColorFilter();
    });
});

// Handle canvas click to set active
document.getElementById('canvasContainer').addEventListener('click', (e) => {
    const viewport = e.target.closest('.canvas-viewport');
    if (viewport) {
        const canvasId = viewport.dataset.canvasId;
        const canvas = state.canvases.find(c => c.id === canvasId);
        if (canvas) {
            setActiveCanvas(canvas);
        }
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    state.canvases.forEach(canvas => {
        canvas.resize();
    });
});

// Initialize with one canvas
createCanvasWrapper();
