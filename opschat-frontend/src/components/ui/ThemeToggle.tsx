import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.tsx';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
            )}
        </button>
    );
};