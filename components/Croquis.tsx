import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TrashIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CrosshairsIcon, MaximizeIcon, MinimizeIcon, SearchIcon, ArrowUturnLeftIcon, CameraIcon, LockClosedIcon, PencilIcon, PencilAltIcon, RefreshIcon, FolderPlusIcon, PhotoIcon } from './icons';
import { streets } from '../data/streets';
import * as togeojson from '@tmcw/togeojson';

declare const L: any;
declare const html2canvas: any;


interface CroquisProps {
    isActive: boolean;
    onSketchCapture: (imageDataUrl: string) => void;
    onUnlockSketch: () => void;
    initialLayer?: 'street' | 'satellite';
}

type Tool = 'point' | 'impact' | 'adjacency' | 'influence' | 'unit' | 'text' | 'line' | null;
type CroquisElement = { type: 'add', element: any, elementType: 'point' | 'zone' | 'unit' | 'text' | 'line' | 'kml' | 'imageOverlay' };
type CroquisMode = 'drawing' | 'adjusting';

const predefinedUnits = [
    { type: 'engine', label: 'Autobomba', icon: <EngineIcon className="w-5 h-5" />, color: 'bg-red-600 hover:bg-red-500', defaultLabel: 'E-1' },
    { type: 'ladder', label: 'Hidroelevador', icon: <LadderIcon className="w-5 h-5" />, color: 'bg-blue-600 hover:bg-blue-500', defaultLabel: 'H-1' },
    { type: 'ambulance', label: 'Ambulancia', icon: <AmbulanceIcon className="w-5 h-5" />, color: 'bg-green-600 hover:bg-green-500', defaultLabel: 'A-1' },
    { type: 'command', label: 'Puesto Comando', icon: <CommandPostIcon className="w-5 h-5" />, color: 'bg-orange-600 hover:bg-orange-500', defaultLabel: 'PC-1' },
    { type: 'person', label: 'Personal', icon: <PersonIcon className="w-5 h-5" />, color: 'bg-purple-600 hover:bg-purple-500', defaultLabel: 'P-1' }
];

