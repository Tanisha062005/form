import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt } = await req.json();
        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `You are an expert form builder. The user will give you a description of the form they want to create.
You must return a JSON object with the following structure:
{
  "title": "Form Title",
  "description": "Short form description",
  "fields": [
    {
      "id": "unique-string-id",
      "type": "text | email | number | select | radio | checkbox | date | rating",
      "label": "Field Label",
      "placeholder": "Field placeholder (optional)",
      "helpText": "Help text (optional)",
      "required": true/false,
      "options": ["Option 1", "Option 2"] // only for select, radio, checkbox
    }
  ]
}

Only return the raw JSON object. Do not wrap it in markdown code blocks. Make the form comprehensive based on the user's request.`;

        const result = await model.generateContent(`${systemPrompt}\n\nUser Request: ${prompt}`);
        const responseText = result.response.text();
        
        // Clean up markdown block if the model included it
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const formData = JSON.parse(jsonStr);

        // Ensure each field has a reliable unique ID
        const { nanoid } = await import('nanoid');
        if (formData.fields && Array.isArray(formData.fields)) {
            formData.fields = formData.fields.map((field: Record<string, unknown>) => ({
                ...field,
                id: nanoid()
            }));
        }

        return NextResponse.json(formData);

    } catch (error) {
        console.error("AI Form Generation Error:", error);
        return NextResponse.json({ error: 'Failed to generate form' }, { status: 500 });
    }
}
