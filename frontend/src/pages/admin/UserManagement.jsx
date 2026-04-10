import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

const ROLE_COLORS = {
  USER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  TECHNICIAN: 'bg-green-100 text-green-800',
  MANAGER: 'bg-orange-100 text-orange-800',
};

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-slate-100 text-slate-800',
};

export const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState(''); // 'suspend' or 'activate'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (user, actionType) => {
    setSelectedUser(user);
    setAction(actionType);
    setStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser || !action) return;

    try {
      setActionLoading(true);
      if (action === 'suspend') {
        await adminService.suspendUser(selectedUser.user_id);
        toast.success(`${selectedUser.name} has been suspended`);
      } else if (action === 'activate') {
        await adminService.activateUser(selectedUser.user_id);
        toast.success(`${selectedUser.name} has been activated`);
      }
      setStatusDialog(false);
      setSelectedUser(null);
      setAction('');
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Layout pageTitle="User Management">
        <LoadingSpinner />
      </Layout>
    );
  }

  const activeCount = users.filter(u => u.active).length;
  const inactiveCount = users.filter(u => !u.active).length;

  return (
    <Layout pageTitle="User Management">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600">Total Users</div>
              <div className="text-3xl font-bold text-slate-900">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Active Users
              </div>
              <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AlertCircle className="h-4 w-4 text-slate-600" />
                Inactive Users
              </div>
              <div className="text-3xl font-bold text-slate-600">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-indigo-900">User Roles Are Protected</h3>
              <p className="text-sm text-indigo-800 mt-1">
                Admin users cannot change user roles through the management interface. Roles are assigned during registration and can only be modified through backend configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.picture} alt={user.name} />
                            <AvatarFallback className="bg-[#1e3a5f] text-white text-sm">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[user.active ? 'active' : 'inactive']}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {user.created_at ? formatDate(user.created_at) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {user.active ? (
                            <Button
                              onClick={() => openStatusDialog(user, 'suspend')}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              onClick={() => openStatusDialog(user, 'activate')}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No users found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={statusDialog}
          onOpenChange={setStatusDialog}
          title={action === 'suspend' ? 'Suspend User' : 'Activate User'}
          description={
            action === 'suspend'
              ? `Are you sure you want to suspend ${selectedUser?.name}? They will no longer be able to access the system.`
              : `Are you sure you want to activate ${selectedUser?.name}? They will regain access to the system.`
          }
          onConfirm={confirmStatusChange}
          confirmText={actionLoading ? 'Processing...' : (action === 'suspend' ? 'Suspend User' : 'Activate User')}
          confirmButtonClass={action === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
          disabled={actionLoading}
        />
      </div>
    </Layout>
  );
};