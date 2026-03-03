import { NextResponse } from "next/server";
import { getServerSessionWithEntitlements } from "@/lib/server/session";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

interface ProgramWaypointRow {
  id: string;
  position: number;
  duration_minutes: number;
  mode: string;
  waveform: string;
  carrier_hz: number;
  entrainment_hz: number;
  volume: number;
  transition_type: string;
}

interface ProgramRow {
  id: string;
  name: string;
  goal_tag: string | null;
  created_at: string;
  program_waypoints: ProgramWaypointRow[] | null;
}

interface CreateWaypointBody {
  durationMinutes: number;
  mode: string;
  waveform: string;
  carrierHz: number;
  entrainmentHz: number;
  volume: number;
  transitionType: string;
}

interface CreateProgramBody {
  name: string;
  goalTag: string;
  waypoints: CreateWaypointBody[];
}

function mapProgramRow(row: ProgramRow) {
  const waypoints = (row.program_waypoints ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((waypoint) => ({
      id: waypoint.id,
      durationMinutes: waypoint.duration_minutes,
      mode: waypoint.mode,
      waveform: waypoint.waveform,
      carrierHz: Number(waypoint.carrier_hz),
      entrainmentHz: Number(waypoint.entrainment_hz),
      volume: Number(waypoint.volume),
      transitionType: waypoint.transition_type as "step" | "ramp",
    }));

  return {
    id: row.id,
    name: row.name,
    goalTag: row.goal_tag ?? "custom",
    createdAt: row.created_at,
    waypoints,
  };
}

export async function GET() {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("programs")
    .select(
      "id,name,goal_tag,created_at,program_waypoints(id,position,duration_minutes,mode,waveform,carrier_hz,entrainment_hz,volume,transition_type)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    programs: (data as ProgramRow[]).map(mapProgramRow),
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateProgramBody;
  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, message: "Program name is required" }, { status: 400 });
  }

  const waypointCount = body.waypoints?.length ?? 0;
  if (waypointCount === 0) {
    return NextResponse.json({ ok: false, message: "At least one waypoint is required" }, { status: 400 });
  }

  if (waypointCount > session.entitlements.maxWaypoints) {
    return NextResponse.json(
      {
        ok: false,
        code: "waypoint_limit_reached",
        message: "Waypoint limit exceeded for current plan.",
      },
      { status: 403 },
    );
  }

  const supabase = await getServerSupabaseClient();
  const { count, error: countError } = await supabase
    .from("programs")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ ok: false, message: countError.message }, { status: 500 });
  }

  if ((count ?? 0) >= session.entitlements.maxPrograms) {
    return NextResponse.json(
      {
        ok: false,
        code: "program_limit_reached",
        message: "Program limit reached for current plan.",
      },
      { status: 403 },
    );
  }

  const { data: insertedProgram, error: programError } = await supabase
    .from("programs")
    .insert({
      user_id: session.user.id,
      name: body.name.trim(),
      goal_tag: body.goalTag,
      is_public: false,
    })
    .select("id")
    .single<{ id: string }>();

  if (programError || !insertedProgram) {
    return NextResponse.json({ ok: false, message: programError?.message ?? "Failed to create program" }, { status: 500 });
  }

  const waypointRows = body.waypoints.map((waypoint, index) => ({
    program_id: insertedProgram.id,
    position: index + 1,
    duration_minutes: waypoint.durationMinutes,
    mode: waypoint.mode,
    waveform: waypoint.waveform,
    carrier_hz: waypoint.carrierHz,
    entrainment_hz: waypoint.entrainmentHz,
    volume: waypoint.volume,
    transition_type: waypoint.transitionType,
  }));

  const { error: waypointError } = await supabase.from("program_waypoints").insert(waypointRows);
  if (waypointError) {
    await supabase.from("programs").delete().eq("id", insertedProgram.id);
    return NextResponse.json({ ok: false, message: waypointError.message }, { status: 500 });
  }

  const { data: programWithWaypoints, error: selectError } = await supabase
    .from("programs")
    .select(
      "id,name,goal_tag,created_at,program_waypoints(id,position,duration_minutes,mode,waveform,carrier_hz,entrainment_hz,volume,transition_type)",
    )
    .eq("id", insertedProgram.id)
    .single();

  if (selectError || !programWithWaypoints) {
    return NextResponse.json({ ok: false, message: selectError?.message ?? "Program created but fetch failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, program: mapProgramRow(programWithWaypoints as ProgramRow) });
}

export async function DELETE(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, message: "Program ID is required" }, { status: 400 });
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
