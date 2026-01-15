import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { Messages } from '@common/constants';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const zodError = result.error;
      const errors = zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new BadRequestException({
        message: Messages.validationFailed(),
        errors,
      });
    }

    return result.data;
  }
}
