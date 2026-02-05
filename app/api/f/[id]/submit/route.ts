import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import Form from "@/models/Form";
import Submission from "@/models/Submission";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;
        const { answers } = await req.json();

        // 1. Verify if the form exists and is active
        const form = await Form.findById(id);
        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const isActive = form.settings?.isActive ?? true;
        const expiryDate = form.settings?.expiryDate;
        const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

        if (!isActive || isExpired) {
            return NextResponse.json({ error: 'Form is no longer accepting responses' }, { status: 403 });
        }

        // 2. Save the response object into the Submissions collection
        const submission = await Submission.create({
            formId: id,
            answers,
            metadata: {
                ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
                userAgent: req.headers.get('user-agent') || 'unknown',
            },
        });

        return NextResponse.json({ success: true, submissionId: submission._id });
    } catch (error: any) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
    }
}
