import { clamp } from 'lodash';
import { GameState } from '../interface';
// Utility function to calculate public demand
export function calculatePublicDemand(
    userPrice: number, 
    avgMarketPrice: number,
    state: GameState
): number {
    // Define constants
    const ELASTICITY = 1.2; // Adjust sensitivity
    const MIN_DEMAND = 0;
    const MAX_DEMAND = 1000;
    const HIGH_PRICE_MULTIPLIER = 1.7;
    const LOW_PRICE_MULTIPLIER = 0.7;
    const HIGH_PRICE_MALUS = 0.1; // 10% of MIN_DEMAND

    // Step 1: Calculate price ratio
    const priceRatio = avgMarketPrice / userPrice;

    // Step 2: Check if userPrice exceeds HIGH_PRICE_MULTIPLIER * avgMarketPrice
    if (userPrice > HIGH_PRICE_MULTIPLIER * avgMarketPrice) {
        return clamp(MIN_DEMAND * HIGH_PRICE_MALUS, MIN_DEMAND, MAX_DEMAND);
    }

    // Step 3: Enforce userPrice within [LOW_PRICE_MULTIPLIER * avgMarketPrice, HIGH_PRICE_MULTIPLIER * avgMarketPrice]
    const clampedPriceRatio = clamp(priceRatio, 1 / HIGH_PRICE_MULTIPLIER, 1 / LOW_PRICE_MULTIPLIER);

    // Step 4: Apply price elasticity
    let demandMultiplier = Math.pow(clampedPriceRatio, ELASTICITY);

    // Step 5: Calculate final demand (scale as needed)
    const newDemand = demandMultiplier * 100; // Scaling factor to adjust demand range
    if (checkTechnologyDone("Customer Relations", state)){
        return clamp(newDemand * 1.3, MIN_DEMAND, MAX_DEMAND);
    }
    // Step 6: Clamp demand between bounds
    return clamp(newDemand, MIN_DEMAND, MAX_DEMAND);
}

export function checkTechnologyDone(technologyName: string, state: GameState): boolean {
    return state.laboratory.researchDone.some(tech => tech.name === technologyName);
}