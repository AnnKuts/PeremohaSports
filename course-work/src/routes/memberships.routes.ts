import { Router } from "express";
import { MembershipsController } from "../controllers/memberships.controller";

const router = Router();

router.get("/", MembershipsController.getMemberships);
router.get("/:id", MembershipsController.getMembershipById);
router.get("/:id/payments", MembershipsController.getMembershipPayments);
router.delete("/:id", MembershipsController.deleteMembership);

export default router;