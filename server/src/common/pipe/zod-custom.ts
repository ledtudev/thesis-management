import { errorMessages } from 'src/common/constant/errors';
import { z } from 'zod';

// Helper function to add custom issue
const addCustomIssue = (ctx, paramName: string, errorMessage: string) =>
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: `${paramName} ${errorMessage}`,
  }) && z.NEVER;

// Generic function for preprocessing string to a target Zod type
const stringToType = <T extends z.ZodTypeAny>(
  paramName: string,
  parser: (val: string) => any,
  errorMessage: string,
  targetSchema: T,
) =>
  z.preprocess(
    (val) => {
      if (typeof val !== 'string') {
        return val;
      }
      try {
        const parsed = parser(val);
        return parsed;
      } catch {
        return val;
      }
    },
    targetSchema.refine((val) => val !== undefined && !isNaN(val), {
      message: `${paramName} ${errorMessage}`,
    }),
  );

// String to Number
export const stringToNumber = (paramName: string) =>
  stringToType(
    paramName,
    (val) => {
      const parsed = parseInt(val, 10);
      return parsed;
    },
    errorMessages.invalidNumber,
    z.number({
      invalid_type_error: `${paramName} ${errorMessages.invalidNumber}`,
    }),
  );

// String to Boolean
export const stringToBoolean = (paramName: string) =>
  stringToType(
    paramName,
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    },
    errorMessages.invalidBoolean,
    z.boolean({
      invalid_type_error: `${paramName} ${errorMessages.invalidBoolean}`,
    }),
  );

// String to Date
export const stringToDate = (paramName: string) =>
  z
    .preprocess(
      (val) => {
        if (typeof val === 'string') {
          const parsed = new Date(val);
          return isNaN(parsed.getTime()) ? undefined : parsed;
        }
        return val;
      },
      z.date({
        invalid_type_error: `${paramName} ${errorMessages.invalidDate}`,
      }),
    )
    .refine((val) => val !== undefined, {
      message: `${paramName} ${errorMessages.invalidDate}`,
    });

// String to Object
export const stringToObject = (paramName: string) =>
  z
    .preprocess(
      (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return undefined;
          }
        }
        return val;
      },
      z.object(
        {},
        { invalid_type_error: `${paramName} ${errorMessages.invalidObject}` },
      ),
    )
    .refine((val) => val !== undefined, {
      message: `${paramName} ${errorMessages.invalidObject}`,
    });
