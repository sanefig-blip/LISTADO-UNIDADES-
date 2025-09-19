import React, { useState } from 'react';
import Croquis from './Croquis.js';
import { SunIcon, FireIcon, ClipboardListIcon, PlusCircleIcon, TrashIcon } from './icons.js';

const ForestalView = ({ interventionGroups, onUpdateInterventionGroups }) => {
    const [weather, setWeather] = useState({
        temp: '25',
        humidity: '40',
        windSpeed: '15',
        windDirection: 'NNE'
    });
    const [resources, setResources] = useState(['Avión Hidrante AT-802', 'Helicóptero Bell 412', 'Brigada Forestal Alpha']);
    const [newResource, setNewResource] = useState('');
    const [actionPlan, setActionPlan] = useState('1. Establecer perímetro de seguridad.\n2. Ataque aéreo en flanco derecho.\n3. Brigadas terrestres contienen el avance en flanco izquierdo.');

    const handleWeatherChange = (e) => {
        const { name, value } = e.target;
        setWeather(prev => ({ ...prev, [name]: value }));
    };

    const handleAddResource = (e) => {
        e.preventDefault();
        if (newResource.trim()) {
            setResources(prev => [...prev, newResource.trim()]);
            setNewResource('');
        }
    };

    const handleRemoveResource = (index) => {
        setResources(prev => prev.filter((_, i) => i !== index));
    };

    return (
        React.createElement("div", { className: "animate-fade-in grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh]" },
            // Sidebar
            React.createElement("aside", { className: "lg:col-span-1 bg-zinc-800/60 rounded-xl p-4 flex flex-col gap-6 overflow-y-auto" },
                // Weather Section
                React.createElement("section", null,
                    React.createElement("h3", { className: "text-lg font-semibold text-yellow-300 flex items-center gap-2 mb-3 border-b border-zinc-700 pb-2" }, React.createElement(SunIcon, { className: "w-5 h-5" }), " Datos Meteorológicos"),
                    React.createElement("div", { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "grid grid-cols-2 gap-3 items-center" },
                            React.createElement("label", { htmlFor: "temp", className: "text-zinc-300" }, "Temperatura (°C)"),
                            React.createElement("input", { type: "number", name: "temp", id: "temp", value: weather.temp, onChange: handleWeatherChange, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                        ),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3 items-center" },
                            React.createElement("label", { htmlFor: "humidity", className: "text-zinc-300" }, "Humedad (%)"),
                            React.createElement("input", { type: "number", name: "humidity", id: "humidity", value: weather.humidity, onChange: handleWeatherChange, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                        ),
                         React.createElement("div", { className: "grid grid-cols-2 gap-3 items-center" },
                            React.createElement("label", { htmlFor: "windSpeed", className: "text-zinc-300" }, "Viento (km/h)"),
                            React.createElement("input", { type: "number", name: "windSpeed", id: "windSpeed", value: weather.windSpeed, onChange: handleWeatherChange, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                        ),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3 items-center" },
                            React.createElement("label", { htmlFor: "windDirection", className: "text-zinc-300" }, "Dirección Viento"),
                            React.createElement("input", { type: "text", name: "windDirection", id: "windDirection", value: weather.windDirection, onChange: handleWeatherChange, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                        )
                    )
                ),

                // Resources Section
                React.createElement("section", null,
                    React.createElement("h3", { className: "text-lg font-semibold text-yellow-300 flex items-center gap-2 mb-3 border-b border-zinc-700 pb-2" }, React.createElement(FireIcon, { className: "w-5 h-5" }), " Recursos Asignados"),
                    React.createElement("ul", { className: "space-y-2 mb-3" },
                        resources.map((res, index) => (
                            React.createElement("li", { key: index, className: "flex justify-between items-center text-sm bg-zinc-700/50 px-3 py-1.5 rounded-md text-zinc-200" },
                                React.createElement("span", null, res),
                                React.createElement("button", { onClick: () => handleRemoveResource(index), className: "text-zinc-400 hover:text-red-400" }, React.createElement(TrashIcon, { className: "w-4 h-4" }))
                            )
                        ))
                    ),
                    React.createElement("form", { onSubmit: handleAddResource, className: "flex gap-2" },
                        React.createElement("input", { type: "text", value: newResource, onChange: (e) => setNewResource(e.target.value), placeholder: "Añadir recurso...", className: "flex-grow bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-sm" }),
                        React.createElement("button", { type: "submit", className: "p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }))
                    )
                ),

                // Action Plan Section
                React.createElement("section", null,
                    React.createElement("h3", { className: "text-lg font-semibold text-yellow-300 flex items-center gap-2 mb-3 border-b border-zinc-700 pb-2" }, React.createElement(ClipboardListIcon, { className: "w-5 h-5" }), " Plan de Acción (PAI)"),
                    React.createElement("textarea", { 
                        value: actionPlan, 
                        onChange: (e) => setActionPlan(e.target.value), 
                        rows: 8,
                        className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-sm",
                        placeholder: "Describa los objetivos y estrategias..."
                    })
                )
            ),

            // Map Area
            React.createElement("main", { className: "lg:col-span-3 h-full" },
                React.createElement(Croquis, { 
                    isActive: true, 
                    onSketchCapture: () => {}, 
                    onUnlockSketch: () => {}, 
                    storageKey: "forestalSketch",
                    interventionGroups: interventionGroups,
                    onUpdateInterventionGroups: onUpdateInterventionGroups
                })
            )
        )
    );
};

export default ForestalView;