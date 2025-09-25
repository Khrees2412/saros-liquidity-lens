import useSWR from "swr";
import { fetchPools } from "../lib/saros";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

const fetcher = (...args: any[]) => fetchPools();

export default function PoolSelector({
    onSelect,
}: {
    onSelect: (addr: string) => void;
}) {
    const { data: pools, error } = useSWR("/pools", fetcher, {
        refreshInterval: 0,
    });

    if (error) return <div className="text-red-600">Failed to load pools</div>;
    if (!pools) return <div>Loading pools...</div>;

    return (
        <Select onValueChange={onSelect}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a pool" />
            </SelectTrigger>
            <SelectContent>
                {pools.map((p: any) => (
                    <SelectItem
                        key={p.pair?.toString() ?? p.pair}
                        value={p.pair?.toString() ?? p.pair}
                    >
                        <div className="flex flex-col">
                            <div className="font-medium">
                                {p?.tokenBase?.symbol ??
                                    p?.tokenBase?.mintAddress ??
                                    "Unknown"}{" "}
                                /{" "}
                                {p?.tokenQuote?.symbol ??
                                    p?.tokenQuote?.mintAddress}
                            </div>
                            <div className="text-xs text-slate-500">
                                Pair: {p.pair?.toString?.() ?? p.pair}
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
