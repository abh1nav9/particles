import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../redux";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AnimatedBackground from "../components/animated-bg";

const Layout: FC = () => {
    const theme = useAppSelector((s) => s.theme.mode);

    return (
        <div className={`${theme === "dark" ? "dark" : ""} min-h-screen flex flex-col bg-cream dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300 relative`}>
            <AnimatedBackground />
            <Navbar />
            <main className="flex-1 flex flex-col relative z-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
