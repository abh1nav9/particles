import { type FC } from "react";

const AnimatedBackground: FC = () => {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div
                className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div
                className="absolute -top-40 -left-24 w-[550px] h-[550px] rounded-full bg-pink-200/30 dark:bg-pink-500/8 blur-3xl animate-float-slow"
            />
            <div
                className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-200/25 dark:bg-purple-500/6 blur-3xl animate-float-slow-reverse"
            />

            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-100/20 dark:bg-emerald-500/5 blur-3xl animate-float-drift"
            />
            <div
                className="absolute top-16 right-1/4 w-[300px] h-[300px] rounded-full bg-rose-100/25 dark:bg-rose-400/5 blur-3xl animate-float-slow"
                style={{ animationDelay: "-7s" }}
            />

            <div className="absolute top-1/5 left-1/4 w-2 h-2 rounded-full bg-pink-300/40 dark:bg-pink-400/15 animate-pulse" />
            <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 rounded-full bg-purple-300/40 dark:bg-purple-400/15 animate-pulse [animation-delay:1.5s]" />
            <div className="absolute bottom-1/3 left-1/6 w-1 h-1 rounded-full bg-emerald-300/40 dark:bg-emerald-400/10 animate-pulse [animation-delay:3s]" />
        </div>
    );
};

export default AnimatedBackground;
