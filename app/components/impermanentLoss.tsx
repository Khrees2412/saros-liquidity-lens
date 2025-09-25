import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Simple IL curve for classic 50/50 LP (Uniswap V2-style).
function impermanentLossRatio(r: number) {
    // r = price_t / price_0
    // IL = 1 - (2 * sqrt(r) / (1 + r))
    const sqrtR = Math.sqrt(r);
    const denom = 1 + r;
    return 1 - (2 * sqrtR) / denom;
}

export default function ImpermanentLossChart({
    changePercent = 50,
}: {
    changePercent?: number;
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
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm text-slate-500">
                Shows % impermanent loss vs token price move.
            </p>
        </div>
    );
}
