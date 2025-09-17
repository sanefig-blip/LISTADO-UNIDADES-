import React, { useState, useMemo } from 'react';
import CommandPostSummaryView from './CommandPostSummaryView.js';
import TacticalCommandPostView from './CommandPostView.js';
import SciFormsView from './SciFormsView.js';
import { PlusCircleIcon } from './icons.js';

const CommandPostParentView = (props) => {
    const { unitReportData, commandPersonnel, servicePersonnel, unitList, currentUser, interventionGroups, onUpdateInterventionGroups } = props;
    const [activeTab, setActiveTab] = useState('summary');
    const [incidentDetails, setIncidentDetails] = useState({ type: '', address: '', alarmTime: '' });

    const allUnits = useMemo(() => {
        return unitReportData.zones.flatMap(zone => 
            zone.groups.flatMap(group => 
                group.units.map(unit => ({ ...unit, station: group.name }))
            )
        );
    }, [unitReportData]);

    const allPersonnel = useMemo(() => {
        const personnelMap = new Map();
        
        const processOfficerList = (officerList, station) => {
            (officerList || []).forEach(officerString => {
                const parts = officerString.split(' ');
                if (parts.length > 1) {
                    const name = parts.slice(1).join(' ');
                    const rank = parts[0];
                     if (!personnelMap.has(name)) { // Avoid duplicates
                        personnelMap.set(name, {
                            id: `p-${name.replace(/\s/g, '')}`, name, rank, station
                        });
                    }
                }
            });
        };

        unitReportData.zones.forEach(zone => {
            zone.groups.forEach(group => {
                processOfficerList(group.crewOfficers, group.name);
                processOfficerList(group.standbyOfficers, group.name);
                processOfficerList(group.servicesOfficers, group.name);
            });
        });
        
        [...commandPersonnel, ...servicePersonnel].forEach(p => {
             if (!personnelMap.has(p.name)) {
                personnelMap.set(p.name, p);
            }
        });

        return Array.from(personnelMap.values());
    }, [unitReportData, commandPersonnel, servicePersonnel]);


    const { availableUnits, availablePersonnel } = useMemo(() => {
        const assignedUnitIds = new Set(interventionGroups.flatMap(g => g.units.map(u => u.id)));
        const assignedPersonnelIds = new Set(interventionGroups.flatMap(g => g.personnel.map(p => p.id)));
        
        return {
            availableUnits: allUnits.filter(u => !assignedUnitIds.has(u.id)),
            availablePersonnel: allPersonnel.filter(p => !assignedPersonnelIds.has(p.id))
        };
    }, [interventionGroups, allUnits, allPersonnel]);

    const handleCreateGroup = (type) => {
        const newGroup = {
            id: `group-${Date.now()}`,
            type: type,
            name: type === 'Frente' 
                ? `Nuevo Frente ${interventionGroups.filter(g => g.type === 'Frente').length + 1}` 
                : `Nueva U.O. ${interventionGroups.filter(g => g.type === 'Unidad Operativa').length + 1}`,
            officerInCharge: '',
            units: [],
            personnel: [],
        };
        onUpdateInterventionGroups([...interventionGroups, newGroup]);
    };

    const handleDeleteGroup = (groupId) => {
        onUpdateInterventionGroups(interventionGroups.filter(g => g.id !== groupId));
    };

    const handleGroupChange = (groupId, field, value) => {
        onUpdateInterventionGroups(interventionGroups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
    };
    
    const handleAssignUnit = (unit, groupId) => {
        const newGroups = interventionGroups.map(g => {
            if (g.id === groupId) {
                const newTrackedUnit = {
                    groupName: g.name || '',
                    task: '',
                    locationInScene: '',
                    workTime: '',
                    departureTime: '',
                    onSceneTime: '',
                    returnTime: ''
                };
                const newUnitToAdd = { ...unit, ...newTrackedUnit };
                return {
                    ...g,
                    units: [...g.units, newUnitToAdd]
                };
            }
            return g;
        });
        onUpdateInterventionGroups(newGroups);
    };
    
    const handleAssignPersonnel = (person, groupId) => {
        const newGroups = interventionGroups.map(g => {
            if (g.id === groupId) {
                // FIX: Refactor for consistency with TS fix.
                const newPersonnelToAdd = { 
                    ...person, 
                    groupName: g.name || ''
                };
                return {
                    ...g,
                    personnel: [...g.personnel, newPersonnelToAdd]
                };
            }
            return g;
        });
        onUpdateInterventionGroups(newGroups);
    };

    const handleUnassignUnit = (unitId, groupId) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, units: g.units.filter(u => u.id !== unitId) } : g
        ));
    };

    const handleUnassignPersonnel = (personnelId, groupId) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, personnel: g.personnel.filter(p => p.id !== personnelId) } : g
        ));
    };

    const handleUnitDetailChange = (groupId, unitId, field, value) => {
        onUpdateInterventionGroups(interventionGroups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    units: group.units.map(unit => unit.id === unitId ? { ...unit, [field]: value } : unit)
                };
            }
            return group;
        }));
    };

    const TabButton = ({ tabId, children }) => (
        React.createElement("button", {
            onClick: () => setActiveTab(tabId),
            className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-zinc-800/60 text-white' : 'bg-zinc-900/50 hover:bg-zinc-700/80 text-zinc-400'}`
        },
        children)
    );

    const showSciForms = currentUser.role === 'admin' || currentUser.username === 'Puesto Comando';

    return (
        React.createElement("div", null,
            React.createElement("div", { className: "flex border-b border-zinc-700" },
                React.createElement(TabButton, { tabId: "summary" }, "Resumen"),
                React.createElement(TabButton, { tabId: "tactical" }, "Comando Táctico"),
                showSciForms && React.createElement(TabButton, { tabId: "sci-forms" }, "Formularios SCI")
            ),
            React.createElement("div", { className: "pt-6" },
                activeTab === 'summary' && 
                    React.createElement(CommandPostSummaryView, { 
                        availableUnits: availableUnits,
                        availablePersonnel: availablePersonnel,
                        interventionGroups: interventionGroups
                    }),
                activeTab === 'tactical' && 
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex items-center gap-4" },
                            React.createElement("h3", { className: "text-lg font-semibold text-white" }, "Gestionar Grupos de Trabajo:"),
                            React.createElement("button", { onClick: () => handleCreateGroup('Frente'), className: "flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold text-sm transition-colors" },
                                React.createElement(PlusCircleIcon, { className: "w-5 h-5" }),
                                "Crear Frente"
                            ),
                            React.createElement("button", { onClick: () => handleCreateGroup('Unidad Operativa'), className: "flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold text-sm transition-colors" },
                                React.createElement(PlusCircleIcon, { className: "w-5 h-5" }),
                                "Crear Unidad Operativa"
                            )
                        ),
                        React.createElement(TacticalCommandPostView, { 
                            interventionGroups: interventionGroups,
                            availableUnits: availableUnits,
                            availablePersonnel: availablePersonnel,
                            allPersonnel: allPersonnel,
                            onGroupChange: handleGroupChange,
                            onDeleteGroup: handleDeleteGroup,
                            onAssignUnit: handleAssignUnit,
                            onAssignPersonnel: handleAssignPersonnel,
                            onUnassignUnit: handleUnassignUnit,
                            onUnassignPersonnel: handleUnassignPersonnel,
                            onUnitDetailChange: handleUnitDetailChange
                        })
                    ),
                activeTab === 'sci-forms' && showSciForms &&
                    React.createElement(SciFormsView, {
                        personnel: [...commandPersonnel, ...servicePersonnel],
                        unitList: unitList
                    })
            )
        )
    );
};

export default CommandPostParentView;
