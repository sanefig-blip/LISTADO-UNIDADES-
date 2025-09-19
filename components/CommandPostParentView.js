import React, { useState, useMemo, useRef } from 'react';
import CommandPostSummaryView from './CommandPostSummaryView.js';
import TacticalCommandPostView from './CommandPostView.js';
import Croquis from './Croquis.js';
import SciFormsView from './SciFormsView.js';
import { PlusCircleIcon } from './icons.js';
import { exportFullCommandPostReportToPdf } from '../services/exportService.js';

const CommandPostParentView = (props) => {
    const { unitReportData, commandPersonnel, servicePersonnel, unitList, currentUser, interventionGroups, onUpdateInterventionGroups } = props;
    const [activeTab, setActiveTab] = useState('summary');
    const croquisRef = useRef(null);


    const { allUnits, allPersonnel } = useMemo(() => {
        const units = unitReportData.zones.flatMap(zone => 
            zone.groups.flatMap(group => 
                group.units.map(unit => ({ ...unit, station: group.name }))
            )
        );

        const personnelMap = new Map();
        
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

    const handleCreateGroup = (type) => {
        const newGroup = {
            id: `group-${Date.now()}`, type,
            name: type === 'Frente' 
                ? `Nuevo Frente ${interventionGroups.filter(g => g.type === 'Frente').length + 1}` 
                : `Nueva U.O. ${interventionGroups.filter(g => g.type === 'Unidad Operativa').length + 1}`,
            officerInCharge: '', units: [], personnel: [],
        };
        onUpdateInterventionGroups([...interventionGroups, newGroup]);
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm("¿Está seguro? Los recursos asignados volverán a estar disponibles.")) {
            onUpdateInterventionGroups(interventionGroups.filter(g => g.id !== groupId));
        }
    };

    const handleGroupChange = (groupId, field, value) => {
        onUpdateInterventionGroups(interventionGroups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
    };
    
    const handleAssignUnit = (unit, groupId) => {
        const newGroups = interventionGroups.map(g => {
            if (g.id === groupId) {
                const newTrackedUnit = {
                    ...unit,
                    groupName: g.name || '',
                    task: '',
                    locationInScene: '',
                    workTime: '',
                    departureTime: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                    onSceneTime: '',
                    returnTime: '',
                    mapLabel: unit.id, // Default label
                    mapColor: '#ef4444', // Default color (red-500)
                };
                return { ...g, units: [...g.units, newTrackedUnit] };
            }
            return g;
        });
        onUpdateInterventionGroups(newGroups);
    };
    
    const handleAssignPersonnel = (person, groupId) => {
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, personnel: [...g.personnel, { ...person, groupName: g.name || '' }] } : g
        ));
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
        onUpdateInterventionGroups(interventionGroups.map(g => 
            g.id === groupId ? { ...g, units: g.units.map(u => u.id === unitId ? { ...u, [field]: value } : u) } : g
        ));
    };

    const handleExportFullReport = async () => {
        const croquisImage = await croquisRef.current?.capture();
        
        const sci201Data = JSON.parse(localStorage.getItem('sci201Data') || '{}');
        const sci211Data = JSON.parse(localStorage.getItem('sci211Data') || '[]');
        const sci207Data = JSON.parse(localStorage.getItem('sci207Data') || '[]');
        
        exportFullCommandPostReportToPdf({
            availableUnits,
            availablePersonnel,
            interventionGroups,
            croquisImage,
            sciData: {
                sci201: sci201Data,
                sci211: sci211Data,
                sci207: sci207Data
            }
        });
    };
    
    const TabButton = ({ tabId, children }) => (
        React.createElement("button", {
            onClick: () => setActiveTab(tabId),
            className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-zinc-800/60 text-white' : 'bg-zinc-900/50 hover:bg-zinc-700/80 text-zinc-400'}`
        }, children)
    );

    return (
        React.createElement("div", null,
            React.createElement("div", { className: "flex border-b border-zinc-700" },
                React.createElement(TabButton, { tabId: "summary" }, "Resumen"),
                React.createElement(TabButton, { tabId: "tactical" }, "Comando Táctico"),
                React.createElement(TabButton, { tabId: "croquis" }, "Croquis de Situación"),
                React.createElement(TabButton, { tabId: "sci" }, "Formularios SCI")
            ),
            React.createElement("div", { className: "pt-6" },
                activeTab === 'summary' && 
                    React.createElement(CommandPostSummaryView, { 
                        availableUnits: availableUnits,
                        availablePersonnel: availablePersonnel,
                        interventionGroups: interventionGroups,
                        onExportFullReport: handleExportFullReport
                    }),
                activeTab === 'tactical' && 
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex items-center gap-4" },
                            React.createElement("h3", { className: "text-lg font-semibold text-white" }, "Gestionar Grupos de Trabajo:"),
                            React.createElement("button", { onClick: () => handleCreateGroup('Frente'), className: "flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold text-sm transition-colors" },
                                React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Crear Frente"
                            ),
                            React.createElement("button", { onClick: () => handleCreateGroup('Unidad Operativa'), className: "flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold text-sm transition-colors" },
                                React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Crear Unidad Operativa"
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
                activeTab === 'croquis' && React.createElement(Croquis, { 
                    ref: croquisRef,
                    isActive: true, 
                    onSketchCapture: () => {}, 
                    onUnlockSketch: () => {}, 
                    storageKey: "commandPostSketch",
                    interventionGroups: interventionGroups,
                    onUpdateInterventionGroups: onUpdateInterventionGroups
                }),
                activeTab === 'sci' && React.createElement(SciFormsView, { personnel: allPersonnel, unitList: unitList })
            )
        )
    );
};

export default CommandPostParentView;