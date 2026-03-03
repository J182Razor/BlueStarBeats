import { NextResponse } from "next/server";
import { getServerSessionWithEntitlements } from "@/lib/server/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

interface ImportGateRequest {
  listingId?: string;
}

interface ListingRow {
  id: string;
  listing_type: "preset" | "program";
  source_id: string;
  title: string;
  goal_tags: string[] | null;
  imports_count: number;
}

interface SourcePresetRow {
  id: string;
  mode: string;
  waveform: string;
  carrier_hz: number;
  entrainment_hz: number;
  volume: number;
}

interface SourceProgramRow {
  id: string;
  goal_tag: string | null;
}

interface SourceWaypointRow {
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

export async function POST(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!session.entitlements.canImport) {
    return NextResponse.json(
      {
        ok: false,
        code: "marketplace_import_locked",
        message: "Marketplace import requires Pro, Elite, or Founders.",
      },
      { status: 403 },
    );
  }

  const body = (await request.json()) as ImportGateRequest;
  if (!body.listingId) {
    return NextResponse.json({ ok: false, message: "Missing listing ID." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data: listing, error: listingError } = await admin
    .from("marketplace_listings")
    .select("id,listing_type,source_id,title,goal_tags,imports_count")
    .eq("id", body.listingId)
    .eq("is_active", true)
    .maybeSingle<ListingRow>();

  if (listingError || !listing) {
    return NextResponse.json(
      { ok: false, message: listingError?.message ?? "Listing not found" },
      { status: 404 },
    );
  }

  if (listing.listing_type === "preset") {
    const { count, error: countError } = await admin
      .from("presets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    if (countError) {
      return NextResponse.json({ ok: false, message: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= session.entitlements.maxPresets) {
      return NextResponse.json(
        {
          ok: false,
          code: "preset_limit_reached",
          message: "Preset limit reached for current plan.",
        },
        { status: 403 },
      );
    }

    const { data: source, error: sourceError } = await admin
      .from("presets")
      .select("id,mode,waveform,carrier_hz,entrainment_hz,volume")
      .eq("id", listing.source_id)
      .maybeSingle<SourcePresetRow>();

    if (sourceError || !source) {
      return NextResponse.json(
        { ok: false, message: sourceError?.message ?? "Source preset not found" },
        { status: 404 },
      );
    }

    const { data: inserted, error: insertError } = await admin
      .from("presets")
      .insert({
        user_id: session.user.id,
        name: listing.title,
        tags: listing.goal_tags ?? [],
        mode: source.mode,
        waveform: source.waveform,
        carrier_hz: source.carrier_hz,
        entrainment_hz: source.entrainment_hz,
        volume: source.volume,
      })
      .select("id,name")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { ok: false, message: insertError?.message ?? "Failed to import preset" },
        { status: 500 },
      );
    }
  } else {
    const { count, error: countError } = await admin
      .from("programs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id);

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

    const { data: sourceProgram, error: sourceProgramError } = await admin
      .from("programs")
      .select("id,goal_tag")
      .eq("id", listing.source_id)
      .maybeSingle<SourceProgramRow>();

    if (sourceProgramError || !sourceProgram) {
      return NextResponse.json(
        { ok: false, message: sourceProgramError?.message ?? "Source program not found" },
        { status: 404 },
      );
    }

    const { data: sourceWaypoints, error: waypointError } = await admin
      .from("program_waypoints")
      .select("id,position,duration_minutes,mode,waveform,carrier_hz,entrainment_hz,volume,transition_type")
      .eq("program_id", sourceProgram.id)
      .order("position", { ascending: true });

    if (waypointError) {
      return NextResponse.json({ ok: false, message: waypointError.message }, { status: 500 });
    }

    const sourceWaypointRows = (sourceWaypoints ?? []) as SourceWaypointRow[];
    if (sourceWaypointRows.length === 0) {
      return NextResponse.json({ ok: false, message: "Source program has no waypoints" }, { status: 400 });
    }

    if (sourceWaypointRows.length > session.entitlements.maxWaypoints) {
      return NextResponse.json(
        {
          ok: false,
          code: "waypoint_limit_reached",
          message: "Program exceeds waypoint limit for current plan.",
        },
        { status: 403 },
      );
    }

    const { data: insertedProgram, error: insertProgramError } = await admin
      .from("programs")
      .insert({
        user_id: session.user.id,
        name: listing.title,
        goal_tag: sourceProgram.goal_tag,
        is_public: false,
      })
      .select("id")
      .single<{ id: string }>();

    if (insertProgramError || !insertedProgram) {
      return NextResponse.json(
        { ok: false, message: insertProgramError?.message ?? "Failed to import program" },
        { status: 500 },
      );
    }

    const insertWaypoints = sourceWaypointRows.map((waypoint) => ({
      program_id: insertedProgram.id,
      position: waypoint.position,
      duration_minutes: waypoint.duration_minutes,
      mode: waypoint.mode,
      waveform: waypoint.waveform,
      carrier_hz: waypoint.carrier_hz,
      entrainment_hz: waypoint.entrainment_hz,
      volume: waypoint.volume,
      transition_type: waypoint.transition_type,
    }));

    const { error: insertWaypointError } = await admin.from("program_waypoints").insert(insertWaypoints);
    if (insertWaypointError) {
      await admin.from("programs").delete().eq("id", insertedProgram.id);
      return NextResponse.json(
        { ok: false, message: insertWaypointError.message },
        { status: 500 },
      );
    }
  }

  await admin
    .from("marketplace_listings")
    .update({ imports_count: listing.imports_count + 1 })
    .eq("id", listing.id);

  return NextResponse.json({ ok: true, listingId: listing.id });
}
