import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PencilSwooshIcon, TrashIcon, CameraIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, CubeIcon, ArrowUturnLeftIcon } from './icons.js';

const unitConfig = {
    autobomba: { icon: React.createElement(EngineIcon, { className: "w-5 h-5" }), color: '#dc2626', defaultLabel: 'E-1' },
    hidroelevador: { icon: React.createElement(LadderIcon, { className: "w-5 h-5" }), color: '#2563eb', defaultLabel: 'H-1' },
    ambulancia: { icon: React.createElement(AmbulanceIcon, { className: "w-5 h-5" }), color: '#16a34a', defaultLabel: 'A-1' },
    comando: { icon: React.createElement(CommandPostIcon, { className: "w-5 h-5" }), color: '#ea580c', defaultLabel: 'PC-1' },
    personal: { icon: React.createElement(PersonIcon, { className: "w-5 h-5" }), color: '#9333ea', defaultLabel: 'P-1' },
};

const Sketchpad = ({ isActive, onSketchCapture }) => {
    const canvasRef = useRef(null);
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTool, setActiveTool] = useState('draw');

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState(null);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };
    
    const drawGrid = (ctx, width, height) => {
        ctx.strokeStyle = '#e5e7eb'; // zinc-200
        ctx.lineWidth = 0.5;
        const gridSize = 20;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const drawElements = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawGrid(ctx, canvas.width, canvas.height);

        elements.forEach(el => {
            ctx.strokeStyle = el.color;
            ctx.fillStyle = el.color;
            ctx.lineWidth = el.lineWidth;
            ctx.setLineDash(el.lineDash || []);

            if (el.type === 'path' && el.points && el.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(el.points[0].x, el.points[0].y);
                el.points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            } else if (el.type === 'building' && el.width && el.height) {
                ctx.strokeRect(el.x, el.y, el.width, el.height);
                if (el.text) {
                     ctx.font = '12px sans-serif';
                     ctx.fillStyle = '#18181b'; // zinc-900
                     ctx.textAlign = 'center';
                     ctx.textBaseline = 'middle';
                     ctx.fillText(el.text, el.x + el.width / 2, el.y + el.height / 2);
                }
            } else if (el.type === 'text' && el.text) {
                ctx.font = 'bold 14px sans-serif';
                ctx.fillStyle = '#18181b';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(el.text, el.x, el.y);
            } else if (el.type === 'block') {
                 const blockWidth = 80;
                 const blockHeight = 80;
                 const streetWidth = 20;
                 ctx.fillStyle = '#e4e4e7'; // zinc-200 for blocks
                 ctx.strokeStyle = '#a1a1aa'; // zinc-500 for stroke
                 ctx.lineWidth = 1;
                 
                 const blocks = [
                    { x: el.x - streetWidth / 2 - blockWidth, y: el.y - streetWidth / 2 - blockHeight },
                    { x: el.x + streetWidth / 2, y: el.y - streetWidth / 2 - blockHeight },
                    { x: el.x - streetWidth / 2 - blockWidth, y: el.y + streetWidth / 2 },
                    { x: el.x + streetWidth / 2, y: el.y + streetWidth / 2 },
                 ];

                 blocks.forEach(block => {
                    ctx.fillRect(block.x, block.y, blockWidth, blockHeight);
                    ctx.strokeRect(block.x, block.y, blockWidth, blockHeight);
                 });
            }
        });
        
        if (currentPath) {
             ctx.strokeStyle = currentPath.color;
             ctx.lineWidth = currentPath.lineWidth;
             ctx.setLineDash(currentPath.lineDash || []);
             ctx.beginPath();
             ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
             currentPath.points.forEach(p => ctx.lineTo(p.x, p.y));
             ctx.stroke();
        }
        ctx.setLineDash([]);
    }, [elements, currentPath]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        const setCanvasSize = () => {
            const parent = canvas.parentElement;
            if(parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                drawElements();
            }
        };
        setCanvasSize();
        const resizeObserver = new ResizeObserver(setCanvasSize);
        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }
        return () => resizeObserver.disconnect();
    }, [isActive, drawElements]);

    const saveHistory = () => {
        setHistory(prev => [...prev.slice(-20), elements]);
    };
    
    const undo = () => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setElements(lastState);
            setHistory(prev => prev.slice(0, -1));
        }
    };
    
    const handleMouseDown = (e) => {
        saveHistory();
        const pos = getMousePos(e);
        setIsDrawing(true);
        
        const toolProps = {
            'draw': { color: '#3f3f46', lineWidth: 2, lineDash: [] },
            'lineAttack': { color: '#ef4444', lineWidth: 4, lineDash: [] },
            'lineSupply': { color: '#3b82f6', lineWidth: 3, lineDash: [8, 6] },
        }[activeTool];

        if (toolProps) {
            setCurrentPath({ points: [pos], ...toolProps });
        } else if (activeTool === 'eraser') {
            const hitElementIndex = elements.findIndex(el => {
                const PADDING = 10;
                if (el.type === 'path') {
                    return el.points?.some(p => Math.abs(p.x - pos.x) < PADDING && Math.abs(p.y - pos.y) < PADDING);
                }
                return pos.x >= el.x - PADDING && pos.x <= el.x + (el.width || 0) + PADDING && pos.y >= el.y - PADDING && pos.y <= el.y + (el.height || 0) + PADDING;
            });

            if (hitElementIndex > -1) {
                setElements(prev => prev.filter((_, index) => index !== hitElementIndex));
            }

        } else if (activeTool === 'unit') {
            const type = prompt("Tipo de unidad (autobomba, hidroelevador, ambulancia, comando, personal):", "autobomba")?.toLowerCase();
            if (type && unitConfig[type]) {
                const label = prompt("Etiqueta:", unitConfig[type].defaultLabel);
                if (label) {
                    const textEl = { id: Date.now(), type: 'text', text: label, x: pos.x + 18, y: pos.y + 4, color: '#ffffff', lineWidth: 1 };
                    const unitEl = { id: Date.now() + 1, type: 'building', x: pos.x, y: pos.y, width: 32, height: 32, color: unitConfig[type].color, lineWidth: 2 };
                    setElements(prev => [...prev, unitEl, textEl]);
                }
            }
        } else if (activeTool === 'building' || activeTool === 'text' || activeTool === 'block') {
             const label = activeTool === 'building' ? prompt("Etiqueta para la estructura:", "Vivienda") : 
                           activeTool === 'text' ? prompt("Ingrese el texto:") : null;
            if (activeTool !== 'block' && !label) {
                setIsDrawing(false);
                return;
            }
            const newElement = {
                id: Date.now(),
                type: activeTool,
                x: pos.x,
                y: pos.y,
                text: label || undefined,
                color: '#a1a1aa',
                lineWidth: 2
            };
            setElements(prev => [...prev, newElement]);
            setActiveTool('select');
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || !currentPath) return;
        const pos = getMousePos(e);
        setCurrentPath(prev => prev ? ({...prev, points: [...prev.points, pos]}) : null);
        drawElements(); // Redraw for live preview
    };

    const handleMouseUp = () => {
        if (currentPath && currentPath.points.length > 1) {
            setElements(prev => [...prev, {
                id: Date.now(),
                type: 'path',
                points: currentPath.points,
                color: currentPath.color,
                lineWidth: currentPath.lineWidth,
                lineDash: currentPath.lineDash,
                x: currentPath.points[0].x,
                y: currentPath.points[0].y
            }]);
        }
        setIsDrawing(false);
        setCurrentPath(null);
    };

    const clearCanvas = () => {
        if (window.confirm("¿Está seguro de que desea borrar todo el boceto?")) {
            saveHistory();
            setElements([]);
        }
    };
    
    const handleValidate = () => {
        const canvas = canvasRef.current;
        if(canvas) {
            onSketchCapture(canvas.toDataURL('image/png'));
        }
    };
    
    const ToolButton = ({ tool, label, icon }) => (
        React.createElement("button", {
            onClick: () => setActiveTool(tool),
            className: `flex items-center justify-center flex-col text-center gap-1 p-2 rounded-md transition-colors text-xs w-20 h-16 ${activeTool === tool ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`,
            title: label
        },
            icon,
            React.createElement("span", null, label)
        )
    );

    return (
        React.createElement("div", { className: "flex flex-col gap-4 h-[80vh]" },
            React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4" },
                React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                    React.createElement(ToolButton, { tool: "draw", label: "Lápiz", icon: React.createElement(PencilSwooshIcon, { className: "w-5 h-5"}) }),
                    React.createElement(ToolButton, { tool: "lineAttack", label: "Línea Ataque", icon: React.createElement("div", { className: "w-5 h-1.5 bg-red-500 rounded-full" }) }),
                    React.createElement(ToolButton, { tool: "lineSupply", label: "Línea Transf.", icon: React.createElement("div", { className: "w-5 h-1.5 border-t-2 border-dashed border-blue-500" }) }),
                    React.createElement(ToolButton, { tool: "unit", label: "Unidad", icon: React.createElement(EngineIcon, { className: "w-5 h-5"}) }),
                    React.createElement(ToolButton, { tool: "building", label: "Estructura", icon: React.createElement("div", { className: "w-5 h-5 border-2 border-current" }) }),
                    React.createElement(ToolButton, { tool: "text", label: "Texto", icon: React.createElement("span", { className: "font-bold text-lg" }, "T") }),
                    React.createElement(ToolButton, { tool: "block", label: "Manzana", icon: React.createElement(CubeIcon, { className: "w-5 h-5"}) }),
                    React.createElement(ToolButton, { tool: "eraser", label: "Borrador", icon: React.createElement(TrashIcon, { className: "w-5 h-5"}) })
                ),
                React.createElement("div", { className: "flex items-center gap-2" },
                     React.createElement("button", { onClick: undo, className: "p-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white", title: "Deshacer" }, React.createElement(ArrowUturnLeftIcon, { className: "w-5 h-5" })),
                     React.createElement("button", { onClick: handleValidate, className: "flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-semibold", title: "Validar Boceto" }, React.createElement(CameraIcon, { className: "w-5 h-5" }), "Validar")
                )
            ),
             React.createElement("div", { className: "flex-grow w-full h-full bg-white rounded-lg overflow-hidden border-2 border-zinc-700" },
                 React.createElement("canvas", {
                    ref: canvasRef,
                    className: `w-full h-full ${activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`,
                    onMouseDown: handleMouseDown,
                    onMouseMove: handleMouseMove,
                    onMouseUp: handleMouseUp,
                    onMouseLeave: handleMouseUp
                })
            )
        )
    );
};

export default Sketchpad;
