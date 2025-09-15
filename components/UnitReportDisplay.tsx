import React, { useState, useMemo, useRef } from 'react';
import { UnitReportData, Zone, UnitGroup, FireUnit, Personnel, RANKS, User } from '../types';
import { ChevronDownIcon, SearchIcon, PencilIcon, XCircleIcon, TrashIcon, PlusCircleIcon, DownloadIcon } from './icons';
import { exportUnitReportToPdf } from '../services/exportService';

interface UnitReportDisplayProps {
  reportData: UnitReportData;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUpdateReport: (updatedData: UnitReportData) => void;
  commandPersonnel: Personnel[];
  servicePersonnel: Personnel[];
  unitList: string[];
  unitTypes: string[];
  currentUser: User;
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('para servicio')) return 'bg-green-600 text-white';
  if (s.includes('fuera de servicio')) return 'bg-red-600 text-white';
  if (s.includes('reserva')) return 'bg-yellow-500 text-gray-900';
  if (s.includes('préstamo')) return 'bg-blue-500 text-white';
  return 'bg-zinc-500 text-white';
};

const normalize = (str: string) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/["'“”]/g, "").replace(/\./g, "").replace(/\s+/g, ' ').trim() : '';

const isGroupViewable = (groupName: string, user: User | null): boolean => {
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
        normalizedGroupName.includes('DESTACAMENTO VELEZ SARSFIELD')) {
        return true;
    }

    // Special rule: Estacion IX can view DTO Devoto.
    if (normalizedUserStation.startsWith('ESTACION IX ') &&
        (normalizedGroupName.includes('DESTACAMENTO DEVOTO'))) {
        return true;
    }

    return false;
};

const isGroupEditable = (groupName: string, user: User | null): boolean => {
    return isGroupViewable(groupName, user);
};


