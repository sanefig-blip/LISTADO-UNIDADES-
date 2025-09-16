import React from 'react';
import { DownloadIcon } from './icons.js';
import { exportCommandPostSummaryToPdf } from '../services/exportService.js';

const CommandPostSummaryView = ({ availableUnits, availablePersonnel, interventionGroups }) => {
    
    const interventionUnits = interventionGroups.flatMap(g => g.units);
    const interventionPersonnel = interventionGroups.flatMap(g => g.personnel);

    const handleExport = () => {
        exportCommandPostSummaryToPdf(availableUnits, availablePersonnel, interventionUnits, interventionPersonnel);
    };

    const ResourceList = ({ title, count, children }) => (
        React.createElement("div", { className: "bg-zinc-900/50 p-4 rounded-lg" },
            React.createElement("h3", { className: "text-lg font-semibold text-white mb-3" }, `${title} (${count})`),
            React.createElement("ul", { className: "space-y-2 max-h-80 overflow-y-auto pr-2 text-sm" },
                children
            )
        )
    );

    return (
        React.createElement("div", { className: "animate-fade-in space-y-6" },
            React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center" },
                React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Resumen de Puesto de Comando"),
                React.createElement("button", { onClick: handleExport, className: "flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-white font-semibold" },
                    React.createElement(DownloadIcon, { className: "w-5 h-5" }),
                    "Exportar Resumen PDF"
                )
            ),

            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" },
                React.createElement(ResourceList, { title: "Unidades en Intervención", count: interventionUnits.length },
                    interventionUnits.map(unit => (
                        React.createElement("li", { key: unit.id, className: "bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200" }, unit.id)
                    ))
                ),
                React.createElement(ResourceList, { title: "Personal en Intervención", count: interventionPersonnel.length },
                     interventionPersonnel.map(person => (
                        React.createElement("li", { key: person.id, className: "bg-zinc-700/50 p-2 rounded-md text-zinc-200" }, person.name, " ", React.createElement("span", { className: "text-xs text-zinc-400" }, `(${person.rank})`))
                    ))
                ),
                React.createElement(ResourceList, { title: "Unidades Disponibles", count: availableUnits.length },
                     availableUnits.map(unit => (
                        React.createElement("li", { key: unit.id, className: "bg-zinc-700/50 p-2 rounded-md font-mono text-zinc-200" }, unit.id)
                    ))
                ),
                React.createElement(ResourceList, { title: "Personal Disponible", count: availablePersonnel.length },
                     availablePersonnel.map(person => (
                        React.createElement("li", { key: person.id, className: "bg-zinc-700/50 p-2 rounded-md text-zinc-200" }, person.name, " ", React.createElement("span", { className: "text-xs text-zinc-400" }, `(${person.rank})`))
                    ))
                )
            )
        )
    );
};

export default CommandPostSummaryView;