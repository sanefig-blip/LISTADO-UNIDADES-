import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, UnderlineType, AlignmentType, ShadingType, PageBreak } from 'docx';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to save files
const saveFile = (data, fileName, fileType) => {
    const blob = new Blob([data], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Helper to sanitize strings for XML
const sanitizeXmlString = (str) => {
    if (!str) return '';
    // This regex removes most characters that are illegal in XML 1.0 documents.
    // It keeps tab, newline, and carriage return.
    // The range is U+0000 to U+001F, excluding U+0009, U+000A, U+000D.
    // It also removes surrogate pairs which can be problematic.
    return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, '');
};


// --- STYLES ---
const LABEL_STYLE = { bold: true, font: "Arial", size: 22 }; // 11pt
const CONTENT_STYLE = { font: "Arial", size: 22 }; // 11pt
const ITALIC_CONTENT_STYLE = { ...CONTENT_STYLE, italics: true };
const ITALIC_PLACEHOLDER_STYLE = { ...ITALIC_CONTENT_STYLE, color: "555555" };
const HEADING_2_RUN_STYLE = { size: 28, bold: true, font: "Arial", color: "000000", underline: { type: UnderlineType.SINGLE }};


// Helper function to create assignment paragraphs, avoiding code duplication.
const createAssignmentParagraphs = (assignment, includeServiceTitle) => {
    const eventSubtitle = (assignment.details || []).find(detail =>
        /^\d+-\s*O\.S\./.test(detail.trim())
    );
    const otherDetails = (assignment.details || []).filter(detail => detail !== eventSubtitle);

    const detailParagraphs = otherDetails.map(detail =>
        new Paragraph({
            children: [new TextRun({ text: sanitizeXmlString(detail.trim()), ...ITALIC_CONTENT_STYLE })],
            indent: { left: 400 },
            spacing: { after: 0 }
        })
    );

    const paragraphs = [];

    if (includeServiceTitle && assignment.serviceTitle) {
        paragraphs.push(new Paragraph({
            children: [
                new TextRun({ text: "Servicio: ", ...LABEL_STYLE }),
                new TextRun({ text: sanitizeXmlString(assignment.serviceTitle), ...ITALIC_CONTENT_STYLE })
            ],
             spacing: { before: 200 }
        }));
    }
    
    if (assignment.novelty) {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Novedad: ", ...LABEL_STYLE, color: "000000" }),
                    new TextRun({ text: sanitizeXmlString(assignment.novelty), ...ITALIC_CONTENT_STYLE, color: "000000" })
                ],
                shading: { type: ShadingType.CLEAR, fill: "FFFF00" },
                spacing: { after: 100 }
            })
        );
    }

    if (eventSubtitle) {
        const cleanSubtitle = eventSubtitle.replace(/^\d+-\s*O\.S\.\d+\s*/, '').trim();
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text: sanitizeXmlString(cleanSubtitle), bold: true, ...ITALIC_CONTENT_STYLE })],
            spacing: { before: 100, after: 100 }
        }));
    }

    paragraphs.push(
        new Paragraph({
            children: [new TextRun({ text: sanitizeXmlString(assignment.location), bold: true, size: 24, font: "Arial", underline: { type: UnderlineType.SINGLE, color: "000000"} })],
            spacing: { before: includeServiceTitle || eventSubtitle ? 100 : 200 }
        })
    );

    if (assignment.implementationTime) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: sanitizeXmlString(assignment.implementationTime), bold: true, ...CONTENT_STYLE })] }));
    }

    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Horario: ", ...LABEL_STYLE }), new TextRun({text: sanitizeXmlString(assignment.time), ...CONTENT_STYLE })] }));
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Personal: ", ...LABEL_STYLE }), new TextRun({text: sanitizeXmlString(assignment.personnel), ...CONTENT_STYLE })] }));

    if (assignment.unit) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Unidad: ", ...LABEL_STYLE }), new TextRun({text: sanitizeXmlString(assignment.unit), ...CONTENT_STYLE })] }));
    }

    paragraphs.push(...detailParagraphs);
    return paragraphs;
};


