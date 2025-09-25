import React, { useState } from "react";
import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    createPositionOnChain,
    connection as sarosConnection,
} from "../lib/saros";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function CreatePositionForm({
    pairAddress,
}: {
    pairAddress: string | null;
}) {
    const {
        publicKey,
        signTransaction,
        sendTransaction,
        connected,
    } = useWallet();
    const [left, setLeft] = useState(-5);
    const [right, setRight] = useState(5);
    const [txSig, setTxSig] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCreate() {
        setError(null);
        if (!publicKey) return setError("Connect your wallet first");
        if (!pairAddress) return setError("Select a pool first");

        setLoading(true);
        try {
            // Build tx using SDK and partial sign with position mint keypair
            const {
                tx,
                positionMintPublicKey,
                sdkResponse,
            } = await createPositionOnChain({
                payer: publicKey,
                pairAddress,
                relativeBinIdLeft: left,
                relativeBinIdRight: right,
            });

            // Ask wallet to sign (wallet will add user's signature). SDK already partial-signed the mint.
            const signed = await signTransaction?.(tx as Transaction);
            if (!signed) throw new Error("Wallet signature failed");

            const raw = signed.serialize();
            const sig = await sarosConnection.sendRawTransaction(raw, {
                preflightCommitment: "confirmed",
            });
            await sarosConnection.confirmTransaction(sig, "confirmed");

            setTxSig(sig);
        } catch (err) {
            console.error(err);
            setError(String(err) || "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="left-bin">Left relative bin (e.g. -5)</Label>
                <Input
                    id="left-bin"
                    type="number"
                    value={left}
                    onChange={(e) => setLeft(Number(e.target.value))}
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="right-bin">Right relative bin (e.g. 5)</Label>
                <Input
                    id="right-bin"
                    type="number"
                    value={right}
                    onChange={(e) => setRight(Number(e.target.value))}
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Button
                    onClick={handleCreate}
                    disabled={!connected || loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    {loading
                        ? "Building & Sending..."
                        : "Create Position On-chain"}
                </Button>
                {txSig && (
                    <a
                        href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View on Solscan
                    </a>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
