import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from '../../src/services/attendance.service';
import AppError from '../../src/utils/AppError';

describe('AttendanceService (unit)', () => {
  let mockRepo: any;
  let service: AttendanceService;

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(async () => ({ attendances: [], total: 0 })),
      findById: vi.fn(async (sessionId, clientId) =>
        sessionId === 1 && clientId === 1 ? { sessionId, clientId, status: 'booked' } : null
      ),
      findBySessionId: vi.fn(async (sessionId) => [{ sessionId, clientId: 1 }]),
      delete: vi.fn(async (sessionId, clientId) => ({ sessionId, clientId })),
      create: vi.fn(async (sessionId, clientId, status) => ({ sessionId, clientId, status })),
      getSessionWithRoomAndClassType: vi.fn(async (sessionId) =>
        sessionId === 1 ? { room_id: 1, class_type_id: 1 } : null
      ),
      isClassTypeAllowedInRoom: vi.fn(async () => true),
      hasActiveMembershipForClassType: vi.fn(async () => true),
      updateStatus: vi.fn(async (sessionId, clientId, newStatus) => ({
        sessionId,
        clientId,
        status: newStatus
      }))
    };
    service = new AttendanceService(mockRepo);
  });

  it('getAllAttendances: returns empty array', async () => {
    const result = await service.getAllAttendances();
    expect(result).toEqual({ attendances: [], total: 0 });
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it('getAttendanceById: returns attendance if found', async () => {
    const result = await service.getAttendanceById(1, 1);
    expect(result).toHaveProperty('sessionId', 1);
    expect(result).toHaveProperty('clientId', 1);
  });

  it('getAttendanceById: throws if not found', async () => {
    await expect(service.getAttendanceById(2, 2)).rejects.toThrow(AppError);
  });

  it('getAttendancesBySessionId: returns attendances', async () => {
    const result = await service.getAttendancesBySessionId(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('sessionId', 1);
  });

  it('deleteAttendance: deletes if found', async () => {
    const result = await service.deleteAttendance(1, 1);
    expect(result.success).toBe(true);
    expect(result.deletedAttendance).toHaveProperty('sessionId', 1);
  });

  it('deleteAttendance: throws if not found', async () => {
    await expect(service.deleteAttendance(2, 2)).rejects.toThrow(AppError);
  });

  it('createAttendance: success', async () => {
    const result = await service.createAttendance(1, 1);
    expect(result.success).toBe(true);
    expect(result.attendance).toHaveProperty('status', 'booked');
  });

  it("createAttendance: calls repo.create with status 'booked'", async () => {
    await service.createAttendance(1, 1);
    expect(mockRepo.create).toHaveBeenCalledWith(1, 1, 'booked');
  });

  it('createAttendance: if session not found, does not check allowed/membership', async () => {
    mockRepo.getSessionWithRoomAndClassType.mockResolvedValueOnce(null);
    await expect(service.createAttendance(99, 1)).rejects.toThrow(AppError);
    expect(mockRepo.isClassTypeAllowedInRoom).not.toHaveBeenCalled();
    expect(mockRepo.hasActiveMembershipForClassType).not.toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('createAttendance: maps prisma error via handlePrismaError', async () => {
    mockRepo.create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(service.createAttendance(1, 1)).rejects.toBeInstanceOf(AppError);
  });

  it('createAttendance: throws if session not found', async () => {
    mockRepo.getSessionWithRoomAndClassType.mockResolvedValueOnce(null);
    await expect(service.createAttendance(2, 1)).rejects.toThrow('Session not found');
  });

  it('createAttendance: throws if class type not allowed', async () => {
    mockRepo.isClassTypeAllowedInRoom.mockResolvedValueOnce(false);
    await expect(service.createAttendance(1, 1)).rejects.toThrow('not allowed in this room');
  });

  it('createAttendance: throws if no active membership', async () => {
    mockRepo.hasActiveMembershipForClassType.mockResolvedValueOnce(false);
    await expect(service.createAttendance(1, 1)).rejects.toThrow(
      'does not have an active membership'
    );
  });

  it('updateAttendanceStatus: updates if valid', async () => {
    mockRepo.findById.mockResolvedValueOnce({ sessionId: 1, clientId: 1, status: 'booked' });
    const result = await service.updateAttendanceStatus(1, 1, 'attended');
    expect(result).toHaveProperty('status', 'attended');
  });

  it('updateAttendanceStatus: calls repo.updateStatus with new status', async () => {
    mockRepo.findById.mockResolvedValueOnce({ sessionId: 1, clientId: 1, status: 'booked' });
    await service.updateAttendanceStatus(1, 1, 'missed');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 1, 'missed');
  });

  it('updateAttendanceStatus: throws if not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    await expect(service.updateAttendanceStatus(2, 2, 'attended')).rejects.toThrow(
      'Attendance record not found'
    );
  });

  it('updateAttendanceStatus: throws if already attended and trying to change', async () => {
    mockRepo.findById.mockResolvedValueOnce({ sessionId: 1, clientId: 1, status: 'attended' });
    await expect(service.updateAttendanceStatus(1, 1, 'booked')).rejects.toThrow(
      "Cannot change status from 'attended'"
    );
  });

  it('updateAttendanceStatus: throws if status is already the same', async () => {
    mockRepo.findById.mockResolvedValueOnce({ sessionId: 1, clientId: 1, status: 'booked' });
    await expect(service.updateAttendanceStatus(1, 1, 'booked')).rejects.toThrow(
      "Status is already 'booked'"
    );
  });
});
