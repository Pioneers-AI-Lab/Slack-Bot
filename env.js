import { z } from 'zod';

const envSchema = z.object({
	SLACK_BOT_TOKEN: z.string(),
	SLACK_CHANNEL_ID: z.string(),
	SLACK_ADMIN_CHANNEL_ID: z.string().optional(),
	GOOGLE_CLIENT_EMAIL: z.string(),
	GOOGLE_PRIVATE_KEY: z.string(),
	GOOGLE_CALENDAR_ID: z.string(),
});

export const Env = envSchema.parse(process.env);
