document.addEventListener('DOMContentLoaded', function () {

  // ---------- Open modal from ANY donate/support link ----------
  const overlay = document.getElementById('donate-modal-overlay');
  document.querySelectorAll('.donate-btn').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      overlay.classList.add('open');
    });
  });

  document.getElementById('donate-modal-close').addEventListener('click', function () {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  // ---------- Tabs ----------
  document.querySelectorAll('.donate-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.donate-tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.donate-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('donate-panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ---------- Amount picker (M-Pesa / Card panel) ----------
  let selectedAmount = 1000;
  document.querySelectorAll('#donate-panel-mpesa .donate-amount-row button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#donate-panel-mpesa .donate-amount-row button').forEach(function (b) {
        b.classList.remove('selected');
      });
      btn.classList.add('selected');
      selectedAmount = Number(btn.dataset.amount);
      document.getElementById('mpesa-custom-amount').value = '';
    });
  });
  document.getElementById('mpesa-custom-amount').addEventListener('input', function (e) {
    if (e.target.value) {
      document.querySelectorAll('#donate-panel-mpesa .donate-amount-row button').forEach(function (b) {
        b.classList.remove('selected');
      });
      selectedAmount = Number(e.target.value);
    }
  });

  // ---------- IntaSend (M-Pesa + Card) ----------
  // 1. Sign up at intasend.com -> Settings -> API Keys
  // 2. Use the PUBLISHABLE key here (never the secret key in frontend code)
  // 3. live: false while testing with sandbox keys, true once you switch to live keys
  if (window.IntaSend) {
    const intaSend = new IntaSend({
      publicAPIKey: "YOUR_INTASEND_PUBLISHABLE_KEY",
      live: false
    });

    document.getElementById('intasend-pay-btn').addEventListener('click', function () {
      intaSend.run({
        amount: selectedAmount,
        currency: "KES",
        email: "",
        comment: "Donation to Beyond Seizure Global"
      });
    });
  }

  // ---------- helpers ----------
  const C = window.DONATE_CONFIG || {};
  const isSet = function (v) { return v && !/^YOUR_|^0000|XXXX|Your Bank|Branch Name/i.test(v); };
  const esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); };
  const pending = '<p class="donate-note" style="margin-top:0;">This option is being set up. Please use another method for now, or email info@beyondseizureglobal.org.</p>';
  function copyBtn(text) {
    return '<button type="button" class="donate-copy" data-copy="' + esc(text) + '">Copy</button>';
  }
  document.addEventListener('click', function (e) {
    const b = e.target.closest('.donate-copy');
    if (!b) return;
    const done = function () { const o = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = o; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done); else done();
  });

  // ---------- PayPal ----------
  const ppBox = document.getElementById('donate-panel-paypal');
  if (ppBox) {
    let usd = 10;
    let html = '<p class="donate-note" style="margin-top:0;">For international donors (USD).</p>' +
      '<div class="donate-amount-row" id="paypal-amounts">' +
      [10, 25, 50].map(function (v) { return '<button type="button" data-usd="' + v + '"' + (v === 10 ? ' class="selected"' : '') + '>$' + v + '</button>'; }).join('') +
      '</div><input type="number" min="1" id="paypal-custom-amount" placeholder="Or enter custom amount (USD)">';
    if (isSet(C.paypalClientId)) {
      html += '<div id="paypal-button-container"></div>';
    } else if (isSet(C.paypalMeLink)) {
      html += '<a class="donate-pay-btn" id="paypal-me-btn" target="_blank" rel="noopener" href="' + esc(C.paypalMeLink) + '">Donate with PayPal</a>';
    } else {
      html += pending;
    }
    ppBox.innerHTML = html;

    ppBox.querySelectorAll('#paypal-amounts button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ppBox.querySelectorAll('#paypal-amounts button').forEach(function (x) { x.classList.remove('selected'); });
        btn.classList.add('selected'); usd = Number(btn.dataset.usd);
        document.getElementById('paypal-custom-amount').value = '';
        updateMe();
      });
    });
    document.getElementById('paypal-custom-amount').addEventListener('input', function (e) {
      if (Number(e.target.value) > 0) {
        ppBox.querySelectorAll('#paypal-amounts button').forEach(function (x) { x.classList.remove('selected'); });
        usd = Number(e.target.value); updateMe();
      }
    });
    function updateMe() {
      const me = document.getElementById('paypal-me-btn');
      if (me) me.href = C.paypalMeLink.replace(/\/+$/, '') + '/' + usd + (C.paypalCurrency || 'USD');
    }
    updateMe();

    // load the PayPal SDK only when a real client id is configured
    if (isSet(C.paypalClientId)) {
      const sc = document.createElement('script');
      sc.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(C.paypalClientId) + '&currency=USD';
      sc.onload = function () {
        paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', label: 'donate' },
          createOrder: function (data, actions) {
            return actions.order.create({ purchase_units: [{ amount: { value: usd.toFixed(2) } }] });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              alert('Thank you, ' + details.payer.name.given_name + '! Your donation was received.');
            });
          }
        }).render('#paypal-button-container');
      };
      document.head.appendChild(sc);
    }
  }

  // ---------- Crypto ----------
  const cryptoContainer = document.getElementById('crypto-widget-container');
  if (cryptoContainer) {
    let html = '';
    if (isSet(C.nowPaymentsId)) {
      html += '<a href="https://nowpayments.io/donation/' + encodeURIComponent(C.nowPaymentsId) + '" target="_blank" rel="noopener" class="donate-pay-btn">Donate with Crypto</a>';
    }
    if (isSet(C.binancePayId) || isSet(C.binancePayLink)) {
      html += '<div class="donate-bank-details"><div><b>Binance Pay</b>' +
        (isSet(C.binancePayId) ? '<span class="donate-mono">Pay ID: ' + esc(C.binancePayId) + '</span>' + copyBtn(C.binancePayId) : '') + '</div></div>' +
        (isSet(C.binancePayLink) ? '<a href="' + esc(C.binancePayLink) + '" target="_blank" rel="noopener" class="donate-pay-btn" style="margin-top:10px;">Donate with Binance Pay</a>' : '') +
        '<p class="donate-note">In the Binance app: Pay &rarr; Send, then enter the Pay ID above. No network fees between Binance users.</p>';
    }
    const wallets = (C.cryptoWallets || []).filter(function (w) { return isSet(w.address); });
    if (wallets.length) {
      html += '<div class="donate-bank-details">' + wallets.map(function (w) {
        return '<div><b>' + esc(w.coin) + (w.network ? ' (' + esc(w.network) + ')' : '') + '</b>' +
          '<span class="donate-mono">' + esc(w.address) + '</span>' + copyBtn(w.address) + '</div>';
      }).join('') + '</div><p class="donate-note">Double-check the network before sending. Crypto transfers cannot be reversed.</p>';
    }
    if (!isSet(C.nowPaymentsId) && !wallets.length && !isSet(C.binancePayId) && !isSet(C.binancePayLink)) html += pending;
    cryptoContainer.innerHTML = html;
  }

  // ---------- Bank ----------
  const bankBox = document.getElementById('donate-panel-bank');
  if (bankBox) {
    const B = C.bank || {};
    const rows = [['Bank', B.bank], ['Account name', B.accountName], ['Account no.', B.accountNumber], ['Branch', B.branch], ['SWIFT', B.swift]]
      .filter(function (r) { return isSet(r[1]); });
    bankBox.innerHTML = rows.length
      ? '<div class="donate-bank-details">' + rows.map(function (r) {
          return '<div><b>' + r[0] + '</b>' + esc(r[1]) + copyBtn(r[1]) + '</div>';
        }).join('') + '</div><p class="donate-note">Please use your name as the payment reference.</p>'
      : pending;
  }

});
