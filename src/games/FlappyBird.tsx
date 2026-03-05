import { useState, useEffect, useCallback, useRef } from "react";
import { App } from "@modelcontextprotocol/ext-apps";

interface FlappyBirdProps {
    app: App;
    onExit: () => void;
}

const GRAVITY = 0.6;
const JUMP = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const BIRD_SIZE = 30;

export default function FlappyBird({ onExit }: FlappyBirdProps) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [birdPos, setBirdPos] = useState(window.innerHeight / 2);
    const [birdVel, setBirdVel] = useState(0);
    const [pipes, setPipes] = useState<{ x: number, topHeight: number }[]>([]);
    const [score, setScore] = useState(0);

    const requestRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const jump = useCallback(() => {
        if (gameState === 'playing') {
            setBirdVel(JUMP);
        } else if (gameState === 'start' || gameState === 'gameover') {
            startGame();
        }
    }, [gameState]);

    const startGame = () => {
        setBirdPos(windowSize.height / 2);
        setBirdVel(0);
        setPipes([{ x: windowSize.width, topHeight: Math.random() * (windowSize.height - PIPE_GAP - 100) + 50 }]);
        setScore(0);
        setGameState('playing');
    };

    const updateGame = useCallback(() => {
        if (gameState !== 'playing') return;

        setBirdPos((v) => {
            const newPos = v + birdVel;
            // Floor collision
            if (newPos >= windowSize.height - BIRD_SIZE) {
                setGameState('gameover');
                return windowSize.height - BIRD_SIZE;
            }
            // Ceiling collision
            if (newPos <= 0) {
                setGameState('gameover');
                return 0;
            }
            return newPos;
        });

        setBirdVel((v) => v + GRAVITY);

        setPipes((prevPipes) => {
            let newPipes = prevPipes.map(p => ({ ...p, x: p.x - PIPE_SPEED }));

            // Add new pipe
            if (newPipes[newPipes.length - 1].x < windowSize.width - 250) {
                newPipes.push({
                    x: windowSize.width,
                    topHeight: Math.random() * (windowSize.height - PIPE_GAP - 100) + 50
                });
            }

            // Remove off-screen pipes and add score
            if (newPipes[0].x < -PIPE_WIDTH) {
                newPipes.shift();
                setScore(s => s + 1);
            }

            return newPipes;
        });
    }, [gameState, birdVel, windowSize]);

    // Collision detection
    useEffect(() => {
        if (gameState !== 'playing') return;

        const checkCollision = () => {
            const birdRect = {
                left: 50,
                right: 50 + BIRD_SIZE,
                top: birdPos,
                bottom: birdPos + BIRD_SIZE
            };

            for (let pipe of pipes) {
                const pipeRectTop = {
                    left: pipe.x,
                    right: pipe.x + PIPE_WIDTH,
                    top: 0,
                    bottom: pipe.topHeight
                };

                const pipeRectBottom = {
                    left: pipe.x,
                    right: pipe.x + PIPE_WIDTH,
                    top: pipe.topHeight + PIPE_GAP,
                    bottom: windowSize.height
                };

                const checkIntersect = (rect1: any, rect2: any) => {
                    return (
                        rect1.left < rect2.right &&
                        rect1.right > rect2.left &&
                        rect1.top < rect2.bottom &&
                        rect1.bottom > rect2.top
                    );
                };

                if (checkIntersect(birdRect, pipeRectTop) || checkIntersect(birdRect, pipeRectBottom)) {
                    setGameState('gameover');
                }
            }
        };

        checkCollision();
    }, [birdPos, pipes, gameState, windowSize]);

    // Game loop
    useEffect(() => {
        const loop = () => {
            updateGame();
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [updateGame]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [jump]);

    return (
        <div className="flex h-screen w-screen bg-slate-900 text-slate-100 font-sans overflow-hidden items-center justify-center relative flex-col m-0 p-0">
            {/* Game Canvas container */}
            <div
                className="relative bg-sky-300 w-full h-full overflow-hidden cursor-pointer"
                onClick={jump}
            >
                {/* Score Header inside canvas */}
                <div className="absolute top-8 left-0 right-0 z-20 pointer-events-none flex flex-col items-center select-none">
                    <h1 className="text-3xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 drop-shadow-md text-center" style={{ textShadow: "0px 4px 10px rgba(0,0,0,0.5)" }}>
                        Flappy Bird
                    </h1>
                    <p className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] text-center transition-all">
                        {score}
                    </p>
                </div>

                {/* Absolute Back Button */}
                <button
                    className="absolute top-4 left-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-300 px-3 py-1.5 rounded backdrop-blur-md transition-colors font-medium text-sm flex items-center gap-1.5 z-50 shadow-lg pointer-events-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onExit();
                    }}
                >
                    <span>←</span> Back
                </button>

                {/* Bird */}
                <div
                    className="absolute bg-yellow-400 rounded-full border-2 border-slate-800 shadow-md flex items-center justify-center"
                    style={{
                        width: BIRD_SIZE,
                        height: BIRD_SIZE,
                        left: 50,
                        top: birdPos,
                        transform: `rotate(${Math.min(Math.max((birdVel / JUMP) * -20, -20), 45)}deg)`,
                        transition: 'transform 0.1s'
                    }}
                >
                    <div className="w-2 h-2 bg-white rounded-full absolute right-1 top-1 flex justify-center items-center">
                        <div className="w-1 h-1 bg-black rounded-full" />
                    </div>
                </div>

                {/* Pipes */}
                {pipes.map((pipe, i) => (
                    <div key={i}>
                        {/* Top Pipe */}
                        <div
                            className="absolute bg-green-500 border-x-4 border-b-4 border-slate-800"
                            style={{
                                width: PIPE_WIDTH,
                                height: pipe.topHeight,
                                left: pipe.x,
                                top: 0
                            }}
                        />
                        {/* Bottom Pipe */}
                        <div
                            className="absolute bg-green-500 border-x-4 border-t-4 border-slate-800"
                            style={{
                                width: PIPE_WIDTH,
                                height: windowSize.height - pipe.topHeight - PIPE_GAP,
                                left: pipe.x,
                                top: pipe.topHeight + PIPE_GAP
                            }}
                        />
                    </div>
                ))}

                {/* Overlays */}
                {gameState === 'start' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-30">
                        <span className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Ready?</span>
                        <span className="text-lg md:text-xl drop-shadow-md">Click or press Space to start</span>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-30">
                        <span className="text-5xl md:text-7xl font-bold text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Game Over</span>
                        <span className="text-3xl md:text-4xl mb-6">Score: {score}</span>
                        <span className="text-xl md:text-2xl px-6 py-3 bg-slate-800 rounded-xl border-2 border-slate-600 hover:bg-slate-700 transition cursor-pointer shadow-xl drop-shadow-md">Click to replay</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 right-4 pointer-events-none z-50">
                <p className="text-white/60 font-medium text-xs drop-shadow-md">Space or Click to jump</p>
            </div>
        </div>
    );
}
