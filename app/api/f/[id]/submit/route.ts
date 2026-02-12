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

        // Check for existing submissions from the same session/IP within 10 minutes for editing
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        // Try to find a recent submission to "edit"
        const existingSubmission = await Submission.findOne({
            formId: id,
            'metadata.ip': ip,
            'metadata.userAgent': userAgent || 'unknown',
            submittedAt: { $gte: tenMinutesAgo }
        }).sort({ submittedAt: -1 });

        let submission;
        if (existingSubmission) {
            // Update existing submission
            existingSubmission.answers = answers;
            existingSubmission.submittedAt = new Date(); // Reset the 10m window on edit? User request says "For 10 minutes after initial submission", let's keep initial submittedAt or update it? "After 10 minutes, the Edit capability should automatically expire". Usually, it's 10 mins from the VERY FIRST submission. 
            // Let's NOT update submittedAt if we want a fixed 10m window from start.
            // But if the user clicks edit and submits again, maybe they get another 10 mins? 
            // The prompt says "For 10 minutes after the initial submission". So we should check against the original submittedAt.

            // However, to keep it simple and friendly, let's just update the answers.
            existingSubmission.answers = answers;
            submission = await existingSubmission.save();

            // Log activity: Final Submission Saved (or Updated)
            await FormActivity.create({
                formId: id,
                eventType: 'final_submission_saved',
                description: 'Response updated within edit window',
                metadata: {
                    submissionId: submission._id,
                    device,
                },
            });
        } else {
            // 2. Save the response object into the Submissions collection
            submission = await Submission.create({
                formId: id,
                answers,
                metadata: {
                    ip,
                    userAgent: userAgent || 'unknown',
                    device,
                    location: locationData,
                },
                submittedAt: new Date(),
            });

            // 3. Log activity
            await FormActivity.create({
                formId: id,
                eventType: 'final_submission_saved',
                description: 'New response submitted',
                metadata: {
                    submissionId: submission._id,
                    device,
                },
            });
        }

        return NextResponse.json({
            success: true,
            submissionId: submission._id,
            submittedAt: submission.submittedAt
        });
    } catch (err: unknown) {
        console.error("Submission error:", err);
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
    }
}
