'use client';
import { useState } from 'react';

export default function Home() {
    const [bitcoinAddress, setBitcoinAddress] = useState('');
    const [paid, setPaid] = useState(null);
    const qrCodeUrl = '/btcins.png'; // Remplace par ton QR code perso

    const checkPayment = async () => {
        const res = await fetch('/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bitcoinAddress }),
        });
        const { paid } = await res.json();
        setPaid(paid);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center text-white">
                <h1 className="text-4xl font-bold text-pink-500 mb-4">
                    Insultes Bitcoin Edition
                </h1>
                <p className="mb-4">Paye 0,99 $ en Bitcoin pour 10 insultes !</p>
                <p className="mb-4">Scanne ce QR code et envoie 0,000012 BTC (0,99 $).</p>
                <img src={qrCodeUrl} alt="QR Code Bitcoin" className="mx-auto mb-4 w-32 h-32" />
                <p className="mb-4">Enter last 5 digits of your Bitcoin address for verification !</p>

                <input
                    type="text"
                    value={bitcoinAddress}
                    onChange={(e) => setBitcoinAddress(e.target.value)}
                    placeholder="Last 5 digits of your Bitcoin address"
                    className="p-2 rounded bg-gray-600 text-white border border-pink-500 mb-4"
                />
                <button
                    onClick={checkPayment}
                    className="bg-pink-500 hover:bg-pink-600 p-2 rounded text-white"
                    disabled={!bitcoinAddress}
                >
                    Vérifier paiement
                </button>
                {paid === false && <p className="mt-4">Paiement non confirmé. Attends ma validation !</p>}
                {paid === true && (
                    <a href="/insults" className="mt-4 inline-block bg-green-500 p-2 rounded">
                        Télécharger tes insultes
                    </a>
                )}
            </div>
        </div>
    );
}