import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const TMDB_API_KEY = '31fbd8554bb7a541309ed503a1c2d56d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const BASE_URL = 'https://learnwithwordy.com';

async function fetchMovies(endpoint) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.results || [];
}

async function generateSitemap() {
  try {
    // Fetch popular movies and TV shows
    const movies = await fetchMovies('/movie/popular');
    const tvShows = await fetchMovies('/tv/popular');
    const trending = await fetchMovies('/trending/all/week');

    // Create sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Movies -->
  ${movies.map(movie => `
  <url>
    <loc>${BASE_URL}/movie/${movie.id}</loc>
    <lastmod>${movie.release_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/words/${movie.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

  <!-- TV Shows -->
  ${tvShows.map(show => `
  <url>
    <loc>${BASE_URL}/series/${show.id}</loc>
    <lastmod>${show.first_air_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/words/${show.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

  <!-- Trending -->
  ${trending.map(item => `
  <url>
    <loc>${BASE_URL}/${item.media_type === 'movie' ? 'movie' : 'series'}/${item.id}</loc>
    <lastmod>${item.release_date || item.first_air_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/words/${item.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write sitemap to file
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();