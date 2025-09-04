import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UnitReportData, SCI201Data, SCI211Resource, SCI207Victim, TriageCategory } from '../types';
import { DownloadIcon, PlusCircleIcon, TrashIcon } from './icons';
import { exportCommandPostToPdf } from '../services/exportService';
import Croquis from './Croquis';

interface TrackedUnit {
  id: string;
  type: string;
  officerInCharge?: string;
  personnelCount?: number | null;
  groupName: string;
  dispatched: boolean;
  departureTime: string;
  onSceneTime: string;
  returnTime: string;
  notes: string;
}

interface TrackedPersonnel {
    id: string;
    type: 'Dotación' | 'Apresto';
    name: string;
    groupName: string;
    onScene: boolean;
    notes: string;
}

const FormInput = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: any) => void }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-zinc-400">{label}</label>
        <input type="text" id={name} name={name} value={value} onChange={onChange} className="mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
    </div>
);

const FormTextarea = ({ label, name, value, onChange, rows=2 }: { label: string, name: string, value: string, onChange: (e: any) => void, rows?: number }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-zinc-400">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
    </div>
);

const TabButton = ({ activeTab, tabName, label, onClick }: { activeTab: string, tabName: string, label: string, onClick: (tabName: string) => void }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`}
    >
        {label}
    </button>
);

interface CommandPostViewProps {
    unitReportData: UnitReportData;
}

const CommandPostView: React.FC<CommandPostViewProps> = ({ unitReportData }) => {
    const [activeTab, setActiveTab] = useState('control');
    const croquisRef = useRef<{ getCenteredSketch: () => Promise<string | null> }>(null);

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
    const [trackedUnits, setTrackedUnits] = useState<TrackedUnit[]>(allUnitsForTracking);

    useEffect(() => {
        setTrackedUnits(allUnitsForTracking);
    }, [allUnitsForTracking]);

    const allPersonnelForTracking = useMemo(() => {
        if (!unitReportData) return [];
        const personnelMap = new Map<string, any>();
        
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
    const [trackedPersonnel, setTrackedPersonnel] = useState<TrackedPersonnel[]>(allPersonnelForTracking);
    useEffect(() => {
        setTrackedPersonnel(allPersonnelForTracking);
    }, [allPersonnelForTracking]);

    const [incidentDetails, setIncidentDetails] = useState({ type: '', address: '', district: '', alarmTime: '', chiefOnScene: '', incidentCommander: '' });
    const [sci201Data, setSci201Data] = useState<SCI201Data>({
        incidentName: '', prepDateTime: '', incidentLocation: '', evalNature: '', evalThreats: '',
        evalAffectedArea: '', evalIsolation: '', initialObjectives: '', strategies: '', tactics: '',
        pcLocation: '', eLocation: '', ingressRoute: '', egressRoute: '', safetyMessage: '',
        incidentCommander: '', mapOrSketch: '', orgChart: '', actions: [{id: 1, time: '', summary: ''}]
    });
    const [sci211Resources, setSci211Resources] = useState<SCI211Resource[]>([{
        id: 1, requestedBy: '', requestDateTime: '', classType: '', resourceType: '', arrivalDateTime: '',
        institution: '', matricula: '', personnelCount: '', status: 'Disponible', assignedTo: '',
        demobilizedBy: '', demobilizedDateTime: '', observations: ''
    }]);
    const [sci207Victims, setSci207Victims] = useState<SCI207Victim[]>([{
        id: 1, patientName: '', sex: '', age: '', triage: '', transportLocation: '',
        transportedBy: '', transportDateTime: ''
    }]);

    const handleIncidentDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setIncidentDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleUnitTrackChange = (unitId: string, field: keyof TrackedUnit, value: any) => {
        setTrackedUnits(prev => prev.map(u => u.id === unitId ? { ...u, [field]: value } : u));
    };
    
    const handlePersonnelTrackChange = (personnelId: string, field: keyof TrackedPersonnel, value: any) => {
        setTrackedPersonnel(prev => prev.map(p => p.id === personnelId ? { ...p, [field]: value } : p));
    };

    const handleSci201Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSci201Data(prev => ({...prev, [name]: value}));
    };

    const handleSci201ActionChange = (id: number, field: 'time' | 'summary', value: string) => {
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

    const removeSci201Action = (id: number) => {
        setSci201Data(prev => ({
            ...prev,
            actions: prev.actions.filter(a => a.id !== id)
        }));
    };
    
    const handleSci211Change = (id: number, field: keyof SCI211Resource, value: any) => {
        setSci211Resources(prev => prev.map(r => r.id === id ? {...r, [field]: value} : r));
    };

    const addSci211Resource = () => {
        setSci211Resources(prev => [...prev, {
            id: Date.now(), requestedBy: '', requestDateTime: '', classType: '', resourceType: '', arrivalDateTime: '',
            institution: '', matricula: '', personnelCount: '', status: 'Disponible', assignedTo: '',
            demobilizedBy: '', demobilizedDateTime: '', observations: ''
        }]);
    };

    const removeSci211Resource = (id: number) => {
        setSci211Resources(prev => prev.filter(r => r.id !== id));
    };
    
    const handleSci207Change = (id: number, field: keyof SCI207Victim, value: any) => {
        setSci207Victims(prev => prev.map(v => v.id === id ? {...v, [field]: value} : v));
    };

    const addSci207Victim = () => {
        setSci207Victims(prev => [...prev, {
            id: Date.now(), patientName: '', sex: '', age: '', triage: '', transportLocation: '',
            transportedBy: '', transportDateTime: ''
        }]);
    };

    const removeSci207Victim = (id: number) => {
        setSci207Victims(prev => prev.filter(v => v.id !== id));
    };
    
    const triageColors: {[key in TriageCategory]: string} = {
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
        <div className="space-y-6">
            <div className="bg-zinc-800/60 p-2 rounded-xl flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <TabButton activeTab={activeTab} tabName="control" label="Control General" onClick={setActiveTab} />
                    <TabButton activeTab={activeTab} tabName="croquis" label="Croquis Táctico" onClick={setActiveTab} />
                    <TabButton activeTab={activeTab} tabName="sci201" label="Formulario SCI-201 (Resumen)" onClick={setActiveTab} />
                    <TabButton activeTab={activeTab} tabName="sci211" label="Formulario SCI-211 (Recursos)" onClick={setActiveTab} />
                    <TabButton activeTab={activeTab} tabName="sci207" label="Formulario SCI-207 (Víctimas)" onClick={setActiveTab} />
                </div>
                 <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold">
                    <DownloadIcon className="w-5 h-5"/>
                    Exportar Reporte PDF
                </button>
            </div>

            {activeTab === 'control' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-zinc-800/60 p-6 rounded-xl space-y-4">
                        <h3 className="text-xl font-semibold text-yellow-300">Datos Generales del Siniestro</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormInput label="Tipo de Siniestro" name="type" value={incidentDetails.type} onChange={handleIncidentDetailChange} />
                            <FormInput label="Dirección" name="address" value={incidentDetails.address} onChange={handleIncidentDetailChange} />
                            <FormInput label="Comuna" name="district" value={incidentDetails.district} onChange={handleIncidentDetailChange} />
                            <FormInput label="Fecha y Hora de Alarma" name="alarmTime" value={incidentDetails.alarmTime} onChange={handleIncidentDetailChange} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Jefe del Cuerpo en el Lugar" name="chiefOnScene" value={incidentDetails.chiefOnScene} onChange={handleIncidentDetailChange} />
                            <FormInput label="Jefe de la Emergencia" name="incidentCommander" value={incidentDetails.incidentCommander} onChange={handleIncidentDetailChange} />
                        </div>
                    </div>
                    <div className="bg-zinc-800/60 p-6 rounded-xl">
                         <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4">Unidades en la Intervención</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="text-sm text-zinc-400">
                                        <th className="p-2 w-12">Desp.</th>
                                        <th className="p-2">Unidad</th>
                                        <th className="p-2">A Cargo</th>
                                        <th className="p-2">Dotación</th>
                                        <th className="p-2 w-28">H. Salida</th>
                                        <th className="p-2 w-28">H. Lugar</th>
                                        <th className="p-2 w-28">H. Regreso</th>
                                        <th className="p-2">Novedades</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trackedUnits.map(unit => (
                                        <tr key={unit.id} className="border-t border-zinc-700/50 hover:bg-zinc-700/30">
                                            <td className="p-2 align-middle text-center">
                                                <input type="checkbox" checked={unit.dispatched} onChange={e => handleUnitTrackChange(unit.id, 'dispatched', e.target.checked)} className="h-5 w-5 bg-zinc-700 border-zinc-600 rounded text-blue-500 focus:ring-blue-500" />
                                            </td>
                                            <td className="p-2 align-middle"><div className="font-mono text-zinc-200">{unit.id}</div><div className="text-xs text-zinc-500">{unit.groupName}</div></td>
                                            <td className="p-2 align-middle text-zinc-300 text-sm">{unit.officerInCharge || '-'}</td>
                                            <td className="p-2 align-middle text-center font-semibold text-white">{unit.personnelCount}</td>
                                            <td><input type="text" value={unit.departureTime} onChange={e => handleUnitTrackChange(unit.id, 'departureTime', e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/></td>
                                            <td><input type="text" value={unit.onSceneTime} onChange={e => handleUnitTrackChange(unit.id, 'onSceneTime', e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/></td>
                                            <td><input type="text" value={unit.returnTime} onChange={e => handleUnitTrackChange(unit.id, 'returnTime', e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/></td>
                                            <td><input type="text" value={unit.notes} onChange={e => handleUnitTrackChange(unit.id, 'notes', e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>

                    <div className="bg-zinc-800/60 p-6 rounded-xl">
                         <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4">Personal Clave en la Intervención</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="text-sm text-zinc-400">
                                        <th className="p-2 w-12">Lugar</th>
                                        <th className="p-2">Nombre</th>
                                        <th className="p-2">Tipo</th>
                                        <th className="p-2">Estación</th>
                                        <th className="p-2">Novedades</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trackedPersonnel.map(person => (
                                        <tr key={person.id} className="border-t border-zinc-700/50 hover:bg-zinc-700/30">
                                            <td className="p-2 align-middle text-center"><input type="checkbox" checked={person.onScene} onChange={e => handlePersonnelTrackChange(person.id, 'onScene', e.target.checked)} className="h-5 w-5 bg-zinc-700 border-zinc-600 rounded text-blue-500 focus:ring-blue-500" /></td>
                                            <td className="p-2 align-middle text-zinc-200">{person.name}</td>
                                            <td className="p-2 align-middle text-zinc-300">{person.type}</td>
                                            <td className="p-2 align-middle text-zinc-400 text-sm">{person.groupName}</td>
                                            <td><input type="text" value={person.notes} onChange={e => handlePersonnelTrackChange(person.id, 'notes', e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'croquis' && (
                <div className="animate-fade-in">
                    <Croquis ref={croquisRef} isActive={activeTab === 'croquis'} />
                </div>
            )}
            
            {activeTab === 'sci201' && (
                <div className="bg-zinc-800/60 p-6 rounded-xl space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2">Formulario SCI-201: Resumen del Incidente</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="1. Nombre del Incidente" name="incidentName" value={sci201Data.incidentName} onChange={handleSci201Change} />
                        <FormInput label="2. Fecha y hora de preparación" name="prepDateTime" value={sci201Data.prepDateTime} onChange={handleSci201Change} />
                    </div>
                    <FormInput label="3. Lugar del Incidente" name="incidentLocation" value={sci201Data.incidentLocation} onChange={handleSci201Change} />
                    <div className="p-4 border border-zinc-700 rounded-md">
                        <h4 className="font-semibold text-zinc-200 mb-2">4. Evaluación Inicial</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormTextarea label="- Naturaleza del Incidente" name="evalNature" value={sci201Data.evalNature} onChange={handleSci201Change} />
                            <FormTextarea label="- Amenazas" name="evalThreats" value={sci201Data.evalThreats} onChange={handleSci201Change} />
                            <FormTextarea label="- Área afectada" name="evalAffectedArea" value={sci201Data.evalAffectedArea} onChange={handleSci201Change} />
                            <FormTextarea label="- Aislamiento" name="evalIsolation" value={sci201Data.evalIsolation} onChange={handleSci201Change} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormTextarea label="5. Objetivo(s) Inicial(es)" name="initialObjectives" value={sci201Data.initialObjectives} onChange={handleSci201Change} rows={4} />
                        <FormTextarea label="6. Estrategias" name="strategies" value={sci201Data.strategies} onChange={handleSci201Change} rows={4} />
                        <FormTextarea label="7. Tácticas" name="tactics" value={sci201Data.tactics} onChange={handleSci201Change} rows={4} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="8. Ubicación del PC" name="pcLocation" value={sci201Data.pcLocation} onChange={handleSci201Change} />
                        <FormInput label="9. Ubicación del E" name="eLocation" value={sci201Data.eLocation} onChange={handleSci201Change} />
                        <FormInput label="10. Ruta Ingreso" name="ingressRoute" value={sci201Data.ingressRoute} onChange={handleSci201Change} />
                        <FormInput label="11. Ruta Egreso" name="egressRoute" value={sci201Data.egressRoute} onChange={handleSci201Change} />
                    </div>
                    <FormInput label="12. Mensaje General de Seguridad" name="safetyMessage" value={sci201Data.safetyMessage} onChange={handleSci201Change} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormTextarea label="14. Mapa Situacional o Croquis (URL o Descripción)" name="mapOrSketch" value={sci201Data.mapOrSketch} onChange={handleSci201Change} rows={3} />
                        <FormTextarea label="17. Organigrama Actual (URL o Descripción)" name="orgChart" value={sci201Data.orgChart} onChange={handleSci201Change} rows={3} />
                     </div>
                    <FormInput label="13. Comandante del Incidente" name="incidentCommander" value={sci201Data.incidentCommander} onChange={handleSci201Change} />
                     <div>
                        <h4 className="font-semibold text-zinc-200 mb-2">16. Resumen de las Acciones</h4>
                        {sci201Data.actions.map((action, index) => (
                            <div key={action.id} className="flex gap-2 mb-2 items-center">
                                <input type="text" placeholder="Hora" value={action.time} onChange={e => handleSci201ActionChange(action.id, 'time', e.target.value)} className="w-28 bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/>
                                <input type="text" placeholder="Resumen de la acción" value={action.summary} onChange={e => handleSci201ActionChange(action.id, 'summary', e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"/>
                                <button onClick={() => removeSci201Action(action.id)} className="p-1 text-red-400 hover:bg-zinc-700 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button onClick={addSci201Action} className="flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white"><PlusCircleIcon className="w-5 h-5"/> Añadir Acción</button>
                    </div>
                </div>
            )}
            
            {activeTab === 'sci211' && (
                 <div className="bg-zinc-800/60 p-6 rounded-xl space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4">Formulario SCI-211: Registro y Control de Recursos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1200px] text-sm">
                            <thead>
                                <tr className="text-zinc-400">
                                    <th className="p-2">Solicitado por</th>
                                    <th className="p-2">F/H Solicitud</th>
                                    <th className="p-2">Clase/Tipo</th>
                                    <th className="p-2">F/H Arribo</th>
                                    <th className="p-2">Institución/Matrícula</th>
                                    <th className="p-2"># Pers.</th>
                                    <th className="p-2">Asignado a</th>
                                    <th className="p-2">F/H Desmov.</th>
                                    <th className="p-2">Observaciones</th>
                                    <th className="p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sci211Resources.map(res => (
                                    <tr key={res.id} className="border-t border-zinc-700/50">
                                        <td><input value={res.requestedBy} onChange={e => handleSci211Change(res.id, 'requestedBy', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={res.requestDateTime} onChange={e => handleSci211Change(res.id, 'requestDateTime', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td>
                                            <input value={res.classType} onChange={e => handleSci211Change(res.id, 'classType', e.target.value)} placeholder="Clase" className="w-full bg-zinc-700 rounded p-1 mb-1"/>
                                            <input value={res.resourceType} onChange={e => handleSci211Change(res.id, 'resourceType', e.target.value)} placeholder="Tipo" className="w-full bg-zinc-700 rounded p-1"/>
                                        </td>
                                        <td><input value={res.arrivalDateTime} onChange={e => handleSci211Change(res.id, 'arrivalDateTime', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td>
                                            <input value={res.institution} onChange={e => handleSci211Change(res.id, 'institution', e.target.value)} placeholder="Institución" className="w-full bg-zinc-700 rounded p-1 mb-1"/>
                                            <input value={res.matricula} onChange={e => handleSci211Change(res.id, 'matricula', e.target.value)} placeholder="Matrícula" className="w-full bg-zinc-700 rounded p-1"/>
                                        </td>
                                        <td><input value={res.personnelCount} onChange={e => handleSci211Change(res.id, 'personnelCount', e.target.value)} className="w-16 bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={res.assignedTo} onChange={e => handleSci211Change(res.id, 'assignedTo', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={res.demobilizedDateTime} onChange={e => handleSci211Change(res.id, 'demobilizedDateTime', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={res.observations} onChange={e => handleSci211Change(res.id, 'observations', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><button onClick={() => removeSci211Resource(res.id)} className="p-1 text-red-400 hover:bg-zinc-700 rounded-full"><TrashIcon className="w-5 h-5"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={addSci211Resource} className="mt-4 flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white"><PlusCircleIcon className="w-5 h-5"/> Añadir Recurso</button>
                </div>
            )}
            
            {activeTab === 'sci207' && (
                <div className="bg-zinc-800/60 p-6 rounded-xl space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-4">Formulario SCI-207: Registro de Víctimas</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px] text-sm">
                             <thead>
                                <tr className="text-zinc-400">
                                    <th className="p-2">Nombre Paciente</th>
                                    <th className="p-2">Sexo/Edad</th>
                                    <th className="p-2">Clasificación</th>
                                    <th className="p-2">Lugar de Traslado</th>
                                    <th className="p-2">Trasladado por</th>
                                    <th className="p-2">F/H Traslado</th>
                                    <th className="p-2 w-10"></th>
                                </tr>
                            </thead>
                             <tbody>
                                {sci207Victims.map(vic => (
                                    <tr key={vic.id} className="border-t border-zinc-700/50">
                                        <td><input value={vic.patientName} onChange={e => handleSci207Change(vic.id, 'patientName', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td>
                                            <input value={vic.sex} onChange={e => handleSci207Change(vic.id, 'sex', e.target.value)} placeholder="Sexo" className="w-20 bg-zinc-700 rounded p-1 mr-1"/>
                                            <input value={vic.age} onChange={e => handleSci207Change(vic.id, 'age', e.target.value)} placeholder="Edad" className="w-16 bg-zinc-700 rounded p-1"/>
                                        </td>
                                        <td>
                                            <select value={vic.triage} onChange={e => handleSci207Change(vic.id, 'triage', e.target.value)} className={`w-full border-zinc-600 rounded p-1 font-semibold ${triageColors[vic.triage]}`}>
                                                <option value="">Seleccionar</option>
                                                <option value="Verde">Verde</option>
                                                <option value="Amarillo">Amarillo</option>
                                                <option value="Rojo">Rojo</option>
                                                <option value="Negro">Negro</option>
                                            </select>
                                        </td>
                                        <td><input value={vic.transportLocation} onChange={e => handleSci207Change(vic.id, 'transportLocation', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={vic.transportedBy} onChange={e => handleSci207Change(vic.id, 'transportedBy', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={vic.transportDateTime} onChange={e => handleSci207Change(vic.id, 'transportDateTime', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><button onClick={() => removeSci207Victim(vic.id)} className="p-1 text-red-400 hover:bg-zinc-700 rounded-full"><TrashIcon className="w-5 h-5"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <button onClick={addSci207Victim} className="mt-4 flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white"><PlusCircleIcon className="w-5 h-5"/> Añadir Víctima</button>
                </div>
            )}
        </div>
    );
};

export default CommandPostView;