import Spinner from './Spinner';

const Table = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </table>
  </div>
);

const TableHead = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
    {children}
  </thead>
);

const TableBody = ({ children, className = '' }) => (
  <tbody className={`bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = '', onClick, hover = true }) => (
  <tr
    onClick={onClick}
    className={`
      ${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </tr>
);

const TableHeader = ({ children, className = '', align = 'left', sortable = false, sorted, onSort }) => (
  <th
    onClick={sortable ? onSort : undefined}
    className={`
      px-4 py-3
      text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider
      text-${align}
      ${sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''}
      ${className}
    `}
  >
    <div className="flex items-center gap-1">
      {children}
      {sortable && (
        <span className="text-gray-400">
          {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
        </span>
      )}
    </div>
  </th>
);

const TableCell = ({ children, className = '', align = 'left' }) => (
  <td
    className={`
      px-4 py-3
      text-sm text-gray-900 dark:text-gray-100
      text-${align}
      ${className}
    `}
  >
    {children}
  </td>
);

const TableEmpty = ({ message = 'No hay datos disponibles', colSpan = 1 }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-12 text-center">
      <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>{message}</p>
      </div>
    </td>
  </tr>
);

const TableLoading = ({ colSpan = 1 }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-12 text-center">
      <div className="flex justify-center">
        <Spinner size="lg" />
      </div>
    </td>
  </tr>
);

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;
Table.Empty = TableEmpty;
Table.Loading = TableLoading;

export default Table;
