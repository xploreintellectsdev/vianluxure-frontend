export const getMenuColumns = ({ onToggleStatus } = {}) => [
  { id: "order_no", label: "ORDER", sortable: true },
  { id: "label", label: "LABEL", sortable: true },
  { id: "link", label: "LINK", sortable: true },
  { id: "item_type", label: "TYPE", sortable: true },
  { 
    id: "is_active", 
    label: "STATUS",
    render: (row) => {
      const val = row.is_active;
      const isActive = val === 1 || val === '1' || val === true;
      
      if (onToggleStatus) {
        return (
          <button 
            onClick={() => onToggleStatus(row)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isActive ? 'bg-[#C8A64D]' : 'bg-gray-200'
            }`}
            title={isActive ? 'Click to deactivate' : 'Click to activate'}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        );
      }

      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          isActive 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      );
    }
  }
];
