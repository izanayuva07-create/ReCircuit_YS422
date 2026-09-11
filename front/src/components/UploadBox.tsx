import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, ImagePlus, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface BoxDetection {
  id: string;
  label: string;
  classId: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  material: string;
  salvageAction: string;
  hazardRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface UploadBoxProps {
  images: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  maxSizeMb?: number;
  onError?: (message: string) => void;
  className?: string;
  isScanning?: boolean;
  activeDetections?: BoxDetection[];
  onTriggerScan?: () => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({
  images,
  onAdd,
  onRemove,
  maxImages = 5,
  maxSizeMb = 12,
  onError,
  className = '',
  isScanning = false,
  activeDetections = [],
  onTriggerScan,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  // Clamp active index
  const currentImage = images[Math.min(activeIdx, Math.max(0, images.length - 1))];

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const candidates = Array.from(files);
      const invalidType = candidates.some((file) => !file.type.startsWith('image/'));
      const tooLarge = candidates.some((file) => file.size > maxSizeMb * 1024 * 1024);
      if (invalidType) onError?.('Only image files (JPG, PNG, WebP) can be uploaded.');
      if (tooLarge) onError?.(`Each image must be smaller than ${maxSizeMb} MB.`);
      const allowed = candidates
        .filter((file) => file.type.startsWith('image/') && file.size <= maxSizeMb * 1024 * 1024)
        .slice(0, maxImages - images.length);
      if (allowed.length > 0) {
        onAdd(allowed);
        setActiveIdx(images.length); // point to new upload
      }
    },
    [images.length, maxImages, maxSizeMb, onAdd, onError],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (i: number) => {
    onRemove(i);
    if (activeIdx >= i && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Main Dotted Frame */}
      {currentImage ? (
        <div
          className="relative min-h-[380px] sm:min-h-[440px] w-full rounded-2xl border-2 border-dashed border-emerald-500/70 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center select-none"
          style={{
            boxShadow: isScanning
              ? '0 0 35px rgba(16, 185, 129, 0.25), inset 0 0 20px rgba(16, 185, 129, 0.15)'
              : '0 10px 30px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Target Corner Reticles */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400 z-20 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400 z-20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400 z-20 pointer-events-none" />

          {/* Precision Crosshair in Center when Scanning */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-16 h-16 rounded-full border border-emerald-400/40 animate-ping" />
            </div>
          )}

          {/* Active Image Filling the Dotted Box */}
          <img
            src={currentImage}
            alt="Asset under inspection"
            className="w-full h-full max-h-[480px] object-contain transition-all duration-300"
            style={{
              filter: isScanning ? 'brightness(0.85) contrast(1.1)' : 'none',
            }}
          />

          {/* Top Status Bar Inside Dotted Box */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-emerald-500/40 text-xs text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isScanning ? 'YOLOv8 & DINOv2 Scanning…' : activeDetections.length > 0 ? `${activeDetections.length} Components Segmented` : 'Asset Ready for Inspection'}</span>
            </div>

            <div className="flex items-center gap-2">
              {onTriggerScan && !isScanning && (
                <button
                  type="button"
                  onClick={onTriggerScan}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-all"
                  title="Run deep neural optical inspection"
                >
                  <RefreshCw size={12} />
                  Re-Scan
                </button>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium backdrop-blur-md transition-all"
                title="Change or upload different photo"
              >
                <Upload size={12} /> Replace
              </button>
              <button
                type="button"
                onClick={() => handleRemove(activeIdx)}
                className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-red-600/90 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center text-xs backdrop-blur-md transition-all"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Animated Laser Scanning Line */}
          {isScanning && <div className="laser-scan-line" />}

          {/* YOLOv8 Component Bounding Boxes Overlay */}
          {!isScanning && activeDetections.map((det) => {
            const [ymin, xmin, ymax, xmax] = det.box;
            const topPct = `${ymin / 10}%`;
            const leftPct = `${xmin / 10}%`;
            const heightPct = `${(ymax - ymin) / 10}%`;
            const widthPct = `${(xmax - xmin) / 10}%`;
            const isHovered = hoveredBox === det.id;

            const isHazard = det.hazardRisk === 'HIGH' || det.hazardRisk === 'CRITICAL';
            const boxBorder = isHazard ? 'border-amber-400' : 'border-emerald-400';
            const boxBg = isHazard ? 'bg-amber-500/15' : 'bg-emerald-500/15';
            const badgeBg = isHazard ? 'bg-amber-600' : 'bg-emerald-600';

            return (
              <div
                key={det.id}
                onMouseEnter={() => setHoveredBox(det.id)}
                onMouseLeave={() => setHoveredBox(null)}
                className={`absolute border-2 rounded-lg transition-all cursor-pointer z-20 ${boxBorder} ${boxBg} ${
                  isHovered ? 'ring-4 ring-emerald-400/40 scale-[1.01]' : ''
                }`}
                style={{
                  top: topPct,
                  left: leftPct,
                  height: heightPct,
                  width: widthPct,
                }}
              >
                {/* Detection Tag */}
                <div
                  className={`absolute -top-6 left-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-md flex items-center gap-1 whitespace-nowrap pointer-events-none ${badgeBg}`}
                >
                  {isHazard && <ShieldAlert size={10} />}
                  <span>{det.label}</span>
                  <span className="opacity-80">({Math.round(det.confidence * 100)}%)</span>
                </div>

                {/* Detailed Hover Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full mb-2 left-0 w-60 p-2.5 rounded-xl bg-slate-900/95 border border-emerald-500 text-white text-xs shadow-2xl backdrop-blur-xl z-50 pointer-events-none"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                  >
                    <div className="font-bold text-emerald-300 flex items-center justify-between">
                      <span>{det.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">Box: {det.classId}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-300">
                      <span className="text-slate-400">Material:</span> {det.material}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-300">
                      <span className="text-slate-400">Salvage Action:</span> {det.salvageAction}
                    </div>
                    {det.hazardRisk && (
                      <div className="mt-1 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                        <ShieldAlert size={11} /> Hazard Risk: {det.hazardRisk}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom HUD Bar */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
              YOLOv8-EWaste-Segmenter · DINOv2-ViT-B/14
            </span>
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
              Calibrated Field of View: 100%
            </span>
          </div>
        </div>
      ) : (
        /* Empty State Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900/40'
          }`}
          aria-label="Upload electronic asset photo"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-inner">
            <ImagePlus size={32} />
          </div>

          <div className="text-center max-w-sm">
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">
              Drop asset photo here or click to browse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Upload motherboards, phones, batteries, or laptops. The AI scanning frame will auto-detect components and extract precious metal yields.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm">
              <Upload size={14} /> Browse Files
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm">
              <Camera size={14} /> Camera Capture
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            Supported: JPG, PNG, WebP · Max 12MB · CPCB Compliant
          </p>
        </div>
      )}

      {/* Thumbnails Row */}
      {images.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5">
          {images.map((src, i) => {
            const isSelected = i === activeIdx;
            return (
              <div
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105 shadow-md' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-end justify-end p-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                )}
              </div>
            );
          })}

          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-500 flex flex-col items-center justify-center gap-1 transition-all flex-shrink-0 text-[10px] font-medium"
            >
              <ImagePlus size={16} />
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
