import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { getUserPositions, connection } from "../lib/saros";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import ImpermanentLossChart from "./impermanentLoss";

interface PositionDashboardProps {}

interface UserPosition {
    poolAddress: string;
    mintAddress: string; // The mint address of the position NFT
    liquidityAmount: string; // Placeholder: actual liquidity amount
    binIdLower: number; // The lower bin ID of the position
    binIdUpper: number; // The upper bin ID of the position
    // Placeholder fields for calculated values (will need to be derived or fetched)
    valueUsd?: string; // Current value of the position in USD
    pnlUsd?: string; // Profit and Loss in USD
    impermanentLossUsd?: string; // Impermanent Loss in USD
    feesEarnedUsd?: string; // Fees earned in USD
}

const positionFetcher = async ([_, publicKey]: [string, PublicKey]): Promise<UserPosition[]> => {
    if (!publicKey) {
        return [];
    }
    const positions = await getUserPositions(publicKey);
    return positions as UserPosition[]; // Cast to your defined interface
};

export default function PositionDashboard(props: PositionDashboardProps) {
    const { publicKey } = useWallet();

    const { data: positions, error, isLoading } = useSWR(
        publicKey ? ["userPositions", publicKey] : null,
        positionFetcher,
        { refreshInterval: 10000 }
    );

    if (!publicKey) {
        return (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center text-yellow-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Connect your wallet to see your positions.</span>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Positions</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Loading positions...</span>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Positions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 border border-red-200 rounded bg-red-50 text-red-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Error loading positions: {error.message}</span>
                </CardContent>
            </Card>
        );
    }

    if (!positions || positions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Positions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 border rounded bg-gray-50 text-gray-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>No active positions found for this wallet.</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Positions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {positions.map((position, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h5 className="font-medium">Pool: {position.poolAddress.slice(0, 8)}...{position.poolAddress.slice(-8)}</h5>
                            <p className="text-sm text-gray-600">Mint: {position.mintAddress.slice(0, 8)}...{position.mintAddress.slice(-8)}</p>
                            <p className="text-sm text-gray-600">Liquidity: {position.liquidityAmount}</p>
                            <p className="text-sm text-gray-600">Bin Range: {position.binIdLower} - {position.binIdUpper}</p>
                            {position.valueUsd && <p className="text-sm text-gray-600">Value (USD): ${position.valueUsd}</p>}
                            {position.pnlUsd && <p className="text-sm text-gray-600">PnL (USD): {position.pnlUsd}</p>}
                            {position.impermanentLossUsd && <p className="text-sm text-gray-600">IL (USD): {position.impermanentLossUsd}</p>}
                            {position.feesEarnedUsd && <p className="text-sm text-gray-600">Fees Earned (USD): {position.feesEarnedUsd}</p>}
                            <div className="mt-4">
                                <ImpermanentLossChart 
                                    changePercent={50} // Default value for illustration
                                    binIdLower={position.binIdLower}
                                    binIdUpper={position.binIdUpper}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
