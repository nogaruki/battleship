import { create } from "zustand";
import {fetchWithToast} from "@/lib/fetchWithToast";

interface AuthState {
    user?: { _id: string; pseudo: string };
    loading: boolean;
    login: (pseudo: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    loading: false,
    async login(pseudo) {
        set({ loading: true });
        try{
            const res = await fetchWithToast("/api/auth", {
                method: "POST",
                body: JSON.stringify({ pseudo }),
                headers: { "Content-Type": "application/json" },
                success: `Bienvenue ${pseudo} 👋`,
            });
            const user = await res.json();
            set({ user });
            localStorage.setItem("user", JSON.stringify(user));
        } finally {
            set({ loading: false });
        }

    },
}));
