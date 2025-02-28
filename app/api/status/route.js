import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
    const { bitcoinAddress } = await request.json();
    if (!bitcoinAddress) {
        return NextResponse.json({ error: 'Adresse Bitcoin requise' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'app/data/insults.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const user = data.users[bitcoinAddress] || { paid: false };

    return NextResponse.json({ paid: user.paid });
}