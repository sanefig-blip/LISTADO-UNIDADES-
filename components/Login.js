import React, { useState, useEffect } from 'react';
import { LockClosedIcon, EyeIcon, EyeOffIcon } from './icons.js';

const Login = ({ onLogin, users }) => {
    const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (users.length > 0 && !selectedUserId) {
            setSelectedUserId(users[0].id);
        }
    }, [users, selectedUserId]);

    const handleSubmit = (e) => {
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
        React.createElement("div", { className: "fixed inset-0 bg-zinc-900 flex justify-center items-center p-4" },
            React.createElement("div", { className: "w-full max-w-sm bg-zinc-800 p-8 rounded-2xl shadow-2xl border border-zinc-700 animate-scale-in" },
                React.createElement("div", { className: "text-center mb-8" },
                    React.createElement("img", { src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Escudo_de_Bomberos_de_la_Ciudad_de_Buenos_Aires.png", alt: "Escudo Bomberos", className: "h-20 mx-auto mb-4" }),
                    React.createElement("h1", { className: "text-2xl font-bold text-white" }, "Iniciar Sesión"),
                    React.createElement("p", { className: "text-zinc-400" }, "Sistema de Gestión Operativa")
                ),
                React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                    React.createElement("div", null,
                        React.createElement("label", { htmlFor: "user-select", className: "block text-sm font-medium text-zinc-300 mb-1" }, "Usuario"),
                        React.createElement("select", {
                            id: "user-select",
                            value: selectedUserId,
                            onChange: (e) => setSelectedUserId(e.target.value),
                            className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        },
                            users.map(user => (
                                React.createElement("option", { key: user.id, value: user.id }, user.username)
                            ))
                        )
                    ),
                     React.createElement("div", null,
                        React.createElement("label", { htmlFor: "password-input", className: "block text-sm font-medium text-zinc-300 mb-1" }, "Contraseña"),
                        React.createElement("div", { className: "relative" },
                            React.createElement("input", {
                                id: "password-input",
                                type: isPasswordVisible ? 'text' : 'password',
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                className: "w-full bg-zinc-700 border-zinc-600 rounded-md px-3 pr-10 py-2 text-white focus:ring-blue-500 focus:border-blue-500",
                                placeholder: "********",
                                autoComplete: "current-password"
                            }),
                            React.createElement("button", {
                                type: "button",
                                onClick: () => setIsPasswordVisible(!isPasswordVisible),
                                className: "absolute inset-y-0 right-0 px-3 flex items-center text-zinc-400 hover:text-white",
                                "aria-label": isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                            },
                                isPasswordVisible ? React.createElement(EyeOffIcon, { className: "w-5 h-5" }) : React.createElement(EyeIcon, { className: "w-5 h-5" })
                            )
                        )
                    ),
                    error && React.createElement("p", { className: "text-sm text-red-400 text-center" }, error),
                    React.createElement("button", {
                        type: "submit",
                        className: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors disabled:opacity-50",
                        disabled: !selectedUserId
                    },
                        React.createElement(LockClosedIcon, { className: "w-5 h-5" }),
                        "Ingresar"
                    )
                )
            )
        )
    );
};

export default Login;