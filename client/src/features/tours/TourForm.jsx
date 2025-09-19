import React, { useState } from 'react';
import { addTour } from '../../api/tours';
import './TourForm.css';

const TourForm = () => {
  const [formData, setFormData] = useState({
    Location: '',
    Country: '',
    Category: '',
    Visitors: '',
    Rating: '',
    Revenue: '',
    Accommodation_Available: 'Yes',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'Rating') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setFormData((prev) => ({ ...prev, [name]: num.toFixed(2) }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: '' }));
      }
      return;
    }

    if (['Revenue', 'Visitors'].includes(name)) {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setFormData((prev) => ({ ...prev, [name]: num }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: '' }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const {
      Location,
      Country,
      Category,
      Visitors,
      Rating,
      Revenue,
      Accommodation_Available,
    } = formData;

    const textRegex = /^[a-zA-Z\s\-]+$/;
    if (
      !Location || Location.length < 3 || Location.length > 50 || !textRegex.test(Location)
    ) return '❌ Invalid Location. Only letters, spaces, or hyphens allowed (3-50 chars).';

    if (
      !Country || Country.length < 2 || Country.length > 50 || !textRegex.test(Country)
    ) return '❌ Invalid Country. Only letters, spaces, or hyphens allowed (2-50 chars).';

    if (
      !Category || Category.length < 3 || Category.length > 50 || !textRegex.test(Category)
    ) return '❌ Invalid Category. Only letters, spaces, or hyphens allowed (3-50 chars).';

    if (isNaN(Visitors) || Visitors < 0) return '❌ Visitors must be a non-negative number.';
    if (isNaN(Revenue) || Revenue < 0) return '❌ Revenue must be a non-negative number.';
    if (isNaN(Rating) || Rating < 0 || Rating > 5) return '❌ Rating must be between 0 and 5.';
    if (!/^\d+(\.\d{1,2})?$/.test(Rating)) return '❌ Rating must have at most 2 decimal places.';

    if (!['Yes', 'No'].includes(Accommodation_Available))
      return '❌ Accommodation must be "Yes" or "No".';

    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'Rating') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setFormData((prev) => ({ ...prev, [name]: num.toFixed(2) }));
      }
    }

    if (['Revenue', 'Visitors'].includes(name)) {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setFormData((prev) => ({ ...prev, [name]: num }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setResponseData(null);

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      const numericData = {
        ...formData,
        Visitors: Number(formData.Visitors),
        Rating: Number(Number(formData.Rating).toFixed(2)),
        Revenue: Number(formData.Revenue),
      };

      const res = await addTour(numericData);
      setSuccess('✅ Tour added successfully!');
      setResponseData(res.data?.data?.tour || null);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to add tour.');
    }
  };

  return (
    <div className="tour-form-container">
      <h2>Add New Tour</h2>
      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="tour-form">
        {Object.entries(formData).map(([key, value]) => (
          <div className="form-group" key={key}>
            <label>{key.replaceAll('_', ' ')}:</label>
            {key === 'Accommodation_Available' ? (
              <select name={key} value={value} onChange={handleChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : (
              <input
                name={key}
                type={['Visitors', 'Rating', 'Revenue'].includes(key) ? 'number' : 'text'}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            )}
          </div>
        ))}
        <button type="submit" className="submit-btn">Add Tour</button>
      </form>

      {responseData && (
        <div className="tour-response-card">
          <h3>🧾 Tour Info:</h3>
          <p><strong>ID:</strong> {responseData.id}</p>
          <p><strong>Location:</strong> {responseData.Location}</p>
          <p><strong>Country:</strong> {responseData.Country}</p>
          <p><strong>Category:</strong> {responseData.Category}</p>
          <p><strong>Rating:</strong> {responseData.Rating}</p>
          <p><strong>Visitors:</strong> {responseData.Visitors.toLocaleString()}</p>
          <p><strong>Revenue:</strong> ${responseData.Revenue.toLocaleString()}</p>
          <p><strong>Accommodation:</strong> {responseData.Accommodation_Available}</p>
          <p><strong>Popular:</strong> {responseData.isPopular ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Revenue per Visitor:</strong> ${responseData.revenuePerVisitor}</p>
          <p><strong>Slug:</strong> {responseData.slug}</p>
          <p><strong>Created At:</strong> {new Date(responseData.createdAtCustom).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default TourForm;
