import type { Point } from '@antv/g-canvas';
import { isEmpty } from 'lodash';
import {
  CellTypes,
  SPLIT_LINE_WIDTH,
  HORIZONTAL_RESIZE_AREA_KEY_PRE,
  KEY_GROUP_COL_RESIZE_AREA,
  ResizeAreaEffect,
  ResizeDirectionType,
  S2Event,
} from '../common/constant';
import { CellBorderPosition, CellClipBox } from '../common/interface';
import type { DefaultCellTheme, IconTheme } from '../common/interface';
import type { AreaRange } from '../common/interface/scroll';
import {
  adjustColHeaderScrollingTextPosition,
  adjustColHeaderScrollingViewport,
  getTextAndFollowingIconPosition,
  getTextAreaRange,
} from '../utils/cell/cell';
import { renderIcon, renderLine } from '../utils/g-renders';
import { isLastColumnAfterHidden } from '../utils/hide-columns';
import {
  getOrCreateResizeAreaGroupById,
  getResizeAreaAttrs,
  shouldAddResizeArea,
} from '../utils/interaction/resize';
import { Frame, type ColHeaderConfig } from '../facet/header';
import { isEqualDisplaySiblingNodeId } from './../utils/hide-columns';
import { HeaderCell } from './header-cell';

export class ColCell extends HeaderCell {
  protected declare headerConfig: ColHeaderConfig;

  /** 文字绘制起始坐标 */
  protected textPosition: Point;

  public get cellType() {
    return CellTypes.COL_CELL;
  }

  protected getBorderPositions(): CellBorderPosition[] {
    return [CellBorderPosition.TOP, CellBorderPosition.RIGHT];
  }

  protected initCell() {
    super.initCell();
    // 1、draw rect background
    this.drawBackgroundShape();
    // interactive background shape
    this.drawInteractiveBgShape();
    // interactive cell border shape
    this.drawInteractiveBorderShape();
    // draw text
    this.drawTextShape();
    // 绘制字段标记 -- icon
    this.drawConditionIconShapes();
    // draw action icons
    this.drawActionIcons();
    // draw borders
    this.drawBorders();
    // draw resize ares
    this.drawResizeArea();
    this.addExpandColumnIconShapes();
    this.update();
  }

  protected getMaxTextWidth(): number {
    const { width } = this.getBBoxByType(CellClipBox.CONTENT_BOX);
    return width - this.getActionIconsWidth();
  }

  protected getIconPosition(): Point {
    if (this.meta.isLeaf) {
      return super.getIconPosition(this.getActionIconsCount());
    }

    // 非叶子节点，因 label 滚动展示，需要适配不同 align情况
    const iconStyle = this.getIconStyle();
    const iconMarginLeft = iconStyle!.margin!.left;

    const textStyle = this.getTextStyle();
    const position = this.textPosition;
    const textX = position.x;

    const y = position.y - iconStyle!.size! / 2;

    if (textStyle.textAlign === 'left') {
      /**
       * textX          x
       *   |            |
       *   v            v
       *   +---------+  +----+
       *   |  text   |--|icon|
       *   +---------+  +----+
       */
      return {
        x: textX + this.actualTextWidth + iconMarginLeft!,
        y,
      };
    }
    if (textStyle.textAlign === 'right') {
      /**
       *         textX  x
       *             |  |
       *             v  v
       *   +---------+  +----+
       *   |  text   |--|icon|
       *   +---------+  +----+
       */
      return {
        x: textX + iconMarginLeft!,
        y,
      };
    }

    /**
     *      textX     x
     *        |       |
     *        v       v
     *   +---------+  +----+
     *   |  text   |--|icon|
     *   +---------+  +----+
     */
    return {
      x: textX + this.actualTextWidth / 2 + iconMarginLeft!,
      y,
    };
  }

  protected isBolderText() {
    // 非叶子节点、小计总计，均为粗体
    const { isLeaf, isTotals } = this.meta;
    if (isTotals || !isLeaf) {
      return true;
    }
    return false;
  }

