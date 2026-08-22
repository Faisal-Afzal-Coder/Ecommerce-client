import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import PageLoader from '../../components/PageLoader';
import { 
  Users, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  UserX,
  Shield
} from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { activeTheme } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setMessage(null);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`/api/users/${userId}/status`, { status: newStatus });
      setMessage({ type: 'success', text: `User set to ${newStatus}` });
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Status toggle failed' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setMessage(null);
    try {
      await axios.delete(`/api/users/${userId}`);
      setMessage({ type: 'success', text: 'User account deleted' });
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Delete failed' });
    }
  };

  if (loading) {
    return <PageLoader label="Loading user accounts..." />;
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-6 px-4 max-w-7xl mx-auto space-y-8`}>
      
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Registered Users Management
        </h1>
        <p className="text-slate-400 text-sm">
          View all registered customers and admins, deactivate accounts, or remove user records.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                          {usr.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{usr.name}</p>
                          <p className="text-slate-400">{usr.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase ${
                        usr.role === 'admin'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold ${
                        usr.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {usr.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {usr._id === currentUser._id ? (
                        <span className="text-slate-500 text-[11px] italic font-semibold">Your Account</span>
                      ) : usr.role === 'admin' ? (
                        <span className="text-slate-500 text-[11px] italic font-semibold">Protected Admin</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(usr._id, usr.status)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 ${
                              usr.status === 'active'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            }`}
                          >
                            {usr.status === 'active' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" /> Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" /> Activate
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

    </div>
  );
}
