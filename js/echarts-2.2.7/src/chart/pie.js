/**
 * echarts图表类：饼图
 *
 * @desc echarts基于Canvas，纯Javascript图表库，提供直观，生动，可交互，可个性化定制的数据统计图表。
 * @author Kener (@Kener-林峰, kener.linfeng@gmail.com)
 *
 */
define(function (require) {
    var ChartBase = require('./base');

    // 图形依赖
    var TextShape = require('zrender/shape/Text');
    var RingShape = require('zrender/shape/Ring');
    var CircleShape = require('zrender/shape/Circle');
    var SectorShape = require('zrender/shape/Sector');
    var PolylineShape = require('zrender/shape/Polyline');

    var ecConfig = require('../config');
    // 饼图默认参数
    ecConfig.pie = {
        zlevel: 0,                  // 一级层叠
        z: 2,                       // 二级层叠
        clickable: true,
        legendHoverLink: true,
        center: ['50%', '50%'],     // 默认全局居中
        radius: [0, '75%'],
        clockWise: true,            // 默认顺时针
        startAngle: 90,
        minAngle: 0,                // 最小角度改为0
        selectedOffset: 10,         // 选中是扇区偏移量
        // selectedMode: false,     // 选择模式，默认关闭，可选single，multiple
        // roseType: null,          // 南丁格尔玫瑰图模式，'radius'（半径） | 'area'（面积）
        itemStyle: {
            normal: {
                // color: 各异,
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                label: {
                    show: true,
                    position: 'outer'
                    // formatter: 标签文本格式器，同Tooltip.formatter，不支持异步回调
                    // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                    // distance: 当position为inner时有效，为label位置到圆心的距离与圆半径(环状图为内外半径和)的比例系数
                },
                labelLine: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        // color: 各异,
                        width: 1,
                        type: 'solid'
                    }
                }
            },
            emphasis: {
                // color: 各异,
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                label: {
                    show: false
                    // position: 'outer'
                    // formatter: 标签文本格式器，同Tooltip.formatter，不支持异步回调
                    // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                    // distance: 当position为inner时有效，为label位置到圆心的距离与圆半径(环状图为内外半径和)的比例系数
                },
                labelLine: {
                    show: false,
                    length: 20,
                    lineStyle: {
                        // color: 各异,
                        width: 1,
                        type: 'solid'
                    }
                }
            }
        }
    };

    var ecData = require('../util/ecData');
    var zrUtil = require('zrender/tool/util');
    var zrMath = require('zrender/tool/math');
    var zrColor = require('zrender/tool/color');

    /**
     * 构造函数
     * @param {Object} messageCenter echart消息中心
     * @param {ZRender} zr zrender实例
     * @param {Object} series 数据
     * @param {Object} component 组件
     */
    function Pie(ecTheme, messageCenter, zr, option, myChart){
        // 图表基类
        ChartBase.call(this, ecTheme, messageCenter, zr, option, myChart);

        var self = this;
        /**
         * 输出动态视觉引导线
         */
        self.shapeHandler.onmouseover = function (param) {
            var shape = param.target;
            var seriesIndex = ecData.get(shape, 'seriesIndex');
            var dataIndex = ecData.get(shape, 'dataIndex');
            var percent = ecData.get(shape, 'special');

            var center = [shape.style.x, shape.style.y];
            var startAngle = shape.style.startAngle;
            var endAngle = shape.style.endAngle;
            var midAngle = ((endAngle + startAngle) / 2 + 360) % 360; // 中值
            var defaultColor = shape.highlightStyle.color;

            // 文本标签，需要显示则会有返回
            var label = self.getLabel(
                    seriesIndex, dataIndex, percent,
                    center, midAngle, defaultColor,
                    true
                );

            if (label) {
                self.zr.addHoverShape(label);
            }

            // 文本标签视觉引导线，需要显示则会有返回
            var labelLine = self.getLabelLine(
                    seriesIndex, dataIndex,
                    center, shape.style.r0, shape.style.r,
                    midAngle, defaultColor,
                    true
                );

            if (labelLine) {
                self.zr.addHoverShape(labelLine);
            }
        };

        this.refresh(option);
    }

    Pie.prototype = {
        type: ecConfig.CHART_TYPE_PIE,
        /**
         * 绘制图形
         */
        _buildShape: function () {
            var series = this.series;
            var legend = this.component.legend;
            this.selectedMap = {};
            this._selected = {};
            var center;
            var radius;

            var pieCase;        // 饼图箱子
            this._selectedMode = false;
            var serieName;
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === ecConfig.CHART_TYPE_PIE) {
                    series[i] = this.reformOption(series[i]);
                    this.legendHoverLink = series[i].legendHoverLink || this.legendHoverLink;
                    serieName = series[i].name || '';
                    // 系列图例开关
                    this.selectedMap[serieName] = legend ? legend.isSelected(serieName) : true;
                    if (!this.selectedMap[serieName]) {
                        continue;
                    }

                    center = this.parseCenter(this.zr, series[i].center);
                    radius = this.parseRadius(this.zr, series[i].radius);
                    this._selectedMode = this._selectedMode || series[i].selectedMode;
                    this._selected[i] = [];
                    if (this.deepQuery([series[i], this.option], 'calculable')) {
                        pieCase = {
                            zlevel: series[i].zlevel,
                            z: series[i].z,
                            hoverable: false,
                            style: {
                                x: center[0],          // 圆心横坐标
                                y: center[1],          // 圆心纵坐标
                                // 圆环内外半径
                                r0: radius[0] <= 0="" 2="" 10="" 360="" ?="" :="" radius[0]="" -="" 10,="" r:="" radius[1]="" +="" brushtype:="" 'stroke',="" linewidth:="" 1,="" strokecolor:="" series[i].calculableholdercolor="" ||="" this.ectheme.calculableholdercolor="" ecconfig.calculableholdercolor="" }="" };="" ecdata.pack(piecase,="" series[i],="" i,="" undefined,="" -1);="" this.setcalculable(piecase);="" piecase="radius[0]" <="10" new="" circleshape(piecase)="" ringshape(piecase);="" this.shapelist.push(piecase);="" this._buildsinglepie(i);="" this.buildmark(i);="" this.addshapelist();="" },="" **="" *="" 构建单个饼图="" @param="" {number}="" seriesindex="" 系列索引="" _buildsinglepie:="" function="" (seriesindex)="" {="" var="" series="this.series;" serie="series[seriesIndex];" data="serie.data;" legend="this.component.legend;" itemname;="" totalselected="0;" 迭代累计选中且非0个数="" totalselectedvalue0="0;" 迭代累计选中0只个数="" totalvalue="0;" 迭代累计="" maxvalue="Number.NEGATIVE_INFINITY;" singleshapelist="[];" 计算需要显示的个数和总值="" for="" (var="" i="0," l="data.length;" l;="" i++)="" itemname="data[i].name;" this.selectedmap[itemname]="legend" legend.isselected(itemname)="" true;="" if="" (this.selectedmap[itemname]="" &&="" !isnan(data[i].value))="" (+data[i].value="" !="=" 0)="" totalselected++;="" else="" totalselectedvalue0++;="" +data[i].value);="" (totalvalue="==" return;="" percent="100;" clockwise="serie.clockWise;" startangle="(serie.startAngle.toFixed(2)" 360)="" %="" 360;="" endangle;="" minangle="serie.minAngle" 0.01;="" #bugfixed="" totalangle="360" (minangle="" totalselected)="" 0.01="" totalselectedvalue0;="" defaultcolor;="" rosetype="serie.roseType;" center;="" radius;="" r0;="" 扇形内半径="" r1;="" 扇形外半径="" (!this.selectedmap[itemname]="" isnan(data[i].value))="" continue;="" 默认颜色策略，有图例则从图例中获取颜色定义，没有就全局颜色定义="" defaultcolor="legend" legend.getcolor(itemname)="" this.zr.getcolor(i);="" totalvalue;="" (rosetype="" )="" endangle="clockWise" (startangle="" (percent="" 0.01))="" 0.01));="" l)="" (360="" startangle);="" 0;="" 100).tofixed(2);="" center="this.parseCenter(this.zr," serie.center);="" radius="this.parseRadius(this.zr," serie.radius);="" r0="+radius[0];" r1="+radius[1];" 'radius')="" (r1="" r0)="" 0.8="" 0.2="" 'area')="" maxvalue)="" (clockwise)="" temp;="" temp="startAngle;" this._builditem(="" singleshapelist,="" seriesindex,="" percent,="" data[i].selected,="" center,="" r0,="" r1,="" startangle,="" endangle,="" );="" (!clockwise)="" this._autolabellayout(singleshapelist,="" r1);="" this.shapelist.push(singleshapelist[i]);="" 构建单个扇形及指标="" _builditem:="" (="" dataindex,="" isselected,="" midangle="((endAngle" startangle)="" 中值="" 扇形="" sector="this.getSector(" 图形需要附加的私有数据="" ecdata.pack(="" sector,="" series[seriesindex],="" series[seriesindex].data[dataindex],="" series[seriesindex].data[dataindex].name,="" singleshapelist.push(sector);="" 文本标签，需要显示则会有返回="" label="this.getLabel(" midangle,="" defaultcolor,="" false="" 文本标签视觉引导线，需要显示则会有返回="" labelline="this.getLabelLine(" (labelline)="" labelline,="" singleshapelist.push(labelline);="" (label)="" label,="" label._labelline="labelLine;" singleshapelist.push(label);="" 构建扇形="" getsector:="" querytarget="[data," serie];="" 多级控制="" normal="this.deepMerge(" querytarget,="" 'itemstyle.normal'="" {};="" emphasis="this.deepMerge(" 'itemstyle.emphasis'="" normalcolor="this.getItemStyleColor(normal.color," data)="" emphasiscolor="this.getItemStyleColor(emphasis.color," (typeof="" 'string'="" zrcolor.lift(normalcolor,="" -0.2)="" zlevel:="" serie.zlevel,="" z:="" serie.z,="" clickable:="" this.deepquery(querytarget,="" 'clickable'),="" style:="" x:="" center[0],="" 圆心横坐标="" y:="" center[1],="" 圆心纵坐标="" r0:="" 圆环内半径="" 圆环外半径="" startangle:="" endangle:="" 'both',="" color:="" normalcolor,="" normal.borderwidth,="" normal.bordercolor,="" linejoin:="" 'round'="" highlightstyle:="" emphasiscolor,="" emphasis.borderwidth,="" emphasis.bordercolor,="" _seriesindex:="" _dataindex:="" dataindex="" (isselected)="" sector.style.endangle)="" 2).tofixed(2)="" sector.style._hasselected="true;" sector.style._x="sector.style.x;" sector.style._y="sector.style.y;" offset="this.query(serie," 'selectedoffset');="" sector.style.x="" true)="" offset;="" sector.style.y="" this._selected[seriesindex][dataindex]="true;" (this._selectedmode)="" sector.onclick="this.shapeHandler.onclick;" (this.deepquery([data,="" serie,="" this.option],="" 'calculable'))="" this.setcalculable(sector);="" sector.draggable="true;" “emphasis显示”添加事件响应="" (this._needlabel(serie,="" data,="" emphasis下显示文本="" this._needlabelline(serie,="" emphasis下显示引导线="" sector.onmouseover="this.shapeHandler.onmouseover;" sectorshape(sector);="" return="" sector;="" 需要显示则会有返回构建好的shape，否则返回undefined="" getlabel:="" isemphasis="" 特定状态下是否需要显示文本标签="" (!this._needlabel(serie,="" isemphasis))="" status="isEmphasis" 'emphasis'="" 'normal';="" serie里有默认配置，放心大胆的用！="" itemstyle="zrUtil.merge(" zrutil.clone(data.itemstyle)="" {},="" serie.itemstyle="" label配置="" labelcontrol="itemStyle[status].label;" textstyle="labelControl.textStyle" centerx="center[0];" centery="center[1];" x;="" y;="" 标签位置半径="" textalign;="" textbaseline="middle" ;="" labelcontrol.position="labelControl.position" itemstyle.normal.label.position;="" (labelcontrol.position="==" 'center')="" center显示="" x="centerX;" y="centerY;" textalign="center" 'inner'="" 'inside')="" 内部标签显示,="" 按外半径比例计算标签位置="" radius[1])="" (labelcontrol.distance="" 0.5);="" zrmath.cos(midangle,="" true));="" zrmath.sin(midangle,="" 外部显示，默认="" 'outer')="" (-itemstyle[status].labelline.length);="">= 90 && midAngle <= 5="" 20="" 270)="" ?="" 'right'="" :="" 'left';="" }="" if="" (labelcontrol.position="" !="center" &&="" labelcontrol.position="" )="" {="" x="" +="textAlign" =="=" 'left'="" -20;="" data.__labelx="x" -="" (textalign="==" -5);="" data.__labely="y;" var="" ts="new" textshape({="" zlevel:="" serie.zlevel,="" z:="" serie.z="" 1,="" hoverable:="" false,="" style:="" x:="" x,="" y:="" y,="" color:="" textstyle.color="" ||="" defaultcolor,="" text:="" this.getlabeltext(seriesindex,="" dataindex,="" percent,="" status),="" textalign:="" textstyle.align="" textalign,="" textbaseline:="" textstyle.baseline="" textbaseline,="" textfont:="" this.getfont(textstyle)="" },="" highlightstyle:="" brushtype:="" 'fill'="" });="" ts._radius="radius;" ts._labelposition="labelControl.position" 'outer';="" ts._rect="ts.getRect(ts.style);" ts._seriesindex="seriesIndex;" ts._dataindex="dataIndex;" return="" ts;="" **="" *="" 根据lable.format计算label="" text="" getlabeltext:="" function="" (seriesindex,="" status)="" series="this.series;" serie="series[seriesIndex];" data="serie.data[dataIndex];" formatter="this.deepQuery(" [data,="" serie],="" 'itemstyle.'="" status="" '.label.formatter'="" );="" (formatter)="" (typeof="" 'function')="" formatter.call(="" this.mychart,="" seriesindex:="" seriesindex,="" seriesname:="" serie.name="" '',="" series:="" serie,="" dataindex:="" data:="" data,="" name:="" data.name,="" value:="" data.value,="" percent:="" percent="" else="" 'string')="" .replace('{b}','{b0}')="" .replace('{c}','{c0}')="" .replace('{d}','{d0}');="" serie.name)="" .replace('{b0}',="" data.name)="" .replace('{c0}',="" data.value)="" .replace('{d0}',="" percent);="" formatter;="" data.name;="" 需要显示则会有返回构建好的shape，否则返回undefined="" getlabelline:="" (="" center,="" r0,="" r1,="" midangle,="" isemphasis="" 特定状态下是否需要显示文本标签="" (this._needlabelline(serie,="" isemphasis))="" 'emphasis'="" 'normal';="" serie里有默认配置，放心大胆的用！="" itemstyle="zrUtil.merge(" zrutil.clone(data.itemstyle)="" {},="" serie.itemstyle="" labelline配置="" labellinecontrol="itemStyle[status].labelLine;" linestyle="labelLineControl.lineStyle" {};="" centerx="center[0];" 圆心横坐标="" centery="center[1];" 圆心纵坐标="" 视觉引导线起点半径="" minradius="r1;" 视觉引导线终点半径="" maxradius="this.parseRadius(this.zr," serie.radius)[1]="" (-labellinecontrol.length);="" cosvalue="zrMath.cos(midAngle," true);="" sinvalue="zrMath.sin(midAngle," new="" polylineshape({="" pointlist:="" [="" cosvalue,="" ],="" data.__labelx,="" ]="" xstart:="" ystart:="" sinvalue,="" xend:="" yend:="" strokecolor:="" linestyle.color="" linetype:="" linestyle.type,="" linewidth:="" linestyle.width="" _seriesindex:="" _dataindex:="" dataindex="" return;="" 返回特定状态（normal="" or="" emphasis）下是否需要显示label标签文本="" @param="" {object}="" {boolean}="" true="" is="" and="" false="" 'normal'="" _needlabel:="" (serie,="" isemphasis)="" this.deepquery(="" (isemphasis="" 'normal')="" '.label.show'="" emphasis）下是否需要显示labelline标签视觉引导线="" _needlabelline:="" +'.labelline.show'="" {array.<object="">} sList 单系列图形集合
         */
        _autoLabelLayout : function (sList, center, r) {
            var leftList = [];
            var rightList = [];

            for (var i = 0, l = sList.length; i < l; i++) {
                if (sList[i]._labelPosition === 'outer' || sList[i]._labelPosition === 'outside') {
                    sList[i]._rect._y = sList[i]._rect.y;
                    if (sList[i]._rect.x < center[0]) {
                        leftList.push(sList[i]);
                    }
                    else {
                        rightList.push(sList[i]);
                    }
                }
            }
            this._layoutCalculate(leftList, center, r, -1);
            this._layoutCalculate(rightList, center, r, 1);
        },

        /**
         * @param {Array.<object>} tList 单系列文本图形集合
         * @param {number} direction 水平方向参数，left为-1，right为1
         */
        _layoutCalculate : function(tList, center, r, direction) {
            tList.sort(function(a, b){
                return a._rect.y - b._rect.y;
            });

            // 压
            function _changeDown(start, end, delta, direction) {
                for (var j = start; j < end; j++) {
                    tList[j]._rect.y += delta;
                    tList[j].style.y += delta;
                    if (tList[j]._labelLine) {
                        tList[j]._labelLine.style.pointList[1][1] += delta;
                        tList[j]._labelLine.style.pointList[2][1] += delta;
                    }
                    if (j > start
                        && j + 1 < end
                        && tList[j + 1]._rect.y > tList[j]._rect.y + tList[j]._rect.height
                    ) {
                        _changeUp(j, delta / 2);
                        return;
                    }
                }

                _changeUp(end - 1, delta / 2);
            }

            // 弹
            function _changeUp(end, delta) {
                for (var j = end; j >= 0; j--) {
                    tList[j]._rect.y -= delta;
                    tList[j].style.y -= delta;
                    if (tList[j]._labelLine) {
                        tList[j]._labelLine.style.pointList[1][1] -= delta;
                        tList[j]._labelLine.style.pointList[2][1] -= delta;
                    }
                    if (j > 0
                        && tList[j]._rect.y > tList[j - 1]._rect.y + tList[j - 1]._rect.height
                    ) {
                        break;
                    }
                }
            }

            function _changeX(sList, isDownList, center, r, direction) {
                var x = center[0];
                var y = center[1];
                var deltaX;
                var deltaY;
                var length;
                var lastDeltaX = direction > 0
                    ? isDownList                // 右侧
                        ? Number.MAX_VALUE      // 下
                        : 0                     // 上
                    : isDownList                // 左侧
                        ? Number.MAX_VALUE      // 下
                        : 0;                    // 上

                for (var i = 0, l = sList.length; i < l; i++) {
                    deltaY = Math.abs(sList[i]._rect.y - y);
                    length = sList[i]._radius - r;
                    deltaX = (deltaY < r + length)
                        ? Math.sqrt(
                              (r + length + 20) * (r + length + 20)
                              - Math.pow(sList[i]._rect.y - y, 2)
                          )
                        : Math.abs(
                              sList[i]._rect.x + (direction > 0 ? 0 : sList[i]._rect.width) - x
                          );
                    if (isDownList && deltaX >= lastDeltaX) {
                        // 右下，左下
                        deltaX = lastDeltaX - 10;
                    }
                    if (!isDownList && deltaX <= lastdeltax)="" {="" 右上，左上="" deltax="lastDeltaX" +="" 10;="" }="" slist[i]._rect.x="sList[i].style.x" =="" x="" *="" direction;="" if="" (slist[i]._labelline)="" slist[i]._labelline.style.pointlist[2][0]="x" (deltax="" -="" 5)="" slist[i]._labelline.style.pointlist[1][0]="x" 20)="" *direction;="" lastdeltax="deltaX;" var="" lasty="0;" delta;="" len="tList.length;" uplist="[];" downlist="[];" for="" (var="" i="0;" <="" len;="" i++)="" delta="tList[i]._rect.y" lasty;="" (delta="" 0)="" _changedown(i,="" len,="" -delta,="" direction);="" tlist[i]._rect.height;="" (this.zr.getheight()="" _changeup(len="" 1,="" this.zr.getheight());="" (tlist[i]._rect.y="">= center[1]) {
                    downList.push(tList[i]);
                }
                else {
                    upList.push(tList[i]);
                }
            }
            _changeX(downList, true, center, r, direction);
            _changeX(upList, false, center, r, direction);
        },

        /**
         * 参数修正&默认值赋值，重载基类方法
         * @param {Object} opt 参数
         */
        reformOption: function (opt) {
            // 常用方法快捷方式
            var _merge = zrUtil.merge;
            opt = _merge(
                      _merge(
                          opt || {}, zrUtil.clone(this.ecTheme.pie || {})
                      ),
                      zrUtil.clone(ecConfig.pie)
                  );

            // 通用字体设置
            opt.itemStyle.normal.label.textStyle = this.getTextStyle(
                opt.itemStyle.normal.label.textStyle
            );
            opt.itemStyle.emphasis.label.textStyle = this.getTextStyle(
                opt.itemStyle.emphasis.label.textStyle
            );
            this.z = opt.z;
            this.zlevel = opt.zlevel;
            return opt;
        },

        /**
         * 刷新
         */
        refresh: function (newOption) {
            if (newOption) {
                this.option = newOption;
                this.series = newOption.series;
            }

            this.backupShapeList();
            this._buildShape();
        },

        /**
         * 动态数据增加动画
         */
        addDataAnimation: function (params, done) {
            var series = this.series;
            var aniMap = {}; // seriesIndex索引参数
            for (var i = 0, l = params.length; i < l; i++) {
                aniMap[params[i][0]] = params[i];
            }

            var aniCount = 0;
            function animationDone() {
                aniCount--;
                if (aniCount === 0) {
                    done && done();
                }
            }

            // 构建新的饼图匹配差异做动画
            var sectorMap = {};
            var textMap = {};
            var lineMap = {};
            var backupShapeList = this.shapeList;
            this.shapeList = [];

            var seriesIndex;
            var isHead;
            var dataGrow;
            var deltaIdxMap = {};   // 修正新增数据后会对dataIndex产生错位匹配
            for (var i = 0, l = params.length; i < l; i++) {
                seriesIndex = params[i][0];
                isHead = params[i][2];
                dataGrow = params[i][3];
                if (series[seriesIndex]
                    && series[seriesIndex].type === ecConfig.CHART_TYPE_PIE
                ) {
                    if (isHead) {
                        if (!dataGrow) {
                            sectorMap[
                                seriesIndex
                                + '_'
                                + series[seriesIndex].data.length
                            ] = 'delete';
                        }
                        deltaIdxMap[seriesIndex] = 1;
                    }
                    else {
                        if (!dataGrow) {
                            sectorMap[seriesIndex + '_-1'] = 'delete';
                            deltaIdxMap[seriesIndex] = -1;
                        }
                        else {
                            deltaIdxMap[seriesIndex] = 0;
                        }
                    }
                    this._buildSinglePie(seriesIndex);
                }
            }
            var dataIndex;
            var key;
            for (var i = 0, l = this.shapeList.length; i < l; i++) {
                seriesIndex = this.shapeList[i]._seriesIndex;
                dataIndex = this.shapeList[i]._dataIndex;
                key = seriesIndex + '_' + dataIndex;
                // map映射让n*n变n
                switch (this.shapeList[i].type) {
                    case 'sector' :
                        sectorMap[key] = this.shapeList[i];
                        break;
                    case 'text' :
                        textMap[key] = this.shapeList[i];
                        break;
                    case 'polyline' :
                        lineMap[key] = this.shapeList[i];
                        break;
                }
            }
            this.shapeList = [];
            var targeSector;
            for (var i = 0, l = backupShapeList.length; i < l; i++) {
                seriesIndex = backupShapeList[i]._seriesIndex;
                if (aniMap[seriesIndex]) {
                    dataIndex = backupShapeList[i]._dataIndex
                                + deltaIdxMap[seriesIndex];
                    key = seriesIndex + '_' + dataIndex;
                    targeSector = sectorMap[key];
                    if (!targeSector) {
                        continue;
                    }
                    if (backupShapeList[i].type === 'sector') {
                        if (targeSector != 'delete') {
                            aniCount++;
                            // 原有扇形
                            this.zr.animate(backupShapeList[i].id, 'style')
                                .when(
                                    400,
                                    {
                                        startAngle: targeSector.style.startAngle,
                                        endAngle: targeSector.style.endAngle
                                    }
                                )
                                .done(animationDone)
                                .start();
                        }
                        else {
                            aniCount++;
                            // 删除的扇形
                            this.zr.animate(backupShapeList[i].id, 'style')
                                .when(
                                    400,
                                    deltaIdxMap[seriesIndex] < 0
                                    ? { startAngle: backupShapeList[i].style.startAngle }
                                    : { endAngle: backupShapeList[i].style.endAngle }
                                )
                                .done(animationDone)
                                .start();
                        }
                    }
                    else if (backupShapeList[i].type === 'text'
                             || backupShapeList[i].type === 'polyline'
                    ) {
                        if (targeSector === 'delete') {
                            // 删除逻辑一样
                            this.zr.delShape(backupShapeList[i].id);
                        }
                        else {
                            // 懒得新建变量了，借用一下
                            switch (backupShapeList[i].type) {
                                case 'text':
                                    aniCount++;
                                    targeSector = textMap[key];
                                    this.zr.animate(backupShapeList[i].id, 'style')
                                        .when(
                                            400,
                                            {
                                                x :targeSector.style.x,
                                                y :targeSector.style.y
                                            }
                                        )
                                        .done(animationDone)
                                        .start();
                                    break;
                                case 'polyline':
                                    aniCount++;
                                    targeSector = lineMap[key];
                                    this.zr.animate(backupShapeList[i].id, 'style')
                                        .when(
                                            400,
                                            {
                                                pointList:targeSector.style.pointList
                                            }
                                        )
                                        .done(animationDone)
                                        .start();
                                    break;
                            }

                        }
                    }
                }
            }
            this.shapeList = backupShapeList;

            // 没有动画
            if (!aniCount) {
                done && done();
            }
        },

        onclick: function (param) {
            var series = this.series;
            if (!this.isClick || !param.target) {
                // 没有在当前实例上发生点击直接返回
                return;
            }
            this.isClick = false;
            var offset;             // 偏移
            var target = param.target;
            var style = target.style;
            var seriesIndex = ecData.get(target, 'seriesIndex');
            var dataIndex = ecData.get(target, 'dataIndex');

            for (var i = 0, len = this.shapeList.length; i < len; i++) {
                if (this.shapeList[i].id === target.id) {
                    seriesIndex = ecData.get(target, 'seriesIndex');
                    dataIndex = ecData.get(target, 'dataIndex');
                    // 当前点击的
                    if (!style._hasSelected) {
                        var midAngle =
                            ((style.startAngle + style.endAngle) / 2)
                            .toFixed(2) - 0;
                        target.style._hasSelected = true;
                        this._selected[seriesIndex][dataIndex] = true;
                        target.style._x = target.style.x;
                        target.style._y = target.style.y;
                        offset = this.query(
                            series[seriesIndex],
                            'selectedOffset'
                        );
                        target.style.x += zrMath.cos(midAngle, true)
                                          * offset;
                        target.style.y -= zrMath.sin(midAngle, true)
                                          * offset;
                    }
                    else {
                        // 复位
                        target.style.x = target.style._x;
                        target.style.y = target.style._y;
                        target.style._hasSelected = false;
                        this._selected[seriesIndex][dataIndex] = false;
                    }

                    this.zr.modShape(target.id);
                }
                else if (this.shapeList[i].style._hasSelected
                         && this._selectedMode === 'single'
                ) {
                    seriesIndex = ecData.get(this.shapeList[i], 'seriesIndex');
                    dataIndex = ecData.get(this.shapeList[i], 'dataIndex');
                    // 单选模式下需要取消其他已经选中的
                    this.shapeList[i].style.x = this.shapeList[i].style._x;
                    this.shapeList[i].style.y = this.shapeList[i].style._y;
                    this.shapeList[i].style._hasSelected = false;
                    this._selected[seriesIndex][dataIndex] = false;
                    this.zr.modShape(this.shapeList[i].id);
                }
            }

            this.messageCenter.dispatch(
                ecConfig.EVENT.PIE_SELECTED,
                param.event,
                {
                    selected: this._selected,
                    target:  ecData.get(target, 'name')
                },
                this.myChart
            );
            this.zr.refreshNextFrame();
        }
    };

    zrUtil.inherits(Pie, ChartBase);

    // 图表注册
    require('../chart').define('pie', Pie);

    return Pie;
});
</=></object></=></=>