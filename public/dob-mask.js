/**
 * DobMask
 * Shared date-of-birth masked input using IMask.
 * Requires imask.min.js to be loaded before this file.
 */

(function (window) {
  'use strict';

  var MAX_AGE = 100;
  var MIN_AGE = 25;

  function maxDobDate() {
    var d = new Date();
    d.setFullYear(d.getFullYear() - MIN_AGE);
    return d;
  }

  function minDobDate() {
    var d = new Date();
    d.setFullYear(d.getFullYear() - MAX_AGE);
    return d;
  }

  var DobMask = {

    /**
     * Apply IMask date mask to an input element.
     * Format: DD/MM/YYYY. Enforces 25–100 year age range.
     *
     * @param  {HTMLElement} inputEl
     * @returns {IMask.InputMask} The mask instance
     */
    init: function (inputEl) {
      var max = maxDobDate();
      var mask = IMask(inputEl, {
        mask: Date,
        pattern: 'd{/}`m{/}`Y',
        blocks: {
          d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2 },
          m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2 },
          Y: { mask: IMask.MaskedRange, from: 1900, to: max.getFullYear(), maxLength: 4 }
        },
        min: minDobDate(),
        max: max,
        format: function (date) {
          return String(date.getDate()).padStart(2, '0') + '/' +
                 String(date.getMonth() + 1).padStart(2, '0') + '/' +
                 date.getFullYear();
        },
        parse: function (str) {
          var p = str.split('/');
          return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
        }
      });

      inputEl.addEventListener('input', function () {
        inputEl.classList.remove('error');
        if (inputEl._dobStatusEl) {
          inputEl._dobStatusEl.textContent = '';
          inputEl._dobStatusEl.style.color = '';
        }
      });

      return mask;
    },

    /**
     * Validate the DOB input value.
     * Shows an error if invalid and returns false; returns true if valid.
     *
     * @param  {HTMLElement}      inputEl  - The masked DOB input
     * @param  {HTMLElement|null} statusEl - Optional status message element
     * @returns {boolean}
     */
    validate: function (inputEl, statusEl) {
      var dobVal = inputEl.value;
      var dobMatch = dobVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      var dobDate = null;
      var dobComplete = false;

      if (dobMatch) {
        var d = new Date(Number(dobMatch[3]), Number(dobMatch[2]) - 1, Number(dobMatch[1]));
        if (!isNaN(d.getTime()) && d.getDate() === Number(dobMatch[1])) {
          dobDate = d;
          dobComplete = true;
        }
      }

      var max = maxDobDate();
      if (!dobComplete || dobDate > max) {
        var msg = (dobComplete && dobDate > max)
          ? 'Je moet minimaal ' + MIN_AGE + ' jaar oud zijn'
          : 'Voer een geldige geboortedatum in';
        inputEl.classList.remove('valid');
        inputEl.classList.add('error');
        if (statusEl) {
          statusEl.textContent = msg;
          statusEl.style.color = '#dc2626';
          inputEl._dobStatusEl = statusEl;
        }
        return false;
      }

      return true;
    },

    /**
     * Convert the masked DD/MM/YYYY value to ISO format YYYY-MM-DD.
     *
     * @param  {HTMLElement} inputEl
     * @returns {string}
     */
    toISO: function (inputEl) {
      var p = inputEl.value.split('/');
      return p[2] + '-' + p[1] + '-' + p[0];
    }
  };

  window.DobMask = DobMask;

})(window);