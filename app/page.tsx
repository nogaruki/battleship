"use client";
import { useAuth } from "@/stores/useAuth";
import { Board } from "@/components/Board";
import { useState, useEffect, useCallback } from "react";
import Game from "@/components/Game";
import {fetchWithToast} from "@/lib/fetchWithToast";
/* ---------- tiny helpers ---------- */

const emptyBoard = () => Array.from({ length: 10 }, () => Array(10).fill(0));

function toggleCell(board: number[][], x: number, y: number) {
    const clone = board.map((row) => [...row]);
    clone[y][x] = clone[y][x] ? 0 : 1;      // 0 sea -> 1 ship (and back)
    return clone;
}

function randomBoard() {
    const board = emptyBoard();
    // 5 ships, 1-cell each (yolo) – improve if you want the full rules
    for (let placed = 0; placed < 5; ) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        if (!board[y][x]) {
            board[y][x] = 1;
            placed++;
        }
    }
    return board;
}

/* ---------- main component ---------- */

type GameSummary = { _id: string; players: string[] };

export default function Home() {
    const { user, login } = useAuth();
    const [pseudo, setPseudo] = useState("");

    const [board, setBoard] = useState<number[][]>(emptyBoard);
    const [games, setGames] = useState<GameSummary[]>([]);
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);

    /* -------- fetch open games -------- */

    const loadGames = useCallback(async () => {
        const res = await fetch("/api/game/open");
        if (res.ok) setGames(await res.json());
    }, []);

    useEffect(() => {
        if (user) loadGames();
    }, [user, loadGames]);

    /* -------- lobby actions -------- */

    async function handleCreate() {
        const res = await fetchWithToast("/api/game/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user!._id, board }),
            success: "Partie créée – en attente"
        });
        if (res.ok) {
            const { gameId } = await res.json();
            setCurrentGameId(gameId);
        }
    }

    async function handleJoin(gameId: string) {
        const res = await fetchWithToast(`/api/game/${gameId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user!._id, board }),
            success: "Partie rejointe 👍",
        });
        if (res.ok) setCurrentGameId(gameId);
    }

    /* -------- screens -------- */

    // 0️⃣ ► LOGIN
    if (!user) {
        return (
            <main className="h-screen flex flex-col items-center justify-center gap-4">
                <input
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ton pseudo"
                    className="border p-2 rounded"
                />
                <button
                    onClick={() => login(pseudo)}
                    className="bg-gray-600 hover:bg-gray-400 cursor-pointer text-white px-4 py-2 rounded disabled:opacity-40"
                    disabled={!pseudo.trim()}
                >
                    Entre
                </button>
            </main>
        );
    }

    // 1️⃣ ► GAME (placeholder → tu as sûrement déjà un `<Game>` ailleurs)
    if (currentGameId) {
        return (
            <main className="p-6">
                <Game gameId={currentGameId} userId={user._id} />
            </main>
        );
    }

    // 2️⃣ ► LOBBY
    return (
        <main className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold">Yo {user.pseudo} 👋 – prépare ton carnage !</h1>

            {/* ----- board editor ----- */}
            <section className="space-y-4">
                <h2 className="font-semibold text-xl">1 · Place tes bateaux</h2>
                <Board
                    grid={board}
                    onShoot={(x, y) => setBoard((b) => toggleCell(b, x, y))}
                    interactive
                />
                <div className="flex gap-3">
                    <button
                        onClick={() => setBoard(randomBoard())}
                        className="border cursor-pointer px-3 py-1 rounded"
                    >
                        Random
                    </button>
                    <button
                        onClick={() => setBoard(emptyBoard())}
                        className="border cursor-pointer px-3 py-1 rounded"
                    >
                        Clear
                    </button>
                </div>
            </section>

            {/* ----- create game ----- */}
            <section className="space-y-2">
                <h2 className="font-semibold text-xl">2 · Crée ta partie</h2>
                <button
                    onClick={handleCreate}
                    className="bg-gray-600 hover:bg-gray-400 cursor-pointer text-white px-4 py-2 rounded"
                >
                    🚀 Créer & attendre quelqu’un
                </button>
            </section>

            {/* ----- join game ----- */}
            <section className="space-y-2">
                <h2 className="font-semibold text-xl">3 · Rejoins une partie ouverte</h2>

                {games.length === 0 && (
                    <p className="italic opacity-70">Aucune partie en attente, crée-en une :)</p>
                )}

                <ul className="space-y-2">
                    {games.map((g) => (
                        <li
                            key={g._id}
                            className="border rounded flex items-center justify-between p-3"
                        >
              <span>
                {g.players[0]} <span className="opacity-50">attend…</span>
              </span>
                            <button
                                onClick={() => handleJoin(g._id)}
                                className="bg-green-600 hover:bg-green-400 cursor-pointer text-white px-3 py-1 rounded"
                            >
                                Rejoindre
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
