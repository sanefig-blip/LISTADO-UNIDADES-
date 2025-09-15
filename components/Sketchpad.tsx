import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PencilSwooshIcon, TrashIcon, CameraIcon, EngineIcon, LadderIcon, AmbulanceIcon, CommandPostIcon, PersonIcon, PlusCircleIcon } from './icons';

interface SketchpadProps {
    isActive: boolean;
    onSketchCapture: (imageDataUrl: string) => void;
}

type Tool = 'select' | 'line' | 'building' | 'text' | 'unit';
type Element = {
    id: number;
    type: 'line' | 'building' | 'text' | 'unit';
    points?: { x: number; y: number }[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    unitType?: string;
    label?: string;
    color: string;
};

const unitConfig = {
    engine: { icon: <EngineIcon className="w-5 h-5"/>, color: 'red' },
    ladder: { icon: <LadderIcon className="w-5 h-5"/>, color: 'blue' },
    ambulance: { icon: <AmbulanceIcon className="w-5 h-5"/>, color: 'green' },
    command: { icon: <CommandPostIcon className="w-5 h-5"/>, color: 'orange' },
    person: { icon: <PersonIcon className="w-5 h-5"/>, color: 'purple' },
};

const Sketchpad: React.FC<SketchpadProps> = ({ isActive, onSketchCapture }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<Element[]>([]);
    const [tool, setTool] = useState<Tool>('select');
    const [lineColor, setLineColor] = useState('#ff0000'); // Red for attack line
    
    // Drawing state
    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    const getMousePos = (e: MouseEvent | React.MouseEvent): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const drawElements = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        elements.forEach(el => {
            ctx.strokeStyle = el.color;
            ctx.fillStyle = el.color;

            if (el.type === 'line' && el.points && el.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(el.points[0].x, el.points[0].y);
                for (let i = 1; i < el.points.length; i++) {
                    ctx.lineTo(el.points[i].x, el.points[i].y);
                }
                ctx.lineWidth = el.color === '#ff0000' ? 3 : 2; // Thicker for attack
                ctx.setLineDash(el.color === '#0000ff' ? [5, 5] : []); // Dashed for supply
                ctx.stroke();
                ctx.setLineDash([]); // Reset
            } else if (el.type === 'building' && el.x && el.y && el.width && el.height) {
                ctx.lineWidth = 2;
                ctx.strokeRect(el.x, el.y, el.width, el.height);
                if (el.text) {
                     ctx.font = '12px sans-serif';
                     ctx.fillStyle = 'white';
                     ctx.textAlign = 'center';
                     ctx.fillText(el.text, el.x + el.width / 2, el.y + el.height / 2);
                }
            } else if (el.type === 'text' && el.x && el.y && el.text) {
                ctx.font = 'bold 14px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'left';
                ctx.fillText(el.text, el.x, el.y);
            }
        });
    }, [elements]);
    
    // Draw on mount and when elements change
    useEffect(() => {
        drawElements();
    }, [elements, drawElements]);
    
    // Resize handler
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'select') return;
        const pos = getMousePos(e);
        setDrawing(true);
        setStartPoint(pos);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!drawing) return;
        // Logic for previewing shapes while drawing could go here
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!drawing) return;
        const endPos = getMousePos(e);

        let newElement: Element | null = null;
        const newId = Date.now();
        
        switch (tool) {
            case 'line':
                newElement = { id: newId, type: 'line', points: [startPoint, endPos], color: lineColor };
                break;
            case 'building':
                const text = prompt("Etiqueta para la estructura (ej: Vivienda):", "Vivienda");
                newElement = { id: newId, type: 'building', x: Math.min(startPoint.x, endPos.x), y: Math.min(startPoint.y, endPos.y), width: Math.abs(startPoint.x - endPos.x), height: Math.abs(startPoint.y - endPos.y), color: 'white', text: text || undefined };
                break;
            case 'text':
                const label = prompt("Ingrese el texto:", "Calle Falsa 123");
                if (label) newElement = { id: newId, type: 'text', x: startPoint.x, y: startPoint.y, text: label, color: 'white' };
                break;
             case 'unit':
                const unitLabel = prompt("Etiqueta para la unidad:", "E-1");
                if (unitLabel) {
                    // This is a simplification. A real implementation would use draggable icons, not canvas drawing.
                    // For now, let's add a placeholder.
                    newElement = { id: newId, type: 'text', x: startPoint.x, y: startPoint.y, text: `[U] ${unitLabel}`, color: 'yellow' };
                }
                break;
        }

        if (newElement) {
            setElements(prev => [...prev, newElement]);
        }
        
        setDrawing(false);
    };

    const clearCanvas = () => {
        if (window.confirm("¿Está seguro de que desea borrar todo el boceto?")) {
            setElements([]);
        }
    };

     const handleValidate = () => {
        const canvas = canvasRef.current;
        if(canvas) {
            onSketchCapture(canvas.toDataURL('image/png'));
            alert("Boceto validado para el reporte.");
        }
    };

    return (
        <div className="flex flex-col gap-4 h-[80vh]">
            <div className="bg-zinc-800/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setTool('line')} className={`px-3 py-2 rounded text-sm ${tool === 'line' ? 'bg-blue-600' : 'bg-zinc-700'}`}>Línea</button>
                    <button onClick={() => setTool('building')} className={`px-3 py-2 rounded text-sm ${tool === 'building' ? 'bg-blue-600' : 'bg-zinc-700'}`}>Estructura</button>
                    <button onClick={() => setTool('text')} className={`px-3 py-2 rounded text-sm ${tool === 'text' ? 'bg-blue-600' : 'bg-zinc-700'}`}>Texto</button>
                    <button onClick={() => setTool('unit')} className={`px-3 py-2 rounded text-sm ${tool === 'unit' ? 'bg-blue-600' : 'bg-zinc-700'}`}>Unidad</button>
                    <select value={lineColor} onChange={e => setLineColor(e.target.value)} className="bg-zinc-700 rounded p-2 text-sm">
                        <option value="#ff0000">Línea de Ataque (Roja)</option>
                        <option value="#0000ff">Línea de Abastecimiento (Azul)</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={clearCanvas} className="p-2 bg-red-600 hover:bg-red-500 rounded-md text-white" title="Limpiar Todo"><TrashIcon className="w-5 h-5" /></button>
                     <button onClick={handleValidate} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-semibold" title="Validar Boceto"><CameraIcon className="w-5 h-5" />Validar para Reporte</button>
                </div>
            </div>
             <div className="flex-grow w-full h-full bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-700">
                 <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setDrawing(false)}
                />
            </div>
        </div>
    );
};

export default Sketchpad;