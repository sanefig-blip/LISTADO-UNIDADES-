import React, { useState, useEffect, useRef } from 'react';
import { ShieldExclamationIcon, ClipboardCopyIcon, ClipboardCheckIcon } from './icons.js';

const getStatusColor = (status) => {
    switch(status) {
        case 'Pendiente': return 'bg-zinc-500 text-white';
        case 'Desplazado': return 'bg-blue-500 text-white';
        case 'En QTH': return 'bg-yellow-500 text-black';
        case 'Normalizado': return 'bg-green-600 text-white';
        default: return 'bg-zinc-500 text-white';
    }
}

const getPanoramaColor = (panorama) => {
    switch(panorama) {
        case 1: return 'bg-yellow-600 text-white';
        case 2: return 'bg-orange-600 text-white';
        case 3: return 'bg-red-600 text-white';
        default: return 'bg-zinc-500 text-white';
    }
}

const HidroAlertView = ({ hidroAlertData, onUpdateReport, unitList }) => {
    const [editableData, setEditableData] = useState(() => JSON.parse(JSON.stringify(hidroAlertData)));
    const [activeTab, setActiveTab] = useState('operativo');
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        setEditableData(JSON.parse(JSON.stringify(hidroAlertData)));
    }, [hidroAlertData]);
    
    useEffect(() => {
        if (activeTab !== 'mapa') return;
        const mapContainer = mapContainerRef.current;
        if (!mapContainer) return;

        if (!mapRef.current) {
            const map = L.map(mapContainer).setView([-34.6037, -58.4516], 12);
            mapRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);
        }

        // Clear existing markers to redraw
        mapRef.current.eachLayer((layer) => {
            if (!!layer.toGeoJSON) { // A way to identify vector layers
                mapRef.current.removeLayer(layer);
            }
        });

        const statusColors = { 'Pendiente': '#71717a', 'Desplazado': '#3b82f6', 'En QTH': '#f59e0b', 'Normalizado': '#22c55e' };

        // FIX: Add a null check for editableData.alertPoints to prevent runtime errors when the data is incomplete.
        if (editableData && editableData.alertPoints) {
            editableData.alertPoints.forEach(point => {
                if (point.coords && point.type === 'Punto Fijo') {
                    const color = statusColors[point.status] || '#71717a';
                    const customIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color:${color};" class="p-1.5 rounded-full border-2 border-white shadow-lg"></div><div class="text-xs font-bold text-white whitespace-nowrap -translate-x-1/2 left-1/2 relative mt-1 bg-black/50 px-1 rounded">${point.id.split('-')[1]}</div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    });

                    L.marker(point.coords, { icon: customIcon }).addTo(mapRef.current)
                        .bindTooltip(`<b>${point.id}: ${point.location}</b><br>Organismo: ${point.organism}<br>Unidad: ${point.assignedUnit || 'N/A'}<br>Estado: ${point.status}`);
                }
            });
        }
         
        // FIX: Add a null check for editableData.underpasses to ensure the component remains stable with partial data.
        if (editableData && editableData.underpasses) {
            editableData.underpasses.forEach(up => {
                if (up.coords) {
                    L.circleMarker(up.coords, {
                        radius: 4, color: '#38bdf8', fillColor: '#0ea5e9', fillOpacity: 1
                    }).addTo(mapRef.current).bindTooltip(`Paso Bajo Nivel: ${up.name}<br><small>${up.location}</small>`);
                }
            });
        }

        setTimeout(() => mapRef.current?.invalidateSize(), 250);

    }, [activeTab, editableData]);

    const handlePointChange = (pointId, field, value) => {
        const newData = JSON.parse(JSON.stringify(editableData));
        const point = newData.alertPoints.find((p) => p.id === pointId);
        if(point) {
            point[field] = value;
            setEditableData(newData);
            onUpdateReport(newData);
        }
    };
    
    const TabButton = ({ tabName, label }) => (
        React.createElement("button", {
            onClick: () => setActiveTab(tabName),
            className: `px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`
        },
        label)
    );

    const OperativoContent = () => {
        const panoramas = [
            { number: 1, title: 'I' }, 
            { number: 2, title: 'II' },
            { number: 3, title: 'III' }
        ];
    
        const anegamientoContent = React.createElement("div", { className: "bg-blue-900/40 p-4 rounded-lg my-8 animate-fade-in" },
            React.createElement("h4", { className: "text-white font-bold text-lg mb-2" }, "En caso de anegamiento"),
            React.createElement("p", { className: "text-blue-200 mb-3" }, "Comunicar la altura alcanzada por el agua, tomando puntos de referencia:"),
            React.createElement("ul", { className: "list-disc list-inside space-y-1 text-blue-300" },
                React.createElement("li", null, "Anegamientos de agua hasta la altura del cordón."),
                React.createElement("li", null, "Anegamientos de agua hasta la altura de la línea de edificación."),
                React.createElement("li", null, "Anegamientos de agua de cordón a cordón."),
                React.createElement("li", null, "Anegamientos de agua cubre el eje de la calle."),
                React.createElement("li", null, "Anegamientos de agua cubre un carril.")
            )
        );

        const directivasContent = React.createElement("div", { className: "bg-zinc-900/50 p-4 rounded-lg mb-8 border border-yellow-600/50" },
            React.createElement("h3", { className: "text-xl font-bold text-yellow-300 mb-3" }, "DIRECTIVAS DE ALERTA METEOROLOGICO"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-sm" },
                React.createElement("div", null,
                    React.createElement("h4", { className: "font-semibold text-white mb-2" }, "PARA JEFES DE ESTACIÓN:"),
                    React.createElement("ul", { className: "list-disc list-inside space-y-1 text-zinc-300" },
                        React.createElement("li", null, "Verificar el funcionamiento de los equipos de bombeo."),
                        React.createElement("li", null, "Chequear estado de grupos electrógenos."),
                        React.createElement("li", null, "Alistar equipamiento para inundaciones (bombas, motobombas)."),
                        React.createElement("li", null, "Verificar estado y equipamiento de las unidades fluviales.")
                    )
                ),
                React.createElement("div", null,
                    React.createElement("h4", { className: "font-semibold text-white mb-2" }, "PARA TODO EL PERSONAL:"),
                    React.createElement("ul", { className: "list-disc list-inside space-y-1 text-zinc-300" },
                        React.createElement("li", null, "Prestar atención a los informes meteorológicos."),
                        React.createElement("li", null, "Mantener el equipo de protección personal en óptimas condiciones."),
                        React.createElement("li", null, "Asegurar la disponibilidad de los equipos de comunicación."),
                        React.createElement("li", null, "Estar alerta a las directivas del Comando Operativo.")
                    )
                )
            )
        );
    
        const panoramaElements = panoramas.map((panorama) => {
            const points = editableData.alertPoints.filter(p => p.panorama === panorama.number);
            if (points.length === 0) return null;
    
            const content = React.createElement("div", { key: `panorama-${panorama.number}` },
                React.createElement("h3", { className: "text-2xl font-bold text-white mb-4 tracking-wider uppercase" },
                    `DESPLAZAMIENTOS A QTH DE PANORAMA ${panorama.title}`
                ),
                React.createElement("ul", { className: "space-y-4" },
                    points.map(point => {
                        const isBomberos = point.organism.toLowerCase().includes('estacion') || point.organism.toLowerCase().includes('destacamento') || point.organism.toLowerCase().includes('bomberos');
                        return React.createElement("li", {
                            key: point.id,
                            className: `pl-4 py-2 list-disc list-inside ${isBomberos ? 'border-l-4 border-red-500/50 marker:text-red-400' : 'border-l-4 border-green-500/50 marker:text-green-400'}`
                        },
                            React.createElement("div", null,
                                React.createElement("span", null,
                                    React.createElement("strong", { className: isBomberos ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold' }, point.organism),
                                    " se desplaza a QTH: ",
                                    React.createElement("span", { className: isBomberos ? 'text-red-500 font-bold' : 'text-zinc-100' }, point.location)
                                ),
                                point.assignedUnit && !isBomberos && (
                                    React.createElement("div", { className: "text-blue-400 text-sm mt-1 pl-6" },
                                        "Unidad Asignada: ",
                                        React.createElement("strong", { className: "font-mono" }, point.assignedUnit)
                                    )
                                ),
                                isBomberos && (
                                    React.createElement("div", { className: "mt-2 pl-6 flex items-center gap-2" },
                                        React.createElement("label", { htmlFor: `unit-select-${point.id}`, className: "text-sm text-zinc-400" }, "Asignar:"),
                                        React.createElement("select", {
                                            id: `unit-select-${point.id}`,
                                            value: point.assignedUnit,
                                            onChange: (e) => handlePointChange(point.id, 'assignedUnit', e.target.value),
                                            className: "w-full max-w-xs bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-sm",
                                            onClick: (e) => e.stopPropagation()
                                        },
                                            React.createElement("option", { value: "" }, "-- Seleccionar Unidad --"),
                                            unitList.map(unit => React.createElement("option", { key: unit, value: unit }, unit))
                                        )
                                    )
                                )
                            )
                        );
                    })
                )
            );
            
            if (panorama.number === 2) {
                return React.createElement(React.Fragment, { key: `panorama-frag-${panorama.number}` }, content, anegamientoContent);
            }
            return content;
        });

        return React.createElement("div", { className: "space-y-8 animate-fade-in text-zinc-200" },
            directivasContent,
            ...panoramaElements
        );
    };

    const PuentesContent = () => (
        React.createElement("div", { className: "overflow-x-auto animate-fade-in" },
            React.createElement("table", { className: "w-full min-w-[600px] text-left" },
                React.createElement("thead", { className: "border-b-2 border-zinc-600" },
                    React.createElement("tr", { className: "text-left text-sm font-semibold text-zinc-300" },
                        React.createElement("th", { className: "p-3" }, "Nombre"),
                        React.createElement("th", { className: "p-3" }, "Comuna"),
                        React.createElement("th", { className: "p-3" }, "Ubicación")
                    )
                ),
                React.createElement("tbody", null,
                    editableData.underpasses.map(up => (
                        React.createElement("tr", { key: up.id, className: "border-t border-zinc-700 hover:bg-zinc-700/50" },
                            React.createElement("td", { className: "p-2 text-zinc-200 font-semibold" }, up.name),
                            React.createElement("td", { className: "p-2 text-zinc-300" }, up.commune),
                            React.createElement("td", { className: "p-2 text-zinc-400 text-sm" }, up.location)
                        )
                    ))
                )
            )
        )
    );

    const TelegramContent = () => {
        const [copied, setCopied] = useState(null);

        const organismToUnitMap = {
            'ESTACION VI "C.M.M.C.F.P."': 'Ranger-6',
            'ESTACION V "C.G.A.G.V."': 'Ranger-5',
            'DESTACAMENTO "DEVOTO"': 'Ranger 945',
            'ESTACION IV "RECOLETA"': 'Ranger 4',
            'ESTACION X "LUGANO"': 'Ranger-10',
            'ESTACION III "BARRACAS"': 'Ranger-3'
        };

        const panorama2Points = editableData.alertPoints
            .filter(p => p.panorama === 2 && (p.organism.includes('ESTACION') || p.organism.includes('DESTACAMENTO')))
            .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));
        
        const getPointNumber = (id) => `P.${id.split('-')[1]}`;

        const desplazamientosText = panorama2Points.map(point => {
            const unitName = organismToUnitMap[point.organism] || point.assignedUnit || 'Unidad';
            const pointNumber = getPointNumber(point.id);
            return `${unitName} ${pointNumber} se desplaza a QTH: ${point.location}`;
        }).join('\n');

        const presentesText = panorama2Points.map(point => {
            const unitName = organismToUnitMap[point.organism] || point.assignedUnit || 'Unidad';
            const pointNumber = getPointNumber(point.id);
            return `${unitName} ${pointNumber} presente a QTH: ${point.location}. panorama normal.`;
        }).join('\n');

        const handleCopy = (text, id) => {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(id);
                setTimeout(() => setCopied(null), 2000);
            });
        };

        const CopyButton = ({ text, id }) => React.createElement("button", {
            onClick: () => handleCopy(text, id),
            className: "absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-zinc-600 hover:bg-zinc-500 text-white font-medium rounded-md transition-colors text-sm"
        },
            copied === id ? React.createElement(ClipboardCheckIcon, { className: "w-4 h-4 text-green-400" }) : React.createElement(ClipboardCopyIcon, { className: "w-4 h-4" }),
            copied === id ? 'Copiado!' : 'Copiar'
        );

        return React.createElement("div", { className: "space-y-6 animate-fade-in" },
            React.createElement("div", { className: "bg-zinc-900/50 p-4 rounded-lg relative" },
                React.createElement("h3", { className: "text-lg font-bold text-white mb-2" }, "DESPLAZAMIENTOS a QTH DE PANORAMA II"),
                React.createElement(CopyButton, { text: desplazamientosText, id: "desplazamientos" }),
                React.createElement("pre", { className: "text-zinc-300 text-sm whitespace-pre-wrap font-mono bg-zinc-800 p-3 rounded-md" }, desplazamientosText)
            ),
            React.createElement("div", { className: "bg-zinc-900/50 p-4 rounded-lg relative" },
                React.createElement("h3", { className: "text-lg font-bold text-white mb-2" }, "PRESENTE EN QTH Y PANORAMA"),
                React.createElement(CopyButton, { text: presentesText, id: "presentes" }),
                React.createElement("pre", { className: "text-zinc-300 text-sm whitespace-pre-wrap font-mono bg-zinc-800 p-3 rounded-md" }, presentesText)
            )
        );
    };

    return (
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-3xl font-bold text-white flex items-center gap-3" }, React.createElement(ShieldExclamationIcon, { className: "w-8 h-8 text-yellow-300" }), " Alerta Hidrometeorológico"),
                    React.createElement("p", { className: "text-zinc-400" }, "Información y puntos de despliegue según Disposición 3291/2024 DGDCIW.")
                )
            ),

            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl" },
                 React.createElement("div", { className: "flex flex-wrap gap-2 border-b border-zinc-700 pb-4 mb-4" },
                    React.createElement(TabButton, { tabName: "operativo", label: "Operativo" }),
                    React.createElement(TabButton, { tabName: "mapa", label: "Mapa Interactivo" }),
                    React.createElement(TabButton, { tabName: "puentes", label: "Puentes y Bajo Nivel" }),
                    React.createElement(TabButton, { tabName: "telegram", label: "Mensaje Telegram" })
                ),
                
                activeTab === 'operativo' && React.createElement(OperativoContent, null),
                activeTab === 'mapa' && React.createElement("div", { ref: mapContainerRef, className: "w-full h-[65vh] rounded-lg animate-fade-in bg-zinc-900" }),
                activeTab === 'puentes' && React.createElement(PuentesContent, null),
                activeTab === 'telegram' && React.createElement(TelegramContent, null)
            )
        )
    );
};

export default HidroAlertView;
