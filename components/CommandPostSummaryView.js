import React, { useState } from 'react';
import { DownloadIcon, ChevronDownIcon } from './icons.js';

const CollapsibleSection = ({ title, count, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        React.createElement("div", { className: "bg-zinc-900/50 p-4 rounded-lg" },
            React.createElement("button", { onClick: () => setIsOpen(!isOpen), className: "w-full flex justify-between items-center text-left" },
                React.createElement("h3", { className: "text-lg font-semibold text-white" }, `${title} (${count})`),
                React.createElement(ChevronDownIcon, { className: `w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}` })
            ),
            isOpen && (
                React.createElement("div", { className: "mt-3 animate-fade-in" },
                    children
                )
            )
        )
    );
}

const CommandPostSummaryView = ({ availableUnits, availablePersonnel, interventionGroups, onExportFullReport }) => {
    
    const interventionUnits = interventionGroups.flatMap(g => g.units);
    const interventionPersonnel = interventionGroups.flatMap(g => g.personnel);

    return (
        React.createElement("div", { className: "animate-fade-in space-y-6" },
            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center" },
                React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Resumen de Puesto de Comando"),
                React.createElement("button", { onClick: onExportFullReport, className: "flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold" },
                    React.createElement(DownloadIcon, { className: "w-5 h-5" }),
                    "Exportar Resumen PDF"
                )
            ),

            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(CollapsibleSection, { title: "Recursos en Intervención", count: interventionUnits.length + interventionPersonnel.length },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("h4", { className: "font-semibold text-blue-300" }, `Unidades (${interventionUnits.length})`),
                        React.createElement("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2 text-sm" },
                             interventionUnits.map(unit => (
                                React.createElement("li", { key: unit.id, className: "bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200" }, unit.id)
                            ))
                        ),
                         React.createElement("h4", { className: "font-semibold text-blue-300 pt-2 border-t border-zinc-700" }, `Personal (${interventionPersonnel.length})`),
                        React.createElement("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2 text-sm" },
                            interventionPersonnel.map(person => (
                                React.createElement("li", { key: person.id, className: "bg-zinc-700/50 p-2 rounded-md text-zinc-200" }, person.name, " ", React.createElement("span", { className: "text-xs text-zinc-400" }, `(${person.rank})`))
                            ))
                        )
                    )
                ),

                React.createElement(CollapsibleSection, { title: "Recursos Disponibles", count: availableUnits.length + availablePersonnel.length },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("h4", { className: "font-semibold text-green-300" }, `Unidades (${availableUnits.length})`),
                         React.createElement("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2 text-sm" },
                            availableUnits.map(unit => (
                                React.createElement("li", { key: unit.id, className: "bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200" }, unit.id)
                            ))
                        ),
                        React.createElement("h4", { className: "font-semibold text-green-300 pt-2 border-t border-zinc-700" }, `Personal (${availablePersonnel.length})`),
                        React.createElement("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2 text-sm" },
                            availablePersonnel.map(person => (
                                React.createElement("li", { key: person.id, className: "bg-zinc-700/50 p-2 rounded-md text-zinc-200" }, person.name, " ", React.createElement("span", { className: "text-xs text-zinc-400" }, `(${person.rank})`))
                            ))
                        )
                    )
                )
            )
        )
    );
};

export default CommandPostSummaryView;