-- Database schema for Aquelia production management system
-- This is a PostgreSQL schema example

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  address TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP verification table
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production records table
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  operator_name VARCHAR(255) NOT NULL,
  bags_produced INTEGER NOT NULL,
  bundles_produced INTEGER NOT NULL,
  raw_material_used DECIMAL(10,2) NOT NULL,
  shift VARCHAR(50),
  notes TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'rolls' or 'packingBags'
  quantity INTEGER NOT NULL,
  micron_type INTEGER,
  manufacturer_name VARCHAR(255),
  notes TEXT,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales records table
CREATE TABLE sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'supply' or 'factory'
  supplier_name VARCHAR(255),
  trip_number INTEGER,
  bags_taken INTEGER NOT NULL,
  price_per_bag DECIMAL(10,2) NOT NULL,
  revenue DECIMAL(10,2) NOT NULL,
  leakages INTEGER DEFAULT 0,
  bags_returned INTEGER DEFAULT 0,
  accumulated_leakages INTEGER DEFAULT 0,
  notes TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reference VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality control records table
CREATE TABLE quality_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'equipment', 'qa_parameters', 'in_process', 'attendance'
  data JSONB NOT NULL,
  recorded_by VARCHAR(255),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_companies_phone ON companies(phone_number);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_production_company_date ON production_records(company_id, date);
CREATE INDEX idx_inventory_company ON inventory_items(company_id);
CREATE INDEX idx_sales_company_date ON sales_records(company_id, date);
CREATE INDEX idx_payments_company ON payment_transactions(company_id);
CREATE INDEX idx_quality_company_date ON quality_records(company_id, date);