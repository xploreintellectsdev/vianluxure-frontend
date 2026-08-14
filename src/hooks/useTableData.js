import { useState, useCallback, useEffect } from 'react';

const useTableData = (apiFn, errorMessage = 'Failed to load data.', extraParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0); // MUI Table is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows]     = useState(0);

  const extraParamsKey = JSON.stringify(extraParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Backend expects 1-indexed page
      const res = await apiFn({ page: page + 1, limit: rowsPerPage, search, ...JSON.parse(extraParamsKey) });
      setData(res.data || []); // data key from our backend response
      setTotalRows(res.meta?.total ?? (res.data?.length || 0));
    } catch (err) {
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, [apiFn, page, rowsPerPage, search, extraParamsKey, errorMessage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = useCallback(() => setPage(0), []);
  const handlePageChange = (_, newPage) => { if (!loading) setPage(newPage); };
  const handleRowsPerPageChange = (e) => {
    if (!loading) { 
      setRowsPerPage(parseInt(e.target.value, 10)); 
      setPage(0); 
    }
  };

  return {
    data, loading, search, setSearch,
    page, rowsPerPage, totalRows,
    fetchData, handleSearch,
    handlePageChange, handleRowsPerPageChange,
  };
};

export default useTableData;