import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, PlusCircleIcon, PencilIcon, XCircleIcon, GripVerticalIcon, ArrowLeftIcon, ArrowRightIcon } from './icons.js';
import { RANKS } from '../types.js';

const PersonnelListItem = ({ item, onUpdate, onRemove, extraFieldsToShow }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableItem, setEditableItem] = useState(item);

  const handleSave = () => {
    if (editableItem.name.trim() && editableItem.id.trim()) {
      onUpdate(editableItem);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditableItem(item);
    setIsEditing(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableItem(prev => ({...prev, [name]: value }));
  };

  if (isEditing) {
    const gridColsClass = extraFieldsToShow.length > 1 
      ? 'sm:grid-cols-2 md:grid-cols-3'
      : 'sm:grid-cols-4';

    return (
      React.createElement("li", { className: "flex flex-col bg-zinc-900/80 p-3 rounded-md animate-fade-in gap-3" },
        React.createElement("div", { className: `w-full grid grid-cols-1 ${gridColsClass} gap-2` },
            React.createElement("input", {
                type: "text",
                name: "id",
                value: editableItem.id,
                onChange: handleInputChange,
                placeholder: "L.P.",
                className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
            }),
            React.createElement("select", {
                name: "rank",
                value: editableItem.rank,
                onChange: handleInputChange,
                className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
            },
                RANKS.map(r => React.createElement("option", { key: r, value: r }, r))
            ),
            React.createElement("input", {
                type: "text",
                name: "name",
                value: editableItem.name,
                onChange: handleInputChange,
                className: `w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500 ${extraFieldsToShow.length > 1 ? 'md:col-span-1' : 'sm:col-span-1'}`
            }),
             extraFieldsToShow.includes('poc') && (
                React.createElement("input", {
                    type: "text",
                    name: "poc",
                    value: editableItem.poc || '',
                    onChange: handleInputChange,
                    placeholder: "POC",
                    className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            ),
            extraFieldsToShow.includes('station') && (
                React.createElement("input", {
                    type: "text",
                    name: "station",
                    value: editableItem.station || '',
                    onChange: handleInputChange,
                    placeholder: "Estación",
                    className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            ),
            extraFieldsToShow.includes('detachment') && (
                React.createElement("input", {
                    type: "text",
                    name: "detachment",
                    value: editableItem.detachment || '',
                    onChange: handleInputChange,
                    placeholder: "Destacamento",
                    className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            ),
             extraFieldsToShow.includes('part') && (
                 React.createElement("input", {
                    type: "text",
                    name: "part",
                    value: editableItem.part || '',
                    onChange: handleInputChange,
                    placeholder: "PART",
                    className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                })
            )
        ),
        React.createElement("div", { className: "flex items-center space-x-2 flex-shrink-0 self-end" },
          React.createElement("button", { onClick: handleSave, className: "text-green-400 hover:text-green-300 transition-colors p-1" }, React.createElement(PencilIcon, { className: "w-5 h-5" })),
          React.createElement("button", { onClick: handleCancel, className: "text-zinc-400 hover:text-zinc-200 transition-colors p-1" }, React.createElement(XCircleIcon, { className: "w-5 h-5" }))
        )
      )
    );
  }

  const hasExtraFields = extraFieldsToShow.some(field => item[field]);

  return (
    React.createElement("li", { className: "flex justify-between items-center bg-zinc-700/50 p-3 rounded-md animate-fade-in" },
      React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-grow min-w-0" },
        React.createElement("div", { className: "flex items-center min-w-0 flex-wrap sm:flex-nowrap gap-x-4" },
            React.createElement("span", { className: "font-mono text-xs text-zinc-400 w-20 flex-shrink-0" }, "L.P. ", item.id),
            React.createElement("span", { className: "font-semibold text-blue-300 mr-2 flex-shrink-0" }, item.rank),
            React.createElement("span", { className: "text-zinc-200 truncate" }, item.name)
        ),
        hasExtraFields && (
            React.createElement("div", { className: "text-xs text-zinc-400 mt-1 sm:mt-0 truncate flex flex-wrap gap-x-3" },
                extraFieldsToShow.includes('poc') && item.poc && React.createElement("span", null, "POC: ", item.poc),
                extraFieldsToShow.includes('station') && item.station && React.createElement("span", null, "Est: ", item.station),
                extraFieldsToShow.includes('detachment') && item.detachment && React.createElement("span", null, "Dest: ", item.detachment),
                extraFieldsToShow.includes('part') && item.part && React.createElement("span", null, "PART: ", item.part)
            )
        )
      ),
      React.createElement("div", { className: "flex items-center space-x-2 flex-shrink-0 ml-2" },
         React.createElement("button", { onClick: () => setIsEditing(true), className: "text-zinc-400 hover:text-yellow-400 transition-colors" },
            React.createElement(PencilIcon, { className: "w-5 h-5" })
          ),
        React.createElement("button", { onClick: () => onRemove(item), className: "text-zinc-400 hover:text-red-400 transition-colors" },
          React.createElement(TrashIcon, { className: "w-5 h-5" })
        )
      )
    )
  );
};


const EditablePersonnelList = ({ title, items, onAddItem, onUpdateItem, onRemoveItem, extraFieldsToShow }) => {
  const [newLp, setNewLp] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('OTRO');
  const [newStation, setNewStation] = useState('');
  const [newDetachment, setNewDetachment] = useState('');
  const [newPoc, setNewPoc] = useState('');
  const [newPart, setNewPart] = useState('');

  const handleAdd = () => {
    if (newName.trim() && newLp.trim()) {
      const newItem = {
        id: newLp.trim(),
        name: newName.trim(),
        rank: newRank,
      };
      if (extraFieldsToShow.includes('station')) newItem.station = newStation.trim() || undefined;
      if (extraFieldsToShow.includes('detachment')) newItem.detachment = newDetachment.trim() || undefined;
      if (extraFieldsToShow.includes('poc')) newItem.poc = newPoc.trim() || undefined;
      if (extraFieldsToShow.includes('part')) newItem.part = newPart.trim() || undefined;
      
      onAddItem(newItem);
      setNewLp('');
      setNewName('');
      setNewRank('OTRO');
      setNewStation('');
      setNewDetachment('');
      setNewPoc('');
      setNewPart('');
    }
  };

  const gridColsClass = extraFieldsToShow.length > 1 
      ? 'sm:grid-cols-2 md:grid-cols-3'
      : 'sm:grid-cols-4';

  return (
    React.createElement("div", { className: "bg-zinc-800/60 rounded-xl shadow-lg p-6 flex flex-col h-[32rem]" },
      React.createElement("h3", { className: "text-2xl font-bold text-white mb-4" }, title),
      React.createElement("div", { className: `grid grid-cols-1 ${gridColsClass} gap-2 mb-2` },
        React.createElement("input", {
          type: "text",
          value: newLp,
          onChange: (e) => setNewLp(e.target.value),
          placeholder: "L.P.",
          className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
          "aria-label": "Añadir L.P. de personal"
        }),
        React.createElement("select", {
          value: newRank,
          onChange: (e) => setNewRank(e.target.value),
          className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
          "aria-label": "Seleccionar jerarquía"
        },
          RANKS.map(r => React.createElement("option", { key: r, value: r }, r))
        ),
        React.createElement("input", {
          type: "text",
          value: newName,
          onChange: (e) => setNewName(e.target.value),
          placeholder: "Apellido, Nombre",
          className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
          "aria-label": "Añadir nombre de personal"
        }),
        extraFieldsToShow.includes('poc') && (
             React.createElement("input", {
              type: "text",
              value: newPoc,
              onChange: (e) => setNewPoc(e.target.value),
              placeholder: "POC",
              className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
              "aria-label": "Añadir POC"
            })
        ),
        extraFieldsToShow.includes('station') && (
            React.createElement("input", {
              type: "text",
              value: newStation,
              onChange: (e) => setNewStation(e.target.value),
              placeholder: "Estación",
              className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
              "aria-label": "Añadir estación"
            })
        ),
        extraFieldsToShow.includes('detachment') && (
            React.createElement("input", {
              type: "text",
              value: newDetachment,
              onChange: (e) => setNewDetachment(e.target.value),
              placeholder: "Destacamento",
              className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
              "aria-label": "Añadir destacamento"
            })
        ),
        extraFieldsToShow.includes('part') && (
             React.createElement("input", {
              type: "text",
              value: newPart,
              onChange: (e) => setNewPart(e.target.value),
              placeholder: "PART",
              className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
              "aria-label": "Añadir PART"
            })
        )
      ),
       React.createElement("button", {
          onClick: handleAdd,
          className: "w-full flex-shrink-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors mb-4",
          "aria-label": "Añadir Personal"
        },
          React.createElement(PlusCircleIcon, { className: "w-5 h-5 mr-2" }),
          "Añadir Personal"
        ),
      React.createElement("ul", { className: "space-y-2 overflow-y-auto pr-2 flex-grow" },
        items.map((item) => (
           React.createElement(PersonnelListItem, {
              key: item.id,
              item: item,
              onUpdate: onUpdateItem,
              onRemove: onRemoveItem,
              extraFieldsToShow: extraFieldsToShow
            })
        )),
         items.length === 0 && (
            React.createElement("div", { className: "flex justify-center items-center h-full" },
                React.createElement("p", { className: "text-zinc-500" }, "No hay personal.")
            )
        )
      )
    )
  );
};


const UnitList = ({ items, onUpdateItems }) => {
    const [newItem, setNewItem] = useState('');
    const draggedItemIndex = useRef(null);
    const dragOverItemIndex = useRef(null);

    const handleAdd = () => {
      if (newItem.trim() && !items.includes(newItem.trim())) {
        onUpdateItems([...items, newItem.trim()]);
        setNewItem('');
      }
    };

    const handleRemove = (itemToRemove) => {
        onUpdateItems(items.filter(item => item !== itemToRemove));
    };

    const handleDragStart = (index) => {
        draggedItemIndex.current = index;
    };
    
    const handleDragEnter = (index) => {
        dragOverItemIndex.current = index;
    };
    
    const handleDragEnd = () => {
        if (draggedItemIndex.current === null || dragOverItemIndex.current === null) return;
        
        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedItemIndex.current, 1);
        newItems.splice(dragOverItemIndex.current, 0, draggedItem);
      
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
      
        onUpdateItems(newItems);
    };

    return (
      React.createElement("div", { className: "bg-zinc-800/60 rounded-xl shadow-lg p-6 flex flex-col h-[32rem]" },
        React.createElement("h3", { className: "text-2xl font-bold text-white mb-4" }, "Unidades"),
        React.createElement("div", { className: "flex space-x-2 mb-4" },
          React.createElement("input", {
            type: "text",
            value: newItem,
            onChange: (e) => setNewItem(e.target.value),
            placeholder: "Añadir nueva unidad...",
            className: "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
            "aria-label": "Añadir nueva unidad"
          }),
          React.createElement("button", {
            onClick: handleAdd,
            className: "flex-shrink-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors",
            "aria-label": "Añadir unidad"
          },
            React.createElement(PlusCircleIcon, { className: "w-5 h-5" })
          )
        ),
        React.createElement("ul", { className: "space-y-2 overflow-y-auto pr-2 flex-grow" },
          items.map((item, index) => (
            React.createElement("li", {
              key: item,
              className: "flex justify-between items-center bg-zinc-700/50 p-2 rounded-md animate-fade-in group",
              draggable: true,
              onDragStart: () => handleDragStart(index),
              onDragEnter: () => handleDragEnter(index),
              onDragEnd: handleDragEnd,
              onDragOver: (e) => e.preventDefault()
            },
              React.createElement("div", { className: "flex items-center" },
                 React.createElement(GripVerticalIcon, { className: "w-5 h-5 mr-2 text-zinc-500 cursor-grab group-hover:text-zinc-300 transition-colors" }),
                 React.createElement("span", { className: "text-zinc-200" }, item)
              ),
              React.createElement("button", {
                onClick: () => handleRemove(item),
                className: "text-zinc-400 hover:text-red-400 transition-colors",
                "aria-label": `Eliminar ${item}`
              },
                React.createElement(TrashIcon, { className: "w-5 h-5" })
              )
            )
          )),
           items.length === 0 && (
              React.createElement("div", { className: "flex justify-center items-center h-full" },
                  React.createElement("p", { className: "text-zinc-500" }, "No hay unidades.")
              )
          )
        )
      )
    );
}

const RosterEditor = ({ roster, onUpdateRoster, personnelList }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editableMonthRoster, setEditableMonthRoster] = useState({});
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const roles = [
    { key: 'jefeInspecciones', label: 'Jefe de Inspecciones' },
    { key: 'jefeServicio', label: 'Jefe de Servicio' },
    { key: 'jefeGuardia', label: 'Jefe de Guardia' },
    { key: 'jefeReserva', label: 'Jefe de Reserva' },
  ];

  useEffect(() => {
    const monthData = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (roster[dateKey]) {
        monthData[dateKey] = roster[dateKey];
      }
    }
    setEditableMonthRoster(monthData);
  }, [currentDate, roster]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleInputChange = (dateKey, roleKey, value) => {
    setEditableMonthRoster(prev => {
      const updatedDay = { ...(prev[dateKey] || {}), [roleKey]: value };
      // Remove role if value is empty
      if (value.trim() === '') {
        delete updatedDay[roleKey];
      }
      const updatedRoster = { ...prev, [dateKey]: updatedDay };
      // Remove day if it has no roles
      if (Object.keys(updatedDay).length === 0) {
        delete updatedRoster[dateKey];
      }
      return updatedRoster;
    });
  };
  
  const handleSave = () => {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;

    const filteredRoster = Object.keys(roster).reduce((acc, dateKey) => {
      if (!dateKey.startsWith(monthPrefix)) {
        acc[dateKey] = roster[dateKey];
      }
      return acc;
    }, {});

    const newRoster = { ...filteredRoster, ...editableMonthRoster };
    
    onUpdateRoster(newRoster);
    alert('Rol de guardia guardado con éxito.');
  };

  const handleClearMonth = () => {
    const monthName = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    if (!window.confirm(`¿Estás seguro de que quieres borrar todas las asignaciones para ${monthName} ${year}?`)) {
      return;
    }

    const monthPrefix = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-`;

    const newRoster = Object.keys(roster).reduce((acc, dateKey) => {
        if (!dateKey.startsWith(monthPrefix)) {
            acc[dateKey] = roster[dateKey];
        }
        return acc;
    }, {});

    onUpdateRoster(newRoster);
    alert(`Asignaciones para ${monthName} borradas.`);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayRoster = editableMonthRoster[dateKey] || {};

      rows.push(
        React.createElement("tr", { key: dateKey, className: "bg-zinc-800 hover:bg-zinc-700/50" },
          React.createElement("td", { className: "p-2 border-b border-zinc-700 text-center font-semibold text-white" }, day),
          roles.map(role => (
            React.createElement("td", { key: role.key, className: "p-1 border-b border-zinc-700" },
              React.createElement("input", {
                type: "text",
                list: "command-personnel-suggestions",
                value: dayRoster[role.key] || '',
                onChange: e => handleInputChange(dateKey, role.key, e.target.value),
                className: "w-full bg-zinc-900 border border-zinc-600 rounded-md px-2 py-1 text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
              })
            )
          ))
        )
      );
    }
    return rows;
  };

  return (
    React.createElement("div", { className: "bg-zinc-800/60 rounded-xl shadow-lg p-6 mb-8" },
      React.createElement("h3", { className: "text-2xl font-bold text-white mb-4" }, "Editor de Rol de Guardia"),
      React.createElement("datalist", { id: "command-personnel-suggestions" },
        personnelList.map(p => React.createElement("option", { key: p.id, value: p.name }))
      ),
      React.createElement("div", { className: "flex justify-between items-center mb-4 bg-zinc-900 p-3 rounded-lg" },
        React.createElement("button", { onClick: handlePrevMonth, className: "p-2 rounded-full hover:bg-zinc-700 transition-colors" }, React.createElement(ArrowLeftIcon, { className: "w-6 h-6" })),
        React.createElement("span", { className: "text-xl font-bold text-yellow-300" }, `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`),
        React.createElement("button", { onClick: handleNextMonth, className: "p-2 rounded-full hover:bg-zinc-700 transition-colors" }, React.createElement(ArrowRightIcon, { className: "w-6 h-6" }))
      ),
      React.createElement("div", { className: "overflow-x-auto max-h-[50vh]" },
        React.createElement("table", { className: "w-full border-collapse" },
          React.createElement("thead", null,
            React.createElement("tr", { className: "bg-zinc-900 sticky top-0" },
              React.createElement("th", { className: "p-2 border-b-2 border-zinc-600 text-left text-sm font-semibold text-zinc-300 w-16" }, "Día"),
              roles.map(role => React.createElement("th", { key: role.key, className: "p-2 border-b-2 border-zinc-600 text-left text-sm font-semibold text-zinc-300" }, role.label))
            )
          ),
          React.createElement("tbody", null,
            renderCalendar()
          )
        )
      ),
       React.createElement("div", { className: "flex justify-end space-x-4 mt-6" },
            React.createElement("button", { onClick: handleClearMonth, className: "flex items-center px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white transition-colors text-sm font-medium" },
                React.createElement(TrashIcon, { className: "w-5 h-5 mr-2" }),
                "Borrar Mes Actual"
            ),
            React.createElement("button", { onClick: handleSave, className: "flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors" },
                React.createElement(PencilIcon, { className: "w-5 h-5 mr-2" }),
                "Guardar Cambios del Mes"
            )
        )
    )
  );
};


const Nomenclador = (props) => {
  return (
    React.createElement("div", { className: "animate-fade-in space-y-8" },
        React.createElement(RosterEditor, { 
          roster: props.roster,
          onUpdateRoster: props.onUpdateRoster,
          personnelList: props.commandPersonnel
        }),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
            React.createElement(EditablePersonnelList, {
                title: "Personal de Línea de Guardia",
                items: props.commandPersonnel,
                onAddItem: props.onAddCommandPersonnel,
                onUpdateItem: props.onUpdateCommandPersonnel,
                onRemoveItem: props.onRemoveCommandPersonnel,
                extraFieldsToShow: ['poc']
            }),
             React.createElement(EditablePersonnelList, {
                title: "Personal de Servicios",
                items: props.servicePersonnel,
                onAddItem: props.onAddServicePersonnel,
                onUpdateItem: props.onUpdateServicePersonnel,
                onRemoveItem: props.onRemoveServicePersonnel,
                extraFieldsToShow: ['station', 'detachment', 'poc', 'part']
            })
        ),
        React.createElement("div", { className: "max-w-xl mx-auto" },
            React.createElement(UnitList, {
                items: props.units,
                onUpdateItems: props.onUpdateUnits
            })
        )
    )
  );
};

export default Nomenclador;
