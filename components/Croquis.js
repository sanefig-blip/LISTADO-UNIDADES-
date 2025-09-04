import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { TrashIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CrosshairsIcon, MaximizeIcon, MinimizeIcon, SearchIcon, ArrowUturnLeftIcon } from './icons.js';
import { streets } from '../data/streets.js';

const Croquis = forwardRef(({ isActive }, ref) => {
    const containerRef = useRef(null);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [tool, setTool] = useState(null);

    const [unitType, setUnitType] = useState('engine');
    const [unitLabel, setUnitLabel] = useState('E-1');
    const [textLabel, setTextLabel] = useState('');
    const [isTextVertical, setIsTextVertical] = useState(false);
    
    const [impactRadius, setImpactRadius] = useState(50);
    const [adjacencyRadius, setAdjacencyRadius] = useState(100);
    const [influenceRadius, setInfluenceRadius] = useState(150);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);

    const [points, setPoints] = useState([]);
    const [zones, setZones] = useState([]);
    const [units, setUnits] = useState([]);
    const [texts, setTexts] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    
    const history = useRef([]);

    const updateSketch = useCallback(async (forceCapture = false) => {
      if (!mapRef.current || !mapContainerRef.current) return null;
      try {
        const canvas = await html2canvas(mapContainerRef.current, {
            useCORS: true,
            backgroundColor: '#18181b',
            logging: false,
            onclone: (doc) => {
                const attribution = doc.querySelector('.leaflet-control-attribution');
                if (attribution) attribution.style.display = 'none';
                const editor = doc.getElementById('radius-editor');
                if (editor) editor.style.display = 'none';
                
                // The core fix: iterate over all Leaflet panes and convert their CSS transform
                // to absolute positioning, which html2canvas understands correctly.
                const panes = doc.querySelectorAll('.leaflet-pane');
                panes.forEach(p => {
                    const pane = p;
                    const transform = pane.style.transform;
                    const regex = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px,.*\)/;
                    const match = transform.match(regex);

                    if (match) {
                        pane.style.transform = 'none';
                        pane.style.left = `${match[1]}px`;
                        pane.style.top = `${match[2]}px`;
                    }
                });
            }
        });
        return canvas.toDataURL('image/png');
      } catch (e) {
        console.error("html2canvas error:", e);
        return null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
        getCenteredSketch: async () => {
            const map = mapRef.current;
            if (!map) return null;

            const allLatLngs = [
                ...points.map(p => p.getLatLng()),
                ...zones.flatMap(z => {
                    const center = z.layer.getLatLng();
                    const radius = z.layer.getRadius();
                    const north = L.latLng(center.lat + (radius / 111320), center.lng);
                    const south = L.latLng(center.lat - (radius / 111320), center.lng);
                    const east = L.latLng(center.lat, center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI/180))));
                    const west = L.latLng(center.lat, center.lng - (radius / (111320 * Math.cos(center.lat * Math.PI/180))));
                    return [north, south, east, west];
                }),
                ...units.map(u => u.getLatLng()),
                ...texts.map(t => t.getLatLng())
            ];

            if (allLatLngs.length === 0) {
                return updateSketch(true);
            }

            const bounds = L.latLngBounds(allLatLngs);
            if (!bounds.isValid()) {
                return updateSketch(true);
            }

            const originalCenter = map.getCenter();
            const originalZoom = map.getZoom();

            map.fitBounds(bounds, { padding: [50, 50], animate: false });
            await new Promise(resolve => setTimeout(resolve, 500)); 

            const sketch = await updateSketch(true);

            map.setView(originalCenter, originalZoom, { animate: false });
            await new Promise(resolve => setTimeout(resolve, 100));
            map.invalidateSize();
            
            return sketch;
        }
    }));

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
    
    const createDraggableCircle = (centerLatLng, options) => {
        const map = mapRef.current;
        const circle = L.circle(centerLatLng, options).addTo(map);
        
        let isDragging = false;
        
        circle.on('mousedown', (e) => {
            if (tool) return;
            L.DomEvent.stopPropagation(e);
            map.dragging.disable();
            isDragging = false;
            map.on('mousemove', onDrag);
            map.on('mouseup', onDragEnd);
        });

        const onDrag = (e) => {
            isDragging = true;
            circle.setLatLng(e.latlng);
        };

        const onDragEnd = () => {
            map.dragging.enable();
            map.off('mousemove', onDrag);
            map.off('mouseup', onDragEnd);
        };
        
        return circle;
    };

    const handleZoneClick = (zone) => {
        setSelectedZone(zone);
    };

    const handleRadiusChange = (e) => {
        if (selectedZone) {
            const newRadius = Number(e.target.value);
            selectedZone.layer.setRadius(newRadius);
            const newZones = zones.map(z => z.id === selectedZone.id ? { ...z, radius: newRadius } : z);
            setZones(newZones);
        }
    };
    
    const handleMapClick = useCallback((e) => {
        const map = mapRef.current;
        if (!map || !tool) return;
        const latlng = tool === 'point' ? e.latlng : points.length > 0 ? points[points.length - 1].getLatLng() : e.latlng;
        
        let layer;
        let initialRadius = 0;

        switch(tool) {
            case 'point':
                layer = L.marker(latlng, { draggable: true }).addTo(map);
                const pointData = layer;
                history.current.push({ type: 'add', element: pointData, elementType: 'point' });
                setPoints(prev => [...prev, pointData]);
                break;
            case 'impact':
                initialRadius = impactRadius;
                layer = createDraggableCircle(latlng, { radius: impactRadius, color: '#ef4444', weight: 2, fillOpacity: 0.3 });
                break;
            case 'adjacency':
                initialRadius = adjacencyRadius;
                layer = createDraggableCircle(latlng, { radius: adjacencyRadius, color: '#f59e0b', weight: 2, fillOpacity: 0.3 });
                break;
            case 'influence':
                initialRadius = influenceRadius;
                layer = createDraggableCircle(latlng, { radius: influenceRadius, color: '#22c55e', weight: 2, fillOpacity: 0.3 });
                break;
            case 'text': {
                if (!textLabel.trim()) return;
                const icon = L.divIcon({ className: 'leaflet-text-icon', html: `<div style="font-weight: bold; color: #facc15; text-shadow: 1px 1px 2px black; font-size: 16px; white-space: nowrap; transform-origin: center; transform: ${isTextVertical ? 'rotate(-90deg)' : 'none'};">${textLabel.trim().toUpperCase()}</div>`});
                layer = L.marker(latlng, { icon, draggable: true }).addTo(map);
                const textData = layer;
                history.current.push({ type: 'add', element: textData, elementType: 'text' });
                setTexts(prev => [...prev, textData]);
                break;
            }
            case 'unit': {
                if(!unitLabel.trim()) return;
                const svgPaths = { engine: `<path d="M19.5,8c-0.28,0-0.5,0.22-0.5,0.5v1.5H5v-1.5C5,8.22,4.78,8,4.5,8S4,8.22,4,8.5v2C4,11.22,4.22,11.5,4.5,11.5h15 c0.28,0,0.5-0.22,0.5-0.5v-2C20,8.22,19.78,8,19.5,8z M18,12H6c-1.1,0-2,0.9-2,2v2h2v-2h12v2h2v-2C20,12.9,19.1,12,18,12z M7.5,15 C6.67,15,6,15.67,6,16.5S6.67,18,7.5,18S9,17.33,9,16.5S8.33,15,7.5,15z M16.5,15c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S17.33,15,16.5,15z" /><path d="M18.92,3.01C18.72,2.42,18.16,2,17.5,2H7.21c-0.53,0-1.02,0.3-1.28,0.77L4,5.12V7h16V5.12L18.92,3.01z M7.28,4h9.44l0.71,1H6.57L7.28,4z" />`, ladder: `<path d="M22 6.13l-1-1-3 3-1-1-3 3-1-1-3 3-1-1-3 3-1-1-2.13 2.13 1 1 3-3 1 1 3-3 1 1 3-3 1 1 3-3 1 1 .13-.13zM4 17h16v-2H4v2z" />`, ambulance: `<path d="M19 8h-1V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM8 6h8v2H8V6zm11 10H5v-4h14v4z" /><path d="M11 11h2v4h-2z" /><path d="M9 13h6v-2H9z" />`, command: `<path d="M12 2L2 7v13h20V7L12 2zm0 2.311L18.6 7H5.4L12 4.311zM4 9h16v10H4V9zm8 1l-4 4h3v4h2v-4h3l-4-4z" />`, person: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />`};
                const colors = { engine: '#ef4444', ladder: '#3b82f6', ambulance: '#22c55e', command: '#f97316', person: '#a855f7' };
                const symbolHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">${svgPaths[unitType]}</svg>`;
                const html = `<div style="text-align: center; display: flex; flex-direction: column; align-items: center;"><div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${colors[unitType]}; color: white; display:flex; justify-content:center; align-items:center; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.7);">${symbolHtml}</div><div style="color: white; font-size: 12px; font-weight: bold; text-shadow: 1px 1px 2px black; margin-top: 3px; background-color: rgba(0,0,0,0.5); padding: 1px 4px; border-radius: 3px;">${unitLabel}</div></div>`;
                const icon = L.divIcon({ className: 'leaflet-unit-icon', html });
                layer = L.marker(latlng, { icon, draggable: true }).addTo(map);
                const unitData = layer;
                history.current.push({ type: 'add', element: unitData, elementType: 'unit' });
                setUnits(prev => [...prev, unitData]);
                break;
            }
        }
        
        if (tool === 'impact' || tool === 'adjacency' || tool === 'influence') {
            const zoneData = { layer, radius: initialRadius, id: `zone-${Date.now()}` };
            layer.on('click', L.DomEvent.stopPropagation).on('click', () => handleZoneClick(zoneData));
            history.current.push({ type: 'add', element: zoneData, elementType: 'zone' });
            setZones(prev => [...prev, zoneData]);
        }
        
        setTool(null);
    }, [tool, mapRef, impactRadius, adjacencyRadius, influenceRadius, unitLabel, unitType, textLabel, isTextVertical, points]);

    useEffect(() => {
        const map = mapRef.current;
        if (map) {
            if (tool) {
                map.on('click', handleMapClick);
                L.DomUtil.addClass(map.getContainer(), 'cursor-crosshair');
            } else {
                map.off('click', handleMapClick);
                L.DomUtil.removeClass(map.getContainer(), 'cursor-crosshair');
            }
        }
        return () => { if (map) map.off('click', handleMapClick); };
    }, [tool, handleMapClick]);
    
    const undoLastAction = () => {
        const lastAction = history.current.pop();
        if (lastAction) {
            mapRef.current.removeLayer(lastAction.element.layer || lastAction.element);

            switch(lastAction.elementType) {
                case 'point': setPoints(prev => prev.filter(p => p !== lastAction.element)); break;
                case 'zone': setZones(prev => prev.filter(z => z.id !== lastAction.element.id)); if (selectedZone?.id === lastAction.element.id) setSelectedZone(null); break;
                case 'unit': setUnits(prev => prev.filter(u => u !== lastAction.element)); break;
                case 'text': setTexts(prev => prev.filter(t => t !== lastAction.element)); break;
            }
        }
    };

    const clearAll = () => {
        [...points, ...zones.map(z => z.layer), ...units, ...texts].forEach(layer => mapRef.current?.removeLayer(layer));
        setPoints([]);
        setZones([]);
        setUnits([]);
        setTexts([]);
        history.current = [];
        setSelectedZone(null);
    };
    
    const ToolButton = ({ toolName, icon, label }) => (
        React.createElement("button", { onClick: () => setTool(toolName), className: `p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`, title: label },
            icon,
            React.createElement("span", { className: "mt-1" }, label)
        )
    );

    return (
        React.createElement("div", { ref: containerRef, className: `flex flex-col gap-4 transition-all duration-300 ${isMaximized ? 'fixed inset-0 bg-zinc-900 z-50 p-4' : 'h-[85vh]'}` },
            React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2" },
                React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                    React.createElement(ToolButton, { toolName: "point", label: "Marcar Punto", icon: React.createElement(CrosshairsIcon, { className: "w-6 h-6" }) }),
                    React.createElement("div", { className: "flex items-center gap-1 p-1 bg-zinc-900/50 rounded-md" },
                        React.createElement(ToolButton, { toolName: "impact", label: "Z. Impacto", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-red-500 border-2 border-red-300" }) }),
                        React.createElement("input", { type: "number", value: impactRadius, onChange: e => setImpactRadius(Number(e.target.value)), className: "w-16 bg-zinc-700 rounded p-1 text-white text-sm" }),
                        React.createElement("span", { className: "text-zinc-400 text-sm" }, "m")
                    ),
                     React.createElement("div", { className: "flex items-center gap-1 p-1 bg-zinc-900/50 rounded-md" },
                        React.createElement(ToolButton, { toolName: "adjacency", label: "Z. Adyac.", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-yellow-500 border-2 border-yellow-300" }) }),
                        React.createElement("input", { type: "number", value: adjacencyRadius, onChange: e => setAdjacencyRadius(Number(e.target.value)), className: "w-16 bg-zinc-700 rounded p-1 text-white text-sm" }),
                         React.createElement("span", { className: "text-zinc-400 text-sm" }, "m")
                    ),
                     React.createElement("div", { className: "flex items-center gap-1 p-1 bg-zinc-900/50 rounded-md" },
                        React.createElement(ToolButton, { toolName: "influence", label: "Z. Influ.", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-green-500 border-2 border-green-300" }) }),
                        React.createElement("input", { type: "number", value: influenceRadius, onChange: e => setInfluenceRadius(Number(e.target.value)), className: "w-16 bg-zinc-700 rounded p-1 text-white text-sm" }),
                         React.createElement("span", { className: "text-zinc-400 text-sm" }, "m")
                    )
                ),
                React.createElement("div", { className: "flex flex-col gap-2 p-2 rounded-md bg-zinc-900/50" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("select", { value: unitType, onChange: e => setUnitType(e.target.value), className: "bg-zinc-700 rounded px-2 py-1 text-white text-sm" }, 
                            React.createElement("option", { value: "engine" }, "Autobomba"), 
                            React.createElement("option", { value: "ladder" }, "Hidroelevador"), 
                            React.createElement("option", { value: "ambulance" }, "Ambulancia"), 
                            React.createElement("option", { value: "command" }, "P. Comando"), 
                            React.createElement("option", { value: "person" }, "Personal")
                        ),
                        React.createElement("input", { type: "text", value: unitLabel, onChange: e => setUnitLabel(e.target.value), placeholder: "Etiqueta", className: "bg-zinc-700 rounded px-2 py-1 text-white w-24 text-sm" }),
                        React.createElement("button", { onClick: () => setTool('unit'), className: `px-3 py-1 rounded text-white text-sm ${tool === 'unit' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'}` }, "Añadir Unidad")
                    ),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("input", { type: "text", list: "streets-datalist", value: textLabel, onChange: e => setTextLabel(e.target.value), placeholder: "Nombre de calle...", className: "bg-zinc-700 rounded px-2 py-1 text-white w-48 text-sm" }),
                        React.createElement("datalist", { id: "streets-datalist" }, streets.map(s => React.createElement("option", { key: s, value: s }))),
                        React.createElement("button", { onClick: () => setIsTextVertical(v => !v), className: `p-2 rounded ${isTextVertical ? 'bg-blue-600' : 'bg-zinc-700'}`, title: "Rotar Texto" }, 
                            React.createElement("span", { className: "transform transition-transform text-sm", style: { display: 'inline-block', transform: isTextVertical ? 'rotate(90deg)' : 'none' } }, "T")
                        ),
                        React.createElement("button", { onClick: () => setTool('text'), className: `px-3 py-1 rounded text-white text-sm ${tool === 'text' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'}` }, "Añadir Texto")
                    )
                ),
                React.createElement("div", { className: "flex flex-col sm:flex-row items-center gap-2" },
                     React.createElement("div", { className: "flex items-center gap-1" },
                        React.createElement("input", { type: "text", value: searchQuery, onKeyDown: (e) => {if(e.key === 'Enter') handleSearch()}, onChange: e => setSearchQuery(e.target.value), placeholder: "Buscar dirección...", className: "bg-zinc-700 rounded px-2 py-1 text-white w-40 text-sm" }),
                        React.createElement("button", { onClick: handleSearch, className: "p-2 bg-sky-600 hover:bg-sky-500 rounded text-white" }, React.createElement(SearchIcon, { className: "w-4 h-4" }))
                     ),
                     React.createElement("button", { onClick: undoLastAction, className: "p-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white", title: "Deshacer" }, React.createElement(ArrowUturnLeftIcon, { className: "w-5 h-5" })),
                     React.createElement("button", { onClick: clearAll, className: "p-2 bg-red-600 hover:bg-red-500 rounded-md text-white", title: "Limpiar Todo" }, React.createElement(TrashIcon, { className: "w-5 h-5" })),
                     React.createElement("button", { onClick: () => setIsMaximized(!isMaximized), className: "p-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white", title: isMaximized ? "Minimizar" : "Maximizar" },
                        isMaximized ? React.createElement(MinimizeIcon, { className: "w-5 h-5" }) : React.createElement(MaximizeIcon, { className: "w-5 h-5" })
                    )
                )
            ),
            React.createElement("div", { className: "relative w-full h-full" },
                React.createElement("div", { ref: mapContainerRef, className: "w-full h-full rounded-xl", style: { backgroundColor: '#18181b' } }),
                selectedZone && (
                     React.createElement("div", { id: "radius-editor", className: "absolute top-2 left-2 bg-zinc-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000] animate-fade-in text-white text-sm" },
                        React.createElement("label", { className: "flex items-center gap-2" },
                            "Radio (m):",
                            React.createElement("input", {
                                type: "range",
                                min: "10",
                                max: "500",
                                step: "5",
                                value: selectedZone.radius,
                                onChange: handleRadiusChange,
                                className: "w-32"
                            }),
                            React.createElement("input", {
                                type: "number",
                                value: selectedZone.radius,
                                onChange: handleRadiusChange,
                                className: "w-20 bg-zinc-700 rounded p-1"
                            })
                        )
                    )
                )
            )
        )
    );
});

export default Croquis;
