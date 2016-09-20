define('echarts/chart/funnel', [
    'require',
    './base',
    'zrender/shape/Text',
    'zrender/shape/Line',
    'zrender/shape/Polygon',
    '../config',
    '../util/ecData',
    '../util/number',
    'zrender/tool/util',
    'zrender/tool/color',
    'zrender/tool/area',
    '../chart'
], function (require) {
    var ChartBase = require('./base');
    var TextShape = require('zrender/shape/Text');
    var LineShape = require('zrender/shape/Line');
    var PolygonShape = require('zrender/shape/Polygon');
    var ecConfig = require('../config');
    ecConfig.funnel = {
        zlevel: 0,
        z: 2,
        clickable: true,
        legendHoverLink: true,
        x: 80,
        y: 60,
        x2: 80,
        y2: 60,
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 0,
        funnelAlign: 'center',
        itemStyle: {
            normal: {
                borderColor: '#fff',
                borderWidth: 1,
                label: {
                    show: true,
                    position: 'outer'
                },
                labelLine: {
                    show: true,
                    length: 10,
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    }
                }
            },
            emphasis: {
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                label: { show: true },
                labelLine: { show: true }
            }
        }
    };
    var ecData = require('../util/ecData');
    var number = require('../util/number');
    var zrUtil = require('zrender/tool/util');
    var zrColor = require('zrender/tool/color');
    var zrArea = require('zrender/tool/area');
    function Funnel(ecTheme, messageCenter, zr, option, myChart) {
        ChartBase.call(this, ecTheme, messageCenter, zr, option, myChart);
        this.refresh(option);
    }
    Funnel.prototype = {
        type: ecConfig.CHART_TYPE_FUNNEL,
        _buildShape: function () {
            var series = this.series;
            var legend = this.component.legend;
            this._paramsMap = {};
            this._selected = {};
            this.selectedMap = {};
            var serieName;
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === ecConfig.CHART_TYPE_FUNNEL) {
                    series[i] = this.reformOption(series[i]);
                    this.legendHoverLink = series[i].legendHoverLink || this.legendHoverLink;
                    serieName = series[i].name || '';
                    this.selectedMap[serieName] = legend ? legend.isSelected(serieName) : true;
                    if (!this.selectedMap[serieName]) {
                        continue;
                    }
                    this._buildSingleFunnel(i);
                    this.buildMark(i);
                }
            }
            this.addShapeList();
        },
        _buildSingleFunnel: function (seriesIndex) {
            var legend = this.component.legend;
            var serie = this.series[seriesIndex];
            var data = this._mapData(seriesIndex);
            var location = this._getLocation(seriesIndex);
            this._paramsMap[seriesIndex] = {
                location: location,
                data: data
            };
            var itemName;
            var total = 0;
            var selectedData = [];
            for (var i = 0, l = data.length; i < l; i++) {
                itemName = data[i].name;
                this.selectedMap[itemName] = legend ? legend.isSelected(itemName) : true;
                if (this.selectedMap[itemName] && !isNaN(data[i].value)) {
                    selectedData.push(data[i]);
                    total++;
                }
            }
            if (total === 0) {
                return;
            }
            var funnelCase = this._buildFunnelCase(seriesIndex);
            var align = serie.funnelAlign;
            var gap = serie.gap;
            var height = total > 1 ? (location.height - (total - 1) * gap) / total : location.height;
            var width;
            var lastY = location.y;
            var lastWidth = serie.sort === 'descending' ? this._getItemWidth(seriesIndex, selectedData[0].value) : number.parsePercent(serie.minSize, location.width);
            var next = serie.sort === 'descending' ? 1 : 0;
            var centerX = location.centerX;
            var pointList = [];
            var x;
            var polygon;
            var lastPolygon;
            for (var i = 0, l = selectedData.length; i < l; i++) {
                itemName = selectedData[i].name;
                if (this.selectedMap[itemName] && !isNaN(selectedData[i].value)) {
                    width = i <= 2="" 10="" l="" -="" ?="" this._getitemwidth(seriesindex,="" selecteddata[i="" +="" next].value)="" :="" serie.sort="==" 'descending'="" number.parsepercent(serie.minsize,="" location.width)="" number.parsepercent(serie.maxsize,="" location.width);="" switch="" (align)="" {="" case="" 'left':="" x="location.x;" break;="" 'right':="" location.width="" lastwidth;="" default:="" lastwidth="" 2;="" }="" polygon="this._buildItem(seriesIndex," selecteddata[i]._index,="" legend="" legend.getcolor(itemname)="" this.zr.getcolor(selecteddata[i]._index),="" x,="" lasty,="" lastwidth,="" width,="" height,="" align);="" lasty="" gap;="" lastpolygon="polygon.style.pointList;" pointlist.unshift([="" lastpolygon[0][0]="" 10,="" lastpolygon[0][1]="" ]);="" pointlist.push([="" lastpolygon[1][0]="" lastpolygon[1][1]="" if="" (i="==" 0)="" (lastwidth="==" align="=" 'center'="" &&="" (pointlist[0][0]="" 'right'="" pointlist[0][1]="" =="center" 15;="" (l="=" 1)="" else="" pointlist[pointlist.length="" 1][1]="" (funnelcase)="" lastpolygon[3][0]="" lastpolygon[3][1]="" lastpolygon[2][0]="" lastpolygon[2][1]="" funnelcase.style.pointlist="pointList;" },="" _buildfunnelcase:="" function="" (seriesindex)="" var="" serie="this.series[seriesIndex];" (this.deepquery([="" serie,="" this.option="" ],="" 'calculable'))="" location="this._paramsMap[seriesIndex].location;" gap="10;" funnelcase="{" hoverable:="" false,="" style:="" pointlistd:="" [="" location.x="" gap,="" location.y="" location.height="" ]="" brushtype:="" 'stroke',="" linewidth:="" 1,="" strokecolor:="" serie.calculableholdercolor="" ||="" this.ectheme.calculableholdercolor="" ecconfig.calculableholdercolor="" };="" ecdata.pack(funnelcase,="" seriesindex,="" undefined,="" -1);="" this.setcalculable(funnelcase);="" polygonshape(funnelcase);="" this.shapelist.push(funnelcase);="" return="" funnelcase;="" _getlocation:="" gridoption="this.series[seriesIndex];" zrwidth="this.zr.getWidth();" zrheight="this.zr.getHeight();" zrwidth);="" y="this.parsePercent(gridOption.y," zrheight);="" width="gridOption.width" this.parsepercent(gridoption.x2,="" zrwidth)="" this.parsepercent(gridoption.width,="" x:="" y:="" y,="" width:="" height:="" gridoption.height="=" null="" this.parsepercent(gridoption.y2,="" zrheight)="" this.parsepercent(gridoption.height,="" zrheight),="" centerx:="" _mapdata:="" funneldata="zrUtil.clone(serie.data);" for="" (var="" i="0," <="" l;="" i++)="" funneldata[i]._index="i;" numdescending(a,="" b)="" (a.value="==" '-')="" 1;="" (b.value="==" -1;="" b.value="" a.value;="" numascending(a,="" -numdescending(a,="" b);="" (serie.sort="" !="none" )="" funneldata.sort(serie.sort="==" numdescending="" numascending);="" funneldata;="" _builditem:="" (seriesindex,="" dataindex,="" defaultcolor,="" topwidth,="" bottomwidth,="" align)="" series="this.series;" data="serie.data[dataIndex];" ecdata.pack(polygon,="" series[seriesindex],="" series[seriesindex].data[dataindex],="" series[seriesindex].data[dataindex].name);="" this.shapelist.push(polygon);="" label="this.getLabel(seriesIndex," ecdata.pack(label,="" this.shapelist.push(label);="" (!this._needlabel(serie,="" data,="" false))="" label.invisible="true;" labelline="this.getLabelLine(seriesIndex," this.shapelist.push(labelline);="" (!this._needlabelline(serie,="" labelline.invisible="true;" polygonhoverconnect="[];" labelhoverconnect="[];" (this._needlabelline(serie,="" true))="" polygonhoverconnect.push(labelline.id);="" labelhoverconnect.push(labelline.id);="" (this._needlabel(serie,="" polygonhoverconnect.push(label.id);="" labelhoverconnect.push(polygon.id);="" polygon.hoverconnect="polygonHoverConnect;" label.hoverconnect="labelHoverConnect;" polygon;="" _getitemwidth:="" value)="" min="serie.min;" max="serie.max;" minsize="number.parsePercent(serie.minSize," maxsize="number.parsePercent(serie.maxSize," (value="" min)="" *="" (maxsize="" minsize)="" (max="" minsize;="" getpolygon:="" xlt,="" querytarget="[" ];="" normal="this.deepMerge(queryTarget," 'itemstyle.normal')="" {};="" emphasis="this.deepMerge(queryTarget," 'itemstyle.emphasis')="" normalcolor="this.getItemStyleColor(normal.color," data)="" defaultcolor;="" emphasiscolor="this.getItemStyleColor(emphasis.color," (typeof="" 'string'="" zrcolor.lift(normalcolor,="" -0.2)="" normalcolor);="" xlb;="" xlb="xLT;" (topwidth="" bottomwidth);="" bottomwidth)="" zlevel:="" serie.zlevel,="" z:="" serie.z,="" clickable:="" this.deepquery(querytarget,="" 'clickable'),="" pointlist:="" xlt="" height="" xlb,="" 'both',="" color:="" normalcolor,="" normal.borderwidth,="" normal.bordercolor="" highlightstyle:="" emphasiscolor,="" emphasis.borderwidth,="" emphasis.bordercolor="" this.setcalculable(polygon);="" polygon.draggable="true;" new="" polygonshape(polygon);="" getlabel:="" itemstyle="zrUtil.merge(zrUtil.clone(data.itemStyle)" {},="" serie.itemstyle);="" status="normal" ;="" labelcontrol="itemStyle[status].label;" textstyle="labelControl.textStyle" linelength="itemStyle[status].labelLine.length;" text="this.getLabelText(seriesIndex," status);="" textfont="this.getFont(textStyle);" textalign;="" textcolor="defaultColor;" labelcontrol.position="labelControl.position" itemstyle.normal.label.position;="" (labelcontrol.position="==" 'inner'="" 'inside'="" 'center')="" textalign="align;"> zrArea.getTextWidth(text, textFont) ? '#fff' : zrColor.reverse(defaultColor);
            } else if (labelControl.position === 'left') {
                textAlign = 'right';
            } else {
                textAlign = 'left';
            }
            var textShape = {
                zlevel: serie.zlevel,
                z: serie.z + 1,
                style: {
                    x: this._getLabelPoint(labelControl.position, x, location, topWidth, bottomWidth, lineLength, align),
                    y: y + height / 2,
                    color: textStyle.color || textColor,
                    text: text,
                    textAlign: textStyle.align || textAlign,
                    textBaseline: textStyle.baseline || 'middle',
                    textFont: textFont
                }
            };
            status = 'emphasis';
            labelControl = itemStyle[status].label || labelControl;
            textStyle = labelControl.textStyle || textStyle;
            lineLength = itemStyle[status].labelLine.length || lineLength;
            labelControl.position = labelControl.position || itemStyle.normal.label.position;
            text = this.getLabelText(seriesIndex, dataIndex, status);
            textFont = this.getFont(textStyle);
            textColor = defaultColor;
            if (labelControl.position === 'inner' || labelControl.position === 'inside' || labelControl.position === 'center') {
                textAlign = align;
                textColor = Math.max(topWidth, bottomWidth) / 2 > zrArea.getTextWidth(text, textFont) ? '#fff' : zrColor.reverse(defaultColor);
            } else if (labelControl.position === 'left') {
                textAlign = 'right';
            } else {
                textAlign = 'left';
            }
            textShape.highlightStyle = {
                x: this._getLabelPoint(labelControl.position, x, location, topWidth, bottomWidth, lineLength, align),
                color: textStyle.color || textColor,
                text: text,
                textAlign: textStyle.align || textAlign,
                textFont: textFont,
                brushType: 'fill'
            };
            return new TextShape(textShape);
        },
        getLabelText: function (seriesIndex, dataIndex, status) {
            var series = this.series;
            var serie = series[seriesIndex];
            var data = serie.data[dataIndex];
            var formatter = this.deepQuery([
                data,
                serie
            ], 'itemStyle.' + status + '.label.formatter');
            if (formatter) {
                if (typeof formatter === 'function') {
                    return formatter.call(this.myChart, {
                        seriesIndex: seriesIndex,
                        seriesName: serie.name || '',
                        series: serie,
                        dataIndex: dataIndex,
                        data: data,
                        name: data.name,
                        value: data.value
                    });
                } else if (typeof formatter === 'string') {
                    formatter = formatter.replace('{a}', '{a0}').replace('{b}', '{b0}').replace('{c}', '{c0}').replace('{a0}', serie.name).replace('{b0}', data.name).replace('{c0}', data.value);
                    return formatter;
                }
            } else {
                return data.name;
            }
        },
        getLabelLine: function (seriesIndex, dataIndex, defaultColor, x, y, topWidth, bottomWidth, height, align) {
            var serie = this.series[seriesIndex];
            var data = serie.data[dataIndex];
            var location = this._paramsMap[seriesIndex].location;
            var itemStyle = zrUtil.merge(zrUtil.clone(data.itemStyle) || {}, serie.itemStyle);
            var status = 'normal';
            var labelLineControl = itemStyle[status].labelLine;
            var lineLength = itemStyle[status].labelLine.length;
            var lineStyle = labelLineControl.lineStyle || {};
            var labelControl = itemStyle[status].label;
            labelControl.position = labelControl.position || itemStyle.normal.label.position;
            var lineShape = {
                zlevel: serie.zlevel,
                z: serie.z + 1,
                hoverable: false,
                style: {
                    xStart: this._getLabelLineStartPoint(x, location, topWidth, bottomWidth, align),
                    yStart: y + height / 2,
                    xEnd: this._getLabelPoint(labelControl.position, x, location, topWidth, bottomWidth, lineLength, align),
                    yEnd: y + height / 2,
                    strokeColor: lineStyle.color || defaultColor,
                    lineType: lineStyle.type,
                    lineWidth: lineStyle.width
                }
            };
            status = 'emphasis';
            labelLineControl = itemStyle[status].labelLine || labelLineControl;
            lineLength = itemStyle[status].labelLine.length || lineLength;
            lineStyle = labelLineControl.lineStyle || lineStyle;
            labelControl = itemStyle[status].label || labelControl;
            labelControl.position = labelControl.position;
            lineShape.highlightStyle = {
                xEnd: this._getLabelPoint(labelControl.position, x, location, topWidth, bottomWidth, lineLength, align),
                strokeColor: lineStyle.color || defaultColor,
                lineType: lineStyle.type,
                lineWidth: lineStyle.width
            };
            return new LineShape(lineShape);
        },
        _getLabelPoint: function (position, x, location, topWidth, bottomWidth, lineLength, align) {
            position = position === 'inner' || position === 'inside' ? 'center' : position;
            switch (position) {
            case 'center':
                return align == 'center' ? x + topWidth / 2 : align == 'left' ? x + 10 : x + topWidth - 10;
            case 'left':
                if (lineLength === 'auto') {
                    return location.x - 10;
                } else {
                    return align == 'center' ? location.centerX - Math.max(topWidth, bottomWidth) / 2 - lineLength : align == 'right' ? x - (topWidth < bottomWidth ? bottomWidth - topWidth : 0) - lineLength : location.x - lineLength;
                }
                break;
            default:
                if (lineLength === 'auto') {
                    return location.x + location.width + 10;
                } else {
                    return align == 'center' ? location.centerX + Math.max(topWidth, bottomWidth) / 2 + lineLength : align == 'right' ? location.x + location.width + lineLength : x + Math.max(topWidth, bottomWidth) + lineLength;
                }
            }
        },
        _getLabelLineStartPoint: function (x, location, topWidth, bottomWidth, align) {
            return align == 'center' ? location.centerX : topWidth < bottomWidth ? x + Math.min(topWidth, bottomWidth) / 2 : x + Math.max(topWidth, bottomWidth) / 2;
        },
        _needLabel: function (serie, data, isEmphasis) {
            return this.deepQuery([
                data,
                serie
            ], 'itemStyle.' + (isEmphasis ? 'emphasis' : 'normal') + '.label.show');
        },
        _needLabelLine: function (serie, data, isEmphasis) {
            return this.deepQuery([
                data,
                serie
            ], 'itemStyle.' + (isEmphasis ? 'emphasis' : 'normal') + '.labelLine.show');
        },
        refresh: function (newOption) {
            if (newOption) {
                this.option = newOption;
                this.series = newOption.series;
            }
            this.backupShapeList();
            this._buildShape();
        }
    };
    zrUtil.inherits(Funnel, ChartBase);
    require('../chart').define('funnel', Funnel);
    return Funnel;
});</=>