import React, { useState, useCallback, ReactNode } from 'react';
import type { EstadoSujeto, EstadoDocumento } from '../types';

// --- Controles de Formulario ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    secondary: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 text-white',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>{children}</button>;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input className={`block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${className}`} {...props} />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
export const Select: React.FC<SelectProps> = ({ className, children, ...props }) => (
    <select className={`block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${className}`} {...props}>
        {children}
    </select>
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
export const Label: React.FC<LabelProps> = ({ className, children, ...props }) => (
  <label className={`block text-sm font-medium text-slate-700 mb-1 ${className}`} {...props}>{children}</label>
);

// --- Contenedores y Layout ---
interface CardProps { children: ReactNode; className?: string; title?: string; }
export const Card: React.FC<CardProps> = ({ children, className, title }) => (
  <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
    {title && <h3 className="text-lg font-semibold p-4 border-b border-slate-200">{title}</h3>}
    <div className="p-4">{children}</div>
  </div>
);

// --- Componentes Específicos ---
interface StatusBadgeProps { status: EstadoSujeto | EstadoDocumento; }
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColors: Record<string, string> = {
    'Activo': 'bg-green-100 text-green-800',
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Baja': 'bg-red-100 text-red-800',
    'Aprobado': 'bg-green-100 text-green-800',
    'Pendiente de Revisión': 'bg-yellow-100 text-yellow-800',
    'Rechazado': 'bg-red-100 text-red-800',
    'Caducado': 'bg-orange-100 text-orange-800',
  };
  return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-slate-100 text-slate-800'}`}>{status}</span>;
};

interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; }
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

interface FileDropzoneProps { onFileDrop: (file: File) => void; }
export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileDrop }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [onFileDrop]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileDrop(e.target.files[0]);
        }
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex justify-center items-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-orange-400'}`}
        >
            <input type="file" className="hidden" onChange={handleFileChange} id="file-upload" />
            <label htmlFor="file-upload" className="text-center text-slate-500 cursor-pointer">
                <p>Arrastra y suelta un archivo aquí</p>
                <p className="text-sm">o <span className="font-semibold text-orange-600">haz clic para seleccionar</span></p>
            </label>
        </div>
    );
};

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => ReactNode;
}
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}
// FIX: Changed from a const arrow function to a function declaration. This is the standard way to define generic React components in TypeScript, allowing special props like `key` to be used without causing type errors.
export function DataTable<T extends { id: string }>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={String(col.accessor)} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-slate-500">No hay datos disponibles.</td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={`${item.id}-${String(col.accessor)}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {col.render ? col.render(item) : (item[col.accessor] as unknown as string)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface EmptyStateProps {
    title: string;
    message: string;
    action?: ReactNode;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action }) => (
    <Card className="text-center">
        <div className="flex flex-col items-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <p className="mt-2 text-slate-500">{message}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    </Card>
);