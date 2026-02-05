import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { title, description } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // placeholder creatorId until auth is implemented
        const creatorId = "user_123";

        const newForm = await Form.create({
            title,
            description,
            creatorId,
            fields: [],
            settings: {
                isActive: true,
            },
        });

        return NextResponse.json(newForm, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating form:", error);
        return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
    }
}
