import { useState, useRef, useCallback, useEffect } from 'react';

const DEBOUNCE_MS = 350;

export default function usePaginatedOptions({ fetchPage, mapOption, pageSize = 10, initialOption = null }) {
  const [options, setOptions] = useState(initialOption ? [initialOption] : []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageRef      = useRef(1);
  const searchRef     = useRef('');
  const loadedRef     = useRef(false);
  const debounceRef   = useRef(null);
  const requestIdRef  = useRef(0);

  const loadPage = useCallback(async (page, search, append) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res  = await fetchPage(page, search, pageSize);
      const rows = res?.data || [];
      const meta = res?.meta || {};
      const mapped = rows.map(mapOption);

      if (requestId !== requestIdRef.current) return;

      setOptions((prev) => {
        if (!append) return mapped;
        const seen = new Set(prev.map((o) => o.value));
        return [...prev, ...mapped.filter((o) => !seen.has(o.value))];
      });

      setHasMore(meta.hasNextPage);
      pageRef.current = page;
    } catch (err) {
      if (requestId === requestIdRef.current) {
        if (!append) setOptions([]);
        setHasMore(false);
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [fetchPage, mapOption, pageSize]);

  const openMenu = useCallback(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadPage(1, searchRef.current, false);
    }
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    loadPage(pageRef.current + 1, searchRef.current, true);
  }, [loading, hasMore, loadPage]);

  const onSearchChange = useCallback((term) => {
    searchRef.current = term;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadPage(1, term, false);
    }, DEBOUNCE_MS);
  }, [loadPage]);

  return { options, loading, hasMore, openMenu, loadMore, onSearchChange };
}