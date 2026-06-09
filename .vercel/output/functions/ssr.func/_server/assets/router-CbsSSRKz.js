import { r as reactExports, f as functionalUpdate, a as arraysEqual, c as createLRUCache, i as isPromise, b as isRedirect, d as isNotFound, e as invariant, g as createControlledPromise, h as rootRouteId, j as isServer, k as compileDecodeCharMap, t as trimPath, l as rewriteBasepath, m as composeRewrites, p as processRouteTree, n as processRouteMasks, o as resolvePath, q as cleanPath, s as trimPathRight, u as parseHref, v as executeRewriteInput, w as isDangerousProtocol, x as redirect, y as findSingleMatch, z as deepEqual, D as DEFAULT_PROTOCOL_ALLOWLIST, A as interpolatePath, B as nullReplaceEqualDeep, C as replaceEqualDeep, E as last, F as decodePath, G as findFlatMatch, H as findRouteMatch, I as executeRewriteOutput, J as encodePathLikeUrl, K as trimPathLeft, L as joinPaths, M as useRouter, N as dummyMatchContext, O as matchContext, P as requireReactDom, Q as getDefaultExportFromCjs, R as exactPathTest, S as removeTrailingSlash, T as React, U as jsxRuntimeExports, V as isModuleNotFoundError, W as useHydrated, X as escapeHtml, Y as getAssetCrossOrigin, Z as resolveManifestAssetLink, _ as TSS_SERVER_FUNCTION, $ as getServerFnById, a0 as createServerFn, a1 as Outlet } from "../server.js";
import { e as emailSchema, s as supabase } from "./adminHelpers.server-BhLg7GIA.js";
import { o as objectType, a as arrayType, s as stringType, b as anyType, r as recordType, e as enumType, n as numberType } from "./client.server-C7GAOqxY.js";
var reactUse = reactExports.use;
function useForwardedRef(ref) {
  const innerRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => innerRef.current, []);
  return innerRef;
}
function encode(obj, stringify = String) {
  const result = new URLSearchParams();
  for (const key in obj) {
    const val = obj[key];
    if (val !== void 0) result.set(key, stringify(val));
  }
  return result.toString();
}
function toValue$1(str) {
  if (!str) return "";
  if (str === "false") return false;
  if (str === "true") return true;
  return +str * 0 === 0 && +str + "" === str ? +str : str;
}
function decode(str) {
  const searchParams = new URLSearchParams(str);
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of searchParams.entries()) {
    const previousValue = result[key];
    if (previousValue == null) result[key] = toValue$1(value);
    else if (Array.isArray(previousValue)) previousValue.push(toValue$1(value));
    else result[key] = [previousValue, toValue$1(value)];
  }
  return result;
}
var defaultParseSearch = parseSearchWith(JSON.parse);
var defaultStringifySearch = stringifySearchWith(JSON.stringify, JSON.parse);
function parseSearchWith(parser) {
  return (searchStr) => {
    if (searchStr[0] === "?") searchStr = searchStr.substring(1);
    const query = decode(searchStr);
    for (const key in query) {
      const value = query[key];
      if (typeof value === "string") try {
        query[key] = parser(value);
      } catch (_err) {
      }
    }
    return query;
  };
}
function stringifySearchWith(stringify, parser) {
  const hasParser = typeof parser === "function";
  function stringifyValue(val) {
    if (typeof val === "object" && val !== null) try {
      return stringify(val);
    } catch (_err) {
    }
    else if (hasParser && typeof val === "string") try {
      parser(val);
      return stringify(val);
    } catch (_err) {
    }
    return val;
  }
  return (search) => {
    const searchStr = encode(search, stringifyValue);
    return searchStr ? `?${searchStr}` : "";
  };
}
function createNonReactiveMutableStore(initialValue) {
  let value = initialValue;
  return {
    get() {
      return value;
    },
    set(nextOrUpdater) {
      value = functionalUpdate(nextOrUpdater, value);
    }
  };
}
function createNonReactiveReadonlyStore(read) {
  return { get() {
    return read();
  } };
}
function createRouterStores(initialState, config) {
  const { createMutableStore, createReadonlyStore, batch, init } = config;
  const matchStores = /* @__PURE__ */ new Map();
  const pendingMatchStores = /* @__PURE__ */ new Map();
  const cachedMatchStores = /* @__PURE__ */ new Map();
  const status = createMutableStore(initialState.status);
  const loadedAt = createMutableStore(initialState.loadedAt);
  const isLoading = createMutableStore(initialState.isLoading);
  const isTransitioning = createMutableStore(initialState.isTransitioning);
  const location = createMutableStore(initialState.location);
  const resolvedLocation = createMutableStore(initialState.resolvedLocation);
  const statusCode = createMutableStore(initialState.statusCode);
  const redirect2 = createMutableStore(initialState.redirect);
  const matchesId = createMutableStore([]);
  const pendingIds = createMutableStore([]);
  const cachedIds = createMutableStore([]);
  const matches = createReadonlyStore(() => readPoolMatches(matchStores, matchesId.get()));
  const pendingMatches = createReadonlyStore(() => readPoolMatches(pendingMatchStores, pendingIds.get()));
  const cachedMatches = createReadonlyStore(() => readPoolMatches(cachedMatchStores, cachedIds.get()));
  const firstId = createReadonlyStore(() => matchesId.get()[0]);
  const hasPending = createReadonlyStore(() => matchesId.get().some((matchId) => {
    return matchStores.get(matchId)?.get().status === "pending";
  }));
  const matchRouteDeps = createReadonlyStore(() => ({
    locationHref: location.get().href,
    resolvedLocationHref: resolvedLocation.get()?.href,
    status: status.get()
  }));
  const __store = createReadonlyStore(() => ({
    status: status.get(),
    loadedAt: loadedAt.get(),
    isLoading: isLoading.get(),
    isTransitioning: isTransitioning.get(),
    matches: matches.get(),
    location: location.get(),
    resolvedLocation: resolvedLocation.get(),
    statusCode: statusCode.get(),
    redirect: redirect2.get()
  }));
  const matchStoreByRouteIdCache = createLRUCache(64);
  function getRouteMatchStore(routeId) {
    let cached = matchStoreByRouteIdCache.get(routeId);
    if (!cached) {
      cached = createReadonlyStore(() => {
        const ids = matchesId.get();
        for (const id of ids) {
          const matchStore = matchStores.get(id);
          if (matchStore && matchStore.routeId === routeId) return matchStore.get();
        }
      });
      matchStoreByRouteIdCache.set(routeId, cached);
    }
    return cached;
  }
  const store = {
    status,
    loadedAt,
    isLoading,
    isTransitioning,
    location,
    resolvedLocation,
    statusCode,
    redirect: redirect2,
    matchesId,
    pendingIds,
    cachedIds,
    matches,
    pendingMatches,
    cachedMatches,
    firstId,
    hasPending,
    matchRouteDeps,
    matchStores,
    pendingMatchStores,
    cachedMatchStores,
    __store,
    getRouteMatchStore,
    setMatches,
    setPending,
    setCached
  };
  setMatches(initialState.matches);
  init?.(store);
  function setMatches(nextMatches) {
    reconcileMatchPool(nextMatches, matchStores, matchesId, createMutableStore, batch);
  }
  function setPending(nextMatches) {
    reconcileMatchPool(nextMatches, pendingMatchStores, pendingIds, createMutableStore, batch);
  }
  function setCached(nextMatches) {
    reconcileMatchPool(nextMatches, cachedMatchStores, cachedIds, createMutableStore, batch);
  }
  return store;
}
function readPoolMatches(pool, ids) {
  const matches = [];
  for (const id of ids) {
    const matchStore = pool.get(id);
    if (matchStore) matches.push(matchStore.get());
  }
  return matches;
}
function reconcileMatchPool(nextMatches, pool, idStore, createMutableStore, batch) {
  const nextIds = nextMatches.map((d2) => d2.id);
  const nextIdSet = new Set(nextIds);
  batch(() => {
    for (const id of pool.keys()) if (!nextIdSet.has(id)) pool.delete(id);
    for (const nextMatch of nextMatches) {
      const existing = pool.get(nextMatch.id);
      if (!existing) {
        const matchStore = createMutableStore(nextMatch);
        matchStore.routeId = nextMatch.routeId;
        pool.set(nextMatch.id, matchStore);
        continue;
      }
      existing.routeId = nextMatch.routeId;
      if (existing.get() !== nextMatch) existing.set(nextMatch);
    }
    if (!arraysEqual(idStore.get(), nextIds)) idStore.set(nextIds);
  });
}
var triggerOnReady = (inner) => {
  if (!inner.rendered) {
    inner.rendered = true;
    return inner.onReady?.();
  }
};
var resolvePreload = (inner, matchId) => {
  return !!(inner.preload && !inner.router.stores.matchStores.has(matchId));
};
var buildMatchContext = (inner, index, includeCurrentMatch = true) => {
  const context = { ...inner.router.options.context ?? {} };
  const end = includeCurrentMatch ? index : index - 1;
  for (let i = 0; i <= end; i++) {
    const innerMatch = inner.matches[i];
    if (!innerMatch) continue;
    const m2 = inner.router.getMatch(innerMatch.id);
    if (!m2) continue;
    Object.assign(context, m2.__routeContext, m2.__beforeLoadContext);
  }
  return context;
};
var getNotFoundBoundaryIndex = (inner, err) => {
  if (!inner.matches.length) return;
  const requestedRouteId = err.routeId;
  const matchedRootIndex = inner.matches.findIndex((m2) => m2.routeId === inner.router.routeTree.id);
  const rootIndex = matchedRootIndex >= 0 ? matchedRootIndex : 0;
  let startIndex = requestedRouteId ? inner.matches.findIndex((match) => match.routeId === requestedRouteId) : inner.firstBadMatchIndex ?? inner.matches.length - 1;
  if (startIndex < 0) startIndex = rootIndex;
  for (let i = startIndex; i >= 0; i--) {
    const match = inner.matches[i];
    if (inner.router.looseRoutesById[match.routeId].options.notFoundComponent) return i;
  }
  return requestedRouteId ? startIndex : rootIndex;
};
var handleRedirectAndNotFound = (inner, match, err) => {
  if (!isRedirect(err) && !isNotFound(err)) return;
  if (isRedirect(err) && err.redirectHandled && !err.options.reloadDocument) throw err;
  if (match) {
    match._nonReactive.beforeLoadPromise?.resolve();
    match._nonReactive.loaderPromise?.resolve();
    match._nonReactive.beforeLoadPromise = void 0;
    match._nonReactive.loaderPromise = void 0;
    match._nonReactive.error = err;
    inner.updateMatch(match.id, (prev) => ({
      ...prev,
      status: isRedirect(err) ? "redirected" : isNotFound(err) ? "notFound" : prev.status === "pending" ? "success" : prev.status,
      context: buildMatchContext(inner, match.index),
      isFetching: false,
      error: err
    }));
    if (isNotFound(err) && !err.routeId) err.routeId = match.routeId;
    match._nonReactive.loadPromise?.resolve();
  }
  if (isRedirect(err)) {
    inner.rendered = true;
    err.options._fromLocation = inner.location;
    err.redirectHandled = true;
    err = inner.router.resolveRedirect(err);
  }
  throw err;
};
var shouldSkipLoader = (inner, matchId) => {
  const match = inner.router.getMatch(matchId);
  if (!match) return true;
  if (match.ssr === false) return true;
  return false;
};
var syncMatchContext = (inner, matchId, index) => {
  const nextContext = buildMatchContext(inner, index);
  inner.updateMatch(matchId, (prev) => {
    return {
      ...prev,
      context: nextContext
    };
  });
};
var handleSerialError = (inner, index, err, routerCode) => {
  const { id: matchId, routeId } = inner.matches[index];
  const route = inner.router.looseRoutesById[routeId];
  if (err instanceof Promise) throw err;
  err.routerCode = routerCode;
  inner.firstBadMatchIndex ??= index;
  handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), err);
  try {
    route.options.onError?.(err);
  } catch (errorHandlerErr) {
    err = errorHandlerErr;
    handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), err);
  }
  inner.updateMatch(matchId, (prev) => {
    prev._nonReactive.beforeLoadPromise?.resolve();
    prev._nonReactive.beforeLoadPromise = void 0;
    prev._nonReactive.loadPromise?.resolve();
    return {
      ...prev,
      error: err,
      status: "error",
      isFetching: false,
      updatedAt: Date.now(),
      abortController: new AbortController()
    };
  });
  if (!inner.preload && !isRedirect(err) && !isNotFound(err)) inner.serialError ??= err;
};
var isBeforeLoadSsr = (inner, matchId, index, route) => {
  const existingMatch = inner.router.getMatch(matchId);
  const parentMatchId = inner.matches[index - 1]?.id;
  const parentMatch = parentMatchId ? inner.router.getMatch(parentMatchId) : void 0;
  if (inner.router.isShell()) {
    existingMatch.ssr = route.id === rootRouteId;
    return;
  }
  if (parentMatch?.ssr === false) {
    existingMatch.ssr = false;
    return;
  }
  const parentOverride = (tempSsr2) => {
    if (tempSsr2 === true && parentMatch?.ssr === "data-only") return "data-only";
    return tempSsr2;
  };
  const defaultSsr = inner.router.options.defaultSsr ?? true;
  if (route.options.ssr === void 0) {
    existingMatch.ssr = parentOverride(defaultSsr);
    return;
  }
  if (typeof route.options.ssr !== "function") {
    existingMatch.ssr = parentOverride(route.options.ssr);
    return;
  }
  const { search, params } = existingMatch;
  const ssrFnContext = {
    search: makeMaybe(search, existingMatch.searchError),
    params: makeMaybe(params, existingMatch.paramsError),
    location: inner.location,
    matches: inner.matches.map((match) => ({
      index: match.index,
      pathname: match.pathname,
      fullPath: match.fullPath,
      staticData: match.staticData,
      id: match.id,
      routeId: match.routeId,
      search: makeMaybe(match.search, match.searchError),
      params: makeMaybe(match.params, match.paramsError),
      ssr: match.ssr
    }))
  };
  const tempSsr = route.options.ssr(ssrFnContext);
  if (isPromise(tempSsr)) return tempSsr.then((ssr) => {
    existingMatch.ssr = parentOverride(ssr ?? defaultSsr);
  });
  existingMatch.ssr = parentOverride(tempSsr ?? defaultSsr);
};
var setupPendingTimeout = (inner, matchId, route, match) => {
  if (match._nonReactive.pendingTimeout !== void 0) return;
  const pendingMs = route.options.pendingMs ?? inner.router.options.defaultPendingMs;
  if (!!(inner.onReady && false)) {
    const pendingTimeout = setTimeout(() => {
      triggerOnReady(inner);
    }, pendingMs);
    match._nonReactive.pendingTimeout = pendingTimeout;
  }
};
var preBeforeLoadSetup = (inner, matchId, route) => {
  const existingMatch = inner.router.getMatch(matchId);
  if (!existingMatch._nonReactive.beforeLoadPromise && !existingMatch._nonReactive.loaderPromise) return;
  setupPendingTimeout(inner, matchId, route, existingMatch);
  const then = () => {
    const match = inner.router.getMatch(matchId);
    if (match.preload && (match.status === "redirected" || match.status === "notFound")) handleRedirectAndNotFound(inner, match, match.error);
  };
  return existingMatch._nonReactive.beforeLoadPromise ? existingMatch._nonReactive.beforeLoadPromise.then(then) : then();
};
var executeBeforeLoad = (inner, matchId, index, route) => {
  const match = inner.router.getMatch(matchId);
  let prevLoadPromise = match._nonReactive.loadPromise;
  match._nonReactive.loadPromise = createControlledPromise(() => {
    prevLoadPromise?.resolve();
    prevLoadPromise = void 0;
  });
  const { paramsError, searchError } = match;
  if (paramsError) handleSerialError(inner, index, paramsError, "PARSE_PARAMS");
  if (searchError) handleSerialError(inner, index, searchError, "VALIDATE_SEARCH");
  setupPendingTimeout(inner, matchId, route, match);
  const abortController = new AbortController();
  let isPending = false;
  const pending = () => {
    if (isPending) return;
    isPending = true;
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: "beforeLoad",
      fetchCount: prev.fetchCount + 1,
      abortController
    }));
  };
  const resolve = () => {
    match._nonReactive.beforeLoadPromise?.resolve();
    match._nonReactive.beforeLoadPromise = void 0;
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: false
    }));
  };
  if (!route.options.beforeLoad) {
    inner.router.batch(() => {
      pending();
      resolve();
    });
    return;
  }
  match._nonReactive.beforeLoadPromise = createControlledPromise();
  const context = {
    ...buildMatchContext(inner, index, false),
    ...match.__routeContext
  };
  const { search, params, cause } = match;
  const preload = resolvePreload(inner, matchId);
  const beforeLoadFnContext = {
    search,
    abortController,
    params,
    preload,
    context,
    location: inner.location,
    navigate: (opts) => inner.router.navigate({
      ...opts,
      _fromLocation: inner.location
    }),
    buildLocation: inner.router.buildLocation,
    cause: preload ? "preload" : cause,
    matches: inner.matches,
    routeId: route.id,
    ...inner.router.options.additionalContext
  };
  const updateContext = (beforeLoadContext2) => {
    if (beforeLoadContext2 === void 0) {
      inner.router.batch(() => {
        pending();
        resolve();
      });
      return;
    }
    if (isRedirect(beforeLoadContext2) || isNotFound(beforeLoadContext2)) {
      pending();
      handleSerialError(inner, index, beforeLoadContext2, "BEFORE_LOAD");
    }
    inner.router.batch(() => {
      pending();
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        __beforeLoadContext: beforeLoadContext2
      }));
      resolve();
    });
  };
  let beforeLoadContext;
  try {
    beforeLoadContext = route.options.beforeLoad(beforeLoadFnContext);
    if (isPromise(beforeLoadContext)) {
      pending();
      return beforeLoadContext.catch((err) => {
        handleSerialError(inner, index, err, "BEFORE_LOAD");
      }).then(updateContext);
    }
  } catch (err) {
    pending();
    handleSerialError(inner, index, err, "BEFORE_LOAD");
  }
  updateContext(beforeLoadContext);
};
var handleBeforeLoad = (inner, index) => {
  const { id: matchId, routeId } = inner.matches[index];
  const route = inner.router.looseRoutesById[routeId];
  const serverSsr = () => {
    {
      const maybePromise = isBeforeLoadSsr(inner, matchId, index, route);
      if (isPromise(maybePromise)) return maybePromise.then(queueExecution);
    }
    return queueExecution();
  };
  const execute = () => executeBeforeLoad(inner, matchId, index, route);
  const queueExecution = () => {
    if (shouldSkipLoader(inner, matchId)) return;
    const result = preBeforeLoadSetup(inner, matchId, route);
    return isPromise(result) ? result.then(execute) : execute();
  };
  return serverSsr();
};
var executeHead = (inner, matchId, route) => {
  const match = inner.router.getMatch(matchId);
  if (!match) return;
  if (!route.options.head && !route.options.scripts && !route.options.headers) return;
  const assetContext = {
    ssr: inner.router.options.ssr,
    matches: inner.matches,
    match,
    params: match.params,
    loaderData: match.loaderData
  };
  return Promise.all([
    route.options.head?.(assetContext),
    route.options.scripts?.(assetContext),
    route.options.headers?.(assetContext)
  ]).then(([headFnContent, scripts, headers]) => {
    return {
      meta: headFnContent?.meta,
      links: headFnContent?.links,
      headScripts: headFnContent?.scripts,
      headers,
      scripts,
      styles: headFnContent?.styles
    };
  });
};
var getLoaderContext = (inner, matchPromises, matchId, index, route) => {
  const parentMatchPromise = matchPromises[index - 1];
  const { params, loaderDeps, abortController, cause } = inner.router.getMatch(matchId);
  const context = buildMatchContext(inner, index);
  const preload = resolvePreload(inner, matchId);
  return {
    params,
    deps: loaderDeps,
    preload: !!preload,
    parentMatchPromise,
    abortController,
    context,
    location: inner.location,
    navigate: (opts) => inner.router.navigate({
      ...opts,
      _fromLocation: inner.location
    }),
    cause: preload ? "preload" : cause,
    route,
    ...inner.router.options.additionalContext
  };
};
var runLoader = async (inner, matchPromises, matchId, index, route) => {
  try {
    const match = inner.router.getMatch(matchId);
    try {
      if (!(isServer ?? inner.router.isServer) || match.ssr === true) loadRouteChunk(route);
      const routeLoader = route.options.loader;
      const loader = typeof routeLoader === "function" ? routeLoader : routeLoader?.handler;
      const loaderResult = loader?.(getLoaderContext(inner, matchPromises, matchId, index, route));
      const loaderResultIsPromise = !!loader && isPromise(loaderResult);
      if (!!(loaderResultIsPromise || route._lazyPromise || route._componentsPromise || route.options.head || route.options.scripts || route.options.headers || match._nonReactive.minPendingPromise)) inner.updateMatch(matchId, (prev) => ({
        ...prev,
        isFetching: "loader"
      }));
      if (loader) {
        const loaderData = loaderResultIsPromise ? await loaderResult : loaderResult;
        handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), loaderData);
        if (loaderData !== void 0) inner.updateMatch(matchId, (prev) => ({
          ...prev,
          loaderData
        }));
      }
      if (route._lazyPromise) await route._lazyPromise;
      const pendingPromise = match._nonReactive.minPendingPromise;
      if (pendingPromise) await pendingPromise;
      if (route._componentsPromise) await route._componentsPromise;
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        error: void 0,
        context: buildMatchContext(inner, index),
        status: "success",
        isFetching: false,
        updatedAt: Date.now()
      }));
    } catch (e) {
      let error = e;
      if (error?.name === "AbortError") {
        if (match.abortController.signal.aborted) {
          match._nonReactive.loaderPromise?.resolve();
          match._nonReactive.loaderPromise = void 0;
          return;
        }
        inner.updateMatch(matchId, (prev) => ({
          ...prev,
          status: prev.status === "pending" ? "success" : prev.status,
          isFetching: false,
          context: buildMatchContext(inner, index)
        }));
        return;
      }
      const pendingPromise = match._nonReactive.minPendingPromise;
      if (pendingPromise) await pendingPromise;
      if (isNotFound(e)) await route.options.notFoundComponent?.preload?.();
      handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), e);
      try {
        route.options.onError?.(e);
      } catch (onErrorError) {
        error = onErrorError;
        handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), onErrorError);
      }
      if (!isRedirect(error) && !isNotFound(error)) await loadRouteChunk(route, ["errorComponent"]);
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        error,
        context: buildMatchContext(inner, index),
        status: "error",
        isFetching: false
      }));
    }
  } catch (err) {
    const match = inner.router.getMatch(matchId);
    if (match) match._nonReactive.loaderPromise = void 0;
    handleRedirectAndNotFound(inner, match, err);
  }
};
var loadRouteMatch = async (inner, matchPromises, index) => {
  async function handleLoader(preload, prevMatch, previousRouteMatchId, match2, route2) {
    const age = Date.now() - prevMatch.updatedAt;
    const staleAge = preload ? route2.options.preloadStaleTime ?? inner.router.options.defaultPreloadStaleTime ?? 3e4 : route2.options.staleTime ?? inner.router.options.defaultStaleTime ?? 0;
    const shouldReloadOption = route2.options.shouldReload;
    const shouldReload = typeof shouldReloadOption === "function" ? shouldReloadOption(getLoaderContext(inner, matchPromises, matchId, index, route2)) : shouldReloadOption;
    const { status, invalid } = match2;
    const staleMatchShouldReload = age >= staleAge && (!!inner.forceStaleReload || match2.cause === "enter" || previousRouteMatchId !== void 0 && previousRouteMatchId !== match2.id);
    loaderShouldRunAsync = status === "success" && (invalid || (shouldReload ?? staleMatchShouldReload));
    if (preload && route2.options.preload === false) ;
    else if (loaderShouldRunAsync && !inner.sync && shouldReloadInBackground) {
      loaderIsRunningAsync = true;
      (async () => {
        try {
          await runLoader(inner, matchPromises, matchId, index, route2);
          const match3 = inner.router.getMatch(matchId);
          match3._nonReactive.loaderPromise?.resolve();
          match3._nonReactive.loadPromise?.resolve();
          match3._nonReactive.loaderPromise = void 0;
          match3._nonReactive.loadPromise = void 0;
        } catch (err) {
          if (isRedirect(err)) await inner.router.navigate(err.options);
        }
      })();
    } else if (status !== "success" || loaderShouldRunAsync) await runLoader(inner, matchPromises, matchId, index, route2);
    else syncMatchContext(inner, matchId, index);
  }
  const { id: matchId, routeId } = inner.matches[index];
  let loaderShouldRunAsync = false;
  let loaderIsRunningAsync = false;
  const route = inner.router.looseRoutesById[routeId];
  const routeLoader = route.options.loader;
  const shouldReloadInBackground = ((typeof routeLoader === "function" ? void 0 : routeLoader?.staleReloadMode) ?? inner.router.options.defaultStaleReloadMode) !== "blocking";
  if (shouldSkipLoader(inner, matchId)) {
    if (!inner.router.getMatch(matchId)) return inner.matches[index];
    syncMatchContext(inner, matchId, index);
    return inner.router.getMatch(matchId);
  } else {
    const prevMatch = inner.router.getMatch(matchId);
    const activeIdAtIndex = inner.router.stores.matchesId.get()[index];
    const previousRouteMatchId = (activeIdAtIndex && inner.router.stores.matchStores.get(activeIdAtIndex) || null)?.routeId === routeId ? activeIdAtIndex : inner.router.stores.matches.get().find((d2) => d2.routeId === routeId)?.id;
    const preload = resolvePreload(inner, matchId);
    if (prevMatch._nonReactive.loaderPromise) {
      if (prevMatch.status === "success" && !inner.sync && !prevMatch.preload && shouldReloadInBackground) return prevMatch;
      await prevMatch._nonReactive.loaderPromise;
      const match2 = inner.router.getMatch(matchId);
      const error = match2._nonReactive.error || match2.error;
      if (error) handleRedirectAndNotFound(inner, match2, error);
      if (match2.status === "pending") await handleLoader(preload, prevMatch, previousRouteMatchId, match2, route);
    } else {
      const nextPreload = preload && !inner.router.stores.matchStores.has(matchId);
      const match2 = inner.router.getMatch(matchId);
      match2._nonReactive.loaderPromise = createControlledPromise();
      if (nextPreload !== match2.preload) inner.updateMatch(matchId, (prev) => ({
        ...prev,
        preload: nextPreload
      }));
      await handleLoader(preload, prevMatch, previousRouteMatchId, match2, route);
    }
  }
  const match = inner.router.getMatch(matchId);
  if (!loaderIsRunningAsync) {
    match._nonReactive.loaderPromise?.resolve();
    match._nonReactive.loadPromise?.resolve();
    match._nonReactive.loadPromise = void 0;
  }
  clearTimeout(match._nonReactive.pendingTimeout);
  match._nonReactive.pendingTimeout = void 0;
  if (!loaderIsRunningAsync) match._nonReactive.loaderPromise = void 0;
  match._nonReactive.dehydrated = void 0;
  const nextIsFetching = loaderIsRunningAsync ? match.isFetching : false;
  if (nextIsFetching !== match.isFetching || match.invalid !== false) {
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: nextIsFetching,
      invalid: false
    }));
    return inner.router.getMatch(matchId);
  } else return match;
};
async function loadMatches(arg) {
  const inner = arg;
  const matchPromises = [];
  let beforeLoadNotFound;
  for (let i = 0; i < inner.matches.length; i++) {
    try {
      const beforeLoad = handleBeforeLoad(inner, i);
      if (isPromise(beforeLoad)) await beforeLoad;
    } catch (err) {
      if (isRedirect(err)) throw err;
      if (isNotFound(err)) beforeLoadNotFound = err;
      else if (!inner.preload) throw err;
      break;
    }
    if (inner.serialError || inner.firstBadMatchIndex != null) break;
  }
  const baseMaxIndexExclusive = inner.firstBadMatchIndex ?? inner.matches.length;
  const boundaryIndex = beforeLoadNotFound && !inner.preload ? getNotFoundBoundaryIndex(inner, beforeLoadNotFound) : void 0;
  const maxIndexExclusive = beforeLoadNotFound && inner.preload ? 0 : boundaryIndex !== void 0 ? Math.min(boundaryIndex + 1, baseMaxIndexExclusive) : baseMaxIndexExclusive;
  let firstNotFound;
  let firstUnhandledRejection;
  for (let i = 0; i < maxIndexExclusive; i++) matchPromises.push(loadRouteMatch(inner, matchPromises, i));
  try {
    await Promise.all(matchPromises);
  } catch {
    const settled = await Promise.allSettled(matchPromises);
    for (const result of settled) {
      if (result.status !== "rejected") continue;
      const reason = result.reason;
      if (isRedirect(reason)) throw reason;
      if (isNotFound(reason)) firstNotFound ??= reason;
      else firstUnhandledRejection ??= reason;
    }
    if (firstUnhandledRejection !== void 0) throw firstUnhandledRejection;
  }
  const notFoundToThrow = firstNotFound ?? (beforeLoadNotFound && !inner.preload ? beforeLoadNotFound : void 0);
  let headMaxIndex = inner.firstBadMatchIndex !== void 0 ? inner.firstBadMatchIndex : inner.matches.length - 1;
  if (!notFoundToThrow && beforeLoadNotFound && inner.preload) return inner.matches;
  if (notFoundToThrow) {
    const renderedBoundaryIndex = getNotFoundBoundaryIndex(inner, notFoundToThrow);
    if (renderedBoundaryIndex === void 0) {
      invariant();
    }
    const boundaryMatch = inner.matches[renderedBoundaryIndex];
    const boundaryRoute = inner.router.looseRoutesById[boundaryMatch.routeId];
    const defaultNotFoundComponent = inner.router.options?.defaultNotFoundComponent;
    if (!boundaryRoute.options.notFoundComponent && defaultNotFoundComponent) boundaryRoute.options.notFoundComponent = defaultNotFoundComponent;
    notFoundToThrow.routeId = boundaryMatch.routeId;
    const boundaryIsRoot = boundaryMatch.routeId === inner.router.routeTree.id;
    inner.updateMatch(boundaryMatch.id, (prev) => ({
      ...prev,
      ...boundaryIsRoot ? {
        status: "success",
        globalNotFound: true,
        error: void 0
      } : {
        status: "notFound",
        error: notFoundToThrow
      },
      isFetching: false
    }));
    headMaxIndex = renderedBoundaryIndex;
    await loadRouteChunk(boundaryRoute, ["notFoundComponent"]);
  } else if (!inner.preload) {
    const rootMatch = inner.matches[0];
    if (!rootMatch.globalNotFound) {
      if (inner.router.getMatch(rootMatch.id)?.globalNotFound) inner.updateMatch(rootMatch.id, (prev) => ({
        ...prev,
        globalNotFound: false,
        error: void 0
      }));
    }
  }
  if (inner.serialError && inner.firstBadMatchIndex !== void 0) {
    const errorRoute = inner.router.looseRoutesById[inner.matches[inner.firstBadMatchIndex].routeId];
    await loadRouteChunk(errorRoute, ["errorComponent"]);
  }
  for (let i = 0; i <= headMaxIndex; i++) {
    const { id: matchId, routeId } = inner.matches[i];
    const route = inner.router.looseRoutesById[routeId];
    try {
      const headResult = executeHead(inner, matchId, route);
      if (headResult) {
        const head = await headResult;
        inner.updateMatch(matchId, (prev) => ({
          ...prev,
          ...head
        }));
      }
    } catch (err) {
      console.error(`Error executing head for route ${routeId}:`, err);
    }
  }
  const readyPromise = triggerOnReady(inner);
  if (isPromise(readyPromise)) await readyPromise;
  if (notFoundToThrow) throw notFoundToThrow;
  if (inner.serialError && !inner.preload && !inner.onReady) throw inner.serialError;
  return inner.matches;
}
function preloadRouteComponents(route, componentTypesToLoad) {
  const preloads = componentTypesToLoad.map((type) => route.options[type]?.preload?.()).filter(Boolean);
  if (preloads.length === 0) return void 0;
  return Promise.all(preloads);
}
function loadRouteChunk(route, componentTypesToLoad = componentTypes) {
  if (!route._lazyLoaded && route._lazyPromise === void 0) if (route.lazyFn) route._lazyPromise = route.lazyFn().then((lazyRoute) => {
    const { id: _id, ...options } = lazyRoute.options;
    Object.assign(route.options, options);
    route._lazyLoaded = true;
    route._lazyPromise = void 0;
  });
  else route._lazyLoaded = true;
  const runAfterLazy = () => route._componentsLoaded ? void 0 : componentTypesToLoad === componentTypes ? (() => {
    if (route._componentsPromise === void 0) {
      const componentsPromise = preloadRouteComponents(route, componentTypes);
      if (componentsPromise) route._componentsPromise = componentsPromise.then(() => {
        route._componentsLoaded = true;
        route._componentsPromise = void 0;
      });
      else route._componentsLoaded = true;
    }
    return route._componentsPromise;
  })() : preloadRouteComponents(route, componentTypesToLoad);
  return route._lazyPromise ? route._lazyPromise.then(runAfterLazy) : runAfterLazy();
}
function makeMaybe(value, error) {
  if (error) return {
    status: "error",
    error
  };
  return {
    status: "success",
    value
  };
}
function routeNeedsPreload(route) {
  for (const componentType of componentTypes) if (route.options[componentType]?.preload) return true;
  return false;
}
var componentTypes = [
  "component",
  "errorComponent",
  "pendingComponent",
  "notFoundComponent"
];
function getLocationChangeInfo(location, resolvedLocation) {
  const fromLocation = resolvedLocation;
  const toLocation = location;
  return {
    fromLocation,
    toLocation,
    pathChanged: fromLocation?.pathname !== toLocation.pathname,
    hrefChanged: fromLocation?.href !== toLocation.href,
    hashChanged: fromLocation?.hash !== toLocation.hash
  };
}
var RouterCore = class {
  /**
  * @deprecated Use the `createRouter` function instead
  */
  constructor(options, getStoreConfig) {
    this.tempLocationKey = `${Math.round(Math.random() * 1e7)}`;
    this.resetNextScroll = true;
    this.shouldViewTransition = void 0;
    this.isViewTransitionTypesSupported = void 0;
    this.subscribers = /* @__PURE__ */ new Set();
    this.isScrollRestoring = false;
    this.isScrollRestorationSetup = false;
    this.startTransition = (fn) => fn();
    this.update = (newOptions) => {
      const prevOptions = this.options;
      const prevBasepath = this.basepath ?? prevOptions?.basepath ?? "/";
      const basepathWasUnset = this.basepath === void 0;
      const prevRewriteOption = prevOptions?.rewrite;
      this.options = {
        ...prevOptions,
        ...newOptions
      };
      this.isServer = this.options.isServer ?? typeof document === "undefined";
      this.protocolAllowlist = new Set(this.options.protocolAllowlist);
      if (this.options.pathParamsAllowedCharacters) this.pathParamsDecoder = compileDecodeCharMap(this.options.pathParamsAllowedCharacters);
      if (!this.history || this.options.history && this.options.history !== this.history) if (!this.options.history) ;
      else this.history = this.options.history;
      this.origin = this.options.origin;
      if (!this.origin) this.origin = "http://localhost";
      if (this.history) this.updateLatestLocation();
      if (this.options.routeTree !== this.routeTree) {
        this.routeTree = this.options.routeTree;
        let processRouteTreeResult;
        if (globalThis.__TSR_CACHE__ && globalThis.__TSR_CACHE__.routeTree === this.routeTree) {
          const cached = globalThis.__TSR_CACHE__;
          this.resolvePathCache = cached.resolvePathCache;
          processRouteTreeResult = cached.processRouteTreeResult;
        } else {
          this.resolvePathCache = createLRUCache(1e3);
          processRouteTreeResult = this.buildRouteTree();
          if (globalThis.__TSR_CACHE__ === void 0) globalThis.__TSR_CACHE__ = {
            routeTree: this.routeTree,
            processRouteTreeResult,
            resolvePathCache: this.resolvePathCache
          };
        }
        this.setRoutes(processRouteTreeResult);
      }
      if (!this.stores && this.latestLocation) {
        const config = this.getStoreConfig(this);
        this.batch = config.batch;
        this.stores = createRouterStores(getInitialRouterState(this.latestLocation), config);
      }
      let needsLocationUpdate = false;
      const nextBasepath = this.options.basepath ?? "/";
      const nextRewriteOption = this.options.rewrite;
      if (basepathWasUnset || prevBasepath !== nextBasepath || prevRewriteOption !== nextRewriteOption) {
        this.basepath = nextBasepath;
        const rewrites = [];
        const trimmed = trimPath(nextBasepath);
        if (trimmed && trimmed !== "/") rewrites.push(rewriteBasepath({ basepath: nextBasepath }));
        if (nextRewriteOption) rewrites.push(nextRewriteOption);
        this.rewrite = rewrites.length === 0 ? void 0 : rewrites.length === 1 ? rewrites[0] : composeRewrites(rewrites);
        if (this.history) this.updateLatestLocation();
        needsLocationUpdate = true;
      }
      if (needsLocationUpdate && this.stores) this.stores.location.set(this.latestLocation);
      if (typeof window !== "undefined" && "CSS" in window && typeof window.CSS?.supports === "function") this.isViewTransitionTypesSupported = window.CSS.supports("selector(:active-view-transition-type(a)");
    };
    this.updateLatestLocation = () => {
      this.latestLocation = this.parseLocation(this.history.location, this.latestLocation);
    };
    this.buildRouteTree = () => {
      const result = processRouteTree(this.routeTree, this.options.caseSensitive, (route, i) => {
        route.init({ originalIndex: i });
      });
      if (this.options.routeMasks) processRouteMasks(this.options.routeMasks, result.processedTree);
      return result;
    };
    this.subscribe = (eventType, fn) => {
      const listener = {
        eventType,
        fn
      };
      this.subscribers.add(listener);
      return () => {
        this.subscribers.delete(listener);
      };
    };
    this.emit = (routerEvent) => {
      this.subscribers.forEach((listener) => {
        if (listener.eventType === routerEvent.type) listener.fn(routerEvent);
      });
    };
    this.parseLocation = (locationToParse, previousLocation) => {
      const parse = ({ pathname, search, hash, href, state }) => {
        if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(pathname)) {
          const parsedSearch2 = this.options.parseSearch(search);
          const searchStr2 = this.options.stringifySearch(parsedSearch2);
          return {
            href: pathname + searchStr2 + hash,
            publicHref: pathname + searchStr2 + hash,
            pathname: decodePath(pathname).path,
            external: false,
            searchStr: searchStr2,
            search: nullReplaceEqualDeep(previousLocation?.search, parsedSearch2),
            hash: decodePath(hash.slice(1)).path,
            state: replaceEqualDeep(previousLocation?.state, state)
          };
        }
        const fullUrl = new URL(href, this.origin);
        const url = executeRewriteInput(this.rewrite, fullUrl);
        const parsedSearch = this.options.parseSearch(url.search);
        const searchStr = this.options.stringifySearch(parsedSearch);
        url.search = searchStr;
        return {
          href: url.href.replace(url.origin, ""),
          publicHref: href,
          pathname: decodePath(url.pathname).path,
          external: !!this.rewrite && url.origin !== this.origin,
          searchStr,
          search: nullReplaceEqualDeep(previousLocation?.search, parsedSearch),
          hash: decodePath(url.hash.slice(1)).path,
          state: replaceEqualDeep(previousLocation?.state, state)
        };
      };
      const location = parse(locationToParse);
      const { __tempLocation, __tempKey } = location.state;
      if (__tempLocation && (!__tempKey || __tempKey === this.tempLocationKey)) {
        const parsedTempLocation = parse(__tempLocation);
        parsedTempLocation.state.key = location.state.key;
        parsedTempLocation.state.__TSR_key = location.state.__TSR_key;
        delete parsedTempLocation.state.__tempLocation;
        return {
          ...parsedTempLocation,
          maskedLocation: location
        };
      }
      return location;
    };
    this.resolvePathWithBase = (from, path) => {
      return resolvePath({
        base: from,
        to: cleanPath(path),
        trailingSlash: this.options.trailingSlash,
        cache: this.resolvePathCache
      });
    };
    this.matchRoutes = (pathnameOrNext, locationSearchOrOpts, opts) => {
      if (typeof pathnameOrNext === "string") return this.matchRoutesInternal({
        pathname: pathnameOrNext,
        search: locationSearchOrOpts
      }, opts);
      return this.matchRoutesInternal(pathnameOrNext, locationSearchOrOpts);
    };
    this.getMatchedRoutes = (pathname) => {
      return getMatchedRoutes({
        pathname,
        routesById: this.routesById,
        processedTree: this.processedTree
      });
    };
    this.cancelMatch = (id) => {
      const match = this.getMatch(id);
      if (!match) return;
      match.abortController.abort();
      clearTimeout(match._nonReactive.pendingTimeout);
      match._nonReactive.pendingTimeout = void 0;
    };
    this.cancelMatches = () => {
      this.stores.pendingIds.get().forEach((matchId) => {
        this.cancelMatch(matchId);
      });
      this.stores.matchesId.get().forEach((matchId) => {
        if (this.stores.pendingMatchStores.has(matchId)) return;
        const match = this.stores.matchStores.get(matchId)?.get();
        if (!match) return;
        if (match.status === "pending" || match.isFetching === "loader") this.cancelMatch(matchId);
      });
    };
    this.buildLocation = (opts) => {
      const build = (dest = {}) => {
        const currentLocation = dest._fromLocation || this.pendingBuiltLocation || this.latestLocation;
        const lightweightResult = this.matchRoutesLightweight(currentLocation);
        if (dest.from && false) ;
        const defaultedFromPath = dest.unsafeRelative === "path" ? currentLocation.pathname : dest.from ?? lightweightResult.fullPath;
        const fromPath = this.resolvePathWithBase(defaultedFromPath, ".");
        const fromSearch = lightweightResult.search;
        const fromParams = Object.assign(/* @__PURE__ */ Object.create(null), lightweightResult.params);
        const nextTo = dest.to ? this.resolvePathWithBase(fromPath, `${dest.to}`) : this.resolvePathWithBase(fromPath, ".");
        const nextParams = dest.params === false || dest.params === null ? /* @__PURE__ */ Object.create(null) : (dest.params ?? true) === true ? fromParams : Object.assign(fromParams, functionalUpdate(dest.params, fromParams));
        const destMatchResult = this.getMatchedRoutes(nextTo);
        let destRoutes = destMatchResult.matchedRoutes;
        if ((!destMatchResult.foundRoute || destMatchResult.foundRoute.path !== "/" && destMatchResult.routeParams["**"]) && this.options.notFoundRoute) destRoutes = [...destRoutes, this.options.notFoundRoute];
        if (Object.keys(nextParams).length > 0) for (const route of destRoutes) {
          const fn = route.options.params?.stringify ?? route.options.stringifyParams;
          if (fn) try {
            Object.assign(nextParams, fn(nextParams));
          } catch {
          }
        }
        const nextPathname = opts.leaveParams ? nextTo : decodePath(interpolatePath({
          path: nextTo,
          params: nextParams,
          decoder: this.pathParamsDecoder,
          server: this.isServer
        }).interpolatedPath).path;
        let nextSearch = fromSearch;
        if (opts._includeValidateSearch && this.options.search?.strict) {
          const validatedSearch = {};
          destRoutes.forEach((route) => {
            if (route.options.validateSearch) try {
              Object.assign(validatedSearch, validateSearch(route.options.validateSearch, {
                ...validatedSearch,
                ...nextSearch
              }));
            } catch {
            }
          });
          nextSearch = validatedSearch;
        }
        nextSearch = applySearchMiddleware({
          search: nextSearch,
          dest,
          destRoutes,
          _includeValidateSearch: opts._includeValidateSearch
        });
        nextSearch = nullReplaceEqualDeep(fromSearch, nextSearch);
        const searchStr = this.options.stringifySearch(nextSearch);
        const hash = dest.hash === true ? currentLocation.hash : dest.hash ? functionalUpdate(dest.hash, currentLocation.hash) : void 0;
        const hashStr = hash ? `#${hash}` : "";
        let nextState = dest.state === true ? currentLocation.state : dest.state ? functionalUpdate(dest.state, currentLocation.state) : {};
        nextState = replaceEqualDeep(currentLocation.state, nextState);
        const fullPath = `${nextPathname}${searchStr}${hashStr}`;
        let href;
        let publicHref;
        let external = false;
        if (this.rewrite) {
          const url = new URL(fullPath, this.origin);
          const rewrittenUrl = executeRewriteOutput(this.rewrite, url);
          href = url.href.replace(url.origin, "");
          if (rewrittenUrl.origin !== this.origin) {
            publicHref = rewrittenUrl.href;
            external = true;
          } else publicHref = rewrittenUrl.pathname + rewrittenUrl.search + rewrittenUrl.hash;
        } else {
          href = encodePathLikeUrl(fullPath);
          publicHref = href;
        }
        return {
          publicHref,
          href,
          pathname: nextPathname,
          search: nextSearch,
          searchStr,
          state: nextState,
          hash: hash ?? "",
          external,
          unmaskOnReload: dest.unmaskOnReload
        };
      };
      const buildWithMatches = (dest = {}, maskedDest) => {
        const next = build(dest);
        let maskedNext = maskedDest ? build(maskedDest) : void 0;
        if (!maskedNext) {
          const params = /* @__PURE__ */ Object.create(null);
          if (this.options.routeMasks) {
            const match = findFlatMatch(next.pathname, this.processedTree);
            if (match) {
              Object.assign(params, match.rawParams);
              const { from: _from, params: maskParams, ...maskProps } = match.route;
              const nextParams = maskParams === false || maskParams === null ? /* @__PURE__ */ Object.create(null) : (maskParams ?? true) === true ? params : Object.assign(params, functionalUpdate(maskParams, params));
              maskedDest = {
                from: opts.from,
                ...maskProps,
                params: nextParams
              };
              maskedNext = build(maskedDest);
            }
          }
        }
        if (maskedNext) next.maskedLocation = maskedNext;
        return next;
      };
      if (opts.mask) return buildWithMatches(opts, {
        from: opts.from,
        ...opts.mask
      });
      return buildWithMatches(opts);
    };
    this.commitLocation = async ({ viewTransition, ignoreBlocker, ...next }) => {
      const isSameState = () => {
        const ignoredProps = [
          "key",
          "__TSR_key",
          "__TSR_index",
          "__hashScrollIntoViewOptions"
        ];
        ignoredProps.forEach((prop) => {
          next.state[prop] = this.latestLocation.state[prop];
        });
        const isEqual = deepEqual(next.state, this.latestLocation.state);
        ignoredProps.forEach((prop) => {
          delete next.state[prop];
        });
        return isEqual;
      };
      const isSameUrl = trimPathRight(this.latestLocation.href) === trimPathRight(next.href);
      let previousCommitPromise = this.commitLocationPromise;
      this.commitLocationPromise = createControlledPromise(() => {
        previousCommitPromise?.resolve();
        previousCommitPromise = void 0;
      });
      if (isSameUrl && isSameState()) this.load();
      else {
        let { maskedLocation, hashScrollIntoView, ...nextHistory } = next;
        if (maskedLocation) {
          nextHistory = {
            ...maskedLocation,
            state: {
              ...maskedLocation.state,
              __tempKey: void 0,
              __tempLocation: {
                ...nextHistory,
                search: nextHistory.searchStr,
                state: {
                  ...nextHistory.state,
                  __tempKey: void 0,
                  __tempLocation: void 0,
                  __TSR_key: void 0,
                  key: void 0
                }
              }
            }
          };
          if (nextHistory.unmaskOnReload ?? this.options.unmaskOnReload ?? false) nextHistory.state.__tempKey = this.tempLocationKey;
        }
        nextHistory.state.__hashScrollIntoViewOptions = hashScrollIntoView ?? this.options.defaultHashScrollIntoView ?? true;
        this.shouldViewTransition = viewTransition;
        this.history[next.replace ? "replace" : "push"](nextHistory.publicHref, nextHistory.state, { ignoreBlocker });
      }
      this.resetNextScroll = next.resetScroll ?? true;
      if (!this.history.subscribers.size) this.load();
      return this.commitLocationPromise;
    };
    this.buildAndCommitLocation = ({ replace, resetScroll, hashScrollIntoView, viewTransition, ignoreBlocker, href, ...rest } = {}) => {
      if (href) {
        const currentIndex = this.history.location.state.__TSR_index;
        const parsed = parseHref(href, { __TSR_index: replace ? currentIndex : currentIndex + 1 });
        const hrefUrl = new URL(parsed.pathname, this.origin);
        rest.to = executeRewriteInput(this.rewrite, hrefUrl).pathname;
        rest.search = this.options.parseSearch(parsed.search);
        rest.hash = parsed.hash.slice(1);
      }
      const location = this.buildLocation({
        ...rest,
        _includeValidateSearch: true
      });
      this.pendingBuiltLocation = location;
      const commitPromise = this.commitLocation({
        ...location,
        viewTransition,
        replace,
        resetScroll,
        hashScrollIntoView,
        ignoreBlocker
      });
      Promise.resolve().then(() => {
        if (this.pendingBuiltLocation === location) this.pendingBuiltLocation = void 0;
      });
      return commitPromise;
    };
    this.navigate = async ({ to, reloadDocument, href, publicHref, ...rest }) => {
      let hrefIsUrl = false;
      if (href) try {
        new URL(`${href}`);
        hrefIsUrl = true;
      } catch {
      }
      if (hrefIsUrl && !reloadDocument) reloadDocument = true;
      if (reloadDocument) {
        if (to !== void 0 || !href) {
          const location = this.buildLocation({
            to,
            ...rest
          });
          href = href ?? location.publicHref;
          publicHref = publicHref ?? location.publicHref;
        }
        const reloadHref = !hrefIsUrl && publicHref ? publicHref : href;
        if (isDangerousProtocol(reloadHref, this.protocolAllowlist)) {
          return Promise.resolve();
        }
        if (!rest.ignoreBlocker) {
          const blockers = this.history.getBlockers?.() ?? [];
          for (const blocker of blockers) if (blocker?.blockerFn) {
            if (await blocker.blockerFn({
              currentLocation: this.latestLocation,
              nextLocation: this.latestLocation,
              action: "PUSH"
            })) return Promise.resolve();
          }
        }
        if (rest.replace) window.location.replace(reloadHref);
        else window.location.href = reloadHref;
        return Promise.resolve();
      }
      return this.buildAndCommitLocation({
        ...rest,
        href,
        to,
        _isNavigate: true
      });
    };
    this.beforeLoad = () => {
      this.cancelMatches();
      this.updateLatestLocation();
      {
        const nextLocation = this.buildLocation({
          to: this.latestLocation.pathname,
          search: true,
          params: true,
          hash: true,
          state: true,
          _includeValidateSearch: true
        });
        if (this.latestLocation.publicHref !== nextLocation.publicHref) {
          const href = this.getParsedLocationHref(nextLocation);
          if (nextLocation.external) throw redirect({ href });
          else throw redirect({
            href,
            _builtLocation: nextLocation
          });
        }
      }
      const pendingMatches = this.matchRoutes(this.latestLocation);
      const nextCachedMatches = this.stores.cachedMatches.get().filter((d2) => !pendingMatches.some((e) => e.id === d2.id));
      this.batch(() => {
        this.stores.status.set("pending");
        this.stores.statusCode.set(200);
        this.stores.isLoading.set(true);
        this.stores.location.set(this.latestLocation);
        this.stores.setPending(pendingMatches);
        this.stores.setCached(nextCachedMatches);
      });
    };
    this.load = async (opts) => {
      let redirect2;
      let notFound;
      let loadPromise;
      const previousLocation = this.stores.resolvedLocation.get() ?? this.stores.location.get();
      loadPromise = new Promise((resolve) => {
        this.startTransition(async () => {
          try {
            this.beforeLoad();
            const next = this.latestLocation;
            const locationChangeInfo = getLocationChangeInfo(next, this.stores.resolvedLocation.get());
            if (!this.stores.redirect.get()) this.emit({
              type: "onBeforeNavigate",
              ...locationChangeInfo
            });
            this.emit({
              type: "onBeforeLoad",
              ...locationChangeInfo
            });
            await loadMatches({
              router: this,
              sync: opts?.sync,
              forceStaleReload: previousLocation.href === next.href,
              matches: this.stores.pendingMatches.get(),
              location: next,
              updateMatch: this.updateMatch,
              onReady: async () => {
                this.startTransition(() => {
                  this.startViewTransition(async () => {
                    let exitingMatches = null;
                    let hookExitingMatches = null;
                    let hookEnteringMatches = null;
                    let hookStayingMatches = null;
                    this.batch(() => {
                      const pendingMatches = this.stores.pendingMatches.get();
                      const mountPending = pendingMatches.length;
                      const currentMatches = this.stores.matches.get();
                      exitingMatches = mountPending ? currentMatches.filter((match) => !this.stores.pendingMatchStores.has(match.id)) : null;
                      const pendingRouteIds = /* @__PURE__ */ new Set();
                      for (const s2 of this.stores.pendingMatchStores.values()) if (s2.routeId) pendingRouteIds.add(s2.routeId);
                      const activeRouteIds = /* @__PURE__ */ new Set();
                      for (const s2 of this.stores.matchStores.values()) if (s2.routeId) activeRouteIds.add(s2.routeId);
                      hookExitingMatches = mountPending ? currentMatches.filter((match) => !pendingRouteIds.has(match.routeId)) : null;
                      hookEnteringMatches = mountPending ? pendingMatches.filter((match) => !activeRouteIds.has(match.routeId)) : null;
                      hookStayingMatches = mountPending ? pendingMatches.filter((match) => activeRouteIds.has(match.routeId)) : currentMatches;
                      this.stores.isLoading.set(false);
                      this.stores.loadedAt.set(Date.now());
                      if (mountPending) {
                        this.stores.setMatches(pendingMatches);
                        this.stores.setPending([]);
                        this.stores.setCached([...this.stores.cachedMatches.get(), ...exitingMatches.filter((d2) => d2.status !== "error" && d2.status !== "notFound" && d2.status !== "redirected")]);
                        this.clearExpiredCache();
                      }
                    });
                    for (const [matches, hook] of [
                      [hookExitingMatches, "onLeave"],
                      [hookEnteringMatches, "onEnter"],
                      [hookStayingMatches, "onStay"]
                    ]) {
                      if (!matches) continue;
                      for (const match of matches) this.looseRoutesById[match.routeId].options[hook]?.(match);
                    }
                  });
                });
              }
            });
          } catch (err) {
            if (isRedirect(err)) {
              redirect2 = err;
            } else if (isNotFound(err)) notFound = err;
            const nextStatusCode = redirect2 ? redirect2.status : notFound ? 404 : this.stores.matches.get().some((d2) => d2.status === "error") ? 500 : 200;
            this.batch(() => {
              this.stores.statusCode.set(nextStatusCode);
              this.stores.redirect.set(redirect2);
            });
          }
          if (this.latestLoadPromise === loadPromise) {
            this.commitLocationPromise?.resolve();
            this.latestLoadPromise = void 0;
            this.commitLocationPromise = void 0;
          }
          resolve();
        });
      });
      this.latestLoadPromise = loadPromise;
      await loadPromise;
      while (this.latestLoadPromise && loadPromise !== this.latestLoadPromise) await this.latestLoadPromise;
      let newStatusCode = void 0;
      if (this.hasNotFoundMatch()) newStatusCode = 404;
      else if (this.stores.matches.get().some((d2) => d2.status === "error")) newStatusCode = 500;
      if (newStatusCode !== void 0) this.stores.statusCode.set(newStatusCode);
    };
    this.startViewTransition = (fn) => {
      const shouldViewTransition = this.shouldViewTransition ?? this.options.defaultViewTransition;
      this.shouldViewTransition = void 0;
      if (shouldViewTransition && typeof document !== "undefined" && "startViewTransition" in document && typeof document.startViewTransition === "function") {
        let startViewTransitionParams;
        if (typeof shouldViewTransition === "object" && this.isViewTransitionTypesSupported) {
          const next = this.latestLocation;
          const prevLocation = this.stores.resolvedLocation.get();
          const resolvedViewTransitionTypes = typeof shouldViewTransition.types === "function" ? shouldViewTransition.types(getLocationChangeInfo(next, prevLocation)) : shouldViewTransition.types;
          if (resolvedViewTransitionTypes === false) {
            fn();
            return;
          }
          startViewTransitionParams = {
            update: fn,
            types: resolvedViewTransitionTypes
          };
        } else startViewTransitionParams = fn;
        document.startViewTransition(startViewTransitionParams);
      } else fn();
    };
    this.updateMatch = (id, updater) => {
      this.startTransition(() => {
        const pendingMatch = this.stores.pendingMatchStores.get(id);
        if (pendingMatch) {
          pendingMatch.set(updater);
          return;
        }
        const activeMatch = this.stores.matchStores.get(id);
        if (activeMatch) {
          activeMatch.set(updater);
          return;
        }
        const cachedMatch = this.stores.cachedMatchStores.get(id);
        if (cachedMatch) {
          const next = updater(cachedMatch.get());
          if (next.status === "redirected") {
            if (this.stores.cachedMatchStores.delete(id)) this.stores.cachedIds.set((prev) => prev.filter((matchId) => matchId !== id));
          } else cachedMatch.set(next);
        }
      });
    };
    this.getMatch = (matchId) => {
      return this.stores.cachedMatchStores.get(matchId)?.get() ?? this.stores.pendingMatchStores.get(matchId)?.get() ?? this.stores.matchStores.get(matchId)?.get();
    };
    this.invalidate = (opts) => {
      const invalidate = (d2) => {
        if (opts?.filter?.(d2) ?? true) return {
          ...d2,
          invalid: true,
          ...opts?.forcePending || d2.status === "error" || d2.status === "notFound" ? {
            status: "pending",
            error: void 0
          } : void 0
        };
        return d2;
      };
      this.batch(() => {
        this.stores.setMatches(this.stores.matches.get().map(invalidate));
        this.stores.setCached(this.stores.cachedMatches.get().map(invalidate));
        this.stores.setPending(this.stores.pendingMatches.get().map(invalidate));
      });
      this.shouldViewTransition = false;
      return this.load({ sync: opts?.sync });
    };
    this.getParsedLocationHref = (location) => {
      return location.publicHref || "/";
    };
    this.resolveRedirect = (redirect2) => {
      const locationHeader = redirect2.headers.get("Location");
      if (!redirect2.options.href || redirect2.options._builtLocation) {
        const location = redirect2.options._builtLocation ?? this.buildLocation(redirect2.options);
        const href = this.getParsedLocationHref(location);
        redirect2.options.href = href;
        redirect2.headers.set("Location", href);
      } else if (locationHeader) try {
        const url = new URL(locationHeader);
        if (this.origin && url.origin === this.origin) {
          const href = url.pathname + url.search + url.hash;
          redirect2.options.href = href;
          redirect2.headers.set("Location", href);
        }
      } catch {
      }
      if (redirect2.options.href && !redirect2.options._builtLocation && isDangerousProtocol(redirect2.options.href, this.protocolAllowlist)) throw new Error("Redirect blocked: unsafe protocol");
      if (!redirect2.headers.get("Location")) redirect2.headers.set("Location", redirect2.options.href);
      return redirect2;
    };
    this.clearCache = (opts) => {
      const filter = opts?.filter;
      if (filter !== void 0) this.stores.setCached(this.stores.cachedMatches.get().filter((m2) => !filter(m2)));
      else this.stores.setCached([]);
    };
    this.clearExpiredCache = () => {
      const now = Date.now();
      const filter = (d2) => {
        const route = this.looseRoutesById[d2.routeId];
        if (!route.options.loader) return true;
        const gcTime = (d2.preload ? route.options.preloadGcTime ?? this.options.defaultPreloadGcTime : route.options.gcTime ?? this.options.defaultGcTime) ?? 300 * 1e3;
        if (d2.status === "error") return true;
        return now - d2.updatedAt >= gcTime;
      };
      this.clearCache({ filter });
    };
    this.loadRouteChunk = loadRouteChunk;
    this.preloadRoute = async (opts) => {
      const next = opts._builtLocation ?? this.buildLocation(opts);
      let matches = this.matchRoutes(next, {
        throwOnError: true,
        preload: true,
        dest: opts
      });
      const activeMatchIds = /* @__PURE__ */ new Set([...this.stores.matchesId.get(), ...this.stores.pendingIds.get()]);
      const loadedMatchIds = /* @__PURE__ */ new Set([...activeMatchIds, ...this.stores.cachedIds.get()]);
      const matchesToCache = matches.filter((match) => !loadedMatchIds.has(match.id));
      if (matchesToCache.length) {
        const cachedMatches = this.stores.cachedMatches.get();
        this.stores.setCached([...cachedMatches, ...matchesToCache]);
      }
      try {
        matches = await loadMatches({
          router: this,
          matches,
          location: next,
          preload: true,
          updateMatch: (id, updater) => {
            if (activeMatchIds.has(id)) matches = matches.map((d2) => d2.id === id ? updater(d2) : d2);
            else this.updateMatch(id, updater);
          }
        });
        return matches;
      } catch (err) {
        if (isRedirect(err)) {
          if (err.options.reloadDocument) return;
          return await this.preloadRoute({
            ...err.options,
            _fromLocation: next
          });
        }
        if (!isNotFound(err)) console.error(err);
        return;
      }
    };
    this.matchRoute = (location, opts) => {
      const matchLocation = {
        ...location,
        to: location.to ? this.resolvePathWithBase(location.from || "", location.to) : void 0,
        params: location.params || {},
        leaveParams: true
      };
      const next = this.buildLocation(matchLocation);
      if (opts?.pending && this.stores.status.get() !== "pending") return false;
      const baseLocation = (opts?.pending === void 0 ? !this.stores.isLoading.get() : opts.pending) ? this.latestLocation : this.stores.resolvedLocation.get() || this.stores.location.get();
      const match = findSingleMatch(next.pathname, opts?.caseSensitive ?? false, opts?.fuzzy ?? false, baseLocation.pathname, this.processedTree);
      if (!match) return false;
      if (location.params) {
        if (!deepEqual(match.rawParams, location.params, { partial: true })) return false;
      }
      if (opts?.includeSearch ?? true) return deepEqual(baseLocation.search, next.search, { partial: true }) ? match.rawParams : false;
      return match.rawParams;
    };
    this.hasNotFoundMatch = () => {
      return this.stores.matches.get().some((d2) => d2.status === "notFound" || d2.globalNotFound);
    };
    this.getStoreConfig = getStoreConfig;
    this.update({
      defaultPreloadDelay: 50,
      defaultPendingMs: 1e3,
      defaultPendingMinMs: 500,
      context: void 0,
      ...options,
      caseSensitive: options.caseSensitive ?? false,
      notFoundMode: options.notFoundMode ?? "fuzzy",
      stringifySearch: options.stringifySearch ?? defaultStringifySearch,
      parseSearch: options.parseSearch ?? defaultParseSearch,
      protocolAllowlist: options.protocolAllowlist ?? DEFAULT_PROTOCOL_ALLOWLIST
    });
    if (typeof document !== "undefined") self.__TSR_ROUTER__ = this;
  }
  isShell() {
    return !!this.options.isShell;
  }
  isPrerendering() {
    return !!this.options.isPrerendering;
  }
  get state() {
    return this.stores.__store.get();
  }
  setRoutes({ routesById, routesByPath, processedTree }) {
    this.routesById = routesById;
    this.routesByPath = routesByPath;
    this.processedTree = processedTree;
    const notFoundRoute = this.options.notFoundRoute;
    if (notFoundRoute) {
      notFoundRoute.init({ originalIndex: 99999999999 });
      this.routesById[notFoundRoute.id] = notFoundRoute;
    }
  }
  get looseRoutesById() {
    return this.routesById;
  }
  getParentContext(parentMatch) {
    return !parentMatch?.id ? this.options.context ?? void 0 : parentMatch.context ?? this.options.context ?? void 0;
  }
  matchRoutesInternal(next, opts) {
    const matchedRoutesResult = this.getMatchedRoutes(next.pathname);
    const { foundRoute, routeParams, parsedParams } = matchedRoutesResult;
    let { matchedRoutes } = matchedRoutesResult;
    let isGlobalNotFound = false;
    if (foundRoute ? foundRoute.path !== "/" && routeParams["**"] : trimPathRight(next.pathname)) if (this.options.notFoundRoute) matchedRoutes = [...matchedRoutes, this.options.notFoundRoute];
    else isGlobalNotFound = true;
    const globalNotFoundRouteId = isGlobalNotFound ? findGlobalNotFoundRouteId(this.options.notFoundMode, matchedRoutes) : void 0;
    const matches = new Array(matchedRoutes.length);
    const previousActiveMatchesByRouteId = /* @__PURE__ */ new Map();
    for (const store of this.stores.matchStores.values()) if (store.routeId) previousActiveMatchesByRouteId.set(store.routeId, store.get());
    for (let index = 0; index < matchedRoutes.length; index++) {
      const route = matchedRoutes[index];
      const parentMatch = matches[index - 1];
      let preMatchSearch;
      let strictMatchSearch;
      let searchError;
      {
        const parentSearch = parentMatch?.search ?? next.search;
        const parentStrictSearch = parentMatch?._strictSearch ?? void 0;
        try {
          const strictSearch = validateSearch(route.options.validateSearch, { ...parentSearch }) ?? void 0;
          preMatchSearch = {
            ...parentSearch,
            ...strictSearch
          };
          strictMatchSearch = {
            ...parentStrictSearch,
            ...strictSearch
          };
          searchError = void 0;
        } catch (err) {
          let searchParamError = err;
          if (!(err instanceof SearchParamError)) searchParamError = new SearchParamError(err.message, { cause: err });
          if (opts?.throwOnError) throw searchParamError;
          preMatchSearch = parentSearch;
          strictMatchSearch = {};
          searchError = searchParamError;
        }
      }
      const loaderDeps = route.options.loaderDeps?.({ search: preMatchSearch }) ?? "";
      const loaderDepsHash = loaderDeps ? JSON.stringify(loaderDeps) : "";
      const { interpolatedPath, usedParams } = interpolatePath({
        path: route.fullPath,
        params: routeParams,
        decoder: this.pathParamsDecoder,
        server: this.isServer
      });
      const matchId = route.id + interpolatedPath + loaderDepsHash;
      const existingMatch = this.getMatch(matchId);
      const previousMatch = previousActiveMatchesByRouteId.get(route.id);
      const strictParams = existingMatch?._strictParams ?? usedParams;
      let paramsError = void 0;
      if (!existingMatch) try {
        extractStrictParams(route, usedParams, parsedParams, strictParams);
      } catch (err) {
        if (isNotFound(err) || isRedirect(err)) paramsError = err;
        else paramsError = new PathParamError(err.message, { cause: err });
        if (opts?.throwOnError) throw paramsError;
      }
      Object.assign(routeParams, strictParams);
      const cause = previousMatch ? "stay" : "enter";
      let match;
      if (existingMatch) match = {
        ...existingMatch,
        cause,
        params: previousMatch?.params ?? routeParams,
        _strictParams: strictParams,
        search: previousMatch ? nullReplaceEqualDeep(previousMatch.search, preMatchSearch) : nullReplaceEqualDeep(existingMatch.search, preMatchSearch),
        _strictSearch: strictMatchSearch
      };
      else {
        const status = route.options.loader || route.options.beforeLoad || route.lazyFn || routeNeedsPreload(route) ? "pending" : "success";
        match = {
          id: matchId,
          ssr: void 0,
          index,
          routeId: route.id,
          params: previousMatch?.params ?? routeParams,
          _strictParams: strictParams,
          pathname: interpolatedPath,
          updatedAt: Date.now(),
          search: previousMatch ? nullReplaceEqualDeep(previousMatch.search, preMatchSearch) : preMatchSearch,
          _strictSearch: strictMatchSearch,
          searchError: void 0,
          status,
          isFetching: false,
          error: void 0,
          paramsError,
          __routeContext: void 0,
          _nonReactive: { loadPromise: createControlledPromise() },
          __beforeLoadContext: void 0,
          context: {},
          abortController: new AbortController(),
          fetchCount: 0,
          cause,
          loaderDeps: previousMatch ? replaceEqualDeep(previousMatch.loaderDeps, loaderDeps) : loaderDeps,
          invalid: false,
          preload: false,
          links: void 0,
          scripts: void 0,
          headScripts: void 0,
          meta: void 0,
          staticData: route.options.staticData || {},
          fullPath: route.fullPath
        };
      }
      if (!opts?.preload) match.globalNotFound = globalNotFoundRouteId === route.id;
      match.searchError = searchError;
      const parentContext = this.getParentContext(parentMatch);
      match.context = {
        ...parentContext,
        ...match.__routeContext,
        ...match.__beforeLoadContext
      };
      matches[index] = match;
    }
    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];
      const route = this.looseRoutesById[match.routeId];
      const existingMatch = this.getMatch(match.id);
      const previousMatch = previousActiveMatchesByRouteId.get(match.routeId);
      match.params = previousMatch ? nullReplaceEqualDeep(previousMatch.params, routeParams) : routeParams;
      if (!existingMatch) {
        const parentMatch = matches[index - 1];
        const parentContext = this.getParentContext(parentMatch);
        if (route.options.context) {
          const contextFnContext = {
            deps: match.loaderDeps,
            params: match.params,
            context: parentContext ?? {},
            location: next,
            navigate: (opts2) => this.navigate({
              ...opts2,
              _fromLocation: next
            }),
            buildLocation: this.buildLocation,
            cause: match.cause,
            abortController: match.abortController,
            preload: !!match.preload,
            matches,
            routeId: route.id
          };
          match.__routeContext = route.options.context(contextFnContext) ?? void 0;
        }
        match.context = {
          ...parentContext,
          ...match.__routeContext,
          ...match.__beforeLoadContext
        };
      }
    }
    return matches;
  }
  /**
  * Lightweight route matching for buildLocation.
  * Only computes fullPath, accumulated search, and params - skipping expensive
  * operations like AbortController, ControlledPromise, loaderDeps, and full match objects.
  */
  matchRoutesLightweight(location) {
    const { matchedRoutes, routeParams, parsedParams } = this.getMatchedRoutes(location.pathname);
    const lastRoute = last(matchedRoutes);
    const accumulatedSearch = { ...location.search };
    for (const route of matchedRoutes) try {
      Object.assign(accumulatedSearch, validateSearch(route.options.validateSearch, accumulatedSearch));
    } catch {
    }
    const lastStateMatchId = last(this.stores.matchesId.get());
    const lastStateMatch = lastStateMatchId && this.stores.matchStores.get(lastStateMatchId)?.get();
    const canReuseParams = lastStateMatch && lastStateMatch.routeId === lastRoute.id && lastStateMatch.pathname === location.pathname;
    let params;
    if (canReuseParams) params = lastStateMatch.params;
    else {
      const strictParams = Object.assign(/* @__PURE__ */ Object.create(null), routeParams);
      for (const route of matchedRoutes) try {
        extractStrictParams(route, routeParams, parsedParams ?? {}, strictParams);
      } catch {
      }
      params = strictParams;
    }
    return {
      matchedRoutes,
      fullPath: lastRoute.fullPath,
      search: accumulatedSearch,
      params
    };
  }
};
var SearchParamError = class extends Error {
};
var PathParamError = class extends Error {
};
function getInitialRouterState(location) {
  return {
    loadedAt: 0,
    isLoading: false,
    isTransitioning: false,
    status: "idle",
    resolvedLocation: void 0,
    location,
    matches: [],
    statusCode: 200
  };
}
function validateSearch(validateSearch2, input) {
  if (validateSearch2 == null) return {};
  if ("~standard" in validateSearch2) {
    const result = validateSearch2["~standard"].validate(input);
    if (result instanceof Promise) throw new SearchParamError("Async validation not supported");
    if (result.issues) throw new SearchParamError(JSON.stringify(result.issues, void 0, 2), { cause: result });
    return result.value;
  }
  if ("parse" in validateSearch2) return validateSearch2.parse(input);
  if (typeof validateSearch2 === "function") return validateSearch2(input);
  return {};
}
function getMatchedRoutes({ pathname, routesById, processedTree }) {
  const routeParams = /* @__PURE__ */ Object.create(null);
  const trimmedPath = trimPathRight(pathname);
  let foundRoute = void 0;
  let parsedParams = void 0;
  const match = findRouteMatch(trimmedPath, processedTree, true);
  if (match) {
    foundRoute = match.route;
    Object.assign(routeParams, match.rawParams);
    parsedParams = Object.assign(/* @__PURE__ */ Object.create(null), match.parsedParams);
  }
  return {
    matchedRoutes: match?.branch || [routesById["__root__"]],
    routeParams,
    foundRoute,
    parsedParams
  };
}
function applySearchMiddleware({ search, dest, destRoutes, _includeValidateSearch }) {
  return buildMiddlewareChain(destRoutes)(search, dest, _includeValidateSearch ?? false);
}
function buildMiddlewareChain(destRoutes) {
  const context = {
    dest: null,
    _includeValidateSearch: false,
    middlewares: []
  };
  for (const route of destRoutes) {
    if ("search" in route.options) {
      if (route.options.search?.middlewares) context.middlewares.push(...route.options.search.middlewares);
    } else if (route.options.preSearchFilters || route.options.postSearchFilters) {
      const legacyMiddleware = ({ search, next }) => {
        let nextSearch = search;
        if ("preSearchFilters" in route.options && route.options.preSearchFilters) nextSearch = route.options.preSearchFilters.reduce((prev, next2) => next2(prev), search);
        const result = next(nextSearch);
        if ("postSearchFilters" in route.options && route.options.postSearchFilters) return route.options.postSearchFilters.reduce((prev, next2) => next2(prev), result);
        return result;
      };
      context.middlewares.push(legacyMiddleware);
    }
    if (route.options.validateSearch) {
      const validate = ({ search, next }) => {
        const result = next(search);
        if (!context._includeValidateSearch) return result;
        try {
          return {
            ...result,
            ...validateSearch(route.options.validateSearch, result) ?? void 0
          };
        } catch {
          return result;
        }
      };
      context.middlewares.push(validate);
    }
  }
  const final = ({ search }) => {
    const dest = context.dest;
    if (!dest.search) return {};
    if (dest.search === true) return search;
    return functionalUpdate(dest.search, search);
  };
  context.middlewares.push(final);
  const applyNext = (index, currentSearch, middlewares) => {
    if (index >= middlewares.length) return currentSearch;
    const middleware = middlewares[index];
    const next = (newSearch) => {
      return applyNext(index + 1, newSearch, middlewares);
    };
    return middleware({
      search: currentSearch,
      next
    });
  };
  return function middleware(search, dest, _includeValidateSearch) {
    context.dest = dest;
    context._includeValidateSearch = _includeValidateSearch;
    return applyNext(0, search, context.middlewares);
  };
}
function findGlobalNotFoundRouteId(notFoundMode, routes) {
  if (notFoundMode !== "root") for (let i = routes.length - 1; i >= 0; i--) {
    const route = routes[i];
    if (route.children) return route.id;
  }
  return rootRouteId;
}
function extractStrictParams(route, referenceParams, parsedParams, accumulatedParams) {
  const parseParams = route.options.params?.parse ?? route.options.parseParams;
  if (parseParams) if (route.options.skipRouteOnParseError) {
    for (const key in referenceParams) if (key in parsedParams) accumulatedParams[key] = parsedParams[key];
  } else {
    const result = parseParams(accumulatedParams);
    Object.assign(accumulatedParams, result);
  }
}
var BaseRoute = class {
  get to() {
    return this._to;
  }
  get id() {
    return this._id;
  }
  get path() {
    return this._path;
  }
  get fullPath() {
    return this._fullPath;
  }
  constructor(options) {
    this.init = (opts) => {
      this.originalIndex = opts.originalIndex;
      const options2 = this.options;
      const isRoot = !options2?.path && !options2?.id;
      this.parentRoute = this.options.getParentRoute?.();
      if (isRoot) this._path = rootRouteId;
      else if (!this.parentRoute) {
        invariant();
      }
      let path = isRoot ? rootRouteId : options2?.path;
      if (path && path !== "/") path = trimPathLeft(path);
      const customId = options2?.id || path;
      let id = isRoot ? rootRouteId : joinPaths([this.parentRoute.id === "__root__" ? "" : this.parentRoute.id, customId]);
      if (path === "__root__") path = "/";
      if (id !== "__root__") id = joinPaths(["/", id]);
      const fullPath = id === "__root__" ? "/" : joinPaths([this.parentRoute.fullPath, path]);
      this._path = path;
      this._id = id;
      this._fullPath = fullPath;
      this._to = trimPathRight(fullPath);
    };
    this.addChildren = (children) => {
      return this._addFileChildren(children);
    };
    this._addFileChildren = (children) => {
      if (Array.isArray(children)) this.children = children;
      if (typeof children === "object" && children !== null) this.children = Object.values(children);
      return this;
    };
    this._addFileTypes = () => {
      return this;
    };
    this.updateLoader = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.update = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.lazy = (lazyFn) => {
      this.lazyFn = lazyFn;
      return this;
    };
    this.redirect = (opts) => redirect({
      from: this.fullPath,
      ...opts
    });
    this.options = options || {};
    this.isRoot = !options?.getParentRoute;
    if (options?.id && options?.path) throw new Error(`Route cannot have both an 'id' and a 'path' option.`);
  }
};
var BaseRootRoute = class extends BaseRoute {
  constructor(options) {
    super(options);
  }
};
function useMatch(opts) {
  const router2 = useRouter();
  const nearestMatchId = reactExports.useContext(opts.from ? dummyMatchContext : matchContext);
  const key = opts.from ?? nearestMatchId;
  const matchStore = key ? opts.from ? router2.stores.getRouteMatchStore(key) : router2.stores.matchStores.get(key) : void 0;
  {
    const match = matchStore?.get();
    if ((opts.shouldThrow ?? true) && !match) {
      invariant();
    }
    if (match === void 0) return;
    return opts.select ? opts.select(match) : match;
  }
}
function useLoaderData(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    structuralSharing: opts.structuralSharing,
    select: (s2) => {
      return opts.select ? opts.select(s2.loaderData) : s2.loaderData;
    }
  });
}
function useLoaderDeps(opts) {
  const { select, ...rest } = opts;
  return useMatch({
    ...rest,
    select: (s2) => {
      return select ? select(s2.loaderDeps) : s2.loaderDeps;
    }
  });
}
function useParams(opts) {
  return useMatch({
    from: opts.from,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    strict: opts.strict,
    select: (match) => {
      const params = opts.strict === false ? match.params : match._strictParams;
      return opts.select ? opts.select(params) : params;
    }
  });
}
function useSearch(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    select: (match) => {
      return opts.select ? opts.select(match.search) : match.search;
    }
  });
}
function useNavigate(_defaultOpts) {
  const router2 = useRouter();
  return reactExports.useCallback((options) => {
    return router2.navigate({
      ...options,
      from: options.from ?? _defaultOpts?.from
    });
  }, [_defaultOpts?.from, router2]);
}
function useRouteContext(opts) {
  return useMatch({
    ...opts,
    select: (match) => opts.select ? opts.select(match.context) : match.context
  });
}
var reactDomExports = requireReactDom();
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(reactDomExports);
function useLinkProps(options, forwardedRef) {
  const router2 = useRouter();
  const innerRef = useForwardedRef(forwardedRef);
  const { activeProps, inactiveProps, activeOptions, to, preload: userPreload, preloadDelay: userPreloadDelay, preloadIntentProximity: _preloadIntentProximity, hashScrollIntoView, replace, startTransition, resetScroll, viewTransition, children, target, disabled, style, className, onClick, onBlur, onFocus, onMouseEnter, onMouseLeave, onTouchStart, ignoreBlocker, params: _params, search: _search, hash: _hash, state: _state, mask: _mask, reloadDocument: _reloadDocument, unsafeRelative: _unsafeRelative, from: _from, _fromLocation, ...propsSafeToSpread } = options;
  {
    const safeInternal = isSafeInternal(to);
    if (typeof to === "string" && !safeInternal && to.indexOf(":") > -1) try {
      new URL(to);
      if (isDangerousProtocol(to, router2.protocolAllowlist)) {
        if (false) ;
        return {
          ...propsSafeToSpread,
          ref: innerRef,
          href: void 0,
          ...children && { children },
          ...target && { target },
          ...disabled && { disabled },
          ...style && { style },
          ...className && { className }
        };
      }
      return {
        ...propsSafeToSpread,
        ref: innerRef,
        href: to,
        ...children && { children },
        ...target && { target },
        ...disabled && { disabled },
        ...style && { style },
        ...className && { className }
      };
    } catch {
    }
    const next2 = router2.buildLocation({
      ...options,
      from: options.from
    });
    const hrefOption2 = getHrefOption(next2.maskedLocation ? next2.maskedLocation.publicHref : next2.publicHref, next2.maskedLocation ? next2.maskedLocation.external : next2.external, router2.history, disabled);
    const externalLink2 = (() => {
      if (hrefOption2?.external) {
        if (isDangerousProtocol(hrefOption2.href, router2.protocolAllowlist)) {
          return;
        }
        return hrefOption2.href;
      }
      if (safeInternal) return void 0;
      if (typeof to === "string" && to.indexOf(":") > -1) try {
        new URL(to);
        if (isDangerousProtocol(to, router2.protocolAllowlist)) {
          if (false) ;
          return;
        }
        return to;
      } catch {
      }
    })();
    const isActive2 = (() => {
      if (externalLink2) return false;
      const currentLocation2 = router2.stores.location.get();
      const exact = activeOptions?.exact ?? false;
      if (exact) {
        if (!exactPathTest(currentLocation2.pathname, next2.pathname, router2.basepath)) return false;
      } else {
        const currentPathSplit = removeTrailingSlash(currentLocation2.pathname, router2.basepath);
        const nextPathSplit = removeTrailingSlash(next2.pathname, router2.basepath);
        if (!(currentPathSplit.startsWith(nextPathSplit) && (currentPathSplit.length === nextPathSplit.length || currentPathSplit[nextPathSplit.length] === "/"))) return false;
      }
      if (activeOptions?.includeSearch ?? true) {
        if (currentLocation2.search !== next2.search) {
          const currentSearchEmpty = !currentLocation2.search || typeof currentLocation2.search === "object" && Object.keys(currentLocation2.search).length === 0;
          const nextSearchEmpty = !next2.search || typeof next2.search === "object" && Object.keys(next2.search).length === 0;
          if (!(currentSearchEmpty && nextSearchEmpty)) {
            if (!deepEqual(currentLocation2.search, next2.search, {
              partial: !exact,
              ignoreUndefined: !activeOptions?.explicitUndefined
            })) return false;
          }
        }
      }
      if (activeOptions?.includeHash) return false;
      return true;
    })();
    if (externalLink2) return {
      ...propsSafeToSpread,
      ref: innerRef,
      href: externalLink2,
      ...children && { children },
      ...target && { target },
      ...disabled && { disabled },
      ...style && { style },
      ...className && { className }
    };
    const resolvedActiveProps2 = isActive2 ? functionalUpdate(activeProps, {}) ?? STATIC_ACTIVE_OBJECT : STATIC_EMPTY_OBJECT;
    const resolvedInactiveProps2 = isActive2 ? STATIC_EMPTY_OBJECT : functionalUpdate(inactiveProps, {}) ?? STATIC_EMPTY_OBJECT;
    const resolvedStyle2 = (() => {
      const baseStyle = style;
      const activeStyle = resolvedActiveProps2.style;
      const inactiveStyle = resolvedInactiveProps2.style;
      if (!baseStyle && !activeStyle && !inactiveStyle) return;
      if (baseStyle && !activeStyle && !inactiveStyle) return baseStyle;
      if (!baseStyle && activeStyle && !inactiveStyle) return activeStyle;
      if (!baseStyle && !activeStyle && inactiveStyle) return inactiveStyle;
      return {
        ...baseStyle,
        ...activeStyle,
        ...inactiveStyle
      };
    })();
    const resolvedClassName2 = (() => {
      const baseClassName = className;
      const activeClassName = resolvedActiveProps2.className;
      const inactiveClassName = resolvedInactiveProps2.className;
      if (!baseClassName && !activeClassName && !inactiveClassName) return "";
      let out = "";
      if (baseClassName) out = baseClassName;
      if (activeClassName) out = out ? `${out} ${activeClassName}` : activeClassName;
      if (inactiveClassName) out = out ? `${out} ${inactiveClassName}` : inactiveClassName;
      return out;
    })();
    return {
      ...propsSafeToSpread,
      ...resolvedActiveProps2,
      ...resolvedInactiveProps2,
      href: hrefOption2?.href,
      ref: innerRef,
      disabled: !!disabled,
      target,
      ...resolvedStyle2 && { style: resolvedStyle2 },
      ...resolvedClassName2 && { className: resolvedClassName2 },
      ...disabled && STATIC_DISABLED_PROPS,
      ...isActive2 && STATIC_ACTIVE_PROPS
    };
  }
}
var STATIC_EMPTY_OBJECT = {};
var STATIC_ACTIVE_OBJECT = { className: "active" };
var STATIC_DISABLED_PROPS = {
  role: "link",
  "aria-disabled": true
};
var STATIC_ACTIVE_PROPS = {
  "data-status": "active",
  "aria-current": "page"
};
function getHrefOption(publicHref, external, history, disabled) {
  if (disabled) return void 0;
  if (external) return {
    href: publicHref,
    external: true
  };
  return {
    href: history.createHref(publicHref) || "/",
    external: false
  };
}
function isSafeInternal(to) {
  if (typeof to !== "string") return false;
  const zero = to.charCodeAt(0);
  if (zero === 47) return to.charCodeAt(1) !== 47;
  return zero === 46;
}
var Link = reactExports.forwardRef((props, ref) => {
  const { _asChild, ...rest } = props;
  const { type: _type, ...linkProps } = useLinkProps(rest, ref);
  const children = typeof rest.children === "function" ? rest.children({ isActive: linkProps["data-status"] === "active" }) : rest.children;
  if (!_asChild) {
    const { disabled: _2, ...rest2 } = linkProps;
    return reactExports.createElement("a", rest2, children);
  }
  return reactExports.createElement(_asChild, linkProps, children);
});
var Route$N = class Route extends BaseRoute {
  /**
  * @deprecated Use the `createRoute` function instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id,
        structuralSharing: opts?.structuralSharing
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRoute(options) {
  return new Route$N(options);
}
var RootRoute = class extends BaseRootRoute {
  /**
  * @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id,
        structuralSharing: opts?.structuralSharing
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRootRoute(options) {
  return new RootRoute(options);
}
function createFileRoute(path) {
  return new FileRoute(path, { silent: true }).createRoute;
}
var FileRoute = class {
  constructor(path, _opts) {
    this.path = path;
    this.createRoute = (options) => {
      const route = createRoute(options);
      route.isRoot = false;
      return route;
    };
    this.silent = _opts?.silent;
  }
};
function lazyRouteComponent(importer, exportName) {
  let loadPromise;
  let comp;
  let error;
  let reload;
  const load = () => {
    if (!loadPromise) loadPromise = importer().then((res) => {
      loadPromise = void 0;
      comp = res[exportName];
    }).catch((err) => {
      error = err;
      if (isModuleNotFoundError(error)) {
        if (error instanceof Error && typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
          const storageKey = `tanstack_router_reload:${error.message}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "1");
            reload = true;
          }
        }
      }
    });
    return loadPromise;
  };
  const lazyComp = function Lazy(props) {
    if (reload) {
      window.location.reload();
      throw new Promise(() => {
      });
    }
    if (error) throw error;
    if (!comp) if (reactUse) reactUse(load());
    else throw load();
    return reactExports.createElement(comp, props);
  };
  lazyComp.preload = load;
  return lazyComp;
}
var getStoreFactory = (opts) => {
  return {
    createMutableStore: createNonReactiveMutableStore,
    createReadonlyStore: createNonReactiveReadonlyStore,
    batch: (fn) => fn()
  };
};
var createRouter = (options) => {
  return new Router(options);
};
var Router = class extends RouterCore {
  constructor(options) {
    super(options, getStoreFactory);
  }
};
function useRouterState(opts) {
  const contextRouter = useRouter({ warn: opts?.router === void 0 });
  const router2 = opts?.router || contextRouter;
  {
    const state = router2.stores.__store.get();
    return opts?.select ? opts.select(state) : state;
  }
}
function useLocation(opts) {
  const router2 = useRouter();
  {
    const location = router2.stores.location.get();
    return location;
  }
}
function Asset({ tag, attrs, children, nonce }) {
  switch (tag) {
    case "title":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("title", {
        ...attrs,
        suppressHydrationWarning: true,
        children
      });
    case "meta":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        ...attrs,
        suppressHydrationWarning: true
      });
    case "link":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("link", {
        ...attrs,
        nonce,
        suppressHydrationWarning: true
      });
    case "style":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("style", {
        ...attrs,
        dangerouslySetInnerHTML: { __html: children },
        nonce
      });
    case "script":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Script, {
        attrs,
        children
      });
    default:
      return null;
  }
}
function Script({ attrs, children }) {
  useRouter();
  useHydrated();
  const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
  reactExports.useEffect(() => {
    if (dataScript) return;
    if (attrs?.src) {
      const normSrc = (() => {
        try {
          const base = document.baseURI || window.location.href;
          return new URL(attrs.src, base).href;
        } catch {
          return attrs.src;
        }
      })();
      if (Array.from(document.querySelectorAll("script[src]")).find((el) => el.src === normSrc)) return;
      const script = document.createElement("script");
      for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
    if (typeof children === "string") {
      const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
      const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
      if (Array.from(document.querySelectorAll("script:not([src])")).find((el) => {
        if (!(el instanceof HTMLScriptElement)) return false;
        const sType = el.getAttribute("type") ?? "text/javascript";
        const sNonce = el.getAttribute("nonce") ?? void 0;
        return el.textContent === children && sType === typeAttr && sNonce === nonceAttr;
      })) return;
      const script = document.createElement("script");
      script.textContent = children;
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
      }
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [
    attrs,
    children,
    dataScript
  ]);
  {
    if (attrs?.src) return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
      ...attrs,
      suppressHydrationWarning: true
    });
    if (typeof children === "string") return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
      ...attrs,
      dangerouslySetInnerHTML: { __html: children },
      suppressHydrationWarning: true
    });
    return null;
  }
}
function buildTagsFromMatches(router2, nonce, matches, assetCrossOrigin) {
  const routeMeta = matches.map((match) => match.meta).filter(Boolean);
  const resultMeta = [];
  const metaByAttribute = {};
  let title;
  for (let i = routeMeta.length - 1; i >= 0; i--) {
    const metas = routeMeta[i];
    for (let j2 = metas.length - 1; j2 >= 0; j2--) {
      const m2 = metas[j2];
      if (!m2) continue;
      if (m2.title) {
        if (!title) title = {
          tag: "title",
          children: m2.title
        };
      } else if ("script:ld+json" in m2) try {
        const json = JSON.stringify(m2["script:ld+json"]);
        resultMeta.push({
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: escapeHtml(json)
        });
      } catch {
      }
      else {
        const attribute = m2.name ?? m2.property;
        if (attribute) if (metaByAttribute[attribute]) continue;
        else metaByAttribute[attribute] = true;
        resultMeta.push({
          tag: "meta",
          attrs: {
            ...m2,
            nonce
          }
        });
      }
    }
  }
  if (title) resultMeta.push(title);
  if (nonce) resultMeta.push({
    tag: "meta",
    attrs: {
      property: "csp-nonce",
      content: nonce
    }
  });
  resultMeta.reverse();
  const constructedLinks = matches.map((match) => match.links).filter(Boolean).flat(1).map((link) => ({
    tag: "link",
    attrs: {
      ...link,
      nonce
    }
  }));
  const manifest = router2.ssr?.manifest;
  const assetLinks = matches.map((match) => manifest?.routes[match.routeId]?.assets ?? []).filter(Boolean).flat(1).filter((asset) => asset.tag === "link").map((asset) => ({
    tag: "link",
    attrs: {
      ...asset.attrs,
      crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? asset.attrs?.crossOrigin,
      suppressHydrationWarning: true,
      nonce
    }
  }));
  const preloadLinks = [];
  matches.map((match) => router2.looseRoutesById[match.routeId]).forEach((route) => router2.ssr?.manifest?.routes[route.id]?.preloads?.filter(Boolean).forEach((preload) => {
    const preloadLink = resolveManifestAssetLink(preload);
    preloadLinks.push({
      tag: "link",
      attrs: {
        rel: "modulepreload",
        href: preloadLink.href,
        crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "modulepreload") ?? preloadLink.crossOrigin,
        nonce
      }
    });
  }));
  const styles = matches.map((match) => match.styles).flat(1).filter(Boolean).map(({ children, ...attrs }) => ({
    tag: "style",
    attrs: {
      ...attrs,
      nonce
    },
    children
  }));
  const headScripts = matches.map((match) => match.headScripts).flat(1).filter(Boolean).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      nonce
    },
    children
  }));
  return uniqBy([
    ...resultMeta,
    ...preloadLinks,
    ...constructedLinks,
    ...assetLinks,
    ...styles,
    ...headScripts
  ], (d2) => JSON.stringify(d2));
}
var useTags = (assetCrossOrigin) => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  return buildTagsFromMatches(router2, nonce, router2.stores.matches.get(), assetCrossOrigin);
};
function uniqBy(arr, fn) {
  const seen = /* @__PURE__ */ new Set();
  return arr.filter((item) => {
    const key = fn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function HeadContent(props) {
  const tags = useTags(props.assetCrossOrigin);
  const nonce = useRouter().options.ssr?.nonce;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: tags.map((tag) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...tag,
    key: `tsr-meta-${JSON.stringify(tag)}`,
    nonce
  })) });
}
var Scripts = () => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  const getAssetScripts = (matches) => {
    const assetScripts = [];
    const manifest = router2.ssr?.manifest;
    if (!manifest) return [];
    matches.map((match) => router2.looseRoutesById[match.routeId]).forEach((route) => manifest.routes[route.id]?.assets?.filter((d2) => d2.tag === "script").forEach((asset) => {
      assetScripts.push({
        tag: "script",
        attrs: {
          ...asset.attrs,
          nonce
        },
        children: asset.children
      });
    }));
    return assetScripts;
  };
  const getScripts = (matches) => matches.map((match) => match.scripts).flat(1).filter(Boolean).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      suppressHydrationWarning: true,
      nonce
    },
    children
  }));
  {
    const activeMatches = router2.stores.matches.get();
    const assetScripts = getAssetScripts(activeMatches);
    return renderScripts(router2, getScripts(activeMatches), assetScripts);
  }
};
function renderScripts(router2, scripts, assetScripts) {
  let serverBufferedScript = void 0;
  if (router2.serverSsr) serverBufferedScript = router2.serverSsr.takeBufferedScripts();
  const allScripts = [...scripts, ...assetScripts];
  if (serverBufferedScript) allScripts.unshift(serverBufferedScript);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: allScripts.map((asset, i) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...asset,
    key: `tsr-scripts-${asset.tag}-${i}`
  })) });
}
function __insertCSS(code) {
  if (typeof document == "undefined") return;
  let head = document.head || document.getElementsByTagName("head")[0];
  let style = document.createElement("style");
  style.type = "text/css";
  head.appendChild(style);
  style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
}
const getAsset = (type) => {
  switch (type) {
    case "success":
      return SuccessIcon;
    case "info":
      return InfoIcon;
    case "warning":
      return WarningIcon;
    case "error":
      return ErrorIcon;
    default:
      return null;
  }
};
const bars = Array(12).fill(0);
const Loader = ({ visible, className }) => {
  return /* @__PURE__ */ React.createElement("div", {
    className: [
      "sonner-loading-wrapper",
      className
    ].filter(Boolean).join(" "),
    "data-visible": visible
  }, /* @__PURE__ */ React.createElement("div", {
    className: "sonner-spinner"
  }, bars.map((_2, i) => /* @__PURE__ */ React.createElement("div", {
    className: "sonner-loading-bar",
    key: `spinner-bar-${i}`
  }))));
};
const SuccessIcon = /* @__PURE__ */ React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ React.createElement("path", {
  fillRule: "evenodd",
  d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  clipRule: "evenodd"
}));
const WarningIcon = /* @__PURE__ */ React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ React.createElement("path", {
  fillRule: "evenodd",
  d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
  clipRule: "evenodd"
}));
const InfoIcon = /* @__PURE__ */ React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ React.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
  clipRule: "evenodd"
}));
const ErrorIcon = /* @__PURE__ */ React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, /* @__PURE__ */ React.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
  clipRule: "evenodd"
}));
const CloseIcon = /* @__PURE__ */ React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /* @__PURE__ */ React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /* @__PURE__ */ React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}));
const useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(document.hidden);
  React.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", callback);
    return () => window.removeEventListener("visibilitychange", callback);
  }, []);
  return isDocumentHidden;
};
let toastsCounter = 1;
class Observer {
  constructor() {
    this.subscribe = (subscriber) => {
      this.subscribers.push(subscriber);
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(index, 1);
      };
    };
    this.publish = (data) => {
      this.subscribers.forEach((subscriber) => subscriber(data));
    };
    this.addToast = (data) => {
      this.publish(data);
      this.toasts = [
        ...this.toasts,
        data
      ];
    };
    this.create = (data) => {
      var _data_id;
      const { message, ...rest } = data;
      const id = typeof (data == null ? void 0 : data.id) === "number" || ((_data_id = data.id) == null ? void 0 : _data_id.length) > 0 ? data.id : toastsCounter++;
      const alreadyExists = this.toasts.find((toast2) => {
        return toast2.id === id;
      });
      const dismissible = data.dismissible === void 0 ? true : data.dismissible;
      if (this.dismissedToasts.has(id)) {
        this.dismissedToasts.delete(id);
      }
      if (alreadyExists) {
        this.toasts = this.toasts.map((toast2) => {
          if (toast2.id === id) {
            this.publish({
              ...toast2,
              ...data,
              id,
              title: message
            });
            return {
              ...toast2,
              ...data,
              id,
              dismissible,
              title: message
            };
          }
          return toast2;
        });
      } else {
        this.addToast({
          title: message,
          ...rest,
          dismissible,
          id
        });
      }
      return id;
    };
    this.dismiss = (id) => {
      if (id) {
        this.dismissedToasts.add(id);
        requestAnimationFrame(() => this.subscribers.forEach((subscriber) => subscriber({
          id,
          dismiss: true
        })));
      } else {
        this.toasts.forEach((toast2) => {
          this.subscribers.forEach((subscriber) => subscriber({
            id: toast2.id,
            dismiss: true
          }));
        });
      }
      return id;
    };
    this.message = (message, data) => {
      return this.create({
        ...data,
        message
      });
    };
    this.error = (message, data) => {
      return this.create({
        ...data,
        message,
        type: "error"
      });
    };
    this.success = (message, data) => {
      return this.create({
        ...data,
        type: "success",
        message
      });
    };
    this.info = (message, data) => {
      return this.create({
        ...data,
        type: "info",
        message
      });
    };
    this.warning = (message, data) => {
      return this.create({
        ...data,
        type: "warning",
        message
      });
    };
    this.loading = (message, data) => {
      return this.create({
        ...data,
        type: "loading",
        message
      });
    };
    this.promise = (promise, data) => {
      if (!data) {
        return;
      }
      let id = void 0;
      if (data.loading !== void 0) {
        id = this.create({
          ...data,
          promise,
          type: "loading",
          message: data.loading,
          description: typeof data.description !== "function" ? data.description : void 0
        });
      }
      const p2 = Promise.resolve(promise instanceof Function ? promise() : promise);
      let shouldDismiss = id !== void 0;
      let result;
      const originalPromise = p2.then(async (response) => {
        result = [
          "resolve",
          response
        ];
        const isReactElementResponse = React.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({
            id,
            type: "default",
            message: response
          });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(`HTTP error! status: ${response.status}`) : data.error;
          const description = typeof data.description === "function" ? await data.description(`HTTP error! status: ${response.status}`) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !React.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (response instanceof Error) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(response) : data.error;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !React.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (data.success !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.success === "function" ? await data.success(response) : data.success;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !React.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "success",
            description,
            ...toastSettings
          });
        }
      }).catch(async (error) => {
        result = [
          "reject",
          error
        ];
        if (data.error !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(error) : data.error;
          const description = typeof data.description === "function" ? await data.description(error) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !React.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        }
      }).finally(() => {
        if (shouldDismiss) {
          this.dismiss(id);
          id = void 0;
        }
        data.finally == null ? void 0 : data.finally.call(data);
      });
      const unwrap = () => new Promise((resolve, reject) => originalPromise.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
      if (typeof id !== "string" && typeof id !== "number") {
        return {
          unwrap
        };
      } else {
        return Object.assign(id, {
          unwrap
        });
      }
    };
    this.custom = (jsx, data) => {
      const id = (data == null ? void 0 : data.id) || toastsCounter++;
      this.create({
        jsx: jsx(id),
        id,
        ...data
      });
      return id;
    };
    this.getActiveToasts = () => {
      return this.toasts.filter((toast2) => !this.dismissedToasts.has(toast2.id));
    };
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}
const ToastState = new Observer();
const toastFunction = (message, data) => {
  const id = (data == null ? void 0 : data.id) || toastsCounter++;
  ToastState.addToast({
    title: message,
    ...data,
    id
  });
  return id;
};
const isHttpResponse = (data) => {
  return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
};
const basicToast = toastFunction;
const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();
const toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading
}, {
  getHistory,
  getToasts
});
__insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");
function isAction(action) {
  return action.label !== void 0;
}
const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = "24px";
const MOBILE_VIEWPORT_OFFSET = "16px";
const TOAST_LIFETIME = 4e3;
const TOAST_WIDTH = 356;
const GAP = 14;
const SWIPE_THRESHOLD = 45;
const TIME_BEFORE_UNMOUNT = 200;
function cn$1(...classes) {
  return classes.filter(Boolean).join(" ");
}
function getDefaultSwipeDirections(position) {
  const [y2, x2] = position.split("-");
  const directions = [];
  if (y2) {
    directions.push(y2);
  }
  if (x2) {
    directions.push(x2);
  }
  return directions;
}
const Toast = (props) => {
  var _toast_classNames, _toast_classNames1, _toast_classNames2, _toast_classNames3, _toast_classNames4, _toast_classNames5, _toast_classNames6, _toast_classNames7, _toast_classNames8;
  const { invert: ToasterInvert, toast: toast2, unstyled, interacting, setHeights, visibleToasts, heights, index, toasts, expanded, removeToast, defaultRichColors, closeButton: closeButtonFromToaster, style, cancelButtonStyle, actionButtonStyle, className = "", descriptionClassName = "", duration: durationFromToaster, position, gap, expandByDefault, classNames, icons, closeButtonAriaLabel = "Close toast" } = props;
  const [swipeDirection, setSwipeDirection] = React.useState(null);
  const [swipeOutDirection, setSwipeOutDirection] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [swiping, setSwiping] = React.useState(false);
  const [swipeOut, setSwipeOut] = React.useState(false);
  const [isSwiped, setIsSwiped] = React.useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(0);
  const [initialHeight, setInitialHeight] = React.useState(0);
  const remainingTime = React.useRef(toast2.duration || durationFromToaster || TOAST_LIFETIME);
  const dragStartTime = React.useRef(null);
  const toastRef = React.useRef(null);
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast2.type;
  const dismissible = toast2.dismissible !== false;
  const toastClassname = toast2.className || "";
  const toastDescriptionClassname = toast2.descriptionClassName || "";
  const heightIndex = React.useMemo(() => heights.findIndex((height) => height.toastId === toast2.id) || 0, [
    heights,
    toast2.id
  ]);
  const closeButton = React.useMemo(() => {
    var _toast_closeButton;
    return (_toast_closeButton = toast2.closeButton) != null ? _toast_closeButton : closeButtonFromToaster;
  }, [
    toast2.closeButton,
    closeButtonFromToaster
  ]);
  const duration = React.useMemo(() => toast2.duration || durationFromToaster || TOAST_LIFETIME, [
    toast2.duration,
    durationFromToaster
  ]);
  const closeTimerStartTimeRef = React.useRef(0);
  const offset = React.useRef(0);
  const lastCloseTimerStartTimeRef = React.useRef(0);
  const pointerStartRef = React.useRef(null);
  const [y2, x2] = position.split("-");
  const toastsHeightBefore = React.useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex) {
        return prev;
      }
      return prev + curr.height;
    }, 0);
  }, [
    heights,
    heightIndex
  ]);
  const isDocumentHidden = useIsDocumentHidden();
  const invert = toast2.invert || ToasterInvert;
  const disabled = toastType === "loading";
  offset.current = React.useMemo(() => heightIndex * gap + toastsHeightBefore, [
    heightIndex,
    toastsHeightBefore
  ]);
  React.useEffect(() => {
    remainingTime.current = duration;
  }, [
    duration
  ]);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  React.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;
      setInitialHeight(height);
      setHeights((h2) => [
        {
          toastId: toast2.id,
          height,
          position: toast2.position
        },
        ...h2
      ]);
      return () => setHeights((h2) => h2.filter((height2) => height2.toastId !== toast2.id));
    }
  }, [
    setHeights,
    toast2.id
  ]);
  React.useLayoutEffect(() => {
    if (!mounted) return;
    const toastNode = toastRef.current;
    const originalHeight = toastNode.style.height;
    toastNode.style.height = "auto";
    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;
    setInitialHeight(newHeight);
    setHeights((heights2) => {
      const alreadyExists = heights2.find((height) => height.toastId === toast2.id);
      if (!alreadyExists) {
        return [
          {
            toastId: toast2.id,
            height: newHeight,
            position: toast2.position
          },
          ...heights2
        ];
      } else {
        return heights2.map((height) => height.toastId === toast2.id ? {
          ...height,
          height: newHeight
        } : height);
      }
    });
  }, [
    mounted,
    toast2.title,
    toast2.description,
    setHeights,
    toast2.id,
    toast2.jsx,
    toast2.action,
    toast2.cancel
  ]);
  const deleteToast = React.useCallback(() => {
    setRemoved(true);
    setOffsetBeforeRemove(offset.current);
    setHeights((h2) => h2.filter((height) => height.toastId !== toast2.id));
    setTimeout(() => {
      removeToast(toast2);
    }, TIME_BEFORE_UNMOUNT);
  }, [
    toast2,
    removeToast,
    setHeights,
    offset
  ]);
  React.useEffect(() => {
    if (toast2.promise && toastType === "loading" || toast2.duration === Infinity || toast2.type === "loading") return;
    let timeoutId;
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.current;
        remainingTime.current = remainingTime.current - elapsedTime;
      }
      lastCloseTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
    };
    const startTimer = () => {
      if (remainingTime.current === Infinity) return;
      closeTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
      timeoutId = setTimeout(() => {
        toast2.onAutoClose == null ? void 0 : toast2.onAutoClose.call(toast2, toast2);
        deleteToast();
      }, remainingTime.current);
    };
    if (expanded || interacting || isDocumentHidden) {
      pauseTimer();
    } else {
      startTimer();
    }
    return () => clearTimeout(timeoutId);
  }, [
    expanded,
    interacting,
    toast2,
    toastType,
    isDocumentHidden,
    deleteToast
  ]);
  React.useEffect(() => {
    if (toast2.delete) {
      deleteToast();
      toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
    }
  }, [
    deleteToast,
    toast2.delete
  ]);
  function getLoadingIcon() {
    var _toast_classNames9;
    if (icons == null ? void 0 : icons.loading) {
      var _toast_classNames12;
      return /* @__PURE__ */ React.createElement("div", {
        className: cn$1(classNames == null ? void 0 : classNames.loader, toast2 == null ? void 0 : (_toast_classNames12 = toast2.classNames) == null ? void 0 : _toast_classNames12.loader, "sonner-loader"),
        "data-visible": toastType === "loading"
      }, icons.loading);
    }
    return /* @__PURE__ */ React.createElement(Loader, {
      className: cn$1(classNames == null ? void 0 : classNames.loader, toast2 == null ? void 0 : (_toast_classNames9 = toast2.classNames) == null ? void 0 : _toast_classNames9.loader),
      visible: toastType === "loading"
    });
  }
  const icon = toast2.icon || (icons == null ? void 0 : icons[toastType]) || getAsset(toastType);
  var _toast_richColors, _icons_close;
  return /* @__PURE__ */ React.createElement("li", {
    tabIndex: 0,
    ref: toastRef,
    className: cn$1(className, toastClassname, classNames == null ? void 0 : classNames.toast, toast2 == null ? void 0 : (_toast_classNames = toast2.classNames) == null ? void 0 : _toast_classNames.toast, classNames == null ? void 0 : classNames.default, classNames == null ? void 0 : classNames[toastType], toast2 == null ? void 0 : (_toast_classNames1 = toast2.classNames) == null ? void 0 : _toast_classNames1[toastType]),
    "data-sonner-toast": "",
    "data-rich-colors": (_toast_richColors = toast2.richColors) != null ? _toast_richColors : defaultRichColors,
    "data-styled": !Boolean(toast2.jsx || toast2.unstyled || unstyled),
    "data-mounted": mounted,
    "data-promise": Boolean(toast2.promise),
    "data-swiped": isSwiped,
    "data-removed": removed,
    "data-visible": isVisible,
    "data-y-position": y2,
    "data-x-position": x2,
    "data-index": index,
    "data-front": isFront,
    "data-swiping": swiping,
    "data-dismissible": dismissible,
    "data-type": toastType,
    "data-invert": invert,
    "data-swipe-out": swipeOut,
    "data-swipe-direction": swipeOutDirection,
    "data-expanded": Boolean(expanded || expandByDefault && mounted),
    "data-testid": toast2.testId,
    style: {
      "--index": index,
      "--toasts-before": index,
      "--z-index": toasts.length - index,
      "--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
      "--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
      ...style,
      ...toast2.style
    },
    onDragEnd: () => {
      setSwiping(false);
      setSwipeDirection(null);
      pointerStartRef.current = null;
    },
    onPointerDown: (event) => {
      if (event.button === 2) return;
      if (disabled || !dismissible) return;
      dragStartTime.current = /* @__PURE__ */ new Date();
      setOffsetBeforeRemove(offset.current);
      event.target.setPointerCapture(event.pointerId);
      if (event.target.tagName === "BUTTON") return;
      setSwiping(true);
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    },
    onPointerUp: () => {
      var _toastRef_current, _toastRef_current1, _dragStartTime_current;
      if (swipeOut || !dismissible) return;
      pointerStartRef.current = null;
      const swipeAmountX = Number(((_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0);
      const swipeAmountY = Number(((_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0);
      const timeTaken = (/* @__PURE__ */ new Date()).getTime() - ((_dragStartTime_current = dragStartTime.current) == null ? void 0 : _dragStartTime_current.getTime());
      const swipeAmount = swipeDirection === "x" ? swipeAmountX : swipeAmountY;
      const velocity = Math.abs(swipeAmount) / timeTaken;
      if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
        setOffsetBeforeRemove(offset.current);
        toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
        if (swipeDirection === "x") {
          setSwipeOutDirection(swipeAmountX > 0 ? "right" : "left");
        } else {
          setSwipeOutDirection(swipeAmountY > 0 ? "down" : "up");
        }
        deleteToast();
        setSwipeOut(true);
        return;
      } else {
        var _toastRef_current2, _toastRef_current3;
        (_toastRef_current2 = toastRef.current) == null ? void 0 : _toastRef_current2.style.setProperty("--swipe-amount-x", `0px`);
        (_toastRef_current3 = toastRef.current) == null ? void 0 : _toastRef_current3.style.setProperty("--swipe-amount-y", `0px`);
      }
      setIsSwiped(false);
      setSwiping(false);
      setSwipeDirection(null);
    },
    onPointerMove: (event) => {
      var _window_getSelection, _toastRef_current, _toastRef_current1;
      if (!pointerStartRef.current || !dismissible) return;
      const isHighlighted = ((_window_getSelection = window.getSelection()) == null ? void 0 : _window_getSelection.toString().length) > 0;
      if (isHighlighted) return;
      const yDelta = event.clientY - pointerStartRef.current.y;
      const xDelta = event.clientX - pointerStartRef.current.x;
      var _props_swipeDirections;
      const swipeDirections = (_props_swipeDirections = props.swipeDirections) != null ? _props_swipeDirections : getDefaultSwipeDirections(position);
      if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
        setSwipeDirection(Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y");
      }
      let swipeAmount = {
        x: 0,
        y: 0
      };
      const getDampening = (delta) => {
        const factor = Math.abs(delta) / 20;
        return 1 / (1.5 + factor);
      };
      if (swipeDirection === "y") {
        if (swipeDirections.includes("top") || swipeDirections.includes("bottom")) {
          if (swipeDirections.includes("top") && yDelta < 0 || swipeDirections.includes("bottom") && yDelta > 0) {
            swipeAmount.y = yDelta;
          } else {
            const dampenedDelta = yDelta * getDampening(yDelta);
            swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
          }
        }
      } else if (swipeDirection === "x") {
        if (swipeDirections.includes("left") || swipeDirections.includes("right")) {
          if (swipeDirections.includes("left") && xDelta < 0 || swipeDirections.includes("right") && xDelta > 0) {
            swipeAmount.x = xDelta;
          } else {
            const dampenedDelta = xDelta * getDampening(xDelta);
            swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
          }
        }
      }
      if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
        setIsSwiped(true);
      }
      (_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.setProperty("--swipe-amount-x", `${swipeAmount.x}px`);
      (_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.setProperty("--swipe-amount-y", `${swipeAmount.y}px`);
    }
  }, closeButton && !toast2.jsx && toastType !== "loading" ? /* @__PURE__ */ React.createElement("button", {
    "aria-label": closeButtonAriaLabel,
    "data-disabled": disabled,
    "data-close-button": true,
    onClick: disabled || !dismissible ? () => {
    } : () => {
      deleteToast();
      toast2.onDismiss == null ? void 0 : toast2.onDismiss.call(toast2, toast2);
    },
    className: cn$1(classNames == null ? void 0 : classNames.closeButton, toast2 == null ? void 0 : (_toast_classNames2 = toast2.classNames) == null ? void 0 : _toast_classNames2.closeButton)
  }, (_icons_close = icons == null ? void 0 : icons.close) != null ? _icons_close : CloseIcon) : null, (toastType || toast2.icon || toast2.promise) && toast2.icon !== null && ((icons == null ? void 0 : icons[toastType]) !== null || toast2.icon) ? /* @__PURE__ */ React.createElement("div", {
    "data-icon": "",
    className: cn$1(classNames == null ? void 0 : classNames.icon, toast2 == null ? void 0 : (_toast_classNames3 = toast2.classNames) == null ? void 0 : _toast_classNames3.icon)
  }, toast2.promise || toast2.type === "loading" && !toast2.icon ? toast2.icon || getLoadingIcon() : null, toast2.type !== "loading" ? icon : null) : null, /* @__PURE__ */ React.createElement("div", {
    "data-content": "",
    className: cn$1(classNames == null ? void 0 : classNames.content, toast2 == null ? void 0 : (_toast_classNames4 = toast2.classNames) == null ? void 0 : _toast_classNames4.content)
  }, /* @__PURE__ */ React.createElement("div", {
    "data-title": "",
    className: cn$1(classNames == null ? void 0 : classNames.title, toast2 == null ? void 0 : (_toast_classNames5 = toast2.classNames) == null ? void 0 : _toast_classNames5.title)
  }, toast2.jsx ? toast2.jsx : typeof toast2.title === "function" ? toast2.title() : toast2.title), toast2.description ? /* @__PURE__ */ React.createElement("div", {
    "data-description": "",
    className: cn$1(descriptionClassName, toastDescriptionClassname, classNames == null ? void 0 : classNames.description, toast2 == null ? void 0 : (_toast_classNames6 = toast2.classNames) == null ? void 0 : _toast_classNames6.description)
  }, typeof toast2.description === "function" ? toast2.description() : toast2.description) : null), /* @__PURE__ */ React.isValidElement(toast2.cancel) ? toast2.cancel : toast2.cancel && isAction(toast2.cancel) ? /* @__PURE__ */ React.createElement("button", {
    "data-button": true,
    "data-cancel": true,
    style: toast2.cancelButtonStyle || cancelButtonStyle,
    onClick: (event) => {
      if (!isAction(toast2.cancel)) return;
      if (!dismissible) return;
      toast2.cancel.onClick == null ? void 0 : toast2.cancel.onClick.call(toast2.cancel, event);
      deleteToast();
    },
    className: cn$1(classNames == null ? void 0 : classNames.cancelButton, toast2 == null ? void 0 : (_toast_classNames7 = toast2.classNames) == null ? void 0 : _toast_classNames7.cancelButton)
  }, toast2.cancel.label) : null, /* @__PURE__ */ React.isValidElement(toast2.action) ? toast2.action : toast2.action && isAction(toast2.action) ? /* @__PURE__ */ React.createElement("button", {
    "data-button": true,
    "data-action": true,
    style: toast2.actionButtonStyle || actionButtonStyle,
    onClick: (event) => {
      if (!isAction(toast2.action)) return;
      toast2.action.onClick == null ? void 0 : toast2.action.onClick.call(toast2.action, event);
      if (event.defaultPrevented) return;
      deleteToast();
    },
    className: cn$1(classNames == null ? void 0 : classNames.actionButton, toast2 == null ? void 0 : (_toast_classNames8 = toast2.classNames) == null ? void 0 : _toast_classNames8.actionButton)
  }, toast2.action.label) : null);
};
function getDocumentDirection() {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr";
  const dirAttribute = document.documentElement.getAttribute("dir");
  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction;
  }
  return dirAttribute;
}
function assignOffset(defaultOffset, mobileOffset) {
  const styles = {};
  [
    defaultOffset,
    mobileOffset
  ].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;
    function assignAll(offset2) {
      [
        "top",
        "right",
        "bottom",
        "left"
      ].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof offset2 === "number" ? `${offset2}px` : offset2;
      });
    }
    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object") {
      [
        "top",
        "right",
        "bottom",
        "left"
      ].forEach((key) => {
        if (offset[key] === void 0) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof offset[key] === "number" ? `${offset[key]}px` : offset[key];
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });
  return styles;
}
const Toaster$1 = /* @__PURE__ */ React.forwardRef(function Toaster(props, ref) {
  const { id, invert, position = "bottom-right", hotkey = [
    "altKey",
    "KeyT"
  ], expand, closeButton, className, offset, mobileOffset, theme = "light", richColors, duration, style, visibleToasts = VISIBLE_TOASTS_AMOUNT, toastOptions, dir = getDocumentDirection(), gap = GAP, icons, containerAriaLabel = "Notifications" } = props;
  const [toasts, setToasts] = React.useState([]);
  const filteredToasts = React.useMemo(() => {
    if (id) {
      return toasts.filter((toast2) => toast2.toasterId === id);
    }
    return toasts.filter((toast2) => !toast2.toasterId);
  }, [
    toasts,
    id
  ]);
  const possiblePositions = React.useMemo(() => {
    return Array.from(new Set([
      position
    ].concat(filteredToasts.filter((toast2) => toast2.position).map((toast2) => toast2.position))));
  }, [
    filteredToasts,
    position
  ]);
  const [heights, setHeights] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [interacting, setInteracting] = React.useState(false);
  const [actualTheme, setActualTheme] = React.useState(theme !== "system" ? theme : typeof window !== "undefined" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light");
  const listRef = React.useRef(null);
  const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
  const lastFocusedElementRef = React.useRef(null);
  const isFocusWithinRef = React.useRef(false);
  const removeToast = React.useCallback((toastToRemove) => {
    setToasts((toasts2) => {
      var _toasts_find;
      if (!((_toasts_find = toasts2.find((toast2) => toast2.id === toastToRemove.id)) == null ? void 0 : _toasts_find.delete)) {
        ToastState.dismiss(toastToRemove.id);
      }
      return toasts2.filter(({ id: id2 }) => id2 !== toastToRemove.id);
    });
  }, []);
  React.useEffect(() => {
    return ToastState.subscribe((toast2) => {
      if (toast2.dismiss) {
        requestAnimationFrame(() => {
          setToasts((toasts2) => toasts2.map((t) => t.id === toast2.id ? {
            ...t,
            delete: true
          } : t));
        });
        return;
      }
      setTimeout(() => {
        ReactDOM.flushSync(() => {
          setToasts((toasts2) => {
            const indexOfExistingToast = toasts2.findIndex((t) => t.id === toast2.id);
            if (indexOfExistingToast !== -1) {
              return [
                ...toasts2.slice(0, indexOfExistingToast),
                {
                  ...toasts2[indexOfExistingToast],
                  ...toast2
                },
                ...toasts2.slice(indexOfExistingToast + 1)
              ];
            }
            return [
              toast2,
              ...toasts2
            ];
          });
        });
      });
    });
  }, [
    toasts
  ]);
  React.useEffect(() => {
    if (theme !== "system") {
      setActualTheme(theme);
      return;
    }
    if (theme === "system") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setActualTheme("dark");
      } else {
        setActualTheme("light");
      }
    }
    if (typeof window === "undefined") return;
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      darkMediaQuery.addEventListener("change", ({ matches }) => {
        if (matches) {
          setActualTheme("dark");
        } else {
          setActualTheme("light");
        }
      });
    } catch (error) {
      darkMediaQuery.addListener(({ matches }) => {
        try {
          if (matches) {
            setActualTheme("dark");
          } else {
            setActualTheme("light");
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
  }, [
    theme
  ]);
  React.useEffect(() => {
    if (toasts.length <= 1) {
      setExpanded(false);
    }
  }, [
    toasts
  ]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      var _listRef_current;
      const isHotkeyPressed = hotkey.every((key) => event[key] || event.code === key);
      if (isHotkeyPressed) {
        var _listRef_current1;
        setExpanded(true);
        (_listRef_current1 = listRef.current) == null ? void 0 : _listRef_current1.focus();
      }
      if (event.code === "Escape" && (document.activeElement === listRef.current || ((_listRef_current = listRef.current) == null ? void 0 : _listRef_current.contains(document.activeElement)))) {
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hotkey
  ]);
  React.useEffect(() => {
    if (listRef.current) {
      return () => {
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus({
            preventScroll: true
          });
          lastFocusedElementRef.current = null;
          isFocusWithinRef.current = false;
        }
      };
    }
  }, [
    listRef.current
  ]);
  return (
    // Remove item from normal navigation flow, only available via hotkey
    /* @__PURE__ */ React.createElement("section", {
      ref,
      "aria-label": `${containerAriaLabel} ${hotkeyLabel}`,
      tabIndex: -1,
      "aria-live": "polite",
      "aria-relevant": "additions text",
      "aria-atomic": "false",
      suppressHydrationWarning: true
    }, possiblePositions.map((position2, index) => {
      var _heights_;
      const [y2, x2] = position2.split("-");
      if (!filteredToasts.length) return null;
      return /* @__PURE__ */ React.createElement("ol", {
        key: position2,
        dir: dir === "auto" ? getDocumentDirection() : dir,
        tabIndex: -1,
        ref: listRef,
        className,
        "data-sonner-toaster": true,
        "data-sonner-theme": actualTheme,
        "data-y-position": y2,
        "data-x-position": x2,
        style: {
          "--front-toast-height": `${((_heights_ = heights[0]) == null ? void 0 : _heights_.height) || 0}px`,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${gap}px`,
          ...style,
          ...assignOffset(offset, mobileOffset)
        },
        onBlur: (event) => {
          if (isFocusWithinRef.current && !event.currentTarget.contains(event.relatedTarget)) {
            isFocusWithinRef.current = false;
            if (lastFocusedElementRef.current) {
              lastFocusedElementRef.current.focus({
                preventScroll: true
              });
              lastFocusedElementRef.current = null;
            }
          }
        },
        onFocus: (event) => {
          const isNotDismissible = event.target instanceof HTMLElement && event.target.dataset.dismissible === "false";
          if (isNotDismissible) return;
          if (!isFocusWithinRef.current) {
            isFocusWithinRef.current = true;
            lastFocusedElementRef.current = event.relatedTarget;
          }
        },
        onMouseEnter: () => setExpanded(true),
        onMouseMove: () => setExpanded(true),
        onMouseLeave: () => {
          if (!interacting) {
            setExpanded(false);
          }
        },
        onDragEnd: () => setExpanded(false),
        onPointerDown: (event) => {
          const isNotDismissible = event.target instanceof HTMLElement && event.target.dataset.dismissible === "false";
          if (isNotDismissible) return;
          setInteracting(true);
        },
        onPointerUp: () => setInteracting(false)
      }, filteredToasts.filter((toast2) => !toast2.position && index === 0 || toast2.position === position2).map((toast2, index2) => {
        var _toastOptions_duration, _toastOptions_closeButton;
        return /* @__PURE__ */ React.createElement(Toast, {
          key: toast2.id,
          icons,
          index: index2,
          toast: toast2,
          defaultRichColors: richColors,
          duration: (_toastOptions_duration = toastOptions == null ? void 0 : toastOptions.duration) != null ? _toastOptions_duration : duration,
          className: toastOptions == null ? void 0 : toastOptions.className,
          descriptionClassName: toastOptions == null ? void 0 : toastOptions.descriptionClassName,
          invert,
          visibleToasts,
          closeButton: (_toastOptions_closeButton = toastOptions == null ? void 0 : toastOptions.closeButton) != null ? _toastOptions_closeButton : closeButton,
          interacting,
          position: position2,
          style: toastOptions == null ? void 0 : toastOptions.style,
          unstyled: toastOptions == null ? void 0 : toastOptions.unstyled,
          classNames: toastOptions == null ? void 0 : toastOptions.classNames,
          cancelButtonStyle: toastOptions == null ? void 0 : toastOptions.cancelButtonStyle,
          actionButtonStyle: toastOptions == null ? void 0 : toastOptions.actionButtonStyle,
          closeButtonAriaLabel: toastOptions == null ? void 0 : toastOptions.closeButtonAriaLabel,
          removeToast,
          toasts: filteredToasts.filter((t) => t.position == toast2.position),
          heights: heights.filter((h2) => h2.position == toast2.position),
          setHeights,
          expandByDefault: expand,
          gap,
          expanded,
          swipeDirections: props.swipeDirections
        });
      }));
    }))
  );
});
const Toaster2 = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
const identity = (arg) => arg;
function useStore$1(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(() => selector(api.getState()), [api, selector]),
    React.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React.useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore$1(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = ((createState) => createState ? createImpl(createState) : createImpl);
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, void 0);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, void 0)),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const persistImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => window.localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  let hydrationVersion = 0;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    return setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      return setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    const currentVersion = ++hydrationVersion;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            const migration = options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
            if (migration instanceof Promise) {
              return migration.then((result) => [true, result]);
            }
            return [true, migration];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      if (currentVersion !== hydrationVersion) {
        return;
      }
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      if (currentVersion !== hydrationVersion) {
        return;
      }
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(get(), void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      if (currentVersion !== hydrationVersion) {
        return;
      }
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persist = persistImpl;
const initialCategories = [
  { id: "lacos", name: "Laços", image: "🎀", order: 1 },
  { id: "tiaras", name: "Tiaras", image: "👑", order: 2 },
  { id: "bicos", name: "Bicos de Pato", image: "💝", order: 3 },
  { id: "kits", name: "Kits", image: "🎁", order: 4 },
  { id: "elasticos", name: "Elásticos", image: "🌸", order: 5 },
  { id: "presilhas", name: "Presilhas", image: "✨", order: 6 }
];
const initialProducts = [
  {
    id: "p1",
    name: "Laço Princesa Rosa Glitter",
    description: "Laço artesanal em fita de cetim com detalhes em glitter dourado. Perfeito para princesas de todas as idades. Acompanha bico de pato resistente.",
    price: 24.9,
    oldPrice: 34.9,
    image: "/products/ilustra-laco-rosa.png",
    gallery: [
      "/products/ilustra-laco-rosa.png",
      "/products/demo-laco-rosa-1.png"
    ],
    category: "lacos",
    stock: 25,
    sku: "LC-001",
    active: true,
    variations: [{ name: "Tamanho", options: ["P", "M", "G"] }]
  },
  {
    id: "p2",
    name: "Tiara Coroa Dourada",
    description: "Tiara estilo coroa banhada a ouro com strass. Ideal para festas, ensaios e momentos especiais.",
    price: 49.9,
    oldPrice: 69.9,
    image: "/products/ilustra-tiara-coroa.png",
    gallery: [
      "/products/ilustra-tiara-coroa.png",
      "/products/demo-tiara-coroa-1.png"
    ],
    category: "tiaras",
    stock: 12,
    sku: "TR-002",
    active: true
  },
  {
    id: "p3",
    name: "Kit 5 Laços Coloridos",
    description: "Kit promocional com 5 laços de cores variadas. Embalagem presenteável.",
    price: 79.9,
    oldPrice: 119.9,
    image: "/products/ilustra-kit-lacos.png",
    gallery: [
      "/products/ilustra-kit-lacos.png",
      "/products/demo-kit-lacos-1.png"
    ],
    category: "kits",
    stock: 8,
    sku: "KT-003",
    active: true
  },
  {
    id: "p4",
    name: "Bico de Pato Floral",
    description: "Bico de pato com flor de cetim feita à mão. Antialérgico.",
    price: 18.9,
    image: "/products/ilustra-bico-pato.png",
    gallery: [
      "/products/ilustra-bico-pato.png",
      "/products/demo-bico-pato-1.png"
    ],
    category: "bicos",
    stock: 40,
    sku: "BP-004",
    active: true
  },
  {
    id: "p5",
    name: "Presilha Borboleta Pérola",
    description: "Presilha em formato de borboleta com pérolas delicadas.",
    price: 22.5,
    oldPrice: 29.9,
    image: "/products/ilustra-presilha-borboleta.png",
    gallery: [
      "/products/ilustra-presilha-borboleta.png",
      "/products/demo-presilha-borboleta-1.png"
    ],
    category: "presilhas",
    stock: 18,
    sku: "PR-005",
    active: true
  },
  {
    id: "p6",
    name: "Elástico Veludo Rosa",
    description: "Conjunto de 3 elásticos de veludo macio que não marcam o cabelo.",
    price: 14.9,
    image: "/products/ilustra-elastico-veludo.png",
    gallery: ["/products/ilustra-elastico-veludo.png"],
    category: "elasticos",
    stock: 60,
    sku: "EL-006",
    active: true
  },
  {
    id: "p7",
    name: "Laço Maxi Cetim Dourado",
    description: "Laço grande estilo maxi em cetim com brilho dourado, ideal para ocasiões especiais.",
    price: 34.9,
    image: "/products/ilustra-laco-maxi.png",
    gallery: ["/products/ilustra-laco-maxi.png"],
    category: "lacos",
    stock: 15,
    sku: "LC-007",
    active: true
  },
  {
    id: "p8",
    name: "Tiara Flor de Cerejeira",
    description: "Tiara delicada com aplique de flor rosa em tecido.",
    price: 29.9,
    image: "/products/ilustra-tiara-cerejeira.png",
    gallery: ["/products/ilustra-tiara-cerejeira.png"],
    category: "tiaras",
    stock: 22,
    sku: "TR-008",
    active: true
  }
];
const initialCoupons = [
  {
    code: "PRIMEIRA10",
    type: "percent",
    value: 10,
    validUntil: "2026-12-31",
    maxUses: 100,
    usedCount: 12,
    minOrder: 0,
    active: true
  },
  {
    code: "PRINCESA20",
    type: "percent",
    value: 20,
    validUntil: "2026-12-31",
    maxUses: 50,
    usedCount: 7,
    minOrder: 100,
    active: true
  },
  {
    code: "FRETE15",
    type: "fixed",
    value: 15,
    validUntil: "2026-12-31",
    maxUses: 200,
    usedCount: 33,
    minOrder: 80,
    active: true
  }
];
const initialFAQ = [
  {
    id: "f1",
    category: "Pedidos",
    question: "Como acompanho meu pedido?",
    answer: "Você pode acompanhar o status do seu pedido acessando o menu 'Meus Pedidos' no seu perfil. Além disso, enviamos notificações via e-mail e push a cada atualização de status.",
    sortOrder: 1
  },
  {
    id: "f2",
    category: "Pedidos",
    question: "Qual o prazo de entrega?",
    answer: "O prazo médio de entrega é de 5 a 10 dias úteis, dependendo da sua localização. Após a confirmação do pagamento, seu pedido é preparado em até 24 horas.",
    sortOrder: 2
  },
  {
    id: "f3",
    category: "Pagamento",
    question: "Quais as formas de pagamento aceitas?",
    answer: "Aceitamos Pix (com 5% de desconto automático), Cartão de Crédito e Dinheiro (apenas para retiradas no local).",
    sortOrder: 3
  },
  {
    id: "f4",
    category: "Produtos",
    question: "Os laços são feitos à mão?",
    answer: "Sim! Todos os nossos produtos são 100% artesanais, feitos com fita de alta qualidade e muito carinho por nossas artesãs.",
    sortOrder: 4
  }
];
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const loginAdminFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: emailSchema,
  password: stringType().min(1).max(200)
}).parse(input)).handler(createSsrRpc("4cd1137d4a9547e649b153ae4582f66cf4b4502333e787c042bd2d77cbe36e07"));
const logoutAdminFn = createServerFn({
  method: "POST"
}).handler(createSsrRpc("8cd101c8bfdc1c73f5d751a7c552865b745589d09d322b0f09940956378255a8"));
const getAdminSessionFn = createServerFn({
  method: "GET"
}).handler(createSsrRpc("da169f2845db285175ef90650fd40bf97a73acd58c7683f00218e21c0fb36972"));
const updateAdminPasswordFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  newPassword: stringType().min(6).max(200)
}).parse(i)).handler(createSsrRpc("f0d4ba22cc43b4cf3748f32a7bc429d40a75034d0645217947d551c1f6396b95"));
const listConsignmentsFn = createServerFn({
  method: "POST"
}).handler(createSsrRpc("56f0053b0fd1a9cbe6e0b50d8437832033f8707ac0648eb9d31cf26a4b453f98"));
const createConsignmentFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  affiliate_id: stringType().uuid(),
  quantity: numberType().int().min(0).max(1e5),
  total_value: numberType().min(0).max(1e6),
  picked_up_at: stringType().datetime().optional(),
  notes: stringType().trim().max(1e3).optional()
}).parse(i)).handler(createSsrRpc("de47b526321169d7670ec9c27e4cbeb805da9f61f8f50dc452ac798f44217685"));
const createConsignmentWithNewAffiliateFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  affiliateName: stringType().trim().min(1).max(200),
  quantity: numberType().int().min(0).max(1e5),
  total_value: numberType().min(0).max(1e6),
  picked_up_at: stringType().datetime().optional(),
  notes: stringType().trim().max(1e3).optional()
}).parse(i)).handler(createSsrRpc("a5de0762612a5290d103d8cc2722d93e83ccacd25fdf9a81983f3c8488050bbc"));
const deleteConsignmentFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("61831abf388d29380b8e2c9b2d159d91f51d7f4405d094e225af5784f6128ed4"));
const WRITE_TABLES = ["customers", "products", "categories", "coupons", "affiliates", "affiliate_sales", "affiliate_consignments", "transactions", "reviews", "store_settings", "faq_items", "orders", "activity_logs", "product_waitlist"];
const adminUpsertFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(WRITE_TABLES),
  row: recordType(stringType(), anyType()),
  onConflict: stringType().optional()
}).parse(i)).handler(createSsrRpc("c76b670af0495621df1ce9096d88e3fcdb4049094b1e4b4a4c639ebbc4e2d16e"));
const adminUpdateFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(WRITE_TABLES),
  match: recordType(stringType(), anyType()),
  patch: recordType(stringType(), anyType())
}).parse(i)).handler(createSsrRpc("dec5d397510dfd42d4eba8191abaf4d96952804816e3079352354af055d153b3"));
const adminDeleteFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(WRITE_TABLES),
  match: recordType(stringType(), anyType())
}).parse(i)).handler(createSsrRpc("681c4da494dfcab2c0336b1e290da6aff240b78fc06f4f1b9f7f0e6997f91b44"));
const READ_TABLES = ["customers", "affiliates", "affiliate_sales", "affiliate_consignments", "transactions", "orders", "product_waitlist", "activity_logs"];
const adminReadTableFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(READ_TABLES),
  limit: numberType().int().min(1).max(2e3).default(1e3),
  orderBy: stringType().max(64).nullable().optional(),
  orderDir: enumType(["asc", "desc"]).default("desc")
}).parse(i)).handler(createSsrRpc("6007c43c8f3d27d336ce59ced25cf9181e9fa99c88ed9fcfadc8c352b7690370"));
const getCustomerOrdersFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  customerId: stringType().uuid().optional(),
  email: emailSchema.optional()
}).parse(i)).handler(createSsrRpc("101449e6e43aa2778ac33990b55916cad71277d2e761d7f3475cc6a185596381"));
const getAffiliateSalesFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  affiliateId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("cb9695bbfe8c9facb52acc4c57e391af26654c9ac5255d50fefef628a5b914af"));
const updateCustomerFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  customerId: stringType().uuid(),
  patch: objectType({
    name: stringType().trim().min(1).max(255).optional(),
    phone: stringType().trim().max(50).optional(),
    address: stringType().trim().max(500).nullable().optional(),
    addresses: arrayType(anyType()).optional(),
    favorites: arrayType(stringType()).optional()
  }).strict()
}).parse(i)).handler(createSsrRpc("f05367ec6ac4781a99a167046b0e5551266ead16297da18f1ebdd27da951b505"));
const getGatewayConfigFn = createServerFn({
  method: "POST"
}).handler(createSsrRpc("b88d6db9944f9ac9c1da3f54caa183718683f53d405b448ae1eab266127982e4"));
const saveGatewayConfigFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  mp_access_token: stringType().trim().max(500).default(""),
  mp_public_key: stringType().trim().max(500).default(""),
  environment: enumType(["sandbox", "production"]).default("production"),
  max_installments: numberType().int().min(1).max(12),
  installment_fees: recordType(stringType(), numberType().min(0).max(100))
}).parse(i)).handler(createSsrRpc("8ea26b377af4d41862a014aa8a8f36574a2b4a771de46093a59cbb52f0c13c31"));
const getSyncStatusFn = createServerFn({
  method: "POST"
}).handler(createSsrRpc("653b1d3b26214e4c9698b4606868138a9d3cb9f754d723ff79bf1ae1662e8bbc"));
const admin_functions = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adminDeleteFn,
  adminReadTableFn,
  adminUpdateFn,
  adminUpsertFn,
  createConsignmentFn,
  createConsignmentWithNewAffiliateFn,
  deleteConsignmentFn,
  getAdminSessionFn,
  getAffiliateSalesFn,
  getCustomerOrdersFn,
  getGatewayConfigFn,
  getSyncStatusFn,
  listConsignmentsFn,
  loginAdminFn,
  logoutAdminFn,
  saveGatewayConfigFn,
  updateAdminPasswordFn,
  updateCustomerFn
}, Symbol.toStringTag, { value: "Module" }));
const consumeResetTokenFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  token: stringType().min(8).max(200)
}).parse(input)).handler(createSsrRpc("fe3995ac40f4577ef294d2b39e9ce3c63a650a0628ddb6d656c14dfffd8346fa"));
const applyOrderStockDecrementFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  orderId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("2b97ff0ea7e04343d6546e1660ee009ead04fcb67d2354c05f80da40a4497993"));
const ORDER_STATUS_LABEL = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_separacao: "Em separação",
  saiu_para_entrega: "Aguardando retirada",
  concluido: "Concluído",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado"
};
const ORDER_STATUS_VALUES = /* @__PURE__ */ new Set([
  "aguardando_pagamento",
  "pago",
  "em_separacao",
  "saiu_para_entrega",
  "concluido",
  "cancelado",
  "reembolsado"
]);
const REMOTE_STATUS_ALIASES = {
  approved: "pago",
  paid: "pago",
  pending: "aguardando_pagamento",
  in_process: "aguardando_pagamento",
  in_mediation: "aguardando_pagamento",
  authorized: "pago",
  rejected: "cancelado",
  cancelled: "cancelado",
  canceled: "cancelado",
  expired: "cancelado",
  refunded: "reembolsado",
  charged_back: "reembolsado"
};
function normalizeOrderStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (ORDER_STATUS_VALUES.has(value)) return value;
  return REMOTE_STATUS_ALIASES[value] || "aguardando_pagamento";
}
function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABEL[normalizeOrderStatus(status)];
}
const DELIVERY_STATUS_LABEL = {
  pendente: "Pendente",
  em_separacao: "Em separação",
  saiu_para_entrega: "Aguardando retirada",
  entregue: "Entregue"
};
const DELIVERY_VALUES = /* @__PURE__ */ new Set([
  "pendente",
  "em_separacao",
  "saiu_para_entrega",
  "entregue"
]);
const DELIVERY_ALIASES = {
  concluido: "entregue",
  delivered: "entregue",
  shipped: "saiu_para_entrega",
  separacao: "em_separacao",
  preparing: "em_separacao"
};
function normalizeDeliveryStatus(status) {
  const v2 = String(status || "").trim().toLowerCase();
  if (DELIVERY_VALUES.has(v2)) return v2;
  return DELIVERY_ALIASES[v2] || "pendente";
}
const log = (label, err) => {
  if (err) console.warn(`[cloud:${label}]`, err);
};
function isAdminLogged() {
  try {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem("princesa-store-v1");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.state?.isAdmin);
  } catch {
    return false;
  }
}
async function adminUpsert(table, row, onConflict) {
  if (!isAdminLogged()) {
    throw new Error(
      "Sessão admin expirada. Faça login novamente para salvar."
    );
  }
  const r2 = await adminUpsertFn({
    data: { table, row, onConflict }
  });
  if (!r2.ok) {
    log(`upsert ${table}`, r2.message);
    throw new Error(r2.message || `Falha ao salvar em ${table}`);
  }
}
async function adminDelete(table, match) {
  if (!isAdminLogged()) return;
  try {
    const r2 = await adminDeleteFn({
      data: { table, match }
    });
    if (!r2.ok) log(`delete ${table}`, r2.message);
  } catch (e) {
    log(`delete ${table}`, e);
  }
}
async function adminPatch(table, match, patch) {
  if (!isAdminLogged()) return;
  try {
    const r2 = await adminUpdateFn({
      data: { table, match, patch }
    });
    if (!r2.ok) log(`update ${table}`, r2.message);
  } catch (e) {
    log(`update ${table}`, e);
  }
}
const toCustomer = (r2) => ({
  id: r2.id,
  name: r2.name,
  email: r2.email,
  phone: r2.phone || "",
  password: "",
  address: r2.address || void 0,
  addresses: Array.isArray(r2.addresses) ? r2.addresses : [],
  favorites: Array.isArray(r2.favorites) ? r2.favorites : [],
  createdAt: r2.created_at
});
const toCategory = (r2) => ({
  id: r2.id,
  name: r2.name,
  image: r2.image || "🎀",
  order: r2.sort_order ?? 0
});
const toProduct = (r2) => ({
  id: r2.id,
  name: r2.name,
  description: r2.description || "",
  price: Number(r2.price) || 0,
  oldPrice: r2.original_price != null ? Number(r2.original_price) : void 0,
  image: Array.isArray(r2.images) && r2.images[0] ? r2.images[0] : "",
  gallery: Array.isArray(r2.images) ? r2.images.slice(1) : [],
  category: r2.category_id || "",
  stock: r2.stock ?? 0,
  sku: r2.extra?.sku || "",
  active: r2.active !== false,
  hidden: r2.extra?.hidden || false,
  minStock: r2.extra?.minStock,
  sortOrder: r2.extra?.sortOrder,
  variations: Array.isArray(r2.variations) ? r2.variations : []
});
const toCoupon = (r2) => ({
  code: r2.code,
  type: r2.kind === "fixed" ? "fixed" : "percent",
  value: Number(r2.value) || 0,
  validUntil: r2.expires_at || "",
  maxUses: r2.extra?.maxUses ?? 999,
  usedCount: r2.extra?.usedCount ?? 0,
  minOrder: Number(r2.min_subtotal) || 0,
  active: r2.active !== false
});
const toAffiliate = (r2) => ({
  id: r2.id,
  name: r2.name,
  email: r2.email,
  password: "",
  phone: r2.phone || "",
  commissionType: r2.commission_type === "fixed" ? "fixed" : "percent",
  commissionValue: Number(r2.commission_value) || 0,
  active: r2.active !== false,
  createdAt: r2.created_at
});
const toAffiliateSale = (r2) => ({
  id: r2.id,
  affiliateId: r2.affiliate_id,
  customerName: r2.customer_name,
  customerPhone: r2.customer_phone || void 0,
  productDescription: r2.product_description,
  saleValue: Number(r2.sale_value) || 0,
  commissionEarned: Number(r2.commission_earned) || 0,
  status: r2.status || "pendente",
  notes: r2.notes || void 0,
  createdAt: r2.created_at
});
const toTransaction = (r2) => ({
  id: r2.id,
  kind: r2.kind,
  category: r2.category,
  description: r2.description,
  amount: Number(r2.amount) || 0,
  date: r2.date,
  affiliateId: r2.affiliate_id || void 0,
  productSummary: r2.product_summary || void 0,
  notes: r2.notes || void 0,
  createdAt: r2.created_at
});
const toReview = (r2) => ({
  id: r2.id,
  productId: r2.product_id,
  customerId: r2.customer_id || "",
  customerName: r2.customer_name,
  rating: r2.rating,
  comment: r2.comment || "",
  photos: Array.isArray(r2.photos) ? r2.photos : [],
  videos: Array.isArray(r2.videos) ? r2.videos : [],
  verified: !!r2.verified,
  variation: r2.variation || void 0,
  orderId: r2.order_id || void 0,
  createdAt: r2.created_at
});
const toOrder = (r2) => ({
  id: r2.id,
  customerId: "guest",
  customerName: r2.customer_name,
  customerEmail: r2.customer_email,
  customerPhone: r2.customer_phone,
  items: Array.isArray(r2.items) ? r2.items : [],
  subtotal: Number(r2.subtotal) || 0,
  discount: Number(r2.discount) || 0,
  shipping: Number(r2.shipping) || 0,
  total: Number(r2.total) || 0,
  paymentMethod: r2.payment_method,
  deliveryMethod: r2.delivery_method,
  status: normalizeOrderStatus(r2.payment_status),
  deliveryStatus: normalizeDeliveryStatus(r2.delivery_status),
  createdAt: r2.created_at,
  address: r2.address || "",
  notes: r2.notes || void 0,
  paymentStatus: r2.payment_status || void 0,
  paidAt: r2.paid_at || void 0,
  mpPaymentId: r2.mp_payment_id || void 0,
  pixExpiresAt: r2.pix_expires_at || void 0
});
const toWaitlist = (r2) => ({
  id: r2.id,
  productId: r2.product_id,
  email: r2.email,
  customerId: r2.customer_id || void 0,
  notified: r2.notified,
  createdAt: r2.created_at
});
const toFAQ = (r2) => ({
  id: r2.id,
  category: r2.category,
  question: r2.question,
  answer: r2.answer,
  sortOrder: r2.sort_order
});
const toActivityLog = (r2) => ({
  id: r2.id,
  action: r2.action,
  category: r2.category,
  description: r2.description,
  metadata: r2.metadata,
  userId: r2.user_id || void 0,
  createdAt: r2.created_at
});
const cloud = {
  async upsertCustomer(c2) {
    const row = {
      id: c2.id,
      name: c2.name,
      email: c2.email,
      phone: c2.phone,
      address: c2.address || null,
      addresses: c2.addresses || [],
      favorites: c2.favorites || []
    };
    if (isAdminLogged()) {
      await adminUpsert("customers", row, "id");
      return;
    }
    try {
      await updateCustomerFn({
        data: {
          customerId: c2.id,
          patch: {
            name: c2.name,
            phone: c2.phone,
            address: c2.address ?? null,
            addresses: c2.addresses || [],
            favorites: c2.favorites || []
          }
        }
      });
    } catch (e) {
      log("upsertCustomer", e);
    }
  },
  async deleteCustomer(id) {
    await adminDelete("customers", { id });
  },
  async upsertProduct(p2) {
    await adminUpsert(
      "products",
      {
        id: p2.id,
        name: p2.name,
        slug: p2.id,
        price: p2.price,
        original_price: p2.oldPrice ?? null,
        description: p2.description,
        images: [p2.image, ...p2.gallery || []].filter(Boolean),
        category_id: p2.category,
        stock: p2.stock,
        active: p2.active,
        featured: false,
        variations: p2.variations || [],
        extra: { sku: p2.sku, hidden: p2.hidden, minStock: p2.minStock, sortOrder: p2.sortOrder }
      },
      "id"
    );
  },
  async deleteProduct(id) {
    await adminDelete("products", { id });
  },
  async upsertCategory(c2) {
    await adminUpsert(
      "categories",
      {
        id: c2.id,
        name: c2.name,
        slug: c2.id,
        image: c2.image,
        sort_order: c2.order
      },
      "id"
    );
  },
  async deleteCategory(id) {
    await adminDelete("categories", { id });
  },
  async upsertCoupon(c2) {
    await adminUpsert(
      "coupons",
      {
        code: c2.code,
        kind: c2.type,
        value: c2.value,
        min_subtotal: c2.minOrder,
        expires_at: c2.validUntil || null,
        active: c2.active,
        extra: { maxUses: c2.maxUses, usedCount: c2.usedCount }
      },
      "code"
    );
  },
  async deleteCoupon(code) {
    await adminDelete("coupons", { code });
  },
  async upsertAffiliate(a) {
    await adminUpsert(
      "affiliates",
      {
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        commission_type: a.commissionType,
        commission_value: a.commissionValue,
        active: a.active
      },
      "id"
    );
  },
  async deleteAffiliate(id) {
    await adminDelete("affiliates", { id });
  },
  async upsertAffiliateSale(s2) {
    await adminUpsert(
      "affiliate_sales",
      {
        id: s2.id,
        affiliate_id: s2.affiliateId,
        customer_name: s2.customerName,
        customer_phone: s2.customerPhone || null,
        product_description: s2.productDescription,
        sale_value: s2.saleValue,
        commission_earned: s2.commissionEarned,
        status: s2.status,
        notes: s2.notes || null
      },
      "id"
    );
  },
  async deleteAffiliateSale(id) {
    await adminDelete("affiliate_sales", { id });
  },
  async upsertTransaction(t) {
    await adminUpsert(
      "transactions",
      {
        id: t.id,
        kind: t.kind,
        category: t.category,
        description: t.description,
        amount: t.amount,
        date: t.date,
        affiliate_id: t.affiliateId || null,
        product_summary: t.productSummary || null,
        notes: t.notes || null
      },
      "id"
    );
  },
  async deleteTransaction(id) {
    await adminDelete("transactions", { id });
  },
  async upsertReview(r2) {
    const row = {
      id: r2.id,
      product_id: r2.productId,
      customer_id: r2.customerId || null,
      customer_name: r2.customerName,
      rating: r2.rating,
      comment: r2.comment,
      photos: r2.photos || [],
      videos: r2.videos || [],
      verified: r2.verified ?? false,
      variation: r2.variation || null,
      order_id: r2.orderId || null
    };
    if (isAdminLogged()) {
      await adminUpsert("reviews", row, "id");
    } else {
      const { error } = await supabase.from("reviews").insert(row);
      log("upsertReview", error);
    }
  },
  async deleteReview(id) {
    await adminDelete("reviews", { id });
  },
  async checkReviewEligibility(customerId, productId) {
    const { data, error } = await supabase.rpc("customer_review_eligibility", {
      _customer_id: customerId,
      _product_id: productId
    });
    if (error) {
      console.warn("[cloud] eligibility", error);
      return { eligible: false, orderId: null, variation: null, alreadyReviewed: false };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      eligible: !!row?.eligible,
      orderId: row?.order_id ?? null,
      variation: row?.variation ?? null,
      alreadyReviewed: !!row?.already_reviewed
    };
  },
  async uploadReviewMedia(file, customerId) {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const rand = Math.random().toString(36).slice(2, 10);
    const path = `${customerId}/${Date.now()}_${rand}.${ext}`;
    const { error } = await supabase.storage.from("review-media").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("review-media").getPublicUrl(path);
    return data.publicUrl;
  },
  async submitVerifiedReview(input) {
    const { data, error } = await supabase.rpc("submit_verified_review", {
      _customer_id: input.customerId,
      _product_id: input.productId,
      _rating: input.rating,
      _comment: input.comment,
      _photos: input.photos,
      _videos: input.videos
    });
    if (error) return { ok: false, message: error.message || "Erro ao publicar" };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.ok) return { ok: false, message: row?.message || "Erro ao publicar" };
    const elig = await this.checkReviewEligibility(input.customerId, input.productId);
    return { ok: true, message: row.message, id: row.id, variation: elig.variation || void 0, orderId: elig.orderId || void 0 };
  },
  async upsertSettings(s2) {
    await adminUpsert("store_settings", { id: 1, data: s2 }, "id");
  },
  async updateOrderStatus(id, status) {
    await adminPatch("orders", { id }, { payment_status: status });
    if (status === "paid" || status === "approved" || status === "pago") {
      try {
        await applyOrderStockDecrementFn({ data: { orderId: id } });
      } catch (e) {
        console.warn("[cloud] stock decrement failed", e);
      }
    }
  },
  async applyOrderStockDecrement(id) {
    try {
      await applyOrderStockDecrementFn({ data: { orderId: id } });
    } catch (e) {
      console.warn("[cloud] stock decrement failed", e);
    }
  },
  async updateDeliveryStatus(id, status) {
    await adminPatch("orders", { id }, { delivery_status: status });
  },
  async deleteOrder(id) {
    await adminDelete("orders", { id });
  },
  async upsertNotificationLog(_l) {
  },
  async logActivity(data) {
    const { error } = await supabase.from("activity_logs").insert({
      action: data.action,
      category: data.category,
      description: data.description,
      metadata: data.metadata || {},
      user_id: data.userId || null
    });
    if (error && error.code !== "P0001") log("logActivity", error);
  },
  async joinWaitlist(data) {
    const { error } = await supabase.from("product_waitlist").insert({
      product_id: data.productId,
      customer_id: data.customerId || null,
      email: data.email
    });
    log("joinWaitlist", error);
  },
  async upsertFAQ(f2) {
    await adminUpsert("faq_items", {
      id: f2.id,
      category: f2.category,
      question: f2.question,
      answer: f2.answer,
      sort_order: f2.sortOrder
    });
  },
  async deleteFAQ(id) {
    await adminDelete("faq_items", { id });
  }
};
async function fetchCloudSnapshot() {
  const [cats, prods, coups, revs, settings, faq] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*"),
    supabase.from("coupons").select("*"),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    supabase.from("store_settings").select("data").eq("id", 1).maybeSingle(),
    supabase.from("faq_items").select("*").order("sort_order", { ascending: true })
  ]);
  let admin = null;
  if (isAdminLogged()) {
    try {
      const read = async (table, orderBy, orderDir = "desc", limit = 1e3) => {
        const r2 = await adminReadTableFn({
          data: { table, limit, orderBy: orderBy ?? null, orderDir }
        });
        if (!r2.ok) throw new Error(r2.message || "admin read failed");
        return r2.rows;
      };
      const [customers, affiliates, affiliateSales, affiliateConsignments, transactions, orders, waitlist, activityLogs] = await Promise.all([
        read("customers"),
        read("affiliates"),
        read("affiliate_sales", "created_at", "desc"),
        read("affiliate_consignments", "picked_up_at", "desc"),
        read("transactions", "date", "desc"),
        read("orders", "created_at", "desc", 500),
        read("product_waitlist"),
        read("activity_logs", "created_at", "desc", 200)
      ]);
      void affiliateConsignments;
      admin = { customers, affiliates, affiliateSales, transactions, orders, waitlist, activityLogs };
    } catch (e) {
      console.warn("[cloud:adminFetchAll]", e);
    }
  }
  return {
    customers: (admin?.customers || []).map(toCustomer),
    categories: (cats.data || []).map(toCategory),
    products: (prods.data || []).map(toProduct),
    coupons: (coups.data || []).map(toCoupon),
    affiliates: (admin?.affiliates || []).map(toAffiliate),
    affiliateSales: (admin?.affiliateSales || []).map(toAffiliateSale),
    transactions: (admin?.transactions || []).map(toTransaction),
    reviews: (revs.data || []).map(toReview),
    settings: settings.data?.data || null,
    orders: (admin?.orders || []).map(toOrder),
    faq: (faq.data || []).map(toFAQ),
    waitlist: (admin?.waitlist || []).map(toWaitlist),
    activityLogs: (admin?.activityLogs || []).map(toActivityLog)
  };
}
const cloud$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cloud,
  fetchCloudSnapshot
}, Symbol.toStringTag, { value: "Module" }));
function getOneSignalSDK(timeoutMs = 8e3) {
  if (typeof window === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const existing = window.OneSignal;
    if (existing && typeof existing.Notifications !== "undefined") {
      resolve(existing);
      return;
    }
    const q2 = window.OneSignalDeferred || (window.OneSignalDeferred = []);
    let resolved = false;
    q2.push((os) => {
      if (!resolved) {
        resolved = true;
        resolve(os);
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);
  });
}
const AUDIENCE_TAG = {
  cliente: "customer",
  admin: "admin",
  afiliada: "affiliate"
};
async function dispatchPush(args) {
  try {
    const payload = {
      title: args.title,
      message: args.body
    };
    if (args.externalUserIds && args.externalUserIds.length > 0) {
      payload.externalUserIds = args.externalUserIds;
    } else {
      payload.audience = AUDIENCE_TAG[args.audience];
    }
    const { data, error } = await supabase.functions.invoke("send-push", {
      body: payload
    });
    if (error) console.warn("[push] send-push erro:", error.message);
    else console.log("[push] enviado:", data);
  } catch (e) {
    console.warn("[push] falhou", e);
  }
}
const DEFAULT_TEMPLATES = [
  {
    id: "t_novo_pedido_admin",
    category: "novo_pedido_admin",
    audience: "admin",
    title: "🛍️ Novo pedido!",
    body: "{cliente} fez um pedido de {total} (#{pedido}).",
    icon: "🛍️",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true
  },
  {
    id: "t_estoque_baixo",
    category: "estoque_baixo",
    audience: "admin",
    title: "⚠️ Estoque baixo",
    body: 'O produto "{produto}" está com apenas {estoque} unidades.',
    icon: "⚠️",
    enabled: true,
    sendPush: false,
    sendEmail: false,
    sendInApp: true
  },
  {
    id: "t_afiliada_nova_venda_admin",
    category: "afiliada_nova_venda",
    audience: "admin",
    title: "💼 Venda de afiliada",
    body: "{afiliada} registrou uma venda de {total} para {cliente}.",
    icon: "💼",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true
  },
  {
    id: "t_pagamento_aprovado_admin",
    category: "pagamento_aprovado",
    audience: "admin",
    title: "Pagamento aprovado ✨",
    body: "Pagamento do pedido #{pedido} de {cliente} ({total}) foi confirmado.",
    icon: "💳",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true
  }
];
function applyVars(tpl, vars) {
  return tpl.replace(
    /\{(\w+)\}/g,
    (_2, k2) => vars[k2] !== void 0 ? String(vars[k2]) : `{${k2}}`
  );
}
const useNotifications = create()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,
      logs: [],
      pushPermission: typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
      pushEnabled: false,
      // Default to false until we know or they enable it
      updateTemplate: (id, patch) => set((s2) => ({
        templates: s2.templates.map(
          (t) => t.id === id ? { ...t, ...patch } : t
        )
      })),
      resetTemplates: () => set({ templates: DEFAULT_TEMPLATES }),
      trigger: (category, vars, opts) => {
        const tpls = get().templates.filter(
          (t) => t.category === category && t.enabled && (opts?.audience ? t.audience === opts.audience : true)
        );
        if (tpls.length === 0) return null;
        let firstLog = null;
        for (const tpl of tpls) {
          const channels = [];
          if (tpl.sendPush) channels.push("push");
          if (tpl.sendEmail) channels.push("email");
          if (tpl.sendInApp) channels.push("inapp");
          const log2 = {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            category,
            title: applyVars(tpl.title, vars),
            body: applyVars(tpl.body, vars),
            audience: tpl.audience,
            recipientId: opts?.recipientId,
            channels,
            sentAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false,
            data: vars
          };
          set((s2) => ({ logs: [log2, ...s2.logs].slice(0, 200) }));
          cloud.upsertNotificationLog(log2);
          if (tpl.sendPush) {
            void dispatchPush({
              title: log2.title,
              body: log2.body,
              audience: tpl.audience,
              externalUserIds: opts?.recipientId ? [opts.recipientId] : void 0
            });
          }
          if (!firstLog) firstLog = log2;
        }
        return firstLog;
      },
      sendManual: (data) => {
        const log2 = {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          category: "manual",
          title: data.title,
          body: data.body,
          audience: data.audience,
          channels: data.channels,
          sentAt: (/* @__PURE__ */ new Date()).toISOString(),
          read: false
        };
        set((s2) => ({ logs: [log2, ...s2.logs].slice(0, 200) }));
        cloud.upsertNotificationLog(log2);
        if (data.channels.includes("push")) {
          void dispatchPush({
            title: data.title,
            body: data.body,
            audience: data.audience
          });
        }
        return log2;
      },
      markAllRead: () => set((s2) => ({ logs: s2.logs.map((l2) => ({ ...l2, read: true })) })),
      markRead: (id) => set((s2) => ({
        logs: s2.logs.map((l2) => l2.id === id ? { ...l2, read: true } : l2)
      })),
      clearLogs: () => set({ logs: [] }),
      requestPushPermission: async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
          set({ pushPermission: "unsupported" });
          return "unsupported";
        }
        const OS = window.OneSignal;
        const sdkReady = OS && typeof OS.Notifications !== "undefined";
        try {
          if (sdkReady) {
            console.log("[push] requestPermission via OneSignal SDK");
            await OS.Notifications.requestPermission();
          } else {
            console.log("[push] requestPermission via API nativa");
            await Notification.requestPermission();
          }
        } catch (e) {
          console.warn("[push] requestPermission falhou:", e);
          try {
            await Notification.requestPermission();
          } catch {
          }
        }
        const result = Notification.permission;
        set({ pushPermission: result });
        console.log("[push] Permissão final:", result);
        if (result === "granted") {
          try {
            const sdk = sdkReady ? OS : await getOneSignalSDK(3e3);
            if (sdk?.User?.PushSubscription?.optIn) {
              await sdk.User.PushSubscription.optIn();
              console.log("[push] OneSignal optIn OK");
            }
          } catch {
          }
          set({ pushEnabled: true });
        }
        return result;
      },
      disablePush: async () => {
        if (typeof window === "undefined") return;
        try {
          const OS = window.OneSignal;
          const sdkReady = OS && typeof OS.Notifications !== "undefined";
          const sdk = sdkReady ? OS : await getOneSignalSDK(3e3);
          if (sdk?.User?.PushSubscription?.optOut) {
            await sdk.User.PushSubscription.optOut();
            console.log("[push] optOut OK");
          } else if (sdk?.setSubscription) {
            await sdk.setSubscription(false);
          }
          set({ pushEnabled: false });
        } catch (e) {
          console.warn("[push] disablePush failed", e);
        }
      }
    }),
    {
      name: "princesa-notifications-v3",
      partialize: (s2) => ({
        templates: (s2.templates ?? []).filter((t) => t.audience === "admin"),
        logs: s2.logs,
        pushEnabled: s2.pushEnabled
      }),
      migrate: (persisted) => {
        const state = persisted;
        if (!state) return persisted;
        const adminOnly = (state.templates ?? []).filter(
          (t) => t.audience === "admin"
        );
        return {
          ...state,
          templates: adminOnly.length > 0 ? adminOnly : DEFAULT_TEMPLATES
        };
      },
      version: 1
    }
  )
);
if (typeof window !== "undefined") {
  getOneSignalSDK(1e4).then((OS) => {
    if (!OS) return;
    try {
      const permission = "Notification" in window ? Notification.permission : "unsupported";
      const isOptedIn = OS?.User?.PushSubscription?.optedIn === true;
      console.log(
        "[push] Sync inicial — permission:",
        permission,
        "optedIn:",
        isOptedIn
      );
      useNotifications.setState({
        pushPermission: permission,
        pushEnabled: isOptedIn && permission === "granted"
      });
    } catch (e) {
      console.warn("[push] Sync inicial falhou:", e);
    }
  });
}
const CATEGORY_LABELS = {
  pedido_realizado: "Pedido realizado",
  pagamento_aprovado: "Pagamento aprovado",
  pedido_em_separacao: "Pedido em separação",
  pedido_enviado: "Pedido enviado",
  pedido_entregue: "Pedido entregue",
  pedido_cancelado: "Pedido cancelado",
  novo_pedido_admin: "Novo pedido (admin)",
  afiliada_nova_venda: "Venda de afiliada (admin)",
  afiliada_venda_confirmada: "Comissão de afiliada confirmada",
  promo: "Promoção / novidade",
  carrinho_abandonado: "Carrinho abandonado",
  estoque_baixo: "Estoque baixo",
  manual: "Manual"
};
const AUDIENCE_LABELS = {
  cliente: "Cliente",
  admin: "Admin",
  afiliada: "Afiliada"
};
let ctx = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}
function tone(freq, duration = 0.12, when = 0, type = "sine", gain = 0.18) {
  const c2 = getCtx();
  if (!c2) return;
  const t = c2.currentTime + when;
  const osc = c2.createOscillator();
  const g2 = c2.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(gain, t + 0.01);
  g2.gain.exponentialRampToValueAtTime(1e-4, t + duration);
  osc.connect(g2).connect(c2.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}
function playAdminNotificationBlip() {
  const c2 = getCtx();
  if (!c2) return;
  const fire = () => {
    tone(880, 0.07, 0, "sine", 0.42);
    tone(1175, 0.09, 0.06, "sine", 0.38);
  };
  if (c2.state === "suspended") {
    c2.resume().then(fire).catch(fire);
  } else {
    fire();
  }
}
function playBeep() {
  const c2 = getCtx();
  if (!c2) return;
  const fire = () => {
    tone(880, 0.12, 0, "square", 0.35);
    tone(1320, 0.18, 0.11, "square", 0.35);
  };
  if (c2.state === "suspended") {
    c2.resume().then(fire).catch(fire);
  } else {
    fire();
  }
}
if (typeof window !== "undefined") {
  const prime = () => {
    const c2 = getCtx();
    if (c2 && c2.state === "suspended") c2.resume().catch(() => {
    });
  };
  window.addEventListener("pointerdown", prime, { once: false, passive: true });
  window.addEventListener("touchstart", prime, { once: false, passive: true });
  window.addEventListener("keydown", prime, { once: false, passive: true });
}
let seeded = false;
function resetAdminOrderAlert() {
  seeded = false;
}
function detectAndAlertNewOrders(previous, next, isAdmin) {
  if (!isAdmin) return;
  if (!seeded) {
    seeded = true;
    return;
  }
  const prevIds = new Set(previous.map((o) => o.id));
  const added = next.filter((o) => !prevIds.has(o.id));
  if (added.length > 0) {
    playAdminNotificationBlip();
  }
}
const brlFmt = (v2) => v2.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const defaultSettings = {
  storeName: "Princesa de Laços",
  whatsapp: "(11) 99999-9999",
  address: "Rua Jaime Locatelli — Bairro Farroupilha",
  instagram: "@princesadelacos",
  facebook: "/princesadelacos",
  shippingFee: 12.9,
  acceptCash: true,
  acceptCard: true,
  acceptPix: true,
  bannerTitle: "Coleção Encantada 2026",
  bannerSubtitle: "Laços feitos com amor para princesas de todas as idades"
};
const SESSION_TTL_MS = 1e3 * 60 * 60 * 24 * 30;
const SESSION_REFRESH_THRESHOLD_MS = 1e3 * 60 * 60 * 24;
function makeSession(subjectId) {
  const now = Date.now();
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return {
    token: `${subjectId}.${rand}`,
    subjectId,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
  };
}
function isSessionValid(s2) {
  if (!s2) return false;
  return new Date(s2.expiresAt).getTime() > Date.now();
}
const useStore = create()(
  persist(
    (set, get) => ({
      products: initialProducts,
      categories: initialCategories,
      coupons: initialCoupons,
      cart: [],
      orders: [],
      customers: [],
      currentCustomerId: null,
      isAdmin: false,
      settings: defaultSettings,
      appliedCoupon: null,
      affiliates: [],
      affiliateSales: [],
      currentAffiliateId: null,
      transactions: [],
      adminPasswordOverride: {},
      adminToken: null,
      reviews: [],
      faq: initialFAQ,
      waitlist: [],
      activityLogs: [],
      referralId: null,
      sessions: { admin: null, customer: null, affiliate: null },
      setReferralId: (id) => set({ referralId: id }),
      refreshSession: (kind) => {
        const sess = get().sessions[kind];
        if (!isSessionValid(sess)) return;
        const remaining = new Date(sess.expiresAt).getTime() - Date.now();
        if (SESSION_TTL_MS - remaining < SESSION_REFRESH_THRESHOLD_MS) return;
        const next = {
          ...sess,
          expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
        };
        set((s2) => ({ sessions: { ...s2.sessions, [kind]: next } }));
      },
      findAccountByEmail: (email) => {
        const e = email.trim().toLowerCase();
        if (!e) return null;
        const ADMIN_EMAILS = ["lucaspereirabn10@gmail.com"];
        if (ADMIN_EMAILS.includes(e)) return { kind: "admin", email: e };
        const aff = get().affiliates.find((a) => a.email.toLowerCase() === e);
        if (aff)
          return { kind: "affiliate", email: aff.email, phone: aff.phone };
        const cust = get().customers.find((c2) => c2.email.toLowerCase() === e);
        if (cust)
          return { kind: "customer", email: cust.email, phone: cust.phone };
        return null;
      },
      resetPasswordFor: (kind, email, newPassword) => {
        const e = email.trim().toLowerCase();
        if (!newPassword || newPassword.length < 4)
          return { ok: false, message: "Senha muito curta (mín. 4)" };
        if (kind === "admin") {
          set((s2) => ({
            adminPasswordOverride: {
              ...s2.adminPasswordOverride,
              [e]: newPassword
            }
          }));
          return { ok: true, message: "Senha redefinida com sucesso" };
        }
        if (kind === "affiliate") {
          const exists2 = get().affiliates.find(
            (a) => a.email.toLowerCase() === e
          );
          if (!exists2)
            return {
              ok: false,
              message: "Conta não encontrada neste dispositivo"
            };
          set((s2) => ({
            affiliates: s2.affiliates.map(
              (a) => a.email.toLowerCase() === e ? { ...a, password: newPassword } : a
            )
          }));
          return { ok: true, message: "Senha redefinida com sucesso" };
        }
        const exists = get().customers.find((c2) => c2.email.toLowerCase() === e);
        if (!exists)
          return {
            ok: false,
            message: "Conta não encontrada neste dispositivo"
          };
        set((s2) => ({
          customers: s2.customers.map(
            (c2) => c2.email.toLowerCase() === e ? { ...c2, password: newPassword } : c2
          )
        }));
        return { ok: true, message: "Senha redefinida com sucesso" };
      },
      addTransaction: (t) => {
        const tx = {
          ...t,
          id: `tx_${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        set((s2) => ({ transactions: [tx, ...s2.transactions] }));
        cloud.upsertTransaction(tx);
        return tx;
      },
      updateTransaction: (id, patch) => {
        set((s2) => ({
          transactions: s2.transactions.map(
            (t) => t.id === id ? { ...t, ...patch } : t
          )
        }));
        const tx = get().transactions.find((t) => t.id === id);
        if (tx) cloud.upsertTransaction(tx);
      },
      deleteTransaction: (id) => {
        set((s2) => ({
          transactions: s2.transactions.filter((t) => t.id !== id)
        }));
        cloud.deleteTransaction(id);
      },
      addReview: async (data) => {
        const state = get();
        const customer = state.customers.find(
          (c2) => c2.id === state.currentCustomerId
        );
        if (!customer) return { ok: false, message: "Faça login para avaliar" };
        if (!data.rating || data.rating < 1 || data.rating > 5)
          return { ok: false, message: "Selecione uma nota" };
        if (!data.comment.trim() && data.photos.length === 0 && data.videos.length === 0)
          return { ok: false, message: "Escreva um comentário ou envie mídia" };
        const res = await cloud.submitVerifiedReview({
          customerId: customer.id,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment.trim(),
          photos: data.photos,
          videos: data.videos
        });
        if (!res.ok) return { ok: false, message: res.message };
        const review = {
          id: res.id || `rev_${Date.now()}`,
          productId: data.productId,
          customerId: customer.id,
          customerName: customer.name,
          rating: data.rating,
          comment: data.comment.trim(),
          photos: data.photos,
          videos: data.videos,
          verified: true,
          variation: res.variation,
          orderId: res.orderId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        set((s2) => ({ reviews: [review, ...s2.reviews] }));
        return { ok: true, message: "Avaliação publicada!" };
      },
      deleteReview: (id) => {
        set((s2) => ({
          reviews: s2.reviews.filter((r2) => {
            if (r2.id !== id) return true;
            return !(s2.isAdmin || r2.customerId === s2.currentCustomerId);
          })
        }));
        cloud.deleteReview(id);
      },
      joinWaitlist: (productId, email) => {
        const state = get();
        const customerId = state.currentCustomerId || void 0;
        const entry = {
          id: `wait_${Date.now()}`,
          productId,
          email,
          customerId,
          notified: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        set((s2) => ({ waitlist: [entry, ...s2.waitlist] }));
        cloud.joinWaitlist({ productId, email, customerId });
        return {
          ok: true,
          message: "Você será avisada assim que o estoque chegar! ✨"
        };
      },
      upsertFAQ: (f2) => {
        set((s2) => ({
          faq: s2.faq.find((x2) => x2.id === f2.id) ? s2.faq.map((x2) => x2.id === f2.id ? f2 : x2) : [...s2.faq, f2].sort((a, b2) => a.sortOrder - b2.sortOrder)
        }));
        cloud.upsertFAQ(f2);
      },
      deleteFAQ: (id) => {
        set((s2) => ({ faq: s2.faq.filter((f2) => f2.id !== id) }));
        cloud.deleteFAQ(id);
      },
      addToCart: (productId, quantity = 1, variation) => set((s2) => {
        const existing = s2.cart.find(
          (i) => i.productId === productId && i.variation === variation
        );
        if (existing) {
          return {
            cart: s2.cart.map(
              (i) => i === existing ? { ...i, quantity: i.quantity + quantity } : i
            )
          };
        }
        return { cart: [...s2.cart, { productId, quantity, variation }] };
      }),
      removeFromCart: (productId) => set((s2) => ({ cart: s2.cart.filter((i) => i.productId !== productId) })),
      updateCartQty: (productId, qty) => set((s2) => ({
        cart: qty <= 0 ? s2.cart.filter((i) => i.productId !== productId) : s2.cart.map(
          (i) => i.productId === productId ? { ...i, quantity: qty } : i
        )
      })),
      clearCart: () => set({ cart: [], appliedCoupon: null }),
      applyCoupon: (code) => {
        const c2 = get().coupons.find(
          (x2) => x2.code.toUpperCase() === code.toUpperCase() && x2.active
        );
        if (!c2) return { ok: false, message: "Cupom inválido" };
        const subtotal = computeSubtotal(get());
        if (subtotal < c2.minOrder)
          return {
            ok: false,
            message: `Pedido mínimo R$ ${c2.minOrder.toFixed(2)}`
          };
        if (c2.usedCount >= c2.maxUses)
          return { ok: false, message: "Cupom esgotado" };
        set({ appliedCoupon: c2.code });
        return { ok: true, message: "Cupom aplicado!" };
      },
      removeCoupon: () => set({ appliedCoupon: null }),
      registerCustomer: async (c2) => {
        const { registerCustomerFn } = await import("./auth.functions-Vm3Dt-as.js");
        const res = await registerCustomerFn({
          data: {
            name: c2.name,
            email: c2.email,
            phone: c2.phone || "",
            password: c2.password,
            address: c2.address
          }
        });
        if (!res.ok) return { ok: false, message: res.message };
        const newC = {
          ...res.customer,
          password: "",
          address: res.customer.address ?? void 0
        };
        set((s2) => ({
          customers: [...s2.customers.filter((x2) => x2.id !== newC.id), newC],
          currentCustomerId: newC.id,
          sessions: { ...s2.sessions, customer: makeSession(newC.id) }
        }));
        Promise.resolve().then(() => emails).then(
          (m2) => m2.sendWelcomeEmail({ email: newC.email, name: newC.name })
        ).catch(() => {
        });
        return { ok: true, message: res.message };
      },
      loginCustomer: async (email, password) => {
        const { loginCustomerFn } = await import("./auth.functions-Vm3Dt-as.js");
        const res = await loginCustomerFn({ data: { email, password } });
        if (!res.ok) return { ok: false, message: res.message };
        const c2 = {
          id: res.customer.id,
          name: res.customer.name,
          email: res.customer.email,
          phone: res.customer.phone,
          password: "",
          address: res.customer.address ?? void 0,
          addresses: res.customer.addresses || [],
          favorites: res.customer.favorites || [],
          createdAt: res.customer.createdAt
        };
        set((s2) => {
          const email2 = (c2.email || "").trim().toLowerCase();
          const reattachedOrders = s2.orders.map(
            (o) => o.customerId !== c2.id && email2 && (o.customerEmail || "").trim().toLowerCase() === email2 ? { ...o, customerId: c2.id } : o
          );
          return {
            customers: [...s2.customers.filter((x2) => x2.id !== c2.id), c2],
            currentCustomerId: c2.id,
            sessions: { ...s2.sessions, customer: makeSession(c2.id) },
            orders: reattachedOrders
          };
        });
        cloud.logActivity({
          action: "login",
          category: "auth",
          description: `Cliente logou: ${c2.name}`,
          userId: c2.id
        });
        return { ok: true, message: res.message };
      },
      logoutCustomer: () => set((s2) => ({
        currentCustomerId: null,
        sessions: { ...s2.sessions, customer: null }
      })),
      updateCustomer: async (data) => {
        const id = get().currentCustomerId;
        if (!id) return { ok: false, message: "Não autenticada" };
        const { password, ...rest } = data;
        set((s2) => ({
          customers: s2.customers.map(
            (c22) => c22.id === id ? { ...c22, ...rest } : c22
          )
        }));
        const c2 = get().customers.find((x2) => x2.id === id);
        if (c2) cloud.upsertCustomer(c2);
        if (password && password.length >= 4) {
          const { updateCustomerPasswordFn } = await import("./auth.functions-Vm3Dt-as.js");
          const r2 = await updateCustomerPasswordFn({
            data: { customerId: id, newPassword: password }
          });
          if (!r2.ok) return { ok: false, message: r2.message };
        }
        return { ok: true, message: "Dados atualizados" };
      },
      addAddress: (address) => {
        const id = get().currentCustomerId;
        if (!id || !address.trim()) return;
        set((s2) => ({
          customers: s2.customers.map(
            (c22) => c22.id === id ? { ...c22, addresses: [...c22.addresses || [], address.trim()] } : c22
          )
        }));
        const c2 = get().customers.find((x2) => x2.id === id);
        if (c2) cloud.upsertCustomer(c2);
      },
      removeAddress: (index) => {
        const id = get().currentCustomerId;
        if (!id) return;
        set((s2) => ({
          customers: s2.customers.map(
            (c22) => c22.id === id ? {
              ...c22,
              addresses: (c22.addresses || []).filter((_2, i) => i !== index)
            } : c22
          )
        }));
        const c2 = get().customers.find((x2) => x2.id === id);
        if (c2) cloud.upsertCustomer(c2);
      },
      toggleFavorite: (productId) => {
        const id = get().currentCustomerId;
        if (!id) return;
        set((s2) => ({
          customers: s2.customers.map((c22) => {
            if (c22.id !== id) return c22;
            const favs = c22.favorites || [];
            return {
              ...c22,
              favorites: favs.includes(productId) ? favs.filter((p2) => p2 !== productId) : [...favs, productId]
            };
          })
        }));
        const c2 = get().customers.find((x2) => x2.id === id);
        if (c2) cloud.upsertCustomer(c2);
      },
      loginAdmin: async (email, password) => {
        const normalized = email.trim().toLowerCase();
        try {
          const { loginAdminFn: loginAdminFn2 } = await Promise.resolve().then(() => admin_functions);
          const res = await loginAdminFn2({
            data: { email: normalized, password }
          });
          if (!res.ok) return { ok: false, message: res.message };
          set((s2) => ({
            isAdmin: true,
            adminToken: null,
            // cookie httpOnly — token nunca toca o JS
            sessions: { ...s2.sessions, admin: makeSession(normalized) }
          }));
          cloud.logActivity({
            action: "admin_login",
            category: "auth",
            description: `Admin logou: ${normalized}`
          });
          return { ok: true, message: res.message || "Bem-vindo!" };
        } catch (e) {
          return { ok: false, message: e?.message || "Erro de conexão" };
        }
      },
      logoutAdmin: () => {
        resetAdminOrderAlert();
        Promise.resolve().then(() => admin_functions).then(
          ({ logoutAdminFn: logoutAdminFn2 }) => logoutAdminFn2().catch(() => {
          })
        );
        set((s2) => ({
          isAdmin: false,
          adminToken: null,
          sessions: { ...s2.sessions, admin: null }
        }));
      },
      loginAffiliate: async (email, password) => {
        const { loginAffiliateFn } = await import("./auth.functions-Vm3Dt-as.js");
        const res = await loginAffiliateFn({ data: { email, password } });
        if (!res.ok) return { ok: false, message: res.message };
        const a = { ...res.affiliate, password: "" };
        set((s2) => ({
          affiliates: [...s2.affiliates.filter((x2) => x2.id !== a.id), a],
          currentAffiliateId: a.id,
          sessions: { ...s2.sessions, affiliate: makeSession(a.id) }
        }));
        cloud.logActivity({
          action: "affiliate_login",
          category: "auth",
          description: `Afiliada logou: ${a.name}`,
          userId: a.id
        });
        return { ok: true, message: res.message };
      },
      logoutAffiliate: () => set((s2) => ({
        currentAffiliateId: null,
        sessions: { ...s2.sessions, affiliate: null }
      })),
      registerAffiliate: async (data) => {
        const name = data.name.trim();
        const email = data.email.trim().toLowerCase();
        if (!name || !email || !data.password)
          return { ok: false, message: "Preencha todos os campos" };
        if (data.password.length < 4)
          return { ok: false, message: "Senha muito curta" };
        const { registerAffiliateFn } = await import("./auth.functions-Vm3Dt-as.js");
        const res = await registerAffiliateFn({
          data: { name, email, password: data.password, phone: data.phone.trim() }
        });
        if (!res.ok) return { ok: false, message: res.message };
        const newA = { ...res.affiliate, password: "" };
        set((s2) => ({
          affiliates: [...s2.affiliates.filter((x2) => x2.id !== newA.id), newA],
          currentAffiliateId: newA.id,
          sessions: { ...s2.sessions, affiliate: makeSession(newA.id) }
        }));
        return { ok: true, message: res.message };
      },
      upsertAffiliate: (a) => {
        set((s2) => ({
          affiliates: s2.affiliates.find((x2) => x2.id === a.id) ? s2.affiliates.map((x2) => x2.id === a.id ? a : x2) : [...s2.affiliates, a]
        }));
        cloud.upsertAffiliate(a);
      },
      deleteAffiliate: (id) => {
        set((s2) => ({
          affiliates: s2.affiliates.filter((a) => a.id !== id),
          affiliateSales: s2.affiliateSales.filter((v2) => v2.affiliateId !== id)
        }));
        cloud.deleteAffiliate(id);
      },
      registerAffiliateSale: (data) => {
        const aff = get().affiliates.find((a) => a.id === data.affiliateId);
        if (!aff) return null;
        const commission = typeof data.commissionOverride === "number" ? data.commissionOverride : aff.commissionType === "percent" ? data.saleValue * aff.commissionValue / 100 : aff.commissionValue;
        const sale = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `vaf_${Date.now()}`,
          affiliateId: data.affiliateId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          productDescription: data.productDescription,
          saleValue: data.saleValue,
          commissionEarned: Math.round(commission * 100) / 100,
          status: data.status || "pendente",
          notes: data.notes,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        set((s2) => ({ affiliateSales: [sale, ...s2.affiliateSales] }));
        cloud.upsertAffiliateSale(sale);
        if (sale.status === "confirmada") {
          const tx = {
            id: `tx_aff_${sale.id}`,
            kind: "entrada",
            category: "venda",
            description: `Venda Afiliada: ${aff.name} — ${data.customerName}`,
            amount: data.saleValue,
            date: sale.createdAt,
            productSummary: data.productDescription,
            createdAt: sale.createdAt
          };
          set((s2) => ({ transactions: [tx, ...s2.transactions] }));
          cloud.upsertTransaction(tx);
        }
        try {
          useNotifications.getState().trigger(
            "afiliada_nova_venda",
            {
              afiliada: aff.name,
              cliente: data.customerName,
              total: brlFmt(data.saleValue)
            },
            { audience: "admin" }
          );
        } catch {
        }
        return sale;
      },
      updateAffiliateSaleStatus: (id, status) => {
        const sale = get().affiliateSales.find((v2) => v2.id === id);
        set((s2) => ({
          affiliateSales: s2.affiliateSales.map(
            (v2) => v2.id === id ? { ...v2, status } : v2
          )
        }));
        const updated = get().affiliateSales.find((v2) => v2.id === id);
        if (updated) cloud.upsertAffiliateSale(updated);
        if (sale && status === "confirmada") {
          const aff = get().affiliates.find((a) => a.id === sale.affiliateId);
          try {
            useNotifications.getState().trigger(
              "afiliada_venda_confirmada",
              {
                cliente: sale.customerName,
                comissao: brlFmt(sale.commissionEarned)
              },
              { audience: "afiliada", recipientId: aff?.id }
            );
          } catch {
          }
        }
      },
      deleteAffiliateSale: (id) => {
        set((s2) => ({
          affiliateSales: s2.affiliateSales.filter((v2) => v2.id !== id)
        }));
        cloud.deleteAffiliateSale(id);
      },
      placeOrder: (data) => {
        const state = get();
        const items2 = state.cart.map((ci) => {
          const p2 = state.products.find((x2) => x2.id === ci.productId);
          return {
            productId: p2.id,
            name: p2.name,
            price: p2.price,
            quantity: ci.quantity,
            image: p2.image,
            variation: ci.variation
          };
        });
        const subtotal = items2.reduce((a, b2) => a + b2.price * b2.quantity, 0);
        const coupon = state.coupons.find(
          (c2) => c2.code === state.appliedCoupon
        );
        const discount = coupon ? coupon.type === "percent" ? subtotal * coupon.value / 100 : coupon.value : 0;
        const shipping = 0;
        const total = Math.max(0, subtotal - discount) + shipping;
        const order = {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `PED${Date.now().toString().slice(-6)}`,
          customerId: state.currentCustomerId || "guest",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: items2,
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          status: data.paymentMethod === "cash" ? "aguardando_pagamento" : "pago",
          deliveryStatus: "pendente",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          address: data.deliveryMethod === "retirada" ? state.settings.address : data.address,
          couponCode: state.appliedCoupon || void 0,
          notes: data.notes?.trim() || void 0
        };
        if (state.referralId) {
          get().registerAffiliateSale({
            affiliateId: state.referralId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            productDescription: items2.map((i) => `${i.quantity}x ${i.name}`).join(", "),
            saleValue: total,
            status: order.status === "pago" ? "confirmada" : "pendente"
          });
        }
        set((s2) => ({
          orders: [order, ...s2.orders],
          cart: [],
          appliedCoupon: null,
          coupons: coupon ? s2.coupons.map(
            (c2) => c2.code === coupon.code ? { ...c2, usedCount: c2.usedCount + 1 } : c2
          ) : s2.coupons,
          products: s2.products.map((p2) => {
            const it = items2.find((i) => i.productId === p2.id);
            return it ? { ...p2, stock: Math.max(0, p2.stock - it.quantity) } : p2;
          })
        }));
        cloud.logActivity({
          action: "order_placed",
          category: "order",
          description: `Novo pedido ${order.id} de ${order.customerName}`,
          metadata: { total: order.total, items: order.items.length }
        });
        try {
          const notif = useNotifications.getState();
          notif.trigger(
            "novo_pedido_admin",
            {
              cliente: order.customerName,
              pedido: order.id,
              total: brlFmt(order.total)
            },
            { audience: "admin" }
          );
          if (order.status === "pago") {
            notif.trigger(
              "pagamento_aprovado",
              {
                cliente: order.customerName,
                pedido: order.id,
                total: brlFmt(order.total)
              },
              { audience: "admin" }
              // Alterado de cliente para admin
            );
            Promise.resolve().then(() => emails).then(
              (m2) => m2.sendOrderConfirmationEmail({
                email: order.customerEmail,
                customerName: order.customerName,
                orderId: order.id,
                items: order.items.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price
                })),
                total: order.total,
                paymentMethod: order.paymentMethod
              })
            ).catch(() => {
            });
            cloud.applyOrderStockDecrement(order.id).catch(() => {
            });
          }
          get().products.forEach((p2) => {
            if (items2.find((i) => i.productId === p2.id) && p2.stock > 0 && p2.stock <= 3) {
              notif.trigger(
                "estoque_baixo",
                { produto: p2.name, estoque: p2.stock },
                { audience: "admin" }
              );
            }
          });
        } catch {
        }
        return order;
      },
      saveRemoteOrder: (data) => {
        const state = get();
        if (state.orders.some((o) => o.id === data.id)) return;
        const order = {
          id: data.id,
          customerId: state.currentCustomerId || "guest",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          shipping: data.shipping,
          total: data.total,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          status: normalizeOrderStatus(data.status),
          deliveryStatus: "pendente",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          address: data.address,
          notes: data.notes,
          mpPaymentId: data.mpPaymentId,
          paidAt: data.paidAt
        };
        set((s2) => ({ orders: [order, ...s2.orders] }));
      },
      updateOrderStatus: (id, status) => {
        const nextStatus = normalizeOrderStatus(status);
        const order = get().orders.find((o) => o.id === id);
        set((s2) => ({
          orders: s2.orders.map(
            (o) => o.id === id ? { ...o, status: nextStatus } : o
          )
        }));
        if (!order) return;
        cloud.updateOrderStatus(id, nextStatus === "pago" ? "paid" : nextStatus);
        if (nextStatus === "pago") {
          try {
            useNotifications.getState().trigger(
              "pagamento_aprovado",
              {
                cliente: order.customerName,
                pedido: order.id,
                total: brlFmt(order.total)
              },
              { audience: "admin" }
              // Sempre para o admin
            );
          } catch {
          }
        }
        if (nextStatus === "pago") {
          const exists = get().transactions.find(
            (t) => t.description.includes(order.id) && t.category === "venda"
          );
          if (!exists) {
            const tx = {
              id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}`,
              kind: "entrada",
              category: "venda",
              description: `Pedido ${order.id} — ${order.customerName}`,
              amount: order.total,
              date: (/* @__PURE__ */ new Date()).toISOString(),
              productSummary: order.items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            set((s2) => ({ transactions: [tx, ...s2.transactions] }));
            cloud.upsertTransaction(tx);
          }
          Promise.resolve().then(() => emails).then(
            (m2) => m2.sendOrderConfirmationEmail({
              email: order.customerEmail,
              customerName: order.customerName,
              orderId: order.id,
              items: order.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
              })),
              total: order.total,
              paymentMethod: order.paymentMethod
            })
          ).catch(() => {
          });
        }
      },
      updateDeliveryStatus: (id, status) => {
        set((s2) => ({
          orders: s2.orders.map(
            (o) => o.id === id ? { ...o, deliveryStatus: status } : o
          )
        }));
        cloud.updateDeliveryStatus(id, status);
      },
      deleteOrder: (id) => {
        set((s2) => ({ orders: s2.orders.filter((o) => o.id !== id) }));
        cloud.deleteOrder(id);
      },
      upsertProduct: async (p2) => {
        await cloud.upsertProduct(p2);
        set((s2) => ({
          products: s2.products.find((x2) => x2.id === p2.id) ? s2.products.map((x2) => x2.id === p2.id ? p2 : x2) : [...s2.products, p2]
        }));
      },
      deleteProduct: (id) => {
        set((s2) => ({ products: s2.products.filter((p2) => p2.id !== id) }));
        cloud.deleteProduct(id);
      },
      upsertCategory: (c2) => {
        set((s2) => ({
          categories: s2.categories.find((x2) => x2.id === c2.id) ? s2.categories.map((x2) => x2.id === c2.id ? c2 : x2) : [...s2.categories, c2]
        }));
        cloud.upsertCategory(c2);
      },
      deleteCategory: (id) => {
        set((s2) => ({ categories: s2.categories.filter((c2) => c2.id !== id) }));
        cloud.deleteCategory(id);
      },
      upsertCoupon: (c2) => {
        set((s2) => ({
          coupons: s2.coupons.find((x2) => x2.code === c2.code) ? s2.coupons.map((x2) => x2.code === c2.code ? c2 : x2) : [...s2.coupons, c2]
        }));
        cloud.upsertCoupon(c2);
      },
      deleteCoupon: (code) => {
        set((s2) => ({ coupons: s2.coupons.filter((c2) => c2.code !== code) }));
        cloud.deleteCoupon(code);
      },
      updateSettings: (s2) => {
        set((s3) => ({ settings: { ...s3.settings, ...s2 } }));
        cloud.upsertSettings(get().settings);
      },
      sync: async () => {
        const snap = await fetchCloudSnapshot();
        const cur = get();
        detectAndAlertNewOrders(cur.orders, snap.orders, cur.isAdmin);
        const mergedProducts = cur.products.map((p2) => {
          const remote = snap.products.find((rp) => rp.id === p2.id);
          if (!remote) return p2;
          const localIsIllustration = p2.image?.startsWith("/products/");
          const remoteIsRealImage = remote.image?.startsWith("http");
          return {
            ...remote,
            image: localIsIllustration && !remoteIsRealImage ? p2.image : remote.image || p2.image,
            gallery: localIsIllustration && !remoteIsRealImage ? p2.gallery : remote.gallery && remote.gallery.length > 0 ? remote.gallery : p2.gallery
          };
        });
        set((s2) => ({
          customers: snap.customers,
          products: mergedProducts,
          categories: snap.categories,
          coupons: snap.coupons,
          affiliates: snap.affiliates,
          affiliateSales: snap.affiliateSales,
          transactions: snap.transactions,
          reviews: snap.reviews,
          orders: snap.orders,
          faq: snap.faq,
          waitlist: snap.waitlist,
          activityLogs: snap.activityLogs,
          settings: snap.settings ? { ...s2.settings, ...snap.settings } : s2.settings
        }));
      }
    }),
    {
      name: "princesa-store-v1",
      version: 10,
      skipHydration: typeof window === "undefined",
      migrate: (persistedState, version) => {
        const persisted = persistedState;
        if (!persisted) return persisted;
        if (version < 2) {
          persisted.products = initialProducts;
          persisted.categories = initialCategories;
        }
        if (version < 3) {
          persisted.sessions = { admin: null, customer: null, affiliate: null };
        }
        if (version < 4) {
          persisted.adminPasswordOverride = {};
        }
        if (version < 5) {
          persisted.reviews = [];
        }
        if (version < 10) {
          persisted.products = initialProducts;
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const sessions = state.sessions || {
          admin: null,
          customer: null,
          affiliate: null
        };
        const patch = {};
        const nextSessions = { ...sessions };
        if (!isSessionValid(sessions.admin) && state.isAdmin) {
          patch.isAdmin = false;
          patch.adminToken = null;
          nextSessions.admin = null;
        }
        useStore.setState({ ...patch, sessions: nextSessions });
        if (typeof window !== "undefined") {
          Promise.resolve().then(() => admin_functions).then(
            ({ getAdminSessionFn: getAdminSessionFn2 }) => getAdminSessionFn2().then((r2) => {
              const serverHasAdmin = Boolean(r2?.email);
              const localSaysAdmin = useStore.getState().isAdmin;
              if (localSaysAdmin && !serverHasAdmin) {
                useStore.setState({
                  isAdmin: false,
                  adminToken: null,
                  sessions: {
                    ...useStore.getState().sessions,
                    admin: null
                  }
                });
              }
            }).catch(() => {
            })
          );
        }
      }
    }
  )
);
function useStoreHydrated() {
  const [hydrated, setHydrated] = reactExports.useState(
    () => typeof window !== "undefined" && useStore.persist.hasHydrated()
  );
  reactExports.useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    let active = true;
    const markHydrated = () => {
      if (active) setHydrated(true);
    };
    const unsub = useStore.persist.onFinishHydration(markHydrated);
    Promise.resolve(useStore.persist.rehydrate()).then(markHydrated);
    return () => {
      active = false;
      unsub();
    };
  }, []);
  return hydrated;
}
let _hydratingFromCloud = null;
function hydrateFromCloud() {
  if (typeof window === "undefined") return Promise.resolve();
  if (_hydratingFromCloud) return _hydratingFromCloud;
  _hydratingFromCloud = (async () => {
    try {
      const snap = await fetchCloudSnapshot();
      const cur = useStore.getState();
      const mergeById = (local, remote) => {
        const map = /* @__PURE__ */ new Map();
        local.forEach((x2) => map.set(x2.id, x2));
        remote.forEach((x2) => {
          const loc = map.get(x2.id);
          if (loc) {
            const localIsIllustration = loc.image?.startsWith(
              "/products/"
            );
            const remoteIsRealImage = x2.image?.startsWith("http");
            if (localIsIllustration && !remoteIsRealImage) {
              x2.image = loc.image;
              x2.gallery = loc.gallery;
            } else {
              const isPlaceholder = (url) => !url || url === "" || url === "null" || !url.startsWith("http") && !url.startsWith("/") && !url.startsWith("data:");
              if (isPlaceholder(x2.image)) {
                x2.image = loc.image;
              }
              if (!x2.gallery || x2.gallery.length === 0 || isPlaceholder(x2.gallery[0])) {
                x2.gallery = loc.gallery;
              }
            }
          }
          map.set(x2.id, x2);
        });
        return Array.from(map.values());
      };
      const mergeByCode = (local, remote) => {
        const map = /* @__PURE__ */ new Map();
        local.forEach((x2) => map.set(x2.code, x2));
        remote.forEach((x2) => map.set(x2.code, x2));
        return Array.from(map.values());
      };
      useStore.setState({
        customers: mergeById(cur.customers, snap.customers),
        products: snap.products.length ? mergeById(cur.products, snap.products) : cur.products,
        categories: snap.categories.length ? mergeById(cur.categories, snap.categories) : cur.categories,
        coupons: snap.coupons.length ? mergeByCode(cur.coupons, snap.coupons) : cur.coupons,
        affiliates: mergeById(cur.affiliates, snap.affiliates),
        affiliateSales: mergeById(cur.affiliateSales, snap.affiliateSales),
        transactions: mergeById(cur.transactions, snap.transactions),
        reviews: mergeById(cur.reviews, snap.reviews),
        orders: mergeById(cur.orders, snap.orders),
        faq: mergeById(cur.faq, snap.faq),
        waitlist: mergeById(cur.waitlist, snap.waitlist),
        activityLogs: mergeById(cur.activityLogs, snap.activityLogs),
        settings: snap.settings ? { ...cur.settings, ...snap.settings } : cur.settings
      });
      const pushed = "cloud_initial_push_v1";
      if (!localStorage.getItem(pushed)) {
        cur.customers.filter((c2) => !snap.customers.find((x2) => x2.id === c2.id)).forEach((c2) => cloud.upsertCustomer(c2));
        cur.products.filter((p2) => !snap.products.find((x2) => x2.id === p2.id)).forEach((p2) => cloud.upsertProduct(p2));
        cur.categories.filter((c2) => !snap.categories.find((x2) => x2.id === c2.id)).forEach((c2) => cloud.upsertCategory(c2));
        cur.coupons.filter((c2) => !snap.coupons.find((x2) => x2.code === c2.code)).forEach((c2) => cloud.upsertCoupon(c2));
        cur.affiliates.filter((a) => !snap.affiliates.find((x2) => x2.id === a.id)).forEach((a) => cloud.upsertAffiliate(a));
        cur.affiliateSales.filter((s2) => !snap.affiliateSales.find((x2) => x2.id === s2.id)).forEach((s2) => cloud.upsertAffiliateSale(s2));
        cur.transactions.filter((t) => !snap.transactions.find((x2) => x2.id === t.id)).forEach((t) => cloud.upsertTransaction(t));
        cur.reviews.filter((r2) => !snap.reviews.find((x2) => x2.id === r2.id)).forEach((r2) => cloud.upsertReview(r2));
        if (!snap.settings) cloud.upsertSettings(cur.settings);
        localStorage.setItem(pushed, "1");
      }
    } catch (e) {
      console.warn("[hydrateFromCloud] failed", e);
    }
  })();
  return _hydratingFromCloud;
}
function computeSubtotal(s2) {
  return s2.cart.reduce((a, ci) => {
    const p2 = s2.products.find((x2) => x2.id === ci.productId);
    return p2 ? a + p2.price * ci.quantity : a;
  }, 0);
}
const selectCartTotals = (s2) => {
  const subtotal = computeSubtotal(s2);
  const coupon = s2.coupons.find((c2) => c2.code === s2.appliedCoupon);
  const discount = coupon ? coupon.type === "percent" ? subtotal * coupon.value / 100 : coupon.value : 0;
  const shipping = 0;
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, shipping, total, coupon };
};
const selectCartCount = (s2) => s2.cart.reduce((a, i) => a + i.quantity, 0);
const selectCurrentCustomer = (s2) => s2.customers.find((c2) => c2.id === s2.currentCustomerId) || null;
const d = "onesignal-sdk", l = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
let u = false, s = false;
typeof window < "u" && (window.OneSignalDeferred = window.OneSignalDeferred || []);
function f() {
  s = true;
}
function c(i) {
  if (document.getElementById(d))
    return;
  const e = document.createElement("script");
  e.id = d, e.defer = true, e.src = i || l, e.onerror = () => {
    f();
  }, document.head.appendChild(e);
}
function w() {
  return g() || S();
}
function p() {
  return window.top !== window && // isContextIframe
  navigator.vendor === "Apple Computer, Inc." && // isSafari
  navigator.platform === "MacIntel";
}
function S() {
  return window.safari && typeof window.safari.pushNotification < "u" || p();
}
function g() {
  return typeof PushSubscriptionOptions < "u" && PushSubscriptionOptions.prototype.hasOwnProperty("applicationServerKey");
}
const m = () => w(), h = (i) => {
  var e;
  return u ? Promise.reject("OneSignal is already initialized.") : !i || !i.appId ? Promise.reject("You need to provide your OneSignal appId.") : document ? (((e = i.welcomeNotification) == null ? void 0 : e.disabled) !== void 0 && (i.welcomeNotification.disable = i.welcomeNotification.disabled), c(i.scriptSrc), new Promise((n, r2) => {
    var t;
    (t = window.OneSignalDeferred) == null || t.push((o) => {
      o.init(i).then(() => {
        u = true, n();
      }).catch(r2);
    });
  })) : Promise.reject("Document is not defined.");
};
function O(i, e) {
  return new Promise((n, r2) => {
    var t;
    if (s) {
      r2(new Error("OneSignal script failed to load."));
      return;
    }
    (t = window.OneSignalDeferred) == null || t.push((o) => {
      o.login(i, e).then(() => n()).catch((a) => r2(a));
    });
  });
}
function v() {
  return new Promise((i, e) => {
    var n;
    if (s) {
      e(new Error("OneSignal script failed to load."));
      return;
    }
    (n = window.OneSignalDeferred) == null || n.push((r2) => {
      r2.logout().then(() => i()).catch((t) => e(t));
    });
  });
}
function E(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.setConsentGiven(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function D(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.setConsentRequired(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function P(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Slidedown.promptPush(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function L(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Slidedown.promptPushCategories(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function U(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Slidedown.promptSms(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function A(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Slidedown.promptEmail(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function N(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Slidedown.promptSmsAndEmail(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function b(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.Slidedown.addEventListener(i, e);
  });
}
function T(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.Slidedown.removeEventListener(i, e);
  });
}
function I(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Notifications.setDefaultUrl(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function R(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Notifications.setDefaultTitle(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function C() {
  return new Promise((i, e) => {
    var n;
    if (s) {
      e(new Error("OneSignal script failed to load."));
      return;
    }
    (n = window.OneSignalDeferred) == null || n.push((r2) => {
      r2.Notifications.requestPermission().then((t) => i(t)).catch((t) => e(t));
    });
  });
}
function y(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.Notifications.addEventListener(i, e);
  });
}
function q(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.Notifications.removeEventListener(i, e);
  });
}
function k(i, e) {
  return new Promise((n, r2) => {
    var t;
    if (s) {
      r2(new Error("OneSignal script failed to load."));
      return;
    }
    (t = window.OneSignalDeferred) == null || t.push((o) => {
      o.Session.sendOutcome(i, e).then(() => n()).catch((a) => r2(a));
    });
  });
}
function G(i) {
  return new Promise((e, n) => {
    var r2;
    if (s) {
      n(new Error("OneSignal script failed to load."));
      return;
    }
    (r2 = window.OneSignalDeferred) == null || r2.push((t) => {
      t.Session.sendUniqueOutcome(i).then(() => e()).catch((o) => n(o));
    });
  });
}
function K(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.addAlias(i, e);
  });
}
function _(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.addAliases(i);
  });
}
function x(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.removeAlias(i);
  });
}
function V(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.removeAliases(i);
  });
}
function z(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.addEmail(i);
  });
}
function F(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.removeEmail(i);
  });
}
function M(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.addSms(i);
  });
}
function B(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.removeSms(i);
  });
}
function Y(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.addTag(i, e);
  });
}
function H(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.addTags(i);
  });
}
function J(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.removeTag(i);
  });
}
function Q(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.removeTags(i);
  });
}
async function W() {
  var e;
  let i;
  return await ((e = window.OneSignalDeferred) == null ? void 0 : e.push((n) => {
    i = n.User.getTags();
  })), i;
}
function X$1(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.addEventListener(i, e);
  });
}
function Z(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.removeEventListener(i, e);
  });
}
function $(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.User.setLanguage(i);
  });
}
async function j() {
  var e;
  let i;
  return await ((e = window.OneSignalDeferred) == null ? void 0 : e.push((n) => {
    i = n.User.getLanguage();
  })), i;
}
function ee(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.trackEvent(i, e);
  });
}
function ne() {
  return new Promise((i, e) => {
    var n;
    if (s) {
      e(new Error("OneSignal script failed to load."));
      return;
    }
    (n = window.OneSignalDeferred) == null || n.push((r2) => {
      r2.User.PushSubscription.optIn().then(() => i()).catch((t) => e(t));
    });
  });
}
function ie() {
  return new Promise((i, e) => {
    var n;
    if (s) {
      e(new Error("OneSignal script failed to load."));
      return;
    }
    (n = window.OneSignalDeferred) == null || n.push((r2) => {
      r2.User.PushSubscription.optOut().then(() => i()).catch((t) => e(t));
    });
  });
}
function re(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.PushSubscription.addEventListener(i, e);
  });
}
function te(i, e) {
  var n;
  (n = window.OneSignalDeferred) == null || n.push((r2) => {
    r2.User.PushSubscription.removeEventListener(i, e);
  });
}
function oe(i) {
  var e;
  (e = window.OneSignalDeferred) == null || e.push((n) => {
    n.Debug.setLogLevel(i);
  });
}
const se = {
  get id() {
    var i, e, n;
    return (n = (e = (i = window.OneSignal) == null ? void 0 : i.User) == null ? void 0 : e.PushSubscription) == null ? void 0 : n.id;
  },
  get token() {
    var i, e, n;
    return (n = (e = (i = window.OneSignal) == null ? void 0 : i.User) == null ? void 0 : e.PushSubscription) == null ? void 0 : n.token;
  },
  get optedIn() {
    var i, e, n;
    return (n = (e = (i = window.OneSignal) == null ? void 0 : i.User) == null ? void 0 : e.PushSubscription) == null ? void 0 : n.optedIn;
  },
  optIn: ne,
  optOut: ie,
  addEventListener: re,
  removeEventListener: te
}, ae = {
  get onesignalId() {
    var i, e;
    return (e = (i = window.OneSignal) == null ? void 0 : i.User) == null ? void 0 : e.onesignalId;
  },
  get externalId() {
    var i, e;
    return (e = (i = window.OneSignal) == null ? void 0 : i.User) == null ? void 0 : e.externalId;
  },
  addAlias: K,
  addAliases: _,
  removeAlias: x,
  removeAliases: V,
  addEmail: z,
  removeEmail: F,
  addSms: M,
  removeSms: B,
  addTag: Y,
  addTags: H,
  removeTag: J,
  removeTags: Q,
  getTags: W,
  addEventListener: X$1,
  removeEventListener: Z,
  setLanguage: $,
  getLanguage: j,
  trackEvent: ee,
  PushSubscription: se
}, de = {
  sendOutcome: k,
  sendUniqueOutcome: G
}, ue = {
  setLogLevel: oe
}, le = {
  promptPush: P,
  promptPushCategories: L,
  promptSms: U,
  promptEmail: A,
  promptSmsAndEmail: N,
  addEventListener: b,
  removeEventListener: T
}, fe = {
  get permissionNative() {
    var i, e;
    return ((e = (i = window.OneSignal) == null ? void 0 : i.Notifications) == null ? void 0 : e.permissionNative) ?? "default";
  },
  get permission() {
    var i, e;
    return ((e = (i = window.OneSignal) == null ? void 0 : i.Notifications) == null ? void 0 : e.permission) ?? false;
  },
  setDefaultUrl: I,
  setDefaultTitle: R,
  isPushSupported: m,
  requestPermission: C,
  addEventListener: y,
  removeEventListener: q
}, ce = {
  login: O,
  logout: v,
  init: h,
  setConsentGiven: E,
  setConsentRequired: D,
  Slidedown: le,
  Notifications: fe,
  Session: de,
  User: ae,
  Debug: ue
}, we = ce;
let oneSignalInitPromise = null;
const ONESIGNAL_APP_ID = "2daa3ed9-be86-4bc9-9819-4d641aea75d5";
function isInPreviewIframe() {
  try {
    const inIframe = window.self !== window.top;
    const host = window.location.hostname;
    const isPreviewHost = host.includes("id-preview--") || host.includes("lovableproject.com");
    return inIframe || isPreviewHost;
  } catch {
    return true;
  }
}
async function initOneSignal() {
  if (oneSignalInitPromise) return oneSignalInitPromise;
  oneSignalInitPromise = (async () => {
    console.log("[push] Inicializando OneSignal:", ONESIGNAL_APP_ID);
    await we.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      // Service Worker em scope padrão (raiz) — arquivo já existe em /public/
      autoRegister: false,
      autoResubscribe: true,
      welcomeNotification: { disable: true },
      notifyButton: { enable: false }
    });
    console.log("[push] OneSignal init OK");
  })();
  return oneSignalInitPromise;
}
function waitForPlayerId(timeoutMs = 12e3) {
  const existing = we.User?.PushSubscription?.id ?? null;
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (id) => {
      if (resolved) return;
      resolved = true;
      resolve(id);
    };
    try {
      we.User?.PushSubscription?.addEventListener(
        "change",
        (event) => {
          if (event.current.id) finish(event.current.id);
        }
      );
    } catch {
    }
    const start = Date.now();
    const poll = () => {
      if (resolved) return;
      const id = we.User?.PushSubscription?.id ?? null;
      if (id) {
        console.log(`[push] player_id em ${Date.now() - start}ms`);
        finish(id);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        finish(null);
        return;
      }
      setTimeout(poll, 100);
    };
    poll();
  });
}
function usePushNotifications({ role, userId, autoInit = true }) {
  const [supported, setSupported] = reactExports.useState(false);
  const [subscribed, setSubscribed] = reactExports.useState(false);
  const [permission, setPermission] = reactExports.useState("default");
  const [loading, setLoading] = reactExports.useState(true);
  const [playerId, setPlayerId] = reactExports.useState(null);
  const [initialized, setInitialized] = reactExports.useState(false);
  const initStartedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!autoInit) {
      setLoading(false);
      return;
    }
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    const setup = async () => {
      try {
        if (isInPreviewIframe()) {
          setSupported(false);
          setLoading(false);
          return;
        }
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
          setSupported(false);
          setLoading(false);
          return;
        }
        setSupported(true);
        setPermission(Notification.permission);
        await initOneSignal();
        setInitialized(true);
        const OS = we;
        const isOptedIn = OS.User?.PushSubscription?.optedIn ?? false;
        const id = OS.User?.PushSubscription?.id ?? null;
        setSubscribed(isOptedIn);
        setPlayerId(id);
        OS.User?.PushSubscription?.addEventListener(
          "change",
          (event) => {
            setSubscribed(event.current.optedIn);
            setPlayerId(event.current.id);
          }
        );
        if (Notification.permission === "granted" && !isOptedIn) {
          console.log("[push] Permissão já concedida mas não inscrito — optIn silencioso");
          try {
            await OS?.User?.PushSubscription?.optIn?.();
            const pid = await waitForPlayerId(5e3);
            if (pid) {
              setPlayerId(pid);
              setSubscribed(true);
              const osUserId = role === "admin" ? "admin-user" : userId;
              if (osUserId) {
                await OS?.login?.(osUserId);
                OS?.User?.addTag?.("role", role);
              }
            }
          } catch {
          }
        }
      } catch (err) {
        console.error("[push] setup error:", err);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, [autoInit, role, userId]);
  const enable = reactExports.useCallback(async () => {
    setLoading(true);
    console.log("[push] enable() iniciado, role=", role);
    try {
      if (!initialized) {
        await initOneSignal();
        setInitialized(true);
      }
      const OS = we;
      if ("Notification" in window && Notification.permission === "denied") {
        setPermission("denied");
        return false;
      }
      OS.Notifications.requestPermission().catch(() => {
      });
      const waitForPermission = async () => {
        const start = Date.now();
        while (Date.now() - start < 8e3) {
          const p2 = "Notification" in window ? Notification.permission : "default";
          if (p2 !== "default") return p2;
          await new Promise((r2) => setTimeout(r2, 50));
        }
        return Notification.permission;
      };
      const perm = await waitForPermission();
      setPermission(perm);
      if (perm !== "granted") {
        console.warn("[push] permissão não concedida");
        return false;
      }
      OS?.User?.PushSubscription?.optIn?.().catch(() => {
      });
      const pid = await waitForPlayerId(12e3);
      if (pid) {
        setPlayerId(pid);
        setSubscribed(true);
        const osUserId = role === "admin" ? "admin-user" : userId;
        if (osUserId) {
          await OS?.login?.(osUserId);
          OS?.User?.addTag?.("role", role);
        }
        console.log("[push] ✅ inscrição completa, pid=", pid);
        setTimeout(() => {
          supabase.functions.invoke("send-push", {
            body: {
              title: "🔔 Notificações ativadas!",
              message: role === "admin" ? "Admin: você receberá avisos de pedidos e pagamentos 💰" : "Você vai receber avisos dos seus pedidos 💖",
              subscriptionIds: [pid],
              externalUserIds: [osUserId ?? pid]
            }
          }).catch((e) => console.warn("[push] welcome push falhou:", e));
        }, 1500);
        return true;
      }
      console.error("[push] ❌ player_id não chegou após 12s");
      return false;
    } catch (err) {
      console.error("[push] enable error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initialized, role, userId]);
  const disable = reactExports.useCallback(async () => {
    if (!initialized) return false;
    try {
      setLoading(true);
      await we?.User?.PushSubscription?.optOut?.();
      setSubscribed(false);
      setPlayerId(null);
      return true;
    } catch (err) {
      console.error("[push] disable error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initialized]);
  return { supported, subscribed, permission, loading, playerId, enable, disable };
}
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
const Icon = reactExports.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports.forwardRef(
    ({ className, ...props }, ref) => reactExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
const __iconNode$L = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$L);
const __iconNode$K = [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M6 12h.01M18 12h.01", key: "113zkx" }]
];
const Banknote = createLucideIcon("banknote", __iconNode$K);
const __iconNode$J = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$J);
const __iconNode$I = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$I);
const __iconNode$H = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$H);
const __iconNode$G = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$G);
const __iconNode$F = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$F);
const __iconNode$E = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$E);
const __iconNode$D = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$D);
const __iconNode$C = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
const Clock = createLucideIcon("clock", __iconNode$C);
const __iconNode$B = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$B);
const __iconNode$A = [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
];
const CreditCard = createLucideIcon("credit-card", __iconNode$A);
const __iconNode$z = [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Crown = createLucideIcon("crown", __iconNode$z);
const __iconNode$y = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$y);
const __iconNode$x = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
];
const EllipsisVertical = createLucideIcon("ellipsis-vertical", __iconNode$x);
const __iconNode$w = [
  [
    "path",
    {
      d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
      key: "1slcih"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode$w);
const __iconNode$v = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  ["path", { d: "M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8", key: "1sqzm4" }],
  [
    "path",
    { d: "M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5", key: "kc0143" }
  ],
  ["rect", { x: "3", y: "7", width: "18", height: "4", rx: "1", key: "1hberx" }]
];
const Gift = createLucideIcon("gift", __iconNode$v);
const __iconNode$u = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ["path", { d: "M15 3v18", key: "14nvp0" }]
];
const Grid3x3 = createLucideIcon("grid-3x3", __iconNode$u);
const __iconNode$t = [
  [
    "path",
    {
      d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
      key: "mvr1a0"
    }
  ]
];
const Heart = createLucideIcon("heart", __iconNode$t);
const __iconNode$s = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "r6nss1"
    }
  ]
];
const House = createLucideIcon("house", __iconNode$s);
const __iconNode$r = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$r);
const __iconNode$q = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode$q);
const __iconNode$p = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$p);
const __iconNode$o = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$o);
const __iconNode$n = [
  [
    "path",
    {
      d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
      key: "1sd12s"
    }
  ]
];
const MessageCircle = createLucideIcon("message-circle", __iconNode$n);
const __iconNode$m = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$m);
const __iconNode$l = [
  ["path", { d: "m16 16 2 2 4-4", key: "gfu2re" }],
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }]
];
const PackageCheck = createLucideIcon("package-check", __iconNode$l);
const __iconNode$k = [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
];
const Package = createLucideIcon("package", __iconNode$k);
const __iconNode$j = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode$j);
const __iconNode$i = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$i);
const __iconNode$h = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$h);
const __iconNode$g = [
  ["rect", { width: "5", height: "5", x: "3", y: "3", rx: "1", key: "1tu5fj" }],
  ["rect", { width: "5", height: "5", x: "16", y: "3", rx: "1", key: "1v8r4q" }],
  ["rect", { width: "5", height: "5", x: "3", y: "16", rx: "1", key: "1x03jg" }],
  ["path", { d: "M21 16h-3a2 2 0 0 0-2 2v3", key: "177gqh" }],
  ["path", { d: "M21 21v.01", key: "ents32" }],
  ["path", { d: "M12 7v3a2 2 0 0 1-2 2H7", key: "8crl2c" }],
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M12 3h.01", key: "n36tog" }],
  ["path", { d: "M12 16v.01", key: "133mhm" }],
  ["path", { d: "M16 12h1", key: "1slzba" }],
  ["path", { d: "M21 12v.01", key: "1lwtk9" }],
  ["path", { d: "M12 21v-1", key: "1880an" }]
];
const QrCode = createLucideIcon("qr-code", __iconNode$g);
const __iconNode$f = [
  [
    "path",
    { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", key: "q3az6g" }
  ],
  ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }],
  ["path", { d: "M12 17.5v-11", key: "1jc1ny" }]
];
const Receipt = createLucideIcon("receipt", __iconNode$f);
const __iconNode$e = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode$e);
const __iconNode$d = [
  ["path", { d: "m13.5 8.5-5 5", key: "1cs55j" }],
  ["path", { d: "m8.5 8.5 5 5", key: "a8mexj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
];
const SearchX = createLucideIcon("search-x", __iconNode$d);
const __iconNode$c = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode$c);
const __iconNode$b = [
  ["path", { d: "M12 2v13", key: "1km8f5" }],
  ["path", { d: "m16 6-4-4-4 4", key: "13yo43" }],
  ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", key: "1b2hhj" }]
];
const Share = createLucideIcon("share", __iconNode$b);
const __iconNode$a = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode$a);
const __iconNode$9 = [
  ["path", { d: "M16 10a4 4 0 0 1-8 0", key: "1ltviw" }],
  ["path", { d: "M3.103 6.034h17.794", key: "awc11p" }],
  [
    "path",
    {
      d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
      key: "o988cm"
    }
  ]
];
const ShoppingBag = createLucideIcon("shopping-bag", __iconNode$9);
const __iconNode$8 = [
  [
    "path",
    {
      d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
      key: "1s2grr"
    }
  ],
  ["path", { d: "M20 2v4", key: "1rf3ol" }],
  ["path", { d: "M22 4h-4", key: "gwowj6" }],
  ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode$7);
const __iconNode$6 = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }],
  ["path", { d: "M15 18H9", key: "1lyqi6" }],
  [
    "path",
    {
      d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      key: "lysw3i"
    }
  ],
  ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]
];
const Truck = createLucideIcon("truck", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
];
const Video = createLucideIcon("video", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_DAYS = 7;
function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function detectPlatform() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}
function PwaInstallPrompt() {
  const [open, setOpen] = reactExports.useState(false);
  const [showTutorial, setShowTutorial] = reactExports.useState(false);
  const [deferred, setDeferred] = reactExports.useState(null);
  const [platform, setPlatform] = reactExports.useState(
    "desktop"
  );
  reactExports.useEffect(() => {
    if (isStandalone()) return;
    setPlatform(detectPlatform());
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const fresh = Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1e3;
    if (fresh) return;
    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    const t = window.setTimeout(() => setOpen(true), 2500);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.clearTimeout(t);
    };
  }, []);
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
    setShowTutorial(false);
  };
  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") dismiss();
      else setShowTutorial(true);
      setDeferred(null);
    } else {
      setShowTutorial(true);
    }
  };
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-auto max-w-sm mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300", children: !showTutorial ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: dismiss,
        "aria-label": "Fechar",
        className: "absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground", children: "Instale nosso app" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Acesso rápido na sua tela inicial 💖" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleInstall,
        className: "mt-3 w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm shadow-soft active:scale-[0.98] transition-transform",
        children: "Instalar"
      }
    )
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: dismiss,
        "aria-label": "Fechar",
        className: "absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground mb-2 pr-6", children: "Como instalar" }),
    platform !== "android" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase font-semibold text-primary mb-1.5", children: "iPhone (Safari)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0", children: "1" }),
          "Toque em",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "inline h-3.5 w-3.5 text-primary" }),
          " ",
          "Compartilhar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0", children: "2" }),
          '"Adicionar à Tela de Início"',
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "inline h-3.5 w-3.5 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0", children: "3" }),
          'Toque em "Adicionar"',
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "inline h-3.5 w-3.5 text-primary" })
        ] })
      ] })
    ] }),
    platform !== "ios" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase font-semibold text-primary mb-1.5", children: "Android (Chrome)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0", children: "1" }),
          "Toque em",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "inline h-3.5 w-3.5 text-primary" }),
          " ",
          "menu"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0", children: "2" }),
          '"Instalar app" ou "Adicionar à tela inicial"'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0", children: "3" }),
          'Confirme tocando em "Instalar"'
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: dismiss,
        className: "mt-3 w-full h-9 rounded-full bg-muted text-foreground font-semibold text-xs",
        children: "Entendi"
      }
    )
  ] }) }) });
}
const appCss = "/assets/styles-Cm1-2Jwi.css";
const PWA_ALLOWED_ROUTES = ["/afiliada/login", "/afiliada", "/admin"];
const PWA_LAUNCH_KEY = "pwa_launch_route";
function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function matchAllowedRoute(path) {
  return PWA_ALLOWED_ROUTES.find((r2) => path === r2 || path.startsWith(r2 + "/")) ?? null;
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$M = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        httpEquiv: "Content-Security-Policy",
        content: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'self'",
          "form-action 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://cdn.onesignal.com https://*.onesignal.com https://*.os.tc",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' data: https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://api.mercadolibre.com https://*.onesignal.com wss://*.onesignal.com https://*.os.tc",
          "frame-src https://*.mercadopago.com https://*.mercadolibre.com https://*.onesignal.com",
          "worker-src 'self' blob:",
          "manifest-src 'self'"
        ].join("; ")
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      },
      { name: "theme-color", content: "#d177a8" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Princesa de Laços" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "Princesa de Laços — Loja On-line" },
      {
        name: "description",
        content: "Catálogo encantado de laços, tiaras e acessórios."
      },
      {
        property: "og:title",
        content: "Princesa de Laços — Catálogo encantado"
      },
      {
        property: "og:description",
        content: "Catálogo encantado de laços, tiaras e acessórios."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "Princesa de Laços — Catálogo encantado"
      },
      {
        name: "twitter:description",
        content: "Catálogo encantado de laços, tiaras e acessórios."
      },
      {
        property: "og:image",
        content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1778083243316-versao_grande.webp"
      },
      {
        name: "twitter:image",
        content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1778083243316-versao_grande.webp"
      },
      { property: "og:title", content: "Princesa de Laços — Loja On-line" },
      { name: "twitter:title", content: "Princesa de Laços — Loja On-line" },
      { name: "description", content: "Princesa de Laços — Loja On-line" },
      { property: "og:description", content: "Princesa de Laços — Loja On-line" },
      { name: "twitter:description", content: "Princesa de Laços — Loja On-line" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1779231001061-princesa_de_lacos_1mb.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/lXDtPqq8z6gJkDgJ553CSEpWldA2/social-images/social-1779231001061-princesa_de_lacos_1mb.webp" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/icon-192.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/icon-512.png"
      },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "mask-icon", href: "/icon-maskable-512.png", color: "#d177a8" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Pacifico&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
      }
    ],
    scripts: []
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster2, { position: "top-center", richColors: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const currentCustomerId = useStore((s2) => s2.currentCustomerId);
  const isAdmin = useStore((s2) => s2.isAdmin);
  usePushNotifications({
    role: isAdmin ? "admin" : "cliente",
    userId: isAdmin ? null : currentCustomerId
  });
  const sessions = useStore((s2) => s2.sessions);
  const customers = useStore((s2) => s2.customers);
  const affiliates = useStore((s2) => s2.affiliates);
  const refreshSession = useStore((s2) => s2.refreshSession);
  const router2 = useRouter();
  const location = useLocation();
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    const matched = matchAllowedRoute(path);
    if (matched) {
      try {
        localStorage.setItem(PWA_LAUNCH_KEY, path);
      } catch {
      }
    }
    let manifestHref = "/manifest.json";
    if (path === "/admin" || path.startsWith("/admin/"))
      manifestHref = "/admin/manifest.json";
    else if (path === "/afiliada" || path.startsWith("/afiliada/"))
      manifestHref = "/afiliada/manifest.json";
    const finalHref = `${manifestHref}?v=${Date.now()}`;
    let link = document.querySelector(
      'link[rel="manifest"]'
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.setAttribute("href", finalHref);
    console.log("[PWA] Manifest set to:", finalHref);
  }, [location.pathname]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      useStore.getState().setReferralId(ref);
      try {
        localStorage.setItem("referral_id", ref);
      } catch {
      }
      console.log("[Affiliate] Referral detected:", ref);
    } else {
      const saved = localStorage.getItem("referral_id");
      if (saved) useStore.getState().setReferralId(saved);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!isStandaloneMode()) return;
    if (location.pathname !== "/") return;
    try {
      const saved = localStorage.getItem(PWA_LAUNCH_KEY);
      if (saved && matchAllowedRoute(saved)) {
        router2.navigate({ to: saved, replace: true });
      }
    } catch {
    }
  }, [location.pathname, router2]);
  reactExports.useEffect(() => {
    const tick = () => {
      refreshSession("admin");
      refreshSession("customer");
      refreshSession("affiliate");
    };
    tick();
    const events = ["click", "keydown", "visibilitychange", "focus"];
    events.forEach((e) => window.addEventListener(e, tick));
    const interval = window.setInterval(tick, 1e3 * 60 * 15);
    return () => {
      events.forEach((e) => window.removeEventListener(e, tick));
      window.clearInterval(interval);
    };
  }, [refreshSession]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    hydrateFromCloud();
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const OS = window.OneSignalDeferred || (window.OneSignalDeferred = []);
    OS.push(async (OneSignal) => {
      try {
        const path = location.pathname;
        let role = "customer";
        let activeUser = null;
        if (path.startsWith("/admin") && sessions.admin) {
          role = "admin";
          activeUser = {
            id: sessions.admin.subjectId,
            email: sessions.admin.subjectId
          };
        } else if (path.startsWith("/afiliada") && sessions.affiliate) {
          role = "affiliate";
          const aff = affiliates.find(
            (a) => a.id === sessions.affiliate?.subjectId
          );
          if (aff)
            activeUser = { id: aff.id, email: aff.email, name: aff.name };
        } else if (sessions.customer) {
          role = "customer";
          const cust = customers.find(
            (c2) => c2.id === sessions.customer?.subjectId
          );
          if (cust)
            activeUser = { id: cust.id, email: cust.email, name: cust.name };
        }
        if (activeUser) {
          console.log("[OneSignal] User identified:", role, activeUser.id);
          await OneSignal.login(activeUser.id);
          await OneSignal.User.addTags({
            role,
            email: activeUser.email,
            full_name: activeUser.name || ""
          });
        } else {
          console.log(
            "[OneSignal] No active session, logging out of OneSignal"
          );
          await OneSignal.logout();
        }
      } catch (e) {
        console.warn("[OneSignal] Role sync failed", e);
      }
    });
  }, [sessions, customers, affiliates, location.pathname]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallPrompt, {})
  ] });
}
const $$splitComponentImporter$t = () => import("./suporte-tVJ6xZIV.js");
const Route$L = createFileRoute("/suporte")({
  head: () => ({
    meta: [{
      title: "Central de Ajuda — Princesa de Laços"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./redefinir-senha-CsK7o336.js");
const searchSchema = objectType({
  token: stringType().optional()
});
const Route$K = createFileRoute("/redefinir-senha")({
  validateSearch: searchSchema,
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const logoUrl = "/assets/logo-princesa-BPfbVopo.png";
const STORE_ROUTES_TO_PRELOAD = [
  "/",
  "/categorias",
  "/pedidos",
  "/perfil",
  "/carrinho",
  "/cadastro",
  "/login"
];
function StoreHeader() {
  const navigate = useNavigate();
  const router2 = useRouter();
  const count = useStore(selectCartCount);
  const settings = useStore((s2) => s2.settings);
  const currentCustomer = useStore(selectCurrentCustomer);
  const [q2, setQ] = reactExports.useState("");
  reactExports.useEffect(() => {
    STORE_ROUTES_TO_PRELOAD.forEach((to) => {
      router2.preloadRoute({ to }).catch(() => {
      });
    });
  }, [router2]);
  const onSearch = (e) => {
    e.preventDefault();
    if (q2.trim()) navigate({ to: "/buscar", search: { q: q2.trim() } });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 gradient-primary text-primary-foreground shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block border-b border-white/10 text-[11px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 h-7 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 opacity-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/suporte", className: "hover:underline", children: "Central de Ajuda" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/login", className: "hover:underline", children: "Vender na loja" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pedidos", className: "hover:underline", children: "Acompanhar pedido" })
      ] }),
      !currentCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 opacity-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cadastro", className: "hover:underline", children: "Cadastrar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "hover:underline", children: "Entrar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: logoUrl,
          alt: settings.storeName,
          className: "h-14 md:h-20 w-auto object-contain",
          style: { mixBlendMode: "multiply" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: onSearch, className: "flex-1 min-w-0 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-stretch bg-white rounded-md md:rounded-sm overflow-hidden shadow-sm border-2 border-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: q2,
            onChange: (e) => setQ(e.target.value),
            placeholder: "Buscar laços, tiaras, kits...",
            className: "flex-1 h-9 md:h-10 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            "aria-label": "Buscar",
            className: "px-3 md:px-5 bg-primary hover:opacity-95 active:scale-95 transition-all grid place-items-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-primary-foreground" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/perfil",
          className: "hidden md:grid w-10 h-10 place-items-center rounded-full hover:bg-white/15 transition-colors",
          "aria-label": "Notificações",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
          target: "_blank",
          rel: "noreferrer",
          className: "hidden md:grid w-10 h-10 place-items-center rounded-full hover:bg-white/15 transition-colors",
          "aria-label": "Chat",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/carrinho",
          className: "relative shrink-0 w-10 h-10 grid place-items-center rounded-full hover:bg-white/15 transition-colors",
          "aria-label": "Carrinho",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "1.4em",
                height: "1.4em",
                strokeLinejoin: "round",
                strokeLinecap: "round",
                viewBox: "0 0 24 24",
                strokeWidth: 2,
                fill: "none",
                stroke: "currentColor",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: 1, cy: 21, cx: 9 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: 1, cy: 21, cx: 20 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
                ]
              }
            ),
            count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 bg-gold text-gold-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-primary", children: count })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden md:block bg-white/10 backdrop-blur border-t border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 flex items-center gap-6 h-10 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:opacity-80 font-semibold", children: "Início" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/categorias", className: "hover:opacity-80", children: "Categorias" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/suporte", className: "hover:opacity-80", children: "Ajuda" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pedidos", className: "hover:opacity-80", children: "Meus pedidos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/perfil", className: "hover:opacity-80", children: "Minha conta" })
    ] }) })
  ] });
}
function r(e) {
  var t, f2, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f2 = r(e[t])) && (n && (n += " "), n += f2);
  } else for (f2 in e) e[f2] && (n && (n += " "), n += f2);
  return n;
}
function clsx() {
  for (var e, t, f2 = 0, n = "", o = arguments.length; f2 < o; f2++) (e = arguments[f2]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
const concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
const createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
const createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
const CLASS_PART_SEPARATOR = "-";
const EMPTY_CONFLICTS = [];
const ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
const createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
const getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
const createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
const processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
const processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
const processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
const processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
const processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
const getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
const isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
const createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache) {
        cache[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = "!";
const MODIFIER_SEPARATOR = ":";
const EMPTY_MODIFIERS = [];
const createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
const createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
const createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
const twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k2 = 0; k2 < mix.length; k2++) {
    if (mix[k2]) {
      if (resolvedValue = toValue(mix[k2])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
const fallbackThemeArr = [];
const fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = (value) => fractionRegex.test(value);
const isNumber = (value) => !!value && !Number.isNaN(Number(value));
const isInteger = (value) => !!value && Number.isInteger(Number(value));
const isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
const isTshirtSize = (value) => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
const isNever = () => false;
const isShadow = (value) => shadowRegex.test(value);
const isImage = (value) => imageRegex.test(value);
const isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = (value) => arbitraryValueRegex.test(value);
const isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
const isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
const isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
const isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
const isLabelPosition = (label) => label === "position" || label === "percentage";
const isLabelImage = (label) => label === "image" || label === "url";
const isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
const isLabelLength = (label) => label === "length";
const isLabelNumber = (label) => label === "number";
const isLabelFamilyName = (label) => label === "family-name";
const isLabelWeight = (label) => label === "number" || label === "weight";
const isLabelShadow = (label) => label === "shadow";
const getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
const twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const items = [
  { to: "/", label: "Início", icon: House, exact: true },
  { to: "/categorias", label: "Categorias", icon: Grid3x3 },
  { to: "/carrinho", label: "Carrinho", icon: ShoppingBag, badge: true },
  { to: "/pedidos", label: "Pedidos", icon: Package },
  { to: "/perfil", label: "Perfil", icon: User }
];
function BottomNav() {
  const path = useRouterState({ select: (r2) => r2.location.pathname });
  const count = useStore(selectCartCount);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "md:hidden fixed bottom-0 inset-x-0 z-[50] bg-card/95 backdrop-blur border-t border-border safe-bottom overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid grid-cols-5 relative", children: items.map((it) => {
    const active = it.exact ? path === it.to : path.startsWith(it.to);
    const Icon2 = it.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: it.to,
        className: cn(
          "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium relative transition-colors overflow-hidden",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Icon2,
              {
                className: cn("h-5 w-5", active && "scale-110"),
                strokeWidth: active ? 2.5 : 2
              }
            ),
            it.badge && count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center", children: count })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: it.label })
        ]
      }
    ) }, it.to);
  }) }) });
}
function StoreLayout({
  children,
  header
}) {
  const path = useRouterState({ select: (r2) => r2.location.pathname });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    header !== void 0 ? header : /* @__PURE__ */ jsxRuntimeExports.jsx(StoreHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 pb-24 md:pb-12 animate-page-in", children }, path),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
function Skeleton({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("shimmer rounded-xl", className) });
}
function ProductCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl overflow-hidden shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square w-full rounded-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-3/4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/3 mt-2" })
    ] })
  ] });
}
function ProductGridSkeleton({
  count = 8,
  cols = "grid-cols-2 md:grid-cols-4"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid gap-3", cols), children: Array.from({ length: count }).map((_2, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCardSkeleton, {}, i)) });
}
function OrderRowSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card flex justify-between items-start", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16 ml-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-12 ml-auto" })
    ] })
  ] });
}
function OrderListSkeleton({ count = 4 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: Array.from({ length: count }).map((_2, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrderRowSkeleton, {}) }, i)) });
}
function CategoryGridSkeleton({ count = 8 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 gap-3", children: Array.from({ length: count }).map((_2, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card rounded-2xl p-3 shadow-card flex flex-col items-center gap-2",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-12 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-16" })
      ]
    },
    i
  )) });
}
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatDate = (iso) => new Date(iso).toLocaleString("pt-BR", {
  dateStyle: "short",
  timeStyle: "short"
});
function OrderAccentBar({ className = "top-3 bottom-3" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      "aria-hidden": true,
      className: `pointer-events-none absolute left-0 w-1 rounded-full bg-gradient-to-b from-primary via-accent to-primary/40 ${className}`
    }
  );
}
function ReorderModal({
  order,
  onClose
}) {
  const products = useStore((s2) => s2.products);
  const addToCart = useStore((s2) => s2.addToCart);
  const navigate = useNavigate();
  const initial = order.items.map((it) => {
    const p2 = products.find((x2) => x2.id === it.productId);
    const stock = p2?.stock ?? 0;
    return {
      productId: it.productId,
      name: it.name,
      image: it.image,
      price: it.price,
      maxStock: stock,
      available: !!p2 && stock > 0,
      selected: !!p2 && stock > 0,
      qty: Math.min(it.quantity, stock || 1)
    };
  });
  const [items2, setItems] = reactExports.useState(initial);
  reactExports.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const toggle = (id) => setItems(
    (arr) => arr.map(
      (i) => i.productId === id && i.available ? { ...i, selected: !i.selected } : i
    )
  );
  const setQty = (id, qty) => setItems(
    (arr) => arr.map(
      (i) => i.productId === id ? { ...i, qty: Math.max(1, Math.min(qty, i.maxStock || 1)) } : i
    )
  );
  const selected = items2.filter((i) => i.selected && i.available);
  const total = selected.reduce((a, i) => a + i.price * i.qty, 0);
  const allOn = items2.filter((i) => i.available).every((i) => i.selected);
  const confirm2 = () => {
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um item");
      return;
    }
    selected.forEach((i) => addToCart(i.productId, i.qty));
    toast.success(`${selected.length} item(s) adicionados ao carrinho`);
    onClose();
    navigate({ to: "/carrinho" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-overlay-in",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative overflow-hidden bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-soft max-h-[92vh] flex flex-col animate-modal-in",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(OrderAccentBar, { className: "top-4 bottom-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-lg font-semibold", children: "Comprar de novo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Escolha o que recomprar do pedido #",
                  order.id
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  "aria-label": "Fechar",
                  className: "p-2 hover:bg-muted rounded-full",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 border-b border-border flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setItems(
                    (arr) => arr.map((i) => i.available ? { ...i, selected: !allOn } : i)
                  ),
                  className: "font-semibold text-primary hover:underline",
                  children: allOn ? "Desmarcar todos" : "Selecionar todos"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                selected.length,
                " de ",
                items2.filter((i) => i.available).length,
                " ",
                "selecionado(s)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex-1 overflow-y-auto divide-y divide-border", children: items2.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: `p-4 flex gap-3 ${!it.available ? "opacity-60" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: it.selected,
                      disabled: !it.available,
                      onChange: () => toggle(it.productId),
                      className: "mt-1 h-5 w-5 accent-primary cursor-pointer disabled:cursor-not-allowed"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: it.image,
                      alt: it.name,
                      className: "w-14 h-14 rounded-xl object-cover bg-muted shrink-0"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: it.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                      brl(it.price),
                      " cada"
                    ] }),
                    !it.available ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 text-[11px] text-destructive font-semibold", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3" }),
                      " Indisponível"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setQty(it.productId, it.qty - 1),
                          disabled: !it.selected || it.qty <= 1,
                          className: "h-7 w-7 rounded-full border border-border grid place-items-center disabled:opacity-40",
                          "aria-label": "Diminuir",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold w-6 text-center", children: it.qty }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setQty(it.productId, it.qty + 1),
                          disabled: !it.selected || it.qty >= it.maxStock,
                          className: "h-7 w-7 rounded-full border border-border grid place-items-center disabled:opacity-40",
                          "aria-label": "Aumentar",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground ml-1", children: [
                        "Estoque: ",
                        it.maxStock
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold whitespace-nowrap", children: brl(it.price * it.qty) })
                ]
              },
              it.productId
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border safe-bottom space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal selecionado" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary text-base", children: brl(total) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: confirm2,
                  disabled: selected.length === 0,
                  className: "w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-soft hover:opacity-90 disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
                    " Adicionar ao carrinho"
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const Route$J = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Meus pedidos — Princesa de Laços" }] }),
  component: Page$9
});
function Page$9() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const allOrders = useStore((s2) => s2.orders);
  const orders = customer ? allOrders.filter((o) => {
    if (o.customerId === customer.id) return true;
    const email = (customer.email || "").trim().toLowerCase();
    return !!email && (o.customerEmail || "").trim().toLowerCase() === email;
  }) : [];
  const [reorderOrder, setReorderOrder] = reactExports.useState(null);
  if (hydrated && !customer) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto text-center py-20 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-12 w-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold mt-3", children: "Faça login para ver seus pedidos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/login",
          className: "mt-4 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold",
          children: "Entrar"
        }
      )
    ] }) });
  }
  const openReorder = (e, o) => {
    e.preventDefault();
    e.stopPropagation();
    setReorderOrder(o);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(StoreLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold leading-tight", children: "Meus pedidos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Acompanhe cada laço da sua história ✨" })
        ] }),
        hydrated && orders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5" }),
          orders.length,
          " ",
          orders.length === 1 ? "pedido" : "pedidos"
        ] })
      ] }),
      !hydrated ? /* @__PURE__ */ jsxRuntimeExports.jsx(OrderListSkeleton, {}) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20 px-4 bg-card rounded-2xl shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full gradient-soft grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-8 w-8 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 font-bold", children: "Nenhum pedido por aqui" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Que tal escolher o seu primeiro lacinho?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/",
            className: "mt-5 inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold",
            children: "Explorar produtos"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-4", children: orders.map((o) => {
        const totalQty = o.items.reduce((s2, i) => s2 + i.quantity, 0);
        const isPaid = o.paymentStatus === "approved";
        const status = normalizeOrderStatus(o.status);
        const delivery = normalizeDeliveryStatus(o.deliveryStatus);
        const statusMeta = getStatusMeta(status, delivery, isPaid);
        const payMeta = getPaymentMeta(o.paymentMethod);
        const stepIdx = getStepIndex(status, delivery);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/pedido/$id",
            params: { id: o.id },
            className: "group relative block bg-card rounded-2xl shadow-card hover:shadow-soft hover:-translate-y-0.5 transition-all overflow-hidden border border-border/50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(OrderAccentBar, { className: "top-4 bottom-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 px-4 pl-5 pt-4 pb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[11px] font-semibold text-foreground/80 bg-muted px-2 py-0.5 rounded-md", children: [
                      "#",
                      o.id.slice(0, 8).toUpperCase()
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: formatDate(o.createdAt) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap", children: [
                    o.deliveryMethod === "retirada" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-primary/70" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3.5 w-3.5 text-primary/70" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: o.deliveryMethod === "retirada" ? "Retirada no ateliê" : "Entrega" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "•" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(payMeta.Icon, { className: "h-3.5 w-3.5 text-primary/70" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: payMeta.label })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `shrink-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusMeta.badgeClass}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(statusMeta.Icon, { className: "h-3 w-3" }),
                      statusMeta.label
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: STEPS.map((s2, i) => {
                  const active = i <= stepIdx;
                  const current = i === stepIdx;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `h-1.5 flex-1 rounded-full transition-colors ${active ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"} ${current ? "ring-2 ring-primary/20" : ""}`
                    },
                    s2.key
                  );
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
                  STEPS[Math.min(stepIdx, STEPS.length - 1)]?.label
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-3 flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex -space-x-2", children: [
                  o.items.slice(0, 4).map((it, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-12 h-12 rounded-xl bg-muted overflow-hidden ring-2 ring-card shadow-sm",
                      style: { zIndex: 10 - idx },
                      children: it.image ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: it.image,
                          alt: it.name,
                          className: "w-full h-full object-cover",
                          loading: "lazy"
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full grid place-items-center text-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }) })
                    },
                    idx
                  )),
                  o.items.length > 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-12 h-12 rounded-xl bg-primary/10 ring-2 ring-card grid place-items-center text-[11px] font-bold text-primary", children: [
                    "+",
                    o.items.length - 4
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold truncate", children: [
                    o.items[0]?.name,
                    o.items.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
                      " ",
                      "e mais ",
                      o.items.length - 1,
                      " ",
                      o.items.length - 1 === 1 ? "item" : "itens"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
                    totalQty,
                    " ",
                    totalQty === 1 ? "peça" : "peças",
                    " no total"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3.5 bg-gradient-to-r from-primary/5 via-accent/10 to-transparent border-t border-border/40 flex items-end justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  o.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-success font-semibold uppercase tracking-wide", children: [
                    "Economizou ",
                    brl(o.discount),
                    " ✨"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Total do pedido" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-extrabold text-primary leading-none", children: brl(o.total) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: (e) => openReorder(e, o),
                    className: "flex-1 h-11 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
                      " Comprar de novo"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-11 px-4 rounded-full bg-gradient-to-r from-primary to-rose text-primary-foreground text-sm font-semibold flex items-center gap-1.5 shadow-soft", children: "Ver detalhes" })
              ] })
            ]
          }
        ) }, o.id);
      }) })
    ] }),
    reorderOrder && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReorderModal,
      {
        order: reorderOrder,
        onClose: () => setReorderOrder(null)
      }
    )
  ] });
}
const STEPS = [
  { key: "pending", label: "Aguardando pagamento" },
  { key: "paid", label: "Pagamento confirmado" },
  { key: "preparing", label: "Em separação" },
  { key: "shipping", label: "Aguardando retirada" },
  { key: "done", label: "Concluído" }
];
function getStepIndex(status, delivery) {
  if (status === "cancelado" || status === "reembolsado") return 0;
  if (delivery === "entregue" || status === "concluido") return 4;
  if (delivery === "saiu_para_entrega") return 3;
  if (delivery === "em_separacao" || status === "em_separacao") return 2;
  if (status === "pago") return 1;
  return 0;
}
function getStatusMeta(status, delivery, isPaid) {
  if (status === "cancelado")
    return {
      label: "Cancelado",
      Icon: CircleX,
      badgeClass: "bg-destructive/10 text-destructive"
    };
  if (status === "reembolsado")
    return {
      label: "Reembolsado",
      Icon: CircleX,
      badgeClass: "bg-muted text-muted-foreground"
    };
  if (delivery === "entregue" || status === "concluido")
    return {
      label: "Entregue",
      Icon: PackageCheck,
      badgeClass: "bg-success/15 text-success"
    };
  if (delivery === "saiu_para_entrega")
    return {
      label: "A caminho",
      Icon: Truck,
      badgeClass: "bg-blue-500/15 text-blue-600"
    };
  if (delivery === "em_separacao" || status === "em_separacao")
    return {
      label: "Em separação",
      Icon: Package,
      badgeClass: "bg-purple-500/15 text-purple-600"
    };
  if (isPaid || status === "pago")
    return {
      label: "Pago",
      Icon: CircleCheck,
      badgeClass: "bg-success/15 text-success"
    };
  return {
    label: getOrderStatusLabel(status),
    Icon: Clock,
    badgeClass: "bg-amber-500/15 text-amber-600"
  };
}
function getPaymentMeta(method) {
  if (method === "pix") return { label: "Pix", Icon: QrCode };
  if (method === "card") return { label: "Cartão", Icon: CreditCard };
  return { label: "Dinheiro", Icon: Banknote };
}
const Route$I = createFileRoute("/login")({
  component: Page$8
});
function Page$8() {
  const navigate = useNavigate();
  const loginCustomer = useStore((s2) => s2.loginCustomer);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const submit = async (e) => {
    e.preventDefault();
    const r2 = await loginCustomer(email, password);
    if (r2.ok) {
      toast.success(r2.message);
      navigate({ to: "/perfil" });
    } else toast.error(r2.message);
  };
  const close = () => navigate({ to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-overlay-in",
      onClick: close,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-full max-w-[340px] sm:max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl animate-modal-in",
          onClick: (e) => e.stopPropagation(),
          role: "dialog",
          "aria-modal": "true",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gradient-primary text-primary-foreground px-4 pt-4 pb-5 relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: close,
                  className: "absolute right-3 top-3 w-7 h-7 grid place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors",
                  "aria-label": "Fechar",
                  type: "button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: "Bem-vinda" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground/90 text-xs", children: "Entre na sua conta." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "px-4 py-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Field$3,
                {
                  label: "E-mail",
                  type: "email",
                  value: email,
                  onChange: setEmail,
                  placeholder: "seu@email.com"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Field$3,
                {
                  label: "Senha",
                  type: "password",
                  value: password,
                  onChange: setPassword,
                  placeholder: "Sua senha"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm", children: "Entrar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground pt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/esqueci-senha", className: "text-primary font-semibold", children: "Esqueci minha senha" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground pt-0.5", children: [
                "Não tem conta?",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cadastro", className: "text-primary font-semibold", children: "Cadastre-se" })
              ] })
            ] })
          ]
        }
      )
    }
  ) });
}
function Field$3({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        onChange: (e) => onChange(e.target.value),
        required: true,
        placeholder,
        className: "mt-1 w-full h-10 px-3 rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      }
    )
  ] });
}
const $$splitComponentImporter$r = () => import("./esqueci-senha-Bb6TkAow.js");
const Route$H = createFileRoute("/esqueci-senha")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const getApiErrorMessage = (data) => {
  if (typeof data !== "object" || data === null || !("error" in data))
    return null;
  const message = data.error;
  return typeof message === "string" && message.length > 0 ? message : null;
};
const getInvokeErrorMessage = async (error, fallback) => {
  const context = typeof error === "object" && error !== null && "context" in error ? error.context : null;
  if (context) {
    try {
      const payload = await context.clone().json();
      const apiError = getApiErrorMessage(payload);
      if (apiError) return apiError;
    } catch {
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
};
async function createPixPayment(input) {
  const { data, error } = await supabase.functions.invoke("mp-create-pix", {
    body: input
  });
  if (error)
    throw new Error(await getInvokeErrorMessage(error, "Falha ao criar pagamento Pix"));
  const apiError = getApiErrorMessage(data);
  if (apiError) throw new Error(apiError);
  return data;
}
async function createCardPayment(input) {
  const { data, error } = await supabase.functions.invoke("mp-create-card", {
    body: input
  });
  if (error)
    throw new Error(await getInvokeErrorMessage(error, "Falha ao processar cartão"));
  const apiError = getApiErrorMessage(data);
  if (apiError) throw new Error(apiError);
  return data;
}
async function fetchOrder(id) {
  const { data, error } = await supabase.rpc("get_pix_order_status", {
    _id: id
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
}
async function fetchPaymentPublicKey() {
  const { data, error } = await supabase.rpc("get_payment_public_key");
  if (error) return null;
  const key = typeof data === "string" ? data : null;
  return key && key.length > 0 ? key : null;
}
async function fetchInstallmentConfig() {
  const { data, error } = await supabase.rpc(
    "get_payment_installment_config"
  );
  if (error || !data) return { max_installments: 1, installment_fees: {} };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    max_installments: Number(row?.max_installments ?? 1),
    installment_fees: row?.installment_fees ?? {}
  };
}
const isIterable = (obj) => Symbol.iterator in obj;
const hasIterableEntries = (value) => (
  // HACK: avoid checking entries type
  "entries" in value
);
const compareEntries = (valueA, valueB) => {
  const mapA = valueA instanceof Map ? valueA : new Map(valueA.entries());
  const mapB = valueB instanceof Map ? valueB : new Map(valueB.entries());
  if (mapA.size !== mapB.size) {
    return false;
  }
  for (const [key, value] of mapA) {
    if (!mapB.has(key) || !Object.is(value, mapB.get(key))) {
      return false;
    }
  }
  return true;
};
const compareIterables = (valueA, valueB) => {
  const iteratorA = valueA[Symbol.iterator]();
  const iteratorB = valueB[Symbol.iterator]();
  let nextA = iteratorA.next();
  let nextB = iteratorB.next();
  while (!nextA.done && !nextB.done) {
    if (!Object.is(nextA.value, nextB.value)) {
      return false;
    }
    nextA = iteratorA.next();
    nextB = iteratorB.next();
  }
  return !!nextA.done && !!nextB.done;
};
function shallow(valueA, valueB) {
  if (Object.is(valueA, valueB)) {
    return true;
  }
  if (typeof valueA !== "object" || valueA === null || typeof valueB !== "object" || valueB === null) {
    return false;
  }
  if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) {
    return false;
  }
  if (isIterable(valueA) && isIterable(valueB)) {
    if (hasIterableEntries(valueA) && hasIterableEntries(valueB)) {
      return compareEntries(valueA, valueB);
    }
    return compareIterables(valueA, valueB);
  }
  return compareEntries(
    { entries: () => Object.entries(valueA) },
    { entries: () => Object.entries(valueB) }
  );
}
function useShallow(selector) {
  const prev = React.useRef(void 0);
  return (state) => {
    const next = selector(state);
    return shallow(prev.current, next) ? prev.current : prev.current = next;
  };
}
async function safeInvoke(fn, body) {
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) {
      console.warn(`[email] ${fn}:`, error.message);
      return false;
    }
    const payload = data;
    if (payload?.error) {
      console.warn(`[email] ${fn}:`, payload.error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[email] ${fn} falhou`, e);
    return false;
  }
}
const sendWelcomeEmail = (p2) => safeInvoke("send-welcome-email", p2);
const sendPasswordResetEmail = (p2) => safeInvoke("send-password-reset-email", p2);
const sendOrderConfirmationEmail = (p2) => safeInvoke("send-order-confirmation-email", p2);
const emails = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
}, Symbol.toStringTag, { value: "Module" }));
const mpIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAItklEQVR4nO1YaVST2RlOz7Tn9EfbH7Y9xyws+b4shATCGhREIDhadq0LM/ZoR9RWHeuM20xHzUKAQEAQhYjigrhUUQe0eABlExynLuPMtCojbqMjriwakNWRp+d+lBhMUAK0/cN7zvMnee97n+fe9977vh+LNWZjNmZjNmb/fZv9jlCWuELioX9ASXUPxwtUQaMZ/dfitb+kpbpKWpbQKvVJOewg1nBGMz5L7pdaEfH77R3nLtxGedV3L/muOhOX1gST//xWlwe7LyraLo09cFEUlvuEmrS508nT8JInS+rl0GpwXeLh5GF46eyX3k1N2vxMHLGzznXW3gLJ9Pw4tkjzG0LeyUV74S+rjrbc/aEJOn1pt7NE1zzeeb3TqAngCTW9bW0dCI0wovaLG6j54sZLSp7U7axIf0FIOvukQfb+QfhtqEVQ1mVMyb+F3xU9QlRFK6Kr2hBe3IipBfeg3HUDE3VfQr74GETTtoMn0fU6SBM7l68pNDW3tGFG7E7UnLmOuCV/a+PSG+aPAvXZ73CoDR8QkmWnrmLt+uPwDtiInp4eIgIOEh2UudcQc6bTftR2wG32PixZU4Tu7m6kbqqA3+QMXPrmLpTh2b1cgeYQT7iOOyL6Ek/9kpCw7C5tUkmvu8KAP8TthZuvgdkFIsKYdxYuoUZEn35utwBmt2Jy0dHRiZanbYialYuZc3fDyz8Niz88hKUfHX7h7ptydUQCBD6GOO/A9B+1SaU4WV7HrBQhT1KJCCAIez8P/vFn7SIfUdoCyjMZN28/YWJkbKnCZ+piJv71G4+QmV2NuXF7f+S76hp5PM24YZEXzdwf5uiV2u3kZYDioxLIp25FaPQ2VFRfQ3t7p1nAV9/cBe2bhqjK1iEL8Fp2AsvXFZtjENy89Rir1x+HWJEK/xUlmKCuhYM8uYcr1NzhOm+Q20VeMn3PHJ6LrpcOzkb435+YJw7N/BaKsBw4iOMhkOtxpe4+M/nsxQeh+Kx6SOTDjj8G5ZGMhvst6OzsQuwf80HOmMQvDaGryxB58qnZlxx+KnBLF4dWPx8v1EweEnnnkOzJPJeEl4IQIyLLXgV7HUrDBYRG5TDbfq3+IWivFESeGty/Hx4LPse65FOM8B15Z+E7fReiazoG9SeC6MAtnUQER6jxeCN5cic7ylPaSdoQ9W+7RWSTNuHipTsMmbiVhfBeefKNY6YdboDAKwVNTa3MmMBpWQjZWf9W0eEnmsBz1xMRd37rqvnFoAIESuNxsp3BOVeHlA7Bi47g0NFLDJnv7zQyqfGmXZDPP4KkzCpz3juK44d8gwXn1DGpxqZVqTbJu05IH8cVa3ulc/YP+TCGrihG7u6zZkLzlh+B4q/Vg+Y+7ZFsXv1npuegZIl23V4uMbtNHEr9nGSKlQBxzJ50ojA07+bQBawsgXF7rVnA5SsNoH1SEV3dZuXrubQYq7QlZt/GRhMotyS7BBBuTHli65UWReyo5/ul2xdwVSmyt9UMuA4j5uXDP+mc1UHke+hxr6HZ7PfkiQmOLjq75iNwlOtbOZR6h5UAauKmTrf5R+wKNmVNmZWAU1XfQTJl6wC/CZozeG9pwQC/R4+fgbZzBwiks/c3cWjVRSsBju76XlJgKdZWMHkckHQOQcYrePfgD4isMNkMpvy0HCnp5QOIdXV1QxaQgSn7vjf7iUOymSLt9YdL5j/4jk8rfMjUWZPSLmGCqpbh5b2iBMJ3c16wKXWDtQCRlql1tMknsS6pDH9eU4SouXnwUW4BX5oIWUgWfBYcwcT4swg79rjvZsj4GguXHRxAjCAxswoei4r6din/FtwnZzLvhaUPKU0C5uxhfEjVGpT1L/gsK4Zn1E5Qcj1k/huhnJ6L9xbtx8r1xVDrS2HIqGA4Oonju61TSJYAXXKZFRkCMnn99Uc4/PnXWPjxUYi8U+AWngvf1eXwCky3ItfQ0Aw+uVIrTMzDZcg+bRUzNaMCPrH74L2wEM6yJEyL3YX0rGr84/xtprizxYOA1GV8V127lQCZwtA794P8QQdaglSQxaVXEDpzJ3MrVJ2ut/KJWbCfqWf48mTcf9BiNd43MANCLwPSsk4zgocyL0Hs/D0QuSc2WQkIjMxppaQJzP081GBMKlTU4fLVvprIEsdOXAZPkoDI+XttLkD+gfNvXGlbIP7OEh0EssQaKwGSUGMhWU3Lh2kkMJnawRVqsH3Pl6MSr6enB1tza5kd59DqZOtDLI0PIH96TkxDc3PfazkSPHj4lBFgMA68ZoeLxkYT3BQGps/m8TUKKwEsFusnDm7628Th408Khz0RSQ9S4AXE7IA09gD4XinIK/hqxIuyfNXRvtWnVJcIV1sCWFxKo+QINIyjPCizf7sGQOShh8gzeQD40gTz/w5CLSRBm5mWkZTJ5Bp1m74bzq6Jr3xEWghfiyHyTGb6jNfnI/XTrIUHXv1GqUJtkjeLECdk9TvbalJIWUD6BEtEVdp+6AZDdE27VYzIsqc2K1PPJcWWgjax3mpBmp/yXHVV/YPkcYV2tYujhahKE9znHbZc+VJv7z/97O0CWCyWk5Pm5xxJfGX/YL5/JpS7rv/PyIfk1IHvlzGAPOE0JPKWO8EVa83pRM6G64z8IXVQw0JtB4Kzr0Ac0fc4WpDfQriwhmscgSqKK45vsgwqnLqtryayaPiHi6kF95jiURCU9doBVj1mU6oZrNEw0gFxhZp1XFF864BJBBoIlEZ4fXgCAfrzmJJ/G5HlzwZdYdLbKnfUM+W1fEEhqAkWafIfsCl1F5tSpw/7e9CbjDTUbEr1CVcc32Driu0HV6iFg7sepEFyVmyEg0w/qC/nFR5xaFXKqH+ZHszYtMaLQ6n0XJH2JodWMy+kvWDT6gdsWrWVS6tCyHdY1v/Lxgk0v2LzVYFsSrWCTamNbEpdwKZVlWxa/S2bVv2TQ6lPcyhVEZtW72JT6k/HU6qwEX+4HbMxG7MxG7MxY7FY/wbq+hAwZfvSTAAAAABJRU5ErkJggg==";
const SDK_URL = "https://sdk.mercadopago.com/js/v2";
let sdkPromise = null;
function loadMpSdk() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s2 = document.createElement("script");
    s2.src = SDK_URL;
    s2.async = true;
    s2.onload = () => resolve();
    s2.onerror = () => reject(new Error("Falha ao carregar SDK Mercado Pago"));
    document.head.appendChild(s2);
  });
  return sdkPromise;
}
const onlyDigits = (v2) => v2.replace(/\D/g, "");
const formatCard = (v2) => onlyDigits(v2).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
const formatExp = (v2) => {
  const d2 = onlyDigits(v2).slice(0, 4);
  return d2.length <= 2 ? d2 : `${d2.slice(0, 2)}/${d2.slice(2)}`;
};
const formatCpf = (v2) => {
  const d2 = onlyDigits(v2).slice(0, 11);
  return d2.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};
function CardPaymentModal({ open, onClose, onSuccess, payload }) {
  const baseTotal = payload.totals.total;
  const [publicKey, setPublicKey] = reactExports.useState(null);
  const [keyLoading, setKeyLoading] = reactExports.useState(true);
  const [mp, setMp] = reactExports.useState(null);
  const [sdkErr, setSdkErr] = reactExports.useState(null);
  const [cfg, setCfg] = reactExports.useState({
    max_installments: 1,
    installment_fees: {}
  });
  const [card, setCard] = reactExports.useState({
    number: "",
    name: "",
    exp: "",
    cvv: "",
    doc: "",
    installments: 1
  });
  const [pmId, setPmId] = reactExports.useState(null);
  const [issuerId, setIssuerId] = reactExports.useState(null);
  const [brand, setBrand] = reactExports.useState(
    null
  );
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [errorMsg, setErrorMsg] = reactExports.useState(null);
  const [mounted, setMounted] = reactExports.useState(false);
  const lastBin = reactExports.useRef("");
  reactExports.useEffect(() => setMounted(true), []);
  reactExports.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return;
    setKeyLoading(true);
    fetchPaymentPublicKey().then((k2) => setPublicKey(k2)).finally(() => setKeyLoading(false));
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return;
    fetchInstallmentConfig().then(setCfg);
  }, [open]);
  reactExports.useEffect(() => {
    if (!open || !publicKey) return;
    loadMpSdk().then(
      () => setMp(new window.MercadoPago(publicKey, { locale: "pt-BR" }))
    ).catch((e) => setSdkErr(e.message));
  }, [open, publicKey]);
  reactExports.useEffect(() => {
    if (!mp) return;
    const digits = onlyDigits(card.number);
    const bin = digits.slice(0, 8);
    if (bin.length < 6) {
      setPmId(null);
      setBrand(null);
      setIssuerId(null);
      return;
    }
    if (bin === lastBin.current) return;
    lastBin.current = bin;
    (async () => {
      try {
        const pm = await mp.getPaymentMethods({ bin });
        const m2 = pm?.results?.[0];
        if (!m2) return;
        setPmId(m2.id);
        setBrand({ name: m2.name, thumb: m2.thumb });
        try {
          const inst = await mp.getInstallments({
            amount: String(baseTotal.toFixed(2)),
            bin,
            paymentTypeId: "credit_card"
          });
          const issuers = inst?.[0]?.issuer ?? null;
          if (issuers?.id) setIssuerId(String(issuers.id));
        } catch {
        }
      } catch (e) {
        console.warn("[mp] bin lookup falhou", e);
      }
    })();
  }, [card.number, mp, baseTotal]);
  const installmentOptions = reactExports.useMemo(() => {
    const max = Math.max(1, Math.min(12, cfg.max_installments || 1));
    const opts = [];
    for (let n = 1; n <= max; n++) {
      const feePct = Number(cfg.installment_fees?.[String(n)] ?? 0) || 0;
      let fee = 0;
      if (feePct > 0 && baseTotal > 0) {
        const raw = Math.round(baseTotal * (feePct / 100) * 100) / 100;
        fee = Math.max(0.01, raw);
      }
      const total2 = Math.round((baseTotal + fee) * 100) / 100;
      opts.push({ n, feePct, total: total2, per: total2 / n, fee });
    }
    return opts;
  }, [cfg, baseTotal]);
  const selected = installmentOptions.find((o) => o.n === card.installments) ?? installmentOptions[0];
  const total = selected?.total ?? baseTotal;
  const canSubmit = reactExports.useMemo(() => {
    const baseFilled = onlyDigits(card.number).length >= 13 && card.name.trim().length >= 2 && onlyDigits(card.exp).length === 4 && onlyDigits(card.cvv).length >= 3 && onlyDigits(card.doc).length === 11;
    return mp && pmId && baseFilled && !submitting;
  }, [mp, pmId, card, submitting]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const [mm, yy] = card.exp.split("/");
      const tokenRes = await mp.createCardToken({
        cardNumber: onlyDigits(card.number),
        cardholderName: card.name.trim(),
        cardExpirationMonth: mm,
        cardExpirationYear: `20${yy}`,
        securityCode: onlyDigits(card.cvv),
        identificationType: "CPF",
        identificationNumber: onlyDigits(card.doc)
      });
      if (!tokenRes?.id)
        throw new Error("Não foi possível validar o cartão. Confira os dados.");
      const result = await createCardPayment({
        ...payload,
        card: {
          token: tokenRes.id,
          payment_method_id: pmId,
          issuer_id: issuerId ?? void 0,
          installments: card.installments,
          payer: {
            identification: { type: "CPF", number: onlyDigits(card.doc) }
          }
        }
      });
      if (result.status === "approved") {
        toast.success("Pagamento aprovado! 🎉");
        onSuccess(result);
      } else if (result.status === "pending") {
        toast.message("Pagamento em análise. Avisaremos por WhatsApp.");
        onSuccess(result);
      } else {
        setErrorMsg(
          detailMsg(result.status_detail) || "Pagamento recusado pelo emissor. Tente outro cartão."
        );
      }
    } catch (e2) {
      const msg = e2?.message || String(e2);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };
  if (!open || !mounted || typeof document === "undefined") return null;
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in sm:p-4",
        onClick: onClose,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full sm:max-w-3xl bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95dvh] sm:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 bg-card/95 backdrop-blur px-5 pt-5 pb-3 border-b border-border flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full gradient-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-primary-foreground" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm", children: "Pagamento com cartão" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                      " Conexão segura"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "w-8 h-8 rounded-full hover:bg-muted grid place-items-center",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                  }
                )
              ] }),
              sdkErr && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m-5 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
                sdkErr
              ] }),
              !keyLoading && !publicKey && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
                  " Pagamento por cartão indisponível"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: "O lojista ainda não configurou as credenciais do Mercado Pago. Use Pix para finalizar o pedido." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 overflow-y-auto sm:grid sm:grid-cols-[1fr_1.1fr] sm:gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-5 sm:sticky sm:top-[68px] sm:self-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl p-5 text-white shadow-elegant overflow-hidden bg-gradient-to-br from-primary via-rose to-primary/70", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-7 rounded-md bg-yellow-300/80 border border-yellow-200/50" }),
                    brand?.thumb && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: brand.thumb,
                        alt: brand.name,
                        className: "h-8 w-auto bg-white/95 rounded p-1"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-6 font-mono text-lg tracking-widest", children: (card.number || "•••• •••• •••• ••••").padEnd(19, "•").slice(0, 19) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 flex justify-between text-[11px] uppercase opacity-90", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-70 text-[9px]", children: "Titular" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold tracking-wide truncate max-w-[180px]", children: card.name || "NOME NO CARTÃO" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-70 text-[9px]", children: "Validade" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold tracking-wide", children: card.exp || "MM/AA" })
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "p-5 space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Field$2,
                    {
                      label: "Número do cartão",
                      value: card.number,
                      onChange: (v2) => setCard({ ...card, number: formatCard(v2) }),
                      placeholder: "0000 0000 0000 0000",
                      inputMode: "numeric",
                      autoComplete: "cc-number"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Field$2,
                    {
                      label: "Nome impresso no cartão",
                      value: card.name,
                      onChange: (v2) => setCard({ ...card, name: v2.toUpperCase() }),
                      placeholder: "COMO ESTÁ NO CARTÃO",
                      autoComplete: "cc-name"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Field$2,
                      {
                        label: "Validade",
                        value: card.exp,
                        onChange: (v2) => setCard({ ...card, exp: formatExp(v2) }),
                        placeholder: "MM/AA",
                        inputMode: "numeric",
                        autoComplete: "cc-exp"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Field$2,
                      {
                        label: "CVV",
                        value: card.cvv,
                        onChange: (v2) => setCard({ ...card, cvv: onlyDigits(v2).slice(0, 4) }),
                        placeholder: "123",
                        inputMode: "numeric",
                        autoComplete: "cc-csc"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Field$2,
                    {
                      label: "CPF do titular",
                      value: card.doc,
                      onChange: (v2) => setCard({ ...card, doc: formatCpf(v2) }),
                      placeholder: "000.000.000-00",
                      inputMode: "numeric"
                    }
                  ),
                  installmentOptions.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Parcelas" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "select",
                      {
                        value: card.installments,
                        onChange: (e) => setCard({ ...card, installments: Number(e.target.value) }),
                        className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50",
                        children: installmentOptions.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: o.n, children: [
                          o.n,
                          "x de ",
                          brl(o.per),
                          o.feePct > 0 ? ` — total ${brl(o.total)} (juros ${o.feePct.toString().replace(".", ",")}%)` : " sem juros"
                        ] }, o.n))
                      }
                    )
                  ] }),
                  selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-muted/40 p-3 space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Valor do pedido" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: brl(baseTotal) })
                    ] }),
                    selected.feePct > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Juros do cartão de crédito (",
                        selected.feePct.toString().replace(".", ","),
                        "%)"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "+ ",
                        brl(selected.fee)
                      ] })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sem juros" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "—" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-bold pt-1.5 border-t border-border", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total a pagar" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: brl(selected.total) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[11px] text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Parcelamento" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
                        selected.n,
                        "x de ",
                        brl(selected.per)
                      ] })
                    ] }),
                    selected.feePct > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground pt-1 leading-tight", children: "Taxa de juros do cartão de crédito aplicada conforme número de parcelas escolhido." })
                  ] }),
                  errorMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
                    errorMsg
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: !canSubmit,
                      className: cn(
                        "w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition-all",
                        canSubmit ? "gradient-primary text-primary-foreground active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed"
                      ),
                      children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                        " Processando..."
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                        " Pagar ",
                        brl(total)
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 pt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: mpIcon,
                        alt: "Mercado Pago",
                        className: "h-4 w-4 object-contain"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                      "Pagamento criptografado por",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Mercado Pago" })
                    ] })
                  ] })
                ] })
              ] })
            ]
          }
        )
      }
    ),
    document.body
  );
}
function Field$2({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        inputMode,
        autoComplete,
        className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all"
      }
    )
  ] });
}
function detailMsg(detail) {
  if (!detail) return null;
  const map = {
    cc_rejected_insufficient_amount: "Cartão sem limite suficiente.",
    cc_rejected_bad_filled_card_number: "Número do cartão incorreto.",
    cc_rejected_bad_filled_date: "Data de validade incorreta.",
    cc_rejected_bad_filled_security_code: "CVV incorreto.",
    cc_rejected_bad_filled_other: "Confira os dados do cartão.",
    cc_rejected_call_for_authorize: "Você precisa autorizar o pagamento com o banco emissor.",
    cc_rejected_high_risk: "Pagamento recusado por análise de risco. Tente outro cartão ou Pix.",
    cc_rejected_other_reason: "Pagamento recusado. Tente outro cartão."
  };
  return map[detail] ?? null;
}
const pixIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADmElEQVR4nO2ZbU/TUBTH9w3UT2KyzV5fkDgVn6KRROVr+MaXgPpl1HcmxGQs3Rjb2t4ZtrVFRHxCg0ICbiB7kDnGOObcrWzsibW9ZcVwkpM07Xru/5feh3POPJ4z+89sRHp3QaD6U0HRMkTRSg1PE0Wfujinnfe42UhSCxBFzxKqQzcXqP7rMlWveNxoJLlwR6BauZf4Q1e0iiCrY55TKZ66EIKYFe8mCGJVvBsgiF3xw4QgvMTTIUBwF09PEMI3HR7zheJlvyiDEE/hoDyEA8bCmP5QvOKbFscdEZ/L5R7t1WoHpWoVMrlteK4vgSBKIMiqZfECvitKLJaa2waMjWPgWFzFJ36uP67WajVos1R2CwJhCQQpY168lGHvprPb7WFhb3//IPJj7QkX8ZfCyj1vMFr2BucAPSDGYVJdhI3dMhtseacAV01C4G/xneWdAouBsSbURQiEE2yMukcr/lD8If8Fi3M2Ng+3ZmX4XiwxAR9NQBji8R00jIGxMGbHmrKzsI/bbVDIaFiCr4UiE/JppwDXIv0h6tMmAR9+54+Kl/qAW4EYdKs0IL7k6xCf870hLImnFiDM7vMMIiIfQnwrlOBGmzC8vh6RGKAh/uYxX4tYgajn81rFyo7SC8IQbzyzJJ42IXrWE1hJ9StGBoOQYKWxJlDwePwtc0M8Phu1Kp42xqHapi+dPtcBgGWg1aBHIGblw4XdangPn9kRT5pfYrILgKbaDtyAGBET8GJlFdb+7DLHa7zHRTxlAOnO+Y/FN4/g6LIK/mgS/KFE3aNJdo9XfIFqhW5foHhaAIii5zsBsA3CbQrF4dXKKqw3ptBL3lOI6qkuU0ifcnwR29yBiOFJbaIDAJtO2LfhuY0+ijmwjSraRtdtFA0PCcsHWUtK0e0gaz2FB04hqImDrAmh3zadSrQkdd3yIVt5EG2KJ8mF+33Fm4Uwk5HaTebIoOIHhTDmvJV0eslkOk3Miu8LccIFDbEq3jAhrNz1BmNl70wM0ANiAqbURdgs/+VaUk5iSSkm2BjMg3MVvyg98DhZ1M+zol62VdSnslvOFvXtbZXiXpV1Ep5p77m0VQRRYrEwJsZ2pK1imO/1TL2xFVb4N7bCSr2x9SbijHir54Qj+7zrIJQTFM8dQhmCeG4QyhDF24Zwg3jLEG4SbxrCjeINw1wd+zY9Dy5F23DtH92GYbWEfRusW7FR0GgWzGMZ2LOSOjPP6bV/lQMAGil/vdYAAAAASUVORK5CYII=";
function PixPaymentModal({ open, payload, onClose }) {
  const navigate = useNavigate();
  const createRequestId = reactExports.useRef(0);
  const [creating, setCreating] = reactExports.useState(false);
  const [pix, setPix] = reactExports.useState(null);
  const [order, setOrder] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!open || !payload) return;
    const requestId = createRequestId.current + 1;
    createRequestId.current = requestId;
    setCreating(true);
    setError(null);
    setPix(null);
    setOrder(null);
    createPixPayment(payload).then((r2) => {
      if (createRequestId.current !== requestId) return;
      setPix(r2);
    }).catch((e) => {
      if (createRequestId.current !== requestId) return;
      setError(e instanceof Error ? e.message : "Falha ao gerar Pix");
    }).finally(() => {
      if (createRequestId.current === requestId) setCreating(false);
    });
  }, [open, payload]);
  reactExports.useEffect(() => {
    if (!open || !pix) return;
    let cancelled = false;
    let timer;
    const tick = async () => {
      try {
        const o = await fetchOrder(pix.order_id);
        if (cancelled) return;
        if (!o) {
          timer = setTimeout(tick, 4e3);
          return;
        }
        setOrder(o);
        if (o.payment_status === "approved") {
          if (payload) {
            useStore.getState().saveRemoteOrder({
              id: o.id,
              customerName: payload.customer.name,
              customerEmail: payload.customer.email,
              customerPhone: payload.customer.phone,
              items: payload.items.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image ?? ""
              })),
              subtotal: payload.totals.subtotal,
              discount: payload.totals.discount,
              shipping: payload.totals.shipping,
              total: payload.totals.total,
              paymentMethod: "pix",
              deliveryMethod: payload.delivery,
              address: payload.address ?? "",
              notes: payload.notes,
              status: "pago",
              paidAt: (/* @__PURE__ */ new Date()).toISOString()
            });
            void sendOrderConfirmationEmail({
              email: payload.customer.email,
              customerName: payload.customer.name,
              orderId: o.id,
              items: payload.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
              })),
              total: payload.totals.total,
              paymentMethod: "Pix"
            });
          }
          playBeep();
          toast.success("Pagamento aprovado! 🎉");
          navigate({ to: "/pedido/$id", params: { id: o.id } });
          onClose();
          setTimeout(() => {
            useStore.getState().clearCart();
          }, 100);
          return;
        }
        if (["rejected", "cancelled", "expired"].includes(o.payment_status)) {
          return;
        }
        timer = setTimeout(tick, 4e3);
      } catch {
        timer = setTimeout(tick, 6e3);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, pix, navigate, onClose]);
  reactExports.useEffect(() => {
    if (!open) {
      createRequestId.current += 1;
      setPix(null);
      setOrder(null);
      setError(null);
      setCreating(false);
    }
  }, [open]);
  const copyCode = () => {
    const code = order?.pix_qr_code ?? pix?.qr_code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Código Pix copiado!");
  };
  if (!open) return null;
  const status = order?.payment_status ?? "pending";
  const qrCode = order?.pix_qr_code ?? pix?.qr_code ?? "";
  const qrBase64 = order?.pix_qr_code_base64 ?? pix?.qr_code_base64 ?? "";
  const total = order?.total ?? pix?.total ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-soft w-full max-w-sm relative max-h-[92vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full hover:bg-muted transition-colors z-10",
        "aria-label": "Fechar",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
      creating && !pix && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-7 w-7 animate-spin mx-auto text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-sm", children: "Gerando seu Pix..." })
      ] }),
      error && !pix && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive font-semibold text-sm", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            className: "mt-3 px-5 h-10 rounded-full bg-muted font-semibold text-sm",
            children: "Fechar"
          }
        )
      ] }),
      pix && status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-14 w-14 grid place-items-center rounded-full bg-success/10 text-success mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Pagamento aprovado!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Redirecionando para seu pedido..." })
      ] }),
      pix && ["rejected", "cancelled", "expired"].includes(status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold text-destructive", children: [
          "Pagamento ",
          status === "expired" ? "expirado" : "não aprovado"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Você pode tentar novamente." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            className: "mt-3 px-5 h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm",
            children: "Voltar"
          }
        )
      ] }),
      pix && status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 pr-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pixIcon, alt: "Pix", className: "h-6 w-6 object-contain" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-base leading-tight", children: "Pague com Pix" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
              brl(Number(total)),
              " · Confirmação automática"
            ] })
          ] })
        ] }),
        qrBase64 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center bg-white rounded-lg p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: `data:image/png;base64,${qrBase64}`,
            alt: "QR Code Pix",
            className: "w-40 h-40"
          }
        ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-6 text-xs", children: "QR Code indisponível" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] font-medium text-muted-foreground", children: "Pix Copia e Cola" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              readOnly: true,
              value: qrCode,
              className: "mt-1 w-full h-14 px-2 py-1.5 rounded-lg bg-muted border border-border text-[11px] font-mono outline-none resize-none",
              onFocus: (e) => e.target.select()
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: copyCode,
              className: "mt-2 w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
                " Copiar código Pix"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5 justify-center text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin text-primary" }),
          "Aguardando confirmação do pagamento..."
        ] })
      ] })
    ] })
  ] }) });
}
const cardIcon = "/assets/card-icon-CuLBUZyB.png";
const Route$G = createFileRoute("/checkout")({
  component: Page$7
});
const steps = ["Seus dados", "Pagamento", "Revisão"];
function Page$7() {
  const navigate = useNavigate();
  const { cart, settings, placeOrder, products } = useStore();
  const customer = useStore(selectCurrentCustomer);
  const totals = useStore(useShallow(selectCartTotals));
  const [step, setStep] = reactExports.useState(0);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [cardModal, setCardModal] = reactExports.useState(null);
  const [pixModal, setPixModal] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    payment: "pix",
    notes: ""
  });
  const [installmentInfo, setInstallmentInfo] = reactExports.useState({ max: 1, maxSemJuros: 1 });
  reactExports.useEffect(() => {
    fetchInstallmentConfig().then((cfg) => {
      const max = Math.max(1, cfg.max_installments || 1);
      let maxSemJuros = 1;
      for (let n = 1; n <= max; n++) {
        const fee = Number(cfg.installment_fees?.[String(n)] ?? 0);
        if (fee === 0) maxSemJuros = n;
      }
      setInstallmentInfo({ max, maxSemJuros });
    });
  }, []);
  if (cart.length === 0 && step < 4) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Carrinho vazio." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-primary font-semibold", children: "Voltar" })
    ] }) });
  }
  const next = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim())
        return toast.error("Preencha todos os campos");
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
        return toast.error("E-mail inválido");
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13)
        return toast.error("WhatsApp inválido — informe DDD + número");
    }
    setStep((s2) => s2 + 1);
  };
  const finish = async () => {
    if (submitting) return;
    const shipping = 0;
    const total = Math.max(0, totals.subtotal - totals.discount);
    const sharedPayload = {
      customer: { name: form.name, email: form.email, phone: form.phone },
      items: cart.map((it) => {
        const p2 = products.find((x2) => x2.id === it.productId);
        return {
          productId: it.productId,
          name: p2?.name ?? "Produto",
          price: p2?.price ?? 0,
          quantity: it.quantity,
          image: p2?.image
        };
      }),
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping,
        total
      },
      delivery: "retirada",
      address: settings.address,
      notes: form.notes
    };
    if (form.payment === "pix") {
      setPixModal(sharedPayload);
      return;
    }
    if (form.payment === "card") {
      setCardModal(sharedPayload);
      return;
    }
    const order = placeOrder({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      address: settings.address,
      paymentMethod: form.payment,
      deliveryMethod: "retirada",
      notes: form.notes
    });
    playBeep();
    toast.success("Pedido realizado!");
    navigate({ to: "/pedido/$id", params: { id: order.id } });
  };
  const paymentOptions = [
    {
      id: "pix",
      label: "Pix",
      sub: "Aprovação imediata · 5% off",
      icon: QrCode,
      image: pixIcon,
      enabled: settings.acceptPix
    },
    {
      id: "card",
      label: "Cartão de crédito",
      sub: installmentInfo.maxSemJuros > 1 ? `Em até ${installmentInfo.maxSemJuros}x sem juros · até ${installmentInfo.max}x` : `Em até ${installmentInfo.max}x`,
      icon: CreditCard,
      image: cardIcon,
      enabled: settings.acceptCard
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(StoreLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/carrinho",
          className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
            " Voltar"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-4", children: "Checkout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "flex items-center gap-2 mb-6", children: steps.map((s2, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0",
              i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            ),
            children: i < step ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }) : i + 1
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "h-0.5 flex-1 rounded",
              i < step ? "bg-primary" : "bg-muted"
            )
          }
        )
      ] }, s2)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-5 shadow-card", children: [
        step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Seus dados" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Field$1,
            {
              label: "Nome completo",
              value: form.name,
              onChange: (v2) => setForm({ ...form, name: v2 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Field$1,
            {
              label: "E-mail",
              type: "email",
              value: form.email,
              onChange: (v2) => setForm({ ...form, email: v2 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Field$1,
            {
              label: "WhatsApp (com DDD) — obrigatório para avisos",
              type: "tel",
              value: form.phone,
              placeholder: "(11) 91234-5678",
              onChange: (v2) => setForm({ ...form, phone: v2 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground -mt-1", children: "Enviaremos o lembrete de pagamento, confirmação de compra aprovada e aviso quando o pedido estiver pronto pelo WhatsApp." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-accent/40 border border-accent p-3 text-sm mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-accent-foreground mb-0.5", children: "📍 Retirada no ateliê" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: settings.address }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Avisaremos pelo WhatsApp quando o pedido estiver pronto para retirada." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Observações (opcional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: form.notes,
                onChange: (e) => setForm({ ...form, notes: e.target.value }),
                rows: 3,
                maxLength: 300,
                placeholder: 'Ex.: "É um presente, embale com cuidado" ou "Vou retirar na sexta de tarde"',
                className: "mt-1 w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all resize-none"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              form.notes.length,
              "/300"
            ] })
          ] })
        ] }),
        step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Forma de pagamento" }),
          paymentOptions.filter((p2) => p2.enabled).map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setForm({ ...form, payment: p2.id }),
              className: cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                form.payment === p2.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted grid place-items-center overflow-hidden", children: p2.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p2.image, alt: p2.label, className: "h-6 w-6 object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(p2.icon, { className: "h-5 w-5 text-primary" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: p2.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: p2.sub })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "w-5 h-5 rounded-full border-2",
                      form.payment === p2.id ? "border-primary bg-primary" : "border-border"
                    )
                  }
                )
              ]
            },
            p2.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/50 border border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: mpIcon,
                alt: "Mercado Pago",
                className: "h-5 w-5 object-contain"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "Pagamentos processados por",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Mercado Pago" }),
              " ",
              "· 100% seguro"
            ] })
          ] })
        ] }),
        step === 2 && (() => {
          const total = Math.max(0, totals.subtotal - totals.discount);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Revise seu pedido" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Cliente", value: form.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Row,
              {
                label: "Contato",
                value: `${form.email} · ${form.phone}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Retirada", value: "No ateliê" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Local", value: settings.address }),
            form.notes.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Observações", value: form.notes }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Row,
              {
                label: "Pagamento",
                value: paymentOptions.find((p2) => p2.id === form.payment)?.label || ""
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: brl(totals.subtotal) }),
            totals.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Desconto", value: `− ${brl(totals.discount)}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-lg pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: brl(total) })
            ] })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-4", children: [
        step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStep((s2) => s2 - 1),
            className: "flex-1 h-12 rounded-full border-2 border-border font-semibold",
            children: "Voltar"
          }
        ),
        step < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: next,
            className: "flex-1 h-12 rounded-full gradient-primary text-primary-foreground font-semibold active:scale-95 transition-all",
            children: "Continuar"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: finish,
            disabled: submitting,
            className: "flex-1 h-12 rounded-full gradient-primary text-primary-foreground font-semibold active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              " Gerando Pix..."
            ] }) : form.payment === "pix" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pixIcon, alt: "Pix", className: "h-5 w-5 object-contain" }),
              " Pagar com Pix"
            ] }) : "Confirmar pedido"
          }
        )
      ] })
    ] }),
    cardModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CardPaymentModal,
      {
        open: !!cardModal,
        payload: cardModal,
        onClose: () => setCardModal(null),
        onSuccess: (result) => {
          const p2 = cardModal;
          setCardModal(null);
          if (result.status === "approved") {
            if (p2) {
              useStore.getState().saveRemoteOrder({
                id: result.order_id,
                customerName: p2.customer.name,
                customerEmail: p2.customer.email,
                customerPhone: p2.customer.phone,
                items: p2.items.map((i) => ({
                  productId: i.productId,
                  name: i.name,
                  price: i.price,
                  quantity: i.quantity,
                  image: i.image ?? ""
                })),
                subtotal: p2.totals.subtotal,
                discount: p2.totals.discount,
                shipping: p2.totals.shipping,
                total: p2.totals.total,
                paymentMethod: "card",
                deliveryMethod: p2.delivery,
                address: p2.address ?? "",
                notes: p2.notes,
                status: "pago",
                paidAt: (/* @__PURE__ */ new Date()).toISOString()
              });
              void sendOrderConfirmationEmail({
                email: p2.customer.email,
                customerName: p2.customer.name,
                orderId: result.order_id,
                items: p2.items.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price
                })),
                total: p2.totals.total,
                paymentMethod: "Cartão de crédito"
              });
            }
            useStore.getState().clearCart();
          }
          playBeep();
          navigate({ to: "/pedido/$id", params: { id: result.order_id } });
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PixPaymentModal,
      {
        open: !!pixModal,
        payload: pixModal,
        onClose: () => setPixModal(null)
      }
    )
  ] });
}
function Field$1({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        placeholder,
        onChange: (e) => onChange(e.target.value),
        className: "mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all"
      }
    )
  ] });
}
function Row({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: value })
  ] });
}
const Route$F = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Princesa de Laços" },
      {
        name: "description",
        content: "Explore todas as categorias de laços, tiaras e acessórios."
      }
    ]
  }),
  component: Page$6
});
function Page$6() {
  const hydrated = useStoreHydrated();
  const { categories, products } = useStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-1", children: "Categorias" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-5", children: "Encontre o acessório perfeito." }),
    !hydrated ? /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryGridSkeleton, { count: 8 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: categories.map((c2) => {
      const count = products.filter(
        (p2) => p2.category === c2.id && p2.active && !p2.hidden
      ).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/categoria/$slug",
          params: { slug: c2.id },
          className: "bg-card rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col items-center text-center group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-2xl gradient-soft grid place-items-center text-4xl group-hover:scale-110 transition-transform", children: c2.image }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-semibold", children: c2.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
              count,
              " ",
              count === 1 ? "produto" : "produtos"
            ] })
          ]
        },
        c2.id
      );
    }) })
  ] }) });
}
function CartHeader() {
  const router2 = useRouter();
  const count = useStore(selectCartCount);
  useStore((s2) => s2.settings);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 gradient-primary text-primary-foreground shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-3 md:px-4 h-14 flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => router2.history.back(),
        "aria-label": "Voltar",
        className: "w-10 h-10 grid place-items-center rounded-full hover:bg-white/15 transition-colors",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex-1 text-center font-bold text-base", children: [
      "Carrinho",
      " ",
      count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-90 font-semibold", children: [
        "(",
        count,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-10" })
  ] }) });
}
const Route$E = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho — Princesa de Laços" }] }),
  component: Page$5
});
function Page$5() {
  const {
    cart,
    products,
    updateCartQty,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon
  } = useStore();
  const totals = useStore(useShallow(selectCartTotals));
  const [code, setCode] = reactExports.useState("");
  if (cart.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { header: /* @__PURE__ */ jsxRuntimeExports.jsx(CartHeader, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto text-center py-20 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 mx-auto rounded-full gradient-soft grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-9 w-9 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold mt-4", children: "Seu carrinho está vazio" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Que tal escolher um lacinho lindo?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "mt-6 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold",
          children: "Explorar produtos"
        }
      )
    ] }) });
  }
  const handleCoupon = () => {
    const r2 = applyCoupon(code);
    r2.ok ? toast.success(r2.message) : toast.error(r2.message);
    if (r2.ok) setCode("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { header: /* @__PURE__ */ jsxRuntimeExports.jsx(CartHeader, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/",
        className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
          " Continuar comprando"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-4", children: "Meu carrinho" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: cart.map((ci) => {
        const p2 = products.find((x2) => x2.id === ci.productId);
        if (!p2) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: "bg-card rounded-2xl p-3 flex gap-3 shadow-card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: "/produto/$id",
                  params: { id: p2.id },
                  className: "shrink-0",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: p2.image,
                      alt: p2.name,
                      className: "w-20 h-20 object-cover rounded-xl bg-muted",
                      loading: "lazy"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/produto/$id",
                    params: { id: p2.id },
                    className: "font-medium text-sm line-clamp-2 hover:text-primary",
                    children: p2.name
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary font-bold text-sm mt-1", children: brl(p2.price) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-muted rounded-full", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => updateCartQty(p2.id, ci.quantity - 1),
                        className: "w-8 h-8 grid place-items-center",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-sm font-semibold", children: ci.quantity }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => updateCartQty(
                          p2.id,
                          Math.min(p2.stock, ci.quantity + 1)
                        ),
                        className: "w-8 h-8 grid place-items-center",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => removeFromCart(p2.id),
                      className: "w-8 h-8 grid place-items-center text-muted-foreground hover:text-destructive",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ] })
            ]
          },
          ci.productId
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "bg-card rounded-2xl p-4 shadow-card h-fit lg:sticky lg:top-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Resumo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: appliedCoupon ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-success/10 text-success rounded-xl px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3.5 w-3.5" }),
            appliedCoupon
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: removeCoupon, className: "text-xs underline", children: "remover" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: code,
              onChange: (e) => setCode(e.target.value.toUpperCase()),
              placeholder: "CUPOM",
              className: "flex-1 h-10 px-3 rounded-xl bg-muted text-sm uppercase outline-none focus:ring-2 ring-primary/40"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleCoupon,
              className: "px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold",
              children: "Aplicar"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "text-sm space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: brl(totals.subtotal) })
          ] }),
          totals.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-success", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Desconto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
              "− ",
              brl(totals.discount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Retirada" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: "No ateliê · sem custo" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-base pt-2 border-t border-border mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-primary", children: brl(Math.max(0, totals.subtotal - totals.discount)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/checkout",
            className: "mt-4 w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center active:scale-95 transition-all",
            children: "Finalizar compra"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[11px] text-muted-foreground text-center", children: "Cupons disponíveis: PRIMEIRA10, PRINCESA20" })
      ] })
    ] })
  ] }) });
}
const Route$D = createFileRoute("/cadastro")({
  component: Page$4
});
function Page$4() {
  const navigate = useNavigate();
  const router2 = useRouter();
  const registerCustomer = useStore((s2) => s2.registerCustomer);
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    router2.preloadRoute({ to: "/perfil" }).catch(() => {
    });
  }, [router2]);
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const r2 = await registerCustomer(form);
    if (r2.ok) {
      supabase.functions.invoke("send-welcome-email", {
        body: { email: form.email, name: form.name }
      }).catch((err) => console.warn("welcome email failed", err));
      navigate({ to: "/perfil" });
      toast.success(r2.message);
    } else {
      toast.error(r2.message);
      setSubmitting(false);
    }
  };
  const close = () => navigate({ to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-overlay-in",
      onClick: close,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-full max-w-[340px] sm:max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl animate-modal-in",
          onClick: (e) => e.stopPropagation(),
          role: "dialog",
          "aria-modal": "true",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gradient-primary text-primary-foreground px-4 pt-4 pb-5 relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: close,
                  className: "absolute right-3 top-3 w-7 h-7 grid place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors",
                  "aria-label": "Fechar",
                  type: "button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: "Crie sua conta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground/90 text-xs", children: "Preencha os dados para começar." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "px-4 py-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Field,
                {
                  label: "Nome completo",
                  value: form.name,
                  onChange: (v2) => setForm({ ...form, name: v2 }),
                  placeholder: "Como devemos te chamar?"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Field,
                {
                  label: "E-mail",
                  type: "email",
                  value: form.email,
                  onChange: (v2) => setForm({ ...form, email: v2 }),
                  placeholder: "seu@email.com"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Field,
                {
                  label: "Telefone",
                  value: form.phone,
                  onChange: (v2) => setForm({ ...form, phone: v2 }),
                  placeholder: "(11) 99999-9999"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Field,
                {
                  label: "Senha",
                  type: "password",
                  value: form.password,
                  onChange: (v2) => setForm({ ...form, password: v2 }),
                  placeholder: "Mínimo 6 caracteres"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  disabled: submitting,
                  className: "w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm disabled:opacity-70",
                  children: submitting ? "Criando..." : "Criar conta"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground pt-0.5", children: [
                "Já tem conta?",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary font-semibold", children: "Entrar" })
              ] })
            ] })
          ]
        }
      )
    }
  ) });
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        onChange: (e) => onChange(e.target.value),
        required: true,
        placeholder,
        className: "mt-1 w-full h-10 px-3 rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      }
    )
  ] });
}
function ProductCard({ product }) {
  const [imgError, setImgError] = reactExports.useState(false);
  const customer = useStore(selectCurrentCustomer);
  const toggleFavorite = useStore((s2) => s2.toggleFavorite);
  const isFav = !!customer?.favorites?.includes(product.id);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const reviews = useStore((s2) => s2.reviews);
  const productReviews = reviews.filter((r2) => r2.productId === product.id);
  const seed = product.id.charCodeAt(1) || 3;
  const sold = 50 + seed * 37 % 950;
  const realCount = productReviews.length;
  const realAvg = realCount ? productReviews.reduce((a, r2) => a + r2.rating, 0) / realCount : 0;
  const rating = realCount > 0 ? realAvg.toFixed(1) : (4 + seed * 13 % 10 / 10).toFixed(1);
  const freeShip = seed % 3 === 0;
  const bestSeller = discount >= 25;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group relative bg-card rounded-md overflow-hidden border border-border hover:border-primary/40 hover:shadow-soft transition-all flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/produto/$id", params: { id: product.id }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square bg-muted overflow-hidden", children: [
      imgError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center text-4xl bg-gradient-to-br from-rose to-accent", children: "🎀" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: product.image,
          alt: product.name,
          loading: "lazy",
          onError: () => setImgError(true),
          className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        }
      ),
      discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md", children: [
        "-",
        discount,
        "%"
      ] }),
      bestSeller && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 left-1.5 bg-gradient-to-r from-gold to-[oklch(0.78_0.16_55)] text-gold-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide", children: "+ Vendido" }),
      product.stock < 5 && product.stock > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-1.5 left-1.5 bg-foreground/80 text-background text-[9px] font-semibold px-1.5 py-0.5 rounded-sm", children: [
        "Últimas ",
        product.stock
      ] })
    ] }) }),
    customer && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        },
        "aria-label": isFav ? "Remover dos favoritos" : "Adicionar aos favoritos",
        className: "absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-card/90 backdrop-blur grid place-items-center shadow-sm hover:scale-110 transition-transform z-10",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Heart,
          {
            className: "h-4 w-4 " + (isFav ? "fill-primary text-primary" : "text-muted-foreground")
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 flex flex-col gap-1 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/produto/$id", params: { id: product.id }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[12px] md:text-sm text-foreground line-clamp-2 min-h-[34px] leading-tight", children: product.name }) }),
      freeShip && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "self-start inline-flex items-center gap-0.5 bg-success/10 text-success text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-success/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-2.5 w-2.5" }),
        " FRETE GRÁTIS"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1 mt-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-primary font-medium", children: "R$" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base md:text-lg font-bold text-primary leading-none", children: product.price.toFixed(2).replace(".", ",") }),
        product.oldPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground line-through", children: brl(product.oldPrice) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-gold text-gold" }),
          " ",
          rating,
          realCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/70", children: [
            "(",
            realCount,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          sold,
          " vendidos"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/produto/$id",
          params: { id: product.id },
          "aria-disabled": product.stock === 0,
          className: "mt-1.5 h-8 rounded-sm text-[11px] font-semibold transition-all grid place-items-center " + (product.stock === 0 ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"),
          children: product.stock === 0 ? "Esgotado" : "Comprar"
        }
      )
    ] })
  ] });
}
const Route$C = createFileRoute("/buscar")({
  validateSearch: (s2) => ({
    q: s2.q || ""
  }),
  component: Page$3
});
function Page$3() {
  const { q: q2 } = Route$C.useSearch();
  const hydrated = useStoreHydrated();
  const allProducts = useStore((s2) => s2.products);
  const products = reactExports.useMemo(
    () => allProducts.filter(
      (p2) => p2.active && !p2.hidden && p2.name.toLowerCase().includes(q2.toLowerCase())
    ),
    [allProducts, q2]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Busca" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: hydrated ? `${products.length} resultado(s) para "${q2}"` : "Buscando..." }),
    !hydrated ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductGridSkeleton,
      {
        count: 8,
        cols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }
    ) : products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SearchX, { className: "h-10 w-10 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        'Nenhum produto encontrado para "',
        q2,
        '".'
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: products.map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p2 }, p2.id)) })
  ] }) });
}
const $$splitComponentImporter$q = () => import("./apresentacao-DUQiBWIo.js");
const Route$B = createFileRoute("/apresentacao")({
  head: () => ({
    meta: [{
      title: "Apresentação — Sistema Encantada"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const bannerEncantada = "/assets/banner-encantada-2026-BgbUN9yy.png";
const Route$A = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Princesa de Laços — Laços, tiaras e acessórios" },
      {
        name: "description",
        content: "Catálogo encantado de laços, tiaras e acessórios artesanais para princesas de todas as idades."
      },
      { property: "og:title", content: "Princesa de Laços" },
      {
        property: "og:description",
        content: "Catálogo encantado de laços, tiaras e acessórios artesanais."
      }
    ]
  }),
  component: Home
});
function useCountdown(hours) {
  const [end] = reactExports.useState(() => Date.now() + hours * 3600 * 1e3);
  const [now, setNow] = reactExports.useState(Date.now());
  reactExports.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, end - now);
  const h2 = Math.floor(diff / 36e5);
  const m2 = Math.floor(diff % 36e5 / 6e4);
  const s2 = Math.floor(diff % 6e4 / 1e3);
  const pad = (n) => String(n).padStart(2, "0");
  return { h: pad(h2), m: pad(m2), s: pad(s2) };
}
function Home() {
  const { products, categories, settings, coupons } = useStore();
  const hydrated = useStoreHydrated();
  const sortedCategories = reactExports.useMemo(
    () => [...categories].sort((a, b2) => (a.order ?? 999) - (b2.order ?? 999)),
    [categories]
  );
  const sortedProducts = reactExports.useMemo(
    () => [...products].sort(
      (a, b2) => (a.sortOrder ?? 9999) - (b2.sortOrder ?? 9999)
    ),
    [products]
  );
  const flash = reactExports.useMemo(
    () => sortedProducts.filter((p2) => p2.active && !p2.hidden && p2.oldPrice).slice(0, 8),
    [sortedProducts]
  );
  const all = reactExports.useMemo(
    () => sortedProducts.filter((p2) => p2.active && !p2.hidden),
    [sortedProducts]
  );
  const { h: h2, m: m2, s: s2 } = useCountdown(8);
  const banners = [
    {
      icon: Crown,
      title: "Coleção Princesa",
      sub: "Tiaras e coroas",
      color: "from-primary to-rose"
    },
    {
      icon: Gift,
      title: "Kits Presente",
      sub: "A partir de R$ 49,90",
      color: "from-gold to-[oklch(0.78_0.16_55)]"
    },
    {
      icon: Sparkles,
      title: "Novidades",
      sub: "Toda semana",
      color: "from-rose to-accent"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(StoreLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-3 md:px-4 pt-3 md:pt-5 max-w-6xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/categorias",
          className: "md:col-span-2 relative overflow-hidden rounded-2xl shadow-card block group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: bannerEncantada,
                alt: settings.bannerTitle || "Coleção Encantada 2026",
                className: "w-full h-full object-cover aspect-[16/7] md:aspect-[16/7] group-hover:scale-[1.02] transition-transform duration-500",
                loading: "eager"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "sr-only", children: settings.bannerTitle })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex flex-col gap-3", children: banners.slice(0, 2).map((b2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/categorias",
          className: `relative overflow-hidden rounded-lg bg-gradient-to-br ${b2.color} text-white p-4 flex-1 group`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(b2.icon, { className: "absolute -right-2 -bottom-2 h-20 w-20 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wide opacity-90", children: b2.sub }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl mt-1", children: b2.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-2 inline-flex items-center text-xs opacity-90 group-hover:translate-x-1 transition-transform", children: [
              "Ver mais ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
            ] })
          ]
        },
        b2.title
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CategoriesScroller, { categories: sortedCategories }),
    coupons.filter((c2) => c2.active).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-3 max-w-6xl mx-auto px-3 md:px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto scrollbar-hide pb-1", children: coupons.filter((c2) => c2.active).map((c2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "shrink-0 flex items-stretch bg-card border border-dashed border-primary/40 rounded-md overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary text-primary-foreground px-3 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-primary leading-tight", children: c2.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              c2.type === "percent" ? `${c2.value}% OFF` : `R$ ${c2.value} OFF`,
              c2.minOrder > 0 ? ` · acima de R$ ${c2.minOrder}` : ""
            ] })
          ] })
        ]
      },
      c2.code
    )) }) }),
    flash.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-4 max-w-6xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-3 md:mx-4 bg-card rounded-md border border-border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-destructive to-[oklch(0.7_0.2_15)] text-destructive-foreground px-3 md:px-4 py-2.5 flex items-center gap-2 md:gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-5 w-5 md:h-6 md:w-6 fill-gold text-gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm md:text-lg uppercase tracking-wide", children: "Ofertas Relâmpago" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-auto md:ml-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline opacity-90", children: "Termina em" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm", children: h2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: ":" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm", children: m2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: ":" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background text-foreground font-bold px-1.5 py-0.5 rounded font-mono text-[11px] md:text-sm", children: s2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/categorias",
            className: "hidden md:inline-flex items-center text-xs font-semibold hover:underline ml-2",
            children: [
              "Ver todas ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 p-2 md:p-3", children: !hydrated ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProductGridSkeleton, { count: 4 }) : flash.map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p2 }, p2.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-4 max-w-6xl mx-auto pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-3 md:mx-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center mb-3 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-1/2 h-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "relative bg-background px-4 text-xs md:text-sm font-bold text-primary uppercase tracking-widest", children: "✨ Selecionado para você ✨" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3", children: !hydrated ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProductGridSkeleton, { count: 10 }) : all.map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p2 }, p2.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/categorias",
          className: "inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline",
          children: [
            "Ver mais produtos ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) })
  ] });
}
function CategoriesScroller({
  categories
}) {
  const scrollRef = reactExports.useRef(null);
  const [autoplay, setAutoplay] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!autoplay) return;
    const el = scrollRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 80, behavior: "smooth" });
      }
    }, 2e3);
    return () => clearInterval(id);
  }, [autoplay]);
  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-3 max-w-6xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-md border border-border mx-3 md:mx-4 p-3 md:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm md:text-base font-bold flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-gold fill-gold" }),
        " Categorias"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setAutoplay((v2) => !v2),
            "aria-label": autoplay ? "Pausar rolagem" : "Iniciar rolagem",
            className: "w-7 h-7 rounded-full bg-muted hover:bg-primary/10 text-foreground grid place-items-center transition-colors",
            children: autoplay ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => scrollBy(-1),
            "aria-label": "Anterior",
            className: "w-7 h-7 rounded-full bg-muted hover:bg-primary/10 grid place-items-center transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => scrollBy(1),
            "aria-label": "Próximo",
            className: "w-7 h-7 rounded-full bg-muted hover:bg-primary/10 grid place-items-center transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/categorias",
            className: "ml-1 text-[11px] md:text-xs text-primary font-semibold flex items-center",
            children: [
              "Ver todas ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: scrollRef,
        onPointerDown: () => setAutoplay(false),
        className: "flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 snap-x",
        children: categories.map((c2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/categoria/$slug",
            params: { slug: c2.id },
            className: "shrink-0 snap-start flex flex-col items-center gap-1.5 group p-2 rounded-md hover:bg-muted transition-colors w-[72px] md:w-[88px]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 md:w-16 md:h-16 rounded-full gradient-soft grid place-items-center text-2xl md:text-3xl group-hover:scale-110 transition-transform", children: c2.image }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs font-medium text-foreground text-center line-clamp-1", children: c2.name })
            ]
          },
          c2.id
        ))
      }
    )
  ] }) });
}
const $$splitComponentImporter$p = () => import("./perfil.index-BOhiXago.js");
const Route$z = createFileRoute("/perfil/")({
  head: () => ({
    meta: [{
      title: "Minha conta — Princesa de Laços"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./afiliada.index-BX4vn4KX.js");
const Route$y = createFileRoute("/afiliada/")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const Route$x = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  }
});
function productRating(reviews, productId) {
  const list = reviews.filter((r2) => r2.productId === productId);
  if (list.length === 0) return { avg: 0, count: 0 };
  const avg = list.reduce((a, r2) => a + r2.rating, 0) / list.length;
  return { avg, count: list.length };
}
function Stars({
  value,
  size = 14,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5", children: [1, 2, 3, 4, 5].map((i) => {
    const filled = i <= Math.round(value);
    const Cls = onChange ? "cursor-pointer hover:scale-110 transition-transform" : "";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Star,
      {
        className: `${Cls} ${filled ? "fill-gold text-gold" : "text-muted-foreground/40"}`,
        style: { width: size, height: size },
        onClick: () => onChange?.(i)
      },
      i
    );
  }) });
}
function ProductReviews({ productId }) {
  const allReviews = useStore((s2) => s2.reviews);
  const reviews = allReviews.filter((r2) => r2.productId === productId);
  const currentCustomerId = useStore((s2) => s2.currentCustomerId);
  const isAdmin = useStore((s2) => s2.isAdmin);
  const addReview = useStore((s2) => s2.addReview);
  const deleteReview = useStore((s2) => s2.deleteReview);
  const [rating, setRating] = reactExports.useState(0);
  const [comment, setComment] = reactExports.useState("");
  const [photos, setPhotos] = reactExports.useState([]);
  const [videos, setVideos] = reactExports.useState([]);
  const [uploading, setUploading] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [filterStars, setFilterStars] = reactExports.useState(null);
  const [filterMedia, setFilterMedia] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("recent");
  const [photoView, setPhotoView] = reactExports.useState(null);
  const [videoView, setVideoView] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  const videoRef = reactExports.useRef(null);
  const [eligible, setEligible] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    if (!currentCustomerId) {
      setEligible(null);
      return;
    }
    cloud.checkReviewEligibility(currentCustomerId, productId).then((r2) => {
      if (!cancelled) setEligible({ eligible: r2.eligible, variation: r2.variation, alreadyReviewed: r2.alreadyReviewed });
    });
    return () => {
      cancelled = true;
    };
  }, [currentCustomerId, productId, reviews.length]);
  const summary = reactExports.useMemo(() => {
    const total = reviews.length;
    if (!total) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0], withPhoto: 0, withComment: 0 };
    const dist = [0, 0, 0, 0, 0];
    let withPhoto = 0;
    let withComment = 0;
    reviews.forEach((r2) => {
      dist[5 - r2.rating]++;
      if ((r2.photos?.length || 0) + (r2.videos?.length || 0) > 0) withPhoto++;
      if (r2.comment?.trim()) withComment++;
    });
    const avg = reviews.reduce((a, r2) => a + r2.rating, 0) / total;
    return { avg, total, dist, withPhoto, withComment };
  }, [reviews]);
  const filtered = reactExports.useMemo(() => {
    let list = reviews.slice();
    if (filterStars) list = list.filter((r2) => r2.rating === filterStars);
    if (filterMedia === "photos")
      list = list.filter((r2) => (r2.photos?.length || 0) + (r2.videos?.length || 0) > 0);
    if (filterMedia === "comments") list = list.filter((r2) => r2.comment?.trim());
    list.sort((a, b2) => {
      if (sort === "recent") return +new Date(b2.createdAt) - +new Date(a.createdAt);
      if (sort === "oldest") return +new Date(a.createdAt) - +new Date(b2.createdAt);
      if (sort === "highest") return b2.rating - a.rating;
      return a.rating - b2.rating;
    });
    return list;
  }, [reviews, filterStars, filterMedia, sort]);
  const onPickFiles = async (files, kind) => {
    if (!files || !files.length || !currentCustomerId) return;
    const maxPhotos = 5;
    const maxVideos = 2;
    const remaining = kind === "photo" ? maxPhotos - photos.length : maxVideos - videos.length;
    if (remaining <= 0) {
      toast.error(kind === "photo" ? `Máx. ${maxPhotos} fotos` : `Máx. ${maxVideos} vídeos`);
      return;
    }
    const limitBytes = kind === "photo" ? 5 * 1024 * 1024 : 30 * 1024 * 1024;
    const arr = Array.from(files).slice(0, remaining);
    const tooBig = arr.find((f2) => f2.size > limitBytes);
    if (tooBig) {
      toast.error(kind === "photo" ? "Cada foto até 5MB" : "Cada vídeo até 30MB");
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(arr.map((f2) => cloud.uploadReviewMedia(f2, currentCustomerId)));
      if (kind === "photo") setPhotos((p2) => [...p2, ...urls]);
      else setVideos((v2) => [...v2, ...urls]);
    } catch (e) {
      toast.error(e?.message || "Falha ao enviar mídia");
    } finally {
      setUploading(false);
    }
  };
  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await addReview({ productId, rating, comment, photos, videos });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setRating(0);
      setComment("");
      setPhotos([]);
      setVideos([]);
    } finally {
      setSubmitting(false);
    }
  };
  const reviewPhotos = reviews.flatMap(
    (r2) => (r2.photos || []).map((src) => ({ src, name: r2.customerName }))
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-3", children: "Avaliações" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card grid md:grid-cols-[180px_1fr] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center md:border-r md:border-border md:pr-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold text-gold", children: summary.avg.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: summary.avg, size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          summary.total,
          " avaliação",
          summary.total === 1 ? "" : "ões"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: [5, 4, 3, 2, 1].map((s2, i) => {
        const count = summary.dist[i];
        const pct = summary.total ? count / summary.total * 100 : 0;
        const active = filterStars === s2;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setFilterStars(active ? null : s2),
            className: `w-full flex items-center gap-2 text-xs rounded-lg px-1.5 py-0.5 ${active ? "bg-primary/10" : "hover:bg-muted"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 text-right", children: s2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-gold text-gold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gold", style: { width: `${pct}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-right text-muted-foreground", children: count })
            ]
          },
          s2
        );
      }) })
    ] }),
    summary.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterChip, { active: filterMedia === "all" && !filterStars, onClick: () => {
        setFilterMedia("all");
        setFilterStars(null);
      }, children: [
        "Tudo (",
        summary.total,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterChip, { active: filterMedia === "photos", onClick: () => setFilterMedia(filterMedia === "photos" ? "all" : "photos"), children: [
        "Com foto/vídeo (",
        summary.withPhoto,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterChip, { active: filterMedia === "comments", onClick: () => setFilterMedia(filterMedia === "comments" ? "all" : "comments"), children: [
        "Com comentário (",
        summary.withComment,
        ")"
      ] }),
      filterStars && /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterChip, { active: true, onClick: () => setFilterStars(null), children: [
        filterStars,
        "★ ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "inline h-3 w-3 ml-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: sort,
          onChange: (e) => setSort(e.target.value),
          className: "ml-auto text-xs h-8 rounded-full bg-muted px-3 border border-border outline-none",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recent", children: "Mais recentes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "oldest", children: "Mais antigas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "highest", children: "Maior nota" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lowest", children: "Menor nota" })
          ]
        }
      )
    ] }),
    reviewPhotos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold mb-2 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4 text-primary" }),
        " Fotos dos clientes (",
        reviewPhotos.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: reviewPhotos.slice(0, 12).map((p2, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setPhotoView(p2.src),
          className: "shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border hover:opacity-80",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p2.src, alt: `Foto de ${p2.name}`, className: "w-full h-full object-cover" })
        },
        i
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-card rounded-2xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-2 text-sm", children: "Compartilhe sua opinião" }),
      !currentCustomerId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary font-semibold underline", children: "Entre na sua conta" }),
        " ",
        "para deixar uma avaliação."
      ] }) : eligible === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Verificando..."
      ] }) : eligible.alreadyReviewed ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Você já avaliou este produto. Obrigada! 💕" }) : !eligible.eligible ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "🔒 Apenas clientes que ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "compraram e pagaram" }),
        " este produto podem avaliar."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        eligible.variation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full", children: [
          "Variação comprada: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: eligible.variation })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Sua nota:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: rating, size: 22, onChange: setRating })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: comment,
            onChange: (e) => setComment(e.target.value),
            rows: 3,
            maxLength: 500,
            placeholder: "Conte como foi sua experiência com o produto...",
            className: "w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          photos.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-16 rounded-lg overflow-hidden bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setPhotos((p2) => p2.filter((_2, idx) => idx !== i)),
                className: "absolute top-0.5 right-0.5 w-5 h-5 grid place-items-center rounded-full bg-destructive text-destructive-foreground",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] }, i)),
          videos.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-16 rounded-lg overflow-hidden bg-black grid place-items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src, className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setVideos((v2) => v2.filter((_2, idx) => idx !== i)),
                className: "absolute top-0.5 right-0.5 w-5 h-5 grid place-items-center rounded-full bg-destructive text-destructive-foreground",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] }, i)),
          photos.length < 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => fileRef.current?.click(),
              disabled: uploading,
              className: "w-16 h-16 rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50",
              children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-5 w-5" })
            }
          ),
          videos.length < 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => videoRef.current?.click(),
              disabled: uploading,
              className: "w-16 h-16 rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: "image/*",
              multiple: true,
              className: "hidden",
              onChange: (e) => {
                onPickFiles(e.target.files, "photo");
                e.target.value = "";
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: videoRef,
              type: "file",
              accept: "video/*",
              multiple: true,
              className: "hidden",
              onChange: (e) => {
                onPickFiles(e.target.files, "video");
                e.target.value = "";
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground ml-auto", children: [
            photos.length,
            "/5 fotos · ",
            videos.length,
            "/2 vídeos"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: submit,
            disabled: rating === 0 || submitting || uploading,
            className: "w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-50 flex items-center justify-center gap-2",
            children: [
              submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              "Publicar avaliação"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6 bg-card rounded-2xl", children: filterStars || filterMedia !== "all" ? "Nenhuma avaliação com esse filtro." : "Seja a primeira a avaliar!" }) : filtered.map((r2) => {
      const canDelete = isAdmin || r2.customerId === currentCustomerId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: r2.customerName }),
              r2.verified && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-wide bg-success/15 text-success px-1.5 py-0.5 rounded-full font-bold", children: "✓ Compra verificada" }),
              r2.variation && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full", children: r2.variation })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: r2.rating, size: 12 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: new Date(r2.createdAt).toLocaleDateString("pt-BR") })
            ] })
          ] }),
          canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (confirm("Excluir avaliação?")) {
                  deleteReview(r2.id);
                  toast.success("Removida");
                }
              },
              className: "p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        r2.comment && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-foreground/90 whitespace-pre-wrap", children: r2.comment }),
        (r2.photos?.length > 0 || r2.videos?.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2 flex-wrap", children: [
          r2.photos?.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPhotoView(src),
              className: "w-20 h-20 rounded-lg overflow-hidden bg-muted hover:opacity-80",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "w-full h-full object-cover" })
            },
            `p${i}`
          )),
          r2.videos?.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setVideoView(src),
              className: "relative w-20 h-20 rounded-lg overflow-hidden bg-black grid place-items-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src, className: "w-full h-full object-cover" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "absolute inset-0 m-auto h-6 w-6 text-white drop-shadow" })
              ]
            },
            `v${i}`
          ))
        ] })
      ] }, r2.id);
    }) }),
    photoView && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => setPhotoView(null),
        className: "fixed inset-0 z-50 bg-black/80 grid place-items-center p-4 cursor-zoom-out",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photoView, alt: "", className: "max-w-full max-h-full rounded-xl object-contain" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
        ]
      }
    ),
    videoView && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => setVideoView(null),
        className: "fixed inset-0 z-50 bg-black/90 grid place-items-center p-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: videoView, controls: true, autoPlay: true, className: "max-w-full max-h-full rounded-xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
        ]
      }
    )
  ] });
}
function FilterChip({
  active,
  onClick,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      className: `text-xs h-8 px-3 rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`,
      children
    }
  );
}
const Route$w = createFileRoute("/produto/$id")({
  component: Page$2
});
function Page$2() {
  const { id } = Route$w.useParams();
  const navigate = useNavigate();
  const { products, addToCart, reviews, joinWaitlist } = useStore();
  const product = products.find((p2) => p2.id === id);
  const [qty, setQty] = reactExports.useState(1);
  const [imgIdx, setImgIdx] = reactExports.useState(0);
  const [imgError, setImgError] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState({});
  const [waitlistEmail, setWaitlistEmail] = reactExports.useState("");
  const [waitlistLoading, setWaitlistLoading] = reactExports.useState(false);
  const priceDelta = (() => {
    if (!product?.variations) return 0;
    let d2 = 0;
    for (const v2 of product.variations) {
      const idx = selected[v2.name];
      if (idx == null) continue;
      const opt = v2.options[idx];
      if (typeof opt === "object" && opt.priceDelta) d2 += opt.priceDelta;
    }
    return d2;
  })();
  const finalPrice = (product?.price ?? 0) + priceDelta;
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Produto não encontrado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-primary font-semibold mt-2 inline-block", children: "Voltar à loja" })
    ] }) });
  }
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const related = products.filter(
    (p2) => p2.category === product.category && p2.id !== product.id && p2.active && !p2.hidden
  ).slice(0, 4);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const handleBuyNow = () => {
    addToCart(product.id, qty);
    navigate({ to: "/carrinho" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/",
        className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
          " Voltar"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6 lg:gap-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-muted rounded-3xl overflow-hidden relative shadow-card", children: [
          imgError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center text-7xl gradient-soft", children: "🎀" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: gallery[imgIdx],
              alt: product.name,
              onError: () => setImgError(true),
              className: "w-full h-full object-cover"
            }
          ),
          discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full", children: [
            "-",
            discount,
            "%"
          ] })
        ] }),
        gallery.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mt-3", children: gallery.map((g2, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setImgIdx(i);
              setImgError(false);
            },
            className: `w-16 h-16 rounded-xl overflow-hidden border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: g2,
                alt: "",
                className: "w-full h-full object-cover"
              }
            )
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-bold leading-tight", children: product.name }),
        (() => {
          const r2 = productRating(reviews, product.id);
          if (r2.count === 0) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: "#avaliacoes",
              className: "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: r2.avg, size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: r2.avg.toFixed(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "· ",
                  r2.count,
                  " avaliação",
                  r2.count === 1 ? "" : "ões"
                ] })
              ]
            }
          );
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          "SKU: ",
          product.sku,
          " · Estoque: ",
          product.stock
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-baseline gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-primary", children: brl(finalPrice) }),
          product.oldPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base text-muted-foreground line-through", children: brl(product.oldPrice) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-success font-medium mt-1", children: [
          "ou Pix com 5% off: ",
          brl(finalPrice * 0.95)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-sm text-foreground/80 leading-relaxed", children: product.description }),
        product.variations?.map((v2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-2", children: v2.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: v2.options.map((o, idx) => {
            const label = typeof o === "string" ? o : o.label;
            const delta = typeof o === "object" ? o.priceDelta : void 0;
            const isSel = selected[v2.name] === idx;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setSelected((s2) => ({ ...s2, [v2.name]: idx })),
                className: `px-3 py-1.5 rounded-full border text-sm transition-colors ${isSel ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:border-primary hover:bg-primary/5"}`,
                children: [
                  label,
                  delta ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-80", children: [
                    "+",
                    brl(delta)
                  ] }) : null
                ]
              },
              label + idx
            );
          }) })
        ] }, v2.name)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Quantidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-muted rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setQty(Math.max(1, qty - 1)),
                className: "w-9 h-9 grid place-items-center",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center font-semibold", children: qty }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setQty(Math.min(product.stock, qty + 1)),
                className: "w-9 h-9 grid place-items-center",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        product.stock === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 rounded-2xl bg-muted/40 border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-primary mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
            " Avise-me quando chegar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Este produto está esgotado no momento. Deixe seu e-mail para ser avisada assim que ele voltar!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "form",
            {
              onSubmit: (e) => {
                e.preventDefault();
                if (!waitlistEmail) return;
                setWaitlistLoading(true);
                const r2 = joinWaitlist(product.id, waitlistEmail);
                toast.success(r2.message);
                setWaitlistEmail("");
                setWaitlistLoading(false);
              },
              className: "flex gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    required: true,
                    placeholder: "Seu melhor e-mail",
                    value: waitlistEmail,
                    onChange: (e) => setWaitlistEmail(e.target.value),
                    className: "flex-1 h-11 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: waitlistLoading,
                    className: "h-11 px-4 rounded-xl gradient-primary text-white font-bold text-xs disabled:opacity-50",
                    children: waitlistLoading ? "..." : "Avisar-me"
                  }
                )
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                addToCart(product.id, qty);
                toast.success("Adicionado!");
              },
              disabled: product.stock === 0,
              className: "h-12 rounded-full border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
                " Carrinho"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleBuyNow,
              disabled: product.stock === 0,
              className: "h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
                " Comprar agora"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 rounded-xl p-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4 text-primary" }),
            " Frete fixo R$ 12,90"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 rounded-xl p-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }),
            " Compra protegida"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "avaliacoes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductReviews, { productId: product.id }) }),
    related.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-3", children: "Você também vai amar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: related.map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p2 }, p2.id)) })
    ] })
  ] }) });
}
const $$splitComponentImporter$n = () => import("./perfil.transacoes-YcWx9uMb.js");
const Route$v = createFileRoute("/perfil/transacoes")({
  head: () => ({
    meta: [{
      title: "Histórico de transações — Princesa de Laços"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./perfil.favoritos-BlD030vP.js");
const Route$u = createFileRoute("/perfil/favoritos")({
  head: () => ({
    meta: [{
      title: "Favoritos — Princesa de Laços"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./perfil.enderecos-DjMpoLQd.js");
const Route$t = createFileRoute("/perfil/enderecos")({
  head: () => ({
    meta: [{
      title: "Endereços — Princesa de Laços"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./perfil.configuracoes-4IcaaLra.js");
const Route$s = createFileRoute("/perfil/configuracoes")({
  head: () => ({
    meta: [{
      title: "Configurações — Princesa de Laços"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const Route$r = createFileRoute("/pedido/$id")({
  component: Page$1
});
const flow = [
  "aguardando_pagamento",
  "pago",
  "em_separacao",
  "saiu_para_entrega",
  "concluido"
];
function Page$1() {
  const { id } = Route$r.useParams();
  const order = useStore((s2) => s2.orders.find((o) => o.id === id));
  const [reorderOpen, setReorderOpen] = reactExports.useState(false);
  if (!order) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Pedido não encontrado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pedidos", className: "text-primary font-semibold", children: "Voltar" })
    ] }) });
  }
  const status = normalizeOrderStatus(order.status);
  const currentIdx = flow.indexOf(status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(StoreLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/pedidos",
          className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
            " Meus pedidos"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Pedido confirmado!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold mt-2", children: [
          "#",
          order.id
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90", children: formatDate(order.createdAt) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-card rounded-2xl p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: "Acompanhamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-3", children: flow.map((s2, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`,
              children: i <= currentIdx ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }) : i + 1
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: i === currentIdx ? "font-semibold" : "text-muted-foreground text-sm",
              children: ORDER_STATUS_LABEL[s2]
            }
          )
        ] }, s2)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-card rounded-2xl p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: "Itens" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: order.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: it.image,
              alt: it.name,
              className: "w-14 h-14 rounded-xl object-cover bg-muted"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: it.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Qtd: ",
              it.quantity,
              " × ",
              brl(it.price)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: brl(it.price * it.quantity) })
        ] }, it.productId)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "my-3 border-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "text-sm space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: brl(order.subtotal) })
          ] }),
          order.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-success", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Desconto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
              "− ",
              brl(order.discount)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Frete" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: brl(order.shipping) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-base pt-2 border-t border-border mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-primary", children: brl(order.total) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-card rounded-2xl p-4 shadow-card text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-2", children: order.deliveryMethod === "retirada" ? "Retirada no ateliê" : "Entrega" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: order.address }),
        order.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 rounded-xl bg-gold/10 border border-gold/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-gold uppercase tracking-wide mb-1", children: "📝 Observações" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: order.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setReorderOpen(true),
          className: "mt-4 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-soft hover:opacity-90 transition-opacity",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
            " Comprar de novo"
          ]
        }
      )
    ] }),
    reorderOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ReorderModal, { order, onClose: () => setReorderOpen(false) })
  ] });
}
const Route$q = createFileRoute("/categoria/$slug")({
  component: Page
});
function Page() {
  const { slug } = Route$q.useParams();
  const hydrated = useStoreHydrated();
  const { products, categories } = useStore();
  const cat = categories.find((c2) => c2.id === slug);
  const list = products.filter(
    (p2) => p2.category === slug && p2.active && !p2.hidden
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/categorias",
        className: "inline-flex items-center gap-1 text-sm text-muted-foreground mb-2 hover:text-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
          " Categorias"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: cat?.image }),
      cat?.name || "Categoria"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-5", children: hydrated ? `${list.length} ${list.length === 1 ? "produto" : "produtos"}` : "Carregando..." }),
    !hydrated ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductGridSkeleton,
      {
        count: 8,
        cols: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }
    ) : list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16 text-muted-foreground", children: "Nenhum produto nesta categoria." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: list.map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p2 }, p2.id)) })
  ] }) });
}
const $$splitComponentImporter$j = () => import("./afiliada.login-C0HYEXmj.js");
const Route$p = createFileRoute("/afiliada/login")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./afiliada.cadastro-B04G06Z_.js");
const Route$o = createFileRoute("/afiliada/cadastro")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./admin.sincronizacao-BveYb2Pd.js");
const Route$n = createFileRoute("/admin/sincronizacao")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./admin.produtos-BsEpW7cJ.js");
const Route$m = createFileRoute("/admin/produtos")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./admin.pedidos-Bi1g1Xxw.js");
const Route$l = createFileRoute("/admin/pedidos")({
  validateSearch: (s2) => ({
    q: typeof s2.q === "string" ? s2.q : ""
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./admin.organizar-C4Nss4NJ.js");
const Route$k = createFileRoute("/admin/organizar")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./admin.notificacoes-BTEe8BDl.js");
const Route$j = createFileRoute("/admin/notificacoes")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./admin.logs-DsFb3oVt.js");
const Route$i = createFileRoute("/admin/logs")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./admin.login-DmcWfuVY.js");
const Route$h = createFileRoute("/admin/login")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./admin.gateway-D9PIKOPw.js");
const Route$g = createFileRoute("/admin/gateway")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./admin.financeiro-BLfx53cP.js");
const Route$f = createFileRoute("/admin/financeiro")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./admin.dashboard-D3cxl6y9.js");
const Route$e = createFileRoute("/admin/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./admin.cupons-DcBDoITb.js");
const Route$d = createFileRoute("/admin/cupons")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./admin.configuracoes-C60d4iCY.js");
const Route$c = createFileRoute("/admin/configuracoes")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./admin.clientes-DNUFhDOq.js");
const Route$b = createFileRoute("/admin/clientes")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./admin.chatbot-tmwN-YZL.js");
const Route$a = createFileRoute("/admin/chatbot")({
  head: () => ({
    meta: [{
      title: "Chatbot WhatsApp — Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./admin.categorias-2gvpR2sN.js");
const Route$9 = createFileRoute("/admin/categorias")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.bi-6GpXsO-H.js");
const Route$8 = createFileRoute("/admin/bi")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.afiliadas-9ySOwVP0.js");
const Route$7 = createFileRoute("/admin/afiliadas")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./checkout.pix._id-CnsvQFDz.js");
const Route$6 = createFileRoute("/checkout/pix/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const BOT_BASE = "http://178.105.54.230:3005";
const BOT_TOKEN = "princesa_secret_123";
const ALLOWED_CORS_ORIGINS = /* @__PURE__ */ new Set([
  "https://princesadelacos.com.br",
  "https://www.princesadelacos.com.br",
  "https://xn--princesadelaos-rjb.com.br",
  "https://www.xn--princesadelaos-rjb.com.br"
]);
function isAllowedOrigin(origin) {
  return ALLOWED_CORS_ORIGINS.has(origin) || origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com");
}
function botJsonHeaders(request) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  const origin = request.headers.get("origin");
  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Vary", "Origin");
  }
  return headers;
}
function botOptionsResponse(request) {
  return new Response(null, { status: 204, headers: botJsonHeaders(request) });
}
function botJsonResponse(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: botJsonHeaders(request)
  });
}
function parseProxyJson(text, fallback) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}
const Route$5 = createFileRoute("/api/lovable-bot/status")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      GET: async ({ request }) => {
        try {
          const r2 = await fetch(`${BOT_BASE}/api/status`, {
            method: "GET",
            headers: { Accept: "application/json" }
          });
          const text = await r2.text();
          return botJsonResponse(
            request,
            parseProxyJson(text, {
              status: "UNKNOWN",
              error: text || `Status ${r2.status}`
            }),
            r2.status
          );
        } catch (e) {
          return botJsonResponse(
            request,
            {
              status: "UNKNOWN",
              error: e instanceof Error ? e.message : String(e)
            },
            502
          );
        }
      }
    }
  }
});
const Route$4 = createFileRoute("/api/lovable-bot/notify")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      POST: async ({ request }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return botJsonResponse(
            request,
            { ok: false, error: "JSON inválido" },
            400
          );
        }
        const numero = (payload.numero ?? "").toString().replace(/\D/g, "");
        const mensagem = (payload.mensagem ?? "").toString().trim();
        if (numero.length < 10 || !mensagem) {
          return botJsonResponse(
            request,
            { ok: false, error: "Parâmetros inválidos (numero/mensagem)" },
            400
          );
        }
        try {
          const r2 = await fetch(`${BOT_BASE}/webhook/notificacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero, mensagem, token: BOT_TOKEN })
          });
          const text = await r2.text();
          return botJsonResponse(request, {
            ok: r2.ok,
            status: r2.status,
            body: text
          });
        } catch (e) {
          return botJsonResponse(
            request,
            {
              ok: false,
              status: 0,
              error: e instanceof Error ? e.message : String(e)
            },
            502
          );
        }
      }
    }
  }
});
const Route$3 = createFileRoute("/api/lovable-bot/logout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      POST: async ({ request }) => {
        try {
          const r2 = await fetch(`${BOT_BASE}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: BOT_TOKEN })
          });
          const text = await r2.text();
          return botJsonResponse(
            request,
            parseProxyJson(text, { ok: r2.ok, body: text }),
            r2.status
          );
        } catch (e) {
          return botJsonResponse(
            request,
            { ok: false, error: e instanceof Error ? e.message : String(e) },
            502
          );
        }
      }
    }
  }
});
const Route$2 = createFileRoute("/api/bot/status")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      GET: async ({ request }) => {
        try {
          const r2 = await fetch(`${BOT_BASE}/api/status`, {
            method: "GET",
            headers: { Accept: "application/json" }
          });
          const text = await r2.text();
          return botJsonResponse(
            request,
            parseProxyJson(text, {
              status: "UNKNOWN",
              error: text || `Status ${r2.status}`
            }),
            r2.status
          );
        } catch (e) {
          return botJsonResponse(
            request,
            {
              status: "UNKNOWN",
              error: e instanceof Error ? e.message : String(e)
            },
            502
          );
        }
      }
    }
  }
});
const Route$1 = createFileRoute("/api/bot/notify")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      POST: async ({ request }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return botJsonResponse(
            request,
            { ok: false, error: "JSON inválido" },
            400
          );
        }
        const numero = (payload.numero ?? "").toString().replace(/\D/g, "");
        const mensagem = (payload.mensagem ?? "").toString().trim();
        if (numero.length < 10 || !mensagem) {
          return botJsonResponse(
            request,
            { ok: false, error: "Parâmetros inválidos (numero/mensagem)" },
            400
          );
        }
        try {
          const r2 = await fetch(`${BOT_BASE}/webhook/notificacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero, mensagem, token: BOT_TOKEN })
          });
          const text = await r2.text();
          return botJsonResponse(request, {
            ok: r2.ok,
            status: r2.status,
            body: text
          });
        } catch (e) {
          return botJsonResponse(
            request,
            {
              ok: false,
              status: 0,
              error: e instanceof Error ? e.message : String(e)
            },
            502
          );
        }
      }
    }
  }
});
const Route2 = createFileRoute("/api/bot/logout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => botOptionsResponse(request),
      POST: async ({ request }) => {
        try {
          const r2 = await fetch(`${BOT_BASE}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: BOT_TOKEN })
          });
          const text = await r2.text();
          return botJsonResponse(
            request,
            parseProxyJson(text, { ok: r2.ok, body: text }),
            r2.status
          );
        } catch (e) {
          return botJsonResponse(
            request,
            { ok: false, error: e instanceof Error ? e.message : String(e) },
            502
          );
        }
      }
    }
  }
});
const SuporteRoute = Route$L.update({
  id: "/suporte",
  path: "/suporte",
  getParentRoute: () => Route$M
});
const RedefinirSenhaRoute = Route$K.update({
  id: "/redefinir-senha",
  path: "/redefinir-senha",
  getParentRoute: () => Route$M
});
const PedidosRoute = Route$J.update({
  id: "/pedidos",
  path: "/pedidos",
  getParentRoute: () => Route$M
});
const LoginRoute = Route$I.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$M
});
const EsqueciSenhaRoute = Route$H.update({
  id: "/esqueci-senha",
  path: "/esqueci-senha",
  getParentRoute: () => Route$M
});
const CheckoutRoute = Route$G.update({
  id: "/checkout",
  path: "/checkout",
  getParentRoute: () => Route$M
});
const CategoriasRoute = Route$F.update({
  id: "/categorias",
  path: "/categorias",
  getParentRoute: () => Route$M
});
const CarrinhoRoute = Route$E.update({
  id: "/carrinho",
  path: "/carrinho",
  getParentRoute: () => Route$M
});
const CadastroRoute = Route$D.update({
  id: "/cadastro",
  path: "/cadastro",
  getParentRoute: () => Route$M
});
const BuscarRoute = Route$C.update({
  id: "/buscar",
  path: "/buscar",
  getParentRoute: () => Route$M
});
const ApresentacaoRoute = Route$B.update({
  id: "/apresentacao",
  path: "/apresentacao",
  getParentRoute: () => Route$M
});
const IndexRoute = Route$A.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$M
});
const PerfilIndexRoute = Route$z.update({
  id: "/perfil/",
  path: "/perfil/",
  getParentRoute: () => Route$M
});
const AfiliadaIndexRoute = Route$y.update({
  id: "/afiliada/",
  path: "/afiliada/",
  getParentRoute: () => Route$M
});
const AdminIndexRoute = Route$x.update({
  id: "/admin/",
  path: "/admin/",
  getParentRoute: () => Route$M
});
const ProdutoIdRoute = Route$w.update({
  id: "/produto/$id",
  path: "/produto/$id",
  getParentRoute: () => Route$M
});
const PerfilTransacoesRoute = Route$v.update({
  id: "/perfil/transacoes",
  path: "/perfil/transacoes",
  getParentRoute: () => Route$M
});
const PerfilFavoritosRoute = Route$u.update({
  id: "/perfil/favoritos",
  path: "/perfil/favoritos",
  getParentRoute: () => Route$M
});
const PerfilEnderecosRoute = Route$t.update({
  id: "/perfil/enderecos",
  path: "/perfil/enderecos",
  getParentRoute: () => Route$M
});
const PerfilConfiguracoesRoute = Route$s.update({
  id: "/perfil/configuracoes",
  path: "/perfil/configuracoes",
  getParentRoute: () => Route$M
});
const PedidoIdRoute = Route$r.update({
  id: "/pedido/$id",
  path: "/pedido/$id",
  getParentRoute: () => Route$M
});
const CategoriaSlugRoute = Route$q.update({
  id: "/categoria/$slug",
  path: "/categoria/$slug",
  getParentRoute: () => Route$M
});
const AfiliadaLoginRoute = Route$p.update({
  id: "/afiliada/login",
  path: "/afiliada/login",
  getParentRoute: () => Route$M
});
const AfiliadaCadastroRoute = Route$o.update({
  id: "/afiliada/cadastro",
  path: "/afiliada/cadastro",
  getParentRoute: () => Route$M
});
const AdminSincronizacaoRoute = Route$n.update({
  id: "/admin/sincronizacao",
  path: "/admin/sincronizacao",
  getParentRoute: () => Route$M
});
const AdminProdutosRoute = Route$m.update({
  id: "/admin/produtos",
  path: "/admin/produtos",
  getParentRoute: () => Route$M
});
const AdminPedidosRoute = Route$l.update({
  id: "/admin/pedidos",
  path: "/admin/pedidos",
  getParentRoute: () => Route$M
});
const AdminOrganizarRoute = Route$k.update({
  id: "/admin/organizar",
  path: "/admin/organizar",
  getParentRoute: () => Route$M
});
const AdminNotificacoesRoute = Route$j.update({
  id: "/admin/notificacoes",
  path: "/admin/notificacoes",
  getParentRoute: () => Route$M
});
const AdminLogsRoute = Route$i.update({
  id: "/admin/logs",
  path: "/admin/logs",
  getParentRoute: () => Route$M
});
const AdminLoginRoute = Route$h.update({
  id: "/admin/login",
  path: "/admin/login",
  getParentRoute: () => Route$M
});
const AdminGatewayRoute = Route$g.update({
  id: "/admin/gateway",
  path: "/admin/gateway",
  getParentRoute: () => Route$M
});
const AdminFinanceiroRoute = Route$f.update({
  id: "/admin/financeiro",
  path: "/admin/financeiro",
  getParentRoute: () => Route$M
});
const AdminDashboardRoute = Route$e.update({
  id: "/admin/dashboard",
  path: "/admin/dashboard",
  getParentRoute: () => Route$M
});
const AdminCuponsRoute = Route$d.update({
  id: "/admin/cupons",
  path: "/admin/cupons",
  getParentRoute: () => Route$M
});
const AdminConfiguracoesRoute = Route$c.update({
  id: "/admin/configuracoes",
  path: "/admin/configuracoes",
  getParentRoute: () => Route$M
});
const AdminClientesRoute = Route$b.update({
  id: "/admin/clientes",
  path: "/admin/clientes",
  getParentRoute: () => Route$M
});
const AdminChatbotRoute = Route$a.update({
  id: "/admin/chatbot",
  path: "/admin/chatbot",
  getParentRoute: () => Route$M
});
const AdminCategoriasRoute = Route$9.update({
  id: "/admin/categorias",
  path: "/admin/categorias",
  getParentRoute: () => Route$M
});
const AdminBiRoute = Route$8.update({
  id: "/admin/bi",
  path: "/admin/bi",
  getParentRoute: () => Route$M
});
const AdminAfiliadasRoute = Route$7.update({
  id: "/admin/afiliadas",
  path: "/admin/afiliadas",
  getParentRoute: () => Route$M
});
const CheckoutPixIdRoute = Route$6.update({
  id: "/pix/$id",
  path: "/pix/$id",
  getParentRoute: () => CheckoutRoute
});
const ApiLovableBotStatusRoute = Route$5.update({
  id: "/api/lovable-bot/status",
  path: "/api/lovable-bot/status",
  getParentRoute: () => Route$M
});
const ApiLovableBotNotifyRoute = Route$4.update({
  id: "/api/lovable-bot/notify",
  path: "/api/lovable-bot/notify",
  getParentRoute: () => Route$M
});
const ApiLovableBotLogoutRoute = Route$3.update({
  id: "/api/lovable-bot/logout",
  path: "/api/lovable-bot/logout",
  getParentRoute: () => Route$M
});
const ApiBotStatusRoute = Route$2.update({
  id: "/api/bot/status",
  path: "/api/bot/status",
  getParentRoute: () => Route$M
});
const ApiBotNotifyRoute = Route$1.update({
  id: "/api/bot/notify",
  path: "/api/bot/notify",
  getParentRoute: () => Route$M
});
const ApiBotLogoutRoute = Route2.update({
  id: "/api/bot/logout",
  path: "/api/bot/logout",
  getParentRoute: () => Route$M
});
const CheckoutRouteChildren = {
  CheckoutPixIdRoute
};
const CheckoutRouteWithChildren = CheckoutRoute._addFileChildren(
  CheckoutRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  ApresentacaoRoute,
  BuscarRoute,
  CadastroRoute,
  CarrinhoRoute,
  CategoriasRoute,
  CheckoutRoute: CheckoutRouteWithChildren,
  EsqueciSenhaRoute,
  LoginRoute,
  PedidosRoute,
  RedefinirSenhaRoute,
  SuporteRoute,
  AdminAfiliadasRoute,
  AdminBiRoute,
  AdminCategoriasRoute,
  AdminChatbotRoute,
  AdminClientesRoute,
  AdminConfiguracoesRoute,
  AdminCuponsRoute,
  AdminDashboardRoute,
  AdminFinanceiroRoute,
  AdminGatewayRoute,
  AdminLoginRoute,
  AdminLogsRoute,
  AdminNotificacoesRoute,
  AdminOrganizarRoute,
  AdminPedidosRoute,
  AdminProdutosRoute,
  AdminSincronizacaoRoute,
  AfiliadaCadastroRoute,
  AfiliadaLoginRoute,
  CategoriaSlugRoute,
  PedidoIdRoute,
  PerfilConfiguracoesRoute,
  PerfilEnderecosRoute,
  PerfilFavoritosRoute,
  PerfilTransacoesRoute,
  ProdutoIdRoute,
  AdminIndexRoute,
  AfiliadaIndexRoute,
  PerfilIndexRoute,
  ApiBotLogoutRoute,
  ApiBotNotifyRoute,
  ApiBotStatusRoute,
  ApiLovableBotLogoutRoute,
  ApiLovableBotNotifyRoute,
  ApiLovableBotStatusRoute
};
const routeTree = Route$M._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({
  error,
  reset
}) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreload: "render",
    defaultPreloadDelay: 0,
    defaultPreloadStaleTime: 3e5,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  ORDER_STATUS_LABEL as $,
  playBeep as A,
  Banknote as B,
  CircleCheck as C,
  pixIcon as D,
  Clock as E,
  CircleAlert as F,
  CircleX as G,
  Heart as H,
  formatDate as I,
  ProductGridSkeleton as J,
  ProductCard as K,
  LoaderCircle as L,
  MessageCircle as M,
  logoUrl as N,
  getSyncStatusFn as O,
  Package as P,
  QrCode as Q,
  Receipt as R,
  StoreLayout as S,
  Tag as T,
  User as U,
  Star as V,
  normalizeOrderStatus as W,
  X,
  getOrderStatusLabel as Y,
  Route$l as Z,
  normalizeDeliveryStatus as _,
  Search as a,
  DELIVERY_STATUS_LABEL as a0,
  Truck as a1,
  useNotifications as a2,
  CATEGORY_LABELS as a3,
  AUDIENCE_LABELS as a4,
  Bell as a5,
  getGatewayConfigFn as a6,
  saveGatewayConfigFn as a7,
  Download as a8,
  usePushNotifications as a9,
  Share as aa,
  useRouterState as ab,
  Route$6 as ac,
  fetchOrder as ad,
  createSsrRpc as ae,
  admin_functions as af,
  cloud$1 as ag,
  emails as ah,
  router as ai,
  useSearch as b,
  useNavigate as c,
  Link as d,
  Copy as e,
  consumeResetTokenFn as f,
  createLucideIcon as g,
  ShoppingBag as h,
  Crown as i,
  Sparkles as j,
  ChevronLeft as k,
  ChevronRight as l,
  MapPin as m,
  clsx as n,
  cn as o,
  ReactDOM as p,
  useStoreHydrated as q,
  reactDomExports as r,
  selectCurrentCustomer as s,
  toast as t,
  useStore as u,
  brl as v,
  Plus as w,
  House as x,
  CreditCard as y,
  Trash2 as z
};
