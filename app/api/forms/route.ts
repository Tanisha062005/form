import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import FormActivity from '@/models/FormActivity';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { title, description, fields } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const newForm = await Form.create({
            title,
            description,
            userId,
            fields: fields || [],
            settings: {
                isActive: true,
            },
        });

        // Log form creation activity
        await FormActivity.create({
            formId: newForm._id,
            eventType: 'created',
            description: `Form "${title}" created`,
            metadata: {
                userId,
            },
        });

        return NextResponse.json(newForm, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating form:", error);
        return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
    }
}
