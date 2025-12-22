-- CreateIndex
CREATE INDEX "class_session_room_id_idx" ON "class_session"("room_id");

-- CreateIndex
CREATE INDEX "class_session_trainer_id_idx" ON "class_session"("trainer_id");

-- CreateIndex
CREATE INDEX "class_session_class_type_id_date_idx" ON "class_session"("class_type_id", "date") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "class_type_name_idx" ON "class_type"("name") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "class_type_level_idx" ON "class_type"("level");

-- CreateIndex
CREATE INDEX "client_contact_data_id_idx" ON "client"("contact_data_id") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "gym_address_idx" ON "gym"("address") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "membership_client_id_class_type_id_idx" ON "membership"("client_id", "class_type_id") WHERE status =  'active';

-- CreateIndex
CREATE INDEX "payment_client_id_status_idx" ON "payment"("client_id", "status") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "payment_membership_id_idx" ON "payment"("membership_id");

-- CreateIndex
CREATE INDEX "room_gym_id_idx" ON "room"("gym_id") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "trainer_contact_data_id_idx" ON "trainer"("contact_data_id") WHERE is_deleted =  false;

-- CreateIndex
CREATE INDEX "trainer_first_name_last_name_idx" ON "trainer"("first_name", "last_name");
