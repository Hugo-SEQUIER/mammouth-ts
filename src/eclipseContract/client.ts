import { Connection, PublicKey, SystemProgram, SendTransactionError, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, Wallet, BN } from '@coral-xyz/anchor';
import rawIdl from './idlegame.json';
const idl = rawIdl as Idl;

const ECLIPSE_RPC_URL = 'https://eclipse.helius-rpc.com';

// Helper function to get account balance
async function getBalance(connection: Connection, address: string) {
    try {
        const balance = await connection.getBalance(new PublicKey(address));
        console.log(`Balance: ${balance} (smallest unit)`);
        return balance;
    } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
}

async function main(userWallet: any, amount: number, dispatch: any) {
    console.log(userWallet);
    // Setup connection to Eclipse
    const connection = new Connection(ECLIPSE_RPC_URL);
    // Create the provider
    const provider: AnchorProvider = new AnchorProvider(
        connection,
        userWallet,
        AnchorProvider.defaultOptions()
    );

    try {
        // Get the program ID from the IDL
        const programId = new PublicKey(rawIdl.address);
        
        // Log program IDs for debugging
        console.log("Program ID:", programId.toBase58());
        console.log("System Program ID:", SystemProgram.programId.toBase58());
        
        // Send SOL function using direct SystemProgram transfer instead of Anchor program
        const sendSol = async (amount: BN) => {
            try {
                // Hardcoded recipient address
                const RECIPIENT_ADDRESS = new PublicKey('DJi9qeHDT5vpu1iKApVvPxfBa7UYdSkuMPPsZ97zxvSc');
                
                // Create a simple transfer transaction
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: userWallet.publicKey,
                        toPubkey: RECIPIENT_ADDRESS,
                        lamports: amount.toNumber() // Convert BN to number
                    })
                );
                
                // Set recent blockhash and fee payer
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                transaction.feePayer = userWallet.publicKey;
                
                // Send the transaction
                const signature = await provider.sendAndConfirm(transaction);
                
                console.log('Transaction successful:', signature);
                return signature;
            } catch (error) {
                console.error('Error sending SOL:', error);
                
                // Handle SendTransactionError specifically
                if (error instanceof SendTransactionError) {
                    console.error('Transaction simulation failed. Full logs:', error.logs);
                    
                    // Check if it's a program not found error
                    if (error.message.includes('program that does not exist')) {
                        console.error('The program does not exist on this network. Make sure the program is deployed to the Eclipse network.');
                    }
                }
                
                throw error;
            }
        };

        // Modified example usage
        const amountToSend = new BN(amount * LAMPORTS_PER_SOL); // Convert amount to lamports

        // Check sender's balance before transfer
        console.log('Sender balance before transfer:');
        await getBalance(connection, userWallet.publicKey.toString());

        // Send SOL
        const tx = await sendSol(amountToSend);

        if (tx){
            dispatch({ type: "ADD_CLICK", payload: (amount / 0.00000005) });
        }

        // Check balances after transfer
        console.log('\nBalances after transfer:');
        console.log('Sender:');
        await getBalance(connection, userWallet.publicKey.toString());
        console.log('Recipient:');
        await getBalance(connection, 'DJi9qeHDT5vpu1iKApVvPxfBa7UYdSkuMPPsZ97zxvSc');

    } catch (error) {
        console.error('Error in main execution:', error);
        
        // Display user-friendly error message
        if (error instanceof SendTransactionError) {
            if (error.message.includes('program that does not exist')) {
                alert('The program is not deployed on this network. Please contact the administrator.');
            } else {
                alert('Transaction failed. Please check the console for details.');
            }
        } else {
            alert('Transaction failed: ' + (error as Error).message);
        }
    }
}

// Export the main function
export default main;