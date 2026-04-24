/**
 * Performance Optimization Utilities
 * Lazy loading, memoization, and socket optimization
 */

import React, { lazy, Suspense } from 'react';

/**
 * Lazy route loader with fallback
 */
export const lazyLoadRoute = (importStatement, fallback = 'Loading...') => {
  const LazyComponent = lazy(importStatement);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">{fallback}</div>}>
      <LazyComponent />
    </Suspense>
  );
};

/**
 * Debounce hook for socket events
 * Reduces number of events sent over socket
 */
export const useSocketDebounce = (callback, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(callback);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(callback);
    }, delay);

    return () => clearTimeout(handler);
  }, [callback, delay]);

  return debouncedValue;
};

/**
 * Optimize socket event frequency
 * Batch multiple updates into single emit
 */
export class SocketEventBatcher {
  constructor(socket, flushInterval = 1000) {
    this.socket = socket;
    this.flushInterval = flushInterval;
    this.eventBatch = {};
    this.batchTimer = null;
  }

  /**
   * Add event to batch
   */
  batch(eventName, data) {
    if (!this.eventBatch[eventName]) {
      this.eventBatch[eventName] = [];
    }

    this.eventBatch[eventName].push(data);

    // Schedule batch flush
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Flush all batched events
   */
  flush() {
    for (const [eventName, dataArray] of Object.entries(this.eventBatch)) {
      if (dataArray.length > 0) {
        // Send batch instead of individual events
        this.socket.emit(eventName, {
          batch: true,
          data: dataArray,
          timestamp: Date.now(),
        });
      }
    }

    this.eventBatch = {};
    this.batchTimer = null;
  }

  /**
   * Clear pending batch
   */
  clear() {
    clearTimeout(this.batchTimer);
    this.eventBatch = {};
    this.batchTimer = null;
  }
}

/**
 * Component render optimization
 * Prevents unnecessary re-renders using React.memo
 */
export const withMemoization = (Component, propsAreEqual) => {
  return React.memo(Component, (prevProps, nextProps) => {
    if (propsAreEqual) {
      return propsAreEqual(prevProps, nextProps);
    }

    // Default shallow comparison
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

/**
 * API request debounce for search/filter
 * Prevents sending request on every keystroke
 */
export const useAsyncDebounce = (callback, delay = 300) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const timeoutRef = React.useRef(null);

  const debouncedFunction = React.useCallback(
    (...args) => {
      setIsLoading(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        await callback(...args);
        setIsLoading(false);
      }, delay);
    },
    [callback, delay]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedFunction, isLoading];
};

/**
 * Virtual scrolling for large lists
 * Only render visible items
 */
export const VirtualizedList = ({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
      style={{ height: containerHeight, overflow: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index}>{renderItem(item, startIndex + index)}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  lazyLoadRoute,
  useSocketDebounce,
  SocketEventBatcher,
  withMemoization,
  useAsyncDebounce,
  VirtualizedList,
};
