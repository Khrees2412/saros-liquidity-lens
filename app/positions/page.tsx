"use client";

import React from "react";
import PositionDashboard from "../components/positionDashboard";

export default function PositionsPage() {
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Your Positions</h1>
            <PositionDashboard />
        </div>
    );
}
