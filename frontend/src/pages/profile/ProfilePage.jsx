import React, { useContext } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout pageTitle="My Profile">
      <div className="max-w-2xl">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-[#1e3a5f] text-white text-2xl">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{user?.name}</h3>
                <p className="text-sm text-slate-600">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                This account is managed through Google OAuth. Contact your administrator for role changes or account modifications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
