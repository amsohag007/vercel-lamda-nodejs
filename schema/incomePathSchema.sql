-- Define the enum type for 'type'
CREATE TYPE income_path_type AS ENUM ('basic', 'advanced');

-- Create the income_paths table
CREATE TABLE income_paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Foreign key referencing users
    type income_path_type NOT NULL, -- Use the enum type
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Both Basic and Advanced fields
    retirement_age INTEGER,
    retirement_income_assets DECIMAL(15, 2),
    first_year_income DECIMAL(15, 2),

    -- Basic fields
    spending_flexibility DECIMAL(5, 2),
    equity_allocation DECIMAL(5, 2),
    annuity_payout_rate DECIMAL(5, 2),

    -- Advanced fields
    annuity_income DECIMAL(15, 2),
    spending_flexibility_increase DECIMAL(5, 2),
    spending_flexibility_decrease DECIMAL(5, 2),
    allocation_to_stocks DECIMAL(5, 2),
    social_security DECIMAL(15, 2),
    inflation_adjustment DECIMAL(5, 2),
    social_security_claiming_age INTEGER,
    pension_benefit DECIMAL(15, 2),
    pension_benefit_start_age INTEGER
);