// FIX: Add a return statement to the component to make it a valid React functional component.
const Croquis: React.FC<CroquisProps> = ({ isActive, onSketchCapture, onUnlockSketch, initialLayer = 'street' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const isInitialized = useRef(false);
    const ecologicalReserveOverlayRef = useRef<any>(null);

    const [tool, setTool] = useState<Tool>(null);
    const [mode, setMode] = useState<CroquisMode>('drawing');

    const [unitType, setUnitType] = useState('engine');
    const [unitLabel, setUnitLabel] = useState('E-1');
    const [textLabel, setTextLabel] = useState('');
    const [isTextVertical, setIsTextVertical] = useState(false);
    
    const [impactRadius, setImpactRadius] = useState(50);
    const [adjacencyRadius, setAdjacencyRadius] = useState(100);
    const [influenceRadius, setInfluenceRadius] = useState(150);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);
    const [imageOverlay, setImageOverlay] = useState<any>(null);

    const [points, setPoints] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [texts, setTexts] = useState<any[]>([]);
    const [lines, setLines] = useState<any[]>([]);
    const [kmlLayers, setKmlLayers] = useState<any[]>([]);

    const [selectedZone, setSelectedZone] = useState<any>(null);
    
    const history = useRef<CroquisElement[]>([]);
    const drawingLine = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     const saveStateToLocalStorage = useCallback(() => {
        if (!isInitialized.current || !mapRef.current) return;
        try {
            const state = {
                points: points.map(p => ({ lat: p.getLatLng().lat, lng: p.getLatLng().lng })),
                zones: zones.map(z => ({ lat: z.layer.getLatLng().lat, lng: z.layer.getLatLng().lng, radius: z.layer.getRadius(), color: z.layer.options.color, type: z.type })),
                units: units.map(u => ({ lat: u.getLatLng().lat, lng: u.getLatLng().lng, type: u.options.icon.options.unitType, label: u.options.icon.options.unitLabel })),
                texts: texts.map(t => ({ lat: t.getLatLng().lat, lng: t.getLatLng().lng, text: t.options.icon.options.html.match(/>(.*?)</)?.[1] || '', isVertical: (t.options.icon.options.html.includes('rotate(-90deg)')) })),
                lines: lines.map(l => l.getLatLngs().map((latlng: any) => ({ lat: latlng.lat, lng: latlng.lng }))),
                ecologicalReserveActive: mapRef.current.hasLayer(ecologicalReserveOverlayRef.current),
            };
            localStorage.setItem('croquisState', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save croquis state to localStorage", e);
        }
    }, [points, zones, units, texts, lines]);
    
    useEffect(() => {
        saveStateToLocalStorage();
    }, [saveStateToLocalStorage]);


    const captureSketch = async (): Promise<string | null> => {
        const map = mapRef.current;
        if (!map || !mapContainerRef.current) return null;

        const originalCenter = map.getCenter();
        const originalZoom = map.getZoom();

        return new Promise(async (resolvePromise) => {
            const allLayers = [
                ...points,
                ...zones.map(z => z.layer),
                ...units,
                ...texts,
                ...lines,
                ...kmlLayers,
            ];
            if (ecologicalReserveOverlayRef.current && map.hasLayer(ecologicalReserveOverlayRef.current)) {
                allLayers.push(ecologicalReserveOverlayRef.current);
            }
    
            if (allLayers.length > 0) {
                const featureGroup = L.featureGroup(allLayers);
                const bounds = featureGroup.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
                    // Wait for map animation to finish
                    map.once('moveend', capture);
                } else {
                    capture(); // Capture current view if bounds are invalid
                }
            } else {
                capture(); // Capture current view if no layers
            }

            async function capture() {
                // Give it a moment to render after moveend
                await new Promise(resolve => setTimeout(resolve, 250));
                map.invalidateSize();
                await new Promise(resolve => setTimeout(resolve, 100));

                try {
                    const canvas = await html2canvas(mapContainerRef.current, {
                        useCORS: true, backgroundColor: '#18181b', logging: false,
                        onclone: (doc: Document) => {
                             const toHide = ['.leaflet-control-attribution', '#radius-editor', '.leaflet-control-zoom', '.croquis-lock-overlay', '.leaflet-control-layers'];
                            toHide.forEach(sel => {
                                const elem = doc.querySelector(sel) as HTMLElement | null;
                                if (elem) elem.style.display = 'none';
                            });
    
                            const mapPane = doc.querySelector('.leaflet-map-pane') as HTMLElement | null;
                            if (mapPane) {
                                const transform = window.getComputedStyle(mapPane).transform;
                                if (transform && transform !== 'none') {
                                    const matrix = new DOMMatrixReadOnly(transform);
                                    mapPane.style.transform = 'none';
                                    mapPane.style.left = `${matrix.e}px`;
                                    mapPane.style.top = `${matrix.f}px`;
                                }
                            }
                        }
                    });
                    map.setView(originalCenter, originalZoom, { animate: false });
                    resolvePromise(canvas.toDataURL('image/png'));
                } catch (e) {
                    console.error("html2canvas error:", e);
                    map.setView(originalCenter, originalZoom, { animate: false });
                    resolvePromise(null);
                }
            }
        });
    };
    
    const handleValidateSketch = async () => {
        const sketch = await captureSketch();
        if (sketch) {
            onSketchCapture(sketch);
            setMode('adjusting');
        } else {
            alert("No se pudo capturar el croquis.");
        }
    };

    const handleUpdateSketch = async () => {
         const sketch = await captureSketch();
        if (sketch) {
            onSketchCapture(sketch);
            alert("Vista previa actualizada.");
        } else {
            alert("No se pudo actualizar la captura del croquis.");
        }
    };
    
    const handleReturnToDrawing = () => {
        setMode('drawing');
        onUnlockSketch();
    };

    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => mapRef.current.invalidateSize(), 300);
        }
    }, [isMaximized]);
    
    const createDraggableCircle = (centerLatLng: any, options: any) => {
        const map = mapRef.current;
        const circle = L.circle(centerLatLng, options).addTo(map);
        
        let isDragging = false;
        
        circle.on('mousedown', (e: any) => {
            if (tool || mode !== 'drawing') return;
            L.DomEvent.stopPropagation(e);
            map.dragging.disable();
            isDragging = false;
            map.on('mousemove', onDrag);
            map.on('mouseup', onDragEnd);
        });

        const onDrag = (e: any) => {
            isDragging = true;
            circle.setLatLng(e.latlng);
        };

        const onDragEnd = () => {
            map.dragging.enable();
            map.off('mousemove', onDrag);
            map.off('mouseup', onDragEnd);
             if (isDragging) {
                saveStateToLocalStorage();
            }
        };
        
        return circle;
    };

    const handleZoneClick = (zone: any) => {
        if (mode !== 'drawing') return;
        setSelectedZone(zone);
    };

    const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedZone) {
            const newRadius = Number(e.target.value);
            selectedZone.layer.setRadius(newRadius);
            const newZones = zones.map(z => z.id === selectedZone.id ? { ...z, radius: newRadius } : z);
            setZones(newZones);
        }
    };
    
    const clearAllForLoad = () => {
        [...points, ...zones.map(z => z.layer), ...units, ...texts, ...lines, ...kmlLayers].forEach(layer => mapRef.current?.removeLayer(layer));
        if (ecologicalReserveOverlayRef.current && mapRef.current.hasLayer(ecologicalReserveOverlayRef.current)) {
            mapRef.current.removeLayer(ecologicalReserveOverlayRef.current);
        }
        setPoints([]); setZones([]); setUnits([]); setTexts([]); setLines([]); setKmlLayers([]);
        history.current = [];
        setSelectedZone(null);
    };

    const loadStateFromLocalStorage = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        
        try {
            const savedStateJSON = localStorage.getItem('croquisState');
            if (!savedStateJSON) return;
            const savedState = JSON.parse(savedStateJSON);
            
            clearAllForLoad();

            const loadedPoints = (savedState.points || []).map((p: any) => {
                const marker = L.marker([p.lat, p.lng], { draggable: true }).addTo(map);
                marker.on('dragend', saveStateToLocalStorage);
                return marker;
            });
            setPoints(loadedPoints);

            const loadedZones = (savedState.zones || []).map((z: any) => {
                const colorMap: {[key: string]: string} = { impact: '#ef4444', adjacency: '#f59e0b', influence: '#22c55e' };
                const circle = createDraggableCircle([z.lat, z.lng], { radius: z.radius, color: z.color || colorMap[z.type], weight: 2, fillOpacity: 0.3 });
                const zoneData = { layer: circle, radius: z.radius, id: `zone-loaded-${Date.now()}-${Math.random()}`, type: z.type };
                circle.on('click', L.DomEvent.stopPropagation).on('click', () => handleZoneClick(zoneData));
                return zoneData;
            });
            setZones(loadedZones);
            
            const loadedUnits = (savedState.units || []).map((u: any) => {
                 const svgPaths: {[key: string]: string} = { engine: `<path d="M19.5,8c-0.28,0-0.5,0.22-0.5,0.5v1.5H5v-1.5C5,8.22,4.78,8,4.5,8S4,8.22,4,8.5v2C4,11.22,4.22,11.5,4.5,11.5h15 c0.28,0,0.5-0.22,0.5-0.5v-2C20,8.22,19.78,8,19.5,8z M18,12H6c-1.1,0-2,0.9-2,2v2h2v-2h12v2h2v-2C20,12.9,19.1,12,18,12z M7.5,15 C6.67,15,6,15.67,6,16.5S6.67,18,7.5,18S9,17.33,9,16.5S8.33,15,7.5,15z M16.5,15c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S17.33,15,16.5,15z" /><path d="M18.92,3.01C18.72,2.42,18.16,2,17.5,2H7.21c-0.53,0-1.02,0.3-1.28,0.77L4,5.12V7h16V5.12L18.92,3.01z M7.28,4h9.44l0.71,1H6.57L7.28,4z" />`, ladder: `<path d="M22 6.13l-1-1-3 3-1-1-3 3-1-1-3 3-1-1-3 3-1-1-2.13 2.13 1 1 3-3 1 1 3-3 1 1 3-3 1 1 3-3 1 1 .13-.13zM4 17h16v-2H4v2z" />`, ambulance: `<path d="M19 8h-1V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM8 6h8v2H8V6zm11 10H5v-4h14v4z" /><path d="M11 11h2v4h-2z" /><path d="M9 13h6v-2H9z" />`, command: `<path d="M12 2L2 7v13h20V7L12 2zm0 2.311L18.6 7H5.4L12 4.311zM4 9h16v10H4V9zm8 1l-4 4h3v4h2v-4h3l-4-4z" />`, person: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />`};
                const colors: {[key: string]: string} = { engine: '#ef4444', ladder: '#3b82f6', ambulance: '#22c55e', command: '#f97316', person: '#a855f7' };
                const symbolHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">${svgPaths[u.type]}</svg>`;
                const html = `<div style="text-align: center; display: flex; flex-direction: column; align-items: center;"><div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${colors[u.type]}; color: white; display:flex; justify-content:center; align-items:center; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.7);">${symbolHtml}</div><div style="color: white; font-size: 12px; font-weight: bold; text-shadow: 1px 1px 2px black; margin-top: 3px; background-color: rgba(0,0,0,0.5); padding: 1px 4px; border-radius: 3px;">${u.label}</div></div>`;
                const icon = L.divIcon({ className: 'leaflet-unit-icon', html, unitType: u.type, unitLabel: u.label });
                const marker = L.marker([u.lat, u.lng], { icon, draggable: true }).addTo(map);
                marker.on('dragend', saveStateToLocalStorage);
                return marker;
            });
            setUnits(loadedUnits);
            
            const loadedTexts = (savedState.texts || []).map((t: any) => {
                const icon = L.divIcon({ className: 'leaflet-text-icon', html: `<div style="font-weight: bold; color: #facc15; text-shadow: 1px 1px 2px black; font-size: 16px; white-space: nowrap; transform-origin: center; transform: ${t.isVertical ? 'rotate(-90deg)' : 'none'};">${t.text}</div>`});
                const marker = L.marker([t.lat, t.lng], { icon, draggable: true }).addTo(map);
                marker.on('dragend', saveStateToLocalStorage);
                return marker;
            });
            setTexts(loadedTexts);
            
            const loadedLines = (savedState.lines || []).map((l: any) => {
                const line = L.polyline(l, { color: '#facc15', weight: 3 }).addTo(map);
                return line;
            });
            setLines(loadedLines);

            if (savedState.ecologicalReserveActive) {
                ecologicalReserveOverlayRef.current.addTo(mapRef.current);
            }

        } catch (e) {
            console.error("Failed to load or parse croquis state from localStorage", e);
        } finally {
            isInitialized.current = true;
        }
    }, [saveStateToLocalStorage]);
    
    useEffect(() => {
        if (isActive && mapContainerRef.current && !mapRef.current) {
            try {
                const map = L.map(mapContainerRef.current, { center: [-34.6037, -58.3816], zoom: 15, attributionControl: false });
                mapRef.current = map;

                const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                });
                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri'
                });

                const ecologicalReserveOverlay = L.imageOverlay('https://i.ibb.co/L631p2g/Reserva-Ecologica-Costanera-Sur.jpg', [[-34.609, -58.363], [-34.634, -58.335]], { opacity: 0.75, interactive: true });
                ecologicalReserveOverlayRef.current = ecologicalReserveOverlay;

                const baseLayers = {
                    "Calles": streetLayer,
                    "Satélite": satelliteLayer
                };
                const overlayLayers = {
                    "Reserva Ecológica": ecologicalReserveOverlay
                };

                (initialLayer === 'satellite' ? satelliteLayer : streetLayer).addTo(map);
                L.control.layers(baseLayers, overlayLayers).addTo(map);
                
                L.control.attribution({ position: 'bottomright', prefix: '' }).addTo(map);
                
                map.on('click', () => setSelectedZone(null));
                map.on('overlayadd', saveStateToLocalStorage);
                map.on('overlayremove', saveStateToLocalStorage);
                
                loadStateFromLocalStorage();
                
                setTimeout(() => map.invalidateSize(), 100);
            } catch (e) { console.error("Leaflet initialization error:", e); }
        } else if (isActive && mapRef.current) {
             setTimeout(() => mapRef.current.invalidateSize(), 10);
        }
    }, [isActive, initialLayer, loadStateFromLocalStorage]);
    
    const handleSearch = async () => {
        if (!searchQuery.trim() || !mapRef.current) return;
        const map = mapRef.current;
        const query = encodeURIComponent(searchQuery + ', Ciudad de Buenos Aires, Argentina');
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 17);
            } else {
                alert('Dirección no encontrada.');
            }
        } catch (error) {
            console.error('Error en la búsqueda de dirección:', error);
            alert('No se pudo realizar la búsqueda.');
        }
    };
    
    const handleMapClick = useCallback((e: any) => {
        const map = mapRef.current;
        if (!map || !tool || mode !== 'drawing') return;

        if (tool === 'line') {
            if (!drawingLine.current) {
                drawingLine.current = L.polyline([e.latlng], { color: '#facc15', weight: 3 }).addTo(map);
            } else {
                drawingLine.current.addLatLng(e.latlng);
            }
            return; 
        }

        const latlng = tool === 'point' ? e.latlng : points.length > 0 ? points[points.length - 1].getLatLng() : e.latlng;
        
        let layer;
        let initialRadius = 0;
        let zoneType = '';

        switch(tool) {
            case 'point':
                layer = L.marker(latlng, { draggable: true }).addTo(map);
                layer.on('dragend', saveStateToLocalStorage);
                history.current.push({ type: 'add', element: layer, elementType: 'point' });
                setPoints(prev => [...prev, layer]);
                break;
            case 'impact':
                initialRadius = impactRadius;
                zoneType = 'impact';
                layer = createDraggableCircle(latlng, { radius: impactRadius, color: '#ef4444', weight: 2, fillOpacity: 0.3 });
                break;
            case 'adjacency':
                initialRadius = adjacencyRadius;
                zoneType = 'adjacency';
                layer = createDraggableCircle(latlng, { radius: adjacencyRadius, color: '#f59e0b', weight: 2, fillOpacity: 0.3 });
                break;
            case 'influence':
                initialRadius = influenceRadius;
                zoneType = 'influence';
                layer = createDraggableCircle(latlng, { radius: influenceRadius, color: '#22c55e', weight: 2, fillOpacity: 0.3 });
                break;
            case 'text': {
                if (!textLabel.trim()) return;
                const icon = L.divIcon({ className: 'leaflet-text-icon', html: `<div style="font-weight: bold; color: #facc15; text-shadow: 1px 1px 2px black; font-size: 16px; white-space: nowrap; transform-origin: center; transform: ${isTextVertical ? 'rotate(-90deg)' : 'none'};">${textLabel.trim().toUpperCase()}</div>`});
                layer = L.marker(latlng, { icon, draggable: true }).addTo(map);
                layer.on('dragend', saveStateToLocalStorage);
                history.current.push({ type: 'add', element: layer, elementType: 'text' });
                setTexts(prev => [...prev, layer]);
                break;
            }
            case 'unit': {
                if(!unitLabel.trim()) return;
                const svgPaths: {[key: string]: string} = { engine: `<path d="M19.5,8c-0.28,0-0.5,0.22-0.5,0.5v1.5H5v-1.5C5,8.22,4.78,8,4.5,8S4,8.22,4,8.5v2C4,11.22,4.22,11.5,4.5,11.5h15 c0.28,0,0.5-0.22,0.5-0.5v-2C20,8.22,19.78,8,19.5,8z M18,12H6c-1.1,0-2,0.9-2,2v2h2v-2h12v2h2v-2C20,12.9,19.1,12,18,12z M7.5,15 C6.67,15,6,15.67,6,16.5S6.67,18,7.5,18S9,17.33,9,16.5S8.33,15,7.5,15z M16.5,15c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S17.33,15,16.5,15z" /><path d="M18.92,3.01C18.72,2.42,18.16,2,17.5,2H7.21c-0.53,0-1.02,0.3-1.28,0.77L4,5.12V7h16V5.12L18.92,3.01z M7.28,4h9.44l0.71,1H6.57L7.28,4z" />`, ladder: `<path d="M22 6.13l-1-1-3 3-1-1-3 3-1-1-3 3-1-1-3 3-1-1-2.13 2.13 1 1 3-3 1 1 3-3 1 1 3-3 1 1 3-3 1 1 .13-.13zM4 17h16v-2H4v2z" />`, ambulance: `<path d="M19 8h-1V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM8 6h8v2H8V6zm11 10H5v-4h14v4z" /><path d="M11 11h2v4h-2z" /><path d="M9 13h6v-2H9z" />`, command: `<path d="M12 2L2 7v13h20V7L12 2zm0 2.311L18.6 7H5.4L12 4.311zM4 9h16v10H4V9zm8 1l-4 4h3v4h2v-4h3l-4-4z" />`, person: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />`};
                const colors: {[key: string]: string} = { engine: '#ef4444', ladder: '#3b82f6', ambulance: '#22c55e', command: '#f97316', person: '#a855f7' };
                const symbolHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">${svgPaths[unitType]}</svg>`;
                const html = `<div style="text-align: center; display: flex; flex-direction: column; align-items: center;"><div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${colors[unitType]}; color: white; display:flex; justify-content:center; align-items:center; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.7);">${symbolHtml}</div><div style="color: white; font-size: 12px; font-weight: bold; text-shadow: 1px 1px 2px black; margin-top: 3px; background-color: rgba(0,0,0,0.5); padding: 1px 4px; border-radius: 3px;">${unitLabel}</div></div>`;
                const icon = L.divIcon({ className: 'leaflet-unit-icon', html, unitType, unitLabel });
                layer = L.marker(latlng, { icon, draggable: true }).addTo(map);
                layer.on('dragend', saveStateToLocalStorage);
                history.current.push({ type: 'add', element: layer, elementType: 'unit' });
                setUnits(prev => [...prev, layer]);
                break;
            }
        }
        
        if (tool === 'impact' || tool === 'adjacency' || tool === 'influence') {
            const zoneData = { layer, radius: initialRadius, id: `zone-${Date.now()}`, type: zoneType };
            layer.on('click', L.DomEvent.stopPropagation).on('click', () => handleZoneClick(zoneData));
            history.current.push({ type: 'add', element: zoneData, elementType: 'zone' });
            setZones(prev => [...prev, zoneData]);
        }
        
        setTool(null);
    }, [tool, impactRadius, adjacencyRadius, influenceRadius, unitLabel, unitType, textLabel, isTextVertical, points, mode, saveStateToLocalStorage]);

    useEffect(() => {
        const map = mapRef.current;
        if (map) {
            map.off('click', handleMapClick); 
            if ((tool && tool !== 'line') && mode === 'drawing') {
                map.on('click', handleMapClick);
                L.DomUtil.addClass(map.getContainer(), 'cursor-crosshair');
            } else {
                 L.DomUtil.removeClass(map.getContainer(), 'cursor-crosshair');
            }
        }
        return () => { if (map) map.off('click', handleMapClick); };
    }, [tool, handleMapClick, mode]);
    
    useEffect(() => {
        const map = mapRef.current;
        if (!map || mode !== 'drawing') return;

        const handleLineClick = (e: any) => {
            if (!drawingLine.current) {
                drawingLine.current = L.polyline([e.latlng], { color: '#facc15', weight: 3 }).addTo(map);
            } else {
                drawingLine.current.addLatLng(e.latlng);
            }
        };

        const handleFinishLine = (e: any) => {
            if (!drawingLine.current) return;
            L.DomEvent.stop(e);
            
            const latlngs = drawingLine.current.getLatLngs();
            if (latlngs.length > 1) {
                const finalLine = drawingLine.current;
                setLines(prev => [...prev, finalLine]);
                history.current.push({ type: 'add', element: finalLine, elementType: 'line' });
            } else {
                map.removeLayer(drawingLine.current);
            }
            drawingLine.current = null;
            setTool(null);
        };

        if (tool === 'line') {
            map.on('click', handleLineClick);
            map.on('dblclick', handleFinishLine);
            L.DomUtil.addClass(map.getContainer(), 'cursor-crosshair');
        }

        return () => {
            map.off('click', handleLineClick);
            map.off('dblclick', handleFinishLine);
            if (tool === 'line') {
                L.DomUtil.removeClass(map.getContainer(), 'cursor-crosshair');
            }
            if (drawingLine.current) {
                map.removeLayer(drawingLine.current);
                drawingLine.current = null;
            }
        };
    }, [tool, mode]);

    const undoLastAction = () => {
        if (mode !== 'drawing') return;
        const lastAction = history.current.pop();
        if (lastAction) {
            try {
                const layerToRemove = lastAction.elementType === 'zone' ? lastAction.element.layer : lastAction.element;
                if (mapRef.current && mapRef.current.hasLayer(layerToRemove)) {
                    mapRef.current.removeLayer(layerToRemove);
                }
            } catch(e) {
                 console.error("Failed to remove layer on undo:", e);
            }
    
            switch(lastAction.elementType) {
                case 'point': setPoints(prev => prev.filter(p => p !== lastAction.element)); break;
                case 'zone': setZones(prev => prev.filter(z => z.id !== lastAction.element.id)); if (selectedZone?.id === lastAction.element.id) setSelectedZone(null); break;
                case 'unit': setUnits(prev => prev.filter(u => u !== lastAction.element)); break;
                case 'text': setTexts(prev => prev.filter(t => t !== lastAction.element)); break;
                case 'line': setLines(prev => prev.filter(l => l !== lastAction.element)); break;
                case 'kml': setKmlLayers(prev => prev.filter(l => l !== lastAction.element)); break;
                case 'imageOverlay': setImageOverlay(null); break;
            }
        }
    };

    const clearAll = () => {
        if (mode !== 'drawing') return;
        if (!window.confirm("¿Está seguro de que desea borrar todo el croquis? Esta acción no se puede deshacer.")) return;
        
        const allLayers = [
            ...points, 
            ...zones.map(z => z.layer), 
            ...units, 
            ...texts, 
            ...lines, 
            ...kmlLayers
        ];
        if (imageOverlay) allLayers.push(imageOverlay);
    
        allLayers.forEach(layer => {
            try {
                if (mapRef.current && mapRef.current.hasLayer(layer)) {
                    mapRef.current.removeLayer(layer);
                }
            } catch(e) {
                console.error("Failed to remove layer on clear all:", e);
            }
        });
    
        setPoints([]); setZones([]); setUnits([]); setTexts([]); setLines([]); setKmlLayers([]); setImageOverlay(null);
        history.current = [];
        setSelectedZone(null);
        localStorage.removeItem('croquisState');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !mapRef.current) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                const parser = new DOMParser();
                const kml = parser.parseFromString(content, 'text/xml');
                const geojsonLayer = togeojson.kml(kml);
                const kmlLayer = L.geoJson(geojsonLayer).addTo(mapRef.current);
                setKmlLayers(prev => [...prev, kmlLayer]);
                history.current.push({ type: 'add', element: kmlLayer, elementType: 'kml' });
            }
        };
        reader.readAsText(file);
    };

    const handleLoadEcologicalReserve = () => {
        const map = mapRef.current;
        if (!map) return;
        if (imageOverlay) {
            map.removeLayer(imageOverlay);
            setImageOverlay(null);
            history.current = history.current.filter(h => h.elementType !== 'imageOverlay');
            return;
        }
        
        const imageBounds = [[-34.609, -58.363], [-34.634, -58.335]]; // Updated bounds for better fit
        const overlay = L.imageOverlay('https://i.ibb.co/L631p2g/Reserva-Ecologica-Costanera-Sur.jpg', imageBounds, { opacity: 0.75, interactive: true }).addTo(map);
        map.fitBounds(imageBounds);
        setImageOverlay(overlay);
        history.current.push({ type: 'add', element: overlay, elementType: 'imageOverlay' });
    };

    const handleDownloadImage = async () => {
        const sketch = await captureSketch();
        if (sketch) {
            const a = document.createElement('a');
            a.href = sketch;
            a.download = `croquis_${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("No se pudo generar la imagen del croquis.");
        }
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    const ToolButton = ({ toolName, icon, label }: { toolName: Tool, icon: React.ReactNode, label: string }) => (
        <button onClick={() => setTool(toolName)} className={`p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`} title={label}>
            {icon}
            <span className="mt-1">{label}</span>
        </button>
    );

    return (
        <div ref={containerRef} className={`flex flex-col gap-4 transition-all duration-300 ${isMaximized ? 'fixed inset-0 bg-zinc-900 z-50 p-4' : 'h-[85vh]'}`}>
            {mode === 'drawing' ? (
                 <div className="bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
                     <div className="flex flex-wrap items-center gap-2">
                        <ToolButton toolName="point" label="Marcar Punto" icon={<CrosshairsIcon className="w-6 h-6"/>} />
                        <ToolButton toolName="line" label="Dibujar Línea" icon={<PencilAltIcon className="w-6 h-6"/>} />
                        <ToolButton toolName="impact" label="Zona Impacto" icon={<div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white/50"/>} />
                        <ToolButton toolName="adjacency" label="Zona Adyac." icon={<div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white/50"/>} />
                        <ToolButton toolName="influence" label="Zona Influ." icon={<div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white/50"/>} />
                        <ToolButton toolName="unit" label="Unidades" icon={<EngineIcon className="w-6 h-6"/>} />
                        <ToolButton toolName="text" label="Texto" icon={<PencilIcon className="w-6 h-6"/>} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={undoLastAction} className="p-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white" title="Deshacer"><ArrowUturnLeftIcon className="w-5 h-5" /></button>
                        <button onClick={clearAll} className="p-2 bg-red-600 hover:bg-red-500 rounded-md text-white" title="Limpiar Todo"><TrashIcon className="w-5 h-5" /></button>
                        <button onClick={handleDownloadImage} className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-semibold">
                            <PhotoIcon className="w-5 h-5" />Descargar Imagen
                        </button>
                        <button onClick={handleValidateSketch} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-semibold" title="Validar Croquis"><CameraIcon className="w-5 h-5" />Validar para Reporte</button>
                    </div>
                </div>
            ) : null}
             {mode === 'adjusting' && (
                <div className="bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-center gap-4">
                    <p className="text-lg font-semibold text-yellow-300">Modo de Ajuste Final</p>
                    <p className="text-sm text-zinc-300">Arrastre los elementos para ajustar su posición. Luego, actualice la captura.</p>
                    <button onClick={handleUpdateSketch} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold"><RefreshIcon className="w-5 h-5" />Actualizar Captura</button>
                    <button onClick={handleReturnToDrawing} className="flex items-center gap-2 px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold"><PencilIcon className="w-5 h-5" />Volver a Edición</button>
                </div>
            )}
            
            <div className="relative w-full h-full">
                <div ref={mapContainerRef} className="w-full h-full rounded-xl" style={{ backgroundColor: '#18181b' }}></div>
                <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
                     <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md text-white">
                        {isMaximized ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
                    </button>
                    <input ref={fileInputRef} type="file" accept=".kml" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} title="Importar KML" className="p-2 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md text-white">
                        <FolderPlusIcon className="w-5 h-5" />
                    </button>
                </div>
                {mode === 'drawing' && tool && tool !== 'unit' && tool !== 'text' && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-800/80 p-3 rounded-lg text-white text-sm font-semibold animate-fade-in">
                        {`Haga clic en el mapa para ${tool === 'point' ? 'marcar un punto' : tool === 'line' ? 'empezar a dibujar' : 'colocar el centro de la zona'}.`}
                    </div>
                )}
                {mode === 'drawing' && (
                    <div className="absolute top-16 left-2 z-[1000] flex flex-col gap-2 w-72">
                        {(tool === 'impact' || tool === 'adjacency' || tool === 'influence') && (
                             <div className="bg-zinc-900/50 p-3 rounded-lg flex flex-col gap-2 animate-fade-in">
                                <label className="text-sm text-white font-medium" htmlFor="radius-impact">Radio Zona Impacto (m)</label>
                                <input type="range" id="radius-impact" min="10" max="500" value={impactRadius} onChange={e => setImpactRadius(Number(e.target.value))} className="w-full" />
                                <label className="text-sm text-white font-medium" htmlFor="radius-adjacency">Radio Zona Adyacencia (m)</label>
                                <input type="range" id="radius-adjacency" min="10" max="1000" value={adjacencyRadius} onChange={e => setAdjacencyRadius(Number(e.target.value))} className="w-full" />
                                 <label className="text-sm text-white font-medium" htmlFor="radius-influence">Radio Zona Influencia (m)</label>
                                <input type="range" id="radius-influence" min="10" max="2000" value={influenceRadius} onChange={e => setInfluenceRadius(Number(e.target.value))} className="w-full" />
                            </div>
                        )}

                        {tool === 'unit' && (
                            <div className="bg-zinc-900/50 p-3 rounded-lg flex flex-col gap-3 animate-fade-in">
                                <h4 className="text-sm font-semibold text-white">Añadir Unidades</h4>
                                <p className="text-xs text-zinc-400 -mt-2">Seleccione una unidad y luego haga clic en el mapa.</p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {predefinedUnits.map((unit) => (
                                        <button
                                            key={unit.type}
                                            onClick={() => {
                                                setTool('unit');
                                                setUnitType(unit.type);
                                                setUnitLabel(unit.defaultLabel);
                                            }}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-md text-white font-medium text-xs transition-colors ${unit.color}`}
                                        >
                                            {unit.icon}
                                            <span>{unit.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="border-t border-zinc-700 pt-3 mt-1">
                                    <h5 className="text-xs font-semibold text-zinc-300 mb-1">Unidad Personalizada</h5>
                                    <div className="flex gap-2">
                                        <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-sm">
                                            <option value="engine">Autobomba</option>
                                            <option value="ladder">Hidroelevador</option>
                                            <option value="ambulance">Ambulancia</option>
                                            <option value="command">P. Comando</option>
                                            <option value="person">Personal</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={unitLabel}
                                            onChange={(e) => setUnitLabel(e.target.value)}
                                            placeholder="Etiqueta (Ej: E-1)"
                                            className="flex-grow bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {tool === 'text' && (
                            <div className="bg-zinc-900/50 p-3 rounded-lg flex flex-col gap-2 animate-fade-in">
                                <label className="text-sm text-white font-medium" htmlFor="text-label">Texto a Añadir</label>
                                 <input
                                    type="text"
                                    id="text-label"
                                    value={textLabel}
                                    onChange={(e) => setTextLabel(e.target.value)}
                                    placeholder="Nombre de calle, etc."
                                    className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-sm"
                                    list="street-names"
                                />
                                <datalist id="street-names">
                                    {streets.map(street => <option key={street}>{street}</option>)}
                                </datalist>
                                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                    <input type="checkbox" checked={isTextVertical} onChange={e => setIsTextVertical(e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500"/>
                                    Texto Vertical
                                </label>
                            </div>
                        )}
                        
                         {selectedZone && (
                           <div id="radius-editor" className="bg-zinc-900/50 p-3 rounded-lg flex flex-col gap-2 animate-fade-in">
                             <label htmlFor="radius-slider" className="text-sm text-white font-medium">{`Editar Radio: ${selectedZone.layer.getRadius()}m`}</label>
                             <input
                               type="range"
                               id="radius-slider"
                               min="10"
                               max="2000"
                               step="10"
                               value={selectedZone.layer.getRadius()}
                               onChange={handleRadiusChange}
                               onMouseUp={saveStateToLocalStorage}
                               onTouchEnd={saveStateToLocalStorage}
                               className="w-full"
                             />
                           </div>
                         )}

                    </div>
                )}
                 <div className="absolute top-2 left-2 z-[1000] w-full max-w-sm">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar dirección y centrar mapa..."
                            className="w-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-600 rounded-md pl-4 pr-10 py-2 text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white">
                           <SearchIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
                 {mode === 'adjusting' && (
                    <div className="croquis-lock-overlay absolute inset-0 z-[1001] bg-black/50 flex justify-center items-center backdrop-blur-sm">
                         <div className="text-center p-8 bg-zinc-800 rounded-lg shadow-lg flex flex-col items-center gap-4">
                            <LockClosedIcon className="w-12 h-12 text-yellow-400"/>
                            <h3 className="text-2xl font-bold text-white">Modo de Ajuste Final</h3>
                            <p className="text-zinc-300 max-w-md">El croquis está validado. Mueva los elementos para el ajuste final y actualice la captura para el reporte PDF. O vuelva al modo de edición para añadir/quitar elementos.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Croquis;