export const generatorData = {
  reportDate: new Date().toLocaleString('es-AR'),
  stations: [
    { name: 'ESTACION I', hasEquipment: false, equipment: [] },
    {
      name: 'ESTACION II',
      hasEquipment: true,
      equipment: [{ id: 'gen-1', brand: 'CATERPILLAR', kva: '50 KVA', condition: 'P/S', dependency: 'En dependencia' }]
    },
    { name: 'ESTACION III', hasEquipment: false, equipment: [] },
    {
      name: 'ESTACION IV',
      hasEquipment: true,
      equipment: [
        { id: 'gen-2', brand: 'HONDA', kva: '20 KVA', condition: 'P/S', dependency: 'En dependencia' }
      ]
    },
    { name: 'ESTACION V', hasEquipment: false, equipment: [] },
    {
      name: 'ESTACION VI',
      hasEquipment: true,
      equipment: [
        { id: 'gen-3', brand: 'CATERPILLAR', kva: '75 KVA', condition: 'F/S', dependency: 'En Taller' },
        { id: 'gen-4', brand: 'KIPOR', kva: '15 KVA', condition: 'P/S', dependency: 'Dto. Palermo' }
      ]
    },
    { name: 'ESTACION VII', hasEquipment: false, equipment: [] },
    {
      name: 'ESTACION VIII',
      hasEquipment: true,
      equipment: [{ id: 'gen-5', brand: 'CATERPILLAR', kva: '50 KVA', condition: 'P/S', dependency: 'En dependencia' }]
    },
    { name: 'ESTACION IX', hasEquipment: false, equipment: [] },
    {
      name: 'ESTACION X',
      hasEquipment: true,
      equipment: [
        { id: 'gen-6', brand: 'HONDA', kva: '25 KVA', condition: 'F/S', dependency: 'En dependencia' }
      ]
    },
    { name: 'ESTACION XI', hasEquipment: false, equipment: [] },
    {
      name: 'CABALLITO',
      hasEquipment: true,
      equipment: [
        { id: 'gen-7', brand: 'CATERPILLAR', kva: '100 KVA', condition: 'P/S', dependency: 'En dependencia' }
      ]
    },
    {
      name: 'SAAVEDRA',
      hasEquipment: true,
      equipment: [
        { id: 'gen-8', brand: 'KIPOR', kva: '30 KVA', condition: 'P/S', dependency: 'En dependencia' }
      ]
    },
    { name: 'COB', hasEquipment: false, equipment: [] },
  ],
};
