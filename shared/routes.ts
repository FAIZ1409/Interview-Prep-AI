import { z } from 'zod';
import { insertInterviewSchema, insertResumeSchema, interviews, resumes } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  interviews: {
    list: {
      method: 'GET' as const,
      path: '/api/interviews',
      responses: {
        200: z.array(z.custom<typeof interviews.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/interviews/:id',
      responses: {
        200: z.custom<typeof interviews.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/interviews',
      input: insertInterviewSchema,
      responses: {
        201: z.custom<typeof interviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/interviews/:id/complete',
      responses: {
        200: z.custom<typeof interviews.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  resumes: {
    list: {
      method: 'GET' as const,
      path: '/api/resumes',
      responses: {
        200: z.array(z.custom<typeof resumes.$inferSelect>()),
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/resumes',
      // input is multipart, not validated here
      responses: {
        201: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    parse: {
      method: 'POST' as const,
      path: '/api/resumes/:id/parse',
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
