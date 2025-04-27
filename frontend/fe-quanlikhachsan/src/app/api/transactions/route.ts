import { NextResponse } from 'next/server';

// Mock transaction data (replace with real database in production)
const mockTransactions: any[] = [];

export async function GET(req: Request) {
  try {
    // In a real app, fetch the user's transactions from the database
    // using an authenticated user ID (e.g., from a JWT token)
    return NextResponse.json({
      success: true,
      data: mockTransactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}