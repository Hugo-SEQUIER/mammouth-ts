import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@project-serum/anchor";
import fs from "fs";
import bs58 from "bs58";

export async function main() {
    // Setup connection to cluster
    const connection = new Connection("https://staging-rpc.dev2.eclipsenetwork.xyz", "confirmed");
    const idl = JSON.parse(fs.readFileSync("./src/utils/gmoth.json", "utf8"));
    // Convert private key string to Uint8Array and create keypair
    const privateKeyString = process.env.TX_PRIVATE_KEY;
    if (!privateKeyString) {
        throw new Error('TX_PRIVATE_KEY environment variable is not set');
    }

    let privateKey;
    try {
        // Handle base58 or comma-separated format
        if (privateKeyString.includes(',')) {
            privateKey = Uint8Array.from(privateKeyString.split(',').map(num => parseInt(num)));
        } else {
            // Assuming it might be base58 encoded
            privateKey = bs58.decode(privateKeyString);
        }
        
        if (privateKey.length !== 64) {
            throw new Error(`Invalid private key length: ${privateKey.length}. Expected 64 bytes.`);
        }
    } catch (error) {
        throw new Error(`Failed to process private key: ${error.message}`);
    }
    const keypair = Keypair.fromSecretKey(privateKey);

    // Create wallet and provider
    const wallet = new Wallet(keypair);
    const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
    );

    // Initialize program with additional error handling
    const programId = new PublicKey("2YU4ujreHtNHqA27Hh1WQoWFHm33uugCz1WhxnnCjoLf");

    
    if (!idl) {
        throw new Error('IDL is undefined or invalid');
    }

    const program = new Program(idl, programId, provider);
    
    // Verify program initialization
    if (!program || !program.methods) {
        throw new Error('Program initialization failed');
    }

    try {
        // Call your initialize instruction
        const tx = await program.methods
            .initialize()
            .accounts({
            })
            .rpc();

        console.info("Transaction signature:", tx);
        return tx;
    } catch (error) {
        console.error("Error details:", error);
        throw new Error(`Error interacting with contract: ${error.message}`);
    }
}

export default main;