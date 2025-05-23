import React from "react";

export default function ProfileCard({ profile }) {
  return (
    <div className="card hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 max-w-sm mx-auto">
      <img
        src={profile.avatar || "/sampleProfilePic.png"}
        alt={`${profile.name}'s avatar`}
        className="w-24 h-24 rounded-full mx-auto mb-4"
      />
      <h3 className="text-xl font-bold text-center">{profile.name}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-center">{profile.bio}</p>
    </div>
  );
}
