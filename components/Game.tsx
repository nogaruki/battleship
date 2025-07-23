"use client";
import { Board } from "@/components/Board";
import {useEffect, useState, useCallback, useRef} from "react";
import toast from "react-hot-toast";
import useSound from "@/lib/useSound";
import useAmbientMusic from "@/lib/useAmbientMusic";

type Player = { _id: string; pseudo: string };

interface GameProps {
    gameId: string;
    userId: string;
    onExit: () => void;
}

type GameDoc = {
    _id: string;
    players: Player[];
    turn: number;
    boards: number[][][];
    shots: { x: number; y: number; hit: boolean }[][];
    finished: boolean;
};

export default function Game({ gameId, userId, onExit }: GameProps) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


    /* --- états mute --- */
    const [mutedSfx,    setMutedSfx]    = useState(() => localStorage.getItem("mutedSfx")    === "1");
    const [mutedMusic,  setMutedMusic]  = useState(() => localStorage.getItem("mutedMusic")  === "1");

    /* --- SFX --- */
    const playHit  = useSound("/sounds/hit.mp3",  mutedSfx ? 0 : 1);
    const playMiss = useSound("/sounds/miss.mp3", mutedSfx ? 0 : 0.5);
    const playWin  = useSound("/sounds/win.mp3",  mutedSfx ? 0 : 1);
    const playLose = useSound("/sounds/lose.mp3", mutedSfx ? 0 : 1);

    /* --- MUSIQUE --- */
    useAmbientMusic("/sounds/ambience.mp3", mutedMusic, 0.4);



    const [game, setGame] = useState<GameDoc | null>(null);
    const [loadingShot, setLoadingShot] = useState(false);
    const [finished, setFinished] = useState<"win" | "lose" | null>(null);

    /* -------- fetch loop -------- */

    const loadState = useCallback(async () => {
        try {
            const res = await fetch(`/api/game/${gameId}/state`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur serveur");
            setGame(data);
            if (data.players.length < 2) return;
            const meIndex    = data.players.findIndex((p: Player) => p._id === userId);
            const enemyIndex = 1 - meIndex;
            /* ---- détecter victoire/défaite ---- */
            const enemyShipsLeft = data.boards[enemyIndex].some((r: number[]) => r.includes(1));
            const myShipsLeft    = data.boards[meIndex]  .some((r: number[]) => r.includes(1));

            if (!enemyShipsLeft && finished !== "win") {
                endGame("win");
            } else if (!myShipsLeft && finished !== "lose") {
                endGame("lose");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    }, [gameId]);


    useEffect(() => {
        loadState().then(r => {
        }); // prime
        intervalRef.current = setInterval(loadState, 2000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [loadState]);

    if (!game) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="animate-pulse text-lg">Chargement de la partie…</p>
            </div>
        );
    }

    const meIdx = game.players.findIndex((p) => p._id === userId) ?? 0;
    const enemyIdx = 1 - meIdx;
    const myTurn = game.turn === meIdx;
    const me     = game.players[meIdx];
    const enemy  = game.players[enemyIdx];

    /* petite utilitaire DRY — factorise les 6 lignes identiques */
    function endGame(result: "win" | "lose") {
        result === "win" ? playWin() : playLose();
        setFinished(result);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    /* -------- fire a shot -------- */

    async function handleShoot(x: number, y: number) {
        if (!myTurn || loadingShot) return;
        setLoadingShot(true);
        try {
            const res = await fetch(`/api/game/${gameId}/shot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, x, y }),
            });
            const { hit, error } = await res.json();
            if (!res.ok) throw new Error(error);
            hit ? playHit() : playMiss();
            toast.success(hit ? "🎯 Touché !" : "🌊 Plouf…");
            await loadState();
        } catch (err: any) {
            toast.error(err.message ?? "Tir raté (serveur)");
        } finally {
            setLoadingShot(false);
        }
    }

    /* -------- ui -------- */

    if (!game) {
        return <p className="animate-pulse">Chargement de la partie…</p>;
    }

    const bothReady = game.players.length === 2;
    const enemyShipsLeft = game.boards[enemyIdx].some((row) => row.includes(1));
    const myShipsLeft    = game.boards[meIdx]  .some((row) => row.includes(1));

    let status: string;
    if (!bothReady) {
        status = "🕐 En attente d’un adversaire…";
    } else if (!enemyShipsLeft) {
        status = "🏆 Tu as gagné !";
    } else if (!myShipsLeft) {
        status = "💥 Tu as perdu…";
    } else if (myTurn) {
        status = "🫵 À toi de tirer !";
    } else {
        status = "⏳ Tour adverse…";
    }
    const canShoot = bothReady && myTurn && enemyShipsLeft && myShipsLeft;

    return (
        <section className="flex flex-col items-center gap-6">
            {/* Barre boutons audio */}
            <div className="self-end flex gap-2 mb-1">
                {/* Mute SFX  */}
                <button
                    onClick={() => {
                        setMutedSfx(m => {
                            localStorage.setItem("mutedSfx", m ? "0" : "1");
                            return !m;
                        });
                    }}
                    className="px-2 py-1 border rounded text-sm cursor-pointer"
                    title={mutedSfx ? "Activer les effets" : "Couper les effets"}
                >
                    {mutedSfx ? "🔈 SFX" : "🔇 SFX"}
                </button>

                {/* Mute Music */}
                <button
                    onClick={() => {
                        setMutedMusic(m => {
                            localStorage.setItem("mutedMusic", m ? "0" : "1");
                            return !m;
                        });
                    }}
                    className="px-2 py-1 border rounded text-sm cursor-pointer"
                    title={mutedMusic ? "Activer la musique" : "Couper la musique"}
                >
                    {mutedMusic ? "🎵 On" : "🎵 Off"}
                </button>
            </div>
            <h2 className="text-2xl font-semibold">{status}</h2>

            {/* bouton retour si fini */}
            {finished && (
                <button
                    onClick={onExit}
                    className="cursor-pointer px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-500"
                >
                    Retour au lobby
                </button>
            )}

            {/* ----- game boards ----- */}

            <div className="grid grid-cols-2 gap-8">
                {/* ----- enemy board (clics actifs) ----- */}
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">
                        {enemy ? `🎯 ${enemy.pseudo}` : "🕐 En attente…"}
                    </h3>

                    <Board
                        grid={game.boards[enemyIdx]}
                        onShoot={handleShoot}
                        interactive={canShoot}
                        hideShips
                    />
                    {canShoot && (
                        <p className="text-center text-sm text-white">Clique pour tirer</p>
                    )}
                </div>

                {/* ----- your board ----- */}
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">{me.pseudo}</h3>
                    <Board grid={game.boards[meIdx]} />
                </div>
            </div>
        </section>
    );
}
