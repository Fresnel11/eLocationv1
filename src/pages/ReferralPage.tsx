import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Share2, Gift, Users, Star, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { InviteFriendsModal } from '../components/ui/InviteFriendsModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
}

interface LoyaltyData {
  total: number;
  history: Array<{
    id: string;
    type: string;
    points: number;
    description: string;
    createdAt: string;
  }>;
}

export const ReferralPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, completedReferrals: 0, totalRewards: 0 });
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({ total: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [codeRes, statsRes, loyaltyRes] = await Promise.all([
        api.get('/referrals/my-code'),
        api.get('/referrals/stats'),
        api.get('/referrals/loyalty-points')
      ]);
      
      setReferralCode(codeRes.data.referralCode);
      setStats(statsRes.data);
      setLoyaltyData(loyaltyRes.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    success('Code copié !', 'Le code de parrainage a été copié dans le presse-papiers');
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez eLocation avec mon code de parrainage',
        text: `Utilisez mon code ${referralCode} pour vous inscrire sur eLocation et bénéficier d'avantages !`,
        url: window.location.origin
      });
    } else {
      copyCode();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Parrainage & Fidélité</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Mon code de parrainage */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Gift className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Mon code de parrainage</h2>
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">{referralCode}</div>
                <p className="text-sm text-gray-600">Partagez ce code avec vos amis</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={copyCode} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copier
                </Button>
                <Button onClick={shareCode} size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Partager
                </Button>
                <Button onClick={() => setShowInviteModal(true)} variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Inviter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</div>
              <div className="text-xs text-gray-600">Parrainages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{loyaltyData.total}</div>
              <div className="text-xs text-gray-600">Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalRewards.toLocaleString()}</div>
              <div className="text-xs text-gray-600">FCFA gagnés</div>
            </CardContent>
          </Card>
        </div>

        {/* Comment ça marche */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Comment ça marche ?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Partagez votre code</p>
                  <p className="text-sm text-gray-600">Invitez vos amis avec votre code unique</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Ils s'inscrivent</p>
                  <p className="text-sm text-gray-600">Vos amis utilisent votre code lors de l'inscription</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Vous gagnez des récompenses</p>
                  <p className="text-sm text-gray-600">Recevez 5000 FCFA + 100 points par parrainage réussi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique des points */}
        {loyaltyData.history.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Historique des points</h3>
              <div className="space-y-3">
                {loyaltyData.history.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-green-600 font-bold">+{item.points}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        referralCode={referralCode}
      />
    </div>
  );
};