import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskId = params.taskId;
    
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    console.log('Runway Status Check - Task ID:', taskId);
    console.log('Runway Status Check - API Key present:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Runway API key not provided' },
        { status: 401 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Try multiple endpoints to find the correct one for this API key
    let response;
    const endpoints = [
      `https://content.runwayml.com/tasks/${taskId}`,
      `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
      `https://api.runwayml.com/v1/tasks/${taskId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Checking status with endpoint: ${endpoint}`);
        
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Runway-Version': '2024-09-13',
          },
        });
        
        // If we get a successful response, use this endpoint
        if (response.status !== 403 && !response.url.includes('error')) {
          console.log(`Status check success with endpoint: ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`Status check failed with endpoint ${endpoint}`);
        continue;
      }
    }

    const responseData = await response.json();
    console.log('Runway Status Response:', responseData);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: responseData.error || `Runway API error: ${response.status}`,
          details: responseData.message || 'Unknown error from Runway API'
        },
        { status: response.status }
      );
    }

    // Return status information
    return NextResponse.json({
      success: true,
      taskId: responseData.id,
      status: responseData.status,
      progress: responseData.progress || 0,
      videoUrl: responseData.output?.[0],
      estimatedTime: responseData.estimated_time,
      createdAt: responseData.created_at,
      failure: responseData.failure,
    });

  } catch (error: any) {
    console.error('Runway Status Check Error:', {
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
        { error: 'Invalid Runway API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: `Connection Error: ${error.message || 'Failed to check task status'}`,
        details: 'Please check your internet connection, API key, and Runway service status.'
      },
      { status: 500 }
    );
  }
}
