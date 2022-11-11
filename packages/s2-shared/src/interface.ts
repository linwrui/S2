import type {
  S2DataConfig,
  S2Options,
  CellScrollPosition,
  TargetCellInfo,
  ResizeParams,
  Node,
  SpreadSheet,
  ThemeCfg,
  ViewMeta,
  LayoutResult,
  SortParams,
  DataCell,
  GEvent,
  HiddenColumnsInfo,
  CollapsedRowsType,
  ResizeInfo,
  S2CellType,
  TooltipOperatorOptions,
  S2RenderOptions,
  S2MountContainer,
  TooltipContentType,
  Pagination,
  ViewMetaData,
  RawData,
} from '@antv/s2';

// 是否开启自适应宽高，并指定容器
export type Adaptive =
  | boolean
  | {
      width?: boolean;
      height?: boolean;
      getContainer?: () => HTMLElement;
    };

export type SheetType =
  | 'pivot'
  | 'table'
  | 'gridAnalysis'
  | 'strategy'
  | 'editable';

/** render callback */
export type SheetUpdateCallback = (params: S2RenderOptions) => S2RenderOptions;

export type LayoutPaginationParams = {
  pageSize: number;
  pageCount: number;
  total: number;
  current: number;
};

export interface BaseSheetComponentProps<
  PartialDrillDown = PartDrillDown,
  Header = unknown,
  Options = S2Options<TooltipContentType, Pagination>,
