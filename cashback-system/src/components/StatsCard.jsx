export default function StatsCard({ title, value, icon: Icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-500 text-blue-600 dark:text-black',
    green: 'bg-green-50 dark:bg-green-500 text-green-600 dark:text-black',
    purple: 'bg-purple-50 dark:bg-purple-500 text-purple-600 dark:text-black',
    orange: 'bg-orange-50 dark:bg-orange-500 text-orange-600 dark:text-black',
    red: 'bg-red-50 dark:bg-red-500 text-red-600 dark:text-black',
    indigo: 'bg-indigo-50 dark:bg-indigo-500 text-indigo-600 dark:text-black',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        {value}
      </div>
      {trend && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{trend}</p>
      )}
    </div>
  );
}
