import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '../../api/user';
import { Link } from 'react-router-dom';
import SpinnerLoader from '../SpinnerLoader';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
const fetchUsers = async () => {
  try {
    const res = await getAllUsers();
    setUsers(res.data.data.users); // ✅ استخراج users من داخل object
  } catch (err) {
    setError('❌ Failed to fetch users');
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError('❌ Failed to delete user');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!users.length) return <SpinnerLoader />;

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">👥 All Users</h2>

      <div className="mb-3 text-end">
        <Link to="/users/add" className="btn btn-success">➕ Add New User</Link>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Occupation</th>
              <th>City</th>
              <th>Student?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {users.map((u, index) => (
    <tr key={u.id}>
      <td>{index + 1}</td>
      <td>
        <Link to={`/users/${u.id}`} className="text-decoration-none fw-bold text-dark">
          {u.name}
        </Link>
      </td>
      <td>{u.email}</td>
      <td>{u.phone}</td>
      <td>{u.occupation}</td>
      <td>{u.address?.city}</td>
      <td>{u.is_student ? '🎓 Yes' : '❌ No'}</td>
      <td>
        <div className="btn-group">
          <Link to={`/users/${u.id}`} className="btn btn-sm btn-outline-info">👁️ View</Link>
          <Link to={`/users/edit/${u.id}`} className="btn btn-sm btn-outline-primary">✏️ Edit</Link>
          <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-outline-danger">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default UsersList;
