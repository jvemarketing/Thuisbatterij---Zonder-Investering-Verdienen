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

    // Returns the Dutch province name for a given 4-digit postcode (or postcode string).
    _getProvince: function (postcode) {
      var num = parseInt(String(postcode).replace(/\s+/g, '').substring(0, 4), 10);
      if (isNaN(num)) return null;
      var R = [
        [1000,1299,'Noord-Holland'],[1300,1379,'Flevoland'],[1380,1384,'Noord-Holland'],
        [1390,1393,'Utrecht'],[1394,1394,'Noord-Holland'],[1396,1396,'Utrecht'],
        [1398,1425,'Noord-Holland'],[1426,1427,'Utrecht'],[1428,1429,'Zuid-Holland'],
        [1430,2158,'Noord-Holland'],[2159,2164,'Zuid-Holland'],[2165,2165,'Noord-Holland'],
        [2166,2166,'Zuid-Holland'],[2170,3381,'Zuid-Holland'],[3382,3464,'Utrecht'],
        [3465,3466,'Zuid-Holland'],[3467,3769,'Utrecht'],[3770,3794,'Gelderland'],
        [3795,3836,'Utrecht'],[3837,3888,'Gelderland'],[3890,3899,'Flevoland'],
        [3900,3924,'Utrecht'],[3925,3925,'Gelderland'],[3926,3999,'Utrecht'],
        [4000,4119,'Gelderland'],[4120,4146,'Utrecht'],[4147,4162,'Gelderland'],
        [4163,4169,'Utrecht'],[4170,4199,'Gelderland'],[4200,4209,'Zuid-Holland'],
        [4211,4212,'Gelderland'],[4213,4213,'Zuid-Holland'],[4214,4219,'Gelderland'],
        [4220,4229,'Zuid-Holland'],[4230,4239,'Utrecht'],[4240,4241,'Zuid-Holland'],
        [4242,4249,'Utrecht'],[4250,4299,'Noord-Brabant'],[4300,4599,'Zeeland'],
        [4600,4671,'Noord-Brabant'],[4672,4679,'Zeeland'],[4680,4681,'Noord-Brabant'],
        [4682,4699,'Zeeland'],[4700,4999,'Noord-Brabant'],[5000,5299,'Noord-Brabant'],
        [5300,5335,'Gelderland'],[5340,5765,'Noord-Brabant'],[5766,5817,'Limburg'],
        [5820,5846,'Noord-Brabant'],[5850,5999,'Limburg'],[6000,6019,'Limburg'],
        [6020,6029,'Noord-Brabant'],[6030,6499,'Limburg'],[6500,6583,'Gelderland'],
        [6584,6599,'Limburg'],[6600,6999,'Gelderland'],[7000,7399,'Gelderland'],
        [7400,7438,'Overijssel'],[7439,7439,'Gelderland'],[7440,7739,'Overijssel'],
        [7740,7766,'Drenthe'],[7767,7799,'Overijssel'],[7800,7949,'Drenthe'],
        [7950,7955,'Overijssel'],[7956,7999,'Drenthe'],[8000,8049,'Overijssel'],
        [8050,8054,'Gelderland'],[8055,8069,'Overijssel'],[8070,8099,'Gelderland'],
        [8100,8159,'Overijssel'],[8160,8195,'Gelderland'],[8196,8199,'Overijssel'],
        [8200,8259,'Flevoland'],[8260,8299,'Overijssel'],[8300,8322,'Flevoland'],
        [8323,8349,'Overijssel'],[8350,8354,'Drenthe'],[8355,8379,'Overijssel'],
        [8380,8387,'Drenthe'],[8388,8999,'Friesland'],[9000,9299,'Friesland'],
        [9300,9349,'Drenthe'],[9350,9399,'Groningen'],[9400,9478,'Drenthe'],
        [9479,9479,'Groningen'],[9480,9499,'Drenthe'],[9500,9509,'Groningen'],
        [9510,9539,'Drenthe'],[9540,9563,'Groningen'],[9564,9564,'Drenthe'],
        [9565,9569,'Groningen'],[9570,9579,'Drenthe'],[9580,9653,'Groningen'],
        [9654,9659,'Drenthe'],[9660,9748,'Groningen'],[9749,9749,'Drenthe'],
        [9750,9759,'Groningen'],[9760,9769,'Drenthe'],[9770,9849,'Groningen'],
        [9850,9859,'Friesland'],[9860,9869,'Groningen'],[9870,9879,'Friesland'],
        [9880,9999,'Groningen'],
      ];
      for (var i = 0; i < R.length; i++) {
        if (num >= R[i][0] && num <= R[i][1]) return R[i][2];
      }
      return null;
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