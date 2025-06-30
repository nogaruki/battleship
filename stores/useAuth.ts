import { create } from "zustand";

interface AuthState {
    user?: { _id: string; pseudo: string };
    login: (pseudo: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    async login(pseudo) {
        const res = await fetch("/api/auth", { method: "POST", body: JSON.stringify({ pseudo }) });
        const user = await res.json();
        set({ user });
        localStorage.setItem("user", JSON.stringify(user));
    },
}));
