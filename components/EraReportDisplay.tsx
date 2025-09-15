import React, { useState, useMemo } from 'react';
import { EraData, EraReportStation, EraEquipment, User } from '../types';
import { PencilIcon, XCircleIcon, TrashIcon, PlusCircleIcon, DownloadIcon } from './icons';
import { exportEraReportToPdf } from '../services/exportService';

interface EraReportDisplayProps {
  reportData: EraData;
  onUpdateReport: (updatedData: EraData) => void;
  currentUser: User;
}

const getConditionColor = (condition: string) => {
  const c = condition.toLowerCase();
  if (c === 'p/s') return 'bg-green-600 text-white';
  if (c === 'f/s') return 'bg-red-600 text-white';
  return 'bg-zinc-500 text-white';
};

const normalize = (str: string) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/["'“”]/g, "").replace(/\./g, "").replace(/\s+/g, ' ').trim() : '';

const isStationViewable = (stationName: string, user: User | null): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'station' || !user.station) return false;

    const normalizedUserStation = normalize(user.station);
    const normalizedStationName = normalize(stationName);

    // Get the base station part from the user's full station name (e.g., "ESTACION III" from "ESTACION III BARRACAS")
    const userBaseStationMatch = normalizedUserStation.match(/^(ESTACION\s[IVXLCDM]+)/);
    const userBaseStation = userBaseStationMatch ? userBaseStationMatch[0] : null;

    // A user can see a station if their base station name matches the station name
    if (userBaseStation && userBaseStation === normalizedStationName) {
        return true;
    }
    
    // A user can see their own specific detachment if names match exactly
    if (normalizedUserStation === normalizedStationName) {
        return true;
    }

    // Special rule: Estacion III Barracas can view and edit Destacamento Boca.
    if (normalizedUserStation.includes('ESTACION III BARRACAS') && normalizedStationName.includes('BOCA')) {
        return true;
    }
    
    // Special rule: Estacion V can view DTO Urquiza and DTO Saavedra.
    if (normalizedUserStation.startsWith('ESTACION V ') && 
        (normalizedStationName.includes('URQUIZA') || normalizedStationName.includes('SAAVEDRA'))) {
        return true;
    }

    // Special rule: Estacion VI can view DTO Palermo and DTO Chacarita.
    if (normalizedUserStation.startsWith('ESTACION VI ') && 
        (normalizedStationName.includes('PALERMO') || normalizedStationName.includes('CHACARITA'))) {
        return true;
    }

    // Special rule: Estacion VIII can view DTO Velez Sarsfield.
    if (normalizedUserStation.startsWith('ESTACION VIII ') && 
        (normalizedStationName.includes('VELEZ SARSFIELD'))) {
        return true;
    }
    
    // Special rule: Estacion IX can view DTO Devoto.
    if (normalizedUserStation.startsWith('ESTACION IX ') && 
        (normalizedStationName.includes('DEVOTO'))) {
        return true;
    }

    return false;
};


const isStationEditable = (stationName: string, user: User | null): boolean => {
    return isStationViewable(stationName, user);
};

