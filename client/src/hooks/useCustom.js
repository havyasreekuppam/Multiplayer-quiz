import { useEffect } from 'react';

/**
 * Custom hooks for Quiz Battle application
 * Reusable logic hooks for React components
 */

/**
 * useTimer - Custom hook for countdown timer
 * @param {number} initialTime - Starting time in seconds
 * @param {boolean} isActive - Should timer be active
 * @returns {number} - Remaining time
 */
export const useTimer = (initialTime, isActive) => {
  const [time, setTime] = React.useState(initialTime);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return time;
};

/**
 * useLocalStorage - Store and retrieve data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Initial value
 * @returns {array} - [value, setValue]
 */
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('useLocalStorage error:', error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  };

  return [value, setStoredValue];
};

/**
 * useFetch - Hook for API calls with loading and error states
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {object} - { data, loading, error }
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

/**
 * useDebounce - Debounce a value
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * usePrevious - Get previous value of a variable
 * @param {any} value - Current value
 * @returns {any} - Previous value
 */
export const usePrevious = (value) => {
  const ref = React.useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * useAsync - Handle async operations
 * @param {function} asyncFunction - Async function to execute
 * @param {object} immediate - Execute immediately
 * @returns {object} - { execute, status, data, error }
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = React.useState('pending');
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(async () => {
    setStatus('pending');
    try {
      const result = await asyncFunction();
      setData(result);
      setStatus('success');
      return result;
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [asyncFunction]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

export default {
  useTimer,
  useLocalStorage,
  useFetch,
  useDebounce,
  usePrevious,
  useAsync,
};
