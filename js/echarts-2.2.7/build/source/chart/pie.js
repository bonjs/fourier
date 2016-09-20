define('echarts/chart/pie', [
    'require',
    './base',
    'zrender/shape/Text',
    'zrender/shape/Ring',
    'zrender/shape/Circle',
    'zrender/shape/Sector',
    'zrender/shape/Polyline',
    '../config',
    '../util/ecData',
    'zrender/tool/util',
    'zrender/tool/math',
    'zrender/tool/color',
    '../chart'
], function (require) {
    var ChartBase = require('./base');
    var TextShape = require('zrender/shape/Text');
    var RingShape = require('zrender/shape/Ring');
    var CircleShape = require('zrender/shape/Circle');
    var SectorShape = require('zrender/shape/Sector');
    var PolylineShape = require('zrender/shape/Polyline');
    var ecConfig = require('../config');
    ecConfig.pie = {
        zlevel: 0,
        z: 2,
        clickable: true,
        legendHoverLink: true,
        center: [
            '50%',
            '50%'
        ],
        radius: [
            0,
            '75%'
        ],
        clockWise: true,
        startAngle: 90,
        minAngle: 0,
        selectedOffset: 10,
        itemStyle: {
            normal: {
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                label: {
                    show: true,
                    position: 'outer'
                },
                labelLine: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    }
                }
            },
            emphasis: {
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                label: { show: false },
                labelLine: {
                    show: false,
                    length: 20,
                    lineStyle: {
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
    function Pie(ecTheme, messageCenter, zr, option, myChart) {
        ChartBase.call(this, ecTheme, messageCenter, zr, option, myChart);
        var self = this;
        self.shapeHandler.onmouseover = function (param) {
            var shape = param.target;
            var seriesIndex = ecData.get(shape, 'seriesIndex');
            var dataIndex = ecData.get(shape, 'dataIndex');
            var percent = ecData.get(shape, 'special');
            var center = [
                shape.style.x,
                shape.style.y
            ];
            var startAngle = shape.style.startAngle;
            var endAngle = shape.style.endAngle;
            var midAngle = ((endAngle + startAngle) / 2 + 360) % 360;
            var defaultColor = shape.highlightStyle.color;
            var label = self.getLabel(seriesIndex, dataIndex, percent, center, midAngle, defaultColor, true);
            if (label) {
                self.zr.addHoverShape(label);
            }
            var labelLine = self.getLabelLine(seriesIndex, dataIndex, center, shape.style.r0, shape.style.r, midAngle, defaultColor, true);
            if (labelLine) {
                self.zr.addHoverShape(labelLine);
            }
        };
        this.refresh(option);
    }
    Pie.prototype = {
        type: ecConfig.CHART_TYPE_PIE,
        _buildShape: function () {
            var series = this.series;
            var legend = this.component.legend;
            this.selectedMap = {};
            this._selected = {};
            var center;
            var radius;
            var pieCase;
            this._selectedMode = false;
            var serieName;
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === ecConfig.CHART_TYPE_PIE) {
                    series[i] = this.reformOption(series[i]);
                    this.legendHoverLink = series[i].legendHoverLink || this.legendHoverLink;
                    serieName = series[i].name || '';
                    this.selectedMap[serieName] = legend ? legend.isSelected(serieName) : true;
                    if (!this.selectedMap[serieName]) {
                        continue;
                    }
                    center = this.parseCenter(this.zr, series[i].center);
                    radius = this.parseRadius(this.zr, series[i].radius);
                    this._selectedMode = this._selectedMode || series[i].selectedMode;
                    this._selected[i] = [];
                    if (this.deepQuery([
                            series[i],
                            this.option
                        ], 'calculable')) {
                        pieCase = {
                            zlevel: series[i].zlevel,
                            z: series[i].z,
                            hoverable: false,
                            style: {
                                x: center[0],
                                y: center[1],
                                r0: radius[0] <= 0="" 2="" 10="" 360="" ?="" :="" radius[0]="" -="" 10,="" r:="" radius[1]="" +="" brushtype:="" 'stroke',="" linewidth:="" 1,="" strokecolor:="" series[i].calculableholdercolor="" ||="" this.ectheme.calculableholdercolor="" ecconfig.calculableholdercolor="" }="" };="" ecdata.pack(piecase,="" series[i],="" i,="" undefined,="" -1);="" this.setcalculable(piecase);="" piecase="radius[0]" <="10" new="" circleshape(piecase)="" ringshape(piecase);="" this.shapelist.push(piecase);="" this._buildsinglepie(i);="" this.buildmark(i);="" this.addshapelist();="" },="" _buildsinglepie:="" function="" (seriesindex)="" {="" var="" series="this.series;" serie="series[seriesIndex];" data="serie.data;" legend="this.component.legend;" itemname;="" totalselected="0;" totalselectedvalue0="0;" totalvalue="0;" maxvalue="Number.NEGATIVE_INFINITY;" singleshapelist="[];" for="" (var="" i="0," l="data.length;" l;="" i++)="" itemname="data[i].name;" this.selectedmap[itemname]="legend" legend.isselected(itemname)="" true;="" if="" (this.selectedmap[itemname]="" &&="" !isnan(data[i].value))="" (+data[i].value="" !="=" 0)="" totalselected++;="" else="" totalselectedvalue0++;="" +data[i].value);="" (totalvalue="==" return;="" percent="100;" clockwise="serie.clockWise;" startangle="(serie.startAngle.toFixed(2)" 360)="" %="" 360;="" endangle;="" minangle="serie.minAngle" 0.01;="" totalangle="360" *="" 0.01="" totalselectedvalue0;="" defaultcolor;="" rosetype="serie.roseType;" center;="" radius;="" r0;="" r1;="" (!this.selectedmap[itemname]="" isnan(data[i].value))="" continue;="" defaultcolor="legend" legend.getcolor(itemname)="" this.zr.getcolor(i);="" totalvalue;="" (rosetype="" )="" endangle="clockWise" (percent="" 0.01)="" 0.01);="" startangle;="" 0;="" 100).tofixed(2);="" center="this.parseCenter(this.zr," serie.center);="" radius="this.parseRadius(this.zr," serie.radius);="" r0="+radius[0];" r1="+radius[1];" 'radius')="" (r1="" r0)="" 0.8="" 0.2="" 'area')="" maxvalue)="" (clockwise)="" temp;="" temp="startAngle;" this._builditem(singleshapelist,="" seriesindex,="" percent,="" data[i].selected,="" center,="" r0,="" r1,="" startangle,="" endangle,="" defaultcolor);="" (!clockwise)="" this._autolabellayout(singleshapelist,="" r1);="" this.shapelist.push(singleshapelist[i]);="" _builditem:="" (singleshapelist,="" dataindex,="" isselected,="" defaultcolor)="" midangle="((endAngle" startangle)="" sector="this.getSector(seriesIndex," ecdata.pack(sector,="" series[seriesindex],="" series[seriesindex].data[dataindex],="" series[seriesindex].data[dataindex].name,="" percent);="" singleshapelist.push(sector);="" label="this.getLabel(seriesIndex," midangle,="" defaultcolor,="" false);="" labelline="this.getLabelLine(seriesIndex," (labelline)="" ecdata.pack(labelline,="" singleshapelist.push(labelline);="" (label)="" ecdata.pack(label,="" label._labelline="labelLine;" singleshapelist.push(label);="" getsector:="" (seriesindex,="" querytarget="[" data,="" ];="" normal="this.deepMerge(queryTarget," 'itemstyle.normal')="" {};="" emphasis="this.deepMerge(queryTarget," 'itemstyle.emphasis')="" normalcolor="this.getItemStyleColor(normal.color," data)="" emphasiscolor="this.getItemStyleColor(emphasis.color," (typeof="" 'string'="" zrcolor.lift(normalcolor,="" -0.2)="" normalcolor);="" zlevel:="" serie.zlevel,="" z:="" serie.z,="" clickable:="" this.deepquery(querytarget,="" 'clickable'),="" style:="" x:="" center[0],="" y:="" center[1],="" r0:="" startangle:="" endangle:="" 'both',="" color:="" normalcolor,="" normal.borderwidth,="" normal.bordercolor,="" linejoin:="" 'round'="" highlightstyle:="" emphasiscolor,="" emphasis.borderwidth,="" emphasis.bordercolor,="" _seriesindex:="" _dataindex:="" dataindex="" (isselected)="" sector.style.endangle)="" 2).tofixed(2)="" sector.style._hasselected="true;" sector.style._x="sector.style.x;" sector.style._y="sector.style.y;" offset="this.query(serie," 'selectedoffset');="" sector.style.x="" true)="" offset;="" sector.style.y="" this._selected[seriesindex][dataindex]="true;" (this._selectedmode)="" sector.onclick="this.shapeHandler.onclick;" (this.deepquery([="" serie,="" this.option="" ],="" 'calculable'))="" this.setcalculable(sector);="" sector.draggable="true;" (this._needlabel(serie,="" this._needlabelline(serie,="" true))="" sector.onmouseover="this.shapeHandler.onmouseover;" sectorshape(sector);="" return="" sector;="" getlabel:="" isemphasis)="" (!this._needlabel(serie,="" isemphasis))="" status="isEmphasis" 'emphasis'="" 'normal';="" itemstyle="zrUtil.merge(zrUtil.clone(data.itemStyle)" {},="" serie.itemstyle);="" labelcontrol="itemStyle[status].label;" textstyle="labelControl.textStyle" centerx="center[0];" centery="center[1];" x;="" y;="" textalign;="" textbaseline="middle" ;="" labelcontrol.position="labelControl.position" itemstyle.normal.label.position;="" (labelcontrol.position="==" 'center')="" x="centerX;" y="centerY;" textalign="center" 'inner'="" 'inside')="" radius[1])="" (labelcontrol.distance="" 0.5);="" zrmath.cos(midangle,="" true));="" zrmath.sin(midangle,="" -itemstyle[status].labelline.length;="">= 90 && midAngle <= 5="" 20="" 270="" ?="" 'right'="" :="" 'left';="" }="" if="" (labelcontrol.position="" !="center" &&="" labelcontrol.position="" )="" {="" x="" +="textAlign" =="=" 'left'="" -20;="" data.__labelx="x" -="" (textalign="==" -5);="" data.__labely="y;" var="" ts="new" textshape({="" zlevel:="" serie.zlevel,="" z:="" serie.z="" 1,="" hoverable:="" false,="" style:="" x:="" x,="" y:="" y,="" color:="" textstyle.color="" ||="" defaultcolor,="" text:="" this.getlabeltext(seriesindex,="" dataindex,="" percent,="" status),="" textalign:="" textstyle.align="" textalign,="" textbaseline:="" textstyle.baseline="" textbaseline,="" textfont:="" this.getfont(textstyle)="" },="" highlightstyle:="" brushtype:="" 'fill'="" });="" ts._radius="radius;" ts._labelposition="labelControl.position" 'outer';="" ts._rect="ts.getRect(ts.style);" ts._seriesindex="seriesIndex;" ts._dataindex="dataIndex;" return="" ts;="" getlabeltext:="" function="" (seriesindex,="" status)="" series="this.series;" serie="series[seriesIndex];" data="serie.data[dataIndex];" formatter="this.deepQuery([" data,="" ],="" 'itemstyle.'="" status="" '.label.formatter');="" (formatter)="" (typeof="" 'function')="" formatter.call(this.mychart,="" seriesindex:="" seriesindex,="" seriesname:="" serie.name="" '',="" series:="" serie,="" dataindex:="" data:="" name:="" data.name,="" value:="" data.value,="" percent:="" percent="" else="" 'string')="" '{a0}').replace('{b}',="" '{b0}').replace('{c}',="" '{c0}').replace('{d}',="" '{d0}');="" serie.name).replace('{b0}',="" data.name).replace('{c0}',="" data.value).replace('{d0}',="" percent);="" formatter;="" data.name;="" getlabelline:="" center,="" r0,="" r1,="" midangle,="" isemphasis)="" (this._needlabelline(serie,="" isemphasis))="" 'emphasis'="" 'normal';="" itemstyle="zrUtil.merge(zrUtil.clone(data.itemStyle)" {},="" serie.itemstyle);="" labellinecontrol="itemStyle[status].labelLine;" linestyle="labelLineControl.lineStyle" {};="" centerx="center[0];" centery="center[1];" minradius="r1;" maxradius="this.parseRadius(this.zr," serie.radius)[1]="" -labellinecontrol.length;="" cosvalue="zrMath.cos(midAngle," true);="" sinvalue="zrMath.sin(midAngle," new="" polylineshape({="" pointlist:="" [="" *="" cosvalue,="" data.__labelx,="" ]="" strokecolor:="" linestyle.color="" linetype:="" linestyle.type,="" linewidth:="" linestyle.width="" _seriesindex:="" _dataindex:="" dataindex="" return;="" _needlabel:="" (serie,="" this.deepquery([="" (isemphasis="" 'normal')="" '.label.show');="" _needlabelline:="" '.labelline.show');="" _autolabellayout:="" (slist,="" r)="" leftlist="[];" rightlist="[];" for="" (var="" i="0," l="sList.length;" <="" l;="" i++)="" (slist[i]._labelposition="==" 'outer'="" slist[i]._labelposition="==" 'outside')="" slist[i]._rect._y="sList[i]._rect.y;" (slist[i]._rect.x="" center[0])="" leftlist.push(slist[i]);="" rightlist.push(slist[i]);="" this._layoutcalculate(leftlist,="" r,="" -1);="" this._layoutcalculate(rightlist,="" 1);="" _layoutcalculate:="" (tlist,="" direction)="" tlist.sort(function="" (a,="" b)="" a._rect.y="" b._rect.y;="" _changedown(start,="" end,="" delta,="" j="start;" end;="" j++)="" tlist[j]._rect.y="" tlist[j].style.y="" (tlist[j]._labelline)="" tlist[j]._labelline.style.pointlist[1][1]="" tlist[j]._labelline.style.pointlist[2][1]="" (j=""> start && j + 1 < end && tList[j + 1]._rect.y > tList[j]._rect.y + tList[j]._rect.height) {
                        _changeUp(j, delta / 2);
                        return;
                    }
                }
                _changeUp(end - 1, delta / 2);
            }
            function _changeUp(end, delta) {
                for (var j = end; j >= 0; j--) {
                    tList[j]._rect.y -= delta;
                    tList[j].style.y -= delta;
                    if (tList[j]._labelLine) {
                        tList[j]._labelLine.style.pointList[1][1] -= delta;
                        tList[j]._labelLine.style.pointList[2][1] -= delta;
                    }
                    if (j > 0 && tList[j]._rect.y > tList[j - 1]._rect.y + tList[j - 1]._rect.height) {
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
                var lastDeltaX = direction > 0 ? isDownList ? Number.MAX_VALUE : 0 : isDownList ? Number.MAX_VALUE : 0;
                for (var i = 0, l = sList.length; i < l; i++) {
                    deltaY = Math.abs(sList[i]._rect.y - y);
                    length = sList[i]._radius - r;
                    deltaX = deltaY < r + length ? Math.sqrt((r + length + 20) * (r + length + 20) - Math.pow(sList[i]._rect.y - y, 2)) : Math.abs(sList[i]._rect.x + (direction > 0 ? 0 : sList[i]._rect.width) - x);
                    if (isDownList && deltaX >= lastDeltaX) {
                        deltaX = lastDeltaX - 10;
                    }
                    if (!isDownList && deltaX <= lastdeltax)="" {="" deltax="lastDeltaX" +="" 10;="" }="" slist[i]._rect.x="sList[i].style.x" =="" x="" *="" direction;="" if="" (slist[i]._labelline)="" slist[i]._labelline.style.pointlist[2][0]="x" (deltax="" -="" 5)="" slist[i]._labelline.style.pointlist[1][0]="x" 20)="" lastdeltax="deltaX;" var="" lasty="0;" delta;="" len="tList.length;" uplist="[];" downlist="[];" for="" (var="" i="0;" <="" len;="" i++)="" delta="tList[i]._rect.y" lasty;="" (delta="" 0)="" _changedown(i,="" len,="" -delta,="" direction);="" tlist[i]._rect.height;="" (this.zr.getheight()="" _changeup(len="" 1,="" this.zr.getheight());="" (tlist[i]._rect.y="">= center[1]) {
                    downList.push(tList[i]);
                } else {
                    upList.push(tList[i]);
                }
            }
            _changeX(downList, true, center, r, direction);
            _changeX(upList, false, center, r, direction);
        },
        reformOption: function (opt) {
            var _merge = zrUtil.merge;
            opt = _merge(_merge(opt || {}, zrUtil.clone(this.ecTheme.pie || {})), zrUtil.clone(ecConfig.pie));
            opt.itemStyle.normal.label.textStyle = this.getTextStyle(opt.itemStyle.normal.label.textStyle);
            opt.itemStyle.emphasis.label.textStyle = this.getTextStyle(opt.itemStyle.emphasis.label.textStyle);
            this.z = opt.z;
            this.zlevel = opt.zlevel;
            return opt;
        },
        refresh: function (newOption) {
            if (newOption) {
                this.option = newOption;
                this.series = newOption.series;
            }
            this.backupShapeList();
            this._buildShape();
        },
        addDataAnimation: function (params, done) {
            var series = this.series;
            var aniMap = {};
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
            var sectorMap = {};
            var textMap = {};
            var lineMap = {};
            var backupShapeList = this.shapeList;
            this.shapeList = [];
            var seriesIndex;
            var isHead;
            var dataGrow;
            var deltaIdxMap = {};
            for (var i = 0, l = params.length; i < l; i++) {
                seriesIndex = params[i][0];
                isHead = params[i][2];
                dataGrow = params[i][3];
                if (series[seriesIndex] && series[seriesIndex].type === ecConfig.CHART_TYPE_PIE) {
                    if (isHead) {
                        if (!dataGrow) {
                            sectorMap[seriesIndex + '_' + series[seriesIndex].data.length] = 'delete';
                        }
                        deltaIdxMap[seriesIndex] = 1;
                    } else {
                        if (!dataGrow) {
                            sectorMap[seriesIndex + '_-1'] = 'delete';
                            deltaIdxMap[seriesIndex] = -1;
                        } else {
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
                switch (this.shapeList[i].type) {
                case 'sector':
                    sectorMap[key] = this.shapeList[i];
                    break;
                case 'text':
                    textMap[key] = this.shapeList[i];
                    break;
                case 'polyline':
                    lineMap[key] = this.shapeList[i];
                    break;
                }
            }
            this.shapeList = [];
            var targeSector;
            for (var i = 0, l = backupShapeList.length; i < l; i++) {
                seriesIndex = backupShapeList[i]._seriesIndex;
                if (aniMap[seriesIndex]) {
                    dataIndex = backupShapeList[i]._dataIndex + deltaIdxMap[seriesIndex];
                    key = seriesIndex + '_' + dataIndex;
                    targeSector = sectorMap[key];
                    if (!targeSector) {
                        continue;
                    }
                    if (backupShapeList[i].type === 'sector') {
                        if (targeSector != 'delete') {
                            aniCount++;
                            this.zr.animate(backupShapeList[i].id, 'style').when(400, {
                                startAngle: targeSector.style.startAngle,
                                endAngle: targeSector.style.endAngle
                            }).done(animationDone).start();
                        } else {
                            aniCount++;
                            this.zr.animate(backupShapeList[i].id, 'style').when(400, deltaIdxMap[seriesIndex] < 0 ? { startAngle: backupShapeList[i].style.startAngle } : { endAngle: backupShapeList[i].style.endAngle }).done(animationDone).start();
                        }
                    } else if (backupShapeList[i].type === 'text' || backupShapeList[i].type === 'polyline') {
                        if (targeSector === 'delete') {
                            this.zr.delShape(backupShapeList[i].id);
                        } else {
                            switch (backupShapeList[i].type) {
                            case 'text':
                                aniCount++;
                                targeSector = textMap[key];
                                this.zr.animate(backupShapeList[i].id, 'style').when(400, {
                                    x: targeSector.style.x,
                                    y: targeSector.style.y
                                }).done(animationDone).start();
                                break;
                            case 'polyline':
                                aniCount++;
                                targeSector = lineMap[key];
                                this.zr.animate(backupShapeList[i].id, 'style').when(400, { pointList: targeSector.style.pointList }).done(animationDone).start();
                                break;
                            }
                        }
                    }
                }
            }
            this.shapeList = backupShapeList;
            if (!aniCount) {
                done && done();
            }
        },
        onclick: function (param) {
            var series = this.series;
            if (!this.isClick || !param.target) {
                return;
            }
            this.isClick = false;
            var offset;
            var target = param.target;
            var style = target.style;
            var seriesIndex = ecData.get(target, 'seriesIndex');
            var dataIndex = ecData.get(target, 'dataIndex');
            for (var i = 0, len = this.shapeList.length; i < len; i++) {
                if (this.shapeList[i].id === target.id) {
                    seriesIndex = ecData.get(target, 'seriesIndex');
                    dataIndex = ecData.get(target, 'dataIndex');
                    if (!style._hasSelected) {
                        var midAngle = ((style.startAngle + style.endAngle) / 2).toFixed(2) - 0;
                        target.style._hasSelected = true;
                        this._selected[seriesIndex][dataIndex] = true;
                        target.style._x = target.style.x;
                        target.style._y = target.style.y;
                        offset = this.query(series[seriesIndex], 'selectedOffset');
                        target.style.x += zrMath.cos(midAngle, true) * offset;
                        target.style.y -= zrMath.sin(midAngle, true) * offset;
                    } else {
                        target.style.x = target.style._x;
                        target.style.y = target.style._y;
                        target.style._hasSelected = false;
                        this._selected[seriesIndex][dataIndex] = false;
                    }
                    this.zr.modShape(target.id);
                } else if (this.shapeList[i].style._hasSelected && this._selectedMode === 'single') {
                    seriesIndex = ecData.get(this.shapeList[i], 'seriesIndex');
                    dataIndex = ecData.get(this.shapeList[i], 'dataIndex');
                    this.shapeList[i].style.x = this.shapeList[i].style._x;
                    this.shapeList[i].style.y = this.shapeList[i].style._y;
                    this.shapeList[i].style._hasSelected = false;
                    this._selected[seriesIndex][dataIndex] = false;
                    this.zr.modShape(this.shapeList[i].id);
                }
            }
            this.messageCenter.dispatch(ecConfig.EVENT.PIE_SELECTED, param.event, {
                selected: this._selected,
                target: ecData.get(target, 'name')
            }, this.myChart);
            this.zr.refreshNextFrame();
        }
    };
    zrUtil.inherits(Pie, ChartBase);
    require('../chart').define('pie', Pie);
    return Pie;
});</=></=></=>