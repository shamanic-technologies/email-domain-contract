import { describe, expect, it } from "vitest";
import {
  ChannelStatsSchema,
  EmailStatsSchema,
  GlobalStatusSchema,
  ProviderStatusSchema,
  RecipientStatsSchema,
  RepliesDetailSchema,
  ReplyClassificationSchema,
  StatusScopeSchema,
  StepStatsSchema,
} from "../src/schemas";

describe("contract drift detection (snapshots)", () => {
  it("ReplyClassification values are locked", () => {
    expect(ReplyClassificationSchema.options).toMatchInlineSnapshot(`
      [
        "positive",
        "negative",
        "neutral",
      ]
    `);
  });

  it("RepliesDetail shape is locked", () => {
    expect(Object.keys(RepliesDetailSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "autoReply",
        "closed",
        "interested",
        "meetingBooked",
        "neutral",
        "notInterested",
        "outOfOffice",
        "unsubscribe",
        "wrongPerson",
      ]
    `);
  });

  it("RecipientStats shape is locked", () => {
    expect(Object.keys(RecipientStatsSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "bounced",
        "cancelled",
        "clicked",
        "contacted",
        "delivered",
        "notSending",
        "opened",
        "repliesAutoReply",
        "repliesDetail",
        "repliesNegative",
        "repliesNeutral",
        "repliesPositive",
        "sent",
        "unsubscribed",
      ]
    `);
  });

  it("StepStats shape is locked", () => {
    expect(Object.keys(StepStatsSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "bounced",
        "clicked",
        "delivered",
        "opened",
        "repliesAutoReply",
        "repliesDetail",
        "repliesNegative",
        "repliesNeutral",
        "repliesPositive",
        "sent",
        "step",
        "unsubscribed",
      ]
    `);
  });

  it("EmailStats shape is locked", () => {
    expect(Object.keys(EmailStatsSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "bounced",
        "clicked",
        "delivered",
        "opened",
        "sent",
        "stepStats",
        "unsubscribed",
      ]
    `);
  });

  it("ChannelStats shape is locked", () => {
    expect(Object.keys(ChannelStatsSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "emailStats",
        "recipientStats",
      ]
    `);
  });

  it("StatusScope shape is locked", () => {
    expect(Object.keys(StatusScopeSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "bounced",
        "cancelled",
        "clicked",
        "contacted",
        "delivered",
        "firstBouncedAt",
        "firstClickedAt",
        "firstContactedAt",
        "firstDeliveredAt",
        "firstOpenedAt",
        "firstRepliedAt",
        "firstSentAt",
        "firstUnsubscribedAt",
        "lastDeliveredAt",
        "opened",
        "replied",
        "replyClassification",
        "sent",
        "sentCount",
        "unsubscribed",
      ]
    `);
  });

  it("GlobalStatus shape is locked", () => {
    expect(Object.keys(GlobalStatusSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "email",
      ]
    `);
  });

  it("ProviderStatus shape is locked", () => {
    expect(Object.keys(ProviderStatusSchema.shape).sort()).toMatchInlineSnapshot(`
      [
        "brand",
        "byCampaign",
        "campaign",
        "global",
      ]
    `);
  });
});

describe("parse acceptance — known-good payloads", () => {
  it("parses a full instantly StatusScope (all fields populated)", () => {
    const payload = {
      contacted: true,
      sent: true,
      delivered: true,
      opened: true,
      clicked: false,
      replied: true,
      replyClassification: "positive" as const,
      bounced: false,
      unsubscribed: false,
      cancelled: false,
      lastDeliveredAt: "2026-03-02T12:00:00.000Z",
      sentCount: 3,
    };
    expect(() => StatusScopeSchema.parse(payload)).not.toThrow();
  });

  it("parses a postmark StatusScope without cancelled (v1 optional)", () => {
    const payload = {
      contacted: true,
      sent: true,
      delivered: true,
      opened: false,
      clicked: false,
      replied: false,
      replyClassification: null,
      bounced: false,
      unsubscribed: false,
      lastDeliveredAt: "2026-03-01T10:00:00.000Z",
    };
    expect(() => StatusScopeSchema.parse(payload)).not.toThrow();
  });

  it("parses RecipientStats without provider-specific fields", () => {
    const payload = {
      contacted: 10,
      sent: 8,
      delivered: 7,
      opened: 4,
      bounced: 1,
      clicked: 2,
      unsubscribed: 0,
      repliesPositive: 1,
      repliesNegative: 0,
      repliesNeutral: 0,
      repliesAutoReply: 1,
      repliesDetail: {
        interested: 1,
        meetingBooked: 0,
        closed: 0,
        notInterested: 0,
        wrongPerson: 0,
        unsubscribe: 0,
        neutral: 0,
        autoReply: 1,
        outOfOffice: 0,
      },
    };
    expect(() => RecipientStatsSchema.parse(payload)).not.toThrow();
  });
});
