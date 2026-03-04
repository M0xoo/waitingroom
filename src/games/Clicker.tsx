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
        <div className="flex justify-between min-h-screen w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
            {/* Left side: Back Button */}
            <div className="w-1/4 p-6 flex flex-col items-start relative z-10">
                <button
                    className="bg-slate-800/50 hover:bg-slate-700/80 border border-slate-600 text-slate-200 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors font-medium tracking-wide flex items-center gap-2"
                    onClick={onExit}
                >
                    <span>←</span> Back to Hub
                </button>
            </div>

            {/* Center: The Game */}
            <div className="w-2/4 flex flex-col items-center justify-center p-12 z-10 relative">
                <h1 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-sm">
                    Cookie Clicker
                </h1>

                <p className="text-2xl font-semibold mb-12 text-slate-300 transition-all">
                    Cookies: <span className="text-white text-5xl tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{count}</span>
                </p>

                <p className="text-sm font-medium text-slate-400 mb-8 tabular-nums tracking-wide">
                    {autoClickers > 0 && `${autoClickers} cookies / second`}
                </p>

                <button
                    className={`relative text-[160px] leading-none select-none transition-transform duration-100 ease-out active:scale-95 hover:scale-105 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] cursor-pointer ${isClicking ? 'scale-90 opacity-90' : 'scale-100'}`}
                    onClick={increment}
                    aria-label="Click Cookie"
                >
                    🍪
                    {isClicking && (
                        <span className="absolute -top-4 -right-4 flex items-center justify-center text-4xl font-black text-amber-200 animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_forwards] opacity-75 pointer-events-none select-none">
                            +{clickPower}
                        </span>
                    )}
                </button>
            </div>

            {/* Right side: Upgrades */}
            <div className="w-1/4 p-6 flex flex-col items-stretch z-10 bg-slate-900/50 backdrop-blur-sm border-l border-slate-800 shadow-xl overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-slate-200 uppercase tracking-widest border-b border-slate-700 pb-2">Upgrades</h3>

                <button
                    onClick={buyClickUpgrade}
                    disabled={count < clickUpgradeCost}
                    className="flex flex-col mb-4 p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:hover:bg-slate-800/80 disabled:hover:border-slate-700 transition-all text-left"
                >
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="font-bold text-amber-100 text-lg">Hover Click</span>
                        <span className="text-amber-400 font-semibold">{clickUpgradeCost} 🍪</span>
                    </div>
                    <p className="text-sm text-slate-400">Current power: <strong className="text-white">{clickPower}</strong> per click</p>
                </button>

                <button
                    onClick={buyAutoClicker}
                    disabled={count < autoClickerCost}
                    className="flex flex-col mb-4 p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:hover:bg-slate-800/80 disabled:hover:border-slate-700 transition-all text-left"
                >
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="font-bold text-amber-100 text-lg">Auto Clicker</span>
                        <span className="text-amber-400 font-semibold">{autoClickerCost} 🍪</span>
                    </div>
                    <p className="text-sm text-slate-400">Current amount: <strong className="text-white">{autoClickers}</strong> active</p>
                </button>
            </div>
        </div>
    );
}
