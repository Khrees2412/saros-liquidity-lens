"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import HomePage from "./components/homepage";
import MainApplicationScreen from "./components/MainApplicationScreen";

export default function Home() {
    const { connected } = useWallet();

    return connected ? <MainApplicationScreen /> : <HomePage />;
}
