// src/components/TurnoChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TurnoChart({ t1 = 0, t2 = 0, t3 = 0, turnoAtivo = 0, height = 120 }) {
    const data = [
        { name: "T1", value: t1, ativo: turnoAtivo === 1 },
        { name: "T2", value: t2, ativo: turnoAtivo === 2 },
        { name: "T3", value: t3, ativo: turnoAtivo === 3 },
    ];
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} barSize={32} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ background: "var(--bg0)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}
                    formatter={(v) => [v.toLocaleString("pt-BR") + " un", "Produção"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((d, i) => (
                        <Cell key={i} fill={d.ativo ? "var(--primary)" : "var(--bg3)"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}