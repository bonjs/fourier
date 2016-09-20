define('echarts/chart/chord', [
    'require',
    './base',
    'zrender/shape/Text',
    'zrender/shape/Line',
    'zrender/shape/Sector',
    '../util/shape/Ribbon',
    '../util/shape/Icon',
    'zrender/shape/BezierCurve',
    '../config',
    '../util/ecData',
    'zrender/tool/util',
    'zrender/tool/vector',
    '../data/Graph',
    '../layout/Chord',
    '../chart'
], function (require) {
    'use strict';
    var ChartBase = require('./base');
    var TextShape = require('zrender/shape/Text');
    var LineShape = require('zrender/shape/Line');
    var SectorShape = require('zrender/shape/Sector');
    var RibbonShape = require('../util/shape/Ribbon');
    var IconShape = require('../util/shape/Icon');
    var BezierCurveShape = require('zrender/shape/BezierCurve');
    var ecConfig = require('../config');
    ecConfig.chord = {
        zlevel: 0,
        z: 2,
        clickable: true,
        radius: [
            '65%',
            '75%'
        ],
        center: [
            '50%',
            '50%'
        ],
        padding: 2,
        sort: 'none',
        sortSub: 'none',
        startAngle: 90,
        clockWise: true,
        ribbonType: true,
        minRadius: 10,
        maxRadius: 20,
        symbol: 'circle',
        showScale: false,
        showScaleText: false,
        itemStyle: {
            normal: {
                borderWidth: 0,
                borderColor: '#000',
                label: {
                    show: true,
                    rotate: false,
                    distance: 5
                },
                chordStyle: {
                    width: 1,
                    color: 'black',
                    borderWidth: 1,
                    borderColor: '#999',
                    opacity: 0.5
                }
            },
            emphasis: {
                borderWidth: 0,
                borderColor: '#000',
                chordStyle: {
                    width: 1,
                    color: 'black',
                    borderWidth: 1,
                    borderColor: '#999'
                }
            }
        }
    };
    var ecData = require('../util/ecData');
    var zrUtil = require('zrender/tool/util');
    var vec2 = require('zrender/tool/vector');
    var Graph = require('../data/Graph');
    var ChordLayout = require('../layout/Chord');
    function Chord(ecTheme, messageCenter, zr, option, myChart) {
        ChartBase.call(this, ecTheme, messageCenter, zr, option, myChart);
        this.scaleLineLength = 4;
        this.scaleUnitAngle = 4;
        this.refresh(option);
    }
    Chord.prototype = {
        type: ecConfig.CHART_TYPE_CHORD,
        _init: function () {
            var series = this.series;
            this.selectedMap = {};
            var chordSeriesMap = {};
            var chordSeriesGroups = {};
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === this.type) {
                    var _isSelected = this.isSelected(series[i].name);
                    this.selectedMap[series[i].name] = _isSelected;
                    if (_isSelected) {
                        this.buildMark(i);
                    }
                    this.reformOption(series[i]);
                    chordSeriesMap[series[i].name] = series[i];
                }
            }
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === this.type) {
                    if (series[i].insertToSerie) {
                        var referenceSerie = chordSeriesMap[series[i].insertToSerie];
                        series[i]._referenceSerie = referenceSerie;
                    } else {
                        chordSeriesGroups[series[i].name] = [series[i]];
                    }
                }
            }
            for (var i = 0, l = series.length; i < l; i++) {
                if (series[i].type === this.type) {
                    if (series[i].insertToSerie) {
                        var mainSerie = series[i]._referenceSerie;
                        while (mainSerie && mainSerie._referenceSerie) {
                            mainSerie = mainSerie._referenceSerie;
                        }
                        if (chordSeriesGroups[mainSerie.name] && this.selectedMap[series[i].name]) {
                            chordSeriesGroups[mainSerie.name].push(series[i]);
                        }
                    }
                }
            }
            for (var name in chordSeriesGroups) {
                this._buildChords(chordSeriesGroups[name]);
            }
            this.addShapeList();
        },
        _getNodeCategory: function (serie, group) {
            return serie.categories && serie.categories[group.category || 0];
        },
        _getNodeQueryTarget: function (serie, group) {
            var category = this._getNodeCategory(serie, group);
            return [
                group,
                category,
                serie
            ];
        },
        _getEdgeQueryTarget: function (serie, edge, type) {
            type = type || 'normal';
            return [
                edge.itemStyle && edge.itemStyle[type],
                serie.itemStyle[type].chordStyle
            ];
        },
        _buildChords: function (series) {
            var graphs = [];
            var mainSerie = series[0];
            var nodeFilter = function (n) {
                return n.layout.size > 0;
            };
            var createEdgeFilter = function (graph) {
                return function (e) {
                    return graph.getEdge(e.node2, e.node1);
                };
            };
            for (var i = 0; i < series.length; i++) {
                var serie = series[i];
                if (this.selectedMap[serie.name]) {
                    var graph;
                    if (serie.matrix) {
                        graph = this._getSerieGraphFromDataMatrix(serie, mainSerie);
                    } else if (serie.links) {
                        graph = this._getSerieGraphFromNodeLinks(serie, mainSerie);
                    }
                    graph.filterNode(nodeFilter, this);
                    if (serie.ribbonType) {
                        graph.filterEdge(createEdgeFilter(graph));
                    }
                    graphs.push(graph);
                    graph.__serie = serie;
                }
            }
            if (!graphs.length) {
                return;
            }
            var mainGraph = graphs[0];
            if (!mainSerie.ribbonType) {
                var minRadius = mainSerie.minRadius;
                var maxRadius = mainSerie.maxRadius;
                var min = Infinity, max = -Infinity;
                mainGraph.eachNode(function (node) {
                    max = Math.max(node.layout.size, max);
                    min = Math.min(node.layout.size, min);
                });
                var multiplier = (maxRadius - minRadius) / (max - min);
                mainGraph.eachNode(function (node) {
                    var queryTarget = this._getNodeQueryTarget(mainSerie, node);
                    var symbolSize = this.query(queryTarget, 'symbolSize');
                    if (max === min) {
                        node.layout.size = symbolSize || min;
                    } else {
                        node.layout.size = symbolSize || (node.layout.size - min) * multiplier + minRadius;
                    }
                }, this);
            }
            var layout = new ChordLayout();
            layout.clockWise = mainSerie.clockWise;
            layout.startAngle = mainSerie.startAngle * Math.PI / 180;
            if (!layout.clockWise) {
                layout.startAngle = -layout.startAngle;
            }
            layout.padding = mainSerie.padding * Math.PI / 180;
            layout.sort = mainSerie.sort;
            layout.sortSub = mainSerie.sortSub;
            layout.directed = mainSerie.ribbonType;
            layout.run(graphs);
            var showLabel = this.query(mainSerie, 'itemStyle.normal.label.show');
            if (mainSerie.ribbonType) {
                this._buildSectors(mainSerie, 0, mainGraph, mainSerie, graphs);
                if (showLabel) {
                    this._buildLabels(mainSerie, 0, mainGraph, mainSerie, graphs);
                }
                for (var i = 0, j = 0; i < series.length; i++) {
                    if (this.selectedMap[series[i].name]) {
                        this._buildRibbons(series, i, graphs[j++], mainSerie);
                    }
                }
                if (mainSerie.showScale) {
                    this._buildScales(mainSerie, 0, mainGraph);
                }
            } else {
                this._buildNodeIcons(mainSerie, 0, mainGraph, mainSerie, graphs);
                if (showLabel) {
                    this._buildLabels(mainSerie, 0, mainGraph, mainSerie, graphs);
                }
                for (var i = 0, j = 0; i < series.length; i++) {
                    if (this.selectedMap[series[i].name]) {
                        this._buildEdgeCurves(series, i, graphs[j++], mainSerie, mainGraph);
                    }
                }
            }
            this._initHoverHandler(series, graphs);
        },
        _getSerieGraphFromDataMatrix: function (serie, mainSerie) {
            var nodesData = [];
            var count = 0;
            var matrix = [];
            for (var i = 0; i < serie.matrix.length; i++) {
                matrix[i] = serie.matrix[i].slice();
            }
            var data = serie.data || serie.nodes;
            for (var i = 0; i < data.length; i++) {
                var node = {};
                var group = data[i];
                group.rawIndex = i;
                for (var key in group) {
                    if (key === 'name') {
                        node['id'] = group['name'];
                    } else {
                        node[key] = group[key];
                    }
                }
                var category = this._getNodeCategory(mainSerie, group);
                var name = category ? category.name : group.name;
                this.selectedMap[name] = this.isSelected(name);
                if (this.selectedMap[name]) {
                    nodesData.push(node);
                    count++;
                } else {
                    matrix.splice(count, 1);
                    for (var j = 0; j < matrix.length; j++) {
                        matrix[j].splice(count, 1);
                    }
                }
            }
            var graph = Graph.fromMatrix(nodesData, matrix, true);
            graph.eachNode(function (n, idx) {
                n.layout = { size: n.data.outValue };
                n.rawIndex = n.data.rawIndex;
            });
            graph.eachEdge(function (e) {
                e.layout = { weight: e.data.weight };
            });
            return graph;
        },
        _getSerieGraphFromNodeLinks: function (serie, mainSerie) {
            var graph = new Graph(true);
            var nodes = serie.data || serie.nodes;
            for (var i = 0, len = nodes.length; i < len; i++) {
                var n = nodes[i];
                if (!n || n.ignore) {
                    continue;
                }
                var category = this._getNodeCategory(mainSerie, n);
                var name = category ? category.name : n.name;
                this.selectedMap[name] = this.isSelected(name);
                if (this.selectedMap[name]) {
                    var node = graph.addNode(n.name, n);
                    node.rawIndex = i;
                }
            }
            for (var i = 0, len = serie.links.length; i < len; i++) {
                var e = serie.links[i];
                var n1 = e.source;
                var n2 = e.target;
                if (typeof n1 === 'number') {
                    n1 = nodes[n1];
                    if (n1) {
                        n1 = n1.name;
                    }
                }
                if (typeof n2 === 'number') {
                    n2 = nodes[n2];
                    if (n2) {
                        n2 = n2.name;
                    }
                }
                var edge = graph.addEdge(n1, n2, e);
                if (edge) {
                    edge.rawIndex = i;
                }
            }
            graph.eachNode(function (n) {
                var value = n.data.value;
                if (value == null) {
                    value = 0;
                    if (mainSerie.ribbonType) {
                        for (var i = 0; i < n.outEdges.length; i++) {
                            value += n.outEdges[i].data.weight || 0;
                        }
                    } else {
                        for (var i = 0; i < n.edges.length; i++) {
                            value += n.edges[i].data.weight || 0;
                        }
                    }
                }
                n.layout = { size: value };
            });
            graph.eachEdge(function (e) {
                e.layout = { weight: e.data.weight == null ? 1 : e.data.weight };
            });
            return graph;
        },
        _initHoverHandler: function (series, graphs) {
            var mainSerie = series[0];
            var mainGraph = graphs[0];
            var self = this;
            mainGraph.eachNode(function (node) {
                node.shape.onmouseover = function () {
                    mainGraph.eachNode(function (n) {
                        n.shape.style.opacity = 0.1;
                        if (n.labelShape) {
                            n.labelShape.style.opacity = 0.1;
                            n.labelShape.modSelf();
                        }
                        n.shape.modSelf();
                    });
                    for (var i = 0; i < graphs.length; i++) {
                        for (var j = 0; j < graphs[i].edges.length; j++) {
                            var e = graphs[i].edges[j];
                            var queryTarget = self._getEdgeQueryTarget(graphs[i].__serie, e.data);
                            e.shape.style.opacity = self.deepQuery(queryTarget, 'opacity') * 0.1;
                            e.shape.modSelf();
                        }
                    }
                    node.shape.style.opacity = 1;
                    if (node.labelShape) {
                        node.labelShape.style.opacity = 1;
                    }
                    for (var i = 0; i < graphs.length; i++) {
                        var n = graphs[i].getNodeById(node.id);
                        if (n) {
                            for (var j = 0; j < n.outEdges.length; j++) {
                                var e = n.outEdges[j];
                                var queryTarget = self._getEdgeQueryTarget(graphs[i].__serie, e.data);
                                e.shape.style.opacity = self.deepQuery(queryTarget, 'opacity');
                                var other = graphs[0].getNodeById(e.node2.id);
                                if (other) {
                                    if (other.shape) {
                                        other.shape.style.opacity = 1;
                                    }
                                    if (other.labelShape) {
                                        other.labelShape.style.opacity = 1;
                                    }
                                }
                            }
                        }
                    }
                    self.zr.refreshNextFrame();
                };
                node.shape.onmouseout = function () {
                    mainGraph.eachNode(function (n) {
                        n.shape.style.opacity = 1;
                        if (n.labelShape) {
                            n.labelShape.style.opacity = 1;
                            n.labelShape.modSelf();
                        }
                        n.shape.modSelf();
                    });
                    for (var i = 0; i < graphs.length; i++) {
                        for (var j = 0; j < graphs[i].edges.length; j++) {
                            var e = graphs[i].edges[j];
                            var queryTarget = [
                                e.data,
                                mainSerie
                            ];
                            e.shape.style.opacity = self.deepQuery(queryTarget, 'itemStyle.normal.chordStyle.opacity');
                            e.shape.modSelf();
                        }
                    }
                    self.zr.refreshNextFrame();
                };
            });
        },
        _buildSectors: function (serie, serieIdx, graph, mainSerie) {
            var center = this.parseCenter(this.zr, mainSerie.center);
            var radius = this.parseRadius(this.zr, mainSerie.radius);
            var clockWise = mainSerie.clockWise;
            var sign = clockWise ? 1 : -1;
            graph.eachNode(function (node) {
                var category = this._getNodeCategory(mainSerie, node.data);
                var color = category ? this.getColor(category.name) : this.getColor(node.id);
                var startAngle = node.layout.startAngle / Math.PI * 180 * sign;
                var endAngle = node.layout.endAngle / Math.PI * 180 * sign;
                var sector = new SectorShape({
                    zlevel: serie.zlevel,
                    z: serie.z,
                    style: {
                        x: center[0],
                        y: center[1],
                        r0: radius[0],
                        r: radius[1],
                        startAngle: startAngle,
                        endAngle: endAngle,
                        brushType: 'fill',
                        opacity: 1,
                        color: color,
                        clockWise: clockWise
                    },
                    clickable: mainSerie.clickable,
                    highlightStyle: { brushType: 'fill' }
                });
                sector.style.lineWidth = this.deepQuery([
                    node.data,
                    mainSerie
                ], 'itemStyle.normal.borderWidth');
                sector.highlightStyle.lineWidth = this.deepQuery([
                    node.data,
                    mainSerie
                ], 'itemStyle.emphasis.borderWidth');
                sector.style.strokeColor = this.deepQuery([
                    node.data,
                    mainSerie
                ], 'itemStyle.normal.borderColor');
                sector.highlightStyle.strokeColor = this.deepQuery([
                    node.data,
                    mainSerie
                ], 'itemStyle.emphasis.borderColor');
                if (sector.style.lineWidth > 0) {
                    sector.style.brushType = 'both';
                }
                if (sector.highlightStyle.lineWidth > 0) {
                    sector.highlightStyle.brushType = 'both';
                }
                ecData.pack(sector, serie, serieIdx, node.data, node.rawIndex, node.id, node.category);
                this.shapeList.push(sector);
                node.shape = sector;
            }, this);
        },
        _buildNodeIcons: function (serie, serieIdx, graph, mainSerie) {
            var center = this.parseCenter(this.zr, mainSerie.center);
            var radius = this.parseRadius(this.zr, mainSerie.radius);
            var r = radius[1];
            graph.eachNode(function (node) {
                var startAngle = node.layout.startAngle;
                var endAngle = node.layout.endAngle;
                var angle = (startAngle + endAngle) / 2;
                var x = r * Math.cos(angle);
                var y = r * Math.sin(angle);
                var queryTarget = this._getNodeQueryTarget(mainSerie, node.data);
                var category = this._getNodeCategory(mainSerie, node.data);
                var color = this.deepQuery(queryTarget, 'itemStyle.normal.color');
                if (!color) {
                    color = category ? this.getColor(category.name) : this.getColor(node.id);
                }
                var iconShape = new IconShape({
                    zlevel: serie.zlevel,
                    z: serie.z + 1,
                    style: {
                        x: -node.layout.size,
                        y: -node.layout.size,
                        width: node.layout.size * 2,
                        height: node.layout.size * 2,
                        iconType: this.deepQuery(queryTarget, 'symbol'),
                        color: color,
                        brushType: 'both',
                        lineWidth: this.deepQuery(queryTarget, 'itemStyle.normal.borderWidth'),
                        strokeColor: this.deepQuery(queryTarget, 'itemStyle.normal.borderColor')
                    },
                    highlightStyle: {
                        color: this.deepQuery(queryTarget, 'itemStyle.emphasis.color'),
                        lineWidth: this.deepQuery(queryTarget, 'itemStyle.emphasis.borderWidth'),
                        strokeColor: this.deepQuery(queryTarget, 'itemStyle.emphasis.borderColor')
                    },
                    clickable: mainSerie.clickable,
                    position: [
                        x + center[0],
                        y + center[1]
                    ]
                });
                ecData.pack(iconShape, serie, serieIdx, node.data, node.rawIndex, node.id, node.category);
                this.shapeList.push(iconShape);
                node.shape = iconShape;
            }, this);
        },
        _buildLabels: function (serie, serieIdx, graph, mainSerie) {
            var rotateLabel = this.query(mainSerie, 'itemStyle.normal.label.rotate');
            var labelDistance = this.query(mainSerie, 'itemStyle.normal.label.distance');
            var center = this.parseCenter(this.zr, mainSerie.center);
            var radius = this.parseRadius(this.zr, mainSerie.radius);
            var clockWise = mainSerie.clockWise;
            var sign = clockWise ? 1 : -1;
            graph.eachNode(function (node) {
                var startAngle = node.layout.startAngle / Math.PI * 180 * sign;
                var endAngle = node.layout.endAngle / Math.PI * 180 * sign;
                var angle = (startAngle * -sign + endAngle * -sign) / 2;
                angle %= 360;
                if (angle < 0) {
                    angle += 360;
                }
                var isRightSide = angle <= 90="" ||="" angle="">= 270;
                angle = angle * Math.PI / 180;
                var v = [
                    Math.cos(angle),
                    -Math.sin(angle)
                ];
                var distance = 0;
                if (mainSerie.ribbonType) {
                    distance = mainSerie.showScaleText ? 35 + labelDistance : labelDistance;
                } else {
                    distance = labelDistance + node.layout.size;
                }
                var start = vec2.scale([], v, radius[1] + distance);
                vec2.add(start, start, center);
                var labelShape = {
                    zlevel: serie.zlevel,
                    z: serie.z + 1,
                    hoverable: false,
                    style: {
                        text: node.data.label == null ? node.id : node.data.label,
                        textAlign: isRightSide ? 'left' : 'right'
                    }
                };
                if (rotateLabel) {
                    labelShape.rotation = isRightSide ? angle : Math.PI + angle;
                    if (isRightSide) {
                        labelShape.style.x = radius[1] + distance;
                    } else {
                        labelShape.style.x = -radius[1] - distance;
                    }
                    labelShape.style.y = 0;
                    labelShape.position = center.slice();
                } else {
                    labelShape.style.x = start[0];
                    labelShape.style.y = start[1];
                }
                labelShape.style.color = this.deepQuery([
                    node.data,
                    mainSerie
                ], 'itemStyle.normal.label.textStyle.color') || '#000000';
                labelShape.style.textFont = this.getFont(this.deepQuery([
                    node.data,
                    mainSerie
                ], 'itemStyle.normal.label.textStyle'));
                labelShape = new TextShape(labelShape);
                this.shapeList.push(labelShape);
                node.labelShape = labelShape;
            }, this);
        },
        _buildRibbons: function (series, serieIdx, graph, mainSerie) {
            var serie = series[serieIdx];
            var center = this.parseCenter(this.zr, mainSerie.center);
            var radius = this.parseRadius(this.zr, mainSerie.radius);
            graph.eachEdge(function (edge, idx) {
                var color;
                var other = graph.getEdge(edge.node2, edge.node1);
                if (!other || edge.shape) {
                    return;
                }
                if (other.shape) {
                    edge.shape = other.shape;
                    return;
                }
                var s0 = edge.layout.startAngle / Math.PI * 180;
                var s1 = edge.layout.endAngle / Math.PI * 180;
                var t0 = other.layout.startAngle / Math.PI * 180;
                var t1 = other.layout.endAngle / Math.PI * 180;
                if (series.length === 1) {
                    if (edge.layout.weight <= 1="" other.layout.weight)="" {="" color="this.getColor(edge.node1.id);" }="" else="" var="" querytarget="this._getEdgeQueryTarget(serie," edge.data);="" querytargetemphasis="this._getEdgeQueryTarget(serie," edge.data,="" 'emphasis');="" ribbon="new" ribbonshape({="" zlevel:="" serie.zlevel,="" z:="" serie.z,="" style:="" x:="" center[0],="" y:="" center[1],="" r:="" radius[0],="" source0:="" s0,="" source1:="" s1,="" target0:="" t0,="" target1:="" t1,="" brushtype:="" 'both',="" opacity:="" this.deepquery(querytarget,="" 'opacity'),="" color:="" color,="" linewidth:="" 'borderwidth'),="" strokecolor:="" 'bordercolor'),="" clockwise:="" mainserie.clockwise="" },="" clickable:="" mainserie.clickable,="" highlightstyle:="" this.deepquery(querytargetemphasis,="" 'bordercolor')="" });="" node1,="" node2;="" if="" (edge.layout.weight="" <="other.layout.weight)" node1="other.node1;" node2="other.node2;" ecdata.pack(ribbon,="" serie,="" serieidx,="" edge.rawindex="=" null="" ?="" idx="" :="" edge.rawindex,="" edge.data.name="" ||="" node1.id="" +="" '-'="" node2.id,="" node1.id,="" node2.id);="" this.shapelist.push(ribbon);="" edge.shape="ribbon;" this);="" _buildedgecurves:="" function="" (series,="" graph,="" mainserie,="" maingraph)="" serie="series[serieIdx];" center="this.parseCenter(this.zr," mainserie.center);="" graph.eachedge(function="" (e,="" idx)="" shape1="node1.shape;" shape2="node2.shape;" e.data);="" e.data,="" curveshape="new" beziercurveshape({="" xstart:="" shape1.position[0],="" ystart:="" shape1.position[1],="" xend:="" shape2.position[0],="" yend:="" shape2.position[1],="" cpx1:="" cpy1:="" 'width'),="" 'color'),="" 'opacity')="" ecdata.pack(curveshape,="" e.rawindex="=" e.rawindex,="" e.data.name="" e.node1.id="" e.node2.id,="" e.node1.id,="" e.node2.id);="" this.shapelist.push(curveshape);="" e.shape="curveShape;" _buildscales:="" (serie,="" graph)="" clockwise="serie.clockWise;" serie.center);="" radius="this.parseRadius(this.zr," serie.radius);="" sign="clockWise" -1;="" sumvalue="0;" maxvalue="-Infinity;" unitpostfix;="" unitscale;="" (serie.showscaletext)="" graph.eachnode(function="" (node)="" val="node.data.value;" (val=""> maxValue) {
                        maxValue = val;
                    }
                    sumValue += val;
                });
                if (maxValue > 10000000000) {
                    unitPostfix = 'b';
                    unitScale = 1e-9;
                } else if (maxValue > 10000000) {
                    unitPostfix = 'm';
                    unitScale = 0.000001;
                } else if (maxValue > 10000) {
                    unitPostfix = 'k';
                    unitScale = 0.001;
                } else {
                    unitPostfix = '';
                    unitScale = 1;
                }
            }
            var unitValue = sumValue / (360 - serie.padding);
            graph.eachNode(function (node) {
                var startAngle = node.layout.startAngle / Math.PI * 180;
                var endAngle = node.layout.endAngle / Math.PI * 180;
                var scaleAngle = startAngle;
                while (true) {
                    if (clockWise && scaleAngle > endAngle || !clockWise && scaleAngle < endAngle) {
                        break;
                    }
                    var theta = scaleAngle / 180 * Math.PI;
                    var v = [
                        Math.cos(theta),
                        Math.sin(theta)
                    ];
                    var start = vec2.scale([], v, radius[1] + 1);
                    vec2.add(start, start, center);
                    var end = vec2.scale([], v, radius[1] + this.scaleLineLength);
                    vec2.add(end, end, center);
                    var scaleShape = new LineShape({
                        zlevel: serie.zlevel,
                        z: serie.z - 1,
                        hoverable: false,
                        style: {
                            xStart: start[0],
                            yStart: start[1],
                            xEnd: end[0],
                            yEnd: end[1],
                            lineCap: 'round',
                            brushType: 'stroke',
                            strokeColor: '#666',
                            lineWidth: 1
                        }
                    });
                    this.shapeList.push(scaleShape);
                    scaleAngle += sign * this.scaleUnitAngle;
                }
                if (!serie.showScaleText) {
                    return;
                }
                var scaleTextAngle = startAngle;
                var step = unitValue * 5 * this.scaleUnitAngle;
                var scaleValue = 0;
                while (true) {
                    if (clockWise && scaleTextAngle > endAngle || !clockWise && scaleTextAngle < endAngle) {
                        break;
                    }
                    var theta = scaleTextAngle;
                    theta = theta % 360;
                    if (theta < 0) {
                        theta += 360;
                    }
                    var isRightSide = theta <= 90="" ||="" theta="">= 270;
                    var textShape = new TextShape({
                        zlevel: serie.zlevel,
                        z: serie.z - 1,
                        hoverable: false,
                        style: {
                            x: isRightSide ? radius[1] + this.scaleLineLength + 4 : -radius[1] - this.scaleLineLength - 4,
                            y: 0,
                            text: Math.round(scaleValue * 10) / 10 + unitPostfix,
                            textAlign: isRightSide ? 'left' : 'right'
                        },
                        position: center.slice(),
                        rotation: isRightSide ? [
                            -theta / 180 * Math.PI,
                            0,
                            0
                        ] : [
                            -(theta + 180) / 180 * Math.PI,
                            0,
                            0
                        ]
                    });
                    this.shapeList.push(textShape);
                    scaleValue += step * unitScale;
                    scaleTextAngle += sign * this.scaleUnitAngle * 5;
                }
            }, this);
        },
        refresh: function (newOption) {
            if (newOption) {
                this.option = newOption;
                this.series = newOption.series;
            }
            this.legend = this.component.legend;
            if (this.legend) {
                this.getColor = function (param) {
                    return this.legend.getColor(param);
                };
                this.isSelected = function (param) {
                    return this.legend.isSelected(param);
                };
            } else {
                var colorMap = {};
                var count = 0;
                this.getColor = function (key) {
                    if (colorMap[key]) {
                        return colorMap[key];
                    }
                    if (!colorMap[key]) {
                        colorMap[key] = this.zr.getColor(count++);
                    }
                    return colorMap[key];
                };
                this.isSelected = function () {
                    return true;
                };
            }
            this.backupShapeList();
            this._init();
        },
        reformOption: function (opt) {
            var _merge = zrUtil.merge;
            opt = _merge(_merge(opt || {}, this.ecTheme.chord), ecConfig.chord);
            opt.itemStyle.normal.label.textStyle = this.getTextStyle(opt.itemStyle.normal.label.textStyle);
            this.z = opt.z;
            this.zlevel = opt.zlevel;
        }
    };
    zrUtil.inherits(Chord, ChartBase);
    require('../chart').define('chord', Chord);
    return Chord;
});define('echarts/util/shape/Ribbon', [
    'require',
    'zrender/shape/Base',
    'zrender/shape/util/PathProxy',
    'zrender/tool/util',
    'zrender/tool/area'
], function (require) {
    var Base = require('zrender/shape/Base');
    var PathProxy = require('zrender/shape/util/PathProxy');
    var zrUtil = require('zrender/tool/util');
    var area = require('zrender/tool/area');
    function RibbonShape(options) {
        Base.call(this, options);
        this._pathProxy = new PathProxy();
    }
    RibbonShape.prototype = {
        type: 'ribbon',
        buildPath: function (ctx, style) {
            var clockWise = style.clockWise || false;
            var path = this._pathProxy;
            path.begin(ctx);
            var cx = style.x;
            var cy = style.y;
            var r = style.r;
            var s0 = style.source0 / 180 * Math.PI;
            var s1 = style.source1 / 180 * Math.PI;
            var t0 = style.target0 / 180 * Math.PI;
            var t1 = style.target1 / 180 * Math.PI;
            var sx0 = cx + Math.cos(s0) * r;
            var sy0 = cy + Math.sin(s0) * r;
            var sx1 = cx + Math.cos(s1) * r;
            var sy1 = cy + Math.sin(s1) * r;
            var tx0 = cx + Math.cos(t0) * r;
            var ty0 = cy + Math.sin(t0) * r;
            var tx1 = cx + Math.cos(t1) * r;
            var ty1 = cy + Math.sin(t1) * r;
            path.moveTo(sx0, sy0);
            path.arc(cx, cy, style.r, s0, s1, !clockWise);
            path.bezierCurveTo((cx - sx1) * 0.7 + sx1, (cy - sy1) * 0.7 + sy1, (cx - tx0) * 0.7 + tx0, (cy - ty0) * 0.7 + ty0, tx0, ty0);
            if (style.source0 === style.target0 && style.source1 === style.target1) {
                return;
            }
            path.arc(cx, cy, style.r, t0, t1, !clockWise);
            path.bezierCurveTo((cx - tx1) * 0.7 + tx1, (cy - ty1) * 0.7 + ty1, (cx - sx0) * 0.7 + sx0, (cy - sy0) * 0.7 + sy0, sx0, sy0);
        },
        getRect: function (style) {
            if (style.__rect) {
                return style.__rect;
            }
            if (!this._pathProxy.isEmpty()) {
                this.buildPath(null, style);
            }
            return this._pathProxy.fastBoundingRect();
        },
        isCover: function (x, y) {
            var rect = this.getRect(this.style);
            if (x >= rect.x && x <= rect.x="" +="" rect.width="" &&="" y="">= rect.y && y </=></=></=></=>