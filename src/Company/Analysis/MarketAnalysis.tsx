import { useState, useEffect } from "react";

export default function MarketAnalysis() {
    const answer : string[] = [
        "The market is down because Mercury is in retrograde",
        "Investors are bullish on companies that have more plants in their offices",
        "Technical analysis shows the chart looks like a sleeping cat pattern",
        "Market sentiment improved after CEO tweeted a funny meme",
        "Analysts predict stocks will go up, down, or possibly sideways",
        "New study shows correlation between ice cream sales and stock prices",
        "Traders panic selling after seeing their horoscope today",
        "Market crash predicted by local squirrel gathering extra nuts",
        "Bitcoin surges after someone accidentally bought instead of sold",
        "Experts say drawing more lines on charts increases accuracy by 420%",
        "S&P 500 dips as investors realize money isn't real anyway",
        "Market rally fueled by collective FOMO and energy drinks",
        "Day traders claim success by trading opposite of their instincts",
        "New AI predicts market moves by analyzing cat videos",
        "Hedge funds investing heavily in companies with cool logos",
        "Market volatility linked to amount of coffee consumed on Wall Street",
        "Investors buying stocks based on company's TikTok presence",
        "Technical indicators show strong buy signal in shape of dinosaur",
        "Market experts recommend investing based on coin flips",
        "Stocks plummet after traders discover the sell button exists"
    ]

    const [currentAnswer, setCurrentAnswer] = useState(answer[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAnswer(answer[Math.floor(Math.random() * answer.length)]);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h3>Market Analysis</h3>
            <p>{currentAnswer}</p>
        </div>
    )
}