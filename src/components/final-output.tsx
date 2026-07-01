import { useRef, type FC } from "react";
import { ArrowLeft, Download, Palette } from "lucide-react";
import ParticlePortrait from "./particles";
import AsciiPortrait from "./ascii";
import { type GenerationMode } from "../pages/home";

interface FinalOutputProps {
    imageSrc: string;
    particleColor: string;
    onColorChange: (color: string) => void;
    onBack: () => void;
    mode: GenerationMode;
}

const FinalOutput: FC<FinalOutputProps> = ({ imageSrc, particleColor, onColorChange, onBack, mode }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleDownload = (): void => {
        const canvas = wrapperRef.current?.querySelector("canvas");
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = "particle-portrait.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="w-full flex flex-col items-center gap-8">
            {/* Canvas wrapper */}
            <div
                ref={wrapperRef}
                className="rounded-[32px] overflow-hidden bg-dark-bg ring-1 ring-dark-border"
            >
                {mode === "particles" ? (
                    <ParticlePortrait imageSrc={imageSrc} particleColor={particleColor} />
                ) : (
                    <AsciiPortrait imageSrc={imageSrc} particleColor={particleColor} />
                )}
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center min-h-[16px]">
                Hover or touch the canvas to interact with the art
            </p>

            {/* Controls card */}
            <div className="w-full max-w-md rounded-[24px] border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6">
                {/* Color picker */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Palette size={16} />
                        <span className="text-sm font-medium">{mode === "particles" ? "Particle color" : "Text color"}</span>
                    </div>
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

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 rounded-full text-sm font-medium border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        New Image
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 py-3 rounded-full text-sm font-semibold bg-lavender-dark hover:bg-lavender text-white hover:text-gray-900 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinalOutput;
