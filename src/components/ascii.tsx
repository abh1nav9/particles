import { useRef, useEffect, useState, type FC } from "react";

interface AsciiPortraitProps {
    imageSrc: string;
    canvasSize?: number;
    particleColor?: string;
}

interface MouseState {
    x: number;
    y: number;
    active: boolean;
}

interface AsciiParticle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    char: string;
    alpha: number;
}

/**
 * Convert a hex color string (#rrggbb) to an { r, g, b } object.
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const cleaned = hex.replace("#", "");
    return {
        r: parseInt(cleaned.substring(0, 2), 16),
        g: parseInt(cleaned.substring(2, 4), 16),
        b: parseInt(cleaned.substring(4, 6), 16),
    };
};

const AsciiPortrait: FC<AsciiPortraitProps> = ({
    imageSrc,
    canvasSize,
    particleColor = "#64ffda",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, active: false });
    const particlesRef = useRef<AsciiParticle[]>([]);
    const imageLoadedRef = useRef<boolean>(false);
    const colorRef = useRef(particleColor);
    const [size, setSize] = useState<number>(canvasSize ?? 500);

    // Keep colorRef in sync without re-running the heavy effect
    useEffect(() => {
        colorRef.current = particleColor;
    }, [particleColor]);

    useEffect(() => {
        if (canvasSize) {
            setSize(canvasSize);
            return;
        }

        const updateSize = (): void => {
            const width = window.innerWidth;
            if (width <= 480) {
                setSize(Math.min(220, width - 40));
            } else if (width <= 768) {
                setSize(Math.min(350, width - 60));
            } else {
                setSize(500);
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, [canvasSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const canvasWidth = size;
        const canvasHeight = size;
        
        // High Definition rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        
        ctx.scale(dpr, dpr);

        let animationId: number;

        particlesRef.current = [];
        imageLoadedRef.current = false;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = (): void => {
            const offscreen = document.createElement("canvas");
            const offCtx = offscreen.getContext("2d");
            if (!offCtx) return;

            // Use the same width/height for image processing
            offscreen.width = canvasWidth;
            offscreen.height = canvasHeight;

            const scale = 0.85;
            const imgAspect = img.width / img.height;

            let drawHeight = canvasHeight * scale;
            let drawWidth = drawHeight * imgAspect;

            if (drawWidth > canvasWidth * scale) {
                drawWidth = canvasWidth * scale;
                drawHeight = drawWidth / imgAspect;
            }

            const offsetX = (canvasWidth - drawWidth) / 2;
            const offsetY = (canvasHeight - drawHeight) / 2;

            offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            const imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
            const pixels = imageData.data;
            
            const fontSize = size <= 280 ? 3 : 4; // smaller font size for higher definition
            const asciiChars = "@%#*+=-:. ";
            
            const particles: AsciiParticle[] = [];

            for (let y = 0; y < canvasHeight; y += fontSize) {
                for (let x = 0; x < canvasWidth; x += fontSize) {
                    const i = (y * canvasWidth + x) * 4;
                    const a = pixels[i + 3];

                    if (a > 128) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        const brightness = (r + g + b) / 3;

                        const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
                        const char = asciiChars[charIndex];

                        particles.push({
                            x: x + fontSize/2,
                            y: y + fontSize/2,
                            baseX: x + fontSize/2,
                            baseY: y + fontSize/2,
                            vx: 0,
                            vy: 0,
                            char: char,
                            alpha: 1.0 - (brightness / 255) * 0.5,
                        });
                    }
                }
            }

            particlesRef.current = particles;
            imageLoadedRef.current = true;
        };

        const draw = (): void => {
            animationId = requestAnimationFrame(draw);

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            if (!imageLoadedRef.current) return;

            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const { r, g, b } = hexToRgb(colorRef.current);
            
            const fontSize = size <= 280 ? 3 : 4;
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            particles.forEach((p) => {
                // Mouse interaction
                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 50;

                    if (dist < maxDist && dist > 0) {
                        const force = (maxDist - dist) / maxDist;
                        const angle = Math.atan2(dy, dx);
                        
                        // Push outward from cursor
                        p.vx += Math.cos(angle) * force * 2;
                        p.vy += Math.sin(angle) * force * 2;
                    }
                }

                // Spring back to base position
                p.vx += (p.baseX - p.x) * 0.1;
                p.vy += (p.baseY - p.y) * 0.1;

                // Friction
                p.vx *= 0.85;
                p.vy *= 0.85;

                p.x += p.vx;
                p.y += p.vy;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
                ctx.fillText(p.char, p.x, p.y);
            });
        };

        const handleMouseMove = (e: MouseEvent): void => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
            mouseRef.current.active = true;
        };

        const handleTouchMove = (e: TouchEvent): void => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;
            mouseRef.current.active = true;
        };

        const handleLeave = (): void => {
            mouseRef.current.active = false;
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleLeave);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
        canvas.addEventListener("touchend", handleLeave);

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleLeave);
            canvas.removeEventListener("touchmove", handleTouchMove);
            canvas.removeEventListener("touchend", handleLeave);
        };
    }, [size, imageSrc]);

    return (
        <canvas
            ref={canvasRef}
            className="simulation-container"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                cursor: "crosshair",
            }}
        />
    );
};

export default AsciiPortrait;
