import { BadRequestException } from '@nestjs/common';
import { STAGES, type Stage } from './board.types.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_INT = 2_147_483_647;

export function parseId(raw: string, name = 'id'): number {
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id < 1 || id > MAX_INT) {
    throw new BadRequestException(`${name} must be a positive integer`);
  }
  return id;
}

export function parseText(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException(`${field} is required`);
  }
  const text = value.trim();
  if (text.length > max)
    throw new BadRequestException(`${field} must be at most ${max} characters`);
  return text;
}

export function parseOptionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new BadRequestException(`${field} must be a string`);
  return parseText(value, field, max);
}

export function parseEmail(value: unknown, field = 'candidateEmail'): string {
  const email = parseText(value, field, MAX_EMAIL_LENGTH).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new BadRequestException(`${field} must be a valid email address`);
  }
  return email;
}

export function parseInteger(value: unknown, field: string, min: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > MAX_INT) {
    throw new BadRequestException(`${field} must be an integer of at least ${min}`);
  }
  return value;
}

export function parseStage(value: unknown): Stage {
  if (typeof value !== 'string' || !STAGES.includes(value as Stage)) {
    throw new BadRequestException(`stage must be one of ${STAGES.join(', ')}`);
  }
  return value as Stage;
}

export function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException('request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}
