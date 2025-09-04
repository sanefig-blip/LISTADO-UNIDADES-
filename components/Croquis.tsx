import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Add PencilIcon, FolderPlusIcon, and PhotoIcon to the import statement.
import { TrashIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CrosshairsIcon, MaximizeIcon, MinimizeIcon, SearchIcon, ArrowUturnLeftIcon, CameraIcon, LockClosedIcon, PencilIcon, PencilAltIcon, RefreshIcon, FolderPlusIcon, PhotoIcon } from './icons';
import { streets } from '../data/streets';

declare const L: any;
declare const html2canvas: any;
declare const toGeoJSON: any;


interface CroquisProps {
    isActive: boolean;
    onSketchCapture: (imageDataUrl: string) => void;
    onUnlockSketch: () => void;
}

type Tool = 'point' | 'impact' | 'adjacency' | 'influence' | 'unit' | 'text' | 'line' | null;
type CroquisElement = { type: 'add', element: any, elementType: 'point' | 'zone' | 'unit' | 'text' | 'line' | 'kml' | 'imageOverlay' };
type CroquisMode = 'drawing' | 'adjusting';

const Croquis: React.FC<CroquisProps> = ({ isActive, onSketchCapture, onUnlockSketch }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
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

    const [points, setPoints] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [texts, setTexts] = useState<any[]>([]);
    const [lines, setLines] = useState<any[]>([]);
    const [kmlLayers, setKmlLayers] = useState<any[]>([]);
    const [imageOverlay, setImageOverlay] = useState<any>(null);

    const [selectedZone, setSelectedZone] = useState<any>(null);
    
    const history = useRef<CroquisElement[]>([]);
    const drawingLine = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     const saveStateToLocalStorage = useCallback(() => {
        try {
            const state = {
                points: points.map(p => ({ lat: p.getLatLng().lat, lng: p.getLatLng().lng })),
                zones: zones.map(z => ({ lat: z.layer.getLatLng().lat, lng: z.layer.getLatLng().lng, radius: z.layer.getRadius(), color: z.layer.options.color, type: z.type })),
                units: units.map(u => ({ lat: u.getLatLng().lat, lng: u.getLatLng().lng, type: u.options.icon.options.unitType, label: u.options.icon.options.unitLabel })),
                texts: texts.map(t => ({ lat: t.getLatLng().lat, lng: t.getLatLng().lng, text: t.options.icon.options.html.match(/>(.*?)</)?.[1] || '', isVertical: (t.options.icon.options.html.includes('rotate(-90deg)')) })),
                lines: lines.map(l => l.getLatLngs().map((latlng: any) => ({ lat: latlng.lat, lng: latlng.lng }))),
            };
            localStorage.setItem('croquisState', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save croquis state to localStorage", e);
        }
    }, [points, zones, units, texts, lines]);
    
    useEffect(() => {
        saveStateToLocalStorage();
    }, [saveStateToLocalStorage]);


    const getCenteredSketch = async (): Promise<string | null> => {
        const map = mapRef.current;
        if (!map || !mapContainerRef.current) return null;

        const allLatLngs = [
            ...points.map(p => p.getLatLng()),
            ...zones.flatMap(z => {
                const center = z.layer.getLatLng(); const radius = z.layer.getRadius();
                const northEast = L.latLng(center.lat + (radius / 111320), center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI/180))));
                const southWest = L.latLng(center.lat - (radius / 111320), center.lng - (radius / (111320 * Math.cos(center.lat * Math.PI/180))));
                return [northEast, southWest];
            }),
            ...units.map(u => u.getLatLng()),
            ...texts.map(t => t.getLatLng()),
            ...lines.flatMap(l => l.getLatLngs())
        ];
        if (imageOverlay) {
            allLatLngs.push(...[imageOverlay.getBounds().getNorthWest(), imageOverlay.getBounds().getSouthEast()]);
        }
        kmlLayers.forEach(layer => {
            if (layer.getBounds && layer.getBounds().isValid()) {
                allLatLngs.push(layer.getBounds().getNorthWest(), layer.getBounds().getSouthEast());
            }
        });


        const originalCenter = map.getCenter();
        const originalZoom = map.getZoom();

        if (allLatLngs.length > 0) {
            const bounds = L.latLngBounds(allLatLngs);
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], animate: false });
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        try {
            const canvas = await html2canvas(mapContainerRef.current, {
                useCORS: true, backgroundColor: '#18181b', logging: false,
                onclone: (doc: Document) => {
                    const toHide = ['.leaflet-control-attribution', '#radius-editor', '.leaflet-control-zoom', '.croquis-lock-overlay'];
                    toHide.forEach(sel => {
                        const elem = doc.querySelector(sel) as HTMLElement | null;
                        if (elem) elem.style.display = 'none';
                    });
                    
                    const mapPane = doc.querySelector('.leaflet-map-pane') as HTMLElement | null;
                    if (mapPane) {
                        const transform = window.getComputedStyle(mapPane).transform;
                         if (transform && transform !== 'none') {
                            const matrix = new DOMMatrixReadOnly(transform);
                            const offsetX = matrix.e;
                            const offsetY = matrix.f;
                            
                            const panes = doc.querySelectorAll('.leaflet-pane') as NodeListOf<HTMLElement>;
                            panes.forEach((pane) => {
                                pane.style.transform = 'none';
                                pane.style.left = `${offsetX}px`;
                                pane.style.top = `${offsetY}px`;
                            });
                        }
                    }
                }
            });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error("html2canvas error:", e);
            return null;
        } finally {
            map.setView(originalCenter, originalZoom, { animate: false });
            await new Promise(resolve => setTimeout(resolve, 100));
            map.invalidateSize();
        }
    };
    
    const handleValidateSketch = async () => {
        const sketch = await getCenteredSketch();
        if (sketch) {
            onSketchCapture(sketch);
            setMode('adjusting');
        } else {
            alert("No se pudo capturar el croquis.");
        }
    };

    const handleUpdateSketch = async () => {
         const sketch = await getCenteredSketch();
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

    useEffect(() => {
        if (isActive && mapContainerRef.current && !mapRef.current) {
            try {
                const map = L.map(mapContainerRef.current, { center: [-34.6037, -58.3816], zoom: 15, attributionControl: false });
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                L.control.attribution({ position: 'bottomright', prefix: '' }).addTo(map);
                mapRef.current = map;
                
                map.on('click', () => setSelectedZone(null));
                
                loadStateFromLocalStorage();
                
                setTimeout(() => map.invalidateSize(), 100);
            } catch (e) { console.error("Leaflet initialization error:", e); }
        } else if (isActive && mapRef.current) {
            setTimeout(() => mapRef.current.invalidateSize(), 10);
        }
    }, [isActive]);
    
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
                const svgPaths: { [key: string]: string } = { engine: `<path d="M19.5,8c-0.28,0-0.5,0.22-0.5,0.5v1.5H5v-1.5C5,8.22,4.78,8,4.5,8S4,8.22,4,8.5v2C4,11.22,4.22,11.5,4.5,11.5h15 c0.28,0,0.5-0.22,0.5-0.5v-2C20,8.22,19.78,8,19.5,8z M18,12H6c-1.1,0-2,0.9-2,2v2h2v-2h12v2h2v-2C20,12.9,19.1,12,18,12z M7.5,15 C6.67,15,6,15.67,6,16.5S6.67,18,7.5,18S9,17.33,9,16.5S8.33,15,7.5,15z M16.5,15c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S17.33,15,16.5,15z" /><path d="M18.92,3.01C18.72,2.42,18.16,2,17.5,2H7.21c-0.53,0-1.02,0.3-1.28,0.77L4,5.12V7h16V5.12L18.92,3.01z M7.28,4h9.44l0.71,1H6.57L7.28,4z" />`, ladder: `<path d="M22 6.13l-1-1-3 3-1-1-3 3-1-1-3 3-1-1-3 3-1-1-2.13 2.13 1 1 3-3 1 1 3-3 1 1 3-3 1 1 3-3 1 1 .13-.13zM4 17h16v-2H4v2z" />`, ambulance: `<path d="M19 8h-1V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM8 6h8v2H8V6zm11 10H5v-4h14v4z" /><path d="M11 11h2v4h-2z" /><path d="M9 13h6v-2H9z" />`, command: `<path d="M12 2L2 7v13h20V7L12 2zm0 2.311L18.6 7H5.4L12 4.311zM4 9h16v10H4V9zm8 1l-4 4h3v4h2v-4h3l-4-4z" />`, person: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />`};
                const colors: { [key: string]: string } = { engine: '#ef4444', ladder: '#3b82f6', ambulance: '#22c55e', command: '#f97316', person: '#a855f7' };
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
    }, [tool, mapRef, impactRadius, adjacencyRadius, influenceRadius, unitLabel, unitType, textLabel, isTextVertical, points, mode]);

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
            mapRef.current.removeLayer(lastAction.element.layer || lastAction.element);

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
        [...points, ...zones.map(z => z.layer), ...units, ...texts, ...lines, ...kmlLayers].forEach(layer => mapRef.current?.removeLayer(layer));
        if (imageOverlay) mapRef.current?.removeLayer(imageOverlay);
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
            const content = e.target?.result as string;
            const parser = new DOMParser();
            const kml = parser.parseFromString(content, 'text/xml');
            const geojsonLayer = toGeoJSON.kml(kml);
            const kmlLayer = L.geoJson(geojsonLayer).addTo(mapRef.current);
            setKmlLayers(prev => [...prev, kmlLayer]);
            history.current.push({ type: 'add', element: kmlLayer, elementType: 'kml' });
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
        
// FIX: Remove invalid TypeScript type annotation for Leaflet bounds.
        const imageBounds = [[-34.6133, -58.3565], [-34.6318, -58.3375]];
        const overlay = L.imageOverlay('https://i.imgur.com/uN99s2c.jpeg', imageBounds, { opacity: 0.75, interactive: true }).addTo(map);
        map.fitBounds(imageBounds);
        setImageOverlay(overlay);
        history.current.push({ type: 'add', element: overlay, elementType: 'imageOverlay' });
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
                const colorMap = { impact: '#ef4444', adjacency: '#f59e0b', influence: '#22c55e' };
                const circle = createDraggableCircle([z.lat, z.lng], { radius: z.radius, color: z.color || colorMap[z.type as keyof typeof colorMap], weight: 2, fillOpacity: 0.3 });
                const zoneData = { layer: circle, radius: z.radius, id: `zone-loaded-${Date.now()}-${Math.random()}`, type: z.type };
                circle.on('click', L.DomEvent.stopPropagation).on('click', () => handleZoneClick(zoneData));
                return zoneData;
            });
            setZones(loadedZones);
            
            const loadedUnits = (savedState.units || []).map((u: any) => {
                 const svgPaths: { [key: string]: string } = { engine: `<path d="M19.5,8c-0.28,0-0.5,0.22-0.5,0.5v1.5H5v-1.5C5,8.22,4.78,8,4.5,8S4,8.22,4,8.5v2C4,11.22,4.22,11.5,4.5,11.5h15 c0.28,0,0.5-0.22,0.5-0.5v-2C20,8.22,19.78,8,19.5,8z M18,12H6c-1.1,0-2,0.9-2,2v2h2v-2h12v2h2v-2C20,12.9,19.1,12,18,12z M7.5,15 C6.67,15,6,15.67,6,16.5S6.67,18,7.5,18S9,17.33,9,16.5S8.33,15,7.5,15z M16.5,15c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S17.33,15,16.5,15z" /><path d="M18.92,3.01C18.72,2.42,18.16,2,17.5,2H7.21c-0.53,0-1.02,0.3-1.28,0.77L4,5.12V7h16V5.12L18.92,3.01z M7.28,4h9.44l0.71,1H6.57L7.28,4z" />`, ladder: `<path d="M22 6.13l-1-1-3 3-1-1-3 3-1-1-3 3-1-1-3 3-1-1-2.13 2.13 1 1 3-3 1 1 3-3 1 1 3-3 1 1 3-3 1 1 .13-.13zM4 17h16v-2H4v2z" />`, ambulance: `<path d="M19 8h-1V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM8 6h8v2H8V6zm11 10H5v-4h14v4z" /><path d="M11 11h2v4h-2z" /><path d="M9 13h6v-2H9z" />`, command: `<path d="M12 2L2 7v13h20V7L12 2zm0 2.311L18.6 7H5.4L12 4.311zM4 9h16v10H4V9zm8 1l-4 4h3v4h2v-4h3l-4-4z" />`, person: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />`};
                const colors: { [key: string]: string } = { engine: '#ef4444', ladder: '#3b82f6', ambulance: '#22c55e', command: '#f97316', person: '#a855f7' };
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

        } catch (e) {
            console.error("Failed to load or parse croquis state from localStorage", e);
        }
    }, [mapRef.current]);

    const clearAllForLoad = () => {
        [...points, ...zones.map(z => z.layer), ...units, ...texts, ...lines, ...kmlLayers].forEach(layer => mapRef.current?.removeLayer(layer));
        if (imageOverlay) mapRef.current?.removeLayer(imageOverlay);
        setPoints([]); setZones([]); setUnits([]); setTexts([]); setLines([]); setKmlLayers([]); setImageOverlay(null);
        history.current = [];
        setSelectedZone(null);
    };
    
    const ToolButton = ({ toolName, icon, label }: { toolName: Tool, icon: React.ReactNode, label: string }) => (
        <button onClick={() => setTool(toolName)} className={`p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`} title={label}>
            {icon}
            <span className="mt-1">{label}</span>
        </button>
    );

    return (
        React.createElement("div", { ref: containerRef, className: `flex flex-col gap-4 transition-all duration-300 ${isMaximized ? 'fixed inset-0 bg-zinc-900 z-50 p-4' : 'h-[85vh]'}` },
            mode === 'drawing' ? (
                React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2" },
                    /* Tool controls */
                    React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                        React.createElement(ToolButton, { toolName: "point", label: "Marcar Punto", icon: React.createElement(CrosshairsIcon, { className: "w-6 h-6"})}),
                        React.createElement(ToolButton, { toolName: "line", label: "Dibujar Línea", icon: React.createElement(PencilAltIcon, { className: "w-6 h-6"})}),
                        React.createElement("div", { className: "flex items-center gap-1 p-1 bg-zinc-900/50 rounded-md" },
                            React.createElement(ToolButton, { toolName: "impact", label: "Z. Impacto", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-red-500 border-2 border-red-300"})}),
                            React.createElement("input", { type: "number", value: impactRadius, onChange: e => setImpactRadius(Number(e.target.value)), className: "w-16 bg-zinc-700 rounded p-1 text-white text-sm" }),
                            React.createElement("span", { className: "text-zinc-400 text-sm" }, "m")
                        ),
                        React.createElement("div", { className: "flex items-center gap-1 p-1 bg-zinc-900/50 rounded-md" },
                            React.createElement(ToolButton, { toolName: "adjacency", label: "Z. Adyac.", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-yellow-500 border-2 border-yellow-300"})}),
                            React.createElement("input", { type: "number", value: adjacencyRadius, onChange: e => setAdjacencyRadius(Number(e.target.value)), className: "w-16 bg-zinc-700 rounded p-1 text-white text-sm" }),
                            React.createElement("span", { className: "text-zinc-400 text-sm" }, "m")
                        ),
                        React.createElement("div", { className: "flex items-center gap-1 p-1 bg-zinc-900/50 rounded-md" },
                            React.createElement(ToolButton, { toolName: "influence", label: "Z. Influ.", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-green-500 border-2 border-green-300"})}),
                            React.createElement("input", { type: "number", value: influenceRadius, onChange: e => setInfluenceRadius(Number(e.target.value)), className: "w-16 bg-zinc-700 rounded p-1 text-white text-sm" }),
                            React.createElement("span", { className: "text-zinc-400 text-sm" }, "m")
                        )
                    ),
                    /* Other controls */
                    React.createElement("div", { className: "flex flex-col gap-2 p-2 rounded-md bg-zinc-900/50" },
                        React.createElement("div", { className: "flex items-center gap-2" },
// FIX: Replace React.createElement with JSX for the select element to fix typing error.
                            <select value={unitType} onChange={e => setUnitType(e.target.value)} className="bg-zinc-700 rounded px-2 py-1 text-white text-sm">
                                <option value="engine">Autobomba</option>
                                <option value="ladder">Hidroelevador</option>
                                <option value="ambulance">Ambulancia</option>
                                <option value="command">P. Comando</option>
                                <option value="person">Personal</option>
                            </select>,
                            React.createElement("input", { type: "text", value: unitLabel, onChange: e => setUnitLabel(e.target.value), placeholder: "Etiqueta", className: "bg-zinc-700 rounded px-2 py-1 text-white w-24 text-sm"}),
                            React.createElement("button", { onClick: () => setTool('unit'), className: `px-3 py-1 rounded text-white text-sm ${tool === 'unit' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}, "Añadir Unidad")
                        ),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "text", list: "streets-datalist", value: textLabel, onChange: e => setTextLabel(e.target.value), placeholder: "Nombre de calle...", className: "bg-zinc-700 rounded px-2 py-1 text-white w-48 text-sm"}),
                            React.createElement("datalist", { id: "streets-datalist" }, streets.map(s => React.createElement("option", { key: s, value: s }))),
                            React.createElement("button", { onClick: () => setIsTextVertical(v => !v), className: `p-2 rounded ${isTextVertical ? 'bg-blue-600' : 'bg-zinc-700'}`, title: "Rotar Texto"}, React.createElement("span", { className: "transform transition-transform text-sm", style: {display: 'inline-block', transform: isTextVertical ? 'rotate(90deg)' : 'none' }}, "T")),
                            React.createElement("button", { onClick: () => setTool('text'), className: `px-3 py-1 rounded text-white text-sm ${tool === 'text' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}, "Añadir Texto")
                        )
                    ),
                    /* Action buttons */
                    React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                        React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement("input", { type: "text", value: searchQuery, onKeyDown: (e: any) => {if(e.key === 'Enter') handleSearch()}, onChange: e => setSearchQuery(e.target.value), placeholder: "Buscar dirección...", className: "bg-zinc-700 rounded px-2 py-1 text-white w-40 text-sm"}),
                            React.createElement("button", { onClick: handleSearch, className: "p-2 bg-sky-600 hover:bg-sky-500 rounded text-white"}, React.createElement(SearchIcon, { className: "w-4 h-4" }))
                        ),
                        React.createElement("div", {className: "flex items-center gap-1"},
                           React.createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileUpload, style: { display: 'none' }, accept: ".kml" }),
                           React.createElement("button", { onClick: () => fileInputRef.current?.click(), className: "p-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white", title: "Cargar KML"}, React.createElement(FolderPlusIcon, { className: "w-5 h-5"})),
                           React.createElement("button", { onClick: handleLoadEcologicalReserve, className: `p-2 rounded-md text-white ${imageOverlay ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`, title: imageOverlay ? "Quitar Mapa Reserva" : "Cargar Mapa Reserva"}, React.createElement(PhotoIcon, { className: "w-5 h-5"}))
                        ),
                        React.createElement("button", { onClick: undoLastAction, className: "p-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white", title: "Deshacer"}, React.createElement(ArrowUturnLeftIcon, { className: "w-5 h-5" })),
                        React.createElement("button", { onClick: clearAll, className: "p-2 bg-red-600 hover:bg-red-500 rounded-md text-white", title: "Limpiar Todo"}, React.createElement(TrashIcon, { className: "w-5 h-5" })),
                        React.createElement("button", { onClick: handleValidateSketch, className: "flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-semibold", title: "Validar Croquis"}, React.createElement(CameraIcon, { className: "w-5 h-5" }), "Validar para Reporte"),
                        React.createElement("button", { onClick: () => setIsMaximized(!isMaximized), className: "p-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white", title: isMaximized ? "Minimizar" : "Maximizar"},
                            isMaximized ? React.createElement(MinimizeIcon, { className: "w-5 h-5" }) : React.createElement(MaximizeIcon, { className: "w-5 h-5" })
                        )
                    )
                )
            ) : null,
             mode === 'adjusting' && (
                React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-center gap-4" },
                    React.createElement("p", {className: "text-lg font-semibold text-yellow-300"}, "Modo de Ajuste Final"),
                    React.createElement("p", {className: "text-sm text-zinc-300"}, "Arrastre los elementos para ajustar su posición. Luego, actualice la captura."),
                     React.createElement("button", { onClick: handleUpdateSketch, className: "flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold"}, React.createElement(RefreshIcon, { className: "w-5 h-5" }), "Actualizar Captura"),
// FIX: Replace PencilAltIcon with PencilIcon and ensure it is imported. The error message was 'Cannot find name 'PencilIcon''.
                     React.createElement("button", { onClick: handleReturnToDrawing, className: "flex items-center gap-2 px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold"}, React.createElement(PencilIcon, { className: "w-5 h-5" }), "Volver a Edición")
                )
            ),
            React.createElement("div", { className: "relative w-full h-full" },
                React.createElement("div", { ref: mapContainerRef, className: "w-full h-full rounded-xl", style: { backgroundColor: '#18181b' }}),
                selectedZone && mode === 'drawing' && (
                     React.createElement("div", { id: "radius-editor", className: "absolute top-2 left-2 bg-zinc-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000] animate-fade-in text-white text-sm" },
                        React.createElement("label", { className: "flex items-center gap-2" },
                            "Radio (m):",
                            React.createElement("input", {
                                type: "range", min: "10", max: "500", step: "5", value: selectedZone.radius,
                                onChange: handleRadiusChange, onMouseUp: saveStateToLocalStorage, className: "w-32" }),
                            React.createElement("input", {
                                type: "number", value: selectedZone.radius, onChange: handleRadiusChange, onBlur: saveStateToLocalStorage,
                                className: "w-20 bg-zinc-700 rounded p-1" })
                        )
                    )
                )
            )
        )
    );
};

export default Croquis;
