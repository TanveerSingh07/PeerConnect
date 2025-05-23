import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 text-center py-4 shadow-inner text-sm text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} PeerConnect — Crafted with ❤️ for student collaborations.
    </footer>
  );
}
