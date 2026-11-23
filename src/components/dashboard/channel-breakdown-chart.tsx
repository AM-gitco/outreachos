"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChannelPerformance } from "@/lib/actions/dashboard";
import { Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";

interface ChannelBreakdownChartProps {
  data: ChannelPerformance[];
}

export function ChannelBreakdownChart({ data }: ChannelBreakdownChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const colors: Record<string, { fill: string; border: string }> = {
    email: { fill: "#3b82f6", border: "#2563eb" },
    linkedin: { fill: "#8b5cf6", border: "#7c3aed" },
  };

  const totalActions = data.reduce((acc, curr) => acc + curr.actions, 0);

  if (!data || data.length === 0 || totalActions === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        <span>No channel activity recorded yet.</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.channel,
    value: d.actions,
    percentage: d.percentage,
    color: d.channel.toLowerCase() === "email" ? colors.email.fill : colors.linkedin.fill,
  }));

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Sleek Donut Ring */}
      <div className="relative w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as { name: string; value: number; percentage: number; color: string };
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 shadow-xl text-xs backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="font-semibold text-foreground">{d.name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-mono font-semibold text-foreground">{d.value}</span> actions ({d.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={5}
              cornerRadius={5}
              dataKey="value"
              stroke="none"
              animationDuration={600}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-opacity duration-200 cursor-pointer"
                  style={{
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                    filter: activeIndex === index ? "drop-shadow(0px 2px 8px rgba(0,0,0,0.25))" : "none",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Metric Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
            {totalActions}
          </span>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mt-0.5">
            Touches
          </span>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-2.5 w-full pt-2 border-t border-border/80">
        {data.map((item) => {
          const isEmail = item.channel.toLowerCase() === "email";
          return (
            <div
              key={item.channel}
              className="flex flex-col justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isEmail ? (
                  <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                ) : (
                  <LinkedinIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                )}
                <span className="font-medium text-foreground">{item.channel}</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-sm font-bold text-foreground">
                  {item.actions}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground font-medium">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
