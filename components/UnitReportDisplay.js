import React, { useState, useMemo, useRef } from 'react';
import { ChevronDownIcon, SearchIcon, PencilIcon, XCircleIcon, TrashIcon, PlusCircleIcon, DownloadIcon } from './icons.js';
import { exportUnitReportToPdf } from '../services/exportService.js';
import { RANKS } from '../types.js';

const getStatusColor = (status) => {
  const s = status.toLowerCase();
  if (s.includes('para servicio')) return 'bg-green-600 text-white';
  if (s.includes('fuera de servicio')) return 'bg-red-600 text-white';
  if (s.includes('reserva')) return 'bg-yellow-500 text-gray-900';
  if (s.includes('préstamo')) return 'bg-blue-500 text-white';
  return 'bg-zinc-500 text-white';
};

const normalize = (str) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/["'“”]/g, "").replace(/\./g, "").replace(/\s+/g, ' ').trim() : '';

const isGroupViewable = (groupName, user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'station' || !user.station) return false;

    const normalizedUserStation = normalize(user.station);
    const normalizedGroupName = normalize(groupName);

    // A user can always see their own station/detachment.
    if (normalizedUserStation.startsWith(normalizedGroupName)) {
        return true;
    }

    // Special rule: Estacion III Barracas can view and edit Destacamento Boca.
    if (normalizedUserStation.includes('ESTACION III BARRACAS') && normalizedGroupName.includes('DESTACAMENTO BOCA')) {
        return true;
    }

    // Special rule: Estacion II Patricios can view and edit Destacamento Pompeya.
    if (normalizedUserStation.includes('ESTACION II PATRICIOS') && normalizedGroupName.includes('DESTACAMENTO POMPEYA')) {
        return true;
    }

    // Special rule: Estacion IV Recoleta can view DTO Miserere and DTO Retiro.
    if (normalizedUserStation.includes('ESTACION IV RECOLETA') &&
        (normalizedGroupName.includes('DESTACAMENTO MISERERE') || normalizedGroupName.includes('DESTACAMENTO RETIRO'))) {
        return true;
    }

    // Special rule: Estacion V can view DTO Urquiza and DTO Saavedra.
    if (normalizedUserStation.startsWith('ESTACION V ') &&
        (normalizedGroupName.includes('DESTACAMENTO URQUIZA') || normalizedGroupName.includes('DESTACAMENTO SAAVEDRA'))) {
        return true;
    }
    
    // Special rule: Estacion VI can view DTO Palermo and DTO Chacarita.
    if (normalizedUserStation.startsWith('ESTACION VI ') &&
        (normalizedGroupName.includes('DESTACAMENTO PALERMO') || normalizedGroupName.includes('DESTACAMENTO CHACARITA'))) {
        return true;
    }

    // Special rule: Estacion VIII can view DTO Velez Sarsfield.
    if (normalizedUserStation.startsWith('ESTACION VIII ') &&
        (normalizedGroupName.includes('DESTACAMENTO VELEZ SARSFIELD'))) {
        return true;
    }

    // Special rule: Estacion IX can view DTO Devoto.
    if (normalizedUserStation.startsWith('ESTACION IX ') &&
        (normalizedGroupName.includes('DESTACAMENTO DEVOTO'))) {
        return true;
    }

    return false;
};

const isGroupEditable = (groupName, user) => {
    return isGroupViewable(groupName, user);
};


