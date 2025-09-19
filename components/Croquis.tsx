import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Added missing FireIcon import.
import { TrashIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CrosshairsIcon, MaximizeIcon, MinimizeIcon, SearchIcon, ArrowUturnLeftIcon, CameraIcon, LockClosedIcon, PencilIcon, PencilAltIcon, RefreshIcon, FolderPlusIcon, PhotoIcon, FireIcon } from './icons';
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

type Tool = 'point' | 'impact' | 'adjacency' | 'influence' | 'unit' | 'text' | 'line' | 'attackLine' | 'transferLine' | null;
type CroquisElement = { type: 'add', element: any, elementType: 'point' | 'zone' | 'unit' | 'text' | 'line' | 'kml' | 'imageOverlay' };
type CroquisMode = 'drawing' | 'adjusting';

const predefinedUnits = [
    { type: 'engine', label: 'Autobomba', icon: <EngineIcon className="w-5 h-5" />, color: 'bg-red-600 hover:bg-red-500', defaultLabel: 'E-1' },
    { type: 'ladder', label: 'Hidroelevador', icon: <LadderIcon className="w-5 h-5" />, color: 'bg-blue-600 hover:bg-blue-500', defaultLabel: 'H-1' },
    { type: 'ambulance', label: 'Ambulancia', icon: <AmbulanceIcon className="w-5 h-5" />, color: 'bg-green-600 hover:bg-green-500', defaultLabel: 'A-1' },
    { type: 'command', label: 'Puesto Comando', icon: <CommandPostIcon className="w-5 h-5" />, color: 'bg-orange-600 hover:bg-orange-500', defaultLabel: 'PC-1' },
    { type: 'person', label: 'Personal', icon: <PersonIcon className="w-5 h-5" />, color: 'bg-purple-600 hover:bg-purple-500', defaultLabel: 'P-1' }
];

