import { EraData } from '../types';

export const eraData: EraData = {
  reportDate: new Date().toLocaleString('es-AR'),
  stations: [
    { name: 'ESTACION I', hasEquipment: false, equipment: [] },
    {
      name: 'ESTACION II',
      hasEquipment: true,
      equipment: [{ id: 'era-1', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' }]
    },
    {
      name: 'ESTACION III',
      hasEquipment: true,
      equipment: [{ id: 'era-2', brand: 'OCEANIC', voltage: '380W', condition: 'F/S', dependency: 'En dependencia' }]
    },
    {
      name: 'ESTACION IV',
      hasEquipment: true,
      equipment: [
        { id: 'era-3', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' },
        { id: 'era-4', brand: 'OCEANIC', voltage: '380W', condition: 'F/S', dependency: 'En dependencia' }
      ]
    },
    {
      name: 'ESTACION V',
      hasEquipment: true,
      equipment: [
        { id: 'era-5', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' },
        { id: 'era-6', brand: 'COLTRI', voltage: '220W', condition: 'P/S', dependency: 'En Dto. URQUIZA' }
      ]
    },
    {
      name: 'ESTACION VI',
      hasEquipment: true,
      equipment: [
        { id: 'era-7', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' },
        { id: 'era-8', brand: 'COLTRI', voltage: '220W', condition: 'P/S', dependency: 'Dto. Palermo' }
      ]
    },
    {
      name: 'ESTACION VII',
      hasEquipment: true,
      equipment: [
        { id: 'era-9', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' },
        { id: 'era-10', brand: 'COLTRI', voltage: '220W', condition: 'P/S', dependency: 'En dependencia' }
      ]
    },
    {
      name: 'ESTACION VIII',
      hasEquipment: true,
      equipment: [{ id: 'era-11', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' }]
    },
    {
      name: 'ESTACION IX',
      hasEquipment: true,
      equipment: [{ id: 'era-12', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' }]
    },
    {
      name: 'ESTACION X',
      hasEquipment: true,
      equipment: [
        { id: 'era-13', brand: 'OCEANIC', voltage: '380W', condition: 'F/S', dependency: 'Taller particular' },
        { id: 'era-14', brand: 'COLTRI', voltage: '220W', condition: 'F/S', dependency: 'En dependencia' }
      ]
    },
    {
      name: 'ESTACION XI',
      hasEquipment: true,
      equipment: [{ id: 'era-15', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' }]
    },
    {
      name: 'CABALLITO',
      hasEquipment: true,
      equipment: [
        { id: 'era-16', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' },
        { id: 'era-17', brand: 'COLTRI', voltage: '220W', condition: 'F/S', dependency: 'En dependencia' }
      ]
    },
    {
      name: 'SAAVEDRA',
      hasEquipment: true,
      equipment: [
        { id: 'era-18', brand: 'OCEANIC', voltage: '380W', condition: 'P/S', dependency: 'En dependencia' },
        { id: 'era-19', brand: 'COLTRI', voltage: '220W', condition: 'P/S', dependency: 'En dependencia' }
      ]
    },
    { name: 'COB', hasEquipment: false, equipment: [] },
  ],
};