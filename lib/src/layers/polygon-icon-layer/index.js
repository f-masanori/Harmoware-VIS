var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { CompositeLayer, PolygonLayer } from 'deck.gl';
import { COLOR1 } from '../../constants/settings';
var rightAngleRange = function (v) { return v < 0 ? 0 : v >= 90 ? 89 : v; };
var PolygonIconLayer = /** @class */ (function (_super) {
    __extends(PolygonIconLayer, _super);
    function PolygonIconLayer(props) {
        return _super.call(this, props) || this;
    }
    PolygonIconLayer.prototype.renderLayers = function () {
        var _a = this.props, id = _a.id, data = _a.data, pickable = _a.pickable, stroked = _a.stroked, extruded = _a.extruded, filled = _a.filled, wireframe = _a.wireframe, opacity = _a.opacity, lineWidthMinPixels = _a.lineWidthMinPixels, cellSize = _a.cellSize, getPosition = _a.getPosition, getElevation = _a.getElevation, getColor = _a.getColor, getLineWidth = _a.getLineWidth, getVertexAngle = _a.getVertexAngle, lightSettings = _a.lightSettings;
        if (!data || data.length === 0) {
            return null;
        }
        var _b = this.context.viewport.distanceScales, degreesPerPixel = _b.degreesPerPixel, pixelsPerMeter = _b.pixelsPerMeter;
        var degreesMeter = [degreesPerPixel[0] * pixelsPerMeter[0], degreesPerPixel[1] * pixelsPerMeter[1]];
        var radius = degreesMeter[0] * (cellSize / 2);
        var radMulti = Math.PI / 180;
        var polygonData = data.map(function (item) {
            var position = getPosition(item);
            var vertexAngle = rightAngleRange(getVertexAngle(item));
            var direction = item.direction >= 0 ? item.direction : (item.direction + 360);
            var radian = [(direction + vertexAngle) * radMulti,
                (direction + (180 - vertexAngle)) * radMulti];
            var shift1 = [
                radius * Math.sin(radian[0]), radius * Math.cos(radian[0])
            ];
            var shift2 = [
                radius * Math.sin(radian[1]), radius * Math.cos(radian[1])
            ];
            var frontRight = [
                position[0] + shift1[0], position[1] + shift1[1], position[2]
            ];
            var frontLeft = [
                position[0] - shift2[0], position[1] - shift2[1], position[2]
            ];
            var rearLeft = [
                position[0] - shift1[0], position[1] - shift1[1], position[2]
            ];
            var rearRight = [
                position[0] + shift2[0], position[1] + shift2[1], position[2]
            ];
            return Object.assign({}, item, { polygon: [frontRight, frontLeft, rearLeft, rearRight, frontRight] });
        });
        var getPolygon = function (x) { return x.polygon; };
        return [
            new PolygonLayer({
                id: id,
                data: polygonData,
                pickable: pickable,
                stroked: stroked,
                extruded: extruded,
                filled: filled,
                wireframe: wireframe,
                opacity: opacity,
                lineWidthMinPixels: lineWidthMinPixels,
                getPolygon: getPolygon,
                getElevation: getElevation,
                getFillColor: getColor,
                getLineColor: getColor,
                getLineWidth: getLineWidth,
                lightSettings: lightSettings,
            }),
        ];
    };
    PolygonIconLayer.defaultProps = {
        filled: true,
        stroked: false,
        pickable: false,
        extruded: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        cellSize: 50,
        getPosition: function (x) { return x.position; },
        getElevation: 20,
        getColor: COLOR1,
        getLineWidth: 1,
        getVertexAngle: function () { return 25; },
        lightSettings: {}
    };
    PolygonIconLayer.layerName = 'PolygonIconLayer';
    return PolygonIconLayer;
}(CompositeLayer));
export default PolygonIconLayer;
//# sourceMappingURL=index.js.map