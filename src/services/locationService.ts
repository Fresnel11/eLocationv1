export class LocationService {
  private static readonly BENIN_CITIES = [
    'Cotonou', 'Porto-Novo', 'Calavi', 'Abomey-Calavi', 'Parakou', 
    'Bohicon', 'Ouidah', 'Djougou', 'Kandi', 'Abomey'
  ];

  // Détection automatique de la ville de l'utilisateur
  static async detectUserCity(): Promise<string | null> {
    try {
      // 1. Vérifier le localStorage
      const savedCity = localStorage.getItem('userCity');
      if (savedCity && this.BENIN_CITIES.includes(savedCity)) {
        return savedCity;
      }

      // 2. Géolocalisation HTML5 (si permission accordée)
      const position = await this.getCurrentPosition();
      if (position) {
        const city = await this.getCityFromCoordinates(position.latitude, position.longitude);
        if (city) {
          localStorage.setItem('userCity', city);
          return city;
        }
      }

      // 3. Fallback: IP géolocalisation (à implémenter avec un service externe)
      // const ipCity = await this.getCityFromIP();
      // if (ipCity) return ipCity;

      return null;
    } catch (error) {
      console.log('Détection de localisation échouée:', error);
      return null;
    }
  }

  // Géolocalisation HTML5
  private static getCurrentPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  // Conversion coordonnées -> ville (approximative pour le Bénin)
  private static async getCityFromCoordinates(lat: number, lng: number): Promise<string | null> {
    // Coordonnées approximatives des principales villes du Bénin
    const cityCoordinates = {
      'Cotonou': { lat: 6.3654, lng: 2.4183 },
      'Porto-Novo': { lat: 6.4969, lng: 2.6283 },
      'Calavi': { lat: 6.4500, lng: 2.3500 },
      'Abomey-Calavi': { lat: 6.4500, lng: 2.3500 },
      'Parakou': { lat: 9.3372, lng: 2.6303 },
      'Bohicon': { lat: 7.1781, lng: 2.0667 },
      'Ouidah': { lat: 6.3636, lng: 2.0852 }
    };

    let closestCity = null;
    let minDistance = Infinity;

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      const distance = this.calculateDistance(lat, lng, coords.lat, coords.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // Si la distance est raisonnable (moins de 50km), retourner la ville
    return minDistance < 50 ? closestCity : null;
  }

  // Calcul de distance entre deux points (formule Haversine)
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // Sauvegarder la ville de l'utilisateur
  static saveUserCity(city: string): void {
    if (this.BENIN_CITIES.includes(city)) {
      localStorage.setItem('userCity', city);
    }
  }

  // Récupérer la ville sauvegardée
  static getSavedUserCity(): string | null {
    return localStorage.getItem('userCity');
  }

  // Effacer la ville sauvegardée
  static clearUserCity(): void {
    localStorage.removeItem('userCity');
  }
}