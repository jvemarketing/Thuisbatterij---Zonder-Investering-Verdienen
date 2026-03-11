/**
 * Affiliate Tracking Module
 * Handles Everflow affiliate tracking across the site
 */

(function(window) {
  'use strict';

  var AffiliateTracking = {
    // Storage key for localStorage
    STORAGE_KEY: 'everflow_tracking',

    // Everflow parameter names
    PARAMS: ['ef_click_id', 'aff_id', 'pub', 'sub'],

    /**
     * Capture tracking parameters from URL and store them
     */
    captureFromUrl: function() {
      var urlParams = new URLSearchParams(window.location.search);
      var trackingData = {};

      // Capture Everflow parameters
      this.PARAMS.forEach(function(param) {
        var value = urlParams.get(param);
        if (value) {
          trackingData[param] = value;
        }
      });

      // Store in localStorage if any tracking params exist
      if (Object.keys(trackingData).length > 0) {
        this.save(trackingData);
        console.log('Everflow tracking captured:', trackingData);
      }

      return trackingData;
    },

    /**
     * Get tracking data from localStorage
     */
    get: function() {
      try {
        var stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        console.error('Error reading tracking data:', e);
        return {};
      }
    },

    /**
     * Save tracking data to localStorage
     */
    save: function(data) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Error saving tracking data:', e);
      }
    },

    /**
     * Get tracking data from URL or localStorage
     * URL parameters take precedence over stored data
     */
    getTracking: function() {
      var urlData = this.captureFromUrl();
      var storedData = this.get();

      // URL params override stored data
      if (Object.keys(urlData).length > 0) {
        return urlData;
      }

      return storedData;
    },

    /**
     * Append tracking parameters to a URL
     */
    appendToUrl: function(url) {
      var tracking = this.get();

      if (Object.keys(tracking).length === 0) {
        return url;
      }

      var separator = url.indexOf('?') === -1 ? '?' : '&';
      var params = [];

      for (var key in tracking) {
        if (tracking.hasOwnProperty(key)) {
          params.push(key + '=' + encodeURIComponent(tracking[key]));
        }
      }

      return url + separator + params.join('&');
    },

    /**
     * Check if we have tracking data
     */
    hasTracking: function() {
      var tracking = this.get();
      return tracking.ef_click_id ? true : false;
    },

    /**
     * Clear tracking data
     */
    clear: function() {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {
        console.error('Error clearing tracking data:', e);
      }
    }
  };

  // Initialize on page load
  AffiliateTracking.captureFromUrl();

  // Expose to window
  window.AffiliateTracking = AffiliateTracking;

})(window);