export const exportScheduleToWord = (schedule) => {
    const createServiceSection = (services, title) => {
        if (!services || services.length === 0) return [];

        const serviceContent = services.filter(s => !s.isHidden).flatMap(service => {
            const assignmentsContent = service.assignments.flatMap(assignment => createAssignmentParagraphs(assignment, false));

            const serviceParagraphs = [
                new Paragraph({
                    style: "Heading2",
                    children: [
                        new TextRun({ text: "SERVICE_TITLE_MARKER::", size: 2, color: "FFFFFF" }),
                        new TextRun(sanitizeXmlString(service.title))
                    ],
                }),
                ...(service.description ? [new Paragraph({
                    children: [new TextRun({ text: sanitizeXmlString(service.description), ...ITALIC_CONTENT_STYLE })],
                    spacing: { after: 100 }
                })] : []),
            ];

            if (service.novelty) {
                serviceParagraphs.push(
                     new Paragraph({
                        children: [
                            new TextRun({ text: "Novedad: ", ...LABEL_STYLE, color: "000000" }),
                            new TextRun({ text: sanitizeXmlString(service.novelty), ...ITALIC_CONTENT_STYLE, color: "000000" })
                        ],
                        shading: { type: ShadingType.CLEAR, fill: "FFFF00" },
                        spacing: { after: 100 }
                    })
                );
            }

            return [...serviceParagraphs, ...assignmentsContent];
        });
        
        if (title && serviceContent.length > 0) {
            return [new Paragraph({ text: sanitizeXmlString(title), style: "Heading1", alignment: AlignmentType.LEFT }), ...serviceContent];
        }
        return serviceContent;
    };
    
    const commandStaffRows = schedule.commandStaff.map(officer => {
        return new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sanitizeXmlString(officer.role), ...CONTENT_STYLE })]})], width: { size: 30, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sanitizeXmlString(officer.rank || 'OTRO'), ...CONTENT_STYLE })]})], width: { size: 30, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sanitizeXmlString(officer.name), ...CONTENT_STYLE })]})], width: { size: 40, type: WidthType.PERCENTAGE } }),
            ],
        });
    });

    const commandStaffTable = new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rol", ...LABEL_STYLE })]})] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Jerarquía", ...LABEL_STYLE })]})] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nombre", ...LABEL_STYLE })]})] }),
                ],
                tableHeader: true,
            }),
            ...commandStaffRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    const regularServicesContent = createServiceSection(schedule.services);
    const sportsEventsContent = createServiceSection(schedule.sportsEvents, "EVENTOS DEPORTIVOS");

    const doc = new Document({
        creator: "Servicios del Cuerpo de Bomberos de la Ciudad",
        title: `Orden de Servicio - ${schedule.date}`,
        styles: {
            paragraphStyles: [
                { id: "Heading1", name: "Heading 1", run: { size: 32, bold: true, font: "Arial" }, paragraph: { spacing: { after: 240 }, alignment: AlignmentType.CENTER } },
                { id: "Heading2", name: "Heading 2", run: HEADING_2_RUN_STYLE, paragraph: { spacing: { before: 240, after: 120 } } },
            ],
        },
        sections: [{ children: [
            new Paragraph({ text: `ORDEN DE SERVICIO DIARIA`, style: "Heading1" }),
            new Paragraph({ text: `GUARDIA DEL DIA ${sanitizeXmlString(schedule.date)}`, alignment: AlignmentType.CENTER, spacing: { after: 400 }}),
            new Paragraph({ text: "LÍNEA DE GUARDIA", style: "Heading2" }),
            commandStaffTable,
            new Paragraph({ text: "", spacing: { after: 200 }}),
            ...regularServicesContent,
            ...(sportsEventsContent.length > 0 ? [new Paragraph({ children: [new PageBreak()] })] : []),
            ...sportsEventsContent,
        ]}]
    });

    Packer.toBlob(doc).then(blob => saveFile(blob, `Orden_de_Servicio_${sanitizeXmlString(schedule.date).replace(/\s/g, '_')}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
};

export const exportScheduleByTimeToWord = ({ date, assignmentsByTime }) => {
    const sortedTimeKeys = Object.keys(assignmentsByTime).sort((a, b) => parseInt(a.split(':')[0], 10) - parseInt(b.split(':')[0], 10));
    const content = sortedTimeKeys.flatMap(time => [
        new Paragraph({ text: `Horario: ${sanitizeXmlString(time)}`, style: "Heading2" }),
        ...assignmentsByTime[time].flatMap(assignment => createAssignmentParagraphs(assignment, true))
    ]);

    const doc = new Document({
        creator: "Servicios del Cuerpo de Bomberos de la Ciudad",
        title: `Orden de Servicio por Hora - ${date}`,
        styles: {
            paragraphStyles: [
                 { id: "Heading1", name: "Heading 1", run: { size: 32, bold: true, font: "Arial" }, paragraph: { spacing: { after: 240 }, alignment: AlignmentType.CENTER } },
                 { id: "Heading2", name: "Heading 2", run: HEADING_2_RUN_STYLE, paragraph: { spacing: { before: 240, after: 120 } } },
            ],
        },
        sections: [{ children: [
            new Paragraph({ text: `ORDEN DE SERVICIO DIARIA POR HORA`, style: "Heading1" }),
            new Paragraph({ text: `GUARDIA DEL DIA ${sanitizeXmlString(date)}`, alignment: AlignmentType.CENTER, spacing: { after: 400 }}),
            ...content,
        ]}]
    });
    Packer.toBlob(doc).then(blob => saveFile(blob, `Orden_de_Servicio_por_Hora_${sanitizeXmlString(date).replace(/\s/g, '_')}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
};


export const exportExcelTemplate = () => {
    const headers = ["Título del Servicio", "Descripción del Servicio", "Novedad del Servicio", "Ubicación de Asignación", "Horario de Asignación", "Horario de Implantación", "Personal de Asignación", "Unidad de Asignación", "Detalles de Asignación"];
    const exampleRow = ["EVENTOS DEPORTIVOS", "O.S. 1234/25", "Presentarse con uniforme de gala.", "Estadio Monumental", "18:00 Hs. a terminar.-", "16:00 Hs.", "Personal a designar", "FZ-1234", "Encuentro Futbolístico 'EQUIPO A VS. EQUIPO B'"];
    const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla de Servicios');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveFile(excelBuffer, 'plantilla_servicios.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};


export const exportScheduleAsExcelTemplate = (schedule) => {
    const createSheetData = (services) => {
      if (!services || services.length === 0) return [];
      const data = [];
      services.forEach(service => {
        if (service.assignments.length === 0) {
            data.push({
                "Título del Servicio": service.title,
                "Descripción del Servicio": service.description || '',
                "Novedad del Servicio": service.novelty || ''
            });
        } else {
            service.assignments.forEach(assignment => {
                const allDetails = assignment.details ? [...assignment.details] : [];
                data.push({
                    "Título del Servicio": service.title,
                    "Descripción del Servicio": service.description || '',
                    "Novedad del Servicio": service.novelty || '',
                    "Ubicación de Asignación": assignment.location,
                    "Horario de Asignación": assignment.time,
                    "Horario de Implantación": assignment.implementationTime || '',
                    "Personal de Asignación": assignment.personnel,
                    "Unidad de Asignación": assignment.unit || '',
                    "Detalles de Asignación": allDetails.join('; ')
                });
            });
        }
      });
      return data;
    };
    
    const commonServicesData = createSheetData(schedule.services);
    const sportsEventsData = createSheetData(schedule.sportsEvents);
    
    const workbook = XLSX.utils.book_new();
    if (commonServicesData.length > 0) {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(commonServicesData), 'Servicios Comunes');
    }
    if (sportsEventsData.length > 0) {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sportsEventsData), 'Eventos Deportivos');
    }
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveFile(excelBuffer, `plantilla_desde_horario_${schedule.date.replace(/\s/g, '_')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

export const exportScheduleAsWordTemplate = (schedule) => {
    const createTemplateSection = (services, title) => {
        if (!services || services.length === 0) return [];
        
        const sectionContent = services.flatMap(service => {
            const processAssignment = (assignment) => {
                const paragraphs = [
                    new Paragraph({ children: [new TextRun({ text: "Título del Servicio: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(service.title), ...CONTENT_STYLE })] }),
                    new Paragraph({ children: [new TextRun({ text: "Descripción del Servicio: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(service.description), ...CONTENT_STYLE })] }),
                    new Paragraph({ children: [new TextRun({ text: "Novedad del Servicio: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(service.novelty), ...CONTENT_STYLE })] }),
                ];

                if (assignment) {
                    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Ubicación de Asignación: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(assignment.location), ...CONTENT_STYLE })] }));
                    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Horario de Asignación: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(assignment.time), ...CONTENT_STYLE })] }));
                    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Horario de Implantación: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(assignment.implementationTime), ...CONTENT_STYLE })] }));
                    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Personal de Asignación: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(assignment.personnel), ...CONTENT_STYLE })] }));
                    if (assignment.unit) paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Unidad de Asignación: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(assignment.unit), ...CONTENT_STYLE })] }));
                    
                    const allDetails = assignment.details || [];
                    if (allDetails.length > 0) paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Detalles de Asignación: ", ...LABEL_STYLE }), new TextRun({ text: sanitizeXmlString(allDetails.join('; ')), ...CONTENT_STYLE })] }));
                }
                
                paragraphs.push(new Paragraph({ text: "---", alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } }));
                return paragraphs;
            };

            return service.assignments.length === 0 ? processAssignment() : service.assignments.flatMap(processAssignment);
        });

        if (sectionContent.length > 0) {
            sectionContent[sectionContent.length - 1] = new Paragraph({ text: "" }); // Remove last separator
        }
        
        return [new Paragraph({ text: sanitizeXmlString(title), style: "Heading1" }), ...sectionContent];
    };

    const commonServicesSection = createTemplateSection(schedule.services, "PLANTILLA DE SERVICIOS COMUNES");
    const sportsEventsSection = createTemplateSection(schedule.sportsEvents, "PLANTILLA DE EVENTOS DEPORTIVOS");

    const doc = new Document({
        creator: "Servicios del Cuerpo de Bomberos de la Ciudad",
        title: `Plantilla desde Horario - ${schedule.date}`,
        styles: {
            paragraphStyles: [
                { id: "Heading1", name: "Heading 1", run: { size: 32, bold: true, font: "Arial" }, paragraph: { spacing: { before: 240, after: 240 }, alignment: AlignmentType.CENTER } }
            ]
        },
        sections: [{ children: [
            ...commonServicesSection,
            ...(sportsEventsSection.length > 0 && commonServicesSection.length > 0 ? [new Paragraph({ children: [new PageBreak()] })] : []),
            ...sportsEventsSection,
        ]}]
    });

    Packer.toBlob(doc).then(blob => saveFile(blob, `plantilla_desde_horario_${sanitizeXmlString(schedule.date).replace(/\s/g, '_')}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
};

