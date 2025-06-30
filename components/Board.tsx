import { memo } from "react";

interface BoardProps {
    grid: number[][];
    onShoot?: (x: number, y: number) => void;
    interactive?: boolean;
    hideShips?: boolean;
}
export function Board({ grid, onShoot, interactive, hideShips }: BoardProps) {
    return (
        <div className="grid grid-cols-10 gap-1">
        {grid.map((row, y) =>
            row.map((cell, x) => {
                const visual = hideShips && cell === 1 ? 0 : cell;
                return (
                    <div
                        key={`${x}-${y}`}
                        onClick={() => interactive && onShoot?.(x, y)}
                        className={`
              w-8 h-8 flex items-center justify-center
              ${
                            visual === 2 ? "bg-red-500"
                                : visual === -1 ? "bg-gray-400"
                                    : visual === 1 ? "bg-blue-600"
                                        : "bg-blue-200"
                        }
              ${interactive ? "cursor-pointer" : "cursor-default"} select-none
            `}
                    />
                );
            })
        )}
    </div>
    )
}