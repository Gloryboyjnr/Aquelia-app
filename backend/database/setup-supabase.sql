-- Supabase Database Setup for Aquelia Production Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  address TEXT,
  subscription_plan VARCHAR(20) DEFAULT 'basic',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP Verifications table
CREATE TABLE otp_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Transactions table
CREATE TABLE payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Records table
CREATE TABLE production_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  operator_name VARCHAR(255) NOT NULL,
  bags_produced INTEGER NOT NULL DEFAULT 0,
  bundles_produced INTEGER NOT NULL DEFAULT 0,
  raw_material_used DECIMAL(10,2) NOT NULL DEFAULT 0,
  shift VARCHAR(20),
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Items table
CREATE TABLE inventory_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Control Records table
CREATE TABLE quality_control_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  check_type VARCHAR(100) NOT NULL,
  parameters JSONB,
  results JSONB,
  passed BOOLEAN DEFAULT TRUE,
  inspector_name VARCHAR(255),
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Records table
CREATE TABLE sales_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  product_type VARCHAR(100),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_companies_phone ON companies(phone_number);
CREATE INDEX idx_otp_phone_expires ON otp_verifications(phone_number, expires_at);
CREATE INDEX idx_payment_transactions_company ON payment_transactions(company_id);
CREATE INDEX idx_production_records_company_date ON production_records(company_id, date);
CREATE INDEX idx_inventory_items_company ON inventory_items(company_id);
CREATE INDEX idx_quality_control_company_date ON quality_control_records(company_id, date);
CREATE INDEX idx_sales_records_company_date ON sales_records(company_id, sale_date);

-- Row Level Security (RLS) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_control_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Note: You'll need to create appropriate RLS policies based on your authentication system
-- Example policy (adjust based on your auth implementation):
-- CREATE POLICY "Users can only access their company data" ON production_records
--   FOR ALL USING (company_id = auth.jwt() ->> 'company_id');