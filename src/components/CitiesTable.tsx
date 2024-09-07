import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TextField,
  Typography, Box, CircularProgress
} from '@mui/material';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { Search } from '@mui/icons-material';
import { Cloud, CloudQueue } from '@mui/icons-material';
import './CitiesTable.css'; 

interface City {
  name: string;
  country_code: string;
  timezone: string;
  modification_date: string;
  label_en: string;
  coordinates: [number, number];
  lon: number;
  lat: number;
}

const WeatherLoader: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <CloudQueue sx={{ fontSize: 40, color: 'grey.500', animation: 'spin 2s linear infinite' }} />
      <Typography variant="body2" color="textSecondary">Loading...</Typography>
    </Box>
  );
};

const CitiesTable: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [page, setPage] = useState(0); 
  const [isLoading, setIsLoading] = useState(false); 
  const [hasMore, setHasMore] = useState(true); 

  const containerRef = useRef<HTMLDivElement | null>(null); 
  const navigate = useNavigate(); 


  const fetchCities = async (append = false) => {
    if (isLoading || !hasMore) return; 
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&rows=15&start=${page * 15}`
      );
      const citiesData = response.data.records.map((record: any) => ({
        name: record.fields.name,
        country_code: record.fields.country_code,
        timezone: record.fields.timezone,
        modification_date: record.fields.modification_date,
        label_en: record.fields.label_en,
        coordinates: record.fields.coordinates,
        lon: record.fields.lon,
        lat: record.fields.lat,
      }));

      if (append) {
        setCities(prevCities => [...prevCities, ...citiesData]);
        setFilteredCities(prevCities => [...prevCities, ...citiesData]);
      } else {
        setCities(citiesData);
        setFilteredCities(citiesData);
      }

      if (citiesData.length < 15) setHasMore(false);

    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities(true); 
  }, [page]);

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCities(filtered);
  }, 300);

  const sortCities = (key: string) => {
    let sortedCities = [...filteredCities];
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      sortedCities.reverse();
      setSortConfig({ key, direction: 'desc' });
    } else {
      sortedCities.sort((a, b) =>
        a[key as keyof City] > b[key as keyof City] ? 1 : -1
      );
      setSortConfig({ key, direction: 'asc' });
    }
    setFilteredCities(sortedCities);
  };

  const handleCityClick = (city: City) => {
    navigate(`/weather/${city.name}`);
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading && hasMore) {
        setPage(prevPage => prevPage + 1); // Load the next 15 cities
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading, hasMore]);

  return (
    <Box className="cities-container" sx={{ p: 2, fontFamily: 'Poppins, sans-serif',  }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center" 
        sx={{
          background: 'linear-gradient(135deg, #f39c12, #8e44ad)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em',
          transition: 'transform 0.4s ease-in-out, color 0.4s ease-in-out', 
          padding: '10px 0',
          '&:hover': {
            transform: 'scale(1.05)',
            color: '#f1c40f', 
          },
          '@media (max-width: 600px)': {
            fontSize: '1.5rem',
          }
        }}
      >
        City Search
      </Typography>

      
      <Box display="flex" alignItems="center" justifyContent="center" mb={3} sx={{ width: '100%' }}>
        <TextField
          label="Search for a city..."
          onChange={handleSearch}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: <Search />,
          }}
          sx={{ maxWidth: '100%', boxShadow: 1, borderRadius: 2 }}
        />
      </Box>

      <Box ref={containerRef} overflow="auto" height="800px"> 
        <Table sx={{ minWidth: '100%', boxShadow: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => sortCities('name')}><strong>City Name</strong></TableCell>
              <TableCell onClick={() => sortCities('country_code')}><strong>Country Code</strong></TableCell>
              <TableCell onClick={() => sortCities('timezone')}><strong>Timezone</strong></TableCell>
              <TableCell onClick={() => sortCities('modification_date')}><strong>Modification Date</strong></TableCell>
              <TableCell onClick={() => sortCities('label_en')}><strong>Label</strong></TableCell>
              <TableCell onClick={() => sortCities('coordinates')}><strong>Coordinates</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCities.map(city => (
              <TableRow
                key={city.name}
                onClick={() => handleCityClick(city)}
                hover
                className="city-row"
              >
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.country_code}</TableCell>
                <TableCell>{city.timezone}</TableCell>
                <TableCell>{new Date(city.modification_date).toLocaleDateString()}</TableCell>
                <TableCell>{city.label_en}</TableCell>
                <TableCell>{`[${city.coordinates[0]}, ${city.coordinates[1]}]`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {isLoading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <WeatherLoader />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CitiesTable;
