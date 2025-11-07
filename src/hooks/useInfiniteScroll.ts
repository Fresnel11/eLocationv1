import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  loading: boolean,
  options: UseInfiniteScrollOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!hasMore || loading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    
    const fetchMore = async () => {
      await callback();
      setIsFetching(false);
    };

    fetchMore();
  }, [isFetching, callback]);

  return { isFetching };
};