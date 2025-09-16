import React, { useState, useEffect } from 'react';
import { PencilIcon, XCircleIcon } from './icons.js';

const RegimenDeIntervencion = ({ regimenData, onUpdateRegimenData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState(() => JSON.parse(JSON.stringify(regimenData)));

    useEffect(() => {
        setEditableData(JSON.parse(JSON.stringify(regimenData)));
    }, [regimenData]);

    const handleContentChange = (sectionIndex, contentIndex, value) => {
        setEditableData(prev => {
            const newSections = [...prev.sections];
            const newContent = [...newSections[sectionIndex].content];
            newContent[contentIndex].content = value;
            newSections[sectionIndex] = { ...newSections[sectionIndex], content: newContent };
            return { ...prev, sections: newSections };
        });
    };

    const handleTableCellChange = (sectionIndex, contentIndex, rowIndex, header, value) => {
         setEditableData(prev => {
            const newSections = [...prev.sections];
            const content = newSections[sectionIndex].content[contentIndex];
            if (content.type === 'table') {
                const newRows = [...content.rows];
                newRows[rowIndex] = { ...newRows[rowIndex], [header]: value };
                const newContent = { ...content, rows: newRows };
                const allContent = [...newSections[sectionIndex].content];
                allContent[contentIndex] = newContent;
                newSections[sectionIndex] = { ...newSections[sectionIndex], content: allContent };
                return { ...prev, sections: newSections };
            }
            return prev;
        });
    };

    const handleSave = () => {
        onUpdateRegimenData({ ...editableData, lastUpdated: new Date().toISOString() });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditableData(JSON.parse(JSON.stringify(regimenData)));
        setIsEditing(false);
    };

    const EditableField = ({ value, onChange, isEditing, tag = 'p', className = '' }) => {
        const Tag = tag;
        return isEditing ? (
            React.createElement("textarea", {
                value: value,
                onChange: (e) => onChange(e.target.value),
                className: `w-full bg-zinc-700/80 border border-zinc-600 rounded-md p-2 text-white resize-y ${className}`
            })
        ) : (
            React.createElement(Tag, { className: className }, value)
        );
    };

    return (
        React.createElement("div", { className: "animate-fade-in space-y-8" },
            React.createElement("div", { className: "bg-zinc-800/60 p-6 rounded-xl flex justify-between items-center" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-3xl font-bold text-white" }, regimenData.title),
                    React.createElement("p", { className: "text-zinc-400 text-sm" }, "Última actualización: ", new Date(regimenData.lastUpdated).toLocaleString())
                ),
                isEditing ? (
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("button", { onClick: handleSave, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5" }), " Guardar"),
                        React.createElement("button", { onClick: handleCancel, className: "p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors" }, React.createElement(XCircleIcon, { className: "w-6 h-6" }))
                    )
                ) : (
                    React.createElement("button", { onClick: () => setIsEditing(true), className: "px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-md text-white font-semibold transition-colors flex items-center gap-2" }, React.createElement(PencilIcon, { className: "w-5 h-5" }), " Editar")
                )
            ),

            editableData.sections.map((section, sectionIdx) => (
                React.createElement("section", { key: section.id, className: "bg-zinc-800/60 p-6 rounded-xl" },
                    React.createElement("h3", { className: "text-2xl font-bold text-yellow-300 mb-4 border-b border-zinc-700 pb-2" }, section.title),
                    React.createElement("div", { className: "space-y-4" },
                        section.content.map((item, contentIdx) => {
                            switch (item.type) {
                                case 'text':
                                    return React.createElement(EditableField, { key: contentIdx, value: item.content, onChange: (val) => handleContentChange(sectionIdx, contentIdx, val), isEditing: isEditing, className: "text-zinc-300 leading-relaxed" });
                                case 'subtitle':
                                     return React.createElement("h4", { key: contentIdx, className: "text-lg font-semibold text-blue-300 mt-6 mb-2" }, item.content);
                                case 'table':
                                    return (
                                        React.createElement("div", { key: contentIdx, className: "overflow-x-auto" },
                                            React.createElement("table", { className: "w-full min-w-[600px] text-left" },
                                                React.createElement("thead", null,
                                                    React.createElement("tr", { className: "border-b-2 border-zinc-600" },
                                                        item.headers.map(header => React.createElement("th", { key: header, className: "p-2 text-sm font-semibold text-zinc-300" }, header))
                                                    )
                                                ),
                                                React.createElement("tbody", null,
                                                    item.rows.map((row, rowIdx) => (
                                                        React.createElement("tr", { key: row.id, className: "border-t border-zinc-700" },
                                                            item.headers.map(header => (
                                                                React.createElement("td", { key: `${row.id}-${header}`, className: "p-2 text-zinc-300" },
                                                                    React.createElement(EditableField, { value: row[header] || '', onChange: (val) => handleTableCellChange(sectionIdx, contentIdx, rowIdx, header, val), isEditing: isEditing, tag: "span" })
                                                                )
                                                            ))
                                                        )
                                                    ))
                                                )
                                            ),
                                            item.notes && (
                                                React.createElement("div", { className: "mt-4 space-y-2 text-sm text-zinc-400 italic" },
                                                    item.notes.map((note, noteIdx) => React.createElement("p", { key: noteIdx }, "* ", note))
                                                )
                                            )
                                        )
                                    );
                                default:
                                    return null;
                            }
                        })
                    )
                )
            ))
        )
    );
};

export default RegimenDeIntervencion;
