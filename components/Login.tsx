import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { LockClosedIcon, EyeIcon, EyeOffIcon } from './icons';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (users.length > 0 && !selectedUserId) {
            setSelectedUserId(users[0].id);
        }
    }, [users, selectedUserId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.id === selectedUserId);
        if (user && user.password === password) {
            setError('');
            onLogin(user);
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-900 flex justify-center items-center p-4">
            <div className="w-full max-w-sm bg-zinc-800 p-8 rounded-2xl shadow-2xl border border-zinc-700 animate-scale-in">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white tracking-wider">BOMBEROS DE LA CIUDAD</h1>
                    <p className="text-zinc-400 mt-1">Sistema de Gestión Operativa</p>
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-zinc-200">Iniciar Sesión</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-zinc-300 mb-1">Usuario</label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="password-input" className="block text-sm font-medium text-zinc-300 mb-1">Contraseña</label>
                         <div className="relative">
                            <input
                                id="password-input"
                                type={isPasswordVisible ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-700 border-zinc-600 rounded-md px-3 pr-10 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="********"
                                autoComplete="current-password"
                            />
                             <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-400 hover:text-white"
                                aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors disabled:opacity-50"
                        disabled={!selectedUserId}
                    >
                        <LockClosedIcon className="w-5 h-5" />
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
