// 📁 src/features/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  getTopRevenuePerVisitor,
  getStatsByCountry,
  getTourStats,
  getAllTours
} from '../../api/tours';
import 'bootstrap/dist/css/bootstrap.min.css';
import Charts from './Charts';

const Dashboard = () => {
  const [topRevenueTours, setTopRevenueTours] = useState([]);
  const [countryStats, setCountryStats] = useState([]);
  const [tourStats, setTourStats] = useState([]);
  const [totalTours, setTotalTours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [revenueRes, countryRes, statsRes, allToursRes] = await Promise.all([
          getTopRevenuePerVisitor(),
          getStatsByCountry(),
          getTourStats(),
          getAllTours()
        ]);

        setTopRevenueTours(revenueRes.data?.data || []);
        setCountryStats(countryRes.data?.data || []);
        setTourStats(statsRes.data?.data || []);
        setTotalTours(allToursRes.data?.data?.tours?.length || 0);
      } catch (err) {
        console.error('❌ Dashboard Load Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '40rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3 text-secondary">Loading Dashboard...</h5>
      </div>
    </div>
  );
}

  return (
    <div className="container py-4">
      <h2 className="text-center mb-5 display-5 fw-bold text-primary">📊 Tour Dashboard</h2>

      {/* Charts */}
      <div className="mb-5">
        <Charts />
      </div>

      {/* Summary Card */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-6 col-lg-4">
          <div className="card text-white bg-primary shadow-lg border-0">
            <div className="card-body text-center">
              <h5 className="card-title">Total Tours</h5>
              <h2 className="display-4">{totalTours}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Country Stats Table */}
      <div className="mb-5">
        <h4 className="mb-3 text-secondary">🌍 Stats By Country</h4>
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-primary">
              <tr className="text-center">
                <th>Country</th>
                <th>Total Tours</th>
                <th>Total Visitors</th>
                <th>Accommodation ✅</th>
                <th>Accommodation ❌</th>
              </tr>
            </thead>
            <tbody>
              {countryStats.map((stat, i) => (
                <tr key={i} className="text-center">
                  <td>{stat.Country}</td>
                  <td>{stat.totalTours}</td>
                  <td>{stat.totalVisitors.toLocaleString()}</td>
                  <td>{stat.accommodationYes}</td>
                  <td>{stat.accommodationNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Revenue Cards */}
      <div className="mb-5">
        <h4 className="mb-3 text-success">💰 Top Revenue Per Visitor Tours</h4>
        <div className="row">
          {topRevenueTours.map((tour, i) => (
            <div key={i} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-success shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold text-success">{tour.Location}, {tour.Country}</h6>
                  <p className="card-text">
                    Revenue/Visitor: <span className="fw-semibold">${tour.revenuePerVisitor.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tour Stats by Country & Category */}
      <div>
        <h4 className="mb-3 text-info">📈 Tour Stats by Country & Category</h4>
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-info">
              <tr className="text-center">
                <th>Country</th>
                <th>Category</th>
                <th>Avg Rating ⭐</th>
                <th>Avg Revenue 💵</th>
                <th>Min Revenue</th>
                <th>Max Revenue</th>
                <th>Accommodation ✅</th>
                <th>Accommodation ❌</th>
              </tr>
            </thead>
            <tbody>
              {tourStats.slice(0, 10).map((item, i) => (
                <tr key={i} className="text-center">
                  <td>{item.Country}</td>
                  <td>{item.Category}</td>
                  <td>{item.avgRating.toFixed(2)}</td>
                  <td>${item.avgRevenue.toLocaleString()}</td>
                  <td>${item.minRevenue.toLocaleString()}</td>
                  <td>${item.maxRevenue.toLocaleString()}</td>
                  <td>{item.accommodationYes}</td>
                  <td>{item.accommodationNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
