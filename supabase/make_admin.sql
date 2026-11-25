-- ============================================================================
-- FURCHO - Grant ADMIN role to the Supabase Auth user created in the dashboard
-- Run AFTER 001_initial_schema.sql and 002_rls_policies.sql
-- ============================================================================

INSERT INTO profiles (id, full_name, email, role, is_active)
SELECT id, 'Furcho Admin', email, 'ADMIN', TRUE
FROM auth.users
WHERE email = 'admin@furcho.in'
ON CONFLICT (id) DO UPDATE
  SET role = 'ADMIN', is_active = TRUE, updated_at = NOW();

-- Verify
SELECT id, email, role, is_active FROM profiles WHERE email = 'admin@furcho.in';
