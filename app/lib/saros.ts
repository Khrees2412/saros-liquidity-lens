import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const RPC =
    process.env.NEXT_PUBLIC_DEVNET_RPC || "https://api.devnet.solana.com";

export const connection = new Connection(RPC, "confirmed");
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
    totalLiquidityUsd?: string;
    currentPrice?: string;
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
            const allAddresses = await sarosDLMM.fetchPoolAddresses();
            pairsToFetch = allAddresses
                .slice(0, 5)
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

                const enrichedPositions = positions.map((p: any) => ({
                    ...p,
                    poolAddress: pair.toBase58(),
                    mintAddress: p.mintAddress?.toBase58() || "",
                    liquidityAmount: p.liquidityAmount?.toString() || "0",
                    binIdLower: p.binIdLower || 0,
                    binIdUpper: p.binIdUpper || 0,
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
            }
        }
        return allUserPositions;
    } catch (err) {
        console.error("getUserPositions error at top level:", err);
        return [];
    }
}

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
        const {
            blockhash,
            lastValidBlockHeight,
        } = await connection.getLatestBlockhash("confirmed");

        const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: payer,
        });

        const sdkResult = await sarosDLMM.createPosition({
            payer,
            relativeBinIdLeft,
            relativeBinIdRight,
            pair,
            binArrayIndex: 0,
            positionMint: positionMintKP.publicKey,
            transaction: tx,
        } as any);

        tx.partialSign(positionMintKP);

        if (!tx.recentBlockhash) {
            throw new Error(
                "Transaction missing recentBlockhash after SDK processing"
            );
        }

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
        const { blockhash } = await connection.getLatestBlockhash("confirmed");
        const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: payer,
        });

        const result = await sarosDLMM.createPosition({
            payer,
            relativeBinIdLeft,
            relativeBinIdRight,
            pair,
            binArrayIndex: 0,
            positionMint: positionMintKP.publicKey,
            transaction: tx,
        } as any);

        if (!result || !result.position) {
            throw new Error("SDK did not return position information");
        }

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

export async function sendTransaction(
    tx: Transaction,
    signTransaction: (tx: Transaction) => Promise<Transaction>
) {
    try {
        const signedTx = await signTransaction(tx);

        const signature = await connection.sendRawTransaction(
            signedTx.serialize(),
            {
                skipPreflight: false,
                preflightCommitment: "confirmed",
            }
        );

        const confirmation = await connection.confirmTransaction(
            signature,
            "confirmed"
        );

        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        return signature;
    } catch (err) {
        console.error("❌ sendTransaction error:", err);
        throw err;
    }
}
