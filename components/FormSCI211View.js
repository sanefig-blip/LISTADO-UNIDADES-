import React, { useState } from 'react';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons.js';
import { exportSci211ToPdf } from '../services/exportService.js';

const FormSCI211View = ({ personnel, unitList }) => {
    const [resources, setResources] = useState(() => {
        const savedData = localStorage.getItem('sci211Data');
        return savedData ? JSON.parse(savedData) : [];
    });

    const handleResourceChange = (index, field, value) => {
        setResources(prev => {
            const newResources = [...prev];
            newResources[index][field] = value;
            return newResources;
        });
    };

    const handleAddResource = () => {
        const newResource = {
            id: Date.now(),
            requestedBy: '',
            requestDateTime: new Date().toISOString().slice(0, 16),
            classType: 'Personal',
            resourceType: '',
            arrivalDateTime: new Date().toISOString().slice(0, 16),
            institution: 'Bomberos de la Ciudad',
            matricula: '',
            personnelCount: '1',
            status: 'Disponible',
            assignedTo: '',
            demobilizedBy: '',
            demobilizedDateTime: '',
            observations: ''
        };
        setResources(prev => [...prev, newResource]);
    };

    const handleRemoveResource = (index) => {
        setResources(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        localStorage.setItem('sci211Data', JSON.stringify(resources));
        alert('Formulario SCI-211 guardado localmente.');
    };
    
    const handleExport = () => {
        exportSci211ToPdf(resources);
    };

    return (
        React.createElement("div", { className: "animate-fade-in bg-zinc-800/60 p-6 rounded-xl space-y-6" },
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("h2", { className: "text-2xl font-bold text-white" }, "Formulario SCI-211: Registro de Recursos"),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: handleSave, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold" }, "Guardar"),
                    React.createElement("button", { onClick: handleExport, className: "px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold flex items-center gap-2" }, React.createElement(DownloadIcon, { className: "w-5 h-5" }), "Exportar PDF")
                )
            ),

            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full min-w-[1200px] text-left text-sm" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "border-b-2 border-zinc-600 text-zinc-300" },
                            React.createElement("th", { className: "p-2" }, "Recurso"),
                            React.createElement("th", { className: "p-2" }, "Institución"),
                            React.createElement("th", { className: "p-2" }, "Fecha/Hora Arribo"),
                            React.createElement("th", { className: "p-2" }, "Cant. Pers."),
                            React.createElement("th", { className: "p-2" }, "Estado"),
                            React.createElement("th", { className: "p-2" }, "Asignado a"),
                            React.createElement("th", { className: "p-2" }, "Observaciones"),
                            React.createElement("th", { className: "p-2 w-12" })
                        )
                    ),
                    React.createElement("tbody", null,
                        resources.map((res, index) => (
                            React.createElement("tr", { key: res.id, className: "border-t border-zinc-700" },
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: res.resourceType, onChange: e => handleResourceChange(index, 'resourceType', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: res.institution, onChange: e => handleResourceChange(index, 'institution', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "datetime-local", value: res.arrivalDateTime, onChange: e => handleResourceChange(index, 'arrivalDateTime', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "number", value: res.personnelCount, onChange: e => handleResourceChange(index, 'personnelCount', e.target.value), className: "w-20 bg-zinc-700 rounded p-1 text-center" })),
                                React.createElement("td", { className: "p-2" },
                                    React.createElement("select", { value: res.status, onChange: e => handleResourceChange(index, 'status', e.target.value), className: "w-full bg-zinc-700 rounded p-1" },
                                        React.createElement("option", null, "Disponible"),
                                        React.createElement("option", null, "No Disponible")
                                    )
                                ),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: res.assignedTo, onChange: e => handleResourceChange(index, 'assignedTo', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: res.observations, onChange: e => handleResourceChange(index, 'observations', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("button", { onClick: () => handleRemoveResource(index), className: "p-1 text-red-400 hover:text-red-300" }, React.createElement(TrashIcon, { className: "w-5 h-5" })))
                            )
                        ))
                    )
                )
            ),
            React.createElement("button", { onClick: handleAddResource, className: "flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Recurso")
        )
    );
};

export default FormSCI211View;
