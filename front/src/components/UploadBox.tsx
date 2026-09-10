import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, ImagePlus } from 'lucide-react';

interface UploadBoxProps {
  images: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  maxSizeMb?: number;
  onError?: (message: string) => void;
  className?: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({ images, onAdd, onRemove, maxImages = 5, maxSizeMb = 8, onError, className = '' }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const candidates = Array.from(files);
    const invalidType = candidates.some((file) => !file.type.startsWith('image/'));
    const tooLarge = candidates.some((file) => file.size > maxSizeMb * 1024 * 1024);
    if (invalidType) onError?.('Only image files can be uploaded.');
    if (tooLarge) onError?.(`Each image must be smaller than ${maxSizeMb} MB.`);
    const allowed = candidates
      .filter((file) => file.type.startsWith('image/') && file.size <= maxSizeMb * 1024 * 1024)
      .slice(0, maxImages - images.length);
    if (allowed.length > 0) onAdd(allowed);
  }, [images.length, maxImages, maxSizeMb, onAdd, onError]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Drop Zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
          style={{
            borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
            backgroundColor: isDragging ? 'var(--primary-subtle)' : 'var(--background)',
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileRef.current?.click();
            }
          }}
          aria-label="Upload images"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)' }}>
            <ImagePlus size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Drag & drop images here
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              or click to upload from device
            </p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <Upload size={12} /> Upload
            </span>
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <Camera size={12} /> Camera
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {images.length}/{maxImages} images
          </p>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                aria-label="Remove image"
              >
                <X size={10} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
};

export default UploadBox;