export const exportWordTemplate = ({ unitList, commandPersonnel, servicePersonnel }) => {
    const instructions = new Paragraph({
        children: [
            new TextRun({
                text: 'Instrucciones: Rellene la siguiente tabla para cada servicio. Puede copiar y pegar la tabla completa para añadir servicios adicionales. Los campos con (*) son obligatorios.',
                ...ITALIC_CONTENT_STYLE,
                size: 20,
            }),
        ],
        spacing: { after: 200 },
    });

    const createRow = (label, placeholder) => new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label, ...LABEL_STYLE })] })],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.CLEAR, fill: "EAEAEA" },
            }),
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: placeholder, ...ITALIC_PLACEHOLDER_STYLE })] })],
                width: { size: 70, type: WidthType.PERCENTAGE },
            }),
        ],
    });

    const serviceTable = new Table({
        rows: [
            createRow('Título del Servicio (*)', '[Ej: COBERTURA DE EVENTO]'),
            createRow('Descripción del Servicio', '[Ej: O.S. 1234/25]'),
            createRow('Novedad del Servicio', '[Ej: Concurrir con uniforme de gala]'),
            createRow('Ubicación de Asignación (*)', '[Ej: Estadio Monumental]'),
            createRow('Horario de Asignación (*)', '[Ej: 18:00 Hs. a terminar.-]'),
            createRow('Horario de Implantación', '[Ej: 16:00 Hs.]'),
            createRow('Personal de Asignación (*)', '[Ej: Personal a designar]'),
            createRow('Unidad de Asignación', '[Ej: FZ-1234]'),
            createRow('Detalles de Asignación', '[Ej: Encuentro Futbolístico "EQUIPO A VS. EQUIPO B"]'),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const allPersonnel = [...commandPersonnel, ...servicePersonnel]
        .filter((p, index, self) => index === self.findIndex((t) => t.id === p.id)) // unique
        .sort((a,b) => a.name.localeCompare(b.name));

    const unitParagraphs = [
        new Paragraph({ text: "Unidades Disponibles", style: "Heading2" }),
        ...unitList.map(unit => new Paragraph({ text: sanitizeXmlString(unit), bullet: { level: 0 } }))
    ];

    const personnelParagraphs = [
        new Paragraph({ text: "Personal Disponible", style: "Heading2" }),
        ...allPersonnel.map(p => new Paragraph({ text: sanitizeXmlString(`${p.rank} - ${p.name} (L.P. ${p.id})`), bullet: { level: 0 } }))
    ];

    const doc = new Document({
        creator: "Servicios del Cuerpo de Bomberos de la Ciudad",
        title: "Plantilla para Importación de Servicios",
        styles: {
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    run: { size: 32, bold: true, font: "Arial" },
                    paragraph: { spacing: { before: 240, after: 240 }, alignment: AlignmentType.CENTER }
                },
                { 
                    id: "Heading2", 
                    name: "Heading 2", 
                    run: HEADING_2_RUN_STYLE, 
                    paragraph: { spacing: { before: 240, after: 120 } } 
                },
            ]
        },
        sections: [{
            children: [
                new Paragraph({ text: "Plantilla de Importación de Servicios", style: "Heading1" }),
                instructions,
                serviceTable,
                new Paragraph({ children: [new PageBreak()] }),
                ...unitParagraphs,
                new Paragraph({ text: "" }),
                ...personnelParagraphs,
            ]
        }]
    });

    Packer.toBlob(doc).then(blob => saveFile(blob, 'plantilla_servicios_tabla.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
};


export const exportRosterTemplate = () => {
    const template = {
        "2025-08-01": {
            "jefeInspecciones": "APELLIDO, Nombre",
            "jefeServicio": "APELLIDO, Nombre",
            "jefeGuardia": "APELLIDO, Nombre",
            "jefeReserva": "APELLIDO, Nombre"
        },
        "2025-08-02": {
            "jefeServicio": "OTRO APELLIDO, Nombre"
        }
    };
    saveFile(JSON.stringify(template, null, 2), 'plantilla_rol_de_guardia.json', 'application/json');
};

export const exportRosterWordTemplate = () => {
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [new TextRun({ text: "Plantilla para Rol de Guardia", bold: true, size: 28 })],
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Instrucciones: Mantenga el formato de fecha (DD/MM/AAAA) y de rol (ROL: Nombre).", italics: true, size: 22 })],
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "01/08/2025" }),
                new Paragraph({ text: sanitizeXmlString("JEFE DE INSPECCIONES: APELLIDO, Nombre") }),
                new Paragraph({ text: sanitizeXmlString("JEFE DE SERVICIO: APELLIDO, Nombre") }),
                new Paragraph({ text: sanitizeXmlString("JEFE DE GUARDIA: APELLIDO, Nombre") }),
                new Paragraph({ text: sanitizeXmlString("JEFE DE RESERVA: APELLIDO, Nombre") }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "02/08/2025" }),
                new Paragraph({ text: sanitizeXmlString("JEFE DE SERVICIO: OTRO APELLIDO, Nombre") }),
            ]
        }]
    });

    Packer.toBlob(doc).then(blob => {
        saveFile(blob, 'plantilla_rol_de_guardia.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });
};


export const exportUnitReportToPdf = (reportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;

    // Embed data for re-importing
    try {
        const jsonData = JSON.stringify(reportData);
        doc.setProperties({
            subject: `unit-report-data:${jsonData}`
        });
    } catch (e) {
        console.error("Failed to embed JSON data in PDF:", e);
    }

    const drawPageHeader = () => {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#c93131'); // Red color for title
        doc.text("Reporte de Unidades de Bomberos", margin, 15);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);
        const reportDateTime = reportData.reportDate || new Date().toLocaleString('es-AR');
        doc.text(reportDateTime, pageWidth - margin, 15, { align: 'right' });
    };

    const allRows = [];
    
    reportData.zones.forEach(zone => {
        allRows.push([{
            content: zone.name,
            colSpan: 6,
            styles: {
                halign: 'center',
                fontStyle: 'bold',
                fillColor: '#b91c1c', // red-700
                textColor: '#ffffff',
                fontSize: 12
            }
        }]);
        
        zone.groups.forEach((group) => {
            allRows.push([{
                content: group.name,
                colSpan: 6,
                styles: {
                    fontStyle: 'bold',
                    fillColor: '#3f3f46', // zinc-700
                    textColor: '#ffffff',
                    fontSize: 10
                }
            }]);

            group.units.forEach((unit) => {
                allRows.push([
                    unit.id,
                    unit.type,
                    `${unit.status}${unit.outOfServiceReason ? ` (${unit.outOfServiceReason})` : ''}`,
                    unit.officerInCharge || '-',
                    unit.poc || '-',
                    unit.personnelCount ?? '-'
                ]);
            });
        });
    });

    autoTable(doc, {
        head: [['Unidad', 'Tipo', 'Estado', 'Oficial a Cargo', 'POC', 'Personal']],
        body: allRows,
        startY: 25,
        theme: 'grid',
        headStyles: { 
            fillColor: '#52525b', // zinc-600
            textColor: '#ffffff',
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 8, 
            cellPadding: 2,
            font: 'helvetica'
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 30 },
            5: { cellWidth: 15, halign: 'center' },
        },
        didDrawPage: (data) => {
            drawPageHeader();
        }
    });

    doc.save(`Reporte_Unidades_${reportData.reportDate.split(',')[0].replace(/\//g, '-')}.pdf`);
};

