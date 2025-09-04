

import React, { useState } from 'react';
import { EraData, EraReportStation, EraEquipment } from '../types';
import { PencilIcon, XCircleIcon, TrashIcon, PlusCircleIcon, DownloadIcon } from './icons';
import { exportEraReportToPdf } from '../services/exportService';

interface EraReportDisplayProps {
  reportData: EraData;
  onUpdateReport: (updatedData: EraData) => void;
}

const getConditionColor = (condition: string) => {
  const c = condition.toLowerCase();
  if (c === 'p/s') return 'bg-green-600 text-white';
  if (c === 'f/s') return 'bg-red-600 text-white';
  return 'bg-zinc-500 text-white';
};

const EraReportDisplay: React.FC<EraReportDisplayProps> = ({ reportData, onUpdateReport }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableReport, setEditableReport] = useState<EraData | null>(null);

  const handleEdit = () => {
    setEditableReport(JSON.parse(JSON.stringify(reportData)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableReport(null);
  };

  const handleSave = () => {
    if (editableReport) {
      const reportWithDate = { ...editableReport, reportDate: new Date().toLocaleString('es-AR') };
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
  
  const data = isEditing ? editableReport : reportData;

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
                        if (isEditing && station.hasEquipment && station.equipment.length === 0) {
                            return (
                                <tr key={station.name} className="border-t border-zinc-700">
                                    <td className="p-3 font-semibold text-yellow-300 align-top">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={station.hasEquipment} onChange={(e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500"/>
                                            <span>{station.name}</span>
                                        </div>
                                    </td>
                                    <td colSpan={4}>
                                        <button onClick={() => handleAddEquipment(stationIdx)} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white"><PlusCircleIcon className="w-4 h-4" /> Añadir</button>
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
                                                <input type="checkbox" checked={station.hasEquipment} onChange={(e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500"/>
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
                            <tr key={equip.id} className="border-t border-zinc-700 hover:bg-zinc-700/50">
                                {equipIdx === 0 && (
                                    <td rowSpan={station.equipment.length} className="p-3 font-semibold text-yellow-300 align-top">
                                         {isEditing ? (
                                            <div className="flex flex-col items-start gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={station.hasEquipment} onChange={(e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked)} className="h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500"/>
                                                    <span>{station.name}</span>
                                                </div>
                                                <button onClick={() => handleAddEquipment(stationIdx)} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white"><PlusCircleIcon className="w-4 h-4" /> Añadir</button>
                                            </div>
                                        ) : station.name}
                                    </td>
                                )}
                                {isEditing ? (
                                    <>
                                        <td><input value={equip.brand} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'brand', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><input value={equip.voltage} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'voltage', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td>
                                            <select value={equip.condition} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'condition', e.target.value)} className={`w-full border-zinc-600 rounded p-1 font-semibold ${getConditionColor(equip.condition)}`}>
                                                <option value="P/S">P/S</option>
                                                <option value="F/S">F/S</option>
                                            </select>
                                        </td>
                                        <td><input value={equip.dependency} onChange={e => handleEquipmentChange(stationIdx, equipIdx, 'dependency', e.target.value)} className="w-full bg-zinc-700 rounded p-1"/></td>
                                        <td><button onClick={() => handleRemoveEquipment(stationIdx, equipIdx)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button></td>
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