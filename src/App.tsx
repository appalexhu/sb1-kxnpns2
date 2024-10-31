import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';
import Words from './pages/Words';
import Footer from './components/Footer';

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <Helmet>
          <title>Learn English with Netflix, TV Shows, Movies | Wordy</title>
          <meta name="description" content="Improve your English effortlessly by watching your favorite movies with Wordy's real-time subtitle translations and vocabulary insights." />
          
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://learnwithwordy.com/" />
          <meta property="og:title" content="Learn English with Movies – Wordy Language App" />
          <meta property="og:description" content="Join Wordy and improve your English through popular films and TV shows with instant subtitles." />
          <meta property="og:image" content="https://learnwithwordy.com/og-image.jpg" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://learnwithwordy.com/" />
          <meta name="twitter:title" content="Learn English with Movies – Wordy Language App" />
          <meta name="twitter:description" content="Join Wordy and improve your English through popular films and TV shows with instant subtitles." />
          <meta name="twitter:image" content="https://learnwithwordy.com/twitter-image.jpg" />

          <meta name="keywords" content="learn english, language learning app, improve english, english with movies, english subtitles, vocabulary builder" />
          <meta name="author" content="Wordy" />
          <meta name="robots" content="index, follow" />

          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Wordy",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "description": "Improve your English effortlessly by watching your favorite movies with Wordy's real-time subtitle translations and vocabulary insights.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              },
              "featureList": [
                "Real-time subtitle translations",
                "Vocabulary difficulty analysis",
                "Personalized word lists",
                "Multi-language support"
              ]
            })}
          </script>
        </Helmet>
        
        <Navbar />
        <ScrollToTop />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/series/:id" element={<MovieDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/words/:id" element={<Words />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;