// lib/useSound.ts
"use client";
import { useRef, useEffect, useCallback } from "react";

export default function useSound(src: string, volume = 1) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /* instancie le player APRÈS le montage, donc jamais côté serveur */
    useEffect(() => {
        if (audioRef.current) return;

        audioRef.current = new Audio(src);
        audioRef.current.volume = volume;
    }, [src]);

    /* si on change le volume dynamiquement */
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    /* renvoie un callback mémoïsé et stable */
    return useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 0;
        audio.play().catch(() => {
            /* autoplay bloqué ? tant pis */
        });
    }, []);
}
