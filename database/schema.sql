-- AyurvaFlow CMS — PostgreSQL schema
-- Multi-tenant Ayurveda clinic management system

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE tenant_plan AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'receptionist', 'doctor', 'therapist');
CREATE TYPE gender AS ENUM ('M', 'F', 'other');
CREATE TYPE patient_status AS ENUM ('active', 'completed', 'inactive');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE treatment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('paid', 'partial', 'unpaid');

-- ─── Core ────────────────────────────────────────────────────────────────────

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  subdomain     VARCHAR(100) NOT NULL UNIQUE,
  custom_domain VARCHAR(255),
  plan          tenant_plan NOT NULL DEFAULT 'starter',
  status        tenant_status NOT NULL DEFAULT 'active',
  settings      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role            user_role NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  phone           VARCHAR(20),
  password_hash   TEXT NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  specialization  VARCHAR(200),
  experience      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login      TIMESTAMPTZ,
  join_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);

-- ─── Patients ────────────────────────────────────────────────────────────────

CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_code    VARCHAR(20) NOT NULL,
  name            VARCHAR(200) NOT NULL,
  age             INTEGER NOT NULL,
  gender          gender NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  email           VARCHAR(255),
  city            VARCHAR(100),
  occupation      VARCHAR(150),
  nationality     VARCHAR(100),
  referral_source VARCHAR(100),
  purpose         VARCHAR(200),
  prakriti        VARCHAR(50),
  status          patient_status NOT NULL DEFAULT 'active',
  balance         NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_visit      DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, patient_code)
);

CREATE INDEX idx_patients_tenant ON patients(tenant_id);

-- ─── Appointments ────────────────────────────────────────────────────────────

CREATE TABLE appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  doctor_name VARCHAR(200) NOT NULL,
  date        DATE NOT NULL,
  time        VARCHAR(10) NOT NULL,
  type        VARCHAR(100) NOT NULL,
  status      appointment_status NOT NULL DEFAULT 'scheduled',
  duration    INTEGER NOT NULL DEFAULT 45,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);

-- ─── Consultations ───────────────────────────────────────────────────────────

CREATE TABLE consultations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE SET NULL,
  complaints     TEXT,
  duration       VARCHAR(50),
  history        TEXT,
  allergies      TEXT,
  pulse          VARCHAR(200),
  tongue         VARCHAR(200),
  eyes           VARCHAR(200),
  skin           VARCHAR(200),
  prakriti       VARCHAR(50),
  vikruti        VARCHAR(50),
  condition      VARCHAR(200),
  therapy        VARCHAR(100),
  sessions       INTEGER,
  medicines      TEXT,
  diet           TEXT,
  lifestyle      TEXT,
  follow_up      VARCHAR(50),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultations_tenant ON consultations(tenant_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);

-- ─── Treatment plans ─────────────────────────────────────────────────────────

CREATE TABLE treatment_plans (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  consultation_id    UUID REFERENCES consultations(id) ON DELETE SET NULL,
  type               VARCHAR(100) NOT NULL,
  condition          VARCHAR(200) NOT NULL,
  total_sessions     INTEGER NOT NULL,
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  start_date         DATE NOT NULL,
  end_date           DATE,
  doctor_name        VARCHAR(200) NOT NULL,
  status             treatment_status NOT NULL DEFAULT 'active',
  cost               NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatment_plans_tenant ON treatment_plans(tenant_id);
CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id);

-- ─── Invoices ────────────────────────────────────────────────────────────────

CREATE TABLE invoices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  items      JSONB NOT NULL DEFAULT '[]',
  subtotal   NUMERIC(12,2) NOT NULL,
  tax        NUMERIC(12,2) NOT NULL,
  total      NUMERIC(12,2) NOT NULL,
  paid       NUMERIC(12,2) NOT NULL DEFAULT 0,
  status     invoice_status NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);

-- ─── Row-level security (multi-tenant) ───────────────────────────────────────

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Example policy (apply per table):
-- CREATE POLICY tenant_isolation ON patients
--   USING (tenant_id = current_setting('app.tenant_id')::uuid);
