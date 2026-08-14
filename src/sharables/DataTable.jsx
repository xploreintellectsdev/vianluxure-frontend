import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, LinearProgress, Skeleton } from '@mui/material';

const DataTable = ({ columns, data, loading, totalRows, page, rowsPerPage, onPageChange, onRowsPerPageChange }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: '18px',
        boxShadow: '0 8px 30px rgba(140, 122, 78, 0.08)',
        border: '1px solid rgba(200, 166, 77, 0.18)',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        width: '100%',
        position: 'relative',
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            height: 2.5,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            bgcolor: 'transparent',
            '& .MuiLinearProgress-bar': { bgcolor: '#C8A64D' },
          }}
        />
      )}
      <div style={{ overflowX: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: 600, borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    bgcolor: '#FAF6F0',
                    fontWeight: 800,
                    fontSize: '0.6875rem',
                    color: '#8C7A4E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderBottom: '1px solid #E9DFC9',
                    boxShadow: 'inset 0 -2px 0 #C8A64D33',
                    py: 2,
                    px: 2.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (!data || data.length === 0) ? (
              Array.from({ length: rowsPerPage || 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.id} sx={{ borderBottom: '1px solid #F3EFE6', py: 1.8, px: 2.5 }}>
                      <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: '#F3EFE6' }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((row, index) => {
                const sno = ((page || 0) * (rowsPerPage || 10)) + index + 1;
                return (
                  <TableRow
                    key={index}
                    sx={{
                      bgcolor: index % 2 === 0 ? '#FFFFFF' : '#FDFCF8',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: '#FBF3DD !important' },
                      '&:last-of-type td': { borderBottom: 'none' },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        sx={{
                          fontSize: '0.84375rem',
                          color: '#2D2B2A',
                          borderBottom: '1px solid #F3EFE6',
                          py: 1.9,
                          px: 2.5,
                        }}
                      >
                        {col.render ? col.render(row, sno) : row[col.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 10, border: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '2.125rem', opacity: 0.35 }}>📭</span>
                    <span style={{ color: '#9A8E7A', fontSize: '0.875rem', fontStyle: 'italic' }}>
                      No records found.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {mounted && onPageChange && (
        <div
          style={{
            borderTop: '1px solid #F0ECE4',
            background: '#FDFCF9',
            paddingLeft: 8,
            paddingRight: 8,
            overflowX: 'auto',
          }}
        >
          <TablePagination
            component="div"
            count={totalRows || 0}
            page={page || 0}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage || 10}
            onRowsPerPageChange={onRowsPerPageChange}
            sx={{
              color: '#5A5243',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#5A5243',
              },
              '.MuiTablePagination-select': { color: '#C8A64D', fontWeight: 700 },
              '.MuiTablePagination-actions button': {
                color: '#8C7A4E',
                '&:hover': { bgcolor: '#FAF6F0' },
                '&.Mui-disabled': { color: '#D8CFC0' },
              },
            }}
          />
        </div>
      )}
    </TableContainer>
  );
};

export default DataTable;