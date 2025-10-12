'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Train, AlertTriangle, BarChart3, Shield } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  activeTrips: number;
  totalGroups: number;
  totalAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface User {
  id: string;
  display_name: string;
  email: string;
  phone: string;
  reputation_score: number;
  trips_completed: number;
  on_time_payment_rate: number;
  is_community_admin: boolean;
  created_at: string;
  last_active: string;
}

interface Trip {
  id: string;
  date: string;
  status: string;
  train: {
    departure_time: string;
    origin: string;
    destination: string;
  };
  groups: Array<{
    id: string;
    group_number: number;
    steward_id: string;
    memberships: Array<{
      user: {
        display_name: string;
      };
    }>;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load admin statistics
      const statsResponse = await fetch('/api/admin/stats');
      if (!statsResponse.ok) throw new Error('Failed to load stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Load users
      const usersResponse = await fetch('/api/admin/users');
      if (!usersResponse.ok) throw new Error('Failed to load users');
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Load recent trips
      const tripsResponse = await fetch('/api/admin/trips');
      if (!tripsResponse.ok) throw new Error('Failed to load trips');
      const tripsData = await tripsResponse.json();
      setTrips(tripsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSystemHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className='bg-green-100 text-green-800'>Healthy</Badge>;
      case 'warning':
        return <Badge className='bg-yellow-100 text-yellow-800'>Warning</Badge>;
      case 'critical':
        return <Badge className='bg-red-100 text-red-800'>Critical</Badge>;
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='text-red-800 flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-red-700 mb-4'>{error}</p>
            <Button onClick={loadAdminData} variant='outline'>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
          <p className='text-gray-600 mt-1'>
            Monitor and manage the GO Train Group Pass system
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Shield className='h-5 w-5 text-blue-600' />
          <span className='text-sm text-gray-600'>Admin Access</span>
        </div>
      </div>

      {/* System Health */}
      {stats && (
        <Card className='border-blue-200 bg-blue-50'>
          <CardHeader>
            <CardTitle className='text-blue-800 flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4'>
              <div
                className={`text-2xl font-bold ${getSystemHealthColor(stats.systemHealth)}`}
              >
                {stats.systemHealth.toUpperCase()}
              </div>
              {getSystemHealthBadge(stats.systemHealth)}
              <div className='text-sm text-gray-600'>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalUsers}</div>
              <p className='text-xs text-muted-foreground'>
                {stats.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Trips</CardTitle>
              <Train className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalTrips}</div>
              <p className='text-xs text-muted-foreground'>
                {stats.activeTrips} active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Groups Formed
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalGroups}</div>
              <p className='text-xs text-muted-foreground'>Groups created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Alerts Sent</CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalAlerts}</div>
              <p className='text-xs text-muted-foreground'>
                Fare inspection alerts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Views */}
      <Tabs defaultValue='users' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='trips'>Trips</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {users.map(user => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-600 font-medium'>
                          {user.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className='font-medium'>{user.display_name}</div>
                        <div className='text-sm text-gray-600'>
                          {user.email}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Reputation: {user.reputation_score} | Trips:{' '}
                          {user.trips_completed} | Payment Rate:{' '}
                          {(user.on_time_payment_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {user.is_community_admin && (
                        <Badge variant='secondary'>Admin</Badge>
                      )}
                      <Button size='sm' variant='outline'>
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='trips' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Trip Management</CardTitle>
              <CardDescription>
                Monitor trips and group formations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {trips.map(trip => (
                  <div key={trip.id} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='font-medium'>
                        {trip.train.origin} → {trip.train.destination}
                      </div>
                      <Badge
                        variant={
                          trip.status === 'scheduled' ? 'default' : 'secondary'
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <div className='text-sm text-gray-600 mb-2'>
                      {trip.date} at {trip.train.departure_time}
                    </div>
                    <div className='text-sm'>
                      {trip.groups.length} groups formed
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system parameters and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <div className='font-medium'>Database Maintenance</div>
                  <div className='text-sm text-gray-600'>
                    Clean up old data and optimize performance
                  </div>
                </div>
                <Button variant='outline'>Run Maintenance</Button>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <div className='font-medium'>Security Audit</div>
                  <div className='text-sm text-gray-600'>
                    Check for security vulnerabilities
                  </div>
                </div>
                <Button variant='outline'>Run Audit</Button>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <div className='font-medium'>System Logs</div>
                  <div className='text-sm text-gray-600'>
                    View system and security logs
                  </div>
                </div>
                <Button variant='outline'>View Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
