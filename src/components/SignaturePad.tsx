import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Check, Upload, RefreshCw } from 'lucide-react';

interface SignaturePadProps {
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  savedProfileSignature?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  initialSignature,
  onSave,
  savedProfileSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>(initialSignature || savedProfileSignature || '');
  const [mode, setMode] = useState<'saved' | 'draw' | 'upload'>(
    savedProfileSignature ? 'saved' : 'draw'
  );

  useEffect(() => {
    if (initialSignature) {
      setCurrentSignature(initialSignature);
      setMode('saved');
    } else if (savedProfileSignature) {
      setCurrentSignature(savedProfileSignature);
      setMode('saved');
    }
  }, [initialSignature, savedProfileSignature]);

  useEffect(() => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle high DPI
      const ratio = Math.ceil(window.devicePixelRatio || 1);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.scale(ratio, ratio);
      ctx.strokeStyle = '#1e3a8a'; // Deep blue government ink
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [mode]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCurrentSignature(dataUrl);
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setCurrentSignature('');
    onSave('');
  };

  const handleUseSaved = () => {
    if (savedProfileSignature) {
      setMode('saved');
      setCurrentSignature(savedProfileSignature);
      onSave(savedProfileSignature);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCurrentSignature(dataUrl);
        setMode('upload');
        onSave(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Option selection tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {savedProfileSignature && (
          <button
            type="button"
            onClick={handleUseSaved}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'saved'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ใช้ลายเซ็นในระบบ
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setMode('draw');
          }}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            mode === 'draw'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          วาดลายเซ็นสดใหม่
        </button>
        <label className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition flex items-center gap-1 ${
          mode === 'upload'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}>
          <Upload className="w-3.5 h-3.5" />
          อัปโหลดรูปภาพ
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Main signature container */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden transition-all hover:border-blue-400">
        {mode === 'draw' ? (
          <div>
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className="w-full h-36 bg-white cursor-crosshair touch-none"
            />
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-t border-slate-200 text-xs text-slate-500">
              <span>ลงลายมือชื่อในกรอบสี่เหลี่ยมด้านบน</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                ล้างลายเซ็น
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-36 flex flex-col items-center justify-center bg-white p-3">
            {currentSignature ? (
              <div className="flex flex-col items-center">
                <img
                  src={currentSignature}
                  alt="ลายมือชื่ออิเล็กทรอนิกส์"
                  className="max-h-24 max-w-[240px] object-contain drop-shadow-sm"
                />
                <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> ลายเซ็นพร้อมใช้งาน
                </span>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">ยังไม่มีลายเซ็น กรุณาวาดหรืออัปโหลด</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
