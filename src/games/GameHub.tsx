import { App } from "@modelcontextprotocol/ext-apps";
import styles from "./GameHub.module.css";

interface GameHubProps {
    app: App;
    onSelectGame: (gameId: string) => void;
}

export default function GameHub({ onSelectGame }: GameHubProps) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Waiting Room</h1>
            <p className={styles.subtitle}>Please select a mini-game to pass the time!</p>

            <div className={styles.grid}>
                <button className={styles.card} onClick={() => onSelectGame("clicker")}>
                    <div className={styles.cardIcon}>🖱️</div>
                    <h2>Clicker Game</h2>
                    <p>A simple high-score clicker</p>
                </button>

                {/* Placeholder for future games */}
                <button className={styles.card} disabled>
                    <div className={styles.cardIcon}>🐦</div>
                    <h2>Flappy Bird</h2>
                    <p>Coming Soon...</p>
                </button>
            </div>
        </div>
    );
}
