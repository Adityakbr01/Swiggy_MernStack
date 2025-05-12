// src/lib/utils.ts

import { match } from "path-to-regexp";

export const matchRoute = (routes: string[], currentPath: string) => {
  return routes.some((route) => {
    const isMatch = match(route, { decode: decodeURIComponent });
    return isMatch(currentPath) !== false;
  });
};
