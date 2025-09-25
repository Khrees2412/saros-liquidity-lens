// components/walletConnect.tsx
"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function WalletConnect() {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Show a placeholder that matches the server-side render
        return (
            <div className="flex items-center space-x-2">
                <button
                    className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 opacity-50 cursor-not-allowed"
                    disabled
                >
                    Loading...
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <WalletMultiButton className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700" />
        </div>
    );
}
