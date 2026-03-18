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