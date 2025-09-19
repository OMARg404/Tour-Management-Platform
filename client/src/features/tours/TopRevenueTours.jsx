// 📁 src/features/tours/TopRevenueTours.jsx
import React, { useEffect, useState } from 'react';
import { getTopRevenuePerVisitor } from '../../api/tours';
import SpinnerLoader from '../SpinnerLoader';

const TopRevenueTours = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRevenue = async () => {
      try {
        const res = await getTopRevenuePerVisitor();
        setData(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load top revenue tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTopRevenue();
  }, []);

  if (loading) return <SpinnerLoader />;
  if (error) return <div className="alert alert-danger text-center mt-4">{error}</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">💰 Top 5 Revenue per Visitor Tours</h2>

      <div className="table-responsive">
        <table className="table table-hover table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Location</th>
              <th>Country</th>
              <th>Revenue per Visitor (USD)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tour, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{tour.Location}</td>
                <td>{tour.Country}</td>
                <td>${tour.revenuePerVisitor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopRevenueTours;
