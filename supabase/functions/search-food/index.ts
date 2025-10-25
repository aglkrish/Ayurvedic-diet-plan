import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName } = await req.json();

    if (!foodName || typeof foodName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Food name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const AI_API_KEY = Deno.env.get('AI_API_KEY');
    if (!AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a nutritional database expert with deep knowledge of Ayurvedic principles. When given a food name, return ONLY a JSON object with this exact structure (no additional text, markdown, or explanation):
{
  "name": "Food Name",
  "category": "one of: Grains, Pulses, Vegetables, Fruits, Dairy, Fats, Spices, Proteins, Nuts, Seeds",
  "calories": number (per 100g),
  "protein": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fat": number (grams per 100g),
  "fiber": number (grams per 100g),
  "rasa": "one of: Sweet, Sour, Salty, Pungent, Bitter, Astringent (or combination like Sweet/Sour)",
  "guna": "one of: Heavy, Light, Oily, Dry, Hot, Cold (or combination)",
  "virya": "Hot or Cold",
  "vipaka": "Sweet, Sour, or Pungent",
  "dosha": "brief description of dosha balancing effect (e.g., 'Balances Vata & Pitta', 'Balances all Doshas')"
}

Important guidelines:
- Provide accurate nutritional values based on USDA or standard nutritional databases
- If exact data is unavailable, provide reasonable estimates based on similar foods
- For Ayurvedic properties, use traditional Ayurvedic knowledge
- Return ONLY the JSON object, no explanations or markdown formatting`
          },
          {
            role: 'user',
            content: `Provide complete nutritional and Ayurvedic information for: ${foodName}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let foodData;
    try {
      foodData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedContent);
      throw new Error('Invalid response format from AI');
    }

    // Validate required fields
    const requiredFields = ['name', 'category', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'rasa', 'guna', 'virya', 'vipaka', 'dosha'];
    const missingFields = requiredFields.filter(field => !(field in foodData));
    
    if (missingFields.length > 0) {
      console.error('Missing fields in AI response:', missingFields, foodData);
      throw new Error(`Incomplete food data: missing ${missingFields.join(', ')}`);
    }

    return new Response(
      JSON.stringify({ foodData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to search food information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
