import { NextRequest, NextResponse } from "next/server";
import {
  createLiveEvent,
  listLiveEvents,
} from "@/lib/projectp/live-event";

export async function GET() {
  const events = await listLiveEvents();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.eventDate) {
    return NextResponse.json(
      { error: "title and eventDate are required" },
      { status: 400 }
    );
  }
  try {
    const event = await createLiveEvent(body);
    return NextResponse.json({ event });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
