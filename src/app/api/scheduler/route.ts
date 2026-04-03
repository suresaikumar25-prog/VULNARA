import { NextRequest, NextResponse } from 'next/server';
import { SchedulerService } from '@/lib/schedulerService';

// GET /api/scheduler - Get scheduler status
export async function GET() {
  try {
    const status = SchedulerService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}

// POST /api/scheduler - Start/stop scheduler or trigger manual check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, intervalMinutes } = body;
    
    switch (action) {
      case 'start':
        const interval = intervalMinutes || 5;
        SchedulerService.start(interval);
        return NextResponse.json({
          success: true,
          message: `Scheduler started with ${interval} minute intervals`
        });
        
      case 'stop':
        SchedulerService.stop();
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped'
        });
        
      case 'check':
        await SchedulerService.triggerCheck();
        return NextResponse.json({
          success: true,
          message: 'Manual check triggered'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, or check' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to manage scheduler' },
      { status: 500 }
    );
  }
}
