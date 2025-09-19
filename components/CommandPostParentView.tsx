import React, { useState, useMemo } from 'react';
import { UnitReportData, Personnel, FireUnit, InterventionGroup, TrackedUnit, TrackedPersonnel, User } from '../types';
import CommandPostSummaryView from './CommandPostSummaryView';
import TacticalCommandPostView from './CommandPostView';
import { PlusCircleIcon } from './icons';

interface CommandPostParentViewProps {
    unitReportData: UnitReportData;
    commandPersonnel: Personnel[];
    servicePersonnel: Personnel[];
    unitList: string[];
    currentUser: User;
    interventionGroups: InterventionGroup[];
    onUpdateInterventionGroups: (groups: InterventionGroup[]) => void;
}

const CommandPostParentView: React.FC<CommandPostParentViewProps> = (props) => {
    const { unitReportData, commandPersonnel, servicePersonnel, currentUser, interventionGroups, onUpdateInterventionGroups } = props;
    const [activeTab, setActiveTab] = useState<'summary' | 'tactical'>('summary');

    const { allUnits, allPersonnel } = useMemo(() => {
        const units = unitReportData.zones.flatMap(zone => 
            zone.groups.flatMap(group => 
                group.units.map(unit => ({ ...unit, station: group.name }))
            )
        );

        const personnelMap = new Map<string, Personnel>();
        
        [...commandPersonnel, ...servicePersonnel].forEach(p => {
             if (!personnelMap.has(p.name)) {
                personnelMap.set(p.name, p);
            }
        });

        return { allUnits: units, allPersonnel: Array.from(personnelMap.values()) };
    }, [unitReportData, commandPersonnel, servicePersonnel]);

    const { availableUnits, availablePersonnel } = useMemo(() => {
        const assignedUnitIds = new Set(interventionGroups.flatMap(g => g.units.map(u => u.id)));
        const assignedPersonnelIds = new Set(interventionGroups.flatMap(g => g.personnel.map(p => p.id)));
        
        const availableU = allUnits.filter(u => !assignedUnitIds.has(u.id) && u.status.toLowerCase().includes('para servicio'));
        const availableP = allPersonnel.filter(p => !assignedPersonnelIds.has(p.id));

        return { 
            availableUnits: availableU, 
            availablePersonnel: availableP,
        };
    }, [interventionGroups, allUnits, allPersonnel]);

    const handleCreateGroup = (type: 'Frente' | 'Unidad Operativa') => {
        const newGroup: InterventionGroup = {
            id: `group-${Date.now()}`, type,
            name: type === 'Frente' 
                ? `Nuevo Frente ${interventionGroups.filter(g => g.type === 'Frente').length + 1}` 
                : `Nueva U.O. ${interventionGroups.filter(g => g.type === 'Unidad Operativa').length + 1}`,
            officerInCharge: '', units: [], personnel: [],
        };
        onUpdateInterventionGroups([...interventionGroups, newGroup]);
    };

    const handleDeleteGroup = (groupId: string) => {
        if (window.confirm("¿Está seguro? Los recursos asignados volverán a estar disponibles.")) {
            onUpdateInterventionGroups(interventionGroups.filter(g => g.id !== groupId));
        }
    };

    const handleGroupChange = (groupId: string, field: 'name' | 'officerInCharge', value: string) => {
        onUpdateInterventionGroups(interventionGroups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
    };
    
    const handleAssignUnit = (unit: FireUnit, groupId: string) => {
        const newGroups = interventionGroups.map(g => {
            if (g.id === groupId) {
                const newTrackedUnit: TrackedUnit = {
                    ...unit, groupName: g.name || '', task: '', locationInScene: '', workTime: '',
                    departureTime: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), 
                    onSceneTime: '', returnTime: ''
                };
                return { ...g, units: [...g.units, newTrackedUnit] };
            }
            return g;
        });
        onUpdateInterventionGroups(newGroups);
    };
    
    const handleAssignPersonnel = (person: Personnel, groupId: string) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, personnel: [...g.personnel, { ...person, groupName: g.name || '' }] } : g
        ));
    };

    const handleUnassignUnit = (unitId: string, groupId: string) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, units: g.units.filter(u => u.id !== unitId) } : g
        ));
    };

    const handleUnassignPersonnel = (personnelId: string, groupId: string) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, personnel: g.personnel.filter(p => p.id !== personnelId) } : g
        ));
    };

    const handleUnitDetailChange = (groupId: string, unitId: string, field: keyof Omit<TrackedUnit, 'id' | 'type' | 'status' | 'groupName'>, value: string) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, units: g.units.map(u => u.id === unitId ? { ...u, [field]: value } : u) } : g
        ));
    };

    const TabButton: React.FC<{ tabId: 'summary' | 'tactical'; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-zinc-800/60 text-white' : 'bg-zinc-900/50 hover:bg-zinc-700/80 text-zinc-400'}`}
        >{children}</button>
    );

    return (
        <div>
            <div className="flex border-b border-zinc-700">
                <TabButton tabId="summary">Resumen</TabButton>
                <TabButton tabId="tactical">Comando Táctico</TabButton>
            </div>
            <div className="pt-6">
                {activeTab === 'summary' && 
                    <CommandPostSummaryView 
                        availableUnits={availableUnits}
                        availablePersonnel={availablePersonnel}
                        interventionGroups={interventionGroups}
                    />
                }
                {activeTab === 'tactical' && 
                    <div className="space-y-6">
                        <div className="bg-zinc-800/60 p-4 rounded-xl flex items-center gap-4">
                            <h3 className="text-lg font-semibold text-white">Gestionar Grupos de Trabajo:</h3>
                            <button onClick={() => handleCreateGroup('Frente')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold text-sm transition-colors">
                                <PlusCircleIcon className="w-5 h-5" /> Crear Frente
                            </button>
                            <button onClick={() => handleCreateGroup('Unidad Operativa')} className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold text-sm transition-colors">
                                <PlusCircleIcon className="w-5 h-5" /> Crear Unidad Operativa
                            </button>
                        </div>
                        <TacticalCommandPostView 
                            interventionGroups={interventionGroups}
                            availableUnits={availableUnits}
                            availablePersonnel={availablePersonnel}
                            allPersonnel={allPersonnel}
                            onGroupChange={handleGroupChange}
                            onDeleteGroup={handleDeleteGroup}
                            onAssignUnit={handleAssignUnit}
                            onAssignPersonnel={handleAssignPersonnel}
                            onUnassignUnit={handleUnassignUnit}
                            onUnassignPersonnel={handleUnassignPersonnel}
                            onUnitDetailChange={handleUnitDetailChange}
                        />
                    </div>
                }
            </div>
        </div>
    );
};

export default CommandPostParentView;