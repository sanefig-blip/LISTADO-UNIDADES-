import React, { useState, useEffect, useRef } from 'react';
import { HidroAlertData, User, DisplacementPoint } from '../types';
import { ShieldExclamationIcon, PencilIcon, XCircleIcon, PlusCircleIcon, TrashIcon, SearchIcon, ChevronDownIcon } from './icons';

declare const L: any;

interface HidroAlertViewProps {
    hidroAlertData: HidroAlertData;
    onUpdateHidroAlertData: (updatedData: HidroAlertData) => void;
    unitList: string[];
    currentUser: User | null;
}

const HidroAlertView: React.FC<HidroAlertViewProps> = ({ hidroAlertData, onUpdateHidroAlertData, unitList, currentUser }) => {
    const [activeTab, setActiveTab] = useState('operativo');
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState<HidroAlertData | null>(null);
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [dropdownState, setDropdownState] = useState<{ [key: number]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (!isEditing) {
            setEditableData(JSON.parse(JSON.stringify(hidroAlertData)));
        }
    }, [hidroAlertData, isEditing]);

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setIsEditing(false);
        setEditableData(null);
    };
    const handleSave = () => {
        if (editableData) {
            onUpdateHidroAlertData(editableData);
        }
        setIsEditing(false);
    };

    const handleAddUnit = (pointIndex: number, unitToAdd: string) => {
        if (!unitToAdd) return;
        setEditableData(prev => {
            if (!prev) return null;
            const newUpdates = [...prev.panorama2Updates];
            const pointToUpdate = { ...newUpdates[pointIndex] };
            if (!pointToUpdate.assignedUnits.includes(unitToAdd)) {
                pointToUpdate.assignedUnits = [...pointToUpdate.assignedUnits, unitToAdd];
            }
            newUpdates[pointIndex] = pointToUpdate;
            return { ...prev, panorama2Updates: newUpdates };
        });
        setSearchTerm('');
        setDropdownState({});
    };

    const handleRemoveUnit = (pointIndex: number, unitIndex: number) => {
        setEditableData(prev => {
            if (!prev) return null;
            const newUpdates = [...prev.panorama2Updates];
            const pointToUpdate = { ...newUpdates[pointIndex] };
            pointToUpdate.assignedUnits.splice(unitIndex, 1);
            newUpdates[pointIndex] = pointToUpdate;
            return { ...prev, panorama2Updates: newUpdates };
        });
    };


    useEffect(() => {
        if (activeTab !== 'mapa' || !mapContainerRef.current) return;
        
        const initializeMap = () => {
            if (mapRef.current) return; // Already initialized
            
            const map = L.map(mapContainerRef.current).setView([-34.6037, -58.4516], 12);
            mapRef.current = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            const points = [...(hidroAlertData?.panorama2Points || [])];
            points.forEach(point => {
                if (point.coords && !point.isRoute) {
                    const customIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="p-1 bg-red-600 rounded-full border-2 border-white shadow-lg"></div><div class="text-xs font-bold text-white whitespace-nowrap -translate-x-1/2 left-1/2 relative mt-1 bg-black/50 px-1 rounded">${point.id}</div>`, iconSize: [12, 12], iconAnchor: [6, 6] });
                    L.marker(point.coords, { icon: customIcon }).addTo(map).bindTooltip(`<b>${point.id}: ${point.location}</b><br>${point.organism}`);
                }
            });

            (hidroAlertData?.underpasses || []).forEach(up => {
                if (up.coords) {
                    L.circleMarker(up.coords, { radius: 4, color: '#38bdf8', fillColor: '#0ea5e9', fillOpacity: 1 }).addTo(map).bindTooltip(`${up.name}<br><small>${up.location}</small>`);
                }
            });
        };

        initializeMap();
        setTimeout(() => mapRef.current?.invalidateSize(), 100);

    }, [activeTab, hidroAlertData]);

    const TabButton = ({ tabName, label }: { tabName: string, label: string }) => (
        <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}>{label}</button>
    );

    const dataForView = isEditing ? editableData : hidroAlertData;
    if (!dataForView) return null;
    
    const toggleDropdown = (index: number) => {
        setDropdownState(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({...acc, [key]: false}), {}), [index]: !prev[index] }));
        setSearchTerm('');
    };

    const filteredUnits = unitList.filter(unit => unit.toLowerCase().includes(searchTerm.toLowerCase()));


    const OperativoContent = () => (
        <div className="space-y-8 text-zinc-300 animate-fade-in">
            <section>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">DESPLAZAMIENTOS A QTH DE PANORAMA II</h3>
                <ul className="space-y-4">
                    {dataForView.panorama2Updates.map((item, index) => (
                        <li key={index} className="flex flex-col gap-2 p-3 bg-zinc-900/50 rounded-md">
                           <p>ESTACION IV "<code className="text-teal-300">{item.station}</code>" se desplaza a QTH: <strong className="text-white">{item.location}</strong></p>
                            
                            {isEditing ? (
                                <div className="flex flex-wrap items-start gap-2">
                                    {item.assignedUnits.map((unit, unitIdx) => (
                                        <div key={unitIdx} className="flex items-center gap-1 bg-blue-600/50 text-white px-2 py-1 rounded-md text-sm">
                                            <span>{unit}</span>
                                            <button onClick={() => handleRemoveUnit(index, unitIdx)} className="text-blue-200 hover:text-white"><XCircleIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <button onClick={() => toggleDropdown(index)} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded-md text-white font-medium transition-colors">
                                            <PlusCircleIcon className="w-4 h-4"/> Asignar Unidad <ChevronDownIcon className={`w-3 h-3 transition-transform ${dropdownState[index] ? 'rotate-180' : ''}`}/>
                                        </button>
                                        {dropdownState[index] && (
                                            <div className="absolute z-10 top-full mt-1 w-64 bg-zinc-800 border border-zinc-600 rounded-md shadow-lg">
                                                <div className="p-2">
                                                    <input 
                                                        type="text"
                                                        placeholder="Buscar unidad..."
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        className="w-full bg-zinc-900 border-zinc-700 rounded-md px-2 py-1 text-white text-sm"
                                                    />
                                                </div>
                                                <ul className="max-h-48 overflow-y-auto">
                                                    {filteredUnits.map(unit => (
                                                        <li key={unit} onClick={() => handleAddUnit(index, unit)} className="px-3 py-1.5 hover:bg-zinc-700 cursor-pointer text-sm">
                                                            {unit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                item.assignedUnits.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.assignedUnits.map((unit, unitIdx) => (
                                            <span key={unitIdx} className="font-semibold text-white bg-blue-600/50 px-2 py-0.5 rounded-md text-sm">{unit}</span>
                                        ))}
                                    </div>
                                )
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
    

    return (
        <div className="space-y-6">
            <div className="bg-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3"><ShieldExclamationIcon className="w-8 h-8 text-yellow-300"/> Alerta Hidrometeorológico</h2>
                    <p className="text-zinc-400">Información y puntos de despliegue según Disposición 5291/2024/DGDCIV.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold flex items-center gap-2"><PencilIcon className="w-5 h-5"/> Guardar</button>
                                <button onClick={handleCancel} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white"><XCircleIcon className="w-6 h-6"/></button>
                            </>
                        ) : (
                            <button onClick={handleEdit} className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold flex items-center gap-2"><PencilIcon className="w-5 h-5"/> Editar</button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-zinc-800/60 p-4 rounded-xl">
                 <div className="flex flex-wrap gap-2 border-b border-zinc-700 pb-4 mb-4">
                    <TabButton tabName="operativo" label="Operativo" />
                    <TabButton tabName="mapa" label="Mapa Interactivo" />
                    <TabButton tabName="puentes" label="Puentes y Bajo Nivel" />
                </div>
                
                <div>
                    {activeTab === 'operativo' && <OperativoContent />}
                    {activeTab === 'mapa' && <div ref={mapContainerRef} className="w-full h-[60vh] rounded-lg bg-zinc-900 animate-fade-in"></div>}
                    {activeTab === 'puentes' && (
                        <div className="max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
                            <ul className="divide-y divide-zinc-700">
                                {(dataForView.underpasses || []).map(up => (
                                    <li key={up.id} className="py-2">
                                        <p className="font-semibold text-white">{up.id}. {up.name} <span className="text-xs font-normal text-zinc-400">({up.commune})</span></p>
                                        <p className="text-sm text-zinc-300">{up.location}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HidroAlertView;