import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZodSchema } from 'zod'; // Import ZodSchema
import { ZOD_RESPONSE_SCHEMA } from '../decorators/serialize.decorator';
import { createResponseSchema } from '../schemas/response.schemas';

// 1. Define the shape of a NestJS-Zod compatible DTO Class
interface ZodDto {
  zodSchema: ZodSchema;
}

// 2. Define the shape of the potential response data to avoid "unsafe member access"
interface ResponseEnvelope {
  data?: unknown;
  meta?: unknown;
  message?: string;
}

@Injectable()
export class ResponseSerializeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // 3. Explicitly type the Reflector result
        let schema = this.reflector.getAllAndOverride<
          ZodSchema | ZodDto | undefined
        >(ZOD_RESPONSE_SCHEMA, [context.getHandler(), context.getClass()]);

        // Pass-through if no schema is defined
        if (!schema) {
          return data;
        }

        // 4. Type Guard: Check if it is a DTO class with a static zodSchema
        if ('zodSchema' in schema) {
          schema = schema.zodSchema;
        }

        // 5. Safe Data Access: Cast data to a known shape to read properties
        // We assume 'data' is an object if we are trying to access .data/.meta
        const dataObj =
          data && typeof data === 'object' ? (data as ResponseEnvelope) : null;

        const responseObj = {
          data: dataObj?.data || data, // Unwrapping if already wrapped, or raw data
          meta: dataObj?.meta,
          message: dataObj?.message || '',
        };

        const finalSchema = createResponseSchema(schema);

        return finalSchema.parse(responseObj);
      }),
    );
  }
}
