import React, { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FoodSearchProps {
  onFoodAdded: (food: any) => void;
}

const FoodSearch = ({ onFoodAdded }: FoodSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  const searchFood = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a food name to search');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_LOVABLE_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a nutritional database expert. When given a food name, return ONLY a JSON object with this exact structure (no additional text or explanation):
{
  "name": "Food Name",
  "category": "one of: Grains, Pulses, Vegetables, Fruits, Dairy, Fats, Spices, Proteins, Nuts, Seeds",
  "calories": number (per 100g),
  "protein": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fat": number (grams per 100g),
  "fiber": number (grams per 100g),
  "rasa": "one of: Sweet, Sour, Salty, Pungent, Bitter, Astringent",
  "guna": "one of: Heavy, Light, Oily, Dry, Hot, Cold",
  "virya": "Hot or Cold",
  "vipaka": "Sweet, Sour, or Pungent",
  "dosha": "brief description of dosha balancing effect"
}

Provide accurate nutritional values. If you don't have exact data, provide reasonable estimates based on similar foods.`
            },
            {
              role: 'user',
              content: `Provide nutritional information for: ${searchQuery}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      const foodData = JSON.parse(content.trim());
      setSearchResult(foodData);
      toast.success('Food information found!');
    } catch (error) {
      console.error('Error searching food:', error);
      toast.error('Could not find food information. Please try again.');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const addToDatabase = () => {
    if (searchResult) {
      const newFood = {
        id: Date.now(),
        ...searchResult
      };
      onFoodAdded(newFood);
      toast.success(`${searchResult.name} added to database!`);
      setSearchResult(null);
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-2 border-primary/20">
        <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          AI-Powered Food Search
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Search for any food to get complete nutritional information and Ayurvedic properties
        </p>
        
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter food name (e.g., 'Quinoa', 'Sweet Potato', 'Almonds')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchFood()}
            className="flex-1 p-3 border border-input rounded-lg bg-background text-foreground"
            disabled={isSearching}
          />
          <button
            onClick={searchFood}
            disabled={isSearching}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {searchResult && (
        <div className="bg-card p-6 rounded-lg shadow-lg border-2 border-secondary animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-2xl font-bold text-foreground">{searchResult.name}</h4>
              <span className="inline-block mt-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {searchResult.category}
              </span>
            </div>
            <button
              onClick={addToDatabase}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add to Database
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
              <p className="text-xs text-blue-600 font-semibold mb-1">CALORIES</p>
              <p className="text-2xl font-bold text-blue-800">{searchResult.calories}</p>
              <p className="text-xs text-blue-600">per 100g</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
              <p className="text-xs text-green-600 font-semibold mb-1">PROTEIN</p>
              <p className="text-2xl font-bold text-green-800">{searchResult.protein}g</p>
              <p className="text-xs text-green-600">per 100g</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
              <p className="text-xs text-yellow-600 font-semibold mb-1">CARBS</p>
              <p className="text-2xl font-bold text-yellow-800">{searchResult.carbs}g</p>
              <p className="text-xs text-yellow-600">per 100g</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
              <p className="text-xs text-orange-600 font-semibold mb-1">FAT</p>
              <p className="text-2xl font-bold text-orange-800">{searchResult.fat}g</p>
              <p className="text-xs text-orange-600">per 100g</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
              <p className="text-xs text-purple-600 font-semibold mb-1">FIBER</p>
              <p className="text-2xl font-bold text-purple-800">{searchResult.fiber}g</p>
              <p className="text-xs text-purple-600">per 100g</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h5 className="font-semibold text-foreground mb-3">Ayurvedic Properties</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Rasa (Taste)</p>
                <p className="font-semibold text-foreground">{searchResult.rasa}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Guna (Quality)</p>
                <p className="font-semibold text-foreground">{searchResult.guna}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Virya (Potency)</p>
                <p className="font-semibold text-foreground">{searchResult.virya}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Vipaka (Post-digestive)</p>
                <p className="font-semibold text-foreground">{searchResult.vipaka}</p>
              </div>
            </div>
            <div className="mt-3 bg-accent p-3 rounded">
              <p className="text-xs text-muted-foreground mb-1">Dosha Effect</p>
              <p className="text-sm text-accent-foreground">{searchResult.dosha}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
