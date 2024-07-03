import type { G2Spec } from '@antv/g2';
import { LayoutWidthType, type S2DataConfig, type S2Options } from '@antv/s2';
import { ChartDataCell } from './cell/chart-data-cell';

export const DEFAULT_G2_SPEC: G2Spec = {
  type: 'interval',
  autoFit: true,
  animate: false,
  axis: false,
  legend: false,
};

export const DEFAULT_G2_AXIS_SPEC: G2Spec = {
  autoFit: true,
  animate: false,
  line: false,
  tick: false,
  grid: false,
};

export const DEFAULT_OPTIONS: S2Options = {
  chartCoordinate: 'cartesian',
  chartSpec: DEFAULT_G2_SPEC,
  dataCell: (viewMeta, spreadsheet) => new ChartDataCell(viewMeta, spreadsheet),
};

export const FIXED_OPTIONS: S2Options = {
  hierarchyType: 'grid',

  style: {
    layoutWidthType: LayoutWidthType.ColAdaptive,

    colCell: {
      hideValue: false,
    },
  },
};

export const FIXED_DATA_CONFIG: Partial<S2DataConfig> = {
  fields: {
    customValueOrder: null,
  },
};

export const DEFAULT_MEASURE_SIZE = 200;
export const DEFAULT_ROW_AXIS_SIZE = 100;
export const DEFAULT_COL_AXIS_SIZE = 50;
export const DEFAULT_DIMENSION_SIZE = 50;

export enum AxisCellType {
  AXIS_ROW_CELL = 'axisRowCell',
  AXIS_COL_CELL = 'axisColCell',
  AXIS_CORNER_CELL = 'axisCornerCell',
}

/**
 * row axis
 */
export const KEY_GROUP_ROW_AXIS_SCROLL = 'rowAxisScrollGroup';
export const KEY_GROUP_ROW_AXIS_FROZEN = 'rowAxisHeaderFrozenGroup';
export const KEY_GROUP_ROW_AXIS_HEADER_FROZEN_TRAILING =
  'rowAxisHeaderFrozenTrailingGroup';
export const KEY_GROUP_ROW_AXIS_RESIZE_AREA = 'rowAxisHeaderResizeArea';

/**
 * column axis
 */
export const KEY_GROUP_COL_AXIS_SCROLL = 'colAxisScrollGroup';
export const KEY_GROUP_COL_AXIS_FROZEN = 'colAxisFrozenGroup';
export const KEY_GROUP_COL_AXIS_FROZEN_TRAILING = 'colAxisFrozenTrailingGroup';
export const KEY_GROUP_COL_AXIS_RESIZE_AREA = 'colAxisHeaderResizeArea';

export const PLACEHOLDER_FIELD = '$$placeholder$$';