const createPdfTable = (doc, title, head, body, startY) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, startY);
    autoTable(doc, {
        head: [head],
        body: body,
        startY: startY + 6,
        theme: 'grid',
        headStyles: { fillColor: '#3f3f46' }, // zinc-700
        styles: { fontSize: 8 }
    });
    return doc.lastAutoTable.finalY + 10;
};

export const exportEraReportToPdf = (reportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Reporte de Trasvazadores E.R.A.", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(reportData.reportDate, pageWidth / 2, y, { align: 'center' });
    y += 10;

    const body = reportData.stations.reduce((acc, station) => {
        if (!station.hasEquipment || station.equipment.length === 0) {
            acc.push([{ content: station.name, styles: { fontStyle: 'bold' } }, { content: 'NO POSEE', colSpan: 4, styles: { halign: 'center' } }]);
        } else {
            station.equipment.forEach((equip, index) => {
                acc.push([
                    index === 0 ? { content: station.name, rowSpan: station.equipment.length, styles: { fontStyle: 'bold', valign: 'middle' } } : '',
                    equip.brand,
                    equip.voltage,
                    equip.condition,
                    equip.dependency
                ]);
            });
        }
        return acc;
    }, []);

    autoTable(doc, {
        head: [['ESTACIÓN', 'MARCA', 'VOLTAJE', 'COND.', 'DEPENDENCIA']],
        body: body,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: '#3f3f46' },
        styles: { fontSize: 9 }
    });

    doc.save(`Reporte_ERA_${reportData.reportDate.split(',')[0].replace(/\//g, '-')}.pdf`);
};

