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

    // Use the correct Runway ML API status endpoint (assuming similar pattern)
    const endpoint = `https://api.dev.runwayml.com/v1/tasks/${taskId}`;
    console.log(`Checking status with endpoint: ${endpoint}`);
    
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      
      console.log('Status response status:', response.status);
      console.log('Status response headers:', Object.fromEntries(response.headers.entries()));
      
    } catch (error: any) {
      console.log(`Status check failed with endpoint ${endpoint}:`, error.message);
      return NextResponse.json(
        { error: 'Failed to check task status', details: error.message },
        { status: 503 }
      );
    }

    const responseData = await response.json();
    console.log('*** RUNWAY STATUS RESPONSE ***');
    console.log('Full response:', JSON.stringify(responseData, null, 2));
    console.log('Response status:', responseData.status);
    console.log('Response progress:', responseData.progress);
    console.log('Response output:', responseData.output);
    console.log('Response outputs:', responseData.outputs);

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
