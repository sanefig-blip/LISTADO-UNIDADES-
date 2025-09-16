import React from 'react';
import { InterventionGroup, TrackedUnit, TrackedPersonnel, Personnel, FireUnit } from '../types';
import { TrashIcon, ArrowRightIcon } from './icons';

interface TacticalCommandPostViewProps {
    interventionGroups: InterventionGroup[];
    availableUnits: FireUnit[];
    availablePersonnel: Personnel[];
    allPersonnel: Personnel[];
    onGroupChange: (groupId: string, field: 'name' | 'officerInCharge', value: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onAssignUnit: (unit: FireUnit, groupId: string) => void;
    onAssignPersonnel: (person: Personnel, groupId: string) => void;
    onUnassignUnit: (unitId: string, groupId: string) => void;
    onUnassignPersonnel: (personnelId: string, groupId: string) => void;
    onUnitDetailChange: (groupId: string, unitId: string, field: keyof Omit<TrackedUnit, 'id' | 'type' | 'status' | 'groupName'>, value: string) => void;
}

const TacticalCommandPostView: React.FC<TacticalCommandPostViewProps> = ({
    interventionGroups,
    availableUnits,
    availablePersonnel,
    allPersonnel,
    onGroupChange,
    onDeleteGroup,
    onAssignUnit,
    onAssignPersonnel,
    onUnassignUnit,
    onUnassignPersonnel,
    onUnitDetailChange
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-zinc-800/60 p-4 rounded-xl space-y-4 h-min sticky top-36">
                <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-2">
                    Recursos Disponibles ({availableUnits.length} U / {availablePersonnel.length} P)
                </h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Unidades ({availableUnits.length})</h4>
                        <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {availableUnits.map(unit => (
                                <li key={unit.id} className="flex justify-between items-center bg-zinc-700/50 p-2 rounded-md text-sm">
                                    <span className="font-mono text-zinc-200">{unit.id} <span className="text-zinc-400">({unit.type})</span></span>
                                    <div className="flex gap-1">
                                        {interventionGroups.map(g => (
                                            <button key={g.id} onClick={() => onAssignUnit(unit, g.id)} className="p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white" title={`Asignar a ${g.name}`}><ArrowRightIcon className="w-4 h-4" /></button>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Personal ({availablePersonnel.length})</h4>
                        <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {availablePersonnel.map(person => (
                                <li key={person.id} className="flex justify-between items-center bg-zinc-700/50 p-2 rounded-md text-sm">
                                    <span className="text-zinc-200">{person.name}</span>
                                    <div className="flex gap-1">
                                         {interventionGroups.map(g => (
                                            <button key={g.id} onClick={() => onAssignPersonnel(person, g.id)} className="p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white" title={`Asignar a ${g.name}`}><ArrowRightIcon className="w-4 h-4" /></button>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {interventionGroups.map(group => (
                    <div key={group.id} className="bg-zinc-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <input value={group.name} onChange={e => onGroupChange(group.id, 'name', e.target.value)} className="text-lg font-bold bg-transparent text-white border-b-2 border-zinc-700 focus:border-blue-500 outline-none w-1/2"/>
                            <button onClick={() => onDeleteGroup(group.id)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="mb-3">
                            <label className="text-sm text-zinc-400">Oficial a Cargo:</label>
                            <input value={group.officerInCharge} onChange={e => onGroupChange(group.id, 'officerInCharge', e.target.value)} className="w-full bg-zinc-700 rounded p-1 mt-1 text-white" list="personnel-list"/>
                            <datalist id="personnel-list">
                                {allPersonnel.map(p => <option key={p.id} value={p.name} />)}
                            </datalist>
                        </div>
                        
                        <h5 className="font-semibold text-white mt-4 mb-2">Unidades Asignadas ({group.units.length})</h5>
                        {group.units.map(unit => (
                            <div key={unit.id} className="bg-zinc-800 p-3 rounded-md mb-2 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-mono font-bold text-zinc-200">{unit.id}</p>
                                    <button onClick={() => onUnassignUnit(unit.id, group.id)} className="text-zinc-400 hover:text-yellow-400"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <input value={unit.task} onChange={e => onUnitDetailChange(group.id, unit.id, 'task', e.target.value)} placeholder="Tarea asignada" className="bg-zinc-700 rounded p-1 text-white"/>
                                    <input value={unit.locationInScene} onChange={e => onUnitDetailChange(group.id, unit.id, 'locationInScene', e.target.value)} placeholder="Ubicación" className="bg-zinc-700 rounded p-1 text-white"/>
                                    <input value={unit.workTime} onChange={e => onUnitDetailChange(group.id, unit.id, 'workTime', e.target.value)} placeholder="Tiempo de Trabajo" className="bg-zinc-700 rounded p-1 text-white"/>
                                    <input value={unit.departureTime} onChange={e => onUnitDetailChange(group.id, unit.id, 'departureTime', e.target.value)} placeholder="H. Salida" className="bg-zinc-700 rounded p-1 text-white"/>
                                    <input value={unit.onSceneTime} onChange={e => onUnitDetailChange(group.id, unit.id, 'onSceneTime', e.target.value)} placeholder="H. Lugar" className="bg-zinc-700 rounded p-1 text-white"/>
                                    <input value={unit.returnTime} onChange={e => onUnitDetailChange(group.id, unit.id, 'returnTime', e.target.value)} placeholder="H. Regreso" className="bg-zinc-700 rounded p-1 text-white"/>
                                </div>
                            </div>
                        ))}

                        <h5 className="font-semibold text-white mt-4 mb-2">Personal Asignado ({group.personnel.length})</h5>
                        <ul className="space-y-1 text-sm max-h-60 overflow-y-auto pr-2">
                            {group.personnel.map(person => (
                                <li key={person.id} className="flex justify-between items-center bg-zinc-800 p-2 rounded-md">
                                    <span className="text-zinc-300">{person.name} <span className="text-xs text-zinc-400">({person.rank})</span></span>
                                    <button onClick={() => onUnassignPersonnel(person.id, group.id)} className="text-zinc-400 hover:text-yellow-400"><TrashIcon className="w-4 h-4"/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TacticalCommandPostView;
