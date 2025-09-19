// 📁 src/components/StatsByCountry.jsx
import React, { useEffect, useState } from 'react';
import { getStatsByCountry } from '../../api/tours';
import 'bootstrap/dist/css/bootstrap.min.css';
import SpinnerLoader from '../SpinnerLoader';

const StatsByCountry = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStatsByCountry();
        setStats(res.data?.data || []);
      } catch (err) {
        setError('❌ Failed to fetch country statistics');
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
      <h2 className="text-center mb-4">🌍 Tour Stats by Country</h2>

      <div className="table-responsive shadow rounded">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Country</th>
              <th>Total Tours</th>
              <th>Total Visitors</th>
              <th>Average Revenue</th>
              <th>Average Rating</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((item, index) => (
              <tr key={item.Country}>
                <td>{index + 1}</td>
                <td><strong>{item.Country}</strong></td>
                <td>{item.totalTours.toLocaleString()}</td>
                <td>{item.totalVisitors.toLocaleString()}</td>
                <td>${item.avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td>{item.avgRating.toFixed(2)} ⭐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsByCountry;