const Croquis: React.FC<CroquisProps> = ({ isActive, onSketchCapture, onUnlockSketch, initialLayer = 'street' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const isInitialized = useRef(false);
    
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

    const [elements, setElements] = useState<any[]>([]);
    
    const [selectedZone, setSelectedZone] = useState<any>(null);
    
    const history = useRef<CroquisElement[]>([]);
    const drawingLine = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     const saveStateToLocalStorage = useCallback(() => {
        if (!isInitialized.current || !mapRef.current) return;
        try {
            const state = elements.map(el => {
                if (el.elementType === 'point') return { elementType: 'point', lat: el.layer.getLatLng().lat, lng: el.layer.getLatLng().lng };
                if (el.elementType === 'zone') return { elementType: 'zone', lat: el.layer.getLatLng().lat, lng: el.layer.getLatLng().lng, radius: el.layer.getRadius(), color: el.layer.options.color, type: el.type };
                if (el.elementType === 'unit') return { elementType: 'unit', lat: el.layer.getLatLng().lat, lng: el.layer.getLatLng().lng, type: el.layer.options.icon.options.unitType, label: el.layer.options.icon.options.unitLabel };
                if (el.elementType === 'text') return { elementType: 'text', lat: el.layer.getLatLng().lat, lng: el.layer.getLatLng().lng, text: el.layer.options.icon.options.html.match(/>(.*?)</)?.[1] || '', isVertical: (el.layer.options.icon.options.html.includes('rotate(-90deg)')) };
                if (el.elementType === 'line') return { elementType: 'line', latlngs: el.layer.getLatLngs().map((latlng: any) => ({ lat: latlng.lat, lng: latlng.lng })), options: el.layer.options };
                return null;
            }).filter(Boolean);
            
            localStorage.setItem('croquisElements', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save croquis state to localStorage", e);
        }
    }, [elements]);
    
    useEffect(() => {
        saveStateToLocalStorage();
    }, [saveStateToLocalStorage]);


    const captureSketch = async (): Promise<string | null> => {
        const map = mapRef.current;
        if (!map || !mapContainerRef.current) return null;

        const originalCenter = map.getCenter();
        const originalZoom = map.getZoom();

        return new Promise(async (resolvePromise) => {
            const allLayers = elements.map(el => el.layer);
    
            if (allLayers.length > 0) {
                const featureGroup = L.featureGroup(allLayers);
                const bounds = featureGroup.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
                    map.once('moveend', capture);
                } else {
                    capture();
                }
            } else {
                capture();
            }

            async function capture() {
                await new Promise(resolve => setTimeout(resolve, 250));
                map.invalidateSize();
                await new Promise(resolve => setTimeout(resolve, 100));

                try {
                    const canvas = await html2canvas(mapContainerRef.current, { useCORS: true, backgroundColor: '#18181b', logging: false });
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
    
    const clearAll = () => {
        if (mode !== 'drawing') return;
        if (!window.confirm("¿Está seguro de que desea borrar todo el croquis? Esta acción no se puede deshacer.")) return;
        
        elements.forEach(el => mapRef.current?.removeLayer(el.layer));
        setElements([]);
        history.current = [];
        setSelectedZone(null);
        localStorage.removeItem('croquisElements');
    };

    const loadStateFromLocalStorage = useCallback(() => {
        // Implementation for loading state can be added here if needed
    }, []);
    
    useEffect(() => {
        if (isActive && mapContainerRef.current && !mapRef.current) {
            try {
                const map = L.map(mapContainerRef.current, { center: [-34.6037, -58.3816], zoom: 15, attributionControl: false });
                mapRef.current = map;

                const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {});
                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {});
                (initialLayer === 'satellite' ? satelliteLayer : streetLayer).addTo(map);
                
                loadStateFromLocalStorage();
                
                setTimeout(() => map.invalidateSize(), 100);
            } catch (e) { console.error("Leaflet initialization error:", e); }
        } else if (isActive && mapRef.current) {
             setTimeout(() => mapRef.current.invalidateSize(), 10);
        }
    }, [isActive, initialLayer, loadStateFromLocalStorage]);
    
    // ... Other handlers ...

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // handleSearch();
    };

    const ToolButton = ({ toolName, icon, label }: { toolName: Tool, icon: React.ReactNode, label: string }) => (
        <button onClick={() => setTool(toolName)} className={`p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`} title={label}>
            {icon}
            <span className="mt-1">{label}</span>
        </button>
    );

    return (
        <div ref={containerRef} className={`flex flex-col gap-4 transition-all duration-300 ${isMaximized ? 'fixed inset-0 bg-zinc-900 z-50 p-4' : 'h-[85vh]'}`}>
            <div className="bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <ToolButton toolName="point" label="Marcar Punto" icon={<CrosshairsIcon className="w-6 h-6"/>} />
                    <ToolButton toolName="attackLine" label="Línea Ataque" icon={<FireIcon className="w-6 h-6 text-red-500"/>} />
                    <ToolButton toolName="transferLine" label="Línea Transf." icon={<div className="w-6 h-6 border-2 border-dashed border-blue-500 rounded-full"/>} />
                    <ToolButton toolName="impact" label="Zona Impacto" icon={<div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white/50"/>} />
                    <ToolButton toolName="adjacency" label="Zona Adyac." icon={<div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white/50"/>} />
                    <ToolButton toolName="influence" label="Zona Influ." icon={<div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white/50"/>} />
                    <ToolButton toolName="unit" label="Unidades" icon={<EngineIcon className="w-6 h-6"/>} />
                    <ToolButton toolName="text" label="Texto" icon={<PencilIcon className="w-6 h-6"/>} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={clearAll} className="p-2 bg-red-600 hover:bg-red-500 rounded-md text-white" title="Limpiar Todo"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
            
            <div className="relative w-full h-full">
                <div ref={mapContainerRef} className="w-full h-full rounded-xl" style={{ backgroundColor: '#18181b' }}></div>
                <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
                     <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md text-white">
                        {isMaximized ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
                    </button>
                    <input ref={fileInputRef} type="file" accept=".kml" onChange={() => {}} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} title="Importar KML" className="p-2 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-md text-white">
                        <FolderPlusIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="absolute top-2 left-2 z-[1000] w-full max-w-sm">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar dirección..." className="w-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-600 rounded-md pl-4 pr-10 py-2 text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500" />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white">
                           <SearchIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Croquis;