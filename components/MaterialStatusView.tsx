import React, { useState, useMemo } from 'react';
import { MaterialsData, Material } from '../types';

interface MaterialStatusViewProps {
  materialsData: MaterialsData;
}

const getConditionColor = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('para servicio')) return 'bg-green-600 text-white';
  if (c.includes('fuera de servicio')) return 'bg-red-600 text-white';
  return 'bg-zinc-500 text-white';
};

const MaterialStatusView: React.FC<MaterialStatusViewProps> = ({ materialsData }) => {
  const allMaterials = useMemo(() => {
    if (!materialsData) return [];
    return materialsData.locations.flatMap(location => 
      location.materials.map(material => ({
        ...material,
        locationName: location.name,
      }))
    );
  }, [materialsData]);

  const allNames = useMemo(() => [...new Set(allMaterials.map(m => m.name))].sort(), [allMaterials]);
  const allConditions = useMemo(() => [...new Set(allMaterials.map(m => m.condition))].sort(), [allMaterials]);

  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(allNames));
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set(allConditions));

  const handleNameToggle = (name: string) => {
    setSelectedNames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(condition)) newSet.delete(condition);
      else newSet.add(condition);
      return newSet;
    });
  };

  const filteredMaterials = useMemo(() => {
    return allMaterials.filter(material => 
      selectedNames.has(material.name) && selectedConditions.has(material.condition)
    );
  }, [allMaterials, selectedNames, selectedConditions]);

  const FilterGroup: React.FC<{ title: string; items: string[]; selectedItems: Set<string>; onToggle: (item: string) => void; onSelectAll: () => void; onDeselectAll: () => void;}> = ({ title, items, selectedItems, onToggle, onSelectAll, onDeselectAll }) => (
    <div className="bg-zinc-800/60 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="flex gap-2 mb-3">
        <button onClick={onSelectAll} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white">Todos</button>
        <button onClick={onDeselectAll} className="px-2 py-1 text-xs bg-zinc-600 hover:bg-zinc-500 rounded text-white">Ninguno</button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {items.map(item => (
          <label key={item} className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
            <input
              type="checkbox"
              checked={selectedItems.has(item)}
              onChange={() => onToggle(item)}
              className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-blue-500 focus:ring-blue-500"
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <FilterGroup 
          title="Filtrar por Material"
          items={allNames}
          selectedItems={selectedNames}
          onToggle={handleNameToggle}
          onSelectAll={() => setSelectedNames(new Set(allNames))}
          onDeselectAll={() => setSelectedNames(new Set())}
        />
        <FilterGroup
          title="Filtrar por Condición"
          items={allConditions}
          selectedItems={selectedConditions}
          onToggle={handleConditionToggle}
          onSelectAll={() => setSelectedConditions(new Set(allConditions))}
          onDeselectAll={() => setSelectedConditions(new Set())}
        />
      </div>
      <div className="lg:col-span-3 bg-zinc-800/60 p-4 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Materiales Filtrados ({filteredMaterials.length})</h2>
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-zinc-800">
              <tr className="text-sm text-zinc-400">
                <th className="p-2">Material</th>
                <th className="p-2 text-center">Cantidad</th>
                <th className="p-2">Condición</th>
                <th className="p-2">Ubicación</th>
                <th className="p-2">Ubicación Interna</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length > 0 ? filteredMaterials.map(material => (
                <tr key={material.id + material.locationName} className="border-t border-zinc-700 hover:bg-zinc-700/50">
                  <td className="p-2 font-semibold text-zinc-200">{material.name}</td>
                  <td className="p-2 text-center font-mono text-white">{material.quantity}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(material.condition)}`}>
                      {material.condition}
                    </span>
                  </td>
                  <td className="p-2 text-zinc-400 text-sm">{material.locationName}</td>
                  <td className="p-2 text-zinc-300">{material.location || '-'}</td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-500">
                        No hay materiales que coincidan con los filtros seleccionados.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialStatusView;
