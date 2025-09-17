import React, { useState } from 'react';
import { Personnel, UnitReportData } from '../types';
import FormSCI201View from './FormSCI201View';
import FormSCI211View from './FormSCI211View';
import FormSCI207View from './FormSCI207View';
import { DocumentTextIcon } from './icons';

interface SciFormsViewProps {
    personnel: Personnel[];
    unitList: string[];
}

const SciFormsView: React.FC<SciFormsViewProps> = ({ personnel, unitList }) => {
    const [activeTab, setActiveTab] = useState('sci201');
    
    const TabButton = ({ tabId, children }: { tabId: string, children: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-zinc-800/60 text-white' : 'bg-zinc-900/50 hover:bg-zinc-700/80 text-zinc-400'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="animate-fade-in space-y-6">
             <div className="bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <DocumentTextIcon className="w-8 h-8 text-blue-300" />
                        Formularios SCI (Sistema de Comando de Incidentes)
                    </h2>
                     <p className="text-zinc-400">Gestión de formularios estándar para el comando de incidentes.</p>
                </div>
            </div>
            
            <div className="flex border-b border-zinc-700">
                <TabButton tabId="sci201">SCI-201: Briefing de Incidente</TabButton>
                <TabButton tabId="sci211">SCI-211: Registro de Recursos</TabButton>
                <TabButton tabId="sci207">SCI-207: Registro de Víctimas</TabButton>
            </div>
            <div className="pt-4">
                {activeTab === 'sci201' && <FormSCI201View />}
                {activeTab === 'sci211' && <FormSCI211View personnel={personnel} unitList={unitList} />}
                {activeTab === 'sci207' && <FormSCI207View />}
            </div>
        </div>
    );
};

export default SciFormsView;