const UnitReportDisplay: React.FC<UnitReportDisplayProps> = ({ reportData, searchTerm, onSearchChange, onUpdateReport, commandPersonnel, servicePersonnel, unitList, unitTypes, currentUser }) => {
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editableReport, setEditableReport] = useState<UnitReportData | null>(null);
  const [addOfficerInput, setAddOfficerInput] = useState<{ [key: string]: string }>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);


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
      const editableGroupsMap = new Map<string, UnitGroup>();
      
      editableReport.zones.forEach(zone => {
          zone.groups.forEach(group => {
              editableGroupsMap.set(group.name, group);
          });
      });

      fullReport.zones.forEach((zone: Zone) => {
          zone.groups.forEach((group: UnitGroup, groupIndex: number) => {
              if (editableGroupsMap.has(group.name)) {
                  zone.groups[groupIndex] = editableGroupsMap.get(group.name)!;
              }
          });
      });
      
      const reportWithDate = { ...fullReport, reportDate: new Date().toLocaleString('es-AR') };
      onUpdateReport(reportWithDate);
    }
    setIsEditing(false);
    setEditableReport(null);
  };

  const handleUnitChange = (zoneIdx: number, groupIdx: number, unitIdx: number, field: keyof FireUnit, value: string) => {
      setEditableReport(prev => {
          if (!prev) return null;
          const newReport = JSON.parse(JSON.stringify(prev));
          const unit = newReport.zones[zoneIdx].groups[groupIdx].units[unitIdx];

          if (field === 'personnelCount') {
              const numValue = value === '' ? null : parseInt(value, 10);
              unit[field] = isNaN(numValue as number) ? null : numValue;
          } else {
              (unit as any)[field] = value;
          }
          
          if (field === 'status' && !value.toLowerCase().includes('fuera de servicio')) {
            unit.outOfServiceReason = '';
          }

          return newReport;
      });
  };
  
    const handleAddUnit = (zoneIdx: number, groupIdx: number) => {
     setEditableReport(prev => {
       if (!prev) return null;
       const newReport = JSON.parse(JSON.stringify(prev));
       const newUnit: FireUnit = {
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

   const handleRemoveUnit = (zoneIdx: number, groupIdx: number, unitIdx: number) => {
       if (window.confirm("¿Está seguro de que desea eliminar esta unidad del reporte?")) {
           setEditableReport(prev => {
               if (!prev) return null;
               const newReport = JSON.parse(JSON.stringify(prev));
               newReport.zones[zoneIdx].groups[groupIdx].units.splice(unitIdx, 1);
               return newReport;
           });
       }
   };

  const handleOfficerListChange = (zoneIdx: number, groupIdx: number, listType: 'crewOfficers' | 'standbyOfficers', officerIdx: number, value: string) => {
    setEditableReport(prev => {
        if (!prev) return null;
        const newReport = JSON.parse(JSON.stringify(prev));
        const group = newReport.zones[zoneIdx].groups[groupIdx];
        if (!group[listType]) group[listType] = [];
        (group[listType] as string[])[officerIdx] = value;
        return newReport;
    });
  };

  const handleRemoveFromOfficerList = (zoneIdx: number, groupIdx: number, listType: 'crewOfficers' | 'standbyOfficers', officerIdx: number) => {
    setEditableReport(prev => {
        if (!prev) return null;
        const newReport = JSON.parse(JSON.stringify(prev));
        const group = newReport.zones[zoneIdx].groups[groupIdx];
        group[listType]?.splice(officerIdx, 1);
        return newReport;
    });
  };

  const handleAddToOfficerList = (zoneIdx: number, groupIdx: number, listType: 'crewOfficers' | 'standbyOfficers', person: Personnel) => {
    const value = `${person.rank} ${person.name}`;
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      const group = newReport.zones[zoneIdx].groups[groupIdx];
      if (!group[listType]) group[listType] = [];
      (group[listType] as string[]).push(value);
      return newReport;
    });
    const key = `${zoneIdx}-${groupIdx}-${listType}`;
    setAddOfficerInput(prev => ({ ...prev, [key]: '' }));
    setActiveDropdown(null);
  };

  const dataToDisplay = isEditing ? editableReport : viewableReportData;

  const toggleZone = (zoneName: string) => {
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
  
  const renderOfficerList = (title: string, officers?: string[]) => {
    if (!officers || officers.length === 0) return null;
    return (
        <div className="mt-4 pl-2">
            <h5 className="font-semibold text-blue-300 mb-1">{title}</h5>
            <ul className="list-disc list-inside text-zinc-300 space-y-1">
                {officers.map((officer, index) => {
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
                        <li key={index}>
                            {rankPart ? (
                                <>
                                    <span className="font-semibold text-yellow-300">{rankPart}</span>
                                    <span> {namePart}</span>
                                </>
                            ) : (
                                namePart
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
  };

    const renderEditableOfficerList = (title: string, listType: 'crewOfficers' | 'standbyOfficers', officers: string[] | undefined, zoneIdx: number, groupIdx: number, groupIsEditable: boolean) => {
    const key = `${zoneIdx}-${groupIdx}-${listType}`;
    const searchTerm = addOfficerInput[key] || '';
    const filteredPersonnel = allPersonnel.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        <h5 className="font-semibold text-blue-300 mb-2">{title}</h5>
        <div className="space-y-2">
          {(officers || []).map((officer, officerIdx) => (
            <div key={officerIdx} className="flex items-center gap-2 animate-fade-in">
              <input
                type="text"
                value={officer}
                onChange={(e) => handleOfficerListChange(zoneIdx, groupIdx, listType, officerIdx, e.target.value)}
                className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800 disabled:text-zinc-500"
                disabled={!groupIsEditable}
              />
              <button
                type="button"
                onClick={() => handleRemoveFromOfficerList(zoneIdx, groupIdx, listType, officerIdx)}
                className="p-1 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Eliminar ${officer}`}
                disabled={!groupIsEditable}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Buscar personal para añadir..."
            value={searchTerm}
            onChange={e => setAddOfficerInput(prev => ({ ...prev, [key]: e.target.value }))}
            onFocus={() => setActiveDropdown(key)}
            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
            className="w-full bg-zinc-900 border-zinc-700 rounded-md px-3 py-2 text-white disabled:bg-zinc-800"
            disabled={!groupIsEditable}
          />
           {activeDropdown === key && searchTerm && (
             <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <ul className="divide-y divide-zinc-700">
                {filteredPersonnel.map(p => (
                  <li
                    key={p.id}
                    onMouseDown={() => handleAddToOfficerList(zoneIdx, groupIdx, listType, p)}
                    className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-sm text-zinc-300 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-xs text-yellow-400">{p.rank}</div>
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">L.P. {p.id}</div>
                  </li>
                ))}
              </ul>
            </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
        <datalist id="personnel-list-for-units">
            {allPersonnel.map(p => (
                <option key={p.id} value={p.name} />
            ))}
        </datalist>
        <datalist id="unit-list-nomenclador">
            {unitList.map(unitId => <option key={unitId} value={unitId} />)}
        </datalist>
      <div className="mb-6 bg-zinc-800/60 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Reporte de Unidades de Bomberos</h2>
            <p className="text-zinc-400">Fecha del reporte: {new Date().toLocaleString('es-AR')}</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
              <div className="relative w-full sm:w-auto min-w-[250px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar unidades, personal, etc..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-zinc-700/80 border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Buscar"
                />
              </div>
              {isEditing ? (
                  <div className="flex items-center gap-2">
                      <button onClick={handleSave} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2"><PencilIcon className="w-5 h-5" /> Guardar</button>
                      <button onClick={handleCancel} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"><XCircleIcon className="w-6 h-6" /></button>
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => exportUnitReportToPdf(reportData)} className="px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2">
                        <DownloadIcon className="w-5 h-5" /> Exportar PDF
                    </button>
                    <button onClick={handleEdit} className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2">
                        <PencilIcon className="w-5 h-5" /> Editar
                    </button>
                  </div>
              )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 bg-zinc-700 rounded-full text-white">Total: <strong>{stats.total}</strong></span>
            <span className={`px-3 py-1 rounded-full ${getStatusColor('para servicio')}`}>En Servicio: <strong>{stats.inService}</strong></span>
            <span className={`px-3 py-1 rounded-full ${getStatusColor('fuera de servicio')}`}>Fuera de Servicio: <strong>{stats.outOfService}</strong></span>
            <span className={`px-3 py-1 rounded-full ${getStatusColor('reserva')}`}>Reserva: <strong>{stats.reserve}</strong></span>
            <span className={`px-3 py-1 rounded-full ${getStatusColor('préstamo')}`}>A Préstamo: <strong>{stats.onLoan}</strong></span>
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredData.zones.map((zone, zoneIdx) => (
          <div key={zone.name} className="bg-zinc-800/60 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleZone(zone.name)}
              className="w-full flex justify-between items-center p-4 bg-red-800/50 hover:bg-red-800/70 transition-colors"
            >
              <h3 className="text-2xl font-bold text-white">{zone.name}</h3>
              <ChevronDownIcon className={`w-6 h-6 text-white transition-transform duration-300 ${collapsedZones.has(zone.name) ? '' : 'rotate-180'}`} />
            </button>
            {!collapsedZones.has(zone.name) && (
              <div className="p-4 space-y-4 animate-fade-in">
                {zone.groups.map((group, groupIdx) => {
                    const totalPersonnelInUnits = group.units.reduce((sum, unit) => sum + (unit.personnelCount || 0), 0);
                    const totalStandbyOfficers = (group.standbyOfficers || []).length;
                    const totalPersonnel = totalPersonnelInUnits + totalStandbyOfficers;
                    const groupIsEditable = isEditing && isGroupEditable(group.name, currentUser);
                    return (
                      <div key={group.name} className={`bg-zinc-900/40 p-4 rounded-lg ${isEditing && !groupIsEditable ? 'opacity-60' : ''}`}>
                        <h4 className="text-xl font-semibold text-yellow-300 mb-2 border-b border-zinc-700 pb-2 flex justify-between items-center">
                          <span>{group.name}</span>
                          <span className="text-base text-zinc-300 font-medium">Personal Total: <span className="font-bold text-white">{totalPersonnel}</span></span>
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-sm text-zinc-400">
                                <th className="p-2 w-24">Interno</th>
                                <th className="p-2">Unidad</th>
                                <th className="p-2">Tipo</th>
                                <th className="p-2">Estado</th>
                                <th className="p-2">Oficial a Cargo</th>
                                <th className="p-2">POC</th>
                                <th className="p-2 text-right w-24">Personal</th>
                                {isEditing && <th className="p-2 w-12" aria-label="Acciones"></th>}
                              </tr>
                            </thead>
                            <tbody>
                              {group.units.map((unit, unitIdx) => (
                                <tr key={unit.id + unitIdx} className="border-t border-zinc-700 hover:bg-zinc-700/50">
                                   <td className="p-2">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={unit.internalId || ''}
                                        onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'internalId', e.target.value)}
                                        className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800"
                                        disabled={!groupIsEditable}
                                      />
                                    ) : (
                                      <span className="text-zinc-300">{unit.internalId || '-'}</span>
                                    )}
                                  </td>
                                  <td className="p-2 font-mono text-zinc-200">
                                     {isEditing ? (
                                      <input
                                        type="text" value={unit.id}
                                        onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'id', e.target.value)}
                                        className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800"
                                        list="unit-list-nomenclador"
                                        disabled={!groupIsEditable}
                                        />
                                    ) : unit.id}
                                  </td>
                                  <td className="p-2 text-zinc-300">
                                      {isEditing ? (
                                        <select
                                          value={unit.type}
                                          onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'type', e.target.value)}
                                          className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800"
                                          disabled={!groupIsEditable}
                                        >
                                          {!unitTypes.includes(unit.type) && <option key={unit.type} value={unit.type}>{unit.type}</option>}
                                          {unitTypes.map(type => (
                                              <option key={type} value={type}>{type}</option>
                                          ))}
                                        </select>
                                    ) : unit.type}
                                  </td>
                                  <td className="p-2">
                                    {isEditing ? (
                                        <div className="flex flex-col">
                                            <select
                                                value={unit.status}
                                                onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'status', e.target.value)}
                                                className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800"
                                                disabled={!groupIsEditable}
                                            >
                                                <option>Para Servicio</option>
                                                <option>Fuera de Servicio</option>
                                                <option>Reserva</option>
                                                <option>A Préstamo</option>
                                            </select>
                                            {unit.status.toLowerCase().includes('fuera de servicio') && (
                                                <input
                                                    type="text"
                                                    placeholder="Motivo..."
                                                    value={unit.outOfServiceReason || ''}
                                                    onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'outOfServiceReason', e.target.value)}
                                                    className="mt-1 w-full bg-zinc-900 border-zinc-700 rounded-md px-2 py-1 text-white text-xs disabled:bg-zinc-800"
                                                    disabled={!groupIsEditable}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                                                {unit.status}
                                            </span>
                                            {unit.status.toLowerCase().includes('fuera de servicio') && unit.outOfServiceReason && (
                                                <div className="text-xs text-red-400 italic mt-1">{unit.outOfServiceReason}</div>
                                            )}
                                        </>
                                    )}
                                  </td>
                                  <td className="p-2 text-zinc-300">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            list="personnel-list-for-units"
                                            value={unit.officerInCharge || ''}
                                            onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'officerInCharge', e.target.value)}
                                            onBlur={(e) => {
                                                const person = allPersonnel.find(p => p.name === e.target.value);
                                                if (person) {
                                                    handleUnitChange(zoneIdx, groupIdx, unitIdx, 'officerInCharge', `${person.rank} ${person.name}`);
                                                }
                                            }}
                                            className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800"
                                            placeholder="Nombre..."
                                            disabled={!groupIsEditable}
                                        />
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
                                            <>
                                                <span className="font-semibold text-yellow-300">{rankPart}</span>
                                                <span> {namePart}</span>
                                            </>
                                        ) : (
                                            namePart
                                        );
                                    })()}
                                  </td>
                                  <td className="p-2 text-zinc-300">
                                     {isEditing ? (
                                      <input
                                        type="text" value={unit.poc || ''}
                                        onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'poc', e.target.value)}
                                        className="w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white disabled:bg-zinc-800"
                                        disabled={!groupIsEditable}
                                        />
                                    ) : (unit.poc || '-')}
                                  </td>
                                  <td className="p-2 text-right text-zinc-200 font-semibold">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={unit.personnelCount ?? ''}
                                            onChange={(e) => handleUnitChange(zoneIdx, groupIdx, unitIdx, 'personnelCount', e.target.value)}
                                            className="w-20 bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white text-right disabled:bg-zinc-800"
                                            disabled={!groupIsEditable}
                                        />
                                    ) : (unit.personnelCount ?? '-')}
                                  </td>
                                   {isEditing && (
                                        <td className="p-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUnit(zoneIdx, groupIdx, unitIdx)}
                                                className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                                                aria-label="Eliminar unidad"
                                                disabled={!groupIsEditable}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                              ))}
                            </tbody>
                             {isEditing && (
                                <tfoot>
                                    <tr>
                                        <td colSpan={8} className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddUnit(zoneIdx, groupIdx)}
                                                className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-green-600/50 hover:bg-green-600/80 rounded-md text-white transition-colors disabled:opacity-50"
                                                disabled={!groupIsEditable}
                                            >
                                                <PlusCircleIcon className="w-5 h-5" /> Añadir Unidad
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                          </table>
                        </div>
                        {isEditing ? (
                            <>
                                {renderEditableOfficerList('Oficiales de Dotación', 'crewOfficers', group.crewOfficers, zoneIdx, groupIdx, groupIsEditable)}
                                {renderEditableOfficerList('Oficiales en Estación en Apresto', 'standbyOfficers', group.standbyOfficers, zoneIdx, groupIdx, groupIsEditable)}
                            </>
                        ) : (
                            <>
                                {renderOfficerList("Oficiales de Dotación", group.crewOfficers)}
                                {renderOfficerList("Oficiales en Estación en Apresto", group.standbyOfficers)}
                            </>
                        )}
                      </div>
                    )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default UnitReportDisplay;