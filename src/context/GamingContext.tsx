import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { GameState } from '../interface';
import { initialState } from './initialState';
import { calculatePublicDemand, checkTechnologyDone, deepEqual } from './utils';
import { useGameAPI } from './useGameAPI';
import { usePublicKey } from './publicKeyContext';

// Define the context type
type GamingContextType = {
	state: GameState;
	dispatch: React.Dispatch<any>;
	customDispatch: React.Dispatch<any>;
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
	
	// Add a save timer and pending changes flag
	const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
	const hasPendingChanges = useRef(false);
	const lastSavedStateRef = useRef<GameState | null>(null);
	const saveInProgressRef = useRef(false);
	const loadingStateRef = useRef(false);
	const maxRetries = 3;

	// Debounced save function to reduce API calls
	const debouncedSave = useCallback(async (gameState: GameState) => {
		
		// Don't queue another save if one is already in progress
		if (saveInProgressRef.current) {
			hasPendingChanges.current = true;
			console.log("Save already in progress, marking pending changes");
			return;
		}
		
		// Mark that we have pending changes
		hasPendingChanges.current = true;
		
		// Clear any existing timer to prevent multiple saves
		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current);
		}
		
		// Set a new timer with a shorter delay
		saveTimerRef.current = setTimeout(() => {
			
			// Use an IIFE to handle async operations
			(async () => {
				// Set the flag to prevent concurrent saves
				if (saveInProgressRef.current) {
					console.log("Another save operation started in the meantime");
					return;
				}
				
				saveInProgressRef.current = true;
				console.log("Starting save operation");
				
				try {
					// Only save if there are actual changes
					if (!lastSavedStateRef.current || !deepEqual(lastSavedStateRef.current, gameState)) {
						await saveGameState(gameState);
						lastSavedStateRef.current = JSON.parse(JSON.stringify(gameState));
						console.log("Save completed successfully");
					}
				} catch (error) {
					console.error("Error in save operation:", error);
				} finally {
					// Always reset the flag when done
					saveInProgressRef.current = false;
					hasPendingChanges.current = false;
				}
			})();
		}, 500); // Reduced to 500ms to make it more responsive
	}, [saveGameState]);

	// Custom dispatch function to save state after each action
	const customDispatch = useCallback(async (action: any) => {
		dispatch(action);
		// Use the updated state after dispatch, not the current state
		const updatedState = gameReducer(state, action);
		debouncedSave(updatedState);
	}, [state, debouncedSave]);

	// Helper function to wait for a specified time
	const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	// Charger l'état initial du jeu
	useEffect(() => {
		const initGame = async () => {
			if (!publicKey || loadingStateRef.current) return;
			
			loadingStateRef.current = true;
			let retries = 0;
			let savedState = null;
			
			// Try to load the game state with retries
			while (retries < maxRetries && !savedState) {
				try {
					console.log(`Attempting to load game state (attempt ${retries + 1}/${maxRetries})...`);
					savedState = await loadGameState();
					console.log("Loaded game state:", savedState);
					
					if (savedState === null) {
						throw new Error('Failed to load game state');
					}
				} catch (error) {
					retries++;
					console.error(`Error loading game state (attempt ${retries}/${maxRetries}):`, error);
					
					if (retries < maxRetries) {
						// Wait before retrying
						await wait(2000);
					}
				}
			}
			
			// Process the loaded state or initialize a new one
			if (savedState && savedState !== 'No game state found') {
				console.log("Using existing game state:", savedState);
				dispatch({ type: 'LOAD_STATE', payload: savedState.state });
				lastSavedStateRef.current = JSON.parse(JSON.stringify(savedState.state));
			} else {
				console.log("No existing game state found, initializing new state...");
				try {
					const newState = await initializeGameState();
					console.log("Initialized new game state:", newState);
					
					if (newState) {
						dispatch({ type: 'LOAD_STATE', payload: newState });
						lastSavedStateRef.current = JSON.parse(JSON.stringify(newState));
					} else {
						console.error("Failed to initialize new game state, using default state");
						dispatch({ type: 'LOAD_STATE', payload: initialState });
						lastSavedStateRef.current = JSON.parse(JSON.stringify(initialState));
					}
				} catch (error) {
					console.error("Error initializing new game state:", error);
					console.log("Using default initial state");
					dispatch({ type: 'LOAD_STATE', payload: initialState });
					lastSavedStateRef.current = JSON.parse(JSON.stringify(initialState));
				}
			}
			
			loadingStateRef.current = false;
		};

		initGame();
	}, [publicKey, loadGameState, initializeGameState]);

	// Mettre à jour le prix du marché périodiquement
	useEffect(() => {
		const updateMarketPrice = async () => {
			const price = await fetchCurrentPrice();
			if (price) {
				customDispatch({ type: 'UPDATE_INVESTMENT_PRICE', payload: price });
			}
		};

		// Mettre à jour le prix toutes les minutes
		updateMarketPrice();
		const interval = setInterval(updateMarketPrice, 60000 * 1);

		return () => clearInterval(interval);
	}, []);

	// Sauvegarder l'état avant de quitter la page
	useEffect(() => {
		const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
			// If we have pending changes, force an immediate save
			if (hasPendingChanges.current) {
				// Cancel any pending debounced save
				if (saveTimerRef.current) {
					clearTimeout(saveTimerRef.current);
				}
				
				// Force synchronous save before unload
				event.preventDefault();
				event.returnValue = '';
				await debouncedSave(state);
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [state, saveGameState]);

	// Periodic save to ensure state is saved even if user doesn't trigger actions
	useEffect(() => {
		const periodicSaveInterval = setInterval(() => {
			if (hasPendingChanges.current && !saveInProgressRef.current) {
				debouncedSave(state);
			}
		}, 2000); // Changed from 1000 to 2000 milliseconds (2 seconds)

		return () => clearInterval(periodicSaveInterval);
	}, [state, debouncedSave]);

	return (
		<GamingContext.Provider value={{ state, dispatch: customDispatch, customDispatch }}>
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
					nbClick: state.basicInfo.nbClick + 1,
					nbClickAllowed: state.basicInfo.nbClickAllowed - 1
				}
			};
		case "AUTO_MINE_ICE":
			if (checkTechnologyDone("Advanced Mining Techniques", state)){
				bonus = 1.2;
			}
			if (checkTechnologyDone("Permafrost Engineering", state)){
				bonus = 1.2 * 1.3;
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
		case "UPGRADE_GLOVES":
			if (state.basicInfo.money < 0.01){
				return state;
			}
			if (state.items.gloves.level === 0){
				return {
					...state, 
					items: {
						...state.items,
						gloves: { 
							...state.items.gloves, 
							level: state.items.gloves.level + 1, 
							upgradeCost: state.items.gloves.upgradeCost * 1.8 
						},
					},
					basicInfo: {
						...state.basicInfo,
						icePerClick: state.basicInfo.icePerClick * 1.2
					}
				};
			}
			return { 
				...state, 
				items: {
					...state.items,
					gloves: { 
						...state.items.gloves, 
						level: state.items.gloves.level + 1, 
						upgradeCost: state.items.gloves.upgradeCost * 1.8 
					},
				},
				basicInfo: {
					...state.basicInfo,
					money: state.basicInfo.money - state.items.gloves.upgradeCost,
					icePerClick: state.basicInfo.icePerClick * 1.2
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
					researchSpeed: parseFloat(((state.laboratory.researchSpeed * 1.15) || 0).toFixed(2))
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
			if (action.payload < 0){
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
			} else if (action.payload.job === "Frost Mage"){
				employee_production = 3.2;
			} else if (action.payload.job === "Yeti"){
				employee_production = 5;
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
						} else if (employee.job === "Frost Mage") {
							base_production = employee.amount * 3.2;
							base_employee = {
								amount: 0,
								job: "Frost Mage",
								salary: 1500,
								happiness: 0,
								production: 2,
							}
						} else if (employee.job === "Yeti") {
							base_production = employee.amount * 5;
							base_employee = {
								amount: 0,
								job: "Yeti",
								salary: 3000,
								happiness: 0,
								production: 5,
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
			if (action.payload < 0 || action.payload > state.investment.bitcoin.amount){
				return state;
			}
			// if (checkTechnologyDone("Trading Algorithms", state)){
			// 	bonus = 1.2;
			// }
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
			if (action.payload < 0 || action.payload > state.investment.ethereum.amount){
				return state;
			}
			// if (checkTechnologyDone("Trading Algorithms", state)){
			// 	bonus = 1.2;
			// }
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
			case "BUY_LAIKA":
				if (action.payload < 0){
					return state;
				}
				let currentTotalValueLaika= state.investment.laika.amount * state.investment.laika.avgBuyPrice;
				let newPurchaseValueLaika = action.payload * state.investment.laika.actualPrice;
				let newTotalAmountLaika = state.investment.laika.amount + action.payload;
				let newAvgPriceLaika = (currentTotalValueLaika + newPurchaseValueLaika) / newTotalAmountEthereum;
				return {
					...state,
					investment: {
						...state.investment,
						laika: {
							...state.investment.laika,
								amount: newTotalAmountLaika,
								avgBuyPrice: newAvgPriceLaika
						},
					},
					company: {
						...state.company,
						cashFlow: state.company.cashFlow - newPurchaseValueLaika
					}
				};
			case "SELL_LAIKA":
				if (action.payload < 0 || action.payload > state.investment.laika.amount){
					return state;
				}
				// if (checkTechnologyDone("Trading Algorithms", state)){
				// 	bonus = 1.2;
				// }
				return {
					...state,
					investment: {
						...state.investment,
						laika: {
							...state.investment.laika,
							amount: state.investment.laika.amount - action.payload,
						},
					},
					company: {
						...state.company,
						cashFlow: state.company.cashFlow + (action.payload * state.investment.laika.actualPrice * bonus)
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
		case "BUY_ENERGY_BAR":
			console.log("BUY_ENERGY_BAR");
			console.log(state.shop.energyBar.price);
			console.log(state.shop.energyBar.boost);

			if (state.basicInfo.money < state.shop.energyBar.price){
				return state;
			}
			return {
				...state,
				shop: {
					...state.shop,
					energyBar: {
						...state.shop.energyBar,
						price: state.shop.energyBar.price * 1.05,
						isActive: true
					}
				},
				basicInfo: {
					...state.basicInfo,
					money: state.basicInfo.money - state.shop.energyBar.price,
					icePerClick: state.basicInfo.icePerClick + 0.2
				}
			};
		case "STOP_ENERGY_BAR":
			return {
				...state,
				shop: {
					...state.shop,
					energyBar: {
						...state.shop.energyBar,
						isActive: false
					}
				},
				basicInfo: {
					...state.basicInfo,
					icePerClick: state.basicInfo.icePerClick - 0.2
				}
			};
		default:
			return state;
	}
};