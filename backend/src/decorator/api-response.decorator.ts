import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

interface ApiGenericResponseOptions {
  isArray?: boolean;
  status?: number;
}

// Khai báo dạng 1: KHÔNG có model
export function ApiGenericResponse(
  description?: string,
  options?: ApiGenericResponseOptions,
): MethodDecorator;

// Khai báo dạng 2: CÓ model
export function ApiGenericResponse<TModel extends Type<any>>(
  model: TModel,
  description?: string,
  options?: ApiGenericResponseOptions,
): MethodDecorator;

// Implementation
export function ApiGenericResponse(
  modelOrDescription?: any,
  descriptionOrOptions?: any,
  options?: any,
) {
  const isModel = typeof modelOrDescription === 'function';

  const model = isModel ? modelOrDescription : undefined;
  const description = isModel ? descriptionOrOptions : modelOrDescription;
  const config = isModel ? options : descriptionOrOptions;

  const isArray = config?.isArray || false;
  const status = config?.status || 200;

  const decorators = [
    ApiResponse({
      status: status,
      description: description || 'Thao tác thành công',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: status,
          },
          message: {
            type: 'string',
            example: description || 'Thao tác thành công',
          },
          data: model
            ? isArray
              ? { type: 'array', items: { $ref: getSchemaPath(model) } }
              : { $ref: getSchemaPath(model) }
            : {
                type: 'object',
                example: null,
              },
        },
      },
    }),
  ];

  if (model) {
    decorators.push(ApiExtraModels(model));
  }

  return applyDecorators(...decorators);
}
