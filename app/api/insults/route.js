import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas } from 'canvas';

export async function POST(request) {
    const { bitcoinAddress } = await request.json();
    if (!bitcoinAddress) {
        return NextResponse.json({ error: 'Adresse Bitcoin requise' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'app/data/insults.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const user = data.users[bitcoinAddress];

    if (!user || !user.paid) {
        return NextResponse.json({ error: 'Paiement non validé' }, { status: 403 });
    }

    const images = [];
    for (const insult of data.insults) {
        const canvas = createCanvas(300, 200);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Gestion du retour à la ligne
        const maxWidth = canvas.width - 20;
        const words = insult.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        const lineHeight = 25;
        const totalHeight = lines.length * lineHeight;
        const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });

        const buffer = canvas.toBuffer('image/png');
        images.push({ text: insult, base64: buffer.toString('base64') });
    }

    return NextResponse.json({ images });
}