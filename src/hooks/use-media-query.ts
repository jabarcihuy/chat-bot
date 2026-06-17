"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
    const subscribe = (callback: () => void) => {
        const mql = window.matchMedia(query);
        mql.addEventListener("change", callback);
        return () => mql.removeEventListener("change", callback);
    };

    const getSnapshot = () => {
        if (typeof window !== "undefined") {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const getServerSnapshot = () => {
        return false;
    };

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}


