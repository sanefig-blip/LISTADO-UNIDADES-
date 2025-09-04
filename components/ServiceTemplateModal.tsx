import React from 'react';
import { ServiceTemplate } from '../types';
import { XIcon, TrashIcon, AnnotationIcon } from './icons';

interface ServiceTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ServiceTemplate[];
  onSelectTemplate: (template: ServiceTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const ServiceTemplateModal: React.FC<ServiceTemplateModalProps> = ({ isOpen, onClose, templates, onSelectTemplate, onDeleteTemplate }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Biblioteca de Plantillas de Servicio</h2>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 md:p-8 overflow-y-auto space-y-4 text-zinc-300">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No hay plantillas guardadas.</p>
              <p className="text-sm mt-2">Puedes guardar un servicio como plantilla usando el ícono de marcador en la vista general.</p>
            </div>
          ) : (
            templates.map(template => (
              <div key={template.templateId} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-grow">
                  <h3 className="font-bold text-lg text-yellow-300">{template.title}</h3>
                  {template.description && <p className="text-sm text-zinc-400 mt-1">{template.description}</p>}
                  {template.novelty && (
                     <div className="mt-2 text-sm flex items-start p-2 bg-yellow-900/30 border border-yellow-800/50 rounded-md">
                        <AnnotationIcon className="w-4 h-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0"/>
                        <span className="italic text-yellow-300">{template.novelty}</span>
                     </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                  <button 
                    onClick={() => onSelectTemplate(template)}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm font-semibold transition-colors"
                  >
                    Usar
                  </button>
                  <button 
                    onClick={() => {
                        if (window.confirm(`¿Estás seguro de que quieres eliminar la plantilla "${template.title}"?`)) {
                            onDeleteTemplate(template.templateId)
                        }
                    }}
                    className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-zinc-700"
                    aria-label="Eliminar plantilla"
                  >
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
        
        <footer className="p-4 bg-zinc-900/50 border-t border-zinc-700 flex-shrink-0 flex justify-end">
           <button 
                onClick={onClose} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">
                Cerrar
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ServiceTemplateModal;