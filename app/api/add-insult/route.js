import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
    const { bitcoinAddress, newInsult } = await request.json();
    if (!bitcoinAddress || !newInsult) {
        return NextResponse.json({ error: 'Adresse et insulte requises' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'app/data/insults.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const user = data.users[bitcoinAddress];

    if (!user || !user.paid) {
        return NextResponse.json({ error: 'Paiement non validé' }, { status: 403 });
    }

    // Ajoute l'insulte temporairement (elle sera persistante après ton update manuel)
    data.insults.push(newInsult);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ message: 'Insulte ajoutée avec succès' });
}