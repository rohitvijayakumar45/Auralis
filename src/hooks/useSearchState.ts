import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseSearchState, serializeSearchState } from "../lib/searchState";
import type { SearchState } from "../types/domain";

export function usePersistentSearchState() {
  const [params, setParams] = useSearchParams();
  const search = useMemo(() => parseSearchState(params), [params]);

  function setSearch(patch: Partial<SearchState>) {
    setParams(serializeSearchState({ ...search, ...patch }), { replace: true });
  }

  return [search, setSearch] as const;
}
