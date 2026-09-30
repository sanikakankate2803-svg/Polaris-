import { NextResponse, type NextRequest } from 'next/server';
import { getProblemStatementById } from '@/lib/problem-statements-store';
import { getMatchesForProblem, updateMatchStatus } from '@/lib/matches-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = getProblemStatementById(id);

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem statement not found' },
        { status: 404 }
      );
    }

    const matches = getMatchesForProblem(id);

    return NextResponse.json({
      success: true,
      problem,
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('Error in matches GET API:', error);
    return NextResponse.json(
      { error: 'Failed to compute matches' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // resolve params promise
    const body = await request.json();
    const { matchId, status } = body;

    if (!matchId || !status) {
      return NextResponse.json(
        { error: 'matchId and status are required' },
        { status: 400 }
      );
    }

    const success = await updateMatchStatus(matchId, status);

    return NextResponse.json({
      success,
      matchId,
      status,
    });
  } catch (error) {
    console.error('Error in matches POST API:', error);
    return NextResponse.json(
      { error: 'Failed to update match status' },
      { status: 500 }
    );
  }
}
