import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import Form from "@/models/Form";
import Submission from "@/models/Submission";
import FormActivity from "@/models/FormActivity";
import { detectDevice, extractLocationInfo } from "@/lib/deviceDetection";

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
        const closedMessage = form.settings?.closedMessage || "This form is no longer accepting responses.";

        if (!isActive || isExpired) {
            return NextResponse.json({ error: closedMessage }, { status: 403 });
        }

        // Check Response Limit
        if (form.settings?.maxResponses) {
            const currentCount = await Submission.countDocuments({ formId: id });
            if (currentCount >= form.settings.maxResponses) {
                return NextResponse.json({ error: closedMessage }, { status: 403 });
            }
        }

        // Detect device type
        const userAgent = req.headers.get('user-agent');
        const device = detectDevice(userAgent);

        // Extract location data if present in answers
        let locationData: { city: string; country: string; latitude?: number; longitude?: number } | undefined;
        for (const [, value] of Object.entries(answers)) {
            if (value && typeof value === 'object' && 'address' in value) {
                const locationValue = value as { address: string; latitude?: number; longitude?: number };
                const locInfo = extractLocationInfo(locationValue.address);
                locationData = {
                    city: locInfo.city,
                    country: locInfo.country,
                    latitude: locationValue.latitude,
                    longitude: locationValue.longitude,
                };
                break; // Use first location field found
            }
        }

        // 2. Save the response object into the Submissions collection
        const submission = await Submission.create({
            formId: id,
            answers,
            metadata: {
                ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
                userAgent: userAgent || 'unknown',
                device,
                location: locationData,
            },
        });

        // 3. Log activity
        await FormActivity.create({
            formId: id,
            eventType: 'response_received',
            description: 'New response submitted',
            metadata: {
                submissionId: submission._id,
                device,
            },
        });

        return NextResponse.json({ success: true, submissionId: submission._id });
    } catch (err: unknown) {
        console.error("Submission error:", err);
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
    }
}
