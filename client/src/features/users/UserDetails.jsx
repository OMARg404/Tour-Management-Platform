import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOneUser as getUserById, deleteUser } from '../../api/user';
import SpinnerLoader from '../SpinnerLoader';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    try {
      const res = await getUserById(id);
      setUser(res.data.data.user);
    } catch (err) {
      setError('❌ Failed to fetch user');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      navigate('/users');
    } catch (err) {
      setError('❌ Failed to delete user');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!user) return <SpinnerLoader />;

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-3">👤 User Details</h2>

      <table className="table table-bordered w-75 mx-auto">
        <tbody>
          <tr><th>Name</th><td>{user.name}</td></tr>
          <tr><th>Age</th><td>{user.age}</td></tr>
          <tr><th>Email</th><td>{user.email}</td></tr>
          <tr><th>Phone</th><td>{user.phone}</td></tr>
          <tr><th>Occupation</th><td>{user.occupation}</td></tr>
          <tr><th>Graduation Year</th><td>{user.graduation_year}</td></tr>
          <tr><th>Student</th><td>{user.is_student ? '🎓 Yes' : '❌ No'}</td></tr>
          <tr><th>City</th><td>{user.address?.city}</td></tr>
          <tr><th>Street</th><td>{user.address?.street}</td></tr>
          <tr><th>Country</th><td>{user.address?.country}</td></tr>
          <tr>
            <th>Hobbies</th>
            <td>
              <ul className="mb-0">
                {user.hobbies?.map((hobby, i) => (
                  <li key={i}>{hobby}</li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <th>Programming Languages</th>
            <td>
              <ul className="mb-0">
                {user.skills?.programming_languages?.map((lang, i) => (
                  <li key={i}>{lang}</li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <th>Frameworks</th>
            <td>
              <ul className="mb-0">
                {user.skills?.frameworks?.map((fw, i) => (
                  <li key={i}>{fw}</li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <th>Courses</th>
            <td>
              <ul className="mb-0">
                {user.courses?.map((c, i) => (
                  <li key={i}>
                    {c.course_name} @ {c.institution}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <th>Social Media</th>
            <td>
              <a href={user.social_media?.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> |{' '}
              <a href={user.social_media?.github} target="_blank" rel="noreferrer">GitHub</a>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link to={`/users/edit/${user.id}`} className="btn btn-primary">✏️ Edit</Link>
        <button onClick={handleDelete} className="btn btn-danger">🗑️ Delete</button>
        <Link to="/users" className="btn btn-secondary">⬅️ Back</Link>
      </div>
    </div>
  );
};

export default UserDetails;
