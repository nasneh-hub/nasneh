import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    git_sha: process.env.GIT_SHA || 'unknown',
    build_time: process.env.BUILD_TIME || 'unknown',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
  });
}
