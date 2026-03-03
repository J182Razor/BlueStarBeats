import { NextResponse } from "next/server";
import {
  isValidAudioMode,
  isValidCarrierHz,
  isValidEntrainmentHz,
  isValidVolume,
  isValidWaveform,
} from "@/lib/audio/limits";
import { getServerSessionWithEntitlements } from "@/lib/server/session";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

interface PresetRow {
  id: string;
  name: string;
  tags: string[] | null;
  mode: string;
  waveform: string;
  carrier_hz: number;
  entrainment_hz: number;
  volume: number;
  created_at: string;
}

interface CreatePresetBody {
  name: string;
  tags?: string[];
  mode: string;
  waveform: string;
  carrierHz: number;
  entrainmentHz: number;
  volume: number;
}

interface UpdatePresetBody {
  id: string;
  name?: string;
  tags?: string[];
  mode?: string;
  waveform?: string;
  carrierHz?: number;
  entrainmentHz?: number;
  volume?: number;
}

function mapPresetRow(row: PresetRow) {
  return {
    id: row.id,
    name: row.name,
    tags: row.tags ?? [],
    mode: row.mode,
    waveform: row.waveform,
    carrierHz: Number(row.carrier_hz),
    entrainmentHz: Number(row.entrainment_hz),
    volume: Number(row.volume),
    createdAt: row.created_at,
  };
}

export async function GET() {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("presets")
    .select("id,name,tags,mode,waveform,carrier_hz,entrainment_hz,volume,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    presets: (data as PresetRow[]).map(mapPresetRow),
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreatePresetBody;
  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, message: "Preset name is required" }, { status: 400 });
  }
  if (
    !isValidAudioMode(body.mode) ||
    !isValidWaveform(body.waveform) ||
    !isValidCarrierHz(body.carrierHz) ||
    !isValidEntrainmentHz(body.entrainmentHz) ||
    !isValidVolume(body.volume)
  ) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Invalid audio settings. Carrier must be 20-20000 Hz, entrainment 0.1-40 Hz, and volume 0.01-1.",
      },
      { status: 400 },
    );
  }

  const supabase = await getServerSupabaseClient();
  const { count, error: countError } = await supabase
    .from("presets")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ ok: false, message: countError.message }, { status: 500 });
  }

  const maxPresets = session.entitlements.maxPresets;
  const currentCount = count ?? 0;
  if (currentCount >= maxPresets) {
    return NextResponse.json(
      {
        ok: false,
        code: "preset_limit_reached",
        message: "Preset limit reached for current plan.",
      },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("presets")
    .insert({
      user_id: session.user.id,
      name: body.name.trim(),
      tags: body.tags ?? [],
      mode: body.mode,
      waveform: body.waveform,
      carrier_hz: body.carrierHz,
      entrainment_hz: body.entrainmentHz,
      volume: body.volume,
    })
    .select("id,name,tags,mode,waveform,carrier_hz,entrainment_hz,volume,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Failed to save preset" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, preset: mapPresetRow(data as PresetRow) });
}

export async function PATCH(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdatePresetBody;
  if (!body.id) {
    return NextResponse.json({ ok: false, message: "Preset ID is required" }, { status: 400 });
  }
  if (body.mode !== undefined && !isValidAudioMode(body.mode)) {
    return NextResponse.json({ ok: false, message: "Invalid mode value." }, { status: 400 });
  }
  if (body.waveform !== undefined && !isValidWaveform(body.waveform)) {
    return NextResponse.json({ ok: false, message: "Invalid waveform value." }, { status: 400 });
  }
  if (body.carrierHz !== undefined && !isValidCarrierHz(body.carrierHz)) {
    return NextResponse.json({ ok: false, message: "Carrier must be 20-20000 Hz." }, { status: 400 });
  }
  if (body.entrainmentHz !== undefined && !isValidEntrainmentHz(body.entrainmentHz)) {
    return NextResponse.json({ ok: false, message: "Entrainment must be 0.1-40 Hz." }, { status: 400 });
  }
  if (body.volume !== undefined && !isValidVolume(body.volume)) {
    return NextResponse.json({ ok: false, message: "Volume must be between 0.01 and 1." }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {};
  if (typeof body.name === "string") updatePayload.name = body.name.trim();
  if (Array.isArray(body.tags)) updatePayload.tags = body.tags;
  if (typeof body.mode === "string") updatePayload.mode = body.mode;
  if (typeof body.waveform === "string") updatePayload.waveform = body.waveform;
  if (typeof body.carrierHz === "number") updatePayload.carrier_hz = body.carrierHz;
  if (typeof body.entrainmentHz === "number") updatePayload.entrainment_hz = body.entrainmentHz;
  if (typeof body.volume === "number") updatePayload.volume = body.volume;

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("presets")
    .update(updatePayload)
    .eq("id", body.id)
    .select("id,name,tags,mode,waveform,carrier_hz,entrainment_hz,volume,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Failed to update preset" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, preset: mapPresetRow(data as PresetRow) });
}

export async function DELETE(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, message: "Preset ID is required" }, { status: 400 });
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.from("presets").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
