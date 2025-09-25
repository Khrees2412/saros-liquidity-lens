// components/PositionCreator.tsx
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
    createPositionOnChain,
    createPositionOnChainAlternative,
    sendTransaction,
} from "../lib/saros";

interface PositionCreatorProps {
    selectedPool: string | null;
}

export default function PositionCreator({
    selectedPool,
}: PositionCreatorProps) {
    const { publicKey, signTransaction } = useWallet();
    const [leftBin, setLeftBin] = useState<string>("-5");
    const [rightBin, setRightBin] = useState<string>("5");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [useAlternative, setUseAlternative] = useState(false);

    const handleCreatePosition = async () => {
        if (!publicKey || !signTransaction || !selectedPool) {
            setError("Wallet not connected or no pool selected");
            return;
        }

        setIsCreating(true);
        setError(null);
        setSuccess(null);

        try {
            const relativeBinIdLeft = parseInt(leftBin);
            const relativeBinIdRight = parseInt(rightBin);

            if (isNaN(relativeBinIdLeft) || isNaN(relativeBinIdRight)) {
                throw new Error("Invalid bin IDs - must be numbers");
            }

            if (relativeBinIdLeft >= relativeBinIdRight) {
                throw new Error("Left bin must be less than right bin");
            }

            console.log("🚀 Starting position creation...");

            // Choose creation method
            const createFn = useAlternative
                ? createPositionOnChainAlternative
                : createPositionOnChain;

            const result = await createFn({
                payer: publicKey,
                pairAddress: selectedPool,
                relativeBinIdLeft,
                relativeBinIdRight,
            });

            console.log("✅ Transaction prepared:", result);

            // Send the transaction
            const signature = await sendTransaction(result.tx, signTransaction);

            setSuccess(
                `Position created successfully! Transaction: ${signature}`
            );
            console.log("🎉 Position created successfully:", signature);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            console.error("❌ Position creation failed:", err);
            setError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    if (!publicKey) {
        return (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center text-yellow-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Please connect your wallet to create a position</span>
                </div>
            </div>
        );
    }

    if (!selectedPool) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center text-gray-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Please select a pool first</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-4 text-blue-500">
                    Create a Position
                </h3>

                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-700">
                            Selected Pool
                        </Label>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono text-gray-600">
                            {selectedPool.slice(0, 8)}...
                            {selectedPool.slice(-8)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label
                                htmlFor="leftBin"
                                className="text-sm font-medium text-gray-700"
                            >
                                Left relative bin (e.g. -5)
                            </Label>
                            <Input
                                id="leftBin"
                                type="number"
                                value={leftBin}
                                onChange={(e) => setLeftBin(e.target.value)}
                                placeholder="-5"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="rightBin"
                                className="text-sm font-medium text-gray-700"
                            >
                                Right relative bin (e.g. 5)
                            </Label>
                            <Input
                                id="rightBin"
                                type="number"
                                value={rightBin}
                                onChange={(e) => setRightBin(e.target.value)}
                                placeholder="5"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Position Preview Section */}
                    {selectedPool && leftBin && rightBin && (
                        <div className="p-3 border rounded bg-blue-50/20 space-y-2">
                            <h4 className="font-semibold text-blue-800">Position Preview</h4>
                            <p className="text-sm text-blue-700">Left Bin: {leftBin}, Right Bin: {rightBin}</p>
                            <p className="text-sm text-blue-700">Estimated Transaction Fee: ~0.000005 SOL</p>
                            {/* TODO: Add a simple liquidity distribution visualization here */}
                        </div>
                    )}

                    {/* Method selector for debugging */}
                    {/* This section is commented out for production but kept for reference */}
                    {/*
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                        <Label className="text-sm text-gray-600">
                            Transaction Method:
                        </Label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={!useAlternative}
                                onChange={() => setUseAlternative(false)}
                                className="mr-2"
                            />
                            <span className="text-sm">Manual Blockhash</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={useAlternative}
                                onChange={() => setUseAlternative(true)}
                                className="mr-2"
                            />
                            <span className="text-sm">SDK Managed</span>
                        </label>
                    </div>
                    */}

                    {error && (
                        <div className="p-3 border border-red-200 rounded bg-red-50">
                            <div className="flex items-start text-red-700">
                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <strong>Error:</strong> {error}
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 border border-green-200 rounded bg-green-50">
                            <div className="flex items-start text-green-700">
                                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <strong>Success!</strong> {success}
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleCreatePosition}
                        disabled={isCreating}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating Position...
                            </>
                        ) : (
                            "Create Position"
                        )}
                    </Button>

                    {isCreating && (
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>
                                • Building transaction with recent blockhash...
                            </p>
                            <p>• Adding position creation instructions...</p>
                            <p>• Requesting wallet signature...</p>
                            <p>• Sending to Solana network...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
