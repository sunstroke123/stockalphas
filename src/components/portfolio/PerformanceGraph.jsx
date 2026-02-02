'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';

export default function PerformanceGraph({ data }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-lg p-3">
          <p className="text-[rgb(140,140,140)] text-sm mb-1">{payload[0].payload.date}</p>
          <p className="text-[rgb(230,230,230)] font-semibold">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-[rgb(230,230,230)] mb-6">
        Portfolio Performance
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              stroke="rgb(140,140,140)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="rgb(140,140,140)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0AFA92"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#0AFA92' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
