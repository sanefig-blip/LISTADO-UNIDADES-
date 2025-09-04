import React, { useState } from 'react';
import AssignmentCard from './AssignmentCard.js';
import { ChevronDownIcon, ClockIcon } from './icons.js';

const TimeGroupSection = ({ time, assignments, onAssignmentStatusChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const timeId = `time-group-${time.replace(/[^a-zA-Z0-9]/g, '-')}`;

    return (
        React.createElement("div", { className: "bg-zinc-800/60 rounded-xl shadow-lg mb-8 overflow-hidden" },
            React.createElement("button", {
                onClick: () => setIsOpen(!isOpen),
                className: "w-full flex items-center justify-between p-6 text-left focus:outline-none",
                "aria-controls": timeId,
                "aria-expanded": isOpen
            },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(ClockIcon, { className: "w-8 h-8 mr-4 text-yellow-300 flex-shrink-0" }),
                    React.createElement("h3", { className: "text-xl sm:text-2xl font-bold text-white" }, time)
                ),
                React.createElement(ChevronDownIcon, {
                    className: `w-7 h-7 text-zinc-300 flex-shrink-0 transform transition-transform duration-300 ml-4 ${isOpen ? 'rotate-180' : 'rotate-0'}`
                })
            ),
            React.createElement("div", {
                id: timeId,
                className: `grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`
            },
                React.createElement("div", { className: "overflow-hidden" },
                    React.createElement("div", { className: "p-6 bg-zinc-900/40" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" },
                            assignments.map((assignment) => (
                                React.createElement(AssignmentCard, { 
                                  key: assignment.id, 
                                  assignment: assignment, 
                                  onStatusChange: (statusUpdate) => onAssignmentStatusChange(assignment.id, statusUpdate)
                                })
                            ))
                        )
                    )
                )
            )
        )
    );
};

const TimeGroupedScheduleDisplay = ({ assignmentsByTime, onAssignmentStatusChange }) => {
  const sortedTimeKeys = Object.keys(assignmentsByTime).sort((a, b) => {
    const timeA = parseInt(a.split(':')[0], 10);
    const timeB = parseInt(b.split(':')[0], 10);
    return timeA - timeB;
  });

  return (
    React.createElement("div", { className: "animate-fade-in" },
        sortedTimeKeys.map(time => (
            React.createElement(TimeGroupSection, { 
                key: time, 
                time: time, 
                assignments: assignmentsByTime[time], 
                onAssignmentStatusChange: onAssignmentStatusChange
            })
        ))
    )
  );
};

export default TimeGroupedScheduleDisplay;