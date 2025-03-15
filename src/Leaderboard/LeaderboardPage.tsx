import React from 'react';
import Leaderboard from './Leaderboard';
import '../css/Leaderboard.css';

interface LeaderboardPageProps {
    onBackToGame: () => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onBackToGame }) => {
    return (
        <div className="leaderboard-page">
            <div className="leaderboard-nav">
                <h1 className="leaderboard-title">FROST MAMMOTH LEADERBOARD</h1>
                <button onClick={onBackToGame}>
                    Back to Game
                </button>
            </div>
            <Leaderboard />
        </div>
    );
};

export default LeaderboardPage; 