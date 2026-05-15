import { Flight, Alert } from '../api/staff';
import { weatherService } from '../services/weatherService';
import { adminApi, Airport } from '../api/admin';

let airportMap: Record<string, Airport> = {};

/**
 * Loads airport metadata to facilitate airport-to-city/coordinate mapping.
 */
const loadAirportData = async () => {
  if (Object.keys(airportMap).length > 0) return;
  try {
    const res = await adminApi.getAllAirports();
    if (res.data) {
      res.data.forEach(airport => {
        airportMap[airport.iataCode] = airport;
      });
    }
  } catch (error) {
    console.error('Failed to load airport data for weather mapping:', error);
  }
};

/**
 * Generates operational alerts based on real-time weather data for given flight routes.
 */
export const generateAlertsFromWeather = async (flightList: Flight[]): Promise<Alert[]> => {
  await loadAirportData();
  
  const newAlerts: Alert[] = [];
  const processedCities = new Set<string>();

  for (const flight of flightList) {
    const iataCodes = [flight.originAirportCode, flight.destinationAirportCode];

    for (const code of iataCodes) {
      // Use airport metadata if available, else fallback to IATA code
      const airport = airportMap[code];
      const cityName = airport?.city || code;
      
      if (processedCities.has(cityName)) continue;
      processedCities.add(cityName);

      try {
        const weather = await weatherService.getCityWeather(cityName);
        let severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';
        let message = '';

        switch (weather.condition) {
          case 'STORM':
            severity = 'CRITICAL';
            message = `Severe thunderstorm warning in ${cityName}. Expected disruptions for flight ${flight.flightNumber}.`;
            break;
          case 'RAIN':
            severity = 'CRITICAL';
            message = `Heavy rain in ${cityName}. Potential taxiing delays for incoming/outgoing flights.`;
            break;
          case 'FOG':
            severity = 'WARNING';
            message = `Low visibility in ${cityName} due to fog. Pilots advised for Category III approach.`;
            break;
          case 'WIND':
            severity = 'WARNING';
            message = `High wind speeds (${weather.windSpeed.toFixed(1)} km/h) in ${cityName}. Crosswind takeoff procedures active.`;
            break;
          default:
            severity = 'INFO';
            message = `Clear skies in ${cityName}. Operations proceeding as scheduled.`;
        }

        newAlerts.push({
          id: `${cityName}-${Date.now()}-${Math.random()}`,
          title: `Weather Update: ${cityName}`,
          message,
          severity,
          city: cityName,
          weatherCondition: weather.condition,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        // Fallback to INFO alert
        newAlerts.push({
          id: `${cityName}-fallback-${Date.now()}`,
          title: `Weather Update: ${cityName}`,
          message: `Current weather data unavailable for ${cityName}. Monitoring status...`,
          severity: 'INFO',
          city: cityName,
          weatherCondition: 'CLEAR',
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  return newAlerts;
};
