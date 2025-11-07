import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'line' | 'doughnut';
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ data, title, type }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3 sm:space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-16 sm:w-20 text-xs sm:text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 mx-2 sm:mx-3">
                <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full ${
                      item.color || 'bg-blue-500'
                    }`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-8 sm:w-12 text-xs sm:text-sm font-medium text-gray-900 text-right">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'doughnut') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-col sm:flex-row items-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 sm:mb-0 sm:mr-6">
            <div className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden">
              {/* Segments du donut */}
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-gray-900">{total}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`} />
                  <span className="text-xs sm:text-sm text-gray-600 truncate">{item.label}</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-32 sm:h-48 flex items-end space-x-1 sm:space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full ${item.color || 'bg-blue-500'} rounded-t`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};