import type { FC } from "react";

const Footer: FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="px-4 pb-6 pt-12">
            <div className="max-w-4xl mx-auto rounded-3xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface px-8 py-8 flex justify-center sm:flex-row items-center justify-between gap-4">
                {/* <div className="flex items-center gap-2">
                    <img src="/vite.svg" alt="Particles logo" className="w-7 h-7" />
                    <span className="font-serif text-xl italic text-gray-900 dark:text-gray-100">
                        Particles
                    </span>
                </div> */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    © {year} Particles. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
