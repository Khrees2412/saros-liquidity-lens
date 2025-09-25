"use client";

import React from "react";
import WalletConnect from "./walletConnect"; // Assuming WalletConnect is in the same directory or adjust path

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
            <main className="mx-auto max-w-7xl text-center">
                {/* Hero Section */}
                <div className="py-12 sm:py-20">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                        Liquidity Lens
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300">
                        Your Gateway to Saros DLMM Liquidity Management
                    </p>
                    <div className="mt-8 flex justify-center">
                        <WalletConnect />
                    </div>
                </div>

                {/* What is Liquidity Lens Section */}
                <section className="py-16 sm:py-24 bg-gray-900 rounded-lg shadow-xl mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        What is Liquidity Lens?
                    </h2>
                    <p className="mt-6 max-w-xl mx-auto text-lg leading-8 text-gray-400">
                        Liquidity Lens is a demo application built for the Saros DLMM Hackathon.
                        It showcases how to effectively manage liquidity on Saros's Dynamic
                        Liquidity Market Maker (DLMM) using the 
                        <code className="relative rounded bg-gray-800 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-blue-300">@saros-finance/dlmm-sdk</code>.
                        Our goal is to provide a clear and interactive platform for understanding
                        and participating in concentrated liquidity provision.
                    </p>
                </section>

                {/* How it Works: Core Features Section */}
                <section className="py-16 sm:py-24">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        How it Works: Core Features
                    </h2>
                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="group relative p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                            <h3 className="text-xl font-semibold text-white">Wallet Connection</h3>
                            <p className="mt-2 text-gray-400">
                                Securely connect your Solana Wallet
                            </p>
                        </div>
                        <div className="group relative p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                            <h3 className="text-xl font-semibold text-white">Pool Discovery</h3>
                            <p className="mt-2 text-gray-400">
                                Easily browse, search, filter, and sort through a comprehensive list of
                                available DLMM pools on Saros. Get enriched information like current prices
                                and liquidity levels at a glance.
                            </p>
                        </div>
                        <div className="group relative p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                            <h3 className="text-xl font-semibold text-white">Create Liquidity Position</h3>
                            <p className="mt-2 text-gray-400">
                                Open new liquidity positions with custom price ranges. The app offers
                                real-time previews of estimated fees and liquidity distribution before
                                you commit to the transaction.
                            </p>
                        </div>
                        <div className="group relative p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                            <h3 className="text-xl font-semibold text-white">Position Dashboard & IL Chart</h3>
                            <p className="mt-2 text-gray-400">
                                Track your active liquidity positions, monitor profit and loss (PnL),
                                and visualize impermanent loss (IL) with an adaptive chart built with
                                Recharts, specifically designed for concentrated liquidity positions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Get Started Section */}
                <section className="py-16 sm:py-24 bg-gray-900 rounded-lg shadow-xl mt-12">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Getting Started
                    </h2>
                    <p className="mt-6 max-w-xl mx-auto text-lg leading-8 text-gray-400">
                        To begin, simply connect your
                        Solana wallet. Once connected, you will be redirected to the main
                        application interface where you can explore pools, create positions, and
                        manage your liquidity.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <WalletConnect />
                    </div>
                    <p className="mt-4 max-w-xl mx-auto text-lg leading-8 text-gray-400">
                        For developers, dive into the code on our GitHub repository and
                        explore the <code className="relative rounded bg-gray-800 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-blue-300">@saros-finance/dlmm-sdk</code> to build your own
                        innovative DeFi solutions.
                    </p>
                </section>
            </main>
        </div>
    );
}
