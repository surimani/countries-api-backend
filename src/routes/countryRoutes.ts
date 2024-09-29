import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import axios from 'axios';
import LRUCache from '../utils/LRUCache';

const router: Router = Router();
const lruCache = new LRUCache(100);
let countriesData: Country[] = [];

interface Country {
  name: string;
  nameOfficial: string;
  cca2: string;
  ccn3: string;
  cca3: string;
  currencies: {};
  population: number;
  region: string;
  capital: [];
  languages: {};
  latlng: number[];
  area: number;
  flag: string;
  timezones: string[];
  flags: {};
  continents: {};
}

const getAllData = async (req: Request, res: Response, next: NextFunction): Promise<Country[]> => {
  console.log("Getting all countries data");
  let countries: Country[] = [];
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    if (countriesData.length === 0) {
      let data = response.data as [];
      countries = response.data.map((country: any) => ({
        name: country.name?.common || '',
        nameOfficial: country.name?.official || '',
        cca2: country.cca2 || '',
        ccn3: country.ccn3 || '',
        cca3: country.cca3 || '',
        currencies: country.currencies || {},
        population: country.population || 0,
        region: country.region || '',
        capital: country.capital || [],
        languages: country.languages || {},
        latlng: country.latlng || [],
        area: country.area || 0,
        flag: country.flag || '',
        timezones: country.timezones || [],
        flags: country.flags || {},
        continents: country.continents || [],
      }));
    }
  } catch (error) {
    console.log(error);
  }
  return countries;
}

// LRU cache middleware
const cacheMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (countriesData.length === 0) {
      countriesData = await getAllData(req, res, next);
    }
    const cacheKey = req.originalUrl;
    if (lruCache.get(cacheKey)) {
      res.json(lruCache.get(cacheKey));
      return;
    }
    next();
  } catch(err) {
    console.log(err);
    next();
  }
};

// Helper function to set cache
const setCache = (key: string, data: any) => {
  lruCache.set(key, data);
};

// GET /countries - Get all countries
router.get('/countries', cacheMiddleware, (req: Request, res: Response) => {
  if (countriesData.length === 0) {
    res.status(404).json({ error: 'No countries have been found.' });
    return;
  }
  setCache(req.originalUrl, countriesData);
  res.json(countriesData);
});

// GET /countries/region/:region - Get all countries by region
router.get('/countries/region/:region', cacheMiddleware, (req: Request, res: Response): void => {
  const region = req.params.region;
  const countriesInRegion = countriesData.filter(c => c.region.toLowerCase() === region.toLowerCase());
  if (countriesInRegion.length === 0) {
    res.status(404).json({ error: 'No countries have been found for the given region query.' });
    return;
  }
  setCache(req.originalUrl, countriesInRegion);
  res.json(countriesInRegion);
});

// GET /countries/search - Get all countries based on the filters/query-string passed
router.get('/countries/search', cacheMiddleware, (req: Request, res: Response): void => {
  const { name, capital, region, timezone } = req.query;
  let filteredCountries = countriesData;
  if (name) {
    filteredCountries = filteredCountries.filter(c =>
      c.name.toLowerCase().includes((name as string).toLowerCase()) ||
      (c.nameOfficial && c.nameOfficial.toLowerCase().includes((name as string).toLowerCase()))
    );
  }
  if (capital) {
    filteredCountries = filteredCountries.filter(c =>
      c.capital && c.capital.some((cap: string) => cap.toLowerCase().includes((capital as string).toLowerCase()))
    );
  }
  if (region) {
    filteredCountries = filteredCountries.filter(c =>
      c.region.toLowerCase() === (region as string).toLowerCase()
    );
  }
  if (timezone) {
    const decodedTimezone: string = decodeURIComponent(timezone as string);
    filteredCountries = filteredCountries.filter((c: Country) => {
        return c.timezones && c.timezones.includes(decodedTimezone)
    });
  }
  if (filteredCountries.length === 0) {
    res.status(404).json({ error: 'No countries have been found for the given search filters.' });
    return;
  }
  setCache(req.originalUrl, filteredCountries);
  res.json(filteredCountries);
});

// GET /countries/:code - Get country information by the country code
router.get('/countries/:code', cacheMiddleware, (req: Request, res: Response): void => {
  const countryCode = req.params.code.toUpperCase();
  const country = countriesData.find(c => c.cca2 === countryCode || c.cca3 === countryCode);
  if (!country) {
    res.status(404).json({ error: `Country could not be found for country code ${countryCode}.` });
    return;
  }
  setCache(req.originalUrl, country);
  res.json(country);
});

export default router;