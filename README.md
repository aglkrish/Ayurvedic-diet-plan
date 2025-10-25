# Ayurvedic Diet Management System

A comprehensive web application for managing Ayurvedic diet plans with separate portals for doctors and patients. Doctors can create personalized diet charts for their patients, while patients can view their assigned diet plans.

## Features

### Doctor Portal
- **Patient Management**: Register and manage patient profiles with dosha types and dietary preferences
- **Diet Chart Creation**: Create personalized diet plans based on Ayurvedic principles
- **Food Database**: Comprehensive database of foods with nutritional and Ayurvedic properties
- **Smart Recommendations**: AI-powered food suggestions based on patient dosha and health conditions
- **Dashboard**: Overview of patients, diet charts, and food database statistics

### Patient Portal
- **Diet Plan Viewing**: View assigned diet plans with detailed nutritional information
- **Meal Tracking**: See daily meal plans organized by meal times
- **Ayurvedic Guidelines**: Access personalized Ayurvedic eating recommendations
- **Progress Tracking**: Monitor assigned diet plans and nutritional goals

## Authentication System

The application features a dual login system:

### User Types
- **Doctors**: Can manage patients and create diet charts
- **Patients**: Can view their assigned diet plans

### Demo Accounts
For quick testing, use the demo accounts:
- **Doctor**: Click "Demo Doctor" button (auto-creates account)
- **Patient**: Click "Demo Patient" button (auto-creates account)

### Registration
- Doctors need: Name, Email, Password, License Number
- Patients need: Name, Email, Password, Patient ID

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Backend)
- OpenAI API (Food Search)

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account for authentication
- OpenAI API key for food search functionality

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd Ayurvedic-diet-plan

# Step 3: Install the necessary dependencies
npm i

# Step 4: Set up Supabase Database

You need to run the database migration to create the necessary tables. You can do this in two ways:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the SQL script

## Option 2: Using Supabase CLI

```sh
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

# Step 5: Set up environment variables
# Create a .env file with:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
AI_API_KEY=your_openai_api_key

# Step 6: Start the development server
npm run dev
```

## Usage

### For Doctors
1. **Login**: Use doctor credentials or click "Demo Doctor"
2. **Register Patients**: Add patient information including dosha type and medical history
3. **Create Diet Charts**: Select foods based on Ayurvedic principles and patient needs
4. **Manage Food Database**: Add new foods with nutritional and Ayurvedic properties

### For Patients
1. **Login**: Use patient credentials or click "Demo Patient"
2. **View Dashboard**: See overview of assigned diet plans
3. **Browse Diet Plans**: Click on any diet plan to see detailed meal information
4. **Follow Guidelines**: Access Ayurvedic eating recommendations

## Ayurvedic Principles

The system follows traditional Ayurvedic principles:
- **Dosha Types**: Vata, Pitta, Kapha, and their combinations
- **Food Properties**: Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect)
- **Personalized Recommendations**: Based on individual constitution and health conditions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.