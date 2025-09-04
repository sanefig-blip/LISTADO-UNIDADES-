import { MaterialsData } from '../types';

export const materialsData: MaterialsData = {
  reportDate: new Date().toLocaleString('es-AR'),
  locations: [
    {
      name: 'ESTACIÓN I "PUERTO MADERO"',
      materials: [
        { id: 'm1', name: 'Mangueras 2.5"', quantity: 20, condition: 'Para Servicio', location: 'Depósito A' },
        { id: 'm2', name: 'Equipos ERA', quantity: 15, condition: 'Para Servicio', location: 'Sala de Equipos' },
        { id: 'm3', name: 'Lanzas de 2.5"', quantity: 10, condition: 'Para Servicio', location: 'Depósito A' },
        { id: 'm4', name: 'Handies', quantity: 12, condition: 'Fuera de Servicio', location: 'Taller' },
      ],
    },
    {
      name: 'ESTACIÓN II "PATRICIOS"',
      materials: [
        { id: 'm5', name: 'Mangueras 1.5"', quantity: 30, condition: 'Para Servicio', location: 'Depósito B' },
        { id: 'm6', name: 'Equipos ERA', quantity: 18, condition: 'Para Servicio', location: 'Armario 1' },
        { id: 'm7', name: 'Escaleras de Extensión', quantity: 4, condition: 'Para Servicio', location: 'Patio' },
      ],
    },
    {
      name: 'ESTACIÓN III "BARRACAS"',
      materials: [
         { id: 'm8', name: 'Mangueras 2.5"', quantity: 25, condition: 'Para Servicio', location: 'Depósito A' },
      ],
    },
     {
      name: 'DESTACAMENTO POMPEYA',
      materials: [],
    },
     {
      name: 'DESTACAMENTO BOCA',
      materials: [
         { id: 'm9', name: 'Salvavidas Circulares', quantity: 10, condition: 'Para Servicio', location: 'Bote' },
      ],
    },
  ],
};