const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { Program, AnchorProvider, Wallet } = require("@project-serum/anchor");
const fs = require("fs");
const bs58 = require("bs58");

async function main() {
    // Setup connection to cluster
    const connection = new Connection("https://mainnetbeta-rpc.eclipse.xyz/", "confirmed");
    const idl = JSON.parse(fs.readFileSync("./src/utils/gmoth.json", "utf8"));
    // Convert private key string to Uint8Array and create keypair
    const privateKeyString = process.env.TX_PRIVATE_KEY;
    if (!privateKeyString) {
        throw new Error('TX_PRIVATE_KEY environment variable is not set');
    }

    let privateKey;
    try {
        // Ensure bs58 is correctly imported and used
        privateKey = Buffer.from(bs58.default.decode(privateKeyString));
        
        if (privateKey.length !== 64) {
            throw new Error(`Invalid private key length: ${privateKey.length}. Expected 64 bytes.`);
        }
    } catch (error) {
        console.error('Private key error:', error);
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

module.exports = {
    main
};