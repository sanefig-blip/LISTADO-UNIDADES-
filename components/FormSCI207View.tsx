import React, { useState } from 'react';
import { SCI207Victim, TriageCategory } from '../types';
import { PlusCircleIcon, TrashIcon, DownloadIcon } from './icons';
// FIX: Correctly import the newly added PDF export function.
import { exportSci207ToPdf } from '../services/exportService';


const FormSCI207View: React.FC = () => {
    const [victims, setVictims] = useState<SCI207Victim[]>(() => {
        const savedData = localStorage.getItem('sci207Data');
        return savedData ? JSON.parse(savedData) : [];
    });

    const handleVictimChange = (index: number, field: keyof SCI207Victim, value: string) => {
        setVictims(prev => {
            const newVictims = [...prev];
            (newVictims[index] as any)[field] = value;
            return newVictims;
        });
    };

    const handleAddVictim = () => {
        const newVictim: SCI207Victim = {
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

    const handleRemoveVictim = (index: number) => {
        setVictims(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSave = () => {
        localStorage.setItem('sci207Data', JSON.stringify(victims));
        alert('Formulario SCI-207 guardado localmente.');
    };

    const handleExport = () => {
        exportSci207ToPdf(victims);
    };

    const TriageSelector: React.FC<{ value: TriageCategory, onChange: (value: TriageCategory) => void }> = ({ value, onChange }) => {
        const triageColors: {[key in TriageCategory]: string} = { 'Rojo': 'bg-red-600', 'Amarillo': 'bg-yellow-500', 'Verde': 'bg-green-600', 'Negro': 'bg-black', '': 'bg-zinc-700' };
        return (
            <select value={value} onChange={e => onChange(e.target.value as TriageCategory)} className={`w-full rounded p-1 text-white border-0 font-semibold ${triageColors[value]}`}>
                <option value="" className="bg-zinc-700">-- Triage --</option>
                <option value="Rojo" className="bg-red-600">Rojo</option>
                <option value="Amarillo" className="bg-yellow-500">Amarillo</option>
                <option value="Verde" className="bg-green-600">Verde</option>
                <option value="Negro" className="bg-black">Negro</option>
            </select>
        )
    };

    return (
        <div className="animate-fade-in bg-zinc-800/60 p-6 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Formulario SCI-207: Registro de Víctimas</h2>
                 <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold">Guardar</button>
                    <button onClick={handleExport} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold flex items-center gap-2"><DownloadIcon className="w-5 h-5"/>Exportar PDF</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead>
                        <tr className="border-b-2 border-zinc-600 text-zinc-300">
                            <th className="p-2">Nombre/Ident.</th>
                            <th className="p-2">Sexo</th>
                            <th className="p-2">Edad</th>
                            <th className="p-2">Triage</th>
                            <th className="p-2">Destino</th>
                            <th className="p-2">Transportado Por</th>
                            <th className="p-2">Fecha/Hora Transp.</th>
                            <th className="p-2 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {victims.map((vic, index) => (
                            <tr key={vic.id} className="border-t border-zinc-700">
                                <td className="p-2"><input type="text" value={vic.patientName} onChange={e => handleVictimChange(index, 'patientName', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="text" value={vic.sex} onChange={e => handleVictimChange(index, 'sex', e.target.value)} className="w-20 bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="text" value={vic.age} onChange={e => handleVictimChange(index, 'age', e.target.value)} className="w-16 bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><TriageSelector value={vic.triage} onChange={val => handleVictimChange(index, 'triage', val)} /></td>
                                <td className="p-2"><input type="text" value={vic.transportLocation} onChange={e => handleVictimChange(index, 'transportLocation', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="text" value={vic.transportedBy} onChange={e => handleVictimChange(index, 'transportedBy', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><input type="datetime-local" value={vic.transportDateTime} onChange={e => handleVictimChange(index, 'transportDateTime', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                <td className="p-2"><button onClick={() => handleRemoveVictim(index)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAddVictim} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white"><PlusCircleIcon className="w-5 h-5"/> Añadir Víctima</button>
        </div>
    );
};

export default FormSCI207View;