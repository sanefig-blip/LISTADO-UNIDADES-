import React, { useState } from 'react';
import { XIcon } from './icons';

interface RosterImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
}

const RosterImportModal: React.FC<RosterImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Importar Rol de Guardia</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div>
                    <p className="text-zinc-300 mb-4">Selecciona un archivo .json o .docx para importar y fusionar con el rol de guardia actual.</p>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".json,.docx"
                        className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-500 text-white">Cancelar</button>
                    <button onClick={handleImportClick} disabled={!file} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:bg-zinc-500 disabled:cursor-not-allowed">
                        Importar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RosterImportModal;