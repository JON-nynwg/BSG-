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

  // ---------- PayPal ----------
  if (window.paypal) {
    paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', label: 'donate' },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{ amount: { value: '10.00' } }] // default USD amount
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert('Thank you, ' + details.payer.name.given_name + '! Your donation was received.');
        });
      }
    }).render('#paypal-button-container');
  }

  // ---------- Crypto (NOWPayments hosted donation page) ----------
  // Sign up at nowpayments.io, create a donation page, paste its ID below.
  const cryptoContainer = document.getElementById('crypto-widget-container');
  if (cryptoContainer) {
    cryptoContainer.innerHTML =
      '<a href="https://nowpayments.io/donation/YOUR_DONATION_PAGE_ID" target="_blank" rel="noopener" class="donate-pay-btn">Donate with Crypto</a>';
  }

});
