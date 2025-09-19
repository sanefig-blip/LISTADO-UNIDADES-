import React, { useEffect, useRef } from 'react';
import { FireIcon, PersonIcon } from './icons.js';

const CroquisView = ({ interventionGroups }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

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
        React.createElement("div", { className: "animate-fade-in grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh]" },
            React.createElement("aside", { className: "lg:col-span-1 bg-zinc-800/60 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto" },
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2" }, "Recursos Asignados"),
                interventionGroups.length === 0 ? (
                    React.createElement("p", { className: "text-zinc-400" }, "No hay grupos de intervención activos. Créelos desde la pestaña \"Puesto Comando\".")
                ) : (
                    interventionGroups.map(group => (
                        React.createElement("div", { key: group.id, className: "bg-zinc-900/50 p-3 rounded-md" },
                            React.createElement("h4", { className: `text-lg font-bold ${group.type === 'Frente' ? 'text-blue-400' : 'text-teal-400'}` }, group.name),
                            React.createElement("p", { className: "text-sm text-zinc-400 mb-2" }, "A cargo: ", group.officerInCharge || 'N/A'),
                            React.createElement("div", { className: "pl-2 space-y-2" },
                                group.units.length > 0 && (
                                    React.createElement("div", null,
                                        React.createElement("h5", { className: "font-semibold text-white flex items-center gap-2" }, React.createElement(FireIcon, { className: "w-4 h-4" }), " Unidades"),
                                        React.createElement("ul", { className: "pl-4 list-disc list-inside text-zinc-300 text-sm font-mono" },
                                            group.units.map(unit => React.createElement("li", { key: unit.id }, unit.id))
                                        )
                                    )
                                ),
                                group.personnel.length > 0 && (
                                     React.createElement("div", null,
                                        React.createElement("h5", { className: "font-semibold text-white flex items-center gap-2" }, React.createElement(PersonIcon, { className: "w-4 h-4" }), " Personal"),
                                        React.createElement("ul", { className: "pl-4 list-disc list-inside text-zinc-300 text-sm" },
                                            group.personnel.map(p => React.createElement("li", { key: p.id }, p.name))
                                        )
                                    )
                                )
                            )
                        )
                    ))
                )
            ),
            React.createElement("main", { className: "lg:col-span-3 h-full" },
                React.createElement("div", { ref: mapContainerRef, className: "w-full h-full rounded-xl bg-zinc-700", title: "Mapa Interactivo de Buenos Aires" })
            )
        )
    );
};

export default CroquisView;