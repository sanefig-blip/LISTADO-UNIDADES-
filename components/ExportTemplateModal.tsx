

import React from 'react';
import { XIcon, DownloadIcon } from './icons';

interface ExportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'excel' | 'word') => void;
}

const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold text-white">Exportar Como Plantilla</h2>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 md:p-8 space-y-6 text-zinc-300">
          <p>
            Exporta el horario actual como un archivo de plantilla que puede ser modificado y re-importado.
          </p>
          <p>
            Elige el formato que prefieras:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => onExport('excel')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md transition-colors"
              aria-label="Exportar como plantilla de Excel"
            >
              <DownloadIcon className="w-6 h-6" />
              Exportar a Excel
            </button>
            <button
              onClick={() => onExport('word')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
              aria-label="Exportar como plantilla de Word"
            >
              <DownloadIcon className="w-6 h-6" />
              Exportar a Word
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExportTemplateModal;
