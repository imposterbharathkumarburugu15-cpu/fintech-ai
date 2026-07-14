import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
const data = [
  { month: "Jan", income: 5200, spend: 3800 },
  { month: "Feb", income: 5800, spend: 4100 },
  { month: "Mar", income: 6100, spend: 4e3 },
  { month: "Apr", income: 6800, spend: 4500 },
  { month: "May", income: 7200, spend: 4400 },
  { month: "Jun", income: 7100, spend: 4520 }
];
function CashFlowChart() {
  return <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
    dataKey="month"
    axisLine={{ stroke: "#27272a" }}
    tickLine={false}
    tick={{ fill: "#71717a", fontSize: 12 }}
    dy={10}
  />
        <YAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "#71717a", fontSize: 12 }}
    tickFormatter={(value) => `$${value}`}
  />
        <Tooltip
    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }}
    itemStyle={{ color: "#fff", fontWeight: 500 }}
    cursor={{ stroke: "#27272a", strokeWidth: 1, strokeDasharray: "4 4" }}
  />
        <Area
    type="monotone"
    dataKey="income"
    stroke="#3b82f6"
    strokeWidth={3}
    fillOpacity={1}
    fill="url(#colorIncome)"
  />
        <Area
    type="monotone"
    dataKey="spend"
    stroke="#8b5cf6"
    strokeWidth={3}
    fillOpacity={1}
    fill="url(#colorSpend)"
  />
      </AreaChart>
    </ResponsiveContainer>;
}
export {
  CashFlowChart
};
