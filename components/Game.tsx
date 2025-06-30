"use client";
import { Board } from "@/components/Board";
import { useEffect, useState, useCallback } from "react";

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
        const res = await fetch(`/api/game/${gameId}/shot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, x, y }),
        });
        setLoadingShot(false);
        if (res.ok) loadState();
    }

    /* -------- ui -------- */

    if (!game) {
        return <p className="animate-pulse">Chargement de la partie…</p>;
    }

    const status =
        game.boards[enemyIdx].flat().every((c) => c !== 1)
            ? "🏆 Tu as gagné !"
            : game.boards[meIdx].flat().every((c) => c !== 1)
                ? "💥 Tu as perdu…"
                : myTurn
                    ? "🫵 À toi de tirer !"
                    : "⏳ Tour adverse…";

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
                        interactive={myTurn}
                    />
                    {myTurn && <p className="text-center text-sm opacity-60">Clique pour tirer</p>}
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
