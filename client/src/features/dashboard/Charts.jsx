// 📁 src/features/dashboard/Charts.jsx
import React, { useEffect, useState } from 'react';
import { getTourStats } from '../../api/tours';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const Charts = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [tourCountData, setTourCountData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ تم إضافة حالة اللودينج

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getTourStats();
        const raw = res.data?.data || [];

        const topRevenue = [...raw]
          .sort((a, b) => b.avgRevenue - a.avgRevenue)
          .slice(0, 10)
          .map(stat => ({
            name: `${stat.Country} (${stat.Category})`,
            avgRevenue: stat.avgRevenue
          }));
        setRevenueData(topRevenue);

        const topTours = [...raw]
          .sort((a, b) => b.numTours - a.numTours)
          .slice(0, 10)
          .map(stat => ({
            name: `${stat.Country} (${stat.Category})`,
            numTours: stat.numTours
          }));
        setTourCountData(topTours);

        const topRatings = [...raw]
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 10)
          .map(stat => ({
            name: `${stat.Country} (${stat.Category})`,
            avgRating: stat.avgRating
          }));
        setRatingData(topRatings);
      } catch (err) {
        console.error("Error loading charts:", err);
      } finally {
        setLoading(false); // ✅ نوقف اللودينج هنا
      }
    };

    fetchStats();
  }, []);

  const chartCard = (title, data, dataKey, color, labelFormatter, unit = '') => (
    <div className="card shadow-sm mb-4 border-primary">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={180} />
            <Tooltip
              formatter={(val) =>
                typeof val === 'number' ? `${unit}${val.toLocaleString()}` : val
              }
            />
            <Bar dataKey={dataKey} fill={color}>
              <LabelList dataKey={dataKey} position="right" formatter={labelFormatter} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: '4rem', height: '4rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3 text-secondary">Loading Charts...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {chartCard(
        '💰 Avg Revenue by Country & Category',
        revenueData,
        'avgRevenue',
        '#4e73df',
        (val) => `$${val.toLocaleString()}`,
        '$'
      )}
      {chartCard(
        '🧭 Number of Tours by Country & Category',
        tourCountData,
        'numTours',
        '#1cc88a',
        (val) => `${val} tours`
      )}
      {chartCard(
        '⭐ Avg Rating by Country & Category',
        ratingData,
        'avgRating',
        '#f6c23e',
        (val) => `${val.toFixed(2)}★`
      )}
    </div>
  );
};

export default Charts;
