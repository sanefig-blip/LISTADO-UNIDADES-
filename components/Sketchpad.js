import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PencilSwooshIcon, TrashIcon, CameraIcon } from './icons.js';

const Sketchpad = ({ isActive, onSketchCapture }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#ffde03'); // Yellow
    const [lineWidth, setLineWidth] = useState(3);
    const [points, setPoints] = useState([]);
    
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const storedDrawing = localStorage.getItem('sketchpadDrawing');
        if (storedDrawing) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                // Draw points on top of the restored drawing
                 points.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
                    ctx.fillStyle = point.color;
                    ctx.fill();
                });
            };
            img.src = storedDrawing;
        } else {
             // Draw points even if there's no stored drawing
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
                ctx.fillStyle = point.color;
                ctx.fill();
            });
        }

    }, [points]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        const setCanvasSize = () => {
            const parent = canvas.parentElement;
            if(parent) {
                // Save current drawing before resizing
                const currentDrawing = canvas.toDataURL();
                
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                
                // Redraw from saved state after resizing
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);
                };
                img.src = currentDrawing;
            }
        };

        setCanvasSize();
        
        const storedPoints = localStorage.getItem('sketchpadPoints');
        if (storedPoints) {
            setPoints(JSON.parse(storedPoints));
        } else {
            draw(); // initial draw
        }

        const resizeObserver = new ResizeObserver(() => {
            setCanvasSize();
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        return () => {
            resizeObserver.disconnect();
        };

    }, [draw, isActive]);
    
    useEffect(() => {
        localStorage.setItem('sketchpadPoints', JSON.stringify(points));
        draw();
    }, [points, draw]);

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        if (window.TouchEvent && e instanceof TouchEvent && e.touches[0]) {
             return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else if (e instanceof MouseEvent) {
             return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        return { x: 0, y: 0 };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getMousePos(e.nativeEvent);
        
        if (tool === 'point') {
            const newPoint = { x, y, color, radius: lineWidth + 4 };
            setPoints(prev => [...prev, newPoint]);
            // Draw point immediately
            ctx.beginPath();
            ctx.arc(newPoint.x, newPoint.y, newPoint.radius, 0, 2 * Math.PI);
            ctx.fillStyle = newPoint.color;
            ctx.fill();
            localStorage.setItem('sketchpadDrawing', canvas.toDataURL());
            return;
        }

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const drawMove = (e) => {
        e.preventDefault();
        if (!isDrawing || tool === 'point') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { x, y } = getMousePos(e.nativeEvent);

        if (tool === 'eraser') {
            ctx.clearRect(x - 15, y - 15, 30, 30);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.closePath();
        setIsDrawing(false);
        if (tool === 'pencil' || tool === 'eraser') {
            localStorage.setItem('sketchpadDrawing', canvas.toDataURL());
        }
    };

    const clearCanvas = () => {
        if (window.confirm("¿Está seguro de que desea borrar todo el boceto?")) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            localStorage.removeItem('sketchpadDrawing');
            localStorage.removeItem('sketchpadPoints');
            setPoints([]);
        }
    };
    
    const handleValidate = () => {
        const canvas = canvasRef.current;
        if(canvas) {
            onSketchCapture(canvas.toDataURL('image/png'));
            alert("Boceto validado para el reporte.");
        }
    };

    const ToolButton = ({ toolName, label, icon }) => (
        React.createElement("button", {
            onClick: () => setTool(toolName),
            className: `p-2 rounded-md transition-colors flex flex-col items-center text-xs w-20 ${tool === toolName ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}`,
            title: label
        },
            icon,
            React.createElement("span", { className: "mt-1" }, label)
        )
    );

    return (
        React.createElement("div", { className: "flex flex-col gap-4 h-[80vh]" },
             React.createElement("div", { className: "bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4" },
                React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                    React.createElement(ToolButton, { toolName: "pencil", label: "Lápiz", icon: React.createElement(PencilSwooshIcon, { className: "w-6 h-6" }) }),
                    React.createElement(ToolButton, { toolName: "point", label: "Punto", icon: React.createElement("div", { className: "w-6 h-6 rounded-full border-2 border-dashed border-zinc-400" }) }),
                    React.createElement(ToolButton, { toolName: "eraser", label: "Borrador", icon: React.createElement("div", { className: "w-6 h-6 bg-zinc-400 rounded" }) }),
                    
                    React.createElement("div", { className: "flex items-center gap-2 ml-4" },
                        React.createElement("label", { htmlFor: "color-picker", className: "text-sm font-medium text-zinc-300" }, "Color:"),
                        React.createElement("input", { id: "color-picker", type: "color", value: color, onChange: e => setColor(e.target.value), className: "w-10 h-10 bg-transparent border-none rounded-md cursor-pointer" })
                    ),
                     React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("label", { htmlFor: "line-width", className: "text-sm font-medium text-zinc-300" }, "Grosor:"),
                        React.createElement("input", { id: "line-width", type: "range", min: "1", max: "10", value: lineWidth, onChange: e => setLineWidth(Number(e.target.value)) })
                    )
                ),
                React.createElement("div", { className: "flex items-center gap-2" },
                     React.createElement("button", { onClick: clearCanvas, className: "p-2 bg-red-600 hover:bg-red-500 rounded-md text-white", title: "Limpiar Todo" }, React.createElement(TrashIcon, { className: "w-5 h-5" })),
                     React.createElement("button", { onClick: handleValidate, className: "flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-semibold", title: "Validar Boceto" }, React.createElement(CameraIcon, { className: "w-5 h-5" }), "Validar para Reporte")
                )
            ),
            React.createElement("div", { className: "flex-grow w-full h-full bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700" },
                 React.createElement("canvas", {
                    ref: canvasRef,
                    className: "w-full h-full cursor-crosshair",
                    onMouseDown: startDrawing,
                    onMouseMove: drawMove,
                    onMouseUp: stopDrawing,
                    onMouseLeave: stopDrawing,
                    onTouchStart: startDrawing,
                    onTouchMove: drawMove,
                    onTouchEnd: stopDrawing
                })
            )
        )
    );
};

export default Sketchpad;
