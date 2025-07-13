import { Prisma } from '@prisma/client';

export function processDynamicFilters(
  filters: Record<string, any>,
): Prisma.FieldPoolWhereInput {
  const whereInput: Prisma.FieldPoolWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value !== 'object' || value === null) {
      whereInput[key] = value;
      continue;
    }

    if ('field' in value && 'value' in value) {
      const { field, operator = 'equals', value: filterValue } = value;

      switch (operator) {
        case 'equals':
          whereInput[field] = { equals: filterValue };
          break;
        case 'not_equals':
          whereInput[field] = { not: filterValue };
          break;
        case 'contains':
          whereInput[field] = { contains: filterValue, mode: 'insensitive' };
          break;
        case 'starts_with':
          whereInput[field] = { startsWith: filterValue };
          break;
        case 'ends_with':
          whereInput[field] = { endsWith: filterValue };
          break;
        case 'gt':
          whereInput[field] = { gt: filterValue };
          break;
        case 'gte':
          whereInput[field] = { gte: filterValue };
          break;
        case 'lt':
          whereInput[field] = { lt: filterValue };
          break;
        case 'lte':
          whereInput[field] = { lte: filterValue };
          break;
        case 'in':
          whereInput[field] = { in: filterValue };
          break;
        case 'not_in':
          whereInput[field] = { notIn: filterValue };
          break;
      }
    } else {
      whereInput[key] = value;
    }
  }

  return whereInput;
}
