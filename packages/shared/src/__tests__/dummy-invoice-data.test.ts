import { InvoiceStatus } from '../invoice-status.js';
import {
  addDays,
  deriveStatusFromDueDate,
  diffDaysFromToday,
  generateRandomAmount,
  randomDueDateFromToday,
  randomDueDateFromTwoDaysAgo,
  startOfDay,
} from '../dummy-invoice-data.js';

const TODAY = new Date('2026-06-16T15:30:00.000Z');

describe('diffDaysFromToday', () => {
  it('should return 0 for same day', () => {
    expect(diffDaysFromToday(TODAY, TODAY)).toBe(0);
  });

  it('should return negative for past dates', () => {
    expect(diffDaysFromToday(addDays(TODAY, -2), TODAY)).toBe(-2);
  });

  it('should return positive for future dates', () => {
    expect(diffDaysFromToday(addDays(TODAY, 5), TODAY)).toBe(5);
  });
});

describe('deriveStatusFromDueDate', () => {
  it('should return AL_DIA for today and future', () => {
    expect(deriveStatusFromDueDate(TODAY, TODAY)).toBe(InvoiceStatus.AL_DIA);
    expect(deriveStatusFromDueDate(addDays(TODAY, 10), TODAY)).toBe(InvoiceStatus.AL_DIA);
  });

  it('should return PRIMER_RECORDATORIO for 1-7 days overdue', () => {
    expect(deriveStatusFromDueDate(addDays(TODAY, -1), TODAY)).toBe(
      InvoiceStatus.PRIMER_RECORDATORIO,
    );
    expect(deriveStatusFromDueDate(addDays(TODAY, -7), TODAY)).toBe(
      InvoiceStatus.PRIMER_RECORDATORIO,
    );
  });

  it('should return SEGUNDO_RECORDATORIO for 8-21 days overdue', () => {
    expect(deriveStatusFromDueDate(addDays(TODAY, -8), TODAY)).toBe(
      InvoiceStatus.SEGUNDO_RECORDATORIO,
    );
    expect(deriveStatusFromDueDate(addDays(TODAY, -21), TODAY)).toBe(
      InvoiceStatus.SEGUNDO_RECORDATORIO,
    );
  });

  it('should return DESACTIVADO for more than 21 days overdue', () => {
    expect(deriveStatusFromDueDate(addDays(TODAY, -22), TODAY)).toBe(InvoiceStatus.DESACTIVADO);
  });
});

describe('randomDueDateFromTwoDaysAgo', () => {
  it('should stay within range when random is mocked', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const date = randomDueDateFromTwoDaysAgo({ today: TODAY });
    expect(diffDaysFromToday(date, TODAY)).toBe(-2);
    randomSpy.mockRestore();
  });

  it('should reach max 7 days ahead when random is mocked to 1', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.999);
    const date = randomDueDateFromTwoDaysAgo({ today: TODAY });
    expect(diffDaysFromToday(date, TODAY)).toBe(7);
    randomSpy.mockRestore();
  });
});

describe('randomDueDateFromToday', () => {
  it('should not return past dates', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const date = randomDueDateFromToday({ today: TODAY });
    expect(diffDaysFromToday(date, TODAY)).toBe(0);
    randomSpy.mockRestore();
  });

  it('should not exceed 7 days ahead by default', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.999);
    const date = randomDueDateFromToday({ today: TODAY });
    expect(diffDaysFromToday(date, TODAY)).toBe(7);
    randomSpy.mockRestore();
  });
});

describe('generateRandomAmount', () => {
  it('should return multiples of 10000 within range', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const amount = generateRandomAmount();
    expect(amount % 10_000).toBe(0);
    expect(amount).toBeGreaterThanOrEqual(50_000);
    expect(amount).toBeLessThanOrEqual(900_000);
    randomSpy.mockRestore();
  });
});

describe('startOfDay', () => {
  it('should zero out time components', () => {
    const date = startOfDay(new Date('2026-06-16T23:59:59.999Z'));
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });
});
