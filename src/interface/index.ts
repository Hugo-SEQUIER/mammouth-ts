export interface GameState {
    basicInfo: BasicInfo;
    items: Items;
    company: Company;
    laboratory: Laboratory;
    achievements: Achievement[];
    market: Market;
    investment: Investment;
}

export interface BasicInfo {
    ice: number;
    icePerClick: number;
    icePerSecond: number;
    money: number;
    nbClickAllowed: number;
}

export interface Employee {
    amount: number;
    job: string;
    salary: number;
    happiness: number;
    production: number;
}

export interface Items {
    pickaxe: Pickaxe;
    userLevel: number;
    costUpgrade: number;
}

export interface Pickaxe {
    level: number;
    upgradeCost: number;
}

export interface Company {
    level: number;
    upgradeCost: number;
    reputation: number;
    cashFlow: number;
    employees: Employee[];
    investments: Investment[];
}

export interface Laboratory {
    level: number;
    upgradeCost: number;
    searchCost: number;
    researchSpeed: number;
    researchQueue: Technology[];
    researchDone: Technology[];
    employees: Employee[];
}

export interface Technology {
    name: string;
    cost: number;
    effect: number;
    category: "Production" | "Market" | "Investment" | "Laboratory";
    description: string;
    researchTime: number;
    prerequisites: string[];
}

export interface Bitcoin {
    amount: number;
    avgBuyPrice: number;
    actualPrice: number;
}

export interface spy {
    amount: number;
    avgBuyPrice: number;
    actualPrice: number;
}

export interface Laika {
    amount: number;
    avgBuyPrice: number;
    actualPrice: number;
}

export interface Ethereum {
    amount: number;
    avgBuyPrice: number;
    actualPrice: number;
}

export interface Achievement {
    earned: boolean;
    description: string;
}

export interface Market {
    marketPrice: number;
    userPrice: number;
    publicDemand: number;
    iceSell: number;

}

export interface Investment {
    bitcoin: Bitcoin;
    ethereum: Ethereum;
    spy: spy;
    laika: Laika;
}
