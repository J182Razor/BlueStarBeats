"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { BrainwaveAudioEngine } from "@/lib/audio/engine";
import { DEFAULT_AUDIO_SETTINGS } from "@/lib/audio/types";
import type { GoalTag, MarketplaceListing, ProgramRecord, ProgramWaypoint, PresetRecord } from "@/lib/domain";
import { generateId } from "@/lib/id";
import { MARKETPLACE_SEED } from "@/lib/marketplace-seed";

const PRESETS_STORAGE_KEY = "bsb_presets";
const PROGRAMS_STORAGE_KEY = "bsb_programs";
const IMPORTS_STORAGE_KEY = "bsb_imported_listings";
const TAG_FILTERS: Array<GoalTag | "all"> = ["all", "sleep", "focus", "calm", "meditation", "custom"];

export default function MarketplacePage() {
  const engineRef = useRef(new BrainwaveAudioEngine(DEFAULT_AUDIO_SETTINGS));
  const previewRef = useRef<string | null>(null);
  const [unlockedPreview, setUnlockedPreview] = useState(false);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"trending" | "new">("trending");
  const [tagFilter, setTagFilter] = useState<GoalTag | "all">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listings, setListings] = useState<MarketplaceListing[]>(MARKETPLACE_SEED);

  const { tier: guestTier, entitlements: guestEntitlements } = usePlanTier();
  const authSession = useAuthSession();
  const usingRemote = authSession.authenticated;
  const tier = usingRemote ? authSession.tier : guestTier;
  const entitlements = usingRemote ? authSession.entitlements : guestEntitlements;

  const [publishType, setPublishType] = useState<"preset" | "program">("preset");
  const [publishSourceId, setPublishSourceId] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishTags, setPublishTags] = useState("focus");

  const [importedListingIds, setImportedListingIds] = useLocalStorageState<string[]>(IMPORTS_STORAGE_KEY, []);
  const [, setPresets] = useLocalStorageState<PresetRecord[]>(PRESETS_STORAGE_KEY, []);
  const [, setPrograms] = useLocalStorageState<ProgramRecord[]>(PROGRAMS_STORAGE_KEY, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadingListings(true);
      try {
        const response = await fetch(`/api/marketplace/listings?sort=${sortMode}&tag=${tagFilter}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("fallback");
        const data = (await response.json()) as { listings?: MarketplaceListing[] };
        if (active && data.listings) {
          setListings(data.listings);
        }
      } catch {
        if (!active) return;
        const fallback = MARKETPLACE_SEED.filter((listing) =>
          tagFilter === "all" ? true : listing.tags.includes(tagFilter),
        ).sort((a, b) => {
          if (sortMode === "trending") return b.trendScore - a.trendScore;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setListings(fallback);
      } finally {
        if (active) setLoadingListings(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [sortMode, tagFilter, usingRemote]);

  async function unlockPreview() {
    await engineRef.current.unlock();
    setUnlockedPreview(true);
  }

  async function togglePreview(listingId: string) {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return;

    if (!unlockedPreview) {
      setMessage("Tap “Unlock Preview Audio” before playing previews.");
      return;
    }

    if (playingPreviewId === listingId) {
      await engineRef.current.stop();
      previewRef.current = null;
      setPlayingPreviewId(null);
      return;
    }

    await engineRef.current.start(listing.preview);
    previewRef.current = listingId;
    setPlayingPreviewId(listingId);
    window.setTimeout(() => {
      if (previewRef.current === listingId) {
        void engineRef.current.stop();
        previewRef.current = null;
        setPlayingPreviewId(null);
      }
    }, 15000);
  }

  async function importListing(listingId: string) {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return;

    if (usingRemote) {
      try {
        const response = await fetch("/api/marketplace/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });

        const data = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok) {
          setMessage(data.message ?? "Import blocked.");
          return;
        }

        setImportedListingIds((current) =>
          current.includes(listing.id) ? current : [...current, listing.id],
        );
        setMessage(`Imported "${listing.title}" into your Supabase account.`);
        return;
      } catch {
        setMessage("Could not import listing.");
        return;
      }
    }

    if (!entitlements.canImport) {
      setMessage("Import is locked on Free. Upgrade to Pro or Elite.");
      return;
    }

    if (importedListingIds.includes(listing.id)) {
      setMessage("Already imported.");
      return;
    }

    if (listing.type === "preset") {
      const preset: PresetRecord = {
        id: generateId(),
        name: listing.title,
        tags: listing.tags,
        createdAt: new Date().toISOString(),
        ...listing.preview,
      };
      setPresets((current) => [preset, ...current]);
    } else {
      const waypoint: ProgramWaypoint = {
        id: generateId(),
        durationMinutes: 10,
        transitionType: "step",
        ...listing.preview,
      };
      const program: ProgramRecord = {
        id: generateId(),
        name: listing.title,
        goalTag: listing.tags[0] ?? "custom",
        waypoints: [waypoint],
        createdAt: new Date().toISOString(),
      };
      setPrograms((current) => [program, ...current]);
    }

    setImportedListingIds((current) => [...current, listing.id]);
    setMessage(`Imported "${listing.title}".`);
  }

  async function publishListing() {
    if (!usingRemote) {
      setMessage("Sign in first to publish listings to Supabase marketplace.");
      return;
    }

    if (!entitlements.canPublish) {
      setMessage("Publishing is locked on Free. Upgrade to publish in Marketplace.");
      return;
    }

    if (!publishSourceId.trim() || !publishTitle.trim()) {
      setMessage("Source ID and title are required.");
      return;
    }

    const tags = publishTags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingType: publishType,
          sourceId: publishSourceId.trim(),
          title: publishTitle.trim(),
          goalTags: tags,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok) {
        setMessage(data.message ?? "Publish failed.");
        return;
      }

      setMessage("Listing published.");
      setPublishSourceId("");
      setPublishTitle("");
      authSession.refresh();
    } catch {
      setMessage("Could not publish listing.");
    }
  }

  const visibleListings = useMemo(() => listings, [listings]);

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Marketplace</h1>
        <p className="mt-2 text-sm text-slate-200/80">
          Browse trending/new community protocols. Tier <span className="font-semibold">{tier}</span>.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={unlockPreview}
          className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
        >
          Unlock Preview Audio
        </button>
        <button
          onClick={() => void publishListing()}
          className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-200"
        >
          Publish Protocol
        </button>
      </div>

      <article className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Publish Form</p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={publishType}
            onChange={(event) => setPublishType(event.target.value as "preset" | "program")}
            className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-xs text-white"
          >
            <option value="preset">preset</option>
            <option value="program">program</option>
          </select>
          <input
            value={publishSourceId}
            onChange={(event) => setPublishSourceId(event.target.value)}
            placeholder="source id"
            className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-xs text-white"
          />
          <input
            value={publishTitle}
            onChange={(event) => setPublishTitle(event.target.value)}
            placeholder="listing title"
            className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-xs text-white"
          />
          <input
            value={publishTags}
            onChange={(event) => setPublishTags(event.target.value)}
            placeholder="tags: focus,calm"
            className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-xs text-white"
          />
        </div>
      </article>

      {message ? (
        <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-3 text-xs text-cyan-100">
          {message}
        </div>
      ) : null}

      {!entitlements.canImport ? (
        <div className="rounded-xl border border-amber-300/35 bg-amber-100/10 p-3 text-xs text-amber-100">
          <p>Import is locked. Unlock with Pro or Elite.</p>
          <Link href="/pricing" className="mt-2 inline-block rounded-lg bg-amber-200/20 px-3 py-1">
            Upgrade
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSortMode("trending")}
          className={`rounded-full px-3 py-1 text-xs ${
            sortMode === "trending" ? "bg-cyan-400/30 text-cyan-100" : "bg-slate-800 text-slate-300"
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setSortMode("new")}
          className={`rounded-full px-3 py-1 text-xs ${
            sortMode === "new" ? "bg-cyan-400/30 text-cyan-100" : "bg-slate-800 text-slate-300"
          }`}
        >
          New
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag)}
            className={`rounded-full px-3 py-1 text-xs ${
              tagFilter === tag ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loadingListings ? <p className="text-xs text-slate-400">Loading marketplace...</p> : null}

      <ul className="space-y-3">
        {visibleListings.map((listing) => (
          <li key={listing.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">{listing.title}</h2>
                <p className="text-xs text-slate-300">
                  {listing.creator}
                  {listing.creatorBadge ? ` · ${listing.creatorBadge}` : ""} · {listing.type}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {listing.tags.join(", ")} · score {listing.trendScore}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => void togglePreview(listing.id)}
                  className="rounded-lg bg-cyan-400/20 px-2 py-1 text-[11px] text-cyan-100"
                >
                  {playingPreviewId === listing.id ? "Stop" : "Preview"}
                </button>
                <button
                  onClick={() => void importListing(listing.id)}
                  className="rounded-lg bg-emerald-400/20 px-2 py-1 text-[11px] text-emerald-100"
                >
                  {importedListingIds.includes(listing.id) ? "Imported" : "Import"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
