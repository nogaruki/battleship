"use client";
import { useRef, useEffect } from "react";

export default function useAmbientMusic(src: string, muted: boolean, volume = 0.3) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /* Crée l'objet Audio une seule fois */
    if (!audioRef.current && typeof Audio !== "undefined") {
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
    }

    /* Réagit aux changements de mute / volume */
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = muted ? 0 : volume;

        if (muted) {
            audio.pause();
        } else {
            // Safari exige parfois un .play() après mute→unmute
            audio.play().catch(() => {/* autoplay bloqué = pas grave */});
        }
        /* 🧹 CLEAN-UP : stoppe la musique quand le composant se démonte */
        return () => audio.pause();
    }, [muted, volume]);
}
