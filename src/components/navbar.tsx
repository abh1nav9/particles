import type { FC } from "react";
import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector, toggleTheme } from "../redux";

const Navbar: FC = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((s) => s.theme.mode);

    return (
        <header className="sticky top-0 z-50 px-4 pt-4">
            <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3 rounded-full border border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <img src="/vite.svg" alt="Particles logo" className="w-8 h-8" />
                    <span className="font-serif text-2xl text-gray-900 dark:text-gray-100 tracking-tight italic">
                        Particles
                    </span>
                </div>

                {/* Theme toggle */}
                <button
                    onClick={() => dispatch(toggleTheme())}
                    aria-label="Toggle theme"
                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors cursor-pointer"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
