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
            { id: "s1", "": "1", "DESCRIPCIÓN": "DE ANIMAL", "1º Dot": "", "2º Dot": "1", "U. Esc": "PS", "Cist.": "PS", "G.E.R.": "", "E.B.E.E.": "PS", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s2", "": "2", "DESCRIPCIÓN": "DE PERSONA EN AGUA", "1º Dot": "3", "2º Dot": "", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "OP", "U.M.": "1", "Usina": "", "JEFE": "X", "K9": "" },
            { id: "s3", "": "3", "DESCRIPCIÓN": "PERSONA CAÍDA DE ALTURA", "1º Dot": "3", "2º Dot": "", "U. Esc": "OP", "Cist.": "OP", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s4", "": "4", "DESCRIPCIÓN": "EN VÍAS Y VIADUCTO X PERSONA ARROLLADA", "1º Dot": "3", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s5", "": "5", "DESCRIPCIÓN": "SALVAMENTO X COLISIÓN FERROVIARIA - DESCARRILAMIENTO", "1º Dot": "3", "2º Dot": "2", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "1", "PCM": "1", "U.M.": "", "JEFE": "X", "K9": "" },
            { id: "s6", "": "6", "DESCRIPCIÓN": "SALVAMENTO X COLISIÓN VEHICULAR", "1º Dot": "3", "2º Dot": "OP", "U. Esc": "", "Cist.": "OP", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" },
            { id: "s7", "": "7", "DESCRIPCIÓN": "SALVAMENTO X DERRUMBE", "1º Dot": "3", "2º Dot": "OPr", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "1", "PCM": "1", "U.M.": "", "JEFE": "X", "K9": "1" },
            { id: "s8", "": "8", "DESCRIPCIÓN": "SALVAMENTO x EXPLOSIÓN", "1º Dot": "3", "2º Dot": "OPr", "U. Esc": "OPr", "Cist.": "1", "G.E.R.": "3", "E.B.E.E.": "OP", "U.Liv.": "OP", "UAR": "1", "PCM": "1", "U.M.": "", "JEFE": "X", "K9": "1" },
            { id: "s9", "": "9", "DESCRIPCIÓN": "SALVAMENTO POR ELECTROCUCIÓN", "1º Dot": "3", "2º Dot": "PS", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s10", "": "10", "DESCRIPCIÓN": "SALVAMENTO EN ALTURA", "1º Dot": "3", "2º Dot": "1", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s11", "": "11", "DESCRIPCIÓN": "SALVAMENTO DE SUICIDA", "1º Dot": "3", "2º Dot": "1", "U. Esc": "", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s12", "": "12", "DESCRIPCIÓN": "SALVAMENTO POR MATERIALES PELIGROSOS (QBRN)", "1º Dot": "3", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "2", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "OP", "PCM": "1", "U.M.": "", "Usina": "X", "JEFE": "", "K9": "" },
            { id: "s13", "": "13", "DESCRIPCIÓN": "SALVAMENTO EN ESPACIO CONFINADO", "1º Dot": "3", "2º Dot": "", "U. Esc": "", "Cist.": "3", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "X", "PCM": "", "U.M.": "", "Usina": "", "JEFE": "", "K9": "" }
          ],
           notes: [
                "El Nro. (1-2 o 3) Determina el Código y la Unidad que debe concurrir. Existen Tres Códigos de Desplazamiento y pueden figurar 2 (DOS) en la misma unidad, significando en ese caso, que el C.O.B. determinará el código que corresponda de acuerdo a la salida/pedido/horario.",
                "Op.: Este ítem se utiliza para las unidades que pueden concurrir en el Tren de Socorro, quedando su desplazamiento a criterio del C.O.B.",
                "PS: Posible Sustituto, significando que concurre la unidad que figura en el Régimen con el Nro. de Desplazamiento, pudiendo ser sustituida por la que tenga la sigla PS de acuerdo a la salida/pedido/horario o lo determinado por el C.O.B./Sala de Alarma de la Estación.",
                "Cuando hubiera Personas atrapadas, el Código de Desplazamiento se eleva a 3 (TRES)."
            ]
        }
      ]
    },
     {
      id: "incendios",
      title: "2. INCENDIOS",
      content: [
          {
              type: "subtitle",
              content: "2.1 INCENDIOS ESTRUCTURALES"
          },
          {
              type: "table",
              headers: ["Categoría", "Tipo", "Subtipo", "1º Dot", "2º Dot", "U. Esc", "Cist.", "G.E.R.", "E.B.E.E.", "U.Liv.", "UAR", "PCM", "UM", "Usina", "JEFE"],
              rows: [
                  { id: "i1", "Categoría": "HABITACIONALES", "Tipo": "Casa Deptos./ Casa Oficina de más de 2 Pisos", "Subtipo": "", "1º Dot": "2", "2º Dot": "1", "U. Esc": "1", "Cist.": "2", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "1", "UM": "1", "Usina": "", "JEFE": "X" },
                  { id: "i2", "Categoría": "HABITACIONALES", "Tipo": "Casa Deptos./ Casa Oficina de más de 2 Pisos", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "1", "U. Esc": "1", "Cist.": "3", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "1", "PCM": "1", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i3", "Categoría": "HABITACIONALES", "Tipo": "Casa Flia./ PH/ Casa Deptos y Casilla de hasta 2 Pisos", "Subtipo": "", "1º Dot": "2", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i4", "Categoría": "HABITACIONALES", "Tipo": "Casa Flia./ PH/ Casa Deptos y Casilla de hasta 2 Pisos", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "", "U. Esc": "1", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i5", "Categoría": "HABITACIONALES", "Tipo": "Barrio de Emergencia / Conventillo / Casa de Inquilinato", "Subtipo": "", "1º Dot": "2", "2º Dot": "OP", "U. Esc": "1", "Cist.": "OP", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i6", "Categoría": "HABITACIONALES", "Tipo": "Barrio de Emergencia / Conventillo / Casa de Inquilinato", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "1", "U. Esc": "1", "Cist.": "1", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i7", "Categoría": "HABITACIONALES", "Tipo": "Hotel", "Subtipo": "", "1º Dot": "2", "2º Dot": "2", "U. Esc": "1", "Cist.": "1", "G.E.R.": "2", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "OP", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i8", "Categoría": "HABITACIONALES", "Tipo": "Hotel", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "2", "U. Esc": "1", "Cist.": "1", "G.E.R.": "3", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "1", "PCM": "1", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i9", "Categoría": "COMERCIALES", "Tipo": "Fábrica/Industria/Baulera/Depósito", "Subtipo": "", "1º Dot": "2", "2º Dot": "OP", "U. Esc": "OP", "Cist.": "1", "G.E.R.": "", "E.B.E.E.": "OP", "U.Liv.": "OP", "UAR": "OP", "PCM": "OP", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i10", "Categoría": "COMERCIALES", "Tipo": "Fábrica/Industria/Baulera/Depósito", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "1", "U. Esc": "1", "Cist.": "1", "G.E.R.": "", "E.B.E.E.": "OP", "U.Liv.": "1", "UAR": "1", "PCM": "1", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i11", "Categoría": "COMERCIALES", "Tipo": "Shopping/Supermercado/Hipermercado/Centro y Galería Comercial", "Subtipo": "", "1º Dot": "2", "2º Dot": "", "U. Esc": "", "Cist.": "1", "G.E.R.": "2", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "1", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i12", "Categoría": "COMERCIALES", "Tipo": "Shopping/Supermercado/Hipermercado/Centro y Galería Comercial", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "OP", "U. Esc": "OP", "Cist.": "1", "G.E.R.": "3", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "1", "PCM": "1", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i13", "Categoría": "COMERCIALES", "Tipo": "Negocio", "Subtipo": "", "1º Dot": "2", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i14", "Categoría": "COMERCIALES", "Tipo": "Negocio", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "", "U. Esc": "1", "Cist.": "", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i15", "Categoría": "EDIFICIO", "Tipo": "Estación de Servicio", "Subtipo": "", "1º Dot": "2", "2º Dot": "OP", "U. Esc": "1", "Cist.": "", "G.E.R.": "OP", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i16", "Categoría": "EDIFICIO", "Tipo": "Entidad Bancaria", "Subtipo": "", "1º Dot": "2", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i17", "Categoría": "EDIFICIO", "Tipo": "Garaje / Playa Estacionamiento", "Subtipo": "", "1º Dot": "2", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                  { id: "i18", "Categoría": "EDIFICIO", "Tipo": "Edificio Público y Embajadas", "Subtipo": "", "1º Dot": "2", "2º Dot": "OP", "U. Esc": "OP", "Cist.": "OP", "G.E.R.": "2", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "OP", "PCM": "OP", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i19", "Categoría": "PÚBLICO y EMBAJADAS", "Tipo": "Edificio Público y Embajadas", "Subtipo": "Idem con personas atrapadas", "1º Dot": "3", "2º Dot": "1", "U. Esc": "1", "Cist.": "1", "G.E.R.": "3", "E.B.E.E.": "", "U.Liv.": "1", "UAR": "1", "PCM": "1", "UM": "", "Usina": "", "JEFE": "X" },
                  { id: "i20", "Categoría": "PÚBLICO y EMBAJADAS", "Tipo": "Unidad carcelaria / Instituto de menores", "Subtipo": "", "1º Dot": "2", "2º Dot": "2", "U. Esc": "OP", "Cist.": "1", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "OP", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "X" }
              ]
          },
           {
              type: "subtitle",
              content: "2.2 INCENDIOS EN VÍA PÚBLICA"
          },
          {
              type: "table",
              headers: ["Descripción", "1º Dot", "2º Dot", "U. Esc", "Cist.", "G.E.R.", "B.E.E.", "U.Liv.", "UAR", "PCM", "Usina", "JEFE"],
              rows: [
                  { id: "vp1", "Descripción": "Vehículo/Motovehículo", "1º Dot": "PS", "2º Dot": "2", "U. Esc": "", "Cist.": "", "G.E.R.": "", "B.E.E.": "", "U.Liv.": "PS", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" },
                  { id: "vp2", "Descripción": "Embarcación", "1º Dot": "2", "2º Dot": "", "U. Esc": "", "Cist.": "OP", "G.E.R.": "", "B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" },
                  { id: "vp3", "Descripción": "Árbol/Residuos/Cont. Residuos/Volquete/Pastos/Terreno Baldío", "1º Dot": "", "2º Dot": "1", "U. Esc": "", "Cist.": "PS", "G.E.R.": "", "B.E.E.": "", "U.Liv.": "PS", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" },
                  { id: "vp4", "Descripción": "Puesto Vía Pública", "1º Dot": "PS", "2º Dot": "2", "U. Esc": "", "Cist.": "", "G.E.R.": "", "B.E.E.": "", "U.Liv.": "PS", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" },
                  { id: "vp5", "Descripción": "Toma Domic./Buzón/Caja Esq./Poste Alumb./Semáforo/Cartel/Cableado", "1º Dot": "PS", "2º Dot": "2", "U. Esc": "", "Cist.": "", "G.E.R.": "", "B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" },
                  { id: "vp6", "Descripción": "Transporte de Pasajeros (colectivo – micros)", "1º Dot": "2", "2º Dot": "", "U. Esc": "", "Cist.": "1", "G.E.R.": "", "B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" },
                  { id: "vp7", "Descripción": "Vehículo de Carga", "1º Dot": "2", "2º Dot": "", "U. Esc": "", "Cist.": "1", "G.E.R.": "", "B.E.E.": "OP", "U.Liv.": "", "UAR": "", "PCM": "", "Usina": "", "JEFE": "" }
              ]
          }
      ]
    },
    {
        id: "otros-trabajos",
        title: "3. OTROS TRABAJOS",
        content: [
            {
                type: "table",
                headers: ["Descripción", "1º Dot", "2º Dot", "U. Esc", "Cist.", "G.E.R.", "E.B.E.E.", "U.Liv.", "UAR", "PCM", "UM", "Usina", "JEFE"],
                rows: [
                    { id: "ot1", "Descripción": "Apoyo Escuadrón Antibombas", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot2", "Descripción": "Ascensor Detenido", "1º Dot": "PS", "2º Dot": "2", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot3", "Descripción": "Derrame/Escape de Producto Químico", "1º Dot": "2", "2º Dot": "", "U. Esc": "OP", "Cist.": "", "G.E.R.": "2", "E.B.E.E.": "", "U.Liv.": "", "UAR": "1", "PCM": "1", "UM": "1", "Usina": "", "JEFE": "" },
                    { id: "ot4", "Descripción": "Arreglo de Driza", "1º Dot": "1", "2º Dot": "", "U. Esc": "PS", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "PS", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot5", "Descripción": "Escape de Gas en Vía Pública (Sala de medidores)", "1º Dot": "PS", "2º Dot": "2", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot6", "Descripción": "Rastreo de Arma/Cuerpo/Elemento", "1º Dot": "", "2º Dot": "", "U. Esc": "", "Cist.": "1", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot7", "Descripción": "Establecer Medidas de Seguridad", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot8", "Descripción": "Extracción de Cadáver/Retiro de cadáver", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "", "Cist.": "OP", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot9", "Descripción": "Franqueo de Acceso", "1º Dot": "1", "2º Dot": "", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot10", "Descripción": "Inertización de Combustible", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "PS", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "PS", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot11", "Descripción": "Llenado de Tanque/Aprovisionamiento de Agua", "1º Dot": "", "2º Dot": "", "U. Esc": "1", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot12", "Descripción": "Suministro Energético", "1º Dot": "", "2º Dot": "", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "1", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "OP", "JEFE": "" },
                    { id: "ot13", "Descripción": "Prevención Descenso Helicóptero", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot14", "Descripción": "Colaboración con Ambulancia S.A.M.E./P.A.M.I./Privada", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot15", "Descripción": "Colaboración con Personal Policial y FF.SS.", "1º Dot": "PS", "2º Dot": "1", "U. Esc": "", "Cist.": "", "G.E.R.": "", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" },
                    { id: "ot16", "Descripción": "Mediciones y Descontaminación", "1º Dot": "OP", "2º Dot": "", "U. Esc": "", "Cist.": "", "G.E.R.": "1", "E.B.E.E.": "", "U.Liv.": "", "UAR": "", "PCM": "", "UM": "", "Usina": "", "JEFE": "" }
                ]
            }
        ]
    },
    {
        id: "alerta-aeropuertos",
        title: "ALERTA AEROPUERTOS",
        content: [
            { type: 'subtitle', content: 'CUARTEL "EZEIZA"' },
            { type: 'list', items: ['ESTACIÓN X LUGANO....1ª DOTACIÓN', 'ESTACIÓN VIII NUEVA CHICAGO....CISTERNA', 'DESTACAMENTO VELEZ SARSFIELD..1ª DOTACIÓN'] },
            { type: 'subtitle', content: 'CUARTEL "AEROPARQUE”' },
            { type: 'list', items: ['ESTACIÓN V “Cmte Gral. A.G. VAZQUEZ”....1ª DOTACIÓN', 'ESTACIÓN IV RECOLETA.......CISTERNA', 'DESTACAMENTO PALERMO...1ª DOTACIÓN'] },
            { type: 'subtitle', content: 'CUARTEL "CAMPO DE MAYO"' },
            { type: 'list', items: ['ESTACIÓN IX VERSAILLES....1ª DOTACIÓN', 'DESTACAMENTO SAAVEDRA....1ª DOTACIÓN', 'DESTACAMENTO SARFIELD..1ª DOTACIÓN VELEZ'] },
            { type: 'subtitle', content: 'CUARTEL "EL PALOMAR"' },
            { type: 'list', items: ['ESTACIÓN IX VERSAILLES....1ª DOTACIÓN', 'DESTACAMENTO SAAVEDRA....1ª DOTACIÓN', 'DESTACAMENTO VELEZ SARFIELD....1ª DOTACIÓN'] },
            { type: 'subtitle', content: 'CUARTEL "SAN FERNANDO"' },
            { type: 'list', items: ['ESTACIÓN V “Cmte Gral. A.G. VAZQUEZ”....1ª DOTACIÓN', 'DESTACAMENTO VILLA DEVOTO....1ª DOTACIÓN', 'DESTACAMENTO SAAVEDRA....1ª DOTACIÓN'] },
             { type: 'subtitle', content: 'DESTACAMENTO “OLIVOS"' },
            { type: 'list', items: ['ESTACIÓN V “Cmte Gral. A.G. VAZQUEZ”....1ª DOTACIÓN', 'DESTACAMENTO SAAVEDRA....1ª DOTACIÓN'] },
             { type: 'subtitle', content: 'CUARTEL "ISLA DEMARCHI"' },
            { type: 'list', items: ['ESTACION I PUERTO MADERO.......1ª DOTACIÓN', 'ESTACIÓN III BARRACAS....CISTERNA'] },
            { type: 'text', content: 'NOTA: Simultáneamente cuando las dotaciones involucradas en la alternativa deben ser requeridas para una intervención en su jurisdicción, son reemplazadas por el C.O.B. de acuerdo a las disponibilidades operativas y siempre manteniendo el tren de socorro estipulado para cada caso en particular', style: 'italic'}
        ]
    },
    {
        id: "paseo-del-bajo",
        title: "PASEO DEL BAJO",
        content: [
            { type: 'text', content: 'El C.O.B desplaza al tren de socorro de las Dependencias involucradas para cualquier tipo de intervención.' },
            { type: 'subtitle', content: 'INGRESO A TRAZA SUR – NORTE' },
            { type: 'list', items: ['ESTACION I PUERTO MADERO....1º DOTACIÓN', 'DESTACAMENTO 9 DE JULIO....1º DOTACIÓN', 'Ε.Β.Ε.Ε.....B1 Y B2', 'G.E.R. CABALLITO....1º DOTACIÓN', 'P.C.M.....UNIDAD DE PUESTO COMANDO', 'U.M.....1 AMBULANCIA'] },
            { type: 'subtitle', content: 'INGRESO A TRAZA NORTE – SUR' },
            { type: 'list', items: ['ESTACION 4 "RECOLETA"....1º DOTACIÓN', 'DESTACAMENTO "RETIRO"....1º DOTACIÓN', 'Ε.Β.Ε.Ε.....B1 Y B2', 'G.E.R. CABALLITO....1º DOTACIÓN', 'P.C.M.....UNIDAD DE PUESTO COMANDO', 'U.M.....1 AMBULANCIA'] },
            { type: 'text', content: 'NOTA: Las respectivas Estaciones pondrán en apresto la Unidad Cisterna si así lo indicare el C.O.B.- El G.E.R., 1° dotación del Destacamento 9 de Julio; P.C.M y U.M. concurren para operar por la arteria ubicada en la superficie lo más próximo al lugar de intervención.', style: 'italic'}
        ]
    },
    {
        id: "reservas-ecologicas",
        title: "RESERVAS ECOLÓGICAS",
        content: [
            { type: 'subtitle', content: '1. RESERVA ECOLÓGICA COSTANERA SUR - UBICACIÓN: Av. TRISTAN ACHAVAL RODRIGUEZ Nº 1550.'},
            { type: 'list', items: [
                'A: POR INCENDIO',
                '- ESTACIÓN I PUERTO MADERO....1ª DOTACIÓN.',
                '- ESTACIÓN III....UNIDAD CISTERNA',
                '- DESTACAMENTO BOCA....UNIDAD CONVENCIONAL',
                '- Ε.Β.Ε.Ε.....UNIDAD DE APOYO AEREO/APRESTO ESTATICO',
                '- P.C.M.....UNIDAD DE PUESTO COMANDO',
                '- DESTACAMENTO SISTEMA DE ASISTENCIA CRITICA PARA EL PERSONAL EN EMERGENCIAS....UNIDAD MEDICA',
                'B: POR BÚSQUEDA DE PERSONAS PERDIDAS EN EL PREDIO',
                '- A LAS UNIDADES CONCURRENTES SE SUMA ESTACIÓN BÚSQUEDA Y RESCATE K9'
            ]},
            { type: 'subtitle', content: '2. RESERVA ECOLÓGICA COSTANERA NORTE - UBICACIÓN: INTENDENTE GÜIRALDES Nº 2160.'},
            { type: 'list', items: [
                'A: POR INCENDIO',
                '- ESTACIÓN V “Cmte Gral A.G. VAZQUEZ”....1ª DOTACIÓN.',
                '- ESTACIÓN V “Cmte Gral A.G. VAZQUEZ”....UNIDAD CISTERNA',
                '- DESTACAMENTO SAAVEDRA....UNIDAD CONVENCIONAL',
                '- Ε.Β.Ε.Ε.....UNIDAD DE APOYO AÉREO/APRESTO ESTATICO',
                '- P.C.M.....UNIDAD DE PUESTO COMANDO',
                '- DESTACAMENTO SISTEMA DE ASISTENCIA CRÍTICA PARA EL PERSONAL EN EMERGENCIAS....UNIDAD MÉDICA',
                'B: POR BÚSQUEDA DE PERSONAS PERDIDAS EN EL PREDIO',
                '- A LAS UNIDADES CONCURRENTES SE SUMA ESTACIÓN BÚSQUEDA Y RESCATE K9'
            ]},
            { type: 'subtitle', content: '3. RESERVA ECOLÓGICA LAGO LUGANO - UBICACIÓN: AV. 27 DE FEBRERO Y PUENTE OLÍMPICO'},
            { type: 'list', items: [
                'A: POR INCENDIO',
                '- ESTACIÓN X “LUGANO”....1ª DOTACIÓN.',
                '- ESTACIÓN X "LUGANO"....UNIDAD CISTERNA',
                '- DESTACAMENTO POMPEYA....1ª DOTACIÓN',
                '- Ε.Β.Ε.Ε.....UNIDAD DE APOYO AEREO/APRESTO ESTATICO',
                '- P.C.M.....UNIDAD DE PUESTO COMANDO',
                '- DESTACAMENTO SISTEMA DE ASISTENCIA CRITICA PARA EL PERSONAL EN EMERGENCIAS....UNIDAD MEDICA',
                'B: POR BÚSQUEDA DE PERSONAS PERDIDAS EN EL PREDIO',
                '- A LAS UNIDADES CONCURRENTES SE SUMA ESTACIÓN BÚSQUEDA Y RESCATE K9'
            ]},
             { type: 'text', content: 'Nota: Al arribo de las dotaciones, se debe tomar contacto con el oficial a cargo de la intervención a los fines de recibir las directivas y coordinar las tareas.', style: 'italic'}
        ]
    },
    {
      id: "accesos-autopistas",
      title: "ACCESO AUTOPISTAS",
      content: [
          { type: 'subtitle', content: 'AUTOPISTA DR. ARTURO UMBERTO ILLIA' },
          { type: 'list', items: [
              'TRAMO DESDE AV. GRAL PAZ HASTA AV. 9 DE JULIO (SENTIDO CENTRO)',
              '1) TRAMO: AV. Gral. PAZ hasta AV. G. UDAONDO: 1. DESTACAMENTO SAAVEDRA, 2. Estación V "COMANDANTE GENERAL ARIEL GASTÓN VÁZQUEZ"',
              '2) TRAMO: AV. G. UDAONDO hasta AV. DORREGO: 1. Estación V "COMANDANTE GENERAL ARIEL GASTÓN VÁZQUEZ", 2. DESTACAMENTO SAAVEDRA, 3. DESTACAMENTO PALERMO',
              '3) TRAMO: AV. DORREGO hasta J. SALGUERO: 1. DESTACAMENTO PALERMO, 2. Estación IV RECOLETA, 3. Estación V “COMANDANTE GENERAL ARIEL GASTÓN VÁZQUEZ"',
              '4) TRAMO: J. SALGUERO hasta AV. 9 DE JULIO: 1. Estación IV "RECOLETA", 2. DESTACAMENTO RETIRO, 3. DESTACAMENTO PALERMO.',
              'TRAMO DESDE AV. 9 DE JULIO HASTA AV. GRAL. PAZ (SENTIDO PROVINCIA)',
              '1) TRAMO: AV. 9 DE JULIO hasta SARMIENTO: 1. ESTACIÓN IV RECOLETA, 2. ESTACIÓN V “COMANDANTE GENERAL ARIEL GASTÓN VÁZQUEZ", 3. DESTACAMENTO RETIRO.',
              '2) TRAMO: SARMIENTO hasta DISTRIB. SCALABRINI ORTIZ: 1. DESTACAMENTO "PALERMO", 2. ESTACIÓN IV RECOLETA, 3. E ESTACION V “COMANDANTE GENERAL ARIEL GASTON VAZQUEZ"',
              '3) TRAMO: DISTRIBUIDOR SCALABRINI ORTIZ hasta AV. GRAL. PAZ: 1. ESTACIÓN V “COMANDANTE GENERAL ARIEL GASTON VAZQUEZ", 2. DESTACAMENTO PALERMO, 3. DESTACAMENTO G.E.R. SAAVEDRA.'
          ]},
          { type: 'subtitle', content: 'AUTOPISTA "PERITO MORENO" AU-6/ AUTOPISTA 25 DE MAYO AU-1' },
          { type: 'list', items: [
              'TRAMO DESDE AV. GRAL PAZ A AV. INGENIERO HUERGO (SENTIDO CENTRO)',
              '1) TRAMO: Av. Gral. PAZ hasta BRAGADO: 1. ESTACION IX "VERSALLES", 2. DESTACAMENTO VELEZ SARSFIELD.',
              '2) TRAMO: BRAGADO hasta Av. JUJUY: 1. DESTACAMENTO VELEZ SARSFIELD., 2. ESTACION VII "FLORES".',
              '3) TRAMO: ALBERTI hasta Av. ING. HUERGO: 1. ESTACIÓN II "PATRICIOS", 2. ESTACION III BARRACAS',
              'TRAMO DESDE AV. INGENIERO HUERGO HASTA AV. GRAL PAZ (SENTIDO PROVINCIA)',
              '1) TRAMO: Av. ING. HUERGO hasta la calle ALBERTI: 1. ESTACIÓN III "BARRACAS", 2. ESTACIÓN II PATRICIOS, 3. DESTACAMENTO "CABALLITO".',
              '2) TRAMO: Av. ENTRE RÍOS hasta la calle VIEL: 1. ESTACIÓN III BARRACAS, 2. ESTACIÓN II PATRICIOS, 3. DESTACAMENTO "CABALLITO".',
              '3) TRAMO: VIEL hasta el Peaje AVELLANEDA: 1. DESTACAMENTO CABALLITO, 2. ESTACIÓN VII FLORES'
          ]},
           { type: 'subtitle', content: 'AUTOPISTA DR. RICARDO BALBÍN' },
          { type: 'list', items: [
              '1) TRAMO: Centro hasta la Estación de peaje DOCK SUD (SENTIDO A PROVINCIA): 1. ESTACIÓN III BARRACAS, 2. DESTACAMENTO "BOCA".',
              '2) TRAMO: La Estación de peaje DOCK SUD hasta bajada Suarez (SENTIDO A CAPITAL): 1. ESTACION III BARRACAS, 2. DESTACAMENTO "BOCA".'
          ]},
          { type: 'subtitle', content: 'AUTOPISTA Pres. ARTURO FRONDIZI/ AU 9 DE JULIO SUR' },
          { type: 'list', items: [
              '1) TRAMO: AVELLANEDA HACIA AV. 9 DE JULIO (SENTIDO CAPITAL): 1. ESTACIÓN III BARRACAS, 2. DESTACAMENTO "BOCA".',
              '2) TRAMO: AV. 9 DE JULIO HACIA AVELLANEDA (SENTIDO PROVINCIA): 1. Estación III "BARRACAS".'
          ]},
          { type: 'subtitle', content: 'AUTOPISTA "PTE. JOSE HECTOR CÁMPORA" AU-7' },
          { type: 'list', items: [
              '1) TRAMO: 27 de febrero hasta DELLEPIANE: 1. ESTACIÓN X "LUGANO", 2. DESTACAMENTO "POMPEYA", 3. ESTACIÓN XI ALBARIÑO',
              '2) TRAMO: DELLEPIANE hasta la Av. 27 de febrero: 1. ESTACIÓN X "LUGANO", 2. ESTACIÓN XI ALBARIÑO, 3. DESTACAMENTO "POMPEYA".'
          ]},
          { type: 'subtitle', content: 'AUTOPISTA "LUIS DELLEPIANE"' },
          { type: 'list', items: [
              '1) TRAMO: Desde AV. GRAL. PAZ hasta AU. PTE. JOSE HECTOR CÁMPORA/AU. 25 DE MAYO (SENTIDO CAPITAL): 1. ESTACIÓN X LUGANO, 2. ESTACIÓN XI ALBARIÑO, 3. ESTACIÓN VII FLORES',
              '2) TRAMO: Desde AV. LACARRA hasta la AV. GRAL. PAZ (SENTIDO PROVINCIA): 1. ESTACIÓN XI ALBARIÑO'
          ]}
      ]
    }
  ]
};