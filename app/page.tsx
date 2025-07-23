"use client";
import { useAuth } from "@/stores/useAuth";
import { Board } from "@/components/Board";
import { useState, useEffect, useCallback } from "react";
import Game from "@/components/Game";
import {fetchWithToast} from "@/lib/fetchWithToast";
import ShipEditor from "@/components/ShipEditor";
import toast from "react-hot-toast";
import Image from "next/image";

/* ---------- tiny helpers ---------- */
const emptyBoard = () => Array.from({ length: 10 }, () => Array(10).fill(0));

const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
/* ---------- main component ---------- */

type GameSummary = {
    _id: string;
    players: { _id: string; pseudo: string }[];
    finished: boolean;
    winner?: string;
};

export default function Home() {
    const { user, login, loading } = useAuth();
    const [pseudo, setPseudo] = useState("");

    const [board, setBoard] = useState<number[][]>(emptyBoard);
    const [games, setGames] = useState<GameSummary[]>([]);
    const [currentGameId, setCurrentGameId] = useState<string | null>(null);
    const [boardReady, setBoardReady] = useState<number[][] | null>(null);
    const [step, setStep]             = useState<"place" | "lobby">("place");
    const [creating, setCreating] = useState(false);
    const [ongoing, setOngoing]   = useState<GameSummary[]>([]);
    const [history, setHistory]   = useState<GameSummary[]>([]);

    async function loadMine() {
        if (!user) return;
        const [on, hist] = await Promise.all([
            fetch(`/api/games/mine?userId=${user._id}&finished=false`).then(r => r.json()),
            fetch(`/api/games/mine?userId=${user._id}&finished=true`).then(r => r.json()),
        ]);
        setOngoing(on);
        setHistory(hist);
    }

    useEffect(() => { loadMine(); }, [user]);

    /* -------- callback donné au ShipEditor -------- */
    function handleFleetReady(board: number[][]) {
        setBoardReady(board);     // 1) on garde le plateau
        setStep("lobby");         // 2) on passe à l’étape suivante
    }


    /* -------- fetch open games -------- */

    const loadGames = useCallback(async () => {
        const res = await fetch("/api/game/open", { cache: "no-store" });
        if (!res.ok) return;

        let list: GameSummary[] = await res.json();
        if (user) list = list.filter(g => !g.players.some(p => p._id === user._id));
        setGames(list);
    }, [user]);

    useEffect(() => {
        if (!user) return;

        loadGames().then(r =>  {});
        const id = setInterval(loadGames, 2000);

        return () => clearInterval(id);
    }, [user, loadGames]);

    /* -------- lobby actions -------- */

    async function handleCreate() {
        if (!boardReady) {                         // ← sécurité
            toast.error("Valide d’abord ta flotte !");
            return;
        }
        setCreating(true);
        try {
            const res = await fetchWithToast("/api/game/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user!._id, board: boardReady }),
                success: "Partie créée – en attente",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Création impossible");
            toast.success("Partie créée – en attente 🔄");
            setCurrentGameId(data.gameId);
            loadGames();
            setGames((prev) => [...prev, data.game]);
        } catch (err) {
            /* fetchWithToast a déjà toasté l’erreur */
        } finally {
            setCreating(false);
        }
    }

    async function handleJoin(gameId: string) {
        if (!boardReady) {                         // ← sécurité
            toast.error("Valide d’abord ta flotte !");
            return;
        }
        const res = await fetchWithToast(`/api/game/${gameId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user!._id, board: boardReady }),
            success: "Partie rejointe 👍",
        });
        if (res.ok) {
            setCurrentGameId(gameId);
            loadMine();
            loadGames();
        }
    }

    async function handleDelete(gameId: string) {
        if (!confirm("Supprimer cette partie ?")) return;

        try {
            await fetchWithToast(`/api/game/${gameId}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user!._id }),
                success: "Partie supprimée",
            });

            loadMine();   // refresh si succès
        } catch {
        }
    }

    /* -------- screens -------- */

    // 0️⃣ ► LOGIN
    if (!user) {
        return (
            <main className="h-screen flex flex-col items-center justify-center gap-4">
                <Image
                    src="/logo.svg"
                    alt="Battleship logo"
                    width={isMobile ? 80 : 140}
                    height={isMobile ? 80 : 140}
                />

                <input
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ton pseudo"
                    className="border p-2 rounded"
                    disabled={loading}
                />
                <button
                    onClick={() => login(pseudo)}
                    className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                    disabled={!pseudo.trim() || loading}
                >
                    {loading && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    )}
                    {loading ? "Connexion…" : "Se connecter"}
                </button>
            </main>
        );
    }

    // 1️⃣ ► GAME
    if (currentGameId) {
        return (
            <main className="p-6">
                <Game
                    gameId={currentGameId}
                    userId={user._id}
                    onExit={() => setCurrentGameId(null)}
                />
            </main>
        );
    }

    // 2️⃣ ► LOBBY
    return (
        <main className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
            <div className="mx-auto">
                <Image
                    src="/logo.svg"
                    alt="Battleship logo"
                    width={isMobile ? 80 : 140}
                    height={isMobile ? 80 : 140}
                />
            </div>
            <h1 className="text-3xl font-bold">Yo {user.pseudo} 👋 – prépare ton carnage !</h1>

            {/* ----- board editor ----- */}
            {step === "place" ? (
                <ShipEditor onReady={handleFleetReady}/>
            ) : (
                /* ----- lobby normal avec create / join ----- */
                <>
                    {/* ----- create game ----- */}
                    <section className="space-y-2">
                        <h2 className="font-semibold text-xl">2 · Crée ta partie</h2>
                        <button
                            onClick={handleCreate}
                            disabled={!boardReady || creating}
                            className="bg-gray-600 hover:bg-gray-400 cursor-pointer text-white px-4 py-2 rounded"
                        >
                            {creating && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent
                     rounded-full animate-spin"/>
                            )}
                            🚀 Créer & attendre quelqu’un
                        </button>
                    </section>
                </>
            )}

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
                {g.players[0].pseudo} <span className="opacity-50">attend…</span>
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
            {/* ====== Mes parties en cours ====== */}
            <section className="space-y-2">
                <h2 className="font-semibold text-xl">Mes parties en cours</h2>
                {ongoing.length === 0 && <p className="opacity-60">Aucune partie en cours.</p>}
                <ul className="space-y-2">
                    {ongoing.map(g => (
                        <li key={g._id} className="border rounded p-3 flex justify-between items-center">
        <span>
          vs {g.players.find(p => p._id !== user._id)?.pseudo ?? "?"}
        </span>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
                                    onClick={() => setCurrentGameId(g._id)}
                                >
                                    Reprendre
                                </button>
                                <button
                                    className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer"
                                    onClick={() => handleDelete(g._id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ====== Historique ====== */}
            <section className="space-y-2">
                <h2 className="font-semibold text-xl">Historique</h2>
                {history.length === 0 && <p className="opacity-60">Pas encore de victoire 😉</p>}
                <ul className="space-y-2">
                    {history.map(g => {
                        const meWon = g.winner === user._id;
                        return (
                            <li key={g._id} className="border rounded p-3 flex justify-between">
                              <span>
                                {g.players[0].pseudo} vs {g.players[1]?.pseudo ?? "—"} —{" "}
                                  {meWon ? "🏆 gagné" : "💀 perdu"}
                              </span>
                            </li>
                        );
                    })}
                </ul>
            </section>

        </main>
    );
}
