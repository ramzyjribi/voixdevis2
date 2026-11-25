import { z } from "zod";

export const tvaRateSchema = z.union([
  z.literal(5.5),
  z.literal(10),
  z.literal(20),
]);

export const nonEmptyStringSchema = z.string().trim().min(1);
export const positiveQuantitySchema = z.number().finite().positive();
export const nonNegativePriceSchema = z.number().finite().min(0);

export const clientInfoSchema = z
  .object({
    name: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
  })
  .strict();

export const discountSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("percent"),
      value: z.number().finite().min(0).max(100),
    })
    .strict(),
  z
    .object({
      type: z.literal("fixed"),
      value: z.number().finite().min(0),
    })
    .strict(),
]);

export const setClientInfoArgsSchema = clientInfoSchema;

export const applyInterventionTemplateArgsSchema = z
  .object({
    templateId: nonEmptyStringSchema,
    sectionName: z.string().trim().optional(),
  })
  .strict();

export const addArticleArgsSchema = z
  .object({
    articleId: nonEmptyStringSchema,
    quantity: positiveQuantitySchema.optional(),
    sectionName: z.string().trim().optional(),
  })
  .strict();

export const addCustomLineArgsSchema = z
  .object({
    designation: nonEmptyStringSchema,
    price: nonNegativePriceSchema,
    unit: nonEmptyStringSchema,
    quantity: positiveQuantitySchema,
    sectionName: z.string().trim().optional(),
  })
  .strict();

export const updateArticleArgsSchema = z
  .object({
    lineItemId: nonEmptyStringSchema,
    quantity: positiveQuantitySchema.optional(),
    price: nonNegativePriceSchema.optional(),
    designation: nonEmptyStringSchema.optional(),
  })
  .strict()
  .refine(
    (args) =>
      args.quantity !== undefined ||
      args.price !== undefined ||
      args.designation !== undefined,
    "At least one line update field is required.",
  );

export const removeArticleArgsSchema = z
  .object({
    lineItemId: nonEmptyStringSchema,
  })
  .strict();

export const deleteSectionArgsSchema = z
  .object({
    sectionName: nonEmptyStringSchema,
  })
  .strict();

export const setTvaArgsSchema = z
  .object({
    rate: tvaRateSchema,
  })
  .strict();

export const applyDiscountArgsSchema = discountSchema;

export const answerQuestionArgsSchema = z
  .object({
    userMessageFeedback: nonEmptyStringSchema,
  })
  .strict();

export const requestClarificationArgsSchema = z
  .object({
    userMessageFeedback: nonEmptyStringSchema,
    candidates: z.array(nonEmptyStringSchema).optional(),
  })
  .strict();

export const unknownActionArgsSchema = answerQuestionArgsSchema;

export const emptyToolArgsSchema = z.object({}).strict();

export const aiToolCallSchema = z.discriminatedUnion("name", [
  z
    .object({
      name: z.literal("set_client_info"),
      args: setClientInfoArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("apply_intervention_template"),
      args: applyInterventionTemplateArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("add_article"),
      args: addArticleArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("add_custom_line"),
      args: addCustomLineArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("update_article"),
      args: updateArticleArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("remove_article"),
      args: removeArticleArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("delete_section"),
      args: deleteSectionArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("set_tva"),
      args: setTvaArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("apply_discount"),
      args: applyDiscountArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("answer_question"),
      args: answerQuestionArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("trigger_pdf_export"),
      args: emptyToolArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("reset_quote"),
      args: emptyToolArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("request_clarification"),
      args: requestClarificationArgsSchema,
    })
    .strict(),
  z
    .object({
      name: z.literal("unknown_action"),
      args: unknownActionArgsSchema,
    })
    .strict(),
]);

export const aiToolCallsSchema = z.array(aiToolCallSchema).max(12);

export const aiRouteResponseSchema = z
  .object({
    assistantMessage: z.string().trim().optional(),
    toolCalls: aiToolCallsSchema,
    model: z.string().trim().optional(),
    toolCallIds: z.array(z.string().trim()).optional(),
  })
  .strict();

export const companySettingsSchema = z
  .object({
    companyName: z.string().trim().optional(),
    artisanName: z.string().trim().optional(),
    address: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    city: z.string().trim().optional(),
    siret: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().optional(),
    defaultTvaRate: tvaRateSchema,
  })
  .strict();

export const quoteLineItemSchema = z
  .object({
    lineItemId: z.string(),
    source: z.enum(["catalog", "template", "custom"]),
    articleId: z.string().optional(),
    templateId: z.string().optional(),
    designation: z.string(),
    unit: z.string(),
    quantity: positiveQuantitySchema,
    unitPriceHt: nonNegativePriceSchema,
  })
  .strict();

export const quoteSectionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    lineItems: z.array(quoteLineItemSchema),
  })
  .strict();

export const quoteSchema = z
  .object({
    id: z.string(),
    status: z.literal("draft"),
    createdAt: z.string(),
    updatedAt: z.string(),
    quoteNumber: z.string().optional(),
    client: clientInfoSchema,
    sections: z.array(quoteSectionSchema),
    discount: discountSchema.optional(),
    tvaRate: tvaRateSchema,
  })
  .strict();

export const chatMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    createdAt: z.string(),
  })
  .strict();

export const clarificationSchema = z
  .object({
    userMessageFeedback: z.string(),
    candidates: z.array(z.string()),
  })
  .strict()
  .nullable();
