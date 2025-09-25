import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletConnect() {
    return (
        <div className="flex items-center space-x-2">
            <WalletMultiButton className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700" />
        </div>
    );
}
