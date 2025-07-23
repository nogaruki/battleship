"use client";
import { useEffect, useState } from "react";

export default function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">(() =>
        typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
            ? "dark"
            : "light"
    );

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    return { theme, toggle: () => setTheme(t => (t === "light" ? "dark" : "light")) };
}
