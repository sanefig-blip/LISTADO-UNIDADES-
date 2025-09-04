import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const MONTH_NAMES = { "ENERO": 0, "FEBRERO": 1, "MARZO": 2, "ABRIL": 3, "MAYO": 4, "JUNIO": 5, "JULIO": 6, "AGOSTO": 7, "SEPTIEMBRE": 8, "OCTUBRE": 9, "NOVIEMBRE": 10, "DICIEMBRE": 11 };

// Parser for the new Excel format with personnel list
function parsePersonnelExcel(sheet) {
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (rows.length < 2) return null;

    const hasHeaders = rows.some(row => Array.isArray(row) && ['LUGAR', 'LP', 'JERARQUÍA'].every(h => row.includes(h)));
    if (!hasHeaders) return null;

    const title = rows[0]?.[0] || '';
    const dateMatch = title.match(/\((\w+)\s(\d{1,2})\sDE\s(\w+)\sDE\s(\d{4})\)/i);
    let scheduleDate = undefined;
    if (dateMatch) {
        const [, , day, month, year] = dateMatch;
        scheduleDate = `${day} DE ${month.toUpperCase()} DE ${year}`;
    }

    const schedule = {
        date: scheduleDate,
        services: [],
        sportsEvents: [],
    };

    let currentService = null;
    let headers = [];

    rows.forEach(row => {
        if (!Array.isArray(row) || row.every(cell => cell === null)) return;

        const firstCell = String(row[0] || '').trim();
        const isSectionHeader = firstCell && row.slice(1).every(cell => cell === null);

        if (isSectionHeader) {
            currentService = {
                id: `excel-import-${firstCell.replace(/\s/g, '-')}`,
                title: firstCell,
                isHidden: false,
                assignments: []
            };
            schedule.services.push(currentService);
            headers = [];
            return;
        }

        if (row.includes('LUGAR') && row.includes('LP')) {
            headers = row.map(h => String(h || '').trim());
            return;
        }

        if (currentService && headers.length > 0) {
            const rowData = {};
            headers.forEach((header, index) => { if(header) rowData[header] = row[index]; });

            if (rowData['LUGAR']) {
                const location = String(rowData['LUGAR']).trim();
                let assignment = currentService.assignments.find(a => a.location === location);

                if (!assignment) {
                    assignment = {
                        id: `excel-assign-${location.replace(/\s/g, '-')}`,
                        location: location,
                        time: rowData['HORARIO'] ? String(rowData['HORARIO']).trim() : 'N/A',
                        personnel: rowData['OFICINA/COMPAÑÍA'] ? String(rowData['OFICINA/COMPAÑÍA']).trim() : 'A designar',
                        details: [],
                    };
                    currentService.assignments.push(assignment);
                }

                const rank = String(rowData['JERARQUÍA'] || '').trim();
                const lp = String(rowData['LP'] || '').trim();
                const name = String(rowData['NOMBRE Y APELLIDO'] || '').trim();
                const poc = rowData['CONTACTO POC'] ? `POC: ${rowData['CONTACTO POC']}` : '';
                const particular = rowData['PARTICULAR'] ? `CEL: ${rowData['PARTICULAR']}` : '';

                let detailString = `${rank} L.P. ${lp} ${name} ${poc} ${particular}`.replace(/\s+/g, ' ').trim();
                assignment.details.push(detailString);
            }
        }
    });

    return schedule.services.length > 0 ? schedule : null;
}

// Parser for the template-based Excel file
function parseTemplateExcel(sheet) {
    const json = XLSX.utils.sheet_to_json(sheet);
    const servicesMap = new Map();
    json.forEach((row) => {
        const serviceTitle = row['Título del Servicio']?.trim();
        if (!serviceTitle) return;
        if (!servicesMap.has(serviceTitle)) {
            servicesMap.set(serviceTitle, { id: `imported-excel-${Date.now()}-${servicesMap.size}`, title: serviceTitle, description: row['Descripción del Servicio'] || '', novelty: row['Novedad del Servicio'] || '', isHidden: false, assignments: [] });
        }
        const service = servicesMap.get(serviceTitle);
        const location = row['Ubicación de Asignación'], time = row['Horario de Asignación'], personnel = row['Personal de Asignación'];
        if (location && time && personnel) {
            const allDetailsRaw = row['Detalles de Asignación'] ? String(row['Detalles de Asignación']).split(/;|\n/g).map(d => d.trim()).filter(d => d) : [];
            const implementationTimeValue = allDetailsRaw.find(d => d.toUpperCase().startsWith('HORARIO DE IMPLANTACION'));
            const otherDetails = allDetailsRaw.filter(d => !d.toUpperCase().startsWith('HORARIO DE IMPLANTACION'));
            service.assignments.push({ id: `imported-assign-${Date.now()}-${service.assignments.length}`, location: String(location), time: String(time), personnel: String(personnel), unit: row['Unidad de Asignación'] ? String(row['Unidad de Asignación']) : undefined, implementationTime: implementationTimeValue, details: otherDetails });
        }
    });
    const allServices = Array.from(servicesMap.values());
    return {
        services: allServices.filter(s => !s.title.toUpperCase().includes('EVENTO DEPORTIVO')),
        sportsEvents: allServices.filter(s => s.title.toUpperCase().includes('EVENTO DEPORTIVO')),
    };
}


