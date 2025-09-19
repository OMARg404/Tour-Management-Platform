import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTours } from '../../api/tours';
import 'bootstrap/dist/css/bootstrap.min.css';

const ToursList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllTours();
        const toursArr = res.data?.data?.tours || [];
        setTours(toursArr);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError('Failed to fetch tours.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(tours.length / toursPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const ellipsis = <li className="page-item disabled"><span className="page-link">...</span></li>;

    if (currentPage > 3) {
      pageNumbers.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
        </li>,
        ellipsis
      );
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
        </li>
      );
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push(
        ellipsis,
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
        </li>
      );
    }

    return (
      <nav className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>⬅ Prev</button>
          </li>
          {pageNumbers}
          <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next ➡</button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '40rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger mt-3 text-center">{error}</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">
        🗺️ All Tours <span className="text-muted">(Page {currentPage} of {totalPages})</span>
      </h2>

      <div className="row">
        {currentTours.map((tour) => (
          <div className="col-lg-4 col-md-6 mb-4" key={tour._id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tour/${tour.id}`)}>
                <h5 className="card-title">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.Location + ', ' + tour.Country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-decoration-none"
                  >
                    📍 {tour.Location}, {tour.Country}
                  </a>
                </h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>ID:</strong> {tour.id}</li>
                  <li className="list-group-item"><strong>Category:</strong> {tour.Category}</li>
                  <li className="list-group-item"><strong>Rating:</strong> {tour.Rating}</li>
                  <li className="list-group-item"><strong>Visitors:</strong> {tour.Visitors.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Revenue:</strong> ${tour.Revenue.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Accommodation:</strong> {tour.Accommodation_Available}</li>
                  <li className="list-group-item"><strong>Popular:</strong> {tour.isPopular ? '✅ Yes' : '❌ No'}</li>
                  <li className="list-group-item"><strong>Revenue/Visitor:</strong> ${tour.revenuePerVisitor}</li>
                  <li className="list-group-item"><strong>Slug:</strong> {tour.slug}</li>
                  <li className="list-group-item">
                    <strong>Created At:</strong> {new Date(tour.createdAt).toLocaleDateString()}
                  </li>
                  <li className="list-group-item">
                    <strong>Custom Created:</strong> {new Date(tour.createdAtCustom).toLocaleDateString()}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderPagination()}
    </div>
  );
};

export default ToursList;
