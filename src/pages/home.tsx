import { useState, type FC } from "react";
import FileUpload from "../components/file-upload";
import FinalOutput from "../components/final-output";

const DEFAULT_COLOR = "#64ffda";

const Home: FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [particleColor, setParticleColor] = useState<string>(DEFAULT_COLOR);

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-10">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="font-serif text-5xl sm:text-6xl text-gray-900 dark:text-gray-100 leading-tight">
                    Turn any image into{" "}
                    <em className="text-lavender-dark">particles</em>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-md mx-auto">
                    Upload a photo and watch it come alive as an interactive particle animation.
                </p>
            </div>

            {/* Content */}
            {imageSrc ? (
                <FinalOutput
                    imageSrc={imageSrc}
                    particleColor={particleColor}
                    onColorChange={setParticleColor}
                    onBack={() => setImageSrc(null)}
                />
            ) : (
                <FileUpload
                    onImageSelect={setImageSrc}
                    particleColor={particleColor}
                    onColorChange={setParticleColor}
                />
            )}
        </div>
    );
};

export default Home;
