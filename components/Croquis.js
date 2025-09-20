import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { TrashIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CrosshairsIcon, MaximizeIcon, MinimizeIcon, PencilIcon, FireIcon, PencilSwooshIcon, AttackArrowIcon, TransferLineIcon, DownloadIcon } from './icons.js';
import ReactDOMServer from 'react-dom/server';


const predefinedUnits = [
    { type: 'engine', label: 'Autobomba', icon: React.createElement(EngineIcon, { className: "w-5 h-5" }), color: '#dc2626', defaultLabel: 'AB' },
    { type: 'ladder', label: 'Hidroelevador', icon: React.createElement(LadderIcon, { className: "w-5 h-5" }), color: '#2563eb', defaultLabel: 'HD' },
    { type: 'ambulance', label: 'Ambulancia', icon: React.createElement(AmbulanceIcon, { className: "w-5 h-5" }), color: '#16a34a', defaultLabel: 'AM' },
    { type: 'command', label: 'Puesto Comando', icon: React.createElement(CommandPostIcon, { className: "w-5 h-5" }), color: '#ea580c', defaultLabel: 'PC' },
    { type: 'person', label: 'Personal', icon: React.createElement(PersonIcon, { className: "w-5 h-5" }), color: '#9333ea', defaultLabel: 'P' }
];

