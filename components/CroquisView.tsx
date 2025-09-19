import React, { useEffect, useRef } from 'react';
import { InterventionGroup } from '../types';
import { FireIcon, PersonIcon } from './icons';

declare const L: any;

interface CroquisViewProps {
    interventionGroups: InterventionGroup[];
}

const CroquisView: React.FC<CroquisViewProps> = ({ interventionGroups }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            try {
                const map = L.map(mapContainerRef.current).setView([-34.6037, -58.3816], 12);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                }).addTo(map);
                mapRef.current = map;
            } catch(e) {
                console.error("Error initializing Leaflet map:", e);
            }
        }
         // Invalidate map size when the component is shown
        setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 100);
    }, []);

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh]">
            <aside className="lg:col-span-1 bg-zinc-800/60 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto">
                <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2">Recursos Asignados</h3>
                {interventionGroups.length === 0 ? (
                    <p className="text-zinc-400">No hay grupos de intervención activos. Créelos desde la pestaña "Puesto Comando".</p>
                ) : (
                    interventionGroups.map(group => (
                        <div key={group.id} className="bg-zinc-900/50 p-3 rounded-md">
                            <h4 className={`text-lg font-bold ${group.type === 'Frente' ? 'text-blue-400' : 'text-teal-400'}`}>{group.name}</h4>
                            <p className="text-sm text-zinc-400 mb-2">A cargo: {group.officerInCharge || 'N/A'}</p>
                            <div className="pl-2 space-y-2">
                                {group.units.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold text-white flex items-center gap-2"><FireIcon className="w-4 h-4" /> Unidades</h5>
                                        <ul className="pl-4 list-disc list-inside text-zinc-300 text-sm font-mono">
                                            {group.units.map(unit => <li key={unit.id}>{unit.id}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {group.personnel.length > 0 && (
                                     <div>
                                        <h5 className="font-semibold text-white flex items-center gap-2"><PersonIcon className="w-4 h-4" /> Personal</h5>
                                        <ul className="pl-4 list-disc list-inside text-zinc-300 text-sm">
                                            {group.personnel.map(p => <li key={p.id}>{p.name}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </aside>
            <main className="lg:col-span-3 h-full">
                <div ref={mapContainerRef} className="w-full h-full rounded-xl bg-zinc-700" title="Mapa Interactivo de Buenos Aires"></div>
            </main>
        </div>
    );
};

export default CroquisView;