import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64 data URI — most reliable method for all file types
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Determine resource type based on mime type.
        // 'raw' is REQUIRED for PDFs & documents — other types will corrupt them.
        let resourceType: "image" | "video" | "raw" = "raw";
        if (file.type.startsWith('image/')) {
            resourceType = 'image';
        } else if (file.type.startsWith('video/')) {
            resourceType = 'video';
        }

        // Use cloudinary.uploader.upload (not upload_stream) with base64 data URI.
        // This avoids all Node.js stream/pipe corruption issues with binary files.
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "formflow_uploads",
            resource_type: resourceType,
            public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
            use_filename: true,
        });

        return NextResponse.json({ url: result.secure_url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
