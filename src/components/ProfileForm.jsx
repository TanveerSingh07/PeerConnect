import React, { useState } from "react";

export default function ProfileForm({ profile, onSave }) {
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...profile, name, bio });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card max-w-lg mx-auto space-y-4"
    >
      <div>
        <label className="block mb-1 font-semibold" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 transition-colors duration-300"
      >
        Save Profile
      </button>
    </form>
  );
}
