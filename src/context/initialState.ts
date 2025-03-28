import { GameState } from "../interface";

export const initialState: GameState = {
    basicInfo: {
        ice: 0,
        icePerClick: 1,
        icePerSecond: 0,
        money: 0,
        nbClick: 0,
        nbClickAllowed: 0,
    },
    items: {
        pickaxe: {
            level: 1,
            upgradeCost: 10,
        },
        gloves: {
            level: 1,
            upgradeCost: 100,
        },
        userLevel: 1,
        costUpgrade: 100,
    },
    company: {
        level: 0,
        upgradeCost: 100,
        reputation: 0,
        cashFlow: 0,
        employees: [
            {
                amount: 0,
                job: "Junior Miner",
                salary: 100,
                happiness: 0,
                production: 1,
            },
            {
                amount: 0,
                job: "Senior Miner",
                salary: 600,
                happiness: 0,
                production: 2,
            },
            {
                amount: 0,
                job: "Frost Mage",
                salary: 1500,
                happiness: 0,
                production: 3.2,
            },
            {
                amount: 0,
                job: "Yeti",
                salary: 3000,
                happiness: 0,
                production: 5,
            }
        ],
        investments: [],
    },
    laboratory: {
        level: 0,
        upgradeCost: 1000,
        searchCost: 10,
        researchSpeed: 1,
        researchQueue: [],
        researchDone: [],
        employees: [],
    },
    achievements: [],
    market: {
        marketPrice: 1,
        userPrice: 1,
        publicDemand: 0,
        iceSell: 0,
    },
    shop: {
        energyBar: {
            price: 50,
            isActive: false,
            boost: 1.15,
        },
    },
    investment: {
        bitcoin: {
            amount: 0,
            avgBuyPrice: 0,
            actualPrice: 96000,
        },
        ethereum: {
            amount: 0,
            avgBuyPrice: 0,
            actualPrice: 3400,
        },
        spy: {
            amount: 0,
            avgBuyPrice: 0,
            actualPrice: 5900,
        },
        laika: {
            amount: 0,
            avgBuyPrice: 0,
            actualPrice: 1,
        }
    }
}