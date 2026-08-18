import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface GeocodedAddress {
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  landmark?: string;
}

// In-memory cache for search details to avoid redundant API calls
const searchCache = new Map<string, GeocodedAddress>();

export const googleMapsService = {
  // We keep this function so we don't break existing key checking logic
  isKeyConfigured(): boolean {
    return true; // We use free Native / OpenStreetMap Geocoding, so it is always configured!
  },

  async getAutocompleteSuggestions(query: string): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      if (Platform.OS === 'web') {
        return await this.searchNominatim(query);
      } else {
        // Native Expo Geocoder
        try {
          const results = await Location.geocodeAsync(query);
          if (results.length === 0) {
            // Fallback to Nominatim if native returned nothing
            return await this.searchNominatim(query);
          }

          const suggestions: PlaceSuggestion[] = [];
          for (let i = 0; i < Math.min(results.length, 5); i++) {
            const res = results[i];
            const rev = await Location.reverseGeocodeAsync({
              latitude: res.latitude,
              longitude: res.longitude,
            });

            if (rev.length > 0) {
              const addr = rev[0];
              const mainText = addr.name || addr.street || query;
              const secondaryText = [addr.district, addr.city, addr.region, addr.country]
                .filter(Boolean)
                .join(', ');
              const description = [mainText, secondaryText].filter(Boolean).join(', ');
              const placeId = `native-${res.latitude}-${res.longitude}-${i}`;

              // Cache the details for details lookup
              searchCache.set(placeId, {
                addressLine: [addr.streetNumber, addr.street].filter(Boolean).join(', ') || mainText,
                city: addr.city || addr.subregion || '',
                state: addr.region || '',
                postalCode: addr.postalCode || '',
                country: addr.country || 'India',
                latitude: res.latitude,
                longitude: res.longitude,
                landmark: addr.name || '',
              });

              suggestions.push({
                placeId,
                description,
                mainText,
                secondaryText,
              });
            }
          }
          return suggestions;
        } catch (nativeErr) {
          console.warn('Native geocode failed, falling back to Nominatim:', nativeErr);
          return await this.searchNominatim(query);
        }
      }
    } catch (error) {
      console.error('Error fetching places suggestions:', error);
      return [];
    }
  },

  async getPlaceDetails(placeId: string): Promise<GeocodedAddress> {
    // If cached, return immediately
    if (searchCache.has(placeId)) {
      return searchCache.get(placeId)!;
    }

    // Default Fallback Ranchi address
    return {
      addressLine: 'Ahirauliā',
      city: 'Pashchim Champaran',
      state: 'Bihar',
      postalCode: '845452',
      country: 'India',
      latitude: 27.0859,
      longitude: 84.5887,
      landmark: 'Ahirauliā Village',
    };
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress> {
    try {
      if (Platform.OS === 'web') {
        return await this.reverseGeocodeNominatim(latitude, longitude);
      } else {
        // Native Expo Geocoder
        try {
          const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (rev.length === 0) {
            return await this.reverseGeocodeNominatim(latitude, longitude);
          }

          const addr = rev[0];
          const addressLine = [addr.streetNumber, addr.street].filter(Boolean).join(', ') || addr.name || 'GPS Location';
          
          return {
            addressLine,
            city: addr.city || addr.subregion || '',
            state: addr.region || '',
            postalCode: addr.postalCode || '',
            country: addr.country || 'India',
            latitude,
            longitude,
            landmark: addr.name || '',
          };
        } catch (nativeErr) {
          console.warn('Native reverse geocode failed, falling back to Nominatim:', nativeErr);
          return await this.reverseGeocodeNominatim(latitude, longitude);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        addressLine: 'GPS Location Address',
        city: 'Pashchim Champaran',
        state: 'Bihar',
        postalCode: '845452',
        country: 'India',
        latitude,
        longitude,
        landmark: 'GPS Location',
      };
    }
  },

  // Helper: OpenStreetMap Nominatim Search
  async searchNominatim(query: string): Promise<PlaceSuggestion[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&countrycodes=in&limit=5`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AshiyanaBuildingApp/1.0',
      },
    });
    const data = await response.json();

    return data.map((item: any) => {
      const placeId = `osm-${item.place_id}`;
      const address = item.address || {};
      const mainText = address.amenity || address.road || address.suburb || address.city || item.display_name.split(',')[0];
      
      const restOfAddress = item.display_name.split(',').slice(1).map((s: string) => s.trim());
      const secondaryText = restOfAddress.slice(0, 3).join(', ');

      const street = address.road || '';
      const suburb = address.suburb || address.neighbourhood || '';
      const addressLine = [street, suburb].filter(Boolean).join(', ') || mainText;

      // Cache details
      searchCache.set(placeId, {
        addressLine,
        city: address.city || address.town || address.village || address.county || '',
        state: address.state || '',
        postalCode: address.postcode || '',
        country: address.country || 'India',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        landmark: address.amenity || address.shop || address.tourism || '',
      });

      return {
        placeId,
        description: item.display_name,
        mainText,
        secondaryText,
      };
    });
  },

  // Helper: OpenStreetMap Nominatim Reverse Geocoding
  async reverseGeocodeNominatim(latitude: number, longitude: number): Promise<GeocodedAddress> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AshiyanaBuildingApp/1.0',
      },
    });
    const data = await response.json();

    const address = data.address || {};
    const street = address.road || '';
    const suburb = address.suburb || address.neighbourhood || '';
    const addressLine = [street, suburb].filter(Boolean).join(', ') || data.display_name.split(',')[0];

    return {
      addressLine,
      city: address.city || address.town || address.village || address.county || '',
      state: address.state || '',
      postalCode: address.postcode || '',
      country: address.country || 'India',
      latitude,
      longitude,
      landmark: address.amenity || address.shop || address.tourism || '',
    };
  },
};
