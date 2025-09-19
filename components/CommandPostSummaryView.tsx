import React, { useState } from 'react';
import { InterventionGroup, FireUnit, Personnel, TrackedUnit, TrackedPersonnel } from '../types';
import { DownloadIcon, ChevronDownIcon } from './icons';

interface CommandPostSummaryViewProps {
    availableUnits: FireUnit[];
    availablePersonnel: Personnel[];
    interventionGroups: InterventionGroup[];
    onExportFullReport: () => void;
}

const CollapsibleSection: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-zinc-900/50 p-4 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-lg font-semibold text-white">{title} ({count})</h3>
                <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-3 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
}

const CommandPostSummaryView: React.FC<CommandPostSummaryViewProps> = ({ availableUnits, availablePersonnel, interventionGroups, onExportFullReport }) => {
    
    const interventionUnits = interventionGroups.flatMap(g => g.units);
    const interventionPersonnel = interventionGroups.flatMap(g => g.personnel);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Resumen de Puesto de Comando</h2>
                <button onClick={onExportFullReport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold">
                    <DownloadIcon className="w-5 h-5" />
                    Exportar Resumen PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollapsibleSection title="Recursos en Intervención" count={interventionUnits.length + interventionPersonnel.length}>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-blue-300">Unidades ({interventionUnits.length})</h4>
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 text-sm">
                             {interventionUnits.map(unit => (
                                <li key={unit.id} className="bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200">{unit.id}</li>
                            ))}
                        </ul>
                         <h4 className="font-semibold text-blue-300 pt-2 border-t border-zinc-700">Personal ({interventionPersonnel.length})</h4>
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 text-sm">
                            {interventionPersonnel.map(person => (
                                <li key={person.id} className="bg-zinc-700/50 p-2 rounded-md text-zinc-200">{person.name} <span className="text-xs text-zinc-400">({person.rank})</span></li>
                            ))}
                        </ul>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Recursos Disponibles" count={availableUnits.length + availablePersonnel.length}>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-green-300">Unidades ({availableUnits.length})</h4>
                         <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 text-sm">
                            {availableUnits.map(unit => (
                                <li key={unit.id} className="bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200">{unit.id}</li>
                            ))}
                        </ul>
                        <h4 className="font-semibold text-green-300 pt-2 border-t border-zinc-700">Personal ({availablePersonnel.length})</h4>
                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 text-sm">
                            {availablePersonnel.map(person => (
                                <li key={person.id} className="bg-zinc-700/50 p-2 rounded-md text-zinc-200">{person.name} <span className="text-xs text-zinc-400">({person.rank})</span></li>
                            ))}
                        </ul>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

export default CommandPostSummaryView;