import React, { useState, useEffect } from 'react';
import { User, Calendar, FileText, LogOut, Heart, Clock, TrendingUp, Activity } from 'lucide-react';
import { Toaster } from 'sonner';

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

const PatientDashboard = ({ user, onLogout }: PatientDashboardProps) => {
  const [dietCharts, setDietCharts] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadDietCharts = () => {
      try {
        const chartsData = localStorage.getItem('dietCharts');
        if (chartsData) {
          const allCharts = JSON.parse(chartsData);
          // Filter charts for this patient by name or patient ID
          const patientCharts = allCharts.filter(chart => 
            chart.patientName === user.name || 
            chart.patientEmail === user.email ||
            chart.patientIdNumber === user.patientId
          );
          setDietCharts(patientCharts);
        }
      } catch (error) {
        console.error('Error loading diet charts:', error);
      }
    };

    loadDietCharts();
  }, [user]);

  const getMealTimeIcon = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast':
        return '🌅';
      case 'Mid-Morning':
        return '☀️';
      case 'Lunch':
        return '🌞';
      case 'Evening':
        return '🌆';
      case 'Dinner':
        return '🌙';
      default:
        return '🍽️';
    }
  };

  const getDoshaColor = (dosha: string) => {
    if (dosha.includes('Vata')) return 'text-blue-600 bg-blue-50';
    if (dosha.includes('Pitta')) return 'text-red-600 bg-red-50';
    if (dosha.includes('Kapha')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const DietPlansList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Diet Plans</h2>
        <div className="bg-accent px-4 py-2 rounded border border-border">
          <p className="text-sm text-muted-foreground">Total Plans: <span className="font-semibold text-accent-foreground">{dietCharts.length}</span></p>
        </div>
      </div>

      {dietCharts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No diet plans assigned yet</p>
          <p className="text-muted-foreground text-sm mt-2">Your doctor will create personalized diet plans for you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietCharts.map(chart => (
            <div 
              key={chart.id} 
              className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedChart(chart)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary/10 p-2 rounded">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  {chart.meals.length} meals
                </span>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground mb-2">{chart.date}</h3>
              <p className="text-sm text-muted-foreground mb-3">By Dr. {chart.doctorName}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-2 rounded text-center">
                  <p className="text-blue-600 font-semibold">{chart.totalNutrients.calories.toFixed(0)}</p>
                  <p className="text-xs text-blue-600">Calories</p>
                </div>
                <div className="bg-green-50 p-2 rounded text-center">
                  <p className="text-green-600 font-semibold">{chart.totalNutrients.protein.toFixed(1)}g</p>
                  <p className="text-xs text-green-600">Protein</p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Click to view details</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">My Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Diet Plans</p>
              <p className="text-3xl font-bold mt-2">{dietCharts.length}</p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Plans</p>
              <p className="text-3xl font-bold mt-2">{dietCharts.filter(c => new Date(c.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
            </div>
            <Heart className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Meals</p>
              <p className="text-3xl font-bold mt-2">{dietCharts.reduce((sum, chart) => sum + chart.meals.length, 0)}</p>
            </div>
            <Activity className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-card-foreground">Recent Diet Plans</h3>
          {dietCharts.length > 0 && (
            <button
              onClick={() => setActiveTab('dietPlans')}
              className="text-primary hover:underline text-sm font-medium"
            >
              View All ({dietCharts.length})
            </button>
          )}
        </div>
        {dietCharts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No diet plans assigned yet</p>
            <p className="text-muted-foreground text-sm mt-2">Your doctor will create personalized diet plans for you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dietCharts.slice(-3).reverse().map(chart => (
              <div 
                key={chart.id} 
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedChart(chart);
                  setActiveTab('dietPlans');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{chart.date}</p>
                    <p className="text-sm text-muted-foreground">Dr. {chart.doctorName}</p>
                  </div>
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

  const DietPlanView = () => {
    if (!selectedChart) {
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Select a diet plan to view details</p>
        </div>
      );
    }

    const groupedMeals = selectedChart.meals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType].push(meal);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Diet Plan Details</h2>
            <p className="text-muted-foreground">Created on {selectedChart.date} by Dr. {selectedChart.doctorName}</p>
          </div>
          <button
            onClick={() => {
              setSelectedChart(null);
              setActiveTab('dietPlans');
            }}
            className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to List
          </button>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Daily Nutrition Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['calories', 'protein', 'carbs', 'fat', 'fiber'].map(nutrient => (
              <div key={nutrient} className="bg-white p-4 rounded-lg text-center shadow-sm">
                <p className="text-xs text-muted-foreground uppercase mb-1">{nutrient}</p>
                <p className="text-2xl font-bold text-primary">
                  {selectedChart.totalNutrients[nutrient].toFixed(1)}
                  {nutrient === 'calories' ? '' : 'g'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Plans */}
        <div className="space-y-6">
          {Object.keys(groupedMeals).map(mealType => (
            <div key={mealType} className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getMealTimeIcon(mealType)}</span>
                <h3 className="text-xl font-semibold text-foreground">{mealType}</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {groupedMeals[mealType].length} items
                </span>
              </div>
              
              <div className="space-y-3">
                {groupedMeals[mealType].map(item => (
                  <div key={item.id} className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground">{item.food.name}</h4>
                      <span className="text-sm text-muted-foreground">{item.quantity}g</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-blue-600 font-semibold">{item.nutrients.calories}</p>
                        <p className="text-xs text-blue-600">Calories</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-green-600 font-semibold">{item.nutrients.protein}g</p>
                        <p className="text-xs text-green-600">Protein</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-center">
                        <p className="text-yellow-600 font-semibold">{item.nutrients.carbs}g</p>
                        <p className="text-xs text-yellow-600">Carbs</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <p className="text-orange-600 font-semibold">{item.nutrients.fat}g</p>
                        <p className="text-xs text-orange-600">Fat</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getDoshaColor(item.food.dosha)}`}>
                          {item.food.dosha}
                        </span>
                        <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs">
                          {item.food.rasa} taste
                        </span>
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                          {item.food.virya} potency
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Ayurvedic Guidelines */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-xl font-semibold mb-4 text-orange-800 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Ayurvedic Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-700">
            <div>
              <h4 className="font-semibold mb-2">Meal Timing</h4>
              <ul className="space-y-1">
                <li>• Eat breakfast between 7-9 AM</li>
                <li>• Have lunch between 12-2 PM</li>
                <li>• Take dinner before 7 PM</li>
                <li>• Avoid eating 3 hours before sleep</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Eating Habits</h4>
              <ul className="space-y-1">
                <li>• Eat in a calm, peaceful environment</li>
                <li>• Chew food thoroughly (32 times)</li>
                <li>• Avoid drinking water during meals</li>
                <li>• Listen to your body's hunger signals</li>
              </ul>
            </div>
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
              <User className="w-8 h-8" />
              Patient Portal
            </h1>
            <p className="text-orange-100 mt-2">Welcome, {user.name}</p>
            <p className="text-orange-200 text-sm">Patient ID: {user.patientId}</p>
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
              onClick={() => {
                setActiveTab('dashboard');
                setSelectedChart(null);
              }}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('dietPlans');
                setSelectedChart(null);
              }}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'dietPlans' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Diet Plans ({dietCharts.length})
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'dietPlans' && <DietPlansList />}
          {selectedChart && <DietPlanView />}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