export const parseFullUnitReportFromExcel = (fileBuffer) => {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    const stationMap = new Map();

    const processBlock = (startRow, endRow, colOffset) => {
        let stationName = null;
        
        const blockStartKeywords = [
            'ESTACION', 'ESTACIÓN', 'DTO.', 'DESTAC.', 'DESTACAMENTO', 'BRIGADA', 
            'OFICINA', 'COMPAÑIA', 'COMPANIA', 'DIVISIÓN', 'DIVISION', 'TRANSPORTE', 'URIP', 'O.C.O.B.'
        ];

        for (let r = startRow; r < Math.min(startRow + 5, endRow); r++) {
            const cellValue = rows[r]?.[colOffset];
             if (cellValue) {
                const upperCellValue = String(cellValue).toUpperCase().trim();
                if (blockStartKeywords.some(keyword => upperCellValue.startsWith(keyword))) {
                    stationName = String(cellValue).trim().replace(/\s+/g, ' ').trim();
                    break;
                }
            }
        }
        
        if (!stationName) {
            return;
        }

        const group = { name: stationName, units: [] };
        
        for (let r = startRow; r < endRow; r++) {
            const row = rows[r];
            if (!row) continue;
            
            const type = row[colOffset + 0] ? String(row[colOffset + 0]).trim() : '';
            const id = row[colOffset + 1] ? String(row[colOffset + 1]).trim() : '';
            
            if (type && id && id.length > 2 && !blockStartKeywords.some(k => type.toUpperCase().startsWith(k)) && !type.toUpperCase().startsWith('TOTAL') && !type.toUpperCase().startsWith('DEPEN')) {
                const statusRaw = String(row[colOffset + 2] || 'Para Servicio').trim().toUpperCase();
                const officerName = String(row[colOffset + 3] || '').trim();
                const pocRaw = String(row[colOffset + 4] || '').trim();
                const personnelCountRaw = row[colOffset + 5];

                let status = 'Para Servicio';
                let outOfServiceReason = undefined;
                let officerInCharge = undefined;
                let poc = undefined;
                let personnelCount = null;
                
                if (statusRaw.includes('F/S')) {
                    status = 'Fuera de Servicio';
                    outOfServiceReason = officerName || statusRaw.replace(/F\/S/i, '').trim() || undefined;
                    officerInCharge = undefined;
                    poc = undefined;
                } else {
                    officerInCharge = officerName || undefined;
                    poc = pocRaw || undefined;

                    if (statusRaw.includes('RESERVA')) {
                        status = 'Reserva';
                    } else if (statusRaw.includes('A/P') || statusRaw.includes('A PRÉSTAMO')) {
                        status = 'A Préstamo';
                    }
                }

                if (personnelCountRaw !== null && personnelCountRaw !== undefined && String(personnelCountRaw).trim() !== '') {
                    const count = parseInt(String(personnelCountRaw), 10);
                    if (!isNaN(count)) {
                        personnelCount = count;
                    }
                }
                
                group.units.push({
                    id,
                    type,
                    status,
                    officerInCharge,
                    poc,
                    outOfServiceReason,
                    personnelCount,
                });
            }
        }
        if (group.units.length > 0) {
            stationMap.set(group.name, group);
        }
    };
    
    const blockStartsByCol = new Map();
    const blockStartKeywords = [
        'ESTACION', 'ESTACIÓN', 'DTO.', 'DESTAC.', 'DESTACAMENTO', 'BRIGADA', 
        'OFICINA', 'COMPAÑIA', 'COMPANIA', 'DIVISIÓN', 'DIVISION', 'TRANSPORTE', 'URIP', 'O.C.O.B.'
    ];
    const columnsToScan = [0, 6, 12];

    rows.forEach((row, r) => {
        if (row) {
            columnsToScan.forEach(c => {
                const cellValue = row[c];
                if (cellValue) {
                    const upperCellValue = String(cellValue).toUpperCase().trim();
                    if (blockStartKeywords.some(keyword => upperCellValue.startsWith(keyword))) {
                       if (!blockStartsByCol.has(c)) {
                           blockStartsByCol.set(c, []);
                       }
                       blockStartsByCol.get(c).push(r);
                    }
                }
            });
        }
    });

    blockStartsByCol.forEach((startRows, col) => {
        const sortedRows = startRows.sort((a, b) => a - b);
        for (let i = 0; i < sortedRows.length; i++) {
            const startRow = sortedRows[i];
            const endRow = (i + 1 < sortedRows.length) ? sortedRows[i + 1] : rows.length;
            processBlock(startRow, endRow, col);
        }
    });
    
    const ZONES_LAYOUT = {
        "ZONA I": ["ESTACION I", "ESTACION II", "DTO. POMPEYA", "ESTACION III", "DTO. BOCA", "ESTACION X"],
        "ZONA II": ["ESTACION IV", "DTO. MISERERE", "DTO. RETIRO", "ESTACION V", "DTO. URQUIZA", "DTO. SAAVEDRA", "ESTACION VI", "DTO. PALERMO", "DTO. CHACARITA"],
        "ZONA III": ["ESTACION VII", "ESTACION VIII", "DTO. VELEZ SARSFIELD", "ESTACION IX", "DTO. DEVOTO", "ESTACION XI"],
        "OPERACIONES ESPECIALES": ["DTO. G.E.R. 1", "DTO. G.E.R. 2", "ESTACION BUSQUEDA Y RESCATE K9"],
        "UNIDADES INTERVENCIONES RELEVANTES": ["O.C.O.B.", "DESTACAMENTO SISTEMA DE ASISTENCIA CRÍTICA", "Div. B.E.FE.R.", "TRANSPORTE FORENSE", "Estación BRIGADA DE EMERGENCIAS ESPECIALES"],
        "TECNICO PERICIAL": ["COMPANIA TECNICO PERICIAL", "URIP CENTRO", "URIP NORTE"]
    };

    const zones = Object.keys(ZONES_LAYOUT).map(name => ({ name, groups: [] }));

    stationMap.forEach((group, groupName) => {
        let assigned = false;
        const normalizedGroupName = groupName.toUpperCase()
            .replace(/["'“”]/g, "")
            .replace(/\./g, "")
            .replace("CTE GRAL A VAZQUEZ", "ESTACION V")
            .replace("CRIO. MAYOR M. FIRMA PAZ", "ESTACION VI")
            .replace("PUERTO MADERO", "ESTACION I")
            .replace("PATRICIOS", "ESTACION II")
            .replace("BARRACAS", "ESTACION III")
            .replace("RECOLETA", "ESTACION IV")
            .replace("FLORES", "ESTACION VII")
            .replace("NUEVA CHICAGO", "ESTACION VIII")
            .replace("VERSAILLES", "ESTACION IX")
            .replace("LUGANO", "ESTACION X")
            .replace("ALBARIÑO", "ESTACION XI")
            .replace(/\s+/g, ' ')
            .trim();
        
        for (const zone of zones) {
             if (ZONES_LAYOUT[zone.name].some(prefix => normalizedGroupName.includes(prefix.toUpperCase().replace(/\./g, "")))) {
                zone.groups.push(group);
                assigned = true;
                break;
            }
        }
        if (!assigned) {
             console.warn(`Could not assign station "${groupName}" (${normalizedGroupName}) to a zone.`);
             for (const zone of zones) {
                if (ZONES_LAYOUT[zone.name].some(prefix => {
                    const simplifiedPrefix = prefix.toUpperCase().replace(/\./g, "").replace("ESTACION", "").trim();
                    return normalizedGroupName.includes(simplifiedPrefix);
                })) {
                    zone.groups.push(group);
                    assigned = true;
                    break;
                }
             }
        }
    });

    const reportDateCell = rows.find(row => row && String(row[0]).includes('GUARDIA'));
    const reportDate = reportDateCell ? String(reportDateCell[0]).replace('GUARDIA', '').trim() : new Date().toLocaleDateString('es-AR');

    const newUnitReport = {
        reportDate: reportDate,
        zones: zones.filter(z => z.groups.length > 0)
    };
    
    if (newUnitReport.zones.length === 0) {
        throw new Error("No se pudo analizar ninguna estación del archivo. Verifique el formato del reporte completo.");
    }
    
    return newUnitReport;
};


const parseFullSchedule = (lines) => {
    const schedule = { commandStaff: [], services: [], sportsEvents: [] };
    let currentService = null;
    let currentAssignment = {};
    let isParsingSportsEvents = false;

    const dateLine = lines.find(l => l.toUpperCase().startsWith('GUARDIA DEL DIA'));
    if (dateLine) {
        const dateMatch = dateLine.match(/(\d+)\sDE\s(\w+)\sDE\s(\d{4})/i);
        if (dateMatch) {
            const day = dateMatch[1];
            const monthStr = dateMatch[2].toUpperCase();
            const year = dateMatch[3];
            schedule.date = `${day} DE ${monthStr} DE ${year}`;
        }
    }

    const commitAssignment = () => {
        if (currentService && (currentAssignment.location || (currentAssignment.details && currentAssignment.details.length > 0))) {
             currentService.assignments.push({
                id: `imported-${Date.now()}-${Math.random()}`,
                location: currentAssignment.location || 'Ubicación a detallar',
                time: currentAssignment.time || 'Horario a detallar',
                personnel: currentAssignment.personnel || 'Personal a detallar',
                details: currentAssignment.details || [],
                ...currentAssignment,
            });
        }
        currentAssignment = { details: [] };
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const staffMatch = line.match(/(JEFE DE (?:INSPECCIONES|SERVICIO|GUARDIA|RESERVA))\s*:\s*([^(\n]+)/i);
        if (staffMatch) {
            const role = staffMatch[1].toUpperCase().trim();
            const details = staffMatch[2].trim();
            const rankMatch = details.match(/^(Comandante Director|Comandante|Subcomandante)/i);
            const rank = rankMatch ? rankMatch[0].toUpperCase() : 'OTRO';
            const name = details.replace(/^(Comandante Director|Comandante|Subcomandante)/i, '').replace(/\(.*\)\.?-?$/, '').trim();
            
            schedule.commandStaff.push({
                id: `officer-imported-${schedule.commandStaff.length}`,
                role: role,
                name: name,
                rank: rank
            });
            continue;
        }

        if (line.toUpperCase().trim() === 'SERVICIOS') continue;
        if (line.toUpperCase().trim() === 'EVENTOS DEPORTIVOS') {
            commitAssignment();
            currentService = null;
            isParsingSportsEvents = true;
            continue;
        }

        const newServiceMatch = line.match(/^(\d+)\s*[-–]\s*(.*)/);
        if (newServiceMatch) {
            commitAssignment();
            currentService = null;
            
            let fullTitle = newServiceMatch[2].trim().replace(/[.-]$/, '').replace(/^["“]|["”]$/g, '').trim();
            const osMatch = fullTitle.match(/^(O\.S\.\s*[\d/]+)\s*[-–]?\s*(.*)/i);
            let title = fullTitle;
            let description = '';

            if (osMatch) {
                description = osMatch[1].trim();
                title = osMatch[2].trim().replace(/^["“]|["”]$/g, '').trim();
            }

            const service = {
                id: `service-imported-${Date.now()}-${title.slice(0, 10)}`,
                title: title,
                description: description,
                isHidden: false,
                assignments: [],
            };
            (isParsingSportsEvents ? schedule.sportsEvents : schedule.services).push(service);
            currentService = service;
            continue;
        }

        if (!currentService) continue;

        const fieldMatch = line.match(/^(QTH|HORARIO DE IMPLANTACIÓN|HORARIO|UNIDAD|PERSONAL|MODALIDAD DE COBERTURA)\s*:\s*(.*)/i);
        if (fieldMatch) {
            const key = fieldMatch[1].toUpperCase().trim();
            const value = fieldMatch[2].trim().replace(/[.-]$/, '').trim();
            
            if (currentAssignment.location && key === 'QTH') {
                 commitAssignment();
            }

            switch (key) {
                case 'QTH': currentAssignment.location = value; break;
                case 'HORARIO DE IMPLANTACIÓN': currentAssignment.implementationTime = `HORARIO DE IMPLANTACION: ${value}`; break;
                case 'HORARIO': currentAssignment.time = value; break;
                case 'UNIDAD': currentAssignment.unit = value; break;
                case 'PERSONAL': currentAssignment.personnel = value; break;
                case 'MODALIDAD DE COBERTURA': 
                    if (currentAssignment.location) commitAssignment();
                    currentService.novelty = (currentService.novelty || '') + value + ' '; 
                    break;
            }
            continue;
        }

        const nextLine = (lines[i + 1] || '').trim().toUpperCase();
        if (line === line.toUpperCase() && line.length > 8 && !line.match(/^(Bombero|Oficial|Subteniente|Inspector|Teniente|JEFE DE|POR ORDEN)/i) && !nextLine.startsWith('HORARIO')) {
            commitAssignment();
            currentAssignment.location = line.replace(/[.-]$/, '').trim();
            continue;
        }
        
        if (line) {
            if (!currentAssignment.details) {
                currentAssignment.details = [];
            }
            currentAssignment.details.push(line);
        }
    }
    commitAssignment();
    return schedule;
};

async function parseWordFile(fileBuffer) {
    const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
    return result.value.split('\n').filter(line => line.trim() !== '');
}

async function parseExcelFile(fileBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Detect format
    const firstCell = sheet['A1'] ? sheet['A1'].v : '';
    if (firstCell.toUpperCase().includes('GUARDIA DEL DIA')) {
        return parsePersonnelExcel(sheet);
    }
    return parseTemplateExcel(sheet);
}

export const parseScheduleFromFile = async (fileBuffer, fileName) => {
    if (fileName.endsWith('.docx')) {
        const lines = await parseWordFile(fileBuffer);
        return parseFullSchedule(lines);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.ods')) {
        return parseExcelFile(fileBuffer);
    }
    return null;
};

export async function parseRosterFromWord(fileBuffer) {
    const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
    const lines = result.value.split('\n').map(l => l.trim()).filter(l => l);

    const roster = {};
    let currentDate = null;
    const rolesMap = {
        'JEFE DE INSPECCIONES': 'jefeInspecciones',
        'JEFE DE SERVICIO': 'jefeServicio',
        'JEFE DE GUARDIA': 'jefeGuardia',
        'JEFE DE RESERVA': 'jefeReserva'
    };

    for (const line of lines) {
        const dateMatch = line.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dateMatch) {
            const [, day, month, year] = dateMatch;
            // Note: JS Date month is 0-indexed
            currentDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
            continue;
        }

        if (currentDate) {
            const roleMatch = line.match(/^(JEFE DE (?:INSPECCIONES|SERVICIO|GUARDIA|RESERVA))\s*:\s*(.+)$/i);
            if (roleMatch) {
                const [, role, name] = roleMatch;
                const roleKey = rolesMap[role.toUpperCase()];
                if (roleKey) {
                    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                    if (!roster[dateKey]) {
                        roster[dateKey] = {};
                    }
                    roster[dateKey][roleKey] = name.trim();
                }
            }
        }
    }

    return roster;
}

export const parseUnitReportFromPdf = async (fileBuffer) => {
    try {
        const decoder = new TextDecoder('latin1');
        const pdfText = decoder.decode(fileBuffer);
        
        const prefix = 'unit-report-data:';
        const subjectTag = '/Subject';
        let startIndex = pdfText.indexOf(subjectTag);

        if (startIndex === -1) {
             console.warn("PDF does not contain /Subject tag.");
             return null;
        }

        startIndex += subjectTag.length;
        
        while(startIndex < pdfText.length && /\s/.test(pdfText[startIndex])) {
            startIndex++;
        }
        if (pdfText[startIndex] !== '(') {
             console.warn("Could not find opening parenthesis for /Subject string.");
             return null;
        }
        startIndex++;
        
        let balance = 1;
        let endIndex = -1;

        for (let i = startIndex; i < pdfText.length; i++) {
            const char = pdfText[i];
            if (char === '\\') {
                i++;
                continue;
            }
            if (char === '(') {
                balance++;
            } else if (char === ')') {
                balance--;
            }
            if (balance === 0) {
                endIndex = i;
                break;
            }
        }
        
        if (endIndex !== -1) {
            let fullSubject = pdfText.substring(startIndex, endIndex);
            if (fullSubject.startsWith(prefix)) {
                let jsonDataString = fullSubject.substring(prefix.length);
                jsonDataString = jsonDataString.replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
                const reportData = JSON.parse(jsonDataString);
                
                if (reportData && reportData.zones && Array.isArray(reportData.zones)) {
                    return reportData;
                }
            }
        }
        
        console.warn("No valid unit report data found embedded in the PDF subject.");
        return null;
    } catch (error) {
        console.error("Error parsing unit report from PDF:", error);
        throw new Error("No se pudo procesar el archivo PDF. Asegúrese de que fue generado por esta aplicación y no ha sido modificado.");
    }
};
