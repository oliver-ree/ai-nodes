import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      image, 
      model = 'gen3a_turbo',
      duration = 5,
      ratio = '16:9',
      resolution = '1280x768'
    } = await request.json();
    
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    console.log('Runway API Route - API Key present:', !!apiKey);
    console.log('Runway API Route - Prompt:', prompt);
    console.log('Runway API Route - Model:', model);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Runway API key not provided. Please configure your API key in Settings.' },
        { status: 401 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for video generation' },
        { status: 400 }
      );
    }

    // Prepare the request body for Runway API
    const requestBody: any = {
      model: model,
      promptText: prompt,
      seed: Math.floor(Math.random() * 1000000),
      ...(image && { promptImage: image }),
    };

    console.log('Runway API Request:', requestBody);

    console.log('Attempting Runway ML API call with key:', apiKey.substring(0, 10) + '...');
    
    // Try multiple Runway ML API endpoints to find the correct one for the API key
    let response;
    let lastError = null;
    
    const endpoints = [
      'https://content.runwayml.com/generate',
      'https://api.dev.runwayml.com/v1/generate', 
      'https://api.runwayml.com/v1/generate'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(endpoint.includes('content.runwayml.com') && { 'X-Runway-Version': '2024-09-13' }),
          },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            ...(image && { image: image }),
            seconds: duration,
            aspect_ratio: ratio,
            seed: Math.floor(Math.random() * 4294967295),
          }),
        });
        
        // If we get a response that's not a hostname error, use this endpoint
        if (response.status !== 403 && !response.url.includes('error')) {
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        }
      } catch (error: any) {
        console.log(`Failed with endpoint ${endpoint}:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!response) {
      throw lastError || new Error('All API endpoints failed');
    }

    const responseData = await response.json();
    console.log('Runway API Response:', responseData);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: responseData.error || `Runway API error: ${response.status}`,
          details: responseData.message || 'Unknown error from Runway API'
        },
        { status: response.status }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      taskId: responseData.id,
      status: responseData.status,
      videoUrl: responseData.output?.[0],
      progress: responseData.progress || 0,
      estimatedTime: responseData.estimated_time,
    });

  } catch (error: any) {
    console.error('Runway API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.type
    });
    
    // Connection/Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.name === 'TypeError') {
      return NextResponse.json(
        { error: 'Failed to connect to Runway API. Please check your internet connection and try again.' },
        { status: 503 }
      );
    }
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Runway API key. Please check your API key in Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: `Connection Error: ${error.message || 'Failed to connect to Runway API'}`,
        details: 'Please check your internet connection, API key, and Runway service status.'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
