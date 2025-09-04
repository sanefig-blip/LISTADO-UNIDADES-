import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DownloadIcon, PlusCircleIcon, TrashIcon } from './icons.js';
import { exportCommandPostToPdf } from '../services/exportService.js';
import Croquis from './Croquis.js';

const FormInput = ({ label, name, value, onChange }) => (
    React.createElement("div", null,
        React.createElement("label", { htmlFor: name, className: "block text-sm font-medium text-zinc-400" }, label),
        React.createElement("input", { type: "text", id: name, name: name, value: value, onChange: onChange, className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"})
    )
);

const FormTextarea = ({ label, name, value, onChange, rows=2 }) => (
     React.createElement("div", null,
        React.createElement("label", { htmlFor: name, className: "block text-sm font-medium text-zinc-400" }, label),
        React.createElement("textarea", { id: name, name: name, value: value, onChange: onChange, rows: rows, className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"})
    )
);

const TabButton = ({ activeTab, tabName, label, onClick }) => (
    React.createElement("button", {
        onClick: () => onClick(tabName),
        className: `px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`
    },
        label
    )
);

const CommandPostView = ({ unitReportData }) => {
    const [activeTab, setActiveTab] = useState('control');
    const croquisRef = useRef(null);

    const allUnitsForTracking = useMemo(() => {
        if (!unitReportData) return [];
        return unitReportData.zones.flatMap(zone => 
            zone.groups.flatMap(group => 
                group.units.map(unit => ({
                    ...unit,
                    groupName: group.name,
                    dispatched: false,
                    departureTime: '',
                    onSceneTime: '',
                    returnTime: '',
                    notes: ''
                }))
            )
        );
    }, [unitReportData]);
    const [trackedUnits, setTrackedUnits] = useState(allUnitsForTracking);

    useEffect(() => {
        setTrackedUnits(allUnitsForTracking);
    }, [allUnitsForTracking]);

    const allPersonnelForTracking = useMemo(() => {
        if (!unitReportData) return [];
        const personnelMap = new Map();
        
        unitReportData.zones.forEach(zone => {
            zone.groups.forEach(group => {
                (group.crewOfficers || []).forEach(officerName => {
                    if (!personnelMap.has(officerName)) {
                        personnelMap.set(officerName, { id: officerName, name: officerName, type: 'Dotación', groupName: group.name, onScene: false, notes: '' });
                    }
                });
                (group.standbyOfficers || []).forEach(officerName => {
                    if (!personnelMap.has(officerName)) {
                        personnelMap.set(officerName, { id: officerName, name: officerName, type: 'Apresto', groupName: group.name, onScene: false, notes: '' });
                    }
                });
            });
        });
        return Array.from(personnelMap.values());
    }, [unitReportData]);
    const [trackedPersonnel, setTrackedPersonnel] = useState(allPersonnelForTracking);
    useEffect(() => {
        setTrackedPersonnel(allPersonnelForTracking);
    }, [allPersonnelForTracking]);

    const [incidentDetails, setIncidentDetails] = useState({ type: '', address: '', district: '', alarmTime: '', chiefOnScene: '', incidentCommander: '' });
    const [sci201Data, setSci201Data] = useState({
        incidentName: '', prepDateTime: '', incidentLocation: '', evalNature: '', evalThreats: '',
        evalAffectedArea: '', evalIsolation: '', initialObjectives: '', strategies: '', tactics: '',
        pcLocation: '', eLocation: '', ingressRoute: '', egressRoute: '', safetyMessage: '',
        incidentCommander: '', mapOrSketch: '', orgChart: '', actions: [{id: 1, time: '', summary: ''}]
    });
    const [sci211Resources, setSci211Resources] = useState([{
        id: 1, requestedBy: '', requestDateTime: '', classType: '', resourceType: '', arrivalDateTime: '',
        institution: '', matricula: '', personnelCount: '', status: 'Disponible', assignedTo: '',
        demobilizedBy: '', demobilizedDateTime: '', observations: ''
    }]);
    const [sci207Victims, setSci207Victims] = useState([{
        id: 1, patientName: '', sex: '', age: '', triage: '', transportLocation: '',
        transportedBy: '', transportDateTime: ''
    }]);

    const handleIncidentDetailChange = (e) => {
        const { name, value } = e.target;
        setIncidentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleUnitTrackChange = (unitId, field, value) => {
        setTrackedUnits(prev => prev.map(u => u.id === unitId ? { ...u, [field]: value } : u));
    };
    
    const handlePersonnelTrackChange = (personnelId, field, value) => {
        setTrackedPersonnel(prev => prev.map(p => p.id === personnelId ? { ...p, [field]: value } : p));
    };

    const handleSci201Change = (e) => {
        const { name, value } = e.target;
        setSci201Data(prev => ({...prev, [name]: value}));
    };

    const handleSci201ActionChange = (id, field, value) => {
        setSci201Data(prev => ({
            ...prev,
            actions: prev.actions.map(a => a.id === id ? {...a, [field]: value} : a)
        }));
    };

    const addSci201Action = () => {
        setSci201Data(prev => ({
            ...prev,
            actions: [...prev.actions, {id: Date.now(), time: '', summary: ''}]
        }));
    };

    const removeSci201Action = (id) => {
        setSci201Data(prev => ({
            ...prev,
            actions: prev.actions.filter(a => a.id !== id)
        }));
    };
    
    const handleSci211Change = (id, field, value) => {
        setSci211Resources(prev => prev.map(r => r.id === id ? {...r, [field]: value} : r));
    };

    const addSci211Resource = () => {
        setSci211Resources(prev => [...prev, {
            id: Date.now(), requestedBy: '', requestDateTime: '', classType: '', resourceType: '', arrivalDateTime: '',
            institution: '', matricula: '', personnelCount: '', status: 'Disponible', assignedTo: '',
            demobilizedBy: '', demobilizedDateTime: '', observations: ''
        }]);
    };

    const removeSci211Resource = (id) => {
        setSci211Resources(prev => prev.filter(r => r.id !== id));
    };
    
    const handleSci207Change = (id, field, value) => {
        setSci207Victims(prev => prev.map(v => v.id === id ? {...v, [field]: value} : v));
    };

    const addSci207Victim = () => {
        setSci207Victims(prev => [...prev, {
            id: Date.now(), patientName: '', sex: '', age: '', triage: '', transportLocation: '',
            transportedBy: '', transportDateTime: ''
        }]);
    };

    const removeSci207Victim = (id) => {
        setSci207Victims(prev => prev.filter(v => v.id !== id));
    };
    
    const triageColors = {
        'Rojo': 'bg-red-600 text-white',
        'Amarillo': 'bg-yellow-500 text-black',
        'Verde': 'bg-green-600 text-white',
        'Negro': 'bg-black text-white',
        '': 'bg-zinc-600 text-white'
    };

    const handleExport = async () => {
        const croquisSketch = await croquisRef.current?.getCenteredSketch();
        exportCommandPostToPdf(
            incidentDetails,
            trackedUnits,
            trackedPersonnel,
            sci201Data,
            sci211Resources,
            sci207Victims,
            croquisSketch
        );
    };

    return (
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "bg-zinc-800/60 p-2 rounded-xl flex items-center justify-between" },
                React.createElement("div", { className: "flex flex-wrap gap-2" },
                    React.createElement(TabButton, { activeTab: activeTab, tabName: "control", label: "Control General", onClick: setActiveTab }),
                    React.createElement(TabButton, { activeTab: activeTab, tabName: "croquis", label: "Croquis Táctico", onClick: setActiveTab }),
                    React.createElement(TabButton, { activeTab: activeTab, tabName: "sci201", label: "Formulario SCI-201 (Resumen)", onClick: setActiveTab }),
                    React.createElement(TabButton, { activeTab: activeTab, tabName: "sci211", label: "Formulario SCI-211 (Recursos)", onClick: setActiveTab }),
                    React.createElement(TabButton, { activeTab: activeTab, tabName: "sci207", label: "Formulario SCI-207 (Víctimas)", onClick: setActiveTab })
                ),
                 React.createElement("button", { onClick: handleExport, className: "flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold" },
                    React.createElement(DownloadIcon, { className: "w-5 h-5" }),
                    "Exportar Reporte PDF"
                )
            ),

            activeTab === 'control' && (
                React.createElement("div", { className: "space-y-6 animate-fade-in" },
                    React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl space-y-4" },
                        React.createElement("h3", { className: "text-xl font-semibold text-yellow-300" }, "Datos Generales del Siniestro"),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
                            React.createElement(FormInput, { label: "Tipo de Siniestro", name: "type", value: incidentDetails.type, onChange: handleIncidentDetailChange }),
                            React.createElement(FormInput, { label: "Dirección", name: "address", value: incidentDetails.address, onChange: handleIncidentDetailChange }),
                            React.createElement(FormInput, { label: "Comuna", name: "district", value: incidentDetails.district, onChange: handleIncidentDetailChange }),
                            React.createElement(FormInput, { label: "Fecha y Hora de Alarma", name: "alarmTime", value: incidentDetails.alarmTime, onChange: handleIncidentDetailChange })
                        ),
                         React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement(FormInput, { label: "Jefe del Cuerpo en el Lugar", name: "chiefOnScene", value: incidentDetails.chiefOnScene, onChange: handleIncidentDetailChange }),
                            React.createElement(FormInput, { label: "Jefe de la Emergencia", name: "incidentCommander", value: incidentDetails.incidentCommander, onChange: handleIncidentDetailChange })
                        )
                    ),
                    React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl" },
                         React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4" }, "Unidades en la Intervención"),
                         React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement("table", { className: "w-full text-left min-w-[1000px]" },
                                React.createElement("thead", null,
                                    React.createElement("tr", { className: "text-sm text-zinc-400" },
                                        React.createElement("th", { className: "p-2 w-12" }, "Desp."),
                                        React.createElement("th", { className: "p-2" }, "Unidad"),
                                        React.createElement("th", { className: "p-2" }, "A Cargo"),
                                        React.createElement("th", { className: "p-2" }, "Dotación"),
                                        React.createElement("th", { className: "p-2 w-28" }, "H. Salida"),
                                        React.createElement("th", { className: "p-2 w-28" }, "H. Lugar"),
                                        React.createElement("th", { className: "p-2 w-28" }, "H. Regreso"),
                                        React.createElement("th", { className: "p-2" }, "Novedades")
                                    )
                                ),
                                React.createElement("tbody", null,
                                    trackedUnits.map(unit => (
                                        React.createElement("tr", { key: unit.id, className: "border-t border-zinc-700/50 hover:bg-zinc-700/30" },
                                            React.createElement("td", { className: "p-2 align-middle text-center" },
                                                React.createElement("input", { type: "checkbox", checked: unit.dispatched, onChange: e => handleUnitTrackChange(unit.id, 'dispatched', e.target.checked), className: "h-5 w-5 bg-zinc-700 border-zinc-600 rounded text-blue-500 focus:ring-blue-500" })
                                            ),
                                            React.createElement("td", { className: "p-2 align-middle" }, React.createElement("div", {className: "font-mono text-zinc-200"}, unit.id), React.createElement("div", {className: "text-xs text-zinc-500"}, unit.groupName)),
                                            React.createElement("td", { className: "p-2 align-middle text-zinc-300 text-sm" }, unit.officerInCharge || '-'),
                                            React.createElement("td", { className: "p-2 align-middle text-center font-semibold text-white" }, unit.personnelCount),
                                            React.createElement("td", null, React.createElement("input", { type: "text", value: unit.departureTime, onChange: e => handleUnitTrackChange(unit.id, 'departureTime', e.target.value), className: "w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"})),
                                            React.createElement("td", null, React.createElement("input", { type: "text", value: unit.onSceneTime, onChange: e => handleUnitTrackChange(unit.id, 'onSceneTime', e.target.value), className: "w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"})),
                                            React.createElement("td", null, React.createElement("input", { type: "text", value: unit.returnTime, onChange: e => handleUnitTrackChange(unit.id, 'returnTime', e.target.value), className: "w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"})),
                                            React.createElement("td", null, React.createElement("input", { type: "text", value: unit.notes, onChange: e => handleUnitTrackChange(unit.id, 'notes', e.target.value), className: "w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"}))
                                        )
                                    ))
                                )
                            )
                         )
                    ),

                    React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl" },
                         React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4" }, "Personal Clave en la Intervención"),
                         React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement("table", { className: "w-full text-left min-w-[800px]" },
                                React.createElement("thead", null,
                                    React.createElement("tr", { className: "text-sm text-zinc-400" },
                                        React.createElement("th", { className: "p-2 w-12" }, "Lugar"),
                                        React.createElement("th", { className: "p-2" }, "Nombre"),
                                        React.createElement("th", { className: "p-2" }, "Tipo"),
                                        React.createElement("th", { className: "p-2" }, "Estación"),
                                        React.createElement("th", { className: "p-2" }, "Novedades")
                                    )
                                ),
                                React.createElement("tbody", null,
                                    trackedPersonnel.map(person => (
                                        React.createElement("tr", { key: person.id, className: "border-t border-zinc-700/50 hover:bg-zinc-700/30" },
                                            React.createElement("td", { className: "p-2 align-middle text-center" }, React.createElement("input", { type: "checkbox", checked: person.onScene, onChange: e => handlePersonnelTrackChange(person.id, 'onScene', e.target.checked), className: "h-5 w-5 bg-zinc-700 border-zinc-600 rounded text-blue-500 focus:ring-blue-500" })),
                                            React.createElement("td", { className: "p-2 align-middle text-zinc-200" }, person.name),
                                            React.createElement("td", { className: "p-2 align-middle text-zinc-300" }, person.type),
                                            React.createElement("td", { className: "p-2 align-middle text-zinc-400 text-sm" }, person.groupName),
                                            React.createElement("td", null, React.createElement("input", { type: "text", value: person.notes, onChange: e => handlePersonnelTrackChange(person.id, 'notes', e.target.value), className: "w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"}))
                                        )
                                    ))
                                )
                            )
                         )
                    )
                )
            ),

            activeTab === 'croquis' && (
                React.createElement("div", { className: "animate-fade-in" },
                    React.createElement(Croquis, { ref: croquisRef, isActive: activeTab === 'croquis' })
                )
            ),
            
            activeTab === 'sci201' && (
                React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl space-y-4 animate-fade-in" },
                    React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2" }, "Formulario SCI-201: Resumen del Incidente"),
                     React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(FormInput, { label: "1. Nombre del Incidente", name: "incidentName", value: sci201Data.incidentName, onChange: handleSci201Change }),
                        React.createElement(FormInput, { label: "2. Fecha y hora de preparación", name: "prepDateTime", value: sci201Data.prepDateTime, onChange: handleSci201Change })
                    ),
                    React.createElement(FormInput, { label: "3. Lugar del Incidente", name: "incidentLocation", value: sci201Data.incidentLocation, onChange: handleSci201Change }),
                    React.createElement("div", { className: "p-4 border border-zinc-700 rounded-md" },
                        React.createElement("h4", { className: "font-semibold text-zinc-200 mb-2" }, "4. Evaluación Inicial"),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement(FormTextarea, { label: "- Naturaleza del Incidente", name: "evalNature", value: sci201Data.evalNature, onChange: handleSci201Change }),
                            React.createElement(FormTextarea, { label: "- Amenazas", name: "evalThreats", value: sci201Data.evalThreats, onChange: handleSci201Change }),
                            React.createElement(FormTextarea, { label: "- Área afectada", name: "evalAffectedArea", value: sci201Data.evalAffectedArea, onChange: handleSci201Change }),
                            React.createElement(FormTextarea, { label: "- Aislamiento", name: "evalIsolation", value: sci201Data.evalIsolation, onChange: handleSci201Change })
                        )
                    ),
                     React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement(FormTextarea, { label: "5. Objetivo(s) Inicial(es)", name: "initialObjectives", value: sci201Data.initialObjectives, onChange: handleSci201Change, rows: 4 }),
                        React.createElement(FormTextarea, { label: "6. Estrategias", name: "strategies", value: sci201Data.strategies, onChange: handleSci201Change, rows: 4 }),
                        React.createElement(FormTextarea, { label: "7. Tácticas", name: "tactics", value: sci201Data.tactics, onChange: handleSci201Change, rows: 4 })
                    ),
                     React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(FormInput, { label: "8. Ubicación del PC", name: "pcLocation", value: sci201Data.pcLocation, onChange: handleSci201Change }),
                        React.createElement(FormInput, { label: "9. Ubicación del E", name: "eLocation", value: sci201Data.eLocation, onChange: handleSci201Change }),
                        React.createElement(FormInput, { label: "10. Ruta Ingreso", name: "ingressRoute", value: sci201Data.ingressRoute, onChange: handleSci201Change }),
                        React.createElement(FormInput, { label: "11. Ruta Egreso", name: "egressRoute", value: sci201Data.egressRoute, onChange: handleSci201Change })
                    ),
                    React.createElement(FormInput, { label: "12. Mensaje General de Seguridad", name: "safetyMessage", value: sci201Data.safetyMessage, onChange: handleSci201Change }),
                     React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(FormTextarea, { label: "14. Mapa Situacional o Croquis (URL o Descripción)", name: "mapOrSketch", value: sci201Data.mapOrSketch, onChange: handleSci201Change, rows: 3 }),
                        React.createElement(FormTextarea, { label: "17. Organigrama Actual (URL o Descripción)", name: "orgChart", value: sci201Data.orgChart, onChange: handleSci201Change, rows: 3 })
                     ),
                    React.createElement(FormInput, { label: "13. Comandante del Incidente", name: "incidentCommander", value: sci201Data.incidentCommander, onChange: handleSci201Change }),
                     React.createElement("div", null,
                        React.createElement("h4", { className: "font-semibold text-zinc-200 mb-2" }, "16. Resumen de las Acciones"),
                        sci201Data.actions.map((action, index) => (
                            React.createElement("div", { key: action.id, className: "flex gap-2 mb-2 items-center" },
                                React.createElement("input", { type: "text", placeholder: "Hora", value: action.time, onChange: e => handleSci201ActionChange(action.id, 'time', e.target.value), className: "w-28 bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"}),
                                React.createElement("input", { type: "text", placeholder: "Resumen de la acción", value: action.summary, onChange: e => handleSci201ActionChange(action.id, 'summary', e.target.value), className: "w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"}),
                                React.createElement("button", { onClick: () => removeSci201Action(action.id), className: "p-1 text-red-400 hover:bg-zinc-700 rounded-full" }, React.createElement(TrashIcon, { className: "w-5 h-5" }))
                            )
                        )),
                        React.createElement("button", { onClick: addSci201Action, className: "flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Acción")
                    )
                )
            ),
            
            activeTab === 'sci211' && (
                 React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl space-y-4 animate-fade-in" },
                    React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4" }, "Formulario SCI-211: Registro y Control de Recursos"),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-left min-w-[1200px] text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "text-zinc-400" },
                                    React.createElement("th", { className: "p-2" }, "Solicitado por"),
                                    React.createElement("th", { className: "p-2" }, "F/H Solicitud"),
                                    React.createElement("th", { className: "p-2" }, "Clase/Tipo"),
                                    React.createElement("th", { className: "p-2" }, "F/H Arribo"),
                                    React.createElement("th", { className: "p-2" }, "Institución/Matrícula"),
                                    React.createElement("th", { className: "p-2" }, "# Pers."),
                                    React.createElement("th", { className: "p-2" }, "Asignado a"),
                                    React.createElement("th", { className: "p-2" }, "F/H Desmov."),
                                    React.createElement("th", { className: "p-2" }, "Observaciones"),
                                    React.createElement("th", { className: "p-2 w-10" })
                                )
                            ),
                            React.createElement("tbody", null,
                                sci211Resources.map(res => (
                                    React.createElement("tr", { key: res.id, className: "border-t border-zinc-700/50" },
                                        React.createElement("td", null, React.createElement("input", { value: res.requestedBy, onChange: e => handleSci211Change(res.id, 'requestedBy', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("input", { value: res.requestDateTime, onChange: e => handleSci211Change(res.id, 'requestDateTime', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null,
                                            React.createElement("input", { value: res.classType, onChange: e => handleSci211Change(res.id, 'classType', e.target.value), placeholder: "Clase", className: "w-full bg-zinc-700 rounded p-1 mb-1"}),
                                            React.createElement("input", { value: res.resourceType, onChange: e => handleSci211Change(res.id, 'resourceType', e.target.value), placeholder: "Tipo", className: "w-full bg-zinc-700 rounded p-1"})
                                        ),
                                        React.createElement("td", null, React.createElement("input", { value: res.arrivalDateTime, onChange: e => handleSci211Change(res.id, 'arrivalDateTime', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null,
                                            React.createElement("input", { value: res.institution, onChange: e => handleSci211Change(res.id, 'institution', e.target.value), placeholder: "Institución", className: "w-full bg-zinc-700 rounded p-1 mb-1"}),
                                            React.createElement("input", { value: res.matricula, onChange: e => handleSci211Change(res.id, 'matricula', e.target.value), placeholder: "Matrícula", className: "w-full bg-zinc-700 rounded p-1"})
                                        ),
                                        React.createElement("td", null, React.createElement("input", { value: res.personnelCount, onChange: e => handleSci211Change(res.id, 'personnelCount', e.target.value), className: "w-16 bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("input", { value: res.assignedTo, onChange: e => handleSci211Change(res.id, 'assignedTo', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("input", { value: res.demobilizedDateTime, onChange: e => handleSci211Change(res.id, 'demobilizedDateTime', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("input", { value: res.observations, onChange: e => handleSci211Change(res.id, 'observations', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("button", { onClick: () => removeSci211Resource(res.id), className: "p-1 text-red-400 hover:bg-zinc-700 rounded-full"}, React.createElement(TrashIcon, { className: "w-5 h-5"})))
                                    )
                                ))
                            )
                        )
                    ),
                    React.createElement("button", { onClick: addSci211Resource, className: "mt-4 flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Recurso")
                )
            ),
            
            activeTab === 'sci207' && (
                React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl space-y-4 animate-fade-in" },
                    React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4" }, "Formulario SCI-207: Registro de Víctimas"),
                     React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-left min-w-[1000px] text-sm" },
                             React.createElement("thead", null,
                                React.createElement("tr", { className: "text-zinc-400" },
                                    React.createElement("th", { className: "p-2" }, "Nombre Paciente"),
                                    React.createElement("th", { className: "p-2" }, "Sexo/Edad"),
                                    React.createElement("th", { className: "p-2" }, "Clasificación"),
                                    React.createElement("th", { className: "p-2" }, "Lugar de Traslado"),
                                    React.createElement("th", { className: "p-2" }, "Trasladado por"),
                                    React.createElement("th", { className: "p-2" }, "F/H Traslado"),
                                    React.createElement("th", { className: "p-2 w-10" })
                                )
                            ),
                             React.createElement("tbody", null,
                                sci207Victims.map(vic => (
                                    React.createElement("tr", { key: vic.id, className: "border-t border-zinc-700/50" },
                                        React.createElement("td", null, React.createElement("input", { value: vic.patientName, onChange: e => handleSci207Change(vic.id, 'patientName', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null,
                                            React.createElement("input", { value: vic.sex, onChange: e => handleSci207Change(vic.id, 'sex', e.target.value), placeholder: "Sexo", className: "w-20 bg-zinc-700 rounded p-1 mr-1"}),
                                            React.createElement("input", { value: vic.age, onChange: e => handleSci207Change(vic.id, 'age', e.target.value), placeholder: "Edad", className: "w-16 bg-zinc-700 rounded p-1"})
                                        ),
                                        React.createElement("td", null,
                                            React.createElement("select", { value: vic.triage, onChange: e => handleSci207Change(vic.id, 'triage', e.target.value), className: `w-full border-zinc-600 rounded p-1 font-semibold ${triageColors[vic.triage]}`},
                                                React.createElement("option", {value: ""}, "Seleccionar"),
                                                React.createElement("option", {value: "Verde"}, "Verde"),
                                                React.createElement("option", {value: "Amarillo"}, "Amarillo"),
                                                React.createElement("option", {value: "Rojo"}, "Rojo"),
                                                React.createElement("option", {value: "Negro"}, "Negro")
                                            )
                                        ),
                                        React.createElement("td", null, React.createElement("input", { value: vic.transportLocation, onChange: e => handleSci207Change(vic.id, 'transportLocation', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("input", { value: vic.transportedBy, onChange: e => handleSci207Change(vic.id, 'transportedBy', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("input", { value: vic.transportDateTime, onChange: e => handleSci207Change(vic.id, 'transportDateTime', e.target.value), className: "w-full bg-zinc-700 rounded p-1"})),
                                        React.createElement("td", null, React.createElement("button", { onClick: () => removeSci207Victim(vic.id), className: "p-1 text-red-400 hover:bg-zinc-700 rounded-full"}, React.createElement(TrashIcon, { className: "w-5 h-5"})))
                                    )
                                ))
                            )
                        )
                    ),
                     React.createElement("button", { onClick: addSci207Victim, className: "mt-4 flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white" }, React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Víctima")
                )
            )
        )
    );
};

export default CommandPostView;