  protected getTextPosition(): Point {
    const { isLeaf } = this.meta;
    const {
      width,
      scrollContainsRowHeader,
      cornerWidth = 0,
      scrollX = 0,
    } = this.headerConfig;

    const textStyle = this.getTextStyle();
    const contentBox = this.getBBoxByType(CellClipBox.CONTENT_BOX);
    const iconStyle = this.getIconStyle();

    if (isLeaf) {
      return getTextAndFollowingIconPosition(
        contentBox,
        textStyle,
        this.actualTextWidth,
        iconStyle,
        this.getActionIconsCount(),
      ).text;
    }

    /**
     *  p(x, y)
     *  +----------------------+            x
     *  |                    +--------------->
     *  | viewport           | |ColCell  |
     *  |                    |-|---------+
     *  +--------------------|-+
     *                       |
     *                     y |
     *                       v
     *
     * 将 viewport 坐标(p)映射到 col header 的坐标体系中，简化计算逻辑
     *
     */
    const viewport: AreaRange = {
      start: scrollX - (scrollContainsRowHeader ? cornerWidth : 0),
      width: width + (scrollContainsRowHeader ? cornerWidth : 0),
    };

    const { textAlign } = this.getTextStyle();
    const adjustedViewport = adjustColHeaderScrollingViewport(
      viewport,
      textAlign!,
      this.getStyle()!.cell?.padding,
    );

    const actionIconSpace = this.getActionIconsWidth();
    const textAndIconSpace = this.actualTextWidth + actionIconSpace;

    const textAreaRange = getTextAreaRange(
      adjustedViewport,
      { start: contentBox.x, width: contentBox.width },
      textAndIconSpace, // icon position 默认为 right
    );

    // textAreaRange.start 是 text&icon 整个区域的 center
    // 此处按实际样式(left or right)调整计算出的文字绘制点
    const textX = adjustColHeaderScrollingTextPosition(
      textAreaRange,
      this.actualTextWidth,
      actionIconSpace,
      textAlign!,
    );
    const textY = contentBox.y + contentBox.height / 2;

    this.textPosition = { x: textX, y: textY };
    return this.textPosition;
  }

  protected getActionIconsWidth() {
    const { size, margin } = this.getStyle()!.icon!;
    const iconCount = this.getActionIconsCount();
    return (
      (size! + margin!.left!) * iconCount + (iconCount > 0 ? margin!.right! : 0)
    );
  }

  protected getColResizeAreaKey() {
    return this.meta.key;
  }

  protected getColResizeArea() {
    return getOrCreateResizeAreaGroupById(
      this.spreadsheet,
      KEY_GROUP_COL_RESIZE_AREA,
    );
  }

  protected getHorizontalResizeAreaName() {
    return `${HORIZONTAL_RESIZE_AREA_KEY_PRE}${this.meta.key}`;
  }

  protected drawHorizontalResizeArea() {
    // 隐藏列头时不绘制水平热区 https://github.com/antvis/S2/issues/1603
    const isHiddenCol = this.spreadsheet.options.style?.colCfg?.height === 0;

    if (
      isHiddenCol ||
      !this.shouldDrawResizeAreaByType('colCellVertical', this)
    ) {
      return;
    }

    const { cornerWidth = 0, viewportWidth: headerWidth } = this.headerConfig;
    const { y, height } = this.meta;
    const resizeStyle = this.getResizeAreaStyle();
    const resizeArea = this.getColResizeArea();
    if (!resizeArea) {
      return;
    }

    const resizeAreaName = this.getHorizontalResizeAreaName();

    const existedHorizontalResizeArea = resizeArea?.find(
      (element) => element.attrs.name === resizeAreaName,
    );

    // 如果已经绘制当前列高调整热区热区，则不再绘制
    if (existedHorizontalResizeArea) {
      return;
    }

    const resizeAreaWidth =
      cornerWidth +
      Frame.getVerticalBorderWidth(this.spreadsheet) +
      headerWidth;
    // 列高调整热区
    resizeArea?.addShape('rect', {
      attrs: {
        ...getResizeAreaAttrs({
          theme: resizeStyle,
          type: ResizeDirectionType.Vertical,
          id: this.getColResizeAreaKey(),
          effect: ResizeAreaEffect.Field,
          offsetX: 0,
          offsetY: y,
          width: resizeAreaWidth,
          height,
          meta: this.meta,
        }),
        name: resizeAreaName,
        x: 0,
        y: y + height - resizeStyle.size!,
        width: resizeAreaWidth,
      },
    });
  }

  protected shouldAddVerticalResizeArea() {
    const { x, y, width, height } = this.meta;
    const {
      scrollX,
      scrollY,
      scrollContainsRowHeader,
      cornerWidth = 0,
      height: headerHeight,
      width: headerWidth,
    } = this.headerConfig;

    const resizeStyle = this.getResizeAreaStyle();

    const resizeAreaBBox = {
      x: x + width - resizeStyle.size!,
      y,
      width: resizeStyle.size!,
      height,
    };

    const resizeClipAreaBBox = {
      x: scrollContainsRowHeader ? -cornerWidth : 0,
      y: 0,
      width: scrollContainsRowHeader ? cornerWidth + headerWidth : headerWidth,
      height: headerHeight,
    };

    return shouldAddResizeArea(resizeAreaBBox, resizeClipAreaBBox, {
      scrollX,
      scrollY,
    });
  }

