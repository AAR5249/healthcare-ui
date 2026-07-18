-- RLS Policies for users table
CREATE POLICY "users_select_own" ON users FOR SELECT
    TO authenticated USING (auth.uid()::uuid = id);

CREATE POLICY "users_update_own" ON users FOR UPDATE
    TO authenticated USING (auth.uid()::uuid = id);

-- RLS Policies for refresh_tokens table
CREATE POLICY "refresh_tokens_select_own" ON refresh_tokens FOR SELECT
    TO authenticated USING (auth.uid()::uuid = user_id);

CREATE POLICY "refresh_tokens_insert_own" ON refresh_tokens FOR INSERT
    TO authenticated WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "refresh_tokens_delete_own" ON refresh_tokens FOR DELETE
    TO authenticated USING (auth.uid()::uuid = user_id);

-- RLS Policies for appointments table
CREATE POLICY "appointments_select_own" ON appointments FOR SELECT
    TO authenticated USING (auth.uid()::uuid = patient_id OR auth.uid()::uuid = doctor_id);

CREATE POLICY "appointments_insert_own" ON appointments FOR INSERT
    TO authenticated WITH CHECK (auth.uid()::uuid = patient_id);

CREATE POLICY "appointments_update_own" ON appointments FOR UPDATE
    TO authenticated USING (auth.uid()::uuid = patient_id OR auth.uid()::uuid = doctor_id);

CREATE POLICY "appointments_delete_own" ON appointments FOR DELETE
    TO authenticated USING (auth.uid()::uuid = patient_id);

-- RLS Policies for time_slots table
CREATE POLICY "time_slots_select_all" ON time_slots FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "time_slots_insert_doctor" ON time_slots FOR INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY "time_slots_update_doctor" ON time_slots FOR UPDATE
    TO authenticated USING (true);

-- RLS Policies for notifications table
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
    TO authenticated USING (auth.uid()::uuid = user_id);

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
    TO authenticated USING (auth.uid()::uuid = user_id);

CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
    TO authenticated USING (auth.uid()::uuid = user_id);
