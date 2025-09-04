import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { rankOrder } from './types.js';
import { scheduleData as preloadedScheduleData } from './data/scheduleData.js';
import { unitReportData as preloadedUnitReportData } from './data/unitReportData.js';
import { eraData as preloadedEraData } from './data/eraData.js';
import { generatorData as preloadedGeneratorData } from './data/generatorData.js';
import { materialsData as preloadedMaterialsData } from './data/materialsData.js';
import { rosterData as preloadedRosterData } from './data/rosterData.js';
import { commandPersonnelData as defaultCommandPersonnel } from './data/commandPersonnelData.js';
import { servicePersonnelData as defaultServicePersonnel } from './data/servicePersonnelData.js';
import { defaultUnits } from './data/unitData.js';
import { defaultServiceTemplates } from './data/serviceTemplates.js';
import { exportScheduleToWord, exportScheduleByTimeToWord, exportScheduleAsExcelTemplate, exportScheduleAsWordTemplate, exportRosterWordTemplate } from './services/exportService.js';
import { parseScheduleFromFile, parseFullUnitReportFromExcel, parseRosterFromWord, parseUnitReportFromPdf } from './services/wordImportService.js';
import ScheduleDisplay from './components/ScheduleDisplay.js';
import TimeGroupedScheduleDisplay from './components/TimeGroupedScheduleDisplay.js';
import Nomenclador from './components/Nomenclador.js';
import UnitReportDisplay from './components/UnitReportDisplay.js';
import UnitStatusView from './components/UnitStatusView.js';
import CommandPostView from './components/CommandPostView.js';
import EraReportDisplay from './components/EraReportDisplay.js';
import GeneratorReportDisplay from './components/GeneratorReportDisplay.js';
import MaterialsDisplay from './components/MaterialsDisplay.js';
import MaterialStatusView from './components/MaterialStatusView.js';
import { BookOpenIcon, DownloadIcon, ClockIcon, ClipboardListIcon, RefreshIcon, EyeIcon, EyeOffIcon, UploadIcon, QuestionMarkCircleIcon, BookmarkIcon, ChevronDownIcon, FireIcon, FilterIcon, AnnotationIcon, LightningBoltIcon, MapIcon, CubeIcon, ClipboardCheckIcon } from './components/icons.js';
import HelpModal from './components/HelpModal.js';
import ServiceTemplateModal from './components/ServiceTemplateModal.js';
import ExportTemplateModal from './components/ExportTemplateModal.js';

const parseDateFromString = (dateString) => {
    const cleanedDateString = dateString.replace(/GUARDIA DEL DIA/i, '').replace('.-', '').trim();
    const monthNames = { "ENERO": 0, "FEBRERO": 1, "MARZO": 2, "ABRIL": 3, "MAYO": 4, "JUNIO": 5, "JULIO": 6, "AGOSTO": 7, "SEPTIEMBRE": 8, "OCTUBRE": 9, "NOVIEMBRE": 10, "DICIEMBRE": 11 };
    const parts = cleanedDateString.split(/DE\s/i);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = monthNames[parts[1].toUpperCase().trim()];
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) return new Date(year, month, day);
    }
    console.warn("Could not parse date from string:", dateString);
    return new Date();
};


