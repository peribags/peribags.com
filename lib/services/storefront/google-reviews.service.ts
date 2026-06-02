import "server-only";

/**
 * Live Google reviews for the homepage, pulled from the Google Places API.
 *
 * Configure with two server-side env vars:
 *   GOOGLE_PLACES_API_KEY  — a key with the Places API enabled
 *   GOOGLE_PLACE_ID        — your business' Place ID
 *
 * We try the new Places API first and fall back to the legacy Place Details
 * endpoint, so it works whichever variant the key has enabled. Results are
 * cached for 6 hours to stay well within quota.
 */

export type GoogleReview = {
  id: string;
  author: string;
  avatarUrl?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  authorUrl?: string;
};

export type GoogleReviews = {
  /** Overall place rating (e.g. 4.8). */
  rating: number | null;
  /** Total number of ratings. */
  total: number | null;
  /** Link to the business' Google profile. */
  profileUrl: string | null;
  reviews: GoogleReview[];
};

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours

export async function getGoogleReviews(): Promise<GoogleReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  const result =
    (await fetchFromNewApi(placeId, apiKey)) ??
    (await fetchFromLegacyApi(placeId, apiKey));

  if (!result) return null;
  // Nothing worth showing.
  if (result.reviews.length === 0 && result.rating == null) return null;
  return result;
}

// ── New Places API ──────────────────────────────────────────────────────────

type NewReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
};

type NewPlace = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: NewReview[];
};

async function fetchFromNewApi(
  placeId: string,
  apiKey: string,
): Promise<GoogleReviews | null> {
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as NewPlace;
    const reviews: GoogleReview[] = (data.reviews ?? [])
      .map((r, i): GoogleReview | null => {
        const text = r.text?.text?.trim() ?? "";
        const author = r.authorAttribution?.displayName?.trim() ?? "Google user";
        if (!text) return null;
        return {
          id: r.name ?? `${author}-${i}`,
          author,
          avatarUrl: r.authorAttribution?.photoUri || undefined,
          rating: typeof r.rating === "number" ? r.rating : 0,
          text,
          relativeTime: r.relativePublishTimeDescription || undefined,
          authorUrl: r.authorAttribution?.uri || undefined,
        };
      })
      .filter((r): r is GoogleReview => r !== null);

    return {
      rating: typeof data.rating === "number" ? data.rating : null,
      total: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      profileUrl: data.googleMapsUri ?? null,
      reviews,
    };
  } catch {
    return null;
  }
}

// ── Legacy Place Details API ─────────────────────────────────────────────────

type LegacyReview = {
  author_name?: string;
  profile_photo_url?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  author_url?: string;
  time?: number;
};

type LegacyResponse = {
  status?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: LegacyReview[];
  };
};

async function fetchFromLegacyApi(
  placeId: string,
  apiKey: string,
): Promise<GoogleReviews | null> {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "rating,user_ratings_total,reviews,url",
      reviews_sort: "newest",
      key: apiKey,
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as LegacyResponse;
    if (data.status && data.status !== "OK") return null;
    const result = data.result;
    if (!result) return null;

    const reviews: GoogleReview[] = (result.reviews ?? [])
      .map((r, i): GoogleReview | null => {
        const text = r.text?.trim() ?? "";
        const author = r.author_name?.trim() ?? "Google user";
        if (!text) return null;
        return {
          id: `${author}-${r.time ?? i}`,
          author,
          avatarUrl: r.profile_photo_url || undefined,
          rating: typeof r.rating === "number" ? r.rating : 0,
          text,
          relativeTime: r.relative_time_description || undefined,
          authorUrl: r.author_url || undefined,
        };
      })
      .filter((r): r is GoogleReview => r !== null);

    return {
      rating: typeof result.rating === "number" ? result.rating : null,
      total:
        typeof result.user_ratings_total === "number"
          ? result.user_ratings_total
          : null,
      profileUrl: result.url ?? null,
      reviews,
    };
  } catch {
    return null;
  }
}
