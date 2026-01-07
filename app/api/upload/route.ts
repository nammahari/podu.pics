import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { generatePresignedUpload } from '@/lib/r2-client';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, size } = body;

    if (!contentType) {
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const key = nanoid(10);
    const presigned = await generatePresignedUpload(key, contentType);

    return NextResponse.json({
      success: true,
      uploadUrl: presigned.uploadUrl,
      key: presigned.key,
      url: presigned.publicUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL. Please try again.' },
      { status: 500 }
    );
  }
}
