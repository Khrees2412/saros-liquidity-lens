import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea, // Import ReferenceArea for marking ranges
} from "recharts";

// Simple IL curve for classic 50/50 LP (Uniswap V2-style).
function impermanentLossRatio(r: number) {
    // r = price_t / price_0
    // IL = 1 - (2 * sqrt(r) / (1 + r))
    const sqrtR = Math.sqrt(r);
    const denom = 1 + r;
    return 1 - (2 * sqrtR) / denom;
}

// Helper to convert bin ID to a conceptual price percentage change for visualization.
// This is a simplified representation and would ideally use actual pool price data.
const binIdToPricePercentageChange = (
    binId: number,
    currentPriceBin: number = 0 // Assuming current price is at bin 0 for simplicity
): number => {
    // A very simplistic mapping: each bin represents a 1% price change.
    // In a real DLMM, this would depend on bin step and token decimals.
    const priceDifferenceInBins = binId - currentPriceBin;
    return priceDifferenceInBins * 1; // 1% per bin
};

export default function ImpermanentLossChart({
    changePercent = 50,
    binIdLower, // New prop for lower bin ID
    binIdUpper, // New prop for upper bin ID
}: {
    changePercent?: number;
    binIdLower?: number; // Optional prop
    binIdUpper?: number; // Optional prop
}) {
    // generate price ratios from -90% to +100% by default
    const data = useMemo(() => {
        const points = [];
        for (let pct = -90; pct <= changePercent; pct += 2) {
            const r = (100 + pct) / 100;
            const il = impermanentLossRatio(r);
            points.push({ pct, r, il: Number((il * 100).toFixed(4)) });
        }
        return points;
    }, [changePercent]);

    return (
        <div className="p-4 border rounded bg-white">
            <h4 className="font-semibold mb-2">Impermanent Loss (50/50 LP)</h4>
            <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <XAxis dataKey="pct" tickFormatter={(v) => `${v}%`} />
                        <YAxis tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            formatter={(val: any) =>
                                `${Number(val).toFixed(4)}%`
                            }
                        />
                        <Line
                            type="monotone"
                            dataKey="il"
                            stroke="#1d4ed8"
                            dot={false}
                        />
                        {binIdLower !== undefined && binIdUpper !== undefined && (
                            <ReferenceArea 
                                x1={binIdToPricePercentageChange(binIdLower)} 
                                x2={binIdToPricePercentageChange(binIdUpper)} 
                                stroke="#8884d8" 
                                strokeOpacity={0.3} 
                                fill="#8884d8" 
                                fillOpacity={0.1}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm text-slate-500">
                Shows % impermanent loss vs token price move. 
                <span className="font-semibold">(Simplified for 50/50 LP; DLMM range is marked conceptually)</span>
            </p>
        </div>
    );
}
