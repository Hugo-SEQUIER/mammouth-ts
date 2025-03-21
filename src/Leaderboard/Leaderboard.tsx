import React, { useState, useEffect } from 'react';
import { useGameAPI } from '../context/useGameAPI';
import { usePublicKey } from '../context/publicKeyContext';
import '../css/Leaderboard.css';

type LeaderboardEntry = {
    userPublicKey: string;
    ice: number;
    nbClick?: number; // Make nbClick optional
};

type SortField = 'ice' | 'nbClick';

const Leaderboard: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [entriesPerPage] = useState<number>(10);
    const [sortField, setSortField] = useState<SortField>('ice');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const { fetchLeaderboard } = useGameAPI();
    const { publicKey } = usePublicKey();

    // Function to fetch leaderboard data
    const loadLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchLeaderboard();
            if (data) {
                console.log("data", data);
                // Ensure all entries have nbClick property
                const processedData = data.map((entry: any) => ({
                    ...entry,
                    nbClick: entry.nbClick || 0 // Default to 0 if nbClick is missing
                }));
                // List of addresses to exclude from leaderboard
                const excludedAddresses = [
                    "By1KrbUVMyupM3Ut4beSmHjGkMD467MM67QCW8jRGGRG",
                    "4AS7w4syHXsRd1Vhpa8o3AB8NBEQCrRZ57upBP6aexWf",
                    "EuqhVfGu294cvjSUtfbsCmc6iFZjoPRMnvqytJrMEfwp",
                    "4tGPs2dP1mKKEgoWNNL1skTEzUUnjceLKShbCrtEth6S",
                    "EeuZcwmpBWAdD2f52ZByMzARUEUjUryYf4YGanX9ZGk6",
                    "5bRTJ5z1tUQkjSgcASQ4oPVAPBDG5cbhLZsDcCL9mfGj",
                    "A7zaaQk8AtkNtCy8xp4ENs2idCSicMa5EtwekeC2n2Gn",
                    "2viuZAZtzJ4VX6goQtUBUdX9SYz5WvCG9TP8AihkV41i "
                ];

                // Filter out excluded addresses
                const filteredData = processedData.filter((entry: any) => 
                    !excludedAddresses.includes(entry.userPublicKey)
                );
                setLeaderboardData(filteredData);
            } else {
                setError('Failed to load leaderboard data');
            }
        } catch (err) {
            setError('An error occurred while fetching leaderboard data');
            console.error('Leaderboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load leaderboard data on component mount
    useEffect(() => {
        loadLeaderboard();
        // Set up auto-refresh every 5 minutes
        const refreshInterval = setInterval(loadLeaderboard, 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, [fetchLeaderboard]);

    // Sort data based on current sort field and direction
    const sortedData = [...leaderboardData].sort((a, b) => {
        // Use default values of 0 if properties are undefined
        const valueA = sortField === 'nbClick' ? (a.nbClick || 0) : a.ice;
        const valueB = sortField === 'nbClick' ? (b.nbClick || 0) : b.ice;
        
        if (sortDirection === 'asc') {
            return valueA - valueB;
        } else {
            return valueB - valueA;
        }
    });

    // Find user's rank and data
    const getUserRankAndData = () => {
        if (!publicKey || sortedData.length === 0) return null;
        
        const userIndex = sortedData.findIndex(entry => entry.userPublicKey === publicKey);
        if (userIndex === -1) return null;
        
        return {
            rank: userIndex + 1,
            data: sortedData[userIndex]
        };
    };

    const userRankInfo = getUserRankAndData();

    // Calculate pagination
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedData.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(sortedData.length / entriesPerPage);

    // Handle page changes
    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Handle sort changes
    const handleSort = (field: SortField) => {
        if (field === sortField) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Default to descending for new field
            setSortField(field);
            setSortDirection('desc');
        }
        // Reset to first page when sorting changes
        setCurrentPage(1);
    };

    // Format ice amount with commas and 2 decimal places
    const formatIce = (ice: number): string => {
        return ice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Format number with commas
    const formatNumber = (num: number | undefined): string => {
        // Return '0' if num is undefined
        if (num === undefined) return '0';
        return num.toLocaleString('en-US');
    };

    // Truncate public key for display
    const truncateAddress = (address: string): string => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Get sort indicator
    const getSortIndicator = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2 className="leaderboard-title">Ice Mining Leaderboard</h2>
                <button 
                    onClick={loadLeaderboard}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* User Rank Display */}
            {!loading && !error && userRankInfo && (
                <div className="user-rank-display">
                    <h3>Your Ranking</h3>
                    <div className="user-rank-card">
                        <div className="user-rank-position">
                            <span className="rank-label">Rank</span>
                            <span className={`rank-value rank-${userRankInfo.rank <= 3 ? userRankInfo.rank : ''}`}>
                                #{userRankInfo.rank}
                            </span>
                        </div>
                        <div className="user-rank-details">
                            <div className="user-address">
                                <span>{truncateAddress(userRankInfo.data.userPublicKey)}</span>
                            </div>
                            <div className="user-stats">
                                <div className="user-ice">
                                    <span className="stat-label">Ice:</span>
                                    <span className="stat-value">{formatIce(userRankInfo.data.ice)}</span>
                                </div>
                                <div className="user-clicks">
                                    <span className="stat-label">Clicks:</span>
                                    <span className="stat-value">{formatNumber(userRankInfo.data.nbClick)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && <div className="leaderboard-loading">Loading leaderboard data...</div>}
            
            {error && <div className="leaderboard-error">{error}</div>}
            
            {!loading && !error && leaderboardData.length === 0 && (
                <div className="leaderboard-loading">No leaderboard data available</div>
            )}

            {!loading && !error && leaderboardData.length > 0 && (
                <>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th 
                                    className="sortable-header"
                                    onClick={() => handleSort('ice')}
                                >
                                    Ice Amount {getSortIndicator('ice')}
                                </th>
                                <th 
                                    className="sortable-header"
                                    onClick={() => handleSort('nbClick')}
                                >
                                    Total Clicks {getSortIndicator('nbClick')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEntries.map((entry, index) => {
                                const rank = indexOfFirstEntry + index + 1;
                                const isCurrentUser = entry.userPublicKey === publicKey;
                                
                                return (
                                    <tr 
                                        key={entry.userPublicKey} 
                                        className={isCurrentUser ? 'current-user' : ''}
                                    >
                                        <td className={`leaderboard-rank leaderboard-rank-${rank <= 3 ? rank : ''}`}>
                                            {rank}
                                        </td>
                                        <td className="leaderboard-address" title={entry.userPublicKey}>
                                            {truncateAddress(entry.userPublicKey)}
                                            {isCurrentUser && ' (You)'}
                                        </td>
                                        <td className="leaderboard-ice">
                                            {formatIce(entry.ice)}
                                        </td>
                                        <td className="leaderboard-clicks">
                                            {formatNumber(entry.nbClick)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="leaderboard-pagination">
                            <button 
                                onClick={() => goToPage(1)} 
                                disabled={currentPage === 1}
                            >
                                First
                            </button>
                            <button 
                                onClick={() => goToPage(currentPage - 1)} 
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button 
                                onClick={() => goToPage(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                            <button 
                                onClick={() => goToPage(totalPages)} 
                                disabled={currentPage === totalPages}
                            >
                                Last
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Leaderboard; 