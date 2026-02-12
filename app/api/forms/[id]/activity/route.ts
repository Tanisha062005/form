import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FormActivity from '@/models/FormActivity';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        // Fetch activities for this form, sorted by timestamp descending
        const activities = await FormActivity.find({ formId: id })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        // Serialize for client
        const serializedActivities = JSON.parse(JSON.stringify(activities));

        return NextResponse.json({ activities: serializedActivities });
    } catch (err: unknown) {
        console.error('Error fetching activities:', err);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
