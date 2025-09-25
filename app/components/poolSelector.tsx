// components/PoolSelector.tsx
import useSWR from "swr";
import { fetchPools, type FetchPoolsResult, type PoolMetadata } from "../lib/saros";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input"; // Import Input for filtering
import { useState } from "react"; // Import useState

// Proper fetcher that handles the SWR contract
const poolsFetcher = async (): Promise<FetchPoolsResult> => {
    return await fetchPools(20);
};

// Helper function to get pool display name
const getPoolDisplayName = (pool: PoolMetadata): string => {
    const baseSymbol = pool?.tokenBase?.symbol || 
                      pool?.tokenBase?.mintAddress?.slice(0, 4) + "..." || 
                      "Unknown";
    const quoteSymbol = pool?.tokenQuote?.symbol || 
                       pool?.tokenQuote?.mintAddress?.slice(0, 4) + "..." || 
                       "Unknown";
    return `${baseSymbol} / ${quoteSymbol}`;
};

// Helper function to get pool address as string
const getPoolAddress = (pool: PoolMetadata): string => {
    if (!pool.pair) return '';
    return typeof pool.pair === 'string' ? pool.pair : pool.pair.toString();
};

export default function PoolSelector({
    onSelect,
}: {
    onSelect: (addr: string) => void;
}) {
    const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
    const [sortBy, setSortBy] = useState<"none" | "liquidity" | "price">("none"); // State for sorting
    const { 
        data: result, 
        error, 
        isLoading, 
        mutate: refetch 
    } = useSWR<FetchPoolsResult>("/api/pools", poolsFetcher, {
        refreshInterval: 30000, // Refresh every 30 seconds
        revalidateOnFocus: false,
        dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
    });

    // Handle different loading and error states
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Loading pools...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50">
                <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Failed to load pools</span>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-2"
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                </Button>
            </div>
        );
    }

    if (result?.error) {
        return (
            <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-md bg-yellow-50">
                <div className="flex items-center text-yellow-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Error: {result.error}</span>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-2"
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                </Button>
            </div>
        );
    }

    const pools = result?.pools || [];

    const filteredAndSortedPools = pools
        .filter(pool => {
            const address = getPoolAddress(pool);
            const displayName = getPoolDisplayName(pool);
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            return (
                address &&
                address.length > 0 &&
                (displayName.toLowerCase().includes(lowerCaseSearchTerm) ||
                 address.toLowerCase().includes(lowerCaseSearchTerm) ||
                 pool.tokenBase?.symbol?.toLowerCase().includes(lowerCaseSearchTerm) ||
                 pool.tokenQuote?.symbol?.toLowerCase().includes(lowerCaseSearchTerm))
            );
        })
        .sort((a, b) => {
            if (sortBy === "liquidity") {
                // For mock data, assuming simple string comparison or numeric conversion
                const liquidityA = parseFloat(a.totalLiquidityUsd?.replace(/,/g, '') || "0");
                const liquidityB = parseFloat(b.totalLiquidityUsd?.replace(/,/g, '') || "0");
                return liquidityB - liquidityA; // Sort descending
            } else if (sortBy === "price") {
                // For mock data, assuming simple string comparison or numeric conversion
                const priceA = parseFloat(a.currentPrice || "0");
                const priceB = parseFloat(b.currentPrice || "0");
                return priceB - priceA; // Sort descending
            }
            return 0;
        });

    if (pools.length === 0) {
        return (
            <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50">
                <span className="text-gray-600">No pools available</span>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <Input
                    placeholder="Search pools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2"
                />
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select onValueChange={(value: "none" | "liquidity" | "price") => setSortBy(value)} value={sortBy}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="liquidity">Liquidity</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                    Found {filteredAndSortedPools.length} pools
                </span>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="text-xs"
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                </Button>
            </div>
            
            <Select onValueChange={onSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a pool" />
                </SelectTrigger>
                <SelectContent>
                    {filteredAndSortedPools
                        .filter(pool => {
                            const address = getPoolAddress(pool);
                            return address && address.length > 0; // Only show pools with valid addresses
                        })
                        .map((pool, index) => {
                            const address = getPoolAddress(pool);
                            const displayName = getPoolDisplayName(pool);
                            
                            return (
                                <SelectItem
                                    key={address}
                                    value={address}
                                >
                                    <div className="flex flex-col">
                                        <div className="font-medium">
                                            {displayName}
                                        </div>
                                        {pool.currentPrice && (
                                            <div className="text-xs text-slate-500">Price: {pool.currentPrice}</div>
                                        )}
                                        {pool.totalLiquidityUsd && (
                                            <div className="text-xs text-slate-500">Liquidity: ${pool.totalLiquidityUsd}</div>
                                        )}
                                        <div className="text-xs text-slate-500">
                                            {address.slice(0, 8)}...{address.slice(-8)}
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        })}
                </SelectContent>
            </Select>
        </div>
    );
}