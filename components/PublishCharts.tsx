"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

type ByPlatform = { platform: string; count: number };
type ByStatus = { status: string; count: number };

const COLORS = ["#d9a94c", "#4a7a62", "#8fa3c8", "#c27a7a", "#9a8fd4"];
const INK_DIM = "#aeb4c4";
const LINE = "rgba(243,239,228,0.14)";
const TOOLTIP_STYLE = { background: "#19233b", border: "1px solid rgba(243,239,228,0.14)", borderRadius: 4, color: "#f3efe4" };

export function PublishCharts({ byPlatform, byStatus }: { byPlatform: ByPlatform[]; byStatus: ByStatus[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={{ height: 280 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, margin: "0 0 12px" }}>Pubblicazioni per piattaforma</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byPlatform}>
            <CartesianGrid strokeDasharray="3 3" stroke={LINE} />
            <XAxis dataKey="platform" stroke={INK_DIM} tick={{ fill: INK_DIM, fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke={INK_DIM} tick={{ fill: INK_DIM, fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#d9a94c" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ height: 280 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, margin: "0 0 12px" }}>Esito pubblicazioni</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byStatus} dataKey="count" nameKey="status" outerRadius={90} label={{ fill: INK_DIM, fontSize: 12 }}>
              {byStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 13, color: INK_DIM }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
