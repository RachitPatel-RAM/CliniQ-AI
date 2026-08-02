import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        service: 'CliniQ AI Next.js Serverless API',
        timestamp: new Date().toISOString()
    });
}
