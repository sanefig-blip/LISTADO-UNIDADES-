

import React, { useState } from 'react';
import { PencilIcon, XCircleIcon, TrashIcon, PlusCircleIcon, DownloadIcon } from './icons.js';
import { exportGeneratorReportToPdf } from '../services/exportService.js';

const getConditionColor = (condition) => {
  const c = condition.toLowerCase();
  if (c === 'p/s') return 'bg-green-600 text-white';
  if (c === 'f/s') return 'bg-red-600 text-white';
  return 'bg-zinc-500 text-white';
};

const GeneratorReportDisplay = ({ reportData, onUpdateReport }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableReport, setEditableReport] = useState(null);

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

  const handleStationChange = (stationIdx, field, value) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      newReport.stations[stationIdx][field] = value;
      if (field === 'hasEquipment' && !value) {
        newReport.stations[stationIdx].equipment = [];
      }
      return newReport;
    });
  };

  const handleEquipmentChange = (stationIdx, equipIdx, field, value) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      newReport.stations[stationIdx].equipment[equipIdx][field] = value;
      return newReport;
    });
  };

  const handleAddEquipment = (stationIdx) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      const newEquipment = {
        id: `gen-equip-${Date.now()}`,
        brand: '',
        kva: '',
        condition: 'P/S',
        dependency: ''
      };
      newReport.stations[stationIdx].equipment.push(newEquipment);
      return newReport;
    });
  };

  const handleRemoveEquipment = (stationIdx, equipIdx) => {
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
    React.createElement("div", { className: "animate-fade-in" },
        React.createElement("div", { className: "mb-6 bg-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Grupos Electrógenos"),
                React.createElement("p", { className: "text-zinc-400" }, "Fecha del reporte: ", new Date().toLocaleString('es-AR'))
            ),
             React.createElement("div", { className: "flex items-center gap-2 self-start sm:self-center" },
                 isEditing ? (
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("button", { onClick: handleSave, className: "px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5" }), " Guardar"),
                        React.createElement("button", { onClick: handleCancel, className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors" }, React.createElement(XCircleIcon, { className: "w-6 h-6" }))
                    )
                ) : (
                    React.createElement(React.Fragment, null,
                        React.createElement("button", { onClick: () => exportGeneratorReportToPdf(reportData), className: "px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" },
                            React.createElement(DownloadIcon, { className: "w-5 h-5" }), " Exportar PDF"
                        ),
                        React.createElement("button", { onClick: handleEdit, className: "px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5" }), " Editar")
                    )
                )
             )
        ),
        
        React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl overflow-x-auto" },
            React.createElement("table", { className: "w-full min-w-[800px]" },
                React.createElement("thead", { className: "border-b-2 border-zinc-600" },
                    React.createElement("tr", { className: "text-left text-sm font-semibold text-zinc-300" },
                        React.createElement("th", { className: "p-3 w-1/5" }, "ESTACIÓN"),
                        React.createElement("th", { className: "p-3" }, "MARCA"),
                        React.createElement("th", { className: "p-3" }, "KVA"),
                        React.createElement("th", { className: "p-3" }, "COND."),
                        React.createElement("th", { className: "p-3" }, "DEPENDENCIA"),
                        isEditing && React.createElement("th", { className: "p-3 w-12" })
                    )
                ),
                React.createElement("tbody", null,
                    data.stations.map((station, stationIdx) => {
                        if (isEditing && station.hasEquipment && station.equipment.length === 0) {
                             return (
                                React.createElement("tr", { key: station.name, className: "border-t border-zinc-700" },
                                    React.createElement("td", { className: "p-3 font-semibold text-yellow-300 align-top" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("input", { type: "checkbox", checked: station.hasEquipment, onChange: (e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked), className: "h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500" }),
                                            React.createElement("span", null, station.name)
                                        )
                                    ),
                                    React.createElement("td", { colSpan: 4 },
                                        React.createElement("button", { onClick: () => handleAddEquipment(stationIdx), className: "flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white" }, React.createElement(PlusCircleIcon, { className: "w-4 h-4" }), " Añadir")
                                    ),
                                    React.createElement("td")
                                )
                            );
                        }

                        if (!station.hasEquipment) {
                            return (
                                React.createElement("tr", { key: station.name, className: "border-t border-zinc-700" },
                                    React.createElement("td", { className: "p-3 font-semibold text-yellow-300 align-top" },
                                        isEditing ? (
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("input", { type: "checkbox", checked: station.hasEquipment, onChange: (e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked), className: "h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500" }),
                                                React.createElement("span", null, station.name)
                                            )
                                        ) : station.name
                                    ),
                                    React.createElement("td", { colSpan: isEditing ? 5 : 4, className: "p-3 text-center text-zinc-500 italic" }, "NO POSEE")
                                )
                            );
                        }

                        if (station.equipment.length === 0) {
                            return (
                                React.createElement("tr", { key: station.name, className: "border-t border-zinc-700" },
                                    React.createElement("td", { className: "p-3 font-semibold text-yellow-300 align-top" }, station.name),
                                    React.createElement("td", { colSpan: isEditing ? 5 : 4, className: "p-3 text-center text-zinc-500 italic" }, "No hay equipos para esta estación.")
                                )
                            );
                        }

                        return station.equipment.map((equip, equipIdx) => (
                            React.createElement("tr", { key: equip.id, className: "border-t border-zinc-700 hover:bg-zinc-700/50" },
                                equipIdx === 0 && (
                                    React.createElement("td", { rowSpan: station.equipment.length, className: "p-3 font-semibold text-yellow-300 align-top" },
                                         isEditing ? (
                                            React.createElement("div", { className: "flex flex-col items-start gap-2" },
                                                React.createElement("div", { className: "flex items-center gap-2" },
                                                    React.createElement("input", { type: "checkbox", checked: station.hasEquipment, onChange: (e) => handleStationChange(stationIdx, 'hasEquipment', e.target.checked), className: "h-4 w-4 bg-zinc-600 border-zinc-500 rounded text-blue-500 focus:ring-blue-500" }),
                                                    React.createElement("span", null, station.name)
                                                ),
                                                React.createElement("button", { onClick: () => handleAddEquipment(stationIdx), className: "flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white" }, React.createElement(PlusCircleIcon, { className: "w-4 h-4" }), " Añadir")
                                            )
                                        ) : station.name
                                    )
                                ),
                                isEditing ? (
                                    React.createElement(React.Fragment, null,
                                        React.createElement("td", null, React.createElement("input", { value: equip.brand, onChange: e => handleEquipmentChange(stationIdx, equipIdx, 'brand', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                        React.createElement("td", null, React.createElement("input", { value: equip.kva, onChange: e => handleEquipmentChange(stationIdx, equipIdx, 'kva', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                        React.createElement("td", null,
                                            React.createElement("select", { value: equip.condition, onChange: e => handleEquipmentChange(stationIdx, equipIdx, 'condition', e.target.value), className: `w-full border-zinc-600 rounded p-1 font-semibold ${getConditionColor(equip.condition)}` },
                                                React.createElement("option", { value: "P/S" }, "P/S"),
                                                React.createElement("option", { value: "F/S" }, "F/S")
                                            )
                                        ),
                                        React.createElement("td", null, React.createElement("input", { value: equip.dependency, onChange: e => handleEquipmentChange(stationIdx, equipIdx, 'dependency', e.target.value), className: "w-full bg-zinc-700 rounded p-1" })),
                                        React.createElement("td", null, React.createElement("button", { onClick: () => handleRemoveEquipment(stationIdx, equipIdx), className: "p-1 text-red-400 hover:text-red-300" }, React.createElement(TrashIcon, { className: "w-5 h-5" })))
                                    )
                                ) : (
                                    React.createElement(React.Fragment, null,
                                        React.createElement("td", { className: "p-3 text-zinc-200" }, equip.brand),
                                        React.createElement("td", { className: "p-3 text-zinc-300" }, equip.kva),
                                        React.createElement("td", { className: "p-3" },
                                            React.createElement("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(equip.condition)}` },
                                                equip.condition
                                            )
                                        ),
                                        React.createElement("td", { className: "p-3 text-zinc-300" }, equip.dependency)
                                    )
                                )
                            )
                        ));
                    })
                )
            )
        )
    )
  );
};

export default GeneratorReportDisplay;