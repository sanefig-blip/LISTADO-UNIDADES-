import React, { useState } from 'react';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons.js';
import { exportSci207ToPdf } from '../services/exportService.js';


const FormSCI207View = () => {
    const [victims, setVictims] = useState(() => {
        const savedData = localStorage.getItem('sci207Data');
        return savedData ? JSON.parse(savedData) : [];
    });

    const handleVictimChange = (index, field, value) => {
        setVictims(prev => {
            const newVictims = [...prev];
            newVictims[index][field] = value;
            return newVictims;
        });
    };

    const handleAddVictim = () => {
        const newVictim = {
            id: Date.now(),
            patientName: 'NN',
            sex: '',
            age: '',
            triage: '',
            transportLocation: '',
            transportedBy: '',
            transportDateTime: new Date().toISOString().slice(0, 16)
        };
        setVictims(prev => [...prev, newVictim]);
    };

    const handleRemoveVictim = (index) => {
        setVictims(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSave = () => {
        localStorage.setItem('sci207Data', JSON.stringify(victims));
        alert('Formulario SCI-207 guardado localmente.');
    };

    const handleExport = () => {
        exportSci207ToPdf(victims);
    };

    const TriageSelector = ({ value, onChange }) => {
        const triageColors = { 'Rojo': 'bg-red-600', 'Amarillo': 'bg-yellow-500', 'Verde': 'bg-green-600', 'Negro': 'bg-black', '': 'bg-zinc-700' };
        return (
            React.createElement("select", { value: value, onChange: e => onChange(e.target.value), className: `w-full rounded p-1 text-white border-0 font-semibold ${triageColors[value]}` },
                React.createElement("option", { value: "", className: "bg-zinc-700" }, "-- Triage --"),
                React.createElement("option", { value: "Rojo", className: "bg-red-600" }, "Rojo"),
                React.createElement("option", { value: "Amarillo", className: "bg-yellow-500" }, "Amarillo"),
                React.createElement("option", { value: "Verde", className: "bg-green-600" }, "Verde"),
                React.createElement("option", { value: "Negro", className: "bg-black" }, "Negro")
            )
        )
    };

    return (
        React.createElement("div", { className: "animate-fade-in bg-zinc-800/60 p-6 rounded-xl space-y-6" },
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("h2", { className: "text-2xl font-bold text-white" }, "Formulario SCI-207: Registro de Víctimas"),
                 React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: handleSave, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold" }, "Guardar"),
                    React.createElement("button", { onClick: handleExport, className: "px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold flex items-center gap-2" }, React.createElement(DownloadIcon, { className: "w-5 h-5" }), "Exportar PDF")
                )
            ),
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full min-w-[1000px] text-left text-sm" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "border-b-2 border-zinc-600 text-zinc-300" },
                            React.createElement("th", { className: "p-2" }, "Nombre/Ident."),
                            React.createElement("th", { className: "p-2" }, "Sexo"),
                            React.createElement("th", { className: "p-2" }, "Edad"),
                            React.createElement("th", { className: "p-2" }, "Triage"),
                            React.createElement("th", { className: "p-2" }, "Destino"),
                            React.createElement("th", { className: "p-2" }, "Transportado Por"),
                            React.createElement("th", { className: "p-2" }, "Fecha/Hora Transp."),
                            React.createElement("th", { className: "p-2 w-12" })
                        )
                    ),
                    React.createElement("tbody", null,
                        victims.map((vic, index) => (
                            React.createElement("tr", { key: vic.id, className: "border-t border-zinc-700" },
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: vic.patientName, onChange: e => handleVictimChange(index, 'patientName', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: vic.sex, onChange: e => handleVictimChange(index, 'sex', e.target.value), className: "w-20 bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: vic.age, onChange: e => handleVictimChange(index, 'age', e.target.value), className: "w-16 bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement(TriageSelector, { value: vic.triage, onChange: val => handleVictimChange(index, 'triage', val) })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: vic.transportLocation, onChange: e => handleVictimChange(index, 'transportLocation', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "text", value: vic.transportedBy, onChange: e => handleVictimChange(index, 'transportedBy', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("input", { type: "datetime-local", value: vic.transportDateTime, onChange: e => handleVictimChange(index, 'transportDateTime', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                React.createElement("td", { className: "p-2" }, React.createElement("button", { onClick: () => handleRemoveVictim(index), className: "p-1 text-red-400 hover:text-red-300" }, React.createElement(TrashIcon, { className: "w-5 h-5" })))
                            )
                        ))
                    )
                )
            ),
            React.createElement("button", { onClick: handleAddVictim, className: "flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Víctima")
        )
    );
};
export default FormSCI207View;