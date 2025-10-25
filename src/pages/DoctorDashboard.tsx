import React, { useState, useEffect } from 'react';
import { User, Calendar, Plus, Search, FileText, Database, TrendingUp, Droplet, Moon, Sun, Activity, LogOut, Users, Stethoscope } from 'lucide-react';
import FoodSearch from '@/components/FoodSearch';
import { Toaster } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DoctorDashboardProps {
  user: any;
  onLogout: () => void;
}

const DoctorDashboard = ({ user, onLogout }: DoctorDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [foods, setFoods] = useState([]);
  const [dietCharts, setDietCharts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentDiet, setCurrentDiet] = useState({ meals: [] });

  useEffect(() => {
    const initializeData = () => {
      try {
        const patientsData = localStorage.getItem('patients');
        if (patientsData) {
          setPatients(JSON.parse(patientsData));
        }

        const foodsData = localStorage.getItem('foods');
        if (foodsData) {
          setFoods(JSON.parse(foodsData));
        } else {
          const sampleFoods = [
            { id: 1, name: 'Rice (White)', category: 'Grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, rasa: 'Sweet', guna: 'Heavy', virya: 'Cold', vipaka: 'Sweet', dosha: 'Balances Vata & Pitta' },
            { id: 2, name: 'Moong Dal', category: 'Pulses', calories: 347, protein: 24, carbs: 59, fat: 1.2, fiber: 16, rasa: 'Sweet', guna: 'Light', virya: 'Cold', vipaka: 'Sweet', dosha: 'Balances all Doshas' },
            { id: 3, name: 'Ghee', category: 'Fats', calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0, rasa: 'Sweet', guna: 'Heavy', virya: 'Hot', vipaka: 'Sweet', dosha: 'Balances Vata & Pitta' },
            { id: 4, name: 'Spinach', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, rasa: 'Astringent', guna: 'Light', virya: 'Cold', vipaka: 'Pungent', dosha: 'Balances Pitta & Kapha' },
            { id: 5, name: 'Ginger', category: 'Spices', calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2, rasa: 'Pungent', guna: 'Light', virya: 'Hot', vipaka: 'Sweet', dosha: 'Balances Vata & Kapha' },
            { id: 6, name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, rasa: 'Sweet', guna: 'Heavy', virya: 'Cold', vipaka: 'Sweet', dosha: 'Balances Vata & Pitta' },
            { id: 7, name: 'Turmeric', category: 'Spices', calories: 312, protein: 9.7, carbs: 67, fat: 3.2, fiber: 22.7, rasa: 'Bitter/Pungent', guna: 'Light', virya: 'Hot', vipaka: 'Pungent', dosha: 'Balances all Doshas' },
            { id: 8, name: 'Milk (Cow)', category: 'Dairy', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, rasa: 'Sweet', guna: 'Heavy', virya: 'Cold', vipaka: 'Sweet', dosha: 'Balances Vata & Pitta' },
            { id: 9, name: 'Chapati (Wheat)', category: 'Grains', calories: 120, protein: 3.5, carbs: 25, fat: 1.5, fiber: 2.5, rasa: 'Sweet', guna: 'Heavy', virya: 'Hot', vipaka: 'Sweet', dosha: 'Balances Vata' },
            { id: 10, name: 'Cucumber', category: 'Vegetables', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, rasa: 'Sweet', guna: 'Light', virya: 'Cold', vipaka: 'Sweet', dosha: 'Balances Pitta & Kapha' }
          ];
          localStorage.setItem('foods', JSON.stringify(sampleFoods));
          setFoods(sampleFoods);
        }

        const chartsData = localStorage.getItem('dietCharts');
        if (chartsData) {
          setDietCharts(JSON.parse(chartsData));
        }
      } catch (error) {
        console.error('Error initializing data from localStorage:', error);
      }
    };

    initializeData();
  }, []);

  const savePatients = (updatedPatients) => {
    try {
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
      console.error('Error saving patients to localStorage:', error);
    }
  };

  const saveFoods = (updatedFoods) => {
    try {
      localStorage.setItem('foods', JSON.stringify(updatedFoods));
      setFoods(updatedFoods);
    } catch (error) {
      console.error('Error saving foods to localStorage:', error);
    }
  };

  const saveDietCharts = (updatedCharts) => {
    try {
      localStorage.setItem('dietCharts', JSON.stringify(updatedCharts));
      setDietCharts(updatedCharts);
    } catch (error) {
      console.error('Error saving diet charts to localStorage:', error);
    }
  };

  const addPatient = (patient) => {
    const newPatient = { ...patient, id: Date.now() };
    savePatients([...patients, newPatient]);
  };

  const addMealToDiet = (mealType, foodId, quantity) => {
    const food = foods.find(f => f.id === parseInt(foodId));
    if (!food) return;

    const meal = {
      id: Date.now(),
      mealType,
      food,
      quantity: parseFloat(quantity),
      nutrients: {
        calories: (food.calories * quantity / 100).toFixed(1),
        protein: (food.protein * quantity / 100).toFixed(1),
        carbs: (food.carbs * quantity / 100).toFixed(1),
        fat: (food.fat * quantity / 100).toFixed(1),
        fiber: (food.fiber * quantity / 100).toFixed(1)
      }
    };

    setCurrentDiet(prev => ({
      ...prev,
      meals: [...prev.meals, meal]
    }));
  };

  const saveDietChart = () => {
    if (!selectedPatient || currentDiet.meals.length === 0) return;

    const totalNutrients = currentDiet.meals.reduce((acc, meal) => ({
      calories: acc.calories + parseFloat(meal.nutrients.calories),
      protein: acc.protein + parseFloat(meal.nutrients.protein),
      carbs: acc.carbs + parseFloat(meal.nutrients.carbs),
      fat: acc.fat + parseFloat(meal.nutrients.fat),
      fiber: acc.fiber + parseFloat(meal.nutrients.fiber)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    const newChart = {
      id: Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientEmail: selectedPatient.email || '',
      date: new Date().toLocaleDateString(),
      meals: currentDiet.meals,
      totalNutrients,
      doctorId: user.id,
      doctorName: user.name
    };

    saveDietCharts([...dietCharts, newChart]);
    setCurrentDiet({ meals: [] });
    alert('Diet chart saved successfully!');
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Doctor Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Patients</p>
              <p className="text-3xl font-bold mt-2">{patients.length}</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Diet Charts</p>
              <p className="text-3xl font-bold mt-2">{dietCharts.length}</p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Food Database</p>
              <p className="text-3xl font-bold mt-2">{foods.length}</p>
            </div>
            <Database className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md border border-border">
        <h3 className="text-xl font-semibold mb-4 text-card-foreground">Recent Diet Charts</h3>
        {dietCharts.length === 0 ? (
          <p className="text-muted-foreground">No diet charts created yet</p>
        ) : (
          <div className="space-y-3">
            {dietCharts.slice(-5).reverse().map(chart => (
              <div key={chart.id} className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <p className="font-medium text-foreground">{chart.patientName}</p>
                  <p className="text-sm text-muted-foreground">{chart.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{chart.totalNutrients.calories.toFixed(0)} kcal</p>
                  <p className="text-xs text-muted-foreground">{chart.meals.length} meals</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const PatientManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      name: '', age: '', gender: '', dosha: '', dietType: '',
      mealFreq: '', bowelMov: '', waterIntake: '', medicalHistory: '', email: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addPatient(formData);
      setFormData({ name: '', age: '', gender: '', dosha: '', dietType: '', mealFreq: '', bowelMov: '', waterIntake: '', medicalHistory: '', email: '' });
      setShowForm(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Patient Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Patient
          </button>
        </div>

        {showForm && (
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">New Patient Registration</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
                required
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={formData.dosha}
                onChange={(e) => setFormData({...formData, dosha: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
                required
              >
                <option value="">Select Dosha Type</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Pitta-Kapha">Pitta-Kapha</option>
                <option value="Vata-Kapha">Vata-Kapha</option>
              </select>
              <select
                value={formData.dietType}
                onChange={(e) => setFormData({...formData, dietType: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
                required
              >
                <option value="">Dietary Preference</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
              <input
                type="text"
                placeholder="Meal Frequency (e.g., 3 times/day)"
                value={formData.mealFreq}
                onChange={(e) => setFormData({...formData, mealFreq: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
              />
              <input
                type="text"
                placeholder="Bowel Movement Pattern"
                value={formData.bowelMov}
                onChange={(e) => setFormData({...formData, bowelMov: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
              />
              <input
                type="text"
                placeholder="Water Intake (L/day)"
                value={formData.waterIntake}
                onChange={(e) => setFormData({...formData, waterIntake: e.target.value})}
                className="p-2 border border-input rounded bg-background text-foreground"
              />
              <textarea
                placeholder="Medical History / Allergies"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                className="p-2 border border-input md:col-span-2 bg-background text-foreground"
                rows={3}
              />
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-secondary text-secondary-foreground px-6 py-2 rounded hover:opacity-90 transition-opacity">
                  Register Patient
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-muted text-muted-foreground px-6 py-2 rounded hover:opacity-90 transition-opacity">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <h3 className="text-xl font-semibold mb-4 text-card-foreground">Patient List</h3>
          {patients.length === 0 ? (
            <p className="text-muted-foreground">No patients registered yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left text-muted-foreground">Name</th>
                    <th className="p-3 text-left text-muted-foreground">Email</th>
                    <th className="p-3 text-left text-muted-foreground">Age</th>
                    <th className="p-3 text-left text-muted-foreground">Gender</th>
                    <th className="p-3 text-left text-muted-foreground">Dosha</th>
                    <th className="p-3 text-left text-muted-foreground">Diet Type</th>
                    <th className="p-3 text-left text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient.id} className="border-t border-border hover:bg-muted/50">
                      <td className="p-3 text-foreground">{patient.name}</td>
                      <td className="p-3 text-foreground">{patient.email}</td>
                      <td className="p-3 text-foreground">{patient.age}</td>
                      <td className="p-3 text-foreground">{patient.gender}</td>
                      <td className="p-3 text-foreground">{patient.dosha}</td>
                      <td className="p-3 text-foreground">{patient.dietType}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveTab('dietChart');
                          }}
                          className="text-primary hover:underline"
                        >
                          Create Diet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DietChartCreation = () => {
    const [mealType, setMealType] = useState('Breakfast');
    const [selectedFood, setSelectedFood] = useState('');
    const [quantity, setQuantity] = useState('100');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Record<string, any[]>>({});

    const getSmartSuggestions = () => {
      if (!selectedPatient) return {};

      const allergyKeywords = selectedPatient.medicalHistory?.toLowerCase() || '';
      const dosha = selectedPatient.dosha;
      
      const filtered = foods.filter(food => {
        const foodName = food.name.toLowerCase();
        const hasAllergy = allergyKeywords.includes(foodName) || 
                          (allergyKeywords.length > 0 && allergyKeywords.includes(food.category.toLowerCase()));
        
        if (hasAllergy) return false;

        if (dosha.includes('Vata') && food.dosha.includes('Vata')) return true;
        if (dosha.includes('Pitta') && food.dosha.includes('Pitta')) return true;
        if (dosha.includes('Kapha') && food.dosha.includes('Kapha')) return true;
        if (food.dosha.includes('all Doshas')) return true;
        
        return false;
      });

      const categorized = {
        'High Protein': filtered.filter(f => f.protein > 10),
        'Low Calorie': filtered.filter(f => f.calories < 100),
        'High Fiber': filtered.filter(f => f.fiber > 5),
        'Cooling Foods': filtered.filter(f => f.virya === 'Cold'),
        'Heating Foods': filtered.filter(f => f.virya === 'Hot'),
      };

      return categorized;
    };

    const filteredFoods = foods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!selectedPatient) return matchesSearch;

      const allergyKeywords = selectedPatient.medicalHistory?.toLowerCase() || '';
      const foodName = food.name.toLowerCase();
      const hasAllergy = allergyKeywords.length > 0 && 
                        (allergyKeywords.includes(foodName) || 
                         allergyKeywords.includes(food.category.toLowerCase()));
      
      return matchesSearch && !hasAllergy;
    });

    const handleAddMeal = () => {
      if (selectedFood && quantity) {
        addMealToDiet(mealType, selectedFood, quantity);
        setQuantity('100');
      }
    };

    const groupedMeals = currentDiet.meals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType].push(meal);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Create Diet Chart</h2>
          {selectedPatient && (
            <div className="bg-accent px-4 py-2 rounded border border-border">
              <p className="text-sm text-muted-foreground">Patient: <span className="font-semibold text-accent-foreground">{selectedPatient.name}</span></p>
              <p className="text-xs text-muted-foreground">Dosha: {selectedPatient.dosha}</p>
            </div>
          )}
        </div>

        {!selectedPatient ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800">Please select a patient from Patient Management to create a diet chart</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-md mb-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Smart Food Suggestions</h3>
                <button
                  onClick={() => {
                    setSuggestions(getSmartSuggestions());
                    setShowSuggestions(!showSuggestions);
                  }}
                  className="bg-gradient-to-r from-secondary to-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  {showSuggestions ? 'Hide' : 'Get'} AI Suggestions
                </button>
              </div>
              
              {showSuggestions && (
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-lg border-2 border-secondary">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-card-foreground">Patient Profile Analysis</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-muted-foreground">Dosha Type</p>
                        <p className="font-semibold text-blue-700">{selectedPatient.dosha}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-muted-foreground">Diet Preference</p>
                        <p className="font-semibold text-green-700">{selectedPatient.dietType}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-muted-foreground">Age Group</p>
                        <p className="font-semibold text-purple-700">{selectedPatient.age} years</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-muted-foreground">Gender</p>
                        <p className="font-semibold text-orange-700">{selectedPatient.gender}</p>
                      </div>
                    </div>
                    {selectedPatient.medicalHistory && (
                      <div className="mt-3 bg-red-50 p-3 rounded border border-red-200">
                        <p className="text-xs text-red-600 font-semibold mb-1">⚠️ ALLERGIES & CONDITIONS:</p>
                        <p className="text-sm text-red-800">{selectedPatient.medicalHistory}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(suggestions).map(([category, items]) => (
                      items.length > 0 && (
                        <div key={category} className="bg-card p-4 rounded-lg border border-border">
                          <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-secondary rounded-full"></div>
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {items.slice(0, 3).map(food => (
                              <div 
                                key={food.id}
                                className="bg-muted p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedFood(food.id.toString());
                                  setSearchTerm(food.name);
                                }}
                              >
                                <p className="font-medium text-sm text-foreground">{food.name}</p>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>{food.calories} cal</span>
                                  <span className="text-purple-600">{food.rasa}</span>
                                </div>
                                <p className="text-xs text-secondary mt-1">✓ {food.dosha}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Ayurvedic Recommendations for {selectedPatient.dosha}
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {selectedPatient.dosha.includes('Vata') && (
                        <>
                          <li>• Prefer warm, cooked, and moist foods</li>
                          <li>• Include sweet, sour, and salty tastes</li>
                          <li>• Avoid raw, cold, and dry foods</li>
                        </>
                      )}
                      {selectedPatient.dosha.includes('Pitta') && (
                        <>
                          <li>• Prefer cool, refreshing foods</li>
                          <li>• Include sweet, bitter, and astringent tastes</li>
                          <li>• Avoid spicy, salty, and sour foods</li>
                        </>
                      )}
                      {selectedPatient.dosha.includes('Kapha') && (
                        <>
                          <li>• Prefer light, dry, and warm foods</li>
                          <li>• Include pungent, bitter, and astringent tastes</li>
                          <li>• Avoid heavy, oily, and cold foods</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Add Food Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="p-2 border border-input rounded bg-background text-foreground"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Mid-Morning">Mid-Morning</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening">Evening Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-input rounded w-full bg-background text-foreground"
                  />
                  <Search className="absolute right-2 top-2.5 w-5 h-5 text-muted-foreground" />
                </div>

                <select
                  value={selectedFood}
                  onChange={(e) => setSelectedFood(e.target.value)}
                  className="p-2 border border-input rounded bg-background text-foreground"
                >
                  <option value="">Select Food</option>
                  {filteredFoods.map(food => {
                    const isRecommended = selectedPatient && food.dosha.toLowerCase().includes(selectedPatient.dosha.toLowerCase().split('-')[0]);
                    return (
                      <option key={food.id} value={food.id}>
                        {isRecommended ? '⭐ ' : ''}{food.name} ({food.category})
                      </option>
                    );
                  })}
                </select>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Qty (g)"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="p-2 border border-input rounded w-24 bg-background text-foreground"
                  />
                  <button
                    onClick={handleAddMeal}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>

            {currentDiet.meals.length > 0 && (
              <div className="bg-card p-6 rounded-lg shadow-md border border-border">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Current Diet Plan</h3>
                {Object.keys(groupedMeals).map(meal => (
                  <div key={meal} className="mb-6">
                    <h4 className="font-semibold text-lg text-primary mb-2">{meal}</h4>
                    <div className="space-y-2">
                      {groupedMeals[meal].map(item => (
                        <div key={item.id} className="bg-muted p-3 rounded flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.food.name} - {item.quantity}g</p>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                              <span>Cal: {item.nutrients.calories}</span>
                              <span>P: {item.nutrients.protein}g</span>
                              <span>C: {item.nutrients.carbs}g</span>
                              <span>F: {item.nutrients.fat}g</span>
                            </div>
                            <div className="flex gap-4 text-xs text-purple-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Sun className="w-3 h-3" /> Virya: {item.food.virya}
                              </span>
                              <span>Rasa: {item.food.rasa}</span>
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {item.food.dosha}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setCurrentDiet(prev => ({
                              ...prev,
                              meals: prev.meals.filter(m => m.id !== item.id)
                            }))}
                            className="text-destructive hover:opacity-80 text-sm transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {['calories', 'protein', 'carbs', 'fat', 'fiber'].map(nutrient => {
                      const total = currentDiet.meals.reduce((sum, meal) =>
                        sum + parseFloat(meal.nutrients[nutrient] || 0), 0
                      );
                      return (
                        <div key={nutrient} className="bg-accent p-3 rounded text-center">
                          <p className="text-xs text-muted-foreground uppercase">{nutrient}</p>
                          <p className="text-lg font-bold text-accent-foreground">
                            {total.toFixed(1)}{nutrient === 'calories' ? '' : 'g'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={saveDietChart}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                  >
                    Save Diet Chart
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const FoodDatabase = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', ...new Set(foods.map(f => f.category))];
    const filteredFoods = foods.filter(food =>
      (selectedCategory === 'All' || food.category === selectedCategory) &&
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFoodAdded = (newFood) => {
      saveFoods([...foods, newFood]);
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Food Database</h2>
        
        <FoodSearch onFoodAdded={handleFoodAdded} />
        
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
              />
              <Search className="absolute right-2 top-2.5 w-5 h-5 text-muted-foreground" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-input rounded bg-background text-foreground"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left text-muted-foreground">Food Item</th>
                  <th className="p-2 text-left text-muted-foreground">Category</th>
                  <th className="p-2 text-right text-muted-foreground">Cal</th>
                  <th className="p-2 text-right text-muted-foreground">Protein</th>
                  <th className="p-2 text-right text-muted-foreground">Carbs</th>
                  <th className="p-2 text-right text-muted-foreground">Fat</th>
                  <th className="p-2 text-left text-muted-foreground">Rasa</th>
                  <th className="p-2 text-left text-muted-foreground">Virya</th>
                  <th className="p-2 text-left text-muted-foreground">Dosha Effect</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.map(food => (
                  <tr key={food.id} className="border-t border-border hover:bg-muted/50">
                    <td className="p-2 font-medium text-foreground">{food.name}</td>
                    <td className="p-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {food.category}
                      </span>
                    </td>
                    <td className="p-2 text-right text-foreground">{food.calories}</td>
                    <td className="p-2 text-right text-foreground">{food.protein}g</td>
                    <td className="p-2 text-right text-foreground">{food.carbs}g</td>
                    <td className="p-2 text-right text-foreground">{food.fat}g</td>
                    <td className="p-2 text-foreground">{food.rasa}</td>
                    <td className="p-2 text-foreground">{food.virya}</td>
                    <td className="p-2 text-xs text-muted-foreground">{food.dosha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Toaster position="top-right" richColors />
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Stethoscope className="w-8 h-8" />
              Doctor Dashboard
            </h1>
            <p className="text-orange-100 mt-2">Welcome, Dr. {user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-card rounded-lg shadow-md mb-6 border border-border">
          <div className="flex border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'patients' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Patient Management
            </button>
            <button
              onClick={() => setActiveTab('dietChart')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'dietChart' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Diet Chart Creation
            </button>
            <button
              onClick={() => setActiveTab('foodDb')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'foodDb' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Food Database
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'patients' && <PatientManagement />}
          {activeTab === 'dietChart' && <DietChartCreation />}
          {activeTab === 'foodDb' && <FoodDatabase />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
