import { CityData, CountryData } from '@/src/components/explore';
import { useQuery } from '@tanstack/react-query';

// Mock data for now - will be replaced with real queries when database is set up
const mockCountries: CountryData[] = [
  {
    id: '1',
    name: 'Japan',
    citiesCount: 25,
    localsCount: 150,
  },
  {
    id: '2',
    name: 'France',
    citiesCount: 18,
    localsCount: 120,
  },
  {
    id: '3',
    name: 'Italy',
    citiesCount: 22,
    localsCount: 140,
  },
  {
    id: '4',
    name: 'Spain',
    citiesCount: 15,
    localsCount: 95,
  },
  {
    id: '5',
    name: 'Thailand',
    citiesCount: 20,
    localsCount: 110,
  },
];

const mockCities: CityData[] = [
  {
    id: '1',
    name: 'Tokyo',
    experiencesCount: 45,
    localsCount: 28,
  },
  {
    id: '2',
    name: 'Paris',
    experiencesCount: 38,
    localsCount: 22,
  },
  {
    id: '3',
    name: 'Rome',
    experiencesCount: 42,
    localsCount: 31,
  },
  {
    id: '4',
    name: 'Barcelona',
    experiencesCount: 35,
    localsCount: 19,
  },
  {
    id: '5',
    name: 'Bangkok',
    experiencesCount: 40,
    localsCount: 25,
  },
];

export const useTrendingCountries = () => {
  return useQuery({
    queryKey: ['trending-countries'],
    queryFn: async (): Promise<CountryData[]> => {
      // TODO: Replace with real query when database is set up
      // For now, simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Real query would be something like:
      // const { data, error } = await supabase
      //   .rpc('get_trending_countries')
      //   .limit(10);

      return mockCountries;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useTrendingCities = () => {
  return useQuery({
    queryKey: ['trending-cities'],
    queryFn: async (): Promise<CityData[]> => {
      // TODO: Replace with real query when database is set up
      // For now, simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Real query would be something like:
      // const { data, error } = await supabase
      //   .rpc('get_trending_cities')
      //   .limit(10);

      return mockCities;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};