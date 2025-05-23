import { useEffect, useState } from 'react';
import { students } from '../utils/mockData';

export default function MyConnections() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('peerProfile'))?.collegeId || 'default';
    const sent = JSON.parse(localStorage.getItem(`sentRequests_${currentUser}`)) || [];
    const connected = students.filter((s) => sent.includes(s.id));
    setConnections(connected);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Your Connections</h1>

      {connections.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No connections yet. Start connecting with students!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((student) => (
            <article
              key={student.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={student.profilePic}
                alt={student.name}
                loading="lazy"
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