export const exportGeneratorReportToPdf = (reportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Reporte de Grupos Electrógenos", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(reportData.reportDate, pageWidth / 2, y, { align: 'center' });
    y += 10;

    const body = reportData.stations.reduce((acc, station) => {
        if (!station.hasEquipment || station.equipment.length === 0) {
            acc.push([{ content: station.name, styles: { fontStyle: 'bold' } }, { content: 'NO POSEE', colSpan: 4, styles: { halign: 'center' } }]);
        } else {
            station.equipment.forEach((equip, index) => {
                acc.push([
                    index === 0 ? { content: station.name, rowSpan: station.equipment.length, styles: { fontStyle: 'bold', valign: 'middle' } } : '',
                    equip.brand,
                    equip.kva,
                    equip.condition,
                    equip.dependency
                ]);
            });
        }
        return acc;
    }, []);

    autoTable(doc, {
        head: [['ESTACIÓN', 'MARCA', 'KVA', 'COND.', 'DEPENDENCIA']],
        body: body,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: '#3f3f46' },
        styles: { fontSize: 9 }
    });

    doc.save(`Reporte_Grupos_Electrogenos_${reportData.reportDate.split(',')[0].replace(/\//g, '-')}.pdf`);
};

export const exportUnitStatusToPdf = (filteredUnits) => {
    const doc = new jsPDF('landscape');
    let y = 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Estado de Unidades Filtradas", 14, y);
    y += 10;

    autoTable(doc, {
        head: [['Unidad', 'Tipo', 'Estado', 'Oficial a Cargo', 'Personal', 'Ubicación']],
        body: filteredUnits.map(u => [
            u.id, u.type, u.status, u.officerInCharge || '-', u.personnelCount ?? '-', u.groupName
        ]),
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: '#3f3f46' },
        styles: { fontSize: 8 }
    });

    doc.save(`Estado_Unidades_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`);
};

