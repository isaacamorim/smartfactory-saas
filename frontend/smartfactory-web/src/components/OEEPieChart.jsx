// src/components/OEEPieChart.jsx
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function OEEPieChart({ value = 0, size = 140 }) {
    const data = [
        { name: "OEE", value: Math.min(value, 100) },
        { name: "Falta", value: Math.max(100 - value, 0) },
    ];
    const color = value >= 75 ? "var(--green)" : value >= 50 ? "var(--orange)" : "var(--red)";
    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <PieChart width={size} height={size}>
                <Pie data={data} cx={size / 2 - 5} cy={size / 2 - 5} innerRadius={size * 0.35} outerRadius={size * 0.47}
                    startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                    <Cell fill={color} />
                    <Cell fill="var(--bg3)" />
                </Pie>
                <Tooltip formatter={(v, n) => n === "OEE" ? [`${v}%`, "OEE"] : null} />
            </PieChart>
            <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: size * 0.18, fontWeight: 800, color, lineHeight: 1 }}>
                    {value}%
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.08, color: "var(--text3)", marginTop: 2 }}>OEE</div>
            </div>
        </div>
    );
}