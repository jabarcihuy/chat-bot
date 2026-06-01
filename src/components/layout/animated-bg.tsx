"use client";

export function AnimatedBackground() {
    return (
        <>
            <div className="animated-bg" aria-hidden="true" />
            <div className="animated-bg-extra" aria-hidden="true" />
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.02] dark:opacity-[0.01]"
                aria-hidden="true"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
            />
        </>
    );
}
