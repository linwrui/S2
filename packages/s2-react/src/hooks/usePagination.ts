import { S2Event, SpreadSheet, type Pagination } from '@antv/s2';
import type { LayoutPaginationParams } from '@antv/s2-shared';
import { useUpdateEffect } from 'ahooks';
import type { PaginationProps as AntdPaginationProps } from 'antd';
import { get, isEmpty } from 'lodash';
import React from 'react';
import type { SheetComponentProps } from '../components';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

export const usePagination = (
  s2: SpreadSheet,
  props: SheetComponentProps,
): {
  showPagination: boolean;
  pagination: Pagination;
  onShowSizeChange: AntdPaginationProps['onShowSizeChange'];
  onChange: AntdPaginationProps['onChange'];
} => {
  const { options, showPagination } = props;

  const paginationCfg = options?.pagination;
  const [pagination, setPagination] = React.useState({
    total: 0,
    current: paginationCfg?.current || DEFAULT_PAGE_NUMBER,
    pageSize: paginationCfg?.pageSize || DEFAULT_PAGE_SIZE,
  });

  const onShowSizeChange = (current: number, pageSize: number) => {
    const outerOnShowSizeChange =
      get(showPagination, 'onShowSizeChange') ??
      paginationCfg?.onShowSizeChange;

    outerOnShowSizeChange?.(current, pageSize);
  };

  const onChange = (current: number, pageSize: number) => {
    setPagination({ ...pagination, current, pageSize });

    const outerOnChange =
      get(showPagination, 'onChange') ?? paginationCfg?.onChange;

    outerOnChange?.(current, pageSize);
  };

  // sync state.pagination -> s2.pagination
  useUpdateEffect(() => {
    const render = async () => {
      if (!s2 || isEmpty(paginationCfg)) {
        return;
      }

      s2.updatePagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
      await s2.render(false);
    };

    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, s2]);

  // sync props.pagination -> state.pagination
  useUpdateEffect(() => {
    setPagination({
      total: s2?.facet?.viewCellHeights.getTotalLength() ?? 0,
      current: paginationCfg?.current || DEFAULT_PAGE_NUMBER,
      pageSize: paginationCfg?.pageSize || DEFAULT_PAGE_SIZE,
    });
  }, [paginationCfg, s2]);

  // sync layout result total -> state.total
  useUpdateEffect(() => {
    if (!s2 || isEmpty(paginationCfg)) {
      return;
    }

    const totalUpdateCallback = (data: LayoutPaginationParams) => {
      setPagination((prev) => {
        return { ...prev, total: data.total };
      });
    };

    s2.on(S2Event.LAYOUT_PAGINATION, totalUpdateCallback);

    return () => {
      s2.off(S2Event.LAYOUT_PAGINATION, totalUpdateCallback);
    };
  }, [paginationCfg, s2]);

  return {
    showPagination: Boolean(showPagination),
    pagination: { ...paginationCfg, ...pagination },
    onShowSizeChange,
    onChange,
  };
};
