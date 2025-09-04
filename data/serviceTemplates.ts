
import { ServiceTemplate } from '../types';

export const defaultServiceTemplates: ServiceTemplate[] = [
  {
    templateId: 'template-fuerza-urbana-1',
    id: 'template-fuerza-urbana-1',
    title: 'SERVICIO PREVENCIONAL FUERZAS DE ORDEN URBANO (FUERZA-1)',
    description: '01- O.S. 01/2025',
    novelty: 'La misma permanecerá en apresto en Estación I "PUERTO MADERO", EL QTH puede ser modificado, según las necesidades del servicio, por la Dirección General de OPERACIONES o por la Oficina Comando Operativo de BOMBEROS.-',
    isHidden: false,
    assignments: [
      {
        id: 'template-assign-fu-1',
        location: 'Cerrito entre Tucumán y Viamonte',
        time: '07:00 Hs. a finalizar.-',
        implementationTime: '07:00 Hs.',
        personnel: 'de Estación VI "COMISARIO MAYO M. C. FIRMA PAZ".-',
        unit: 'FZ-2666 de Estación VI "COMISARIO MAYO M. C. FIRMA PAZ".-',
        details: []
      }
    ]
  },
  {
    templateId: 'template-cobertura-interes-1',
    id: 'template-cobertura-interes-1',
    title: 'BOMBEROS CON ESTADO POLICIAL - COBERTURA DE LUGARES DE INTERES',
    description: '02 - SERVICIO PREVENCIONAL',
    novelty: 'La implantación será de dos (02) oficiales por QTH asignado, de la Especialidad "transitoria" de bomberos con armamento provisto, chaleco balístico, uniforme completo (campera azul), poc asignado, equipo de comunicación en frecuencia convencional.-',
    isHidden: false,
    assignments: [
        { id: 'template-assign-ci-1', location: 'PARQUE BARRANCAS DE BELGRANO (CV 13-A)', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN II "PATRICIOS".-', details: ['OFICIAL 1°L.P.25665 GIMENEZ, URSULA POC: 1170275683 CEL: 1151257767', 'OFICIAL L.P. 26080 IVANOFF, RAMIRO POC: 1128679931 CEL: 1126529099'], implementationTime: undefined },
        { id: 'template-assign-ci-2', location: 'PLAZA INMIGRANTES DE ARMENIA (CV 14-A).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN X "LUGANO".-', details: ['SUBTENIENTE L.P. 75576 VIDELA, JONATHAN POC: 1140763788 CEL: 1167255448', 'OFICIAL L.P. 26321 MAGALLANES, JUAN POC: 1134040157 CEL: 1134040157'], implementationTime: undefined },
        { id: 'template-assign-ci-3', location: 'PLAZA SERRANO (CV 14-A).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN IV "RECOLETA".-', details: ['OFICIAL 1° L.P. 25860 RAPISARDA, DIEGO POC: 1122862754', 'OFICIAL L.P. 24690 FERNANDEZ, ADRIAN POC: 1160424236'], implementationTime: undefined },
        { id: 'template-assign-ci-4', location: 'PLAZA DORREGO (CV 1-F).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN IV "RECOLETA".-', details: ['BRO. SUP. L.P. 24944 ACOSTA, CRISTIAN POC: 1128790014', 'BRO. SUP. L.P.26876 ACOSTA, GUILLERMO POC: 1128750275'], implementationTime: undefined },
        { id: 'template-assign-ci-5', location: 'MERCADO DE SAN TELMO (CV 1-F).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN V "CMTE. GRAL. A. G. VAZQUEZ".-', details: ['OFICIAL L.P. 26117 MOLINA, ALICIA POC: 1140904610', 'OFICIAL L.P. 39234 GUTIERREZ POC: 1136296089'], implementationTime: undefined },
        { id: 'template-assign-ci-6', location: 'PLAZA HAROLDO CONTI (CV 1-E).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN VI "COMISARIO MAYOR M. C. FIRMA PAZ".-', details: ['SUBTENIENTE LP. 24.360 BENEITO, MAURICIO POC: 1134480538', 'OFICIAL 1° L.P: 24.106 COSNARD, MIGUEL POC: 1167244216'], implementationTime: undefined },
        { id: 'template-assign-ci-7', location: 'PLAZA MAFALDA (CV 13-C).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACION VII "FLORES".-', details: ['SUBTENIENTE L.P. 25468 MOLINA, ESTEBAN POC: 1171664317 CEL: 1132759035', 'OFICIAL L.P. 39453 FERRANDI, LEANDRO POC: 1168934167 CEL: 1161432861'], implementationTime: undefined },
        { id: 'template-assign-ci-8', location: 'PLAZA REPÚBLICA DE HAITÍ (CV 14-C).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN VI "COMISARIO MAYOR M. C. FIRMA PAZ".-', details: ['SUBTENIENTE L.P.26443 DETOMASI MOLINA, JAVIER POC: 1139074671', 'OFICIAL LP. 25.896 MIRANDA, GABRIEL POC: 1123281363'], implementationTime: undefined },
        { id: 'template-assign-ci-9', location: 'PLAZA ALEMANIA (CV 14-C).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN VIII "NUEVA CHICAGO".-', details: ['SUBTENIENTE L.P. 25773 AMADO, JORGE 1160462412 CEL: 1121725909', 'OFICIAL 1° L.P. 39465 NEIRA, FERNANDO POC: 1162425966 CEL: 1122990006'], implementationTime: undefined },
        { id: 'template-assign-ci-10', location: 'PLAZA FRAY MOCHO (CV 14-C).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN VIII "NUEVA CHICAGO".-', details: ['SUBTENIENTE L.P. 26487 PERALTA, CRISTIAN POC: 1168923376 CEL: 1135816857', 'OFICIAL 1° L.P. 24564 ESCOBAR, ADRIAN POC: 1126111812 CEL: 1160579379'], implementationTime: undefined },
        { id: 'template-assign-ci-11', location: 'PARQUE SAAVEDRA (CV 12-A).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN IX "VERSAILLES".-', details: ['INSPECTOR LP 25951 SANCHEZ, JULIO POC: 1122713706', 'OFICIAL L.P.25263 VILLEGAS, MARIANO POC: 1138929429'], implementationTime: undefined },
        { id: 'template-assign-ci-12', location: 'PLAZA REPÚBLICA DE HAITÍ (CV 14-C)', time: '14:00 a 20:00 Hs', personnel: 'ESTACIÓN II "PATRICIOS".-', details: ['SUBTENIENTE L.P. 26093 VIVAS, PABLO POC: 1128407945 CEL: 1161617680', 'OFICIAL L.P. 26727 AGUIRRE, GONZALO POC: 1128175490 CEL: 1141850268'], implementationTime: undefined },
        { id: 'template-assign-ci-13', location: 'PLAZA INTENDENTE SEEBER (CV 14-C)', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN II "PATRICIOS".-', details: ['OFICIAL 1° L.P.39323 CANDIA, ESTEBAN POC: 1167016556 CEL: 1161629078', 'OFICIAL L.P. 39111 RAMIREZ, FEDERICO POC: 1136327022 CEL: 1144131402'], implementationTime: undefined },
        { id: 'template-assign-ci-14', location: 'PARQUE EL ROSEDAL (CV 14-C)', time: '14:00 a 20:00 Hs.', personnel: 'ESTACION III "BARRACAS".-', details: [], implementationTime: undefined },
        { id: 'template-assign-ci-15', location: 'PLAZA SICILIA (CV 14-C)', time: '14:00 a 20:00 Hs.', personnel: 'ESTACION III "BARRACAS".-', details: ['SUBTENIENTE L.P. 39164 CASTILLO, MATIAS POC: 1134479876 CEL: 1126316922', 'OFICIAL 1° L.P. 24412 BORDIOLA, GERMAN POC: 1145283589 CEL: 1165512574'], implementationTime: undefined },
        { id: 'template-assign-ci-16', location: 'PLAZA FLORENCIO SÁNCHEZ (CV 14-C).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACION III "BARRACAS".-', details: ['SUBTENIENTE L.P. 39033 CORDONE, MYRIAN POC: 1130997952 CEL: 1159629694', 'SUBTENIENTE L.P. 39009 RAMIREZ, RICARDO POC: 1135699287 CEL: 1150465906'], implementationTime: undefined },
        { id: 'template-assign-ci-17', location: 'PLAZA REPÚBLICA DEL PERÚ (CV 14-C).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN X "LUGANO".-', details: ['OFICIAL 1° L.P. 24950 MOLTENI, MATIAS POC: 1157569492 CEL: 1141408778', 'OFICIAL L.P. 39149 SETTICERZE, MARIO ORLANDO POC: 1168925302 CEL: 1161292482'], implementationTime: undefined },
        { id: 'template-assign-ci-18', location: 'CARTEL BA VERDE (CV 1-B).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN IV "RECOLETA".-', details: ['OF. MAYOR L.P. 24314 CARRIZO, GERMAN POC: 1161924055', 'OFICIAL L.P. 25986 BELIZAN, SERGIO POC: 1122755903'], implementationTime: undefined },
        { id: 'template-assign-ci-19', location: 'PLAZA REPÚBLICA ÁRABE DE EGIPTO (CV 14-C).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN V "CMTE. GRAL. A. G. VAZQUEZ".-', details: ['INSPECTOR L.P. 24000 IRALA, PABLO POC: 115497 7160', 'OFIACIAL 1° L.P. 39234 FAVA, LEANDRO POC: 1136157246'], implementationTime: undefined },
        { id: 'template-assign-ci-20', location: 'PARQUE MUJERES ARGENTINAS (CV 1-E).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN V "CMTE. GRAL. A. G. VAZQUEZ".-', details: ['OFICIAL 1° L.P.2645 SAAVEDRA, MATIAS POC: 1130858750', 'OFICIAL 1° 39142 CHAPARRO, JUAN PABLO POC: 1131260943'], implementationTime: undefined },
        { id: 'template-assign-ci-21', location: 'PARQUE THAYS (CV 2-A).-', time: '14:00 a 20:00 Hs', personnel: 'ESTACIÓN VI "COMISARIO MAYOR M. C. FIRMA PAZ".-', details: ['OFICIAL LP. 39468 FARIAS, ADRIAN POC: 1140224692', 'OF. MAYOR LP. 24321 ANTON, LEONEL POC: 1149402226'], implementationTime: undefined },
        { id: 'template-assign-ci-22', location: 'PLAZA JUAN FACUNDO QUIROGA (CV 14-C).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACION VII "FLORES".-', details: ['INSPECTOR L.P. 25745 MANSILLA POC:1171664317 CEL: 1132759035', 'OFICIAL 1° L.P. 25118 ARELLO, ELIZABETH POC: 1137606078 CEL: 1165181649'], implementationTime: undefined },
        { id: 'template-assign-ci-23', location: 'PLAZA REPÚBLICA DEL ECUADOR (CV 14-C).-', time: '12:00 a 18:00 Hs.', personnel: 'ESTACIÓN VIII "NUEVA CHICAGO".-', details: ['INSPECTOR L.P. 24499 GARCIA, GUSTAVO POC: 1160551691 CEL: 1168680946', 'OFICIAL 1° L.P.26337 FIGUEREDO, NATALIA POC: 1168053303 CEL: 1130441520'], implementationTime: undefined },
        { id: 'template-assign-ci-24', location: 'PARQUE CARANCHO (CV 14-C).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN VIII "NUEVA CHICAGO".-', details: ['OF. MAYOR L.P. 39056 MORALES, LUCAS POC: 1140356654 CEL: 11226225008', 'OFICIAL L.P. 24567 RIOS, IVANA POC: 1149371516 CEL: 1160342747'], implementationTime: undefined },
        { id: 'template-assign-ci-25', location: 'PLAZA SAN MARTÍN CABA (CV 1-A).-', time: '14:00 a 20:00 Hs.', personnel: 'ESTACIÓN IX "VERSAILLES".-', details: ['OF. 1° L.P. 24045 ROMANO, WALTER POC: 1170170634', 'OFICIAL L.P.24892 MONTEROS, SERGIO POC: 1171663723'], implementationTime: undefined },
        { id: 'template-assign-ci-26', location: 'PARQUE REPÚBLICA ORIENTAL DEL URUGUAY (CV 2-A).-', time: '14:00 a 20:00. Hs.-', personnel: 'ESTACIÓN IX "VERSAILLES".-', details: ['OF. MAYOR L.P. 26765 ROMERO, JONATHAN POC:1161043565', 'OFICIAL L.P. 39280 FERNANDEZ, FACUNDO POC: 1131895830'], implementationTime: undefined },
    ]
  },
  {
    templateId: 'template-imagen-presencia-1',
    id: 'template-imagen-presencia-1',
    title: 'IMAGEN Y PRESENCIA INSTITUCIONAL',
    description: '03 - O.S 4014/2025',
    novelty: 'Presencia Institucional, cada QTH deberá sercubierto por personal del Cuerpo de Bomberos acorde a cronograma, sin equipoestructural, Uniforme de Instrucción Completo, campera rompe viento azul y boina,POC asignado el cual deberá figurar "EN SERVICIO", equipo de comunicación enfrecuencia convencional.-',
    isHidden: false,
    assignments: [
      { id: 'template-assign-ip-1', location: 'UNIDAD RANGER 2125: Con chofer y combatiente Compañía ZONA I.- QTH: AV FIGUEROA ALCORTA 2600 (FLORALIS GENERICA) - CV2A', time: '07:00 a 12:00 Hs.', personnel: 'De Estación III "BARRACAS".-', details: ['Bro. Sup. 29.555 ARTAZA, Evelin.'] },
      { id: 'template-assign-ip-2', location: 'UNIDAD RANGER 2129: Con chofer y combatiente Compañía ZONA III.- QTH: INT. BUNGE Y ANDRES BELLO (LAGO REGATAS) - CV14C', time: '07:00 a 12:00 Hs.', personnel: 'ESTACIÓN: VIII NUEVA CHICAGO.-', details: ['BRO. SUP. L.P. 39392 CABALLERO JESICA POC: 1139172601 CEL: 1134869752', 'BRO. CALIF. L.P. 36.879 OSMAN SEBASTIAN POC: 1133886470 CEL: 1139247739'] },
      { id: 'template-assign-ip-3', location: 'PERSONAL DE INFANTERIA : 04.- QTH: AV FIGUEROA ALCORTA 2600 (FLORALIS GENERICA) - CV2A', time: '07:00 a 12:00 Hs.', personnel: 'De Estación III "BARRACAS".-', details: ['Bombero Calificado Paula VEGA 58.876 11-3000-5621 11-3012-1430', 'Bombero Calificado Matias MOLINAS 58.827 11-6505-1417 11-3096-2818', 'Bombero Calificado Candela LOPEZ 58807 11-6243-1452 11-5804-7477', 'Bombero Calificado Mercedes CORTES 36.799 11-3388-3976 11-3015-4233'] },
      { id: 'template-assign-ip-4', location: 'PERSONAL DE INFANTERIA: 04.- QTH: INT. BUNGE Y ANDRES BELLO (LAGO REGATAS) - CV14C', time: '07:00 a 12:00 Hs.', personnel: 'DeEstación VIII "NUEVA CHICAGO".-', details: ['BRO. CALIF L.P. 36916 SOSA MELISA POC: 1133887588 CEL: 1133887588', 'BRO. CALIF L.P. 58741 BELLO MAGALI POC: 1133849907 CEL: 1124624143', 'BRO. CALIF L.P. 58747 BOCANEGRA ALEJO POC: NO POSEE CEL: 1123916035', 'BRO. CALIF L.P. 58849 PUCHETA NICOLAS POC: 1124624143 CEL: 1138678805'] },
    ]
  },
  {
      templateId: 'template-feria-francesa-1',
      id: 'template-feria-francesa-1',
      title: 'EVENTO "FERIA FRANCESA"',
      description: '04',
      novelty: 'MISION:Previo al inicio del evento realizar recorridas con fines preventivos, identificando los sectores de riesgo. Un Bombero se hallará próximo al escenario con extintor en apresto y el Bombero restante realizará rondines permanentes en el sector del evento.-',
      isHidden: false,
      assignments: [{
          id: 'template-assign-ff-1',
          location: 'Av. Del Libertador n°1400.-',
          time: '11:00 a 18:30 Hs.',
          implementationTime: '10:30 Hs.',
          personnel: 'DOS (02) Bomberos De Estación IV "RECOLETA", con elementos de protección personal, equipos de comunicación, DOS (02) extintores portátiles y teléfono poc asignado.-',
          details: ['BRO. CALIF. L.P. 36830 GONZALEZ ORNELLA POC: 1133385115 CEL: 1157516313', 'BRO. CALIF. L.P. 58751 CABRERA DAVID POC: 1164660989 CEL: 1122755103']
      }]
  },
  {
      templateId: 'template-futbol-river-platense-1',
      id: 'template-futbol-river-platense-1',
      title: 'ENCUENTRO FUTBOLÍSTICO "RIVER PLATE VS. PLATENSE"',
      description: '01-O.S.4545',
      isHidden: false,
      assignments: [{
          id: 'template-assign-fut-1',
          location: 'Estadio Mas Monumental (Av. Pres. Figueroa Alcorta 7597).-',
          time: '21:00 Hs. a terminar.-',
          implementationTime: '16:00 Hs.',
          personnel: '01(UN) Comando de Dotación y 08 (OCHO) Bomberos de ESTACIÓN V "CMTE. GRAL. A. G. VAZQUEZ" con elementosde protección personal, HT y poc asignado.-',
          details: [ 'A/C Teniente L.P. 24.865 BURQUET Víctor POC: 11-6752-4590', 'Bombero Superior L.P. 16.927 RODRIGUEZ Alan.', 'Bombero Superior L.P. 39.141 JOSE MARQUEZ, David.', 'Bombero Superior L.P. 25.195 LIBERDI Maximiliano', 'Bombero Calificado L.P. 56.829 GIMENEZ Matías.', 'Bombero Calificado L.P. 36.842 JANCZAK Federico', 'Bombero Calificado L.P. 36.834 GUESSI VARELA Rubén', 'Bombero Calificado L.P. 58.881 YOUNG PALACIO, Agustín.', 'Bombero Calificado L.P. 58.785 GOMEZ, Nicolas Raúl Alejandro.' ]
      }]
  },
  {
      templateId: 'template-futbol-arg-boca-1',
      id: 'template-futbol-arg-boca-1',
      title: 'ENCUENTRO FUTBOLÍSTICO "ARGENTINOS JUNIORS VS. BOCA JUNIORS"',
      description: '02-O.S.4548',
      isHidden: false,
      assignments: [{
          id: 'template-assign-fut-2',
          location: 'Estadio Diego Armando Maradona (Av. Boyacá 2150).-',
          time: '18:45 Hs. a terminar.-',
          implementationTime: '14:00 Hs.',
          personnel: '01(UN) Comando de Dotación y 03 (TRES) Bomberos de ESTACIÓN XI "ALBARIÑO" con elementosde protección personal, HT y poc asignado.-',
          details: [ 'A/C Teniente L.P 24.076 DOTTA, Gustavo / D.N.I N° 24.724.039 / N° DE POC : 11-5336-5471', 'Teniente L.P. 25.354 MAMANI Ariel / D.N.I. N.o 31.163.138 / N.o de POC: 11-2292-1952', 'Subtte L.P. 25.203 SOTO, Maximiliano / D.N.I No 33.955.433 / Ν.0 DE POC:11-5747-3036', 'Bro. Calif L.P 58.778 FRANCO Brian / D.N.I No 40.491.123 / N.0 DE POC:11-2558-4775' ]
      }]
  },
];
