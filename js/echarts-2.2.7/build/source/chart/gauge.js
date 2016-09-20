define('echarts/chart/gauge', [
    'require',
    './base',
    '../util/shape/GaugePointer',
    'zrender/shape/Text',
    'zrender/shape/Line',
    'zrender/shape/Rectangle',
    'zrender/shape/Circle',
    'zrender/shape/Sector',
    '../config',
    '../util/ecData',
    '../util/accMath',
    'zrender/tool/util',
    '../chart'
], function (require) {
    var ChartBase = require('./base');
    var GaugePointerShape = require('../util/shape/GaugePointer');
    var TextShape = require('zrender/shape/Text');
    var LineShape = require('zrender/shape/Line');
    var RectangleShape = require('zrender/shape/Rectangle');
    var CircleShape = require('zrender/shape/Circle');
    var SectorShape = require('zrender/shape/Sector');
    var ecConfig = require('../config');
    ecConfig.gauge = {
        zlevel: 0,
        z: 2,
        center: [
            '50%',
            '50%'
        ],
        clickable: true,
        legendHoverLink: true,
        radius: '75%',
        startAngle: 225,
        endAngle: -45,
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
            show: true,
            lineStyle: {
                color: [
                    [
                        0.2,
                        '#228b22'
                    ],
                    [
                        0.8,
                        '#48b'
                    ],
                    [
                        1,
                        '#ff4500'
                    ]
                ],
                width: 30
            }
        },
        axisTick: {
            show: true,
            splitNumber: 5,
            length: 8,
            lineStyle: {
                color: '#eee',
                width: 1,
                type: 'solid'
            }
        },
        axisLabel: {
            show: true,
            textStyle: { color: 'auto' }
        },
        splitLine: {
            show: true,
            length: 30,
            lineStyle: {
                color: '#eee',
                width: 2,
                type: 'solid'
            }
        },
        pointer: {
            show: true,
            length: '80%',
            width: 8,
            color: 'auto'
        },
        title: {
            show: true,
            offsetCenter: [
                0,
                '-40%'
            ],
            textStyle: {
                color: '#333',
                fontSize: 15
            }
        },
        detail: {
            show: true,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc',
            width: 100,
            height: 40,
            offsetCenter: [
                0,
                '40%'
            ],
            textStyle: {
                color: 'auto',
                fontSize: 30
            }
        }
    };
    var ecData = require('../util/ecData');
    var accMath = require('../util/accMath');
    var zrUtil = require('zrender/tool/util');
    function Gauge(ecTheme, messageCenter, zr, option, myChart) {
        ChartBase.call(this, ecTheme, messageCenter, zr, option, myChart);
        this.refresh(option);
    }
    Gauge.prototype = {
        type: ecConfig.CHART_TYPE_GAUGE,
        _buildShape: function () {
            var series = this.series;
            this._paramsMap = {};
            this.selectedMap = {};
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === ecConfig.CHART_TYPE_GAUGE) {
                    this.selectedMap[series[i].name] = true;
                    series[i] = this.reformOption(series[i]);
                    this.legendHoverLink = series[i].legendHoverLink || this.legendHoverLink;
                    this._buildSingleGauge(i);
                    this.buildMark(i);
                }
            }
            this.addShapeList();
        },
        _buildSingleGauge: function (seriesIndex) {
            var serie = this.series[seriesIndex];
            this._paramsMap[seriesIndex] = {
                center: this.parseCenter(this.zr, serie.center),
                radius: this.parseRadius(this.zr, serie.radius),
                startAngle: serie.startAngle.toFixed(2) - 0,
                endAngle: serie.endAngle.toFixed(2) - 0
            };
            this._paramsMap[seriesIndex].totalAngle = this._paramsMap[seriesIndex].startAngle - this._paramsMap[seriesIndex].endAngle;
            this._colorMap(seriesIndex);
            this._buildAxisLine(seriesIndex);
            this._buildSplitLine(seriesIndex);
            this._buildAxisTick(seriesIndex);
            this._buildAxisLabel(seriesIndex);
            this._buildPointer(seriesIndex);
            this._buildTitle(seriesIndex);
            this._buildDetail(seriesIndex);
        },
        _buildAxisLine: function (seriesIndex) {
            var serie = this.series[seriesIndex];
            if (!serie.axisLine.show) {
                return;
            }
            var min = serie.min;
            var total = serie.max - min;
            var params = this._paramsMap[seriesIndex];
            var center = params.center;
            var startAngle = params.startAngle;
            var totalAngle = params.totalAngle;
            var colorArray = params.colorArray;
            var lineStyle = serie.axisLine.lineStyle;
            var lineWidth = this.parsePercent(lineStyle.width, params.radius[1]);
            var r = params.radius[1];
            var r0 = r - lineWidth;
            var sectorShape;
            var lastAngle = startAngle;
            var newAngle;
            for (var i = 0, l = colorArray.length; i < l; i++) {
                newAngle = startAngle - totalAngle * (colorArray[i][0] - min) / total;
                sectorShape = this._getSector(center, r0, r, newAngle, lastAngle, colorArray[i][1], lineStyle, serie.zlevel, serie.z);
                lastAngle = newAngle;
                sectorShape._animationAdd = 'r';
                ecData.set(sectorShape, 'seriesIndex', seriesIndex);
                ecData.set(sectorShape, 'dataIndex', i);
                this.shapeList.push(sectorShape);
            }
        },
        _buildSplitLine: function (seriesIndex) {
            var serie = this.series[seriesIndex];
            if (!serie.splitLine.show) {
                return;
            }
            var params = this._paramsMap[seriesIndex];
            var splitNumber = serie.splitNumber;
            var min = serie.min;
            var total = serie.max - min;
            var splitLine = serie.splitLine;
            var length = this.parsePercent(splitLine.length, params.radius[1]);
            var lineStyle = splitLine.lineStyle;
            var color = lineStyle.color;
            var center = params.center;
            var startAngle = params.startAngle * Math.PI / 180;
            var totalAngle = params.totalAngle * Math.PI / 180;
            var r = params.radius[1];
            var r0 = r - length;
            var angle;
            var sinAngle;
            var cosAngle;
            for (var i = 0; i <= splitnumber;="" i++)="" {="" angle="startAngle" -="" totalangle="" splitnumber="" *="" i;="" sinangle="Math.sin(angle);" cosangle="Math.cos(angle);" this.shapelist.push(new="" lineshape({="" zlevel:="" serie.zlevel,="" z:="" serie.z="" +="" 1,="" hoverable:="" false,="" style:="" xstart:="" center[0]="" r,="" ystart:="" center[1]="" xend:="" r0,="" yend:="" strokecolor:="" color="==" 'auto'="" ?="" this._getcolor(seriesindex,="" min="" total="" i)="" :="" color,="" linetype:="" linestyle.type,="" linewidth:="" linestyle.width,="" shadowcolor:="" linestyle.shadowcolor,="" shadowblur:="" linestyle.shadowblur,="" shadowoffsetx:="" linestyle.shadowoffsetx,="" shadowoffsety:="" linestyle.shadowoffsety="" }="" }));="" },="" _buildaxistick:="" function="" (seriesindex)="" var="" serie="this.series[seriesIndex];" if="" (!serie.axistick.show)="" return;="" params="this._paramsMap[seriesIndex];" min;="" axistick="serie.axisTick;" ticksplit="axisTick.splitNumber;" length="this.parsePercent(axisTick.length," params.radius[1]);="" linestyle="axisTick.lineStyle;" center="params.center;" startangle="params.startAngle" math.pi="" 180;="" r="params.radius[1];" r0="r" length;="" angle;="" sinangle;="" cosangle;="" for="" (var="" i="0," l="splitNumber" ticksplit;="" <="l;" (i="" %="" 0)="" continue;="" _buildaxislabel:="" (!serie.axislabel.show)="" textstyle="serie.axisLabel.textStyle;" textfont="this.getFont(textStyle);" this.parsepercent(serie.splitline.length,="" params.radius[1])="" 5;="" value;="" value="accMath.accAdd(min," accmath.accmul(accmath.accdiv(total,="" splitnumber),="" i));="" 180);="" 360)="" 360;="" textshape({="" x:="" y:="" color:="" value)="" text:="" this._getlabeltext(serie.axislabel.formatter,="" value),="" textalign:="">= 110 && angle <= 250="" ?="" 'left'="" :="" angle="" <="70" ||="">= 290 ? 'right' : 'center',
                        textBaseline: angle >= 10 && angle <= 170="" ?="" 'top'="" :="" angle="">= 190 && angle <= 350="" ?="" 'bottom'="" :="" 'middle',="" textfont:="" textfont,="" shadowcolor:="" textstyle.shadowcolor,="" shadowblur:="" textstyle.shadowblur,="" shadowoffsetx:="" textstyle.shadowoffsetx,="" shadowoffsety:="" textstyle.shadowoffsety="" }="" }));="" },="" _buildpointer:="" function="" (seriesindex)="" {="" var="" serie="this.series[seriesIndex];" if="" (!serie.pointer.show)="" return;="" total="serie.max" -="" serie.min;="" pointer="serie.pointer;" params="this._paramsMap[seriesIndex];" length="this.parsePercent(pointer.length," params.radius[1]);="" width="this.parsePercent(pointer.width," center="params.center;" value="this._getValue(seriesIndex);" <="" serie.max="" serie.max;="" angle="(params.startAngle" params.totalangle="" *="" (value="" serie.min))="" math.pi="" 180;="" color="pointer.color" =="=" 'auto'="" this._getcolor(seriesindex,="" value)="" pointer.color;="" pointshape="new" gaugepointershape({="" zlevel:="" serie.zlevel,="" z:="" serie.z="" +="" 1,="" clickable:="" this.query(serie,="" 'clickable'),="" style:="" x:="" center[0],="" y:="" center[1],="" r:="" length,="" startangle:="" params.startangle="" 180,="" angle:="" angle,="" color:="" color,="" width:="" width,="" pointer.shadowcolor,="" pointer.shadowblur,="" pointer.shadowoffsetx,="" pointer.shadowoffsety="" highlightstyle:="" brushtype:="" 'fill',=""> 2 ? 2 : width / 2,
                    color: '#fff'
                }
            });
            ecData.pack(pointShape, this.series[seriesIndex], seriesIndex, this.series[seriesIndex].data[0], 0, this.series[seriesIndex].data[0].name, value);
            this.shapeList.push(pointShape);
            this.shapeList.push(new CircleShape({
                zlevel: serie.zlevel,
                z: serie.z + 2,
                hoverable: false,
                style: {
                    x: center[0],
                    y: center[1],
                    r: pointer.width / 2.5,
                    color: '#fff'
                }
            }));
        },
        _buildTitle: function (seriesIndex) {
            var serie = this.series[seriesIndex];
            if (!serie.title.show) {
                return;
            }
            var data = serie.data[0];
            var name = data.name != null ? data.name : '';
            if (name !== '') {
                var title = serie.title;
                var offsetCenter = title.offsetCenter;
                var textStyle = title.textStyle;
                var textColor = textStyle.color;
                var params = this._paramsMap[seriesIndex];
                var x = params.center[0] + this.parsePercent(offsetCenter[0], params.radius[1]);
                var y = params.center[1] + this.parsePercent(offsetCenter[1], params.radius[1]);
                this.shapeList.push(new TextShape({
                    zlevel: serie.zlevel,
                    z: serie.z + (Math.abs(x - params.center[0]) + Math.abs(y - params.center[1]) < textStyle.fontSize * 2 ? 2 : 1),
                    hoverable: false,
                    style: {
                        x: x,
                        y: y,
                        color: textColor === 'auto' ? this._getColor(seriesIndex) : textColor,
                        text: name,
                        textAlign: 'center',
                        textFont: this.getFont(textStyle),
                        shadowColor: textStyle.shadowColor,
                        shadowBlur: textStyle.shadowBlur,
                        shadowOffsetX: textStyle.shadowOffsetX,
                        shadowOffsetY: textStyle.shadowOffsetY
                    }
                }));
            }
        },
        _buildDetail: function (seriesIndex) {
            var serie = this.series[seriesIndex];
            if (!serie.detail.show) {
                return;
            }
            var detail = serie.detail;
            var offsetCenter = detail.offsetCenter;
            var color = detail.backgroundColor;
            var textStyle = detail.textStyle;
            var textColor = textStyle.color;
            var params = this._paramsMap[seriesIndex];
            var value = this._getValue(seriesIndex);
            var x = params.center[0] - detail.width / 2 + this.parsePercent(offsetCenter[0], params.radius[1]);
            var y = params.center[1] + this.parsePercent(offsetCenter[1], params.radius[1]);
            this.shapeList.push(new RectangleShape({
                zlevel: serie.zlevel,
                z: serie.z + (Math.abs(x + detail.width / 2 - params.center[0]) + Math.abs(y + detail.height / 2 - params.center[1]) < textStyle.fontSize ? 2 : 1),
                hoverable: false,
                style: {
                    x: x,
                    y: y,
                    width: detail.width,
                    height: detail.height,
                    brushType: 'both',
                    color: color === 'auto' ? this._getColor(seriesIndex, value) : color,
                    lineWidth: detail.borderWidth,
                    strokeColor: detail.borderColor,
                    shadowColor: detail.shadowColor,
                    shadowBlur: detail.shadowBlur,
                    shadowOffsetX: detail.shadowOffsetX,
                    shadowOffsetY: detail.shadowOffsetY,
                    text: this._getLabelText(detail.formatter, value),
                    textFont: this.getFont(textStyle),
                    textPosition: 'inside',
                    textColor: textColor === 'auto' ? this._getColor(seriesIndex, value) : textColor
                }
            }));
        },
        _getValue: function (seriesIndex) {
            return this.getDataFromOption(this.series[seriesIndex].data[0]);
        },
        _colorMap: function (seriesIndex) {
            var serie = this.series[seriesIndex];
            var min = serie.min;
            var total = serie.max - min;
            var color = serie.axisLine.lineStyle.color;
            if (!(color instanceof Array)) {
                color = [[
                        1,
                        color
                    ]];
            }
            var colorArray = [];
            for (var i = 0, l = color.length; i < l; i++) {
                colorArray.push([
                    color[i][0] * total + min,
                    color[i][1]
                ]);
            }
            this._paramsMap[seriesIndex].colorArray = colorArray;
        },
        _getColor: function (seriesIndex, value) {
            if (value == null) {
                value = this._getValue(seriesIndex);
            }
            var colorArray = this._paramsMap[seriesIndex].colorArray;
            for (var i = 0, l = colorArray.length; i < l; i++) {
                if (colorArray[i][0] >= value) {
                    return colorArray[i][1];
                }
            }
            return colorArray[colorArray.length - 1][1];
        },
        _getSector: function (center, r0, r, startAngle, endAngle, color, lineStyle, zlevel, z) {
            return new SectorShape({
                zlevel: zlevel,
                z: z,
                hoverable: false,
                style: {
                    x: center[0],
                    y: center[1],
                    r0: r0,
                    r: r,
                    startAngle: startAngle,
                    endAngle: endAngle,
                    brushType: 'fill',
                    color: color,
                    shadowColor: lineStyle.shadowColor,
                    shadowBlur: lineStyle.shadowBlur,
                    shadowOffsetX: lineStyle.shadowOffsetX,
                    shadowOffsetY: lineStyle.shadowOffsetY
                }
            });
        },
        _getLabelText: function (formatter, value) {
            if (formatter) {
                if (typeof formatter === 'function') {
                    return formatter.call(this.myChart, value);
                } else if (typeof formatter === 'string') {
                    return formatter.replace('{value}', value);
                }
            }
            return value;
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
    zrUtil.inherits(Gauge, ChartBase);
    require('../chart').define('gauge', Gauge);
    return Gauge;
});define('echarts/util/shape/GaugePointer', [
    'require',
    'zrender/shape/Base',
    'zrender/tool/util',
    './normalIsCover'
], function (require) {
    var Base = require('zrender/shape/Base');
    var zrUtil = require('zrender/tool/util');
    function GaugePointer(options) {
        Base.call(this, options);
    }
    GaugePointer.prototype = {
        type: 'gauge-pointer',
        buildPath: function (ctx, style) {
            var r = style.r;
            var width = style.width;
            var angle = style.angle;
            var x = style.x - Math.cos(angle) * width * (width >= r / 3 ? 1 : 2);
            var y = style.y + Math.sin(angle) * width * (width >= r / 3 ? 1 : 2);
            angle = style.angle - Math.PI / 2;
            ctx.moveTo(x, y);
            ctx.lineTo(style.x + Math.cos(angle) * width, style.y - Math.sin(angle) * width);
            ctx.lineTo(style.x + Math.cos(style.angle) * r, style.y - Math.sin(style.angle) * r);
            ctx.lineTo(style.x - Math.cos(angle) * width, style.y + Math.sin(angle) * width);
            ctx.lineTo(x, y);
            return;
        },
        getRect: function (style) {
            if (style.__rect) {
                return style.__rect;
            }
            var width = style.width * 2;
            var xStart = style.x;
            var yStart = style.y;
            var xEnd = xStart + Math.cos(style.angle) * style.r;
            var yEnd = yStart - Math.sin(style.angle) * style.r;
            style.__rect = {
                x: Math.min(xStart, xEnd) - width,
                y: Math.min(yStart, yEnd) - width,
                width: Math.abs(xStart - xEnd) + width,
                height: Math.abs(yStart - yEnd) + width
            };
            return style.__rect;
        },
        isCover: require('./normalIsCover')
    };
    zrUtil.inherits(GaugePointer, Base);
    return GaugePointer;
});</=></=></=></=>