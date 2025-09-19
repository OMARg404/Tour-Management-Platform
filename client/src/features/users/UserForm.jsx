import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addUser, getOneUser } from '../../api/user';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    occupation: '',
    is_student: false,
    graduation_year: '',
    address: {
      street: '',
      city: '',
      country: '',
    },
    hobbies: [''],
    skills: {
      programming_languages: [''],
      frameworks: ['']
    },
    social_media: {
      linkedin: '',
      github: ''
    },
    courses: [{ course_name: '', institution: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData({ ...formData, address: { ...formData.address, [key]: value } });
    } else if (name.includes('social_media.')) {
      const key = name.split('.')[1];
      setFormData({ ...formData, social_media: { ...formData.social_media, [key]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const res = await getOneUser(id);
          setFormData(res.data.data.user);
        } catch (err) {
          alert('❌ Failed to load user for edit');
        }
      };
      fetchUser();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addUser(formData); // ⛔️ replace with updateUser later if editing
      navigate('/users');
    } catch (err) {
      alert('❌ Failed to submit user');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-3">{isEdit ? '✏️ Edit User' : '➕ Add New User'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Name, Age, Email */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-4">
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
          </div>
        </div>

        {/* Phone, Occupation */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-6">
            <label>Occupation</label>
            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="form-control" />
          </div>
        </div>

        {/* Student, Graduation */}
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-check mt-4">
              <input className="form-check-input" type="checkbox" checked={formData.is_student} onChange={(e) => setFormData({ ...formData, is_student: e.target.checked })} />
              <label className="form-check-label">Is Student?</label>
            </div>
          </div>
          <div className="col-md-6">
            <label>Graduation Year</label>
            <input type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} className="form-control" />
          </div>
        </div>

        {/* Address */}
        <h5 className="mt-3">📍 Address</h5>
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Street</label>
            <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4">
            <label>City</label>
            <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-4">
            <label>Country</label>
            <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="form-control" />
          </div>
        </div>

        {/* Social Media */}
        <h5 className="mt-3">🌐 Social Media</h5>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>LinkedIn</label>
            <input type="text" name="social_media.linkedin" value={formData.social_media.linkedin} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-6">
            <label>GitHub</label>
            <input type="text" name="social_media.github" value={formData.social_media.github} onChange={handleChange} className="form-control" />
          </div>
        </div>

        {/* Hobbies, Skills, Courses */}
        <div className="mb-3">
          <label>Hobbies (comma separated)</label>
          <input type="text" value={formData.hobbies.join(', ')} onChange={(e) => setFormData({ ...formData, hobbies: e.target.value.split(',').map(h => h.trim()) })} className="form-control" />
        </div>

        <div className="mb-3">
          <label>Programming Languages (comma separated)</label>
          <input type="text" value={formData.skills.programming_languages.join(', ')} onChange={(e) => setFormData({ ...formData, skills: { ...formData.skills, programming_languages: e.target.value.split(',').map(p => p.trim()) } })} className="form-control" />
        </div>

        <div className="mb-3">
          <label>Frameworks (comma separated)</label>
          <input type="text" value={formData.skills.frameworks.join(', ')} onChange={(e) => setFormData({ ...formData, skills: { ...formData.skills, frameworks: e.target.value.split(',').map(f => f.trim()) } })} className="form-control" />
        </div>

        <h5>🎓 Courses</h5>
        <div className="row mb-4">
          <div className="col-md-6">
            <label>Course Name</label>
            <input type="text" value={formData.courses[0]?.course_name || ''} onChange={(e) => {
              const updated = [...formData.courses];
              updated[0] = { ...updated[0], course_name: e.target.value };
              setFormData({ ...formData, courses: updated });
            }} className="form-control" />
          </div>
          <div className="col-md-6">
            <label>Institution</label>
            <input type="text" value={formData.courses[0]?.institution || ''} onChange={(e) => {
              const updated = [...formData.courses];
              updated[0] = { ...updated[0], institution: e.target.value };
              setFormData({ ...formData, courses: updated });
            }} className="form-control" />
          </div>
        </div>

        <button type="submit" className="btn btn-success w-100">{isEdit ? '✅ Update User' : '✅ Add User'}</button>
      </form>
    </div>
  );
};

export default UserForm;
