-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient')),
    license_number TEXT,
    patient_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table for patient-specific data
CREATE TABLE IF NOT EXISTS public.patients (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT,
    dosha TEXT,
    diet_type TEXT,
    meal_frequency TEXT,
    bowel_movement TEXT,
    water_intake TEXT,
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create foods table for food database
CREATE TABLE IF NOT EXISTS public.foods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    fiber DECIMAL(5,2) NOT NULL,
    rasa TEXT NOT NULL,
    guna TEXT NOT NULL,
    virya TEXT NOT NULL,
    vipaka TEXT NOT NULL,
    dosha TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diet_charts table
CREATE TABLE IF NOT EXISTS public.diet_charts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meals JSONB NOT NULL,
    total_nutrients JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_charts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for patients table
CREATE POLICY "Doctors can view all patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

CREATE POLICY "Patients can view their own data" ON public.patients
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

CREATE POLICY "Doctors can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

CREATE POLICY "Doctors can update patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

-- Create policies for foods table (everyone can read, only doctors can write)
CREATE POLICY "Everyone can view foods" ON public.foods
    FOR SELECT USING (true);

CREATE POLICY "Doctors can insert foods" ON public.foods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

CREATE POLICY "Doctors can update foods" ON public.foods
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

-- Create policies for diet_charts table
CREATE POLICY "Doctors can view all diet charts" ON public.diet_charts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

CREATE POLICY "Patients can view their own diet charts" ON public.diet_charts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            WHERE patients.id = diet_charts.patient_id 
            AND patients.user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can insert diet charts" ON public.diet_charts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

CREATE POLICY "Doctors can update diet charts" ON public.diet_charts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.user_type = 'doctor'
        )
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, user_type, license_number, patient_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient'),
        NEW.raw_user_meta_data->>'license_number',
        NEW.raw_user_meta_data->>'patient_id'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample foods
INSERT INTO public.foods (name, category, calories, protein, carbs, fat, fiber, rasa, guna, virya, vipaka, dosha) VALUES
('Rice (White)', 'Grains', 130, 2.7, 28, 0.3, 0.4, 'Sweet', 'Heavy', 'Cold', 'Sweet', 'Balances Vata & Pitta'),
('Moong Dal', 'Pulses', 347, 24, 59, 1.2, 16, 'Sweet', 'Light', 'Cold', 'Sweet', 'Balances all Doshas'),
('Ghee', 'Fats', 900, 0, 0, 100, 0, 'Sweet', 'Heavy', 'Hot', 'Sweet', 'Balances Vata & Pitta'),
('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, 'Astringent', 'Light', 'Cold', 'Pungent', 'Balances Pitta & Kapha'),
('Ginger', 'Spices', 80, 1.8, 18, 0.8, 2, 'Pungent', 'Light', 'Hot', 'Sweet', 'Balances Vata & Kapha'),
('Banana', 'Fruits', 89, 1.1, 23, 0.3, 2.6, 'Sweet', 'Heavy', 'Cold', 'Sweet', 'Balances Vata & Pitta'),
('Turmeric', 'Spices', 312, 9.7, 67, 3.2, 22.7, 'Bitter/Pungent', 'Light', 'Hot', 'Pungent', 'Balances all Doshas'),
('Milk (Cow)', 'Dairy', 61, 3.2, 4.8, 3.3, 0, 'Sweet', 'Heavy', 'Cold', 'Sweet', 'Balances Vata & Pitta'),
('Chapati (Wheat)', 'Grains', 120, 3.5, 25, 1.5, 2.5, 'Sweet', 'Heavy', 'Hot', 'Sweet', 'Balances Vata'),
('Cucumber', 'Vegetables', 15, 0.7, 3.6, 0.1, 0.5, 'Sweet', 'Light', 'Cold', 'Sweet', 'Balances Pitta & Kapha')
ON CONFLICT DO NOTHING;
