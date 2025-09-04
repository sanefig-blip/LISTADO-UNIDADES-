

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RANKS } from '../types.js';
import { CalendarIcon, UserGroupIcon, ClipboardListIcon, ChevronDownIcon, PencilIcon, XCircleIcon, AnnotationIcon, PlusCircleIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon, BookmarkIcon, RefreshIcon, SearchIcon } from './icons.js';
import AssignmentCard from './AssignmentCard.js';

const ServiceSection = ({ service, index, totalServices, isSelected, onUpdateService, onMoveService, onDeleteService, onToggleSelection, onSaveAsTemplate, onReplaceFromTemplate, commandPersonnel, servicePersonnel, unitList }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableService, setEditableService] = useState(() => JSON.parse(JSON.stringify(service)));
  const [personnelDropdownOpenFor, setPersonnelDropdownOpenFor] = useState(null);
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState('');
  const personnelSearchInputRefs = useRef([]);
  
  const serviceId = `service-content-${service.id}`;
  
  const allPersonnel = useMemo(() => {
    const combined = [...servicePersonnel, ...commandPersonnel];
    const uniquePersonnel = Array.from(new Map(combined.map(p => [p.id, p])).values());
    return uniquePersonnel.sort((a, b) => a.name.localeCompare(b.name));
  }, [servicePersonnel, commandPersonnel]);

  useEffect(() => {
    setEditableService(JSON.parse(JSON.stringify(service)));
  }, [service]);

  const handleInputChange = (e, assignmentIndex) => {
    const { name, value } = e.target;
    
    setEditableService(prev => {
      if (assignmentIndex !== undefined) {
        const newAssignments = [...prev.assignments];
        const currentAssignment = { ...newAssignments[assignmentIndex] };
        currentAssignment[name] = value;
        newAssignments[assignmentIndex] = currentAssignment;
        return { ...prev, assignments: newAssignments };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddPersonnelToDetails = (assignmentIndex, person) => {
    const personDetailString = `${person.rank} L.P. ${person.id} ${person.name}`;
    setEditableService(prev => {
        const newAssignments = prev.assignments.map((assignment, idx) => {
            if (idx === assignmentIndex) {
                const currentDetails = Array.isArray(assignment.details) ? assignment.details.filter(d => d.trim() !== '') : [];
                return {
                    ...assignment,
                    details: [...currentDetails, personDetailString]
                };
            }
            return assignment;
        });
        return { ...prev, assignments: newAssignments };
    });
    setPersonnelSearchTerm('');
    personnelSearchInputRefs.current[assignmentIndex]?.focus();
  };

  const handleAddAssignment = () => {
    const newAssignment = {
        id: `new-assign-${Date.now()}`,
        location: 'Nueva Ubicación',
        time: '00:00 Hs.',
        implementationTime: '',
        personnel: 'A designar',
        details: [],
    };
    setEditableService(prev => ({
        ...prev,
        assignments: [...prev.assignments, newAssignment],
    }));
  };

  const handleRemoveAssignment = (indexToRemove) => {
      setEditableService(prev => ({
          ...prev,
          assignments: prev.assignments.filter((_, index) => index !== indexToRemove),
      }));
  };

    const handleDetailChange = (e, assignmentIndex, detailIndex) => {
        const { value } = e.target;
        setEditableService(prev => {
            const newAssignments = [...prev.assignments];
            const newDetails = [...(newAssignments[assignmentIndex].details || [])];
            newDetails[detailIndex] = value;
            newAssignments[assignmentIndex] = { ...newAssignments[assignmentIndex], details: newDetails };
            return { ...prev, assignments: newAssignments };
        });
    };

    const handleAddDetail = (assignmentIndex) => {
        setEditableService(prev => {
            const newAssignments = [...prev.assignments];
            const currentDetails = newAssignments[assignmentIndex].details || [];
            newAssignments[assignmentIndex] = { ...newAssignments[assignmentIndex], details: [...currentDetails, ''] };
            return { ...prev, assignments: newAssignments };
        });
    };

    const handleRemoveDetail = (assignmentIndex, detailIndex) => {
        setEditableService(prev => {
            const newAssignments = [...prev.assignments];
            const newDetails = [...(newAssignments[assignmentIndex].details || [])];
            newDetails.splice(detailIndex, 1);
            newAssignments[assignmentIndex] = { ...newAssignments[assignmentIndex], details: newDetails };
            return { ...prev, assignments: newAssignments };
        });
    };

  const handleSave = () => {
    onUpdateService(editableService);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableService(JSON.parse(JSON.stringify(service)));
    setIsEditing(false);
  };
  
  const handleAddStadium = () => {
    let maxOsNumber = 0;
    service.assignments.forEach(a => {
        const osDetail = (a.details || []).find(d => /^\d+-\s*O\.S\./.test(d.trim()));
        if (osDetail) {
            const match = osDetail.match(/^(\d+)-/);
            if (match && match[1]) {
                const num = parseInt(match[1], 10);
                if (num > maxOsNumber) {
                    maxOsNumber = num;
                }
            }
        }
    });

    const newOsNumber = maxOsNumber + 1;
    const paddedOsNumber = String(newOsNumber).padStart(2, '0');

    const newAssignment = {
        id: `stadium-assign-${Date.now()}`,
        location: "Nuevo Estadio (Editar)",
        time: "00:00 Hs. a terminar.-",
        personnel: "A designar",
        implementationTime: "HORARIO DE IMPLANTACION: 00:00 Hs.-",
        details: [
            `${paddedOsNumber}-O.S.XXXX ENCUENTRO FUTBOLÍSTICO "EQUIPO A VS. EQUIPO B"`
        ]
    };

    const updatedService = {
        ...service,
        assignments: [...service.assignments, newAssignment]
    };

    onUpdateService(updatedService);
  };
  
  if (isEditing) {
    return (
      React.createElement("div", { className: "bg-zinc-800/60 rounded-xl shadow-lg mb-8 p-6 animate-fade-in" },
        React.createElement("div", { className: "flex justify-between items-start mb-4" },
            React.createElement("h3", { className: "text-xl sm:text-2xl font-bold text-white" }, "Editando Servicio"),
             React.createElement("button", {
                onClick: () => onReplaceFromTemplate(service.id),
                className: "flex items-center gap-2 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-md transition-colors text-sm"
              },
                React.createElement(RefreshIcon, { className: "w-4 h-4" }),
                "Reemplazar desde Plantilla"
              )
        ),
        
        React.createElement("div", { className: "space-y-4 mb-6" },
            React.createElement("div", null,
                React.createElement("label", { htmlFor: `title-${service.id}`, className: "block text-sm font-medium text-zinc-300 mb-1" }, "Título del Servicio"),
                React.createElement("input", {
                    type: "text",
                    id: `title-${service.id}`,
                    name: "title",
                    value: editableService.title,
                    onChange: handleInputChange,
                    className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            ),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: `description-${service.id}`, className: "block text-sm font-medium text-zinc-300 mb-1" }, "Descripción (Opcional)"),
                React.createElement("textarea", {
                    id: `description-${service.id}`,
                    name: "description",
                    value: editableService.description || '',
                    onChange: handleInputChange,
                    rows: 2,
                    className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            ),
            React.createElement("div", null,
                React.createElement("label", { htmlFor: `novelty-${service.id}`, className: "block text-sm font-medium text-zinc-300 mb-1" }, "Novedad (Opcional)"),
                React.createElement("textarea", {
                    id: `novelty-${service.id}`,
                    name: "novelty",
                    value: editableService.novelty || '',
                    onChange: handleInputChange,
                    rows: 3,
                    className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            )
        ),

        React.createElement("div", { className: "flex justify-between items-center mb-4 border-t border-zinc-700 pt-4" },
            React.createElement("h4", { className: "text-lg font-semibold text-yellow-300" }, "Asignaciones"),
            React.createElement("button", {
                onClick: handleAddAssignment,
                className: "flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md transition-colors text-sm"
            },
                React.createElement(PlusCircleIcon, { className: "w-4 h-4" }),
                "Añadir Asignación"
            )
        ),

        React.createElement("div", { className: "space-y-6" },
        editableService.assignments.length === 0 ? (
            React.createElement("div", { className: "text-center py-4 text-zinc-500" }, "No hay asignaciones para este servicio.")
        ) : (
          editableService.assignments.map((assignment, index) => (
            React.createElement("div", { key: assignment.id, className: "bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 relative" },
                React.createElement("button", { onClick: () => handleRemoveAssignment(index), className: "absolute top-2 right-2 text-zinc-500 hover:text-red-400 p-1 rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors", "aria-label": "Eliminar asignación" },
                    React.createElement(TrashIcon, { className: "w-5 h-5" })
                ),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pr-8" },
                     React.createElement("div", { className: "md:col-span-2" },
                        React.createElement("label", { htmlFor: `location-${index}-${service.id}`, className: "text-sm text-zinc-400" }, "Ubicación"),
                        React.createElement("input", { type: "text", id: `location-${index}-${service.id}`, name: "location", value: assignment.location, onChange: (e) => handleInputChange(e, index), className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                    ),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: `time-${index}-${service.id}`, className: "text-sm text-zinc-400" }, "Horario de Servicio"),
                        React.createElement("input", { type: "text", id: `time-${index}-${service.id}`, name: "time", value: assignment.time, onChange: (e) => handleInputChange(e, index), className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                    ),
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: `implementationTime-${index}-${service.id}`, className: "text-sm text-zinc-400" }, "Horario de Implantación"),
                        React.createElement("input", { type: "text", id: `implementationTime-${index}-${service.id}`, name: "implementationTime", value: assignment.implementationTime || '', onChange: (e) => handleInputChange(e, index), className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" })
                    ),
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement("label", { htmlFor: `personnel-${index}-${service.id}`, className: "text-sm text-zinc-400" }, "Personal"),
                        React.createElement("input", {
                            type: "text",
                            id: `personnel-${index}-${service.id}`,
                            name: "personnel",
                            value: assignment.personnel,
                            onChange: (e) => handleInputChange(e, index),
                            className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white",
                            list: `personnel-list-${service.id}`,
                            autoComplete: "off"
                        }),
                        React.createElement("datalist", { id: `personnel-list-${service.id}` },
                            React.createElement("option", { value: "A designar" }),
                            allPersonnel.map(p => {
                                let label = p.name;
                                const extraInfo = [];
                                if (p.station) extraInfo.push(`Est: ${p.station}`);
                                if (p.detachment) extraInfo.push(`Dest: ${p.detachment}`);
                                if (extraInfo.length > 0) {
                                    label += ` (${extraInfo.join(' / ')})`;
                                }
                                return React.createElement("option", { key: p.id, value: label })
                            })
                        )
                    ),
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement("label", { htmlFor: `unit-${index}-${service.id}`, className: "text-sm text-zinc-400" }, "Unidad (Opcional)"),
                        React.createElement("select", { id: `unit-${index}-${service.id}`, name: "unit", value: assignment.unit || '', onChange: (e) => handleInputChange(e, index), className: "mt-1 w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" },
                            React.createElement("option", { value: "" }, "Ninguna"),
                            assignment.unit && React.createElement("option", { value: assignment.unit }, assignment.unit),
                            unitList.filter(u => u !== assignment.unit).map(u => React.createElement("option", { key: u, value: u }, u))
                        )
                    ),
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement("div", { className: "flex justify-between items-center mb-1" },
                            React.createElement("label", { className: "text-sm text-zinc-400" }, "Detalles y Personal Adicional"),
                             React.createElement("button", {
                                type: "button",
                                onClick: () => personnelSearchInputRefs.current[index]?.focus(),
                                className: "flex items-center gap-1 text-xs px-2 py-1 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-medium transition-colors"
                            },
                                React.createElement(PlusCircleIcon, { className: "w-4 h-4" }),
                                "Añadir Personal por Búsqueda"
                            )
                        ),
                         React.createElement("div", { className: "relative" },
                            React.createElement("input", {
                                type: "text",
                                placeholder: "Buscar personal para añadir a detalles...",
                                ref: el => { personnelSearchInputRefs.current[index] = el; },
                                value: personnelSearchTerm,
                                onChange: e => setPersonnelSearchTerm(e.target.value),
                                onFocus: () => setPersonnelDropdownOpenFor(index),
                                onBlur: () => setTimeout(() => setPersonnelDropdownOpenFor(null), 200),
                                className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white mb-2"
                            }),
                            personnelDropdownOpenFor === index && (
                               React.createElement("div", { className: "absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-md shadow-lg max-h-60 overflow-y-auto" },
                                React.createElement("ul", { className: "divide-y divide-zinc-700" },
                                    allPersonnel
                                        .filter(p => 
                                            p.name.toLowerCase().includes(personnelSearchTerm.toLowerCase()) ||
                                            p.rank.toLowerCase().includes(personnelSearchTerm.toLowerCase()) ||
                                            p.id.toLowerCase().includes(personnelSearchTerm.toLowerCase())
                                        )
                                        .map(p => (
                                            React.createElement("li", {
                                                key: p.id,
                                                onMouseDown: () => handleAddPersonnelToDetails(index, p),
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
                        ),
                        React.createElement("div", { className: "space-y-2" },
                          (assignment.details || []).map((detail, detailIndex) => (
                              React.createElement("div", { key: detailIndex, className: "flex items-center gap-2 animate-fade-in" },
                                  React.createElement("input", {
                                      type: "text",
                                      value: detail,
                                      onChange: (e) => handleDetailChange(e, index, detailIndex),
                                      className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white",
                                      placeholder: `Línea de detalle ${detailIndex + 1}`
                                  }),
                                  React.createElement("button", {
                                      type: "button",
                                      onClick: () => handleRemoveDetail(index, detailIndex),
                                      className: "p-1 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-800 transition-colors",
                                      "aria-label": "Eliminar detalle"
                                  },
                                      React.createElement(TrashIcon, { className: "w-5 h-5" })
                                  )
                              )
                          ))
                        ),
                        React.createElement("button", {
                            type: "button",
                            onClick: () => handleAddDetail(index),
                            className: "mt-3 flex items-center gap-2 text-xs px-2 py-1 bg-sky-600 hover:bg-sky-500 rounded-md text-white font-medium transition-colors"
                        },
                            React.createElement(PlusCircleIcon, { className: "w-4 h-4" }),
                            "Añadir Línea de Detalle"
                        )
                    )
                )
            )
          ))
        )
        ),

        React.createElement("div", { className: "flex justify-end space-x-4 mt-8" },
            React.createElement("button", { onClick: handleCancel, className: "flex items-center px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white transition-colors" },
                React.createElement(XCircleIcon, { className: "w-5 h-5 mr-2" }),
                "Cancelar"
            ),
            React.createElement("button", { onClick: handleSave, className: "flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors" },
                React.createElement(PencilIcon, { className: "w-5 h-5 mr-2" }),
                "Guardar Cambios"
            )
        )
      )
    );
  }

  return (
    React.createElement("div", { className: `bg-zinc-800/60 rounded-xl shadow-lg mb-8 overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}` },
        React.createElement("div", { className: "w-full flex items-center justify-between p-6 text-left" },
            React.createElement("div", { className: "flex items-center flex-grow mr-4" },
                React.createElement("input", {
                    type: "checkbox",
                    checked: isSelected,
                    onChange: () => onToggleSelection(service.id),
                    className: "h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-blue-500 focus:ring-blue-500 mr-4 flex-shrink-0",
                    "aria-label": `Seleccionar servicio ${service.title}`
                }),
                React.createElement("button", {
                    onClick: () => setIsOpen(!isOpen),
                    className: "flex-grow flex items-center focus:outline-none",
                    "aria-controls": serviceId,
                    "aria-expanded": isOpen
                },
                    React.createElement(ClipboardListIcon, { className: "w-8 h-8 mr-4 text-blue-400 flex-shrink-0" }),
                    React.createElement("div", { className: "flex-grow text-left" },
                        React.createElement("h3", { className: "text-xl sm:text-2xl font-bold text-white" }, service.title),
                        service.description && React.createElement("p", { className: "text-sm text-zinc-400 mt-1" }, service.description)
                    ),
                    React.createElement(ChevronDownIcon, {
                    className: `w-7 h-7 text-zinc-300 flex-shrink-0 transform transition-transform duration-300 ml-4 ${isOpen ? 'rotate-180' : 'rotate-0'}`
                    })
                )
            ),
            React.createElement("div", { className: "flex items-center space-x-1 flex-shrink-0" },
                 React.createElement("button", { 
                    onClick: () => onMoveService(service.id, 'up'),
                    disabled: index === 0,
                    className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    "aria-label": "Subir servicio"
                },
                    React.createElement(ArrowUpIcon, { className: "w-5 h-5" })
                ),
                 React.createElement("button", { 
                    onClick: () => onMoveService(service.id, 'down'),
                    disabled: index === totalServices - 1,
                    className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    "aria-label": "Bajar servicio"
                },
                    React.createElement(ArrowDownIcon, { className: "w-5 h-5" })
                ),
                React.createElement("button", { 
                    onClick: () => onSaveAsTemplate(service),
                    className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-yellow-400 transition-colors",
                    "aria-label": "Guardar como plantilla"
                },
                    React.createElement(BookmarkIcon, { className: "w-5 h-5" })
                ),
                React.createElement("button", { 
                    onClick: () => setIsEditing(true), 
                    className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors",
                    "aria-label": "Editar servicio"
                },
                    React.createElement(PencilIcon, { className: "w-5 h-5" })
                ),
                React.createElement("button", { 
                    onClick: onDeleteService,
                    className: "p-2 rounded-full text-zinc-400 hover:bg-red-800/50 hover:text-red-400 transition-colors",
                    "aria-label": "Eliminar servicio"
                },
                    React.createElement(TrashIcon, { className: "w-5 h-5" })
                )
            )
        ),

        service.novelty && (
             React.createElement("div", { className: "px-6 pb-4" },
                React.createElement("div", { className: "p-3 bg-yellow-900/40 border border-yellow-700 rounded-md" },
                    React.createElement("div", { className: "flex items-start" },
                        React.createElement(AnnotationIcon, { className: "w-5 h-5 mr-2 text-yellow-300 flex-shrink-0" }),
                        React.createElement("p", { className: "text-yellow-200 text-sm" }, service.novelty)
                    )
                )
            )
        ),

      React.createElement("div", {
        id: serviceId,
        className: `grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`
      },
        React.createElement("div", { className: "overflow-hidden" },
           React.createElement("div", { className: "p-6 bg-zinc-900/40" },
              service.title.toUpperCase().includes('EVENTO DEPORTIVO') && (
                React.createElement("div", { className: "mb-6" },
                  React.createElement("button", {
                    onClick: handleAddStadium,
                    className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md transition-colors",
                    "aria-label": "Añadir nueva cancha"
                  },
                    React.createElement(PlusCircleIcon, { className: "w-5 h-5" }),
                    "Añadir Cancha"
                  )
                )
              ),
              React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" },
                  service.assignments.map((assignment) => (
                      React.createElement(AssignmentCard, { key: assignment.id, assignment: assignment })
                  ))
              )
            )
        )
      )
    )
  );
};

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const DateSelector = ({ displayDate, onDateChange }) => {
    const [yearInput, setYearInput] = useState('');
    
    useEffect(() => {
        if (displayDate) {
            setYearInput(displayDate.getFullYear().toString());
        }
    }, [displayDate]);

    if (!displayDate) {
        return null; // Don't render if date is not available yet
    }
    
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const day = displayDate.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handleYearChange = (e) => {
        setYearInput(e.target.value);
    };

    const handleYearBlur = () => {
        const newYear = parseInt(yearInput, 10);
        if (!isNaN(newYear) && newYear > 1000 && newYear < 9999) {
            if (year !== newYear) {
                onDateChange('year', newYear);
            }
        } else {
            setYearInput(year.toString());
        }
    };
    
    const handleYearKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleYearBlur();
            e.target.blur();
        }
    };

    return React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement("select", { value: day, onChange: (e) => onDateChange('day', parseInt(e.target.value)), className: "bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" },
            Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => React.createElement("option", { key: d, value: d }, d))
        ),
        React.createElement("span", { className: "text-zinc-400" }, "de"),
        React.createElement("select", { value: month, onChange: (e) => onDateChange('month', parseInt(e.target.value)), className: "bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white" },
            monthNames.map((m, i) => React.createElement("option", { key: i, value: i }, m))
        ),
        React.createElement("span", { className: "text-zinc-400" }, "de"),
        React.createElement("input", {
            type: "number",
            value: yearInput,
            onChange: handleYearChange,
            onBlur: handleYearBlur,
            onKeyDown: handleYearKeyDown,
            className: "bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white w-24 text-center",
            "aria-label": "Año"
        })
    );
};

const isValidLp = (id) => {
    if (!id) return false;
    return !id.startsWith('empty-') && !id.startsWith('roster-');
};


const ScheduleDisplay = (props) => {
  const { schedule, displayDate, selectedServiceIds, onDateChange, onUpdateService, onUpdateCommandStaff, onAddNewService, onMoveService, onDeleteService, onToggleServiceSelection, onSelectAllServices, commandPersonnel, servicePersonnel, unitList, onSaveAsTemplate, onReplaceFromTemplate, onImportGuardLine, searchTerm, onSearchChange } = props;
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editableStaff, setEditableStaff] = useState([]);
  
  const visibleServices = schedule.services.filter(s => !s.isHidden);
  const hiddenServices = schedule.services.filter(s => s.isHidden);
  
  const visibleSportsEvents = schedule.sportsEvents.filter(s => !s.isHidden);
  const hiddenSportsEvents = schedule.sportsEvents.filter(s => s.isHidden);
  
  const allVisibleServices = [...visibleServices, ...visibleSportsEvents];
  const allHiddenServices = [...hiddenServices, ...hiddenSportsEvents];

  const areAllVisibleSelected = allVisibleServices.length > 0 && allVisibleServices.every(s => selectedServiceIds.has(s.id));

  useEffect(() => {
    setEditableStaff(JSON.parse(JSON.stringify(schedule.commandStaff)));
  }, [schedule.commandStaff]);

  const handleStaffChange = (e, index) => {
    const { name, value } = e.target;
    setEditableStaff(prev => {
        const newStaff = [...prev];
        const currentOfficer = { ...newStaff[index] };

        if (name === 'id') {
            currentOfficer.id = value;
        } else if (name === 'role') {
            currentOfficer.role = value;
        } else if (name === 'rank') {
            currentOfficer.rank = value;
        } else if (name === 'name') {
            currentOfficer.name = value;
            const person = commandPersonnel.find(p => p.name === value);
            if (person) {
                currentOfficer.rank = person.rank;
                currentOfficer.id = person.id;
            }
        }
        
        newStaff[index] = currentOfficer;
        return newStaff;
    });
  };

  const handleSaveStaff = () => {
    onUpdateCommandStaff(editableStaff);
    setIsEditingStaff(false);
  };
  
  const handleCancelStaff = () => {
    setEditableStaff(JSON.parse(JSON.stringify(schedule.commandStaff)));
    setIsEditingStaff(false);
  };

  const formattedDate = displayDate ? `${displayDate.getDate()} DE ${monthNames[displayDate.getMonth()].toUpperCase()} DE ${displayDate.getFullYear()}` : schedule.date;

  return (
    React.createElement("div", { className: "animate-fade-in" },
      React.createElement("div", { className: "mb-12" },
        React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b-2 border-zinc-700 pb-4 gap-4" },
            React.createElement("div", { className: "flex items-center" },
                React.createElement(UserGroupIcon, { className: "w-8 h-8 mr-4 text-blue-300 flex-shrink-0" }),
                React.createElement("div", { className: "flex flex-col" },
                    React.createElement("h2", { className: "text-2xl font-bold text-white" }, "LÍNEA DE GUARDIA DEL DÍA"),
                    React.createElement(DateSelector, { displayDate: displayDate, onDateChange: onDateChange })
                )
            ),
            React.createElement("div", { className: "flex items-center gap-2 self-center" },
                 !isEditingStaff && (
                    React.createElement("button", {
                        onClick: onImportGuardLine,
                        className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors",
                        title: "Importar rol desde Nomenclador para la fecha seleccionada",
                        "aria-label": "Importar rol de guardia para la fecha seleccionada"
                    },
                        React.createElement(RefreshIcon, { className: "w-5 h-5" })
                    )
                ),
                React.createElement("button", { 
                    onClick: () => setIsEditingStaff(!isEditingStaff), 
                    className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors flex-shrink-0",
                    "aria-label": "Editar línea de guardia"
                },
                    isEditingStaff ? React.createElement(XCircleIcon, { className: "w-6 h-6" }) : React.createElement(PencilIcon, { className: "w-5 h-5" })
                )
            )
        ),
        
        isEditingStaff ? (
            React.createElement("div", { className: "bg-zinc-800/60 rounded-xl p-6 space-y-4" },
                React.createElement("div", { className: "grid grid-cols-[2fr,1fr,1.5fr,2.5fr] gap-4 text-sm font-medium text-zinc-400 mb-2" },
                    React.createElement("label", null, "Rol"),
                    React.createElement("label", null, "L.P."),
                    React.createElement("label", null, "Jerarquía"),
                    React.createElement("label", null, "Nombre")
                ),

                React.createElement("datalist", { id: "personnel-datalist-shared" },
                  commandPersonnel.map(p => React.createElement("option", { key: p.id, value: p.name }))
                ),
                
                 editableStaff.map((officer, index) => (
                    React.createElement("div", { key: officer.id || index, className: "grid grid-cols-[2fr,1fr,1.5fr,2.5fr] gap-4 items-center" },
                       React.createElement("input", { 
                         type: "text", 
                         name: "role",
                         value: officer.role,
                         onChange: (e) => handleStaffChange(e, index),
                         className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white"
                       }),
                       React.createElement("input", { 
                         type: "text", 
                         name: "id",
                         value: isValidLp(officer.id) ? officer.id : '',
                         onChange: (e) => handleStaffChange(e, index),
                         placeholder: "L.P.",
                         className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white"
                       }),
                       React.createElement("select", {
                          name: "rank",
                          value: officer.rank || 'OTRO',
                          onChange: (e) => handleStaffChange(e, index),
                          className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white"
                        },
                          RANKS.map(r => React.createElement("option", { key: r, value: r }, r))
                        ),
                       React.createElement("input", { 
                         list: "personnel-datalist-shared",
                         type: "text", 
                         name: "name",
                         value: officer.name,
                         onChange: (e) => handleStaffChange(e, index),
                         className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white",
                         placeholder: "Apellido, Nombre"
                       })
                    )
                 )),
                 React.createElement("div", { className: "flex justify-end space-x-4 pt-4" },
                    React.createElement("button", { onClick: handleCancelStaff, className: "flex items-center px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white transition-colors" },
                        React.createElement(XCircleIcon, { className: "w-5 h-5 mr-2" }),
                        "Cancelar"
                    ),
                    React.createElement("button", { onClick: handleSaveStaff, className: "flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors" },
                        React.createElement(PencilIcon, { className: "w-5 h-5 mr-2" }),
                        "Guardar Cambios"
                    )
                )
            )
        ) : (
            React.createElement("div", { className: "bg-zinc-800/60 rounded-xl p-6" },
                React.createElement("div", { className: "grid grid-cols-[2fr,1fr,1.5fr,2.5fr] gap-4 text-sm font-bold text-zinc-400 border-b border-zinc-700 pb-3 mb-3" },
                    React.createElement("div", null, "ROL"),
                    React.createElement("div", null, "L.P."),
                    React.createElement("div", null, "JERARQUÍA"),
                    React.createElement("div", null, "NOMBRE")
                ),
                React.createElement("div", { className: "space-y-2" },
                    schedule.commandStaff.map((officer, index) => (
                    React.createElement("div", { key: officer.id || index, className: "grid grid-cols-[2fr,1fr,1.5fr,2.5fr] gap-4 items-center p-2 rounded-md" },
                        React.createElement("div", { className: "font-semibold text-blue-300 truncate", title: officer.role }, officer.role),
                        React.createElement("div", { className: "text-zinc-300 font-mono" }, isValidLp(officer.id) ? officer.id : ''),
                        React.createElement("div", { className: `${officer.rank === 'OTRO' ? 'text-zinc-400 italic' : 'text-yellow-400 font-bold'}` }, officer.rank || 'OTRO'),
                        React.createElement("div", { className: "text-zinc-100" }, officer.name)
                    )
                    ))
                )
            )
        )

      ),

      React.createElement("div", null,
        React.createElement("div", { className: "flex items-center justify-between mb-6 border-b-2 border-zinc-700 pb-4 gap-4 flex-wrap" },
            React.createElement("div", { className: "flex items-center" },
                React.createElement(CalendarIcon, { className: "w-8 h-8 mr-4 text-yellow-300" }),
                React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Servicios del Día: ", React.createElement("span", { className: "font-normal text-zinc-300" }, formattedDate))
            ),
            React.createElement("div", { className: "flex items-center gap-4" },
                 React.createElement("button", { 
                    onClick: () => onAddNewService('common'),
                    className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md transition-colors",
                    "aria-label": "Añadir nuevo servicio"
                },
                    React.createElement(PlusCircleIcon, { className: "w-5 h-5" }),
                    "Añadir Servicio"
                )
            )
        ),
        React.createElement("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-4" },
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("input", {
                    type: "checkbox",
                    id: "select-all-services",
                    checked: areAllVisibleSelected,
                    onChange: (e) => onSelectAllServices(e.target.checked),
                    className: "h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-blue-500 focus:ring-blue-500"
                }),
                React.createElement("label", { htmlFor: "select-all-services", className: "text-zinc-300" }, "Seleccionar Todos Visibles")
            ),
            React.createElement("div", { className: "relative flex-grow sm:flex-grow-0 min-w-[250px]" },
                React.createElement(SearchIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" }),
                React.createElement("input", {
                    type: "text",
                    placeholder: "Buscar en servicios...",
                    value: searchTerm,
                    onChange: (e) => onSearchChange(e.target.value),
                    className: "w-full bg-zinc-700/80 border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500",
                    "aria-label": "Buscar servicios"
                })
            )
        ),
        
        visibleServices.map((service, index) => (
          React.createElement(ServiceSection, { 
            key: service.id, 
            service: service, 
            index: index, 
            totalServices: visibleServices.length,
            isSelected: selectedServiceIds.has(service.id),
            onUpdateService: (s) => onUpdateService(s, 'common'),
            onMoveService: (id, dir) => onMoveService(id, dir, 'common'),
            onDeleteService: () => onDeleteService(service.id, 'common'),
            onToggleSelection: onToggleServiceSelection,
            onSaveAsTemplate: onSaveAsTemplate,
            onReplaceFromTemplate: (id) => onReplaceFromTemplate(id, 'common'),
            commandPersonnel: commandPersonnel,
            servicePersonnel: servicePersonnel,
            unitList: unitList
          })
        )),

        visibleSportsEvents.length > 0 && (
            React.createElement("div", { className: "mt-12" },
                React.createElement("div", { className: "flex items-center justify-between mb-6 border-b-2 border-zinc-700 pb-4" },
                    React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Eventos Deportivos"),
                    React.createElement("button", { 
                        onClick: () => onAddNewService('sports'),
                        className: "flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-md transition-colors",
                        "aria-label": "Añadir nuevo evento deportivo"
                    },
                        React.createElement(PlusCircleIcon, { className: "w-5 h-5" }),
                        "Añadir Evento"
                    )
                ),
                visibleSportsEvents.map((service, index) => (
                    React.createElement(ServiceSection, { 
                        key: service.id, 
                        service: service, 
                        index: index, 
                        totalServices: visibleSportsEvents.length,
                        isSelected: selectedServiceIds.has(service.id),
                        onUpdateService: (s) => onUpdateService(s, 'sports'),
                        onMoveService: (id, dir) => onMoveService(id, dir, 'sports'),
                        onDeleteService: () => onDeleteService(service.id, 'sports'),
                        onToggleSelection: onToggleServiceSelection,
                        onSaveAsTemplate: onSaveAsTemplate,
                        onReplaceFromTemplate: (id) => onReplaceFromTemplate(id, 'sports'),
                        commandPersonnel: commandPersonnel,
                        servicePersonnel: servicePersonnel,
                        unitList: unitList
                    })
                ))
            )
        ),

        allHiddenServices.length > 0 && (
            React.createElement("div", { className: "mt-12" },
                React.createElement("h2", { className: "text-2xl font-semibold text-zinc-500 mb-4 border-b-2 border-zinc-700 pb-2" }, "Servicios Ocultos"),
                hiddenServices.map((service, index) => (
                    React.createElement(ServiceSection, {
                        key: service.id,
                        service: service,
                        index: index,
                        totalServices: hiddenServices.length,
                        isSelected: selectedServiceIds.has(service.id),
                        onUpdateService: (s) => onUpdateService(s, 'common'),
                        onMoveService: (id, dir) => onMoveService(id, dir, 'common'),
                        onDeleteService: () => onDeleteService(service.id, 'common'),
                        onToggleSelection: onToggleServiceSelection,
                        onSaveAsTemplate: onSaveAsTemplate,
                        onReplaceFromTemplate: (id) => onReplaceFromTemplate(id, 'common'),
                        commandPersonnel: commandPersonnel,
                        servicePersonnel: servicePersonnel,
                        unitList: unitList
                    })
                )),
                hiddenSportsEvents.map((service, index) => (
                    React.createElement(ServiceSection, {
                        key: service.id,
                        service: service,
                        index: index,
                        totalServices: hiddenSportsEvents.length,
                        isSelected: selectedServiceIds.has(service.id),
                        onUpdateService: (s) => onUpdateService(s, 'sports'),
                        onMoveService: (id, dir) => onMoveService(id, dir, 'sports'),
                        onDeleteService: () => onDeleteService(service.id, 'sports'),
                        onToggleSelection: onToggleServiceSelection,
                        onSaveAsTemplate: onSaveAsTemplate,
                        onReplaceFromTemplate: (id) => onReplaceFromTemplate(id, 'sports'),
                        commandPersonnel: commandPersonnel,
                        servicePersonnel: servicePersonnel,
                        unitList: unitList
                    })
                ))
            )
        )
      )
    )
  );
};
export default ScheduleDisplay;
