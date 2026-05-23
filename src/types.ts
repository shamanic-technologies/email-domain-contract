import type { z } from "zod";
import {
  ReplyClassificationSchema,
  RepliesDetailSchema,
  RecipientStatsSchema,
  StepStatsSchema,
  EmailStatsSchema,
  ChannelStatsSchema,
  StatusScopeSchema,
  GlobalStatusSchema,
  ProviderStatusSchema,
} from "./schemas";

export type ReplyClassification = z.infer<typeof ReplyClassificationSchema>;
export type RepliesDetail = z.infer<typeof RepliesDetailSchema>;
export type RecipientStats = z.infer<typeof RecipientStatsSchema>;
export type StepStats = z.infer<typeof StepStatsSchema>;
export type EmailStats = z.infer<typeof EmailStatsSchema>;
export type ChannelStats = z.infer<typeof ChannelStatsSchema>;
export type StatusScope = z.infer<typeof StatusScopeSchema>;
export type GlobalStatus = z.infer<typeof GlobalStatusSchema>;
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
