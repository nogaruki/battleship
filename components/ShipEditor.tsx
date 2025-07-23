/* components/ShipEditor.tsx */
"use client";
import { Board } from "@/components/Board";
import toast from "react-hot-toast";
import { useState, useMemo } from "react";

const CATALOG = [
    { id: "carrier",     name: "Porte-avion", size: 5, max: 1 },
    { id: "cruiser",     name: "Croiseur",    size: 4, max: 1 },
    { id: "submarine-1", name: "Sous-marin",  size: 3, max: 1 },
    { id: "submarine-2", name: "Sous-marin",  size: 3, max: 1 },
    { id: "destroyer",   name: "Torpilleur",  size: 2, max: 1 },
];

/* ---------- helpers ---------- */
const emptyBoard = () => Array.from({ length: 10 }, () => Array(10).fill(0));

const neighbours = [
    [0, 0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],
];

function canPlace(board: number[][], x: number, y: number, size: number, dir: "H"|"V") {
    // coords du navire
    const coords = Array.from({ length: size }, (_, i) =>
        dir === "H" ? [x + i, y] : [x, y + i]
    );
    // hors-grille ?
    if (coords.some(([cx, cy]) => cx < 0 || cx > 9 || cy < 0 || cy > 9)) return false;
    // collision / contact ?
    for (const [cx, cy] of coords) {
        for (const [dx, dy] of neighbours) {
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10 && board[ny][nx] === 1)
                return false;
        }
    }
    return true;
}

/* ---------- component ---------- */
export default function ShipEditor({ onReady }:{
    onReady: (board: number[][]) => void;
}) {
    const [placed, setPlaced] = useState<{ id: string; coords: [number,number][] }[]>([]);
    const [selectId, setSelectId] = useState<string|null>(null);
    const [dir, setDir] = useState<"H"|"V">("H");
    const [showRules, setShowRules] = useState(false);

    // board dérivé
    const board = useMemo(() => {
        const b = emptyBoard();
        placed.forEach(ship => ship.coords.forEach(([x,y]) => (b[y][x] = 1)));
        return b;
    }, [placed]);

    /* ---------- click handler ---------- */
    function handleCell(x: number, y: number) {
        // remove ship si pas de sélection
        if (!selectId) {
            setPlaced(p => p.filter(s => !s.coords.some(([cx,cy]) => cx===x&&cy===y)));
            return;
        }
        const spec = CATALOG.find(s => s.id === selectId)!;
        // déjà placé ?
        if (placed.some(s => s.id === selectId)) {
            toast.error("Navire déjà posé");
            return;
        }
        if (!canPlace(board, x, y, spec.size, dir)) {
            toast.error("Placement invalide");
            return;
        }
        const coords = Array.from({ length: spec.size }, (_, i) =>
            dir === "H" ? [x + i, y] : [x, y + i]
        ) as [number,number][];
        setPlaced(p => [...p, { id: selectId, coords }]);
    }

    const ready = placed.length === CATALOG.length;

    return (
        <section className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center gap-4">
                <h2 className="font-semibold text-xl">1 · Place tes bateaux</h2>
                <button
                    onClick={() => setDir(d => d === "H" ? "V" : "H")}
                    className="px-2 py-1 border rounded cursor-pointer hover:bg-gray-400"
                >
                    {dir === "H" ? "↔︎ Horizontal" : "↕︎ Vertical"}
                </button>
                <button
                    onClick={() => setShowRules(true)}
                    className="underline text-sm ml-auto cursor-pointer hover:text-gray-400"
                >
                    Règles
                </button>
            </div>

            {/* BOARD */}
            <Board
                grid={board}
                onShoot={handleCell}
                interactive
            />

            {/* CATALOG */}
            <div className="flex flex-wrap gap-2">
                {CATALOG.map((spec) => {
                    const done = placed.some((p) => p.id === spec.id);
                    const isSel = selectId === spec.id;
                    return (
                        <button
                            key={spec.id}
                            disabled={done}
                            onClick={() => setSelectId(spec.id)}
                            className={`
          px-3 py-1 rounded border hover:bg-gray-400 cursor-pointer
          ${done ? "opacity-40 cursor-default"
                                : isSel ? "bg-green-400 text-white" : ""}
        `}
                        >
                            {spec.name} ({spec.size})
                        </button>
                    );
                })}

                {/* ------------- gomme ------------- */}
                <button
                    onClick={() => setSelectId(null)}
                    className={`
      px-3 py-1 rounded border hover:bg-gray-400 cursor-pointer
      ${selectId === null ? "bg-green-400 text-white" : ""}
    `}
                >
                    🗑️ Gomme
                </button>
            </div>

            {/* GO */}
            <button
                disabled={!ready}
                onClick={() => {
                    onReady(board);
                    toast.success("Flotte validée ✅");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-40 cursor-pointer"
            >
                Valider la flotte
            </button>

            {/* RULES MODAL */}
            {showRules && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20">
                    <div className="bg-white p-6 rounded max-w-md text-sm space-y-2 text-gray-800">
                        <h3 className="font-bold">Règles de placement</h3>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Bateaux horizontaux ou verticaux, jamais en diagonale.</li>
                            <li>Aucun navire ne peut toucher un autre (même en coin).</li>
                            <li>Flotte : 1×5 cases, 1×4, 2×3, 1×2.</li>
                            <li>🗑️ Gomme: Pour supprimer un navire posé.</li>
                        </ul>
                        <button
                            onClick={() => setShowRules(false)}
                            className="mt-3 px-3 py-1 border rounded hover:bg-gray-400 cursor-pointer text-gray-800"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
