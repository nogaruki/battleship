"use client";
import { Board } from "@/components/Board";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface GameProps {
    gameId: string;
    userId: string;
}

type GameDoc = {
    _id: string;
    players: string[];
    turn: number;
    boards: number[][][]; // [2] x 10 x 10
    shots: { x: number; y: number; hit: boolean }[][];
};

export default function Game({ gameId, userId }: GameProps) {
    const [game, setGame] = useState<GameDoc | null>(null);
    const [loadingShot, setLoadingShot] = useState(false);

    const meIdx = game?.players.findIndex((p) => p === userId) ?? 0;
    const enemyIdx = 1 - meIdx;
    const myTurn = game?.turn === meIdx;

    /* -------- fetch loop -------- */

    const loadState = useCallback(async () => {
        const res = await fetch(`/api/game/${gameId}/state`);
        if (res.ok) setGame(await res.json());
    }, [gameId]);

    useEffect(() => {
        loadState(); // prime
        const id = setInterval(loadState, 2000); // poll 2 s
        return () => clearInterval(id);
    }, [loadState]);

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
            <h2 className="text-2xl font-semibold">{status}</h2>

            <div className="grid grid-cols-2 gap-8">
                {/* ----- enemy board (clics actifs) ----- */}
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">Grille ennemie</h3>

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
                    <h3 className="text-lg font-medium text-center">Ta grille</h3>
                    <Board grid={game.boards[meIdx]} />
                </div>
            </div>
        </section>
    );
}
