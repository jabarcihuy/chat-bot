"use client";

export function AnimatedBackground() {
    return (
        <>
            <div className="animated-bg" aria-hidden="true" />
            <div className="animated-bg-extra" aria-hidden="true" />
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
                aria-hidden="true"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "32px 32px",
                }}
            />
        </>
    );
}