> {
  sheetType?: SheetType;
  spreadsheet?: (
    container: S2MountContainer,
    dataCfg: S2DataConfig,
    options: Options,
  ) => SpreadSheet;
  dataCfg: S2DataConfig;
  options?: Options;
  loading?: boolean;
  partDrillDown?: PartialDrillDown;
  adaptive?: Adaptive;
  showPagination?:
    | boolean
    | {
        onShowSizeChange?: (pageSize: number) => void;
        onChange?: (current: number) => void;
      };
  themeCfg?: ThemeCfg;
  header?: Header;
  /** @deprecated 1.29.0 已废弃, 请使用 onMounted 代替 */
  getSpreadSheet?: (spreadsheet: SpreadSheet) => void;
  /** 底表 render callback */
  onSheetUpdate?: SheetUpdateCallback;

  // ============== Row Cell ====================
  onRowCellHover?: (data: TargetCellInfo) => void;
  onRowCellClick?: (data: TargetCellInfo) => void;
  onRowCellDoubleClick?: (data: TargetCellInfo) => void;
  onRowCellContextMenu?: (data: TargetCellInfo) => void;
  onRowCellMouseDown?: (data: TargetCellInfo) => void;
  onRowCellMouseUp?: (data: TargetCellInfo) => void;
  onRowCellMouseMove?: (data: TargetCellInfo) => void;
  onRowCellCollapseTreeRows?: (params: {
    id: number;
    isCollapsed: boolean;
    node: Node;
  }) => void;
  onRowCellScroll?: (position: CellScrollPosition) => void;

  // ============== Col Cell ====================
  onColCellHover?: (data: TargetCellInfo) => void;
  onColCellClick?: (data: TargetCellInfo) => void;
  onColCellDoubleClick?: (data: TargetCellInfo) => void;
  onColCellContextMenu?: (data: TargetCellInfo) => void;
  onColCellMouseDown?: (data: TargetCellInfo) => void;
  onColCellMouseUp?: (data: TargetCellInfo) => void;
  onColCellMouseMove?: (data: TargetCellInfo) => void;

  // ============== Data Cell ====================
  onDataCellHover?: (data: TargetCellInfo) => void;
  onDataCellClick?: (data: TargetCellInfo) => void;
  onDataCellDoubleClick?: (data: TargetCellInfo) => void;
  onDataCellContextMenu?: (data: TargetCellInfo) => void;
  onDataCellMouseDown?: (data: TargetCellInfo) => void;
  onDataCellMouseUp?: (data: TargetCellInfo) => void;
  onDataCellMouseMove?: (data: TargetCellInfo) => void;
  onDataCellTrendIconClick?: (meta: ViewMeta) => void;
  onDataCellBrushSelection?: (brushRangeDataCells: DataCell[]) => void;
  onDataCellSelectMove?: (metas: ViewMetaData[]) => void;

  // ============== Corner Cell ====================
  onCornerCellHover?: (data: TargetCellInfo) => void;
  onCornerCellClick?: (data: TargetCellInfo) => void;
  onCornerCellDoubleClick?: (data: TargetCellInfo) => void;
  onCornerCellContextMenu?: (data: TargetCellInfo) => void;
  onCornerCellMouseDown?: (data: TargetCellInfo) => void;
  onCornerCellMouseUp?: (data: TargetCellInfo) => void;
  onCornerCellMouseMove?: (data: TargetCellInfo) => void;

  // ============== Merged Cells ====================
  onMergedCellsHover?: (data: TargetCellInfo) => void;
  onMergedCellsClick?: (data: TargetCellInfo) => void;
  onMergedCellsDoubleClick?: (data: TargetCellInfo) => void;
  onMergedCellsContextMenu?: (data: TargetCellInfo) => void;
  onMergedCellsMouseDown?: (data: TargetCellInfo) => void;
  onMergedCellsMouseUp?: (data: TargetCellInfo) => void;
  onMergedCellsMouseMove?: (data: TargetCellInfo) => void;

  // ============== Sort ====================
  onRangeSort?: (params: SortParams) => void;
  onRangeSorted?: (event: GEvent) => void;

  // ============== Filter ====================
  onRangeFilter?: (data: {
    filterKey: string;
    filteredValues: string[];
  }) => void;
  onRangeFiltered?: (data: ViewMetaData[]) => void;

  // ============== Layout ====================
  onLayoutAfterHeaderLayout?: (layoutResult: LayoutResult) => void;
  onLayoutPagination?: (data: LayoutPaginationParams) => void;
  /** @deprecated 已废弃, 请使用 S2Event.GLOBAL_SCROLL 代替 */
  onLayoutCellScroll?: (position: CellScrollPosition) => void;
  onLayoutCollapseRows?: (data: CollapsedRowsType) => void;
  onLayoutAfterCollapseRows?: (data: CollapsedRowsType) => void;
  onCollapseRowsAll?: (hierarchyCollapse: boolean) => void;
  onLayoutColsExpanded?: (node: Node) => void;
  onLayoutColsHidden?: (data: {
    currentHiddenColumnsInfo: HiddenColumnsInfo;
    hiddenColumnsDetail: HiddenColumnsInfo[];
  }) => void;
  onBeforeRender?: () => void;
  onAfterRender?: () => void;
  onMounted?: (spreadsheet: SpreadSheet) => void;
  onDestroy?: () => void;

  // ============== Resize ====================
  onLayoutResize?: (params: ResizeParams) => void;
  onLayoutResizeSeriesWidth?: (params: ResizeParams) => void;
  onLayoutResizeRowWidth?: (params: ResizeParams) => void;
  onLayoutResizeRowHeight?: (params: ResizeParams) => void;
  onLayoutResizeColWidth?: (params: ResizeParams) => void;
  onLayoutResizeColHeight?: (params: ResizeParams) => void;
  onLayoutResizeTreeWidth?: (params: ResizeParams) => void;
  onLayoutResizeMouseDown?: (data: {
    event: Partial<MouseEvent>;
    resizeInfo?: ResizeInfo;
  }) => void;
  onLayoutResizeMouseUp?: (data: {
    event: Partial<MouseEvent>;
    resizeInfo?: ResizeInfo;
  }) => void;
  onLayoutResizeMouseMove?: (data: {
    event: Partial<MouseEvent>;
    resizeInfo?: ResizeInfo;
  }) => void;

  // ============== Global ====================
  onKeyBoardDown?: (event: KeyboardEvent) => void;
  onKeyBoardUp?: (event: KeyboardEvent) => void;
  onCopied?: (copyData: string) => void;
  onActionIconHover?: (event: GEvent) => void;
  onActionIconHoverOff?: (event: GEvent) => void;
  onActionIconClick?: (event: GEvent) => void;
  onContextMenu?: (event: GEvent) => void;
  onClick?: (event: GEvent) => void;
  onHover?: (event: GEvent) => void;
  onDoubleClick?: (event: GEvent) => void;
  onMouseHover?: (event: GEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onSelected?: (cells: S2CellType[]) => void;
  onReset?: (event: KeyboardEvent) => void;
  onLinkFieldJump?: (data: { key: string; record: RawData }) => void;
  onScroll?: (position: CellScrollPosition) => void;

  // ============== Auto 自动生成的 ================
  onRowCellBrushSelection?: (event: GEvent) => void;
  onColCellBrushSelection?: (event: GEvent) => void;
}

// useResize 参数
export interface ResizeEffectParams {
  s2: SpreadSheet;
  container: HTMLDivElement; // 只包含了 sheet 容器
  wrapper: HTMLDivElement; // 包含了 sheet + foot(page) + header
  adaptive: Adaptive | undefined;
}

// Tooltip 操作项
export interface TooltipOperatorProps
  extends Omit<TooltipOperatorOptions, 'onClick'> {
  onlyMenu: boolean;
  cell: S2CellType;
}

// 下钻相关类型
export interface BaseDataSet {
  name: string;
  value: string;
  type?: 'text' | 'location' | 'date';
  disabled?: boolean;
}

export interface BaseDrillDownComponentProps<DataSet = BaseDataSet> {
  className?: string;
  titleText?: string;
  searchText?: string;
  clearButtonText?: string;
  dataSet?: DataSet[] | undefined;
  drillFields?: string[];
  disabledFields?: string[];
  getDrillFields?: (drillFields: string[]) => void;
  setDrillFields?: (drillFields: string[]) => void;
  drillVisible?: boolean;
}

export interface PartDrillDownInfo {
  // The data of drill down
  drillData: RawData[];
  // The field of drill down
  drillField: string;
}

export interface PartDrillDown<T = BaseDrillDownComponentProps> {
  // The configuration of drill down
  drillConfig: T;
  // The numbers of drill down result
  drillItemsNum?: number;
  fetchData: (meta: Node, drillFields: string[]) => Promise<PartDrillDownInfo>;
  // Clear the info of drill down
  clearDrillDown?: {
    rowId: string;
  };
  // Decide the drill down icon show conditions.
  displayCondition?: (meta: Node) => boolean;
}
