import { useRef, useEffect, useState, type FC } from "react";

interface ParticleLine {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    vx: number;
    vy: number;
    length: number;
    baseAlpha: number;
    currentAlpha: number;
    delay: number;
}

interface MouseState {
    x: number;
    y: number;
    active: boolean;
}

interface ParticlePortraitProps {
    imageSrc: string;
    canvasSize?: number;
    particleColor?: string;
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

const ParticlePortrait: FC<ParticlePortraitProps> = ({
    imageSrc,
    canvasSize,
    particleColor = "#64ffda",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, active: false });
    const linesRef = useRef<ParticleLine[]>([]);
    const imageLoadedRef = useRef<boolean>(false);
    const startTimeRef = useRef<number | null>(null);
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
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        let animationId: number;

        // Reset state for new image
        linesRef.current = [];
        imageLoadedRef.current = false;
        startTimeRef.current = null;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = (): void => {
            const offscreen = document.createElement("canvas");
            const offCtx = offscreen.getContext("2d");
            if (!offCtx) return;

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

            const lines: ParticleLine[] = [];
            const rowGap = size <= 280 ? 5 : 6;

            for (let y = 0; y < canvasHeight; y += rowGap) {
                let x = 0;
                while (x < canvasWidth) {
                    const i = (y * canvasWidth + x) * 4;
                    const a = pixels[i + 3];

                    if (a > 128) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        const brightness = (r + g + b) / (3 * 255);

                        const lineLength = Math.floor(
                            3 + brightness * (size <= 280 ? 8 : 15)
                        );

                        const scatterX = (Math.random() - 0.5) * 300;
                        const scatterY = (Math.random() - 0.5) * 300;

                        lines.push({
                            x: x + scatterX,
                            y: y + scatterY,
                            targetX: x,
                            targetY: y,
                            vx: 0,
                            vy: 0,
                            length: lineLength,
                            baseAlpha: 0.5 + brightness * 0.5,
                            currentAlpha: 0,
                            delay: Math.random() * 0.3,
                        });

                        x += lineLength + 3;
                    } else {
                        x += 4;
                    }
                }
            }

            linesRef.current = lines;
            imageLoadedRef.current = true;
            startTimeRef.current = performance.now();
        };

        const draw = (): void => {
            animationId = requestAnimationFrame(draw);

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            if (!imageLoadedRef.current) return;

            const lines = linesRef.current;
            const mouse = mouseRef.current;
            const elapsed = (performance.now() - (startTimeRef.current ?? 0)) / 1000;
            const { r, g, b } = hexToRgb(colorRef.current);

            lines.forEach((p: ParticleLine) => {
                const particleTime = elapsed - p.delay;

                if (particleTime < 0) return;

                const fadeProgress = Math.min(particleTime / 1.5, 1);
                const easedFade = 1 - Math.pow(1 - fadeProgress, 2);
                p.currentAlpha = p.baseAlpha * easedFade;

                const moveProgress = Math.min(particleTime / 2.5, 1);
                const easedMove = 1 - Math.pow(1 - moveProgress, 3);

                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 60;

                    if (dist < maxDist && dist > 0) {
                        const force = (1 - dist / maxDist) * 2;
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force;
                    }
                }

                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;

                const pullStrength = 0.01 + easedMove * 0.07;
                p.vx += dx * pullStrength;
                p.vy += dy * pullStrength;

                p.vx *= 0.92;
                p.vy *= 0.92;

                p.x += p.vx;
                p.y += p.vy;

                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.currentAlpha})`;
                ctx.lineWidth = size <= 280 ? 1.5 : 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.length, p.y);
                ctx.stroke();
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
        canvas.addEventListener("touchmove", handleTouchMove);
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

export default ParticlePortrait;