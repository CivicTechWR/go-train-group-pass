-- Function to atomically rebalance trip groups
-- This ensures that group rebalancing happens in a transaction to prevent race conditions

CREATE OR REPLACE FUNCTION rebalance_trip_groups(
  p_trip_id UUID,
  p_new_groups JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group JSONB;
  v_member JSONB;
  v_group_id UUID;
  v_existing_steward_id UUID;
BEGIN
  -- Delete all existing groups for this trip (cascades to memberships)
  DELETE FROM groups WHERE trip_id = p_trip_id;

  -- Insert new groups
  FOR v_group IN SELECT * FROM jsonb_array_elements(p_new_groups)
  LOOP
    -- Extract steward_id if present (can be null)
    v_existing_steward_id := NULL;
    IF v_group ? 'stewardId' AND v_group->>'stewardId' IS NOT NULL THEN
      v_existing_steward_id := (v_group->>'stewardId')::UUID;
    END IF;

    -- Insert new group
    INSERT INTO groups (trip_id, group_number, steward_id, cost_per_person)
    VALUES (
      p_trip_id,
      (v_group->>'groupNumber')::INTEGER,
      v_existing_steward_id,
      (v_group->>'costPerPerson')::DECIMAL
    )
    RETURNING id INTO v_group_id;

    -- Insert group memberships
    FOR v_member IN SELECT * FROM jsonb_array_elements(v_group->'members')
    LOOP
      INSERT INTO group_memberships (group_id, user_id)
      VALUES (v_group_id, (v_member->>'id')::UUID);
    END LOOP;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION rebalance_trip_groups(UUID, JSONB) TO authenticated;
