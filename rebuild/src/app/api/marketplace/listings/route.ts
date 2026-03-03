import { NextResponse } from "next/server";
import { DEFAULT_AUDIO_SETTINGS } from "@/lib/audio/types";
import { getServerSessionWithEntitlements } from "@/lib/server/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

interface ListingRow {
  id: string;
  creator_user_id: string;
  listing_type: "preset" | "program";
  source_id: string;
  title: string;
  description: string | null;
  goal_tags: string[] | null;
  imports_count: number;
  created_at: string;
}

interface UserProfileRow {
  user_id: string;
  display_name: string | null;
  founders_badge: boolean;
}

interface PresetSourceRow {
  id: string;
  mode: string;
  waveform: string;
  carrier_hz: number;
  entrainment_hz: number;
  volume: number;
}

interface WaypointSourceRow {
  id: string;
  program_id: string;
  position: number;
  mode: string;
  waveform: string;
  carrier_hz: number;
  entrainment_hz: number;
  volume: number;
}

interface PublishListingBody {
  listingType: "preset" | "program";
  sourceId: string;
  title: string;
  description?: string;
  goalTags?: string[];
}

function buildPreview(
  listing: ListingRow,
  presetMap: Map<string, PresetSourceRow>,
  waypointMap: Map<string, WaypointSourceRow>,
) {
  if (listing.listing_type === "preset") {
    const source = presetMap.get(listing.source_id);
    if (!source) return DEFAULT_AUDIO_SETTINGS;
    return {
      mode: source.mode as "binaural" | "isochronic",
      waveform: source.waveform as "sine" | "triangle" | "square" | "sawtooth",
      carrierHz: Number(source.carrier_hz),
      entrainmentHz: Number(source.entrainment_hz),
      volume: Number(source.volume),
    };
  }

  const waypoint = waypointMap.get(listing.source_id);
  if (!waypoint) return DEFAULT_AUDIO_SETTINGS;
  return {
    mode: waypoint.mode as "binaural" | "isochronic",
    waveform: waypoint.waveform as "sine" | "triangle" | "square" | "sawtooth",
    carrierHz: Number(waypoint.carrier_hz),
    entrainmentHz: Number(waypoint.entrainment_hz),
    volume: Number(waypoint.volume),
  };
}

export async function GET(request: Request) {
  const admin = getSupabaseAdminClient();
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort") === "new" ? "new" : "trending";
  const tag = url.searchParams.get("tag");

  let query = admin
    .from("marketplace_listings")
    .select("id,creator_user_id,listing_type,source_id,title,description,goal_tags,imports_count,created_at")
    .eq("is_active", true)
    .limit(50);

  if (tag && tag !== "all") {
    query = query.contains("goal_tags", [tag]);
  }

  query =
    sort === "trending"
      ? query.order("imports_count", { ascending: false }).order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false });

  const { data: listings, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const rows = (listings ?? []) as ListingRow[];
  const creatorIds = [...new Set(rows.map((listing) => listing.creator_user_id))];
  const presetSourceIds = rows
    .filter((listing) => listing.listing_type === "preset")
    .map((listing) => listing.source_id);
  const programSourceIds = rows
    .filter((listing) => listing.listing_type === "program")
    .map((listing) => listing.source_id);

  const [profilesResult, presetsResult, waypointsResult] = await Promise.all([
    creatorIds.length
      ? admin
          .from("user_profiles")
          .select("user_id,display_name,founders_badge")
          .in("user_id", creatorIds)
      : Promise.resolve({ data: [], error: null }),
    presetSourceIds.length
      ? admin
          .from("presets")
          .select("id,mode,waveform,carrier_hz,entrainment_hz,volume")
          .in("id", presetSourceIds)
      : Promise.resolve({ data: [], error: null }),
    programSourceIds.length
      ? admin
          .from("program_waypoints")
          .select("id,program_id,position,mode,waveform,carrier_hz,entrainment_hz,volume")
          .in("program_id", programSourceIds)
          .order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error || presetsResult.error || waypointsResult.error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          profilesResult.error?.message ??
          presetsResult.error?.message ??
          waypointsResult.error?.message ??
          "Failed to load marketplace metadata",
      },
      { status: 500 },
    );
  }

  const profileMap = new Map(
    ((profilesResult.data ?? []) as UserProfileRow[]).map((profile) => [profile.user_id, profile]),
  );
  const presetMap = new Map(
    ((presetsResult.data ?? []) as PresetSourceRow[]).map((preset) => [preset.id, preset]),
  );
  const waypointMap = new Map<string, WaypointSourceRow>();
  for (const waypoint of (waypointsResult.data ?? []) as WaypointSourceRow[]) {
    if (!waypointMap.has(waypoint.program_id)) {
      waypointMap.set(waypoint.program_id, waypoint);
    }
  }

  const listingsResponse = rows.map((listing) => {
    const profile = profileMap.get(listing.creator_user_id);
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      creator: profile?.display_name ?? "BlueStar Creator",
      creatorBadge: profile?.founders_badge ? "Founders" : undefined,
      type: listing.listing_type,
      tags: listing.goal_tags ?? [],
      trendScore: listing.imports_count,
      createdAt: listing.created_at,
      preview: buildPreview(listing, presetMap, waypointMap),
    };
  });

  return NextResponse.json(
    { ok: true, listings: listingsResponse },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}

export async function POST(request: Request) {
  const session = await getServerSessionWithEntitlements();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!session.entitlements.canPublish) {
    return NextResponse.json(
      {
        ok: false,
        code: "marketplace_publish_locked",
        message: "Publishing requires Pro, Elite, or Founders.",
      },
      { status: 403 },
    );
  }

  const body = (await request.json()) as PublishListingBody;
  if (!body.listingType || !body.sourceId || !body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "Missing listing fields" }, { status: 400 });
  }

  const supabase = await getServerSupabaseClient();
  const sourceTable = body.listingType === "preset" ? "presets" : "programs";
  const { data: ownedSource, error: sourceError } = await supabase
    .from(sourceTable)
    .select("id")
    .eq("id", body.sourceId)
    .maybeSingle();

  if (sourceError || !ownedSource) {
    return NextResponse.json(
      { ok: false, message: "You can only publish your own preset/program source." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({
      creator_user_id: session.user.id,
      listing_type: body.listingType,
      source_id: body.sourceId,
      title: body.title.trim(),
      description: body.description ?? null,
      goal_tags: body.goalTags ?? [],
      is_active: true,
    })
    .select("id,title")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Failed to publish listing" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, listing: data });
}
