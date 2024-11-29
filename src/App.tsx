import './App.css';
import { useEffect } from 'react';
import { GamingProvider } from './context/GamingContext';

import IceBlock from './IceBlock/IceBlock';
import './css/IceBlock.css';

import Market from './Market/Market';
import './css/Market.css';

import Pickaxe from './Items/Pickaxe';
import './css/Items.css';

import Company from './Company/Company';
import './css/Company.css';

import Laboratory from './Laboratory/Laboratory';
import './css/Laboratory.css';

import Stats from './Stats/Stats';
import './css/Stats.css';

function App() {
	useEffect(() => {
		console.log("App mounted");
	}, []);
	return (
		<GamingProvider>
	  		<div className="App">
				<div className="flex-container">
					<Stats />
					<div className="flex-item">
						<IceBlock />
						<div className="flex-middle">
							<div className="flex-tools">
								<Pickaxe />
								<Market />
								<Laboratory />
							</div>
							<Company />
						</div>
					</div>
				</div>
			</div>
	</GamingProvider>
  );
}

export default App;
