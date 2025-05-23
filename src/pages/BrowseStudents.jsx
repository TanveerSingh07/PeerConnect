import { useState } from 'react';
import { students } from '../utils/mockData';
import { toast } from 'react-toastify';

export default function BrowseStudents() {
  const [search, setSearch] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('peerProfile'))?.collegeId || 'default';
  const [sent, setSent] = useState(() => {
    const saved = localStorage.getItem(`sentRequests_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });

  const handleConnect = (id) => {
    if (!sent.includes(id)) {
      const updated = [...sent, id];
      setSent(updated);
      localStorage.setItem(`sentRequests_${currentUser}`, JSON.stringify(updated));
      toast.success('Connection request sent!');
    }
  };

  const handleWithdraw = (id) => {
    const updated = sent.filter((reqId) => reqId !== id);
    setSent(updated);
    localStorage.setItem(`sentRequests_${currentUser}`, JSON.stringify(updated));
    toast.info('Connection request withdrawn.');
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.skills.toLowerCase().includes(q) ||
      s.interests.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 min-h-screen">
      <input
        type="text"
        placeholder="Search by name, skill, or department"
        className="w-full md:w-1/2 mb-6 p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search students"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No students found.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((student) => (
            <article
              key={student.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={student.profilePic}
                alt={student.name}
                className="w-16 h-16 object-cover rounded-full border mb-3"
              />
              <p className="font-semibold text-lg">{student.name}</p>
              <p className="text-sm">{student.year} Year, {student.department}</p>
              <p className="mt-2 text-sm">
                <strong>Skills:</strong> {student.skills}
              </p>
              <p className="text-sm">
                <strong>Interests:</strong> {student.interests}
              </p>

              {sent.includes(student.id) ? (
                <button
                  onClick={() => handleWithdraw(student.id)}
                  className="mt-3 px-3 py-1 rounded text-white bg-red-500 hover:bg-red-600 text-sm transition"
                >
                  Withdraw
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(student.id)}
                  className="mt-3 px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm transition"
                >
                  Connect
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