const UnitReportDisplay = ({ reportData, searchTerm, onSearchChange, onUpdateReport, commandPersonnel, servicePersonnel, unitList, unitTypes, currentUser }) => {
  const [collapsedZones, setCollapsedZones] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editableReport, setEditableReport] = useState(null);
  const [addOfficerInput, setAddOfficerInput] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);


  const allPersonnel = useMemo(() => {
    const combined = [...(commandPersonnel || []), ...(servicePersonnel || [])];
    const uniquePersonnel = Array.from(new Map(combined.map(p => [p.id, p])).values());
    return uniquePersonnel.sort((a, b) => a.name.localeCompare(b.name));
  }, [commandPersonnel, servicePersonnel]);

  const sortedRanks = useMemo(() => [...RANKS].sort((a, b) => b.length - a.length), []);

    const viewableReportData = useMemo(() => {
        if (!reportData || !currentUser || currentUser.role === 'admin') {
            return reportData;
        }

        const filteredZones = reportData.zones.map(zone => {
            const filteredGroups = zone.groups.filter(group => isGroupViewable(group.name, currentUser));
            return { ...zone, groups: filteredGroups };
        }).filter(zone => zone.groups.length > 0);

        return { ...reportData, zones: filteredZones };
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
      const editableGroupsMap = new Map();
      
      editableReport.zones.forEach(zone => {
          zone.groups.forEach(group => {
              editableGroupsMap.set(group.name, group);
          });
      });

      fullReport.zones.forEach((zone) => {
          zone.groups.forEach((group, groupIndex) => {
              if (editableGroupsMap.has(group.name)) {
                  zone.groups[groupIndex] = editableGroupsMap.get(group.name);
              }
          });
      });
      
      const reportWithDate = { ...fullReport, reportDate: new Date().toLocaleString('es-AR') };
      onUpdateReport(reportWithDate);
    }
    setIsEditing(false);
    setEditableReport(null);
  };

  const handleUnitChange = (zoneIdx, groupIdx, unitIdx, field, value) => {
      setEditableReport(prev => {
          if (!prev) return null;
          const newReport = JSON.parse(JSON.stringify(prev));
          const unit = newReport.zones[zoneIdx].groups[groupIdx].units[unitIdx];

          if (field === 'personnelCount') {
              const numValue = value === '' ? null : parseInt(value, 10);
              unit[field] = isNaN(numValue) ? null : numValue;
          } else {
              unit[field] = value;
          }
          
          if (field === 'status' && !value.toLowerCase().includes('fuera de servicio')) {
            unit.outOfServiceReason = '';
          }

          return newReport;
      });
  };
  
    const handleAddUnit = (zoneIdx, groupIdx) => {
     setEditableReport(prev => {
       if (!prev) return null;
       const newReport = JSON.parse(JSON.stringify(prev));
       const newUnit = {
         id: `NUEVA-UNIDAD-${Date.now()}`,
         type: 'Tipo',
         status: 'Para Servicio',
         officerInCharge: '',
         poc: '',
         personnelCount: null,
         internalId: ''
       };
       newReport.zones[zoneIdx].groups[groupIdx].units.push(newUnit);
       return newReport;
     });
   };

   const handleRemoveUnit = (zoneIdx, groupIdx, unitIdx) => {
       if (window.confirm("¿Está seguro de que desea eliminar esta unidad del reporte?")) {
           setEditableReport(prev => {
               if (!prev) return null;
               const newReport = JSON.parse(JSON.stringify(prev));
               newReport.zones[zoneIdx].groups[groupIdx].units.splice(unitIdx, 1);
               return newReport;
           });
       }
   };

  const handleOfficerListChange = (zoneIdx, groupIdx, listType, officerIdx, value) => {
    setEditableReport(prev => {
        if (!prev) return null;
        const newReport = JSON.parse(JSON.stringify(prev));
        const group = newReport.zones[zoneIdx].groups[groupIdx];
        if (!group[listType]) group[listType] = [];
        group[listType][officerIdx] = value;
        return newReport;
    });
  };

  const handleRemoveFromOfficerList = (zoneIdx, groupIdx, listType, officerIdx) => {
    setEditableReport(prev => {
        if (!prev) return null;
        const newReport = JSON.parse(JSON.stringify(prev));
        const group = newReport.zones[zoneIdx].groups[groupIdx];
        group[listType]?.splice(officerIdx, 1);
        return newReport;
    });
  };

  const handleAddToOfficerList = (zoneIdx, groupIdx, listType, person) => {
    const value = `${person.rank} ${person.name}`;
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      const group = newReport.zones[zoneIdx].groups[groupIdx];
      if (!group[listType]) group[listType] = [];
      group[listType].push(value);
      return newReport;
    });
    const key = `${zoneIdx}-${groupIdx}-${listType}`;
    setAddOfficerInput(prev => ({ ...prev, [key]: '' }));
    setActiveDropdown(null);
  };

  const dataToDisplay = isEditing ? editableReport : viewableReportData;

  const toggleZone = (zoneName) => {
    setCollapsedZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(zoneName)) {
        newSet.delete(zoneName);
      } else {
        newSet.add(zoneName);
      }
      return newSet;
    });
  };

  const filteredData = useMemo(() => {
    if (!dataToDisplay) return null;
    if (!searchTerm) return dataToDisplay;
    const lowercasedFilter = searchTerm.toLowerCase();

    return {
      ...dataToDisplay,
      zones: dataToDisplay.zones.map(zone => {
        const filteredGroups = zone.groups.filter(group => {
          if (group.name.toLowerCase().includes(lowercasedFilter)) return true;
          if ((group.crewOfficers || []).join(' ').toLowerCase().includes(lowercasedFilter)) return true;
          if ((group.standbyOfficers || []).join(' ').toLowerCase().includes(lowercasedFilter)) return true;
          return group.units.some(unit =>
            unit.id.toLowerCase().includes(lowercasedFilter) ||
            unit.type.toLowerCase().includes(lowercasedFilter) ||
            unit.status.toLowerCase().includes(lowercasedFilter) ||
            (unit.internalId || '').toLowerCase().includes(lowercasedFilter) ||
            (unit.officerInCharge || '').toLowerCase().includes(lowercasedFilter) ||
            (unit.poc || '').toLowerCase().includes(lowercasedFilter)
          );
        }).map(group => ({
            ...group,
            units: group.units.filter(unit => 
                (group.name.toLowerCase().includes(lowercasedFilter) ||
                 (group.crewOfficers || []).join(' ').toLowerCase().includes(lowercasedFilter) ||
                 (group.standbyOfficers || []).join(' ').toLowerCase().includes(lowercasedFilter)
                ) ? true : // If group name or officers match, show all units
                unit.id.toLowerCase().includes(lowercasedFilter) ||
                unit.type.toLowerCase().includes(lowercasedFilter) ||
                unit.status.toLowerCase().includes(lowercasedFilter) ||
                (unit.internalId || '').toLowerCase().includes(lowercasedFilter) ||
                (unit.officerInCharge || '').toLowerCase().includes(lowercasedFilter) ||
                (unit.poc || '').toLowerCase().includes(lowercasedFilter)
            )
        }));
        return { ...zone, groups: filteredGroups };
      }).filter(zone => zone.groups.length > 0)
    };
  }, [dataToDisplay, searchTerm]);

  const stats = useMemo(() => {
    const allUnits = (viewableReportData?.zones || []).flatMap(z => z.groups.flatMap(g => g.units));
    const total = allUnits.length;
    const inService = allUnits.filter(u => u.status.toLowerCase().includes('para servicio')).length;
    const outOfService = allUnits.filter(u => u.status.toLowerCase().includes('fuera de servicio')).length;
    const reserve = allUnits.filter(u => u.status.toLowerCase().includes('reserva')).length;
    const onLoan = allUnits.filter(u => u.status.toLowerCase().includes('préstamo')).length;
    return { total, inService, outOfService, reserve, onLoan };
  }, [viewableReportData]);
  
  if (!filteredData) {
      return null;
  }
  
  const renderOfficerList = (title, officers) => {
    if (!officers || officers.length === 0) return null;
    return (
        React.createElement("div", { className: "mt-4 pl-2" },
            React.createElement("h5", { className: "font-semibold text-blue-300 mb-1" }, title),
            React.createElement("ul", { className: "list-disc list-inside text-zinc-300 space-y-1" },
                officers.map((officer, index) => {
                    let rankPart = '';
                    let namePart = officer;
                    for (const rank of sortedRanks) {
                        if (officer.toUpperCase().startsWith(rank + ' ')) {
                            rankPart = officer.substring(0, rank.length);
                            namePart = officer.substring(rank.length).trim();
                            break;
                        }
                    }
                    return (
                        React.createElement("li", { key: index },
                            rankPart ? (
                                React.createElement(React.Fragment, null,
                                    React.createElement("span", { className: "font-semibold text-yellow-300" }, rankPart),
                                    React.createElement("span", null, " ", namePart)
                                )
                            ) : (
                                namePart
                            )
                        )
                    );
                })
            )
        )
    );
  };

    const renderEditableOfficerList = (title, listType, officers, zoneIdx, groupIdx, groupIsEditable) => {
    const key = `${zoneIdx}-${groupIdx}-${listType}`;
    const searchTerm = addOfficerInput[key] || '';
    const filteredPersonnel = allPersonnel.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      React.createElement("div", { className: "mt-4 pt-4 border-t border-zinc-700/50" },
        React.createElement("h5", { className: "font-semibold text-blue-300 mb-2" }, title),
        React.createElement("div", { className: "space-y-2" },
          (officers || []).map((officer, officerIdx) => (
            React.createElement("div", { key: officerIdx, className: "flex items-center gap-2 animate-fade-in" },
              React.createElement("input", {
                type: "text",
                value: officer,
                onChange: (e) => handleOfficerListChange(zoneIdx, groupIdx, listType, officerIdx, e.target.value),
                className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800 disabled:text-zinc-500",
                disabled: !groupIsEditable
              }),
              React.createElement("button", {
                type: "button",
                onClick: () => handleRemoveFromOfficerList(zoneIdx, groupIdx, listType, officerIdx),
                className: "p-1 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                "aria-label": `Eliminar ${officer}`,
                disabled: !groupIsEditable
              },
                React.createElement(TrashIcon, { className: "w-5 h-5" })
              )
            )
          ))
        ),
        React.createElement("div", { className: "mt-3 relative" },
          React.createElement("input", {
            type: "text",
            placeholder: "Buscar personal para añadir...",
            value: searchTerm,
            onChange: e => setAddOfficerInput(prev => ({ ...prev, [key]: e.target.value })),
            onFocus: () => setActiveDropdown(key),
            onBlur: () => setTimeout(() => setActiveDropdown(null), 200),
            className: "w-full bg-zinc-900 border-zinc-700 rounded-md px-3 py-2 text-white disabled:bg-zinc-800",
            disabled: !groupIsEditable
          }),
           activeDropdown === key && searchTerm && (
             React.createElement("div", { className: "absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-md shadow-lg max-h-60 overflow-y-auto" },
              React.createElement("ul", { className: "divide-y divide-zinc-700" },
                filteredPersonnel.map(p => (
                  React.createElement("li", {
                    key: p.id,
                    onMouseDown: () => handleAddToOfficerList(zoneIdx, groupIdx, listType, p),
                    className: "px-4 py-2 hover:bg-zinc-700 cursor-pointer text-sm text-zinc-300 flex justify-between items-center"
                  },
                    React.createElement("div", null,
                      React.createElement("div", { className: "font-bold text-white" }, p.name),
                      React.createElement("div", { className: "text-xs text-yellow-400" }, p.rank)
                    ),
                    React.createElement("div", { className: "text-xs text-zinc-400 font-mono" }, "L.P. ", p.id)
                  )
                ))
              )
            )
           )
        )
      )
    );
  };

  return (
    React.createElement("div", { className: "animate-fade-in" },
        React.createElement("datalist", { id: "personnel-list-for-units" },
            allPersonnel.map(p => (
                React.createElement("option", { key: p.id, value: p.name })
            ))
        ),
        React.createElement("datalist", { id: "unit-list-nomenclador" },
            unitList.map(unitId => React.createElement("option", { key: unitId, value: unitId }))
        ),
      React.createElement("div", { className: "mb-6 bg-zinc-800/60 p-4 rounded-xl" },
        React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start gap-4" },
          React.createElement("div", null,
            React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Reporte de Unidades de Bomberos"),
            React.createElement("p", { className: "text-zinc-400" }, "Fecha del reporte: ", new Date().toLocaleString('es-AR'))
          ),
          React.createElement("div", { className: "flex items-center gap-4 flex-wrap" },
              React.createElement("div", { className: "relative w-full sm:w-auto min-w-[250px]" },
                React.createElement(SearchIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" }),
                React.createElement("input", {
                  type: "text",
                  placeholder: "Buscar unidades, personal, etc...",
                  value: searchTerm,
                  onChange: (e) => onSearchChange(e.target.value),
                  className: "w-full bg-zinc-700/80 border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500",
                  "aria-label": "Buscar"
                })
              ),
              isEditing ? (
                  React.createElement("div", { className: "flex items-center gap-2" },
                      React.createElement("button", { onClick: handleSave, className: "px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5" }), " Guardar"),
                      React.createElement("button", { onClick: handleCancel, className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors" }, React.createElement(XCircleIcon, { className: "w-6 h-6" }))
                  )
              ) : (
                  React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("button", { onClick: () => exportUnitReportToPdf(reportData), className: "px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" },
                        React.createElement(DownloadIcon, { className: "w-5 h-5" }), " Exportar PDF"
                    ),
                    React.createElement("button", { onClick: handleEdit, className: "px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" },
                        React.createElement(PencilIcon, { className: "w-5 h-5" }), " Editar"
                    )
                  )
              )
          )
        ),
        React.createElement("div", { className: "mt-4 flex flex-wrap gap-2 text-sm" },
            React.createElement("span", { className: "px-3 py-1 bg-zinc-700 rounded-full text-white" }, "Total: ", React.createElement("strong", null, stats.total)),
            React.createElement("span", { className: `px-3 py-1 rounded-full ${getStatusColor('para servicio')}` }, "En Servicio: ", React.createElement("strong", null, stats.inService)),
            React.createElement("span", { className: `px-3 py-1 rounded-full ${getStatusColor('fuera de servicio')}` }, "Fuera de Servicio: ", React.createElement("strong", null, stats.outOfService)),
            React.createElement("span", { className: `px-3 py-1 rounded-full ${getStatusColor('reserva')}` }, "Reserva: ", React.createElement("strong", null, stats.reserve)),
            React.createElement("span", { className: `px-3 py-1 rounded-full ${getStatusColor('préstamo')}` }, "A Préstamo: ", React.createElement("strong", null, stats.onLoan))
        )
      ),
      
      React.createElement("div", { className: "space-y-6" },
        filteredData.zones.map((zone, zoneIdx) => (
          React.createElement("div", { key: zone.name, className: "bg-zinc-800/60 rounded-xl overflow-hidden" },
            React.createElement("button", {
              onClick: () => toggleZone(zone.name),
              className: "w-full flex justify-between items-center p-4 bg-red-800/50 hover:bg-red-800/70 transition-colors"
            },
              React.createElement("h3", { className: "text-2xl font-bold text-white" }, zone.name),
              React.createElement(ChevronDownIcon, { className: `w-6 h-6 text-white transition-transform duration-300 ${collapsedZones.has(zone.name) ? '' : 'rotate-180'}` })
            ),
            !collapsedZones.has(zone.name) && (
              React.createElement("div", { className: "p-4 space-y-4 animate-fade-in" },
                zone.groups.map((group, groupIdx) => {
                    const totalPersonnelInUnits = group.units.reduce((sum, unit) => sum + (unit.personnelCount || 0), 0);
                    const totalStandbyOfficers = (group.standbyOfficers || []).length;
                    const totalPersonnel = totalPersonnelInUnits + totalStandbyOfficers;
                    const groupIsEditable = isEditing && isGroupEditable(group.name, currentUser);
                    return (
                      React.createElement("div", { key: group.name, className: `bg-zinc-900/40 p-4 rounded-lg ${isEditing && !groupIsEditable ? 'opacity-60' : ''}` },
                        React.createElement("h4", { className: "text-xl font-semibold text-yellow-300 mb-2 border-b border-zinc-700 pb-2 flex justify-between items-center" },
                          React.createElement("span", null, group.name),
                          React.createElement("span", { className: "text-base text-zinc-300 font-medium" }, "Personal Total: ", React.createElement("span", { className: "font-bold text-white" }, totalPersonnel))
                        ),
                        React.createElement("div", { className: "overflow-x-auto" },
                          React.createElement("table", { className: "w-full text-left" },
                            React.createElement("thead", null,
                              React.createElement("tr", { className: "text-sm text-zinc-400" },
                                React.createElement("th", { className: "p-2 w-24" }, "Interno"),
                                React.createElement("th", { className: "p-2" }, "Unidad"),
                                React.createElement("th", { className: "p-2" }, "Tipo"),
                                React.createElement("th", { className: "p-2" }, "Estado"),
                                React.createElement("th", { className: "p-2" }, "Oficial a Cargo"),
                                React.createElement("th", { className: "p-2" }, "POC"),
                                React.createElement("th", { className: "p-2 text-right w-24" }, "Personal"),
                                isEditing && React.createElement("th", { className: "p-2 w-12", "aria-label": "Acciones" })
                              )
                            ),
                            React.createElement("tbody", null,
                              group.units.map((unit, unitIdx) => (
                                React.createElement("tr", { key: unit.id + unitIdx, className: "border-t border-zinc-700 hover:bg-zinc-700/50" },
                                   React.createElement("td", { className: "p-2" },
                                    isEditing ? (
                                      React.createElement("input", {
                                        type: "text",
                                        value: unit.internalId || '',
                                        onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'internalId', e.target.value),
                                        className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800",
                                        disabled: !groupIsEditable
                                      })
                                    ) : (
                                      React.createElement("span", { className: "text-zinc-300" }, unit.internalId || '-')
                                    )
                                  ),
                                  React.createElement("td", { className: "p-2 font-mono text-zinc-200" },
                                     isEditing ? (
                                      React.createElement("input", {
                                        type: "text", value: unit.id,
                                        onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'id', e.target.value),
                                        className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800",
                                        list: "unit-list-nomenclador",
                                        disabled: !groupIsEditable
                                        })
                                    ) : unit.id
                                  ),
                                  React.createElement("td", { className: "p-2 text-zinc-300" },
                                      isEditing ? (
                                        React.createElement("select", {
                                          value: unit.type,
                                          onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'type', e.target.value),
                                          className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800",
                                          disabled: !groupIsEditable
                                        }, 
                                          !unitTypes.includes(unit.type) && React.createElement("option", { key: unit.type, value: unit.type }, unit.type),
                                          unitTypes.map(type => React.createElement("option", { key: type, value: type }, type))
                                        )
                                    ) : unit.type
                                  ),
                                  React.createElement("td", { className: "p-2" },
                                    isEditing ? (
                                        React.createElement("div", { className: "flex flex-col" },
                                            React.createElement("select", {
                                                value: unit.status,
                                                onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'status', e.target.value),
                                                className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800",
                                                disabled: !groupIsEditable
                                            },
                                                React.createElement("option", null, "Para Servicio"),
                                                React.createElement("option", null, "Fuera de Servicio"),
                                                React.createElement("option", null, "Reserva"),
                                                React.createElement("option", null, "A Préstamo")
                                            ),
                                            unit.status.toLowerCase().includes('fuera de servicio') && (
                                                React.createElement("input", {
                                                    type: "text",
                                                    placeholder: "Motivo...",
                                                    value: unit.outOfServiceReason || '',
                                                    onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'outOfServiceReason', e.target.value),
                                                    className: "mt-1 w-full bg-zinc-900 border-zinc-700 rounded-md px-2 py-1 text-white text-xs disabled:bg-zinc-800",
                                                    disabled: !groupIsEditable
                                                })
                                            )
                                        )
                                    ) : (
                                        React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}` },
                                                unit.status
                                            ),
                                            unit.status.toLowerCase().includes('fuera de servicio') && unit.outOfServiceReason && (
                                                React.createElement("div", { className: "text-xs text-red-400 italic mt-1" }, unit.outOfServiceReason)
                                            )
                                        )
                                    )
                                  ),
                                  React.createElement("td", { className: "p-2 text-zinc-300" },
                                    isEditing ? (
                                        React.createElement("input", {
                                            type: "text",
                                            list: "personnel-list-for-units",
                                            value: unit.officerInCharge || '',
                                            onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'officerInCharge', e.target.value),
                                            onBlur: (e) => {
                                                const person = allPersonnel.find(p => p.name === e.target.value);
                                                if (person) {
                                                    handleUnitChange(zoneIdx, groupIdx, unitIdx, 'officerInCharge', `${person.rank} ${person.name}`);
                                                }
                                            },
                                            className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800",
                                            placeholder: "Nombre...",
                                            disabled: !groupIsEditable
                                        })
                                    ) : (() => {
                                        const officerInChargeText = unit.officerInCharge || '-';
                                        let rankPart = '';
                                        let namePart = officerInChargeText;

                                        for (const rank of sortedRanks) {
                                            if (officerInChargeText.toUpperCase().startsWith(rank + ' ')) {
                                                rankPart = officerInChargeText.substring(0, rank.length);
                                                namePart = officerInChargeText.substring(rank.length).trim();
                                                break;
                                            }
                                        }
                                        
                                        return rankPart ? (
                                            React.createElement(React.Fragment, null,
                                                React.createElement("span", { className: "font-semibold text-yellow-300" }, rankPart),
                                                React.createElement("span", null, " ", namePart)
                                            )
                                        ) : (
                                            namePart
                                        );
                                    })()
                                  ),
                                  React.createElement("td", { className: "p-2 text-zinc-300" },
                                     isEditing ? (
                                      React.createElement("input", {
                                        type: "text", value: unit.poc || '',
                                        onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'poc', e.target.value),
                                        className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800",
                                        disabled: !groupIsEditable
                                        })
                                    ) : (unit.poc || '-')
                                  ),
                                  React.createElement("td", { className: "p-2 text-right text-zinc-200 font-semibold" },
                                    isEditing ? (
                                        React.createElement("input", {
                                            type: "number",
                                            value: unit.personnelCount ?? '',
                                            onChange: (e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'personnelCount', e.target.value),
                                            className: "w-20 bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-right disabled:bg-zinc-800",
                                            disabled: !groupIsEditable
                                        })
                                    ) : (unit.personnelCount ?? '-')
                                  ),
                                   isEditing && (
                                        React.createElement("td", { className: "p-2 text-center" },
                                            React.createElement("button", {
                                                type: "button",
                                                onClick: () => handleRemoveUnit(zoneIdx, groupIdx, unitIdx),
                                                className: "p-1 text-red-400 hover:text-red-300 disabled:opacity-50",
                                                "aria-label": "Eliminar unidad",
                                                disabled: !groupIsEditable
                                            },
                                                React.createElement(TrashIcon, { className: "w-5 h-5" })
                                            )
                                        )
                                    )
                                )
                              ))
                            ),
                             isEditing && (
                                React.createElement("tfoot", null,
                                    React.createElement("tr", null,
                                        React.createElement("td", { colSpan: 8, className: "pt-2" },
                                            React.createElement("button", {
                                                type: "button",
                                                onClick: () => handleAddUnit(zoneIdx, groupIdx),
                                                className: "w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-green-600/50 hover:bg-green-600/80 rounded-md text-white transition-colors disabled:opacity-50",
                                                disabled: !groupIsEditable
                                            },
                                                React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), " Añadir Unidad"
                                            )
                                        )
                                    )
                                )
                            )
                          )
                        ),
                        isEditing ? (
                            React.createElement(React.Fragment, null,
                                renderEditableOfficerList('Oficiales de Dotación', 'crewOfficers', group.crewOfficers, zoneIdx, groupIdx, groupIsEditable),
                                renderEditableOfficerList('Oficiales en Estación en Apresto', 'standbyOfficers', group.standbyOfficers, zoneIdx, groupIdx, groupIsEditable)
                            )
                        ) : (
                            React.createElement(React.Fragment, null,
                                renderOfficerList("Oficiales de Dotación", group.crewOfficers),
                                renderOfficerList("Oficiales en Estación en Apresto", group.standbyOfficers)
                            )
                        )
                      )
                    )
                })
              )
            )
          )
        ))
      )
    )
  );
};
export default UnitReportDisplay;