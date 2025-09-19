import React from 'react';
import { InterventionGroup, FireUnit, Personnel, TrackedUnit, TrackedPersonnel } from '../types';
import { DownloadIcon } from './icons';
import { exportCommandPostSummaryToPdf } from '../services/exportService';

interface CommandPostSummaryViewProps {
    availableUnits: FireUnit[];
    availablePersonnel: Personnel[];
    interventionGroups: InterventionGroup[];
}

const CommandPostSummaryView: React.FC<CommandPostSummaryViewProps> = ({ availableUnits, availablePersonnel, interventionGroups }) => {
    
    const interventionUnits = interventionGroups.flatMap(g => g.units);
    const interventionPersonnel = interventionGroups.flatMap(g => g.personnel);

    const handleExport = () => {
        exportCommandPostSummaryToPdf(availableUnits, availablePersonnel, interventionUnits as TrackedUnit[], interventionPersonnel as TrackedPersonnel[]);
    };

    const ResourceList: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => (
        <div className="bg-zinc-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">{title} ({count})</h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 text-sm">
                {children}
            </ul>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Resumen de Puesto de Comando</h2>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold">
                    <DownloadIcon className="w-5 h-5" />
                    Exportar Resumen PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ResourceList title="Unidades en Intervención" count={interventionUnits.length}>
                    {interventionUnits.map(unit => (
                        <li key={unit.id} className="bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200">{unit.id}</li>
                    ))}
                </ResourceList>
                <ResourceList title="Personal en Intervención" count={interventionPersonnel.length}>
                     {interventionPersonnel.map(person => (
                        <li key={person.id} className="bg-zinc-700/50 p-2 rounded-md text-zinc-200">{person.name} <span className="text-xs text-zinc-400">({person.rank})</span></li>
                    ))}
                </ResourceList>
                <ResourceList title="Unidades Disponibles" count={availableUnits.length}>
                     {availableUnits.map(unit => (
                        <li key={unit.id} className="bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200">{unit.id}</li>
                    ))}
                </ResourceList>
                <ResourceList title="Personal Disponible" count={availablePersonnel.length}>
                     {availablePersonnel.map(person => (
                        <li key={person.id} className="bg-zinc-700/50 p-2 rounded-md text-zinc-200">{person.name} <span className="text-xs text-zinc-400">({person.rank})</span></li>
                    ))}
                </ResourceList>
            </div>
        </div>
    );
};

export default CommandPostSummaryView;