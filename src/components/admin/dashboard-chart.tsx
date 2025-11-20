"use client";

import React from "react";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Demo data for the chart
const generateChartData = (period: string) => {
  const data = [];

  switch (period) {
    case "1d":
      // Hourly data for today
      for (let i = 0; i < 24; i++) {
        data.push({
          name: `${i}:00`,
          sales: Math.floor(Math.random() * 300) + 100,
          orders: Math.floor(Math.random() * 15) + 1,
          visitors: Math.floor(Math.random() * 50) + 20,
        });
      }
      break;
    case "7d":
      // Daily data for a week
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      for (let i = 0; i < 7; i++) {
        data.push({
          name: days[i],
          sales: Math.floor(Math.random() * 2000) + 500,
          orders: Math.floor(Math.random() * 40) + 10,
          visitors: Math.floor(Math.random() * 500) + 200,
        });
      }
      break;
    case "30d":
      // Data for a month
      for (let i = 1; i <= 30; i++) {
        data.push({
          name: `${i}`,
          sales: Math.floor(Math.random() * 2500) + 800,
          orders: Math.floor(Math.random() * 50) + 15,
          visitors: Math.floor(Math.random() * 800) + 300,
        });
      }
      break;
    case "90d":
      // Data for a quarter (3 months)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 0; i < 12; i++) {
        data.push({
          name: months[i],
          sales: Math.floor(Math.random() * 10000) + 3000,
          orders: Math.floor(Math.random() * 200) + 50,
          visitors: Math.floor(Math.random() * 5000) + 1000,
        });
      }
      break;
    default:
      // Default to weekly
      const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      for (let i = 0; i < 7; i++) {
        data.push({
          name: defaultDays[i],
          sales: Math.floor(Math.random() * 2000) + 500,
          orders: Math.floor(Math.random() * 40) + 10,
          visitors: Math.floor(Math.random() * 500) + 200,
        });
      }
  }

  return data;
};

interface DashboardChartData {
  name: string;
  sales: number;
  orders: number;
  visitors: number;
}

interface DashboardChartProps {
  period: string;
  data?: DashboardChartData[];
}

export default function DashboardChart({
  period = "7d",
  data: realData,
}: DashboardChartProps) {
  const data = React.useMemo(() => {
    // Use real data if available, otherwise generate demo data
    return realData && realData.length > 0
      ? realData
      : generateChartData(period);
  }, [period, realData]);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            className="text-muted-foreground text-xs"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-muted-foreground text-xs"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              period === "1d"
                ? `$${value}`
                : `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              undefined,
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: "1rem" }}
            formatter={(value: string) => (
              <span className="capitalize">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stackId="1"
            stroke="#1e40af"
            fill="#dbeafe"
            className="fill-light-blue stroke-blue"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stackId="2"
            stroke="#3b82f6"
            fill="#bfdbfe"
            className="fill-light-blue stroke-blue"
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stackId="3"
            stroke="#60a5fa"
            fill="#93c5fd"
            className="fill-light-blue stroke-blue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
