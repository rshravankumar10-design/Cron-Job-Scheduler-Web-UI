import { Moon, Sun } from "lucide-react";
import CronBuilder from "./components/CronBuilder";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const [isDark, toggleDarkMode] = useDarkMode();

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 dark:border-slate-700"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-slate-700" />
        )}
      </button>

      {/* Main Component */}
      <CronBuilder />
    </div>
  );
}

export default App;
