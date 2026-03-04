import { useState, useEffect } from "react";
import { App } from "@modelcontextprotocol/ext-apps";

interface ClickerProps {
    app: App;
    onExit: () => void;
}

export default function Clicker({ onExit }: ClickerProps) {
    const [count, setCount] = useState(0);
    const [isClicking, setIsClicking] = useState(false);

    // Upgrades
    const [clickPower, setClickPower] = useState(1);
    const [autoClickers, setAutoClickers] = useState(0);

    const clickUpgradeCost = Math.floor(10 * Math.pow(1.5, clickPower - 1));
    const autoClickerCost = Math.floor(25 * Math.pow(1.2, autoClickers));

    // Auto-clicker effect
    useEffect(() => {
        if (autoClickers === 0) return;
        const interval = setInterval(() => {
            setCount(c => c + autoClickers);
        }, 1000);
        return () => clearInterval(interval);
    }, [autoClickers]);

    const increment = () => {
        setCount((prev) => prev + clickPower);
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 100);
    };

    const buyClickUpgrade = () => {
        if (count >= clickUpgradeCost) {
            setCount(c => c - clickUpgradeCost);
            setClickPower(p => p + 1);
        }
    };

    const buyAutoClicker = () => {
        if (count >= autoClickerCost) {
            setCount(c => c - autoClickerCost);
            setAutoClickers(a => a + 1);
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-900 text-slate-100 font-sans overflow-hidden relative">
            {/* Absolute Back Button */}
            <button
                className="absolute top-4 left-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-300 px-3 py-1.5 rounded backdrop-blur-md transition-colors font-medium text-sm flex items-center gap-1.5 z-50 shadow-lg"
                onClick={onExit}
            >
                <span>←</span> Back
            </button>

            {/* Center: The Game */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 relative">
                <h1 className="text-3xl md:text-5xl font-black mb-1 md:mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-sm text-center">
                    Cookie Clicker
                </h1>

                <p className="text-xl md:text-2xl font-semibold mb-8 md:mb-12 text-slate-300 transition-all text-center">
                    Cookies: <span className="text-white text-3xl md:text-5xl tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] block mt-1">{count}</span>
                </p>

                <p className="text-xs md:text-sm font-medium text-slate-400 mb-6 tabular-nums tracking-wide text-center h-4">
                    {autoClickers > 0 && `${autoClickers} cookies / second`}
                </p>

                <button
                    className={`relative text-[100px] md:text-[140px] leading-none select-none transition-transform duration-100 ease-out active:scale-95 hover:scale-105 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] cursor-pointer ${isClicking ? 'scale-90 opacity-90' : 'scale-100'}`}
                    onClick={increment}
                    aria-label="Click Cookie"
                >
                    🍪
                    {isClicking && (
                        <span className="absolute -top-2 -right-2 md:-top-4 md:-right-4 flex items-center justify-center text-2xl md:text-3xl font-black text-amber-200 animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_forwards] opacity-75 pointer-events-none select-none drop-shadow-md">
                            +{clickPower}
                        </span>
                    )}
                </button>
            </div>

            {/* Right side: Upgrades (Compact) */}
            <div className="w-[140px] md:w-[200px] shrink-0 flex flex-col z-10 bg-slate-900/40 backdrop-blur-md border-l border-white/5 shadow-2xl overflow-hidden h-full">
                <div className="p-3 md:p-4 h-full overflow-y-auto custom-scrollbar flex flex-col gap-2.5">
                    <button
                        onClick={buyClickUpgrade}
                        disabled={count < clickUpgradeCost}
                        className="flex flex-col p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/80 hover:border-slate-500/80 disabled:opacity-40 disabled:hover:bg-slate-800/60 disabled:hover:border-slate-700/50 transition-all text-left w-full group"
                    >
                        <div className="flex flex-col w-full mb-1">
                            <span className="font-semibold text-amber-200/90 text-[11px] md:text-xs tracking-wider uppercase mb-0.5">Hover Click</span>
                            <span className="text-amber-400 font-bold text-xs md:text-sm">{clickUpgradeCost} 🍪</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-400/80 leading-tight">Power: <strong className="text-white/90">{clickPower}</strong></p>
                    </button>

                    <button
                        onClick={buyAutoClicker}
                        disabled={count < autoClickerCost}
                        className="flex flex-col p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/80 hover:border-slate-500/80 disabled:opacity-40 disabled:hover:bg-slate-800/60 disabled:hover:border-slate-700/50 transition-all text-left w-full group"
                    >
                        <div className="flex flex-col w-full mb-1">
                            <span className="font-semibold text-amber-200/90 text-[11px] md:text-xs tracking-wider uppercase mb-0.5">Auto Clicker</span>
                            <span className="text-amber-400 font-bold text-xs md:text-sm">{autoClickerCost} 🍪</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-400/80 leading-tight">Total: <strong className="text-white/90">{autoClickers}</strong></p>
                    </button>
                </div>
            </div>
        </div>
    );
}
