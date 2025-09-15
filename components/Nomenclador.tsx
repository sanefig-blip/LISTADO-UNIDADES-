import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, PlusCircleIcon, PencilIcon, XCircleIcon, GripVerticalIcon, ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from './icons';
import { Personnel, Rank, RANKS, Roster, User, LogEntry } from '../types';

interface NomencladorProps {
  commandPersonnel: Personnel[];
  onAddCommandPersonnel: (item: Personnel) => void;
  onUpdateCommandPersonnel: (item: Personnel) => void;
  onRemoveCommandPersonnel: (item: Personnel) => void;
  
  servicePersonnel: Personnel[];
  onAddServicePersonnel: (item: Personnel) => void;
  onUpdateServicePersonnel: (item: Personnel) => void;
  onRemoveServicePersonnel: (item: Personnel) => void;

  units: string[];
  onUpdateUnits: (units: string[]) => void;

  unitTypes: string[];
  onUpdateUnitTypes: (types: string[]) => void;

  roster: Roster;
  onUpdateRoster: (roster: Roster) => void;

  users: User[];
  onUpdateUsers: (users: User[]) => void;
  addLogEntry: (action: string) => void;
}

type ExtraField = 'station' | 'detachment' | 'poc' | 'part';

const UserManagement: React.FC<{
    users: User[];
    onUpdateUsers: (users: User[]) => void;
    addLogEntry: (action: string) => void;
}> = ({ users, onUpdateUsers, addLogEntry }) => {
    const [editableUsers, setEditableUsers] = useState<User[]>(() => JSON.parse(JSON.stringify(users)));
    const [passwordVisibility, setPasswordVisibility] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        setEditableUsers(JSON.parse(JSON.stringify(users)));
    }, [users]);

    const handlePasswordChange = (userId: string, newPassword: string) => {
        setEditableUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    };
    
    const togglePasswordVisibility = (userId: string) => {
        setPasswordVisibility(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const handleSave = () => {
        const adminUser = editableUsers.find(u => u.role === 'admin');
        if (adminUser && adminUser.password.trim() === '') {
            alert('La contraseña del administrador no puede estar vacía.');
            // Revert to original password if empty
            const originalAdmin = users.find(u => u.id === adminUser.id);
            if (originalAdmin) {
                setEditableUsers(prev => prev.map(u => u.id === adminUser.id ? { ...u, password: originalAdmin.password } : u));
            }
            return;
        }
        onUpdateUsers(editableUsers);
        addLogEntry('Actualizó las contraseñas de los usuarios.');
        alert('Contraseñas actualizadas con éxito.');
    };

    return (
        <div className="bg-zinc-800/60 rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Gestión de Usuarios y Contraseñas</h3>
            <div className="space-y-3">
                {editableUsers.map(user => (
                    <div key={user.id} className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center p-2 bg-zinc-700/50 rounded-md">
                        <span className="text-zinc-200 font-medium">{user.username}</span>
                        <div className="relative">
                            <input
                                type={passwordVisibility[user.id] ? 'text' : 'password'}
                                value={user.password}
                                onChange={e => handlePasswordChange(user.id, e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-600 rounded-md px-3 py-2 text-white"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => togglePasswordVisibility(user.id)} className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-400 hover:text-white">
                                {passwordVisibility[user.id] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Estación'}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={handleSave} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">
                    <PencilIcon className="w-5 h-5 mr-2"/>
                    Guardar Cambios de Contraseñas
                </button>
            </div>
        </div>
    );
};

const PersonnelListItem: React.FC<{
  item: Personnel;
  onUpdate: (item: Personnel) => void;
  onRemove: (item: Personnel) => void;
  extraFieldsToShow: ExtraField[];
}> = ({ item, onUpdate, onRemove, extraFieldsToShow }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableItem, setEditableItem] = useState(item);

  const handleSave = () => {
    if (editableItem.name.trim() && editableItem.id.trim()) {
      onUpdate(editableItem);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditableItem(item);
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableItem(prev => ({...prev, [name]: value }));
  };

  if (isEditing) {
    const gridColsClass = extraFieldsToShow.length > 1 
      ? 'sm:grid-cols-2 md:grid-cols-3'
      : 'sm:grid-cols-4';

    return (
      <li className="flex flex-col bg-zinc-900/80 p-3 rounded-md animate-fade-in gap-3">
        <div className={`w-full grid grid-cols-1 ${gridColsClass} gap-2`}>
            <input
                type="text"
                name="id"
                value={editableItem.id}
                onChange={handleInputChange}
                placeholder="L.P."
                className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
            />
            <select
                name="rank"
                value={editableItem.rank}
                onChange={handleInputChange}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
            >
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input
                type="text"
                name="name"
                value={editableItem.name}
                onChange={handleInputChange}
                className={`w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500 ${extraFieldsToShow.length > 1 ? 'md:col-span-1' : 'sm:col-span-1'}`}
            />
             {extraFieldsToShow.includes('poc') && (
                <input
                    type="text"
                    name="poc"
                    value={editableItem.poc || ''}
                    onChange={handleInputChange}
                    placeholder="POC"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                />
            )}
            {extraFieldsToShow.includes('station') && (
                <input
                    type="text"
                    name="station"
                    value={editableItem.station || ''}
                    onChange={handleInputChange}
                    placeholder="Estación"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                />
            )}
            {extraFieldsToShow.includes('detachment') && (
                <input
                    type="text"
                    name="detachment"
                    value={editableItem.detachment || ''}
                    onChange={handleInputChange}
                    placeholder="Destacamento"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                />
            )}
             {extraFieldsToShow.includes('part') && (
                 <input
                    type="text"
                    name="part"
                    value={editableItem.part || ''}
                    onChange={handleInputChange}
                    placeholder="PART"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                />
            )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 self-end">
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 transition-colors p-1"><PencilIcon className="w-5 h-5"/></button>
          <button onClick={handleCancel} className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"><XCircleIcon className="w-5 h-5"/></button>
        </div>
      </li>
    );
  }

  const hasExtraFields = extraFieldsToShow.some(field => item[field as keyof Personnel]);

  return (
    <li className="flex justify-between items-center bg-zinc-700/50 p-3 rounded-md animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-grow min-w-0">
        <div className="flex items-center min-w-0 flex-wrap sm:flex-nowrap gap-x-4">
            <span className="font-mono text-xs text-zinc-400 w-20 flex-shrink-0">L.P. {item.id}</span>
            <span className="font-semibold text-blue-300 mr-2 flex-shrink-0">{item.rank}</span>
            <span className="text-zinc-200 truncate">{item.name}</span>
        </div>
        {hasExtraFields && (
            <div className="text-xs text-zinc-400 mt-1 sm:mt-0 truncate flex flex-wrap gap-x-3">
                {extraFieldsToShow.includes('poc') && item.poc && <span>POC: {item.poc}</span>}
                {extraFieldsToShow.includes('station') && item.station && <span>Est: {item.station}</span>}
                {extraFieldsToShow.includes('detachment') && item.detachment && <span>Dest: {item.detachment}</span>}
                {extraFieldsToShow.includes('part') && item.part && <span>PART: {item.part}</span>}
            </div>
        )}
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
         <button onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-yellow-400 transition-colors">
            <PencilIcon className="w-5 h-5" />
          </button>
        <button onClick={() => onRemove(item)} className="text-zinc-400 hover:text-red-400 transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </li>
  );
};


const EditablePersonnelList: React.FC<{
  title: string;
  items: Personnel[];
  onAddItem: (item: Personnel) => void;
  onUpdateItem: (item: Personnel) => void;
  onRemoveItem: (item: Personnel) => void;
  extraFieldsToShow: ExtraField[];
  addLogEntry: (action: string) => void;
}> = ({ title, items, onAddItem, onUpdateItem, onRemoveItem, extraFieldsToShow, addLogEntry }) => {
  const [newLp, setNewLp] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState<Rank>('OTRO');
  const [newStation, setNewStation] = useState('');
  const [newDetachment, setNewDetachment] = useState('');
  const [newPoc, setNewPoc] = useState('');
  const [newPart, setNewPart] = useState('');

  const handleAdd = () => {
    if (newName.trim() && newLp.trim()) {
      const newItem: Personnel = {
        id: newLp.trim(),
        name: newName.trim(),
        rank: newRank,
      };
      if (extraFieldsToShow.includes('station')) newItem.station = newStation.trim() || undefined;
      if (extraFieldsToShow.includes('detachment')) newItem.detachment = newDetachment.trim() || undefined;
      if (extraFieldsToShow.includes('poc')) newItem.poc = newPoc.trim() || undefined;
      if (extraFieldsToShow.includes('part')) newItem.part = newPart.trim() || undefined;
      
      onAddItem(newItem);
      addLogEntry(`Añadió a ${newItem.name} a "${title}".`);

      setNewLp('');
      setNewName('');
      setNewRank('OTRO');
      setNewStation('');
      setNewDetachment('');
      setNewPoc('');
      setNewPart('');
    }
  };

  const handleUpdate = (item: Personnel) => {
    onUpdateItem(item);
    addLogEntry(`Actualizó a ${item.name} en "${title}".`);
  };

  const handleRemove = (item: Personnel) => {
    if (window.confirm(`¿Seguro que quieres eliminar a ${item.name}?`)) {
      onRemoveItem(item);
      addLogEntry(`Eliminó a ${item.name} de "${title}".`);
    }
  };

  const gridColsClass = extraFieldsToShow.length > 1 
      ? 'sm:grid-cols-2 md:grid-cols-3'
      : 'sm:grid-cols-4';

  return (
    <div className="bg-zinc-800/60 rounded-xl shadow-lg p-6 flex flex-col h-[32rem]">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <div className={`grid grid-cols-1 ${gridColsClass} gap-2 mb-2`}>
        <input
          type="text"
          value={newLp}
          onChange={(e) => setNewLp(e.target.value)}
          placeholder="L.P."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
          aria-label="Añadir L.P. de personal"
        />
        <select
          value={newRank}
          onChange={(e) => setNewRank(e.target.value as Rank)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
          aria-label="Seleccionar jerarquía"
        >
          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Apellido, Nombre"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
          aria-label="Añadir nombre de personal"
        />
        {extraFieldsToShow.includes('poc') && (
             <input
              type="text"
              value={newPoc}
              onChange={(e) => setNewPoc(e.target.value)}
              placeholder="POC"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
              aria-label="Añadir POC"
            />
        )}
        {extraFieldsToShow.includes('station') && (
            <input
              type="text"
              value={newStation}
              onChange={(e) => setNewStation(e.target.value)}
              placeholder="Estación"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
              aria-label="Añadir estación"
            />
        )}
        {extraFieldsToShow.includes('detachment') && (
            <input
              type="text"
              value={newDetachment}
              onChange={(e) => setNewDetachment(e.target.value)}
              placeholder="Destacamento"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
              aria-label="Añadir destacamento"
            />
        )}
        {extraFieldsToShow.includes('part') && (
             <input
              type="text"
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              placeholder="PART"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
              aria-label="Añadir PART"
            />
        )}
      </div>
       <button
          onClick={handleAdd}
          className="w-full flex-shrink-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors mb-4"
          aria-label="Añadir Personal"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Añadir Personal
        </button>
      <ul className="space-y-2 overflow-y-auto pr-2 flex-grow">
        {items.map((item) => (
           <PersonnelListItem
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              extraFieldsToShow={extraFieldsToShow}
            />
        ))}
         {items.length === 0 && (
            <div className="flex justify-center items-center h-full">
                <p className="text-zinc-500">No hay personal.</p>
            </div>
        )}
      </ul>
    </div>
  );
};


const UnitList: React.FC<{
  items: string[];
  onUpdateItems: (items: string[]) => void;
  addLogEntry: (action: string) => void;
}> = ({ items, onUpdateItems, addLogEntry }) => {
    const [newItem, setNewItem] = useState('');
    const draggedItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    const handleAdd = () => {
      if (newItem.trim() && !items.includes(newItem.trim())) {
        onUpdateItems([...items, newItem.trim()]);
        addLogEntry(`Añadió la unidad "${newItem.trim()}" al nomenclador.`);
        setNewItem('');
      }
    };

    const handleRemove = (itemToRemove: string) => {
        onUpdateItems(items.filter(item => item !== itemToRemove));
        addLogEntry(`Eliminó la unidad "${itemToRemove}" del nomenclador.`);
    };

    const handleDragEnd = () => {
        if (draggedItemIndex.current === null || dragOverItemIndex.current === null) return;
        
        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedItemIndex.current, 1);
        newItems.splice(dragOverItemIndex.current, 0, draggedItem);
      
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
      
        onUpdateItems(newItems);
        addLogEntry('Reordenó la lista de unidades.');
    };

    return (
      <div className="bg-zinc-800/60 rounded-xl shadow-lg p-6 flex flex-col h-[32rem]">
        <h3 className="text-2xl font-bold text-white mb-4">Unidades</h3>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Añadir nueva unidad..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
            aria-label="Añadir nueva unidad"
          />
          <button
            onClick={handleAdd}
            className="flex-shrink-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors"
            aria-label="Añadir unidad"
          >
            <PlusCircleIcon className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2 overflow-y-auto pr-2 flex-grow">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex justify-between items-center bg-zinc-700/50 p-2 rounded-md animate-fade-in group"
              draggable
              onDragStart={() => (draggedItemIndex.current = index)}
              onDragEnter={() => (dragOverItemIndex.current = index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex items-center">
                 <GripVerticalIcon className="w-5 h-5 mr-2 text-zinc-500 cursor-grab group-hover:text-zinc-300 transition-colors" />
                 <span className="text-zinc-200">{item}</span>
              </div>
              <button
                onClick={() => handleRemove(item)}
                className="text-zinc-400 hover:text-red-400 transition-colors"
                aria-label={`Eliminar ${item}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
           {items.length === 0 && (
              <div className="flex justify-center items-center h-full">
                  <p className="text-zinc-500">No hay unidades.</p>
              </div>
          )}
        </ul>
      </div>
    );
}

const UnitTypeList: React.FC<{
  items: string[];
  onUpdateItems: (items: string[]) => void;
  addLogEntry: (action: string) => void;
}> = ({ items, onUpdateItems, addLogEntry }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
      if (newItem.trim() && !items.find(i => i.toLowerCase() === newItem.trim().toLowerCase())) {
        const sorted = [...items, newItem.trim()].sort((a, b) => a.localeCompare(b));
        onUpdateItems(sorted);
        addLogEntry(`Añadió el tipo de unidad "${newItem.trim()}".`);
        setNewItem('');
      }
    };

    const handleRemove = (itemToRemove: string) => {
        onUpdateItems(items.filter(item => item !== itemToRemove));
        addLogEntry(`Eliminó el tipo de unidad "${itemToRemove}".`);
    };

    return (
      <div className="bg-zinc-800/60 rounded-xl shadow-lg p-6 flex flex-col h-[32rem]">
        <h3 className="text-2xl font-bold text-white mb-4">Tipos de Unidades</h3>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Añadir nuevo tipo..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white"
            aria-label="Añadir nuevo tipo de unidad"
          />
          <button
            onClick={handleAdd}
            className="flex-shrink-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold"
            aria-label="Añadir tipo de unidad"
          >
            <PlusCircleIcon className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2 overflow-y-auto pr-2 flex-grow">
          {items.map((item) => (
            <li
              key={item}
              className="flex justify-between items-center bg-zinc-700/50 p-2 rounded-md animate-fade-in"
            >
              <span className="text-zinc-200">{item}</span>
              <button
                onClick={() => handleRemove(item)}
                className="text-zinc-400 hover:text-red-400 transition-colors"
                aria-label={`Eliminar ${item}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
           {items.length === 0 && (
              <div className="flex justify-center items-center h-full">
                  <p className="text-zinc-500">No hay tipos de unidades.</p>
              </div>
          )}
        </ul>
      </div>
    );
};

const RosterEditor: React.FC<{
  roster: Roster;
  onUpdateRoster: (roster: Roster) => void;
  personnelList: Personnel[];
  addLogEntry: (action: string) => void;
}> = ({ roster, onUpdateRoster, personnelList, addLogEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editableMonthRoster, setEditableMonthRoster] = useState<Roster>({});
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const roles = [
    { key: 'jefeInspecciones', label: 'Jefe de Inspecciones' },
    { key: 'jefeServicio', label: 'Jefe de Servicio' },
    { key: 'jefeGuardia', label: 'Jefe de Guardia' },
    { key: 'jefeReserva', label: 'Jefe de Reserva' },
  ];

  useEffect(() => {
    const monthData: Roster = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (roster[dateKey]) {
        monthData[dateKey] = roster[dateKey];
      }
    }
    setEditableMonthRoster(monthData);
  }, [currentDate, roster]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleInputChange = (dateKey: string, roleKey: string, value: string) => {
    setEditableMonthRoster(prev => {
      const updatedDay = { ...(prev[dateKey] || {}), [roleKey]: value };
      // Remove role if value is empty
      if (value.trim() === '') {
        delete updatedDay[roleKey as keyof typeof updatedDay];
      }
      const updatedRoster = { ...prev, [dateKey]: updatedDay };
      // Remove day if it has no roles
      if (Object.keys(updatedDay).length === 0) {
        delete updatedRoster[dateKey];
      }
      return updatedRoster;
    });
  };
  
  const handleSave = () => {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;

    const filteredRoster = Object.keys(roster).reduce((acc, dateKey) => {
      if (!dateKey.startsWith(monthPrefix)) {
        acc[dateKey] = roster[dateKey];
      }
      return acc;
    }, {} as Roster);

    const newRoster = { ...filteredRoster, ...editableMonthRoster };
    
    onUpdateRoster(newRoster);
    addLogEntry(`Actualizó el Rol de Guardia para ${monthNames[monthIndex]} ${year}.`);
    alert('Rol de guardia guardado con éxito.');
  };

  const handleClearMonth = () => {
    const monthName = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    if (!window.confirm(`¿Estás seguro de que quieres borrar todas las asignaciones para ${monthName} ${year}?`)) {
      return;
    }

    const monthPrefix = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-`;

    const newRoster = Object.keys(roster).reduce((acc, dateKey) => {
        if (!dateKey.startsWith(monthPrefix)) {
            acc[dateKey] = roster[dateKey];
        }
        return acc;
    }, {} as Roster);

    onUpdateRoster(newRoster);
    addLogEntry(`Borro el Rol de Guardia para ${monthNames[currentDate.getMonth()]} ${year}.`);
    alert(`Asignaciones para ${monthName} borradas.`);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayRoster = editableMonthRoster[dateKey] || {};

      rows.push(
        <tr key={dateKey} className="bg-zinc-800 hover:bg-zinc-700/50">
          <td className="p-2 border-b border-zinc-700 text-center font-semibold text-white">{day}</td>
          {roles.map(role => (
            <td key={role.key} className="p-1 border-b border-zinc-700">
              <input
                type="text"
                list="command-personnel-suggestions"
                value={dayRoster[role.key as keyof typeof dayRoster] || ''}
                onChange={e => handleInputChange(dateKey, role.key, e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-md px-2 py-1 text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="bg-zinc-800/60 rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-2xl font-bold text-white mb-4">Editor de Rol de Guardia</h3>
      <datalist id="command-personnel-suggestions">
        {personnelList.map(p => <option key={p.id} value={p.name} />)}
      </datalist>
      <div className="flex justify-between items-center mb-4 bg-zinc-900 p-3 rounded-lg">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-zinc-700 transition-colors"><ArrowLeftIcon className="w-6 h-6"/></button>
        <span className="text-xl font-bold text-yellow-300">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-zinc-700 transition-colors"><ArrowRightIcon className="w-6 h-6"/></button>
      </div>
      <div className="overflow-x-auto max-h-[50vh]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-900 sticky top-0">
              <th className="p-2 border-b-2 border-zinc-600 text-left text-sm font-semibold text-zinc-300 w-16">Día</th>
              {roles.map(role => <th key={role.key} className="p-2 border-b-2 border-zinc-600 text-left text-sm font-semibold text-zinc-300">{role.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {renderCalendar()}
          </tbody>
        </table>
      </div>
       <div className="flex justify-end space-x-4 mt-6">
            <button onClick={handleClearMonth} className="flex items-center px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white transition-colors text-sm font-medium">
                <TrashIcon className="w-5 h-5 mr-2"/>
                Borrar Mes Actual
            </button>
            <button onClick={handleSave} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">
                <PencilIcon className="w-5 h-5 mr-2"/>
                Guardar Cambios del Mes
            </button>
        </div>
    </div>
  );
};


const Nomenclador: React.FC<NomencladorProps> = (props) => {
  return (
    <div className="animate-fade-in space-y-8">
        <UserManagement users={props.users} onUpdateUsers={props.onUpdateUsers} addLogEntry={props.addLogEntry} />
        <RosterEditor 
          roster={props.roster}
          onUpdateRoster={props.onUpdateRoster}
          personnelList={props.commandPersonnel}
          addLogEntry={props.addLogEntry}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EditablePersonnelList
                title="Personal de Línea de Guardia"
                items={props.commandPersonnel}
                onAddItem={props.onAddCommandPersonnel}
                onUpdateItem={props.onUpdateCommandPersonnel}
                onRemoveItem={props.onRemoveCommandPersonnel}
                extraFieldsToShow={['poc']}
                addLogEntry={props.addLogEntry}
            />
             <EditablePersonnelList
                title="Personal de Servicios"
                items={props.servicePersonnel}
                onAddItem={props.onAddServicePersonnel}
                onUpdateItem={props.onUpdateServicePersonnel}
                onRemoveItem={props.onRemoveServicePersonnel}
                extraFieldsToShow={['station', 'detachment', 'poc', 'part']}
                addLogEntry={props.addLogEntry}
            />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <UnitList items={props.units} onUpdateItems={props.onUpdateUnits} addLogEntry={props.addLogEntry} />
             <UnitTypeList items={props.unitTypes} onUpdateItems={props.onUpdateUnitTypes} addLogEntry={props.addLogEntry} />
        </div>
    </div>
  );
};

export default Nomenclador;