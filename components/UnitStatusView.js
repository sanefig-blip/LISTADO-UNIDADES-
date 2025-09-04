import React, { useState, useMemo } from 'react';

const getStatusColor = (status) => {
  const s = status.toLowerCase();
  if (s.includes('para servicio')) return 'bg-green-600 text-white';
  if (s.includes('fuera de servicio')) return 'bg-red-600 text-white';
  if (s.includes('reserva')) return 'bg-yellow-500 text-gray-900';
  if (s.includes('préstamo')) return 'bg-blue-500 text-white';
  return 'bg-zinc-500 text-white';
};

const UnitStatusView = ({ unitReportData }) => {
  const allUnits = useMemo(() => {
    return unitReportData.zones.flatMap(zone =>
      zone.groups.flatMap(group =>
        group.units.map(unit => ({
          ...unit,
          groupName: group.name,
        }))
      )
    );
  }, [unitReportData]);

  const allTypes = useMemo(() => [...new Set(allUnits.map(u => u.type))].sort(), [allUnits]);
  const allStatuses = useMemo(() => [...new Set(allUnits.map(u => u.status))].sort(), [allUnits]);

  const [selectedTypes, setSelectedTypes] = useState(new Set(allTypes));
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(allStatuses));

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) newSet.delete(type);
      else newSet.add(type);
      return newSet;
    });
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) newSet.delete(status);
      else newSet.add(status);
      return newSet;
    });
  };

  const filteredUnits = useMemo(() => {
    return allUnits.filter(unit =>
      selectedTypes.has(unit.type) && selectedStatuses.has(unit.status)
    );
  }, [allUnits, selectedTypes, selectedStatuses]);

  const FilterGroup = ({ title, items, selectedItems, onToggle, onSelectAll, onDeselectAll }) => (
    React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-lg" },
      React.createElement("h3", { className: "text-lg font-semibold text-white mb-3" }, title),
      React.createElement("div", { className: "flex gap-2 mb-3" },
        React.createElement("button", { onClick: onSelectAll, className: "px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white" }, "Todos"),
        React.createElement("button", { onClick: onDeselectAll, className: "px-2 py-1 text-xs bg-zinc-600 hover:bg-zinc-500 rounded text-white" }, "Ninguno")
      ),
      React.createElement("div", { className: "space-y-2 max-h-48 overflow-y-auto pr-2" },
        items.map(item => (
          React.createElement("label", { key: item, className: "flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white" },
            React.createElement("input", {
              type: "checkbox",
              checked: selectedItems.has(item),
              onChange: () => onToggle(item),
              className: "h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-blue-500 focus:ring-blue-500"
            }),
            item
          )
        ))
      )
    )
  );

  return (
    React.createElement("div", { className: "animate-fade-in grid grid-cols-1 lg:grid-cols-4 gap-6" },
      React.createElement("div", { className: "lg:col-span-1 space-y-4" },
        React.createElement(FilterGroup, {
          title: "Filtrar por Tipo",
          items: allTypes,
          selectedItems: selectedTypes,
          onToggle: handleTypeToggle,
          onSelectAll: () => setSelectedTypes(new Set(allTypes)),
          onDeselectAll: () => setSelectedTypes(new Set())
        }),
        React.createElement(FilterGroup, {
          title: "Filtrar por Estado",
          items: allStatuses,
          selectedItems: selectedStatuses,
          onToggle: handleStatusToggle,
          onSelectAll: () => setSelectedStatuses(new Set(allStatuses)),
          onDeselectAll: () => setSelectedStatuses(new Set())
        })
      ),
      React.createElement("div", { className: "lg:col-span-3 bg-zinc-800/60 p-4 rounded-xl" },
        React.createElement("h2", { className: "text-2xl font-bold text-white mb-4" }, `Unidades Filtradas (${filteredUnits.length})`),
        React.createElement("div", { className: "overflow-x-auto max-h-[70vh]" },
          React.createElement("table", { className: "w-full text-left" },
            React.createElement("thead", { className: "sticky top-0 bg-zinc-800" },
              React.createElement("tr", { className: "text-sm text-zinc-400" },
                React.createElement("th", { className: "p-2" }, "Unidad"),
                React.createElement("th", { className: "p-2" }, "Tipo"),
                React.createElement("th", { className: "p-2" }, "Estado"),
                React.createElement("th", { className: "p-2" }, "Oficial a Cargo"),
                React.createElement("th", { className: "p-2 text-right" }, "Personal"),
                React.createElement("th", { className: "p-2" }, "Ubicación")
              )
            ),
            React.createElement("tbody", null,
              filteredUnits.length > 0 ? filteredUnits.map(unit => (
                React.createElement("tr", { key: unit.id + unit.groupName, className: "border-t border-zinc-700 hover:bg-zinc-700/50" },
                  React.createElement("td", { className: "p-2 font-mono text-zinc-200" }, unit.id),
                  React.createElement("td", { className: "p-2 text-zinc-300" }, unit.type),
                  React.createElement("td", { className: "p-2" },
                    React.createElement("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}` },
                      unit.status
                    )
                  ),
                  React.createElement("td", { className: "p-2 text-zinc-300" }, unit.officerInCharge || '-'),
                  React.createElement("td", { className: "p-2 text-right text-zinc-200 font-semibold" }, unit.personnelCount ?? '-'),
                  React.createElement("td", { className: "p-2 text-zinc-400 text-sm" }, unit.groupName)
                )
              )) : (
                React.createElement("tr", null,
                    React.createElement("td", { colSpan: 6, className: "text-center py-12 text-zinc-500" },
                        "No hay unidades que coincidan con los filtros seleccionados."
                    )
                )
              )
            )
          )
        )
      )
    )
  );
};

export default UnitStatusView;