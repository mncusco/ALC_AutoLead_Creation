"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

type ByPlatform = { platform: string; count: number };
type ByStatus = { status: string; count: number };

const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#0891b2"];

export function PublishCharts({ byPlatform, byStatus }: { byPlatform: ByPlatform[]; byStatus: ByStatus[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
      <div style={{ height: 300 }}>
        <h3>Pubblicazioni per piattaforma</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byPlatform}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ height: 300 }}>
        <h3>Esito pubblicazioni</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byStatus} dataKey="count" nameKey="status" outerRadius={100} label>
              {byStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
