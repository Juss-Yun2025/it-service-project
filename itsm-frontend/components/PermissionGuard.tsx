'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { apiClient, Permission } from '@/lib/api';

interface PermissionGuardProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
  userId?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  fallback = null,
  userId
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        // userId가 제공되지 않으면 localStorage에서 가져오기
        const currentUserId = userId || localStorage.getItem('userId');
        
        if (!currentUserId) {
          setHasPermission(false);
          setLoading(false);
          return;
        }

        const response = await apiClient.checkPermission(currentUserId, resource, action);
        
        if (response.success) {
          setHasPermission(response.data?.hasPermission || false);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error('권한 확인 오류:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [resource, action, userId]);

  if (loading) {
    return <div className="flex justify-center items-center p-4">권한 확인 중...</div>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 역할 기반 접근 제어 컴포넌트
interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
  fallback?: ReactNode;
  userId?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRoles,
  fallback = null,
  userId
}) => {
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const currentUserId = userId || localStorage.getItem('userId');
        
        if (!currentUserId) {
          setHasRole(false);
          setLoading(false);
          return;
        }

        const response = await apiClient.getUserRoles(currentUserId);
        
        if (response.success && response.data) {
          const userRoles = response.data.map(role => role.name);
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
          setHasRole(hasRequiredRole);
        } else {
          setHasRole(false);
        }
      } catch (error) {
        console.error('역할 확인 오류:', error);
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [requiredRoles, userId]);

  if (loading) {
    return <div className="flex justify-center items-center p-4">역할 확인 중...</div>;
  }

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 권한 훅
export const usePermissions = (userId?: string) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const currentUserId = userId || localStorage.getItem('userId');
        
        if (!currentUserId) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        const response = await apiClient.getUserPermissions(currentUserId);
        
        if (response.success && response.data) {
          setPermissions(response.data);
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('권한 조회 오류:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const hasPermission = (resource: string, action: string): boolean => {
    return permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  };

  const hasAnyPermission = (permissions: { resource: string; action: string }[]): boolean => {
    return permissions.some(({ resource, action }) => hasPermission(resource, action));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission
  };
};

// 역할 훅
export const useRoles = (userId?: string) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const currentUserId = userId || localStorage.getItem('userId');
        
        if (!currentUserId) {
          setRoles([]);
          setLoading(false);
          return;
        }

        const response = await apiClient.getUserRoles(currentUserId);
        
        if (response.success && response.data) {
          setRoles(response.data.map(role => role.name));
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error('역할 조회 오류:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [userId]);

  const hasRole = (roleName: string): boolean => {
    return roles.includes(roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole
  };
};