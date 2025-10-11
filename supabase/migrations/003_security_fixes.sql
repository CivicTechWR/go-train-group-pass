-- GO Train Group Pass Coordination App - Security Fixes
-- Migration: 003_security_fixes
-- Created: 2025-10-11
-- Fixes security issues identified by Supabase advisor

-- ============================================================================
-- Fix 1: Add RLS policies for fare_inspection_alerts
-- ============================================================================
CREATE POLICY "Anyone can view fare inspection alerts"
  ON fare_inspection_alerts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can trigger alerts"
  ON fare_inspection_alerts FOR INSERT
  WITH CHECK (auth.uid() = triggered_by_user_id);

-- ============================================================================
-- Fix 2: Add RLS policies for alert_acknowledgments
-- ============================================================================
CREATE POLICY "Anyone can view alert acknowledgments"
  ON alert_acknowledgments FOR SELECT USING (true);

CREATE POLICY "Users can acknowledge alerts for themselves"
  ON alert_acknowledgments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Fix 3: Enable RLS on trains table (read-only public schedule data)
-- ============================================================================
ALTER TABLE trains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Train schedules are publicly viewable"
  ON trains FOR SELECT USING (true);

-- Only admins can modify train schedules (future admin panel)
CREATE POLICY "Only admins can modify train schedules"
  ON trains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_community_admin = true
    )
  );

-- ============================================================================
-- Fix 4: Set search_path on security definer functions
-- ============================================================================
DROP FUNCTION IF EXISTS rebalance_trip_groups(UUID, JSONB);
DROP FUNCTION IF EXISTS get_trip_group_state(UUID);

CREATE OR REPLACE FUNCTION rebalance_trip_groups(
  p_trip_id UUID,
  p_new_groups JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group JSONB;
  v_member JSONB;
  v_new_group_id UUID;
  v_result JSONB;
BEGIN
  DELETE FROM groups WHERE trip_id = p_trip_id;

  FOR v_group IN SELECT * FROM jsonb_array_elements(p_new_groups)
  LOOP
    INSERT INTO groups (
      trip_id,
      group_number,
      cost_per_person,
      steward_id
    ) VALUES (
      p_trip_id,
      (v_group->>'groupNumber')::INTEGER,
      (v_group->>'costPerPerson')::DECIMAL(5,2),
      CASE
        WHEN v_group->>'stewardId' IS NOT NULL THEN (v_group->>'stewardId')::UUID
        ELSE NULL
      END
    )
    RETURNING id INTO v_new_group_id;

    FOR v_member IN SELECT * FROM jsonb_array_elements(v_group->'members')
    LOOP
      INSERT INTO group_memberships (
        group_id,
        user_id
      ) VALUES (
        v_new_group_id,
        (v_member->>'id')::UUID
      );
    END LOOP;
  END LOOP;

  v_result := jsonb_build_object(
    'success', true,
    'groupsCreated', jsonb_array_length(p_new_groups)
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Group rebalancing failed: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION rebalance_trip_groups(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION get_trip_group_state(p_trip_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'groupId', g.id,
      'groupNumber', g.group_number,
      'stewardId', g.steward_id,
      'costPerPerson', g.cost_per_person,
      'members', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', gm.user_id,
            'displayName', p.display_name,
            'coachNumber', gm.coach_number,
            'coachLevel', gm.coach_level,
            'paymentSent', gm.payment_marked_sent_at IS NOT NULL
          )
        )
        FROM group_memberships gm
        JOIN profiles p ON p.id = gm.user_id
        WHERE gm.group_id = g.id
      )
    )
  )
  INTO v_result
  FROM groups g
  WHERE g.trip_id = p_trip_id
  ORDER BY g.group_number;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION get_trip_group_state(UUID) TO authenticated;

COMMENT ON FUNCTION rebalance_trip_groups IS 'Atomically delete and recreate groups for a trip with proper transaction support';
COMMENT ON FUNCTION get_trip_group_state IS 'Get current group state including members and steward assignments';
