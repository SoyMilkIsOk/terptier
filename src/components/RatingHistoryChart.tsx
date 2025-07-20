"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function RatingHistoryChart({ producerId }: { producerId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/producers/${producerId}/history`)
      .then((res) => res.json())
      .then((d) => setData(d.snapshots || []));
  }, [producerId]);

  return (
    <LineChart width={300} height={200} data={data}>
      <XAxis dataKey="createdAt" />
      <YAxis domain={[0, 5]} />
      <Tooltip />
      <Line type="monotone" dataKey="averageRating" stroke="#8884d8" />
    </LineChart>
  );
}
