import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const roleRoutes = {
            'Super Admin': '/admin',
            'Admin': '/admin',
            'Opps Team': '/admin',
            'State Head': '/admin',
            'National Head': '/user',
            'Zonal Manager': '/user',
            'Area Manager': '/user',
            'Manager': '/user',
            'User': '/user',
        };

        const redirectPath = roleRoutes[user.role] || '/user';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;