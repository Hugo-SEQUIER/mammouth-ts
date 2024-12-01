import { Technology } from "../../interface";
export const TECHNOLOGIES: Technology[] = [
   // Production Technologies
   {
       name: "Ice Defogger",
       cost: 1000,
       effect: 15, // +15% ice per click
       category: "Production",
       description: "Increases ice per click by removing fog from ice blocks",
       researchTime: 60,
       prerequisites: []
   },
   {
       name: "Advanced Mining Techniques",
       cost: 2000,
       effect: 20, // +20% ice per second
       category: "Production",
       description: "Improves passive ice collection efficiency",
       researchTime: 60,
       prerequisites: ["Ice Defogger"]
   },
    // Market Technologies
   {
       name: "Market Analysis",
       cost: 3000,
       effect: 10, // +10% market insight
       category: "Market",
       description: "Provides better insight into market prices",
       researchTime: 120,
       prerequisites: []
   },
   {
       name: "Brand Recognition",
       cost: 4000,
       effect: 25, // +25% selling price
       category: "Market",
       description: "Increases the price you can charge for ice",
       researchTime: 140,
       prerequisites: ["Market Analysis"]
   },
   {
       name: "Customer Relations",
       cost: 5000,
       effect: 30, // +30% public demand
       category: "Market",
       description: "Increases public demand for your ice",
       researchTime: 180,
       prerequisites: ["Brand Recognition"]
   },
    // Investment Technologies
   {
       name: "Trading Algorithms",
       cost: 7500,
       effect: 20, // +20% investment returns
       category: "Investment",
       description: "Improves returns on all investments",
       researchTime: 240,
       prerequisites: []
   },
   {
       name: "Portfolio Diversification",
       cost: 10000,
       effect: 0,
       category: "Investment",
       description: "Unlocks new investment opportunities",
       researchTime: 240,
       prerequisites: ["Trading Algorithms"]
   },
    // Laboratory Technologies
   {
       name: "Research Efficiency",
       cost: 5000,
       effect: 25, // +25% research speed
       category: "Laboratory",
       description: "Increases the speed of all research",
       researchTime: 300,
       prerequisites: []
   },
   {
       name: "Multi-tasking",
       cost: 15000,
       effect: 1, // +1 concurrent research
       category: "Laboratory",
       description: "Allows researching multiple technologies simultaneously",
       researchTime: 600,
       prerequisites: ["Research Efficiency"]
   }
];

// Helper function to get available technologies based on completed research
export const getAvailableTechnologies = (researchDone: Technology[]): Technology[] => {
   return TECHNOLOGIES.filter(tech => {
       // If technology is already researched, it's not available
       if (researchDone.some(done => done.name === tech.name)) {
           return false;
       }
        // Check if all prerequisites are met
       if (tech.prerequisites && tech.prerequisites.length > 0) {
           return tech.prerequisites.every(prereq => 
               researchDone.some(done => done.name === prereq)
           );
       }
        // If no prerequisites, technology is available
       return true;
   });
};   