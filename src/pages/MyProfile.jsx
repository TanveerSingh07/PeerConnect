import { useState } from 'react';

const defaultProfile = {
  name: '',
  collegeId: '',
  year: '',
  department: '',
  profilePic: '',
  skills: '',
  interests: '',
};

export default function MyProfile() {
  const [profile, setProfile] = useState(() => {
    return JSON.parse(localStorage.getItem('peerProfile')) || defaultProfile;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('peerProfile', JSON.stringify(profile));
    alert('Profile saved!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white text-center md:text-left">
        Create Your Profile
      </h2>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Form on left */}
        <form
          onSubmit={handleSubmit}
          className="flex-grow bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-1 gap-6"
        >
          {['name', 'collegeId', 'year', 'department', 'skills', 'interests'].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={profile[field]}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          ))}

          <input
            type="text"
            name="profilePic"
            placeholder="Profile Image URL (optional)"
            value={profile.profilePic}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition"
          >
            Save Profile
          </button>
        </form>

        {/* Profile Preview on right */}
        <div className="flex-shrink-0 w-full md:w-1/3 p-6 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-6 text-center">Profile Preview</h3>
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-blue-600 dark:border-blue-400 shadow-md mb-6"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-blue-600 dark:border-blue-400 shadow-md text-gray-600 dark:text-gray-300 text-5xl font-bold mb-6">
              {profile.name ? profile.name[0].toUpperCase() : '?'}
            </div>
          )}

          <div className="space-y-2 text-lg">
            <p><span className="font-semibold">Name:</span> {profile.name || 'N/A'}</p>
            <p><span className="font-semibold">College ID:</span> {profile.collegeId || 'N/A'}</p>
            <p><span className="font-semibold">Year:</span> {profile.year || 'N/A'}</p>
            <p><span className="font-semibold">Department:</span> {profile.department || 'N/A'}</p>
            <p><span className="font-semibold">Skills:</span> {profile.skills || 'N/A'}</p>
            <p><span className="font-semibold">Interests:</span> {profile.interests || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