const Croquis = forwardRef((props, ref) => {
    const { isActive, storageKey, interventionGroups = [], onUpdateInterventionGroups } = props;
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const drawingLine = useRef(null);

    const [tool, setTool] = useState(null);
    
    const [editingUnit, setEditingUnit] = useState(null);
    const [unitToPlace, setUnitToPlace] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const [activeSubTool, setActiveSubTool] = useState(predefinedUnits[0]);
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [lineColor, setLineColor] = useState('#ffde03'); // Yellow
    const [textSize, setTextSize] = useState(16);
    const [inputText, setInputText] = useState('');
    
    const tacticalUnitLayers = useRef(new Map());
    
    const handleDownloadSketch = async () => {
        const dataUrl = await croquisRef.current?.capture();
        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `croquis-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        }
    };
    
    const croquisRef = useRef(null);
     useImperativeHandle(ref, () => ({
        capture: async () => {
            if (!mapRef.current || !mapContainerRef.current) return null;
            const controls = mapContainerRef.current.querySelectorAll('.leaflet-control-container, .croquis-controls');
            controls.forEach(c => (c).style.display = 'none');
            
            try {
                const canvas = await html2canvas(mapContainerRef.current, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#18181b', // zinc-900
                });
                return canvas.toDataURL('image/png');
            } catch (error) {
                console.error("Error capturing map:", error);
                return null;
            } finally {
                controls.forEach(c => (c).style.display = '');
            }
        }
    }));

    const saveElementsToLocalStorage = useCallback(() => {
        if (!drawnItemsRef.current) return;
        const geojsonData = drawnItemsRef.current.toGeoJSON();
        
        drawnItemsRef.current.eachLayer((layer) => {
            const feature = layer.toGeoJSON();
            const correspondingFeature = geojsonData.features.find((f) => f.geometry.coordinates.toString() === feature.geometry.coordinates.toString());
            if (correspondingFeature) {
                 const properties = { ...layer.options.customProperties };
                 if (layer.options.icon) {
                    properties.html = layer.options.icon.options.html;
                    properties.className = layer.options.icon.options.className;
                }
                if(layer.options.color) properties.style = { color: layer.options.color, weight: layer.options.weight, dashArray: layer.options.dashArray };
                correspondingFeature.properties = properties;
            }
        });
        localStorage.setItem(storageKey, JSON.stringify(geojsonData));
    }, [storageKey]);

    const loadElementsFromLocalStorage = useCallback(() => {
        const map = mapRef.current;
        const drawnItems = drawnItemsRef.current;
        if (!map || !drawnItems) return;
        
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const geojsonData = JSON.parse(savedData);
                L.geoJSON(geojsonData, {
                    style: (feature) => feature.properties.style,
                    pointToLayer: (feature, latlng) => {
                        const props = feature.properties;
                        if (props.type === 'unit' || props.type === 'text' || props.type === 'impact') {
                            return L.marker(latlng, { 
                                icon: L.divIcon({ html: props.html, className: props.className, iconSize: [0, 0], iconAnchor: [0,0] }),
                                draggable: true 
                            });
                        }
                        return L.marker(latlng, { draggable: true });
                    },
                    onEachFeature: (feature, layer) => {
                        layer.options.customProperties = feature.properties;
                        if (layer instanceof L.Polyline) {
                            layer.setStyle(feature.properties.style);
                        }
                        drawnItems.addLayer(layer);
                    }
                });
            } catch (e) {
                console.error("Error parsing sketch from localStorage:", e);
            }
        }
    }, [storageKey]);
    
    const clearCanvas = () => {
        if (window.confirm("¿Está seguro de que desea borrar todo el boceto?")) {
            drawnItemsRef.current?.clearLayers();
            localStorage.removeItem(storageKey);
    
            if (onUpdateInterventionGroups && interventionGroups) {
                const updatedGroups = interventionGroups.map(g => ({
                    ...g,
                    units: g.units.map(u => ({ ...u, lat: undefined, lng: undefined }))
                }));
                onUpdateInterventionGroups(updatedGroups);
            }
        }
    };

    const handleMapClick = useCallback((e) => {
        const map = mapRef.current;
        if (!map) return;
        const latlng = e.latlng;

        if (unitToPlace) {
             if (onUpdateInterventionGroups) {
                const updatedGroups = interventionGroups.map(g => ({
                    ...g,
                    units: g.units.map(u => u.id === unitToPlace.id ? { ...u, lat: latlng.lat, lng: latlng.lng } : u)
                }));
                onUpdateInterventionGroups(updatedGroups);
            }
            setUnitToPlace(null);
            return;
        }

        if (!tool) return;

        let newElement;
        switch (tool) {
            case 'point': {
                const iconHtml = ReactDOMServer.renderToString(React.createElement(CrosshairsIcon, { className: "w-6 h-6 text-red-500" }));
                newElement = L.marker(latlng, { 
                    icon: L.divIcon({ html: iconHtml, className: 'custom-point-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
                    draggable: true,
                    customProperties: { type: 'point' }
                });
                break;
            }
            case 'impact': {
                const iconHtml = ReactDOMServer.renderToString(React.createElement(FireIcon, { className: "w-8 h-8 text-orange-500" }));
                newElement = L.marker(latlng, { 
                    icon: L.divIcon({ html: iconHtml, className: 'custom-impact-icon', iconSize: [32, 32], iconAnchor: [16, 32] }),
                    draggable: true,
                    customProperties: { type: 'impact' }
                });
                break;
            }
             case 'unit': {
                const unitHtml = ReactDOMServer.renderToString(
                    React.createElement("div", { style: { color: activeSubTool.color }, className: "flex flex-col items-center" },
                        activeSubTool.icon,
                        React.createElement("span", { className: "font-bold text-xs" }, activeSubTool.label)
                    )
                );
                newElement = L.marker(latlng, {
                    icon: L.divIcon({ html: unitHtml, className: 'custom-unit-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
                    draggable: true,
                    customProperties: { type: 'unit', unitType: activeSubTool.type, html: unitHtml, className: 'custom-unit-icon' }
                });
                break;
            }
            case 'text': {
                if (!inputText.trim()) return;
                const textHtml = ReactDOMServer.renderToString(
                    React.createElement("span", { style: { color: textColor, fontSize: `${textSize}px` }, className: "font-semibold" }, inputText)
                );
                newElement = L.marker(latlng, {
                    icon: L.divIcon({ html: textHtml, className: 'custom-text-icon', iconSize: [0, 0], iconAnchor: [0,0] }),
                    draggable: true,
                    customProperties: { type: 'text', text: inputText, html: textHtml, className: 'custom-text-icon' }
                });
                setInputText('');
                break;
            }
            case 'attackLine':
            case 'transferLine':
                if (!drawingLine.current) {
                    const style = { color: lineColor, weight: 3, dashArray: tool === 'transferLine' ? '5, 10' : undefined };
                    drawingLine.current = L.polyline([latlng], style).addTo(map);
                } else {
                    drawingLine.current.addLatLng(latlng);
                }
                return;
        }
        if (newElement) {
            drawnItemsRef.current?.addLayer(newElement);
            saveElementsToLocalStorage();
        }
    }, [tool, unitToPlace, interventionGroups, onUpdateInterventionGroups, activeSubTool, textColor, textSize, inputText, lineColor, saveElementsToLocalStorage]);
    
     const handleMapDoubleClick = useCallback(() => {
        if (drawingLine.current) {
            drawingLine.current.options.customProperties = { 
                type: drawingLine.current.options.dashArray ? 'transferLine' : 'attackLine', 
                style: { 
                    color: drawingLine.current.options.color, 
                    weight: drawingLine.current.options.weight, 
                    dashArray: drawingLine.current.options.dashArray 
                } 
            };
            drawnItemsRef.current?.addLayer(drawingLine.current);
            drawingLine.current = null;
            setTool(null);
            saveElementsToLocalStorage();
        }
    }, [saveElementsToLocalStorage]);
    
    useEffect(() => {
        if (!isActive || !mapContainerRef.current) return;
        let map;

        if (!mapRef.current) {
            map = L.map(mapContainerRef.current, { center: [-34.6037, -58.3816], zoom: 15 });
            mapRef.current = map;
            drawnItemsRef.current = new L.FeatureGroup().addTo(map);

            const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' });
            const baseLayers = { 'Calles': streetLayer, 'Satélite': satelliteLayer };
            (storageKey === 'forestalSketch' ? satelliteLayer : streetLayer).addTo(map);
            L.control.layers(baseLayers).addTo(map);
            
            loadElementsFromLocalStorage();
        } else {
            map = mapRef.current;
        }
        
        const clickHandler = (e) => handleMapClick(e);
        const dblClickHandler = () => handleMapDoubleClick();
        
        map.on('click', clickHandler);
        map.on('dblclick', dblClickHandler);
        
        setTimeout(() => map.invalidateSize(), 100);

        return () => {
            map.off('click', clickHandler);
            map.off('dblclick', dblClickHandler);
        };
    }, [isActive, storageKey, loadElementsFromLocalStorage, handleMapClick, handleMapDoubleClick]);

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
    
        currentUnitIdsOnMap.forEach(unitId => {
            if (!desiredUnitIds.has(unitId)) {
                const layerToRemove = tacticalUnitLayers.current.get(unitId);
                if (layerToRemove && map.hasLayer(layerToRemove)) {
                    map.removeLayer(layerToRemove);
                }
                tacticalUnitLayers.current.delete(unitId);
            }
        });
    
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
                    const currentGroups = JSON.parse(JSON.stringify(interventionGroups));
                    const updatedGroups = currentGroups.map((g) => ({
                        ...g,
                        units: g.units.map((u) => u.id === unit.id ? { ...u, lat: newLatLng.lat, lng: newLatLng.lng } : u)
                    }));
                    onUpdateInterventionGroups(updatedGroups);
                };
    
                const clickHandler = () => setEditingUnit(unit);
    
                if (existingLayer) {
                    existingLayer.setLatLng(latLng).setIcon(newIcon);
                    existingLayer.off('dragend').off('click').on('dragend', dragEndHandler).on('click', clickHandler);
                } else {
                    const marker = L.marker(latLng, { icon: newIcon, draggable: true }).addTo(map);
                    marker.on('dragend', dragEndHandler).on('click', clickHandler);
                    tacticalUnitLayers.current.set(unit.id, marker);
                }
            } else if (existingLayer) {
                if(map.hasLayer(existingLayer)) {
                    map.removeLayer(existingLayer);
                }
                tacticalUnitLayers.current.delete(unit.id);
            }
        });
    
    }, [interventionGroups, onUpdateInterventionGroups]);

    const ToolButton = ({ toolName, label, icon }) => (
        React.createElement("button", {
            onClick: () => {
                setTool(t => t === toolName ? null : toolName);
                if (drawingLine.current) {
                    drawingLine.current.options.customProperties = { type: drawingLine.current.options.dashArray ? 'transferLine' : 'attackLine' };
                    drawnItemsRef.current?.addLayer(drawingLine.current);
                    drawingLine.current = null;
                    saveElementsToLocalStorage();
                }
            },
            className: `p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 h-16 justify-center ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`,
            title: label
        },
            icon,
            React.createElement("span", { className: "mt-1" }, label)
        )
    );

    return (
        React.createElement("div", { className: `w-full h-full relative ${isFullScreen ? 'fixed inset-0 z-50' : ''}` },
            React.createElement("div", { ref: mapContainerRef, className: "w-full h-full rounded-xl bg-zinc-900" }),
            React.createElement("div", { className: "croquis-controls absolute top-3 left-3 flex flex-col gap-3 z-[1000]" },
                onUpdateInterventionGroups && (
                    React.createElement("div", { className: "bg-zinc-800/80 backdrop-blur-sm p-2 rounded-lg max-w-xs" },
                        React.createElement("h4", { className: "text-white font-bold text-sm mb-2" }, "Unidades Tácticas"),
                        React.createElement("ul", { className: "space-y-1 max-h-48 overflow-y-auto pr-1" },
                           interventionGroups.flatMap(g => g.units).map(unit => {
                                const isPlaced = unit.lat && unit.lng;
                                return (
                                React.createElement("li", { key: unit.id, onClick: () => !isPlaced && setUnitToPlace(unit), className: `text-xs px-2 py-1 rounded cursor-pointer ${isPlaced ? 'bg-green-800/50 text-green-300' : 'bg-sky-800/70 hover:bg-sky-700 text-sky-200'} ${unitToPlace?.id === unit.id ? 'ring-2 ring-yellow-300' : ''}` },
                                    `${unit.id} (${isPlaced ? 'Ubicado' : 'Ubicar'})`
                                )
                               )
                           })
                        )
                    )
                ),
                React.createElement("div", { className: "bg-zinc-800/80 backdrop-blur-sm p-2 rounded-lg" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                        React.createElement(ToolButton, { toolName: "impact", label: "Impacto", icon: React.createElement(FireIcon, { className: "w-6 h-6" }) }),
                        React.createElement(ToolButton, { toolName: "point", label: "Punto", icon: React.createElement(CrosshairsIcon, { className: "w-6 h-6" }) }),
                        React.createElement(ToolButton, { toolName: "attackLine", label: "Línea Ataque", icon: React.createElement(AttackArrowIcon, { className: "w-6 h-6" }) }),
                        React.createElement(ToolButton, { toolName: "transferLine", label: "Línea Trasv.", icon: React.createElement(TransferLineIcon, { className: "w-6 h-6" }) }),
                        React.createElement(ToolButton, { toolName: "unit", label: "Unidades", icon: React.createElement(EngineIcon, { className: "w-6 h-6" }) }),
                        React.createElement(ToolButton, { toolName: "text", label: "Texto", icon: React.createElement(PencilIcon, { className: "w-6 h-6" }) })
                    ),
                    tool === 'unit' && (
                        React.createElement("div", { className: "mt-2 pt-2 border-t border-zinc-600 flex flex-wrap gap-2 justify-center" },
                            predefinedUnits.map(u => (
                                React.createElement("button", { key: u.type, onClick: () => setActiveSubTool(u), className: `p-1 rounded transition-colors ${activeSubTool.type === u.type ? 'bg-blue-500' : 'bg-zinc-600 hover:bg-zinc-500'}`, style: { color: u.color } }, u.icon)
                            ))
                        )
                    ),
                     tool === 'text' && (
                        React.createElement("div", { className: "mt-2 pt-2 border-t border-zinc-600 space-y-2" },
                            React.createElement("input", { type: "text", value: inputText, onChange: e => setInputText(e.target.value), placeholder: "Escribir texto...", className: "w-full bg-zinc-900 border-zinc-700 text-white rounded p-1 text-sm"}),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("input", { type: "color", value: textColor, onChange: e => setTextColor(e.target.value), className: "w-8 h-8 bg-transparent" }),
                                React.createElement("input", { type: "range", min: "10", max: "48", value: textSize, onChange: e => setTextSize(Number(e.target.value)), className: "w-full" })
                            )
                        )
                    ),
                     (tool === 'attackLine' || tool === 'transferLine') && (
                        React.createElement("div", { className: "mt-2 pt-2 border-t border-zinc-600 space-y-2" },
                             React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("label", { className: "text-xs text-zinc-300" }, "Color:"),
                                React.createElement("input", { type: "color", value: lineColor, onChange: e => setLineColor(e.target.value), className: "w-8 h-8 bg-transparent" })
                            ),
                            React.createElement("p", { className: "text-xs text-zinc-400" }, "Doble click para finalizar línea.")
                        )
                    )
                )
            ),
            React.createElement("div", { className: "croquis-controls absolute top-3 right-3 flex flex-col gap-3 z-[1000]" },
                 React.createElement("button", { onClick: clearCanvas, className: "p-2 bg-red-600 hover:bg-red-500 rounded-md text-white", title: "Limpiar Todo" }, React.createElement(TrashIcon, { className: "w-5 h-5" })),
                React.createElement("button", { onClick: () => setIsFullScreen(fs => !fs), className: "p-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white", title: isFullScreen ? "Salir de pantalla completa" : "Pantalla completa" },
                    isFullScreen ? React.createElement(MinimizeIcon, { className: "w-5 h-5" }) : React.createElement(MaximizeIcon, { className: "w-5 h-5" })
                ),
                React.createElement("button", { onClick: handleDownloadSketch, className: "p-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white", title: "Descargar Croquis" },
                    React.createElement(DownloadIcon, { className: "w-5 h-5" })
                )
            ),
            editingUnit && (
                React.createElement("div", { className: "absolute inset-0 bg-black/50 z-[1001] flex justify-center items-center", onClick: () => setEditingUnit(null) },
                    React.createElement("div", { className: "bg-zinc-800 p-4 rounded-lg animate-scale-in", onClick: e => e.stopPropagation() },
                        React.createElement("h4", { className: "text-white font-bold mb-3" }, `Editar Unidad: ${editingUnit.id}`),
                        React.createElement("div", { className: "space-y-3" },
                             React.createElement("div", null,
                                React.createElement("label", { className: "text-sm text-zinc-400" }, "Etiqueta"),
                                React.createElement("input", { type: "text", defaultValue: editingUnit.mapLabel || editingUnit.id, onBlur: e => handleUpdateUnitDetails(editingUnit.id, { mapLabel: e.target.value }), className: "w-full bg-zinc-700 p-1 rounded mt-1"})
                            ),
                             React.createElement("div", null,
                                React.createElement("label", { className: "text-sm text-zinc-400" }, "Color"),
                                React.createElement("input", { type: "color", defaultValue: editingUnit.mapColor || '#ef4444', onBlur: e => handleUpdateUnitDetails(editingUnit.id, { mapColor: e.target.value }), className: "w-full h-10 mt-1"})
                            )
                        ),
                        React.createElement("button", { onClick: () => setEditingUnit(null), className: "mt-4 w-full bg-blue-600 p-2 rounded text-white"}, "Cerrar")
                    )
                )
            )
        )
    );
});

export default Croquis;
