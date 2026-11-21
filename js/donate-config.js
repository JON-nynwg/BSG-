/* ==========================================================
   DONATION SETTINGS — edit the values below. Anything left as
   "YOUR_..." is hidden from visitors until you fill it in.
   ========================================================== */
window.DONATE_CONFIG = {
  // PayPal — choose ONE:
  paypalClientId: "YOUR_PAYPAL_CLIENT_ID",            // full checkout buttons (developer.paypal.com)
  paypalMeLink:   "YOUR_PAYPAL_ME_LINK",              // simple option, e.g. "https://paypal.me/yourname"
  paypalCurrency: "USD",

  // Binance — Binance app > Pay > Receive shows your Pay ID (and a payment link/QR)
  binancePayId:   "YOUR_BINANCE_PAY_ID",
  binancePayLink: "YOUR_BINANCE_PAY_LINK",   // optional

  // Crypto — hosted page (nowpayments.io) and/or direct wallet addresses
  nowPaymentsId: "YOUR_DONATION_PAGE_ID",
  cryptoWallets: [
    { coin: "Bitcoin (BTC)",  network: "Bitcoin", address: "YOUR_BTC_ADDRESS" },
    { coin: "USDT",           network: "TRC20",   address: "YOUR_USDT_ADDRESS" },
    { coin: "Ethereum (ETH)", network: "ERC20",   address: "YOUR_ETH_ADDRESS" }
  ],

  // Bank transfer
  bank: {
    bank: "Your Bank Name",
    accountName: "Beyond Seizure Global",
    accountNumber: "0000000000",
    branch: "Branch Name",
    swift: "XXXXXXXX"
  }
};
