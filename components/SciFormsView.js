import React, { useState } from 'react';
import FormSCI201View from './FormSCI201View.js';
import FormSCI211View from './FormSCI211View.js';
import FormSCI207View from './FormSCI207View.js';
import { DocumentTextIcon } from './icons.js';

const SciFormsView = ({ personnel, unitList }) => {
    const [activeTab, setActiveTab] = useState('sci201');
    
    const TabButton = ({ tabId, children }) => (
        React.createElement("button", {
            onClick: () => setActiveTab(tabId),
            className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-zinc-800/60 text-white' : 'bg-zinc-900/50 hover:bg-zinc-700/80 text-zinc-400'}`
        },
        children)
    );

    return (
        React.createElement("div", { className: "animate-fade-in space-y-6" },
             React.createElement("div", { className: "bg-zinc-800/60 p-4 rounded-xl flex justify-between items-center" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-3xl font-bold text-white flex items-center gap-3" },
                        React.createElement(DocumentTextIcon, { className: "w-8 h-8 text-blue-300" }),
                        "Formularios SCI (Sistema de Comando de Incidentes)"
                    ),
                     React.createElement("p", { className: "text-zinc-400" }, "Gestión de formularios estándar para el comando de incidentes.")
                )
            ),
            
            React.createElement("div", { className: "flex border-b border-zinc-700" },
                React.createElement(TabButton, { tabId: "sci201" }, "SCI-201: Briefing de Incidente"),
                React.createElement(TabButton, { tabId: "sci211" }, "SCI-211: Registro de Recursos"),
                React.createElement(TabButton, { tabId: "sci207" }, "SCI-207: Registro de Víctimas")
            ),
            React.createElement("div", { className: "pt-4" },
                activeTab === 'sci201' && React.createElement(FormSCI201View, null),
                activeTab === 'sci211' && React.createElement(FormSCI211View, { personnel: personnel, unitList: unitList }),
                activeTab === 'sci207' && React.createElement(FormSCI207View, null)
            )
        )
    );
};

export default SciFormsView;
