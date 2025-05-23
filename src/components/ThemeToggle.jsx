export default function ThemeToggle() {
    const toggleTheme = () => {
      const html = document.documentElement;
      html.classList.toggle('dark');
    };
  
    return (
      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1 rounded hover:shadow transition"
        aria-label="Toggle Dark Mode"
      >
        Toggle Dark Mode
      </button>
    );
  }
  