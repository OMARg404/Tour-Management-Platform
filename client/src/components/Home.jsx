// 📁 src/pages/Home.jsx
import React from 'react';
import Hero from '../components/Hero';
import TopRevenueTours from '../features/tours/TopRevenueTours';
import StatsByCountry from '../features/tours/StatsByCountry';
import Charts from '../features/dashboard/Charts';

const Home = () => {
  return (
    <div>
      <Hero />

      <section className="container my-5">
        <h2 className="text-center mb-4 text-success fw-bold">💰 Top Revenue Tours</h2>
        <TopRevenueTours />
      </section>

      <section className="container my-5">
        <h2 className="text-center mb-4 text-info fw-bold">🌍 Tours by Country</h2>
        <StatsByCountry />
      </section>

      <section className="container my-5">
        <h2 className="text-center mb-4 text-warning fw-bold">📈 Tour Statistics</h2>
        <Charts />
      </section>
    </div>
  );
};

export default Home;
