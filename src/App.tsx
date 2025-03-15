import './App.css';
import { useMemo, useState } from 'react';
import { GamingProvider } from './context/GamingContext';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKeyProvider } from './context/publicKeyContext';
require('@solana/wallet-adapter-react-ui/styles.css');
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

import ModalToSendEth from './eclipseContract/ModalToSendEth';
import './css/Modal.css';

function App() {
	const network = 'https://staging-rpc.dev2.eclipsenetwork.xyz'; // Use Devnet for testing
	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
		],
		[]
	);
	
	// Set to true to show maintenance page
	const [isUnderMaintenance] = useState(false);

	// Maintenance page component
	const MaintenancePage = () => (
		<div className="maintenance-container">
			<h1>FROST MAMMOTH</h1>
			<div className="maintenance-content">
				<img src="./images/work.png" alt="Under Maintenance" className="maintenance-image" />
				<h2>Under Maintenance</h2>
				<p>We're currently upgrading our systems before the competition.</p>
				<p>Please check back soon!</p>
			</div>
			<div className="maintenance-footer">
				<div>
					<img src="./images/twitter2.png" alt="Twitter" />
					<a href="https://x.com/CelestMammoth" className="nav-link" target="_blank" rel="noopener noreferrer">Twitter</a>
				</div>
				<div>
					<img src="./images/discord_CM.png" alt="Discord" />
					<a href="https://discord.gg/hNd72TezbN" className="nav-link" target="_blank" rel="noopener noreferrer">Discord</a>
				</div>
			</div>
		</div>
	);

	return (
		<ConnectionProvider endpoint={network}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					<PublicKeyProvider>
						<GamingProvider>
							<div className="App">
								{isUnderMaintenance ? (
									<MaintenancePage />
								) : (
									<div className="flex-container">
										<div className="flex-header">
											<div className="flex-header-links">
												<div>
													<img src="./images/twitter2.png" alt="Twitter" />
													<a href="https://x.com/CelestMammoth" className="nav-link" target="_blank" rel="noopener noreferrer">Twitter</a>
												</div>
												<div>
													<img src="./images/discord_CM.png" alt="Discord" />
													<a href="https://discord.gg/hNd72TezbN" className="nav-link" target="_blank" rel="noopener noreferrer">Discord</a>
												</div>
											</div>
											<h1>FROST MAMMOTH</h1>
											<div className="flex-header-wallet">
												<ModalToSendEth />
												<WalletMultiButton />
											</div>
										</div>
										<div className="flex-item">
											<IceBlock />
											<div className="flex-middle">
												<div className="flex-wallet">	
												<Stats />
											</div>
												<div className="flex-tools">
													<Pickaxe />
													<Market />
													<Laboratory />
												</div>
												<Company />
											</div>
										</div>
									</div>
								)}
							</div>
						</GamingProvider>
					</PublicKeyProvider>
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
}

export default App;