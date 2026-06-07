"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { BrainwaveAudioEngine } from "@/lib/audio/engine";
import { DEFAULT_AUDIO_SETTINGS } from "@/lib/audio/types";
import { getBand } from "@/lib/audio/bands";
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
  const unlockedRef = useRef(false);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"trending" | "new">("trending");
  const [tagFilter, setTagFilter] = useState<GoalTag | "all">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listings, setListings] = useState<MarketplaceListing[]>(MARKETPLACE_SEED);
  const [showPublishForm, setShowPublishForm] = useState(false);

  const { entitlements: guestEntitlements } = usePlanTier();
  const authSession = useAuthSession();
  const usingRemote = authSession.authenticated;
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

  async function togglePreview(listingId: string) {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return;

    if (!unlockedRef.current) {
      await engineRef.current.unlock();
      unlockedRef.current = true;
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
          setMessage(data.message ?? "That import did not go through.");
          return;
        }

        setImportedListingIds((current) =>
          current.includes(listing.id) ? current : [...current, listing.id],
        );
        setMessage(`"${listing.title}" now lives in your library.`);
        return;
      } catch {
        setMessage("That import did not go through just now.");
        return;
      }
    }

    if (!entitlements.canImport) {
      setMessage("Importing community work is a Premium privilege.");
      return;
    }

    if (importedListingIds.includes(listing.id)) {
      setMessage("Already in your library.");
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
    setMessage(`"${listing.title}" now lives in your library.`);
  }

  async function publishListing() {
    if (!usingRemote) {
      setMessage("Sign in to share your work with the community.");
      return;
    }

    if (!entitlements.canPublish) {
      setMessage("Publishing to the market is a Premium privilege.");
      return;
    }

    if (!publishSourceId.trim() || !publishTitle.trim()) {
      setMessage("A title and the preset or journey to share are both needed.");
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
        setMessage(data.message ?? "That listing could not be published.");
        return;
      }

      setMessage("Your work is live in the market.");
      setPublishSourceId("");
      setPublishTitle("");
      authSession.refresh();
    } catch {
      setMessage("That listing could not be published just now.");
    }
  }

  const visibleListings = useMemo(() => listings, [listings]);

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">The market</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Frequencies tuned by practitioners, shared with the community. Preview any of them free.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(["trending", "new"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`chip text-xs capitalize ${sortMode === mode ? "chip-active" : ""}`}
          >
            {mode}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-[var(--hairline-soft)]" />
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag)}
            className={`chip text-xs capitalize ${tagFilter === tag ? "chip-active" : ""}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {message ? <div className="card-gold text-xs">{message}</div> : null}

      {!entitlements.canImport ? (
        <div className="card text-xs text-ink-muted">
          <p>
            Browsing and previews are always free. Bringing community work into your own library
            comes with Premium.
          </p>
          <Link href="/pricing" className="btn-quiet mt-3 text-xs">
            See Premium
          </Link>
        </div>
      ) : null}

      {loadingListings ? <p className="text-xs text-ink-faint">Gathering the market…</p> : null}

      <ul className="space-y-2.5">
        {visibleListings.map((listing) => {
          const band = getBand(listing.preview.entrainmentHz);
          const imported = importedListingIds.includes(listing.id);
          return (
            <li
              key={listing.id}
              className="rounded-2xl border border-[var(--hairline-soft)] bg-[var(--veil)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-medium text-ink">{listing.title}</h2>
                  <p className="hz-readout mt-0.5 text-sm text-gold-bright">
                    {listing.preview.entrainmentHz} Hz {band.name.toLowerCase()} ·{" "}
                    {Math.round(listing.preview.carrierHz)} Hz carrier
                  </p>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    by {listing.creator}
                    {listing.creatorBadge ? ` · ${listing.creatorBadge}` : ""} ·{" "}
                    {listing.type === "program" ? "journey" : "preset"} · {listing.tags.join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => void togglePreview(listing.id)}
                    className="btn-quiet px-3.5 py-1 text-[11px]"
                  >
                    {playingPreviewId === listing.id ? "Stop" : "Listen"}
                  </button>
                  <button
                    onClick={() => void importListing(listing.id)}
                    disabled={imported}
                    className="btn-gold px-3.5 py-1 text-[11px]"
                  >
                    {imported ? "In library" : "Keep"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <article className="card space-y-3">
        <button
          onClick={() => setShowPublishForm((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="h-display text-xl">Share your work</span>
          <span className="text-xs text-ink-faint">{showPublishForm ? "Close" : "Open"}</span>
        </button>
        {showPublishForm ? (
          <div className="space-y-3">
            <p className="text-xs text-ink-muted">
              Publish a preset or journey from your library into the market.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="label space-y-1.5">
                Kind
                <select
                  value={publishType}
                  onChange={(event) => setPublishType(event.target.value as "preset" | "program")}
                  className="field"
                >
                  <option value="preset">preset</option>
                  <option value="program">journey</option>
                </select>
              </label>
              <label className="label space-y-1.5">
                Library item ID
                <input
                  value={publishSourceId}
                  onChange={(event) => setPublishSourceId(event.target.value)}
                  placeholder="From your library"
                  className="field"
                />
              </label>
            </div>
            <label className="label space-y-1.5">
              Title
              <input
                value={publishTitle}
                onChange={(event) => setPublishTitle(event.target.value)}
                placeholder="Golden Hour Focus"
                className="field"
              />
            </label>
            <label className="label space-y-1.5">
              Tags
              <input
                value={publishTags}
                onChange={(event) => setPublishTags(event.target.value)}
                placeholder="focus, calm"
                className="field"
              />
            </label>
            <button onClick={() => void publishListing()} className="btn-gold w-full text-xs">
              Publish to Market
            </button>
          </div>
        ) : null}
      </article>
    </section>
  );
}
