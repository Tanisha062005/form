import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const form = await Form.findById(params.id);

        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json(form);
    } catch (error: unknown) {
        console.error("Error fetching form:", error);
        return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const body = await req.json();

        const updatedForm = await Form.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        );

        if (!updatedForm) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json(updatedForm);
    } catch (error: unknown) {
        console.error("Error updating form:", error);
        return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
    }
}
