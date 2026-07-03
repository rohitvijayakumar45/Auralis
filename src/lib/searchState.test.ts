import { describe, expect, it } from "vitest";
import { parseSearchState, serializeSearchState } from "./searchState";

describe("persistent search state", () => {
  it("round-trips query, filter, sort, and view through URL params", () => {
    const params = serializeSearchState({
      query: "portraits",
      filter: "favorites",
      sort: "newest",
      view: "grid"
    });

    expect(parseSearchState(params)).toEqual({
      query: "portraits",
      filter: "favorites",
      sort: "newest",
      view: "grid"
    });
  });

  it("uses premium defaults for incomplete URLs", () => {
    expect(parseSearchState(new URLSearchParams())).toEqual({
      query: "",
      filter: "all",
      sort: "newest",
      view: "grid"
    });
  });
});
