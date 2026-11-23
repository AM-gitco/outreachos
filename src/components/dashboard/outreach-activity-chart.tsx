"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyActivityPoint } from "@/lib/actions/dashboard";

interface OutreachActivityChartProps {
  data: DailyActivityPoint[];
  isHourlyView?: boolean;
}

export function OutreachActivityChart({ data, isHourlyView = false }: OutreachActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        No outreach activity recorded in this date range.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
        >
          <defs>
            <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="linkedinGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="repliesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-border/40"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            stroke="currentColor"
            className="text-muted-foreground text-[11px] font-mono"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="currentColor"
            className="text-muted-foreground text-[11px] font-mono"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />

          <Tooltip content={<CustomTooltip isHourlyView={isHourlyView} />} />

          <Area
            type="monotone"
            dataKey="email"
            name="Email Sent"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "#3b82f6", strokeWidth: 1, stroke: "#ffffff" }}
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: "#ffffff" }}
            fillOpacity={1}
            fill="url(#emailGradient)"
            isAnimationActive={true}
            animationDuration={500}
          />

          <Area
            type="monotone"
            dataKey="linkedin"
            name="LinkedIn Actions"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "#8b5cf6", strokeWidth: 1, stroke: "#ffffff" }}
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: "#ffffff" }}
            fillOpacity={1}
            fill="url(#linkedinGradient)"
            isAnimationActive={true}
            animationDuration={500}
          />

          <Area
            type="monotone"
            dataKey="replies"
            name="Replies"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "#10b981", strokeWidth: 1, stroke: "#ffffff" }}
            activeDot={{ r: 4.5, strokeWidth: 2, stroke: "#ffffff" }}
            fillOpacity={1}
            fill="url(#repliesGradient)"
            isAnimationActive={true}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  isHourlyView,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  isHourlyView?: boolean;
}) {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
      <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[150px] animate-in fade-in-0 zoom-in-95 duration-100">
        <div className="font-semibold text-foreground border-b border-border/80 pb-1.5 flex justify-between items-center">
          <span>{isHourlyView ? `Time: ${label}` : label}</span>
          <span className="font-mono text-[10px] text-muted-foreground font-normal">
            Total: <strong className="text-foreground">{total}</strong>
          </span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-semibold tabular-nums text-foreground font-mono">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
