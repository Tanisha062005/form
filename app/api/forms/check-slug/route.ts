import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const slug = req.nextUrl.searchParams.get('slug');
        const currentFormId = req.nextUrl.searchParams.get('currentFormId'); // To allow a form to keep its own slug

        if (!slug) {
            return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
        }

        // Basic validation
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json({ available: false, message: 'Invalid format' });
        }

        // Reserved slugs
        const reservedSlugs = ['admin', 'root', 'system', 'api', 'dashboard', 'login', 'signup', 'formflow', 'tani'];
        if (reservedSlugs.includes(slug)) {
            return NextResponse.json({ available: false, message: 'Reserved name' });
        }

        // Check database
        const query: Record<string, unknown> = { customSlug: slug };

        // If we are editing an existing form, don't flag its own slug as taken
        if (currentFormId) {
            query._id = { $ne: currentFormId };
        }

        const existingForm = await Form.findOne(query).select('_id').lean();

        if (existingForm) {
            return NextResponse.json({ available: false });
        }

        return NextResponse.json({ available: true });
    } catch (error: unknown) {
        console.error("Error checking slug availability:", error);
        return NextResponse.json({ error: "Failed to check slug" }, { status: 500 });
    }
}
