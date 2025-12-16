import { Router } from "express";
import { MembershipsController } from "../controllers/memberships.controller";
import { validate } from "../middlewares/validate";
import { membershipIdParamSchema, createMembershipSchema, updateMembershipSchema } from "../schemas/memberships.schema";

const router = Router();

router.post("/", validate(createMembershipSchema), MembershipsController.createMembership);
router.patch("/:id", validate(membershipIdParamSchema), validate(updateMembershipSchema), MembershipsController.updateMembership);
router.get("/", MembershipsController.getMemberships);
router.get("/:id", validate(membershipIdParamSchema), MembershipsController.getMembershipById);
router.get("/client/:clientId", MembershipsController.getMembershipsByClient);
router.get("/:id/payments", validate(membershipIdParamSchema), MembershipsController.getMembershipPayments);
router.delete("/:id", validate(membershipIdParamSchema), MembershipsController.deleteMembership);

export default router;