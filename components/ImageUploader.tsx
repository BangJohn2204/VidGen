import React, { useState, useCallback, useMemo } from 'react';
import { UploadCloudIcon, XIcon } from './IconComponents';
import type { ImageUploaderLocale } from '../i18n/locales';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    sourceImage: File | null;
    t: ImageUploaderLocale;
    stepNumber?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onImageRemove, sourceImage, t, stepNumber }) => {
    const [isDragging, setIsDragging] = useState(false);

    const sourceImageUrl = useMemo(() => {
        return sourceImage ? URL.createObjectURL(sourceImage) : null;
    }, [sourceImage]);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (['image/png', 'image/jpeg'].includes(file.type) && file.size <= 10 * 1024 * 1024) {
                onImageSelect(file);
            } else {
                alert(t.fileError);
            }
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);

    return (
        <div id="tour-step-image-uploader" className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-bold flex-shrink-0">{stepNumber || '1'}</span>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 ml-10">
                    {t.subtitle}
                </p>
            </div>
            
            <div className="px-6 pb-6">
                {!sourceImageUrl ? (
                    <label
                        htmlFor={`file-upload-${stepNumber || '1'}`}
                        className={`group block w-full cursor-pointer`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={handleDrop}
                    >
                         <div className={`border-2 border-dashed border-neutral-200 dark:border-neutral-600 rounded-xl p-8 text-center transition-all duration-200 ${isDragging ? 'border-primary-blue bg-sky-50/50 dark:bg-sky-900/20' : 'group-hover:border-primary-blue group-hover:bg-sky-50/30 dark:group-hover:bg-sky-900/10'}`}>
                            <UploadCloudIcon isHovered={isDragging} />
                            <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {t.dragAndDrop}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {t.fileConstraints}
                            </p>
                         </div>
                         <input id={`file-upload-${stepNumber || '1'}`} type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e.target.files)} />
                    </label>
                ) : (
                    <div className="relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                        <img src={sourceImageUrl} alt={t.imagePreviewAlt} className="w-full h-48 object-contain" />
                        <button onClick={onImageRemove} className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-black/80 transition-colors" aria-label={t.removeImage}>
                            <XIcon />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};