import React, { useState, useMemo } from 'react';
import CommandPostSummaryView from './CommandPostSummaryView.js';
import TacticalCommandPostView from './TacticalCommandPostView.js';

const CommandPostParentView = ({ unitReportData, commandPersonnel, servicePersonnel }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [interventionGroups, setInterventionGroups] = useState([]);
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

    const handleCreateGroup = () => {
        const newGroup = {
            id: `group-${Date.now()}`,
            name: `Nuevo Grupo ${interventionGroups.length + 1}`,
            officerInCharge: '',
            units: [],
            personnel: [],
        };
        setInterventionGroups(prev => [...prev, newGroup]);
    };

    const handleDeleteGroup = (groupId) => {
        setInterventionGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const handleGroupChange = (groupId, field, value) => {
        setInterventionGroups(prev => prev.map(g => g.id === groupId ? { ...g, [field]: value } : g));
    };
    
    const handleAssignUnit = (unit, groupId) => {
        const newTrackedUnit = {
            ...unit,
            groupName: interventionGroups.find(g => g.id === groupId)?.name || '',
            task: '', locationInScene: '', workTime: '', departureTime: '', onSceneTime: '', returnTime: ''
        };
        
        const unitPersonnel = allPersonnel.filter(p => p.station === unit.station);
        const uniquePersonnel = unitPersonnel.filter(p => !interventionGroups.some(g => g.personnel.some(assignedP => assignedP.id === p.id)));

        setInterventionGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                 const newTrackedPersonnel = uniquePersonnel.map(p => ({
                    ...p,
                    groupName: g.name
                }));
                return { 
                    ...g, 
                    units: [...g.units, newTrackedUnit],
                    personnel: [...g.personnel, ...newTrackedPersonnel]
                };
            }
            return g;
        }));
    };
    
    const handleAssignPersonnel = (person, groupId) => {
        const newTrackedPersonnel = {
            ...person,
            groupName: interventionGroups.find(g => g.id === groupId)?.name || ''
        };
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, personnel: [...g.personnel, newTrackedPersonnel] } : g
        ));
    };

    const handleUnassignUnit = (unitId, groupId) => {
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, units: g.units.filter(u => u.id !== unitId) } : g
        ));
    };

    const handleUnassignPersonnel = (personnelId, groupId) => {
        setInterventionGroups(prev => prev.map(g => 
            g.id === groupId ? { ...g, personnel: g.personnel.filter(p => p.id !== personnelId) } : g
        ));
    };

    const handleUnitDetailChange = (groupId, unitId, field, value) => {
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

    const TabButton = ({ tabId, children }) => (
        React.createElement("button", {
            onClick: () => setActiveTab(tabId),
            className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-zinc-800/60 text-white' : 'bg-zinc-900/50 hover:bg-zinc-700/80 text-zinc-400'}`
        },
        children)
    );

    return (
        React.createElement("div", null,
            React.createElement("div", { className: "flex border-b border-zinc-700" },
                React.createElement(TabButton, { tabId: "summary" }, "Resumen"),
                React.createElement(TabButton, { tabId: "tactical" }, "Comando Táctico")
            ),
            React.createElement("div", { className: "pt-6" },
                activeTab === 'summary' && 
                    React.createElement(CommandPostSummaryView, { 
                        availableUnits: availableUnits,
                        availablePersonnel: availablePersonnel,
                        interventionGroups: interventionGroups
                    }),
                activeTab === 'tactical' && 
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
            )
        )
    );
};

export default CommandPostParentView;