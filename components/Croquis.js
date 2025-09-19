import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TrashIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CrosshairsIcon, MaximizeIcon, MinimizeIcon, SearchIcon, ArrowUturnLeftIcon, CameraIcon, LockClosedIcon, PencilIcon, PencilAltIcon, RefreshIcon, FolderPlusIcon, PhotoIcon, FireIcon } from './icons.js';
import { streets } from '../data/streets.js';
import * as togeojson from '@tmcw/togeojson';
import ReactDOMServer from 'react-dom/server';


const predefinedUnits = [
    { type: 'engine', label: 'Autobomba', icon: React.createElement(EngineIcon, { className: "w-5 h-5" }), color: '#dc2626', defaultLabel: 'AB' },
    { type: 'ladder', label: 'Hidroelevador', icon: React.createElement(LadderIcon, { className: "w-5 h-5" }), color: '#2563eb', defaultLabel: 'HD' },
    { type: 'ambulance', label: 'Ambulancia', icon: React.createElement(AmbulanceIcon, { className: "w-5 h-5" }), color: '#16a34a', defaultLabel: 'AM' },
    { type: 'command', label: 'Puesto Comando', icon: React.createElement(CommandPostIcon, { className: "w-5 h-5" }), color: '#ea580c', defaultLabel: 'PC' },
    { type: 'person', label: 'Personal', icon: React.createElement(PersonIcon, { className: "w-5 h-5" }), color: '#9333ea', defaultLabel: 'P' }
];

