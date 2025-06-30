"use client";
import toast from "react-hot-toast";

export async function fetchWithToast(
    input: RequestInfo,
    init?: RequestInit & { success?: string }
) {
    try {
        const res = await fetch(input, init);
        if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(error || "Erreur inconnue");
        }
        toast.success(init?.success ?? "✔️ Succès");
        return res;
    } catch (err: any) {
        toast.error(err.message ?? "Échec");
        throw err;
    }
}