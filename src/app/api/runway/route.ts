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

    console.log('Attempting Runway ML API call with key:', apiKey.substring(0, 10) + '...');
    
    // Use the correct Runway ML API endpoints from official documentation
    let response;
    let lastError = null;
    let endpoint;
    let requestBody;
    
    // Map model names to valid Runway ML model IDs
    const validModels = {
      'gen3a_turbo': 'gen3a_turbo',
      'Gen-3 Alpha Turbo': 'gen3a_turbo',
      'Gen-3 Alpha': 'gen3a_turbo', 
      'Gen-2': 'gen2',
      'gen2': 'gen2'
    };
    
    const mappedModel = validModels[model] || 'gen3a_turbo'; // default fallback
    console.log('Model mapping:', model, '->', mappedModel);
    
    // Ensure valid ratio format
    const validRatio = ratio === '16:9' ? '1280:720' : 
                      ratio === '9:16' ? '720:1280' : 
                      ratio === '1:1' ? '1024:1024' :
                      `${resolution.split('x')[0]}:${resolution.split('x')[1]}`;
    
    console.log('Ratio mapping:', ratio, '->', validRatio);
    
    if (image) {
      // Image to video generation using the correct API structure
      endpoint = 'https://api.dev.runwayml.com/v1/image_to_video';
      requestBody = {
        promptImage: image,
        seed: Math.floor(Math.random() * 4294967295),
        model: mappedModel,
        promptText: prompt,
        duration: duration,
        ratio: validRatio,
        contentModeration: {
          publicFigureThreshold: "auto"
        }
      };
    } else {
      // Text-only generation - try text_to_image first as there might not be direct text-to-video
      // Based on the docs you provided, text_to_image exists but not pure text_to_video
      endpoint = 'https://api.dev.runwayml.com/v1/text_to_image';
      requestBody = {
        promptText: prompt,
        ratio: validRatio,
        seed: Math.floor(Math.random() * 4294967295),
        model: mappedModel === 'gen2' ? 'gen4_image' : 'gen4_image', // Use image model for text-only
        contentModeration: {
          publicFigureThreshold: "auto"
        }
      };
      
      console.log('Using text_to_image endpoint for text-only generation');
    }
    
    console.log(`Using correct endpoint: ${endpoint}`);
    console.log('Runway request body:', JSON.stringify(requestBody, null, 2));
    
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
    } catch (error: any) {
      console.log(`Network error with endpoint ${endpoint}:`, error.message);
      lastError = error;
    }
    
    if (!response) {
      throw lastError || new Error('All API endpoints failed');
    }

    const responseText = await response.text();
    console.log('Runway API Response (raw text):', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Runway API Response (parsed):', responseData);
    } catch (e) {
      console.log('Failed to parse response as JSON:', e);
      responseData = { error: 'Invalid JSON response', rawResponse: responseText };
    }

    if (!response.ok) {
      console.log('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseData: responseData
      });
      
      return NextResponse.json(
        { 
          error: responseData.error || responseData.message || `Runway API error: ${response.status}`,
          details: responseData.details || responseData.rawResponse || 'Unknown error from Runway API',
          fullError: responseData
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
