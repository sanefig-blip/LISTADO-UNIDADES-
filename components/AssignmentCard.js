import React from 'react';
import { ClockIcon, UsersIcon, LocationMarkerIcon, ClipboardListIcon, AnnotationIcon } from './icons.js';

const AssignmentCard = ({ assignment, onStatusChange }) => {
    const otherDetails = assignment.details || [];

    const cardClasses = [
        "bg-zinc-800 p-4 rounded-lg border border-zinc-700 transform hover:scale-[1.02] transition-transform duration-200 h-full flex flex-col",
        assignment.inService && !assignment.serviceEnded ? "border-l-4 border-green-500" : "",
        assignment.serviceEnded ? "opacity-60 border-l-4 border-red-700" : ""
    ].join(" ").trim();

    const textStrikeThroughClass = assignment.serviceEnded ? "line-through" : "";

    const getPersonnelStyle = () => {
        if (assignment.serviceEnded) {
            return { text: 'line-through text-red-400', icon: 'text-red-400' };
        }
        if (assignment.inService) {
            return { text: 'font-bold text-green-400', icon: 'text-green-400' };
        }
        return { text: 'text-zinc-300', icon: 'text-zinc-400' };
    };

    const personnelStyle = getPersonnelStyle();
    
    return (
        React.createElement("div", { className: cardClasses },
            assignment.serviceTitle && (
              React.createElement("div", { className: "flex items-center mb-2 text-sm text-blue-300/80" },
                React.createElement(ClipboardListIcon, { className: "w-4 h-4 mr-2" }),
                React.createElement("span", { className: textStrikeThroughClass }, assignment.serviceTitle)
              )
            ),
            React.createElement("h4", { className: `font-bold text-lg text-yellow-300 ${textStrikeThroughClass}` }, assignment.location),
            
            assignment.novelty && (
                React.createElement("div", { className: "mt-3 p-3 bg-yellow-900/40 border border-yellow-700 rounded-md" },
                    React.createElement("div", { className: "flex items-start" },
                        React.createElement(AnnotationIcon, { className: "w-5 h-5 mr-2 text-yellow-300 flex-shrink-0" }),
                        React.createElement("p", { className: "text-yellow-200 text-sm" }, assignment.novelty)
                    )
                )
            ),

            React.createElement("div", { className: `mt-3 space-y-2 ${assignment.serviceEnded ? 'text-zinc-500' : 'text-zinc-300'} flex-grow` },
                 assignment.implementationTime && (
                    React.createElement("div", { className: "flex items-center" },
                        React.createElement(ClockIcon, { className: "w-5 h-5 mr-2 text-teal-400 flex-shrink-0" }),
                        React.createElement("span", { className: `font-semibold ${assignment.serviceEnded ? 'text-teal-600' : 'text-teal-300'} ${textStrikeThroughClass}` }, assignment.implementationTime)
                    )
                ),
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(ClockIcon, { className: "w-5 h-5 mr-2 text-zinc-400 flex-shrink-0" }),
                    React.createElement("span", { className: textStrikeThroughClass }, assignment.time)
                ),
                React.createElement("div", { className: "flex items-start" },
                    React.createElement(UsersIcon, { className: `w-5 h-5 mr-2 flex-shrink-0 mt-1 ${personnelStyle.icon}` }),
                    React.createElement("span", { className: personnelStyle.text }, assignment.personnel)
                ),
                assignment.unit && (
                    React.createElement("div", { className: "flex items-center" },
                        React.createElement(LocationMarkerIcon, { className: "w-5 h-5 mr-2 text-zinc-400 flex-shrink-0" }),
                        React.createElement("span", { className: textStrikeThroughClass }, "Unidad: ", assignment.unit)
                    )
                )
            ),
            otherDetails.length > 0 && (
                React.createElement("div", { className: `text-sm italic pt-3 mt-3 border-t border-zinc-700 space-y-1 ${assignment.serviceEnded ? 'text-zinc-500' : 'text-zinc-400'}` },
                    otherDetails.map((detail, index) => (
                        React.createElement("p", { key: index, className: textStrikeThroughClass }, detail.trim())
                    ))
                )
            ),

            onStatusChange && (
                React.createElement("div", { className: "mt-4 pt-3 border-t border-zinc-700 flex items-center justify-around text-sm" },
                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer text-green-300" },
                        React.createElement("input", {
                            type: "checkbox",
                            className: "h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-green-500 focus:ring-green-500",
                            checked: assignment.inService || false,
                            onChange: (e) => onStatusChange({ inService: e.target.checked })
                        }),
                        "Personal en Servicio"
                    ),
                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer text-red-300" },
                        React.createElement("input", {
                            type: "checkbox",
                            className: "h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-red-500 focus:ring-red-500",
                            checked: assignment.serviceEnded || false,
                            onChange: (e) => onStatusChange({ serviceEnded: e.target.checked })
                        }),
                        "Finalizó Servicio"
                    )
                )
            )
        )
    );
};

export default AssignmentCard;