import React from 'react';
import { XIcon, DownloadIcon } from './icons.js';

const ExportTemplateModal = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) return null;

  return (
    React.createElement("div", {
      className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in",
      onClick: onClose,
      "aria-modal": "true",
      role: "dialog"
    },
      React.createElement("div", {
        className: "bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-scale-in",
        onClick: e => e.stopPropagation()
      },
        React.createElement("header", { className: "flex items-center justify-between p-6 border-b border-zinc-700" },
          React.createElement("h2", { className: "text-2xl font-bold text-white" }, "Exportar Como Plantilla"),
          React.createElement("button", { onClick: onClose, className: "p-1 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors" },
            React.createElement(XIcon, { className: "w-6 h-6" })
          )
        ),

        React.createElement("main", { className: "p-6 md:p-8 space-y-6 text-zinc-300" },
          React.createElement("p", null,
            "Exporta el horario actual como un archivo de plantilla que puede ser modificado y re-importado."
          ),
          React.createElement("p", null,
            "Elige el formato que prefieras:"
          ),
          React.createElement("div", { className: "flex flex-col sm:flex-row justify-center gap-4 pt-4" },
            React.createElement("button", {
              onClick: () => onExport('excel'),
              className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md transition-colors",
              "aria-label": "Exportar como plantilla de Excel"
            },
              React.createElement(DownloadIcon, { className: "w-6 h-6" }),
              "Exportar a Excel"
            ),
            React.createElement("button", {
              onClick: () => onExport('word'),
              className: "w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-md transition-colors",
              "aria-label": "Exportar como plantilla de Word"
            },
              React.createElement(DownloadIcon, { className: "w-6 h-6" }),
              "Exportar a Word"
            )
          )
        )
      )
    )
  );
};

export default ExportTemplateModal;
