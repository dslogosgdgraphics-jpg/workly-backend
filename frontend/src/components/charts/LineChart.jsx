import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LineChart({ data, dataKey, xAxisKey, color = '#3b82f6' }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xAxisKey} stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px' 
          }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}