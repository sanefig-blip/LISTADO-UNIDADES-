import React, { useState, useEffect, useRef } from 'react';
import { hidroAlertData as defaultHidroAlertData } from '../data/hidroAlertData';
import { HidroAlertData, User, DisplacementPoint } from '../types';
import { ShieldExclamationIcon, PencilIcon, XCircleIcon } from './icons';

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
    
    useEffect(() => {
        if (!isEditing) {
            setEditableData(JSON.parse(JSON.stringify(hidroAlertData)));
        }
    }, [hidroAlertData, isEditing]);

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => setIsEditing(false);
    const handleSave = () => {
        if (editableData) {
            onUpdateHidroAlertData(editableData);
        }
        setIsEditing(false);
    };

    const handleUnitAssignmentChange = (index: number, assignedUnit: string) => {
        setEditableData(prev => {
            if (!prev) return null;
            const newUpdates = [...prev.panorama2Updates];
            newUpdates[index] = { ...newUpdates[index], assignedUnit };
            return { ...prev, panorama2Updates: newUpdates };
        });
    };

    useEffect(() => {
        if (activeTab !== 'mapa') return;

        const mapContainer = mapContainerRef.current;
        if (!mapContainer) return;

        if (!mapRef.current) {
            const map = L.map(mapContainer).setView([-34.6037, -58.4516], 12);
            mapRef.current = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
            
            const points = [...(hidroAlertData?.panorama2Points || []), ...(hidroAlertData?.panorama2Updates.map((u, i) => ({ id: 100+i, location: u.location, organism: u.station, coords: null, isRoute: false})) || [])];
            points.forEach(point => {
                if (point.coords && !point.isRoute) {
                    const customIcon = L.divIcon({ className: 'custom-div-icon', html: `<div class="p-1 bg-red-600 rounded-full border-2 border-white shadow-lg"></div><div class="text-xs font-bold text-white whitespace-nowrap -translate-x-1/2 left-1/2 relative mt-1 bg-black/50 px-1 rounded">${point.id}</div>`, iconSize: [12, 12], iconAnchor: [6, 6] });
                    L.marker(point.coords, { icon: customIcon }).addTo(map).bindTooltip(`<b>${point.id}: ${point.location}</b><br>${point.organism}`);
                }
            });
            const routes = points.filter(p => p.isRoute);
            if (routes.length > 0) { L.polyline([ [-34.632, -58.375], [-34.645, -58.385], [-34.640, -58.405] ], {color: 'orange', dashArray: '5, 10'}).addTo(map).bindTooltip('Recorrido Preventivo'); }
            (hidroAlertData?.underpasses || []).forEach(up => { if (up.coords) { L.circleMarker(up.coords, { radius: 4, color: '#38bdf8', fillColor: '#0ea5e9', fillOpacity: 1 }).addTo(map).bindTooltip(`${up.name}<br><small>${up.location}</small>`); }});
        }
        
        setTimeout(() => { mapRef.current?.invalidateSize(); }, 250);

    }, [activeTab, hidroAlertData]);

    const TabButton = ({ tabName, label }: { tabName: string, label: string }) => (
        <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}>{label}</button>
    );

    const dataForView = isEditing ? editableData : hidroAlertData;
    if (!dataForView) return null;

    const OperativoContent = () => {
        const prefixes = ["Ranger-6 P.4", "Ranger-5 P.5", "Ranger-5 P.6", "Ranger 945 P.7", "Ranger-5 P.8", "Ranger 4 P.9", "Ranger-10 P.10", "Ranger-3 P.11"];
        const qthList = dataForView.panorama2Updates.map((item, index) => ({ ...item, prefix: prefixes[index] || `Punto ${index + 4}` }));

        return (
            <div className="space-y-8 text-zinc-300 animate-fade-in">
                <section>
                    <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">DESPLAZAMIENTOS a QTH DE PANORAMA II</h3>
                    <ul className="space-y-3">
                        {qthList.map((item, index) => (
                            <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                <span className="flex-shrink-0 w-full sm:w-auto"><code className="text-teal-300">{item.prefix}</code> se desplaza a QTH: {item.location}</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        list="unit-list-for-hidro"
                                        value={item.assignedUnit || ''}
                                        onChange={(e) => handleUnitAssignmentChange(index, e.target.value)}
                                        placeholder="Asignar unidad..."
                                        className="w-full sm:w-64 bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white"
                                    />
                                ) : (
                                    item.assignedUnit && <span className="font-semibold text-white bg-blue-600/50 px-2 py-0.5 rounded-md text-sm">Unidad: {item.assignedUnit}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">PRESENTE EN QTH Y PANORAMA</h3>
                     <ul className="space-y-2 list-disc list-inside">
                        <li><code className="text-teal-300">Ranger-6 P.4</code> presente a QTH: AV. CRAMER Y AV. ELCANO. panorama normal.</li>
                        <li><code className="text-teal-300">Ranger-5 P.5</code> presente a QTH: GARCIA DEL RIO Y CABILDO. panorama normal.</li>
                        <li><code className="text-teal-300">Ranger-5 P.6</code> presente a QTH: BLANCO ENCALADA Y BALBIN. panorama normal.</li>
                        <li><code className="text-teal-300">Ranger 945 P.7</code> presente a QTH: LA PAMPA Y BURELA. panorama normal.</li>
                        <li><code className="text-teal-300">Ranger-5 P.8</code> presente a QTH: AV. Dr. R. BALBIN Y ESTOMBA. panorama normal.</li>
                        <li><code className="text-teal-300">Ranger 4 P.9</code> presente a QTH: BARRIO MITRE: ARIAS 3700 Y MELIAN. panorama normal.</li>
                        <li><code className="text-teal-300">Ranger-10 P.10</code> presente a QTH: VILLA SOLDATI (INTENDENTE FRANCISCO RABANAL Y PERGAMINO). panorama normal.</li>
                        <li><code className="text-teal-300">Ranger-3 P.11</code> presente a QTH: Recorrido por: Avenida Vieytes, Osvaldo Cruz, Av. VELEZ SARFIELD e AV. IRIARTE (BOTE). panorama normal.</li>
                    </ul>
                </section>
                 <section>
                    <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">PANORAMA III</h3>
                     <ul className="space-y-2 list-disc list-inside">
                        <li><code className="text-teal-300">Ranger-GER CABALLITO</code> se desplaza a QTH: A designar por D.G.DF.</li>
                        <li><code className="text-teal-300">Ranger-8</code> se desplaza a QTH: A designar por D.G.DF.</li>
                    </ul>
                </section>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <datalist id="unit-list-for-hidro">
                {unitList.map(u => <option key={u} value={u} />)}
            </datalist>
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
                    <TabButton tabName="mapa" label="Mapa de Puntos Críticos" />
                    <TabButton tabName="pasos-bajo-nivel" label="Pasos Bajo Nivel" />
                </div>
                
                <div className="animate-fade-in">
                    {activeTab === 'operativo' && <OperativoContent />}
                    {activeTab === 'mapa' && <div ref={mapContainerRef} className="w-full h-[60vh] rounded-lg bg-zinc-900"></div>}
                    {activeTab === 'pasos-bajo-nivel' && (
                        <div className="max-h-[60vh] overflow-y-auto">
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