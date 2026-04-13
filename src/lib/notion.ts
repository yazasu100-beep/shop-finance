import { Client } from "@notionhq/client";
import type {
  Transaction,
  PlatformSale,
  TransactionType,
  TransactionCategory,
  Platform,
} from "@/types";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const TRANSACTIONS_DB_ID = process.env.NOTION_TRANSACTIONS_DB_ID!;
const PLATFORM_SALES_DB_ID = process.env.NOTION_PLATFORM_SALES_DB_ID!;

// Notion SDK 타입을 내부 경로 없이 안전하게 추론
type QueryArgs = Parameters<typeof notion.databases.query>[0];
type DBFilter = NonNullable<QueryArgs["filter"]>;
type UpdateArgs = Parameters<typeof notion.pages.update>[0];
type PageProperties = NonNullable<UpdateArgs["properties"]>;

function buildDateFilter(
  startDate?: string,
  endDate?: string
): DBFilter | undefined {
  if (!startDate && !endDate) return undefined;
  if (startDate && endDate) {
    return {
      and: [
        { property: "날짜", date: { on_or_after: startDate } },
        { property: "날짜", date: { on_or_before: endDate } },
      ],
    } as unknown as DBFilter;
  }
  if (startDate) {
    return { property: "날짜", date: { on_or_after: startDate } } as unknown as DBFilter;
  }
  return { property: "날짜", date: { on_or_before: endDate } } as unknown as DBFilter;
}

// ─── Transactions ────────────────────────────────────────────────────────────

export async function getTransactions(
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> {
  const response = await notion.databases.query({
    database_id: TRANSACTIONS_DB_ID,
    filter: buildDateFilter(startDate, endDate),
    sorts: [{ property: "날짜", direction: "descending" }],
  });

  return response.results.map((page) => {
    const p = page as Record<string, unknown> & {
      id: string;
      properties: Record<string, unknown>;
      created_time: string;
    };
    const props = p.properties as Record<string, Record<string, unknown>>;

    return {
      id: p.id,
      date: (props["날짜"]?.date as Record<string, string>)?.start ?? "",
      type: (
        (props["유형"]?.select as Record<string, string>)?.name ?? "expense"
      ) as TransactionType,
      category: (
        (props["카테고리"]?.select as Record<string, string>)?.name ?? "기타지출"
      ) as TransactionCategory,
      amount: (props["금액"]?.number as number) ?? 0,
      description:
        (props["내용"]?.title as Array<{ plain_text: string }>)?.[0]
          ?.plain_text ?? "",
      platform: (props["플랫폼"]?.select as Record<string, string>)
        ?.name as Platform,
      memo:
        (props["메모"]?.rich_text as Array<{ plain_text: string }>)?.[0]
          ?.plain_text ?? "",
      createdAt: p.created_time,
    };
  });
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  const response = await notion.pages.create({
    parent: { database_id: TRANSACTIONS_DB_ID },
    properties: {
      내용: { title: [{ text: { content: data.description } }] },
      날짜: { date: { start: data.date } },
      유형: { select: { name: data.type === "income" ? "수입" : "지출" } },
      카테고리: { select: { name: data.category } },
      금액: { number: data.amount },
      ...(data.platform ? { 플랫폼: { select: { name: data.platform } } } : {}),
      ...(data.memo
        ? { 메모: { rich_text: [{ text: { content: data.memo } }] } }
        : {}),
    },
  });

  return { ...data, id: response.id };
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id" | "createdAt">>
): Promise<void> {
  const properties: PageProperties = {};

  if (data.description !== undefined)
    properties["내용"] = { title: [{ text: { content: data.description } }] };
  if (data.date !== undefined)
    properties["날짜"] = { date: { start: data.date } };
  if (data.type !== undefined)
    properties["유형"] = {
      select: { name: data.type === "income" ? "수입" : "지출" },
    };
  if (data.category !== undefined)
    properties["카테고리"] = { select: { name: data.category } };
  if (data.amount !== undefined)
    properties["금액"] = { number: data.amount };
  if (data.platform !== undefined)
    properties["플랫폼"] = { select: { name: data.platform } };
  if (data.memo !== undefined)
    properties["메모"] = { rich_text: [{ text: { content: data.memo } }] };

  await notion.pages.update({ page_id: id, properties });
}

export async function deleteTransaction(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

// ─── Platform Sales ──────────────────────────────────────────────────────────

export async function getPlatformSales(
  startDate?: string,
  endDate?: string
): Promise<PlatformSale[]> {
  const response = await notion.databases.query({
    database_id: PLATFORM_SALES_DB_ID,
    filter: buildDateFilter(startDate, endDate),
    sorts: [{ property: "날짜", direction: "descending" }],
  });

  return response.results.map((page) => {
    const p = page as Record<string, unknown> & {
      id: string;
      properties: Record<string, unknown>;
      created_time: string;
    };
    const props = p.properties as Record<string, Record<string, unknown>>;

    const salesAmount = (props["매출액"]?.number as number) ?? 0;
    const returnAmount = (props["반품금액"]?.number as number) ?? 0;
    const fee = (props["수수료"]?.number as number) ?? 0;

    return {
      id: p.id,
      date: (props["날짜"]?.date as Record<string, string>)?.start ?? "",
      platform: (
        (props["플랫폼"]?.select as Record<string, string>)?.name ?? "기타"
      ) as Platform,
      salesAmount,
      orderCount: (props["주문수"]?.number as number) ?? 0,
      returnAmount,
      fee,
      netAmount: salesAmount - returnAmount - fee,
      memo:
        (props["메모"]?.rich_text as Array<{ plain_text: string }>)?.[0]
          ?.plain_text ?? "",
      createdAt: p.created_time,
    };
  });
}

export async function createPlatformSale(
  data: Omit<PlatformSale, "id" | "createdAt" | "netAmount">
): Promise<PlatformSale> {
  const netAmount = data.salesAmount - data.returnAmount - data.fee;

  const response = await notion.pages.create({
    parent: { database_id: PLATFORM_SALES_DB_ID },
    properties: {
      플랫폼: { select: { name: data.platform } },
      날짜: { date: { start: data.date } },
      매출액: { number: data.salesAmount },
      주문수: { number: data.orderCount },
      반품금액: { number: data.returnAmount },
      수수료: { number: data.fee },
      ...(data.memo
        ? { 메모: { rich_text: [{ text: { content: data.memo } }] } }
        : {}),
    },
  });

  return { ...data, id: response.id, netAmount };
}

export async function updatePlatformSale(
  id: string,
  data: Partial<Omit<PlatformSale, "id" | "createdAt" | "netAmount">>
): Promise<void> {
  const properties: PageProperties = {};

  if (data.platform !== undefined)
    properties["플랫폼"] = { select: { name: data.platform } };
  if (data.date !== undefined)
    properties["날짜"] = { date: { start: data.date } };
  if (data.salesAmount !== undefined)
    properties["매출액"] = { number: data.salesAmount };
  if (data.orderCount !== undefined)
    properties["주문수"] = { number: data.orderCount };
  if (data.returnAmount !== undefined)
    properties["반품금액"] = { number: data.returnAmount };
  if (data.fee !== undefined)
    properties["수수료"] = { number: data.fee };
  if (data.memo !== undefined)
    properties["메모"] = { rich_text: [{ text: { content: data.memo } }] };

  await notion.pages.update({ page_id: id, properties });
}

export async function deletePlatformSale(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}
