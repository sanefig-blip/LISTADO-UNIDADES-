import React from 'react';
import { LogEntry, User } from '../types';
import { TrashIcon, ClipboardListIcon } from './icons';

interface ChangeHistoryProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  currentUser: User | null;
}

const ChangeHistory: React.FC<ChangeHistoryProps> = ({ logs, onClearLogs, currentUser }) => {
  return (
    <div className="animate-fade-in bg-zinc-800/60 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4 border-b border-zinc-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <ClipboardListIcon className="w-8 h-8 text-blue-300"/>
          Historial de Cambios
        </h2>
        {currentUser?.username === 'OCOB (Administrador)' && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
          >
            <TrashIcon className="w-5 h-5"/>
            Limpiar Historial
          </button>
        )}
      </div>
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-zinc-800/60 backdrop-blur-sm">
            <tr className="text-sm text-zinc-400">
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Acción Realizada</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              [...logs].reverse().map((log, index) => (
                <tr key={index} className="border-t border-zinc-700/50 hover:bg-zinc-700/30">
                  <td className="p-3 text-zinc-300 font-mono text-sm">{new Date(log.timestamp).toLocaleString('es-AR')}</td>
                  <td className="p-3 text-zinc-200 font-semibold">{log.user}</td>
                  <td className="p-3 text-zinc-300">{log.action}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-zinc-500">
                  No hay cambios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChangeHistory;