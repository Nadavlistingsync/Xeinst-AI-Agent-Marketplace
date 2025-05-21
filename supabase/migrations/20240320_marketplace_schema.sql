-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    stripe_customer_id TEXT,
    stripe_account_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Modify products table
ALTER TABLE products
ADD COLUMN uploaded_by UUID REFERENCES users(id),
ADD COLUMN is_public BOOLEAN DEFAULT true,
ADD COLUMN earnings_split DECIMAL(3,2) DEFAULT 0.70, -- 70% to creator by default
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN download_count INTEGER DEFAULT 0,
ADD COLUMN average_rating DECIMAL(3,2),
ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(product_id, user_id)
);

-- Create earnings table to track creator payouts
CREATE TABLE earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    stripe_transfer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Update RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Only show public products by default
CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (is_public = true);

-- Creators can view their own products regardless of public status
CREATE POLICY "Creators can view own products" ON products
    FOR SELECT USING (auth.uid() = uploaded_by);

-- Creators can update their own products
CREATE POLICY "Creators can update own products" ON products
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Anyone can create a product
CREATE POLICY "Anyone can create products" ON products
    FOR INSERT WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Earnings policies
CREATE POLICY "Users can view own earnings" ON earnings
    FOR SELECT USING (auth.uid() = user_id);

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews
            WHERE product_id = NEW.product_id
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating on review changes
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating(); 