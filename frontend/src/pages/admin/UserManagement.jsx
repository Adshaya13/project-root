import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

const ROLE_COLORS = {
  USER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  TECHNICIAN: 'bg-green-100 text-green-800',
  MANAGER: 'bg-orange-100 text-orange-800',
};

export const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roleChangeDialog, setRoleChangeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

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

  const handleRoleChange = (user, role) => {
    setSelectedUser(user);
    setNewRole(role);
    setRoleChangeDialog(true);
  };

  const confirmRoleChange = async () => {
    try {
      await adminService.updateRole(selectedUser.user_id, newRole);
      toast.success('Role updated successfully');
      setRoleChangeDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
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

  return (
    <Layout pageTitle="User Management">
      <div className="space-y-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>{users.length} Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id} className="border-b border-slate-100 hover:bg-slate-50">
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-4">
                        <Select value={user.role} onValueChange={(value) => handleRoleChange(user, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="TECHNICIAN">TECHNICIAN</SelectItem>
                            <SelectItem value="MANAGER">MANAGER</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={roleChangeDialog}
          onOpenChange={setRoleChangeDialog}
          title="Change User Role"
          description={`Are you sure you want to change ${selectedUser?.name}'s role from ${selectedUser?.role} to ${newRole}?`}
          onConfirm={confirmRoleChange}
          confirmText="Change Role"
        />
      </div>
    </Layout>
  );
};