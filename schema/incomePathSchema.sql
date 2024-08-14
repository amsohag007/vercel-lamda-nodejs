-- Define the enum type for 'type'
CREATE TYPE income_path_type AS ENUM ('basic', 'advanced');

-- Create the income_paths table
CREATE TABLE income_paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Foreign key referencing users
    type income_path_type DEFAULT NULL, -- Use the enum type
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT NULL,

    -- Both Basic and Advanced fields
    retirement_age INTEGER,
    retirement_income_assets DOUBLE PRECISION,
    first_year_income DOUBLE PRECISION,

    -- Basic fields
    spending_flexibility DOUBLE PRECISION,
    equity_allocation DOUBLE PRECISION,
    annuity_payout_rate DOUBLE PRECISION,

    -- Advanced fields
    annuity_income DOUBLE PRECISION,
    spending_flexibility_increase DOUBLE PRECISION,
    spending_flexibility_decrease DOUBLE PRECISION,
    allocation_to_stocks DOUBLE PRECISION,
    social_security DOUBLE PRECISION,
    inflation_adjustment DOUBLE PRECISION,
    social_security_claiming_age INTEGER,
    pension_benefit DOUBLE PRECISION,
    pension_benefit_start_age INTEGER
);
