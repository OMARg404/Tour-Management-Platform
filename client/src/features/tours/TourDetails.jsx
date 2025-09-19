import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOneTour, updateTour, deleteTour } from '../../api/tours';
import SpinnerLoader from '../SpinnerLoader';
import './TourDetails.css';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await getOneTour(id);
        const tourData = res.data?.data?.tour || null;
        setTour(tourData);
        setFormData(tourData);
      } catch (err) {
        setError('❌ Failed to load tour details.');
      }
    };
    fetchTour();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    try {
      await deleteTour(id);
      navigate('/');
    } catch (err) {
      setError('❌ Failed to delete tour.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateTour(id, {
        ...formData,
        Visitors: Number(formData.Visitors),
        Rating: Number(Number(formData.Rating).toFixed(2)),
        Revenue: Number(formData.Revenue),
      });
      setTour(updated.data.data.tour);
      setIsEditing(false);
    } catch (err) {
      setError('❌ Failed to update tour.');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!tour) return <SpinnerLoader />;

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">🗺️ Tour Details</h2>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="card p-4 shadow-lg bg-light">
          <h4 className="mb-4 text-primary">✏️ Edit Tour</h4>

          {['Location', 'Country', 'Category'].map((field) => (
            <div className="form-floating mb-3" key={field}>
              <input
                type="text"
                className="form-control"
                id={field}
                placeholder={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                required
              />
              <label htmlFor={field}>{field}</label>
            </div>
          ))}

          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control"
                  id="Visitors"
                  placeholder="Visitors"
                  name="Visitors"
                  value={formData.Visitors || ''}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="Visitors">👥 Visitors</label>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="form-floating">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  id="Rating"
                  placeholder="Rating"
                  name="Rating"
                  value={formData.Rating || ''}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="Rating">⭐ Rating</label>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control"
                  id="Revenue"
                  placeholder="Revenue"
                  name="Revenue"
                  value={formData.Revenue || ''}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="Revenue">💰 Revenue ($)</label>
              </div>
            </div>
          </div>

          <div className="form-floating mb-4">
            <select
              className="form-select"
              id="Accommodation_Available"
              name="Accommodation_Available"
              value={formData.Accommodation_Available}
              onChange={handleChange}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <label htmlFor="Accommodation_Available">🏨 Accommodation Available</label>
          </div>

          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-success">
              💾 Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-outline-secondary"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-4 shadow">
          <p><strong>ID:</strong> {tour.id}</p>
          <p>
            <strong>Location:</strong>{' '}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                tour.Location + ', ' + tour.Country
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tour.Location}
            </a>
          </p>
          <p><strong>Country:</strong> {tour.Country}</p>
          <p><strong>Category:</strong> {tour.Category}</p>
          <p><strong>Rating:</strong> {tour.Rating}</p>
          <p><strong>Visitors:</strong> {tour.Visitors.toLocaleString()}</p>
          <p><strong>Revenue:</strong> ${tour.Revenue.toLocaleString()}</p>
          <p><strong>Accommodation:</strong> {tour.Accommodation_Available}</p>
          <p><strong>Popular:</strong> {tour.isPopular ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Revenue per Visitor:</strong> ${tour.revenuePerVisitor}</p>
          <p><strong>Slug:</strong> {tour.slug}</p>
          <p><strong>Created At:</strong> {new Date(tour.createdAtCustom).toLocaleString()}</p>

          <div className="btn-group mt-3">
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              ✏️ Edit
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link to="/tours" className="btn btn-outline-primary">⬅ Back to Tours</Link>
      </div>
    </div>
  );
};

export default TourDetails;
