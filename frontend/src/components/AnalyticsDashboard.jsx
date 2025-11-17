import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useUser } from '../ContextApi/UserDataContext';

const AnalyticsDashboard = () => {
  const { user } = useUser();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = async (range = timeRange) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const endpoints = [
        `/api/analytics/behavior?timeRange=${range}`,
        `/api/analytics/commands?timeRange=${range}`,
        `/api/analytics/segmentation`,
        `/api/analytics/funnel?timeRange=${range}`,
        `/api/monitoring/revenue?timeRange=${range}`,
        `/api/monitoring/features?timeRange=${range}`
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint =>
          fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      );

      const data = await Promise.all(responses.map(res => res.json()));

      setAnalyticsData({
        behavior: data[0],
        commands: data[1],
        segmentation: data[2],
        funnel: data[3],
        revenue: data[4],
        features: data[5]
      });
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchAnalytics(range);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into user behavior and business metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={() => fetchAnalytics()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.behavior?.eventSummary?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Tracked user interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.behavior?.userEngagement?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Users active in period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData?.revenue?.totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Total revenue generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.revenue?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Trial to paid conversion</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analyticsData?.behavior?.eventSummary?.eventsByType || {}).map(([type, count]) => ({ type, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Features Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData?.behavior?.userEngagement?.featureUsage &&
                    Object.entries(analyticsData.behavior.userEngagement.featureUsage)
                      .sort(([,a], [,b]) => b.usageCount - a.usageCount)
                      .slice(0, 10)
                      .map(([feature, data]) => (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="text-sm">{feature}</span>
                          <Badge variant="secondary">{data.usageCount} uses</Badge>
                        </div>
                      ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Command Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Commands:</span>
                    <Badge variant="outline">{analyticsData?.commands?.commandStats?.totalCommands || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unique Commands:</span>
                    <Badge variant="outline">{analyticsData?.commands?.commandStats?.uniqueCommands || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Commands/User:</span>
                    <Badge variant="outline">{analyticsData?.commands?.commandStats?.averageCommandsPerUser?.toFixed(1) || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Power Users:</span>
                    <Badge variant="outline">{analyticsData?.commands?.userStats?.powerUsers || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Popular Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.commands?.commandStats?.commandsByFrequency || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="command" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(analyticsData?.segmentation?.segments || {}).map(([segment, data]) => ({
                      name: segment,
                      value: data.count,
                      percentage: data.percentage
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analyticsData?.segmentation?.segments || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.funnel?.steps && Object.entries(analyticsData.funnel.steps).map(([step, data]) => (
                  <div key={step} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium capitalize">{step.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm text-gray-500">{data.count} users</p>
                      </div>
                    </div>
                    <Badge variant="outline">{data.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue:</span>
                    <Badge variant="outline">₹{analyticsData?.revenue?.totalRevenue?.toFixed(2) || '0.00'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Plans:</span>
                    <Badge variant="outline">₹{analyticsData?.revenue?.revenueByPlan?.monthly?.toFixed(2) || '0.00'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Yearly Plans:</span>
                    <Badge variant="outline">₹{analyticsData?.revenue?.revenueByPlan?.yearly?.toFixed(2) || '0.00'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Churn Rate:</span>
                    <Badge variant="outline">{analyticsData?.revenue?.churnRate?.toFixed(2) || 0}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analyticsData?.revenue?.paymentMethods || {}).map(([method, amount]) => ({
                        name: method,
                        value: amount
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analyticsData?.revenue?.paymentMethods || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
