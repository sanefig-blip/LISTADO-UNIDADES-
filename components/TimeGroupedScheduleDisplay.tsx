

import React, { useState } from 'react';
import { Assignment } from '../types';
import AssignmentCard from './AssignmentCard';
import { ChevronDownIcon, ClockIcon } from './icons';

interface TimeGroupedScheduleDisplayProps {
  assignmentsByTime: { [time: string]: Assignment[] };
  onAssignmentStatusChange: (assignmentId: string, statusUpdate: { inService?: boolean; serviceEnded?: boolean }) => void;
}

interface TimeGroupSectionProps {
    time: string;
    assignments: Assignment[];
    onAssignmentStatusChange: (assignmentId: string, statusUpdate: { inService?: boolean; serviceEnded?: boolean }) => void;
}

const TimeGroupSection: React.FC<TimeGroupSectionProps> = ({ time, assignments, onAssignmentStatusChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const timeId = `time-group-${time.replace(/[^a-zA-Z0-9]/g, '-')}`;

    return (
        <div className="bg-zinc-800/60 rounded-xl shadow-lg mb-8 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                aria-controls={timeId}
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 mr-4 text-yellow-300 flex-shrink-0" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{time}</h3>
                </div>
                <ChevronDownIcon
                    className={`w-7 h-7 text-zinc-300 flex-shrink-0 transform transition-transform duration-300 ml-4 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </button>
            <div
                id={timeId}
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-6 bg-zinc-900/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {assignments.map((assignment) => (
                                <AssignmentCard 
                                  key={assignment.id} 
                                  assignment={assignment} 
                                  onStatusChange={(statusUpdate) => onAssignmentStatusChange(assignment.id, statusUpdate)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimeGroupedScheduleDisplay: React.FC<TimeGroupedScheduleDisplayProps> = ({ assignmentsByTime, onAssignmentStatusChange }) => {
  const sortedTimeKeys = Object.keys(assignmentsByTime).sort((a, b) => {
    const timeA = parseInt(a.split(':')[0], 10);
    const timeB = parseInt(b.split(':')[0], 10);
    return timeA - timeB;
  });

  return (
    <div className="animate-fade-in">
        {sortedTimeKeys.map(time => (
            <TimeGroupSection 
                key={time} 
                time={time} 
                assignments={assignmentsByTime[time]} 
                onAssignmentStatusChange={onAssignmentStatusChange}
            />
        ))}
    </div>
  );
};

export default TimeGroupedScheduleDisplay;