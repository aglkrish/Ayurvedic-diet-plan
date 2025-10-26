import React, { useState, useEffect } from 'react';
import { User, Calendar, FileText, LogOut, Heart, Clock, TrendingUp, Activity, CreditCard, DollarSign, CheckCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface PatientDashboardProps {
  user: any;
  onLogout: () => void;
}

const PatientDashboard = ({ user, onLogout }: PatientDashboardProps) => {
  const [dietCharts, setDietCharts] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [progressEntries, setProgressEntries] = useState([]);
  const [payments, setPayments] = useState([]);

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

    const loadProgress = () => {
      try {
        const progressData = localStorage.getItem(`progress_${user.patientId || user.id}`);
        if (progressData) {
          setProgressEntries(JSON.parse(progressData));
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    const loadPayments = () => {
      try {
        const paymentsData = localStorage.getItem('payments');
        if (paymentsData) {
          const allPayments = JSON.parse(paymentsData);
          const patientPayments = allPayments.filter(p => 
            p.patientId === user.patientId || 
            p.patientId === user.id ||
            p.patientEmail === user.email
          );
          setPayments(patientPayments);
        }
      } catch (error) {
        console.error('Error loading payments:', error);
      }
    };

    loadDietCharts();
    loadProgress();
    loadPayments();
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

  const ProgressTracker = () => {
    const [newEntry, setNewEntry] = useState({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      mealsCompleted: 0,
      energyLevel: 5,
      notes: ''
    });

    const handleAddProgress = (e) => {
      e.preventDefault();
      if (!newEntry.weight && !newEntry.notes) return;

      const entry = {
        ...newEntry,
        id: Date.now(),
        weight: newEntry.weight || null,
        energyLevel: parseInt(newEntry.energyLevel),
        mealsCompleted: parseInt(newEntry.mealsCompleted)
      };

      const updated = [entry, ...progressEntries];
      setProgressEntries(updated);
      localStorage.setItem(`progress_${user.patientId || user.id}`, JSON.stringify(updated));

      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        mealsCompleted: 0,
        energyLevel: 5,
        notes: ''
      });
    };

    const totalMealsPlanned = dietCharts.length > 0 
      ? dietCharts[dietCharts.length - 1].meals.length 
      : 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Progress Tracker</h2>

        {/* Add Progress Entry */}
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <h3 className="text-xl font-semibold mb-4 text-card-foreground">Log Today's Progress</h3>
          <form onSubmit={handleAddProgress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Weight (kg) - Optional</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 70.5"
                value={newEntry.weight}
                onChange={(e) => setNewEntry({...newEntry, weight: e.target.value})}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Meals Completed (out of {totalMealsPlanned})</label>
              <input
                type="number"
                min="0"
                max={totalMealsPlanned}
                value={newEntry.mealsCompleted}
                onChange={(e) => setNewEntry({...newEntry, mealsCompleted: e.target.value})}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Energy Level (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newEntry.energyLevel}
                onChange={(e) => setNewEntry({...newEntry, energyLevel: e.target.value})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low (1)</span>
                <span className="font-semibold text-primary">{newEntry.energyLevel}</span>
                <span>High (10)</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Notes (How are you feeling?)</label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="Add any observations, symptoms, or feedback..."
                rows={3}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold"
              >
                Add Progress Entry
              </button>
            </div>
          </form>
        </div>

        {/* Progress History */}
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <h3 className="text-xl font-semibold mb-4 text-card-foreground">Progress History</h3>
          {progressEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No progress entries yet. Start tracking your journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressEntries.map(entry => (
                <div key={entry.id} className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div className="text-right">
                      {entry.weight && (
                        <p className="text-sm font-medium text-foreground">Weight: {entry.weight} kg</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="text-xs text-green-600">Meals Completed</p>
                      <p className="text-lg font-bold text-green-700">{entry.mealsCompleted}/{totalMealsPlanned}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-blue-600">Energy Level</p>
                      <p className="text-lg font-bold text-blue-700">{entry.energyLevel}/10</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <p className="text-xs text-purple-600">Completion</p>
                      <p className="text-lg font-bold text-purple-700">
                        {totalMealsPlanned > 0 ? Math.round((entry.mealsCompleted / totalMealsPlanned) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Statistics */}
        {progressEntries.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Overall Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{progressEntries.length}</p>
                <p className="text-sm text-muted-foreground">Days Tracked</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(progressEntries.reduce((sum, e) => sum + (e.mealsCompleted / totalMealsPlanned), 0) / progressEntries.length * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(progressEntries.reduce((sum, e) => sum + e.energyLevel, 0) / progressEntries.length * 10) / 10}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Energy</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {progressEntries.reduce((sum, e) => sum + e.mealsCompleted, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Meals</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PaymentSection = () => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentData, setPaymentData] = useState({
      amount: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      doctorName: '',
      service: 'Diet Consultation'
    });

    const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Simple validation
      if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      // Create payment record
      const payment = {
        id: Date.now(),
        patientId: user.patientId || user.id,
        patientName: user.name,
        patientEmail: user.email,
        doctorId: user.id, // This would normally come from the diet chart's doctor
        doctorName: paymentData.doctorName || 'Dr. Johnson',
        amount: paymentData.amount,
        service: paymentData.service,
        date: new Date().toISOString(),
        status: 'completed',
        paymentMethod: 'card'
      };

      // Save to localStorage
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      existingPayments.push(payment);
      localStorage.setItem('payments', JSON.stringify(existingPayments));

      // Update state
      setPayments([...payments, payment]);
      
      // Reset form
      setPaymentData({
        amount: '',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        doctorName: '',
        service: 'Diet Consultation'
      });
      setShowPaymentForm(false);
      
      toast.success('Payment processed successfully!');
    };

    const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Payment</h2>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <CreditCard className="w-5 h-5" /> Make Payment
          </button>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Spent</p>
                <p className="text-3xl font-bold mt-2">${totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Payments</p>
                <p className="text-3xl font-bold mt-2">{payments.length}</p>
              </div>
              <CreditCard className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Active Plans</p>
                <p className="text-3xl font-bold mt-2">{dietCharts.length}</p>
              </div>
              <FileText className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">Payment Details</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    className="w-full p-2 border border-input rounded bg-background text-foreground"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Service</label>
                  <select
                    value={paymentData.service}
                    onChange={(e) => setPaymentData({...paymentData, service: e.target.value})}
                    className="w-full p-2 border border-input rounded bg-background text-foreground"
                    required
                  >
                    <option value="Diet Consultation">Diet Consultation</option>
                    <option value="Diet Chart Creation">Diet Chart Creation</option>
                    <option value="Follow-up Consultation">Follow-up Consultation</option>
                    <option value="Custom Diet Plan">Custom Diet Plan</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-3 text-foreground">Card Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()})}
                      className="w-full p-2 border border-input rounded bg-background text-foreground"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Card Holder</label>
                    <input
                      type="text"
                      value={paymentData.cardHolder}
                      onChange={(e) => setPaymentData({...paymentData, cardHolder: e.target.value})}
                      className="w-full p-2 border border-input rounded bg-background text-foreground"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Expiry</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={paymentData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setPaymentData({...paymentData, expiryDate: value});
                        }}
                        className="w-full p-2 border border-input rounded bg-background text-foreground"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">CVV</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '')})}
                        className="w-full p-2 border border-input rounded bg-background text-foreground"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  Pay Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 bg-muted text-muted-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <h3 className="text-xl font-semibold mb-4 text-card-foreground">Payment History</h3>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No payment history</p>
              <p className="text-muted-foreground text-sm mt-2">Your payment records will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div key={payment.id} className="bg-muted p-4 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{payment.service}</p>
                      <p className="text-sm text-muted-foreground">{payment.doctorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">${parseFloat(payment.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">{payment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <button
              onClick={() => {
                setActiveTab('progress');
                setSelectedChart(null);
              }}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'progress' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Progress Tracker
            </button>
            <button
              onClick={() => {
                setActiveTab('payment');
                setSelectedChart(null);
              }}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'payment' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Payment
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'dietPlans' && <DietPlansList />}
          {activeTab === 'progress' && <ProgressTracker />}
          {activeTab === 'payment' && <PaymentSection />}
          {selectedChart && <DietPlanView />}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
