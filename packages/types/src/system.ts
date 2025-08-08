import { z } from 'zod';

export const SystemInfoSchema = z.object({
  os: z.object({
    name: z.string(),
    version: z.string(),
    arch: z.string(),
  }),
  cpu: z.object({
    name: z.string(),
    cores: z.number(),
    frequency: z.number(), // MHz
  }),
  memory: z.object({
    total: z.number(), // bytes
    available: z.number(), // bytes
    used: z.number(), // bytes
  }),
  storage: z.array(z.object({
    name: z.string(),
    mountPoint: z.string(),
    total: z.number(), // bytes
    available: z.number(), // bytes
    used: z.number(), // bytes
    fileSystem: z.string(),
  })),
  gpu: z.array(z.object({
    name: z.string(),
    vendor: z.string(),
    memory: z.number().optional(), // bytes
  })),
});

export type SystemInfo = z.infer<typeof SystemInfoSchema>;
