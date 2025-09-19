import React, { useState } from 'react';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons.js';
import { exportSci201ToPdf } from '../services/exportService.js';

const FormSCI201View = () => {
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('sci201Data');
        return savedData ? JSON.parse(savedData) : {
            incidentName: '',
            prepDateTime: new Date().toISOString().slice(0, 16),
            incidentLocation: '',
            evalNature: '',
            evalThreats: '',
            evalAffectedArea: '',
            evalIsolation: '',
            initialObjectives: '',
            strategies: '',
            tactics: '',
            pcLocation: '',
            eLocation: '',
            ingressRoute: '',
            egressRoute: '',
            safetyMessage: '',
            incidentCommander: '',
            mapOrSketch: '',
            orgChart: '',
            actions: [],
        };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleActionChange = (index, field, value) => {
        setFormData(prev => {
            const newActions = [...prev.actions];
            newActions[index][field] = value;
            return { ...prev, actions: newActions };
        });
    };

    const handleAddAction = () => {
        const newAction = {
            id: Date.now(),
            time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            summary: ''
        };
        setFormData(prev => ({ ...prev, actions: [...prev.actions, newAction] }));
    };
    
    const handleRemoveAction = (index) => {
        setFormData(prev => ({ ...prev, actions: prev.actions.filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        localStorage.setItem('sci201Data', JSON.stringify(formData));
        alert('Formulario SCI-201 guardado localmente.');
    };
    
    const handleExport = () => {
        exportSci201ToPdf(formData);
    };

    const FormSection = ({ title, children }) => (
        React.createElement("div", { className: "bg-zinc-900/50 p-4 rounded-lg" },
            React.createElement("h3", { className: "text-lg font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2" }, title),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" }, children)
        )
    );

    const FormField = ({ label, name, wide, children }) => (
        React.createElement("div", { className: wide ? 'md:col-span-2' : '' },
            React.createElement("label", { htmlFor: name, className: "block font-medium text-zinc-300 mb-1" }, label),
            children
        )
    );

    const TextInput = ({ name, value }) => (
        React.createElement("input", { type: "text", id: name, name: name, value: value, onChange: handleChange, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1.5 text-white" })
    );

    const TextArea = ({ name, value, rows=3 }) => (
        React.createElement("textarea", { id: name, name: name, value: value, onChange: handleChange, rows: rows, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1.5 text-white resize-y" })
    );
    
    return (
        React.createElement("div", { className: "animate-fade-in bg-zinc-800/60 p-6 rounded-xl space-y-6" },
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("h2", { className: "text-2xl font-bold text-white" }, "Formulario SCI-201: Briefing de Incidente"),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: handleSave, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold" }, "Guardar"),
                    React.createElement("button", { onClick: handleExport, className: "px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold flex items-center gap-2" }, React.createElement(DownloadIcon, { className: "w-5 h-5" }), "Exportar PDF")
                )
            ),

            React.createElement(FormSection, { title: "Información General" },
                React.createElement(FormField, { label: "1. Nombre del Incidente", name: "incidentName" }, React.createElement(TextInput, { name: "incidentName", value: formData.incidentName })),
                React.createElement(FormField, { label: "2. Fecha/Hora de Preparación", name: "prepDateTime" }, React.createElement("input", { type: "datetime-local", id: "prepDateTime", name: "prepDateTime", value: formData.prepDateTime, onChange: handleChange, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1.5 text-white" })),
                React.createElement(FormField, { label: "3. Ubicación del Incidente", name: "incidentLocation", wide: true }, React.createElement(TextInput, { name: "incidentLocation", value: formData.incidentLocation }))
            ),
            
            React.createElement(FormSection, { title: "4. Evaluación de la Situación Actual" },
                React.createElement(FormField, { label: "Naturaleza y Magnitud del Incidente", name: "evalNature", wide: true }, React.createElement(TextArea, { name: "evalNature", value: formData.evalNature })),
                React.createElement(FormField, { label: "Amenazas Significativas", name: "evalThreats", wide: true }, React.createElement(TextArea, { name: "evalThreats", value: formData.evalThreats })),
                React.createElement(FormField, { label: "Área Afectada", name: "evalAffectedArea", wide: true }, React.createElement(TextArea, { name: "evalAffectedArea", value: formData.evalAffectedArea })),
                React.createElement(FormField, { label: "Aislamiento y Cierre de Calles", name: "evalIsolation", wide: true }, React.createElement(TextArea, { name: "evalIsolation", value: formData.evalIsolation }))
            ),
            
            React.createElement(FormSection, { title: "Plan de Acción" },
                React.createElement(FormField, { label: "5. Objetivos Iniciales", name: "initialObjectives", wide: true }, React.createElement(TextArea, { name: "initialObjectives", value: formData.initialObjectives })),
                React.createElement(FormField, { label: "6. Estrategias", name: "strategies", wide: true }, React.createElement(TextArea, { name: "strategies", value: formData.strategies })),
                React.createElement(FormField, { label: "7. Tácticas", name: "tactics", wide: true }, React.createElement(TextArea, { name: "tactics", value: formData.tactics }))
            ),

            React.createElement(FormSection, { title: "Organización y Logística" },
                React.createElement(FormField, { label: "8. Ubicación del Puesto Comando (PC)", name: "pcLocation" }, React.createElement(TextInput, { name: "pcLocation", value: formData.pcLocation })),
                React.createElement(FormField, { label: "9. Ubicación de Espera (E)", name: "eLocation" }, React.createElement(TextInput, { name: "eLocation", value: formData.eLocation })),
                React.createElement(FormField, { label: "10. Ruta de Ingreso", name: "ingressRoute" }, React.createElement(TextInput, { name: "ingressRoute", value: formData.ingressRoute })),
                React.createElement(FormField, { label: "11. Ruta de Egreso", name: "egressRoute" }, React.createElement(TextInput, { name: "egressRoute", value: formData.egressRoute })),
                React.createElement(FormField, { label: "12. Mensaje de Seguridad", name: "safetyMessage", wide: true }, React.createElement(TextArea, { name: "safetyMessage", value: formData.safetyMessage })),
                React.createElement(FormField, { label: "13. Comandante del Incidente", name: "incidentCommander" }, React.createElement(TextInput, { name: "incidentCommander", value: formData.incidentCommander }))
            ),
            
            React.createElement(FormSection, { title: "14. Acciones Realizadas" },
                React.createElement("div", { className: "md:col-span-2 space-y-2" },
                    formData.actions.map((action, index) => (
                        React.createElement("div", { key: action.id, className: "flex items-center gap-2" },
                            React.createElement("input", { type: "time", value: action.time, onChange: e => handleActionChange(index, 'time', e.target.value), className: "bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" }),
                            React.createElement("textarea", { value: action.summary, onChange: e => handleActionChange(index, 'summary', e.target.value), rows: 1, className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white resize-y" }),
                            React.createElement("button", { onClick: () => handleRemoveAction(index), className: "p-1 text-red-400 hover:text-red-300" }, React.createElement(TrashIcon, { className: "w-5 h-5" }))
                        )
                    )),
                    React.createElement("button", { onClick: handleAddAction, className: "flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Acción")
                )
            )
        )
    );
};
export default FormSCI201View;