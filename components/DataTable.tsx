
import React from 'react';
import { SheetRow } from '../types';

interface DataTableProps {
  rows: SheetRow[];
  emptyMessage: string;
}

const DataTable: React.FC<DataTableProps> = ({ rows, emptyMessage }) => {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 italic bg-white rounded-2xl border border-slate-200">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 font-semibold tracking-wider">
          <tr>
            <th className="px-6 py-4">Timestamp</th>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Source</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 text-slate-500 tabular-nums">{row.timestamp}</td>
              <td className="px-6 py-4 font-medium text-slate-900">{row.user}</td>
              <td className="px-6 py-4 text-slate-600">{row.source}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  row.status === 'completed' ? 'bg-green-100 text-green-700' :
                  row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right tabular-nums font-semibold text-slate-900">
                ${row.value.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
