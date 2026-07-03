import type { SearchState } from "../types/domain";

const defaults: SearchState = {
  query: "",
  filter: "all",
  sort: "newest",
  view: "grid"
};

const filters = new Set<SearchState["filter"]>([
  "all",
  "favorites",
  "albums",
  "archive"
]);
const sorts = new Set<SearchState["sort"]>(["newest", "oldest", "name"]);
const views = new Set<SearchState["view"]>(["grid", "list"]);

export function parseSearchState(params: URLSearchParams): SearchState {
  const filter = params.get("filter") as SearchState["filter"] | null;
  const sort = params.get("sort") as SearchState["sort"] | null;
  const view = params.get("view") as SearchState["view"] | null;

  return {
    query: params.get("q") ?? defaults.query,
    filter: filter && filters.has(filter) ? filter : defaults.filter,
    sort: sort && sorts.has(sort) ? sort : defaults.sort,
    view: view && views.has(view) ? view : defaults.view
  };
}

export function serializeSearchState(state: SearchState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.filter !== defaults.filter) params.set("filter", state.filter);
  if (state.sort !== defaults.sort) params.set("sort", state.sort);
  if (state.view !== defaults.view) params.set("view", state.view);
  return params;
}
