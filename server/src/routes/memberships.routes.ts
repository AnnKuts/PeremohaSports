import { Router } from 'express';
import { MembershipsController } from '../controllers/memberships.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/authorize';
import {
  membershipIdParamSchema,
  createMembershipSchema,
  updateMembershipSchema
} from '../schemas/memberships.schema';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createMembershipSchema),
  MembershipsController.createMembership
);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(membershipIdParamSchema),
  validate(updateMembershipSchema),
  MembershipsController.updateMembership
);
router.get('/', authenticate, requireAdmin, MembershipsController.getMemberships);
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  validate(membershipIdParamSchema),
  MembershipsController.getMembershipById
);
router.get(
  '/:id/payments',
  authenticate,
  requireAdmin,
  validate(membershipIdParamSchema),
  MembershipsController.getMembershipPayments
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(membershipIdParamSchema),
  MembershipsController.deleteMembership
);

export default router;
