import { NextRequest, NextResponse } from 'next/server';
import { embedServer } from '@/lib/embed';

export const runtime = 'edge';

/**
 * Generates embed code for the application
 * 
 * GET /api/embed?width=100%&height=500px
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const width = url.searchParams.get('width') || '100%';
  const height = url.searchParams.get('height') || '500px';
  const allowFullscreen = url.searchParams.get('allowFullscreen') !== 'false';
  const style = url.searchParams.get('style') || '';
  
  // Base URL for embedding (should be the absolute URL of your application)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const embedUrl = `${baseUrl}/embed`;
  
  const embedCode = embedServer.generateEmbedCode({
    url: embedUrl,
    width,
    height,
    allowFullscreen,
    style,
  });
  
  return NextResponse.json({
    embedCode,
    url: embedUrl,
    instructions: 'Copy and paste this code into your website to embed the application.',
  });
} 