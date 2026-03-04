const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // Sadece require kalsın
const StellarSdk = require('stellar-sdk');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Stellar Sunucu Bağlantısı
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// .env dosyasından gizli anahtarı al
const serverSecret = process.env.STELLAR_SERVER_SECRET;
let serverKeypair = null;

if (serverSecret) {
  try {
    serverKeypair = StellarSdk.Keypair.fromSecret(serverSecret);
    console.log("✅ Sunucu cüzdanı hazır:", serverKeypair.publicKey());
  } catch (e) {
    console.error('❌ HATA: Geçersiz STELLAR_SERVER_SECRET!');
  }
}

// Sağlık Kontrolü
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server_wallet: serverKeypair ? 'configured' : 'missing' });
});

// 1. Hesap Fonlama (Friendbot)
app.post('/api/create-account', async (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.status(400).json({ error: 'publicKey is required' });

    console.log(`🏗️ Fonlama isteği: ${publicKey}`);
    const url = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Friendbot failed', details: data });
    }

    res.json({ success: true, result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fund account' });
  }
});

// 2. Bakiye Sorgulama
app.get('/api/balance/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const account = await server.loadAccount(publicKey);
    const balances = account.balances.map((b) => ({
      asset: b.asset_type === 'native' ? 'XLM' : `${b.asset_code}`,
      balance: b.balance,
    }));
    res.json({ publicKey, balances });
  } catch (err) {
    res.status(500).json({ error: 'Account not found or network error' });
  }
});

// 3. Ödeme Gönderme
app.post('/api/send-payment', async (req, res) => {
  try {
    if (!serverKeypair) return res.status(500).json({ error: 'Server secret missing' });

    const { destination, amount } = req.body;
    const sourceAccount = await server.loadAccount(serverKeypair.publicKey());
    const fee = await server.fetchBaseFee();

    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: String(amount),
      }))
      .setTimeout(30)
      .build();

    tx.sign(serverKeypair);
    const result = await server.submitTransaction(tx);
    res.json({ success: true, hash: result.hash });
  } catch (err) {
    console.error("❌ Ödeme Hatası:", err.response?.data?.extras?.result_codes || err.message);
    res.status(500).json({ error: 'Payment failed', details: err.response?.data?.extras?.result_codes });
  }
});

// 4. İşlem Geçmişi
app.get('/api/history/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const records = await server.payments().forAccount(publicKey).limit(5).order('desc').call();
    
    const payments = records.records.map(op => ({
      id: op.id,
      hash: op.transaction_hash,
      amount: op.amount,
      from: op.from,
      to: op.to,
      createdAt: op.created_at
    }));

    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'History fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend ${PORT} portunda hazır!`);
});