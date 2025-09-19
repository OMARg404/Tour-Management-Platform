// 📁 src/components/Hero.jsx
import React from 'react';

const Hero = () => {
  return (
    <section className="bg-light text-dark py-5 text-center">
      <div className="container">
        <h1 className="display-4 fw-bold">Welcome to GlobeTrekker</h1>
        <p className="lead">Discover unforgettable tours and adventures across the world. Your journey starts here.</p>
        <a href="/tours" className="btn btn-primary btn-lg mt-3">Explore Tours</a>
      </div>
    </section>
  );
};

export default Hero;
