'use client';

import Layout from '@/components/Layout';
import { 
  Camera, 
  Database, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for demonstration
const statsData = [
  { id: 1, name: 'Total Observations', value: '12,847', change: '+12%', icon: Camera, color: 'bg-blue-500' },
  { id: 2, name: 'Species Recorded', value: '1,247', change: '+8%', icon: Database, color: 'bg-green-500' },
  { id: 3, name: 'Active Projects', value: '23', change: '+2%', icon: MapPin, color: 'bg-purple-500' },
  { id: 4, name: 'Endangered Species', value: '89', change: '-3%', icon: AlertTriangle, color: 'bg-red-500' },
];

const monthlyData = [
  { month: 'Jan', observations: 850, species: 120 },
  { month: 'Feb', observations: 920, species: 135 },
  { month: 'Mar', observations: 1100, species: 145 },
  { month: 'Apr', observations: 1250, species: 160 },
  { month: 'May', observations: 1350, species: 170 },
  { month: 'Jun', observations: 1420, species: 185 },
];

const conservationStatusData = [
  { name: 'Least Concern', value: 65, color: '#10B981' },
  { name: 'Near Threatened', value: 15, color: '#F59E0B' },
  { name: 'Vulnerable', value: 12, color: '#EF4444' },
  { name: 'Endangered', value: 6, color: '#DC2626' },
  { name: 'Critically Endangered', value: 2, color: '#7F1D1D' },
];

const recentObservations = [
  { id: 1, species: 'Panthera leo', common: 'African Lion', location: 'Serengeti NP', time: '2 hours ago', confidence: 0.95 },
  { id: 2, species: 'Loxodonta africana', common: 'African Elephant', location: 'Amboseli NP', time: '4 hours ago', confidence: 0.89 },
  { id: 3, species: 'Diceros bicornis', common: 'Black Rhinoceros', location: 'Ngorongoro Crater', time: '6 hours ago', confidence: 0.92 },
  { id: 4, species: 'Acinonyx jubatus', common: 'Cheetah', location: 'Maasai Mara', time: '8 hours ago', confidence: 0.87 },
];

const activeAlerts = [
  { id: 1, type: 'Population Decline', species: 'Snow Leopard', severity: 'high', location: 'Himalayas' },
  { id: 2, type: 'Habitat Loss', species: 'Orangutan', severity: 'critical', location: 'Borneo' },
  { id: 3, type: 'Unusual Behavior', species: 'Polar Bear', severity: 'medium', location: 'Arctic' },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Conservation Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor wildlife populations, track conservation efforts, and analyze biodiversity trends
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${item.color} p-3 rounded-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="observations" fill="#3B82F6" name="Observations" />
                  <Bar dataKey="species" fill="#10B981" name="Species" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conservation Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conservation Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conservationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conservationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Observations */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Observations</h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentObservations.map((observation) => (
                    <li key={observation.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Eye className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {observation.common}
                          </p>
                          <p className="text-sm text-gray-500 italic">
                            {observation.species}
                          </p>
                          <p className="text-sm text-gray-500">
                            {observation.location} • {observation.time}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            observation.confidence > 0.9 ? 'bg-green-100 text-green-800' : 
                            observation.confidence > 0.8 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(observation.confidence * 100)}% confident
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Active Conservation Alerts</h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {activeAlerts.map((alert) => (
                    <li key={alert.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            alert.severity === 'critical' ? 'bg-red-100' :
                            alert.severity === 'high' ? 'bg-orange-100' :
                            'bg-yellow-100'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'critical' ? 'text-red-600' :
                              alert.severity === 'high' ? 'text-orange-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {alert.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {alert.species} • {alert.location}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
