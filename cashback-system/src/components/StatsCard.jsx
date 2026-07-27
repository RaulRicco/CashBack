export default function StatsCard({ title, value, icon: Icon, color = 'blue', trend, customColor }) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/30',
    green: 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-primary-500/30',
    purple: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-purple-500/30',
    orange: 'bg-gradient-to-br from-secondary-400 to-secondary-600 text-white shadow-secondary-500/30',
    red: 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30',
    indigo: 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-indigo-500/30',
  };

  return (
    <div className="card-glass transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div
          className={`p-2.5 rounded-xl shadow-lg ${customColor ? 'text-white' : colorClasses[color]}`}
          style={
            customColor
              ? { background: `linear-gradient(to bottom right, ${customColor}, ${customColor})`, boxShadow: `0 10px 15px -3px ${customColor}4d` }
              : undefined
          }
        >
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
