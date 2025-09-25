// lib/saros.ts
import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const RPC =
    process.env.NEXT_PUBLIC_DEVNET_RPC || "https://api.devnet.solana.com";

export const connection = new Connection(RPC, "confirmed");

// Initialize sarosDLMM instance
const sarosDLMM = new LiquidityBookServices({
    mode: MODE.DEVNET,
});

export interface PoolMetadata {
    pair?: string | PublicKey;
    tokenBase?: {
        symbol?: string;
        mintAddress?: string;
    };
    tokenQuote?: {
        symbol?: string;
        mintAddress?: string;
    };
}

export interface FetchPoolsResult {
    pools: PoolMetadata[];
    error?: string;
}

export async function fetchPools(limit = 20): Promise<FetchPoolsResult> {
    try {
        const addresses = await sarosDLMM.fetchPoolAddresses();
        if (!addresses || addresses.length === 0) return { pools: [] };

        const slice = addresses
            .slice(0, limit)
            .map((a: any) => (typeof a === "string" ? new PublicKey(a) : a))
            .filter(Boolean);

        const metadataPromises = slice.map(async (addr: PublicKey) => {
            try {
                const metadata = await sarosDLMM.fetchPoolMetadata(
                    addr.toBase58()
                );
                return {
                    ...metadata,
                    pair: addr.toBase58(), // Ensure pair address is set
                };
            } catch (err) {
                console.error(
                    `Failed to fetch metadata for ${addr.toBase58()}:`,
                    err
                );
                return null;
            }
        });

        const metadataResults = await Promise.allSettled(metadataPromises);
        const validPools = metadataResults
            .map((result) =>
                result.status === "fulfilled" ? result.value : null
            )
            .filter(Boolean) as PoolMetadata[];

        return { pools: validPools };
    } catch (err) {
        console.error("fetchPools error:", err);
        return {
            pools: [],
            error:
                err instanceof Error ? err.message : "Unknown error occurred",
        };
    }
}

export async function getUserPositions(payer: PublicKey) {
    try {
        const pair = new PublicKey(
            "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"
        );
        return await sarosDLMM.getUserPositions({ payer, pair });
    } catch (err) {
        console.error("getUserPositions error:", err);
        return [];
    }
}

/**
 * Build and send a create_position transaction with proper blockhash handling.
 */
export async function createPositionOnChain(opts: {
    payer: PublicKey;
    pairAddress: string | PublicKey;
    relativeBinIdLeft: number;
    relativeBinIdRight: number;
}) {
    const { payer, pairAddress, relativeBinIdLeft, relativeBinIdRight } = opts;
    const pair =
        typeof pairAddress === "string"
            ? new PublicKey(pairAddress)
            : pairAddress;
    const positionMintKP = Keypair.generate();

    try {
        console.log("🔄 Creating position transaction...");

        // Step 1: Get recent blockhash FIRST
        console.log("📡 Fetching recent blockhash...");
        const {
            blockhash,
            lastValidBlockHeight,
        } = await connection.getLatestBlockhash("confirmed");
        console.log("✅ Got blockhash:", blockhash);

        // Step 2: Create transaction with the blockhash
        const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: payer,
        });

        console.log("🏗️ Building position creation instructions...");

        console.log("🏗️ Building position creation instructions...");

        // Step 3: Step 3: Let the SDK add its instructions to our transaction
        const sdkResult = await sarosDLMM.createPosition({
            payer,
            relativeBinIdLeft,
            relativeBinIdRight,
            pair,
            binArrayIndex: 0,
            positionMint: positionMintKP.publicKey,
            transaction: tx, // Pass our transaction with blockhash
        } as any);

        console.log("✅ SDK instructions added to transaction");

        console.log("✅ SDK instructions added to transaction");

        // Step 4: Partial sign with the position mint keypair
        // (The program expects this keypair to sign the create_mint instruction)
        tx.partialSign(positionMintKP);
        console.log("✅ Transaction partial signed with position mint keypair");

        // Step 5: Verify the transaction has what it needs
        if (!tx.recentBlockhash) {
            throw new Error(
                "Transaction missing recentBlockhash after SDK processing"
            );
        }

        console.log("🎯 Transaction ready:", {
            blockhash: tx.recentBlockhash,
            feePayer: tx.feePayer?.toBase58(),
            instructions: tx.instructions.length,
            positionMint: positionMintKP.publicKey.toBase58(),
        });

        return {
            tx,
            positionMintPublicKey: positionMintKP.publicKey,
            sdkResponse: sdkResult,
            blockhash,
            lastValidBlockHeight,
        };
    } catch (err) {
        console.error("❌ createPositionOnChain error:", err);
        throw err;
    }
}

/**
 * Alternative approach: Let the SDK handle the transaction creation entirely
 */
export async function createPositionOnChainAlternative(opts: {
    payer: PublicKey;
    pairAddress: string | PublicKey;
    relativeBinIdLeft: number;
    relativeBinIdRight: number;
}) {
    const { payer, pairAddress, relativeBinIdLeft, relativeBinIdRight } = opts;
    const pair =
        typeof pairAddress === "string"
            ? new PublicKey(pairAddress)
            : pairAddress;
    const positionMintKP = Keypair.generate();

    try {
        console.log("🔄 Creating position (SDK-managed transaction)...");

        // Create a new transaction first
        const { blockhash } = await connection.getLatestBlockhash("confirmed");
        const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: payer,
        });

        // Let the SDK add its instructions to our transaction
        const result = await sarosDLMM.createPosition({
            payer,
            relativeBinIdLeft,
            relativeBinIdRight,
            pair,
            binArrayIndex: 0,
            positionMint: positionMintKP.publicKey,
            transaction: tx, // Pass our transaction to the SDK
        } as any);

        if (!result || !result.position) {
            throw new Error("SDK did not return position information");
        }

        // Partial sign with position mint
        tx.partialSign(positionMintKP);

        return {
            tx,
            positionMintPublicKey: positionMintKP.publicKey,
            sdkResponse: result,
        };
    } catch (err) {
        console.error("❌ createPositionOnChainAlternative error:", err);
        throw err;
    }
}

/**
 * Send the transaction using wallet adapter
 */
export async function sendTransaction(
    tx: Transaction,
    signTransaction: (tx: Transaction) => Promise<Transaction>
) {
    try {
        console.log("📝 Requesting wallet signature...");

        // Have the wallet sign the transaction
        const signedTx = await signTransaction(tx);
        console.log("✅ Transaction signed by wallet");

        // Send the signed transaction
        console.log("📡 Sending transaction to network...");
        const signature = await connection.sendRawTransaction(
            signedTx.serialize(),
            {
                skipPreflight: false,
                preflightCommitment: "confirmed",
            }
        );

        console.log("🎯 Transaction sent, signature:", signature);

        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        const confirmation = await connection.confirmTransaction(
            signature,
            "confirmed"
        );

        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        console.log("✅ Transaction confirmed!");
        return signature;
    } catch (err) {
        console.error("❌ sendTransaction error:", err);
        throw err;
    }
}
