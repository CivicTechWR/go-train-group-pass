-- GO Train Group Pass Coordination App - Group Rebalancing Transaction
-- Migration: 002
-- Description: Add atomic group rebalancing function with transaction support

-- ============================================================================
-- ATOMIC GROUP REBALANCING FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION rebalance_trip_groups(
  p_trip_id UUID,
  p_new_groups JSONB -- Array of {groupNumber, members: [{id, displayName}], costPerPerson, stewardId?}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group JSONB;
  v_member JSONB;
  v_new_group_id UUID;
  v_result JSONB;
BEGIN
  -- Start transaction (implicit in function)

  -- Delete all existing groups for this trip (cascades to memberships)
  DELETE FROM groups WHERE trip_id = p_trip_id;

  -- Insert new groups and memberships
  FOR v_group IN SELECT * FROM jsonb_array_elements(p_new_groups)
  LOOP
    -- Insert group
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

    -- Insert members for this group
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

  -- Return success with new group count
  v_result := jsonb_build_object(
    'success', true,
    'groupsCreated', jsonb_array_length(p_new_groups)
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RAISE EXCEPTION 'Group rebalancing failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION rebalance_trip_groups(UUID, JSONB) TO authenticated;

-- ============================================================================
-- HELPER FUNCTION: Get current group state for a trip
-- ============================================================================
CREATE OR REPLACE FUNCTION get_trip_group_state(p_trip_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
