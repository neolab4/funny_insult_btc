'use client';
import { useState, useEffect } from 'react';

export default function Insults() {
    const [images, setImages] = useState([]);
    const [bitcoinAddress, setBitcoinAddress] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [customInsult, setCustomInsult] = useState('');
    const [selectedInsult, setSelectedInsult] = useState(null);
    const [message, setMessage] = useState(null); // Nouvel état pour la boîte de message
    const [showInputBox, setShowInputBox] = useState(true); // État pour la boîte d'entrée
    const [tempAddress, setTempAddress] = useState(''); // Stockage temporaire de l'entrée

    useEffect(() => {
        if (bitcoinAddress) {
            fetchImages(bitcoinAddress);
        }
    }, [bitcoinAddress]);

    const fetchImages = async (addr) => {
        const res = await fetch('/api/insults', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bitcoinAddress: addr }),
        });
        if (res.ok) {
            const { images } = await res.json();
            setImages(images);
        } else {
            showMessage('Paiement non validé. Contacte-moi !');
            window.location.href = '/';
        }
    };

    const addCustomInsult = async () => {
        if (!customInsult) return;
        if (customInsult.length > 30) {
            showMessage('L’insulte ne doit pas dépasser 30 caractères.');
            return;
        }

        const res = await fetch('/api/add-insult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bitcoinAddress, newInsult: customInsult }),
        });
        if (res.ok) {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(customInsult, canvas.width / 2, canvas.height / 2);

            const base64 = canvas.toDataURL('image/png').split(',')[1];
            const newInsult = { text: customInsult, base64 };

            setImages([newInsult, ...images]);
            setSelectedInsult(newInsult);
            setCustomInsult('');
            showMessage('Insulte ajoutée ! Elle sera validée manuellement bientôt.');
        }
    };

    const shareToTwitter = (base64, text) => {
        const url = `data:image/png;base64,${base64}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mon insulte préférée : ${text} #BitcoinInsults`)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const shareToWhatsApp = (base64, text) => {
        const url = `data:image/png;base64,${base64}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check cette insulte : ${text} ${url}`)}`, '_blank');
    };

    const shareToTelegram = (base64, text) => {
        const url = `data:image/png;base64,${base64}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Insulte : ${text}`)}`, '_blank');
    };

    const filteredImages = images.filter(img => 
        img.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectInsult = (img) => {
        setSelectedInsult(img);
        window.scrollTo(0, 0);
    };

    // Fonction pour afficher un message temporaire
    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 3000); // Disparaît après 3 secondes
    };

    // Validation de l'entrée du wallet BTC
    const handleAddressSubmit = () => {
        if (tempAddress) { // Vérifie simplement que quelque chose a été saisi
            setBitcoinAddress(tempAddress);
            setShowInputBox(false); // Ferme la boîte
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold text-pink-500 mb-4">Tes Insultes</h1>

            {/* Boîte d’entrée pour les derniers chiffres du wallet BTC */}
            {showInputBox && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-30">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-pink-500 text-center">
                        <h2 className="text-xl font-bold text-pink-500 mb-4">Entre les derniers chiffres de ton wallet BTC</h2>
                        <input
                            type="text"
                            value={tempAddress}
                            onChange={(e) => setTempAddress(e.target.value)}
                            placeholder="Ex: 1a2b3"
                            className="p-2 rounded bg-gray-800 text-white border border-pink-500 mb-4 w-48 text-center"
                        />
                        <button
                            onClick={handleAddressSubmit}
                            className="bg-pink-500 hover:bg-pink-600 p-2 rounded text-white w-full"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            )}

            {/* Recherche et création en haut */}
            <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className="flex-1 p-1 text-sm rounded bg-gray-800 text-white border border-pink-500"
                />
                <div className="flex-1">
                    <input
                        type="text"
                        value={customInsult}
                        onChange={(e) => setCustomInsult(e.target.value)}
                        placeholder="Crée une insulte (max 30 char.)"
                        maxLength={30}
                        className="w-full p-2 rounded bg-gray-800 text-white border border-pink-500 mb-2"
                    />
                    <button
                        onClick={addCustomInsult}
                        className="w-full bg-purple-500 hover:bg-purple-600 p-2 rounded text-white"
                    >
                        Ajouter mon insulte
                    </button>
                </div>
            </div>

            {/* Boîte de message personnalisée */}
            {message && (
                <div className="fixed top-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-pink-500 animate-fade-in z-20">
                    <p className="text-sm">{message}</p>
                </div>
            )}

            {/* Conteneur principal */}
            <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-6 relative">
                {/* Insulte choisie plus petite */}
                {selectedInsult && (
                    <div className="w-full sm:w-2/3 text-center mb-8 p-4 bg-gray-900 border-2 border-pink-500 rounded-xl shadow-lg shadow-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/70">
                    <h2 className="text-xl font-bold text-pink-500 mb-2 tracking-wide">
                        Insulte choisie
                    </h2>
                    <div className="relative mb-2 w-48 mx-auto -translate-x-4">
                        <img
                            src={`data:image/png;base64,${selectedInsult.base64}`}
                            alt={selectedInsult.text}
                            className="w-48 h-36 object-cover rounded-lg border-2 border-gray-700 shadow-md transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg pointer-events-none" />
                    </div>
                    <p className="text-white text-md font-semibold mb-2 italic bg-gray-800 py-1 px-3 rounded-full shadow-inner">
                        {selectedInsult.text}
                    </p>
                    <div className="space-y-2 max-w-xs mx-auto">
                        <a
                            href={`data:image/png;base64,${selectedInsult.base64}`}
                            download={`${selectedInsult.text}.png`}
                            className="block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                            Télécharger
                        </a>
                        <button
                            onClick={() => shareToTwitter(selectedInsult.base64, selectedInsult.text)}
                            className="block w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 p-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                            Partager sur X
                        </button>
                        <button
                            onClick={() => shareToWhatsApp(selectedInsult.base64, selectedInsult.text)}
                            className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                            Partager sur WhatsApp
                        </button>
                        <button
                            onClick={() => shareToTelegram(selectedInsult.base64, selectedInsult.text)}
                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                            Partager sur Telegram
                        </button>
                    </div>
                </div>
                )}

                {/* Liste des insultes déroulante à droite */}
                <div className="w-full sm:w-1/3 flex flex-col gap-4 sm:ml-auto mt-72 sm:mt-0 max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {filteredImages.length > 0 ? (
                        filteredImages.map((img, index) => (
                            <div key={index} className="text-center bg-gray-900 p-4 rounded border border-gray-700 shadow-md">
                                <p className="text-white text-md mb-2">{img.text}</p>
                                <button
                                    onClick={() => handleSelectInsult(img)}
                                    className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded text-white w-full text-sm"
                                >
                                    Choisir cette insulte
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-white text-center">Aucune insulte trouvée.</p>
                    )}
                </div>
            </div>
        </div>
    );
}