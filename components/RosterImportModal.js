import React, { useState } from 'react';
import { XIcon } from './icons.js';

const RosterImportModal = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImportClick = () => {
        if (file) {
            onImport(file);
        }
    };

    return (
        React.createElement("div", { className: "fixed inset-0 bg-black/60 z-50 flex justify-center items-center", onClick: onClose },
            React.createElement("div", { className: "bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md", onClick: e => e.stopPropagation() },
                React.createElement("div", { className: "flex justify-between items-center mb-4" },
                    React.createElement("h2", { className: "text-xl font-bold text-white" }, "Importar Rol de Guardia"),
                    React.createElement("button", { onClick: onClose, className: "text-zinc-400 hover:text-white" },
                        React.createElement(XIcon, { className: "w-6 h-6" })
                    )
                ),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-zinc-300 mb-4" }, "Selecciona un archivo .json o .docx para importar y fusionar con el rol de guardia actual."),
                    React.createElement("input", {
                        type: "file",
                        onChange: handleFileChange,
                        accept: ".json,.docx",
                        className: "w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                    })
                ),
                React.createElement("div", { className: "mt-6 flex justify-end gap-4" },
                    React.createElement("button", { onClick: onClose, className: "px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-500 text-white" }, "Cancelar"),
                    React.createElement("button", { onClick: handleImportClick, disabled: !file, className: "px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:bg-zinc-500 disabled:cursor-not-allowed" },
                        "Importar"
                    )
                )
            )
        )
    );
};

export default RosterImportModal;