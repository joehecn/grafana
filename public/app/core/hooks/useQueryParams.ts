import { useCallback, useMemo } from 'react';
// import { useLocation } from 'react-router-dom';

import { UrlQueryMap } from '@grafana/data';
import { locationSearchToObject, locationService } from '@grafana/runtime';

export function useQueryParams(): [UrlQueryMap, (values: UrlQueryMap, replace?: boolean) => void] {
  // const { search } = useLocation();
  const search = '?orgId=2&editPanel=1';
  const queryParams = useMemo(() => locationSearchToObject(search || ''), [search]);
  const update = useCallback((values: UrlQueryMap, replace?: boolean) => locationService.partial(values, replace), []);
  return [queryParams, update];
}
