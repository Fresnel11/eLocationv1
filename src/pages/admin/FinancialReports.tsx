import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, PieChart, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface FinancialOverview {
  totalRevenue: number;
  totalCommissions: number;
  totalBookings: number;
  averageBookingValue: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  topCategories: Array<{
    category: string;
    revenue: number;
    bookings: number;
  }>;
}

interface Commission {
  id: string;
  bookingId: string;
  amount: number;
  rate: number;
  status: 'paid' | 'pending';
  createdAt: string;
  booking: {
    ad: {
      title: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
    totalPrice: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const FinancialReports: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6months');
  const { error } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      const [overviewRes, chartRes, commissionsRes] = await Promise.all([
        api.get('/admin/financial/overview'),
        api.get(`/admin/financial/revenue-chart?period=${period}`),
        api.get('/admin/financial/commissions?limit=10')
      ]);

      setOverview(overviewRes.data);
      setRevenueChart(chartRes.data);
      setCommissions(commissionsRes.data.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les données financières');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Rapports Financiers</h1>
        </div>
        <Select
          value={period}
          onChange={setPeriod}
          options={[
            { value: '3months', label: '3 derniers mois' },
            { value: '6months', label: '6 derniers mois' },
            { value: '12months', label: '12 derniers mois' }
          ]}
        />
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commissions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalCommissions)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Réservations</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.averageBookingValue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <PieChart className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des revenus */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des revenus</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenus" />
            <Line type="monotone" dataKey="commissions" stroke="#10B981" strokeWidth={2} name="Commissions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Méthodes de paiement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={overview.paymentMethods}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="amount"
                nameKey="method"
              >
                {overview.paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {overview.paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{method.method}</span>
                </div>
                <span className="font-medium">{formatCurrency(method.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top catégories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top catégories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overview.topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commissions récentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Commissions récentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.booking.ad.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.booking.ad.user.firstName} {commission.booking.ad.user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(commission.booking.totalPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(commission.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      commission.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commission.status === 'paid' ? 'Payée' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(commission.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};