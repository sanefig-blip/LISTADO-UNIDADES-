import React from 'react';
import { TrashIcon, ArrowRightIcon } from './icons.js';

const TacticalCommandPostView = ({
    interventionGroups,
    availableUnits,
    availablePersonnel,
    allPersonnel,
    onGroupChange,
    onDeleteGroup,
    onAssignUnit,
    onAssignPersonnel,
    onUnassignUnit,
    onUnassignPersonnel,
    onUnitDetailChange
}) => {
    return (
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            React.createElement("div", { className: "lg:col-span-1 bg-zinc-800/60 p-4 rounded-xl space-y-4 h-min sticky top-36" },
                React.createElement("h3", { className: "text-xl font-semibold text-yellow-300 border-b border-zinc-700 pb-2 mb-2" },
                    `Recursos Disponibles (${availableUnits.length} U / ${availablePersonnel.length} P)`
                ),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("h4", { className: "text-lg font-semibold text-white mb-2" }, `Unidades (${availableUnits.length})`),
                        React.createElement("ul", { className: "space-y-2 max-h-64 overflow-y-auto pr-2" },
                            availableUnits.map(unit => (
                                React.createElement("li", { key: unit.id, className: "flex justify-between items-center bg-zinc-700/50 p-2 rounded-md text-sm" },
                                    React.createElement("span", { className: "font-mono text-zinc-200" }, unit.id, " ", React.createElement("span", { className: "text-zinc-400" }, `(${unit.type})`)),
                                    React.createElement("div", { className: "flex gap-1" },
                                        interventionGroups.map(g => (
                                            React.createElement("button", { key: g.id, onClick: () => onAssignUnit(unit, g.id), className: "p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white", title: `Asignar a ${g.name}` }, React.createElement(ArrowRightIcon, { className: "w-4 h-4" }))
                                        ))
                                    )
                                )
                            ))
                        )
                    ),
                    React.createElement("div", null,
                        React.createElement("h4", { className: "text-lg font-semibold text-white mb-2" }, `Personal (${availablePersonnel.length})`),
                        React.createElement("ul", { className: "space-y-2 max-h-64 overflow-y-auto pr-2" },
                            availablePersonnel.map(person => (
                                React.createElement("li", { key: person.id, className: "flex justify-between items-center bg-zinc-700/50 p-2 rounded-md text-sm" },
                                    React.createElement("span", { className: "text-zinc-200" }, person.name),
                                    React.createElement("div", { className: "flex gap-1" },
                                         interventionGroups.map(g => (
                                            React.createElement("button", { key: g.id, onClick: () => onAssignPersonnel(person, g.id), className: "p-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white", title: `Asignar a ${g.name}` }, React.createElement(ArrowRightIcon, { className: "w-4 h-4" }))
                                        ))
                                    )
                                )
                            ))
                        )
                    )
                )
            ),

            React.createElement("div", { className: "lg:col-span-2 space-y-4" },
                interventionGroups.map(group => (
                    React.createElement("div", { key: group.id, className: "bg-zinc-900/50 p-4 rounded-lg" },
                        React.createElement("div", { className: "flex justify-between items-center mb-3" },
                            React.createElement("input", { value: group.name, onChange: e => onGroupChange(group.id, 'name', e.target.value), className: "text-lg font-bold bg-transparent text-white border-b-2 border-zinc-700 focus:border-blue-500 outline-none w-1/2"}),
                            React.createElement("button", { onClick: () => onDeleteGroup(group.id), className: "p-1 text-red-400 hover:text-red-300" }, React.createElement(TrashIcon, { className: "w-5 h-5"}))
                        ),
                        React.createElement("div", { className: "mb-3" },
                            React.createElement("label", { className: "text-sm text-zinc-400" }, "Oficial a Cargo:"),
                            React.createElement("input", { value: group.officerInCharge, onChange: e => onGroupChange(group.id, 'officerInCharge', e.target.value), className: "w-full bg-zinc-700 rounded p-1 mt-1 text-white", list: "personnel-list"}),
                            React.createElement("datalist", { id: "personnel-list" },
                                allPersonnel.map(p => React.createElement("option", { key: p.id, value: p.name }))
                            )
                        ),
                        
                        React.createElement("h5", { className: "font-semibold text-white mt-4 mb-2" }, `Unidades Asignadas (${group.units.length})`),
                        group.units.map(unit => (
                            React.createElement("div", { key: unit.id, className: "bg-zinc-800 p-3 rounded-md mb-2 space-y-2" },
                                React.createElement("div", { className: "flex justify-between items-center" },
                                    React.createElement("p", { className: "font-mono font-bold text-zinc-200" }, unit.id),
                                    React.createElement("button", { onClick: () => onUnassignUnit(unit.id, group.id), className: "text-zinc-400 hover:text-yellow-400" }, React.createElement(TrashIcon, { className: "w-4 h-4"}))
                                ),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                                    React.createElement("input", { value: unit.task, onChange: e => onUnitDetailChange(group.id, unit.id, 'task', e.target.value), placeholder: "Tarea asignada", className: "bg-zinc-700 rounded p-1 text-white" }),
                                    React.createElement("input", { value: unit.locationInScene, onChange: e => onUnitDetailChange(group.id, unit.id, 'locationInScene', e.target.value), placeholder: "Ubicación", className: "bg-zinc-700 rounded p-1 text-white" }),
                                    React.createElement("input", { value: unit.workTime, onChange: e => onUnitDetailChange(group.id, unit.id, 'workTime', e.target.value), placeholder: "Tiempo de Trabajo", className: "bg-zinc-700 rounded p-1 text-white" }),
                                    React.createElement("input", { value: unit.departureTime, onChange: e => onUnitDetailChange(group.id, unit.id, 'departureTime', e.target.value), placeholder: "H. Salida", className: "bg-zinc-700 rounded p-1 text-white" }),
                                    React.createElement("input", { value: unit.onSceneTime, onChange: e => onUnitDetailChange(group.id, unit.id, 'onSceneTime', e.target.value), placeholder: "H. Lugar", className: "bg-zinc-700 rounded p-1 text-white" }),
                                    React.createElement("input", { value: unit.returnTime, onChange: e => onUnitDetailChange(group.id, unit.id, 'returnTime', e.target.value), placeholder: "H. Regreso", className: "bg-zinc-700 rounded p-1 text-white" })
                                )
                            )
                        )),

                        React.createElement("h5", { className: "font-semibold text-white mt-4 mb-2" }, `Personal Asignado (${group.personnel.length})`),
                        React.createElement("ul", { className: "space-y-1 text-sm max-h-60 overflow-y-auto pr-2" },
                            group.personnel.map(person => (
                                React.createElement("li", { key: person.id, className: "flex justify-between items-center bg-zinc-800 p-2 rounded-md" },
                                    React.createElement("span", { className: "text-zinc-300" }, person.name, " ", React.createElement("span", { className: "text-xs text-zinc-400" }, `(${person.rank})`)),
                                    React.createElement("button", { onClick: () => onUnassignPersonnel(person.id, group.id), className: "text-zinc-400 hover:text-yellow-400" }, React.createElement(TrashIcon, { className: "w-4 h-4"}))
                                )
                            ))
                        )
                    )
                ))
            )
        )
    );
};

export default TacticalCommandPostView;