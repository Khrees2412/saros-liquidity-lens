"use client";
import React, { useState } from "react";
import WalletConnect from "./components/walletConnect";
import PoolSelector from "./components/poolSelector";
import ImpermanentLossChart from "./components/impermanentLoss";
import CreatePositionForm from "./components/createPositionForm";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./components/ui/card";

export default function Home() {
    const [selectedPool, setSelectedPool] = useState<string | null>(null);

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">Liquidity Lens</h1>
                    <span className="text-xs text-slate-500">
                        Saros DLMM Demo
                    </span>
                </div>
                <WalletConnect />
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select a Pool</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PoolSelector
                                onSelect={(addr) => setSelectedPool(addr)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Create a Position</CardTitle>
                            <CardDescription>
                                Selected Pool:{" "}
                                <span className="font-mono text-xs">
                                    {selectedPool ?? "No pool selected"}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreatePositionForm pairAddress={selectedPool} />
                        </CardContent>
                    </Card>
                </div>

                <aside className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Impermanent Loss</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImpermanentLossChart changePercent={120} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600">
                            <ul className="list-disc pl-5 mt-2">
                                <li>
                                    App uses Saros DLMM SDK to discover pools
                                    and build create_position txs.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </aside>
            </section>

            <footer className="text-center text-xs text-slate-500">
                Built with Saros DLMM SDK
            </footer>
        </main>
    );
}
