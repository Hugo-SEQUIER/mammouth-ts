import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState } from '../interface';
import { initialState } from './initialState';
import { clamp } from 'lodash';

// Define the context type
type GamingContextType = {
	state: GameState;
	dispatch: React.Dispatch<any>; // We'll type this better when we create actions
};

// Create the context
const GamingContext = createContext<GamingContextType | undefined>(undefined);

// Create a provider component
type GamingProviderProps = {
	children: ReactNode;
};

export const GamingProvider: React.FC<GamingProviderProps> = ({ children }) => {
  	const [state, dispatch] = useReducer(gameReducer, initialState);

  	return (
		<GamingContext.Provider value={{ state, dispatch }}>
	  		{children}
		</GamingContext.Provider>
  	);
};

// Create a custom hook for using the context
export const useGaming = () => {
  	const context = useContext(GamingContext);
  	if (context === undefined) {
		throw new Error('useGaming must be used within a GamingProvider');
  	}
  	return context;
};

// Define constants
const ELASTICITY = 1.2; // Adjust sensitivity
const MIN_DEMAND = 0;
const MAX_DEMAND = 1000;
const HIGH_PRICE_MULTIPLIER = 1.7;
const LOW_PRICE_MULTIPLIER = 0.7;
const HIGH_PRICE_MALUS = 0.1; // 10% of MIN_DEMAND

// Utility function to calculate public demand
function calculatePublicDemand(
    userPrice: number, 
    avgMarketPrice: number
): number {
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

    // Step 6: Clamp demand between bounds
    return clamp(newDemand, MIN_DEMAND, MAX_DEMAND);
}

