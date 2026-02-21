import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateUserInput, UpdateUserInput } from '../validations/user';
import { UserRole } from '@prisma/client';

export const userService = {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  },

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) throw new AppError(409, 'Email already registered');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role as UserRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id);
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email.toLowerCase(), NOT: { id } },
      });
      if (existing) throw new AppError(409, 'Email already in use');
      updateData.email = data.email.toLowerCase();
    }
    if (data.role) updateData.role = data.role;
    return prisma.user.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.user.update>[0]['data'],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async delete(id: string) {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
    return { success: true };
  },
};
