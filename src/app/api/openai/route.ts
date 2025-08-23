import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 1000, messages = [] } = await request.json();
    
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not provided. Please configure your API key in Settings.' },
        { status: 401 }
      );
    }

    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    if (!prompt && !messages.length) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    // Prepare messages for the API call
    let apiMessages: any[] = messages;
    
    if (prompt && !messages.length) {
      apiMessages = [
        { role: 'user', content: prompt }
      ];
    }

    console.log('API Route - Model:', model);
    console.log('API Route - Messages:', JSON.stringify(apiMessages, null, 2));

    const completion = await openai.chat.completions.create({
      model: model,
      messages: apiMessages,
      temperature: temperature,
      max_tokens: maxTokens,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      success: true,
      response: response,
      usage: completion.usage,
      model: completion.model,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 402 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
