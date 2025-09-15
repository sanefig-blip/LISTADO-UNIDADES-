import React, { useState, useEffect, useRef } from 'react';
import { hidroAlertData } from '../data/hidroAlertData';
import { ShieldExclamationIcon } from './icons';

declare const L: any;

const HidroAlertView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('operativo');
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    
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

    const TabButton = ({ tabName, label }: { tabName: string, label: string }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}
        >
            {label}
        </button>
    );

    const Panorama1Content = () => (
        <div className="space-y-6 text-zinc-300 animate-fade-in">
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">PANORAMA 1</h3>
                <p>El Director de Defensa Civil determina el inicio de PANORAMA 1 para el Cuerpo de Bomberos con Recorrido Saavedra, debiendo los organismos iniciar el recorrido preventivo que se adjunta a continuación, enviando novedades cada media hora con material fotográfico.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2 text-center">Recorrido Preventivo - Zona Saavedra</h4>
                    <img src="https://i.ibb.co/bF0N9Y7/saavedra-panorama-1.png" alt="Mapa Recorrido Preventivo Zona Saavedra" className="w-full h-auto rounded-md" />
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-2 text-center">Recorrido Preventivo - Zona Villa Soldati</h4>
                    <img src="https://i.ibb.co/tPgxS9G/soldati-panorama-1.png" alt="Mapa Recorrido Preventivo Zona Villa Soldati" className="w-full h-auto rounded-md" />
                </div>
            </div>
        </div>
    );

    const renderTable = (title: string, headers: string[], data: any[][]) => (
        <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold text-yellow-300 mb-3">{title}</h3>
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-zinc-700/50 text-sm text-zinc-300">
                        {headers.map(h => <th key={h} className="p-3">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-t border-zinc-700">
                            {row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 text-zinc-200">{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const panorama2Data = hidroAlertData.panorama2Updates.map(item => [item.location, item.station]);
    const panorama3Data = hidroAlertData.panorama3Stations.map(item => [item]);
    const underpassData = hidroAlertData.underpasses.map(item => [`${item.id}-${item.name}`, item.commune, item.location]);

    const OperativoContent = () => (
        <div className="space-y-8 text-zinc-300 animate-fade-in">
            <section>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">DESPLAZAMIENTOS a QTH DE PANORAMA II</h3>
                <ul className="space-y-2 list-disc list-inside">
                    <li><code className="text-teal-300">Ranger-6 P.4</code> se desplaza a QTH: AV. CRAMER Y AV. ELCANO</li>
                    <li><code className="text-teal-300">Ranger-5 P.5</code> se desplaza a QTH: GARCIA DEL RIO Y CABILDO</li>
                    <li><code className="text-teal-300">Ranger-5 P.6</code> se desplaza a QTH: BLANCO ENCALADA Y BALBIN</li>
                    <li><code className="text-teal-300">Ranger 945 P.7</code> se desplaza a QTH: LA PAMPA Y BURELA</li>
                    <li><code className="text-teal-300">Ranger-5 P.8</code> se desplaza a QTH: AV. Dr. R. BALBIN Y ESTOMBA</li>
                    <li><code className="text-teal-300">Ranger 4 P.9</code> se desplaza a QTH: BARRIO MITRE: ARIAS 3700 Y MELIAN</li>
                    <li><code className="text-teal-300">Ranger-10 P.10</code> se desplaza a QTH: VILLA SOLDATI (INTENDENTE FRANCISCO RABANAL Y PERGAMINO)</li>
                    <li><code className="text-teal-300">Ranger-3 P.11</code> se desplaza a QTH: Recorrido por: Avenida Vieytes, Osvaldo Cruz, Av. VELEZ SARFIELD e AV. IRIARTE (BOTE)</li>
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
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">En caso de ANEGAMIENTO</h3>
                <p className="mb-2">Comunicar la altura alcanzada por el agua, tomando puntos de referencia:</p>
                <ul className="space-y-1 list-disc list-inside pl-4">
                    <li>Anegamientos de agua hasta la altura del cordón.</li>
                    <li>Anegamientos de agua hasta la altura de la línea de edificación.</li>
                    <li>Anegamientos de agua de cordón a cordón.</li>
                    <li>Anegamientos de agua cubre el eje de la calle.</li>
                    <li>Anegamientos de agua cubre un carril.</li>
                </ul>
            </section>
            <section>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">PANORAMA III</h3>
                 <ul className="space-y-2 list-disc list-inside">
                    <li><code className="text-teal-300">Ranger-GER CABALLITO</code> se desplaza a QTH: A designar por D.G.DF.</li>
                    <li><code className="text-teal-300">Ranger-8</code> se desplaza a QTH: A designar por D.G.DF.</li>
                </ul>
            </section>
            <section>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">REFERENTE IMPLANTACION PANORAMA II Y PANORAMA III</h3>
                <ul className="space-y-3 list-disc list-inside">
                    <li>Al comunicarse la alerta se deberá comunicar los puntos que les corresponde y QTH de las unidades afectadas.</li>
                    <li>Dichas unidades deberán modular el presente por el canal <code className="bg-zinc-700 px-1 rounded">C.E.I.</code> (Comando Estratégico de Incidentes).</li>
                    <li>Referente las RANGER deberán modular indicar ejemplo: <code className="bg-zinc-700 px-1 rounded text-teal-300">RANGER-5 PUNTO 5, QTH GARCIA DEL RIO Y CABILDO</code>, cuando modulen el desplazamiento, el presente y el panorama.</li>
                    <li>En principio las unidades modulan los panoramas entre 20 y 30 min, varía depende de lo que indique Defensa Civil / Jefe de Guardia o del Jefe de Servicio de la Sala Operativa. Detallando la modulación en Telegram.</li>
                    <li>Defensa Civil modula a Comando solicitando cualquier requerimiento, NUNCA Defensa Civil modulará a las dotaciones de Bomberos. Asimismo tener en cuenta que el Director de Defensa Civil y Subsecretario de Emergencia o algún Jefe de Cuerpo escucha la frecuencia C.E.I.</li>
                    <li>El Director de Defensa Civil modula como <code className="bg-zinc-700 px-1 rounded text-red-400">DC1</code>.</li>
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
            </div>

            <div className="bg-zinc-800/60 p-4 rounded-xl">
                 <div className="flex flex-wrap gap-2 border-b border-zinc-700 pb-4 mb-4">
                    <TabButton tabName="operativo" label="Operativo" />
                    <TabButton tabName="panorama1" label="Panorama 1" />
                    <TabButton tabName="mapa" label="Mapa Interactivo" />
                    <TabButton tabName="panorama2" label="Panorama 2" />
                    <TabButton tabName="panorama3" label="Panorama 3" />
                    <TabButton tabName="puentes" label="Puentes y Bajo Nivel" />
                </div>
                
                <div className="animate-fade-in">
                    {activeTab === 'operativo' && <OperativoContent />}
                    {activeTab === 'panorama1' && <Panorama1Content />}
                    {activeTab === 'mapa' && <div ref={mapContainerRef} className="w-full h-[65vh] rounded-lg" />}
                    {activeTab === 'panorama2' && renderTable('Puntos Fijos a Cubrir en Panorama 2', ['Ubicación', 'Estación Asignada'], panorama2Data)}
                    {activeTab === 'panorama3' && renderTable('Unidades Adicionales en Panorama 3', ['Unidades que se Incorporan'], panorama3Data)}
                    {activeTab === 'puentes' && renderTable('Monitoreo Preventivo de Puentes y Bajo Nivel', ['Nombre', 'Comuna', 'Ubicación'], underpassData)}
                </div>
            </div>
        </div>
    );
};

export default HidroAlertView;