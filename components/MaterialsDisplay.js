import React, { useState, useMemo } from 'react';
import { PencilIcon, XCircleIcon, TrashIcon, PlusCircleIcon, DownloadIcon, SearchIcon } from './icons.js';
import { exportMaterialsReportToPdf } from '../services/exportService.js';

const getConditionColor = (condition) => {
  const c = condition.toLowerCase();
  if (c === 'para servicio') return 'bg-green-600 text-white';
  if (c === 'fuera de servicio') return 'bg-red-600 text-white';
  return 'bg-zinc-500 text-white';
};

const normalize = (str) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/["'“”]/g, "").replace(/\./g, "").replace(/\s+/g, ' ').trim() : '';

const isLocationViewable = (locationName, user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'station' || !user.station) return false;

    const normalizedUserStation = normalize(user.station);
    const normalizedLocationName = normalize(locationName);

    // A user can always see their own station/detachment.
    if (normalizedUserStation.startsWith(normalizedLocationName)) {
        return true;
    }

    // Special rule: Estacion III Barracas can view and edit Destacamento Boca.
    if (normalizedUserStation.includes('ESTACION III BARRACAS') && normalizedLocationName.includes('DESTACAMENTO BOCA')) {
        return true;
    }

    // Special rule: Estacion II Patricios can view and edit Destacamento Pompeya.
    if (normalizedUserStation.includes('ESTACION II PATRICIOS') && normalizedLocationName.includes('DESTACAMENTO POMPEYA')) {
        return true;
    }

    // Special rule: Estacion IV Recoleta can view DTO Miserere and DTO Retiro.
    if (normalizedUserStation.includes('ESTACION IV RECOLETA') &&
        (normalizedLocationName.includes('DESTACAMENTO MISERERE') || normalizedLocationName.includes('DESTACAMENTO RETIRO'))) {
        return true;
    }
    
    // Special rule: Estacion V can view DTO Urquiza and DTO Saavedra.
    if (normalizedUserStation.startsWith('ESTACION V ') &&
        (normalizedLocationName.includes('DESTACAMENTO URQUIZA') || normalizedLocationName.includes('DESTACAMENTO SAAVEDRA'))) {
        return true;
    }
    
    // Special rule: Estacion VI can view DTO Palermo and DTO Chacarita.
    if (normalizedUserStation.startsWith('ESTACION VI ') &&
        (normalizedLocationName.includes('DESTACAMENTO PALERMO') || normalizedLocationName.includes('DESTACAMENTO CHACARITA'))) {
        return true;
    }

    // Special rule: Estacion VIII can view DTO Velez Sarsfield.
    if (normalizedUserStation.startsWith('ESTACION VIII ') &&
        (normalizedLocationName.includes('DESTACAMENTO VELEZ SARSFIELD'))) {
        return true;
    }

    // Special rule: Estacion IX can view DTO Devoto.
    if (normalizedUserStation.startsWith('ESTACION IX ') &&
        (normalizedLocationName.includes('DESTACAMENTO DEVOTO'))) {
        return true;
    }

    return false;
};

const isLocationEditable = (locationName, user) => {
    return isLocationViewable(locationName, user);
};


