import React, { useState, useEffect, useRef } from 'react';
import { hidroAlertData } from '../data/hidroAlertData.js';
import { ShieldExclamationIcon } from './icons.js';

const HidroAlertView = () => {
    const [activeTab, setActiveTab] = useState('operativo');
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    
    useEffect(() => {
        if (activeTab !== 'mapa') {
            return;
        }

        const mapContainer = mapContainerRef.current;
        if (!mapContainer) return;

        if (!mapRef.current) {
            const map = L.map(mapContainer).setView([-34.6037, -58.4516], 12);
            mapRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            const points = [...hidroAlertData.panorama2Points, ...hidroAlertData.panorama2Updates.map((u, i) => ({ id: 100+i, location: u.location, organism: u.station, coords: null, isRoute: false}))];

            points.forEach(point => {
                if (point.coords && !point.isRoute) {
                    const customIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="p-1 bg-red-600 rounded-full border-2 border-white shadow-lg"></div><div class="text-xs font-bold text-white whitespace-nowrap -translate-x-1/2 left-1/2 relative mt-1 bg-black/50 px-1 rounded">${point.id}</div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    });

                    L.marker(point.coords, { icon: customIcon }).addTo(map)
                        .bindTooltip(`<b>${point.id}: ${point.location}</b><br>${point.organism}`);
                }
            });

            const routes = points.filter(p => p.isRoute);
            if (routes.length > 0) {
                 const routeCoords = [ [-34.632, -58.375], [-34.645, -58.385], [-34.640, -58.405] ]; // Example route
                 L.polyline(routeCoords, {color: 'orange', dashArray: '5, 10'}).addTo(map).bindTooltip('Recorrido Preventivo');
            }
             
             hidroAlertData.underpasses.forEach(up => {
                 if (up.coords) {
                     L.circleMarker(up.coords, {
                         radius: 4,
                         color: '#38bdf8',
                         fillColor: '#0ea5e9',
                         fillOpacity: 1
                     }).addTo(map).bindTooltip(`${up.name}<br><small>${up.location}</small>`);
                 }
             });
        }
        
        // The animation for tab content is 200ms. A timeout slightly longer
        // than that should ensure the map container is visible and has its final size.
        setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 250);

    }, [activeTab]);

    const TabButton = ({ tabName, label }) => (
        React.createElement("button", {
            onClick: () => setActiveTab(tabName),
            className: `px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`
        },
        label)
    );

    const Panorama1Content = () => (
        React.createElement("div", { className: "space-y-6 text-zinc-300 animate-fade-in" },
            React.createElement("div", { className: "p-4 bg-zinc-900/50 rounded-lg border border-zinc-700" },
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-2" }, "PANORAMA 1"),
                React.createElement("p", null, "El Director de Defensa Civil determina el inicio de PANORAMA 1 para el Cuerpo de Bomberos con Recorrido Saavedra, debiendo los organismos iniciar el recorrido preventivo que se adjunta a continuación, enviando novedades cada media hora con material fotográfico.")
            ),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement("div", { className: "bg-zinc-900/50 p-3 rounded-lg" },
                    React.createElement("h4", { className: "text-lg font-semibold text-white mb-2 text-center" }, "Recorrido Preventivo - Zona Saavedra"),
                    React.createElement("img", { src: "https://i.ibb.co/bF0N9Y7/saavedra-panorama-1.png", alt: "Mapa Recorrido Preventivo Zona Saavedra", className: "w-full h-auto rounded-md" })
                ),
                React.createElement("div", { className: "bg-zinc-900/50 p-3 rounded-lg" },
                    React.createElement("h4", { className: "text-lg font-semibold text-white mb-2 text-center" }, "Recorrido Preventivo - Zona Villa Soldati"),
                    React.createElement("img", { src: "https://i.ibb.co/tPgxS9G/soldati-panorama-1.png", alt: "Mapa Recorrido Preventivo Zona Villa Soldati", className: "w-full h-auto rounded-md" })
                )
            )
        )
    );

    const renderTable = (title, headers, data) => (
        React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3" }, title),
            React.createElement("table", { className: "w-full text-left" },
                React.createElement("thead", null,
                    React.createElement("tr", { className: "bg-zinc-700/50 text-sm text-zinc-300" },
                        headers.map(h => React.createElement("th", { key: h, className: "p-3" }, h))
                    )
                ),
                React.createElement("tbody", null,
                    data.map((row, index) => (
                        React.createElement("tr", { key: index, className: "border-t border-zinc-700" },
                            row.map((cell, cellIndex) => React.createElement("td", { key: cellIndex, className: "p-3 text-zinc-200" }, cell))
                        )
                    ))
                )
            )
        )
    );
    
    const panorama2Data = hidroAlertData.panorama2Updates.map(item => [item.location, item.station]);
    const panorama3Data = hidroAlertData.panorama3Stations.map(item => [item]);
    const underpassData = hidroAlertData.underpasses.map(item => [`${item.id}-${item.name}`, item.commune, item.location]);

    const OperativoContent = () => (
        React.createElement("div", { className: "space-y-8 text-zinc-300 animate-fade-in" },
            React.createElement("section", null,
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, "DESPLAZAMIENTOS a QTH DE PANORAMA II"),
                React.createElement("ul", { className: "space-y-2 list-disc list-inside" },
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-6 P.4"), " se desplaza a QTH: AV. CRAMER Y AV. ELCANO"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-5 P.5"), " se desplaza a QTH: GARCIA DEL RIO Y CABILDO"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-5 P.6"), " se desplaza a QTH: BLANCO ENCALADA Y BALBIN"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger 945 P.7"), " se desplaza a QTH: LA PAMPA Y BURELA"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-5 P.8"), " se desplaza a QTH: AV. Dr. R. BALBIN Y ESTOMBA"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger 4 P.9"), " se desplaza a QTH: BARRIO MITRE: ARIAS 3700 Y MELIAN"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-10 P.10"), " se desplaza a QTH: VILLA SOLDATI (INTENDENTE FRANCISCO RABANAL Y PERGAMINO)"),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-3 P.11"), " se desplaza a QTH: Recorrido por: Avenida Vieytes, Osvaldo Cruz, Av. VELEZ SARFIELD e AV. IRIARTE (BOTE)")
                )
            ),
            React.createElement("section", null,
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, "PRESENTE EN QTH Y PANORAMA"),
                React.createElement("ul", { className: "space-y-2 list-disc list-inside" },
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-6 P.4"), " presente a QTH: AV. CRAMER Y AV. ELCANO. panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-5 P.5"), " presente a QTH: GARCIA DEL RIO Y CABILDO. panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-5 P.6"), " presente a QTH: BLANCO ENCALADA Y BALBIN. panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger 945 P.7"), " presente a QTH: LA PAMPA Y BURELA. panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-5 P.8"), " presente a QTH: AV. Dr. R. BALBIN Y ESTOMBA. panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger 4 P.9"), " presente a QTH: BARRIO MITRE: ARIAS 3700 Y MELIAN. panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-10 P.10"), " presente a QTH: VILLA SOLDATI (INTENDENTE FRANCISCO RABANAL Y PERGAMINO). panorama normal."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-3 P.11"), " presente a QTH: Recorrido por: Avenida Vieytes, Osvaldo Cruz, Av. VELEZ SARFIELD e AV. IRIARTE (BOTE). panorama normal.")
                )
            ),
            React.createElement("section", null,
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, "En caso de ANEGAMIENTO"),
                React.createElement("p", { className: "mb-2" }, "Comunicar la altura alcanzada por el agua, tomando puntos de referencia:"),
                React.createElement("ul", { className: "space-y-1 list-disc list-inside pl-4" },
                    React.createElement("li", null, "Anegamientos de agua hasta la altura del cordón."),
                    React.createElement("li", null, "Anegamientos de agua hasta la altura de la línea de edificación."),
                    React.createElement("li", null, "Anegamientos de agua de cordón a cordón."),
                    React.createElement("li", null, "Anegamientos de agua cubre el eje de la calle."),
                    React.createElement("li", null, "Anegamientos de agua cubre un carril.")
                )
            ),
            React.createElement("section", null,
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, "PANORAMA III"),
                 React.createElement("ul", { className: "space-y-2 list-disc list-inside" },
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-GER CABALLITO"), " se desplaza a QTH: A designar por D.G.DF."),
                    React.createElement("li", null, React.createElement("code", { className: "text-teal-300" }, "Ranger-8"), " se desplaza a QTH: A designar por D.G.DF.")
                )
            ),
            React.createElement("section", null,
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, "REFERENTE IMPLANTACION PANORAMA II Y PANORAMA III"),
                React.createElement("ul", { className: "space-y-3 list-disc list-inside" },
                    React.createElement("li", null, "Al comunicarse la alerta se deberá comunicar los puntos que les corresponde y QTH de las unidades afectadas."),
                    React.createElement("li", null, "Dichas unidades deberán modular el presente por el canal ", React.createElement("code", { className: "bg-zinc-700 px-1 rounded" }, "C.E.I."), " (Comando Estratégico de Incidentes)."),
                    React.createElement("li", null, "Referente las RANGER deberán modular indicar ejemplo: ", React.createElement("code", { className: "bg-zinc-700 px-1 rounded text-teal-300" }, "RANGER-5 PUNTO 5, QTH GARCIA DEL RIO Y CABILDO"), ", cuando modulen el desplazamiento, el presente y el panorama."),
                    React.createElement("li", null, "En principio las unidades modulan los panoramas entre 20 y 30 min, varía depende de lo que indique Defensa Civil / Jefe de Guardia o del Jefe de Servicio de la Sala Operativa. Detallando la modulación en Telegram."),
                    React.createElement("li", null, "Defensa Civil modula a Comando solicitando cualquier requerimiento, NUNCA Defensa Civil modulará a las dotaciones de Bomberos. Asimismo tener en cuenta que el Director de Defensa Civil y Subsecretario de Emergencia o algún Jefe de Cuerpo escucha la frecuencia C.E.I."),
                    React.createElement("li", null, "El Director de Defensa Civil modula como ", React.createElement("code", { className: "bg-zinc-700 px-1 rounded text-red-400" }, "DC1"), ".")
                )
            )
        )
    );

    return (
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-3xl font-bold text-white flex items-center gap-3" }, React.createElement(ShieldExclamationIcon, { className: "w-8 h-8 text-yellow-300"}), " Alerta Hidrometeorológico"),
                    React.createElement("p", { className: "text-zinc-400" }, "Información y puntos de despliegue según Disposición 5291/2024/DGDCIV.")
                )
            ),

            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl" },
                 React.createElement("div", { className: "flex flex-wrap gap-2 border-b border-zinc-700 pb-4 mb-4" },
                    React.createElement(TabButton, { tabName: "operativo", label: "Operativo" }),
                    React.createElement(TabButton, { tabName: "panorama1", label: "Panorama 1" }),
                    React.createElement(TabButton, { tabName: "mapa", label: "Mapa Interactivo" }),
                    React.createElement(TabButton, { tabName: "panorama2", label: "Panorama 2" }),
                    React.createElement(TabButton, { tabName: "panorama3", label: "Panorama 3" }),
                    React.createElement(TabButton, { tabName: "puentes", label: "Puentes y Bajo Nivel" })
                ),
                
                React.createElement("div", { className: "animate-fade-in" },
                    activeTab === 'operativo' && React.createElement(OperativoContent, null),
                    activeTab === 'panorama1' && React.createElement(Panorama1Content, null),
                    activeTab === 'mapa' && React.createElement("div", { ref: mapContainerRef, className: "w-full h-[65vh] rounded-lg" }),
                    activeTab === 'panorama2' && renderTable('Puntos Fijos a Cubrir en Panorama 2', ['Ubicación', 'Estación Asignada'], panorama2Data),
                    activeTab === 'panorama3' && renderTable('Unidades Adicionales en Panorama 3', ['Unidades que se Incorporan'], panorama3Data),
                    activeTab === 'puentes' && renderTable('Monitoreo Preventivo de Puentes y Bajo Nivel', ['Nombre', 'Comuna', 'Ubicación'], underpassData)
                )
            )
        )
    );
};

export default HidroAlertView;