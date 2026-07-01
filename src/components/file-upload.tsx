import { useState, useRef, useCallback, type FC, type DragEvent, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";

import { type GenerationMode } from "../pages/home";

interface FileUploadProps {
    onImageSelect: (dataUrl: string) => void;
    particleColor: string;
    onColorChange: (color: string) => void;
    mode: GenerationMode;
    onModeChange: (mode: GenerationMode) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const FileUpload: FC<FileUploadProps> = ({ onImageSelect, particleColor, onColorChange, mode, onModeChange }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(
        (file: File) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                alert("Please upload a JPG, JPEG, or PNG image.");
                return;
            }

            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPreview(result);
            };
            reader.readAsDataURL(file);
        },
        []
    );

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        },
        [processFile]
    );

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
        },
        [processFile]
    );

    const handleGenerate = () => {
        if (preview) onImageSelect(preview);
    };

    const handleReset = () => {
        setPreview(null);
        setFileName("");
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`
                    relative rounded-[32px] border-2 border-dashed cursor-pointer
                    transition-all duration-300 group
                    ${isDragging
                        ? "border-lavender bg-lavender-muted dark:bg-lavender/5 scale-[1.01]"
                        : "border-gray-300 dark:border-dark-border hover:border-lavender dark:hover:border-lavender bg-white dark:bg-dark-surface"
                    }
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="hidden"
                />

                {preview ? (
                    <div className="p-8 flex flex-col items-center gap-5">
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-60 rounded-2xl object-contain"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReset();
                                }}
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-full">
                            {fileName}
                        </p>
                    </div>
                ) : (
                    <div className="px-8 py-16 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-lavender-muted dark:bg-lavender/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload size={26} className="text-lavender-dark" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-gray-900 dark:text-gray-100 font-medium text-lg">
                                Drop your image here
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                or{" "}
                                <span className="text-lavender-dark underline underline-offset-2">
                                    browse files
                                </span>{" "}
                                · JPG, JPEG, PNG
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Color picker & actions */}
            {preview && (
                <div className="rounded-[24px] border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 space-y-5">
                    {/* Mode selector */}
                    <div className="flex bg-gray-100 dark:bg-dark-bg p-1 rounded-full w-full">
                        <button
                            onClick={() => onModeChange("particles")}
                            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${mode === "particles" ? "bg-white dark:bg-dark-surface shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                        >
                            Particles
                        </button>
                        <button
                            onClick={() => onModeChange("ascii")}
                            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${mode === "ascii" ? "bg-white dark:bg-dark-surface shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                        >
                            ASCII Art
                        </button>
                    </div>

                    {/* Color picker */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {mode === "particles" ? "Particle color" : "Text color"}
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase">
                                {particleColor}
                            </span>
                            <input
                                type="color"
                                value={particleColor}
                                onChange={(e) => onColorChange(e.target.value)}
                                className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-dark-border cursor-pointer bg-transparent p-0.5"
                            />
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        className="w-full py-3.5 rounded-full text-sm font-semibold bg-lavender-dark hover:bg-lavender text-white hover:text-gray-900 transition-all cursor-pointer"
                    >
                        {mode === "particles" ? "Generate Particles ✨" : "Generate ASCII ✨"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
