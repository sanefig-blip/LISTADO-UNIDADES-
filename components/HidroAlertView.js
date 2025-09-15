import React, { useState, useEffect, useRef } from 'react';
import { ShieldExclamationIcon, PencilIcon, XCircleIcon, PlusCircleIcon, TrashIcon, SearchIcon, ChevronDownIcon } from './icons.js';

const HidroAlertView = ({ hidroAlertData, onUpdateHidroAlertData, unitList, currentUser }) => {
    const [activeTab, setActiveTab] = useState('operativo');
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState(null);
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    const [dropdownState, setDropdownState] = useState({});
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

    const handleAddUnit = (pointIndex, unitToAdd) => {
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

    const handleRemoveUnit = (pointIndex, unitIndex) => {
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

    const TabButton = ({ tabName, label }) => (
        React.createElement("button", { onClick: () => setActiveTab(tabName), className: `px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}, label)
    );

    const dataForView = isEditing ? editableData : hidroAlertData;
    if (!dataForView) return null;
    
    const toggleDropdown = (index) => {
        setDropdownState(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({...acc, [key]: false}), {}), [index]: !prev[index] }));
        setSearchTerm('');
    };

    const filteredUnits = unitList.filter(unit => unit.toLowerCase().includes(searchTerm.toLowerCase()));


    const OperativoContent = () => (
        React.createElement("div", { className: "space-y-8 text-zinc-300 animate-fade-in" },
            React.createElement("section", null,
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, "DESPLAZAMIENTOS A QTH DE PANORAMA II"),
                React.createElement("ul", { className: "space-y-4" },
                    dataForView.panorama2Updates.map((item, index) => (
                        React.createElement("li", { key: index, className: "flex flex-col gap-2 p-3 bg-zinc-900/50 rounded-md" },
                           React.createElement("p", null, "ESTACION IV \"", React.createElement("code", { className: "text-teal-300" }, item.station), "\" se desplaza a QTH: ", React.createElement("strong", { className: "text-white" }, item.location)),
                            
                            isEditing ? (
                                React.createElement("div", { className: "flex flex-wrap items-start gap-2" },
                                    item.assignedUnits.map((unit, unitIdx) => (
                                        React.createElement("div", { key: unitIdx, className: "flex items-center gap-1 bg-blue-600/50 text-white px-2 py-1 rounded-md text-sm" },
                                            React.createElement("span", null, unit),
                                            React.createElement("button", { onClick: () => handleRemoveUnit(index, unitIdx), className: "text-blue-200 hover:text-white"}, React.createElement(XCircleIcon, { className: "w-4 h-4"}))
                                        )
                                    )),
                                    React.createElement("div", { className: "relative" },
                                        React.createElement("button", { onClick: () => toggleDropdown(index), className: "flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded-md text-white font-medium transition-colors" },
                                            React.createElement(PlusCircleIcon, { className: "w-4 h-4"}), " Asignar Unidad ", React.createElement(ChevronDownIcon, { className: `w-3 h-3 transition-transform ${dropdownState[index] ? 'rotate-180' : ''}`})
                                        ),
                                        dropdownState[index] && (
                                            React.createElement("div", { className: "absolute z-10 top-full mt-1 w-64 bg-zinc-800 border border-zinc-600 rounded-md shadow-lg" },
                                                React.createElement("div", { className: "p-2" },
                                                    React.createElement("input", { 
                                                        type: "text",
                                                        placeholder: "Buscar unidad...",
                                                        value: searchTerm,
                                                        onChange: e => setSearchTerm(e.target.value),
                                                        className: "w-full bg-zinc-900 border-zinc-700 rounded-md px-2 py-1 text-white text-sm"
                                                    })
                                                ),
                                                React.createElement("ul", { className: "max-h-48 overflow-y-auto" },
                                                    filteredUnits.map(unit => (
                                                        React.createElement("li", { key: unit, onClick: () => handleAddUnit(index, unit), className: "px-3 py-1.5 hover:bg-zinc-700 cursor-pointer text-sm" },
                                                            unit
                                                        )
                                                    ))
                                                )
                                            )
                                        )
                                    )
                                )
                            ) : (
                                item.assignedUnits.length > 0 && (
                                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                                        item.assignedUnits.map((unit, unitIdx) => (
                                            React.createElement("span", { key: unitIdx, className: "font-semibold text-white bg-blue-600/50 px-2 py-0.5 rounded-md text-sm" }, unit)
                                        ))
                                    )
                                )
                            )
                        )
                    ))
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
                ),
                currentUser?.role === 'admin' && (
                    React.createElement("div", { className: "flex items-center gap-2 self-start sm:self-center" },
                        isEditing ? (
                            React.createElement(React.Fragment, null,
                                React.createElement("button", { onClick: handleSave, className: "px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5"}), " Guardar"),
                                React.createElement("button", { onClick: handleCancel, className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white" }, React.createElement(XCircleIcon, { className: "w-6 h-6"}))
                            )
                        ) : (
                            React.createElement("button", { onClick: handleEdit, className: "px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5"}), " Editar")
                        )
                    )
                )
            ),

            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl" },
                 React.createElement("div", { className: "flex flex-wrap gap-2 border-b border-zinc-700 pb-4 mb-4" },
                    React.createElement(TabButton, { tabName: "operativo", label: "Operativo" }),
                    React.createElement(TabButton, { tabName: "mapa", label: "Mapa Interactivo" }),
                    React.createElement(TabButton, { tabName: "puentes", label: "Puentes y Bajo Nivel" })
                ),
                
                React.createElement("div", null,
                    activeTab === 'operativo' && React.createElement(OperativoContent, null),
                    activeTab === 'mapa' && React.createElement("div", { ref: mapContainerRef, className: "w-full h-[60vh] rounded-lg bg-zinc-900 animate-fade-in"}),
                    activeTab === 'puentes' && (
                        React.createElement("div", { className: "max-h-[60vh] overflow-y-auto pr-2 animate-fade-in" },
                            React.createElement("ul", { className: "divide-y divide-zinc-700" },
                                (dataForView.underpasses || []).map(up => (
                                    React.createElement("li", { key: up.id, className: "py-2" },
                                        React.createElement("p", { className: "font-semibold text-white" }, up.id, ". ", up.name, " ", React.createElement("span", { className: "text-xs font-normal text-zinc-400" }, "(", up.commune, ")")),
                                        React.createElement("p", { className: "text-sm text-zinc-300" }, up.location)
                                    )
                                ))
                            )
                        )
                    )
                )
            )
        )
    );
};

export default HidroAlertView;