  protected getVerticalResizeAreaOffset() {
    const { x, y } = this.meta;
    const { scrollX = 0, position } = this.headerConfig;
    return {
      x: position.x + x - scrollX,
      y: position.y + y,
    };
  }

  protected drawVerticalResizeArea() {
    if (
      !this.meta.isLeaf ||
      !this.shouldDrawResizeAreaByType('colCellHorizontal', this)
    ) {
      return;
    }

    const { label, width, height } = this.meta;

    const resizeStyle = this.getResizeAreaStyle();
    const resizeArea = this.getColResizeArea();

    if (!resizeArea || !this.shouldAddVerticalResizeArea()) {
      return;
    }

    const { x: offsetX, y: offsetY } = this.getVerticalResizeAreaOffset();

    // 列宽调整热区
    // 基准线是根据container坐标来的，因此把热区画在container
    resizeArea?.addShape('rect', {
      attrs: {
        ...getResizeAreaAttrs({
          theme: resizeStyle,
          type: ResizeDirectionType.Horizontal,
          effect: ResizeAreaEffect.Cell,
          id: label,
          offsetX,
          offsetY,
          width,
          height,
          meta: this.meta,
        }),
        x: offsetX + width - resizeStyle.size!,
        y: offsetY,
        height,
      },
    });
  }

  // 绘制热区
  protected drawResizeArea() {
    this.drawHorizontalResizeArea();
    this.drawVerticalResizeArea();
  }

  protected hasHiddenColumnCell() {
    const { interaction, tooltip } = this.spreadsheet.options;

    const hiddenColumnsDetail = this.spreadsheet.store.get(
      'hiddenColumnsDetail',
      [],
    );

    if (
      isEmpty(hiddenColumnsDetail) ||
      isEmpty(interaction?.hiddenColumnFields) ||
      !tooltip?.operation?.hiddenColumns
    ) {
      return false;
    }
    return !!hiddenColumnsDetail.find((column) =>
      isEqualDisplaySiblingNodeId(column?.displaySiblingNode, this.meta.id),
    );
  }

  protected getExpandIconTheme(): IconTheme {
    const themeCfg = this.getStyle() as DefaultCellTheme;
    return themeCfg.icon!;
  }

  protected addExpandColumnSplitLine() {
    const { x, y, width, height } = this.getBBoxByType();
    const { horizontalBorderColor, horizontalBorderColorOpacity } =
      this.theme.splitLine!;
    const lineX = this.isLastColumn() ? x + width : x;

    renderLine(
      this,
      {
        x1: lineX,
        y1: y,
        x2: lineX,
        y2: y + height,
      },
      {
        stroke: horizontalBorderColor,
        lineWidth: SPLIT_LINE_WIDTH,
        strokeOpacity: horizontalBorderColorOpacity,
      },
    );
  }

  protected addExpandColumnIconShapes() {
    if (!this.hasHiddenColumnCell()) {
      return;
    }
    this.addExpandColumnSplitLine();
    this.addExpandColumnIcon();
  }

  protected addExpandColumnIcon() {
    const iconConfig = this.getExpandColumnIconConfig();
    const icon = renderIcon(this, {
      ...iconConfig,
      name: 'ExpandColIcon',
      cursor: 'pointer',
    });
    icon.on('click', () => {
      this.spreadsheet.emit(S2Event.LAYOUT_COLS_EXPANDED, this.meta);
    });
  }

  // 在隐藏的下一个兄弟节点的起始坐标显示隐藏提示线和展开按钮, 如果是尾元素, 则显示在前一个兄弟节点的结束坐标
  protected getExpandColumnIconConfig() {
    const { size = 0 } = this.getExpandIconTheme();
    const { x, y, width, height } = this.getBBoxByType();

    const baseIconX = x - size;
    const iconX = this.isLastColumn() ? baseIconX + width : baseIconX;
    const iconY = y + height / 2 - size / 2;

    return {
      x: iconX,
      y: iconY,
      width: size * 2,
      height: size,
    };
  }

  protected isLastColumn() {
    return isLastColumnAfterHidden(this.spreadsheet, this.meta.id);
  }
}
