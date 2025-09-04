import React from 'react';
import { XIcon, DownloadIcon } from './icons.tsx';
import { exportExcelTemplate, exportWordTemplate, exportRosterWordTemplate } from '../services/exportService.ts';
import { Personnel } from '../types.ts';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    unitList: string[];
    commandPersonnel: Personnel[];
    servicePersonnel: Personnel[];
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, unitList, commandPersonnel, servicePersonnel }) => {
  if (!isOpen) {
    return null;
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in"
        onClick={handleContentClick}
      >
        <header className="flex items-center justify-between p-6 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Guía de Ayuda de la Aplicación</h2>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 md:p-8 overflow-y-auto space-y-8 text-zinc-300">
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Vistas Principales</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Reporte de Unidades:</strong> Vista principal para ver y editar el estado de todas las unidades.</li>
              <li><strong className="text-white">Planificador:</strong> Muestra todos los servicios planificados. Aquí puedes editar, añadir, mover, ocultar y exportar los servicios del día.</li>
              <li><strong className="text-white">Vista por Hora:</strong> Agrupa todas las asignaciones de los servicios visibles por su horario de inicio, facilitando la visualización cronológica de las tareas.</li>
              <li><strong className="text-white">Nomencladores:</strong> Permite gestionar las listas predefinidas de "Personal" y "Unidades" que se utilizan en los menús desplegables.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Reporte de Unidades (Importar/Exportar)</h3>
            <p className="mb-2">
                Puedes importar un reporte de unidades completo desde un archivo Excel (<code className="bg-zinc-900 px-1 rounded">.xlsx</code>) o un PDF (<code className="bg-zinc-900 px-1 rounded">.pdf</code>) que haya sido generado previamente por esta aplicación.
            </p>
            <p className="mb-4">
                <strong className="text-white">Importante:</strong> La importación reemplazará todo el reporte de unidades actual.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Importar PDF:</strong> Es la forma más fiable. Solo funciona con archivos PDF exportados desde esta misma aplicación, ya que los datos se guardan internamente en el archivo.</li>
              <li><strong className="text-white">Importar Excel:</strong> La aplicación intentará leer la estructura de tu archivo Excel. Funciona mejor si el archivo tiene un formato similar al reporte estándar.</li>
              <li><strong className="text-white">Exportar PDF:</strong> Genera un PDF del reporte actual, que puede ser compartido o archivado. Este PDF puede ser re-importado más tarde.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Importar Horario (Excel o Word)</h3>
            <p className="mb-4">
              Esta función permite añadir o reemplazar los servicios actuales cargando un archivo Excel (<code className="bg-zinc-900 px-1 rounded">.xlsx</code>) o Word (<code className="bg-zinc-900 px-1 rounded">.docx</code>). Al seleccionar el archivo, la aplicación te preguntará si deseas <strong className="text-white">"Añadir"</strong> los nuevos servicios a los existentes o <strong className="text-white">"Reemplazar"</strong> todo el horario.
            </p>
            <h4 className="font-semibold text-white mb-2">Formato del Archivo Excel:</h4>
            <p className="mb-3">El archivo debe contener una hoja con las siguientes columnas. Las filas se agrupan automáticamente en servicios basados en el "Título del Servicio".</p>
            <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-700 text-sm">
              <ul className="space-y-1">
                <li><code className="text-yellow-300">Título del Servicio</code> (Requerido para agrupar)</li>
                <li><code className="text-yellow-300">Descripción del Servicio</code> (Opcional)</li>
                <li><code className="text-yellow-300">Novedad del Servicio</code> (Opcional)</li>
                <li><code className="text-yellow-300">Ubicación de Asignación</code> (Requerido)</li>
                <li><code className="text-yellow-300">Horario de Asignación</code> (Requerido)</li>
                <li><code className="text-yellow-300">Personal de Asignación</code> (Requerido)</li>
                <li><code className="text-yellow-300">Unidad de Asignación</code> (Opcional)</li>
                <li><code className="text-yellow-300">Detalles de Asignación</code> (Opcional, separa con <code className="bg-zinc-700 px-1 rounded">;</code> o saltos de línea)</li>
              </ul>
            </div>
            <h4 className="font-semibold text-white mt-6 mb-2">Formato del Archivo Word:</h4>
            <p className="mb-3">El archivo debe seguir un formato simple de <strong className="text-white">Clave: Valor</strong> en cada línea. Las asignaciones se agrupan bajo el mismo "Título del Servicio". La nueva plantilla descargable incluye listas de personal y unidades para facilitar el copiado y pegado de datos correctos.</p>
            <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-700 font-mono text-xs">
                <p><span className="text-yellow-300">Título del Servicio:</span> Ejemplo Servicio 1</p>
                <p><span className="text-yellow-300">Ubicación de Asignación:</span> Lugar A</p>
                <p><span className="text-yellow-300">Horario de Asignación:</span> 08:00 Hs.</p>
                <p>...</p>
            </div>
             <div className="mt-6 flex flex-wrap gap-4">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md transition-colors"
                onClick={() => exportExcelTemplate()}
                aria-label="Descargar plantilla de Excel de ejemplo"
              ><DownloadIcon className="w-5 h-5"/>Descargar Plantilla Excel</button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                onClick={() => exportWordTemplate({ unitList, commandPersonnel, servicePersonnel })}
                aria-label="Descargar plantilla de Word de ejemplo"
              ><DownloadIcon className="w-5 h-5"/>Descargar Plantilla Word</button>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Importar Rol de Guardia</h3>
            <p className="mb-4">
              Puedes importar el rol de guardia mensual desde un archivo <code className="bg-zinc-900 px-1 rounded">.json</code> o un documento de Word (<code className="bg-zinc-900 px-1 rounded">.docx</code>). Si tienes el rol en un PDF, primero conviértelo a formato Word.
            </p>
            <h4 className="font-semibold text-white mb-2">Formato del Archivo Word:</h4>
            <p className="mb-3">El documento debe tener fechas en formato <code className="bg-zinc-900 px-1 rounded">DD/MM/AAAA</code> y debajo, las asignaciones con el formato <code className="bg-zinc-900 px-1 rounded">ROL: Nombre Apellido</code>.</p>
            <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-700 font-mono text-xs">
                <p>01/08/2025</p>
                <p><span className="text-yellow-300">JEFE DE SERVICIO:</span> APELLIDO, Nombre</p>
                <p><span className="text-yellow-300">JEFE DE GUARDIA:</span> OTRO APELLIDO, Nombre</p>
            </div>
             <div className="mt-6 flex flex-wrap gap-4">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-md transition-colors"
                onClick={() => exportRosterWordTemplate()}
              ><DownloadIcon className="w-5 h-5"/>Descargar Plantilla Word para Rol</button>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Controles Adicionales</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Selector de Fecha:</strong> Ubicado bajo el título "Línea de Guardia", permite cambiar la fecha que aparecerá en los documentos exportados.</li>
              <li><strong className="text-white">Reiniciar Datos (ícono de refrescar):</strong> Borra todos los datos del horario y nomencladores guardados en tu navegador y los restaura a los valores por defecto. <strong className="text-red-400">¡Esta acción no se puede deshacer!</strong></li>
            </ul>
          </section>
        </main>
        <footer className="p-4 bg-zinc-900/50 border-t border-zinc-700 flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;