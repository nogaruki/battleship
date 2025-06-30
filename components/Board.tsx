import { memo } from "react";

interface BoardProps {
    grid: number[][];            // 0 sea, 1 ship, 2 hit, -1 miss
    onShoot?: (x: number, y: number) => void;
    interactive?: boolean;
}
export const Board = memo(({ grid, onShoot, interactive }: BoardProps) => (
    <div className="grid grid-cols-10 gap-1">
        {grid.map((row, y) =>
            row.map((cell, x) => (
                <div
                    key={`${x}-${y}`}
                    onClick={() => interactive && onShoot?.(x, y)}
                    className={`w-8 h-8 flex items-center justify-center text-xs 
            ${
                        cell === 2
                            ? "bg-red-500"
                            : cell === -1
                                ? "bg-gray-400"
                                : cell === 1
                                    ? "bg-blue-600"
                                    : "bg-blue-200"
                    } cursor-${interactive ? "pointer" : "default"} select-none`}
                />
            ))
        )}
    </div>
));
