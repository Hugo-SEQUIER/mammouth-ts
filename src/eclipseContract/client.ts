import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, Wallet, BN } from '@coral-xyz/anchor';
import rawIdl from './idlegame.json';
const idl = rawIdl as Idl;

const ECLIPSE_RPC_URL = 'https://mainnetbeta-rpc.eclipse.xyz/';

async function main(userWallet: any, amount: number, dispatch: any) {
    console.log(userWallet)
    // Setup connection to Eclipse
    const connection = new Connection(ECLIPSE_RPC_URL);
    // Create the provider
    const provider: AnchorProvider = new AnchorProvider(
        connection,
        userWallet,
        AnchorProvider.defaultOptions()
    );

    // Create the Program instance - correct parameter order without object wrapping
    const program = new Program(idl, provider);
    console.log(program.programId.toBase58())
    console.log(SystemProgram.programId.toBase58())
    // Modified sendEth function to use a fixed recipient address
    async function sendEth(amount: BN) {
        try {
            // Hardcoded recipient address - replace with your desired address
            const RECIPIENT_ADDRESS = new PublicKey('DJi9qeHDT5vpu1iKApVvPxfBa7UYdSkuMPPsZ97zxvSc');
            
            const tx = await program.methods
                .sendEth(amount)
                .accounts({
                    from: userWallet.publicKey,
                    to: RECIPIENT_ADDRESS,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log('Transaction successful:', tx);
            return tx;
        } catch (error) {
            console.error('Error sending ETH:', error);
            throw error;
        }
    }

    // Example function to get account balance
    async function getBalance(address: any) {
        try {
            const balance = await connection.getBalance(new PublicKey(address));
            console.log(`Balance: ${balance} (smallest unit)`);
            return balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    // Modified example usage
    try {
        const amountToSend = new BN(amount * 1000000000); // Convert amount to BN

        // Check sender's balance before transfer
        console.log('Sender balance before transfer:');
        await getBalance(userWallet.publicKey.toString());

        // Send ETH
        const tx = await sendEth(amountToSend);

        if (tx){
            dispatch({ type: "ADD_CLICK", payload: (amount / 0.00000005) });
        }

        // Check balances after transfer
        console.log('\nBalances after transfer:');
        console.log('Sender:');
        await getBalance(userWallet.publicKey.toString());
        console.log('Recipient:');
        await getBalance('DJi9qeHDT5vpu1iKApVvPxfBa7UYdSkuMPPsZ97zxvSc');

    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

// Remove the automatic execution
export default main;