import { Keypair, PublicKey, Transaction, Connection } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const RPC =
    process.env.NEXT_PUBLIC_DEVNET_RPC || "https://api.devnet.solana.com";

export const connection = new Connection(RPC, "confirmed");

// Initialize sarosDLMM instance
const sarosDLMM = new LiquidityBookServices({
    mode: MODE.DEVNET, // or MODE.TESTNET depending on your environment
});

const pair = new PublicKey("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"); // Example: SOL/USDC pair

export async function fetchPools(limit = 20) {
    try {
        // fetch addresses then metadata — defensive slice
        const addresses = await sarosDLMM.fetchPoolAddresses();
        if (!addresses || addresses.length === 0) return [];
        const slice = addresses
            .slice(0, limit)
            .map((a: any) => (typeof a === "string" ? new PublicKey(a) : a));
        const meta = await Promise.all(
            slice.map((addr: PublicKey) =>
                sarosDLMM.fetchPoolMetadata(addr.toBase58())
            )
        );
        return meta.filter(Boolean) || [];
    } catch (err) {
        console.error("fetchPools error", err);
        return [];
    }
}

export async function getUserPositions(payer: PublicKey) {
    try {
        return await sarosDLMM.getUserPositions({ payer, pair });
    } catch (err) {
        console.error("getUserPositions", err);
        return [];
    }
}

/**
 * Build and send a create_position transaction.
 * This function *builds* the tx using the SDK, partial-signs the position mint Keypair (needed by the program),
 * then asks the user's wallet to sign and submits the tx. Works with web wallets because mint Keypair is signed locally.
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
    // create local mint keypair — this needs to sign the create_mint instruction
    const positionMintKP = Keypair.generate();
    try {
        const tx = new Transaction();
        const res = await sarosDLMM.createPosition({
            payer,
            relativeBinIdLeft,
            relativeBinIdRight,
            pair,
            binArrayIndex: 0,
            positionMint: positionMintKP.publicKey,
            transaction: tx,
        } as any);

        // The SDK may have mutated tx by reference and added instructions.
        // Partial sign with the local position mint keypair (program expects it as signer).
        tx.partialSign(positionMintKP);

        return {
            tx,
            positionMintPublicKey: positionMintKP.publicKey,
            sdkResponse: res,
        };
    } catch (err) {
        console.error("createPositionOnChain error", err);
        throw err;
    }
}
