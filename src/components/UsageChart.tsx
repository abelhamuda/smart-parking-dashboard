import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface UsageChartProps {
  data: { hour: string; count: number }[]
}

export function UsageChart({ data }: UsageChartProps) {
  // Format data for display
  const formattedData = data.map(d => ({
    name: `${d.hour}:00`,
    total: d.count
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground border-dashed border-[1px] rounded-lg">
        No data available for analytics
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
           cursor={{fill: 'rgba(0,0,0,0.05)'}}
           contentStyle={{ 
             borderRadius: '8px', 
             border: '1px solid #e2e8f0', 
             boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
             fontSize: '12px'
           }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