const EraReportDisplay: React.FC<EraReportDisplayProps> = ({ reportData, onUpdateReport, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableReport, setEditableReport] = useState<EraData | null>(null);

  const viewableReportData = useMemo(() => {
    if (!reportData || !currentUser || currentUser.role === 'admin') {
      return reportData;
    }
    return {
      ...reportData,
      stations: reportData.stations.filter(station => isStationViewable(station.name, currentUser))
    };
  }, [reportData, currentUser]);

  const handleEdit = () => {
    setEditableReport(JSON.parse(JSON.stringify(viewableReportData)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableReport(null);
  };

  const handleSave = () => {
    if (editableReport) {
      const fullReport = JSON.parse(JSON.stringify(reportData));
      const editableStationsMap = new Map<string, EraReportStation>();
      editableReport.stations.forEach(station => {
          editableStationsMap.set(station.name, station);
      });

      fullReport.stations.forEach((station: EraReportStation, stationIndex: number) => {
          if (editableStationsMap.has(station.name)) {
              fullReport.stations[stationIndex] = editableStationsMap.get(station.name)!;
          }
      });
      
      const reportWithDate = { ...fullReport, reportDate: new Date().toLocaleString('es-AR') };
      onUpdateReport(reportWithDate);
    }
    setIsEditing(false);
    setEditableReport(null);
  };

  const handleStationChange = (stationIdx: number, field: keyof EraReportStation, value: any) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      (newReport.stations[stationIdx] as any)[field] = value;
      if (field === 'hasEquipment' && !value) {
        newReport.stations[stationIdx].equipment = [];
      }
      return newReport;
    });
  };

  const handleEquipmentChange = (stationIdx: number, equipIdx: number, field: keyof EraEquipment, value: string) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      (newReport.stations[stationIdx].equipment[equipIdx] as any)[field] = value;
      return newReport;
    });
  };

  const handleAddEquipment = (stationIdx: number) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      const newEquipment: EraEquipment = {
        id: `era-equip-${Date.now()}`,
        brand: '',
        voltage: '',
        condition: 'P/S',
        dependency: ''
      };
      newReport.stations[stationIdx].equipment.push(newEquipment);
      return newReport;
    });
  };

  const handleRemoveEquipment = (stationIdx: number, equipIdx: number) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      newReport.stations[stationIdx].equipment.splice(equipIdx, 1);
      return newReport;
    });
  };
  
  const data = isEditing ? editableReport : viewableReportData;

  if (!data) return null;

  return (
    <div className="animate-fade-in">
        <div className="mb-6 bg-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white">Trasvazadores de E.R.A.</h2>
                <p className="text-zinc-400">Fecha del reporte: {new Date().toLocaleString('es-AR')}</p>
            </div>
             <div className="flex items-center gap-2 self-start sm:self-center">
                 {isEditing ? (
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2"><PencilIcon className="w-5 h-5"/> Guardar</button>
                        <button onClick={handleCancel} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"><XCircleIcon className="w-6 h-6"/></button>
                    </div>
                ) : (
                    <>
                    <button onClick={() => exportEraReportToPdf(reportData)} className="px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2">
                        <DownloadIcon className="w-5 h-5"/> Exportar PDF
                    </button>
                    <button onClick={handleEdit} className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2"><PencilIcon className="w-5 h-5"/> Editar</button>
                    </>
                )}
             </div>
        </div>
        
        <div className="bg-zinc-800/60 p-4 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead className="border-b-2 border-zinc-600">
                    <tr className="text-left text-sm font-semibold text-zinc-300">
                        <th className="p-3 w-1/5">ESTACIÓN</th>
                        <th className="p-3">MARCA</th>
                        <th className="p-3">VOLTAJE</th>
                        <th className="p-3">COND.</th>
                        <th className="p-3">DEPENDENCIA</th>
                        {isEditing && <th className="p-3 w-12"></th>}
                    </tr>
                </thead>
                <tbody>
                    {data.stations.map((station, stationIdx) => {
                        const stationIsEditable = isEditing && isStationEditable(station.name, currentUser);
                        if (isEditing && station.hasEquipment && station.equipment.length === 0) {
                            return (
                                <tr key={station.name} className="border-t border-zinc-700">
                                    <td className="p-3 font-semibold text-yellow-300 align-top">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={station.hasEquipment} onChange={(e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500" disabled={!stationIsEditable}/>
                                            <span>{station.name}</span>
                                        </div>
                                    </td>
                                    <td colSpan={4}>
                                        <button onClick={() => handleAddEquipment(stationIdx)} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white disabled:opacity-50" disabled={!stationIsEditable}><PlusCircleIcon className="w-4 h-4" /> Añadir</button>
                                    </td>
                                    <td/>
                                </tr>
                            );
                        }
                        
                        if (!station.hasEquipment) {
                            return (
                                <tr key={station.name} className="border-t border-zinc-700">
                                    <td className="p-3 font-semibold text-yellow-300 align-top">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={station.hasEquipment} onChange={(e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500" disabled={!stationIsEditable}/>
                                                <span>{station.name}</span>
                                            </div>
                                        ) : station.name}
                                    </td>
                                    <td colSpan={isEditing ? 5 : 4} className="p-3 text-center text-zinc-500 italic">NO POSEE</td>
                                </tr>
                            );
                        }

                        if (station.equipment.length === 0) {
                            return (
                                <tr key={station.name} className="border-t border-zinc-700">
                                    <td className="p-3 font-semibold text-yellow-300 align-top">{station.name}</td>
                                    <td colSpan={isEditing ? 5 : 4} className="p-3 text-center text-zinc-500 italic">No hay equipos para esta estación.</td>
                                </tr>
                            );
                        }

                        return station.equipment.map((equip, equipIdx) => (
                            <tr key={equip.id} className={`border-t border-zinc-700 ${isEditing && !stationIsEditable ? 'opacity-60' : 'hover:bg-zinc-700/50'}`}>
                                {equipIdx === 0 && (
                                    <td rowSpan={station.equipment.length} className="p-3 font-semibold text-yellow-300 align-top">
                                         {isEditing ? (
                                            <div className="flex flex-col items-start gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={station.hasEquipment} onChange={(e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500" disabled={!stationIsEditable}/>
                                                    <span>{station.name}</span>
                                                </div>
                                                <button onClick={() => handleAddEquipment(stationIdx)} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white disabled:opacity-50" disabled={!stationIsEditable}><PlusCircleIcon className="w-4 h-4" /> Añadir</button>
                                            </div>
                                        ) : station.name}
                                    </td>
                                )}
                                {isEditing ? (
                                    <>
                                        <td><input value={equip.brand} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'brand', e.target.value)} className="w-full bg-zinc-700 rounded p-1 disabled:bg-zinc-800" disabled={!stationIsEditable}/></td>
                                        <td><input value={equip.voltage} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'voltage', e.target.value)} className="w-full bg-zinc-700 rounded p-1 disabled:bg-zinc-800" disabled={!stationIsEditable}/></td>
                                        <td>
                                            <select value={equip.condition} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'condition', e.target.value)} className={`w-full border-zinc-600 rounded p-1 font-semibold ${getConditionColor(equip.condition)} disabled:bg-zinc-800 disabled:text-zinc-500`} disabled={!stationIsEditable}>
                                                <option value="P/S">P/S</option>
                                                <option value="F/S">F/S</option>
                                            </select>
                                        </td>
                                        <td><input value={equip.dependency} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'dependency', e.target.value)} className="w-full bg-zinc-700 rounded p-1 disabled:bg-zinc-800" disabled={!stationIsEditable}/></td>
                                        <td><button onClick={() => handleRemoveEquipment(stationIdx, equipIdx)} className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50" disabled={!stationIsEditable}><TrashIcon className="w-5 h-5"/></button></td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 text-zinc-200">{equip.brand}</td>
                                        <td className="p-3 text-zinc-300">{equip.voltage}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(equip.condition)}`}>
                                                {equip.condition}
                                            </span>
                                        </td>
                                        <td className="p-3 text-zinc-300">{equip.dependency}</td>
                                    </>
                                )}
                            </tr>
                        ));
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default EraReportDisplay;