const Croquis = ({ isActive, onSketchCapture, onUnlockSketch, initialLayer = 'street', interventionGroups = [], onUpdateInterventionGroups }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    
    const [tool, setTool] = useState(null);
    const [mode, setMode] = useState('drawing');
    
    const [unitType, setUnitType] = useState('engine');
    const [unitLabel, setUnitLabel] = useState('E-1');
    const [textLabel, setTextLabel] = useState('');
    const [isTextVertical, setIsTextVertical] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);
    
    const [elements, setElements] = useState([]);
    const drawingLine = useRef(null);
    const fileInputRef = useRef(null);

    const [editingUnit, setEditingUnit] = useState(null);
    const [unitToPlace, setUnitToPlace] = useState(null);
    
    const tacticalUnitLayers = useRef(new Map());

    const handleUpdateUnitDetails = (unitId, details) => {
        if (onUpdateInterventionGroups) {
            const updatedGroups = interventionGroups.map(g => ({
                ...g,
                units: g.units.map(u => u.id === unitId ? { ...u, ...details } : u)
            }));
            onUpdateInterventionGroups(updatedGroups);
        }
        setEditingUnit(null);
    };

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !onUpdateInterventionGroups) return;
    
        const allUnitsInGroups = interventionGroups.flatMap(g => g.units);
        const desiredUnitIds = new Set(allUnitsInGroups.map(u => u.id));
        const currentUnitIdsOnMap = new Set(tacticalUnitLayers.current.keys());
    
        // 1. Remove markers for units that are no longer in interventionGroups
        currentUnitIdsOnMap.forEach(unitId => {
            if (!desiredUnitIds.has(unitId)) {
                const layerToRemove = tacticalUnitLayers.current.get(unitId);
                if (layerToRemove) {
                    map.removeLayer(layerToRemove);
                    tacticalUnitLayers.current.delete(unitId);
                }
            }
        });
    
        // 2. Add or update markers for units in interventionGroups
        allUnitsInGroups.forEach(unit => {
            const latLng = unit.lat && unit.lng ? [unit.lat, unit.lng] : null;
            const existingLayer = tacticalUnitLayers.current.get(unit.id);
    
            if (latLng) {
                const color = unit.mapColor || '#ef4444';
                const label = unit.mapLabel || unit.id;
                const iconHtml = `<div style="background-color: ${color};" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg cursor-pointer">${label}</div>`;
                const newIcon = L.divIcon({ className: 'tactical-unit-icon', html: iconHtml, iconSize: [32, 32], iconAnchor: [16, 16] });
    
                const dragEndHandler = (event) => {
                    const newLatLng = event.target.getLatLng();
                    const updatedGroups = interventionGroups.map(g => ({
                        ...g,
                        units: g.units.map(u => u.id === unit.id ? { ...u, lat: newLatLng.lat, lng: newLatLng.lng } : u)
                    }));
                    onUpdateInterventionGroups(updatedGroups);
                };
    
                const clickHandler = () => setEditingUnit(unit);
    
                if (existingLayer) {
                    // Update existing layer's position and icon
                    existingLayer.setLatLng(latLng);
                    existingLayer.setIcon(newIcon);
    
                    // Detach and re-attach event listeners to prevent stale closures
                    existingLayer.off('dragend').off('click');
                    existingLayer.on('dragend', dragEndHandler);
                    existingLayer.on('click', clickHandler);
    
                } else {
                    // Create new layer
                    const marker = L.marker(latLng, { icon: newIcon, draggable: true }).addTo(map);
                    marker.on('dragend', dragEndHandler);
                    marker.on('click', clickHandler);
                    tacticalUnitLayers.current.set(unit.id, marker);
                }
            } else if (existingLayer) {
                // If unit has no lat/lng but exists on map, remove it
                map.removeLayer(existingLayer);
                tacticalUnitLayers.current.delete(unit.id);
            }
        });
    
    }, [interventionGroups, onUpdateInterventionGroups]);


    useEffect(() => {
        const map = mapRef.current;
        if (!map || mode !== 'drawing') return;

        const onMapClick = (e) => {
             if (unitToPlace && onUpdateInterventionGroups) {
                const updatedGroups = interventionGroups.map(g => ({ ...g, units: g.units.map(u => u.id === unitToPlace.id ? { ...u, lat: e.latlng.lat, lng: e.latlng.lng } : u)}));
                onUpdateInterventionGroups(updatedGroups);
                setUnitToPlace(null);
                document.body.style.cursor = '';
                return;
            }

            if (!tool) return;

            const createIcon = (options) => L.divIcon({ ...options, iconSize: [0, 0], iconAnchor: [0,0] });
            let newLayer;

            switch (tool) {
                case 'point': newLayer = L.marker(e.latlng); break;
                case 'impact': newLayer = L.circle(e.latlng, { radius: 50, color: 'red' }); break;
                case 'adjacency': newLayer = L.circle(e.latlng, { radius: 100, color: 'yellow' }); break;
                case 'influence': newLayer = L.circle(e.latlng, { radius: 150, color: 'green' }); break;
                case 'unit':
                    const selectedUnit = predefinedUnits.find(u => u.type === unitType);
                    if (selectedUnit) {
                        const iconHtml = `<div style="padding: 0.25rem; border-radius: 9999px; background-color: ${selectedUnit.color}; color: white;">${ReactDOMServer.renderToString(selectedUnit.icon)}</div><div style="font-size: 0.75rem; font-weight: bold; color: white; white-space: nowrap; transform: translateX(-50%); position: relative; left: 50%; margin-top: 0.25rem; background-color: rgba(0,0,0,0.5); padding: 0.125rem 0.25rem; border-radius: 0.125rem;">${unitLabel}</div>`;
                        newLayer = L.marker(e.latlng, { icon: createIcon({ html: iconHtml, className: 'leaflet-unit-icon'}), draggable: true });
                    }
                    break;
                case 'text':
                    if (textLabel.trim()) {
                        const textHtml = `<div class="text-lg font-semibold text-white bg-black/50 px-2 py-1 rounded" style="transform: ${isTextVertical ? 'rotate(-90deg)' : 'none'};">${textLabel}</div>`;
                        newLayer = L.marker(e.latlng, { icon: createIcon({ html: textHtml, className: 'leaflet-text-icon' }), draggable: true });
                    }
                    break;
                case 'attackLine':
                case 'transferLine':
                    if (!drawingLine.current) {
                        const lineOptions = tool === 'attackLine' ? { color: 'red' } : { color: 'blue', dashArray: '5, 10' };
                        drawingLine.current = L.polyline([e.latlng], lineOptions).addTo(map);
                    } else {
                        drawingLine.current.addLatLng(e.latlng);
                    }
                    return;
            }

            if (newLayer) {
                newLayer.addTo(map);
                setElements(prev => [...prev, newLayer]);
            }
        };

        const onMapDoubleClick = () => {
            if (drawingLine.current) {
                setElements(prev => [...prev, drawingLine.current]);
                drawingLine.current = null;
                setTool(null);
            }
        };

        map.on('click', onMapClick);
        map.on('dblclick', onMapDoubleClick);

        return () => {
            map.off('click', onMapClick);
            map.off('dblclick', onMapDoubleClick);
        };
    }, [tool, mode, unitType, unitLabel, textLabel, isTextVertical, unitToPlace, interventionGroups, onUpdateInterventionGroups]);

    useEffect(() => {
        if (isActive && mapContainerRef.current && !mapRef.current) {
            try {
                const map = L.map(mapContainerRef.current, { center: [-34.6037, -58.3816], zoom: 15, attributionControl: false });
                mapRef.current = map;
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
                setTimeout(() => map.invalidateSize(), 100);
            } catch (e) { console.error("Leaflet initialization error:", e); }
        } else if (isActive && mapRef.current) {
             setTimeout(() => mapRef.current.invalidateSize(), 10);
        }
    }, [isActive]);

    const clearAll = () => {
        if (window.confirm("¿Borrar todo el croquis?")) {
            elements.forEach(el => mapRef.current?.removeLayer(el));
            setElements([]);
        }
    };
    
    useEffect(() => {
        document.body.style.cursor = unitToPlace ? 'crosshair' : 'default';
        return () => { document.body.style.cursor = 'default'; };
    }, [unitToPlace]);


    const unplacedUnits = interventionGroups.flatMap(g => g.units).filter(u => !u.lat || !u.lng);

    const ToolButton = ({ toolName, icon, label }) => (
        React.createElement("button", {
            onClick: () => setTool(toolName),
            className: `p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`,
            title: label
        },
        icon,
        React.createElement("span", { className: "mt-1" }, label))
    );

    return (
        React.createElement("div", { className: `flex gap-4 transition-all duration-300 ${isMaximized ? 'fixed inset-0 bg-zinc-900 z-50 p-4' : 'h-[85vh]'} ${isActive ? 'flex-row' : 'hidden'}` },
             React.createElement("div", { className: "flex flex-col gap-4 w-1/4 max-w-xs" },
                // Tactical Units Sidebar
                React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl flex-grow flex flex-col" },
                    React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-2" }, "Unidades Tácticas"),
                    unplacedUnits.length > 0 && (
                        React.createElement("div", null,
                            React.createElement("h4", { className: "text-white font-semibold mb-2 text-sm" }, `Sin Ubicación (${unplacedUnits.length})`),
                            React.createElement("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2" },
                                unplacedUnits.map(unit => (
                                    React.createElement("li", { key: unit.id, className: "flex justify-between items-center bg-zinc-700/50 p-2 rounded-md text-sm" },
                                        React.createElement("span", { className: "font-mono text-zinc-200" }, unit.id),
                                        React.createElement("button", { onClick: () => setUnitToPlace(unit), className: "px-2 py-1 text-xs bg-sky-600 hover:bg-sky-500 rounded text-white" }, "Ubicar")
                                    )
                                ))
                            )
                        )
                    ),
                    React.createElement("div", { className: "mt-4" },
                        React.createElement("h4", { className: "text-white font-semibold mb-2 text-sm" }, "Grupos en Escena"),
                         React.createElement("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2" },
                             interventionGroups.map(group => (
                                React.createElement("li", { key: group.id }, React.createElement("span", { className: "font-bold text-blue-300" }, group.name), ": ", group.units.filter(u => u.lat).map(u => u.mapLabel || u.id).join(', '))
                            ))
                        )
                    )
                ),

                // Drawing Tools
                React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl shadow-sm" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                        React.createElement(ToolButton, { toolName: "point", label: "Punto", icon: React.createElement(CrosshairsIcon, { className: "w-5 h-5" }) }),
                        React.createElement(ToolButton, { toolName: "attackLine", label: "Ataque", icon: React.createElement(FireIcon, { className: "w-5 h-5" }) }),
                        React.createElement(ToolButton, { toolName: "transferLine", label: "Transf.", icon: React.createElement("div", { className: "w-5 h-5 border-2 border-dashed border-blue-500 rounded-full" }) }),
                        React.createElement(ToolButton, { toolName: "unit", label: "Unidad", icon: React.createElement(EngineIcon, { className: "w-5 h-5" }) }),
                        React.createElement(ToolButton, { toolName: "text", label: "Texto", icon: React.createElement(PencilIcon, { className: "w-5 h-5" }) }),
                        React.createElement(ToolButton, { toolName: "impact", label: "Impacto", icon: React.createElement("div", { className: "w-5 h-5 rounded-full bg-red-500/80" }) })
                    )
                )
            ),

            React.createElement("div", { className: "relative w-full h-full" },
                React.createElement("div", { ref: mapContainerRef, className: "w-full h-full rounded-xl", style: { backgroundColor: '#18181b' } })
            ),

            editingUnit && (
                React.createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-zinc-800 p-4 rounded-lg shadow-lg w-72 border border-zinc-600" },
                    React.createElement("h4", { className: "text-white font-bold mb-3" }, "Editar: ", editingUnit.id),
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-zinc-400" }, "Etiqueta"),
                            React.createElement("input", {
                                type: "text",
                                value: editingUnit.mapLabel || '',
                                onChange: e => setEditingUnit(prev => prev ? { ...prev, mapLabel: e.target.value } : null),
                                className: "w-full bg-zinc-700 rounded p-1 text-white"
                            })
                        ),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-zinc-400" }, "Color"),
                            React.createElement("input", {
                                type: "color",
                                value: editingUnit.mapColor || '#ffffff',
                                onChange: e => setEditingUnit(prev => prev ? { ...prev, mapColor: e.target.value } : null),
                                className: "w-full h-8 p-0 border-none bg-transparent"
                            })
                        )
                    ),
                    React.createElement("div", { className: "flex justify-end gap-2 mt-4" },
                        React.createElement("button", { onClick: () => setEditingUnit(null), className: "px-3 py-1 text-sm bg-zinc-600 hover:bg-zinc-500 rounded" }, "Cancelar"),
                        React.createElement("button", { onClick: () => handleUpdateUnitDetails(editingUnit.id, { mapLabel: editingUnit.mapLabel, mapColor: editingUnit.mapColor }), className: "px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded" }, "Guardar")
                    )
                )
            )
        )
    );
};
export default Croquis;