// Basic reducer (you'll want to expand this with actual actions)
const gameReducer = (state: GameState, action: any): GameState => {
	switch (action.type) {
		case "MINE_ICE":
			return { ...state, basicInfo: {
				...state.basicInfo,
					ice: (state.basicInfo.ice + state.basicInfo.icePerClick)
				}
			};
		case "AUTO_MINE_ICE":
			return { ...state, basicInfo: {
				...state.basicInfo,
					ice: (state.basicInfo.ice + state.basicInfo.icePerSecond)
				}
			};
		case "UPGRADE_PICKAXE":
			if (state.basicInfo.money < 0.01){
				return state;
			}
			if (state.items.pickaxe.level == 0){
				return {
					...state, 
					items: {
						...state.items,
						pickaxe: { 
							...state.items.pickaxe, 
							level: state.items.pickaxe.level + 1, 
							upgradeCost: state.items.pickaxe.upgradeCost * 1.5 
						},
					},
					basicInfo: {
						...state.basicInfo,
						icePerClick: state.basicInfo.icePerClick * 1.15
					}
				};
			}
			return { 
				...state, 
				items: {
					...state.items,
					pickaxe: { 
						...state.items.pickaxe, 
						level: state.items.pickaxe.level + 1, 
						upgradeCost: state.items.pickaxe.upgradeCost * 1.5 
					},
				},
				basicInfo: {
					...state.basicInfo,
					money: state.basicInfo.money - state.items.pickaxe.upgradeCost,
					icePerClick: state.basicInfo.icePerClick * 1.15
				}
			};
		case "UPGRADE_USER_LEVEL":
			return { 
				...state, 
				items: {
					...state.items,
					userLevel: state.items.userLevel + 1,
					costUpgrade: state.items.costUpgrade * 1.4
				},
				basicInfo: {
					...state.basicInfo,
					ice: state.basicInfo.ice - state.items.costUpgrade
				}
			};
		case "SET_USER_PRICE":
			const newUserPrice = action.payload;
			const avgMarketPrice = state.market.marketPrice; // Assuming avgMarketPrice is marketPrice

			const updatedPublicDemand = calculatePublicDemand(newUserPrice, avgMarketPrice);

			return {
				...state,
				market: {
					...state.market,
					userPrice: newUserPrice,
					publicDemand: updatedPublicDemand,
				}
			};
		case 'SELL_ICE':
			return {
				...state,
				market: {
					...state.market,
					iceSell: state.market.iceSell + action.payload,
				},
				basicInfo: {
					...state.basicInfo,
					ice: state.basicInfo.ice - action.payload,
					money: state.basicInfo.money + state.market.userPrice * action.payload
				}
			};
		case "UPGRADE_COMPANY":
			if (state.basicInfo.money < 0.01){
				return state;
			}
			if (state.company.level == 0){
				return {
					...state,
					company: {
						...state.company,
						level: state.company.level + 1,
						upgradeCost: state.company.upgradeCost * 2.5,
					},
				};
			}
			return {
				...state,
				company: {
					...state.company,
					level: state.company.level + 1,
					upgradeCost: state.company.upgradeCost * 2.5,
				},
				basicInfo: {
					...state.basicInfo,
					money: state.basicInfo.money - state.company.upgradeCost
				}
			};
		case "INJECT_CASH":
			if (state.basicInfo.money < 0.01 || action.payload > state.basicInfo.money){
				return state;
			}
			return {
				...state,
				basicInfo: {
					...state.basicInfo,
					money: state.basicInfo.money - action.payload
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow + action.payload
				}
			};
		case "HIRED_EMPLOYEE":
			let employee_production = 0;
			if (action.payload.job == "Junior Miner"){
				employee_production = 1;
			} else if (action.payload.job == "Senior Miner"){
				employee_production = 2;
			}
			return {
				...state,
				company: {
					...state.company,
					employees: state.company.employees.map((employee) => {
						if (employee.job == action.payload.job && employee.amount == 0){
							return { 
								...employee, 
								amount: employee.amount + 1,
								happiness: Math.random() * 100,
								production: employee_production
							};
						} else if (employee.job == action.payload.job && employee.amount > 0){
							return {
								...employee,
								amount: employee.amount + 1,
								production: employee.production + employee_production	
							};
						}
						return employee;
					}),
					cashFlow: state.company.cashFlow - action.payload.salary
				}
			};
		case "UPDATE_ICE_PER_SECOND":
			return {
				...state,
				basicInfo: {
					...state.basicInfo,
					icePerSecond: parseFloat(state.company.employees.reduce((acc, employee) => 
						employee.amount > 0 ? acc + employee.production : acc, 0).toFixed(2))
				}
			};
		case "UPDATE_HAPPINESS":
			return {
				...state,
				company: {
					...state.company,
					employees: state.company.employees.map((employee) => {
						let base_production = 0;
						let base_employee = employee;
						if (employee.job === "Junior Miner") {
							base_production = employee.amount;
							base_employee = {
								amount: 0,
								job: "Junior Miner",
								salary: 100,
								happiness: 0,
								production: 1,
							}
						} else if (employee.job === "Senior Miner") {
							base_production = employee.amount * 2;
							base_employee = {
								amount: 0,
								job: "Senior Miner",
								salary: 600,
								happiness: 0,
								production: 2,
							}
						}
						// Decrease happiness by 0.01 each second
						const newHappiness = Math.max(employee.happiness - 0.01, 0);
						if (newHappiness == 0){
							return base_employee;
						}
						// Adjust production based on happiness (e.g., linear scaling)
						const adjustedProduction = base_production * (newHappiness / 100);

						return {
							...employee,
							happiness: newHappiness,
							production: adjustedProduction
						};
					})
				}
			};
		case "PAY_EMPLOYEE":
			return {
				...state,
				company: {
					...state.company,
					employees: state.company.employees.map((employee) => {
						if (employee.job === action.payload.job) {
							// Reset happiness to 100% and recalculate base production
							let base_production = 0;
							if (employee.job === "Junior Miner") {
								base_production = employee.amount;
							} else if (employee.job === "Senior Miner") {
								base_production = employee.amount * 2;
							}

							return {
								...employee,
								happiness: 100,
								production: base_production // Reset to full production
							};
						}
						return employee;
					}),
					cashFlow: state.company.cashFlow - (action.payload.salary * action.payload.amount)
				}
			};
		case "BANKRUPT":
			if (state.company.cashFlow < -3000 || action.payload == "BANKRUPT"){
				return {
					...state,
					company: initialState.company,
					basicInfo: {
						...state.basicInfo,
						ice: 0,
						icePerSecond: 0,
						money: 0
					}

				};
			}
			return state;
		case "BUY_BITCOIN":
			if (action.payload < 0){
				return state;
			}
			let currentTotalValueBitcoin = state.investment.bitcoin.amount * state.investment.bitcoin.avgBuyPrice;
			let newPurchaseValueBitcoin = action.payload * state.investment.bitcoin.actualPrice;
			let newTotalAmountBitcoin = state.investment.bitcoin.amount + action.payload;
			let newAvgPriceBitcoin = (currentTotalValueBitcoin + newPurchaseValueBitcoin) / newTotalAmountBitcoin;

			return {
				...state,
				investment: {
					...state.investment,
					bitcoin: {
						...state.investment.bitcoin,
							amount: newTotalAmountBitcoin,
							avgBuyPrice: newAvgPriceBitcoin
					},
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow - newPurchaseValueBitcoin
				}
			};
		case "SELL_BITCOIN":
			if (action.payload < 0){
				return state;
			}
			return {
				...state,
				investment: {
					...state.investment,
					bitcoin: {
						...state.investment.bitcoin,
						amount: state.investment.bitcoin.amount - action.payload,
					},
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow + action.payload * state.investment.bitcoin.actualPrice
				}
			};
		case "BUY_ETHEREUM":
			if (action.payload < 0){
				return state;
			}
			let currentTotalValueEthereum = state.investment.ethereum.amount * state.investment.ethereum.avgBuyPrice;
			let newPurchaseValueEthereum = action.payload * state.investment.ethereum.actualPrice;
			let newTotalAmountEthereum = state.investment.ethereum.amount + action.payload;
			let newAvgPriceEthereum = (currentTotalValueEthereum + newPurchaseValueEthereum) / newTotalAmountEthereum;
			return {
				...state,
				investment: {
					...state.investment,
					ethereum: {
						...state.investment.ethereum,
							amount: newTotalAmountEthereum,
							avgBuyPrice: newAvgPriceEthereum
					},
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow - newPurchaseValueEthereum
				}
			};
		case "SELL_ETHEREUM":
			if (action.payload < 0){
				return state;
			}
			return {
				...state,
				investment: {
					...state.investment,
					ethereum: {
						...state.investment.ethereum,
						amount: state.investment.ethereum.amount - action.payload,
					},
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow + action.payload * state.investment.ethereum.actualPrice
				}
			};
		case "BUY_SP500":
			if (action.payload < 0){
				return state;
			}
			let currentTotalValueSP500 = state.investment.sp500.amount * state.investment.sp500.avgBuyPrice;
			let newPurchaseValueSP500 = action.payload * state.investment.sp500.actualPrice;
			let newTotalAmountSP500 = state.investment.sp500.amount + action.payload;
			let newAvgPriceSP500 = (currentTotalValueSP500 + newPurchaseValueSP500) / newTotalAmountSP500;
			return {
				...state,
				investment: {
					...state.investment,
					sp500: {
						...state.investment.sp500,
							amount: newTotalAmountSP500,
							avgBuyPrice: newAvgPriceSP500
					},
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow - newPurchaseValueSP500
				}
			};
		case "SELL_SP500":
			if (action.payload < 0){
				return state;
			}
			if (action.payload > state.investment.sp500.amount){
				return state;
			}
			return {
				...state,
				investment: {
					...state.investment,
					sp500: {
						...state.investment.sp500,
						amount: state.investment.sp500.amount - action.payload,
					},
				},
			};
		default:
			return state;
  	}
};
