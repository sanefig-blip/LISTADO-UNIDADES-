import React from 'react';
import { TrashIcon, ClipboardListIcon } from './icons.js';

const ChangeHistory = ({ logs, onClearLogs, currentUser }) => {
  return (
    React.createElement("div", { className: "animate-fade-in bg-zinc-800/60 p-6 rounded-xl" },
      React.createElement("div", { className: "flex justify-between items-center mb-4 border-b border-zinc-700 pb-4" },
        React.createElement("h2", { className: "text-2xl font-bold text-white flex items-center gap-3" },
          React.createElement(ClipboardListIcon, { className: "w-8 h-8 text-blue-300" }),
          "Historial de Cambios"
        ),
        currentUser?.username === 'OCOB (Administrador)' && (
          React.createElement("button", {
            onClick: onClearLogs,
            className: "flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
          },
            React.createElement(TrashIcon, { className: "w-5 h-5" }),
            "Limpiar Historial"
          )
        )
      ),
      React.createElement("div", { className: "overflow-auto max-h-[70vh]" },
        React.createElement("table", { className: "w-full text-left" },
          React.createElement("thead", { className: "sticky top-0 bg-zinc-800/60 backdrop-blur-sm" },
            React.createElement("tr", { className: "text-sm text-zinc-400" },
              React.createElement("th", { className: "p-3" }, "Fecha y Hora"),
              React.createElement("th", { className: "p-3" }, "Usuario"),
              React.createElement("th", { className: "p-3" }, "Acción Realizada")
            )
          ),
          React.createElement("tbody", null,
            logs.length > 0 ? (
              [...logs].reverse().map((log, index) => (
                React.createElement("tr", { key: index, className: "border-t border-zinc-700/50 hover:bg-zinc-700/30" },
                  React.createElement("td", { className: "p-3 text-zinc-300 font-mono text-sm" }, new Date(log.timestamp).toLocaleString('es-AR')),
                  React.createElement("td", { className: "p-3 text-zinc-200 font-semibold" }, log.user),
                  React.createElement("td", { className: "p-3 text-zinc-300" }, log.action)
                )
              ))
            ) : (
              React.createElement("tr", null,
                React.createElement("td", { colSpan: 3, className: "text-center py-8 text-zinc-500" },
                  "No hay cambios registrados."
                )
              )
            )
          )
        )
      )
    )
  );
};

export default ChangeHistory;