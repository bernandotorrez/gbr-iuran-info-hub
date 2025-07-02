
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { AlertCircle, Shield } from 'lucide-react';

interface SecurityRouteProps {
  children: React.ReactNode;
}

const SecurityRoute: React.FC<SecurityRouteProps> = ({ children }) => {
  const { hasSecurityAccess, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!hasSecurityAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
        <p className="text-gray-600 mb-4">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800">
              Halaman ini hanya dapat diakses oleh pengguna dengan role Admin atau Security.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecurityRoute;
