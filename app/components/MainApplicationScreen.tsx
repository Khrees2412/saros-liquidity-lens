"use client";

import React, { useState } from "react";
import PoolSelector from "./poolSelector";
import ImpermanentLossChart from "./impermanentLoss";
import CreatePositionForm from "./createPositionForm";
import WalletConnect from "./walletConnect";
import Link from "next/link";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";

export default function MainApplicationScreen() {
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
                <WalletConnect /> {/* Add WalletConnect here */}
            </header>

            <nav className="mt-4">
                <Link href="/positions" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    View Your Positions
                </Link>
            </nav>

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
                            <CreatePositionForm selectedPool={selectedPool} />
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
                    
                </aside>
            </section>

            <footer className="text-center text-xs text-slate-500">
                Built with Saros DLMM SDK
            </footer>
        </main>
    );
}
