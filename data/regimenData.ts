import { RegimenData } from '../types';

export const regimenData: RegimenData = {
  title: "RÉGIMEN DE INTERVENCIÓN",
  lastUpdated: "2024-09-18",
  sections: [
    {
      id: "definicion",
      title: "1. DEFINICIÓN RÉGIMEN DE INTERVENCIÓN",
      content: [
        {
          type: "text",
          content: "Es el conjunto de normas, disposiciones y procedimientos del Cuerpo de Bomberos de la Ciudad destinado a la atención de las emergencias con el fin de ordenar y optimizar el capital humano material y flota automotor; para lo cual se establece un tren de socorro primario que se encuentra sujeto a la disponibilidad del parque automotor del Cuerpo de Bomberos. En el caso de no poder cumplimentar lo exigido por el presente régimen de intervención, el jefe de servicio de Comando Operativo de Bomberos debe replantear el tren de socorro con los recursos disponibles."
        }
      ]
    },
    {
      id: "objetivo",
      title: "2. OBJETIVO",
      content: [
        {
          type: "text",
          content: "Establecer los lineamientos de actuación para la conformación de la logística y desplazamiento primario de la flota automotor, los recursos materiales y el capital humano disponible para la defensa, prevención, protección y resguardo de la vida de las personas y bienes en forma preventiva y activa en caso de incendios, derrumbes, inundaciones, siniestros, emergencias y otros estragos."
        }
      ]
    },
    {
        id: "modulaciones-codigos",
        title: "MODULACIONES: CÓDIGOS",
        content: [
            {
                type: "subtitle",
                content: "El código de DELETREO (fonético policial):"
            },
            {
                type: 'table',
                headers: ['LETRA', 'CODIFICACIÓN'],
                rows: [
                    { id: 'a', LETRA: 'A', CODIFICACIÓN: 'Alicia' },
                    { id: 'b', LETRA: 'B', CODIFICACIÓN: 'Beatriz' },
                    { id: 'c', LETRA: 'C', CODIFICACIÓN: 'Carolina' },
                    { id: 'd', LETRA: 'D', CODIFICACIÓN: 'Dorotea' },
                    { id: 'e', LETRA: 'E', CODIFICACIÓN: 'Eva' },
                    { id: 'f', LETRA: 'F', CODIFICACIÓN: 'Francisca' },
                    { id: 'g', LETRA: 'G', CODIFICACIÓN: 'Guillermina' },
                    { id: 'h', LETRA: 'H', CODIFICACIÓN: 'Hombre' },
                    { id: 'i', LETRA: 'I', CODIFICACIÓN: 'Inés' },
                    { id: 'j', LETRA: 'J', CODIFICACIÓN: 'Julia' },
                    { id: 'k', LETRA: 'K', CODIFICACIÓN: 'Kilo' },
                    { id: 'l', LETRA: 'L', CODIFICACIÓN: 'Lucia' },
                    { id: 'm', LETRA: 'M', CODIFICACIÓN: 'María' },
                    { id: 'n', LETRA: 'N', CODIFICACIÓN: 'Natalia' },
                    { id: 'n2', LETRA: 'Ñ', CODIFICACIÓN: 'Nandú' },
                    { id: 'o', LETRA: 'O', CODIFICACIÓN: 'Ofelia' },
                    { id: 'p', LETRA: 'P', CODIFICACIÓN: 'Petrona' },
                    { id: 'q', LETRA: 'Q', CODIFICACIÓN: 'Quintana' },
                    { id: 'r', LETRA: 'R', CODIFICACIÓN: 'Rosa' },
                    { id: 's', LETRA: 'S', CODIFICACIÓN: 'Sara' },
                    { id: 't', LETRA: 'T', CODIFICACIÓN: 'Teresa' },
                    { id: 'u', LETRA: 'U', CODIFICACIÓN: 'Úrsula' },
                    { id: 'v', LETRA: 'V', CODIFICACIÓN: 'Venezuela' },
                    { id: 'w', LETRA: 'W', CODIFICACIÓN: 'Washington' },
                    { id: 'x', LETRA: 'X', CODIFICACIÓN: 'Xilofón' },
                    { id: 'y', LETRA: 'Y', CODIFICACIÓN: 'Yolanda' },
                    { id: 'z', LETRA: 'Z', CODIFICACIÓN: 'Zapato' }
                ]
            },
            {
                type: "subtitle",
                content: "El código “Q” (más utilizados)"
            },
            {
                type: 'table',
                headers: ['CÓDIGO', 'PREGUNTA'],
                rows: [
                    { id: 'qsl', CÓDIGO: 'QSL', PREGUNTA: 'CONFORME -recibido-' },
                    { id: 'qrv', CÓDIGO: 'QRV', PREGUNTA: 'ATENTO -en escucha-' },
                    { id: 'qrx', CÓDIGO: 'QRX', PREGUNTA: 'ESPERE -un instante-' },
                    { id: 'qth', CÓDIGO: 'QTH', PREGUNTA: 'LUGAR -indique lugar-' },
                    { id: 'qso', CÓDIGO: 'QSO', PREGUNTA: 'LLAMAR -comuníquese con...-' },
                    { id: 'qtc', CÓDIGO: 'QTC', PREGUNTA: 'MENSAJE -module su requerimiento-' },
                    { id: 'qrm', CÓDIGO: 'QRM', PREGUNTA: 'MALA SEÑAL - interferencia-' },
                    { id: 'qrk', CÓDIGO: 'QRK', PREGUNTA: 'CLARIDAD DE SEÑAL 1/5' },
                    { id: 'qsa', CÓDIGO: 'QSA', PREGUNTA: 'POTENCIA DE SEÑAL 1/5' },
                    { id: 'qrt', CÓDIGO: 'QRT', PREGUNTA: 'DEJA DE TRANSMITIR – Fuera de Servicio' }
                ]
            }
        ]
    },
    {
      id: "salvamentos",
      title: "1. SALVAMENTOS",
      content: [
        {
          type: "table",
          headers: ["", "DESCRIPCIÓN", "1º Dot", "2º Dot", "U. Esc", "Cist.", "G.E.R.", "E.B.E.E.", "U.Liv.", "UAR", "PCM", "U.M.", "Usina", "JEFE", "K9"],
          rows: [
            { id: "s1", "DESCRIPCIÓN": "DE ANIMAL", "1º Dot": "", "2º Dot": "1", "U. Esc": "PS", "Cist.": "PS", "G.E.R.": "", "E.B.E.E.": "PS", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s2", "DESCRIPCIÓN": "DE PERSONA EN AGUA", "1º Dot": "3", "2º Dot": "", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "OP", "U.M.": "1", "Usina": "", "JEFE": "X", "K9": "" },
            { id: "s3", "DESCRIPCIÓN": "PERSONA CAÍDA DE ALTURA", "1º Dot": "3", "2º Dot": "", "U. Esc": "OP", "Cist.": "OP", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s4", "DESCRIPCIÓN": "EN VÍAS Y VIADUCTO X PERSONA ARROLLADA", "1º Dot": "3", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s5", "DESCRIPCIÓN": "SALVAMENTO X COLISIÓN FERROVIARIA - DESCARRILAMIENTO", "1º Dot": "3", "2º Dot": "2", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "1", "U.M.": "1", "Usina": "", "JEFE": "X", "K9": "" },
            { id: "s6", "DESCRIPCIÓN": "SALVAMENTO X COLISIÓN VEHICULAR", "1º Dot": "3", "2º Dot": "OP", "U. Esc": "", "Cist.": "OP", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s7", "DESCRIPCIÓN": "SALVAMENTO X DERRUMBE", "1º Dot": "3", "2º Dot": "OPr", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "1", "PCM": "1", "U.M.": "", "JEFE": "X", "K9": "1" },
            { id: "s8", "DESCRIPCIÓN": "SALVAMENTO x EXPLOSIÓN", "1º Dot": "3", "2º Dot": "OPr", "U. Esc": "OPr", "Cist.": "1", "G.E.R.": "3", "E.B.E.E.": "OP", "U.Liv.": "OP", "UAR": "1", "PCM": "1", "U.M.": "", "JEFE": "X", "K9": "1" },
            { id: "s9", "DESCRIPCIÓN": "SALVAMENTO POR ELECTROCUCIÓN", "1º Dot": "3", "2º Dot": "PS", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s10", "DESCRIPCIÓN": "SALVAMENTO EN ALTURA", "1º Dot": "3", "2º Dot": "1", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s11", "DESCRIPCIÓN": "SALVAMENTO DE SUICIDA", "1º Dot": "3", "2º Dot": "1", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s12", "DESCRIPCIÓN": "SALVAMENTO POR MATERIALES PELIGROSOS (QBRN)", "1º Dot": "3", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "2", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "OP", "PCM": "1", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s13", "DESCRIPCIÓN": "SALVAMENTO EN ESPACIO CONFINADO", "1º Dot": "3", "2º Dot": "", "U. Esc": "", "Cist.": "3", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "X", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" }
          ],
           notes: [
                "El Nro. (1-2 o 3) Determina el Código y la Unidad que debe concurrir. Existen Tres Códigos de Desplazamiento y pueden figurar 2 (DOS) en la misma unidad, significando en ese caso, que el C.O.B. determinará el código que corresponda de acuerdo a la salida/pedido/horario.",
                "Op.: Este ítem se utiliza para las unidades que pueden concurrir en el Tren de Socorro, quedando su desplazamiento a criterio del C.O.B.",
                "PS: Posible Sustituto, significando que concurre la unidad que figura en el Régimen con el Nro. de Desplazamiento, pudiendo ser sustituida por la que tenga la sigla PS de acuerdo a la salida/pedido/horario o lo determinado por el C.O.B./Sala de Alarma de la Estación.",
                "Cuando hubiera Personas atrapadas, el Código de Desplazamiento se eleva a 3 (TRES)."
            ]
        }
      ]
    }
  ]
};