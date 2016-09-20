/**
 * echarts图表类：漏斗图
 *
 * @desc echarts基于Canvas，纯Javascript图表库，提供直观，生动，可交互，可个性化定制的数据统计图表。
 * @author Kener (@Kener-林峰, kener.linfeng@gmail.com)
 *
 */
define(function (require) {
    var ChartBase = require('./base');
    
    // 图形依赖
    var TextShape = require('zrender/shape/Text');
    var LineShape = require('zrender/shape/Line');
    var PolygonShape = require('zrender/shape/Polygon');

    var ecConfig = require('../config');
    // 漏斗图默认参数
    ecConfig.funnel = {
        zlevel: 0,                  // 一级层叠
        z: 2,                       // 二级层叠
        clickable: true,
        legendHoverLink: true,
        x: 80,
        y: 60,
        x2: 80,
        y2: 60,
        // width: {totalWidth} - x - x2,
        // height: {totalHeight} - y - y2,
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending', // 'ascending', 'descending'
        gap: 0,
        funnelAlign: 'center',
        itemStyle: {
            normal: {
                // color: 各异,
                borderColor: '#fff',
                borderWidth: 1,
                label: {
                    show: true,
                    position: 'outer'
                    // formatter: 标签文本格式器，同Tooltip.formatter，不支持异步回调
                    // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                },
                labelLine: {
                    show: true,
                    length: 10,
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
                    show: true
                },
                labelLine: {
                    show: true
                }
            }
        }
    };

    var ecData = require('../util/ecData');
    var number = require('../util/number');
    var zrUtil = require('zrender/tool/util');
    var zrColor = require('zrender/tool/color');
    var zrArea = require('zrender/tool/area');
    
    /**
     * 构造函数
     * @param {Object} messageCenter echart消息中心
     * @param {ZRender} zr zrender实例
     * @param {Object} series 数据
     * @param {Object} component 组件
     */
    function Funnel(ecTheme, messageCenter, zr, option, myChart) {
        // 图表基类
        ChartBase.call(this, ecTheme, messageCenter, zr, option, myChart);
        this.refresh(option);
    }
    
    Funnel.prototype = {
        type: ecConfig.CHART_TYPE_FUNNEL,
        /**
         * 绘制图形
         */
        _buildShape: function () {
            var series = this.series;
            var legend = this.component.legend;
            // 复用参数索引
            this._paramsMap = {};
            this._selected = {};
            this.selectedMap = {};
            
            var serieName;
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === ecConfig.CHART_TYPE_FUNNEL) {
                    series[i] = this.reformOption(series[i]);
                    this.legendHoverLink = series[i].legendHoverLink || this.legendHoverLink;
                    serieName = series[i].name || '';
                    // 系列图例开关
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
        
        /**
         * 构建单个仪表盘
         *
         * @param {number} seriesIndex 系列索引
         */
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
            // 计算需要显示的个数和总值
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
            // 可计算箱子
            var funnelCase = this._buildFunnelCase(seriesIndex);
            var align = serie.funnelAlign;
            var gap = serie.gap;
            var height = total > 1 
                         ? (location.height - (total - 1) * gap) / total : location.height;
            var width;
            var lastY = location.y;
            var lastWidth = serie.sort === 'descending'
                            ? this._getItemWidth(seriesIndex, selectedData[0].value)
                            : number.parsePercent(serie.minSize, location.width);
            var next = serie.sort === 'descending' ? 1 : 0;
            var centerX = location.centerX;
            var pointList= [];
            var x;
            var polygon;
            var lastPolygon;
            for (var i = 0, l = selectedData.length; i < l; i++) {
                itemName = selectedData[i].name;
                if (this.selectedMap[itemName] && !isNaN(selectedData[i].value)) {
                    width = i <= 2="" 10="" l="" -="" ?="" this._getitemwidth(seriesindex,="" selecteddata[i="" +="" next].value)="" :="" serie.sort="==" 'descending'="" number.parsepercent(serie.minsize,="" location.width)="" number.parsepercent(serie.maxsize,="" location.width);="" switch="" (align)="" {="" case="" 'left':="" x="location.x;" break;="" 'right':="" location.width="" lastwidth;="" default:="" lastwidth="" 2;="" }="" polygon="this._buildItem(" seriesindex,="" selecteddata[i]._index,="" legend="" color="" legend.getcolor(itemname)="" this.zr.getcolor(selecteddata[i]._index),="" x,="" lasty,="" lastwidth,="" width,="" height,="" align="" );="" lasty="" gap;="" lastpolygon="polygon.style.pointList;" pointlist.unshift([lastpolygon[0][0]="" 10,="" lastpolygon[0][1]]);="" 左="" pointlist.push([lastpolygon[1][0]="" lastpolygon[1][1]]);="" 右="" if="" (i="==" 0)="" (lastwidth="==" 'center'="" &&="" (pointlist[0][0]="" 'right'="" pointlist[0][1]="" =="center" 15;="" (l="=" 1)="" else="" pointlist[pointlist.length="" 1][1]="" (funnelcase)="" pointlist.unshift([lastpolygon[3][0]="" lastpolygon[3][1]]);="" pointlist.push([lastpolygon[2][0]="" lastpolygon[2][1]]);="" funnelcase.style.pointlist="pointList;" },="" _buildfunnelcase:="" function(seriesindex)="" var="" serie="this.series[seriesIndex];" (this.deepquery([serie,="" this.option],="" 'calculable'))="" location="this._paramsMap[seriesIndex].location;" gap="10;" funnelcase="{" hoverable:="" false,="" style:="" pointlistd:="" [="" [location.x="" gap,="" location.y="" gap],="" location.height="" gap]="" ],="" brushtype:="" 'stroke',="" linewidth:="" 1,="" strokecolor:="" serie.calculableholdercolor="" ||="" this.ectheme.calculableholdercolor="" ecconfig.calculableholdercolor="" };="" ecdata.pack(funnelcase,="" serie,="" undefined,="" -1);="" this.setcalculable(funnelcase);="" polygonshape(funnelcase);="" this.shapelist.push(funnelcase);="" return="" funnelcase;="" _getlocation:="" function="" (seriesindex)="" gridoption="this.series[seriesIndex];" zrwidth="this.zr.getWidth();" zrheight="this.zr.getHeight();" zrwidth);="" y="this.parsePercent(gridOption.y," zrheight);="" width="gridOption.width" (zrwidth="" this.parsepercent(gridoption.x2,="" zrwidth))="" this.parsepercent(gridoption.width,="" x:="" y:="" y,="" width:="" height:="" gridoption.height="=" null="" (zrheight="" this.parsepercent(gridoption.y2,="" zrheight))="" this.parsepercent(gridoption.height,="" zrheight),="" centerx:="" _mapdata:="" funneldata="zrUtil.clone(serie.data);" for="" (var="" i="0," <="" l;="" i++)="" funneldata[i]._index="i;" numdescending="" (a,="" b)="" (a.value="==" '-')="" 1;="" (b.value="==" -1;="" b.value="" a.value;="" numascending="" -numdescending(a,="" b);="" (serie.sort="" !="none" )="" funneldata.sort(serie.sort="==" numascending);="" funneldata;="" **="" *="" 构建单个扇形及指标="" _builditem:="" (="" dataindex,="" defaultcolor,="" topwidth,="" bottomwidth,="" series="this.series;" data="serie.data[dataIndex];" 漏斗="" ecdata.pack(="" polygon,="" series[seriesindex],="" series[seriesindex].data[dataindex],="" series[seriesindex].data[dataindex].name="" this.shapelist.push(polygon);="" 文本标签="" label="this.getLabel(" label,="" this.shapelist.push(label);="" 特定状态下是否需要显示文本标签="" (!this._needlabel(serie,="" data,false))="" label.invisible="true;" 文本标签视觉引导线="" labelline="this.getLabelLine(" this.shapelist.push(labelline);="" 特定状态下是否需要显示文本标签引导线="" (!this._needlabelline(serie,="" labelline.invisible="true;" polygonhoverconnect="[];" labelhoverconnect="[];" (this._needlabelline(serie,="" data,="" true))="" polygonhoverconnect.push(labelline.id);="" labelhoverconnect.push(labelline.id);="" (this._needlabel(serie,="" polygonhoverconnect.push(label.id);="" labelhoverconnect.push(polygon.id);="" polygon.hoverconnect="polygonHoverConnect;" label.hoverconnect="labelHoverConnect;" polygon;="" 根据值计算宽度="" _getitemwidth:="" (seriesindex,="" value)="" min="serie.min;" max="serie.max;" minsize="number.parsePercent(serie.minSize," maxsize="number.parsePercent(serie.maxSize," (value="" min)="" (maxsize="" minsize)="" (max="" minsize;="" 构建扇形="" getpolygon:="" xlt,="" querytarget="[data," serie];="" 多级控制="" normal="this.deepMerge(queryTarget," 'itemstyle.normal')="" {};="" emphasis="this.deepMerge(queryTarget,'itemStyle.emphasis')" normalcolor="this.getItemStyleColor(normal.color," data)="" defaultcolor;="" emphasiscolor="this.getItemStyleColor(emphasis.color," (typeof="" 'string'="" zrcolor.lift(normalcolor,="" -0.2)="" xlb;="" xlb="xLT;" (topwidth="" bottomwidth);="" bottomwidth)="" zlevel:="" serie.zlevel,="" z:="" serie.z,="" clickable:="" this.deepquery(querytarget,="" 'clickable'),="" pointlist:="" [xlt,="" y],="" [xlt="" [xlb="" height],="" [xlb,="" height]="" 'both',="" color:="" normalcolor,="" normal.borderwidth,="" normal.bordercolor="" highlightstyle:="" emphasiscolor,="" emphasis.borderwidth,="" emphasis.bordercolor="" (this.deepquery([data,="" this.setcalculable(polygon);="" polygon.draggable="true;" new="" polygonshape(polygon);="" 需要显示则会有返回构建好的shape，否则返回undefined="" getlabel:="" serie里有默认配置，放心大胆的用！="" itemstyle="zrUtil.merge(" zrutil.clone(data.itemstyle)="" {},="" serie.itemstyle="" status="normal" ;="" label配置="" labelcontrol="itemStyle[status].label;" textstyle="labelControl.textStyle" linelength="itemStyle[status].labelLine.length;" text="this.getLabelText(seriesIndex," status);="" textfont="this.getFont(textStyle);" textalign;="" textcolor="defaultColor;" labelcontrol.position="labelControl.position" itemstyle.normal.label.position;="" (labelcontrol.position="==" 'inner'="" 'inside'="" 内部="" textalign="align;"> zrArea.getTextWidth(text, textFont)
                    ? '#fff' : zrColor.reverse(defaultColor);
            }
            else if (labelControl.position === 'left'){
                // 左侧显示
                textAlign = 'right';
            }
            else {
                // 右侧显示，默认 labelControl.position === 'outer' || 'right)
                textAlign = 'left';
            }
            
            var textShape = {
                zlevel: serie.zlevel,
                z: serie.z + 1,
                style: {
                    x: this._getLabelPoint(
                           labelControl.position, x, location,
                           topWidth, bottomWidth,lineLength, align
                       ),
                    y: y + height / 2,
                    color: textStyle.color || textColor,
                    text: text,
                    textAlign: textStyle.align || textAlign,
                    textBaseline: textStyle.baseline || 'middle',
                    textFont: textFont
                }
            };
            
            //----------高亮
            status = 'emphasis';
            // label配置
            labelControl = itemStyle[status].label || labelControl;
            textStyle = labelControl.textStyle || textStyle;
            lineLength = itemStyle[status].labelLine.length || lineLength;
            labelControl.position = labelControl.position || itemStyle.normal.label.position;
            text = this.getLabelText(seriesIndex, dataIndex, status);
            textFont = this.getFont(textStyle);
            textColor = defaultColor;
            if (labelControl.position === 'inner' 
                || labelControl.position === 'inside'
                || labelControl.position === 'center'
            ) {
                // 内部
                textAlign = align;
                textColor = 
                    Math.max(topWidth, bottomWidth) / 2 > zrArea.getTextWidth(text, textFont)
                    ? '#fff' : zrColor.reverse(defaultColor);
            }
            else if (labelControl.position === 'left'){
                // 左侧显示
                textAlign = 'right';
            }
            else {
                // 右侧显示，默认 labelControl.position === 'outer' || 'right)
                textAlign = 'left';
            }
            
            textShape.highlightStyle = {
                x: this._getLabelPoint(
                       labelControl.position, x, location,
                       topWidth, bottomWidth,lineLength, align
                   ),
                color: textStyle.color || textColor,
                text: text,
                textAlign: textStyle.align || textAlign,
                textFont: textFont,
                brushType: 'fill'
            };
            
            return new TextShape(textShape);
        },

        /**
         * 根据lable.format计算label text
         */
        getLabelText: function (seriesIndex, dataIndex, status) {
            var series = this.series;
            var serie = series[seriesIndex];
            var data = serie.data[dataIndex];
            var formatter = this.deepQuery(
                [data, serie],
                'itemStyle.' + status + '.label.formatter'
            );
            
            if (formatter) {
                if (typeof formatter === 'function') {
                    return formatter.call(
                        this.myChart,
                        {
                            seriesIndex: seriesIndex,
                            seriesName: serie.name || '',
                            series: serie,
                            dataIndex: dataIndex,
                            data: data,
                            name: data.name,
                            value: data.value
                        }
                    );
                }
                else if (typeof formatter === 'string') {
                    formatter = formatter.replace('{a}','{a0}')
                                         .replace('{b}','{b0}')
                                         .replace('{c}','{c0}')
                                         .replace('{a0}', serie.name)
                                         .replace('{b0}', data.name)
                                         .replace('{c0}', data.value);
    
                    return formatter;
                }
            }
            else {
                return data.name;
            }
        },
        
        /**
         * 需要显示则会有返回构建好的shape，否则返回undefined
         */
        getLabelLine: function (
            seriesIndex, dataIndex, defaultColor,
            x, y, topWidth, bottomWidth, height, align
        ) {
            var serie = this.series[seriesIndex];
            var data = serie.data[dataIndex];
            var location = this._paramsMap[seriesIndex].location;

            // serie里有默认配置，放心大胆的用！
            var itemStyle = zrUtil.merge(
                    zrUtil.clone(data.itemStyle) || {},
                    serie.itemStyle
                );
            var status = 'normal';
            // labelLine配置
            var labelLineControl = itemStyle[status].labelLine;
            var lineLength = itemStyle[status].labelLine.length;
            var lineStyle = labelLineControl.lineStyle || {};
            
            var labelControl = itemStyle[status].label;
            labelControl.position = labelControl.position 
                                    || itemStyle.normal.label.position;

            var lineShape = {
                zlevel: serie.zlevel,
                z: serie.z + 1,
                hoverable: false,
                style: {
                    xStart: this._getLabelLineStartPoint(x, location, topWidth, bottomWidth, align),
                    yStart: y + height / 2,
                    xEnd: this._getLabelPoint(
                              labelControl.position, x, location,
                              topWidth, bottomWidth,lineLength, align
                          ),
                    yEnd: y + height / 2,
                    strokeColor: lineStyle.color || defaultColor,
                    lineType: lineStyle.type,
                    lineWidth: lineStyle.width
                }
            };
            
            status = 'emphasis';
            // labelLine配置
            labelLineControl = itemStyle[status].labelLine || labelLineControl;
            lineLength = itemStyle[status].labelLine.length || lineLength;
            lineStyle = labelLineControl.lineStyle || lineStyle;

            labelControl = itemStyle[status].label || labelControl;
            labelControl.position = labelControl.position;
            
            lineShape.highlightStyle = {
                xEnd: this._getLabelPoint(
                          labelControl.position, x, location,
                          topWidth, bottomWidth,lineLength, align
                      ),
                strokeColor: lineStyle.color || defaultColor,
                lineType: lineStyle.type,
                lineWidth: lineStyle.width
            };
            
            return new LineShape(lineShape);
        },
        
        _getLabelPoint: function(position, x, location, topWidth, bottomWidth, lineLength, align) {
            position = (position === 'inner' || position === 'inside') ? 'center' : position;
            switch (position) {
                case 'center':
                    return align == 'center'
                            ? (x + topWidth / 2)
                            : align == 'left' ? (x + 10) : (x + topWidth - 10);
                case 'left':
                    // 左侧文本
                    if (lineLength === 'auto') {
                        return location.x - 10;
                    }
                    else {
                        return align == 'center'
                            // 居中布局
                            ? (location.centerX - Math.max(topWidth, bottomWidth) / 2 - lineLength)
                            : align == 'right'
                                // 右对齐布局
                                ? (x 
                                    - (topWidth < bottomWidth ? (bottomWidth - topWidth) : 0)
                                    - lineLength
                                )
                                // 左对齐布局
                                : (location.x - lineLength);
                    }
                    break;
                default:
                    // 右侧文本
                    if (lineLength === 'auto') {
                        return location.x + location.width + 10;
                    }
                    else {
                        return align == 'center'
                            // 居中布局
                            ? (location.centerX + Math.max(topWidth, bottomWidth) / 2 + lineLength)
                            : align == 'right'
                                // 右对齐布局
                                ? (location.x + location.width + lineLength)
                                // 左对齐布局
                                : (x + Math.max(topWidth, bottomWidth) + lineLength);
                    }
            }
        },
        
        _getLabelLineStartPoint: function(x, location, topWidth, bottomWidth, align) {
            return align == 'center'
                   ? location.centerX 
                   : topWidth < bottomWidth
                     ? (x + Math.min(topWidth, bottomWidth) / 2)
                     : (x + Math.max(topWidth, bottomWidth) / 2);
        },

        /**
         * 返回特定状态（normal or emphasis）下是否需要显示label标签文本
         * @param {Object} serie
         * @param {Object} data
         * @param {boolean} isEmphasis true is 'emphasis' and false is 'normal'
         */
        _needLabel: function (serie, data, isEmphasis) {
            return this.deepQuery(
                [data, serie],
                'itemStyle.'
                + (isEmphasis ? 'emphasis' : 'normal')
                + '.label.show'
            );
        },

        /**
         * 返回特定状态（normal or emphasis）下是否需要显示labelLine标签视觉引导线
         * @param {Object} serie
         * @param {Object} data
         * @param {boolean} isEmphasis true is 'emphasis' and false is 'normal'
         */
        _needLabelLine: function (serie, data, isEmphasis) {
            return this.deepQuery(
                [data, serie],
                'itemStyle.'
                + (isEmphasis ? 'emphasis' : 'normal')
                +'.labelLine.show'
            );
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
        }
    };
    
    zrUtil.inherits(Funnel, ChartBase);
    
    // 图表注册
    require('../chart').define('funnel', Funnel);
    
    return Funnel;
});</=>