export const exportMaterialsReportToPdf = (reportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Reporte de Materiales", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(reportData.reportDate, pageWidth / 2, y, { align: 'center' });
    y += 10;

    const body = reportData.locations.reduce((acc, location) => {
        if (location.materials.length === 0) {
            acc.push([{ content: location.name, styles: { fontStyle: 'bold' } }, { content: 'NO POSEE', colSpan: 4, styles: { halign: 'center' } }]);
        } else {
            location.materials.forEach((material, index) => {
                acc.push([
                    index === 0 ? { content: location.name, rowSpan: location.materials.length, styles: { fontStyle: 'bold', valign: 'middle' } } : '',
                    material.name,
                    material.quantity,
                    material.condition,
                    material.location || '-'
                ]);
            });
        }
        return acc;
    }, []);

    autoTable(doc, {
        head: [['ESTACIÓN / DEST.', 'MATERIAL', 'CANT.', 'CONDICIÓN', 'UBICACIÓN']],
        body: body,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: '#3f3f46' },
        styles: { fontSize: 9 }
    });

    doc.save(`Reporte_Materiales_${reportData.reportDate.split(',')[0].replace(/\//g, '-')}.pdf`);
};

export const exportCommandPostToPdf = (
    incidentDetails, 
    trackedUnits, 
    trackedPersonnel,
    sci201Data,
    sci211Data,
    sci207Data,
    croquisSketch
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    let y = 15;

    // --- Page 1: General Info ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Reporte de Puesto de Comando", pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.text("Datos del Incidente", margin, y);
    y += 2;
    autoTable(doc, {
        body: [
            ['Tipo de Siniestro', incidentDetails.type || '-'],
            ['Dirección', incidentDetails.address || '-'],
            ['Comuna', incidentDetails.district || '-'],
            ['Fecha y Hora de Alarma', incidentDetails.alarmTime || '-'],
            ['Jefe del Cuerpo en el Lugar', incidentDetails.chiefOnScene || '-'],
            ['Jefe de la Emergencia', incidentDetails.incidentCommander || '-'],
        ],
        startY: y,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
    });
    y = doc.lastAutoTable.finalY + 8;

    y = createPdfTable(doc, 'Unidades en Intervención', ['Unidad', 'A Cargo', 'Dot.', 'H. Salida', 'H. Lugar', 'H. Regreso', 'Novedades'], 
        trackedUnits.filter(u => u.dispatched).map(u => [
            `${u.id}\n(${u.groupName})`, u.officerInCharge || '-', u.personnelCount || '-', u.departureTime, u.onSceneTime, u.returnTime, u.notes
        ]), y);

    y = createPdfTable(doc, 'Personal Clave en Intervención', ['Nombre', 'Tipo', 'Estación', 'Novedades'], 
        trackedPersonnel.filter(p => p.onScene).map(p => [
            p.name, p.type, p.groupName, p.notes
        ]), y);
        
    // --- SCI-201 Page ---
    doc.addPage();
    y = 15;
    doc.setFontSize(16);
    doc.text("Formulario SCI-201: Resumen del Incidente", pageWidth / 2, y, { align: 'center' });
    y += 10;
    autoTable(doc, {
        startY: y,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1.5, lineColor: 200 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
        body: [
            ['Nombre del Incidente', sci201Data.incidentName || '-'],
            ['Fecha/Hora de Preparación', sci201Data.prepDateTime || '-'],
            ['Lugar del Incidente', sci201Data.incidentLocation || '-'],
            ['Naturaleza del Incidente', sci201Data.evalNature || '-'],
            ['Amenazas', sci201Data.evalThreats || '-'],
            ['Área Afectada', sci201Data.evalAffectedArea || '-'],
            ['Aislamiento', sci201Data.evalIsolation || '-'],
            ['Objetivo(s) Inicial(es)', sci201Data.initialObjectives || '-'],
            ['Estrategias', sci201Data.strategies || '-'],
            ['Tácticas', sci201Data.tactics || '-'],
            ['Ubicación del PC', sci201Data.pcLocation || '-'],
            ['Ruta Ingreso/Egreso', `${sci201Data.ingressRoute || '-'} / ${sci201Data.egressRoute || '-'}`],
            ['Mensaje de Seguridad', sci201Data.safetyMessage || '-'],
            ['Comandante del Incidente', sci201Data.incidentCommander || '-'],
        ]
    });
    y = doc.lastAutoTable.finalY + 8;
    y = createPdfTable(doc, 'Resumen de Acciones', ['Hora', 'Resumen'], sci201Data.actions.map(a => [a.time, a.summary]), y);
    
    // --- SCI-211 Page ---
    if (sci211Data.filter(r => r.requestedBy).length > 0) {
        doc.addPage();
        y = 15;
        doc.setFontSize(16);
        doc.text("Formulario SCI-211: Registro de Recursos", pageWidth / 2, y, { align: 'center' });
        y += 10;
        autoTable(doc, {
            startY: y,
            theme: 'grid',
            head: [['Solicitado por', 'F/H Sol.', 'Recurso', 'Institución', 'F/H Arribo', 'Asignado a', 'F/H Desmov.']],
            body: sci211Data.filter(r => r.requestedBy).map(r => [
                r.requestedBy, r.requestDateTime, `${r.classType} / ${r.resourceType}`, r.institution, r.arrivalDateTime, r.assignedTo, r.demobilizedDateTime
            ]),
            styles: { fontSize: 8 }
        });
    }

    // --- SCI-207 Page ---
    if (sci207Data.filter(v => v.patientName).length > 0) {
        doc.addPage();
        y = 15;
        doc.setFontSize(16);
        doc.text("Formulario SCI-207: Registro de Víctimas", pageWidth / 2, y, { align: 'center' });
        y += 10;
        autoTable(doc, {
            startY: y,
            theme: 'grid',
            head: [['Paciente', 'Sexo/Edad', 'Clasif.', 'Lugar Traslado', 'Trasladado por', 'F/H Traslado']],
            body: sci207Data.filter(v => v.patientName).map(v => [
                v.patientName, `${v.sex}/${v.age}`, v.triage, v.transportLocation, v.transportedBy, v.transportDateTime
            ])
        });
    }

    // --- Croquis Page ---
    if (croquisSketch) {
        try {
            const imgProps = doc.getImageProperties(croquisSketch);
            const isLandscape = imgProps.width > imgProps.height;
            // FIX: Correctly call addPage with format and orientation arguments. The options object syntax is not supported by the version of jsPDF being used.
            doc.addPage(undefined, isLandscape ? 'landscape' : 'portrait');
            
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            y = 15;

            doc.setFontSize(16);
            doc.text("Croquis del Incidente", pageW / 2, y, { align: 'center' });
            y += 10;

            const availableWidth = pageW - (margin * 2);
            const availableHeight = pageH - y - margin;

            const imgRatio = imgProps.width / imgProps.height;
            const pageRatio = availableWidth / availableHeight;

            let finalWidth, finalHeight;
            if (imgRatio > pageRatio) {
                finalWidth = availableWidth;
                finalHeight = finalWidth / imgRatio;
            } else {
                finalHeight = availableHeight;
                finalWidth = finalHeight * imgRatio;
            }

            const xPos = (pageW - finalWidth) / 2;
            doc.addImage(croquisSketch, 'PNG', xPos, y, finalWidth, finalHeight);
        } catch (error) {
            console.error("Error adding image to PDF:", error);
            doc.addPage();
            doc.setTextColor(255, 0, 0);
            doc.text("No se pudo cargar el croquis.", margin, 15);
        }
    }
    
    doc.save(`Reporte_Puesto_Comando_${new Date().toISOString().split('T')[0]}.pdf`);
};


export const exportPersonnelToExcel = (personnel, title) => {
    const data = personnel.map(p => ({
        'L.P.': p.id,
        'Jerarquía': p.rank,
        'Apellido y Nombre': p.name,
        'Estación': p.station || '',
        'Destacamento': p.detachment || '',
        'POC': p.poc || '',
        'PART': p.part || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveFile(excelBuffer, `${title.replace(/\s/g, '_')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

export const exportUnitsToExcel = (units) => {
    const data = units.map(u => ({ 'ID de Unidad': u }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Unidades');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveFile(excelBuffer, 'Nomenclador_Unidades.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};