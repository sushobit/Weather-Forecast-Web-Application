import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { CloudQueue, WbSunny, Opacity, WindPower, AccessTime, Umbrella } from '@mui/icons-material';
import './WeatherPage.css';

interface WeatherData {
  temperature: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  icon: string;
  sunrise: number;
  sunset: number;
  precipitation: number; 
}

const DelayedLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    isLoading ? (
      <Box display="flex" flexDirection="column" alignItems="center">
        <CloudQueue sx={{ fontSize: 60, color: 'grey.500', animation: 'spin 1.5s linear infinite' }} />
        <Typography variant="body2" color="textSecondary">Loading...</Typography>
      </Box>
    ) : null
  );
};

const WeatherPage: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=bebd126d8b2166a5d0ccb126b6c6afa4&units=metric`);
      const data = response.data;
      setWeather({
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        icon: data.weather[0].icon,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        precipitation: data.rain ? data.rain['1h'] || 0 : (data.snow ? data.snow['1h'] || 0 : 0)
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const getBackgroundClass = (description: string) => {
    if (description.includes('clear')) return 'sunny';
    if (description.includes('cloud')) return 'cloudy';
    if (description.includes('rain') || description.includes('snow')) return 'rainy';
    return 'default-weather';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box className={`weather-container ${weather ? getBackgroundClass(weather.description) : ''}`}>
      <DelayedLoader isLoading={loading} />

      {!loading && weather && (
        <Card sx={{ fontFamily: 'Poppins, sans-serif', width: '90%', maxWidth: 600, margin: '20px auto', boxShadow: '22px 22px 44px #acacac, -22px -22px 44px #ffffff;', backgroundColor: '#ffffff49', backdropFilter: 'blur(10px)', borderRadius: 8, padding: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" 
              sx={{
                background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%)', 
                WebkitBackgroundClip: 'text', 
                fontWeight: 'bold', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              Weather in <strong>{city}</strong>
            </Typography>
            <Typography variant="h5" align="center" color="text.primary">
              <strong>{weather.temperature} </strong>°C
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" sx={{textDecoration:'underline'}}>
              {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
            </Typography>

            <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <Opacity sx={{ fontSize: 24, mr: 1, color: 'blue' }} />
                <Typography variant="body1">Humidity: {weather.humidity}%</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <WindPower sx={{ fontSize: 24, mr: 1, color: 'green' }} />
                <Typography variant="body1">Wind Speed: {weather.windSpeed} m/s</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <CloudQueue sx={{ fontSize: 24, mr: 1, color: 'grey' }} />
                <Typography variant="body1">Pressure: {weather.pressure} hPa</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Umbrella sx={{ fontSize: 24, mr: 1, color: 'purple' }} />
                <Typography variant="body1">Precipitation: {weather.precipitation} mm</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTime sx={{ fontSize: 24, mr: 1, color: 'orange' }} />
                <Typography variant="body1">Sunrise: {formatTime(weather.sunrise)}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <AccessTime sx={{ fontSize: 24, mr: 1, color: 'purple' }} />
                <Typography variant="body1">Sunset: {formatTime(weather.sunset)}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WeatherPage;
