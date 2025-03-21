import { clamp } from 'lodash';
import { GameState } from '../interface';
import { interactWithContract } from '../api';
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

export async function checkInteractionDone(){
    const result = await interactWithContract();
    if (result.state === 'error'){
        return false;
    }
    return true;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every specified wait period.
 * 
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Deep compares two objects to check if they are equal
 * 
 * @param obj1 First object to compare
 * @param obj2 Second object to compare
 * @returns Boolean indicating if the objects are equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}