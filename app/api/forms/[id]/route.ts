import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import FormActivity from '@/models/FormActivity';

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

        // Get the old form to compare changes
        const oldForm = await Form.findById(params.id);

        const updatedForm = await Form.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        );

        if (!updatedForm) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        // Log activity if settings changed
        if (body.settings) {
            let description = 'Form settings updated';

            if (body.settings.isActive !== undefined && oldForm?.settings?.isActive !== body.settings.isActive) {
                description = body.settings.isActive ? 'Form activated' : 'Form deactivated';
                await FormActivity.create({
                    formId: params.id,
                    eventType: 'status_changed',
                    description,
                    metadata: { isActive: body.settings.isActive },
                });
            } else {
                await FormActivity.create({
                    formId: params.id,
                    eventType: 'settings_updated',
                    description,
                    metadata: body.settings,
                });
            }
        }

        return NextResponse.json(updatedForm);
    } catch (error: unknown) {
        console.error("Error updating form:", error);
        return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        const deletedForm = await Form.findByIdAndDelete(id);

        if (!deletedForm) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Form deleted successfully" });
    } catch (error: unknown) {
        console.error("Error deleting form:", error);
        return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
    }
}
