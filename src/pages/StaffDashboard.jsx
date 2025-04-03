import React, { useState, useEffect } from 'react';
import { db } from '../component/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PrinterIcon, AlertTriangle, CheckCircle, Clock, Printer, ThermometerIcon, Box } from 'lucide-react';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace single printer state with multiple printers
  const [printers] = useState([
    {
      id: 1,
      name: "HP LaserJet Pro M404n",
      status: "online",
      temperature: "185°C",
      image: "https://in-media.apjonlinecdn.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/2/Z/2Z632A-1_T1680352333.png",
      inkLevels: {
        black: 75,
        cyan: 60,
        magenta: 85,
        yellow: 45
      },
      errorCode: null,
      lastMaintenance: "2023-12-01",
      totalPrints: 12458
    },
    {
      id: 2,
      name: "Epson EcoTank L3250",
      status: "offline",
      temperature: "0°C",
      image: "https://in-media.apjonlinecdn.com/catalog/product/cache/314dec89b3219941707ad62ccc90e585/4/9/499N4A-1_T1720152495.png",
      inkLevels: {
        black: 25,
        cyan: 30,
        magenta: 45,
        yellow: 15
      },
      errorCode: "E001",
      lastMaintenance: "2023-11-15",
      totalPrints: 8742
    },
    {
      id: 3,
      name: "Canon PIXMA G7020",
      status: "online",
      temperature: "175°C",
      image: "https://in-media.apjonlinecdn.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/5/3/53N94C-1_T1705462958.png",
      inkLevels: {
        black: 90,
        cyan: 85,
        magenta: 80,
        yellow: 88
      },
      errorCode: null,
      lastMaintenance: "2023-12-10",
      totalPrints: 5231
    }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('token'));
        const jobsRef = collection(db, 'printJobs');
        const q = query(
          jobsRef, 
          where('hubId', '==', userData.hubId),
          orderBy('submitted_time', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(q);
        const jobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        const stats = jobs.reduce((acc, job) => {
          acc.total++;
          acc[job.status]++;
          return acc;
        }, { total: 0, pending: 0, completed: 0, failed: 0 });

        setStats(stats);
        setRecentJobs(jobs);
        setChartData([
          { name: 'Completed', value: stats.completed },
          { name: 'Pending', value: stats.pending },
          { name: 'Failed', value: stats.failed }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={stats.total} icon={<PrinterIcon />} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="yellow" />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle />} color="green" />
        <StatCard title="Failed" value={stats.failed} icon={<AlertTriangle />} color="red" />
      </div>

      {/* Printers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {printers.map(printer => (
          <div key={printer.id} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{printer.name}</h3>
              <span className={`px-4 py-1 rounded-full text-sm ${printer.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {printer.status.toUpperCase()}
              </span>
            </div>

            {/* Printer Image */}
            <div className="mb-6">
              <img 
                src={printer.image} 
                alt={printer.name}
                className="w-full h-48 object-contain rounded-lg bg-gray-50 p-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Printer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ThermometerIcon className="text-red-600 w-4 h-4" />
                  <span className="text-sm">{printer.temperature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="text-gray-600 w-4 h-4" />
                  <span className="text-sm">{printer.totalPrints.toLocaleString()} prints</span>
                </div>
              </div>

              {/* Ink Levels */}
              <div className="space-y-2">
                {Object.entries(printer.inkLevels).map(([color, level]) => (
                  <div key={color} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{color}</span>
                      <span>{level}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${getInkColor(color)}`}
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {printer.errorCode && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertTriangle size={16} />
                  <span>{getErrorMessage(printer.errorCode)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts and Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Jobs Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{job.customerName}</div>
                  <div className="text-sm text-gray-500">{new Date(job.submitted_time).toLocaleString()}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = "blue" }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Add these helper functions at the bottom before the export
const getInkColor = (color) => {
  switch (color) {
    case 'black': return 'bg-gray-800';
    case 'cyan': return 'bg-cyan-500';
    case 'magenta': return 'bg-pink-500';
    case 'yellow': return 'bg-yellow-500';
    default: return 'bg-blue-500';
  }
};

const getErrorMessage = (code) => {
  const errorMessages = {
    'E001': 'Paper jam detected',
    'E002': 'Out of paper',
    'E003': 'Low toner warning',
    'E004': 'Printer cover is open',
    // Add more error codes as needed
  };
  return errorMessages[code] || 'Unknown error';
};

export default StaffDashboard;
