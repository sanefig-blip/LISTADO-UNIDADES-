import React, { useState, useMemo, useEffect } from 'react';
import { UnitReportData, InterventionGroup, TrackedUnit, TrackedPersonnel, Personnel, FireUnit } from '../types';
import { DownloadIcon, PlusCircleIcon, TrashIcon, PencilIcon, ArrowRightIcon } from './icons';
import { exportCommandPostToPdf } from '../services/exportService';

interface CommandPostViewProps {
    unitReportData: UnitReportData;
    // Props for SCI forms and sketches would be added here if they were managed in App.tsx
}

const CommandPostView: React.FC<CommandPostViewProps> = ({ unitReportData }) => {
    const [interventionGroups, setInterventionGroups] = useState<InterventionGroup[]>([]);
    const [incidentDetails, setIncidentDetails] = useState({ type: '', address: '', alarmTime: '' });

    const allUnits = useMemo<FireUnit[]>(() => {
        return unitReportData.zones.flatMap(zone => 
            zone.groups.flatMap(group => group.units)
        );
    }, [unitReportData]);

    const allPersonnel = useMemo<Personnel[]>(() => {
        const personnelMap = new Map<string, Personnel>();
        unitReportData.zones.forEach(zone => {
            zone.groups.forEach(group => {
                [...(group.crewOfficers || []), ...(group.standbyOfficers || [])].forEach(officerString => {
                    // A simple parser for "RANK Name"
                    const parts = officerString.split(' ');
                    const rank = parts.length > 1 ? parts.slice(0, -1).join(' ') : 'OTRO';
                    const name = parts.length > 1 ? parts[parts.length - 1] : officerString;
                    if (!personnelMap.has(name)) {
                        personnelMap.set(name, {
                            id: `personnel-${name}`,
                            name: name,
                            rank: rank as any, // This is a simplification
                            // FIX: The 'Personnel' type does not have a 'groupName' property. Use 'station' instead as it is available and fits the data.
                            station: group.name,
                        });
                    }
                });
            });
        });
        return Array.from(personnelMap.values());
    }, [unitReportData]);

    const { availableUnits, availablePersonnel, totalInterventionUnits, totalInterventionPersonnel } = useMemo(() => {
        const assignedUnitIds = new Set(interventionGroups.flatMap(g => g.units.map(u => u.id)));
        const assignedPersonnelIds = new Set(interventionGroups.flatMap(g => g.personnel.map(p => p.id)));
        
        const availableUnits = allUnits.filter(u => !assignedUnitIds.has(u.id));
        const availablePersonnel = allPersonnel.filter(p => !assignedPersonnelIds.has(p.id));
        
        const totalInterventionUnits = interventionGroups.reduce((sum, group) => sum + group.units.length, 0);
        const totalInterventionPersonnel = interventionGroups.reduce((sum, group) => sum + group.personnel.length, 0);

        return { availableUnits, availablePersonnel, totalInterventionUnits, totalInterventionPersonnel };
    }, [interventionGroups, allUnits, allPersonnel]);

    const handleCreateGroup = () => {
        const newGroup: InterventionGroup = {
            id: `group-${Date.now()}`,
            name: `Nuevo Grupo ${interventionGroups.length + 1}`,
            officerInCharge: '',
            units: [],
            personnel: [],
        };
        setInterventionGroups(prev => [...prev, newGroup]);
    };

    const handleDeleteGroup = (groupId: string) => {
        setInterventionGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const handleGroupChange = (groupId: string, field: 'name' | 'officerInCharge', value: string) => {
        setInterventionGroups(prev => prev.map(g => g.id === groupId ? { ...g, [field]: value } : g));
    };
    
    const handleAssignUnit = (unit: FireUnit, groupId: string) => {
        const newTrackedUnit: TrackedUnit = {
            ...unit,
            groupName: interventionGroups.find(g => g.id === groupId)?.name || '',
            task: '',
            locationInScene: '',
            workTime: '',
            departureTime: '',
            onSceneTime: '',
            returnTime: ''
        };
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, units: [...g.units, newTrackedUnit] } : g
        ));
    };
    
    const handleAssignPersonnel = (person: Personnel, groupId: string) => {
        const newTrackedPersonnel: TrackedPersonnel = {
            ...person,
            groupName: interventionGroups.find(g => g.id === groupId)?.name || ''
        };
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, personnel: [...g.personnel, newTrackedPersonnel] } : g
        ));
    };

    const handleUnassignUnit = (unitId: string, groupId: string) => {
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, units: g.units.filter(u => u.id !== unitId) } : g
        ));
    };

    const handleUnassignPersonnel = (personnelId: string, groupId: string) => {
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, personnel: g.personnel.filter(p => p.id !== personnelId) } : g
        ));
    };

    const handleUnitDetailChange = (groupId: string, unitId: string, field: keyof TrackedUnit, value: string) => {
        setInterventionGroups(prev => prev.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    units: group.units.map(unit => unit.id === unitId ? { ...unit, [field]: value } : unit)
                };
            }
            return group;
        }));
    };
    
    const handleExport = () => {
        // Placeholder data for SCI forms and sketches as they are not managed here yet.
        const emptySci201: any = { actions: [] };
        const emptySci211: any[] = [];
        const emptySci207: any[] = [];
        exportCommandPostToPdf(incidentDetails, interventionGroups, emptySci201, emptySci211, emptySci207, null, null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Puesto de Comando Táctico</h2>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold">
                    <DownloadIcon className="w-5 h-5" />
                    Exportar Reporte PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Available Resources */}
                <div className="lg:col-span-1 bg-zinc-800/60 p-4 rounded-xl space-y-4 h-min">
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
                                                <button key={g.id} onClick={() => handleAssignUnit(unit, g.id)} className="p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white" title={`Asignar a ${g.name}`}><ArrowRightIcon className="w-4 h-4" /></button>
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
                                                <button key={g.id} onClick={() => handleAssignPersonnel(person, g.id)} className="p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white" title={`Asignar a ${g.name}`}><ArrowRightIcon className="w-4 h-4" /></button>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Intervention Organization */}
                <div className="lg:col-span-2 bg-zinc-800/60 p-4 rounded-xl space-y-4">
                     <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-2">
                        <h3 className="text-xl font-semibold text-yellow-300">
                            Organización de la Intervención ({totalInterventionUnits} U / {totalInterventionPersonnel} P)
                        </h3>
                        <button onClick={handleCreateGroup} className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md text-sm"><PlusCircleIcon className="w-4 h-4" /> Crear Grupo</button>
                    </div>
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        {interventionGroups.map(group => (
                            <div key={group.id} className="bg-zinc-900/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <input value={group.name} onChange={e => handleGroupChange(group.id, 'name', e.target.value)} className="text-lg font-bold bg-transparent text-white border-b-2 border-zinc-700 focus:border-blue-500 outline-none w-1/2"/>
                                    <button onClick={() => handleDeleteGroup(group.id)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="mb-3">
                                    <label className="text-sm text-zinc-400">Oficial a Cargo:</label>
                                    <input value={group.officerInCharge} onChange={e => handleGroupChange(group.id, 'officerInCharge', e.target.value)} className="w-full bg-zinc-700 rounded p-1 mt-1 text-white" list="personnel-list"/>
                                    <datalist id="personnel-list">
                                        {allPersonnel.map(p => <option key={p.id} value={p.name} />)}
                                    </datalist>
                                </div>
                                
                                <h5 className="font-semibold text-white mt-4 mb-2">Unidades Asignadas ({group.units.length})</h5>
                                {group.units.map(unit => (
                                    <div key={unit.id} className="bg-zinc-800 p-3 rounded-md mb-2 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="font-mono font-bold text-zinc-200">{unit.id}</p>
                                            <button onClick={() => handleUnassignUnit(unit.id, group.id)} className="text-zinc-400 hover:text-yellow-400"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <input value={unit.task} onChange={e => handleUnitDetailChange(group.id, unit.id, 'task', e.target.value)} placeholder="Tarea asignada" className="bg-zinc-700 rounded p-1 text-white"/>
                                            <input value={unit.locationInScene} onChange={e => handleUnitDetailChange(group.id, unit.id, 'locationInScene', e.target.value)} placeholder="Ubicación" className="bg-zinc-700 rounded p-1 text-white"/>
                                            <input value={unit.workTime} onChange={e => handleUnitDetailChange(group.id, unit.id, 'workTime', e.target.value)} placeholder="Tiempo de Trabajo" className="bg-zinc-700 rounded p-1 text-white"/>
                                            <input value={unit.departureTime} onChange={e => handleUnitDetailChange(group.id, unit.id, 'departureTime', e.target.value)} placeholder="H. Salida" className="bg-zinc-700 rounded p-1 text-white"/>
                                            <input value={unit.onSceneTime} onChange={e => handleUnitDetailChange(group.id, unit.id, 'onSceneTime', e.target.value)} placeholder="H. Lugar" className="bg-zinc-700 rounded p-1 text-white"/>
                                            <input value={unit.returnTime} onChange={e => handleUnitDetailChange(group.id, unit.id, 'returnTime', e.target.value)} placeholder="H. Regreso" className="bg-zinc-700 rounded p-1 text-white"/>
                                        </div>
                                    </div>
                                ))}

                                <h5 className="font-semibold text-white mt-4 mb-2">Personal Asignado ({group.personnel.length})</h5>
                                <ul className="space-y-1 text-sm">
                                    {group.personnel.map(person => (
                                        <li key={person.id} className="flex justify-between items-center bg-zinc-800 p-2 rounded-md">
                                            <span className="text-zinc-300">{person.name}</span>
                                            <button onClick={() => handleUnassignPersonnel(person.id, group.id)} className="text-zinc-400 hover:text-yellow-400"><TrashIcon className="w-4 h-4"/></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPostView;