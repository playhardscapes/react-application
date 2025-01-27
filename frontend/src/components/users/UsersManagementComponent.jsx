import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, User, Shield, UserPlus, Edit, Trash2, Filter 
} from 'lucide-react';
import UserInvitation from '@/components/users/UserInvitation';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const UsersManagementComponent = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/users/roles', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      if (!rolesResponse.ok) {
        const errorData = await rolesResponse.json();
        throw new Error(errorData.message || 'Failed to fetch roles');
      }

      const usersData = await usersResponse.json();
      const rolesData = await rolesResponse.json();

      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const checkResponse = await fetch(`/api/users/${userId}/check`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        throw new Error(errorData.error || 'Cannot delete user due to existing references');
      }

      const deleteResponse = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading users...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <p className="text-gray-600">Manage system users and their permissions.</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="w-full">
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
              <TabsTrigger value="roles" className="flex-1">Roles & Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <UserInvitation onUserInvited={fetchData} />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {user.role}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/users-management/edit/${user.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="roles" className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/users-management/roles/new')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              <div className="space-y-4">
                {roles.map(role => (
                  <div 
                    key={role.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/users-management/roles/edit/${role.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                  </div>
                ))}

                {roles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No roles found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default UsersManagementComponent;