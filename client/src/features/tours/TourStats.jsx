// 📁 src/features/tours/TourStats.jsx
import React, { useEffect, useState } from 'react';
import { getTourStats } from '../../api/tours';
import SpinnerLoader from '../SpinnerLoader';

const TourStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getTourStats();
        setStats(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load tour statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <SpinnerLoader />;
  if (error) return <div className="alert alert-danger text-center mt-4">{error}</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">📊 Tour Statistics by Country & Category</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Country</th>
              <th>Category</th>
              <th>Num of Tours</th>
              <th>Total Visitors</th>
              <th>Avg Rating</th>
              <th>Avg Revenue ($)</th>
              <th>Min Revenue</th>
              <th>Max Revenue</th>
              <th>Accommodation ✅</th>
              <th>Accommodation ❌</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.Country}</td>
                <td>{row.Category}</td>
                <td>{row.numTours}</td>
                <td>{row.totalVisitors.toLocaleString()}</td>
                <td>{row.avgRating.toFixed(2)}</td>
                <td>{row.avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td>{row.minRevenue.toLocaleString()}</td>
                <td>{row.maxRevenue.toLocaleString()}</td>
                <td>{row.accommodationYes}</td>
                <td>{row.accommodationNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourStats;
