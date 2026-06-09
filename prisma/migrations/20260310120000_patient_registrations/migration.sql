-- Patient one-time registration & consent records
CREATE TABLE IF NOT EXISTS "patient_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "reg_number" TEXT NOT NULL,
    "form_data" JSON NOT NULL,
    "patient_signature" TEXT,
    "signer_type" TEXT NOT NULL DEFAULT 'patient',
    "kairali_rep_signature" TEXT,
    "signed_at" DATETIME NOT NULL,
    "signed_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patient_registrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "patient_registrations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "patient_registrations_patient_id_key" ON "patient_registrations"("patient_id");
CREATE INDEX IF NOT EXISTS "patient_registrations_tenant_id_idx" ON "patient_registrations"("tenant_id");
