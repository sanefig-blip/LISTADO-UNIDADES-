import React, { useState } from 'react';
import { SCI201Data, SCI201Action } from '../types';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons';
// FIX: Correctly import the newly added PDF export function.
import { exportSci201ToPdf } from '../services/exportService';

const FormSCI201View: React.FC = () => {
    const [formData, setFormData] = useState<SCI201Data>(() => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleActionChange = (index: number, field: keyof SCI201Action, value: string) => {
        setFormData(prev => {
            const newActions = [...prev.actions];
            (newActions[index] as any)[field] = value;
            return { ...prev, actions: newActions };
        });
    };

    const handleAddAction = () => {
        const newAction: SCI201Action = {
            id: Date.now(),
            time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            summary: ''
        };
        setFormData(prev => ({ ...prev, actions: [...prev.actions, newAction] }));
    };
    
    const handleRemoveAction = (index: number) => {
        setFormData(prev => ({ ...prev, actions: prev.actions.filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        localStorage.setItem('sci201Data', JSON.stringify(formData));
        alert('Formulario SCI-201 guardado localmente.');
    };
    
    const handleExport = () => {
        exportSci201ToPdf(formData);
    };

    const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-zinc-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3 border-b border-zinc-700 pb-2">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">{children}</div>
        </div>
    );

    const FormField: React.FC<{ label: string; name: keyof SCI201Data; wide?: boolean; children: React.ReactNode }> = ({ label, name, wide, children }) => (
        <div className={wide ? 'md:col-span-2' : ''}>
            <label htmlFor={name} className="block font-medium text-zinc-300 mb-1">{label}</label>
            {children}
        </div>
    );

    const TextInput = ({ name, value }: { name: keyof SCI201Data; value: string }) => (
        <input type="text" id={name} name={name} value={value} onChange={handleChange} className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1.5 text-white" />
    );

    const TextArea = ({ name, value, rows=3 }: { name: keyof SCI201Data; value: string; rows?: number }) => (
        <textarea id={name} name={name} value={value} onChange={handleChange} rows={rows} className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1.5 text-white resize-y" />
    );
    
    return (
        <div className="animate-fade-in bg-zinc-800/60 p-6 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Formulario SCI-201: Briefing de Incidente</h2>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold">Guardar</button>
                    <button onClick={handleExport} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold flex items-center gap-2"><DownloadIcon className="w-5 h-5"/>Exportar PDF</button>
                </div>
            </div>

            <FormSection title="Información General">
                <FormField label="1. Nombre del Incidente" name="incidentName"><TextInput name="incidentName" value={formData.incidentName} /></FormField>
                <FormField label="2. Fecha/Hora de Preparación" name="prepDateTime"><input type="datetime-local" id="prepDateTime" name="prepDateTime" value={formData.prepDateTime} onChange={handleChange} className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1.5 text-white"/></FormField>
                <FormField label="3. Ubicación del Incidente" name="incidentLocation" wide><TextInput name="incidentLocation" value={formData.incidentLocation} /></FormField>
            </FormSection>
            
            <FormSection title="4. Evaluación de la Situación Actual">
                <FormField label="Naturaleza y Magnitud del Incidente" name="evalNature" wide><TextArea name="evalNature" value={formData.evalNature} /></FormField>
                <FormField label="Amenazas Significativas" name="evalThreats" wide><TextArea name="evalThreats" value={formData.evalThreats} /></FormField>
                <FormField label="Área Afectada" name="evalAffectedArea" wide><TextArea name="evalAffectedArea" value={formData.evalAffectedArea} /></FormField>
                <FormField label="Aislamiento y Cierre de Calles" name="evalIsolation" wide><TextArea name="evalIsolation" value={formData.evalIsolation} /></FormField>
            </FormSection>
            
            <FormSection title="Plan de Acción">
                <FormField label="5. Objetivos Iniciales" name="initialObjectives" wide><TextArea name="initialObjectives" value={formData.initialObjectives} /></FormField>
                <FormField label="6. Estrategias" name="strategies" wide><TextArea name="strategies" value={formData.strategies} /></FormField>
                <FormField label="7. Tácticas" name="tactics" wide><TextArea name="tactics" value={formData.tactics} /></FormField>
            </FormSection>

            <FormSection title="Organización y Logística">
                <FormField label="8. Ubicación del Puesto Comando (PC)" name="pcLocation"><TextInput name="pcLocation" value={formData.pcLocation} /></FormField>
                <FormField label="9. Ubicación de Espera (E)" name="eLocation"><TextInput name="eLocation" value={formData.eLocation} /></FormField>
                <FormField label="10. Ruta de Ingreso" name="ingressRoute"><TextInput name="ingressRoute" value={formData.ingressRoute} /></FormField>
                <FormField label="11. Ruta de Egreso" name="egressRoute"><TextInput name="egressRoute" value={formData.egressRoute} /></FormField>
                <FormField label="12. Mensaje de Seguridad" name="safetyMessage" wide><TextArea name="safetyMessage" value={formData.safetyMessage} /></FormField>
                <FormField label="13. Comandante del Incidente" name="incidentCommander"><TextInput name="incidentCommander" value={formData.incidentCommander} /></FormField>
            </FormSection>
            
            <FormSection title="14. Acciones Realizadas">
                <div className="md:col-span-2 space-y-2">
                    {formData.actions.map((action, index) => (
                        <div key={action.id} className="flex items-center gap-2">
                            <input type="time" value={action.time} onChange={e => handleActionChange(index, 'time', e.target.value)} className="bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white"/>
                            <textarea value={action.summary} onChange={e => handleActionChange(index, 'summary', e.target.value)} rows={1} className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white resize-y"/>
                            <button onClick={() => handleRemoveAction(index)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button onClick={handleAddAction} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white"><PlusCircleIcon className="w-5 h-5"/> Añadir Acción</button>
                </div>
            </FormSection>
        </div>
    );
};

export default FormSCI201View;