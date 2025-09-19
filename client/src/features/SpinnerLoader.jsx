// 📁 src/components/SpinnerLoader.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SpinnerLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
    <div className="spinner-border text-primary" style={{ width: '4rem', height: '40rem' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default SpinnerLoader;
