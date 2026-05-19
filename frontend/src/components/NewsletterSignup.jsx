import React, { useState } from 'react';
import { subscribeNewsletter } from '../api/emailApi';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const NewsletterSignup = ({ 
  variant = 'inline', // 'inline', 'card', 'popup'
  source = 'footer',
  className = '' 
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    promotions: true,
    newArrivals: true,
    orderUpdates: true,
    recommendations: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await subscribeNewsletter({
        email,
        name,
        preferences,
        source,
      });
      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Stay Updated</h3>
        </div>
        <p className="text-white/80 mb-6">
          Subscribe to our newsletter for exclusive deals, new arrivals, and tech news.
        </p>

        {success ? (
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <span>Thanks for subscribing! Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => togglePreference(key)}
                    className="rounded border-white/30 bg-white/20"
                  />
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-200 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <div className={className}>
      {success ? (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>Thanks for subscribing!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
          </button>
        </form>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default NewsletterSignup;
