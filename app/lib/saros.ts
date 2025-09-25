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
    totalLiquidityUsd?: string; // Placeholder for total liquidity in USD
    currentPrice?: string; // Placeholder for current pool price
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
                    totalLiquidityUsd: "10,000,000", // Mock data
                    currentPrice: "1.00", // Mock data
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

export async function getUserPositions(
    payer: PublicKey,
    pairAddress?: string | PublicKey
) {
    try {
        let pairsToFetch: PublicKey[] = [];

        if (pairAddress) {
            pairsToFetch.push(
                typeof pairAddress === "string"
                    ? new PublicKey(pairAddress)
                    : pairAddress
            );
        } else {
            // Fetch all pool addresses if no specific pairAddress is provided
            const allAddresses = await sarosDLMM.fetchPoolAddresses();
            // Limit to 5 pools for demo purposes to avoid excessive fetching
            pairsToFetch = allAddresses
                .slice(0, 5) // Manually apply limit here
                .map((a: any) => (typeof a === "string" ? new PublicKey(a) : a))
                .filter(Boolean);
        }

        const allUserPositions: any[] = [];
        for (const pair of pairsToFetch) {
            try {
                const positions = await sarosDLMM.getUserPositions({
                    payer,
                    pair,
                });

                // Add mock data for the new fields
                const enrichedPositions = positions.map((p: any) => ({
                    ...p,
                    poolAddress: pair.toBase58(), // Ensure poolAddress is set
                    mintAddress: p.mintAddress?.toBase58() || "", // Ensure mintAddress is string
                    liquidityAmount: p.liquidityAmount?.toString() || "0", // Ensure liquidityAmount is string
                    binIdLower: p.binIdLower || 0, // Placeholder
                    binIdUpper: p.binIdUpper || 0, // Placeholder
                    valueUsd: (Math.random() * 1000).toFixed(2),
                    pnlUsd: (Math.random() * 200 - 100).toFixed(2),
                    impermanentLossUsd: (Math.random() * 50).toFixed(2),
                    feesEarnedUsd: (Math.random() * 30).toFixed(2),
                }));

                allUserPositions.push(...enrichedPositions);
            } catch (innerErr) {
                console.warn(
                    `Failed to fetch positions for pool ${pair.toBase58()}:`,
                    innerErr
                );
                // Continue to the next pool even if one fails
            }
        }
        return allUserPositions;
    } catch (err) {
        console.error("getUserPositions error at top level:", err);
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
