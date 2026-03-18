/**
 * Form Validation Module
 * Shared field-level validation for email and phone with API verification.
 */

(function (window) {
  'use strict';

  var FormValidation = {

    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /**
     * Attach blur-based email validation to an input.
     *
     * @param {HTMLElement} inputEl   - The email <input> element
     * @param {HTMLElement} statusEl  - Element below the input for status messages
     * @param {Function}    onChange  - Called with (valid: boolean) on every state change
     */
    attachEmail: function (inputEl, statusEl, onChange) {
      var self = this;
      onChange(false);
      inputEl.addEventListener('blur', function () {
        var email = inputEl.value.trim();
        if (!email || !self.EMAIL_REGEX.test(email)) {
          self._setState(inputEl, statusEl, 'error', '');
          onChange(false);
          return;
        }
        self._setChecking(inputEl, statusEl);
        self._post('/api/validate/email', { email: email }, function (data) {
          if (data.result === true) {
            self._setState(inputEl, statusEl, 'valid', '');
            onChange(true);
          } else {
            self._setState(inputEl, statusEl, 'error', 'Dit e-mailadres is niet geldig');
            onChange(false);
          }
        }, function () {
          // On API failure, don't block the user
          self._setState(inputEl, statusEl, null, '');
          onChange(true);
        });
      });
    },

    /**
     * Attach blur-based phone validation to an input.
     *
     * @param {HTMLElement} inputEl       - The phone <input> element
     * @param {HTMLElement} statusEl      - Element below the input for status messages
     * @param {Function}    getNumber     - Returns the full phone number string to validate
     * @param {Function}    isFormatValid - Returns true if the number passes local format checks
     * @param {Function}    onChange      - Called with (valid: boolean) on every state change
     */
    attachPhone: function (inputEl, statusEl, getNumber, isFormatValid, onChange) {
      var self = this;
      onChange(false);
      inputEl.addEventListener('blur', function () {
        var number = getNumber();
        if (!number) { onChange(false); return; }
        if (!isFormatValid()) {
          self._setState(inputEl, statusEl, 'error', '');
          onChange(false);
          return;
        }
        self._setChecking(inputEl, statusEl);
        self._post('/api/validate/mobile', { mobile: number }, function (data) {
          if (data.result === 'live') {
            self._setState(inputEl, statusEl, 'valid', '');
            onChange(true);
          } else {
            self._setState(inputEl, statusEl, 'error', 'Dit mobiel nummer is niet geldig');
            onChange(false);
          }
        }, function () {
          // On API failure, don't block the user
          self._setState(inputEl, statusEl, null, '');
          onChange(true);
        });
      });
    },

    /**
     * Show an error state on a field — use in form submit handlers.
     *
     * @param {HTMLElement} inputEl  - The input element
     * @param {HTMLElement} statusEl - The status message element
     * @param {string}      message  - Error message to display
     */
    showError: function (inputEl, statusEl, message) {
      this._setState(inputEl, statusEl, 'error', message);
    },

    // ── Private helpers ────────────────────────────────────────────

    _setChecking: function (inputEl, statusEl) {
      inputEl.classList.remove('valid', 'error');
      statusEl.textContent = 'Controleren...';
      statusEl.style.color = '#888';
    },

    _setState: function (inputEl, statusEl, state, message) {
      inputEl.classList.remove('valid', 'error');
      if (state) inputEl.classList.add(state);
      statusEl.textContent = message;
      statusEl.style.color = (state === 'error' && message) ? '#dc2626' : '';
    },

    /**
     * Attach address auto-complete based on postcode + house number.
     * Triggers on blur of houseNumberEl (and additionEl if provided).
     *
     * @param {Function}         getPostcode    - Returns the current postcode string
     * @param {HTMLElement}      houseNumberEl  - House number input
     * @param {HTMLElement|null} additionEl     - Optional addition input (e.g. "A")
     * @param {HTMLElement}      streetEl       - Readonly input to fill with street name
     * @param {HTMLElement}      statusEl       - Status message element (placed near houseNumberEl)
     * @param {Function}         onChange       - Called with (valid: boolean, result: object|null)
     */
    attachAddress: function (getPostcode, houseNumberEl, additionEl, streetEl, statusEl, onChange) {
      var self = this;
      onChange(false, null);

      function doLookup() {
        var pc = getPostcode().trim();
        var hn = houseNumberEl.value.trim();
        if (!hn) return;
        self._setChecking(houseNumberEl, statusEl);
        self._post('/api/postcodecheck', {
          postalCode: pc.replace(/\s+/g, '').toUpperCase(),
          houseNumber: hn
        }, function (response) {
          if (Array.isArray(response) && response[0] && response[0].streetName) {
            streetEl.value = response[0].streetName;
            self._setState(houseNumberEl, statusEl, null, '');
            onChange(true, response[0]);
          } else {
            streetEl.value = '';
            self._setState(houseNumberEl, statusEl, 'error', 'Combinatie niet gevonden. Controleer uw huisnummer.');
            onChange(false, null);
          }
        }, function () {
          streetEl.value = '';
          self._setState(houseNumberEl, statusEl, 'error', 'Fout bij het ophalen van adres.');
          onChange(false, null);
        });
      }

      houseNumberEl.addEventListener('blur', doLookup);
      if (additionEl) additionEl.addEventListener('blur', doLookup);
    },

    _post: function (url, data, onSuccess, onError) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(onSuccess).catch(onError);
    }
  };

  window.FormValidation = FormValidation;

})(window);