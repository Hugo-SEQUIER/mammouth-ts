import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState } from '../interface';
import { initialState } from './initialState';
import { calculatePublicDemand, checkTechnologyDone } from './utils';
import { useGameAPI } from './useGameAPI';
import { usePublicKey } from './publicKeyContext';

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
  	const { loadGameState, saveGameState, fetchCurrentPrice, initializeGameState } = useGameAPI();
  	const { publicKey } = usePublicKey();
  	// Charger l'état initial du jeu
  	useEffect(() => {
		const initGame = async () => {
			const savedState = await loadGameState();
			console.log("savedState", savedState);
			if (savedState === 'No game state found') {
				const newState = await initializeGameState();
				console.log("newState", newState);
				dispatch({ type: 'LOAD_STATE', payload: newState });
			} else if (savedState) {
				console.log("savedState", savedState);
				dispatch({ type: 'LOAD_STATE', payload: savedState.state });
			}
		};

		initGame();
  	}, [publicKey]);

  	// Mettre à jour le prix du marché périodiquement
  	useEffect(() => {
		const updateMarketPrice = async () => {
			const price = await fetchCurrentPrice();
			if (price) {
				dispatch({ type: 'UPDATE_INVESTMENT_PRICE', payload: price });
			}
		};

		// Mettre à jour le prix toutes les 5 minutes
		updateMarketPrice();
		const interval = setInterval(updateMarketPrice, 60000*5);

		return () => clearInterval(interval);
  	}, []);

  	// Sauvegarder l'état périodiquement
  	useEffect(() => {
		const saveState = async () => {
			if (publicKey	){
				await saveGameState(state);
			}
		};

		const interval = setInterval(saveState, 5000); // Sauvegarde toutes les 5 secondes

		return () => clearInterval(interval);
  	}, [state]);

  	// Sauvegarder l'état avant de quitter la page
  	useEffect(() => {
		const handleBeforeUnload = async () => {
			if (publicKey){
				await saveGameState(state);
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  	}, [state]);

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

// Basic reducer (you'll want to expand this with actual actions)
const gameReducer = (state: GameState, action: any): GameState => {
	let bonus = 1
	switch (action.type) {
		case "ADD_CLICK":
			return {
				...state,
				basicInfo: {
					...state.basicInfo,
					nbClickAllowed: state.basicInfo.nbClickAllowed + action.payload
				}
			};
		case "MINE_ICE":
			if (state.basicInfo.nbClickAllowed <= 0){
				return state;
			}
			if (checkTechnologyDone("Ice Defogger", state)){
				bonus = 1.15;
			}
			return { ...state, basicInfo: {
				...state.basicInfo,
					ice: (state.basicInfo.ice + (state.basicInfo.icePerClick * bonus)),
					nbClickAllowed: state.basicInfo.nbClickAllowed - 1
				}
			};
		case "AUTO_MINE_ICE":
			if (checkTechnologyDone("Advanced Mining Techniques", state)){
				bonus = 1.2;
			}
			return { ...state, basicInfo: {
				...state.basicInfo,
					ice: (state.basicInfo.ice + (state.basicInfo.icePerSecond * bonus))
				}
			};
		case "UPGRADE_PICKAXE":
			if (state.basicInfo.money < 0.01){
				return state;
			}
			if (state.items.pickaxe.level === 0){
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

			const updatedPublicDemand = calculatePublicDemand(newUserPrice, avgMarketPrice, state);

			return {
				...state,
				market: {
					...state.market,
					userPrice: newUserPrice,
					publicDemand: updatedPublicDemand,
				}
			};
		case 'SELL_ICE':
			if (state.basicInfo.ice < 0.01 || state.items.userLevel < 3){
				return state;
			}
			if (checkTechnologyDone("Brand Recognition", state)){
				bonus = 1.25;
			}
			return {
				...state,
				market: {
					...state.market,
					iceSell: state.market.iceSell + 1,
				},
				basicInfo: {
					...state.basicInfo,
					ice: state.basicInfo.ice - 1,
					money: state.basicInfo.money + (state.market.userPrice * 1 * bonus)
				}
			};
		case "UPGRADE_COMPANY":
			if (state.basicInfo.money < 0.01){
				return state;
			}
			if (state.company.level === 0){
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
		case "UPGRADE_LABORATORY":
			if (state.basicInfo.money < 0.01){
				return state;
			}
			if (state.laboratory.level === 0){
				return {
					...state,
					laboratory: {
						...state.laboratory,
						level: state.laboratory.level + 1,
					},
					basicInfo: {
						...state.basicInfo,
						money: state.basicInfo.money - state.laboratory.upgradeCost
					}
				};
			}
			return {
				...state,
				laboratory: {
					...state.laboratory,
					level: state.laboratory.level + 1,
					upgradeCost: state.laboratory.upgradeCost * 2.5,
					researchSpeed: parseFloat((state.laboratory.researchSpeed * 1.15).toFixed(2))
				},
				basicInfo: {
					...state.basicInfo,
					money: state.basicInfo.money - state.laboratory.upgradeCost
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
			if (action.payload.job === "Junior Miner"){
				employee_production = 1;
			} else if (action.payload.job === "Senior Miner"){
				employee_production = 2;
			}
			return {
				...state,
				company: {
					...state.company,
					employees: state.company.employees.map((employee) => {
						if (employee.job === action.payload.job && employee.amount === 0){
							return { 
								...employee, 
								amount: employee.amount + 1,
								happiness: Math.random() * 100,
								production: employee_production
							};
						} else if (employee.job === action.payload.job && employee.amount > 0){
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
						if (employee.amount === 0){
							return employee;
						}
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
						if (newHappiness === 0){
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
			if (state.company.cashFlow < -3000 || action.payload === "BANKRUPT"){
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
			if (checkTechnologyDone("Trading Algorithms", state)){
				bonus = 1.2;
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
					cashFlow: state.company.cashFlow + (action.payload * state.investment.bitcoin.actualPrice * bonus)
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
			if (checkTechnologyDone("Trading Algorithms", state)){
				bonus = 1.2;
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
					cashFlow: state.company.cashFlow + (action.payload * state.investment.ethereum.actualPrice * bonus)
				}
			};
		case "BUY_spy":
			if (action.payload < 0){
				return state;
			}
			let currentTotalValuespy = state.investment.spy.amount * state.investment.spy.avgBuyPrice;
			let newPurchaseValuespy = action.payload * state.investment.spy.actualPrice;
			let newTotalAmountspy = state.investment.spy.amount + action.payload;
			let newAvgPricespy = (currentTotalValuespy + newPurchaseValuespy) / newTotalAmountspy;
			return {
				...state,
				investment: {
					...state.investment,
					spy: {
						...state.investment.spy,
							amount: newTotalAmountspy,
							avgBuyPrice: newAvgPricespy
					},
				},
				company: {
					...state.company,
					cashFlow: state.company.cashFlow - newPurchaseValuespy
				}
			};
		case "SELL_spy":
			if (action.payload < 0){
				return state;
			}
			if (action.payload > state.investment.spy.amount){
				return state;
			}
			return {
				...state,
				investment: {
					...state.investment,
					spy: {
						...state.investment.spy,
						amount: state.investment.spy.amount - action.payload,
					},
				},
			};
		case "START_RESEARCH":
			if (checkTechnologyDone("Multi-tasking", state) || state.laboratory.researchQueue.length === 0){
				return {
					...state,
					laboratory: {
						...state.laboratory,
						researchQueue: [...state.laboratory.researchQueue, action.payload],
					},
					basicInfo: {
						...state.basicInfo,
						money: state.basicInfo.money - action.payload.cost
					}
				};
			}
			return state;
		case "PROGRESS_RESEARCH":
			if (state.laboratory.researchQueue.length === 0) {
				return state;
			}
			if (checkTechnologyDone("Research Efficiency", state)){
				bonus = 1.25;
			}
			let newDone = [];
			let updatedQueue = [];
			for (const tech of state.laboratory.researchQueue){
				let newProgress: number = tech.researchTime - (state.laboratory.researchSpeed * bonus);
				if (newProgress <= 0){
					newDone.push(tech);
				} else {
					tech.researchTime = newProgress;
					updatedQueue.push(tech);
				}
			}
			return {
				...state,
				laboratory: {
					...state.laboratory,
					researchDone: [...state.laboratory.researchDone, ...newDone],
					researchQueue: updatedQueue
				}
			};
		case 'LOAD_STATE':
			return {
				...state,
				...action.payload
			};
		case 'UPDATE_INVESTMENT_PRICE':
			const priceMap = action.payload.reduce((acc: any, item: any) => {
				acc[item.symbol.toLowerCase()] = item.current_price;
				return acc;
			}, {});

			return {
				...state,
				investment: {
					...state.investment,
					bitcoin: {
						...state.investment.bitcoin,
						actualPrice: priceMap.bitcoin || state.investment.bitcoin.actualPrice
					},
					ethereum: {
						...state.investment.ethereum,
						actualPrice: priceMap.ethereum || state.investment.ethereum.actualPrice
					},
					spy: {
						...state.investment.spy,
						actualPrice: priceMap.spy || state.investment.spy.actualPrice
					}
				},
			};
		default:
			return state;
  	}
};
