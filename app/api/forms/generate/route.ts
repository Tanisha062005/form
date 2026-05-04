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
      "type": "text | email | number | select | radio | checkbox | date | rating | file | location",
      "label": "Field Label",
      "placeholder": "Field placeholder (optional)",
      "helpText": "Help text (optional)",
      "required": true/false,
      "options": ["Option 1", "Option 2"], // only for select, radio, checkbox
      "logic": { // optional, for conditional logic
        "triggerFieldId": "id-of-the-field-that-triggers-this",
        "condition": "equals | not_equals",
        "value": "value-to-match"
      },
      "validation": { // optional
        "minChars": 10,
        "maxChars": 100,
        "exactDigits": 10 // e.g. for phone numbers
      }
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Target Audience is Indian users. Use Indian context for placeholders (e.g., "+91 9876543210" for phone numbers, "Aadhaar Number", Indian states/cities, etc.).
2. Include logic and validations where applicable. For example, if asking for an Indian phone number, add validation for "exactDigits": 10. If asking for a secondary field based on a previous answer, use the "logic" object.
3. Make use of all field types where appropriate, including "file" for document uploads and "location" for getting the user's address/location.
4. Only return the raw JSON object. Do not wrap it in markdown code blocks. Make the form comprehensive based on the user's request.`;

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