const MaterialsDisplay = ({ reportData, onUpdateReport, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableReport, setEditableReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const viewableReportData = useMemo(() => {
    if (!reportData || !currentUser || currentUser.role === 'admin') {
      return reportData;
    }
    return {
      ...reportData,
      locations: reportData.locations.filter(location => isLocationViewable(location.name, currentUser))
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
      const editableLocationsMap = new Map();
      editableReport.locations.forEach(loc => {
          editableLocationsMap.set(loc.name, loc);
      });

      fullReport.locations.forEach((loc, locIndex) => {
          if (editableLocationsMap.has(loc.name)) {
              fullReport.locations[locIndex] = editableLocationsMap.get(loc.name);
          }
      });
        
      const reportWithDate = { ...fullReport, reportDate: new Date().toLocaleString('es-AR') };
      onUpdateReport(reportWithDate);
    }
    setIsEditing(false);
    setEditableReport(null);
  };

  const handleMaterialChange = (locIdx, matIdx, field, value) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      const material = newReport.locations[locIdx].materials[matIdx];
      if (field === 'quantity') {
        material[field] = parseInt(value, 10) || 0;
      } else {
        material[field] = value;
      }
      return newReport;
    });
  };

  const handleAddMaterial = (locIdx) => {
    setEditableReport(prev => {
      if (!prev) return null;
      const newReport = JSON.parse(JSON.stringify(prev));
      const newMaterial = {
        id: `mat-${Date.now()}`,
        name: 'Nuevo Material',
        quantity: 1,
        condition: 'Para Servicio',
        location: ''
      };
      newReport.locations[locIdx].materials.push(newMaterial);
      return newReport;
    });
  };

  const handleRemoveMaterial = (locIdx, matIdx) => {
     if (window.confirm("¿Está seguro de que desea eliminar este material?")) {
        setEditableReport(prev => {
            if (!prev) return null;
            const newReport = JSON.parse(JSON.stringify(prev));
            newReport.locations[locIdx].materials.splice(matIdx, 1);
            return newReport;
        });
     }
  };
  
  const data = isEditing ? editableReport : viewableReportData;

  const filteredLocations = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data.locations;

    const lowercasedFilter = searchTerm.toLowerCase();
    
    return data.locations
      .map(location => {
        const locationNameMatches = location.name.toLowerCase().includes(lowercasedFilter);

        const filteredMaterials = location.materials.filter(material =>
          material.name.toLowerCase().includes(lowercasedFilter) ||
          material.condition.toLowerCase().includes(lowercasedFilter) ||
          (material.location || '').toLowerCase().includes(lowercasedFilter)
        );

        if (locationNameMatches) {
          return location; // If location name matches, return the whole location with all its materials
        }

        if (filteredMaterials.length > 0) {
          return { ...location, materials: filteredMaterials }; // If only materials match, return location with filtered materials
        }

        return null;
      })
      .filter((location) => location !== null);
  }, [data, searchTerm]);

  if (!data) return null;

  return (
    React.createElement("div", { className: "animate-fade-in" },
        React.createElement("div", { className: "mb-6 bg-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Inventario de Materiales"),
                React.createElement("p", { className: "text-zinc-400" }, "Fecha del reporte: ", data.reportDate)
            ),
             React.createElement("div", { className: "flex items-center gap-4 flex-wrap" },
                  React.createElement("div", { className: "relative w-full sm:w-auto min-w-[250px]" },
                    React.createElement(SearchIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" }),
                    React.createElement("input", {
                      type: "text",
                      placeholder: "Buscar por ubicación o material...",
                      value: searchTerm,
                      onChange: (e) => setSearchTerm(e.target.value),
                      className: "w-full bg-zinc-700/80 border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500",
                      "aria-label": "Buscar materiales"
                    })
                  ),
                 isEditing ? (
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("button", { onClick: handleSave, className: "px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5" }), " Guardar"),
                        React.createElement("button", { onClick: handleCancel, className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors" }, React.createElement(XCircleIcon, { className: "w-6 h-6" }))
                    )
                ) : (
                    React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: () => exportMaterialsReportToPdf(reportData), className: "px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" },
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
                        React.createElement("th", { className: "p-3 w-1/4" }, "ESTACIÓN / DEST."),
                        React.createElement("th", { className: "p-3" }, "MATERIAL"),
                        React.createElement("th", { className: "p-3 w-24 text-center" }, "CANT."),
                        React.createElement("th", { className: "p-3" }, "CONDICIÓN"),
                        React.createElement("th", { className: "p-3" }, "UBICACIÓN INTERNA"),
                        isEditing && React.createElement("th", { className: "p-3 w-12" })
                    )
                ),
                React.createElement("tbody", null,
                    filteredLocations.length > 0 ? (
                        filteredLocations.flatMap((loc, locIndex) => {
                            const sourceData = isEditing ? editableReport : reportData;
                            const originalLocIdx = sourceData.locations.findIndex(originalLoc => originalLoc.name === loc.name);
                            const locIsEditable = isEditing && isLocationEditable(loc.name, currentUser);

                            if (loc.materials.length === 0) {
                                return (
                                     React.createElement("tr", { key: loc.name, className: `border-t border-zinc-700 ${isEditing && !locIsEditable ? 'opacity-60' : ''}` },
                                        React.createElement("td", { className: "p-3 font-semibold text-yellow-300 align-top" },
                                            isEditing ? (
                                                React.createElement("div", { className: "flex flex-col items-start gap-2" },
                                                    React.createElement("span", null, loc.name),
                                                    React.createElement("button", { onClick: () => handleAddMaterial(originalLocIdx), className: "flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white disabled:opacity-50", disabled: !locIsEditable }, React.createElement(PlusCircleIcon, { className: "w-4 h-4" }), " Añadir Material")
                                                )
                                            ) : loc.name
                                        ),
                                        React.createElement("td", { colSpan: isEditing ? 5 : 4, className: "p-3 text-zinc-500 italic" }, "No hay materiales registrados.")
                                    )
                                );
                            }
                            return loc.materials.map((mat, matIdx) => {
                                const originalMatIdx = sourceData.locations[originalLocIdx].materials.findIndex(originalMat => originalMat.id === mat.id);
                                return (
                                    React.createElement("tr", { key: mat.id, className: `border-t border-zinc-700 ${isEditing && !locIsEditable ? 'opacity-60' : 'hover:bg-zinc-700/50'}` },
                                        matIdx === 0 && (
                                            React.createElement("td", { rowSpan: loc.materials.length, className: "p-3 font-semibold text-yellow-300 align-top" },
                                                isEditing ? (
                                                    React.createElement("div", { className: "flex flex-col items-start gap-2" },
                                                        React.createElement("span", null, loc.name),
                                                        React.createElement("button", { onClick: () => handleAddMaterial(originalLocIdx), className: "flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white disabled:opacity-50", disabled: !locIsEditable }, React.createElement(PlusCircleIcon, { className: "w-4 h-4" }), " Añadir Material")
                                                    )
                                                ) : loc.name
                                            )
                                        ),
                                        isEditing ? (
                                            React.createElement(React.Fragment, null,
                                                React.createElement("td", null, React.createElement("input", { value: mat.name, onChange: e => handleMaterialChange(originalLocIdx, originalMatIdx, 'name', e.target.value), className: "w-full bg-zinc-700 rounded p-1 disabled:bg-zinc-800", disabled: !locIsEditable })),
                                                React.createElement("td", { className: "text-center" }, React.createElement("input", { type: "number", value: mat.quantity, onChange: e => handleMaterialChange(originalLocIdx, originalMatIdx, 'quantity', e.target.value), className: "w-20 bg-zinc-700 rounded p-1 text-center disabled:bg-zinc-800", disabled: !locIsEditable })),
                                                React.createElement("td", null,
                                                    React.createElement("select", { value: mat.condition, onChange: e => handleMaterialChange(originalLocIdx, originalMatIdx, 'condition', e.target.value), className: `w-full border-zinc-600 rounded p-1 font-semibold ${getConditionColor(mat.condition)} disabled:bg-zinc-800 disabled:text-zinc-500`, disabled: !locIsEditable },
                                                        React.createElement("option", { value: "Para Servicio" }, "Para Servicio"),
                                                        React.createElement("option", { value: "Fuera de Servicio" }, "Fuera de Servicio")
                                                    )
                                                ),
                                                React.createElement("td", null, React.createElement("input", { value: mat.location || '', onChange: e => handleMaterialChange(originalLocIdx, originalMatIdx, 'location', e.target.value), className: "w-full bg-zinc-700 rounded p-1 disabled:bg-zinc-800", disabled: !locIsEditable })),
                                                React.createElement("td", null, React.createElement("button", { onClick: () => handleRemoveMaterial(originalLocIdx, originalMatIdx), className: "p-1 text-red-400 hover:text-red-300 disabled:opacity-50", disabled: !locIsEditable }, React.createElement(TrashIcon, { className: "w-5 h-5" })))
                                            )
                                        ) : (
                                            React.createElement(React.Fragment, null,
                                                React.createElement("td", { className: "p-3 text-zinc-200" }, mat.name),
                                                React.createElement("td", { className: "p-3 text-center font-bold text-white" }, mat.quantity),
                                                React.createElement("td", { className: "p-3" }, React.createElement("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(mat.condition)}` }, mat.condition)),
                                                React.createElement("td", { className: "p-3 text-zinc-300" }, mat.location || '-')
                                            )
                                        )
                                    )
                                );
                            });
                        })
                    ) : (
                        React.createElement("tr", null,
                            React.createElement("td", { colSpan: isEditing ? 6 : 5, className: "text-center py-12 text-zinc-500" },
                                searchTerm ? "No se encontraron resultados para su búsqueda." : "No hay materiales registrados."
                            )
                        )
                    )
                )
            )
        )
    )
  );
};

export default MaterialsDisplay;