const App = () => {
    const [schedule, setSchedule] = useState(null);
    const [unitReport, setUnitReport] = useState(null);
    const [eraReport, setEraReport] = useState(null);
    const [generatorReport, setGeneratorReport] = useState(null);
    const [materialsReport, setMaterialsReport] = useState(null);
    const [view, setView] = useState('unit-report'); // Default to new view
    const [displayDate, setDisplayDate] = useState(null);
    const [commandPersonnel, setCommandPersonnel] = useState([]);
    const [servicePersonnel, setServicePersonnel] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState(new Set());
    const [serviceTemplates, setServiceTemplates] = useState([]);
    const [roster, setRoster] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateModalProps, setTemplateModalProps] = useState({});
    const [isExportTemplateModalOpen, setIsExportTemplateModalOpen] = useState(false);
    const [isImportMenuOpen, setImportMenuOpen] = useState(false);
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);
    
    const fileInputRef = useRef(null);
    const unitReportFileInputRef = useRef(null);
    const unitReportPdfFileInputRef = useRef(null);
    const rosterInputRef = useRef(null);
    const importMenuRef = useRef(null);
    const exportMenuRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isImportMenuOpen && importMenuRef.current && !importMenuRef.current.contains(event.target)) {
                setImportMenuOpen(false);
            }
            if (isExportMenuOpen && exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setExportMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isImportMenuOpen, isExportMenuOpen]);

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'fixed top-24 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    const loadGuardLineFromRoster = useCallback((dateToLoad, currentStaff, currentCommandPersonnel) => {
        if (!dateToLoad || !roster) return currentStaff;
        const dateKey = `${dateToLoad.getFullYear()}-${String(dateToLoad.getMonth() + 1).padStart(2, '0')}-${String(dateToLoad.getDate()).padStart(2, '0')}`;
        const dayRoster = roster[dateKey];
        const rolesMap = [
            { key: 'jefeInspecciones', label: 'JEFE DE INSPECCIONES' },
            { key: 'jefeServicio', label: 'JEFE DE SERVICIO' },
            { key: 'jefeGuardia', label: 'JEFE DE GUARDIA' },
            { key: 'jefeReserva', label: 'JEFE DE RESERVA' }
        ];
        const finalStaff = rolesMap.map(roleInfo => {
           const personName = dayRoster?.[roleInfo.key];
           if (personName) {
               const foundPersonnel = currentCommandPersonnel.find(p => p.name === personName);
               if (foundPersonnel) return { role: roleInfo.label, name: foundPersonnel.name, id: foundPersonnel.id, rank: foundPersonnel.rank };
               return { role: roleInfo.label, name: personName, rank: 'OTRO', id: `roster-${dateKey}-${roleInfo.key}` };
           }
           return { role: roleInfo.label, name: "A designar", rank: 'OTRO', id: `empty-${roleInfo.key}` };
        });
        return finalStaff;
    }, [roster]);


    useEffect(() => {
        // Load schedule data
        let scheduleToLoad;
        try {
            const savedScheduleJSON = localStorage.getItem('scheduleData');
            scheduleToLoad = savedScheduleJSON ? JSON.parse(savedScheduleJSON) : preloadedScheduleData;
        } catch (e) {
            console.error("Failed to load or parse schedule data, falling back to default.", e);
            scheduleToLoad = preloadedScheduleData;
        }
        
        const dataCopy = JSON.parse(JSON.stringify(scheduleToLoad));

        if (dataCopy.services && !('sportsEvents' in dataCopy)) {
            dataCopy.sportsEvents = dataCopy.services.filter((s) => s.title.toUpperCase().includes('EVENTO DEPORTIVO'));
            dataCopy.services = dataCopy.services.filter((s) => !s.title.toUpperCase().includes('EVENTO DEPORTIVO'));
        } else if (!dataCopy.services) dataCopy.services = [];
        if (!dataCopy.sportsEvents) dataCopy.sportsEvents = [];

        let idCounter = 0;
        const processServices = (services) => {
            (services || []).forEach(service => {
              if (!service.id) service.id = `service-hydrated-${Date.now()}-${idCounter++}`;
              service.isHidden = service.isHidden || false;
              (service.assignments || []).forEach(assignment => {
                if (!assignment.id) assignment.id = `assign-hydrated-${Date.now()}-${idCounter++}`;
              });
            });
            services.sort((a, b) => (a.isHidden ? 1 : 0) - (b.isHidden ? 1 : 0));
        };
          
        processServices(dataCopy.services);
        processServices(dataCopy.sportsEvents);
        (dataCopy.commandStaff || []).forEach((officer) => { if (!officer.id) officer.id = `officer-hydrated-${Date.now()}-${idCounter++}`; });
          
        const loadedDate = parseDateFromString(dataCopy.date);
        setDisplayDate(loadedDate);
          
        const loadedCommandPersonnel = JSON.parse(localStorage.getItem('commandPersonnel') || JSON.stringify(defaultCommandPersonnel));
        const loadedRoster = JSON.parse(localStorage.getItem('rosterData') || JSON.stringify(preloadedRosterData));
        
        let unitReportToLoad;
        try {
            const savedUnitReportJSON = localStorage.getItem('unitReportData');
            unitReportToLoad = savedUnitReportJSON ? JSON.parse(savedUnitReportJSON) : preloadedUnitReportData;
        } catch (e) {
            console.error("Failed to load or parse unit report data, falling back to default.", e);
            unitReportToLoad = preloadedUnitReportData;
        }

        let eraReportToLoad;
        try {
            const savedEraReportJSON = localStorage.getItem('eraReportData');
            eraReportToLoad = savedEraReportJSON ? JSON.parse(savedEraReportJSON) : preloadedEraData;
        } catch(e) {
            console.error("Failed to load or parse ERA report data, falling back to default.", e);
            eraReportToLoad = preloadedEraData;
        }
        
        let generatorReportToLoad;
        try {
            const savedGeneratorReportJSON = localStorage.getItem('generatorReportData');
            generatorReportToLoad = savedGeneratorReportJSON ? JSON.parse(savedGeneratorReportJSON) : preloadedGeneratorData;
        } catch(e) {
            console.error("Failed to load or parse Generator report data, falling back to default.", e);
            generatorReportToLoad = preloadedGeneratorData;
        }

        let materialsReportToLoad;
        try {
            const savedMaterialsReportJSON = localStorage.getItem('materialsData');
            materialsReportToLoad = savedMaterialsReportJSON ? JSON.parse(savedMaterialsReportJSON) : preloadedMaterialsData;
        } catch (e) {
            console.error("Failed to load or parse Materials report data, falling back to default.", e);
            materialsReportToLoad = preloadedMaterialsData;
        }
        
        if (unitReportToLoad && materialsReportToLoad) {
            const unitReportOrder = unitReportToLoad.zones.flatMap((zone) => 
                zone.groups.map((group) => group.name.trim())
            );

            const materialsMap = new Map(
                materialsReportToLoad.locations.map((loc) => [loc.name.trim(), loc])
            );

            const sortedAndSyncedLocations = [];
            
            unitReportOrder.forEach(name => {
                if (materialsMap.has(name)) {
                    sortedAndSyncedLocations.push(materialsMap.get(name));
                } else {
                    sortedAndSyncedLocations.push({ name: name, materials: [] });
                }
            });

            // Compare arrays to see if an update is needed to avoid unnecessary writes
            const originalOrder = materialsReportToLoad.locations.map((l) => l.name.trim()).join(',');
            const newOrder = sortedAndSyncedLocations.map(l => l.name.trim()).join(',');

            if (originalOrder !== newOrder || materialsReportToLoad.locations.length !== sortedAndSyncedLocations.length) {
                materialsReportToLoad.locations = sortedAndSyncedLocations;
                localStorage.setItem('materialsData', JSON.stringify(materialsReportToLoad));
            }
        }
          
        setSchedule(dataCopy);
        setUnitReport(unitReportToLoad);
        setEraReport(eraReportToLoad);
        setGeneratorReport(generatorReportToLoad);
        setMaterialsReport(materialsReportToLoad);
        setCommandPersonnel(loadedCommandPersonnel);
        setServicePersonnel(JSON.parse(localStorage.getItem('servicePersonnel') || JSON.stringify(defaultServicePersonnel)));

        const nomencladorUnits = JSON.parse(localStorage.getItem('unitList') || JSON.stringify(defaultUnits));
        const reportUnits = unitReportToLoad.zones.flatMap((zone) =>
            zone.groups.flatMap((group) => group.units.map((unit) => unit.id))
        );
        const combinedUnits = [...new Set([...nomencladorUnits, ...reportUnits])];
        combinedUnits.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        setUnitList(combinedUnits);
        
        setServiceTemplates(JSON.parse(localStorage.getItem('serviceTemplates') || JSON.stringify(defaultServiceTemplates)));
        setRoster(loadedRoster);
    }, []);

    const sortPersonnel = (a, b) => {
        const rankComparison = (rankOrder[a.rank] || 99) - (rankOrder[b.rank] || 99);
        return rankComparison !== 0 ? rankComparison : a.name.localeCompare(b.name);
    };

    const updateAndSaveCommandPersonnel = (newList) => {
        const sortedList = newList.sort(sortPersonnel);
        localStorage.setItem('commandPersonnel', JSON.stringify(sortedList));
        setCommandPersonnel(sortedList);
    };

    const updateAndSaveServicePersonnel = (newList) => {
        const sortedList = newList.sort(sortPersonnel);
        localStorage.setItem('servicePersonnel', JSON.stringify(sortedList));
        setServicePersonnel(sortedList);
    };

    const updateAndSaveUnits = (newList) => {
        localStorage.setItem('unitList', JSON.stringify(newList));
        setUnitList(newList);
    };

    const updateAndSaveRoster = (newRoster) => {
        localStorage.setItem('rosterData', JSON.stringify(newRoster));
        setRoster(newRoster);
    };
    
    const updateAndSaveTemplates = (templates) => {
        localStorage.setItem('serviceTemplates', JSON.stringify(templates));
        setServiceTemplates(templates);
    };
    
    const handleUpdateUnitReport = (updatedData) => {
        localStorage.setItem('unitReportData', JSON.stringify(updatedData));
        setUnitReport(updatedData);
    };

    const handleUpdateEraReport = (updatedData) => {
        localStorage.setItem('eraReportData', JSON.stringify(updatedData));
        setEraReport(updatedData);
    };

    const handleUpdateGeneratorReport = (updatedData) => {
        localStorage.setItem('generatorReportData', JSON.stringify(updatedData));
        setGeneratorReport(updatedData);
    };
    
    const handleUpdateMaterialsReport = (updatedData) => {
        localStorage.setItem('materialsData', JSON.stringify(updatedData));
        setMaterialsReport(updatedData);
    };

    const handleUpdateService = (updatedService, type) => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;
            const key = type === 'common' ? 'services' : 'sportsEvents';
            const newSchedule = { ...prevSchedule, [key]: prevSchedule[key].map(s => s.id === updatedService.id ? updatedService : s) };
            localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
            return newSchedule;
        });
    };

    const handleAddNewService = (type) => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;
            const key = type === 'common' ? 'services' : 'sportsEvents';
            const newService = {
                id: `new-service-${Date.now()}`,
                title: type === 'common' ? "Nuevo Servicio (Editar)" : "Nuevo Evento Deportivo (Editar)",
                assignments: [], isHidden: false
            };
            const list = [...prevSchedule[key]];
            const firstHiddenIndex = list.findIndex(s => s.isHidden);
            const insertIndex = firstHiddenIndex === -1 ? list.length : firstHiddenIndex;
            list.splice(insertIndex, 0, newService);
            const newSchedule = { ...prevSchedule, [key]: list };
            localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
            return newSchedule;
        });
    };

    const handleMoveService = (serviceId, direction, type) => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;
            const key = type === 'common' ? 'services' : 'sportsEvents';
            const services = [...prevSchedule[key]];
            const currentIndex = services.findIndex(s => s.id === serviceId);
            if (currentIndex === -1) return prevSchedule;
            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= services.length || services[targetIndex].isHidden) return prevSchedule;
            [services[currentIndex], services[targetIndex]] = [services[targetIndex], services[currentIndex]];
            const newSchedule = { ...prevSchedule, [key]: services };
            localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
            return newSchedule;
        });
    };

    const handleDeleteService = (serviceId, type) => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;

            const listKey = type === 'common' ? 'services' : 'sportsEvents';
            const serviceToDelete = prevSchedule[listKey].find(s => s.id === serviceId);

            if (!serviceToDelete) return prevSchedule;

            if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${serviceToDelete.title}"? Esta acción no se puede deshacer.`)) {
                const newSchedule = {
                    ...prevSchedule,
                    [listKey]: prevSchedule[listKey].filter(s => s.id !== serviceId),
                };
                localStorage.setItem('scheduleData', JSON.stringify(newSchedule));

                setSelectedServiceIds(currentIds => {
                    const newIds = new Set(currentIds);
                    newIds.delete(serviceId);
                    return newIds;
                });
                
                showToast(`Servicio "${serviceToDelete.title}" eliminado.`);
                return newSchedule;
            }
            return prevSchedule;
        });
    };

    const handleToggleServiceSelection = (serviceId) => {
        const newSelection = new Set(selectedServiceIds);
        if (newSelection.has(serviceId)) newSelection.delete(serviceId);
        else newSelection.add(serviceId);
        setSelectedServiceIds(newSelection);
    };
    
    const serviceMatches = (service, term) => {
        if (!term) return true;
        if (service.title?.toLowerCase().includes(term)) return true;
        if (service.description?.toLowerCase().includes(term)) return true;
        if (service.novelty?.toLowerCase().includes(term)) return true;
    
        for (const assignment of service.assignments) {
            if (assignment.location?.toLowerCase().includes(term)) return true;
            if (assignment.personnel?.toLowerCase().includes(term)) return true;
            if (assignment.unit?.toLowerCase().includes(term)) return true;
            if (assignment.details?.join(' ').toLowerCase().includes(term)) return true;
        }
        return false;
    };

    const filteredSchedule = useMemo(() => {
        if (!schedule) return null;
        if (!searchTerm) return schedule;
    
        const lowercasedFilter = searchTerm.toLowerCase();
    
        const filteredServices = schedule.services.filter(s => serviceMatches(s, lowercasedFilter));
        const filteredSportsEvents = schedule.sportsEvents.filter(s => serviceMatches(s, lowercasedFilter));
        
        return { ...schedule, services: filteredServices, sportsEvents: filteredSportsEvents };
    }, [schedule, searchTerm]);


    const handleSelectAllServices = (selectAll) => {
        if (!filteredSchedule) return;

        const visibleFilteredIds = [...filteredSchedule.services, ...filteredSchedule.sportsEvents]
            .filter(s => !s.isHidden)
            .map(s => s.id);

        const newSelection = new Set(selectedServiceIds);

        if (selectAll) {
            visibleFilteredIds.forEach(id => newSelection.add(id));
        } else {
            visibleFilteredIds.forEach(id => newSelection.delete(id));
        }
        setSelectedServiceIds(newSelection);
    };

    const handleToggleVisibilityForSelected = () => {
        if (selectedServiceIds.size === 0) return;
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;
            const allServices = [...prevSchedule.services, ...prevSchedule.sportsEvents];
            const firstSelected = allServices.find(s => selectedServiceIds.has(s.id));
            if (!firstSelected) return prevSchedule;
            
            const newVisibility = !firstSelected.isHidden;
            const updateVisibility = (services) => services.map(s => selectedServiceIds.has(s.id) ? { ...s, isHidden: newVisibility } : s).sort((a, b) => (a.isHidden ? 1 : 0) - (b.isHidden ? 1 : 0));
            
            const newSchedule = { ...prevSchedule, services: updateVisibility(prevSchedule.services), sportsEvents: updateVisibility(prevSchedule.sportsEvents) };
            localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
            
            setSelectedServiceIds(new Set()); // Clear selection after action
            
            return newSchedule;
        });
    };

    const handleAssignmentStatusChange = (assignmentId, statusUpdate) => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;
            const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
            const allServices = [...newSchedule.services, ...newSchedule.sportsEvents];
            for (const service of allServices) {
                const assignment = service.assignments.find((a) => a.id === assignmentId);
                if (assignment) {
                    if ('inService' in statusUpdate) assignment.inService = statusUpdate.inService;
                    if ('serviceEnded' in statusUpdate) assignment.serviceEnded = statusUpdate.serviceEnded;
                    if (assignment.serviceEnded) assignment.inService = true;
                    if (assignment.inService === false) assignment.serviceEnded = false;
                    localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
                    return newSchedule;
                }
            }
            return prevSchedule;
        });
    };
    
    const handleDateChange = (part, value) => {
        setDisplayDate(prevDate => {
            const currentDate = prevDate || new Date();

            let year = currentDate.getFullYear();
            let month = currentDate.getMonth();
            let day = currentDate.getDate();

            if (part === 'year') year = value;
            else if (part === 'month') month = value;
            else if (part === 'day') day = value;

            const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
            if (day > daysInTargetMonth) {
                day = daysInTargetMonth;
            }

            const newDate = new Date(year, month, day);

            setSchedule(prevSchedule => {
                if (!prevSchedule) return prevSchedule;
        
                const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
                const newDateString = `${newDate.getDate()} DE ${monthNames[newDate.getMonth()]} DE ${newDate.getFullYear()}`;
                const newCommandStaff = loadGuardLineFromRoster(newDate, prevSchedule.commandStaff, commandPersonnel);
                
                const newSchedule = { 
                    ...prevSchedule, 
                    date: newDateString, 
                    commandStaff: newCommandStaff 
                };
                
                localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
                
                return newSchedule;
            });

            return newDate;
        });
    };

    const handleUpdateCommandStaff = useCallback((updatedStaff, isAutoUpdate = false) => {
        if (!isAutoUpdate) {
            let personnelListWasUpdated = false;
            const newPersonnelList = [...commandPersonnel];
            updatedStaff.forEach(officer => {
                if (officer.id && officer.name && officer.rank) {
                    const personnelIndex = newPersonnelList.findIndex(p => p.id === officer.id);
                    if (personnelIndex !== -1) {
                        if (newPersonnelList[personnelIndex].rank !== officer.rank || newPersonnelList[personnelIndex].name !== officer.name) {
                            newPersonnelList[personnelIndex] = { ...newPersonnelList[personnelIndex], rank: officer.rank, name: officer.name };
                            personnelListWasUpdated = true;
                        }
                    } else if (officer.name !== 'A designar' && officer.name !== 'No Asignado') {
                      newPersonnelList.push({ id: officer.id, name: officer.name, rank: officer.rank });
                      personnelListWasUpdated = true;
                    }
                }
            });
            if (personnelListWasUpdated) {
                updateAndSaveCommandPersonnel(newPersonnelList);
            }
        }
        setSchedule(prevSchedule => {
            if (!prevSchedule) return null;
            const newSchedule = { ...prevSchedule, commandStaff: updatedStaff };
            localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
            return newSchedule;
        });
    }, [commandPersonnel]);


    const handleFileImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const importMode = prompt("Elige el modo de importación:\n\n1. Añadir\n2. Reemplazar\n\nEscribe '1' o '2'.");
        if (importMode !== '1' && importMode !== '2') {
            alert("Importación cancelada.");
            if(fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        try {
            const fileBuffer = await file.arrayBuffer();
            const importedData = await parseScheduleFromFile(fileBuffer, file.name);

            if (!importedData || (!importedData.services?.length && !importedData.sportsEvents?.length)) {
                alert("No se encontraron servicios válidos en el archivo o el formato no es reconocido.");
                return;
            }
            
            const { services: newServices = [], sportsEvents: newSportsEvents = [] } = importedData;
            
            setSchedule(prevSchedule => {
                if (!prevSchedule) return null;
                let newSchedule = JSON.parse(JSON.stringify(prevSchedule));

                if (importMode === '1') { // Add
                    const now = Date.now();
                    let counter = 0;
                    const reIdService = (service) => ({
                        ...service,
                        id: `imported-add-${now}-${counter++}`,
                        assignments: service.assignments.map(assignment => ({
                            ...assignment,
                            id: `imported-add-assign-${now}-${counter++}`
                        }))
                    });

                    const uniqueNewServices = newServices.map(reIdService);
                    const uniqueNewSportsEvents = newSportsEvents.map(reIdService);

                    newSchedule.services = [...prevSchedule.services, ...uniqueNewServices];
                    newSchedule.sportsEvents = [...prevSchedule.sportsEvents, ...uniqueNewSportsEvents];
                    alert(`${newServices.length + newSportsEvents.length} servicio(s) importado(s) y añadidos con éxito.`);
                } else { // Replace
                    if (importedData.date) newSchedule.date = importedData.date;
                    if (importedData.commandStaff) newSchedule.commandStaff = importedData.commandStaff;
                    newSchedule.services = newServices;
                    newSchedule.sportsEvents = newSportsEvents;
                    
                    if(importedData.date) {
                        const newDisplayDate = parseDateFromString(importedData.date);
                        setDisplayDate(newDisplayDate);
                    }
                    alert(`El horario ha sido reemplazado. ${newServices.length + newSportsEvents.length} servicio(s) importado(s) con éxito.`);
                }
                localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
                return newSchedule;
            });
        } catch (error) {
            console.error("Error al importar el archivo:", error); alert("Hubo un error al procesar el archivo.");
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUnitReportImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm("¿Está seguro de que desea reemplazar todo el reporte de unidades con los datos de este archivo? Esta acción no se puede deshacer.")) {
            try {
                const fileBuffer = await file.arrayBuffer();
                const newUnitReportData = await parseFullUnitReportFromExcel(fileBuffer); 
                
                if (newUnitReportData) {
                    handleUpdateUnitReport(newUnitReportData);
                    showToast("Reporte de unidades importado y reemplazado con éxito.");
                } else {
                    alert("No se pudo procesar el archivo Excel. Verifique el formato del reporte completo.");
                }
            } catch (error) {
                console.error("Error al importar el reporte de unidades:", error);
                alert(`Hubo un error al procesar el archivo Excel: ${error.message}`);
            } finally {
                if (unitReportFileInputRef.current) {
                    unitReportFileInputRef.current.value = '';
                }
            }
        } else {
             if (unitReportFileInputRef.current) {
                unitReportFileInputRef.current.value = '';
            }
        }
    };
    
    const handleUnitReportPdfImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm("¿Está seguro de que desea reemplazar todo el reporte de unidades con los datos de este PDF? Esta acción no se puede deshacer.")) {
            try {
                const fileBuffer = await file.arrayBuffer();
                const newUnitReportData = await parseUnitReportFromPdf(fileBuffer); 
                
                if (newUnitReportData) {
                    handleUpdateUnitReport(newUnitReportData);
                    showToast("Reporte de unidades importado desde PDF con éxito.");
                } else {
                    alert("No se pudo encontrar datos de reporte en el archivo PDF. Asegúrese de que el archivo fue generado por esta aplicación.");
                }
            } catch (error) {
                console.error("Error al importar el reporte de unidades desde PDF:", error);
                alert(`Hubo un error al procesar el archivo PDF: ${error.message}`);
            } finally {
                if (unitReportPdfFileInputRef.current) {
                    unitReportPdfFileInputRef.current.value = '';
                }
            }
        } else {
             if (unitReportPdfFileInputRef.current) {
                unitReportPdfFileInputRef.current.value = '';
            }
        }
    };

    const handleRosterImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        if (window.confirm("¿Deseas fusionar los datos de este archivo con el rol de guardia actual?")) {
            try {
                let newRosterData;
                if (file.name.endsWith('.json')) {
                    newRosterData = JSON.parse(await file.text());
                    if (typeof newRosterData !== 'object' || newRosterData === null || Array.isArray(newRosterData)) {
                        throw new Error("Invalid JSON format.");
                    }
                } else if (file.name.endsWith('.docx')) {
                    const fileBuffer = await file.arrayBuffer();
                    newRosterData = await parseRosterFromWord(fileBuffer);
                } else {
                    alert("Formato de archivo no soportado. Por favor, sube un archivo .json o .docx.");
                    if(rosterInputRef.current) rosterInputRef.current.value = '';
                    return;
                }
                
                updateAndSaveRoster({ ...roster, ...newRosterData });
                showToast("Rol de guardia actualizado con éxito.");
            } catch (error) { 
                console.error("Error al importar el rol de guardia:", error); 
                alert(`Hubo un error al procesar el archivo: ${error.message}`); 
            } finally {
                if(rosterInputRef.current) rosterInputRef.current.value = '';
            }
        } else {
            if(rosterInputRef.current) rosterInputRef.current.value = '';
        }
    };
    
    const handleSaveAsTemplate = (service) => {
        const newTemplate = { ...JSON.parse(JSON.stringify(service)), templateId: `template-${Date.now()}` };
        updateAndSaveTemplates([...serviceTemplates, newTemplate]);
        showToast(`Servicio "${service.title}" guardado como plantilla.`);
    };

    const handleSelectTemplate = (template, { mode, serviceType, serviceToReplaceId }) => {
        setSchedule((prevSchedule) => {
            if (!prevSchedule) return null;
            const listKey = serviceType === 'common' ? 'services' : 'sportsEvents';
            let newSchedule = { ...prevSchedule };

            if (mode === 'add') {
                const newService = { ...JSON.parse(JSON.stringify(template)), id: `service-from-template-${Date.now()}` };
                delete newService.templateId;
                const list = [...newSchedule[listKey]];
                const firstHiddenIndex = list.findIndex(s => s.isHidden);
                const insertIndex = firstHiddenIndex === -1 ? list.length : firstHiddenIndex;
                list.splice(insertIndex, 0, newService);
                newSchedule[listKey] = list;
                showToast(`Servicio "${template.title}" añadido desde plantilla.`);
            } else if (mode === 'replace' && serviceToReplaceId) {
                newSchedule[listKey] = newSchedule[listKey].map((s) => {
                    if (s.id === serviceToReplaceId) {
                        const updatedService = { ...JSON.parse(JSON.stringify(template)), id: s.id };
                        delete updatedService.templateId;
                        return updatedService;
                    }
                    return s;
                });
                showToast(`Servicio reemplazado con plantilla "${template.title}".`);
            }
            localStorage.setItem('scheduleData', JSON.stringify(newSchedule));
            setIsTemplateModalOpen(false);
            return newSchedule;
        });
    };

    const handleDeleteTemplate = (templateId) => {
        const newTemplates = serviceTemplates.filter(t => t.templateId !== templateId)
        updateAndSaveTemplates(newTemplates);
    };

    const handleExportAsTemplate = (format) => {
        if (!schedule) return;
        if (format === 'excel') exportScheduleAsExcelTemplate(schedule);
        else exportScheduleAsWordTemplate(schedule);
        setIsExportTemplateModalOpen(false);
    };

    const handleResetData = () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar todos los datos?")) {
          localStorage.clear();
          location.reload();
        }
    };

    const getAssignmentsByTime = useMemo(() => {
        if (!filteredSchedule) return {};
        const grouped = {};
        [...filteredSchedule.services, ...filteredSchedule.sportsEvents].filter(s => !s.isHidden).forEach(service => {
          service.assignments.forEach(assignment => {
            const timeKey = assignment.time;
            if (!grouped[timeKey]) grouped[timeKey] = [];
            grouped[timeKey].push({ ...assignment, serviceTitle: service.title, novelty: service.novelty });
          });
        });
        return grouped;
    }, [filteredSchedule]);
    
    const openTemplateModal = (props) => {
        setTemplateModalProps(props);
        setIsTemplateModalOpen(true);
    };

    const visibilityAction = useMemo(() => {
        if (selectedServiceIds.size === 0 || !schedule) return { action: 'none', label: '' };
        const firstSelected = [...schedule.services, ...schedule.sportsEvents].find(s => selectedServiceIds.has(s.id));
        if (firstSelected?.isHidden) return { action: 'show', label: 'Mostrar Seleccionados' };
        return { action: 'hide', label: 'Ocultar Seleccionados' };
    }, [selectedServiceIds, schedule]);

    const renderContent = () => {
        if (!displayDate) return null;
        switch (view) {
            case 'unit-report':
                if (!unitReport) return null;
                return React.createElement(UnitReportDisplay, {
                        reportData: unitReport,
                        searchTerm: searchTerm,
                        onSearchChange: setSearchTerm,
                        onUpdateReport: handleUpdateUnitReport,
                        commandPersonnel: commandPersonnel,
                        servicePersonnel: servicePersonnel,
                        unitList: unitList
                    });
            case 'unit-status':
                if (!unitReport) return null;
                return React.createElement(UnitStatusView, { unitReportData: unitReport });
            case 'material-status':
                if (!materialsReport) return null;
                return React.createElement(MaterialStatusView, {
                    materialsData: materialsReport,
                });
            case 'command-post':
                if (!unitReport) return null;
                return React.createElement(CommandPostView, { unitReportData: unitReport });
            case 'era-report':
                if (!eraReport) return null;
                return React.createElement(EraReportDisplay, {
                        reportData: eraReport,
                        onUpdateReport: handleUpdateEraReport
                    });
            case 'generator-report':
                if (!generatorReport) return null;
                return React.createElement(GeneratorReportDisplay, {
                    reportData: generatorReport,
                    onUpdateReport: handleUpdateGeneratorReport
                });
            case 'materials':
                if (!materialsReport) return null;
                return React.createElement(MaterialsDisplay, {
                    reportData: materialsReport,
                    onUpdateReport: handleUpdateMaterialsReport
                });
            case 'schedule':
                if (!filteredSchedule) return null;
                return React.createElement(ScheduleDisplay, {
                        schedule: filteredSchedule, displayDate: displayDate, selectedServiceIds: selectedServiceIds, commandPersonnel: commandPersonnel, servicePersonnel: servicePersonnel, unitList: unitList,
                        onDateChange: handleDateChange, onUpdateService: handleUpdateService, onUpdateCommandStaff: handleUpdateCommandStaff, onAddNewService: handleAddNewService, onMoveService: handleMoveService, onToggleServiceSelection: handleToggleServiceSelection, onSelectAllServices: handleSelectAllServices, onSaveAsTemplate: handleSaveAsTemplate, onReplaceFromTemplate: (serviceId, type) => openTemplateModal({ mode: 'replace', serviceType: type, serviceToReplaceId: serviceId }), onImportGuardLine: () => handleUpdateCommandStaff(loadGuardLineFromRoster(displayDate, schedule.commandStaff, commandPersonnel), true),
                        onDeleteService: handleDeleteService,
                        searchTerm: searchTerm, onSearchChange: setSearchTerm,
                    });
            case 'time-grouped':
                if (!filteredSchedule) return null;
                return React.createElement(TimeGroupedScheduleDisplay, {
                        assignmentsByTime: getAssignmentsByTime,
                        onAssignmentStatusChange: handleAssignmentStatusChange
                    });
            case 'nomenclador':
                return React.createElement(Nomenclador, {
                        commandPersonnel: commandPersonnel, servicePersonnel: servicePersonnel, units: unitList, roster: roster,
                        onAddCommandPersonnel: (item) => updateAndSaveCommandPersonnel([...commandPersonnel, item]), onUpdateCommandPersonnel: (item) => updateAndSaveCommandPersonnel(commandPersonnel.map(p => p.id === item.id ? item : p)), onRemoveCommandPersonnel: (item) => updateAndSaveCommandPersonnel(commandPersonnel.filter(p => p.id !== item.id)),
                        onAddServicePersonnel: (item) => updateAndSaveServicePersonnel([...servicePersonnel, item]), onUpdateServicePersonnel: (item) => updateAndSaveServicePersonnel(servicePersonnel.map(p => p.id === item.id ? item : p)), onRemoveServicePersonnel: (item) => updateAndSaveServicePersonnel(servicePersonnel.filter(p => p.id !== item.id)),
                        onUpdateUnits: updateAndSaveUnits, onUpdateRoster: updateAndSaveRoster
                     });
            default:
                return null;
        }
    };
    
    const getButtonClass = (buttonView) => `flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${view === buttonView ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`;
    
    if (!schedule || !displayDate || !unitReport || !eraReport || !generatorReport || !materialsReport) {
        return (
            React.createElement("div", { className: "bg-zinc-900 text-white min-h-screen flex justify-center items-center" },
                React.createElement("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" })
            )
        );
    }

    return (
        React.createElement("div", { className: "bg-zinc-900 text-white min-h-screen font-sans" },
            React.createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileImport, style: { display: 'none' }, accept: ".xlsx,.xls,.docx,.ods" }),
            React.createElement("input", { type: "file", ref: unitReportFileInputRef, onChange: handleUnitReportImport, style: { display: 'none' }, accept: ".xlsx,.xls" }),
            React.createElement("input", { type: "file", ref: unitReportPdfFileInputRef, onChange: handleUnitReportPdfImport, style: { display: 'none' }, accept: ".pdf" }),
            React.createElement("input", { type: "file", ref: rosterInputRef, onChange: handleRosterImport, style: { display: 'none' }, accept: ".json,.docx" }),
            React.createElement("header", { className: "bg-zinc-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg" },
                React.createElement("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8" },
                    React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-4 sm:py-0" },
                        React.createElement("div", { className: "flex items-center mb-4 sm:mb-0" },
                            React.createElement("button", { onClick: handleResetData, className: "mr-2 text-zinc-400 hover:text-white transition-colors", "aria-label": "Reiniciar Datos"}, React.createElement(RefreshIcon, { className: "w-6 h-6" })),
                            React.createElement("button", { onClick: () => setIsHelpModalOpen(true), className: "mr-4 text-zinc-400 hover:text-white transition-colors", "aria-label": "Ayuda"}, React.createElement(QuestionMarkCircleIcon, { className: "w-6 h-6" })),
                            React.createElement("img", { src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Escudo_de_Bomberos_de_la_Ciudad_de_Buenos_Aires.png", alt: "Escudo Bomberos de la Ciudad", className: "h-12 mr-3" })
                        ),
                        React.createElement("div", { className: "flex flex-wrap items-center justify-end gap-2" },
                            React.createElement("button", { className: getButtonClass('unit-report'), onClick: () => setView('unit-report') }, React.createElement(FireIcon, { className: "w-5 h-5" }), " Reporte de Unidades"),
                            React.createElement("button", { className: getButtonClass('unit-status'), onClick: () => setView('unit-status') }, React.createElement(FilterIcon, { className: "w-5 h-5" }), " Estado de Unidades"),
                            React.createElement("button", { className: getButtonClass('material-status'), onClick: () => setView('material-status') }, React.createElement(ClipboardCheckIcon, { className: "w-5 h-5" }), " Estado de Materiales"),
                            React.createElement("button", { className: getButtonClass('command-post'), onClick: () => setView('command-post') }, React.createElement(AnnotationIcon, { className: "w-5 h-5" }), " Puesto Comando"),
                            React.createElement("button", { className: getButtonClass('era-report'), onClick: () => setView('era-report') }, React.createElement(LightningBoltIcon, { className: "w-5 h-5" }), " Trasvazadores E.R.A."),
                            React.createElement("button", { className: getButtonClass('generator-report'), onClick: () => setView('generator-report') }, React.createElement(LightningBoltIcon, { className: "w-5 h-5" }), " Grupos Electrógenos"),
                            React.createElement("button", { className: getButtonClass('materials'), onClick: () => setView('materials') }, React.createElement(CubeIcon, { className: "w-5 h-5" }), " Materiales"),
                            React.createElement("button", { className: getButtonClass('schedule'), onClick: () => setView('schedule') }, React.createElement(ClipboardListIcon, { className: "w-5 h-5" }), " Planificador"),
                            React.createElement("button", { className: getButtonClass('time-grouped'), onClick: () => setView('time-grouped') }, React.createElement(ClockIcon, { className: "w-5 h-5" }), " Vista por Hora"),
                            React.createElement("button", { className: getButtonClass('nomenclador'), onClick: () => setView('nomenclador') }, React.createElement(BookOpenIcon, { className: "w-5 h-5" }), " Nomencladores"),
                            
                            React.createElement("div", { className: "relative", ref: importMenuRef },
                                React.createElement("button", { onClick: () => setImportMenuOpen(prev => !prev), className: 'flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors' },
                                    React.createElement(UploadIcon, { className: 'w-5 h-5' }),
                                    React.createElement("span", null, "Importar"),
                                    React.createElement(ChevronDownIcon, { className: `w-4 h-4 transition-transform duration-200 ${isImportMenuOpen ? 'rotate-180' : ''}` })
                                ),
                                isImportMenuOpen && (
                                    React.createElement("div", { className: "absolute right-0 mt-2 w-72 origin-top-right rounded-md shadow-lg bg-zinc-700 ring-1 ring-black ring-opacity-5 z-50 animate-scale-in" },
                                        React.createElement("div", { className: "py-1", role: "menu", "aria-orientation": "vertical" },
                                            React.createElement("button", { type: "button", onClick: () => { fileInputRef.current?.click(); setImportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                                React.createElement(UploadIcon, { className: 'w-4 h-4' }), " Importar Horario (Word/Excel)"
                                            ),
                                            React.createElement("button", { type: "button", onClick: () => { unitReportFileInputRef.current?.click(); setImportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                                React.createElement(UploadIcon, { className: 'w-4 h-4' }), " Importar Reporte Unidades (Excel)"
                                            ),
                                            React.createElement("button", { type: "button", onClick: () => { unitReportPdfFileInputRef.current?.click(); setImportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                                React.createElement(UploadIcon, { className: 'w-4 h-4' }), " Importar Reporte Unidades (PDF)"
                                            ),
                                            React.createElement("button", { type: "button", onClick: () => { rosterInputRef.current?.click(); setImportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                                React.createElement(UploadIcon, { className: 'w-4 h-4' }), " Importar Rol de Guardia (JSON/Word)"
                                            ),
                                            React.createElement("button", { type: "button", onClick: () => { exportRosterWordTemplate(); setImportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                                React.createElement(DownloadIcon, { className: 'w-4 h-4' }), " Plantilla Rol de Guardia (Word)"
                                            ),
                                            React.createElement("button", { type: "button", onClick: () => { openTemplateModal({ mode: 'add', serviceType: 'common' }); setImportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                                React.createElement(BookmarkIcon, { className: 'w-4 h-4' }), " Añadir desde Plantilla"
                                            )
                                        )
                                    )
                                )
                            ),

                            React.createElement("div", { className: "relative", ref: exportMenuRef },
                                React.createElement("button", { onClick: () => setExportMenuOpen(prev => !prev), className: 'flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white font-medium transition-colors' },
                                    React.createElement(DownloadIcon, { className: 'w-5 h-5' }),
                                    React.createElement("span", null, "Exportar"),
                                    React.createElement(ChevronDownIcon, { className: `w-4 h-4 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}` })
                                ),
                                isExportMenuOpen && React.createElement("div", { className: "absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-zinc-700 ring-1 ring-black ring-opacity-5 z-50 animate-scale-in" },
                                    React.createElement("div", { className: "py-1", role: "menu", "aria-orientation": "vertical", "aria-labelledby": "options-menu" },
                                        React.createElement("button", { type: "button", onClick: () => { exportScheduleToWord({ ...schedule, date: displayDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() }); setExportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                            React.createElement(DownloadIcon, { className: 'w-4 h-4' }), " Exportar General"),
                                        React.createElement("button", { type: "button", onClick: () => { exportScheduleByTimeToWord({ date: displayDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), assignmentsByTime: getAssignmentsByTime }); setExportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                            React.createElement(DownloadIcon, { className: 'w-4 h-4' }), " Exportar por Hora"),
                                        React.createElement("button", { type: "button", onClick: () => { setIsExportTemplateModalOpen(true); setExportMenuOpen(false); }, className: "flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-600 w-full text-left", role: "menuitem" },
                                            React.createElement(DownloadIcon, { className: 'w-4 h-4' }), " Exportar Plantilla")
                                    )
                                )
                            ),
                            
                            selectedServiceIds.size > 0 && view === 'schedule' && (
                                React.createElement("button", { onClick: handleToggleVisibilityForSelected, className: `flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-colors animate-fade-in ${visibilityAction.action === 'hide' ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'}`},
                                    visibilityAction.action === 'hide' ? React.createElement(EyeOffIcon, { className: "w-5 h-5" }) : React.createElement(EyeIcon, { className: "w-5 h-5" }),
                                    `${visibilityAction.label} (${selectedServiceIds.size})`
                                )
                            )
                        )
                    )
                )
            ),
            React.createElement("main", { className: "container mx-auto p-4 sm:p-6 lg:p-8" },
                renderContent()
            ),
            isHelpModalOpen && React.createElement(HelpModal, { isOpen: isHelpModalOpen, onClose: () => setIsHelpModalOpen(false), unitList: unitList, commandPersonnel: commandPersonnel, servicePersonnel: servicePersonnel }),
            isTemplateModalOpen && React.createElement(ServiceTemplateModal, { isOpen: isTemplateModalOpen, onClose: () => setIsTemplateModalOpen(false), templates: serviceTemplates, onSelectTemplate: (template) => handleSelectTemplate(template, templateModalProps), onDeleteTemplate: handleDeleteTemplate }),
            isExportTemplateModalOpen && React.createElement(ExportTemplateModal, { isOpen: isExportTemplateModalOpen, onClose: () => setIsExportTemplateModalOpen(false), onExport: handleExportAsTemplate })
        )
    );
};

export default App;