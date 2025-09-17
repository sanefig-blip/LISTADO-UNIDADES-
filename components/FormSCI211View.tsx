import React, { useState } from 'react';
import { SCI211Resource, Personnel } from '../types';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons';
// FIX: Correctly import the newly added PDF export function.
import { exportSci211ToPdf } from '../services/exportService';

interface FormSCI211ViewProps {
    personnel: Personnel[];
    unitList: string[];
}

const FormSCI211View: React.FC<FormSCI211ViewProps> = ({ personnel, unitList }) => {
    const [resources, setResources] = useState<SCI211Resource[]>(() => {
        const savedData = localStorage.getItem('sci211Data');
        return savedData ? JSON.parse(savedData) : [];
    });

    const handleResourceChange = (index: number, field: keyof SCI211Resource, value: string) => {
        setResources(prev => {
            const newResources = [...prev];
            (newResources[index] as any)[field] = value;
            return newResources;
        });
    };

    const handleAddResource = () => {
        const newResource: SCI211Resource = {
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

    const handleRemoveResource = (index: number) => {
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
        <div className="animate-fade-in bg-zinc-800/60 p-6 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Formulario SCI-211: Registro de Recursos</h2>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold">Guardar</button>
                    <button onClick={handleExport} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold flex items-center gap-2"><DownloadIcon className="w-5 h-5"/>Exportar PDF</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                    <thead>
                        <tr className="border-b-2 border-zinc-600 text-zinc-300">
                            <th className="p-2">Recurso</th>
                            <th className="p-2">Institución</th>
                            <th className="p-2">Fecha/Hora Arribo</th>
                            <th className="p-2">Cant. Pers.</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Asignado a</th>
                            <th className="p-2">Observaciones</th>
                            <th className="p-2 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map((res, index) => (
                            <tr key={res.id} className="border-t border-zinc-700">
                                <td className="p-2"><input type="text" value={res.resourceType} onChange={e => handleResourceChange(index, 'resourceType', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="text" value={res.institution} onChange={e => handleResourceChange(index, 'institution', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="datetime-local" value={res.arrivalDateTime} onChange={e => handleResourceChange(index, 'arrivalDateTime', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="number" value={res.personnelCount} onChange={e => handleResourceChange(index, 'personnelCount', e.target.value)} className="w-20 bg-zinc-700 rounded p-1 text-center"/></td>
                                <td className="p-2">
                                    <select value={res.status} onChange={e => handleResourceChange(index, 'status', e.target.value)} className="w-full bg-zinc-700 rounded p-1">
                                        <option>Disponible</option>
                                        <option>No Disponible</option>
                                    </select>
                                </td>
                                <td className="p-2"><input type="text" value={res.assignedTo} onChange={e => handleResourceChange(index, 'assignedTo', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="text" value={res.observations} onChange={e => handleResourceChange(index, 'observations', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><button onClick={() => handleRemoveResource(index)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAddResource} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white"><PlusCircleIcon className="w-5 h-5"/> Añadir Recurso</button>
        </div>
    );
};

export default FormSCI211View;