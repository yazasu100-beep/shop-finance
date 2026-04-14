export type TransactionType = "income" | "expense";

export type TransactionCategory = string;

export type Platform =
  | "스마트스토어"
  | "쿠팡"
  | "11번가"
  | "G마켓"
  | "옥션"
  | "카카오쇼핑"
  | "자사몰"
  | "기타";

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  platform?: Platform;
  memo?: string;
  createdAt?: string;
}

export interface PlatformSale {
  id: string;
  date: string;
  platform: Platform;
  salesAmount: number;
  orderCount: number;
  returnAmount: number;
  fee: number;
  netAmount: number;
  memo?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  marginRate: number;
  platformSales: PlatformSalesSummary[];
  monthlyData: MonthlyData[];
  categoryExpenses: CategoryExpense[];
  recentTransactions: Transaction[];
}

export interface PlatformSalesSummary {
  platform: Platform;
  salesAmount: number;
  orderCount: number;
  netAmount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}

export interface ReportData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  marginRate: number;
  topPlatform: string;
  platformBreakdown: PlatformSalesSummary[];
  categoryBreakdown: CategoryExpense[];
  monthlyTrend: MonthlyData[];
}
