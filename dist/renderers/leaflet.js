(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.leaflet = {}));
})(this, (function (exports) { 'use strict';

  function t(){return t=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)({}).hasOwnProperty.call(i,o)&&(t[o]=i[o]);}return t},t.apply(null,arguments)}function e(t,e=9){const i=Math.pow(10,e);return Math.round(t*i)/i}const i$1=(t,e)=>{const{x:i,y:o}=t,{x:r,y:s}=e,n=r-i,a=s-o;return Math.sqrt(a*a+n*n)};class o{constructor({name:t,callback:e,unregister:i,register:o}){this.name=void 0,this.callback=void 0,this.registered=!1,this.register=void 0,this.unregister=void 0,this.name=t,this.register=()=>{this.registered||(this.registered=!0,o(e));},this.unregister=()=>{this.register&&(this.registered=!1,i(e));},this.callback=e;}}class r{constructor(t){this._minPixelDragDistance=void 0,this._minPixelDragDistanceDrawing=void 0,this._minPixelDragDistanceSelecting=void 0,this._lastDrawEvent=void 0,this._coordinatePrecision=void 0,this._heldKeys=new Set,this._listeners=[],this._dragState="not-dragging",this._currentModeCallbacks=void 0,this._minPixelDragDistance="number"==typeof t.minPixelDragDistance?t.minPixelDragDistance:1,this._minPixelDragDistanceSelecting="number"==typeof t.minPixelDragDistanceSelecting?t.minPixelDragDistanceSelecting:1,this._minPixelDragDistanceDrawing="number"==typeof t.minPixelDragDistanceDrawing?t.minPixelDragDistanceDrawing:8,this._coordinatePrecision="number"==typeof t.coordinatePrecision?t.coordinatePrecision:9;}getButton(t){return -1===t.button?"neither":0===t.button?"left":1===t.button?"middle":2===t.button?"right":"neither"}getMapElementXYPosition(t){const e=this.getMapEventElement(),{left:i,top:o}=e.getBoundingClientRect();return {containerX:t.clientX-i,containerY:t.clientY-o}}getDrawEventFromEvent(t){const i=this.getLngLatFromEvent(t);if(!i)return null;const{lng:o,lat:r}=i,{containerX:s,containerY:n}=this.getMapElementXYPosition(t),a=this.getButton(t),l=Array.from(this._heldKeys);return {lng:e(o,this._coordinatePrecision),lat:e(r,this._coordinatePrecision),containerX:s,containerY:n,button:a,heldKeys:l}}register(t){this._currentModeCallbacks=t,this._listeners=this.getAdapterListeners(),this._listeners.forEach(t=>{t.register();});}getCoordinatePrecision(){return this._coordinatePrecision}getAdapterListeners(){return [new o({name:"pointerdown",callback:t=>{if(!this._currentModeCallbacks)return;if(!t.isPrimary)return;const e=this.getDrawEventFromEvent(t);e&&(this._dragState="pre-dragging",this._lastDrawEvent=e);},register:t=>{this.getMapEventElement().addEventListener("pointerdown",t);},unregister:t=>{this.getMapEventElement().removeEventListener("pointerdown",t);}}),new o({name:"pointermove",callback:t=>{if(!this._currentModeCallbacks)return;if(!t.isPrimary)return;t.preventDefault();const e=this.getDrawEventFromEvent(t);if(e)if("not-dragging"===this._dragState)this._currentModeCallbacks.onMouseMove(e),this._lastDrawEvent=e;else if("pre-dragging"===this._dragState){if(!this._lastDrawEvent)return;const t={x:this._lastDrawEvent.containerX,y:this._lastDrawEvent.containerY},o={x:e.containerX,y:e.containerY},r=this._currentModeCallbacks.getState(),s=i$1(t,o);let n=!1;if(n="drawing"===r?s<this._minPixelDragDistanceDrawing:"selecting"===r?s<this._minPixelDragDistanceSelecting:s<this._minPixelDragDistance,n)return;this._dragState="dragging",this._currentModeCallbacks.onDragStart(e,t=>{this.setDraggability.bind(this)(t);});}else "dragging"===this._dragState&&this._currentModeCallbacks.onDrag(e,t=>{this.setDraggability.bind(this)(t);});},register:t=>{this.getMapEventElement().addEventListener("pointermove",t);},unregister:t=>{this.getMapEventElement().removeEventListener("pointermove",t);}}),new o({name:"contextmenu",callback:t=>{this._currentModeCallbacks&&t.preventDefault();},register:t=>{this.getMapEventElement().addEventListener("contextmenu",t);},unregister:t=>{this.getMapEventElement().removeEventListener("contextmenu",t);}}),new o({name:"pointerup",callback:t=>{if(!this._currentModeCallbacks)return;if(t.target!==this.getMapEventElement())return;if(!t.isPrimary)return;const e=this.getDrawEventFromEvent(t);e&&("dragging"===this._dragState?this._currentModeCallbacks.onDragEnd(e,t=>{this.setDraggability.bind(this)(t);}):"not-dragging"!==this._dragState&&"pre-dragging"!==this._dragState||this._currentModeCallbacks.onClick(e),this._dragState="not-dragging",this.setDraggability(!0));},register:t=>{this.getMapEventElement().addEventListener("pointerup",t);},unregister:t=>{this.getMapEventElement().removeEventListener("pointerup",t);}}),new o({name:"keyup",callback:t=>{this._currentModeCallbacks&&(this._heldKeys.delete(t.key),this._currentModeCallbacks.onKeyUp({key:t.key,heldKeys:Array.from(this._heldKeys),preventDefault:()=>t.preventDefault()}));},register:t=>{this.getMapEventElement().addEventListener("keyup",t);},unregister:t=>{this.getMapEventElement().removeEventListener("keyup",t);}}),new o({name:"keydown",callback:t=>{this._currentModeCallbacks&&(this._heldKeys.add(t.key),this._currentModeCallbacks.onKeyDown({key:t.key,heldKeys:Array.from(this._heldKeys),preventDefault:()=>t.preventDefault()}));},register:t=>{this.getMapEventElement().addEventListener("keydown",t);},unregister:t=>{this.getMapEventElement().removeEventListener("keydown",t);}})]}unregister(){this._listeners.forEach(t=>{t.unregister();}),this.clear();}}class n extends r{constructor(t){super(t),this._lib=void 0,this._map=void 0,this._panes={},this._container=void 0,this._layers={},this._lib=t.lib,this._map=t.map,this._container=this._map.getContainer();}createPaneStyleSheet(t,e){const i=document.createElement("style");return i.innerHTML=`.leaflet-${t}-pane {z-index: ${e+600}`,document.getElementsByTagName("head")[0].appendChild(i),this._map.createPane(t),i}clearPanes(){Object.values(this._panes).forEach(t=>{t&&t.remove();}),this._panes={};}clearLayers(){Object.values(this._layers).forEach(t=>{this._map.removeLayer(t);}),this._layers={};}styleGeoJSONLayer(t){return {pointToLayer:(e,i)=>{if(!e.properties)throw new Error("Feature has no properties");if("string"!=typeof e.properties.mode)throw new Error("Feature mode is not a string");const o=(0, t[e.properties.mode])(e),r=String(o.zIndex);return this._panes[r]||(this._panes[r]=this.createPaneStyleSheet(r,o.zIndex)),this._lib.circleMarker(i,{radius:o.pointWidth,stroke:o.pointOutlineWidth||!1,color:o.pointOutlineColor,weight:o.pointOutlineWidth,fillOpacity:.8,fillColor:o.pointColor,pane:r,interactive:!1})},style:e=>{if(!e||!e.properties)return {};const i=e,o=(0, t[i.properties.mode])(i),r=String(o.zIndex);return this._panes[r]||(this._panes[r]=this.createPaneStyleSheet(r,o.zIndex)),"LineString"===i.geometry.type?{interactive:!1,color:o.lineStringColor,weight:o.lineStringWidth,pane:r}:"Polygon"===i.geometry.type?{interactive:!1,fillOpacity:o.polygonFillOpacity,fillColor:o.polygonFillColor,weight:o.polygonOutlineWidth,stroke:!0,color:o.polygonFillColor,pane:r}:{}}}}getLngLatFromEvent(t){const{containerX:e,containerY:i}=this.getMapElementXYPosition(t),o=this._map.containerPointToLatLng({x:e,y:i});return null===o.lng||isNaN(o.lng)||null===o.lat||isNaN(o.lat)?null:{lng:o.lng,lat:o.lat}}getMapEventElement(){return this._container}setDraggability(t){t?this._map.dragging.enable():this._map.dragging.disable();}project(t,e){const{x:i,y:o}=this._map.latLngToContainerPoint({lng:t,lat:e});return {x:i,y:o}}unproject(t,e){const{lng:i,lat:o}=this._map.containerPointToLatLng({x:t,y:e});return {lng:i,lat:o}}setCursor(t){"unset"===t?this.getMapEventElement().style.removeProperty("cursor"):this.getMapEventElement().style.cursor=t;}setDoubleClickToZoom(t){t?this._map.doubleClickZoom.enable():this._map.doubleClickZoom.disable();}render(t,e){t.created.forEach(t=>{this._layers[t.id]=this._lib.geoJSON(t,this.styleGeoJSONLayer(e)),this._map.addLayer(this._layers[t.id]);}),t.deletedIds.forEach(t=>{this._map.removeLayer(this._layers[t]);}),t.updated.forEach(t=>{this._map.removeLayer(this._layers[t.id]),this._layers[t.id]=this._lib.geoJSON(t,this.styleGeoJSONLayer(e)),this._map.addLayer(this._layers[t.id]);});}clear(){this._currentModeCallbacks&&(this._currentModeCallbacks.onClear(),this.clearLayers(),this.clearPanes());}register(t){super.register(t),this._currentModeCallbacks&&this._currentModeCallbacks.onReady&&this._currentModeCallbacks.onReady();}getCoordinatePrecision(){return super.getCoordinatePrecision()}unregister(){return super.unregister()}}const h={radians:6370997/(2*Math.PI),degrees:2*Math.PI*6370997/360,ft:.3048,m:1,"us-ft":1200/3937};var c=class{constructor(t){this.code_=t.code,this.units_=t.units,this.extent_=void 0!==t.extent?t.extent:null,this.worldExtent_=void 0!==t.worldExtent?t.worldExtent:null,this.axisOrientation_=void 0!==t.axisOrientation?t.axisOrientation:"enu",this.global_=void 0!==t.global&&t.global,this.canWrapX_=!(!this.global_||!this.extent_),this.getPointResolutionFunc_=t.getPointResolution,this.defaultTileGrid_=null,this.metersPerUnit_=t.metersPerUnit;}canWrapX(){return this.canWrapX_}getCode(){return this.code_}getExtent(){return this.extent_}getUnits(){return this.units_}getMetersPerUnit(){return this.metersPerUnit_||h[this.units_]}getWorldExtent(){return this.worldExtent_}getAxisOrientation(){return this.axisOrientation_}isGlobal(){return this.global_}setGlobal(t){this.global_=t,this.canWrapX_=!(!t||!this.extent_);}getDefaultTileGrid(){return this.defaultTileGrid_}setDefaultTileGrid(t){this.defaultTileGrid_=t;}setExtent(t){this.extent_=t,this.canWrapX_=!(!this.global_||!t);}setWorldExtent(t){this.worldExtent_=t;}setGetPointResolution(t){this.getPointResolutionFunc_=t;}getPointResolutionFunc(){return this.getPointResolutionFunc_}};const d=6378137,u=Math.PI*d,g=[-u,-u,u,u],p=[-180,-85,180,85],y=d*Math.log(Math.tan(Math.PI/2));class m extends c{constructor(t){super({code:t,units:"m",extent:g,global:!0,worldExtent:p,getPointResolution:function(t,e){return t/Math.cosh(e[1]/d)}});}}const f=[new m("EPSG:3857"),new m("EPSG:102100"),new m("EPSG:102113"),new m("EPSG:900913"),new m("http://www.opengis.net/def/crs/EPSG/0/3857"),new m("http://www.opengis.net/gml/srs/epsg.xml#3857")],C=[-180,-90,180,90],v=6378137*Math.PI/180;class P extends c{constructor(t,e){super({code:t,units:"degrees",extent:C,axisOrientation:e,global:!0,metersPerUnit:v,worldExtent:C});}}const _=[new P("CRS:84"),new P("EPSG:4326","neu"),new P("urn:ogc:def:crs:OGC:1.3:CRS84"),new P("urn:ogc:def:crs:OGC:2:84"),new P("http://www.opengis.net/def/crs/OGC/1.3/CRS84"),new P("http://www.opengis.net/gml/srs/epsg.xml#4326","neu"),new P("http://www.opengis.net/def/crs/EPSG/0/4326","neu")];let M={};function b(t,e,i){const o=t.getCode(),r=e.getCode();o in M||(M[o]={}),M[o][r]=i;}function S(t,e){if(void 0!==e)for(let i=0,o=t.length;i<o;++i)e[i]=t[i];else e=t.slice();return e}function w(t){!function(t,e){}(t.getCode()),b(t,t,S);}function F(t){!function(t){t.forEach(w);}(t),t.forEach(function(e){t.forEach(function(t){e!==t&&b(e,t,S);});});}var k,O,j,L$2;F(f),F(_),k=f,O=function(t,e,i){const o=t.length;i=i>1?i:2,void 0===e&&(e=i>2?t.slice():new Array(o));for(let r=0;r<o;r+=i){e[r]=u*t[r]/180;let i=d*Math.log(Math.tan(Math.PI*(+t[r+1]+90)/360));i>y?i=y:i<-y&&(i=-y),e[r+1]=i;}return e},j=function(t,e,i){const o=t.length;i=i>1?i:2,void 0===e&&(e=i>2?t.slice():new Array(o));for(let r=0;r<o;r+=i)e[r]=180*t[r]/u,e[r+1]=360*Math.atan(Math.exp(t[r+1]/d))/Math.PI-90;return e},_.forEach(function(t){k.forEach(function(e){b(t,e,O),b(e,t,j);});});!function(t){t.Commit="commit",t.Provisional="provisional",t.Finish="finish";}(L$2||(L$2={}));const G="selected",N="midPoint",V="closingPoint";function A(t){return Boolean(t&&"object"==typeof t&&null!==t&&!Array.isArray(t))}function R(t){if(!function(t){return "number"==typeof t&&!isNaN(new Date(t).valueOf())}(t))throw new Error("updatedAt and createdAt are not valid timestamps");return !0}var T;!function(t){t.Drawing="drawing",t.Select="select",t.Static="static",t.Render="render";}(T||(T={}));class X{get state(){return this._state}set state(t){throw new Error("Please use the modes lifecycle methods")}get styles(){return this._styles}set styles(t){if("object"!=typeof t)throw new Error("Styling must be an object");this.onStyleChange([],"styling"),this._styles=t;}registerBehaviors(t){}constructor(e){this._state=void 0,this._styles=void 0,this.behaviors=[],this.validate=void 0,this.pointerDistance=void 0,this.coordinatePrecision=void 0,this.onStyleChange=void 0,this.store=void 0,this.setDoubleClickToZoom=void 0,this.unproject=void 0,this.project=void 0,this.setCursor=void 0,this.projection=void 0,this.type=T.Drawing,this.mode="base",this._state="unregistered",this._styles=e&&e.styles?t({},e.styles):{},this.pointerDistance=e&&e.pointerDistance||40,this.validate=e&&e.validation,this.projection=e&&e.projection||"web-mercator";}setDrawing(){if("started"!==this._state)throw new Error("Mode must be unregistered or stopped to start");this._state="drawing";}setStarted(){if("stopped"!==this._state&&"registered"!==this._state&&"drawing"!==this._state&&"selecting"!==this._state)throw new Error("Mode must be unregistered or stopped to start");this._state="started",this.setDoubleClickToZoom(!1);}setStopped(){if("started"!==this._state)throw new Error("Mode must be started to be stopped");this._state="stopped",this.setDoubleClickToZoom(!0);}register(t){if("unregistered"!==this._state)throw new Error("Can not register unless mode is unregistered");this._state="registered",this.store=t.store,this.store.registerOnChange(t.onChange),this.setDoubleClickToZoom=t.setDoubleClickToZoom,this.project=t.project,this.unproject=t.unproject,this.onSelect=t.onSelect,this.onDeselect=t.onDeselect,this.setCursor=t.setCursor,this.onStyleChange=t.onChange,this.onFinish=t.onFinish,this.coordinatePrecision=t.coordinatePrecision,this.registerBehaviors({mode:t.mode,store:this.store,project:this.project,unproject:this.unproject,pointerDistance:this.pointerDistance,coordinatePrecision:t.coordinatePrecision,projection:this.projection});}validateFeature(t){if("unregistered"===this._state)throw new Error("Mode must be registered");const e=function(t,e){let i;if(A(t))if(null==t.id)i="Feature has no id";else if("string"!=typeof t.id&&"number"!=typeof t.id)i="Feature must be string or number as per GeoJSON spec";else if(e(t.id))if(A(t.geometry))if(A(t.properties))if("string"==typeof t.geometry.type&&["Polygon","LineString","Point"].includes(t.geometry.type))if(Array.isArray(t.geometry.coordinates)){if(!t.properties.mode||"string"!=typeof t.properties.mode)throw new Error("Feature does not have a valid mode property")}else i="Feature coordinates is not an array";else i="Feature is not Point, LineString or Polygon";else i="Feature has no properties";else i="Feature has no geometry";else i="Feature must match the id strategy (default is UUID4)";else i="Feature is not object";if(i)throw new Error(i);return !0}(t,this.store.idStrategy.isValidId);return this.validate?this.validate(t,{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:L$2.Provisional}):e}onFinish(t,e){}onDeselect(t){}onSelect(t){}onKeyDown(t){}onKeyUp(t){}onMouseMove(t){}onClick(t){}onDragStart(t,e){}onDrag(t,e){}onDragEnd(t,e){}getHexColorStylingValue(t,e,i){return this.getStylingValue(t,e,i)}getNumericStylingValue(t,e,i){return this.getStylingValue(t,e,i)}getStylingValue(t,e,i){return void 0===t?e:"function"==typeof t?t(i):t}}class U extends X{constructor(...t){super(...t),this.type=T.Select;}}function Y(t,e){const i=t=>t*Math.PI/180,o=i(t[1]),r=i(t[0]),s=i(e[1]),n=s-o,a=i(e[0])-r,l=Math.sin(n/2)*Math.sin(n/2)+Math.cos(o)*Math.cos(s)*Math.sin(a/2)*Math.sin(a/2);return 2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l))*6371e3/1e3}const K=6371008.8;function z(t){return t%360*Math.PI/180}function H(t){return t/(K/1e3)}function $(t){return t%(2*Math.PI)*180/Math.PI}const J=57.29577951308232,Z=.017453292519943295,q=6378137,Q=(t,e)=>({x:0===t?0:t*Z*q,y:0===e?0:Math.log(Math.tan(Math.PI/4+e*Z/2))*q}),tt=(t,e)=>({lng:0===t?0:J*(t/q),lat:0===e?0:(2*Math.atan(Math.exp(e/q))-Math.PI/2)*J});function et(t,e,i){const o=z(t[0]),r=z(t[1]),s=z(i),n=H(e),a=Math.asin(Math.sin(r)*Math.cos(n)+Math.cos(r)*Math.sin(n)*Math.cos(s));return [$(o+Math.atan2(Math.sin(s)*Math.sin(n)*Math.cos(r),Math.cos(n)-Math.sin(r)*Math.sin(a))),$(a)]}function it(t){const{center:i,radiusKilometers:o,coordinatePrecision:r}=t,s=t.steps?t.steps:64,n=[];for(let t=0;t<s;t++){const a=et(i,o,-360*t/s);n.push([e(a[0],r),e(a[1],r)]);}return n.push(n[0]),{type:"Feature",geometry:{type:"Polygon",coordinates:[n]},properties:{}}}function ot(t){const e={epsilon:0};let i;if("Polygon"===t.geometry.type)i=t.geometry.coordinates;else {if("LineString"!==t.geometry.type)throw new Error("Self intersects only accepts Polygons and LineStrings");i=[t.geometry.coordinates];}const o=[];for(let t=0;t<i.length;t++)for(let e=0;e<i[t].length-1;e++)for(let o=0;o<i.length;o++)for(let r=0;r<i[o].length-1;r++)s(t,e,o,r);return o.length>0;function r(t){return t<0-e.epsilon||t>1+e.epsilon}function s(t,e,s,n){const a=i[t][e],l=i[t][e+1],h=i[s][n],c=i[s][n+1],d=function(t,e,i,o){if(rt(t,i)||rt(t,o)||rt(e,i)||rt(o,i))return null;const r=t[0],s=t[1],n=e[0],a=e[1],l=i[0],h=i[1],c=o[0],d=o[1],u=(r-n)*(h-d)-(s-a)*(l-c);return 0===u?null:[((r*a-s*n)*(l-c)-(r-n)*(l*d-h*c))/u,((r*a-s*n)*(h-d)-(s-a)*(l*d-h*c))/u]}(a,l,h,c);if(null===d)return;let u,g;u=l[0]!==a[0]?(d[0]-a[0])/(l[0]-a[0]):(d[1]-a[1])/(l[1]-a[1]),g=c[0]!==h[0]?(d[0]-h[0])/(c[0]-h[0]):(d[1]-h[1])/(c[1]-h[1]),r(u)||r(g)||(d.toString(),o.push(d));}}function rt(t,e){return t[0]===e[0]&&t[1]===e[1]}function st(t,e){return 2===t.length&&"number"==typeof t[0]&&"number"==typeof t[1]&&Infinity!==t[0]&&Infinity!==t[1]&&(o=t[0])>=-180&&o<=180&&(i=t[1])>=-90&&i<=90&&nt(t[0])<=e&&nt(t[1])<=e;var i,o;}function nt(t){let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function at(t,e){return "Polygon"===t.geometry.type&&1===t.geometry.coordinates.length&&t.geometry.coordinates[0].length>=4&&t.geometry.coordinates[0].every(t=>st(t,e))&&(i=t.geometry.coordinates[0][0])[0]===(o=t.geometry.coordinates[0][t.geometry.coordinates[0].length-1])[0]&&i[1]===o[1];var i,o;}function lt(t,e){return at(t,e)&&!ot(t)}class ht extends X{constructor(e){var i;super(e),this.mode="circle",this.center=void 0,this.clickCount=0,this.currentCircleId=void 0,this.keyEvents=void 0,this.cursors=void 0,this.startingRadiusKilometers=1e-5;const o={start:"crosshair"};if(this.cursors=e&&e.cursors?t({},o,e.cursors):o,null===(null==e?void 0:e.keyEvents))this.keyEvents={cancel:null,finish:null};else {const i={cancel:"Escape",finish:"Enter"};this.keyEvents=e&&e.keyEvents?t({},i,e.keyEvents):i;}this.startingRadiusKilometers=null!=(i=null==e?void 0:e.startingRadiusKilometers)?i:1e-5,this.validate=null==e?void 0:e.validation;}close(){if(void 0===this.currentCircleId)return;const t=this.currentCircleId;if(this.validate&&t){const e=this.store.getGeometryCopy(t);if(!this.validate({type:"Feature",id:t,geometry:e,properties:{}},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:L$2.Finish}))return}this.center=void 0,this.currentCircleId=void 0,this.clickCount=0,"drawing"===this.state&&this.setStarted(),this.onFinish(t,{mode:this.mode,action:"draw"});}start(){this.setStarted(),this.setCursor(this.cursors.start);}stop(){this.cleanUp(),this.setStopped(),this.setCursor("unset");}onClick(t){if(0===this.clickCount){this.center=[t.lng,t.lat];const e=it({center:this.center,radiusKilometers:this.startingRadiusKilometers,coordinatePrecision:this.coordinatePrecision}),[i]=this.store.create([{geometry:e.geometry,properties:{mode:this.mode,radiusKilometers:this.startingRadiusKilometers}}]);this.currentCircleId=i,this.clickCount++,this.setDrawing();}else 1===this.clickCount&&this.center&&void 0!==this.currentCircleId&&this.updateCircle(t),this.close();}onMouseMove(t){this.updateCircle(t);}onKeyDown(){}onKeyUp(t){t.key===this.keyEvents.cancel?this.cleanUp():t.key===this.keyEvents.finish&&this.close();}onDragStart(){}onDrag(){}onDragEnd(){}cleanUp(){const t=this.currentCircleId;this.center=void 0,this.currentCircleId=void 0,this.clickCount=0,"drawing"===this.state&&this.setStarted();try{void 0!==t&&this.store.delete([t]);}catch(t){}}styleFeature(e){const i=t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0});return "Feature"===e.type&&"Polygon"===e.geometry.type&&e.properties.mode===this.mode?(i.polygonFillColor=this.getHexColorStylingValue(this.styles.fillColor,i.polygonFillColor,e),i.polygonOutlineColor=this.getHexColorStylingValue(this.styles.outlineColor,i.polygonOutlineColor,e),i.polygonOutlineWidth=this.getNumericStylingValue(this.styles.outlineWidth,i.polygonOutlineWidth,e),i.polygonFillOpacity=this.getNumericStylingValue(this.styles.fillOpacity,i.polygonFillOpacity,e),i.zIndex=10,i):i}validateFeature(t){return !!super.validateFeature(t)&&t.properties.mode===this.mode&&lt(t,this.coordinatePrecision)}updateCircle(t){if(1===this.clickCount&&this.center&&this.currentCircleId){const i=Y(this.center,[t.lng,t.lat]);let o;if("web-mercator"===this.projection){const r=function(t,e){const i=1e3*Y(t,e);if(0===i)return 1;const{x:o,y:r}=Q(t[0],t[1]),{x:s,y:n}=Q(e[0],e[1]);return Math.sqrt(Math.pow(s-o,2)+Math.pow(n-r,2))/i}(this.center,[t.lng,t.lat]);o=function(t){const{center:i,radiusKilometers:o,coordinatePrecision:r}=t,s=t.steps?t.steps:64,n=1e3*o,[a,l]=i,{x:h,y:c}=Q(a,l),d=[];for(let t=0;t<s;t++){const i=360*t/s*Math.PI/180,o=n*Math.cos(i),a=n*Math.sin(i),[l,u]=[h+o,c+a],{lng:g,lat:p}=tt(l,u);d.push([e(g,r),e(p,r)]);}return d.push(d[0]),{type:"Feature",geometry:{type:"Polygon",coordinates:[d]},properties:{}}}({center:this.center,radiusKilometers:i*r,coordinatePrecision:this.coordinatePrecision});}else {if("globe"!==this.projection)throw new Error("Invalid projection");o=it({center:this.center,radiusKilometers:i,coordinatePrecision:this.coordinatePrecision});}if(this.validate&&!this.validate({type:"Feature",id:this.currentCircleId,geometry:o.geometry,properties:{radiusKilometers:i}},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:L$2.Provisional}))return;this.store.updateGeometry([{id:this.currentCircleId,geometry:o.geometry}]),this.store.updateProperty([{id:this.currentCircleId,property:"radiusKilometers",value:i}]);}}}class dt{constructor({store:t,mode:e,project:i,unproject:o,pointerDistance:r,coordinatePrecision:s,projection:n}){this.store=void 0,this.mode=void 0,this.project=void 0,this.unproject=void 0,this.pointerDistance=void 0,this.coordinatePrecision=void 0,this.projection=void 0,this.store=t,this.mode=e,this.project=i,this.unproject=o,this.pointerDistance=r,this.coordinatePrecision=s,this.projection=n;}}function ut({unproject:t,point:e,pointerDistance:i}){const o=i/2,{x:r,y:s}=e;return {type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:[[t(r-o,s-o),t(r+o,s-o),t(r+o,s+o),t(r-o,s+o),t(r-o,s-o)].map(t=>[t.lng,t.lat])]}}}class gt extends dt{constructor(t){super(t);}create(t){const{containerX:e,containerY:i}=t;return ut({unproject:this.unproject,point:{x:e,y:i},pointerDistance:this.pointerDistance})}}class pt extends dt{constructor(t){super(t);}measure(t,e){const{x:o,y:r}=this.project(e[0],e[1]);return i$1({x:o,y:r},{x:t.containerX,y:t.containerY})}}class yt extends dt{constructor(t,e,i){super(t),this.config=void 0,this.pixelDistance=void 0,this.clickBoundingBox=void 0,this.getSnappableCoordinateFirstClick=t=>this.getSnappable(t,t=>Boolean(t.properties&&t.properties.mode===this.mode)),this.getSnappableCoordinate=(t,e)=>this.getSnappable(t,t=>Boolean(t.properties&&t.properties.mode===this.mode&&t.id!==e)),this.config=t,this.pixelDistance=e,this.clickBoundingBox=i;}getSnappable(t,e){const i=this.clickBoundingBox.create(t),o=this.store.search(i,e),r={coord:void 0,minDist:Infinity};return o.forEach(e=>{let i;if("Polygon"===e.geometry.type)i=e.geometry.coordinates[0];else {if("LineString"!==e.geometry.type)return;i=e.geometry.coordinates;}i.forEach(e=>{const i=this.pixelDistance.measure(t,e);i<r.minDist&&i<this.pointerDistance&&(r.coord=e,r.minDist=i);});}),r.coord}}function mt(t,e,i){const o=z(t[0]),r=z(t[1]),s=z(i),n=H(e),a=Math.asin(Math.sin(r)*Math.cos(n)+Math.cos(r)*Math.sin(n)*Math.cos(s));return [$(o+Math.atan2(Math.sin(s)*Math.sin(n)*Math.cos(r),Math.cos(n)-Math.sin(r)*Math.sin(a))),$(a)]}function Ct(t,e){const i=z(t[0]),o=z(e[0]),r=z(t[1]),s=z(e[1]),n=Math.sin(o-i)*Math.cos(s),a=Math.cos(r)*Math.sin(s)-Math.sin(r)*Math.cos(s)*Math.cos(o-i);return $(Math.atan2(n,a))}function vt({x:t,y:e},{x:i,y:o}){let r=Math.atan2(o-e,i-t);return r*=180/Math.PI,r>180?r-=360:r<-180&&(r+=360),r}function Pt(t,e,i){const o=[],r=t.length;let s,n,a,l=0;for(let r=0;r<t.length&&!(e>=l&&r===t.length-1);r++){if(l>e&&0===o.length){if(s=e-l,!s)return o.push(t[r]),o;n=Ct(t[r],t[r-1])-180,a=mt(t[r],s,n),o.push(a);}if(l>=i)return s=i-l,s?(n=Ct(t[r],t[r-1])-180,a=mt(t[r],s,n),o.push(a),o):(o.push(t[r]),o);if(l>=e&&o.push(t[r]),r===t.length-1)return o;l+=Y(t[r],t[r+1]);}if(l<e&&t.length===r)throw new Error("Start position is beyond line");const h=t[t.length-1];return [h,h]}function _t(t){return t*(Math.PI/180)}function xt(t){return t*(180/Math.PI)}class Mt extends dt{constructor(t){super(t),this.config=void 0,this.config=t;}generateInsertionCoordinates(t,e,i){const o=[t,e];let r=0;for(let t=0;t<o.length-1;t++)r+=Y(o[0],o[1]);if(r<=i)return o;let s=r/i-1;Number.isInteger(s)||(s=Math.floor(s)+1);const n=[];for(let t=0;t<s;t++){const e=Pt(o,i*t,i*(t+1));n.push(e);}const a=[];for(let t=0;t<n.length;t++)a.push(n[t][1]);return this.limitCoordinates(a)}generateInsertionGeodesicCoordinates(t,e,i){const o=Y(t,e),r=function(t,e,i){const o=[],r=_t(t[1]),s=_t(t[0]),n=_t(e[1]),a=_t(e[0]);i+=1;const l=2*Math.asin(Math.sqrt(Math.sin((n-r)/2)**2+Math.cos(r)*Math.cos(n)*Math.sin((a-s)/2)**2));if(0===l||isNaN(l))return o;for(let t=0;t<=i;t++){const e=t/i,h=Math.sin((1-e)*l)/Math.sin(l),c=Math.sin(e*l)/Math.sin(l),d=h*Math.cos(r)*Math.cos(s)+c*Math.cos(n)*Math.cos(a),u=h*Math.cos(r)*Math.sin(s)+c*Math.cos(n)*Math.sin(a),g=h*Math.sin(r)+c*Math.sin(n);if(isNaN(d)||isNaN(u)||isNaN(g))continue;const p=Math.atan2(g,Math.sqrt(d**2+u**2)),y=Math.atan2(u,d);isNaN(p)||isNaN(y)||o.push([xt(y),xt(p)]);}return o.slice(1,-1)}(t,e,Math.floor(o/i));return this.limitCoordinates(r)}limitCoordinates(t){return t.map(t=>[e(t[0],this.config.coordinatePrecision),e(t[1],this.config.coordinatePrecision)])}}function bt(t,e){return t[0]===e[0]&&t[1]===e[1]}class St extends X{constructor(e){super(e),this.mode="linestring",this.currentCoordinate=0,this.currentId=void 0,this.closingPointId=void 0,this.keyEvents=void 0,this.snappingEnabled=void 0,this.cursors=void 0,this.mouseMove=!1,this.insertCoordinates=void 0,this.lastCommitedCoordinates=void 0,this.snapping=void 0,this.insertPoint=void 0;const i={start:"crosshair",close:"pointer"};if(this.cursors=e&&e.cursors?t({},i,e.cursors):i,this.snappingEnabled=!(!e||void 0===e.snapping)&&e.snapping,null===(null==e?void 0:e.keyEvents))this.keyEvents={cancel:null,finish:null};else {const i={cancel:"Escape",finish:"Enter"};this.keyEvents=e&&e.keyEvents?t({},i,e.keyEvents):i;}this.validate=null==e?void 0:e.validation,this.insertCoordinates=null==e?void 0:e.insertCoordinates;}close(){if(void 0===this.currentId)return;const t=this.store.getGeometryCopy(this.currentId);t.coordinates.pop(),this.updateGeometries([...t.coordinates],void 0,L$2.Commit);const e=this.currentId;this.closingPointId&&this.store.delete([this.closingPointId]),this.currentCoordinate=0,this.currentId=void 0,this.closingPointId=void 0,this.lastCommitedCoordinates=void 0,"drawing"===this.state&&this.setStarted(),this.onFinish(e,{mode:this.mode,action:"draw"});}updateGeometries(t,e,i){if(!this.currentId)return;const o={type:"LineString",coordinates:t};if(this.validate&&!this.validate({type:"Feature",geometry:o},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:i}))return;const r=[{id:this.currentId,geometry:o}];this.closingPointId&&e&&r.push({id:this.closingPointId,geometry:{type:"Point",coordinates:e}}),"commit"===i&&(this.lastCommitedCoordinates=o.coordinates),this.store.updateGeometry(r);}generateInsertCoordinates(t,e){if(!this.insertCoordinates||!this.lastCommitedCoordinates)throw new Error("Not able to insert coordinates");if("amount"!==this.insertCoordinates.strategy)throw new Error("Strategy does not exist");const i=Y(t,e)/(this.insertCoordinates.value+1);let o=[];return "globe"===this.projection?o=this.insertPoint.generateInsertionGeodesicCoordinates(t,e,i):"web-mercator"===this.projection&&(o=this.insertPoint.generateInsertionCoordinates(t,e,i)),o}createLine(t){const[e]=this.store.create([{geometry:{type:"LineString",coordinates:[t,t]},properties:{mode:this.mode}}]);this.lastCommitedCoordinates=[t,t],this.currentId=e,this.currentCoordinate++,this.setDrawing();}firstUpdateToLine(t){if(!this.currentId)return;const e=this.store.getGeometryCopy(this.currentId).coordinates,[i]=this.store.create([{geometry:{type:"Point",coordinates:[...t]},properties:{mode:this.mode}}]);this.closingPointId=i,this.setCursor(this.cursors.close);const o=[...e,t];this.updateGeometries(o,void 0,L$2.Commit),this.currentCoordinate++;}updateToLine(t,e){if(!this.currentId)return;const o=this.store.getGeometryCopy(this.currentId).coordinates,[r,s]=this.lastCommitedCoordinates?this.lastCommitedCoordinates[this.lastCommitedCoordinates.length-1]:o[o.length-2],{x:n,y:a}=this.project(r,s);if(i$1({x:n,y:a},{x:e.x,y:e.y})<this.pointerDistance)return void this.close();this.setCursor(this.cursors.close);const l=[...o,t];this.updateGeometries(l,o[o.length-1],L$2.Commit),this.currentCoordinate++;}registerBehaviors(t){this.snapping=new yt(t,new pt(t),new gt(t)),this.insertPoint=new Mt(t);}start(){this.setStarted(),this.setCursor(this.cursors.start);}stop(){this.cleanUp(),this.setStopped(),this.setCursor("unset");}onMouseMove(t){if(this.mouseMove=!0,this.setCursor(this.cursors.start),void 0===this.currentId||0===this.currentCoordinate)return;const e=this.store.getGeometryCopy(this.currentId).coordinates;e.pop();const o=this.snappingEnabled&&this.snapping.getSnappableCoordinate(t,this.currentId)||[t.lng,t.lat];if(this.closingPointId){const[o,r]=e[e.length-1],{x:s,y:n}=this.project(o,r);i$1({x:s,y:n},{x:t.containerX,y:t.containerY})<this.pointerDistance&&this.setCursor(this.cursors.close);}let r=[...e,o];if(this.insertCoordinates&&this.currentId&&this.lastCommitedCoordinates){const t=this.lastCommitedCoordinates[this.lastCommitedCoordinates.length-1],e=o;if(!bt(t,e)){const i=this.generateInsertCoordinates(t,e);r=[...this.lastCommitedCoordinates.slice(0,-1),...i,o];}}this.updateGeometries(r,void 0,L$2.Provisional);}onClick(t){this.currentCoordinate>0&&!this.mouseMove&&this.onMouseMove(t),this.mouseMove=!1;const e=this.currentId&&this.snappingEnabled&&this.snapping.getSnappableCoordinate(t,this.currentId)||[t.lng,t.lat];0===this.currentCoordinate?this.createLine(e):1===this.currentCoordinate&&this.currentId?this.firstUpdateToLine(e):this.currentId&&this.updateToLine(e,{x:t.containerX,y:t.containerY});}onKeyDown(){}onKeyUp(t){t.key===this.keyEvents.cancel&&this.cleanUp(),t.key===this.keyEvents.finish&&this.close();}onDragStart(){}onDrag(){}onDragEnd(){}cleanUp(){const t=this.currentId;this.closingPointId=void 0,this.currentId=void 0,this.currentCoordinate=0,"drawing"===this.state&&this.setStarted();try{void 0!==t&&this.store.delete([t]),void 0!==this.closingPointId&&this.store.delete([this.closingPointId]);}catch(t){}}styleFeature(e){const i=t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0});return "Feature"===e.type&&"LineString"===e.geometry.type&&e.properties.mode===this.mode?(i.lineStringColor=this.getHexColorStylingValue(this.styles.lineStringColor,i.lineStringColor,e),i.lineStringWidth=this.getNumericStylingValue(this.styles.lineStringWidth,i.lineStringWidth,e),i.zIndex=10,i):"Feature"===e.type&&"Point"===e.geometry.type&&e.properties.mode===this.mode?(i.pointColor=this.getHexColorStylingValue(this.styles.closingPointColor,i.pointColor,e),i.pointWidth=this.getNumericStylingValue(this.styles.closingPointWidth,i.pointWidth,e),i.pointOutlineColor=this.getHexColorStylingValue(this.styles.closingPointOutlineColor,"#ffffff",e),i.pointOutlineWidth=this.getNumericStylingValue(this.styles.closingPointOutlineWidth,2,e),i.zIndex=40,i):i}validateFeature(t){return !!super.validateFeature(t)&&"LineString"===t.geometry.type&&t.properties.mode===this.mode&&t.geometry.coordinates.length>=2}}function Et(t,e){return "Point"===t.geometry.type&&st(t.geometry.coordinates,e)}class wt extends X{constructor(e){super(e),this.mode="point",this.cursors=void 0;const i={create:"crosshair"};this.cursors=e&&e.cursors?t({},i,e.cursors):i;}start(){this.setStarted(),this.setCursor(this.cursors.create);}stop(){this.cleanUp(),this.setStopped(),this.setCursor("unset");}onClick(t){if(!this.store)throw new Error("Mode must be registered first");const e={type:"Point",coordinates:[t.lng,t.lat]},i={mode:this.mode};if(this.validate&&!this.validate({type:"Feature",geometry:e,properties:i},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:L$2.Finish}))return;const[o]=this.store.create([{geometry:e,properties:i}]);this.onFinish(o,{mode:this.mode,action:"draw"});}onMouseMove(){}onKeyDown(){}onKeyUp(){}cleanUp(){}onDragStart(){}onDrag(){}onDragEnd(){}styleFeature(e){const i=t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0});return "Feature"===e.type&&"Point"===e.geometry.type&&e.properties.mode===this.mode&&(i.pointWidth=this.getNumericStylingValue(this.styles.pointWidth,i.pointWidth,e),i.pointColor=this.getHexColorStylingValue(this.styles.pointColor,i.pointColor,e),i.pointOutlineColor=this.getHexColorStylingValue(this.styles.pointOutlineColor,i.pointOutlineColor,e),i.pointOutlineWidth=this.getNumericStylingValue(this.styles.pointOutlineWidth,2,e),i.zIndex=30),i}validateFeature(t){return !!super.validateFeature(t)&&t.properties.mode===this.mode&&Et(t,this.coordinatePrecision)}}class It extends dt{constructor(t,e){super(t),this.config=void 0,this.pixelDistance=void 0,this._startEndPoints=[],this.config=t,this.pixelDistance=e;}get ids(){return this._startEndPoints.concat()}set ids(t){}create(t,e){if(this.ids.length)throw new Error("Opening and closing points already created");if(t.length<=3)throw new Error("Requires at least 4 coordinates");this._startEndPoints=this.store.create([{geometry:{type:"Point",coordinates:t[0]},properties:{mode:e,[V]:!0}},{geometry:{type:"Point",coordinates:t[t.length-2]},properties:{mode:e,[V]:!0}}]);}delete(){this.ids.length&&(this.store.delete(this.ids),this._startEndPoints=[]);}update(t){if(2!==this.ids.length)throw new Error("No closing points to update");this.store.updateGeometry([{id:this.ids[0],geometry:{type:"Point",coordinates:t[0]}},{id:this.ids[1],geometry:{type:"Point",coordinates:t[t.length-3]}}]);}isClosingPoint(t){const e=this.store.getGeometryCopy(this.ids[0]),i=this.store.getGeometryCopy(this.ids[1]),o=this.pixelDistance.measure(t,e.coordinates),r=this.pixelDistance.measure(t,i.coordinates);return {isClosing:o<this.pointerDistance,isPreviousClosing:r<this.pointerDistance}}}class Ft extends X{constructor(e){super(e),this.mode="polygon",this.currentCoordinate=0,this.currentId=void 0,this.keyEvents=void 0,this.snappingEnabled=void 0,this.snapping=void 0,this.pixelDistance=void 0,this.closingPoints=void 0,this.cursors=void 0,this.mouseMove=!1;const i={start:"crosshair",close:"pointer"};if(this.cursors=e&&e.cursors?t({},i,e.cursors):i,this.snappingEnabled=!(!e||void 0===e.snapping)&&e.snapping,null===(null==e?void 0:e.keyEvents))this.keyEvents={cancel:null,finish:null};else {const i={cancel:"Escape",finish:"Enter"};this.keyEvents=e&&e.keyEvents?t({},i,e.keyEvents):i;}}close(){if(void 0===this.currentId)return;const t=this.store.getGeometryCopy(this.currentId).coordinates[0];if(t.length<5)return;if(!this.updatePolygonGeometry([...t.slice(0,-2),t[0]],L$2.Finish))return;const e=this.currentId;this.currentCoordinate=0,this.currentId=void 0,this.closingPoints.delete(),"drawing"===this.state&&this.setStarted(),this.onFinish(e,{mode:this.mode,action:"draw"});}registerBehaviors(t){this.pixelDistance=new pt(t),this.snapping=new yt(t,this.pixelDistance,new gt(t)),this.closingPoints=new It(t,this.pixelDistance);}start(){this.setStarted(),this.setCursor(this.cursors.start);}stop(){this.cleanUp(),this.setStopped(),this.setCursor("unset");}onMouseMove(t){if(this.mouseMove=!0,this.setCursor(this.cursors.start),void 0===this.currentId||0===this.currentCoordinate)return;const e=this.snappingEnabled?this.snapping.getSnappableCoordinate(t,this.currentId):void 0,i=this.store.getGeometryCopy(this.currentId).coordinates[0];let o;if(e&&(t.lng=e[0],t.lat=e[1]),1===this.currentCoordinate){const e=1/Math.pow(10,this.coordinatePrecision-1),r=Math.max(1e-6,e);o=[i[0],[t.lng,t.lat],[t.lng,t.lat-r],i[0]];}else if(2===this.currentCoordinate)o=[i[0],i[1],[t.lng,t.lat],i[0]];else {const{isClosing:e,isPreviousClosing:r}=this.closingPoints.isClosingPoint(t);r||e?(this.setCursor(this.cursors.close),o=[...i.slice(0,-2),i[0],i[0]]):o=[...i.slice(0,-2),[t.lng,t.lat],i[0]];}this.updatePolygonGeometry(o,L$2.Provisional);}updatePolygonGeometry(t,e){if(!this.currentId)return !1;const i={type:"Polygon",coordinates:[t]};return !(this.validate&&!this.validate({type:"Feature",geometry:i},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:e})||(this.store.updateGeometry([{id:this.currentId,geometry:i}]),0))}onClick(t){if(this.currentCoordinate>0&&!this.mouseMove&&this.onMouseMove(t),this.mouseMove=!1,0===this.currentCoordinate){const e=this.snappingEnabled?this.snapping.getSnappableCoordinateFirstClick(t):void 0;e&&(t.lng=e[0],t.lat=e[1]);const[i]=this.store.create([{geometry:{type:"Polygon",coordinates:[[[t.lng,t.lat],[t.lng,t.lat],[t.lng,t.lat],[t.lng,t.lat]]]},properties:{mode:this.mode}}]);this.currentId=i,this.currentCoordinate++,this.setDrawing();}else if(1===this.currentCoordinate&&this.currentId){const e=this.snappingEnabled?this.snapping.getSnappableCoordinate(t,this.currentId):void 0;e&&(t.lng=e[0],t.lat=e[1]);const i=this.store.getGeometryCopy(this.currentId);if(bt([t.lng,t.lat],i.coordinates[0][0]))return;if(!this.updatePolygonGeometry([i.coordinates[0][0],[t.lng,t.lat],[t.lng,t.lat],i.coordinates[0][0]],L$2.Commit))return;this.currentCoordinate++;}else if(2===this.currentCoordinate&&this.currentId){const e=this.snappingEnabled?this.snapping.getSnappableCoordinate(t,this.currentId):void 0;e&&(t.lng=e[0],t.lat=e[1]);const i=this.store.getGeometryCopy(this.currentId).coordinates[0];if(bt([t.lng,t.lat],i[1]))return;if(!this.updatePolygonGeometry([i[0],i[1],[t.lng,t.lat],[t.lng,t.lat],i[0]],L$2.Commit))return;2===this.currentCoordinate&&this.closingPoints.create(i,"polygon"),this.currentCoordinate++;}else if(this.currentId){const e=this.snappingEnabled?this.snapping.getSnappableCoordinate(t,this.currentId):void 0,i=this.store.getGeometryCopy(this.currentId).coordinates[0],{isClosing:o,isPreviousClosing:r}=this.closingPoints.isClosingPoint(t);if(r||o)this.close();else {if(e&&(t.lng=e[0],t.lat=e[1]),bt([t.lng,t.lat],i[this.currentCoordinate-1]))return;const o=function(t=[[[0,0],[0,1],[1,1],[1,0],[0,0]]]){return {type:"Feature",geometry:{type:"Polygon",coordinates:t},properties:{}}}([[...i.slice(0,-1),[t.lng,t.lat],i[0]]]);if(!this.updatePolygonGeometry(o.geometry.coordinates[0],L$2.Commit))return;this.currentCoordinate++,this.closingPoints.ids.length&&this.closingPoints.update(o.geometry.coordinates[0]);}}}onKeyUp(t){t.key===this.keyEvents.cancel?this.cleanUp():t.key===this.keyEvents.finish&&this.close();}onKeyDown(){}onDragStart(){this.setCursor("unset");}onDrag(){}onDragEnd(){this.setCursor(this.cursors.start);}cleanUp(){const t=this.currentId;this.currentId=void 0,this.currentCoordinate=0,"drawing"===this.state&&this.setStarted();try{void 0!==t&&this.store.delete([t]),this.closingPoints.ids.length&&this.closingPoints.delete();}catch(t){}}styleFeature(e){const i=t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0});if(e.properties.mode===this.mode){if("Polygon"===e.geometry.type)return i.polygonFillColor=this.getHexColorStylingValue(this.styles.fillColor,i.polygonFillColor,e),i.polygonOutlineColor=this.getHexColorStylingValue(this.styles.outlineColor,i.polygonOutlineColor,e),i.polygonOutlineWidth=this.getNumericStylingValue(this.styles.outlineWidth,i.polygonOutlineWidth,e),i.polygonFillOpacity=this.getNumericStylingValue(this.styles.fillOpacity,i.polygonFillOpacity,e),i.zIndex=10,i;if("Point"===e.geometry.type)return i.pointWidth=this.getNumericStylingValue(this.styles.closingPointWidth,i.pointWidth,e),i.pointColor=this.getHexColorStylingValue(this.styles.closingPointColor,i.pointColor,e),i.pointOutlineColor=this.getHexColorStylingValue(this.styles.closingPointOutlineColor,i.pointOutlineColor,e),i.pointOutlineWidth=this.getNumericStylingValue(this.styles.closingPointOutlineWidth,2,e),i.zIndex=30,i}return i}validateFeature(t){return !!super.validateFeature(t)&&t.properties.mode===this.mode&&at(t,this.coordinatePrecision)}}class Dt extends X{constructor(e){super(e),this.mode="rectangle",this.center=void 0,this.clickCount=0,this.currentRectangleId=void 0,this.keyEvents=void 0,this.cursors=void 0;const i={start:"crosshair"};if(this.cursors=e&&e.cursors?t({},i,e.cursors):i,null===(null==e?void 0:e.keyEvents))this.keyEvents={cancel:null,finish:null};else {const i={cancel:"Escape",finish:"Enter"};this.keyEvents=e&&e.keyEvents?t({},i,e.keyEvents):i;}}updateRectangle(t,e){if(1===this.clickCount&&this.center&&this.currentRectangleId){const i=this.store.getGeometryCopy(this.currentRectangleId).coordinates[0][0],o={type:"Polygon",coordinates:[[i,[t.lng,i[1]],[t.lng,t.lat],[i[0],t.lat],i]]};if(this.validate&&!this.validate({id:this.currentRectangleId,geometry:o},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:e}))return;this.store.updateGeometry([{id:this.currentRectangleId,geometry:o}]);}}close(){const t=this.currentRectangleId;this.center=void 0,this.currentRectangleId=void 0,this.clickCount=0,"drawing"===this.state&&this.setStarted(),t&&this.onFinish(t,{mode:this.mode,action:"draw"});}start(){this.setStarted(),this.setCursor(this.cursors.start);}stop(){this.cleanUp(),this.setStopped(),this.setCursor("unset");}onClick(t){if(0===this.clickCount){this.center=[t.lng,t.lat];const[e]=this.store.create([{geometry:{type:"Polygon",coordinates:[[[t.lng,t.lat],[t.lng,t.lat],[t.lng,t.lat],[t.lng,t.lat]]]},properties:{mode:this.mode}}]);this.currentRectangleId=e,this.clickCount++,this.setDrawing();}else this.updateRectangle(t,L$2.Finish),this.close();}onMouseMove(t){this.updateRectangle(t,L$2.Provisional);}onKeyDown(){}onKeyUp(t){t.key===this.keyEvents.cancel?this.cleanUp():t.key===this.keyEvents.finish&&this.close();}onDragStart(){}onDrag(){}onDragEnd(){}cleanUp(){const t=this.currentRectangleId;this.center=void 0,this.currentRectangleId=void 0,this.clickCount=0,"drawing"===this.state&&this.setStarted(),void 0!==t&&this.store.delete([t]);}styleFeature(e){const i=t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0});return "Feature"===e.type&&"Polygon"===e.geometry.type&&e.properties.mode===this.mode?(i.polygonFillColor=this.getHexColorStylingValue(this.styles.fillColor,i.polygonFillColor,e),i.polygonOutlineColor=this.getHexColorStylingValue(this.styles.outlineColor,i.polygonOutlineColor,e),i.polygonOutlineWidth=this.getNumericStylingValue(this.styles.outlineWidth,i.polygonOutlineWidth,e),i.polygonFillOpacity=this.getNumericStylingValue(this.styles.fillOpacity,i.polygonFillOpacity,e),i.zIndex=10,i):i}validateFeature(t){return !!super.validateFeature(t)&&t.properties.mode===this.mode&&lt(t,this.coordinatePrecision)}}class kt extends X{constructor(t){super({styles:t.styles}),this.type=T.Render,this.mode="render",this.mode=t.modeName;}registerBehaviors(t){this.mode=t.mode;}start(){this.setStarted();}stop(){this.setStopped();}onKeyUp(){}onKeyDown(){}onClick(){}onDragStart(){}onDrag(){}onDragEnd(){}onMouseMove(){}cleanUp(){}styleFeature(t){return {pointColor:this.getHexColorStylingValue(this.styles.pointColor,"#3f97e0",t),pointWidth:this.getNumericStylingValue(this.styles.pointWidth,6,t),pointOutlineColor:this.getHexColorStylingValue(this.styles.pointOutlineColor,"#ffffff",t),pointOutlineWidth:this.getNumericStylingValue(this.styles.pointOutlineWidth,0,t),polygonFillColor:this.getHexColorStylingValue(this.styles.polygonFillColor,"#3f97e0",t),polygonFillOpacity:this.getNumericStylingValue(this.styles.polygonFillOpacity,.3,t),polygonOutlineColor:this.getHexColorStylingValue(this.styles.polygonOutlineColor,"#3f97e0",t),polygonOutlineWidth:this.getNumericStylingValue(this.styles.polygonOutlineWidth,4,t),lineStringWidth:this.getNumericStylingValue(this.styles.lineStringWidth,4,t),lineStringColor:this.getHexColorStylingValue(this.styles.lineStringColor,"#3f97e0",t),zIndex:this.getNumericStylingValue(this.styles.zIndex,0,t)}}validateFeature(t){return super.validateFeature(t)&&(Et(t,this.coordinatePrecision)||at(t,this.coordinatePrecision)||function(t,e){return "LineString"===t.geometry.type&&t.geometry.coordinates.length>=2&&t.geometry.coordinates.every(t=>st(t,e))}(t,this.coordinatePrecision))}}function Ot(t,e){const i=t,o=e,r=z(i[1]),s=z(o[1]);let n=z(o[0]-i[0]);n>Math.PI&&(n-=2*Math.PI),n<-Math.PI&&(n+=2*Math.PI);const a=Math.log(Math.tan(s/2+Math.PI/4)/Math.tan(r/2+Math.PI/4)),l=($(Math.atan2(n,a))+360)%360;return l>180?-(360-l):l}function jt(t,e,i){let o=e;e<0&&(o=-Math.abs(o));const r=o/K,s=t[0]*Math.PI/180,n=z(t[1]),a=z(i),l=r*Math.cos(a);let h=n+l;Math.abs(h)>Math.PI/2&&(h=h>0?Math.PI-h:-Math.PI-h);const c=Math.log(Math.tan(h/2+Math.PI/4)/Math.tan(n/2+Math.PI/4)),d=Math.abs(c)>1e-11?l/c:Math.cos(n),u=[(180*(s+r*Math.sin(a)/d)/Math.PI+540)%360-180,180*h/Math.PI];return u[0]+=u[0]-t[0]>180?-360:t[0]-u[0]>180?360:0,u}function Lt(t,i,o,r,s){const n=r(t[0],t[1]),a=r(i[0],i[1]),{lng:l,lat:h}=s((n.x+a.x)/2,(n.y+a.y)/2);return [e(l,o),e(h,o)]}function Wt(t,i,o){const r=jt(t,1e3*Y(t,i)/2,Ot(t,i));return [e(r[0],o),e(r[1],o)]}function Bt({featureCoords:t,precision:e,unproject:i,project:o,projection:r}){const s=[];for(let n=0;n<t.length-1;n++){let a;if("web-mercator"===r)a=Lt(t[n],t[n+1],e,o,i);else {if("globe"!==r)throw new Error("Invalid projection");a=Wt(t[n],t[n+1],e);}s.push(a);}return s}class Gt extends dt{constructor(t,e){super(t),this.config=void 0,this.selectionPointBehavior=void 0,this._midPoints=[],this.config=t,this.selectionPointBehavior=e;}get ids(){return this._midPoints.concat()}set ids(t){}insert(t,e){const i=this.store.getGeometryCopy(t),{midPointFeatureId:o,midPointSegment:r}=this.store.getPropertiesCopy(t),s=this.store.getGeometryCopy(o),n="Polygon"===s.type?s.coordinates[0]:s.coordinates;n.splice(r+1,0,i.coordinates),s.coordinates="Polygon"===s.type?[n]:n,this.store.updateGeometry([{id:o,geometry:s}]),this.store.delete([...this._midPoints,...this.selectionPointBehavior.ids]),this.create(n,o,e),this.selectionPointBehavior.create(n,s.type,o);}create(t,e,i){if(!this.store.has(e))throw new Error("Store does not have feature with this id");this._midPoints=this.store.create(function(t,e,i,o,r,s){return Bt({featureCoords:t,precision:i,project:o,unproject:r,projection:s}).map((t,i)=>({geometry:{type:"Point",coordinates:t},properties:e(i)}))}(t,t=>({mode:this.mode,[N]:!0,midPointSegment:t,midPointFeatureId:e}),i,this.config.project,this.config.unproject,this.projection));}delete(){this._midPoints.length&&(this.store.delete(this._midPoints),this._midPoints=[]);}getUpdated(t){if(0!==this._midPoints.length)return Bt({featureCoords:t,precision:this.coordinatePrecision,project:this.config.project,unproject:this.config.unproject,projection:this.config.projection}).map((t,e)=>({id:this._midPoints[e],geometry:{type:"Point",coordinates:t}}))}}class Nt extends dt{constructor(t){super(t),this._selectionPoints=[];}get ids(){return this._selectionPoints.concat()}set ids(t){}create(t,e,i){this._selectionPoints=this.store.create(function(t,e,i){const o=[],r="Polygon"===e?t.length-1:t.length;for(let e=0;e<r;e++)o.push({geometry:{type:"Point",coordinates:t[e]},properties:i(e)});return o}(t,e,t=>({mode:this.mode,selectionPoint:!0,selectionPointFeatureId:i,index:t})));}delete(){this.ids.length&&(this.store.delete(this.ids),this._selectionPoints=[]);}getUpdated(t){if(0!==this._selectionPoints.length)return this._selectionPoints.map((e,i)=>({id:e,geometry:{type:"Point",coordinates:t[i]}}))}getOneUpdated(t,e){if(void 0!==this._selectionPoints[t])return {id:this._selectionPoints[t],geometry:{type:"Point",coordinates:e}}}}function Vt(t,e){let i=!1;for(let n=0,a=e.length;n<a;n++){const a=e[n];for(let e=0,n=a.length,l=n-1;e<n;l=e++)(r=a[e])[1]>(o=t)[1]!=(s=a[l])[1]>o[1]&&o[0]<(s[0]-r[0])*(o[1]-r[1])/(s[1]-r[1])+r[0]&&(i=!i);}var o,r,s;return i}const At=(t,e,i)=>{const o=t=>t*t,r=(t,e)=>o(t.x-e.x)+o(t.y-e.y);return Math.sqrt(((t,e,i)=>{const o=r(e,i);if(0===o)return r(t,e);let s=((t.x-e.x)*(i.x-e.x)+(t.y-e.y)*(i.y-e.y))/o;return s=Math.max(0,Math.min(1,s)),r(t,{x:e.x+s*(i.x-e.x),y:e.y+s*(i.y-e.y)})})(t,e,i))};class Rt extends dt{constructor(t,e,i){super(t),this.config=void 0,this.createClickBoundingBox=void 0,this.pixelDistance=void 0,this.config=t,this.createClickBoundingBox=e,this.pixelDistance=i;}find(t,e){let i,o,r,s,n=Infinity,a=Infinity,l=Infinity;const h=this.createClickBoundingBox.create(t),c=this.store.search(h);for(let h=0;h<c.length;h++){const d=c[h],u=d.geometry;if("Point"===u.type){if(d.properties.selectionPoint||!e&&d.properties[N])continue;const o=this.pixelDistance.measure(t,u.coordinates);d.properties[N]&&o<this.pointerDistance&&o<l?(l=o,r=d):!d.properties[N]&&o<this.pointerDistance&&o<n&&(n=o,i=d);}else if("LineString"===u.type){if(i)continue;for(let e=0;e<u.coordinates.length-1;e++){const i=u.coordinates[e],r=u.coordinates[e+1],s=At({x:t.containerX,y:t.containerY},this.project(i[0],i[1]),this.project(r[0],r[1]));s<this.pointerDistance&&s<a&&(a=s,o=d);}}else if("Polygon"===u.type){if(i||o)continue;Vt([t.lng,t.lat],u.coordinates)&&(s=d);}}return {clickedFeature:i||o||s,clickedMidPoint:r}}}class Tt extends dt{constructor(t,e,i,o){super(t),this.config=void 0,this.featuresAtMouseEvent=void 0,this.selectionPoints=void 0,this.midPoints=void 0,this.draggedFeatureId=null,this.dragPosition=void 0,this.config=t,this.featuresAtMouseEvent=e,this.selectionPoints=i,this.midPoints=o;}startDragging(t,e){this.draggedFeatureId=e,this.dragPosition=[t.lng,t.lat];}stopDragging(){this.draggedFeatureId=null,this.dragPosition=void 0;}isDragging(){return null!==this.draggedFeatureId}canDrag(t,e){const{clickedFeature:i}=this.featuresAtMouseEvent.find(t,!0);return !(!i||i.id!==e)}drag(t,i){if(!this.draggedFeatureId)return;const o=this.store.getGeometryCopy(this.draggedFeatureId),r=[t.lng,t.lat];if("Polygon"===o.type||"LineString"===o.type){let s,n;if("Polygon"===o.type?(s=o.coordinates[0],n=s.length-1):(s=o.coordinates,n=s.length),!this.dragPosition)return !1;for(let t=0;t<n;t++){const i=s[t],o=[this.dragPosition[0]-r[0],this.dragPosition[1]-r[1]],n=e(i[0]-o[0],this.config.coordinatePrecision),a=e(i[1]-o[1],this.config.coordinatePrecision);if(n>180||n<-180||a>90||a<-90)return !1;s[t]=[n,a];}"Polygon"===o.type&&(s[s.length-1]=[s[0][0],s[0][1]]);const a=this.selectionPoints.getUpdated(s)||[],l=this.midPoints.getUpdated(s)||[];if(i&&!i({type:"Feature",id:this.draggedFeatureId,geometry:o,properties:{}},{project:this.config.project,unproject:this.config.unproject,coordinatePrecision:this.config.coordinatePrecision,updateType:L$2.Provisional}))return !1;this.store.updateGeometry([{id:this.draggedFeatureId,geometry:o},...a,...l]),this.dragPosition=[t.lng,t.lat];}else "Point"===o.type&&(this.store.updateGeometry([{id:this.draggedFeatureId,geometry:{type:"Point",coordinates:r}}]),this.dragPosition=[t.lng,t.lat]);}}class Xt extends dt{constructor(t,e,i,o){super(t),this.config=void 0,this.pixelDistance=void 0,this.selectionPoints=void 0,this.midPoints=void 0,this.draggedCoordinate={id:null,index:-1},this.config=t,this.pixelDistance=e,this.selectionPoints=i,this.midPoints=o;}getClosestCoordinate(t,e){const i={dist:Infinity,index:-1,isFirstOrLastPolygonCoord:!1};let o;if("LineString"===e.type)o=e.coordinates;else {if("Polygon"!==e.type)return i;o=e.coordinates[0];}for(let r=0;r<o.length;r++){const s=this.pixelDistance.measure(t,o[r]);if(s<this.pointerDistance&&s<i.dist){const t="Polygon"===e.type&&(r===o.length-1||0===r);i.dist=s,i.index=t?0:r,i.isFirstOrLastPolygonCoord=t;}}return i}getDraggableIndex(t,e){const i=this.store.getGeometryCopy(e),o=this.getClosestCoordinate(t,i);return -1===o.index?-1:o.index}drag(t,e,i){if(!this.draggedCoordinate.id)return !1;const o=this.draggedCoordinate.index,r=this.store.getGeometryCopy(this.draggedCoordinate.id),s="LineString"===r.type?r.coordinates:r.coordinates[0],n=[t.lng,t.lat];if(t.lng>180||t.lng<-180||t.lat>90||t.lat<-90)return !1;if("Polygon"!==r.type||o!==s.length-1&&0!==o)s[o]=n;else {const t=s.length-1;s[0]=n,s[t]=n;}const a=this.selectionPoints.getOneUpdated(o,n),l=a?[a]:[],h=this.midPoints.getUpdated(s)||[];return !("Point"!==r.type&&!e&&ot({type:"Feature",geometry:r,properties:{}})||i&&!i({type:"Feature",id:this.draggedCoordinate.id,geometry:r,properties:{}},{project:this.config.project,unproject:this.config.unproject,coordinatePrecision:this.config.coordinatePrecision,updateType:L$2.Provisional})||(this.store.updateGeometry([{id:this.draggedCoordinate.id,geometry:r},...l,...h]),0))}isDragging(){return null!==this.draggedCoordinate.id}startDragging(t,e){this.draggedCoordinate={id:t,index:e};}stopDragging(){this.draggedCoordinate={id:null,index:-1};}}function Ut(t){let e=0,i=0,o=0;return ("Polygon"===t.geometry.type?t.geometry.coordinates[0].slice(0,-1):t.geometry.coordinates).forEach(t=>{e+=t[0],i+=t[1],o++;},!0),[e/o,i/o]}function Yt(t,e){t[0]+=t[0]-e[0]>180?-360:e[0]-t[0]>180?360:0;const i=K,o=e[1]*Math.PI/180,r=t[1]*Math.PI/180,s=r-o;let n=Math.abs(t[0]-e[0])*Math.PI/180;n>Math.PI&&(n-=2*Math.PI);const a=Math.log(Math.tan(r/2+Math.PI/4)/Math.tan(o/2+Math.PI/4)),l=Math.abs(a)>1e-11?s/a:Math.cos(o);return Math.sqrt(s*s+l*l*n*n)*i}function Kt(t){const e=("Polygon"===t.geometry.type?t.geometry.coordinates[0]:t.geometry.coordinates).map(t=>{const{x:e,y:i}=Q(t[0],t[1]);return [e,i]});return "Polygon"===t.geometry.type?function(t){let e=0,i=0,o=0;const r=t.length;for(let s=0;s<r-1;s++){const[r,n]=t[s],[a,l]=t[s+1],h=r*l-a*n;e+=h,i+=(r+a)*h,o+=(n+l)*h;}return e/=2,i/=6*e,o/=6*e,{x:i,y:o}}(e):function(t){const e=t.length;let i=0,o=0;for(let r=0;r<e;r++){const[e,s]=t[r];i+=e,o+=s;}return {x:i/e,y:o/e}}(e)}class zt extends dt{constructor(t,e,i){super(t),this.config=void 0,this.selectionPoints=void 0,this.midPoints=void 0,this.lastBearing=void 0,this.config=t,this.selectionPoints=e,this.midPoints=i;}reset(){this.lastBearing=void 0;}rotate(t,i,o){const r=this.store.getGeometryCopy(i);if("Polygon"!==r.type&&"LineString"!==r.type)return;const s=[t.lng,t.lat];let n;const a={type:"Feature",geometry:r,properties:{}};if("web-mercator"===this.config.projection){if(n=vt(Kt(a),Q(t.lng,t.lat)),!this.lastBearing)return void(this.lastBearing=n);((t,e)=>{if(0===e||360===e||-360===e)return t;const i=.017453292519943295*e,o=("Polygon"===t.geometry.type?t.geometry.coordinates[0]:t.geometry.coordinates).map(([t,e])=>Q(t,e)),r=o.reduce((t,e)=>({x:t.x+e.x,y:t.y+e.y}),{x:0,y:0});r.x/=o.length,r.y/=o.length;const s=o.map(t=>({x:r.x+(t.x-r.x)*Math.cos(i)-(t.y-r.y)*Math.sin(i),y:r.y+(t.x-r.x)*Math.sin(i)+(t.y-r.y)*Math.cos(i)})).map(({x:t,y:e})=>[tt(t,e).lng,tt(t,e).lat]);"Polygon"===t.geometry.type?t.geometry.coordinates[0]=s:(console.log("rotatedCoordinates linestring",s),t.geometry.coordinates=s);})(a,-(this.lastBearing-n));}else {if("globe"!==this.config.projection)throw new Error("Unsupported projection");if(n=Ot(Ut({type:"Feature",geometry:r,properties:{}}),s),!this.lastBearing)return void(this.lastBearing=n+180);!function(t,e){if(0===e||360===e||-360===e)return t;const i=Ut(t);("Polygon"===t.geometry.type?t.geometry.coordinates[0]:t.geometry.coordinates).forEach(t=>{const o=Ot(i,t)+e,r=Yt(i,t),s=jt(i,r,o);t[0]=s[0],t[1]=s[1];});}(a,-(this.lastBearing-(n+180)));}const l="Polygon"===r.type?r.coordinates[0]:r.coordinates;l.forEach(t=>{t[0]=e(t[0],this.coordinatePrecision),t[1]=e(t[1],this.coordinatePrecision);});const h=this.midPoints.getUpdated(l)||[],c=this.selectionPoints.getUpdated(l)||[];if(o&&!o({id:i,type:"Feature",geometry:r,properties:{}},{project:this.config.project,unproject:this.config.unproject,coordinatePrecision:this.config.coordinatePrecision,updateType:L$2.Provisional}))return !1;this.store.updateGeometry([{id:i,geometry:r},...c,...h]),"web-mercator"===this.projection?this.lastBearing=n:"globe"===this.projection&&(this.lastBearing=n+180);}}class Ht extends dt{constructor(t,e,i){super(t),this.config=void 0,this.selectionPoints=void 0,this.midPoints=void 0,this.lastDistance=void 0,this.config=t,this.selectionPoints=e,this.midPoints=i;}reset(){this.lastDistance=void 0;}scale(t,o,r){const s=this.store.getGeometryCopy(o);if("Polygon"!==s.type&&"LineString"!==s.type)return;const n=[t.lng,t.lat],a={type:"Feature",geometry:s,properties:{}};let l;const h=Kt(a);if("web-mercator"===this.config.projection){const e=Q(t.lng,t.lat);l=i$1(h,e);}else {if("globe"!==this.config.projection)throw new Error("Invalid projection");l=Y(Ut({type:"Feature",geometry:s,properties:{}}),n);}if(!this.lastDistance)return void(this.lastDistance=l);const c=1-(this.lastDistance-l)/l;if("web-mercator"===this.config.projection){const{lng:t,lat:e}=tt(h.x,h.y);!function(t,e,i){if(1===e)return t;const o=("Polygon"===t.geometry.type?t.geometry.coordinates[0]:t.geometry.coordinates).map(([t,e])=>Q(t,e)),r=Q(i[0],i[1]),s=o.map(t=>({x:r.x+(t.x-r.x)*e,y:r.y+(t.y-r.y)*e})).map(({x:t,y:e})=>[tt(t,e).lng,tt(t,e).lat]);"Polygon"===t.geometry.type?t.geometry.coordinates[0]=s:t.geometry.coordinates=s;}(a,c,[t,e]);}else "globe"===this.config.projection&&function(t,e,i,o="xy"){1===e||("Polygon"===t.geometry.type?t.geometry.coordinates[0]:t.geometry.coordinates).forEach(t=>{const r=Yt(i,t),s=Ot(i,t),n=jt(i,r*e,s);"x"!==o&&"xy"!==o||(t[0]=n[0]),"y"!==o&&"xy"!==o||(t[1]=n[1]);});}(a,c,Ut(a));const d="Polygon"===s.type?s.coordinates[0]:s.coordinates;d.forEach(t=>{t[0]=e(t[0],this.coordinatePrecision),t[1]=e(t[1],this.coordinatePrecision);});const u=this.midPoints.getUpdated(d)||[],g=this.selectionPoints.getUpdated(d)||[];if(r&&!r({id:o,type:"Feature",geometry:s,properties:{}},{project:this.config.project,unproject:this.config.unproject,coordinatePrecision:this.config.coordinatePrecision,updateType:L$2.Provisional}))return !1;this.store.updateGeometry([{id:o,geometry:s},...g,...u]),this.lastDistance=l;}}class $t extends dt{constructor(t,e,i,o){super(t),this.config=void 0,this.pixelDistance=void 0,this.selectionPoints=void 0,this.midPoints=void 0,this.minimumScale=1e-4,this.draggedCoordinate={id:null,index:-1},this.boundingBoxMaps={opposite:{0:4,1:5,2:6,3:7,4:0,5:1,6:2,7:3}},this.config=t,this.pixelDistance=e,this.selectionPoints=i,this.midPoints=o;}getClosestCoordinate(t,e){const i={dist:Infinity,index:-1,isFirstOrLastPolygonCoord:!1};let o;if("LineString"===e.type)o=e.coordinates;else {if("Polygon"!==e.type)return i;o=e.coordinates[0];}for(let r=0;r<o.length;r++){const s=this.pixelDistance.measure(t,o[r]);if(s<this.pointerDistance&&s<i.dist){const t="Polygon"===e.type&&(r===o.length-1||0===r);i.dist=s,i.index=t?0:r,i.isFirstOrLastPolygonCoord=t;}}return i}isValidDragWebMercator(t,e,i){switch(t){case 0:if(e<=0||i>=0)return !1;break;case 1:if(i>=0)return !1;break;case 2:if(e>=0||i>=0)return !1;break;case 3:if(e>=0)return !1;break;case 4:if(e>=0||i<=0)return !1;break;case 5:if(i<=0)return !1;break;case 6:if(e<=0||i<=0)return !1;break;case 7:if(e<=0)return !1}return !0}getSelectedFeatureDataWebMercator(){if(!this.draggedCoordinate.id||-1===this.draggedCoordinate.index)return null;const t=this.getFeature(this.draggedCoordinate.id);if(!t)return null;const e=this.getNormalisedCoordinates(t.geometry);return {boundingBox:this.getBBoxWebMercator(e),feature:t,updatedCoords:e,selectedCoordinate:e[this.draggedCoordinate.index]}}centerWebMercatorDrag(t){const e=this.getSelectedFeatureDataWebMercator();if(!e)return null;const{feature:i,boundingBox:o,updatedCoords:r,selectedCoordinate:s}=e,n=Kt(i);if(!n)return null;const a=Q(s[0],s[1]),{closestBBoxIndex:l}=this.getIndexesWebMercator(o,a),h=Q(t.lng,t.lat);return this.scaleWebMercator({closestBBoxIndex:l,updatedCoords:r,webMercatorCursor:h,webMercatorSelected:a,webMercatorOrigin:n}),r}centerFixedWebMercatorDrag(t){const e=this.getSelectedFeatureDataWebMercator();if(!e)return null;const{feature:i,boundingBox:o,updatedCoords:r,selectedCoordinate:s}=e,n=Kt(i);if(!n)return null;const a=Q(s[0],s[1]),{closestBBoxIndex:l}=this.getIndexesWebMercator(o,a),h=Q(t.lng,t.lat);return this.scaleFixedWebMercator({closestBBoxIndex:l,updatedCoords:r,webMercatorCursor:h,webMercatorSelected:a,webMercatorOrigin:n}),r}scaleFixedWebMercator({closestBBoxIndex:t,webMercatorOrigin:e,webMercatorSelected:o,webMercatorCursor:r,updatedCoords:s}){if(!this.isValidDragWebMercator(t,e.x-r.x,e.y-r.y))return null;let n=i$1(e,r)/i$1(e,o);return n<0&&(n=this.minimumScale),this.performWebMercatorScale(s,e.x,e.y,n,n),s}oppositeFixedWebMercatorDrag(t){const e=this.getSelectedFeatureDataWebMercator();if(!e)return null;const{boundingBox:i,updatedCoords:o,selectedCoordinate:r}=e,s=Q(r[0],r[1]),{oppositeBboxIndex:n,closestBBoxIndex:a}=this.getIndexesWebMercator(i,s),l={x:i[n][0],y:i[n][1]},h=Q(t.lng,t.lat);return this.scaleFixedWebMercator({closestBBoxIndex:a,updatedCoords:o,webMercatorCursor:h,webMercatorSelected:s,webMercatorOrigin:l}),o}oppositeWebMercatorDrag(t){const e=this.getSelectedFeatureDataWebMercator();if(!e)return null;const{boundingBox:i,updatedCoords:o,selectedCoordinate:r}=e,s=Q(r[0],r[1]),{oppositeBboxIndex:n,closestBBoxIndex:a}=this.getIndexesWebMercator(i,s),l={x:i[n][0],y:i[n][1]},h=Q(t.lng,t.lat);return this.scaleWebMercator({closestBBoxIndex:a,updatedCoords:o,webMercatorCursor:h,webMercatorSelected:s,webMercatorOrigin:l}),o}scaleWebMercator({closestBBoxIndex:t,webMercatorOrigin:e,webMercatorSelected:i,webMercatorCursor:o,updatedCoords:r}){const s=e.x-o.x,n=e.y-o.y;if(!this.isValidDragWebMercator(t,s,n))return null;let a=1;0!==s&&1!==t&&5!==t&&(a=1-(e.x-i.x-s)/s);let l=1;return 0!==n&&3!==t&&7!==t&&(l=1-(e.y-i.y-n)/n),this.validateScale(a,l)?(a<0&&(a=this.minimumScale),l<0&&(l=this.minimumScale),this.performWebMercatorScale(r,e.x,e.y,a,l),r):null}getFeature(t){if(null===this.draggedCoordinate.id)return null;const e=this.store.getGeometryCopy(t);return "Polygon"!==e.type&&"LineString"!==e.type?null:{type:"Feature",geometry:e,properties:{}}}getNormalisedCoordinates(t){return "Polygon"===t.type?t.coordinates[0]:t.coordinates}validateScale(t,e){const i=!isNaN(t)&&e<Number.MAX_SAFE_INTEGER,o=!isNaN(e)&&e<Number.MAX_SAFE_INTEGER;return i&&o}performWebMercatorScale(t,e,i,o,r){t.forEach(t=>{const{x:s,y:n}=Q(t[0],t[1]),a=e+(s-e)*o,l=i+(n-i)*r,{lng:h,lat:c}=tt(a,l);t[0]=h,t[1]=c;});}getBBoxWebMercator(t){const e=[Infinity,Infinity,-Infinity,-Infinity];(t=t.map(t=>{const{x:e,y:i}=Q(t[0],t[1]);return [e,i]})).forEach(([t,i])=>{t<e[0]&&(e[0]=t),i<e[1]&&(e[1]=i),t>e[2]&&(e[2]=t),i>e[3]&&(e[3]=i);});const[i,o,r,s]=e;return [[i,s],[(i+r)/2,s],[r,s],[r,s+(o-s)/2],[r,o],[(i+r)/2,o],[i,o],[i,s+(o-s)/2]]}getIndexesWebMercator(t,e){let o,r=Infinity;for(let s=0;s<t.length;s++){const n=i$1({x:e.x,y:e.y},{x:t[s][0],y:t[s][1]});n<r&&(o=s,r=n);}if(void 0===o)throw new Error("No closest coordinate found");return {oppositeBboxIndex:this.boundingBoxMaps.opposite[o],closestBBoxIndex:o}}isDragging(){return null!==this.draggedCoordinate.id}startDragging(t,e){this.draggedCoordinate={id:t,index:e};}stopDragging(){this.draggedCoordinate={id:null,index:-1};}getDraggableIndex(t,e){const i=this.store.getGeometryCopy(e),o=this.getClosestCoordinate(t,i);return -1===o.index?-1:o.index}drag(t,i,o){if(!this.draggedCoordinate.id)return !1;const r=this.getFeature(this.draggedCoordinate.id);if(!r)return !1;let s=null;if("center"===i?s=this.centerWebMercatorDrag(t):"opposite"===i?s=this.oppositeWebMercatorDrag(t):"center-fixed"===i?s=this.centerFixedWebMercatorDrag(t):"opposite-fixed"===i&&(s=this.oppositeFixedWebMercatorDrag(t)),!s)return !1;for(let t=0;t<s.length;t++){const i=s[t];if(i[0]=e(i[0],this.coordinatePrecision),i[1]=e(i[1],this.coordinatePrecision),!st(i,this.coordinatePrecision))return !1}const n=this.midPoints.getUpdated(s)||[],a=this.selectionPoints.getUpdated(s)||[],l={type:r.geometry.type,coordinates:"Polygon"===r.geometry.type?[s]:s};return !(o&&!o({id:this.draggedCoordinate.id,type:"Feature",geometry:l,properties:{}},{project:this.config.project,unproject:this.config.unproject,coordinatePrecision:this.config.coordinatePrecision,updateType:L$2.Provisional})||(this.store.updateGeometry([{id:this.draggedCoordinate.id,geometry:l},...a,...n]),0))}}class Jt extends U{constructor(e){var i;super(e),this.mode="select",this.allowManualDeselection=!0,this.dragEventThrottle=5,this.dragEventCount=0,this.selected=[],this.flags=void 0,this.keyEvents=void 0,this.selectionPoints=void 0,this.midPoints=void 0,this.featuresAtMouseEvent=void 0,this.pixelDistance=void 0,this.clickBoundingBox=void 0,this.dragFeature=void 0,this.dragCoordinate=void 0,this.rotateFeature=void 0,this.scaleFeature=void 0,this.dragCoordinateResizeFeature=void 0,this.cursors=void 0,this.validations={},this.flags=e&&e.flags?e.flags:{};const o={pointerOver:"move",dragStart:"move",dragEnd:"move",insertMidpoint:"crosshair"};if(this.cursors=e&&e.cursors?t({},o,e.cursors):o,null===(null==e?void 0:e.keyEvents))this.keyEvents={deselect:null,delete:null,rotate:null,scale:null};else {const i={deselect:"Escape",delete:"Delete",rotate:["Control","r"],scale:["Control","s"]};this.keyEvents=e&&e.keyEvents?t({},i,e.keyEvents):i;}if(this.dragEventThrottle=e&&void 0!==e.dragEventThrottle&&e.dragEventThrottle||5,this.allowManualDeselection=null==(i=null==e?void 0:e.allowManualDeselection)||i,e&&e.flags&&e.flags)for(const t in e.flags){const i=e.flags[t].feature;i&&i.validation&&(this.validations[t]=i.validation);}}selectFeature(t){this.select(t,!1);}setSelecting(){if("started"!==this._state)throw new Error("Mode must be started to move to selecting state");this._state="selecting";}registerBehaviors(t){this.pixelDistance=new pt(t),this.clickBoundingBox=new gt(t),this.featuresAtMouseEvent=new Rt(t,this.clickBoundingBox,this.pixelDistance),this.selectionPoints=new Nt(t),this.midPoints=new Gt(t,this.selectionPoints),this.rotateFeature=new zt(t,this.selectionPoints,this.midPoints),this.scaleFeature=new Ht(t,this.selectionPoints,this.midPoints),this.dragFeature=new Tt(t,this.featuresAtMouseEvent,this.selectionPoints,this.midPoints),this.dragCoordinate=new Xt(t,this.pixelDistance,this.selectionPoints,this.midPoints),this.dragCoordinateResizeFeature=new $t(t,this.pixelDistance,this.selectionPoints,this.midPoints);}deselectFeature(){this.deselect();}deselect(){const t=this.selected.filter(t=>this.store.has(t)).map(t=>({id:t,property:G,value:!1}));this.store.updateProperty(t),this.onDeselect(this.selected[0]),this.selected=[],this.selectionPoints.delete(),this.midPoints.delete();}deleteSelected(){this.store.delete(this.selected),this.selected=[];}onRightClick(t){if(!this.selectionPoints.ids.length)return;let e,i=Infinity;if(this.selectionPoints.ids.forEach(o=>{const r=this.store.getGeometryCopy(o),s=this.pixelDistance.measure(t,r.coordinates);s<this.pointerDistance&&s<i&&(i=s,e=this.store.getPropertiesCopy(o));}),!e)return;const o=e.selectionPointFeatureId,r=e.index,s=this.store.getPropertiesCopy(o),n=this.flags[s.mode],a=this.validations[s.mode];if(!(n&&n.feature&&n.feature.coordinates&&n.feature.coordinates.deletable))return;const l=this.store.getGeometryCopy(o);let h;if("Polygon"===l.type){if(h=l.coordinates[0],h.length<=4)return}else if("LineString"===l.type&&(h=l.coordinates,h.length<=3))return;if(h){if("Polygon"===l.type&&0===r||r===h.length-1?(h.shift(),h.pop(),h.push([h[0][0],h[0][1]])):h.splice(r,1),a&&!a({id:o,type:"Feature",geometry:l,properties:s},{project:this.project,unproject:this.unproject,coordinatePrecision:this.coordinatePrecision,updateType:L$2.Commit}))return;this.store.delete([...this.midPoints.ids,...this.selectionPoints.ids]),this.store.updateGeometry([{id:o,geometry:l}]),this.selectionPoints.create(h,l.type,o),n&&n.feature&&n.feature.coordinates&&n.feature.coordinates.midpoints&&this.midPoints.create(h,o,this.coordinatePrecision);}}select(t,e=!0){if(this.selected[0]===t)return;const{mode:i}=this.store.getPropertiesCopy(t),o=this.flags[i];if(!o||!o.feature)return;const r=this.selected[0];if(r){if(r===t)return;this.deselect();}e&&this.setCursor(this.cursors.pointerOver),this.selected=[t],this.store.updateProperty([{id:t,property:"selected",value:!0}]),this.onSelect(t);const{type:s,coordinates:n}=this.store.getGeometryCopy(t);if("LineString"!==s&&"Polygon"!==s)return;const a="LineString"===s?n:n[0];a&&o&&o.feature.coordinates&&(this.selectionPoints.create(a,s,t),o.feature.coordinates.midpoints&&this.midPoints.create(a,t,this.coordinatePrecision));}onLeftClick(t){const{clickedFeature:e,clickedMidPoint:i}=this.featuresAtMouseEvent.find(t,this.selected.length>0);if(this.selected.length&&i)this.midPoints.insert(i.id,this.coordinatePrecision);else if(e&&e.id)this.select(e.id,!0);else if(this.selected.length&&this.allowManualDeselection)return void this.deselect()}start(){this.setStarted(),this.setSelecting();}stop(){this.cleanUp(),this.setStarted(),this.setStopped();}onClick(t){"right"!==t.button?"left"===t.button&&this.onLeftClick(t):this.onRightClick(t);}canScale(t){return this.keyEvents.scale&&this.keyEvents.scale.every(e=>t.heldKeys.includes(e))}canRotate(t){return this.keyEvents.rotate&&this.keyEvents.rotate.every(e=>t.heldKeys.includes(e))}preventDefaultKeyEvent(t){const e=this.canRotate(t),i=this.canScale(t);(e||i)&&t.preventDefault();}onKeyDown(t){this.preventDefaultKeyEvent(t);}onKeyUp(t){if(this.preventDefaultKeyEvent(t),this.keyEvents.delete&&t.key===this.keyEvents.delete){if(!this.selected.length)return;this.onDeselect(this.selected[0]),this.deleteSelected(),this.selectionPoints.delete(),this.midPoints.delete();}else this.keyEvents.deselect&&t.key===this.keyEvents.deselect&&this.cleanUp();}cleanUp(){this.selected.length&&this.deselect();}onDragStart(t,e){if(!this.selected.length)return;const i=this.store.getPropertiesCopy(this.selected[0]),o=this.flags[i.mode];if(!(o&&o.feature&&(o.feature.draggable||o.feature.coordinates&&o.feature.coordinates.draggable||o.feature.coordinates&&o.feature.coordinates.resizable)))return;this.dragEventCount=0;const r=this.selected[0],s=this.dragCoordinate.getDraggableIndex(t,r);return o&&o.feature&&o.feature.coordinates&&(o.feature.coordinates.draggable||o.feature.coordinates.resizable)&&-1!==s?(this.setCursor(this.cursors.dragStart),o.feature.coordinates.resizable?this.dragCoordinateResizeFeature.startDragging(r,s):this.dragCoordinate.startDragging(r,s),void e(!1)):o&&o.feature&&o.feature.draggable&&this.dragFeature.canDrag(t,r)?(this.setCursor(this.cursors.dragStart),this.dragFeature.startDragging(t,r),void e(!1)):void 0}onDrag(t,e){const i=this.selected[0];if(!i)return;const o=this.store.getPropertiesCopy(i),r=this.flags[o.mode],s=!0===(r&&r.feature&&r.feature.selfIntersectable);if(this.dragEventCount++,this.dragEventCount%this.dragEventThrottle==0)return;const n=this.validations[o.mode];if(r&&r.feature&&r.feature.rotateable&&this.canRotate(t))return e(!1),void this.rotateFeature.rotate(t,i,n);if(r&&r.feature&&r.feature.scaleable&&this.canScale(t))return e(!1),void this.scaleFeature.scale(t,i,n);if(this.dragCoordinateResizeFeature.isDragging()&&r.feature&&r.feature.coordinates&&r.feature.coordinates.resizable){if("globe"===this.projection)throw new Error("Globe is currently unsupported projection for resizable");return e(!1),void this.dragCoordinateResizeFeature.drag(t,r.feature.coordinates.resizable,n)}this.dragCoordinate.isDragging()?this.dragCoordinate.drag(t,s,n):this.dragFeature.isDragging()?this.dragFeature.drag(t,n):e(!0);}onDragEnd(t,e){this.setCursor(this.cursors.dragEnd),this.dragCoordinate.isDragging()?this.onFinish(this.selected[0],{mode:this.mode,action:"dragCoordinate"}):this.dragFeature.isDragging()?this.onFinish(this.selected[0],{mode:this.mode,action:"dragFeature"}):this.dragCoordinateResizeFeature.isDragging()&&this.onFinish(this.selected[0],{mode:this.mode,action:"dragCoordinateResize"}),this.dragCoordinate.stopDragging(),this.dragFeature.stopDragging(),this.dragCoordinateResizeFeature.stopDragging(),this.rotateFeature.reset(),this.scaleFeature.reset(),e(!0);}onMouseMove(t){if(!this.selected.length)return void this.setCursor("unset");if(this.dragFeature.isDragging())return;let e=!1;this.midPoints.ids.forEach(i=>{if(e)return;const o=this.store.getGeometryCopy(i);this.pixelDistance.measure(t,o.coordinates)<this.pointerDistance&&(e=!0);});let i=!1;if(this.selectionPoints.ids.forEach(o=>{const r=this.store.getGeometryCopy(o);this.pixelDistance.measure(t,r.coordinates)<this.pointerDistance&&(e=!1,i=!0);}),e)return void this.setCursor(this.cursors.insertMidpoint);const{clickedFeature:o}=this.featuresAtMouseEvent.find(t,!0);this.setCursor(this.selected.length>0&&(o&&o.id===this.selected[0]||i)?this.cursors.pointerOver:"unset");}styleFeature(e){const i=t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0});if(e.properties.mode===this.mode&&"Point"===e.geometry.type){if(e.properties.selectionPoint)return i.pointColor=this.getHexColorStylingValue(this.styles.selectionPointColor,i.pointColor,e),i.pointOutlineColor=this.getHexColorStylingValue(this.styles.selectionPointOutlineColor,i.pointOutlineColor,e),i.pointWidth=this.getNumericStylingValue(this.styles.selectionPointWidth,i.pointWidth,e),i.pointOutlineWidth=this.getNumericStylingValue(this.styles.selectionPointOutlineWidth,2,e),i.zIndex=30,i;if(e.properties.midPoint)return i.pointColor=this.getHexColorStylingValue(this.styles.midPointColor,i.pointColor,e),i.pointOutlineColor=this.getHexColorStylingValue(this.styles.midPointOutlineColor,i.pointOutlineColor,e),i.pointWidth=this.getNumericStylingValue(this.styles.midPointWidth,4,e),i.pointOutlineWidth=this.getNumericStylingValue(this.styles.midPointOutlineWidth,2,e),i.zIndex=40,i}else if(e.properties[G]){if("Polygon"===e.geometry.type)return i.polygonFillColor=this.getHexColorStylingValue(this.styles.selectedPolygonColor,i.polygonFillColor,e),i.polygonOutlineWidth=this.getNumericStylingValue(this.styles.selectedPolygonOutlineWidth,i.polygonOutlineWidth,e),i.polygonOutlineColor=this.getHexColorStylingValue(this.styles.selectedPolygonOutlineColor,i.polygonOutlineColor,e),i.polygonFillOpacity=this.getNumericStylingValue(this.styles.selectedPolygonFillOpacity,i.polygonFillOpacity,e),i.zIndex=10,i;if("LineString"===e.geometry.type)return i.lineStringColor=this.getHexColorStylingValue(this.styles.selectedLineStringColor,i.lineStringColor,e),i.lineStringWidth=this.getNumericStylingValue(this.styles.selectedLineStringWidth,i.lineStringWidth,e),i.zIndex=10,i;if("Point"===e.geometry.type)return i.pointWidth=this.getNumericStylingValue(this.styles.selectedPointWidth,i.pointWidth,e),i.pointColor=this.getHexColorStylingValue(this.styles.selectedPointColor,i.pointColor,e),i.pointOutlineColor=this.getHexColorStylingValue(this.styles.selectedPointOutlineColor,i.pointOutlineColor,e),i.pointOutlineWidth=this.getNumericStylingValue(this.styles.selectedPointOutlineWidth,i.pointOutlineWidth,e),i.zIndex=10,i}return i}}class Zt extends X{constructor(...t){super(...t),this.type=T.Static,this.mode="static";}start(){}stop(){}onKeyUp(){}onKeyDown(){}onClick(){}onDragStart(){}onDrag(){}onDragEnd(){}onMouseMove(){}cleanUp(){}styleFeature(){return t({},{polygonFillColor:"#3f97e0",polygonOutlineColor:"#3f97e0",polygonOutlineWidth:4,polygonFillOpacity:.3,pointColor:"#3f97e0",pointOutlineColor:"#ffffff",pointOutlineWidth:0,pointWidth:6,lineStringColor:"#3f97e0",lineStringWidth:4,zIndex:0})}}function qt(t,e,i,o,r){for(;o>i;){if(o-i>600){const s=o-i+1,n=e-i+1,a=Math.log(s),l=.5*Math.exp(2*a/3),h=.5*Math.sqrt(a*l*(s-l)/s)*(n-s/2<0?-1:1);qt(t,e,Math.max(i,Math.floor(e-n*l/s+h)),Math.min(o,Math.floor(e+(s-n)*l/s+h)),r);}const s=t[e];let n=i,a=o;for(Qt(t,i,e),r(t[o],s)>0&&Qt(t,i,o);n<a;){for(Qt(t,n,a),n++,a--;r(t[n],s)<0;)n++;for(;r(t[a],s)>0;)a--;}0===r(t[i],s)?Qt(t,i,a):(a++,Qt(t,a,o)),a<=e&&(i=a+1),e<=a&&(o=a-1);}}function Qt(t,e,i){const o=t[e];t[e]=t[i],t[i]=o;}function te(t,e){ee(t,0,t.children.length,e,t);}function ee(t,e,i,o,r){r||(r=ce([])),r.minX=Infinity,r.minY=Infinity,r.maxX=-Infinity,r.maxY=-Infinity;for(let s=e;s<i;s++){const e=t.children[s];ie$1(r,t.leaf?o(e):e);}return r}function ie$1(t,e){return t.minX=Math.min(t.minX,e.minX),t.minY=Math.min(t.minY,e.minY),t.maxX=Math.max(t.maxX,e.maxX),t.maxY=Math.max(t.maxY,e.maxY),t}function oe(t,e){return t.minX-e.minX}function re(t,e){return t.minY-e.minY}function se(t){return (t.maxX-t.minX)*(t.maxY-t.minY)}function ne(t){return t.maxX-t.minX+(t.maxY-t.minY)}function ae(t,e){const i=Math.max(t.minX,e.minX),o=Math.max(t.minY,e.minY),r=Math.min(t.maxX,e.maxX),s=Math.min(t.maxY,e.maxY);return Math.max(0,r-i)*Math.max(0,s-o)}function le(t,e){return t.minX<=e.minX&&t.minY<=e.minY&&e.maxX<=t.maxX&&e.maxY<=t.maxY}function he(t,e){return e.minX<=t.maxX&&e.minY<=t.maxY&&e.maxX>=t.minX&&e.maxY>=t.minY}function ce(t){return {children:t,height:1,leaf:!0,minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity}}function de(t,e,i,o,r){const s=[e,i];for(;s.length;){if((i=s.pop())-(e=s.pop())<=o)continue;const n=e+Math.ceil((i-e)/o/2)*o;qt(t,n,e,i,r),s.push(e,n,n,i);}}class ue{constructor(t){this._maxEntries=void 0,this._minEntries=void 0,this.data=void 0,this._maxEntries=Math.max(4,t),this._minEntries=Math.max(2,Math.ceil(.4*this._maxEntries)),this.clear();}search(t){let e=this.data;const i=[];if(!he(t,e))return i;const o=this.toBBox,r=[];for(;e;){for(let s=0;s<e.children.length;s++){const n=e.children[s],a=e.leaf?o(n):n;he(t,a)&&(e.leaf?i.push(n):le(t,a)?this._all(n,i):r.push(n));}e=r.pop();}return i}collides(t){let e=this.data;if(he(t,e)){const i=[];for(;e;){for(let o=0;o<e.children.length;o++){const r=e.children[o],s=e.leaf?this.toBBox(r):r;if(he(t,s)){if(e.leaf||le(t,s))return !0;i.push(r);}}e=i.pop();}}return !1}load(t){if(t.length<this._minEntries){for(let e=0;e<t.length;e++)this.insert(t[e]);return}let e=this._build(t.slice(),0,t.length-1,0);if(this.data.children.length)if(this.data.height===e.height)this._splitRoot(this.data,e);else {if(this.data.height<e.height){const t=this.data;this.data=e,e=t;}this._insert(e,this.data.height-e.height-1,!0);}else this.data=e;}insert(t){this._insert(t,this.data.height-1);}clear(){this.data=ce([]);}remove(t){let e=this.data;const i=this.toBBox(t),o=[],r=[];let s,n,a=!1;for(;e||o.length;){if(e||(e=o.pop(),n=o[o.length-1],s=r.pop(),a=!0),e.leaf){const i=e.children.indexOf(t);-1!==i&&(e.children.splice(i,1),o.push(e),this._condense(o));}a||e.leaf||!le(e,i)?n?(s++,e=n.children[s],a=!1):e=null:(o.push(e),r.push(s),s=0,n=e,e=e.children[0]);}}toBBox(t){return t}compareMinX(t,e){return t.minX-e.minX}compareMinY(t,e){return t.minY-e.minY}_all(t,e){const i=[];for(;t;)t.leaf?e.push(...t.children):i.push(...t.children),t=i.pop();return e}_build(t,e,i,o){const r=i-e+1;let s,n=this._maxEntries;if(r<=n)return s=ce(t.slice(e,i+1)),te(s,this.toBBox),s;o||(o=Math.ceil(Math.log(r)/Math.log(n)),n=Math.ceil(r/Math.pow(n,o-1))),s=ce([]),s.leaf=!1,s.height=o;const a=Math.ceil(r/n),l=a*Math.ceil(Math.sqrt(n));de(t,e,i,l,this.compareMinX);for(let r=e;r<=i;r+=l){const e=Math.min(r+l-1,i);de(t,r,e,a,this.compareMinY);for(let i=r;i<=e;i+=a){const r=Math.min(i+a-1,e);s.children.push(this._build(t,i,r,o-1));}}return te(s,this.toBBox),s}_chooseSubtree(t,e,i,o){for(;o.push(e),!e.leaf&&o.length-1!==i;){let i,o=Infinity,n=Infinity;for(let a=0;a<e.children.length;a++){const l=e.children[a],h=se(l),c=(r=t,s=l,(Math.max(s.maxX,r.maxX)-Math.min(s.minX,r.minX))*(Math.max(s.maxY,r.maxY)-Math.min(s.minY,r.minY))-h);c<n?(n=c,o=h<o?h:o,i=l):c===n&&h<o&&(o=h,i=l);}e=i||e.children[0];}var r,s;return e}_insert(t,e,i){const o=i?t:this.toBBox(t),r=[],s=this._chooseSubtree(o,this.data,e,r);for(s.children.push(t),ie$1(s,o);e>=0&&r[e].children.length>this._maxEntries;)this._split(r,e),e--;this._adjustParentBBoxes(o,r,e);}_split(t,e){const i=t[e],o=i.children.length,r=this._minEntries;this._chooseSplitAxis(i,r,o);const s=this._chooseSplitIndex(i,r,o),n=ce(i.children.splice(s,i.children.length-s));n.height=i.height,n.leaf=i.leaf,te(i,this.toBBox),te(n,this.toBBox),e?t[e-1].children.push(n):this._splitRoot(i,n);}_splitRoot(t,e){this.data=ce([t,e]),this.data.height=t.height+1,this.data.leaf=!1,te(this.data,this.toBBox);}_chooseSplitIndex(t,e,i){let o,r=Infinity,s=Infinity;for(let n=e;n<=i-e;n++){const e=ee(t,0,n,this.toBBox),a=ee(t,n,i,this.toBBox),l=ae(e,a),h=se(e)+se(a);l<r?(r=l,o=n,s=h<s?h:s):l===r&&h<s&&(s=h,o=n);}return o||i-e}_chooseSplitAxis(t,e,i){const o=t.leaf?this.compareMinX:oe,r=t.leaf?this.compareMinY:re;this._allDistMargin(t,e,i,o)<this._allDistMargin(t,e,i,r)&&t.children.sort(o);}_allDistMargin(t,e,i,o){t.children.sort(o);const r=this.toBBox,s=ee(t,0,e,r),n=ee(t,i-e,i,r);let a=ne(s)+ne(n);for(let o=e;o<i-e;o++){const e=t.children[o];ie$1(s,t.leaf?r(e):e),a+=ne(s);}for(let o=i-e-1;o>=e;o--){const e=t.children[o];ie$1(n,t.leaf?r(e):e),a+=ne(n);}return a}_adjustParentBBoxes(t,e,i){for(let o=i;o>=0;o--)ie$1(e[o],t);}_condense(t){for(let e,i=t.length-1;i>=0;i--)0===t[i].children.length?i>0?(e=t[i-1].children,e.splice(e.indexOf(t[i]),1)):this.clear():te(t[i],this.toBBox);}}class ge{constructor(t){this.tree=void 0,this.idToNode=void 0,this.nodeToId=void 0,this.tree=new ue(t&&t.maxEntries?t.maxEntries:9),this.idToNode=new Map,this.nodeToId=new Map;}setMaps(t,e){this.idToNode.set(t.id,e),this.nodeToId.set(e,t.id);}toBBox(t){const e=[],i=[];let o;if("Polygon"===t.geometry.type)o=t.geometry.coordinates[0];else if("LineString"===t.geometry.type)o=t.geometry.coordinates;else {if("Point"!==t.geometry.type)throw new Error("Not a valid feature to turn into a bounding box");o=[t.geometry.coordinates];}for(let t=0;t<o.length;t++)i.push(o[t][1]),e.push(o[t][0]);const r=Math.min(...i),s=Math.max(...i);return {minX:Math.min(...e),minY:r,maxX:Math.max(...e),maxY:s}}insert(t){if(this.idToNode.get(String(t.id)))throw new Error("Feature already exists");const e=this.toBBox(t);this.setMaps(t,e),this.tree.insert(e);}load(t){const e=[],i=new Set;t.forEach(t=>{const o=this.toBBox(t);if(this.setMaps(t,o),i.has(String(t.id)))throw new Error(`Duplicate feature ID found ${t.id}`);i.add(String(t.id)),e.push(o);}),this.tree.load(e);}update(t){this.remove(t.id);const e=this.toBBox(t);this.setMaps(t,e),this.tree.insert(e);}remove(t){const e=this.idToNode.get(t);if(!e)throw new Error(`${t} not inserted into the spatial index`);this.tree.remove(e);}clear(){this.tree.clear();}search(t){return this.tree.search(this.toBBox(t)).map(t=>this.nodeToId.get(t))}collides(t){return this.tree.collides(this.toBBox(t))}}const pe={getId:()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){const e=16*Math.random()|0;return ("x"==t?e:3&e|8).toString(16)}),isValidId:t=>"string"==typeof t&&36===t.length};class ye{constructor(t){this.idStrategy=void 0,this.tracked=void 0,this.spatialIndex=void 0,this.store=void 0,this._onChange=()=>{},this.store={},this.spatialIndex=new ge,this.tracked=!t||!1!==t.tracked,this.idStrategy=t&&t.idStrategy?t.idStrategy:pe;}clone(t){return JSON.parse(JSON.stringify(t))}getId(){return this.idStrategy.getId()}has(t){return Boolean(this.store[t])}load(t,e){if(0===t.length)return;const i=this.clone(t);i.forEach(t=>{null==t.id&&(t.id=this.idStrategy.getId()),this.tracked&&(t.properties.createdAt?R(t.properties.createdAt):t.properties.createdAt=+new Date,t.properties.updatedAt?R(t.properties.updatedAt):t.properties.updatedAt=+new Date);});const o=[];i.forEach(t=>{const i=t.id;if(e&&!e(t))throw new Error(`Feature ${i} is not valid: ${JSON.stringify(t)}`);if(this.has(i))throw new Error(`Feature already exists with this id: ${i}`);this.store[i]=t,o.push(i);}),this.spatialIndex.load(i),this._onChange(o,"create");}search(t,e){const i=this.spatialIndex.search(t).map(t=>this.store[t]);return this.clone(e?i.filter(e):i)}registerOnChange(t){this._onChange=(e,i)=>{t(e,i);};}getGeometryCopy(t){const e=this.store[t];if(!e)throw new Error(`No feature with this id (${t}), can not get geometry copy`);return this.clone(e.geometry)}getPropertiesCopy(t){const e=this.store[t];if(!e)throw new Error(`No feature with this id (${t}), can not get properties copy`);return this.clone(e.properties)}updateProperty(t){const e=[];t.forEach(({id:t,property:i,value:o})=>{const r=this.store[t];if(!r)throw new Error(`No feature with this (${t}), can not update geometry`);e.push(t),r.properties[i]=o,this.tracked&&(r.properties.updatedAt=+new Date);}),this._onChange&&this._onChange(e,"update");}updateGeometry(t){const e=[];t.forEach(({id:t,geometry:i})=>{e.push(t);const o=this.store[t];if(!o)throw new Error(`No feature with this (${t}), can not update geometry`);o.geometry=this.clone(i),this.spatialIndex.update(o),this.tracked&&(o.properties.updatedAt=+new Date);}),this._onChange&&this._onChange(e,"update");}create(e){const i=[];return e.forEach(({geometry:e,properties:o})=>{let r,s=t({},o);this.tracked&&(r=+new Date,o?(s.createdAt="number"==typeof o.createdAt?o.createdAt:r,s.updatedAt="number"==typeof o.updatedAt?o.updatedAt:r):s={createdAt:r,updatedAt:r});const n=this.getId(),a={id:n,type:"Feature",geometry:e,properties:s};this.store[n]=a,this.spatialIndex.insert(a),i.push(n);}),this._onChange&&this._onChange([...i],"create"),i}delete(t){t.forEach(t=>{if(!this.store[t])throw new Error("No feature with this id, can not delete");delete this.store[t],this.spatialIndex.remove(t);}),this._onChange&&this._onChange([...t],"delete");}copyAll(){return this.clone(Object.keys(this.store).map(t=>this.store[t]))}clear(){this.store={},this.spatialIndex.clear();}size(){return Object.keys(this.store).length}}class Se{constructor(e){this._modes=void 0,this._mode=void 0,this._adapter=void 0,this._enabled=!1,this._store=void 0,this._eventListeners=void 0,this._instanceSelectMode=void 0,this._adapter=e.adapter,this._mode=new Zt;const i=new Set,o=e.modes.reduce((t,e)=>{if(i.has(e.mode))throw new Error(`There is already a ${e.mode} mode provided`);return i.add(e.mode),t[e.mode]=e,t},{}),r=Object.keys(o);if(0===r.length)throw new Error("No modes provided");r.forEach(t=>{if(o[t].type===T.Select){if(this._instanceSelectMode)throw new Error("only one type of select mode can be provided");this._instanceSelectMode=t;}}),this._modes=t({},o,{static:this._mode}),this._eventListeners={change:[],select:[],deselect:[],finish:[],ready:[]},this._store=new ye({tracked:!!e.tracked,idStrategy:e.idStrategy?e.idStrategy:void 0});const s=t=>{const e=[],i=this._store.copyAll().filter(i=>!t.includes(i.id)||(e.push(i),!1));return {changed:e,unchanged:i}},n=(t,e)=>{this._enabled&&this._eventListeners.finish.forEach(i=>{i(t,e);});},a=(t,e)=>{if(!this._enabled)return;this._eventListeners.change.forEach(i=>{i(t,e);});const{changed:i,unchanged:o}=s(t);"create"===e?this._adapter.render({created:i,deletedIds:[],unchanged:o,updated:[]},this.getModeStyles()):"update"===e?this._adapter.render({created:[],deletedIds:[],unchanged:o,updated:i},this.getModeStyles()):"delete"===e?this._adapter.render({created:[],deletedIds:t,unchanged:o,updated:[]},this.getModeStyles()):"styling"===e&&this._adapter.render({created:[],deletedIds:[],unchanged:o,updated:[]},this.getModeStyles());},l=t=>{if(!this._enabled)return;this._eventListeners.select.forEach(e=>{e(t);});const{changed:e,unchanged:i}=s([t]);this._adapter.render({created:[],deletedIds:[],unchanged:i,updated:e},this.getModeStyles());},h=t=>{if(!this._enabled)return;this._eventListeners.deselect.forEach(t=>{t();});const{changed:e,unchanged:i}=s([t]);e&&this._adapter.render({created:[],deletedIds:[],unchanged:i,updated:e},this.getModeStyles());};Object.keys(this._modes).forEach(t=>{this._modes[t].register({mode:t,store:this._store,setCursor:this._adapter.setCursor.bind(this._adapter),project:this._adapter.project.bind(this._adapter),unproject:this._adapter.unproject.bind(this._adapter),setDoubleClickToZoom:this._adapter.setDoubleClickToZoom.bind(this._adapter),onChange:a,onSelect:l,onDeselect:h,onFinish:n,coordinatePrecision:this._adapter.getCoordinatePrecision()});});}checkEnabled(){if(!this._enabled)throw new Error("Terra Draw is not enabled")}getModeStyles(){const t={};return Object.keys(this._modes).forEach(e=>{t[e]=t=>this._instanceSelectMode&&t.properties[G]?this._modes[this._instanceSelectMode].styleFeature.bind(this._modes[this._instanceSelectMode])(t):this._modes[e].styleFeature.bind(this._modes[e])(t);}),t}featuresAtLocation({lng:t,lat:e},o){const r=o&&void 0!==o.pointerDistance?o.pointerDistance:30,s=!o||void 0===o.ignoreSelectFeatures||o.ignoreSelectFeatures,n=this._adapter.unproject.bind(this._adapter),a=this._adapter.project.bind(this._adapter),l=a(t,e),h=ut({unproject:n,point:l,pointerDistance:r});return this._store.search(h).filter(o=>{if(s&&(o.properties[N]||o.properties.selectionPoint))return !1;if("Point"===o.geometry.type){const t=o.geometry.coordinates,e=a(t[0],t[1]);return i$1(l,e)<r}if("LineString"===o.geometry.type){const t=o.geometry.coordinates;for(let e=0;e<t.length-1;e++){const i=t[e],o=t[e+1];if(At(l,a(i[0],i[1]),a(o[0],o[1]))<r)return !0}return !1}return !!Vt([t,e],o.geometry.coordinates)||void 0})}getSelectMode(){if(this.checkEnabled(),!this._instanceSelectMode)throw new Error("No select mode defined in instance");return this.getMode()!==this._instanceSelectMode&&this.setMode(this._instanceSelectMode),this._modes[this._instanceSelectMode]}setModeStyles(t,e){if(this.checkEnabled(),!this._modes[t])throw new Error("No mode with this name present");this._modes[t].styles=e;}getSnapshot(){return this._store.copyAll()}clear(){this.checkEnabled(),this._adapter.clear();}get enabled(){return this._enabled}set enabled(t){throw new Error("Enabled is read only")}getMode(){return this._mode.mode}setMode(t){if(this.checkEnabled(),!this._modes[t])throw new Error("No mode with this name present");this._mode.stop(),this._mode=this._modes[t],this._mode.start();}removeFeatures(t){this.checkEnabled(),this._store.delete(t);}selectFeature(t){this.getSelectMode().selectFeature(t);}deselectFeature(t){this.getSelectMode().deselectFeature(t);}getFeatureId(){return this._store.getId()}hasFeature(t){return this._store.has(t)}addFeatures(t){this.checkEnabled(),0!==t.length&&this._store.load(t,t=>{if(Boolean(t&&"object"==typeof t&&"properties"in t&&"object"==typeof t.properties&&null!==t.properties&&"mode"in t.properties)){const e=this._modes[t.properties.mode];return !!e&&e.validateFeature.bind(e)(t)}return !1});}start(){this._enabled=!0,this._adapter.register({onReady:()=>{this._eventListeners.ready.forEach(t=>{t();});},getState:()=>this._mode.state,onClick:t=>{this._mode.onClick(t);},onMouseMove:t=>{this._mode.onMouseMove(t);},onKeyDown:t=>{this._mode.onKeyDown(t);},onKeyUp:t=>{this._mode.onKeyUp(t);},onDragStart:(t,e)=>{this._mode.onDragStart(t,e);},onDrag:(t,e)=>{this._mode.onDrag(t,e);},onDragEnd:(t,e)=>{this._mode.onDragEnd(t,e);},onClear:()=>{this._mode.cleanUp(),this._store.clear();}});}getFeaturesAtLngLat(t,e){const{lng:i,lat:o}=t;return this.featuresAtLocation({lng:i,lat:o},e)}getFeaturesAtPointerEvent(t,e){const i=this._adapter.getLngLatFromEvent.bind(this._adapter)(t);return null===i?[]:this.featuresAtLocation(i,e)}stop(){this._enabled=!1,this._adapter.unregister();}on(t,e){const i=this._eventListeners[t];i.includes(e)||i.push(e);}off(t,e){const i=this._eventListeners[t];i.includes(e)&&i.splice(i.indexOf(e),1);}}

  // ref: https://github.com/JamesLMilner/terra-draw/blob/main/guides/4.MODES.md#selection-mode
  const BasicDrawComponent = (adapter, options = {}) =>
    new Se({
      adapter,
      modes: [
        new Jt({
          modename: 'modify',
          flags: {
            render: {
              feature: {
                // draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                  validation: () => true,
                },
              },
            },
          },
        }),
        new wt(),
        new St(),
        new Ft(),
        new ht(),
        new Dt(),
        new kt({
          modeName: 'render',
          // TODO More styles by feature properties
          styles: {
            pointColor: 'red',
            pointOutlineWidth: 2,
            lineStringColor: 'red',
            lineStringWidth: 2,
            polygonFillColor: '#00FFFF',
            polygonFillOpacity: 0,
            polygonOutlineColor: 'red',
            polygonOutlineWidth: 2,
          },
        }),
      ],
      ...options,
    });

  const addSimpleSelector = (target, draw, options = {}) => {
    const selector = document.createElement('select');
    target.appendChild(selector);
    selector.name = 'Draw';
    selector.style =
      'position: absolute; top: 0.5rem; right: 0.5rem; z-index: 1000;';
    selector.innerHTML = `
      <option class="bold-option" value="nothing">Draw Something</option>
      <optgroup label="Edit Features">
        <option class="bold-option" value="modify">✎ MODIFY</option>
        <option class="bold-option" value="delete">🗑 DELETE</option>
        <option class="bold-option" value="clear"> 🧹 CLEAR</option>
      </optgroup>
      <optgroup label="Draw">
        <option value="point">⢌ Points</option>
        <option value="linestring">☇ linestring</option>
        <option value="polygon">⬠ Polygon</option>
        <option value="circle">⃝  Circle</option>
        <option value="rectangle">◻ Rectangle</option>
      </optgroup>
      <optgroup label="Extra">
        <option value="features">View Features</option>
      </optgroup>
    `;

    draw.start();
    draw.setMode('render');

    // Resume drawn features
    const storageId = target.id
      ? `terra-draw-data-${target.id}`
      : 'terra-draw-data';
    const featureData = window.localStorage.getItem(storageId);
    if (featureData) {
      try {
        const features = JSON.parse(featureData);
        features.forEach(f => (f.properties = { mode: 'render' }));
        draw.addFeatures(features);
      } catch (err) {
        console.warn(
          'Fail to drawn features from Local Storage.',
          featureData,
          err,
        );
        window.localStorage.removeItem(storageId);
      }
    }

    const cursorHolder = target.querySelector('canvas') ?? target;
    selector.onchange = () => {
      selector.children[0].textContent = '--STOP--';
      cursorHolder.style.removeProperty('cursor');
      const features = draw.getSnapshot();

      switch (selector.value) {
        case 'nothing':
          draw.setMode('render');
          selector.children[0].textContent = 'Draw Something';
          break
        case 'modify':
          draw.setMode('select');
          break
        case 'delete':
          draw.setMode('render');
          cursorHolder.style.cursor = 'not-allowed';
          break
        case 'clear':
          window.localStorage.removeItem(storageId);
          selector.value = 'nothing';
          selector.onchange();
          draw.clear();
          break
        case 'features':
          window.alert(
            `${features.length} features\n\n${JSON.stringify(features, null, 4)}`,
          );
          break
        default:
          draw.setMode(selector.value);
          break
      }
    };

    draw.on('change', () => {});
    draw.on('finish', (id, context) => {
      if (context.action === 'draw') {
        const feature = draw.getSnapshot().find(feature => feature.id === id);
        if (feature) {
          draw.removeFeatures([id]);
          feature.properties.mode = 'render';
          draw.addFeatures([feature]);
        }
      }

      const idFilter = options.idFilter ?? (() => true);
      const features = draw.getSnapshot().filter(idFilter);
      window.localStorage.setItem(storageId, JSON.stringify(features));

      if (context.mode !== 'point' && context.action === 'draw') {
        selector.value = 'nothing';
        selector.onchange();
      }
    });
    document.onclick = event => {
      if (selector.value === 'delete') {
        const features = draw.getFeaturesAtPointerEvent(event, {
          pointerDistance: 40,
        });
        if (features.length > 0) {
          draw.removeFeatures([features[0].id]);
          if (draw.getSnapshot().length === 0) {
            selector.value = 'nothing';
            selector.onchange();
          }
        }
      }
    };
  };

  /**
   * loadCSS.
   * @description Dynamically import CSS, simply add stylesheet at <head>
   * @param {String} url
   */
  const loadCSS = url => {
    if (document.head.querySelector(`link[href="${url}"]`)) return

    const link = document.createElement('link');
    Object.assign(link, {
      rel: 'stylesheet',
      href: url,
      onerror: () => console.warn('Fail to load stylesheet:', url),
    });
    document.head.appendChild(link);
  };

  /**
   * MapOption.
   * @description Class for valid options
   */
  class MapOption {
    constructor ({ name, desc, example, exampleDesc, isValid }) {
      this.name = name;
      this.desc = desc;
      this.example = example;
      this.exampleDesc = exampleDesc;
      this.isValid = isValid;
    }

    valueOf () {
      return this.name
    }
  }

  /**
   * Class: base class for Map Renderer
   */
  class defaultExport {
    // properties {{{
    width = '300px'
    height = '300px'
    center = [121, 24]
    zoom = 7
    control = {
      scale: false,
      fullscreen: false,
    }

    layers = []
    data = []
    aliases = []
    svgPin = {
      html: '<svg display="block" height="41px" width="27px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="#3FB1CE"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>',
      size: [27, 41],
      anchor: [13.5, 35.25],
    }

    get map () {
      if (this._map === undefined) {
        throw Error('map is not set in current Renderer')
      }
      return this._map
    }

    set map (value) {
      if (this._map) throw Error('map cannot be reassigned')
      this._map = value;
    }

    get steps () {
      return [
        this.setOptionAliases,
        this.createView,
        this.addMap,
        this.setControl,
        this.addTileData,
        this.addGPXFile,
        this.getTerraDrawAdapter,
        {
          valueOf: () => this.setDraw,
          depends: this.getTerraDrawAdapter,
        },
        this.setExtra,
      ]
    }

    // }}}
    validateOption (option, value) {
      const isValid = this.constructor.validOptions.find(
        opt => opt.valueOf() === option,
      )?.isValid;
      if (!isValid) { throw Error(`Cannot find inValid method for option ${option}`) }

      return isValid(value)
    }

    // Valid Options {{{
    static validOptions = Object.freeze([
      new MapOption({
        name: 'id',
        desc: 'id of map HTML element',
        isValid: value => (!!value?.match(/\w+/)),
      }),
      new MapOption({
        name: 'width',
        desc: 'CSS width of map HTML element',
        example: '200px',
        exampleDesc: '',
        isValid: value => window.CSS.supports(`width: ${value}`),
      }),
      new MapOption({
        name: 'height',
        desc: 'CSS height of map HTML element',
        example: '200px',
        exampleDesc: '',
        isValid: value => window.CSS.supports(`height: ${value}`),
      }),
      new MapOption({
        name: 'center',
        desc: 'Center of camera map, value: [lon, lat]',
        example: '[121, 24]',
        exampleDesc: 'Center of Taiwan',
        isValid: value => {
          // TODO xy value other than WGS84
          try {
            const [x, y] = JSON.parse(value);
            return !isNaN(x) && !isNaN(y)
          } catch {
            return false
          }
        },
      }),
      new MapOption({
        name: 'zoom',
        desc: 'Zoom level for map camera, number between: 0-22',
        example: '7.0',
        exampleDesc: 'Small country / US state',
        isValid: value => {
          const zoom = Number(value);
          return !isNaN(zoom) && zoom >= 0 && zoom <= 22
        },
      }),
      new MapOption({
        name: 'control',
        desc: 'Object of control options, supports: fullscreen, scale',
        example: '\n  scale: true',
        exampleDesc: 'Add Scale bar',
        isValid: value => typeof value === 'object',
      }),
      new MapOption({
        name: 'debug',
        desc: 'Set true to show tile boundary',
        example: 'true',
        exampleDesc: '',
        isValid: value => value === 'true',
      }),
      new MapOption({
        name: 'XYZ',
        desc: 'Raster tile format with {x}, {y} and {z}',
        example:
          'https://tile.openstreetmap.jp/styles/osm-bright/512/{z}/{x}/{y}.png',
        exampleDesc: 'Tile from OSM Japan!',
        isValid: value => {
          return (
            URL.parse(value) &&
            value.includes('{x}') &&
            value.includes('{y}') &&
            value.includes('z')
          )
        },
      }),
      new MapOption({
        name: 'GPX',
        desc: 'URL of GPX file',
        example:
          'https://raw.githubusercontent.com/openlayers/openlayers/main/examples/data/gpx/fells_loop.gpx',
        exampleDesc: 'Example from topografix',
        isValid: value => URL.parse(value),
      }),
      new MapOption({
        name: 'WMTS',
        desc: 'URL of WMTS document',
        example: 'https://gis.sinica.edu.tw/tileserver/wmts',
        exampleDesc: 'SINICA Taiwan',
        isValid: value => URL.parse(value),
      }),
      new MapOption({
        name: 'draw',
        desc: 'Draw Something on map',
        example: 'true',
        exampleDesc: 'Enable Draw Tools',
        isValid: value => value === 'true',
      }),
      new MapOption({
        name: 'eval',
        desc: 'Custom Script',
        example: "console.log('this', this)",
        exampleDesc: 'Print Renderer info',
        isValid: () => true,
      }),
    ])
    // }}}

    setOptionAliases (config) {
      if (config.XYZ) {
        const xyzArray =
          typeof config.XYZ === 'string' ? [config.XYZ] : config.XYZ;
        xyzArray.forEach(record => {
          let obj;
          let url;
          if (typeof record === 'string') {
            url = new URL(record);
            obj = {
              type: 'tile',
              url: record,
              title: `${url.host}${url.pathname.split('%7B')[0]}`,
            };
          } else if (typeof record === 'object') {
            url = new URL(record.url);
            obj = {
              type: 'tile',
              url: record.url,
              title: record.title
                ? record.title
                : `${url.host}${url.pathname.split('%7B')[0]}`,
            };
          } else {
            return
          }
          config.data.push(obj);
        });
        delete config.XYZ;
      }

      if (config.WMTS) {
        config.data.push({
          type: 'wmts',
          url: config.aliases[config.WMTS] ?? config.WMTS,
        });
        delete config.WMTS;
      }

      if (config.GPX) {
        config.data.push({
          type: 'gpx',
          url: config.GPX,
        });
        delete config.GPX;
      }

      // Replace aliases into real string
      if (
        typeof config.center === 'string' &&
        Object.prototype.hasOwnProperty.call(config.aliases, config.center)
      ) {
        config.center = config.aliases[config.center];
      }
      config.data?.forEach(record => {
        if (Object.prototype.hasOwnProperty.call(config.aliases, record.url)) {
          record.title = record.url;
          record.url = config.aliases[record.url];
        }
      });
    }

    createView ({ target, width, height }) {
      target.style.width = width;
      target.style.height = height;
      if (window.getComputedStyle(target.parentElement).display === 'flex') {
        target.style.flexBasis = `calc(${width})`;
      }
    }

    setDraw = ({ target, terraDrawAdapter }) => {
      const idPrefix = target?.id ? target.id + '-' : '';
      const options = {
        idStrategy: {
          isValidId: _ => true,
          getId: (function () {
            let id = idPrefix + window.crypto.randomUUID();
            return function () {
              id = idPrefix + window.crypto.randomUUID();
              return id
            }
          })(),
        },
      };
      this.terraDraw = BasicDrawComponent(terraDrawAdapter, options);
      addSimpleSelector(target, this.terraDraw, {
        idFilter: feature => feature.id.startsWith(idPrefix),
      });

      return this.terraDraw
    }

    getTerraDrawAdapter () {
      return { state: 'skip' }
    }

    addTileData () {
      return { state: 'skip' }
    }

    addGPXFile () {
      return { state: 'skip' }
    }

    addMarker () {
      return { state: 'skip' }
    }

    setControl () {
      return { state: 'skip' }
    }

    setExtra () {
      return { state: 'skip' }
    }

    updateCamera () {
      return { state: 'skip' }
    }

    project () {
      return { state: 'skip' }
    }

    unproject () {
      return { state: 'skip' }
    }

    restoreCamera () {
      this.updateCamera({ center: this.center, zoom: this.zoom });
    }

    showLayerSwitcher (data) {
      const wmtsRecords = data.filter(record => record.type === 'wmts');
      const tileRecords = data.filter(record => record.type === 'tile');

      return wmtsRecords.length > 0 || tileRecords.length > 1
    }

    propsForEval () {
      let currentPrototype = this;
      let props = [];
      let entries = [];
      while (currentPrototype !== Object.prototype) {
        props = props.concat(Object.getOwnPropertyNames(currentPrototype));
        entries = entries.concat(Object.entries(currentPrototype));
        currentPrototype = Object.getPrototypeOf(currentPrototype);
      }
      return props
    }

    evalScript (script, entries = []) {
      const props = this.propsForEval();
      const extraArgNames = entries.map(([key, _]) => key);
      const args = [
        ...props.map(prop => this[prop]),
        ...entries.map(([_, value]) => value),
      ];
      /* eslint no-new-func: 0 */
      const func = Function([...props, ...extraArgNames], script).bind(
        this,
        ...args,
      );

      try {
        return func()
      } catch (err) {
        console.warn('Fail to run custom script:', err);
        return null
      }
    }
  }

  /*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
  function isNothing(subject) {
    return (typeof subject === 'undefined') || (subject === null);
  }


  function isObject(subject) {
    return (typeof subject === 'object') && (subject !== null);
  }


  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];

    return [ sequence ];
  }


  function extend$1(target, source) {
    var index, length, key, sourceKeys;

    if (source) {
      sourceKeys = Object.keys(source);

      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }

    return target;
  }


  function repeat(string, count) {
    var result = '', cycle;

    for (cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }

    return result;
  }


  function isNegativeZero(number) {
    return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
  }


  var isNothing_1      = isNothing;
  var isObject_1       = isObject;
  var toArray_1        = toArray;
  var repeat_1         = repeat;
  var isNegativeZero_1 = isNegativeZero;
  var extend_1         = extend$1;

  var common = {
  	isNothing: isNothing_1,
  	isObject: isObject_1,
  	toArray: toArray_1,
  	repeat: repeat_1,
  	isNegativeZero: isNegativeZero_1,
  	extend: extend_1
  };

  // YAML error class. http://stackoverflow.com/questions/8458984


  function formatError(exception, compact) {
    var where = '', message = exception.reason || '(unknown reason)';

    if (!exception.mark) return message;

    if (exception.mark.name) {
      where += 'in "' + exception.mark.name + '" ';
    }

    where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

    if (!compact && exception.mark.snippet) {
      where += '\n\n' + exception.mark.snippet;
    }

    return message + ' ' + where;
  }


  function YAMLException$1(reason, mark) {
    // Super constructor
    Error.call(this);

    this.name = 'YAMLException';
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);

    // Include stack trace in error object
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = (new Error()).stack || '';
    }
  }


  // Inherit from Error
  YAMLException$1.prototype = Object.create(Error.prototype);
  YAMLException$1.prototype.constructor = YAMLException$1;


  YAMLException$1.prototype.toString = function toString(compact) {
    return this.name + ': ' + formatError(this, compact);
  };


  var exception = YAMLException$1;

  // get snippet for a single line, respecting maxLength
  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    var head = '';
    var tail = '';
    var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

    if (position - lineStart > maxHalfLength) {
      head = ' ... ';
      lineStart = position - maxHalfLength + head.length;
    }

    if (lineEnd - position > maxHalfLength) {
      tail = ' ...';
      lineEnd = position + maxHalfLength - tail.length;
    }

    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
      pos: position - lineStart + head.length // relative position
    };
  }


  function padStart(string, max) {
    return common.repeat(' ', max - string.length) + string;
  }


  function makeSnippet(mark, options) {
    options = Object.create(options || null);

    if (!mark.buffer) return null;

    if (!options.maxLength) options.maxLength = 79;
    if (typeof options.indent      !== 'number') options.indent      = 1;
    if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
    if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

    var re = /\r?\n|\r|\0/g;
    var lineStarts = [ 0 ];
    var lineEnds = [];
    var match;
    var foundLineNo = -1;

    while ((match = re.exec(mark.buffer))) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);

      if (mark.position <= match.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }

    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

    var result = '', i, line;
    var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

    for (i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      line = getLine(
        mark.buffer,
        lineStarts[foundLineNo - i],
        lineEnds[foundLineNo - i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
        maxLineLength
      );
      result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
        ' | ' + line.str + '\n' + result;
    }

    line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
    result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

    for (i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      line = getLine(
        mark.buffer,
        lineStarts[foundLineNo + i],
        lineEnds[foundLineNo + i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
        maxLineLength
      );
      result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
        ' | ' + line.str + '\n';
    }

    return result.replace(/\n$/, '');
  }


  var snippet = makeSnippet;

  var TYPE_CONSTRUCTOR_OPTIONS = [
    'kind',
    'multi',
    'resolve',
    'construct',
    'instanceOf',
    'predicate',
    'represent',
    'representName',
    'defaultStyle',
    'styleAliases'
  ];

  var YAML_NODE_KINDS = [
    'scalar',
    'sequence',
    'mapping'
  ];

  function compileStyleAliases(map) {
    var result = {};

    if (map !== null) {
      Object.keys(map).forEach(function (style) {
        map[style].forEach(function (alias) {
          result[String(alias)] = style;
        });
      });
    }

    return result;
  }

  function Type$1(tag, options) {
    options = options || {};

    Object.keys(options).forEach(function (name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });

    // TODO: Add tag format check.
    this.options       = options; // keep original options in case user wants to extend this type later
    this.tag           = tag;
    this.kind          = options['kind']          || null;
    this.resolve       = options['resolve']       || function () { return true; };
    this.construct     = options['construct']     || function (data) { return data; };
    this.instanceOf    = options['instanceOf']    || null;
    this.predicate     = options['predicate']     || null;
    this.represent     = options['represent']     || null;
    this.representName = options['representName'] || null;
    this.defaultStyle  = options['defaultStyle']  || null;
    this.multi         = options['multi']         || false;
    this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }

  var type = Type$1;

  /*eslint-disable max-len*/





  function compileList(schema, name) {
    var result = [];

    schema[name].forEach(function (currentType) {
      var newIndex = result.length;

      result.forEach(function (previousType, previousIndex) {
        if (previousType.tag === currentType.tag &&
            previousType.kind === currentType.kind &&
            previousType.multi === currentType.multi) {

          newIndex = previousIndex;
        }
      });

      result[newIndex] = currentType;
    });

    return result;
  }


  function compileMap(/* lists... */) {
    var result = {
          scalar: {},
          sequence: {},
          mapping: {},
          fallback: {},
          multi: {
            scalar: [],
            sequence: [],
            mapping: [],
            fallback: []
          }
        }, index, length;

    function collectType(type) {
      if (type.multi) {
        result.multi[type.kind].push(type);
        result.multi['fallback'].push(type);
      } else {
        result[type.kind][type.tag] = result['fallback'][type.tag] = type;
      }
    }

    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }


  function Schema$1(definition) {
    return this.extend(definition);
  }


  Schema$1.prototype.extend = function extend(definition) {
    var implicit = [];
    var explicit = [];

    if (definition instanceof type) {
      // Schema.extend(type)
      explicit.push(definition);

    } else if (Array.isArray(definition)) {
      // Schema.extend([ type1, type2, ... ])
      explicit = explicit.concat(definition);

    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);

    } else {
      throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
        'or a schema definition ({ implicit: [...], explicit: [...] })');
    }

    implicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }

      if (type$1.loadKind && type$1.loadKind !== 'scalar') {
        throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
      }

      if (type$1.multi) {
        throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
      }
    });

    explicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }
    });

    var result = Object.create(Schema$1.prototype);

    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);

    result.compiledImplicit = compileList(result, 'implicit');
    result.compiledExplicit = compileList(result, 'explicit');
    result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

    return result;
  };


  var schema = Schema$1;

  var str = new type('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: function (data) { return data !== null ? data : ''; }
  });

  var seq = new type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) { return data !== null ? data : []; }
  });

  var map = new type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) { return data !== null ? data : {}; }
  });

  var failsafe = new schema({
    explicit: [
      str,
      seq,
      map
    ]
  });

  function resolveYamlNull(data) {
    if (data === null) return true;

    var max = data.length;

    return (max === 1 && data === '~') ||
           (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
  }

  function constructYamlNull() {
    return null;
  }

  function isNull(object) {
    return object === null;
  }

  var _null = new type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function () { return '~';    },
      lowercase: function () { return 'null'; },
      uppercase: function () { return 'NULL'; },
      camelcase: function () { return 'Null'; },
      empty:     function () { return '';     }
    },
    defaultStyle: 'lowercase'
  });

  function resolveYamlBoolean(data) {
    if (data === null) return false;

    var max = data.length;

    return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
           (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
  }

  function constructYamlBoolean(data) {
    return data === 'true' ||
           data === 'True' ||
           data === 'TRUE';
  }

  function isBoolean(object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
  }

  var bool = new type('tag:yaml.org,2002:bool', {
    kind: 'scalar',
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function (object) { return object ? 'true' : 'false'; },
      uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
      camelcase: function (object) { return object ? 'True' : 'False'; }
    },
    defaultStyle: 'lowercase'
  });

  function isHexCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
           ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
           ((0x61/* a */ <= c) && (c <= 0x66/* f */));
  }

  function isOctCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
  }

  function isDecCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
  }

  function resolveYamlInteger(data) {
    if (data === null) return false;

    var max = data.length,
        index = 0,
        hasDigits = false,
        ch;

    if (!max) return false;

    ch = data[index];

    // sign
    if (ch === '-' || ch === '+') {
      ch = data[++index];
    }

    if (ch === '0') {
      // 0
      if (index + 1 === max) return true;
      ch = data[++index];

      // base 2, base 8, base 16

      if (ch === 'b') {
        // base 2
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (ch !== '0' && ch !== '1') return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }


      if (ch === 'x') {
        // base 16
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }


      if (ch === 'o') {
        // base 8
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }
    }

    // base 10 (except 0)

    // value should not start with `_`;
    if (ch === '_') return false;

    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }

    // Should have digits and should not end with `_`
    if (!hasDigits || ch === '_') return false;

    return true;
  }

  function constructYamlInteger(data) {
    var value = data, sign = 1, ch;

    if (value.indexOf('_') !== -1) {
      value = value.replace(/_/g, '');
    }

    ch = value[0];

    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1;
      value = value.slice(1);
      ch = value[0];
    }

    if (value === '0') return 0;

    if (ch === '0') {
      if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
      if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
      if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
    }

    return sign * parseInt(value, 10);
  }

  function isInteger(object) {
    return (Object.prototype.toString.call(object)) === '[object Number]' &&
           (object % 1 === 0 && !common.isNegativeZero(object));
  }

  var int = new type('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
      octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
      decimal:     function (obj) { return obj.toString(10); },
      /* eslint-disable max-len */
      hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary:      [ 2,  'bin' ],
      octal:       [ 8,  'oct' ],
      decimal:     [ 10, 'dec' ],
      hexadecimal: [ 16, 'hex' ]
    }
  });

  var YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
    // .2e4, .2
    // special case, seems not from spec
    '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
    // .inf
    '|[-+]?\\.(?:inf|Inf|INF)' +
    // .nan
    '|\\.(?:nan|NaN|NAN))$');

  function resolveYamlFloat(data) {
    if (data === null) return false;

    if (!YAML_FLOAT_PATTERN.test(data) ||
        // Quick hack to not allow integers end with `_`
        // Probably should update regexp & check speed
        data[data.length - 1] === '_') {
      return false;
    }

    return true;
  }

  function constructYamlFloat(data) {
    var value, sign;

    value  = data.replace(/_/g, '').toLowerCase();
    sign   = value[0] === '-' ? -1 : 1;

    if ('+-'.indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }

    if (value === '.inf') {
      return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

    } else if (value === '.nan') {
      return NaN;
    }
    return sign * parseFloat(value, 10);
  }


  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

  function representYamlFloat(object, style) {
    var res;

    if (isNaN(object)) {
      switch (style) {
        case 'lowercase': return '.nan';
        case 'uppercase': return '.NAN';
        case 'camelcase': return '.NaN';
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase': return '.inf';
        case 'uppercase': return '.INF';
        case 'camelcase': return '.Inf';
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase': return '-.inf';
        case 'uppercase': return '-.INF';
        case 'camelcase': return '-.Inf';
      }
    } else if (common.isNegativeZero(object)) {
      return '-0.0';
    }

    res = object.toString(10);

    // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requres dot: 5.e-100. Fix it with simple hack

    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }

  function isFloat(object) {
    return (Object.prototype.toString.call(object) === '[object Number]') &&
           (object % 1 !== 0 || common.isNegativeZero(object));
  }

  var float = new type('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: 'lowercase'
  });

  var json = failsafe.extend({
    implicit: [
      _null,
      bool,
      int,
      float
    ]
  });

  var core = json;

  var YAML_DATE_REGEXP = new RegExp(
    '^([0-9][0-9][0-9][0-9])'          + // [1] year
    '-([0-9][0-9])'                    + // [2] month
    '-([0-9][0-9])$');                   // [3] day

  var YAML_TIMESTAMP_REGEXP = new RegExp(
    '^([0-9][0-9][0-9][0-9])'          + // [1] year
    '-([0-9][0-9]?)'                   + // [2] month
    '-([0-9][0-9]?)'                   + // [3] day
    '(?:[Tt]|[ \\t]+)'                 + // ...
    '([0-9][0-9]?)'                    + // [4] hour
    ':([0-9][0-9])'                    + // [5] minute
    ':([0-9][0-9])'                    + // [6] second
    '(?:\\.([0-9]*))?'                 + // [7] fraction
    '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
    '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }

  function constructYamlTimestamp(data) {
    var match, year, month, day, hour, minute, second, fraction = 0,
        delta = null, tz_hour, tz_minute, date;

    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

    if (match === null) throw new Error('Date resolve error');

    // match: [1] year [2] month [3] day

    year = +(match[1]);
    month = +(match[2]) - 1; // JS month starts with 0
    day = +(match[3]);

    if (!match[4]) { // no hour
      return new Date(Date.UTC(year, month, day));
    }

    // match: [4] hour [5] minute [6] second [7] fraction

    hour = +(match[4]);
    minute = +(match[5]);
    second = +(match[6]);

    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) { // milli-seconds
        fraction += '0';
      }
      fraction = +fraction;
    }

    // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

    if (match[9]) {
      tz_hour = +(match[10]);
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
      if (match[9] === '-') delta = -delta;
    }

    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

    if (delta) date.setTime(date.getTime() - delta);

    return date;
  }

  function representYamlTimestamp(object /*, style*/) {
    return object.toISOString();
  }

  var timestamp = new type('tag:yaml.org,2002:timestamp', {
    kind: 'scalar',
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });

  function resolveYamlMerge(data) {
    return data === '<<' || data === null;
  }

  var merge = new type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
  });

  /*eslint-disable no-bitwise*/





  // [ 64, 65, 66 ] -> [ padding, CR, LF ]
  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


  function resolveYamlBinary(data) {
    if (data === null) return false;

    var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

    // Convert one by one.
    for (idx = 0; idx < max; idx++) {
      code = map.indexOf(data.charAt(idx));

      // Skip CR/LF
      if (code > 64) continue;

      // Fail on illegal characters
      if (code < 0) return false;

      bitlen += 6;
    }

    // If there are any bits left, source was corrupted
    return (bitlen % 8) === 0;
  }

  function constructYamlBinary(data) {
    var idx, tailbits,
        input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
        max = input.length,
        map = BASE64_MAP,
        bits = 0,
        result = [];

    // Collect by 6*4 bits (3 bytes)

    for (idx = 0; idx < max; idx++) {
      if ((idx % 4 === 0) && idx) {
        result.push((bits >> 16) & 0xFF);
        result.push((bits >> 8) & 0xFF);
        result.push(bits & 0xFF);
      }

      bits = (bits << 6) | map.indexOf(input.charAt(idx));
    }

    // Dump tail

    tailbits = (max % 4) * 6;

    if (tailbits === 0) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    } else if (tailbits === 18) {
      result.push((bits >> 10) & 0xFF);
      result.push((bits >> 2) & 0xFF);
    } else if (tailbits === 12) {
      result.push((bits >> 4) & 0xFF);
    }

    return new Uint8Array(result);
  }

  function representYamlBinary(object /*, style*/) {
    var result = '', bits = 0, idx, tail,
        max = object.length,
        map = BASE64_MAP;

    // Convert every three bytes to 4 ASCII characters.

    for (idx = 0; idx < max; idx++) {
      if ((idx % 3 === 0) && idx) {
        result += map[(bits >> 18) & 0x3F];
        result += map[(bits >> 12) & 0x3F];
        result += map[(bits >> 6) & 0x3F];
        result += map[bits & 0x3F];
      }

      bits = (bits << 8) + object[idx];
    }

    // Dump tail

    tail = max % 3;

    if (tail === 0) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    } else if (tail === 2) {
      result += map[(bits >> 10) & 0x3F];
      result += map[(bits >> 4) & 0x3F];
      result += map[(bits << 2) & 0x3F];
      result += map[64];
    } else if (tail === 1) {
      result += map[(bits >> 2) & 0x3F];
      result += map[(bits << 4) & 0x3F];
      result += map[64];
      result += map[64];
    }

    return result;
  }

  function isBinary(obj) {
    return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
  }

  var binary = new type('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });

  var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
  var _toString$2       = Object.prototype.toString;

  function resolveYamlOmap(data) {
    if (data === null) return true;

    var objectKeys = [], index, length, pair, pairKey, pairHasKey,
        object = data;

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;

      if (_toString$2.call(pair) !== '[object Object]') return false;

      for (pairKey in pair) {
        if (_hasOwnProperty$3.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }

      if (!pairHasKey) return false;

      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
      else return false;
    }

    return true;
  }

  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }

  var omap = new type('tag:yaml.org,2002:omap', {
    kind: 'sequence',
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });

  var _toString$1 = Object.prototype.toString;

  function resolveYamlPairs(data) {
    if (data === null) return true;

    var index, length, pair, keys, result,
        object = data;

    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];

      if (_toString$1.call(pair) !== '[object Object]') return false;

      keys = Object.keys(pair);

      if (keys.length !== 1) return false;

      result[index] = [ keys[0], pair[keys[0]] ];
    }

    return true;
  }

  function constructYamlPairs(data) {
    if (data === null) return [];

    var index, length, pair, keys, result,
        object = data;

    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];

      keys = Object.keys(pair);

      result[index] = [ keys[0], pair[keys[0]] ];
    }

    return result;
  }

  var pairs = new type('tag:yaml.org,2002:pairs', {
    kind: 'sequence',
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });

  var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  function resolveYamlSet(data) {
    if (data === null) return true;

    var key, object = data;

    for (key in object) {
      if (_hasOwnProperty$2.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }

    return true;
  }

  function constructYamlSet(data) {
    return data !== null ? data : {};
  }

  var set = new type('tag:yaml.org,2002:set', {
    kind: 'mapping',
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });

  var _default = core.extend({
    implicit: [
      timestamp,
      merge
    ],
    explicit: [
      binary,
      omap,
      pairs,
      set
    ]
  });

  /*eslint-disable max-len,no-use-before-define*/







  var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


  var CONTEXT_FLOW_IN   = 1;
  var CONTEXT_FLOW_OUT  = 2;
  var CONTEXT_BLOCK_IN  = 3;
  var CONTEXT_BLOCK_OUT = 4;


  var CHOMPING_CLIP  = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP  = 3;


  var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


  function _class(obj) { return Object.prototype.toString.call(obj); }

  function is_EOL(c) {
    return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
  }

  function is_WHITE_SPACE(c) {
    return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
  }

  function is_WS_OR_EOL(c) {
    return (c === 0x09/* Tab */) ||
           (c === 0x20/* Space */) ||
           (c === 0x0A/* LF */) ||
           (c === 0x0D/* CR */);
  }

  function is_FLOW_INDICATOR(c) {
    return c === 0x2C/* , */ ||
           c === 0x5B/* [ */ ||
           c === 0x5D/* ] */ ||
           c === 0x7B/* { */ ||
           c === 0x7D/* } */;
  }

  function fromHexCode(c) {
    var lc;

    if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
      return c - 0x30;
    }

    /*eslint-disable no-bitwise*/
    lc = c | 0x20;

    if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
      return lc - 0x61 + 10;
    }

    return -1;
  }

  function escapedHexLen(c) {
    if (c === 0x78/* x */) { return 2; }
    if (c === 0x75/* u */) { return 4; }
    if (c === 0x55/* U */) { return 8; }
    return 0;
  }

  function fromDecimalCode(c) {
    if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
      return c - 0x30;
    }

    return -1;
  }

  function simpleEscapeSequence(c) {
    /* eslint-disable indent */
    return (c === 0x30/* 0 */) ? '\x00' :
          (c === 0x61/* a */) ? '\x07' :
          (c === 0x62/* b */) ? '\x08' :
          (c === 0x74/* t */) ? '\x09' :
          (c === 0x09/* Tab */) ? '\x09' :
          (c === 0x6E/* n */) ? '\x0A' :
          (c === 0x76/* v */) ? '\x0B' :
          (c === 0x66/* f */) ? '\x0C' :
          (c === 0x72/* r */) ? '\x0D' :
          (c === 0x65/* e */) ? '\x1B' :
          (c === 0x20/* Space */) ? ' ' :
          (c === 0x22/* " */) ? '\x22' :
          (c === 0x2F/* / */) ? '/' :
          (c === 0x5C/* \ */) ? '\x5C' :
          (c === 0x4E/* N */) ? '\x85' :
          (c === 0x5F/* _ */) ? '\xA0' :
          (c === 0x4C/* L */) ? '\u2028' :
          (c === 0x50/* P */) ? '\u2029' : '';
  }

  function charFromCodepoint(c) {
    if (c <= 0xFFFF) {
      return String.fromCharCode(c);
    }
    // Encode UTF-16 surrogate pair
    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
    return String.fromCharCode(
      ((c - 0x010000) >> 10) + 0xD800,
      ((c - 0x010000) & 0x03FF) + 0xDC00
    );
  }

  var simpleEscapeCheck = new Array(256); // integer, for fast access
  var simpleEscapeMap = new Array(256);
  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }


  function State$1(input, options) {
    this.input = input;

    this.filename  = options['filename']  || null;
    this.schema    = options['schema']    || _default;
    this.onWarning = options['onWarning'] || null;
    // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
    // if such documents have no explicit %YAML directive
    this.legacy    = options['legacy']    || false;

    this.json      = options['json']      || false;
    this.listener  = options['listener']  || null;

    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap       = this.schema.compiledTypeMap;

    this.length     = input.length;
    this.position   = 0;
    this.line       = 0;
    this.lineStart  = 0;
    this.lineIndent = 0;

    // position of first leading tab in the current line,
    // used to make sure there are no tabs in the indentation
    this.firstTabInLine = -1;

    this.documents = [];

    /*
    this.version;
    this.checkLineBreaks;
    this.tagMap;
    this.anchorMap;
    this.tag;
    this.anchor;
    this.kind;
    this.result;*/

  }


  function generateError(state, message) {
    var mark = {
      name:     state.filename,
      buffer:   state.input.slice(0, -1), // omit trailing \0
      position: state.position,
      line:     state.line,
      column:   state.position - state.lineStart
    };

    mark.snippet = snippet(mark);

    return new exception(message, mark);
  }

  function throwError(state, message) {
    throw generateError(state, message);
  }

  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }


  var directiveHandlers = {

    YAML: function handleYamlDirective(state, name, args) {

      var match, major, minor;

      if (state.version !== null) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (args.length !== 1) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (match === null) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (major !== 1) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = (minor < 2);

      if (minor !== 1 && minor !== 2) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },

    TAG: function handleTagDirective(state, name, args) {

      var handle, prefix;

      if (args.length !== 2) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty$1.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, 'tag prefix is malformed: ' + prefix);
      }

      state.tagMap[handle] = prefix;
    }
  };


  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;

    if (start < end) {
      _result = state.input.slice(start, end);

      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);
          if (!(_character === 0x09 ||
                (0x20 <= _character && _character <= 0x10FFFF))) {
            throwError(state, 'expected valid JSON character');
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, 'the stream contains non-printable characters');
      }

      state.result += _result;
    }
  }

  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;

    if (!common.isObject(source)) {
      throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
    }

    sourceKeys = Object.keys(source);

    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];

      if (!_hasOwnProperty$1.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }

  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
    startLine, startLineStart, startPos) {

    var index, quantity;

    // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);

      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, 'nested arrays are not supported inside keys');
        }

        if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
          keyNode[index] = '[object Object]';
        }
      }
    }

    // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)
    if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
      keyNode = '[object Object]';
    }


    keyNode = String(keyNode);

    if (_result === null) {
      _result = {};
    }

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json &&
          !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
          _hasOwnProperty$1.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, 'duplicated mapping key');
      }

      // used for this specific key only because Object.defineProperty is slow
      if (keyNode === '__proto__') {
        Object.defineProperty(_result, keyNode, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: valueNode
        });
      } else {
        _result[keyNode] = valueNode;
      }
      delete overridableKeys[keyNode];
    }

    return _result;
  }

  function readLineBreak(state) {
    var ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x0A/* LF */) {
      state.position++;
    } else if (ch === 0x0D/* CR */) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
        state.position++;
      }
    } else {
      throwError(state, 'a line break is expected');
    }

    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }

  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0,
        ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }
        ch = state.input.charCodeAt(++state.position);
      }

      if (allowComments && ch === 0x23/* # */) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
      }

      if (is_EOL(ch)) {
        readLineBreak(state);

        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;

        while (ch === 0x20/* Space */) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }

    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, 'deficient indentation');
    }

    return lineBreaks;
  }

  function testDocumentSeparator(state) {
    var _position = state.position,
        ch;

    ch = state.input.charCodeAt(_position);

    // Condition state.position === state.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.
    if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
        ch === state.input.charCodeAt(_position + 1) &&
        ch === state.input.charCodeAt(_position + 2)) {

      _position += 3;

      ch = state.input.charCodeAt(_position);

      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }

    return false;
  }

  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += ' ';
    } else if (count > 1) {
      state.result += common.repeat('\n', count - 1);
    }
  }


  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding,
        following,
        captureStart,
        captureEnd,
        hasPendingContent,
        _line,
        _lineStart,
        _lineIndent,
        _kind = state.kind,
        _result = state.result,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (is_WS_OR_EOL(ch)      ||
        is_FLOW_INDICATOR(ch) ||
        ch === 0x23/* # */    ||
        ch === 0x26/* & */    ||
        ch === 0x2A/* * */    ||
        ch === 0x21/* ! */    ||
        ch === 0x7C/* | */    ||
        ch === 0x3E/* > */    ||
        ch === 0x27/* ' */    ||
        ch === 0x22/* " */    ||
        ch === 0x25/* % */    ||
        ch === 0x40/* @ */    ||
        ch === 0x60/* ` */) {
      return false;
    }

    if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }

    state.kind = 'scalar';
    state.result = '';
    captureStart = captureEnd = state.position;
    hasPendingContent = false;

    while (ch !== 0) {
      if (ch === 0x3A/* : */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) ||
            withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }

      } else if (ch === 0x23/* # */) {
        preceding = state.input.charCodeAt(state.position - 1);

        if (is_WS_OR_EOL(preceding)) {
          break;
        }

      } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
                 withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;

      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);

        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }

      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }

      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, captureEnd, false);

    if (state.result) {
      return true;
    }

    state.kind = _kind;
    state.result = _result;
    return false;
  }

  function readSingleQuotedScalar(state, nodeIndent) {
    var ch,
        captureStart, captureEnd;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x27/* ' */) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x27/* ' */) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (ch === 0x27/* ' */) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }

      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;

      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a single quoted scalar');

      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }

  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart,
        captureEnd,
        hexLength,
        hexResult,
        tmp,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x22/* " */) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x22/* " */) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;

      } else if (ch === 0x5C/* \ */) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent);

          // TODO: rework to inline fn with no type cast?
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;

        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;

          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);

            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;

            } else {
              throwError(state, 'expected hexadecimal character');
            }
          }

          state.result += charFromCodepoint(hexResult);

          state.position++;

        } else {
          throwError(state, 'unknown escape sequence');
        }

        captureStart = captureEnd = state.position;

      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;

      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a double quoted scalar');

      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }

  function readFlowCollection(state, nodeIndent) {
    var readNext = true,
        _line,
        _lineStart,
        _pos,
        _tag     = state.tag,
        _result,
        _anchor  = state.anchor,
        following,
        terminator,
        isPair,
        isExplicitPair,
        isMapping,
        overridableKeys = Object.create(null),
        keyNode,
        keyTag,
        valueNode,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x5B/* [ */) {
      terminator = 0x5D;/* ] */
      isMapping = false;
      _result = [];
    } else if (ch === 0x7B/* { */) {
      terminator = 0x7D;/* } */
      isMapping = true;
      _result = {};
    } else {
      return false;
    }

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(++state.position);

    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? 'mapping' : 'sequence';
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, 'missed comma between flow collection entries');
      } else if (ch === 0x2C/* , */) {
        // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
        throwError(state, "expected the node content, but found ','");
      }

      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;

      if (ch === 0x3F/* ? */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }

      _line = state.line; // Save the current line.
      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }

      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }

      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if (ch === 0x2C/* , */) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }

    throwError(state, 'unexpected end of the stream within a flow collection');
  }

  function readBlockScalar(state, nodeIndent) {
    var captureStart,
        folding,
        chomping       = CHOMPING_CLIP,
        didReadContent = false,
        detectedIndent = false,
        textIndent     = nodeIndent,
        emptyLines     = 0,
        atMoreIndented = false,
        tmp,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x7C/* | */) {
      folding = false;
    } else if (ch === 0x3E/* > */) {
      folding = true;
    } else {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';

    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
        if (CHOMPING_CLIP === chomping) {
          chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, 'repeat of a chomping mode identifier');
        }

      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, 'repeat of an indentation width identifier');
        }

      } else {
        break;
      }
    }

    if (is_WHITE_SPACE(ch)) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (is_WHITE_SPACE(ch));

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (!is_EOL(ch) && (ch !== 0));
      }
    }

    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;

      ch = state.input.charCodeAt(state.position);

      while ((!detectedIndent || state.lineIndent < textIndent) &&
             (ch === 0x20/* Space */)) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }

      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }

      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      }

      // End of the scalar.
      if (state.lineIndent < textIndent) {

        // Perform the chomping.
        if (chomping === CHOMPING_KEEP) {
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) { // i.e. only if the scalar is not empty.
            state.result += '\n';
          }
        }

        // Break this `while` cycle and go to the funciton's epilogue.
        break;
      }

      // Folded style: use fancy rules to handle line breaks.
      if (folding) {

        // Lines starting with white space characters (more-indented lines) are not folded.
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true;
          // except for the first content line (cf. Example 8.1)
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

        // End of more-indented block.
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat('\n', emptyLines + 1);

        // Just one line break - perceive as the same line.
        } else if (emptyLines === 0) {
          if (didReadContent) { // i.e. only if we have already read some scalar content.
            state.result += ' ';
          }

        // Several line breaks - perceive as different lines.
        } else {
          state.result += common.repeat('\n', emptyLines);
        }

      // Literal style: just add exact number of line breaks between content lines.
      } else {
        // Keep all line breaks except the header line break.
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      }

      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;

      while (!is_EOL(ch) && (ch !== 0)) {
        ch = state.input.charCodeAt(++state.position);
      }

      captureSegment(state, captureStart, state.position, false);
    }

    return true;
  }

  function readBlockSequence(state, nodeIndent) {
    var _line,
        _tag      = state.tag,
        _anchor   = state.anchor,
        _result   = [],
        following,
        detected  = false,
        ch;

    // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar
    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      if (ch !== 0x2D/* - */) {
        break;
      }

      following = state.input.charCodeAt(state.position + 1);

      if (!is_WS_OR_EOL(following)) {
        break;
      }

      detected = true;
      state.position++;

      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }

      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);

      ch = state.input.charCodeAt(state.position);

      if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
        throwError(state, 'bad indentation of a sequence entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'sequence';
      state.result = _result;
      return true;
    }
    return false;
  }

  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following,
        allowCompact,
        _line,
        _keyLine,
        _keyLineStart,
        _keyPos,
        _tag          = state.tag,
        _anchor       = state.anchor,
        _result       = {},
        overridableKeys = Object.create(null),
        keyTag        = null,
        keyNode       = null,
        valueNode     = null,
        atExplicitKey = false,
        detected      = false,
        ch;

    // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar
    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      following = state.input.charCodeAt(state.position + 1);
      _line = state.line; // Save the current line.

      //
      // Explicit notation case. There are two separate blocks:
      // first for the key (denoted by "?") and second for the value (denoted by ":")
      //
      if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

        if (ch === 0x3F/* ? */) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = true;
          allowCompact = true;

        } else if (atExplicitKey) {
          // i.e. 0x3A/* : */ === character after the explicit key.
          atExplicitKey = false;
          allowCompact = true;

        } else {
          throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
        }

        state.position += 1;
        ch = following;

      //
      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
      //
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;

        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          // Neither implicit nor explicit notation.
          // Reading is done. Go to the epilogue.
          break;
        }

        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);

          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          if (ch === 0x3A/* : */) {
            ch = state.input.charCodeAt(++state.position);

            if (!is_WS_OR_EOL(ch)) {
              throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
            }

            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;

          } else if (detected) {
            throwError(state, 'can not read an implicit mapping pair; a colon is missed');

          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true; // Keep the result of `composeNode`.
          }

        } else if (detected) {
          throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }
      }

      //
      // Common reading code for both explicit and implicit notations.
      //
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }

        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }

        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }

      if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
        throwError(state, 'bad indentation of a mapping entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    //
    // Epilogue.
    //

    // Special case: last mapping's node contains only the key in explicit notation.
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    }

    // Expose the resulting mapping.
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'mapping';
      state.result = _result;
    }

    return detected;
  }

  function readTagProperty(state) {
    var _position,
        isVerbatim = false,
        isNamed    = false,
        tagHandle,
        tagName,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x21/* ! */) return false;

    if (state.tag !== null) {
      throwError(state, 'duplication of a tag property');
    }

    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x3C/* < */) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);

    } else if (ch === 0x21/* ! */) {
      isNamed = true;
      tagHandle = '!!';
      ch = state.input.charCodeAt(++state.position);

    } else {
      tagHandle = '!';
    }

    _position = state.position;

    if (isVerbatim) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (ch !== 0 && ch !== 0x3E/* > */);

      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, 'unexpected end of the stream within a verbatim tag');
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {

        if (ch === 0x21/* ! */) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);

            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, 'named tag handle cannot contain such characters');
            }

            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, 'tag suffix cannot contain exclamation marks');
          }
        }

        ch = state.input.charCodeAt(++state.position);
      }

      tagName = state.input.slice(_position, state.position);

      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, 'tag suffix cannot contain flow indicator characters');
      }
    }

    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, 'tag name cannot contain such characters: ' + tagName);
    }

    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, 'tag name is malformed: ' + tagName);
    }

    if (isVerbatim) {
      state.tag = tagName;

    } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;

    } else if (tagHandle === '!') {
      state.tag = '!' + tagName;

    } else if (tagHandle === '!!') {
      state.tag = 'tag:yaml.org,2002:' + tagName;

    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }

    return true;
  }

  function readAnchorProperty(state) {
    var _position,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x26/* & */) return false;

    if (state.anchor !== null) {
      throwError(state, 'duplication of an anchor property');
    }

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an anchor node must contain at least one character');
    }

    state.anchor = state.input.slice(_position, state.position);
    return true;
  }

  function readAlias(state) {
    var _position, alias,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x2A/* * */) return false;

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an alias node must contain at least one character');
    }

    alias = state.input.slice(_position, state.position);

    if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }

    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }

  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles,
        allowBlockScalars,
        allowBlockCollections,
        indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
        atNewLine  = false,
        hasContent = false,
        typeIndex,
        typeQuantity,
        typeList,
        type,
        flowIndent,
        blockIndent;

    if (state.listener !== null) {
      state.listener('open', state);
    }

    state.tag    = null;
    state.anchor = null;
    state.kind   = null;
    state.result = null;

    allowBlockStyles = allowBlockScalars = allowBlockCollections =
      CONTEXT_BLOCK_OUT === nodeContext ||
      CONTEXT_BLOCK_IN  === nodeContext;

    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }

    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;

          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }

    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }

    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }

      blockIndent = state.position - state.lineStart;

      if (indentStatus === 1) {
        if (allowBlockCollections &&
            (readBlockSequence(state, blockIndent) ||
             readBlockMapping(state, blockIndent, flowIndent)) ||
            readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
              readSingleQuotedScalar(state, flowIndent) ||
              readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;

          } else if (readAlias(state)) {
            hasContent = true;

            if (state.tag !== null || state.anchor !== null) {
              throwError(state, 'alias node should not have any properties');
            }

          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;

            if (state.tag === null) {
              state.tag = '?';
            }
          }

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        // Special case: block sequences are allowed to have same indentation level as the parent.
        // http://www.yaml.org/spec/1.2/spec.html#id2799784
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }

    if (state.tag === null) {
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }

    } else if (state.tag === '?') {
      // Implicit resolving is not allowed for non-scalar types, and '?'
      // non-specific tag is only automatically assigned to plain scalars.
      //
      // We only need to check kind conformity in case user explicitly assigns '?'
      // tag, for example like this: "!<?> [0]"
      //
      if (state.result !== null && state.kind !== 'scalar') {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }

      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (state.tag !== '!') {
      if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
        type = state.typeMap[state.kind || 'fallback'][state.tag];
      } else {
        // looking for multi type
        type = null;
        typeList = state.typeMap.multi[state.kind || 'fallback'];

        for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type = typeList[typeIndex];
            break;
          }
        }
      }

      if (!type) {
        throwError(state, 'unknown tag !<' + state.tag + '>');
      }

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result, state.tag);
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    }

    if (state.listener !== null) {
      state.listener('close', state);
    }
    return state.tag !== null ||  state.anchor !== null || hasContent;
  }

  function readDocument(state) {
    var documentStart = state.position,
        _position,
        directiveName,
        directiveArgs,
        hasDirectives = false,
        ch;

    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = Object.create(null);
    state.anchorMap = Object.create(null);

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);

      ch = state.input.charCodeAt(state.position);

      if (state.lineIndent > 0 || ch !== 0x25/* % */) {
        break;
      }

      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];

      if (directiveName.length < 1) {
        throwError(state, 'directive name must not be less than one character in length');
      }

      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x23/* # */) {
          do { ch = state.input.charCodeAt(++state.position); }
          while (ch !== 0 && !is_EOL(ch));
          break;
        }

        if (is_EOL(ch)) break;

        _position = state.position;

        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        directiveArgs.push(state.input.slice(_position, state.position));
      }

      if (ch !== 0) readLineBreak(state);

      if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }

    skipSeparationSpace(state, true, -1);

    if (state.lineIndent === 0 &&
        state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
        state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
        state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);

    } else if (hasDirectives) {
      throwError(state, 'directives end mark is expected');
    }

    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);

    if (state.checkLineBreaks &&
        PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, 'non-ASCII line breaks are interpreted as content');
    }

    state.documents.push(state.result);

    if (state.position === state.lineStart && testDocumentSeparator(state)) {

      if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }

    if (state.position < (state.length - 1)) {
      throwError(state, 'end of the stream or a document separator is expected');
    } else {
      return;
    }
  }


  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};

    if (input.length !== 0) {

      // Add tailing `\n` if not exists
      if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
          input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
        input += '\n';
      }

      // Strip BOM
      if (input.charCodeAt(0) === 0xFEFF) {
        input = input.slice(1);
      }
    }

    var state = new State$1(input, options);

    var nullpos = input.indexOf('\0');

    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, 'null byte is not allowed in input');
    }

    // Use 0 as string terminator. That significantly simplifies bounds check.
    state.input += '\0';

    while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
      state.lineIndent += 1;
      state.position += 1;
    }

    while (state.position < (state.length - 1)) {
      readDocument(state);
    }

    return state.documents;
  }


  function loadAll$1(input, iterator, options) {
    if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
      options = iterator;
      iterator = null;
    }

    var documents = loadDocuments(input, options);

    if (typeof iterator !== 'function') {
      return documents;
    }

    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }


  function load$1(input, options) {
    var documents = loadDocuments(input, options);

    if (documents.length === 0) {
      /*eslint-disable no-undefined*/
      return undefined;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new exception('expected a single document in the stream, but found more');
  }


  var loadAll_1 = loadAll$1;
  var load_1    = load$1;

  var loader = {
  	loadAll: loadAll_1,
  	load: load_1
  };
  var load                = loader.load;
  var loadAll             = loader.loadAll;

  /**
   * Renderer: render target HTMLElement by step functions
   * @typedef {Object} Renderer
   * @property {Function[]} steps - functions for rendering
   * @property {HTMLElement} target - target HTMLElement
   */

  /** VAR: List of Renderer for quickstart */
  const defaultAliases = Object.freeze({
    use: {
      Leaflet: {
        value: './renderers/leaflet.mjs',
        url: 'https://github.com/outdoorsafetylab/mapclay/blob/HEAD/src/BasicLeafletRenderer.mjs',
        description:
          'Leaflet is the leading open-source JavaScript library for mobile-friendly interactive maps. It has all the mapping features most developers ever need.',
      },
      Maplibre: {
        value: './renderers/maplibre.mjs',
        url: 'https://github.com/outdoorsafetylab/mapclay/blob/HEAD/src/BasicMaplibreRenderer.mjs',
        description:
          'MapLibre GL JS is a TypeScript library that uses WebGL to render interactive maps from vector tiles in a browser. The customization of the map comply with the MapLibre Style Spec.',
      },
      Openlayers: {
        value: './renderers/openlayers.mjs',
        url: 'https://github.com/outdoorsafetylab/mapclay/blob/HEAD/src/BasicOpenlayersRenderer.mjs',
        description:
          'OpenLayers makes it easy to put a dynamic map in any web page. It can display map tiles, vector data and markers loaded from any source. OpenLayers has been developed to further the use of geographic information of all kinds.',
      },
    },
  });

  /**
   * applyDefaultAliases.
   *
   * @description just a single default converter for config
   * @param {Object} config -- original config
   * @return {Object} -- patched config
   */
  const applyDefaultAliases = config => ({
    use: config.use ?? 'Leaflet',
    width: '100%',
    ...config,
    aliases: {
      ...defaultAliases,
      ...(config.aliases ?? {}),
    },
  });

  /**
   * parseConfigsFromYaml.
   *
   * @param {String} configText -- yaml text
   * @return {Object[]} -- List of config for rendering
   */
  const parseConfigsFromYaml = configText => {
    const configList = [];
    loadAll(configText, result => {
      if (typeof result === 'object' && !Array.isArray(result)) {
        configList.push(result ?? {});
      } else {
        if (configList.length > 0) {
          configList.at(-1).eval = result.toString();
        }
      }
    });

    return configList.length === 0
      ? [{}]
      : configList
  };

  /** VAR: Get config from other file by 'apply' */
  const appliedConfigs = {};

  /**
   * fetch remote config file and save it for cache
   *
   * @param {String} url -- url for remote config file
   */
  const fetchConfig = async url => {
    if (!url || appliedConfigs[url]) return

    appliedConfigs[url] = await fetch(url)
      .then(response => {
        if (response.status !== 200) throw Error()
        return response.text()
      })
      .then(text => load(text))
      .catch(err => {
        throw Error(`Fail to fetch applied config ${url}`, err)
      });
  };

  /**
   * Replace aliases in each property by property 'aliases'.
   * An alias must starts with upper-case
   *
   * @param {Object} config -- original config
   * @return {Object} patched config
   */
  const setValueByAliases = config => {
    if (!config.aliases) return config

    Object.entries(config)
      .filter(
        ([option, value]) =>
          option !== 'aliases' &&
          typeof value === 'string' &&
          value.match(/^[A-Z]/),
      )
      .forEach(([key, alias]) => {
        const aliasResult = config.aliases?.[key]?.[alias];
        const aliasValue =
          typeof aliasResult === 'object' && !Array.isArray(aliasResult)
            ? aliasResult.value
            : aliasResult;
        if (aliasValue) {
          config[key] = aliasValue;
          if (key === 'use') {
            config.url = aliasResult.url;
            config.desc = aliasResult.desc;
          }
        }
      });

    return config
  };

  /**
   * applyOtherConfig.
   *
   * @param {Object} config -- original config for rendering
   * @return {Promise} -- resolve "patched" config
   */
  const applyOtherConfig = async config => {
    if (!config.apply) return config

    await fetchConfig(config.apply);
    const preset = appliedConfigs[config.apply];
    if (!preset) throw Error('Fail to fetch remote config ' + config.aply)

    return {
      ...preset,
      ...config,
      aliases: {
        ...preset.aliases,
        ...(config.aliases ?? {}),
      },
    }
  };

  /**
   * prepareRenderer.
   *
   * @param {Object} config -- prepare renderer by properties in config
   * @return {Promise} -- resolve renderer used for rendering an HTMLElement
   */
  const prepareRenderer = async config => {
    let renderer;
    if (!config.use) {
      renderer = config;
    } else if (config.use.steps) {
      renderer = config.use;
    } else if (typeof config.use === 'function') {
      const RendererClass = config.use;
      renderer = new RendererClass();
    } else if (typeof config.use === 'string') {
      const RendererClass = (await import(config.use)).default;
      renderer = new RendererClass();
    } else {
      throw Error('Cannot get Renderer by config.use', config.use)
    }

    Object.entries(config).forEach(([key, value]) => (renderer[key] = value));
    return renderer
  };

  /**
   * healthCheck.
   * @description check Renderer is valid
   * @param {Renderer} renderer
   */
  const healthCheck = renderer => {
    if (!renderer.steps) {
      renderer.steps = [];
      throw Error('not health')
    }
    return renderer
  };

  /**
   * runBySteps.
   *
   * @param {Object} renderer -- for each function in property "steps",
   *   run them one by one and store result into property "results"
   * @return {Promise} -- chanined promises of function calls
   */
  const runBySteps = renderer =>
    (renderer.steps ?? [])
      .reduce(
        (acc, func) =>
          acc
            .then(() => {
              if (renderer.results.at(-1).state === 'stop') {
                return { state: 'stop', reason: 'stop by previous step' }
              }
              // If dependencies not success, just skip this function
              if (func.depends) {
                const dependentResult = renderer.results.findLast(
                  res => res.func === func.depends,
                )?.state;
                if (dependentResult.match(/skip|fail/)) {
                  return { state: 'skip' }
                }
              }

              // Run function binding with renderer
              return func.valueOf().bind(renderer)(renderer)
            })
            // Save non-fail result
            .then(result =>
              renderer.results.push({
                type: 'render',
                func: func.valueOf(),
                state: result?.state ?? 'success',
                result: result?.reason ?? result,
              }),
            )
            // Save fail result
            .catch(err =>
              renderer.results.push({
                type: 'render',
                func: func.valueOf(),
                state: 'fail',
                result: err,
              }),
            )
            // Do callback(If it exists) after each step
            .then(() => {
              renderer.stepCallback?.(renderer, renderer);
            }),
        Promise.resolve(),
      )
      .then(() => renderer);

  /**
   * runByStepsForPrepare.
   * @description chain step functions for preparing Renderer
   * @param {Object} config
   */
  const runByStepsForPrepare = (config) => {
    let renderer = config;

    return steps => steps.reduce(
      (acc, step) =>
        acc
          .then(async () => {
            if (renderer.results.at(-1)?.state?.match(/fail|stop/)) {
              return { state: 'stop', reason: 'stop by previous step' }
            }
            renderer = await step(renderer);
            return renderer
          })
          // Save non-fail result
          .then(result =>
            renderer.results.push({
              type: 'prepare',
              func: step.valueOf(),
              state: result?.state ?? 'success',
              result: result?.reason ?? renderer,
            }),
          )
          .catch(err => {
            renderer.results.push({
              type: 'prepare',
              func: step.valueOf(),
              state: 'fail',
              result: err,
            });
          })
          .then(() => {
            renderer.prepareCallback?.(renderer, renderer.results);
          }),
      Promise.resolve(renderer),
    )
      .then(() => renderer)
  };

  /**
   * renderTargetWithConfig.
   *
   * @param {HTMLElement} target -- target element for map view
   * @param {Object} config -- options for map configuration
   * @return {Promise} promise -- which resolve value is a renderer,
       property "results" contains result objec of each step
   */
  const renderWithConfig = async config => {
    // Prepare for rendering
    config.results = [];

    const prepareSteps = [
      setValueByAliases,
      applyOtherConfig,
      setValueByAliases,
      prepareRenderer,
      healthCheck,
    ];

    const promise = runByStepsForPrepare(config)(prepareSteps)
      .then(renderer => runBySteps(renderer))
      .then(renderer => {
        const failToRender =
          !renderer.results ||
          renderer.results.length === 0 ||
          !renderer.results.find(r => r.state.match(/success/)) ||
          renderer.results.find(r => r.state.match(/fail|stop/));
        const attribute = failToRender ? 'unfulfilled' : 'fulfilled';
        renderer?.target?.setAttribute('data-render', attribute);

        return renderer
      });

    promise.valueOf = () => config.results;

    return promise
  };

  /**
   * setValueOf.
   * @description apply valueOf for compare
   * @param {Object} config
   * @return {Object} config
   */
  const setValueOf = config => {
    config.valueOf = () =>
      JSON.stringify(config, (k, v) =>
        k.match(/aliases|target/) ? undefined : v,
      );
    return config
  };

  /**
   * shouldRender.
   * @description should render current config, useful when config.target is a rendered map
   * @param {Object} config
   */
  const shouldRender = config =>
    !(config.target instanceof window.HTMLElement) ||
    !config.target.classList.contains('mapclay') ||
    !(config.valueOf() === config.target.getAttribute('data-mapclay')) ||
    !(config.target.getAttribute('data-render') === 'fulfilled');

  /**
   * renderWith
   * @param {HTMLElement} target Element of map(s) container
   * @param {Object[]|Object} configObj - Config(s) for each map. Scope into array if it is an Object
   * @param {Object} options - Valid optoins: "rendererList" (list of renderer info) and "renderer" (Class for renderer)
   * @returns {Promise} - Promise of rendering map(s) on target element
   */
  const renderWith = converter => (element, configObj) => {
    // Get list of config file, no matter argument is Array or Object
    converter = converter ?? (config => config);
    const configListArray =
      typeof configObj === 'object'
        ? Array.isArray(configObj)
          ? configObj.map(converter)
          : [configObj].map(converter)
        : null;
    if (!configListArray) throw Error(`Invalid config files: ${configObj}`)

    // Remove child elements but matches id in configList
    element.innerHTML = '';

    // Create elements for each config file in array
    const createContainer = config => {
      if (shouldRender(config)) {
        const target = document.createElement('div');
        if (config.id) {
          target.id = config.id.replaceAll('\x20', '_');
          target.title = `ID: ${target.id}`;
        }
        target.classList.add('mapclay');
        config.target = target;
        target.dataset.render = 'rendering';
        target.dataset.mapclay = config.valueOf();
        console.log('should render', target instanceof HTMLElement, target instanceof window.HTMLElement);
      }
      element.append(config.target);

      if (window.CSS.supports(`width: ${config.width}`)) {
        config.target.style.width = config.width;
      }
      if (window.CSS.supports(`height: ${config.height}`)) {
        config.target.style.height = config.height;
      }

      return config
    };

    // List of promises about rendering each config
    return configListArray
      .map(setValueOf)
      .map(createContainer)
      .filter(shouldRender)
      .map(renderWithConfig)
  };

  /**
   * renderByYamlWith.
   *
   * @param {Function} converter - convert config to another config
   */
  const renderByYamlWith = (converter = null) =>
    async (target, text = null) => {
      const yamlText = text ?? target.textContent;
      const configList = parseConfigsFromYaml(yamlText);
      return renderWith(converter)(target, configList)
    };

  /**
   * renderByScriptTargetWith.
   *
   * @param {Function} converter - convert config to another config
   */
  const renderByScriptTargetWith = (converter = null) =>
    async () => {
      const script = document.currentScript;
      const cssSelector =
        script?.getAttribute('data-target') ??
        URL.parse(script?.src)?.searchParams?.get('target');
      const containers = document.querySelectorAll(cssSelector);

      if (!cssSelector || !containers) return

      containers.forEach(target => renderByYamlWith(converter)(target));
    };

  const render$1 = renderWith(applyDefaultAliases);
  const renderByYaml$1 = renderByYamlWith(applyDefaultAliases);

  if (document.currentScript) {
    globalThis.mapclay = { render: render$1, renderWith, renderByYaml: renderByYaml$1, renderByYamlWith };
  }

  /* @preserve
   * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
   * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
   */

  var version = "1.9.4";

  /*
   * @namespace Util
   *
   * Various utility functions, used by Leaflet internally.
   */

  // @function extend(dest: Object, src?: Object): Object
  // Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
  function extend(dest) {
  	var i, j, len, src;

  	for (j = 1, len = arguments.length; j < len; j++) {
  		src = arguments[j];
  		for (i in src) {
  			dest[i] = src[i];
  		}
  	}
  	return dest;
  }

  // @function create(proto: Object, properties?: Object): Object
  // Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
  var create$2 = Object.create || (function () {
  	function F() {}
  	return function (proto) {
  		F.prototype = proto;
  		return new F();
  	};
  })();

  // @function bind(fn: Function, …): Function
  // Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
  // Has a `L.bind()` shortcut.
  function bind(fn, obj) {
  	var slice = Array.prototype.slice;

  	if (fn.bind) {
  		return fn.bind.apply(fn, slice.call(arguments, 1));
  	}

  	var args = slice.call(arguments, 2);

  	return function () {
  		return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
  	};
  }

  // @property lastId: Number
  // Last unique ID used by [`stamp()`](#util-stamp)
  var lastId = 0;

  // @function stamp(obj: Object): Number
  // Returns the unique ID of an object, assigning it one if it doesn't have it.
  function stamp(obj) {
  	if (!('_leaflet_id' in obj)) {
  		obj['_leaflet_id'] = ++lastId;
  	}
  	return obj._leaflet_id;
  }

  // @function throttle(fn: Function, time: Number, context: Object): Function
  // Returns a function which executes function `fn` with the given scope `context`
  // (so that the `this` keyword refers to `context` inside `fn`'s code). The function
  // `fn` will be called no more than one time per given amount of `time`. The arguments
  // received by the bound function will be any arguments passed when binding the
  // function, followed by any arguments passed when invoking the bound function.
  // Has an `L.throttle` shortcut.
  function throttle(fn, time, context) {
  	var lock, args, wrapperFn, later;

  	later = function () {
  		// reset lock and call if queued
  		lock = false;
  		if (args) {
  			wrapperFn.apply(context, args);
  			args = false;
  		}
  	};

  	wrapperFn = function () {
  		if (lock) {
  			// called too soon, queue to call later
  			args = arguments;

  		} else {
  			// call and lock until later
  			fn.apply(context, arguments);
  			setTimeout(later, time);
  			lock = true;
  		}
  	};

  	return wrapperFn;
  }

  // @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
  // Returns the number `num` modulo `range` in such a way so it lies within
  // `range[0]` and `range[1]`. The returned value will be always smaller than
  // `range[1]` unless `includeMax` is set to `true`.
  function wrapNum(x, range, includeMax) {
  	var max = range[1],
  	    min = range[0],
  	    d = max - min;
  	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
  }

  // @function falseFn(): Function
  // Returns a function which always returns `false`.
  function falseFn() { return false; }

  // @function formatNum(num: Number, precision?: Number|false): Number
  // Returns the number `num` rounded with specified `precision`.
  // The default `precision` value is 6 decimal places.
  // `false` can be passed to skip any processing (can be useful to avoid round-off errors).
  function formatNum(num, precision) {
  	if (precision === false) { return num; }
  	var pow = Math.pow(10, precision === undefined ? 6 : precision);
  	return Math.round(num * pow) / pow;
  }

  // @function trim(str: String): String
  // Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
  function trim(str) {
  	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  // @function splitWords(str: String): String[]
  // Trims and splits the string on whitespace and returns the array of parts.
  function splitWords(str) {
  	return trim(str).split(/\s+/);
  }

  // @function setOptions(obj: Object, options: Object): Object
  // Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
  function setOptions(obj, options) {
  	if (!Object.prototype.hasOwnProperty.call(obj, 'options')) {
  		obj.options = obj.options ? create$2(obj.options) : {};
  	}
  	for (var i in options) {
  		obj.options[i] = options[i];
  	}
  	return obj.options;
  }

  // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
  // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
  // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
  // be appended at the end. If `uppercase` is `true`, the parameter names will
  // be uppercased (e.g. `'?A=foo&B=bar'`)
  function getParamString(obj, existingUrl, uppercase) {
  	var params = [];
  	for (var i in obj) {
  		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
  	}
  	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  }

  var templateRe = /\{ *([\w_ -]+) *\}/g;

  // @function template(str: String, data: Object): String
  // Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
  // and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
  // `('Hello foo, bar')`. You can also specify functions instead of strings for
  // data values — they will be evaluated passing `data` as an argument.
  function template(str, data) {
  	return str.replace(templateRe, function (str, key) {
  		var value = data[key];

  		if (value === undefined) {
  			throw new Error('No value provided for variable ' + str);

  		} else if (typeof value === 'function') {
  			value = value(data);
  		}
  		return value;
  	});
  }

  // @function isArray(obj): Boolean
  // Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
  var isArray = Array.isArray || function (obj) {
  	return (Object.prototype.toString.call(obj) === '[object Array]');
  };

  // @function indexOf(array: Array, el: Object): Number
  // Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
  function indexOf(array, el) {
  	for (var i = 0; i < array.length; i++) {
  		if (array[i] === el) { return i; }
  	}
  	return -1;
  }

  // @property emptyImageUrl: String
  // Data URI string containing a base64-encoded empty GIF image.
  // Used as a hack to free memory from unused images on WebKit-powered
  // mobile devices (by setting image `src` to this string).
  var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // inspired by https://paulirish.com/2011/requestanimationframe-for-smart-animating/

  function getPrefixed(name) {
  	return window['webkit' + name] || window['moz' + name] || window['ms' + name];
  }

  var lastTime = 0;

  // fallback for IE 7-8
  function timeoutDefer(fn) {
  	var time = +new Date(),
  	    timeToCall = Math.max(0, 16 - (time - lastTime));

  	lastTime = time + timeToCall;
  	return window.setTimeout(fn, timeToCall);
  }

  var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
  var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
  		getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

  // @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
  // Schedules `fn` to be executed when the browser repaints. `fn` is bound to
  // `context` if given. When `immediate` is set, `fn` is called immediately if
  // the browser doesn't have native support for
  // [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
  // otherwise it's delayed. Returns a request ID that can be used to cancel the request.
  function requestAnimFrame(fn, context, immediate) {
  	if (immediate && requestFn === timeoutDefer) {
  		fn.call(context);
  	} else {
  		return requestFn.call(window, bind(fn, context));
  	}
  }

  // @function cancelAnimFrame(id: Number): undefined
  // Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
  function cancelAnimFrame(id) {
  	if (id) {
  		cancelFn.call(window, id);
  	}
  }

  var Util = {
    __proto__: null,
    extend: extend,
    create: create$2,
    bind: bind,
    get lastId () { return lastId; },
    stamp: stamp,
    throttle: throttle,
    wrapNum: wrapNum,
    falseFn: falseFn,
    formatNum: formatNum,
    trim: trim,
    splitWords: splitWords,
    setOptions: setOptions,
    getParamString: getParamString,
    template: template,
    isArray: isArray,
    indexOf: indexOf,
    emptyImageUrl: emptyImageUrl,
    requestFn: requestFn,
    cancelFn: cancelFn,
    requestAnimFrame: requestAnimFrame,
    cancelAnimFrame: cancelAnimFrame
  };

  // @class Class
  // @aka L.Class

  // @section
  // @uninheritable

  // Thanks to John Resig and Dean Edwards for inspiration!

  function Class() {}

  Class.extend = function (props) {

  	// @function extend(props: Object): Function
  	// [Extends the current class](#class-inheritance) given the properties to be included.
  	// Returns a Javascript function that is a class constructor (to be called with `new`).
  	var NewClass = function () {

  		setOptions(this);

  		// call the constructor
  		if (this.initialize) {
  			this.initialize.apply(this, arguments);
  		}

  		// call all constructor hooks
  		this.callInitHooks();
  	};

  	var parentProto = NewClass.__super__ = this.prototype;

  	var proto = create$2(parentProto);
  	proto.constructor = NewClass;

  	NewClass.prototype = proto;

  	// inherit parent's statics
  	for (var i in this) {
  		if (Object.prototype.hasOwnProperty.call(this, i) && i !== 'prototype' && i !== '__super__') {
  			NewClass[i] = this[i];
  		}
  	}

  	// mix static properties into the class
  	if (props.statics) {
  		extend(NewClass, props.statics);
  	}

  	// mix includes into the prototype
  	if (props.includes) {
  		checkDeprecatedMixinEvents(props.includes);
  		extend.apply(null, [proto].concat(props.includes));
  	}

  	// mix given properties into the prototype
  	extend(proto, props);
  	delete proto.statics;
  	delete proto.includes;

  	// merge options
  	if (proto.options) {
  		proto.options = parentProto.options ? create$2(parentProto.options) : {};
  		extend(proto.options, props.options);
  	}

  	proto._initHooks = [];

  	// add method for calling all hooks
  	proto.callInitHooks = function () {

  		if (this._initHooksCalled) { return; }

  		if (parentProto.callInitHooks) {
  			parentProto.callInitHooks.call(this);
  		}

  		this._initHooksCalled = true;

  		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
  			proto._initHooks[i].call(this);
  		}
  	};

  	return NewClass;
  };


  // @function include(properties: Object): this
  // [Includes a mixin](#class-includes) into the current class.
  Class.include = function (props) {
  	var parentOptions = this.prototype.options;
  	extend(this.prototype, props);
  	if (props.options) {
  		this.prototype.options = parentOptions;
  		this.mergeOptions(props.options);
  	}
  	return this;
  };

  // @function mergeOptions(options: Object): this
  // [Merges `options`](#class-options) into the defaults of the class.
  Class.mergeOptions = function (options) {
  	extend(this.prototype.options, options);
  	return this;
  };

  // @function addInitHook(fn: Function): this
  // Adds a [constructor hook](#class-constructor-hooks) to the class.
  Class.addInitHook = function (fn) { // (Function) || (String, args...)
  	var args = Array.prototype.slice.call(arguments, 1);

  	var init = typeof fn === 'function' ? fn : function () {
  		this[fn].apply(this, args);
  	};

  	this.prototype._initHooks = this.prototype._initHooks || [];
  	this.prototype._initHooks.push(init);
  	return this;
  };

  function checkDeprecatedMixinEvents(includes) {
  	/* global L: true */
  	if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

  	includes = isArray(includes) ? includes : [includes];

  	for (var i = 0; i < includes.length; i++) {
  		if (includes[i] === L.Mixin.Events) {
  			console.warn('Deprecated include of L.Mixin.Events: ' +
  				'this property will be removed in future releases, ' +
  				'please inherit from L.Evented instead.', new Error().stack);
  		}
  	}
  }

  /*
   * @class Evented
   * @aka L.Evented
   * @inherits Class
   *
   * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
   *
   * @example
   *
   * ```js
   * map.on('click', function(e) {
   * 	alert(e.latlng);
   * } );
   * ```
   *
   * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
   *
   * ```js
   * function onClick(e) { ... }
   *
   * map.on('click', onClick);
   * map.off('click', onClick);
   * ```
   */

  var Events = {
  	/* @method on(type: String, fn: Function, context?: Object): this
  	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
  	 *
  	 * @alternative
  	 * @method on(eventMap: Object): this
  	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  	 */
  	on: function (types, fn, context) {

  		// types can be a map of types/handlers
  		if (typeof types === 'object') {
  			for (var type in types) {
  				// we don't process space-separated events here for performance;
  				// it's a hot path since Layer uses the on(obj) syntax
  				this._on(type, types[type], fn);
  			}

  		} else {
  			// types can be a string of space-separated words
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._on(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	/* @method off(type: String, fn?: Function, context?: Object): this
  	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
  	 *
  	 * @alternative
  	 * @method off(eventMap: Object): this
  	 * Removes a set of type/listener pairs.
  	 *
  	 * @alternative
  	 * @method off: this
  	 * Removes all listeners to all events on the object. This includes implicitly attached events.
  	 */
  	off: function (types, fn, context) {

  		if (!arguments.length) {
  			// clear all listeners if called without arguments
  			delete this._events;

  		} else if (typeof types === 'object') {
  			for (var type in types) {
  				this._off(type, types[type], fn);
  			}

  		} else {
  			types = splitWords(types);

  			var removeAll = arguments.length === 1;
  			for (var i = 0, len = types.length; i < len; i++) {
  				if (removeAll) {
  					this._off(types[i]);
  				} else {
  					this._off(types[i], fn, context);
  				}
  			}
  		}

  		return this;
  	},

  	// attach listener (without syntactic sugar now)
  	_on: function (type, fn, context, _once) {
  		if (typeof fn !== 'function') {
  			console.warn('wrong listener type: ' + typeof fn);
  			return;
  		}

  		// check if fn already there
  		if (this._listens(type, fn, context) !== false) {
  			return;
  		}

  		if (context === this) {
  			// Less memory footprint.
  			context = undefined;
  		}

  		var newListener = {fn: fn, ctx: context};
  		if (_once) {
  			newListener.once = true;
  		}

  		this._events = this._events || {};
  		this._events[type] = this._events[type] || [];
  		this._events[type].push(newListener);
  	},

  	_off: function (type, fn, context) {
  		var listeners,
  		    i,
  		    len;

  		if (!this._events) {
  			return;
  		}

  		listeners = this._events[type];
  		if (!listeners) {
  			return;
  		}

  		if (arguments.length === 1) { // remove all
  			if (this._firingCount) {
  				// Set all removed listeners to noop
  				// so they are not called if remove happens in fire
  				for (i = 0, len = listeners.length; i < len; i++) {
  					listeners[i].fn = falseFn;
  				}
  			}
  			// clear all listeners for a type if function isn't specified
  			delete this._events[type];
  			return;
  		}

  		if (typeof fn !== 'function') {
  			console.warn('wrong listener type: ' + typeof fn);
  			return;
  		}

  		// find fn and remove it
  		var index = this._listens(type, fn, context);
  		if (index !== false) {
  			var listener = listeners[index];
  			if (this._firingCount) {
  				// set the removed listener to noop so that's not called if remove happens in fire
  				listener.fn = falseFn;

  				/* copy array in case events are being fired */
  				this._events[type] = listeners = listeners.slice();
  			}
  			listeners.splice(index, 1);
  		}
  	},

  	// @method fire(type: String, data?: Object, propagate?: Boolean): this
  	// Fires an event of the specified type. You can optionally provide a data
  	// object — the first argument of the listener function will contain its
  	// properties. The event can optionally be propagated to event parents.
  	fire: function (type, data, propagate) {
  		if (!this.listens(type, propagate)) { return this; }

  		var event = extend({}, data, {
  			type: type,
  			target: this,
  			sourceTarget: data && data.sourceTarget || this
  		});

  		if (this._events) {
  			var listeners = this._events[type];
  			if (listeners) {
  				this._firingCount = (this._firingCount + 1) || 1;
  				for (var i = 0, len = listeners.length; i < len; i++) {
  					var l = listeners[i];
  					// off overwrites l.fn, so we need to copy fn to a var
  					var fn = l.fn;
  					if (l.once) {
  						this.off(type, fn, l.ctx);
  					}
  					fn.call(l.ctx || this, event);
  				}

  				this._firingCount--;
  			}
  		}

  		if (propagate) {
  			// propagate the event to parents (set with addEventParent)
  			this._propagateEvent(event);
  		}

  		return this;
  	},

  	// @method listens(type: String, propagate?: Boolean): Boolean
  	// @method listens(type: String, fn: Function, context?: Object, propagate?: Boolean): Boolean
  	// Returns `true` if a particular event type has any listeners attached to it.
  	// The verification can optionally be propagated, it will return `true` if parents have the listener attached to it.
  	listens: function (type, fn, context, propagate) {
  		if (typeof type !== 'string') {
  			console.warn('"string" type argument expected');
  		}

  		// we don't overwrite the input `fn` value, because we need to use it for propagation
  		var _fn = fn;
  		if (typeof fn !== 'function') {
  			propagate = !!fn;
  			_fn = undefined;
  			context = undefined;
  		}

  		var listeners = this._events && this._events[type];
  		if (listeners && listeners.length) {
  			if (this._listens(type, _fn, context) !== false) {
  				return true;
  			}
  		}

  		if (propagate) {
  			// also check parents for listeners if event propagates
  			for (var id in this._eventParents) {
  				if (this._eventParents[id].listens(type, fn, context, propagate)) { return true; }
  			}
  		}
  		return false;
  	},

  	// returns the index (number) or false
  	_listens: function (type, fn, context) {
  		if (!this._events) {
  			return false;
  		}

  		var listeners = this._events[type] || [];
  		if (!fn) {
  			return !!listeners.length;
  		}

  		if (context === this) {
  			// Less memory footprint.
  			context = undefined;
  		}

  		for (var i = 0, len = listeners.length; i < len; i++) {
  			if (listeners[i].fn === fn && listeners[i].ctx === context) {
  				return i;
  			}
  		}
  		return false;

  	},

  	// @method once(…): this
  	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
  	once: function (types, fn, context) {

  		// types can be a map of types/handlers
  		if (typeof types === 'object') {
  			for (var type in types) {
  				// we don't process space-separated events here for performance;
  				// it's a hot path since Layer uses the on(obj) syntax
  				this._on(type, types[type], fn, true);
  			}

  		} else {
  			// types can be a string of space-separated words
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._on(types[i], fn, context, true);
  			}
  		}

  		return this;
  	},

  	// @method addEventParent(obj: Evented): this
  	// Adds an event parent - an `Evented` that will receive propagated events
  	addEventParent: function (obj) {
  		this._eventParents = this._eventParents || {};
  		this._eventParents[stamp(obj)] = obj;
  		return this;
  	},

  	// @method removeEventParent(obj: Evented): this
  	// Removes an event parent, so it will stop receiving propagated events
  	removeEventParent: function (obj) {
  		if (this._eventParents) {
  			delete this._eventParents[stamp(obj)];
  		}
  		return this;
  	},

  	_propagateEvent: function (e) {
  		for (var id in this._eventParents) {
  			this._eventParents[id].fire(e.type, extend({
  				layer: e.target,
  				propagatedFrom: e.target
  			}, e), true);
  		}
  	}
  };

  // aliases; we should ditch those eventually

  // @method addEventListener(…): this
  // Alias to [`on(…)`](#evented-on)
  Events.addEventListener = Events.on;

  // @method removeEventListener(…): this
  // Alias to [`off(…)`](#evented-off)

  // @method clearAllEventListeners(…): this
  // Alias to [`off()`](#evented-off)
  Events.removeEventListener = Events.clearAllEventListeners = Events.off;

  // @method addOneTimeEventListener(…): this
  // Alias to [`once(…)`](#evented-once)
  Events.addOneTimeEventListener = Events.once;

  // @method fireEvent(…): this
  // Alias to [`fire(…)`](#evented-fire)
  Events.fireEvent = Events.fire;

  // @method hasEventListeners(…): Boolean
  // Alias to [`listens(…)`](#evented-listens)
  Events.hasEventListeners = Events.listens;

  var Evented = Class.extend(Events);

  /*
   * @class Point
   * @aka L.Point
   *
   * Represents a point with `x` and `y` coordinates in pixels.
   *
   * @example
   *
   * ```js
   * var point = L.point(200, 300);
   * ```
   *
   * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
   *
   * ```js
   * map.panBy([200, 300]);
   * map.panBy(L.point(200, 300));
   * ```
   *
   * Note that `Point` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Point(x, y, round) {
  	// @property x: Number; The `x` coordinate of the point
  	this.x = (round ? Math.round(x) : x);
  	// @property y: Number; The `y` coordinate of the point
  	this.y = (round ? Math.round(y) : y);
  }

  var trunc = Math.trunc || function (v) {
  	return v > 0 ? Math.floor(v) : Math.ceil(v);
  };

  Point.prototype = {

  	// @method clone(): Point
  	// Returns a copy of the current point.
  	clone: function () {
  		return new Point(this.x, this.y);
  	},

  	// @method add(otherPoint: Point): Point
  	// Returns the result of addition of the current and the given points.
  	add: function (point) {
  		// non-destructive, returns a new point
  		return this.clone()._add(toPoint(point));
  	},

  	_add: function (point) {
  		// destructive, used directly for performance in situations where it's safe to modify existing point
  		this.x += point.x;
  		this.y += point.y;
  		return this;
  	},

  	// @method subtract(otherPoint: Point): Point
  	// Returns the result of subtraction of the given point from the current.
  	subtract: function (point) {
  		return this.clone()._subtract(toPoint(point));
  	},

  	_subtract: function (point) {
  		this.x -= point.x;
  		this.y -= point.y;
  		return this;
  	},

  	// @method divideBy(num: Number): Point
  	// Returns the result of division of the current point by the given number.
  	divideBy: function (num) {
  		return this.clone()._divideBy(num);
  	},

  	_divideBy: function (num) {
  		this.x /= num;
  		this.y /= num;
  		return this;
  	},

  	// @method multiplyBy(num: Number): Point
  	// Returns the result of multiplication of the current point by the given number.
  	multiplyBy: function (num) {
  		return this.clone()._multiplyBy(num);
  	},

  	_multiplyBy: function (num) {
  		this.x *= num;
  		this.y *= num;
  		return this;
  	},

  	// @method scaleBy(scale: Point): Point
  	// Multiply each coordinate of the current point by each coordinate of
  	// `scale`. In linear algebra terms, multiply the point by the
  	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
  	// defined by `scale`.
  	scaleBy: function (point) {
  		return new Point(this.x * point.x, this.y * point.y);
  	},

  	// @method unscaleBy(scale: Point): Point
  	// Inverse of `scaleBy`. Divide each coordinate of the current point by
  	// each coordinate of `scale`.
  	unscaleBy: function (point) {
  		return new Point(this.x / point.x, this.y / point.y);
  	},

  	// @method round(): Point
  	// Returns a copy of the current point with rounded coordinates.
  	round: function () {
  		return this.clone()._round();
  	},

  	_round: function () {
  		this.x = Math.round(this.x);
  		this.y = Math.round(this.y);
  		return this;
  	},

  	// @method floor(): Point
  	// Returns a copy of the current point with floored coordinates (rounded down).
  	floor: function () {
  		return this.clone()._floor();
  	},

  	_floor: function () {
  		this.x = Math.floor(this.x);
  		this.y = Math.floor(this.y);
  		return this;
  	},

  	// @method ceil(): Point
  	// Returns a copy of the current point with ceiled coordinates (rounded up).
  	ceil: function () {
  		return this.clone()._ceil();
  	},

  	_ceil: function () {
  		this.x = Math.ceil(this.x);
  		this.y = Math.ceil(this.y);
  		return this;
  	},

  	// @method trunc(): Point
  	// Returns a copy of the current point with truncated coordinates (rounded towards zero).
  	trunc: function () {
  		return this.clone()._trunc();
  	},

  	_trunc: function () {
  		this.x = trunc(this.x);
  		this.y = trunc(this.y);
  		return this;
  	},

  	// @method distanceTo(otherPoint: Point): Number
  	// Returns the cartesian distance between the current and the given points.
  	distanceTo: function (point) {
  		point = toPoint(point);

  		var x = point.x - this.x,
  		    y = point.y - this.y;

  		return Math.sqrt(x * x + y * y);
  	},

  	// @method equals(otherPoint: Point): Boolean
  	// Returns `true` if the given point has the same coordinates.
  	equals: function (point) {
  		point = toPoint(point);

  		return point.x === this.x &&
  		       point.y === this.y;
  	},

  	// @method contains(otherPoint: Point): Boolean
  	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
  	contains: function (point) {
  		point = toPoint(point);

  		return Math.abs(point.x) <= Math.abs(this.x) &&
  		       Math.abs(point.y) <= Math.abs(this.y);
  	},

  	// @method toString(): String
  	// Returns a string representation of the point for debugging purposes.
  	toString: function () {
  		return 'Point(' +
  		        formatNum(this.x) + ', ' +
  		        formatNum(this.y) + ')';
  	}
  };

  // @factory L.point(x: Number, y: Number, round?: Boolean)
  // Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

  // @alternative
  // @factory L.point(coords: Number[])
  // Expects an array of the form `[x, y]` instead.

  // @alternative
  // @factory L.point(coords: Object)
  // Expects a plain object of the form `{x: Number, y: Number}` instead.
  function toPoint(x, y, round) {
  	if (x instanceof Point) {
  		return x;
  	}
  	if (isArray(x)) {
  		return new Point(x[0], x[1]);
  	}
  	if (x === undefined || x === null) {
  		return x;
  	}
  	if (typeof x === 'object' && 'x' in x && 'y' in x) {
  		return new Point(x.x, x.y);
  	}
  	return new Point(x, y, round);
  }

  /*
   * @class Bounds
   * @aka L.Bounds
   *
   * Represents a rectangular area in pixel coordinates.
   *
   * @example
   *
   * ```js
   * var p1 = L.point(10, 10),
   * p2 = L.point(40, 60),
   * bounds = L.bounds(p1, p2);
   * ```
   *
   * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
   *
   * ```js
   * otherBounds.intersects([[10, 10], [40, 60]]);
   * ```
   *
   * Note that `Bounds` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Bounds(a, b) {
  	if (!a) { return; }

  	var points = b ? [a, b] : a;

  	for (var i = 0, len = points.length; i < len; i++) {
  		this.extend(points[i]);
  	}
  }

  Bounds.prototype = {
  	// @method extend(point: Point): this
  	// Extends the bounds to contain the given point.

  	// @alternative
  	// @method extend(otherBounds: Bounds): this
  	// Extend the bounds to contain the given bounds
  	extend: function (obj) {
  		var min2, max2;
  		if (!obj) { return this; }

  		if (obj instanceof Point || typeof obj[0] === 'number' || 'x' in obj) {
  			min2 = max2 = toPoint(obj);
  		} else {
  			obj = toBounds(obj);
  			min2 = obj.min;
  			max2 = obj.max;

  			if (!min2 || !max2) { return this; }
  		}

  		// @property min: Point
  		// The top left corner of the rectangle.
  		// @property max: Point
  		// The bottom right corner of the rectangle.
  		if (!this.min && !this.max) {
  			this.min = min2.clone();
  			this.max = max2.clone();
  		} else {
  			this.min.x = Math.min(min2.x, this.min.x);
  			this.max.x = Math.max(max2.x, this.max.x);
  			this.min.y = Math.min(min2.y, this.min.y);
  			this.max.y = Math.max(max2.y, this.max.y);
  		}
  		return this;
  	},

  	// @method getCenter(round?: Boolean): Point
  	// Returns the center point of the bounds.
  	getCenter: function (round) {
  		return toPoint(
  		        (this.min.x + this.max.x) / 2,
  		        (this.min.y + this.max.y) / 2, round);
  	},

  	// @method getBottomLeft(): Point
  	// Returns the bottom-left point of the bounds.
  	getBottomLeft: function () {
  		return toPoint(this.min.x, this.max.y);
  	},

  	// @method getTopRight(): Point
  	// Returns the top-right point of the bounds.
  	getTopRight: function () { // -> Point
  		return toPoint(this.max.x, this.min.y);
  	},

  	// @method getTopLeft(): Point
  	// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
  	getTopLeft: function () {
  		return this.min; // left, top
  	},

  	// @method getBottomRight(): Point
  	// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
  	getBottomRight: function () {
  		return this.max; // right, bottom
  	},

  	// @method getSize(): Point
  	// Returns the size of the given bounds
  	getSize: function () {
  		return this.max.subtract(this.min);
  	},

  	// @method contains(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle contains the given one.
  	// @alternative
  	// @method contains(point: Point): Boolean
  	// Returns `true` if the rectangle contains the given point.
  	contains: function (obj) {
  		var min, max;

  		if (typeof obj[0] === 'number' || obj instanceof Point) {
  			obj = toPoint(obj);
  		} else {
  			obj = toBounds(obj);
  		}

  		if (obj instanceof Bounds) {
  			min = obj.min;
  			max = obj.max;
  		} else {
  			min = max = obj;
  		}

  		return (min.x >= this.min.x) &&
  		       (max.x <= this.max.x) &&
  		       (min.y >= this.min.y) &&
  		       (max.y <= this.max.y);
  	},

  	// @method intersects(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle intersects the given bounds. Two bounds
  	// intersect if they have at least one point in common.
  	intersects: function (bounds) { // (Bounds) -> Boolean
  		bounds = toBounds(bounds);

  		var min = this.min,
  		    max = this.max,
  		    min2 = bounds.min,
  		    max2 = bounds.max,
  		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
  		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

  		return xIntersects && yIntersects;
  	},

  	// @method overlaps(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds
  	// overlap if their intersection is an area.
  	overlaps: function (bounds) { // (Bounds) -> Boolean
  		bounds = toBounds(bounds);

  		var min = this.min,
  		    max = this.max,
  		    min2 = bounds.min,
  		    max2 = bounds.max,
  		    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
  		    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

  		return xOverlaps && yOverlaps;
  	},

  	// @method isValid(): Boolean
  	// Returns `true` if the bounds are properly initialized.
  	isValid: function () {
  		return !!(this.min && this.max);
  	},


  	// @method pad(bufferRatio: Number): Bounds
  	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
  	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
  	// Negative values will retract the bounds.
  	pad: function (bufferRatio) {
  		var min = this.min,
  		max = this.max,
  		heightBuffer = Math.abs(min.x - max.x) * bufferRatio,
  		widthBuffer = Math.abs(min.y - max.y) * bufferRatio;


  		return toBounds(
  			toPoint(min.x - heightBuffer, min.y - widthBuffer),
  			toPoint(max.x + heightBuffer, max.y + widthBuffer));
  	},


  	// @method equals(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle is equivalent to the given bounds.
  	equals: function (bounds) {
  		if (!bounds) { return false; }

  		bounds = toBounds(bounds);

  		return this.min.equals(bounds.getTopLeft()) &&
  			this.max.equals(bounds.getBottomRight());
  	},
  };


  // @factory L.bounds(corner1: Point, corner2: Point)
  // Creates a Bounds object from two corners coordinate pairs.
  // @alternative
  // @factory L.bounds(points: Point[])
  // Creates a Bounds object from the given array of points.
  function toBounds(a, b) {
  	if (!a || a instanceof Bounds) {
  		return a;
  	}
  	return new Bounds(a, b);
  }

  /*
   * @class LatLngBounds
   * @aka L.LatLngBounds
   *
   * Represents a rectangular geographical area on a map.
   *
   * @example
   *
   * ```js
   * var corner1 = L.latLng(40.712, -74.227),
   * corner2 = L.latLng(40.774, -74.125),
   * bounds = L.latLngBounds(corner1, corner2);
   * ```
   *
   * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
   *
   * ```js
   * map.fitBounds([
   * 	[40.712, -74.227],
   * 	[40.774, -74.125]
   * ]);
   * ```
   *
   * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
   *
   * Note that `LatLngBounds` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
  	if (!corner1) { return; }

  	var latlngs = corner2 ? [corner1, corner2] : corner1;

  	for (var i = 0, len = latlngs.length; i < len; i++) {
  		this.extend(latlngs[i]);
  	}
  }

  LatLngBounds.prototype = {

  	// @method extend(latlng: LatLng): this
  	// Extend the bounds to contain the given point

  	// @alternative
  	// @method extend(otherBounds: LatLngBounds): this
  	// Extend the bounds to contain the given bounds
  	extend: function (obj) {
  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2, ne2;

  		if (obj instanceof LatLng) {
  			sw2 = obj;
  			ne2 = obj;

  		} else if (obj instanceof LatLngBounds) {
  			sw2 = obj._southWest;
  			ne2 = obj._northEast;

  			if (!sw2 || !ne2) { return this; }

  		} else {
  			return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
  		}

  		if (!sw && !ne) {
  			this._southWest = new LatLng(sw2.lat, sw2.lng);
  			this._northEast = new LatLng(ne2.lat, ne2.lng);
  		} else {
  			sw.lat = Math.min(sw2.lat, sw.lat);
  			sw.lng = Math.min(sw2.lng, sw.lng);
  			ne.lat = Math.max(ne2.lat, ne.lat);
  			ne.lng = Math.max(ne2.lng, ne.lng);
  		}

  		return this;
  	},

  	// @method pad(bufferRatio: Number): LatLngBounds
  	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
  	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
  	// Negative values will retract the bounds.
  	pad: function (bufferRatio) {
  		var sw = this._southWest,
  		    ne = this._northEast,
  		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
  		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

  		return new LatLngBounds(
  		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
  		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
  	},

  	// @method getCenter(): LatLng
  	// Returns the center point of the bounds.
  	getCenter: function () {
  		return new LatLng(
  		        (this._southWest.lat + this._northEast.lat) / 2,
  		        (this._southWest.lng + this._northEast.lng) / 2);
  	},

  	// @method getSouthWest(): LatLng
  	// Returns the south-west point of the bounds.
  	getSouthWest: function () {
  		return this._southWest;
  	},

  	// @method getNorthEast(): LatLng
  	// Returns the north-east point of the bounds.
  	getNorthEast: function () {
  		return this._northEast;
  	},

  	// @method getNorthWest(): LatLng
  	// Returns the north-west point of the bounds.
  	getNorthWest: function () {
  		return new LatLng(this.getNorth(), this.getWest());
  	},

  	// @method getSouthEast(): LatLng
  	// Returns the south-east point of the bounds.
  	getSouthEast: function () {
  		return new LatLng(this.getSouth(), this.getEast());
  	},

  	// @method getWest(): Number
  	// Returns the west longitude of the bounds
  	getWest: function () {
  		return this._southWest.lng;
  	},

  	// @method getSouth(): Number
  	// Returns the south latitude of the bounds
  	getSouth: function () {
  		return this._southWest.lat;
  	},

  	// @method getEast(): Number
  	// Returns the east longitude of the bounds
  	getEast: function () {
  		return this._northEast.lng;
  	},

  	// @method getNorth(): Number
  	// Returns the north latitude of the bounds
  	getNorth: function () {
  		return this._northEast.lat;
  	},

  	// @method contains(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle contains the given one.

  	// @alternative
  	// @method contains (latlng: LatLng): Boolean
  	// Returns `true` if the rectangle contains the given point.
  	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
  		if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
  			obj = toLatLng(obj);
  		} else {
  			obj = toLatLngBounds(obj);
  		}

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2, ne2;

  		if (obj instanceof LatLngBounds) {
  			sw2 = obj.getSouthWest();
  			ne2 = obj.getNorthEast();
  		} else {
  			sw2 = ne2 = obj;
  		}

  		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
  		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
  	},

  	// @method intersects(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
  	intersects: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2 = bounds.getSouthWest(),
  		    ne2 = bounds.getNorthEast(),

  		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
  		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

  		return latIntersects && lngIntersects;
  	},

  	// @method overlaps(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
  	overlaps: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2 = bounds.getSouthWest(),
  		    ne2 = bounds.getNorthEast(),

  		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
  		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

  		return latOverlaps && lngOverlaps;
  	},

  	// @method toBBoxString(): String
  	// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
  	toBBoxString: function () {
  		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
  	},

  	// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
  	// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
  	equals: function (bounds, maxMargin) {
  		if (!bounds) { return false; }

  		bounds = toLatLngBounds(bounds);

  		return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
  		       this._northEast.equals(bounds.getNorthEast(), maxMargin);
  	},

  	// @method isValid(): Boolean
  	// Returns `true` if the bounds are properly initialized.
  	isValid: function () {
  		return !!(this._southWest && this._northEast);
  	}
  };

  // TODO International date line?

  // @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
  // Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

  // @alternative
  // @factory L.latLngBounds(latlngs: LatLng[])
  // Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
  function toLatLngBounds(a, b) {
  	if (a instanceof LatLngBounds) {
  		return a;
  	}
  	return new LatLngBounds(a, b);
  }

  /* @class LatLng
   * @aka L.LatLng
   *
   * Represents a geographical point with a certain latitude and longitude.
   *
   * @example
   *
   * ```
   * var latlng = L.latLng(50.5, 30.5);
   * ```
   *
   * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
   *
   * ```
   * map.panTo([50, 30]);
   * map.panTo({lon: 30, lat: 50});
   * map.panTo({lat: 50, lng: 30});
   * map.panTo(L.latLng(50, 30));
   * ```
   *
   * Note that `LatLng` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function LatLng(lat, lng, alt) {
  	if (isNaN(lat) || isNaN(lng)) {
  		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
  	}

  	// @property lat: Number
  	// Latitude in degrees
  	this.lat = +lat;

  	// @property lng: Number
  	// Longitude in degrees
  	this.lng = +lng;

  	// @property alt: Number
  	// Altitude in meters (optional)
  	if (alt !== undefined) {
  		this.alt = +alt;
  	}
  }

  LatLng.prototype = {
  	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
  	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
  	equals: function (obj, maxMargin) {
  		if (!obj) { return false; }

  		obj = toLatLng(obj);

  		var margin = Math.max(
  		        Math.abs(this.lat - obj.lat),
  		        Math.abs(this.lng - obj.lng));

  		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
  	},

  	// @method toString(): String
  	// Returns a string representation of the point (for debugging purposes).
  	toString: function (precision) {
  		return 'LatLng(' +
  		        formatNum(this.lat, precision) + ', ' +
  		        formatNum(this.lng, precision) + ')';
  	},

  	// @method distanceTo(otherLatLng: LatLng): Number
  	// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
  	distanceTo: function (other) {
  		return Earth.distance(this, toLatLng(other));
  	},

  	// @method wrap(): LatLng
  	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
  	wrap: function () {
  		return Earth.wrapLatLng(this);
  	},

  	// @method toBounds(sizeInMeters: Number): LatLngBounds
  	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
  	toBounds: function (sizeInMeters) {
  		var latAccuracy = 180 * sizeInMeters / 40075017,
  		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

  		return toLatLngBounds(
  		        [this.lat - latAccuracy, this.lng - lngAccuracy],
  		        [this.lat + latAccuracy, this.lng + lngAccuracy]);
  	},

  	clone: function () {
  		return new LatLng(this.lat, this.lng, this.alt);
  	}
  };



  // @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
  // Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

  // @alternative
  // @factory L.latLng(coords: Array): LatLng
  // Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

  // @alternative
  // @factory L.latLng(coords: Object): LatLng
  // Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

  function toLatLng(a, b, c) {
  	if (a instanceof LatLng) {
  		return a;
  	}
  	if (isArray(a) && typeof a[0] !== 'object') {
  		if (a.length === 3) {
  			return new LatLng(a[0], a[1], a[2]);
  		}
  		if (a.length === 2) {
  			return new LatLng(a[0], a[1]);
  		}
  		return null;
  	}
  	if (a === undefined || a === null) {
  		return a;
  	}
  	if (typeof a === 'object' && 'lat' in a) {
  		return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
  	}
  	if (b === undefined) {
  		return null;
  	}
  	return new LatLng(a, b, c);
  }

  /*
   * @namespace CRS
   * @crs L.CRS.Base
   * Object that defines coordinate reference systems for projecting
   * geographical points into pixel (screen) coordinates and back (and to
   * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
   * [spatial reference system](https://en.wikipedia.org/wiki/Spatial_reference_system).
   *
   * Leaflet defines the most usual CRSs by default. If you want to use a
   * CRS not defined by default, take a look at the
   * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
   *
   * Note that the CRS instances do not inherit from Leaflet's `Class` object,
   * and can't be instantiated. Also, new classes can't inherit from them,
   * and methods can't be added to them with the `include` function.
   */

  var CRS = {
  	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
  	// Projects geographical coordinates into pixel coordinates for a given zoom.
  	latLngToPoint: function (latlng, zoom) {
  		var projectedPoint = this.projection.project(latlng),
  		    scale = this.scale(zoom);

  		return this.transformation._transform(projectedPoint, scale);
  	},

  	// @method pointToLatLng(point: Point, zoom: Number): LatLng
  	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
  	// zoom into geographical coordinates.
  	pointToLatLng: function (point, zoom) {
  		var scale = this.scale(zoom),
  		    untransformedPoint = this.transformation.untransform(point, scale);

  		return this.projection.unproject(untransformedPoint);
  	},

  	// @method project(latlng: LatLng): Point
  	// Projects geographical coordinates into coordinates in units accepted for
  	// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
  	project: function (latlng) {
  		return this.projection.project(latlng);
  	},

  	// @method unproject(point: Point): LatLng
  	// Given a projected coordinate returns the corresponding LatLng.
  	// The inverse of `project`.
  	unproject: function (point) {
  		return this.projection.unproject(point);
  	},

  	// @method scale(zoom: Number): Number
  	// Returns the scale used when transforming projected coordinates into
  	// pixel coordinates for a particular zoom. For example, it returns
  	// `256 * 2^zoom` for Mercator-based CRS.
  	scale: function (zoom) {
  		return 256 * Math.pow(2, zoom);
  	},

  	// @method zoom(scale: Number): Number
  	// Inverse of `scale()`, returns the zoom level corresponding to a scale
  	// factor of `scale`.
  	zoom: function (scale) {
  		return Math.log(scale / 256) / Math.LN2;
  	},

  	// @method getProjectedBounds(zoom: Number): Bounds
  	// Returns the projection's bounds scaled and transformed for the provided `zoom`.
  	getProjectedBounds: function (zoom) {
  		if (this.infinite) { return null; }

  		var b = this.projection.bounds,
  		    s = this.scale(zoom),
  		    min = this.transformation.transform(b.min, s),
  		    max = this.transformation.transform(b.max, s);

  		return new Bounds(min, max);
  	},

  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
  	// Returns the distance between two geographical coordinates.

  	// @property code: String
  	// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
  	//
  	// @property wrapLng: Number[]
  	// An array of two numbers defining whether the longitude (horizontal) coordinate
  	// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
  	// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
  	//
  	// @property wrapLat: Number[]
  	// Like `wrapLng`, but for the latitude (vertical) axis.

  	// wrapLng: [min, max],
  	// wrapLat: [min, max],

  	// @property infinite: Boolean
  	// If true, the coordinate space will be unbounded (infinite in both axes)
  	infinite: false,

  	// @method wrapLatLng(latlng: LatLng): LatLng
  	// Returns a `LatLng` where lat and lng has been wrapped according to the
  	// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
  	wrapLatLng: function (latlng) {
  		var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
  		    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
  		    alt = latlng.alt;

  		return new LatLng(lat, lng, alt);
  	},

  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  	// Returns a `LatLngBounds` with the same size as the given one, ensuring
  	// that its center is within the CRS's bounds.
  	// Only accepts actual `L.LatLngBounds` instances, not arrays.
  	wrapLatLngBounds: function (bounds) {
  		var center = bounds.getCenter(),
  		    newCenter = this.wrapLatLng(center),
  		    latShift = center.lat - newCenter.lat,
  		    lngShift = center.lng - newCenter.lng;

  		if (latShift === 0 && lngShift === 0) {
  			return bounds;
  		}

  		var sw = bounds.getSouthWest(),
  		    ne = bounds.getNorthEast(),
  		    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
  		    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

  		return new LatLngBounds(newSw, newNe);
  	}
  };

  /*
   * @namespace CRS
   * @crs L.CRS.Earth
   *
   * Serves as the base for CRS that are global such that they cover the earth.
   * Can only be used as the base for other CRS and cannot be used directly,
   * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
   * meters.
   */

  var Earth = extend({}, CRS, {
  	wrapLng: [-180, 180],

  	// Mean Earth Radius, as recommended for use by
  	// the International Union of Geodesy and Geophysics,
  	// see https://rosettacode.org/wiki/Haversine_formula
  	R: 6371000,

  	// distance between two geographical points using spherical law of cosines approximation
  	distance: function (latlng1, latlng2) {
  		var rad = Math.PI / 180,
  		    lat1 = latlng1.lat * rad,
  		    lat2 = latlng2.lat * rad,
  		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
  		    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
  		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
  		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  		return this.R * c;
  	}
  });

  /*
   * @namespace Projection
   * @projection L.Projection.SphericalMercator
   *
   * Spherical Mercator projection — the most common projection for online maps,
   * used by almost all free and commercial tile providers. Assumes that Earth is
   * a sphere. Used by the `EPSG:3857` CRS.
   */

  var earthRadius = 6378137;

  var SphericalMercator = {

  	R: earthRadius,
  	MAX_LATITUDE: 85.0511287798,

  	project: function (latlng) {
  		var d = Math.PI / 180,
  		    max = this.MAX_LATITUDE,
  		    lat = Math.max(Math.min(max, latlng.lat), -max),
  		    sin = Math.sin(lat * d);

  		return new Point(
  			this.R * latlng.lng * d,
  			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
  	},

  	unproject: function (point) {
  		var d = 180 / Math.PI;

  		return new LatLng(
  			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
  			point.x * d / this.R);
  	},

  	bounds: (function () {
  		var d = earthRadius * Math.PI;
  		return new Bounds([-d, -d], [d, d]);
  	})()
  };

  /*
   * @class Transformation
   * @aka L.Transformation
   *
   * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
   * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
   * the reverse. Used by Leaflet in its projections code.
   *
   * @example
   *
   * ```js
   * var transformation = L.transformation(2, 5, -1, 10),
   * 	p = L.point(1, 2),
   * 	p2 = transformation.transform(p), //  L.point(7, 8)
   * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
   * ```
   */


  // factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
  // Creates a `Transformation` object with the given coefficients.
  function Transformation(a, b, c, d) {
  	if (isArray(a)) {
  		// use array properties
  		this._a = a[0];
  		this._b = a[1];
  		this._c = a[2];
  		this._d = a[3];
  		return;
  	}
  	this._a = a;
  	this._b = b;
  	this._c = c;
  	this._d = d;
  }

  Transformation.prototype = {
  	// @method transform(point: Point, scale?: Number): Point
  	// Returns a transformed point, optionally multiplied by the given scale.
  	// Only accepts actual `L.Point` instances, not arrays.
  	transform: function (point, scale) { // (Point, Number) -> Point
  		return this._transform(point.clone(), scale);
  	},

  	// destructive transform (faster)
  	_transform: function (point, scale) {
  		scale = scale || 1;
  		point.x = scale * (this._a * point.x + this._b);
  		point.y = scale * (this._c * point.y + this._d);
  		return point;
  	},

  	// @method untransform(point: Point, scale?: Number): Point
  	// Returns the reverse transformation of the given point, optionally divided
  	// by the given scale. Only accepts actual `L.Point` instances, not arrays.
  	untransform: function (point, scale) {
  		scale = scale || 1;
  		return new Point(
  		        (point.x / scale - this._b) / this._a,
  		        (point.y / scale - this._d) / this._c);
  	}
  };

  // factory L.transformation(a: Number, b: Number, c: Number, d: Number)

  // @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
  // Instantiates a Transformation object with the given coefficients.

  // @alternative
  // @factory L.transformation(coefficients: Array): Transformation
  // Expects an coefficients array of the form
  // `[a: Number, b: Number, c: Number, d: Number]`.

  function toTransformation(a, b, c, d) {
  	return new Transformation(a, b, c, d);
  }

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG3857
   *
   * The most common CRS for online maps, used by almost all free and commercial
   * tile providers. Uses Spherical Mercator projection. Set in by default in
   * Map's `crs` option.
   */

  var EPSG3857 = extend({}, Earth, {
  	code: 'EPSG:3857',
  	projection: SphericalMercator,

  	transformation: (function () {
  		var scale = 0.5 / (Math.PI * SphericalMercator.R);
  		return toTransformation(scale, 0.5, -scale, 0.5);
  	}())
  });

  var EPSG900913 = extend({}, EPSG3857, {
  	code: 'EPSG:900913'
  });

  // @namespace SVG; @section
  // There are several static functions which can be called without instantiating L.SVG:

  // @function create(name: String): SVGElement
  // Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
  // corresponding to the class name passed. For example, using 'line' will return
  // an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
  function svgCreate(name) {
  	return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  // @function pointsToPath(rings: Point[], closed: Boolean): String
  // Generates a SVG path string for multiple rings, with each ring turning
  // into "M..L..L.." instructions
  function pointsToPath(rings, closed) {
  	var str = '',
  	i, j, len, len2, points, p;

  	for (i = 0, len = rings.length; i < len; i++) {
  		points = rings[i];

  		for (j = 0, len2 = points.length; j < len2; j++) {
  			p = points[j];
  			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
  		}

  		// closes the ring for polygons; "x" is VML syntax
  		str += closed ? (Browser.svg ? 'z' : 'x') : '';
  	}

  	// SVG complains about empty path strings
  	return str || 'M0 0';
  }

  /*
   * @namespace Browser
   * @aka L.Browser
   *
   * A namespace with static properties for browser/feature detection used by Leaflet internally.
   *
   * @example
   *
   * ```js
   * if (L.Browser.ielt9) {
   *   alert('Upgrade your browser, dude!');
   * }
   * ```
   */

  var style = document.documentElement.style;

  // @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
  var ie = 'ActiveXObject' in window;

  // @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
  var ielt9 = ie && !document.addEventListener;

  // @property edge: Boolean; `true` for the Edge web browser.
  var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

  // @property webkit: Boolean;
  // `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
  var webkit = userAgentContains('webkit');

  // @property android: Boolean
  // **Deprecated.** `true` for any browser running on an Android platform.
  var android = userAgentContains('android');

  // @property android23: Boolean; **Deprecated.** `true` for browsers running on Android 2 or Android 3.
  var android23 = userAgentContains('android 2') || userAgentContains('android 3');

  /* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
  var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
  // @property androidStock: Boolean; **Deprecated.** `true` for the Android stock browser (i.e. not Chrome)
  var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

  // @property opera: Boolean; `true` for the Opera browser
  var opera = !!window.opera;

  // @property chrome: Boolean; `true` for the Chrome browser.
  var chrome = !edge && userAgentContains('chrome');

  // @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
  var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

  // @property safari: Boolean; `true` for the Safari browser.
  var safari = !chrome && userAgentContains('safari');

  var phantom = userAgentContains('phantom');

  // @property opera12: Boolean
  // `true` for the Opera browser supporting CSS transforms (version 12 or later).
  var opera12 = 'OTransition' in style;

  // @property win: Boolean; `true` when the browser is running in a Windows platform
  var win = navigator.platform.indexOf('Win') === 0;

  // @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
  var ie3d = ie && ('transition' in style);

  // @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
  var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

  // @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
  var gecko3d = 'MozPerspective' in style;

  // @property any3d: Boolean
  // `true` for all browsers supporting CSS transforms.
  var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

  // @property mobile: Boolean; `true` for all browsers running in a mobile device.
  var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

  // @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
  var mobileWebkit = mobile && webkit;

  // @property mobileWebkit3d: Boolean
  // `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
  var mobileWebkit3d = mobile && webkit3d;

  // @property msPointer: Boolean
  // `true` for browsers implementing the Microsoft touch events model (notably IE10).
  var msPointer = !window.PointerEvent && window.MSPointerEvent;

  // @property pointer: Boolean
  // `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
  var pointer = !!(window.PointerEvent || msPointer);

  // @property touchNative: Boolean
  // `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
  // **This does not necessarily mean** that the browser is running in a computer with
  // a touchscreen, it only means that the browser is capable of understanding
  // touch events.
  var touchNative = 'ontouchstart' in window || !!window.TouchEvent;

  // @property touch: Boolean
  // `true` for all browsers supporting either [touch](#browser-touch) or [pointer](#browser-pointer) events.
  // Note: pointer events will be preferred (if available), and processed for all `touch*` listeners.
  var touch = !window.L_NO_TOUCH && (touchNative || pointer);

  // @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
  var mobileOpera = mobile && opera;

  // @property mobileGecko: Boolean
  // `true` for gecko-based browsers running in a mobile device.
  var mobileGecko = mobile && gecko;

  // @property retina: Boolean
  // `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
  var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

  // @property passiveEvents: Boolean
  // `true` for browsers that support passive events.
  var passiveEvents = (function () {
  	var supportsPassiveOption = false;
  	try {
  		var opts = Object.defineProperty({}, 'passive', {
  			get: function () { // eslint-disable-line getter-return
  				supportsPassiveOption = true;
  			}
  		});
  		window.addEventListener('testPassiveEventSupport', falseFn, opts);
  		window.removeEventListener('testPassiveEventSupport', falseFn, opts);
  	} catch (e) {
  		// Errors can safely be ignored since this is only a browser support test.
  	}
  	return supportsPassiveOption;
  }());

  // @property canvas: Boolean
  // `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
  var canvas$1 = (function () {
  	return !!document.createElement('canvas').getContext;
  }());

  // @property svg: Boolean
  // `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
  var svg$1 = !!(document.createElementNS && svgCreate('svg').createSVGRect);

  var inlineSvg = !!svg$1 && (function () {
  	var div = document.createElement('div');
  	div.innerHTML = '<svg/>';
  	return (div.firstChild && div.firstChild.namespaceURI) === 'http://www.w3.org/2000/svg';
  })();

  // @property vml: Boolean
  // `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
  var vml = !svg$1 && (function () {
  	try {
  		var div = document.createElement('div');
  		div.innerHTML = '<v:shape adj="1"/>';

  		var shape = div.firstChild;
  		shape.style.behavior = 'url(#default#VML)';

  		return shape && (typeof shape.adj === 'object');

  	} catch (e) {
  		return false;
  	}
  }());


  // @property mac: Boolean; `true` when the browser is running in a Mac platform
  var mac = navigator.platform.indexOf('Mac') === 0;

  // @property mac: Boolean; `true` when the browser is running in a Linux platform
  var linux = navigator.platform.indexOf('Linux') === 0;

  function userAgentContains(str) {
  	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
  }


  var Browser = {
  	ie: ie,
  	ielt9: ielt9,
  	edge: edge,
  	webkit: webkit,
  	android: android,
  	android23: android23,
  	androidStock: androidStock,
  	opera: opera,
  	chrome: chrome,
  	gecko: gecko,
  	safari: safari,
  	phantom: phantom,
  	opera12: opera12,
  	win: win,
  	ie3d: ie3d,
  	webkit3d: webkit3d,
  	gecko3d: gecko3d,
  	any3d: any3d,
  	mobile: mobile,
  	mobileWebkit: mobileWebkit,
  	mobileWebkit3d: mobileWebkit3d,
  	msPointer: msPointer,
  	pointer: pointer,
  	touch: touch,
  	touchNative: touchNative,
  	mobileOpera: mobileOpera,
  	mobileGecko: mobileGecko,
  	retina: retina,
  	passiveEvents: passiveEvents,
  	canvas: canvas$1,
  	svg: svg$1,
  	vml: vml,
  	inlineSvg: inlineSvg,
  	mac: mac,
  	linux: linux
  };

  /*
   * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
   */

  var POINTER_DOWN =   Browser.msPointer ? 'MSPointerDown'   : 'pointerdown';
  var POINTER_MOVE =   Browser.msPointer ? 'MSPointerMove'   : 'pointermove';
  var POINTER_UP =     Browser.msPointer ? 'MSPointerUp'     : 'pointerup';
  var POINTER_CANCEL = Browser.msPointer ? 'MSPointerCancel' : 'pointercancel';
  var pEvent = {
  	touchstart  : POINTER_DOWN,
  	touchmove   : POINTER_MOVE,
  	touchend    : POINTER_UP,
  	touchcancel : POINTER_CANCEL
  };
  var handle = {
  	touchstart  : _onPointerStart,
  	touchmove   : _handlePointer,
  	touchend    : _handlePointer,
  	touchcancel : _handlePointer
  };
  var _pointers = {};
  var _pointerDocListener = false;

  // Provides a touch events wrapper for (ms)pointer events.
  // ref https://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

  function addPointerListener(obj, type, handler) {
  	if (type === 'touchstart') {
  		_addPointerDocListener();
  	}
  	if (!handle[type]) {
  		console.warn('wrong event specified:', type);
  		return falseFn;
  	}
  	handler = handle[type].bind(this, handler);
  	obj.addEventListener(pEvent[type], handler, false);
  	return handler;
  }

  function removePointerListener(obj, type, handler) {
  	if (!pEvent[type]) {
  		console.warn('wrong event specified:', type);
  		return;
  	}
  	obj.removeEventListener(pEvent[type], handler, false);
  }

  function _globalPointerDown(e) {
  	_pointers[e.pointerId] = e;
  }

  function _globalPointerMove(e) {
  	if (_pointers[e.pointerId]) {
  		_pointers[e.pointerId] = e;
  	}
  }

  function _globalPointerUp(e) {
  	delete _pointers[e.pointerId];
  }

  function _addPointerDocListener() {
  	// need to keep track of what pointers and how many are active to provide e.touches emulation
  	if (!_pointerDocListener) {
  		// we listen document as any drags that end by moving the touch off the screen get fired there
  		document.addEventListener(POINTER_DOWN, _globalPointerDown, true);
  		document.addEventListener(POINTER_MOVE, _globalPointerMove, true);
  		document.addEventListener(POINTER_UP, _globalPointerUp, true);
  		document.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

  		_pointerDocListener = true;
  	}
  }

  function _handlePointer(handler, e) {
  	if (e.pointerType === (e.MSPOINTER_TYPE_MOUSE || 'mouse')) { return; }

  	e.touches = [];
  	for (var i in _pointers) {
  		e.touches.push(_pointers[i]);
  	}
  	e.changedTouches = [e];

  	handler(e);
  }

  function _onPointerStart(handler, e) {
  	// IE10 specific: MsTouch needs preventDefault. See #2000
  	if (e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH) {
  		preventDefault(e);
  	}
  	_handlePointer(handler, e);
  }

  /*
   * Extends the event handling code with double tap support for mobile browsers.
   *
   * Note: currently most browsers fire native dblclick, with only a few exceptions
   * (see https://github.com/Leaflet/Leaflet/issues/7012#issuecomment-595087386)
   */

  function makeDblclick(event) {
  	// in modern browsers `type` cannot be just overridden:
  	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only
  	var newEvent = {},
  	    prop, i;
  	for (i in event) {
  		prop = event[i];
  		newEvent[i] = prop && prop.bind ? prop.bind(event) : prop;
  	}
  	event = newEvent;
  	newEvent.type = 'dblclick';
  	newEvent.detail = 2;
  	newEvent.isTrusted = false;
  	newEvent._simulated = true; // for debug purposes
  	return newEvent;
  }

  var delay = 200;
  function addDoubleTapListener(obj, handler) {
  	// Most browsers handle double tap natively
  	obj.addEventListener('dblclick', handler);

  	// On some platforms the browser doesn't fire native dblclicks for touch events.
  	// It seems that in all such cases `detail` property of `click` event is always `1`.
  	// So here we rely on that fact to avoid excessive 'dblclick' simulation when not needed.
  	var last = 0,
  	    detail;
  	function simDblclick(e) {
  		if (e.detail !== 1) {
  			detail = e.detail; // keep in sync to avoid false dblclick in some cases
  			return;
  		}

  		if (e.pointerType === 'mouse' ||
  			(e.sourceCapabilities && !e.sourceCapabilities.firesTouchEvents)) {

  			return;
  		}

  		// When clicking on an <input>, the browser generates a click on its
  		// <label> (and vice versa) triggering two clicks in quick succession.
  		// This ignores clicks on elements which are a label with a 'for'
  		// attribute (or children of such a label), but not children of
  		// a <input>.
  		var path = getPropagationPath(e);
  		if (path.some(function (el) {
  			return el instanceof HTMLLabelElement && el.attributes.for;
  		}) &&
  			!path.some(function (el) {
  				return (
  					el instanceof HTMLInputElement ||
  					el instanceof HTMLSelectElement
  				);
  			})
  		) {
  			return;
  		}

  		var now = Date.now();
  		if (now - last <= delay) {
  			detail++;
  			if (detail === 2) {
  				handler(makeDblclick(e));
  			}
  		} else {
  			detail = 1;
  		}
  		last = now;
  	}

  	obj.addEventListener('click', simDblclick);

  	return {
  		dblclick: handler,
  		simDblclick: simDblclick
  	};
  }

  function removeDoubleTapListener(obj, handlers) {
  	obj.removeEventListener('dblclick', handlers.dblclick);
  	obj.removeEventListener('click', handlers.simDblclick);
  }

  /*
   * @namespace DomUtil
   *
   * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
   * tree, used by Leaflet internally.
   *
   * Most functions expecting or returning a `HTMLElement` also work for
   * SVG elements. The only difference is that classes refer to CSS classes
   * in HTML and SVG classes in SVG.
   */


  // @property TRANSFORM: String
  // Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
  var TRANSFORM = testProp(
  	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

  // webkitTransition comes first because some browser versions that drop vendor prefix don't do
  // the same for the transitionend event, in particular the Android 4.1 stock browser

  // @property TRANSITION: String
  // Vendor-prefixed transition style name.
  var TRANSITION = testProp(
  	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

  // @property TRANSITION_END: String
  // Vendor-prefixed transitionend event name.
  var TRANSITION_END =
  	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


  // @function get(id: String|HTMLElement): HTMLElement
  // Returns an element given its DOM id, or returns the element itself
  // if it was passed directly.
  function get(id) {
  	return typeof id === 'string' ? document.getElementById(id) : id;
  }

  // @function getStyle(el: HTMLElement, styleAttrib: String): String
  // Returns the value for a certain style attribute on an element,
  // including computed values or values set through CSS.
  function getStyle(el, style) {
  	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

  	if ((!value || value === 'auto') && document.defaultView) {
  		var css = document.defaultView.getComputedStyle(el, null);
  		value = css ? css[style] : null;
  	}
  	return value === 'auto' ? null : value;
  }

  // @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
  // Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
  function create$1(tagName, className, container) {
  	var el = document.createElement(tagName);
  	el.className = className || '';

  	if (container) {
  		container.appendChild(el);
  	}
  	return el;
  }

  // @function remove(el: HTMLElement)
  // Removes `el` from its parent element
  function remove(el) {
  	var parent = el.parentNode;
  	if (parent) {
  		parent.removeChild(el);
  	}
  }

  // @function empty(el: HTMLElement)
  // Removes all of `el`'s children elements from `el`
  function empty(el) {
  	while (el.firstChild) {
  		el.removeChild(el.firstChild);
  	}
  }

  // @function toFront(el: HTMLElement)
  // Makes `el` the last child of its parent, so it renders in front of the other children.
  function toFront(el) {
  	var parent = el.parentNode;
  	if (parent && parent.lastChild !== el) {
  		parent.appendChild(el);
  	}
  }

  // @function toBack(el: HTMLElement)
  // Makes `el` the first child of its parent, so it renders behind the other children.
  function toBack(el) {
  	var parent = el.parentNode;
  	if (parent && parent.firstChild !== el) {
  		parent.insertBefore(el, parent.firstChild);
  	}
  }

  // @function hasClass(el: HTMLElement, name: String): Boolean
  // Returns `true` if the element's class attribute contains `name`.
  function hasClass(el, name) {
  	if (el.classList !== undefined) {
  		return el.classList.contains(name);
  	}
  	var className = getClass(el);
  	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
  }

  // @function addClass(el: HTMLElement, name: String)
  // Adds `name` to the element's class attribute.
  function addClass(el, name) {
  	if (el.classList !== undefined) {
  		var classes = splitWords(name);
  		for (var i = 0, len = classes.length; i < len; i++) {
  			el.classList.add(classes[i]);
  		}
  	} else if (!hasClass(el, name)) {
  		var className = getClass(el);
  		setClass(el, (className ? className + ' ' : '') + name);
  	}
  }

  // @function removeClass(el: HTMLElement, name: String)
  // Removes `name` from the element's class attribute.
  function removeClass(el, name) {
  	if (el.classList !== undefined) {
  		el.classList.remove(name);
  	} else {
  		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
  	}
  }

  // @function setClass(el: HTMLElement, name: String)
  // Sets the element's class.
  function setClass(el, name) {
  	if (el.className.baseVal === undefined) {
  		el.className = name;
  	} else {
  		// in case of SVG element
  		el.className.baseVal = name;
  	}
  }

  // @function getClass(el: HTMLElement): String
  // Returns the element's class.
  function getClass(el) {
  	// Check if the element is an SVGElementInstance and use the correspondingElement instead
  	// (Required for linked SVG elements in IE11.)
  	if (el.correspondingElement) {
  		el = el.correspondingElement;
  	}
  	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
  }

  // @function setOpacity(el: HTMLElement, opacity: Number)
  // Set the opacity of an element (including old IE support).
  // `opacity` must be a number from `0` to `1`.
  function setOpacity(el, value) {
  	if ('opacity' in el.style) {
  		el.style.opacity = value;
  	} else if ('filter' in el.style) {
  		_setOpacityIE(el, value);
  	}
  }

  function _setOpacityIE(el, value) {
  	var filter = false,
  	    filterName = 'DXImageTransform.Microsoft.Alpha';

  	// filters collection throws an error if we try to retrieve a filter that doesn't exist
  	try {
  		filter = el.filters.item(filterName);
  	} catch (e) {
  		// don't set opacity to 1 if we haven't already set an opacity,
  		// it isn't needed and breaks transparent pngs.
  		if (value === 1) { return; }
  	}

  	value = Math.round(value * 100);

  	if (filter) {
  		filter.Enabled = (value !== 100);
  		filter.Opacity = value;
  	} else {
  		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
  	}
  }

  // @function testProp(props: String[]): String|false
  // Goes through the array of style names and returns the first name
  // that is a valid style name for an element. If no such name is found,
  // it returns false. Useful for vendor-prefixed styles like `transform`.
  function testProp(props) {
  	var style = document.documentElement.style;

  	for (var i = 0; i < props.length; i++) {
  		if (props[i] in style) {
  			return props[i];
  		}
  	}
  	return false;
  }

  // @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
  // Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
  // and optionally scaled by `scale`. Does not have an effect if the
  // browser doesn't support 3D CSS transforms.
  function setTransform(el, offset, scale) {
  	var pos = offset || new Point(0, 0);

  	el.style[TRANSFORM] =
  		(Browser.ie3d ?
  			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
  			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
  		(scale ? ' scale(' + scale + ')' : '');
  }

  // @function setPosition(el: HTMLElement, position: Point)
  // Sets the position of `el` to coordinates specified by `position`,
  // using CSS translate or top/left positioning depending on the browser
  // (used by Leaflet internally to position its layers).
  function setPosition(el, point) {

  	/*eslint-disable */
  	el._leaflet_pos = point;
  	/* eslint-enable */

  	if (Browser.any3d) {
  		setTransform(el, point);
  	} else {
  		el.style.left = point.x + 'px';
  		el.style.top = point.y + 'px';
  	}
  }

  // @function getPosition(el: HTMLElement): Point
  // Returns the coordinates of an element previously positioned with setPosition.
  function getPosition(el) {
  	// this method is only used for elements previously positioned using setPosition,
  	// so it's safe to cache the position for performance

  	return el._leaflet_pos || new Point(0, 0);
  }

  // @function disableTextSelection()
  // Prevents the user from generating `selectstart` DOM events, usually generated
  // when the user drags the mouse through a page with text. Used internally
  // by Leaflet to override the behaviour of any click-and-drag interaction on
  // the map. Affects drag interactions on the whole document.

  // @function enableTextSelection()
  // Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
  var disableTextSelection;
  var enableTextSelection;
  var _userSelect;
  if ('onselectstart' in document) {
  	disableTextSelection = function () {
  		on(window, 'selectstart', preventDefault);
  	};
  	enableTextSelection = function () {
  		off(window, 'selectstart', preventDefault);
  	};
  } else {
  	var userSelectProperty = testProp(
  		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

  	disableTextSelection = function () {
  		if (userSelectProperty) {
  			var style = document.documentElement.style;
  			_userSelect = style[userSelectProperty];
  			style[userSelectProperty] = 'none';
  		}
  	};
  	enableTextSelection = function () {
  		if (userSelectProperty) {
  			document.documentElement.style[userSelectProperty] = _userSelect;
  			_userSelect = undefined;
  		}
  	};
  }

  // @function disableImageDrag()
  // As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
  // for `dragstart` DOM events, usually generated when the user drags an image.
  function disableImageDrag() {
  	on(window, 'dragstart', preventDefault);
  }

  // @function enableImageDrag()
  // Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
  function enableImageDrag() {
  	off(window, 'dragstart', preventDefault);
  }

  var _outlineElement, _outlineStyle;
  // @function preventOutline(el: HTMLElement)
  // Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
  // of the element `el` invisible. Used internally by Leaflet to prevent
  // focusable elements from displaying an outline when the user performs a
  // drag interaction on them.
  function preventOutline(element) {
  	while (element.tabIndex === -1) {
  		element = element.parentNode;
  	}
  	if (!element.style) { return; }
  	restoreOutline();
  	_outlineElement = element;
  	_outlineStyle = element.style.outlineStyle;
  	element.style.outlineStyle = 'none';
  	on(window, 'keydown', restoreOutline);
  }

  // @function restoreOutline()
  // Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
  function restoreOutline() {
  	if (!_outlineElement) { return; }
  	_outlineElement.style.outlineStyle = _outlineStyle;
  	_outlineElement = undefined;
  	_outlineStyle = undefined;
  	off(window, 'keydown', restoreOutline);
  }

  // @function getSizedParentNode(el: HTMLElement): HTMLElement
  // Finds the closest parent node which size (width and height) is not null.
  function getSizedParentNode(element) {
  	do {
  		element = element.parentNode;
  	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
  	return element;
  }

  // @function getScale(el: HTMLElement): Object
  // Computes the CSS scale currently applied on the element.
  // Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
  // and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
  function getScale(element) {
  	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

  	return {
  		x: rect.width / element.offsetWidth || 1,
  		y: rect.height / element.offsetHeight || 1,
  		boundingClientRect: rect
  	};
  }

  var DomUtil = {
    __proto__: null,
    TRANSFORM: TRANSFORM,
    TRANSITION: TRANSITION,
    TRANSITION_END: TRANSITION_END,
    get: get,
    getStyle: getStyle,
    create: create$1,
    remove: remove,
    empty: empty,
    toFront: toFront,
    toBack: toBack,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    setClass: setClass,
    getClass: getClass,
    setOpacity: setOpacity,
    testProp: testProp,
    setTransform: setTransform,
    setPosition: setPosition,
    getPosition: getPosition,
    get disableTextSelection () { return disableTextSelection; },
    get enableTextSelection () { return enableTextSelection; },
    disableImageDrag: disableImageDrag,
    enableImageDrag: enableImageDrag,
    preventOutline: preventOutline,
    restoreOutline: restoreOutline,
    getSizedParentNode: getSizedParentNode,
    getScale: getScale
  };

  /*
   * @namespace DomEvent
   * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
   */

  // Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

  // @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Adds a listener function (`fn`) to a particular DOM event type of the
  // element `el`. You can optionally specify the context of the listener
  // (object the `this` keyword will point to). You can also pass several
  // space-separated types (e.g. `'click dblclick'`).

  // @alternative
  // @function on(el: HTMLElement, eventMap: Object, context?: Object): this
  // Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function on(obj, types, fn, context) {

  	if (types && typeof types === 'object') {
  		for (var type in types) {
  			addOne(obj, type, types[type], fn);
  		}
  	} else {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			addOne(obj, types[i], fn, context);
  		}
  	}

  	return this;
  }

  var eventsKey = '_leaflet_events';

  // @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Removes a previously added listener function.
  // Note that if you passed a custom context to on, you must pass the same
  // context to `off` in order to remove the listener.

  // @alternative
  // @function off(el: HTMLElement, eventMap: Object, context?: Object): this
  // Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`

  // @alternative
  // @function off(el: HTMLElement, types: String): this
  // Removes all previously added listeners of given types.

  // @alternative
  // @function off(el: HTMLElement): this
  // Removes all previously added listeners from given HTMLElement
  function off(obj, types, fn, context) {

  	if (arguments.length === 1) {
  		batchRemove(obj);
  		delete obj[eventsKey];

  	} else if (types && typeof types === 'object') {
  		for (var type in types) {
  			removeOne(obj, type, types[type], fn);
  		}

  	} else {
  		types = splitWords(types);

  		if (arguments.length === 2) {
  			batchRemove(obj, function (type) {
  				return indexOf(types, type) !== -1;
  			});
  		} else {
  			for (var i = 0, len = types.length; i < len; i++) {
  				removeOne(obj, types[i], fn, context);
  			}
  		}
  	}

  	return this;
  }

  function batchRemove(obj, filterFn) {
  	for (var id in obj[eventsKey]) {
  		var type = id.split(/\d/)[0];
  		if (!filterFn || filterFn(type)) {
  			removeOne(obj, type, null, null, id);
  		}
  	}
  }

  var mouseSubst = {
  	mouseenter: 'mouseover',
  	mouseleave: 'mouseout',
  	wheel: !('onwheel' in window) && 'mousewheel'
  };

  function addOne(obj, type, fn, context) {
  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

  	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

  	var handler = function (e) {
  		return fn.call(context || obj, e || window.event);
  	};

  	var originalHandler = handler;

  	if (!Browser.touchNative && Browser.pointer && type.indexOf('touch') === 0) {
  		// Needs DomEvent.Pointer.js
  		handler = addPointerListener(obj, type, handler);

  	} else if (Browser.touch && (type === 'dblclick')) {
  		handler = addDoubleTapListener(obj, handler);

  	} else if ('addEventListener' in obj) {

  		if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' ||  type === 'mousewheel') {
  			obj.addEventListener(mouseSubst[type] || type, handler, Browser.passiveEvents ? {passive: false} : false);

  		} else if (type === 'mouseenter' || type === 'mouseleave') {
  			handler = function (e) {
  				e = e || window.event;
  				if (isExternalTarget(obj, e)) {
  					originalHandler(e);
  				}
  			};
  			obj.addEventListener(mouseSubst[type], handler, false);

  		} else {
  			obj.addEventListener(type, originalHandler, false);
  		}

  	} else {
  		obj.attachEvent('on' + type, handler);
  	}

  	obj[eventsKey] = obj[eventsKey] || {};
  	obj[eventsKey][id] = handler;
  }

  function removeOne(obj, type, fn, context, id) {
  	id = id || type + stamp(fn) + (context ? '_' + stamp(context) : '');
  	var handler = obj[eventsKey] && obj[eventsKey][id];

  	if (!handler) { return this; }

  	if (!Browser.touchNative && Browser.pointer && type.indexOf('touch') === 0) {
  		removePointerListener(obj, type, handler);

  	} else if (Browser.touch && (type === 'dblclick')) {
  		removeDoubleTapListener(obj, handler);

  	} else if ('removeEventListener' in obj) {

  		obj.removeEventListener(mouseSubst[type] || type, handler, false);

  	} else {
  		obj.detachEvent('on' + type, handler);
  	}

  	obj[eventsKey][id] = null;
  }

  // @function stopPropagation(ev: DOMEvent): this
  // Stop the given event from propagation to parent elements. Used inside the listener functions:
  // ```js
  // L.DomEvent.on(div, 'click', function (ev) {
  // 	L.DomEvent.stopPropagation(ev);
  // });
  // ```
  function stopPropagation(e) {

  	if (e.stopPropagation) {
  		e.stopPropagation();
  	} else if (e.originalEvent) {  // In case of Leaflet event.
  		e.originalEvent._stopped = true;
  	} else {
  		e.cancelBubble = true;
  	}

  	return this;
  }

  // @function disableScrollPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'wheel'` events (plus browser variants).
  function disableScrollPropagation(el) {
  	addOne(el, 'wheel', stopPropagation);
  	return this;
  }

  // @function disableClickPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'click'`, `'dblclick'`, `'contextmenu'`,
  // `'mousedown'` and `'touchstart'` events (plus browser variants).
  function disableClickPropagation(el) {
  	on(el, 'mousedown touchstart dblclick contextmenu', stopPropagation);
  	el['_leaflet_disable_click'] = true;
  	return this;
  }

  // @function preventDefault(ev: DOMEvent): this
  // Prevents the default action of the DOM Event `ev` from happening (such as
  // following a link in the href of the a element, or doing a POST request
  // with page reload when a `<form>` is submitted).
  // Use it inside listener functions.
  function preventDefault(e) {
  	if (e.preventDefault) {
  		e.preventDefault();
  	} else {
  		e.returnValue = false;
  	}
  	return this;
  }

  // @function stop(ev: DOMEvent): this
  // Does `stopPropagation` and `preventDefault` at the same time.
  function stop(e) {
  	preventDefault(e);
  	stopPropagation(e);
  	return this;
  }

  // @function getPropagationPath(ev: DOMEvent): Array
  // Compatibility polyfill for [`Event.composedPath()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath).
  // Returns an array containing the `HTMLElement`s that the given DOM event
  // should propagate to (if not stopped).
  function getPropagationPath(ev) {
  	if (ev.composedPath) {
  		return ev.composedPath();
  	}

  	var path = [];
  	var el = ev.target;

  	while (el) {
  		path.push(el);
  		el = el.parentNode;
  	}
  	return path;
  }


  // @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
  // Gets normalized mouse position from a DOM event relative to the
  // `container` (border excluded) or to the whole page if not specified.
  function getMousePosition(e, container) {
  	if (!container) {
  		return new Point(e.clientX, e.clientY);
  	}

  	var scale = getScale(container),
  	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

  	return new Point(
  		// offset.left/top values are in page scale (like clientX/Y),
  		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
  		(e.clientX - offset.left) / scale.x - container.clientLeft,
  		(e.clientY - offset.top) / scale.y - container.clientTop
  	);
  }


  //  except , Safari and
  // We need double the scroll pixels (see #7403 and #4538) for all Browsers
  // except OSX (Mac) -> 3x, Chrome running on Linux 1x

  var wheelPxFactor =
  	(Browser.linux && Browser.chrome) ? window.devicePixelRatio :
  	Browser.mac ? window.devicePixelRatio * 3 :
  	window.devicePixelRatio > 0 ? 2 * window.devicePixelRatio : 1;
  // @function getWheelDelta(ev: DOMEvent): Number
  // Gets normalized wheel delta from a wheel DOM event, in vertical
  // pixels scrolled (negative if scrolling down).
  // Events from pointing devices without precise scrolling are mapped to
  // a best guess of 60 pixels.
  function getWheelDelta(e) {
  	return (Browser.edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
  	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
  	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
  	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
  	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
  	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
  	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
  	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
  	       0;
  }

  // check if element really left/entered the event target (for mouseenter/mouseleave)
  function isExternalTarget(el, e) {

  	var related = e.relatedTarget;

  	if (!related) { return true; }

  	try {
  		while (related && (related !== el)) {
  			related = related.parentNode;
  		}
  	} catch (err) {
  		return false;
  	}
  	return (related !== el);
  }

  var DomEvent = {
    __proto__: null,
    on: on,
    off: off,
    stopPropagation: stopPropagation,
    disableScrollPropagation: disableScrollPropagation,
    disableClickPropagation: disableClickPropagation,
    preventDefault: preventDefault,
    stop: stop,
    getPropagationPath: getPropagationPath,
    getMousePosition: getMousePosition,
    getWheelDelta: getWheelDelta,
    isExternalTarget: isExternalTarget,
    addListener: on,
    removeListener: off
  };

  /*
   * @class PosAnimation
   * @aka L.PosAnimation
   * @inherits Evented
   * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
   *
   * @example
   * ```js
   * var myPositionMarker = L.marker([48.864716, 2.294694]).addTo(map);
   *
   * myPositionMarker.on("click", function() {
   * 	var pos = map.latLngToLayerPoint(myPositionMarker.getLatLng());
   * 	pos.y -= 25;
   * 	var fx = new L.PosAnimation();
   *
   * 	fx.once('end',function() {
   * 		pos.y += 25;
   * 		fx.run(myPositionMarker._icon, pos, 0.8);
   * 	});
   *
   * 	fx.run(myPositionMarker._icon, pos, 0.3);
   * });
   *
   * ```
   *
   * @constructor L.PosAnimation()
   * Creates a `PosAnimation` object.
   *
   */

  var PosAnimation = Evented.extend({

  	// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
  	// Run an animation of a given element to a new position, optionally setting
  	// duration in seconds (`0.25` by default) and easing linearity factor (3rd
  	// argument of the [cubic bezier curve](https://cubic-bezier.com/#0,0,.5,1),
  	// `0.5` by default).
  	run: function (el, newPos, duration, easeLinearity) {
  		this.stop();

  		this._el = el;
  		this._inProgress = true;
  		this._duration = duration || 0.25;
  		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

  		this._startPos = getPosition(el);
  		this._offset = newPos.subtract(this._startPos);
  		this._startTime = +new Date();

  		// @event start: Event
  		// Fired when the animation starts
  		this.fire('start');

  		this._animate();
  	},

  	// @method stop()
  	// Stops the animation (if currently running).
  	stop: function () {
  		if (!this._inProgress) { return; }

  		this._step(true);
  		this._complete();
  	},

  	_animate: function () {
  		// animation loop
  		this._animId = requestAnimFrame(this._animate, this);
  		this._step();
  	},

  	_step: function (round) {
  		var elapsed = (+new Date()) - this._startTime,
  		    duration = this._duration * 1000;

  		if (elapsed < duration) {
  			this._runFrame(this._easeOut(elapsed / duration), round);
  		} else {
  			this._runFrame(1);
  			this._complete();
  		}
  	},

  	_runFrame: function (progress, round) {
  		var pos = this._startPos.add(this._offset.multiplyBy(progress));
  		if (round) {
  			pos._round();
  		}
  		setPosition(this._el, pos);

  		// @event step: Event
  		// Fired continuously during the animation.
  		this.fire('step');
  	},

  	_complete: function () {
  		cancelAnimFrame(this._animId);

  		this._inProgress = false;
  		// @event end: Event
  		// Fired when the animation ends.
  		this.fire('end');
  	},

  	_easeOut: function (t) {
  		return 1 - Math.pow(1 - t, this._easeOutPower);
  	}
  });

  /*
   * @class Map
   * @aka L.Map
   * @inherits Evented
   *
   * The central class of the API — it is used to create a map on a page and manipulate it.
   *
   * @example
   *
   * ```js
   * // initialize the map on the "map" div with a given center and zoom
   * var map = L.map('map', {
   * 	center: [51.505, -0.09],
   * 	zoom: 13
   * });
   * ```
   *
   */

  var Map$1 = Evented.extend({

  	options: {
  		// @section Map State Options
  		// @option crs: CRS = L.CRS.EPSG3857
  		// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
  		// sure what it means.
  		crs: EPSG3857,

  		// @option center: LatLng = undefined
  		// Initial geographic center of the map
  		center: undefined,

  		// @option zoom: Number = undefined
  		// Initial map zoom level
  		zoom: undefined,

  		// @option minZoom: Number = *
  		// Minimum zoom level of the map.
  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
  		// the lowest of their `minZoom` options will be used instead.
  		minZoom: undefined,

  		// @option maxZoom: Number = *
  		// Maximum zoom level of the map.
  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
  		// the highest of their `maxZoom` options will be used instead.
  		maxZoom: undefined,

  		// @option layers: Layer[] = []
  		// Array of layers that will be added to the map initially
  		layers: [],

  		// @option maxBounds: LatLngBounds = null
  		// When this option is set, the map restricts the view to the given
  		// geographical bounds, bouncing the user back if the user tries to pan
  		// outside the view. To set the restriction dynamically, use
  		// [`setMaxBounds`](#map-setmaxbounds) method.
  		maxBounds: undefined,

  		// @option renderer: Renderer = *
  		// The default method for drawing vector layers on the map. `L.SVG`
  		// or `L.Canvas` by default depending on browser support.
  		renderer: undefined,


  		// @section Animation Options
  		// @option zoomAnimation: Boolean = true
  		// Whether the map zoom animation is enabled. By default it's enabled
  		// in all browsers that support CSS3 Transitions except Android.
  		zoomAnimation: true,

  		// @option zoomAnimationThreshold: Number = 4
  		// Won't animate zoom if the zoom difference exceeds this value.
  		zoomAnimationThreshold: 4,

  		// @option fadeAnimation: Boolean = true
  		// Whether the tile fade animation is enabled. By default it's enabled
  		// in all browsers that support CSS3 Transitions except Android.
  		fadeAnimation: true,

  		// @option markerZoomAnimation: Boolean = true
  		// Whether markers animate their zoom with the zoom animation, if disabled
  		// they will disappear for the length of the animation. By default it's
  		// enabled in all browsers that support CSS3 Transitions except Android.
  		markerZoomAnimation: true,

  		// @option transform3DLimit: Number = 2^23
  		// Defines the maximum size of a CSS translation transform. The default
  		// value should not be changed unless a web browser positions layers in
  		// the wrong place after doing a large `panBy`.
  		transform3DLimit: 8388608, // Precision limit of a 32-bit float

  		// @section Interaction Options
  		// @option zoomSnap: Number = 1
  		// Forces the map's zoom level to always be a multiple of this, particularly
  		// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
  		// By default, the zoom level snaps to the nearest integer; lower values
  		// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
  		// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
  		zoomSnap: 1,

  		// @option zoomDelta: Number = 1
  		// Controls how much the map's zoom level will change after a
  		// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
  		// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
  		// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
  		zoomDelta: 1,

  		// @option trackResize: Boolean = true
  		// Whether the map automatically handles browser window resize to update itself.
  		trackResize: true
  	},

  	initialize: function (id, options) { // (HTMLElement or String, Object)
  		options = setOptions(this, options);

  		// Make sure to assign internal flags at the beginning,
  		// to avoid inconsistent state in some edge cases.
  		this._handlers = [];
  		this._layers = {};
  		this._zoomBoundLayers = {};
  		this._sizeChanged = true;

  		this._initContainer(id);
  		this._initLayout();

  		// hack for https://github.com/Leaflet/Leaflet/issues/1980
  		this._onResize = bind(this._onResize, this);

  		this._initEvents();

  		if (options.maxBounds) {
  			this.setMaxBounds(options.maxBounds);
  		}

  		if (options.zoom !== undefined) {
  			this._zoom = this._limitZoom(options.zoom);
  		}

  		if (options.center && options.zoom !== undefined) {
  			this.setView(toLatLng(options.center), options.zoom, {reset: true});
  		}

  		this.callInitHooks();

  		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
  		this._zoomAnimated = TRANSITION && Browser.any3d && !Browser.mobileOpera &&
  				this.options.zoomAnimation;

  		// zoom transitions run with the same duration for all layers, so if one of transitionend events
  		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
  		if (this._zoomAnimated) {
  			this._createAnimProxy();
  			on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
  		}

  		this._addLayers(this.options.layers);
  	},


  	// @section Methods for modifying map state

  	// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
  	// Sets the view of the map (geographical center and zoom) with the given
  	// animation options.
  	setView: function (center, zoom, options) {

  		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
  		center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
  		options = options || {};

  		this._stop();

  		if (this._loaded && !options.reset && options !== true) {

  			if (options.animate !== undefined) {
  				options.zoom = extend({animate: options.animate}, options.zoom);
  				options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
  			}

  			// try animating pan or zoom
  			var moved = (this._zoom !== zoom) ?
  				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
  				this._tryAnimatedPan(center, options.pan);

  			if (moved) {
  				// prevent resize handler call, the view will refresh after animation anyway
  				clearTimeout(this._sizeTimer);
  				return this;
  			}
  		}

  		// animation didn't start, just reset the map view
  		this._resetView(center, zoom, options.pan && options.pan.noMoveStart);

  		return this;
  	},

  	// @method setZoom(zoom: Number, options?: Zoom/pan options): this
  	// Sets the zoom of the map.
  	setZoom: function (zoom, options) {
  		if (!this._loaded) {
  			this._zoom = zoom;
  			return this;
  		}
  		return this.setView(this.getCenter(), zoom, {zoom: options});
  	},

  	// @method zoomIn(delta?: Number, options?: Zoom options): this
  	// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
  	zoomIn: function (delta, options) {
  		delta = delta || (Browser.any3d ? this.options.zoomDelta : 1);
  		return this.setZoom(this._zoom + delta, options);
  	},

  	// @method zoomOut(delta?: Number, options?: Zoom options): this
  	// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
  	zoomOut: function (delta, options) {
  		delta = delta || (Browser.any3d ? this.options.zoomDelta : 1);
  		return this.setZoom(this._zoom - delta, options);
  	},

  	// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
  	// Zooms the map while keeping a specified geographical point on the map
  	// stationary (e.g. used internally for scroll zoom and double-click zoom).
  	// @alternative
  	// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
  	// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
  	setZoomAround: function (latlng, zoom, options) {
  		var scale = this.getZoomScale(zoom),
  		    viewHalf = this.getSize().divideBy(2),
  		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

  		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
  		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

  		return this.setView(newCenter, zoom, {zoom: options});
  	},

  	_getBoundsCenterZoom: function (bounds, options) {

  		options = options || {};
  		bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

  		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

  		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

  		if (zoom === Infinity) {
  			return {
  				center: bounds.getCenter(),
  				zoom: zoom
  			};
  		}

  		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

  		    swPoint = this.project(bounds.getSouthWest(), zoom),
  		    nePoint = this.project(bounds.getNorthEast(), zoom),
  		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

  		return {
  			center: center,
  			zoom: zoom
  		};
  	},

  	// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
  	// Sets a map view that contains the given geographical bounds with the
  	// maximum zoom level possible.
  	fitBounds: function (bounds, options) {

  		bounds = toLatLngBounds(bounds);

  		if (!bounds.isValid()) {
  			throw new Error('Bounds are not valid.');
  		}

  		var target = this._getBoundsCenterZoom(bounds, options);
  		return this.setView(target.center, target.zoom, options);
  	},

  	// @method fitWorld(options?: fitBounds options): this
  	// Sets a map view that mostly contains the whole world with the maximum
  	// zoom level possible.
  	fitWorld: function (options) {
  		return this.fitBounds([[-90, -180], [90, 180]], options);
  	},

  	// @method panTo(latlng: LatLng, options?: Pan options): this
  	// Pans the map to a given center.
  	panTo: function (center, options) { // (LatLng)
  		return this.setView(center, this._zoom, {pan: options});
  	},

  	// @method panBy(offset: Point, options?: Pan options): this
  	// Pans the map by a given number of pixels (animated).
  	panBy: function (offset, options) {
  		offset = toPoint(offset).round();
  		options = options || {};

  		if (!offset.x && !offset.y) {
  			return this.fire('moveend');
  		}
  		// If we pan too far, Chrome gets issues with tiles
  		// and makes them disappear or appear in the wrong place (slightly offset) #2602
  		if (options.animate !== true && !this.getSize().contains(offset)) {
  			this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
  			return this;
  		}

  		if (!this._panAnim) {
  			this._panAnim = new PosAnimation();

  			this._panAnim.on({
  				'step': this._onPanTransitionStep,
  				'end': this._onPanTransitionEnd
  			}, this);
  		}

  		// don't fire movestart if animating inertia
  		if (!options.noMoveStart) {
  			this.fire('movestart');
  		}

  		// animate pan unless animate: false specified
  		if (options.animate !== false) {
  			addClass(this._mapPane, 'leaflet-pan-anim');

  			var newPos = this._getMapPanePos().subtract(offset).round();
  			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
  		} else {
  			this._rawPanBy(offset);
  			this.fire('move').fire('moveend');
  		}

  		return this;
  	},

  	// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
  	// Sets the view of the map (geographical center and zoom) performing a smooth
  	// pan-zoom animation.
  	flyTo: function (targetCenter, targetZoom, options) {

  		options = options || {};
  		if (options.animate === false || !Browser.any3d) {
  			return this.setView(targetCenter, targetZoom, options);
  		}

  		this._stop();

  		var from = this.project(this.getCenter()),
  		    to = this.project(targetCenter),
  		    size = this.getSize(),
  		    startZoom = this._zoom;

  		targetCenter = toLatLng(targetCenter);
  		targetZoom = targetZoom === undefined ? startZoom : targetZoom;

  		var w0 = Math.max(size.x, size.y),
  		    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
  		    u1 = (to.distanceTo(from)) || 1,
  		    rho = 1.42,
  		    rho2 = rho * rho;

  		function r(i) {
  			var s1 = i ? -1 : 1,
  			    s2 = i ? w1 : w0,
  			    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
  			    b1 = 2 * s2 * rho2 * u1,
  			    b = t1 / b1,
  			    sq = Math.sqrt(b * b + 1) - b;

  			    // workaround for floating point precision bug when sq = 0, log = -Infinite,
  			    // thus triggering an infinite loop in flyTo
  			    var log = sq < 0.000000001 ? -18 : Math.log(sq);

  			return log;
  		}

  		function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
  		function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
  		function tanh(n) { return sinh(n) / cosh(n); }

  		var r0 = r(0);

  		function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
  		function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

  		function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

  		var start = Date.now(),
  		    S = (r(1) - r0) / rho,
  		    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

  		function frame() {
  			var t = (Date.now() - start) / duration,
  			    s = easeOut(t) * S;

  			if (t <= 1) {
  				this._flyToFrame = requestAnimFrame(frame, this);

  				this._move(
  					this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
  					this.getScaleZoom(w0 / w(s), startZoom),
  					{flyTo: true});

  			} else {
  				this
  					._move(targetCenter, targetZoom)
  					._moveEnd(true);
  			}
  		}

  		this._moveStart(true, options.noMoveStart);

  		frame.call(this);
  		return this;
  	},

  	// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
  	// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
  	// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
  	flyToBounds: function (bounds, options) {
  		var target = this._getBoundsCenterZoom(bounds, options);
  		return this.flyTo(target.center, target.zoom, options);
  	},

  	// @method setMaxBounds(bounds: LatLngBounds): this
  	// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
  	setMaxBounds: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		if (this.listens('moveend', this._panInsideMaxBounds)) {
  			this.off('moveend', this._panInsideMaxBounds);
  		}

  		if (!bounds.isValid()) {
  			this.options.maxBounds = null;
  			return this;
  		}

  		this.options.maxBounds = bounds;

  		if (this._loaded) {
  			this._panInsideMaxBounds();
  		}

  		return this.on('moveend', this._panInsideMaxBounds);
  	},

  	// @method setMinZoom(zoom: Number): this
  	// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
  	setMinZoom: function (zoom) {
  		var oldZoom = this.options.minZoom;
  		this.options.minZoom = zoom;

  		if (this._loaded && oldZoom !== zoom) {
  			this.fire('zoomlevelschange');

  			if (this.getZoom() < this.options.minZoom) {
  				return this.setZoom(zoom);
  			}
  		}

  		return this;
  	},

  	// @method setMaxZoom(zoom: Number): this
  	// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
  	setMaxZoom: function (zoom) {
  		var oldZoom = this.options.maxZoom;
  		this.options.maxZoom = zoom;

  		if (this._loaded && oldZoom !== zoom) {
  			this.fire('zoomlevelschange');

  			if (this.getZoom() > this.options.maxZoom) {
  				return this.setZoom(zoom);
  			}
  		}

  		return this;
  	},

  	// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
  	// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
  	panInsideBounds: function (bounds, options) {
  		this._enforcingBounds = true;
  		var center = this.getCenter(),
  		    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

  		if (!center.equals(newCenter)) {
  			this.panTo(newCenter, options);
  		}

  		this._enforcingBounds = false;
  		return this;
  	},

  	// @method panInside(latlng: LatLng, options?: padding options): this
  	// Pans the map the minimum amount to make the `latlng` visible. Use
  	// padding options to fit the display to more restricted bounds.
  	// If `latlng` is already within the (optionally padded) display bounds,
  	// the map will not be panned.
  	panInside: function (latlng, options) {
  		options = options || {};

  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
  		    pixelCenter = this.project(this.getCenter()),
  		    pixelPoint = this.project(latlng),
  		    pixelBounds = this.getPixelBounds(),
  		    paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]),
  		    paddedSize = paddedBounds.getSize();

  		if (!paddedBounds.contains(pixelPoint)) {
  			this._enforcingBounds = true;
  			var centerOffset = pixelPoint.subtract(paddedBounds.getCenter());
  			var offset = paddedBounds.extend(pixelPoint).getSize().subtract(paddedSize);
  			pixelCenter.x += centerOffset.x < 0 ? -offset.x : offset.x;
  			pixelCenter.y += centerOffset.y < 0 ? -offset.y : offset.y;
  			this.panTo(this.unproject(pixelCenter), options);
  			this._enforcingBounds = false;
  		}
  		return this;
  	},

  	// @method invalidateSize(options: Zoom/pan options): this
  	// Checks if the map container size changed and updates the map if so —
  	// call it after you've changed the map size dynamically, also animating
  	// pan by default. If `options.pan` is `false`, panning will not occur.
  	// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
  	// that it doesn't happen often even if the method is called many
  	// times in a row.

  	// @alternative
  	// @method invalidateSize(animate: Boolean): this
  	// Checks if the map container size changed and updates the map if so —
  	// call it after you've changed the map size dynamically, also animating
  	// pan by default.
  	invalidateSize: function (options) {
  		if (!this._loaded) { return this; }

  		options = extend({
  			animate: false,
  			pan: true
  		}, options === true ? {animate: true} : options);

  		var oldSize = this.getSize();
  		this._sizeChanged = true;
  		this._lastCenter = null;

  		var newSize = this.getSize(),
  		    oldCenter = oldSize.divideBy(2).round(),
  		    newCenter = newSize.divideBy(2).round(),
  		    offset = oldCenter.subtract(newCenter);

  		if (!offset.x && !offset.y) { return this; }

  		if (options.animate && options.pan) {
  			this.panBy(offset);

  		} else {
  			if (options.pan) {
  				this._rawPanBy(offset);
  			}

  			this.fire('move');

  			if (options.debounceMoveend) {
  				clearTimeout(this._sizeTimer);
  				this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
  			} else {
  				this.fire('moveend');
  			}
  		}

  		// @section Map state change events
  		// @event resize: ResizeEvent
  		// Fired when the map is resized.
  		return this.fire('resize', {
  			oldSize: oldSize,
  			newSize: newSize
  		});
  	},

  	// @section Methods for modifying map state
  	// @method stop(): this
  	// Stops the currently running `panTo` or `flyTo` animation, if any.
  	stop: function () {
  		this.setZoom(this._limitZoom(this._zoom));
  		if (!this.options.zoomSnap) {
  			this.fire('viewreset');
  		}
  		return this._stop();
  	},

  	// @section Geolocation methods
  	// @method locate(options?: Locate options): this
  	// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
  	// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
  	// and optionally sets the map view to the user's location with respect to
  	// detection accuracy (or to the world view if geolocation failed).
  	// Note that, if your page doesn't use HTTPS, this method will fail in
  	// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
  	// See `Locate options` for more details.
  	locate: function (options) {

  		options = this._locateOptions = extend({
  			timeout: 10000,
  			watch: false
  			// setView: false
  			// maxZoom: <Number>
  			// maximumAge: 0
  			// enableHighAccuracy: false
  		}, options);

  		if (!('geolocation' in navigator)) {
  			this._handleGeolocationError({
  				code: 0,
  				message: 'Geolocation not supported.'
  			});
  			return this;
  		}

  		var onResponse = bind(this._handleGeolocationResponse, this),
  		    onError = bind(this._handleGeolocationError, this);

  		if (options.watch) {
  			this._locationWatchId =
  			        navigator.geolocation.watchPosition(onResponse, onError, options);
  		} else {
  			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
  		}
  		return this;
  	},

  	// @method stopLocate(): this
  	// Stops watching location previously initiated by `map.locate({watch: true})`
  	// and aborts resetting the map view if map.locate was called with
  	// `{setView: true}`.
  	stopLocate: function () {
  		if (navigator.geolocation && navigator.geolocation.clearWatch) {
  			navigator.geolocation.clearWatch(this._locationWatchId);
  		}
  		if (this._locateOptions) {
  			this._locateOptions.setView = false;
  		}
  		return this;
  	},

  	_handleGeolocationError: function (error) {
  		if (!this._container._leaflet_id) { return; }

  		var c = error.code,
  		    message = error.message ||
  		            (c === 1 ? 'permission denied' :
  		            (c === 2 ? 'position unavailable' : 'timeout'));

  		if (this._locateOptions.setView && !this._loaded) {
  			this.fitWorld();
  		}

  		// @section Location events
  		// @event locationerror: ErrorEvent
  		// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
  		this.fire('locationerror', {
  			code: c,
  			message: 'Geolocation error: ' + message + '.'
  		});
  	},

  	_handleGeolocationResponse: function (pos) {
  		if (!this._container._leaflet_id) { return; }

  		var lat = pos.coords.latitude,
  		    lng = pos.coords.longitude,
  		    latlng = new LatLng(lat, lng),
  		    bounds = latlng.toBounds(pos.coords.accuracy * 2),
  		    options = this._locateOptions;

  		if (options.setView) {
  			var zoom = this.getBoundsZoom(bounds);
  			this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
  		}

  		var data = {
  			latlng: latlng,
  			bounds: bounds,
  			timestamp: pos.timestamp
  		};

  		for (var i in pos.coords) {
  			if (typeof pos.coords[i] === 'number') {
  				data[i] = pos.coords[i];
  			}
  		}

  		// @event locationfound: LocationEvent
  		// Fired when geolocation (using the [`locate`](#map-locate) method)
  		// went successfully.
  		this.fire('locationfound', data);
  	},

  	// TODO Appropriate docs section?
  	// @section Other Methods
  	// @method addHandler(name: String, HandlerClass: Function): this
  	// Adds a new `Handler` to the map, given its name and constructor function.
  	addHandler: function (name, HandlerClass) {
  		if (!HandlerClass) { return this; }

  		var handler = this[name] = new HandlerClass(this);

  		this._handlers.push(handler);

  		if (this.options[name]) {
  			handler.enable();
  		}

  		return this;
  	},

  	// @method remove(): this
  	// Destroys the map and clears all related event listeners.
  	remove: function () {

  		this._initEvents(true);
  		if (this.options.maxBounds) { this.off('moveend', this._panInsideMaxBounds); }

  		if (this._containerId !== this._container._leaflet_id) {
  			throw new Error('Map container is being reused by another instance');
  		}

  		try {
  			// throws error in IE6-8
  			delete this._container._leaflet_id;
  			delete this._containerId;
  		} catch (e) {
  			/*eslint-disable */
  			this._container._leaflet_id = undefined;
  			/* eslint-enable */
  			this._containerId = undefined;
  		}

  		if (this._locationWatchId !== undefined) {
  			this.stopLocate();
  		}

  		this._stop();

  		remove(this._mapPane);

  		if (this._clearControlPos) {
  			this._clearControlPos();
  		}
  		if (this._resizeRequest) {
  			cancelAnimFrame(this._resizeRequest);
  			this._resizeRequest = null;
  		}

  		this._clearHandlers();

  		if (this._loaded) {
  			// @section Map state change events
  			// @event unload: Event
  			// Fired when the map is destroyed with [remove](#map-remove) method.
  			this.fire('unload');
  		}

  		var i;
  		for (i in this._layers) {
  			this._layers[i].remove();
  		}
  		for (i in this._panes) {
  			remove(this._panes[i]);
  		}

  		this._layers = [];
  		this._panes = [];
  		delete this._mapPane;
  		delete this._renderer;

  		return this;
  	},

  	// @section Other Methods
  	// @method createPane(name: String, container?: HTMLElement): HTMLElement
  	// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
  	// then returns it. The pane is created as a child of `container`, or
  	// as a child of the main map pane if not set.
  	createPane: function (name, container) {
  		var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
  		    pane = create$1('div', className, container || this._mapPane);

  		if (name) {
  			this._panes[name] = pane;
  		}
  		return pane;
  	},

  	// @section Methods for Getting Map State

  	// @method getCenter(): LatLng
  	// Returns the geographical center of the map view
  	getCenter: function () {
  		this._checkIfLoaded();

  		if (this._lastCenter && !this._moved()) {
  			return this._lastCenter.clone();
  		}
  		return this.layerPointToLatLng(this._getCenterLayerPoint());
  	},

  	// @method getZoom(): Number
  	// Returns the current zoom level of the map view
  	getZoom: function () {
  		return this._zoom;
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the geographical bounds visible in the current map view
  	getBounds: function () {
  		var bounds = this.getPixelBounds(),
  		    sw = this.unproject(bounds.getBottomLeft()),
  		    ne = this.unproject(bounds.getTopRight());

  		return new LatLngBounds(sw, ne);
  	},

  	// @method getMinZoom(): Number
  	// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
  	getMinZoom: function () {
  		return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
  	},

  	// @method getMaxZoom(): Number
  	// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
  	getMaxZoom: function () {
  		return this.options.maxZoom === undefined ?
  			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
  			this.options.maxZoom;
  	},

  	// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
  	// Returns the maximum zoom level on which the given bounds fit to the map
  	// view in its entirety. If `inside` (optional) is set to `true`, the method
  	// instead returns the minimum zoom level on which the map view fits into
  	// the given bounds in its entirety.
  	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
  		bounds = toLatLngBounds(bounds);
  		padding = toPoint(padding || [0, 0]);

  		var zoom = this.getZoom() || 0,
  		    min = this.getMinZoom(),
  		    max = this.getMaxZoom(),
  		    nw = bounds.getNorthWest(),
  		    se = bounds.getSouthEast(),
  		    size = this.getSize().subtract(padding),
  		    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
  		    snap = Browser.any3d ? this.options.zoomSnap : 1,
  		    scalex = size.x / boundsSize.x,
  		    scaley = size.y / boundsSize.y,
  		    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

  		zoom = this.getScaleZoom(scale, zoom);

  		if (snap) {
  			zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
  			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
  		}

  		return Math.max(min, Math.min(max, zoom));
  	},

  	// @method getSize(): Point
  	// Returns the current size of the map container (in pixels).
  	getSize: function () {
  		if (!this._size || this._sizeChanged) {
  			this._size = new Point(
  				this._container.clientWidth || 0,
  				this._container.clientHeight || 0);

  			this._sizeChanged = false;
  		}
  		return this._size.clone();
  	},

  	// @method getPixelBounds(): Bounds
  	// Returns the bounds of the current map view in projected pixel
  	// coordinates (sometimes useful in layer and overlay implementations).
  	getPixelBounds: function (center, zoom) {
  		var topLeftPoint = this._getTopLeftPoint(center, zoom);
  		return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
  	},

  	// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
  	// the map pane? "left point of the map layer" can be confusing, specially
  	// since there can be negative offsets.
  	// @method getPixelOrigin(): Point
  	// Returns the projected pixel coordinates of the top left point of
  	// the map layer (useful in custom layer and overlay implementations).
  	getPixelOrigin: function () {
  		this._checkIfLoaded();
  		return this._pixelOrigin;
  	},

  	// @method getPixelWorldBounds(zoom?: Number): Bounds
  	// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
  	// If `zoom` is omitted, the map's current zoom level is used.
  	getPixelWorldBounds: function (zoom) {
  		return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
  	},

  	// @section Other Methods

  	// @method getPane(pane: String|HTMLElement): HTMLElement
  	// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
  	getPane: function (pane) {
  		return typeof pane === 'string' ? this._panes[pane] : pane;
  	},

  	// @method getPanes(): Object
  	// Returns a plain object containing the names of all [panes](#map-pane) as keys and
  	// the panes as values.
  	getPanes: function () {
  		return this._panes;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTML element that contains the map.
  	getContainer: function () {
  		return this._container;
  	},


  	// @section Conversion Methods

  	// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
  	// Returns the scale factor to be applied to a map transition from zoom level
  	// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
  	getZoomScale: function (toZoom, fromZoom) {
  		// TODO replace with universal implementation after refactoring projections
  		var crs = this.options.crs;
  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
  		return crs.scale(toZoom) / crs.scale(fromZoom);
  	},

  	// @method getScaleZoom(scale: Number, fromZoom: Number): Number
  	// Returns the zoom level that the map would end up at, if it is at `fromZoom`
  	// level and everything is scaled by a factor of `scale`. Inverse of
  	// [`getZoomScale`](#map-getZoomScale).
  	getScaleZoom: function (scale, fromZoom) {
  		var crs = this.options.crs;
  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
  		var zoom = crs.zoom(scale * crs.scale(fromZoom));
  		return isNaN(zoom) ? Infinity : zoom;
  	},

  	// @method project(latlng: LatLng, zoom: Number): Point
  	// Projects a geographical coordinate `LatLng` according to the projection
  	// of the map's CRS, then scales it according to `zoom` and the CRS's
  	// `Transformation`. The result is pixel coordinate relative to
  	// the CRS origin.
  	project: function (latlng, zoom) {
  		zoom = zoom === undefined ? this._zoom : zoom;
  		return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
  	},

  	// @method unproject(point: Point, zoom: Number): LatLng
  	// Inverse of [`project`](#map-project).
  	unproject: function (point, zoom) {
  		zoom = zoom === undefined ? this._zoom : zoom;
  		return this.options.crs.pointToLatLng(toPoint(point), zoom);
  	},

  	// @method layerPointToLatLng(point: Point): LatLng
  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
  	// returns the corresponding geographical coordinate (for the current zoom level).
  	layerPointToLatLng: function (point) {
  		var projectedPoint = toPoint(point).add(this.getPixelOrigin());
  		return this.unproject(projectedPoint);
  	},

  	// @method latLngToLayerPoint(latlng: LatLng): Point
  	// Given a geographical coordinate, returns the corresponding pixel coordinate
  	// relative to the [origin pixel](#map-getpixelorigin).
  	latLngToLayerPoint: function (latlng) {
  		var projectedPoint = this.project(toLatLng(latlng))._round();
  		return projectedPoint._subtract(this.getPixelOrigin());
  	},

  	// @method wrapLatLng(latlng: LatLng): LatLng
  	// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
  	// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
  	// CRS's bounds.
  	// By default this means longitude is wrapped around the dateline so its
  	// value is between -180 and +180 degrees.
  	wrapLatLng: function (latlng) {
  		return this.options.crs.wrapLatLng(toLatLng(latlng));
  	},

  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  	// Returns a `LatLngBounds` with the same size as the given one, ensuring that
  	// its center is within the CRS's bounds.
  	// By default this means the center longitude is wrapped around the dateline so its
  	// value is between -180 and +180 degrees, and the majority of the bounds
  	// overlaps the CRS's bounds.
  	wrapLatLngBounds: function (latlng) {
  		return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
  	},

  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
  	// Returns the distance between two geographical coordinates according to
  	// the map's CRS. By default this measures distance in meters.
  	distance: function (latlng1, latlng2) {
  		return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
  	},

  	// @method containerPointToLayerPoint(point: Point): Point
  	// Given a pixel coordinate relative to the map container, returns the corresponding
  	// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
  	containerPointToLayerPoint: function (point) { // (Point)
  		return toPoint(point).subtract(this._getMapPanePos());
  	},

  	// @method layerPointToContainerPoint(point: Point): Point
  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
  	// returns the corresponding pixel coordinate relative to the map container.
  	layerPointToContainerPoint: function (point) { // (Point)
  		return toPoint(point).add(this._getMapPanePos());
  	},

  	// @method containerPointToLatLng(point: Point): LatLng
  	// Given a pixel coordinate relative to the map container, returns
  	// the corresponding geographical coordinate (for the current zoom level).
  	containerPointToLatLng: function (point) {
  		var layerPoint = this.containerPointToLayerPoint(toPoint(point));
  		return this.layerPointToLatLng(layerPoint);
  	},

  	// @method latLngToContainerPoint(latlng: LatLng): Point
  	// Given a geographical coordinate, returns the corresponding pixel coordinate
  	// relative to the map container.
  	latLngToContainerPoint: function (latlng) {
  		return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
  	},

  	// @method mouseEventToContainerPoint(ev: MouseEvent): Point
  	// Given a MouseEvent object, returns the pixel coordinate relative to the
  	// map container where the event took place.
  	mouseEventToContainerPoint: function (e) {
  		return getMousePosition(e, this._container);
  	},

  	// @method mouseEventToLayerPoint(ev: MouseEvent): Point
  	// Given a MouseEvent object, returns the pixel coordinate relative to
  	// the [origin pixel](#map-getpixelorigin) where the event took place.
  	mouseEventToLayerPoint: function (e) {
  		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
  	},

  	// @method mouseEventToLatLng(ev: MouseEvent): LatLng
  	// Given a MouseEvent object, returns geographical coordinate where the
  	// event took place.
  	mouseEventToLatLng: function (e) { // (MouseEvent)
  		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
  	},


  	// map initialization methods

  	_initContainer: function (id) {
  		var container = this._container = get(id);

  		if (!container) {
  			throw new Error('Map container not found.');
  		} else if (container._leaflet_id) {
  			throw new Error('Map container is already initialized.');
  		}

  		on(container, 'scroll', this._onScroll, this);
  		this._containerId = stamp(container);
  	},

  	_initLayout: function () {
  		var container = this._container;

  		this._fadeAnimated = this.options.fadeAnimation && Browser.any3d;

  		addClass(container, 'leaflet-container' +
  			(Browser.touch ? ' leaflet-touch' : '') +
  			(Browser.retina ? ' leaflet-retina' : '') +
  			(Browser.ielt9 ? ' leaflet-oldie' : '') +
  			(Browser.safari ? ' leaflet-safari' : '') +
  			(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

  		var position = getStyle(container, 'position');

  		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed' && position !== 'sticky') {
  			container.style.position = 'relative';
  		}

  		this._initPanes();

  		if (this._initControlPos) {
  			this._initControlPos();
  		}
  	},

  	_initPanes: function () {
  		var panes = this._panes = {};
  		this._paneRenderers = {};

  		// @section
  		//
  		// Panes are DOM elements used to control the ordering of layers on the map. You
  		// can access panes with [`map.getPane`](#map-getpane) or
  		// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
  		// [`map.createPane`](#map-createpane) method.
  		//
  		// Every map has the following default panes that differ only in zIndex.
  		//
  		// @pane mapPane: HTMLElement = 'auto'
  		// Pane that contains all other map panes

  		this._mapPane = this.createPane('mapPane', this._container);
  		setPosition(this._mapPane, new Point(0, 0));

  		// @pane tilePane: HTMLElement = 200
  		// Pane for `GridLayer`s and `TileLayer`s
  		this.createPane('tilePane');
  		// @pane overlayPane: HTMLElement = 400
  		// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
  		this.createPane('overlayPane');
  		// @pane shadowPane: HTMLElement = 500
  		// Pane for overlay shadows (e.g. `Marker` shadows)
  		this.createPane('shadowPane');
  		// @pane markerPane: HTMLElement = 600
  		// Pane for `Icon`s of `Marker`s
  		this.createPane('markerPane');
  		// @pane tooltipPane: HTMLElement = 650
  		// Pane for `Tooltip`s.
  		this.createPane('tooltipPane');
  		// @pane popupPane: HTMLElement = 700
  		// Pane for `Popup`s.
  		this.createPane('popupPane');

  		if (!this.options.markerZoomAnimation) {
  			addClass(panes.markerPane, 'leaflet-zoom-hide');
  			addClass(panes.shadowPane, 'leaflet-zoom-hide');
  		}
  	},


  	// private methods that modify map state

  	// @section Map state change events
  	_resetView: function (center, zoom, noMoveStart) {
  		setPosition(this._mapPane, new Point(0, 0));

  		var loading = !this._loaded;
  		this._loaded = true;
  		zoom = this._limitZoom(zoom);

  		this.fire('viewprereset');

  		var zoomChanged = this._zoom !== zoom;
  		this
  			._moveStart(zoomChanged, noMoveStart)
  			._move(center, zoom)
  			._moveEnd(zoomChanged);

  		// @event viewreset: Event
  		// Fired when the map needs to redraw its content (this usually happens
  		// on map zoom or load). Very useful for creating custom overlays.
  		this.fire('viewreset');

  		// @event load: Event
  		// Fired when the map is initialized (when its center and zoom are set
  		// for the first time).
  		if (loading) {
  			this.fire('load');
  		}
  	},

  	_moveStart: function (zoomChanged, noMoveStart) {
  		// @event zoomstart: Event
  		// Fired when the map zoom is about to change (e.g. before zoom animation).
  		// @event movestart: Event
  		// Fired when the view of the map starts changing (e.g. user starts dragging the map).
  		if (zoomChanged) {
  			this.fire('zoomstart');
  		}
  		if (!noMoveStart) {
  			this.fire('movestart');
  		}
  		return this;
  	},

  	_move: function (center, zoom, data, supressEvent) {
  		if (zoom === undefined) {
  			zoom = this._zoom;
  		}
  		var zoomChanged = this._zoom !== zoom;

  		this._zoom = zoom;
  		this._lastCenter = center;
  		this._pixelOrigin = this._getNewPixelOrigin(center);

  		if (!supressEvent) {
  			// @event zoom: Event
  			// Fired repeatedly during any change in zoom level,
  			// including zoom and fly animations.
  			if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
  				this.fire('zoom', data);
  			}

  			// @event move: Event
  			// Fired repeatedly during any movement of the map,
  			// including pan and fly animations.
  			this.fire('move', data);
  		} else if (data && data.pinch) {	// Always fire 'zoom' if pinching because #3530
  			this.fire('zoom', data);
  		}
  		return this;
  	},

  	_moveEnd: function (zoomChanged) {
  		// @event zoomend: Event
  		// Fired when the map zoom changed, after any animations.
  		if (zoomChanged) {
  			this.fire('zoomend');
  		}

  		// @event moveend: Event
  		// Fired when the center of the map stops changing
  		// (e.g. user stopped dragging the map or after non-centered zoom).
  		return this.fire('moveend');
  	},

  	_stop: function () {
  		cancelAnimFrame(this._flyToFrame);
  		if (this._panAnim) {
  			this._panAnim.stop();
  		}
  		return this;
  	},

  	_rawPanBy: function (offset) {
  		setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
  	},

  	_getZoomSpan: function () {
  		return this.getMaxZoom() - this.getMinZoom();
  	},

  	_panInsideMaxBounds: function () {
  		if (!this._enforcingBounds) {
  			this.panInsideBounds(this.options.maxBounds);
  		}
  	},

  	_checkIfLoaded: function () {
  		if (!this._loaded) {
  			throw new Error('Set map center and zoom first.');
  		}
  	},

  	// DOM event handling

  	// @section Interaction events
  	_initEvents: function (remove) {
  		this._targets = {};
  		this._targets[stamp(this._container)] = this;

  		var onOff = remove ? off : on;

  		// @event click: MouseEvent
  		// Fired when the user clicks (or taps) the map.
  		// @event dblclick: MouseEvent
  		// Fired when the user double-clicks (or double-taps) the map.
  		// @event mousedown: MouseEvent
  		// Fired when the user pushes the mouse button on the map.
  		// @event mouseup: MouseEvent
  		// Fired when the user releases the mouse button on the map.
  		// @event mouseover: MouseEvent
  		// Fired when the mouse enters the map.
  		// @event mouseout: MouseEvent
  		// Fired when the mouse leaves the map.
  		// @event mousemove: MouseEvent
  		// Fired while the mouse moves over the map.
  		// @event contextmenu: MouseEvent
  		// Fired when the user pushes the right mouse button on the map, prevents
  		// default browser context menu from showing if there are listeners on
  		// this event. Also fired on mobile when the user holds a single touch
  		// for a second (also called long press).
  		// @event keypress: KeyboardEvent
  		// Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
  		// @event keydown: KeyboardEvent
  		// Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
  		// the `keydown` event is fired for keys that produce a character value and for keys
  		// that do not produce a character value.
  		// @event keyup: KeyboardEvent
  		// Fired when the user releases a key from the keyboard while the map is focused.
  		onOff(this._container, 'click dblclick mousedown mouseup ' +
  			'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

  		if (this.options.trackResize) {
  			onOff(window, 'resize', this._onResize, this);
  		}

  		if (Browser.any3d && this.options.transform3DLimit) {
  			(remove ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
  		}
  	},

  	_onResize: function () {
  		cancelAnimFrame(this._resizeRequest);
  		this._resizeRequest = requestAnimFrame(
  		        function () { this.invalidateSize({debounceMoveend: true}); }, this);
  	},

  	_onScroll: function () {
  		this._container.scrollTop  = 0;
  		this._container.scrollLeft = 0;
  	},

  	_onMoveEnd: function () {
  		var pos = this._getMapPanePos();
  		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
  			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
  			// a pixel offset on very high values, see: https://jsfiddle.net/dg6r5hhb/
  			this._resetView(this.getCenter(), this.getZoom());
  		}
  	},

  	_findEventTargets: function (e, type) {
  		var targets = [],
  		    target,
  		    isHover = type === 'mouseout' || type === 'mouseover',
  		    src = e.target || e.srcElement,
  		    dragging = false;

  		while (src) {
  			target = this._targets[stamp(src)];
  			if (target && (type === 'click' || type === 'preclick') && this._draggableMoved(target)) {
  				// Prevent firing click after you just dragged an object.
  				dragging = true;
  				break;
  			}
  			if (target && target.listens(type, true)) {
  				if (isHover && !isExternalTarget(src, e)) { break; }
  				targets.push(target);
  				if (isHover) { break; }
  			}
  			if (src === this._container) { break; }
  			src = src.parentNode;
  		}
  		if (!targets.length && !dragging && !isHover && this.listens(type, true)) {
  			targets = [this];
  		}
  		return targets;
  	},

  	_isClickDisabled: function (el) {
  		while (el && el !== this._container) {
  			if (el['_leaflet_disable_click']) { return true; }
  			el = el.parentNode;
  		}
  	},

  	_handleDOMEvent: function (e) {
  		var el = (e.target || e.srcElement);
  		if (!this._loaded || el['_leaflet_disable_events'] || e.type === 'click' && this._isClickDisabled(el)) {
  			return;
  		}

  		var type = e.type;

  		if (type === 'mousedown') {
  			// prevents outline when clicking on keyboard-focusable element
  			preventOutline(el);
  		}

  		this._fireDOMEvent(e, type);
  	},

  	_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

  	_fireDOMEvent: function (e, type, canvasTargets) {

  		if (e.type === 'click') {
  			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
  			// @event preclick: MouseEvent
  			// Fired before mouse click on the map (sometimes useful when you
  			// want something to happen on click before any existing click
  			// handlers start running).
  			var synth = extend({}, e);
  			synth.type = 'preclick';
  			this._fireDOMEvent(synth, synth.type, canvasTargets);
  		}

  		// Find the layer the event is propagating from and its parents.
  		var targets = this._findEventTargets(e, type);

  		if (canvasTargets) {
  			var filtered = []; // pick only targets with listeners
  			for (var i = 0; i < canvasTargets.length; i++) {
  				if (canvasTargets[i].listens(type, true)) {
  					filtered.push(canvasTargets[i]);
  				}
  			}
  			targets = filtered.concat(targets);
  		}

  		if (!targets.length) { return; }

  		if (type === 'contextmenu') {
  			preventDefault(e);
  		}

  		var target = targets[0];
  		var data = {
  			originalEvent: e
  		};

  		if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
  			var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
  			data.containerPoint = isMarker ?
  				this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
  			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
  			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
  		}

  		for (i = 0; i < targets.length; i++) {
  			targets[i].fire(type, data, true);
  			if (data.originalEvent._stopped ||
  				(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
  		}
  	},

  	_draggableMoved: function (obj) {
  		obj = obj.dragging && obj.dragging.enabled() ? obj : this;
  		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
  	},

  	_clearHandlers: function () {
  		for (var i = 0, len = this._handlers.length; i < len; i++) {
  			this._handlers[i].disable();
  		}
  	},

  	// @section Other Methods

  	// @method whenReady(fn: Function, context?: Object): this
  	// Runs the given function `fn` when the map gets initialized with
  	// a view (center and zoom) and at least one layer, or immediately
  	// if it's already initialized, optionally passing a function context.
  	whenReady: function (callback, context) {
  		if (this._loaded) {
  			callback.call(context || this, {target: this});
  		} else {
  			this.on('load', callback, context);
  		}
  		return this;
  	},


  	// private methods for getting map state

  	_getMapPanePos: function () {
  		return getPosition(this._mapPane) || new Point(0, 0);
  	},

  	_moved: function () {
  		var pos = this._getMapPanePos();
  		return pos && !pos.equals([0, 0]);
  	},

  	_getTopLeftPoint: function (center, zoom) {
  		var pixelOrigin = center && zoom !== undefined ?
  			this._getNewPixelOrigin(center, zoom) :
  			this.getPixelOrigin();
  		return pixelOrigin.subtract(this._getMapPanePos());
  	},

  	_getNewPixelOrigin: function (center, zoom) {
  		var viewHalf = this.getSize()._divideBy(2);
  		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
  	},

  	_latLngToNewLayerPoint: function (latlng, zoom, center) {
  		var topLeft = this._getNewPixelOrigin(center, zoom);
  		return this.project(latlng, zoom)._subtract(topLeft);
  	},

  	_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
  		var topLeft = this._getNewPixelOrigin(center, zoom);
  		return toBounds([
  			this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
  		]);
  	},

  	// layer point of the current center
  	_getCenterLayerPoint: function () {
  		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
  	},

  	// offset of the specified place to the current center in pixels
  	_getCenterOffset: function (latlng) {
  		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
  	},

  	// adjust center for view to get inside bounds
  	_limitCenter: function (center, zoom, bounds) {

  		if (!bounds) { return center; }

  		var centerPoint = this.project(center, zoom),
  		    viewHalf = this.getSize().divideBy(2),
  		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
  		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

  		// If offset is less than a pixel, ignore.
  		// This prevents unstable projections from getting into
  		// an infinite loop of tiny offsets.
  		if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
  			return center;
  		}

  		return this.unproject(centerPoint.add(offset), zoom);
  	},

  	// adjust offset for view to get inside bounds
  	_limitOffset: function (offset, bounds) {
  		if (!bounds) { return offset; }

  		var viewBounds = this.getPixelBounds(),
  		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

  		return offset.add(this._getBoundsOffset(newBounds, bounds));
  	},

  	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
  	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
  		var projectedMaxBounds = toBounds(
  		        this.project(maxBounds.getNorthEast(), zoom),
  		        this.project(maxBounds.getSouthWest(), zoom)
  		    ),
  		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
  		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

  		    dx = this._rebound(minOffset.x, -maxOffset.x),
  		    dy = this._rebound(minOffset.y, -maxOffset.y);

  		return new Point(dx, dy);
  	},

  	_rebound: function (left, right) {
  		return left + right > 0 ?
  			Math.round(left - right) / 2 :
  			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
  	},

  	_limitZoom: function (zoom) {
  		var min = this.getMinZoom(),
  		    max = this.getMaxZoom(),
  		    snap = Browser.any3d ? this.options.zoomSnap : 1;
  		if (snap) {
  			zoom = Math.round(zoom / snap) * snap;
  		}
  		return Math.max(min, Math.min(max, zoom));
  	},

  	_onPanTransitionStep: function () {
  		this.fire('move');
  	},

  	_onPanTransitionEnd: function () {
  		removeClass(this._mapPane, 'leaflet-pan-anim');
  		this.fire('moveend');
  	},

  	_tryAnimatedPan: function (center, options) {
  		// difference between the new and current centers in pixels
  		var offset = this._getCenterOffset(center)._trunc();

  		// don't animate too far unless animate: true specified in options
  		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

  		this.panBy(offset, options);

  		return true;
  	},

  	_createAnimProxy: function () {

  		var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
  		this._panes.mapPane.appendChild(proxy);

  		this.on('zoomanim', function (e) {
  			var prop = TRANSFORM,
  			    transform = this._proxy.style[prop];

  			setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

  			// workaround for case when transform is the same and so transitionend event is not fired
  			if (transform === this._proxy.style[prop] && this._animatingZoom) {
  				this._onZoomTransitionEnd();
  			}
  		}, this);

  		this.on('load moveend', this._animMoveEnd, this);

  		this._on('unload', this._destroyAnimProxy, this);
  	},

  	_destroyAnimProxy: function () {
  		remove(this._proxy);
  		this.off('load moveend', this._animMoveEnd, this);
  		delete this._proxy;
  	},

  	_animMoveEnd: function () {
  		var c = this.getCenter(),
  		    z = this.getZoom();
  		setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
  	},

  	_catchTransitionEnd: function (e) {
  		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
  			this._onZoomTransitionEnd();
  		}
  	},

  	_nothingToAnimate: function () {
  		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
  	},

  	_tryAnimatedZoom: function (center, zoom, options) {

  		if (this._animatingZoom) { return true; }

  		options = options || {};

  		// don't animate if disabled, not supported or zoom difference is too large
  		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
  		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

  		// offset is the pixel coords of the zoom origin relative to the current center
  		var scale = this.getZoomScale(zoom),
  		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

  		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
  		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

  		requestAnimFrame(function () {
  			this
  			    ._moveStart(true, options.noMoveStart || false)
  			    ._animateZoom(center, zoom, true);
  		}, this);

  		return true;
  	},

  	_animateZoom: function (center, zoom, startAnim, noUpdate) {
  		if (!this._mapPane) { return; }

  		if (startAnim) {
  			this._animatingZoom = true;

  			// remember what center/zoom to set after animation
  			this._animateToCenter = center;
  			this._animateToZoom = zoom;

  			addClass(this._mapPane, 'leaflet-zoom-anim');
  		}

  		// @section Other Events
  		// @event zoomanim: ZoomAnimEvent
  		// Fired at least once per zoom animation. For continuous zoom, like pinch zooming, fired once per frame during zoom.
  		this.fire('zoomanim', {
  			center: center,
  			zoom: zoom,
  			noUpdate: noUpdate
  		});

  		if (!this._tempFireZoomEvent) {
  			this._tempFireZoomEvent = this._zoom !== this._animateToZoom;
  		}

  		this._move(this._animateToCenter, this._animateToZoom, undefined, true);

  		// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
  		setTimeout(bind(this._onZoomTransitionEnd, this), 250);
  	},

  	_onZoomTransitionEnd: function () {
  		if (!this._animatingZoom) { return; }

  		if (this._mapPane) {
  			removeClass(this._mapPane, 'leaflet-zoom-anim');
  		}

  		this._animatingZoom = false;

  		this._move(this._animateToCenter, this._animateToZoom, undefined, true);

  		if (this._tempFireZoomEvent) {
  			this.fire('zoom');
  		}
  		delete this._tempFireZoomEvent;

  		this.fire('move');

  		this._moveEnd(true);
  	}
  });

  // @section

  // @factory L.map(id: String, options?: Map options)
  // Instantiates a map object given the DOM ID of a `<div>` element
  // and optionally an object literal with `Map options`.
  //
  // @alternative
  // @factory L.map(el: HTMLElement, options?: Map options)
  // Instantiates a map object given an instance of a `<div>` HTML element
  // and optionally an object literal with `Map options`.
  function createMap(id, options) {
  	return new Map$1(id, options);
  }

  /*
   * @class Control
   * @aka L.Control
   * @inherits Class
   *
   * L.Control is a base class for implementing map controls. Handles positioning.
   * All other controls extend from this class.
   */

  var Control = Class.extend({
  	// @section
  	// @aka Control Options
  	options: {
  		// @option position: String = 'topright'
  		// The position of the control (one of the map corners). Possible values are `'topleft'`,
  		// `'topright'`, `'bottomleft'` or `'bottomright'`
  		position: 'topright'
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	/* @section
  	 * Classes extending L.Control will inherit the following methods:
  	 *
  	 * @method getPosition: string
  	 * Returns the position of the control.
  	 */
  	getPosition: function () {
  		return this.options.position;
  	},

  	// @method setPosition(position: string): this
  	// Sets the position of the control.
  	setPosition: function (position) {
  		var map = this._map;

  		if (map) {
  			map.removeControl(this);
  		}

  		this.options.position = position;

  		if (map) {
  			map.addControl(this);
  		}

  		return this;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTMLElement that contains the control.
  	getContainer: function () {
  		return this._container;
  	},

  	// @method addTo(map: Map): this
  	// Adds the control to the given map.
  	addTo: function (map) {
  		this.remove();
  		this._map = map;

  		var container = this._container = this.onAdd(map),
  		    pos = this.getPosition(),
  		    corner = map._controlCorners[pos];

  		addClass(container, 'leaflet-control');

  		if (pos.indexOf('bottom') !== -1) {
  			corner.insertBefore(container, corner.firstChild);
  		} else {
  			corner.appendChild(container);
  		}

  		this._map.on('unload', this.remove, this);

  		return this;
  	},

  	// @method remove: this
  	// Removes the control from the map it is currently active on.
  	remove: function () {
  		if (!this._map) {
  			return this;
  		}

  		remove(this._container);

  		if (this.onRemove) {
  			this.onRemove(this._map);
  		}

  		this._map.off('unload', this.remove, this);
  		this._map = null;

  		return this;
  	},

  	_refocusOnMap: function (e) {
  		// if map exists and event is not a keyboard event
  		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
  			this._map.getContainer().focus();
  		}
  	}
  });

  var control = function (options) {
  	return new Control(options);
  };

  /* @section Extension methods
   * @uninheritable
   *
   * Every control should extend from `L.Control` and (re-)implement the following methods.
   *
   * @method onAdd(map: Map): HTMLElement
   * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
   *
   * @method onRemove(map: Map)
   * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
   */

  /* @namespace Map
   * @section Methods for Layers and Controls
   */
  Map$1.include({
  	// @method addControl(control: Control): this
  	// Adds the given control to the map
  	addControl: function (control) {
  		control.addTo(this);
  		return this;
  	},

  	// @method removeControl(control: Control): this
  	// Removes the given control from the map
  	removeControl: function (control) {
  		control.remove();
  		return this;
  	},

  	_initControlPos: function () {
  		var corners = this._controlCorners = {},
  		    l = 'leaflet-',
  		    container = this._controlContainer =
  		            create$1('div', l + 'control-container', this._container);

  		function createCorner(vSide, hSide) {
  			var className = l + vSide + ' ' + l + hSide;

  			corners[vSide + hSide] = create$1('div', className, container);
  		}

  		createCorner('top', 'left');
  		createCorner('top', 'right');
  		createCorner('bottom', 'left');
  		createCorner('bottom', 'right');
  	},

  	_clearControlPos: function () {
  		for (var i in this._controlCorners) {
  			remove(this._controlCorners[i]);
  		}
  		remove(this._controlContainer);
  		delete this._controlCorners;
  		delete this._controlContainer;
  	}
  });

  /*
   * @class Control.Layers
   * @aka L.Control.Layers
   * @inherits Control
   *
   * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](https://leafletjs.com/examples/layers-control/)). Extends `Control`.
   *
   * @example
   *
   * ```js
   * var baseLayers = {
   * 	"Mapbox": mapbox,
   * 	"OpenStreetMap": osm
   * };
   *
   * var overlays = {
   * 	"Marker": marker,
   * 	"Roads": roadsLayer
   * };
   *
   * L.control.layers(baseLayers, overlays).addTo(map);
   * ```
   *
   * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
   *
   * ```js
   * {
   *     "<someName1>": layer1,
   *     "<someName2>": layer2
   * }
   * ```
   *
   * The layer names can contain HTML, which allows you to add additional styling to the items:
   *
   * ```js
   * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
   * ```
   */

  var Layers = Control.extend({
  	// @section
  	// @aka Control.Layers options
  	options: {
  		// @option collapsed: Boolean = true
  		// If `true`, the control will be collapsed into an icon and expanded on mouse hover, touch, or keyboard activation.
  		collapsed: true,
  		position: 'topright',

  		// @option autoZIndex: Boolean = true
  		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
  		autoZIndex: true,

  		// @option hideSingleBase: Boolean = false
  		// If `true`, the base layers in the control will be hidden when there is only one.
  		hideSingleBase: false,

  		// @option sortLayers: Boolean = false
  		// Whether to sort the layers. When `false`, layers will keep the order
  		// in which they were added to the control.
  		sortLayers: false,

  		// @option sortFunction: Function = *
  		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
  		// that will be used for sorting the layers, when `sortLayers` is `true`.
  		// The function receives both the `L.Layer` instances and their names, as in
  		// `sortFunction(layerA, layerB, nameA, nameB)`.
  		// By default, it sorts layers alphabetically by their name.
  		sortFunction: function (layerA, layerB, nameA, nameB) {
  			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
  		}
  	},

  	initialize: function (baseLayers, overlays, options) {
  		setOptions(this, options);

  		this._layerControlInputs = [];
  		this._layers = [];
  		this._lastZIndex = 0;
  		this._handlingClick = false;
  		this._preventClick = false;

  		for (var i in baseLayers) {
  			this._addLayer(baseLayers[i], i);
  		}

  		for (i in overlays) {
  			this._addLayer(overlays[i], i, true);
  		}
  	},

  	onAdd: function (map) {
  		this._initLayout();
  		this._update();

  		this._map = map;
  		map.on('zoomend', this._checkDisabledLayers, this);

  		for (var i = 0; i < this._layers.length; i++) {
  			this._layers[i].layer.on('add remove', this._onLayerChange, this);
  		}

  		return this._container;
  	},

  	addTo: function (map) {
  		Control.prototype.addTo.call(this, map);
  		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
  		return this._expandIfNotCollapsed();
  	},

  	onRemove: function () {
  		this._map.off('zoomend', this._checkDisabledLayers, this);

  		for (var i = 0; i < this._layers.length; i++) {
  			this._layers[i].layer.off('add remove', this._onLayerChange, this);
  		}
  	},

  	// @method addBaseLayer(layer: Layer, name: String): this
  	// Adds a base layer (radio button entry) with the given name to the control.
  	addBaseLayer: function (layer, name) {
  		this._addLayer(layer, name);
  		return (this._map) ? this._update() : this;
  	},

  	// @method addOverlay(layer: Layer, name: String): this
  	// Adds an overlay (checkbox entry) with the given name to the control.
  	addOverlay: function (layer, name) {
  		this._addLayer(layer, name, true);
  		return (this._map) ? this._update() : this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Remove the given layer from the control.
  	removeLayer: function (layer) {
  		layer.off('add remove', this._onLayerChange, this);

  		var obj = this._getLayer(stamp(layer));
  		if (obj) {
  			this._layers.splice(this._layers.indexOf(obj), 1);
  		}
  		return (this._map) ? this._update() : this;
  	},

  	// @method expand(): this
  	// Expand the control container if collapsed.
  	expand: function () {
  		addClass(this._container, 'leaflet-control-layers-expanded');
  		this._section.style.height = null;
  		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
  		if (acceptableHeight < this._section.clientHeight) {
  			addClass(this._section, 'leaflet-control-layers-scrollbar');
  			this._section.style.height = acceptableHeight + 'px';
  		} else {
  			removeClass(this._section, 'leaflet-control-layers-scrollbar');
  		}
  		this._checkDisabledLayers();
  		return this;
  	},

  	// @method collapse(): this
  	// Collapse the control container if expanded.
  	collapse: function () {
  		removeClass(this._container, 'leaflet-control-layers-expanded');
  		return this;
  	},

  	_initLayout: function () {
  		var className = 'leaflet-control-layers',
  		    container = this._container = create$1('div', className),
  		    collapsed = this.options.collapsed;

  		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
  		container.setAttribute('aria-haspopup', true);

  		disableClickPropagation(container);
  		disableScrollPropagation(container);

  		var section = this._section = create$1('section', className + '-list');

  		if (collapsed) {
  			this._map.on('click', this.collapse, this);

  			on(container, {
  				mouseenter: this._expandSafely,
  				mouseleave: this.collapse
  			}, this);
  		}

  		var link = this._layersLink = create$1('a', className + '-toggle', container);
  		link.href = '#';
  		link.title = 'Layers';
  		link.setAttribute('role', 'button');

  		on(link, {
  			keydown: function (e) {
  				if (e.keyCode === 13) {
  					this._expandSafely();
  				}
  			},
  			// Certain screen readers intercept the key event and instead send a click event
  			click: function (e) {
  				preventDefault(e);
  				this._expandSafely();
  			}
  		}, this);

  		if (!collapsed) {
  			this.expand();
  		}

  		this._baseLayersList = create$1('div', className + '-base', section);
  		this._separator = create$1('div', className + '-separator', section);
  		this._overlaysList = create$1('div', className + '-overlays', section);

  		container.appendChild(section);
  	},

  	_getLayer: function (id) {
  		for (var i = 0; i < this._layers.length; i++) {

  			if (this._layers[i] && stamp(this._layers[i].layer) === id) {
  				return this._layers[i];
  			}
  		}
  	},

  	_addLayer: function (layer, name, overlay) {
  		if (this._map) {
  			layer.on('add remove', this._onLayerChange, this);
  		}

  		this._layers.push({
  			layer: layer,
  			name: name,
  			overlay: overlay
  		});

  		if (this.options.sortLayers) {
  			this._layers.sort(bind(function (a, b) {
  				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
  			}, this));
  		}

  		if (this.options.autoZIndex && layer.setZIndex) {
  			this._lastZIndex++;
  			layer.setZIndex(this._lastZIndex);
  		}

  		this._expandIfNotCollapsed();
  	},

  	_update: function () {
  		if (!this._container) { return this; }

  		empty(this._baseLayersList);
  		empty(this._overlaysList);

  		this._layerControlInputs = [];
  		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

  		for (i = 0; i < this._layers.length; i++) {
  			obj = this._layers[i];
  			this._addItem(obj);
  			overlaysPresent = overlaysPresent || obj.overlay;
  			baseLayersPresent = baseLayersPresent || !obj.overlay;
  			baseLayersCount += !obj.overlay ? 1 : 0;
  		}

  		// Hide base layers section if there's only one layer.
  		if (this.options.hideSingleBase) {
  			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
  			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
  		}

  		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

  		return this;
  	},

  	_onLayerChange: function (e) {
  		if (!this._handlingClick) {
  			this._update();
  		}

  		var obj = this._getLayer(stamp(e.target));

  		// @namespace Map
  		// @section Layer events
  		// @event baselayerchange: LayersControlEvent
  		// Fired when the base layer is changed through the [layers control](#control-layers).
  		// @event overlayadd: LayersControlEvent
  		// Fired when an overlay is selected through the [layers control](#control-layers).
  		// @event overlayremove: LayersControlEvent
  		// Fired when an overlay is deselected through the [layers control](#control-layers).
  		// @namespace Control.Layers
  		var type = obj.overlay ?
  			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
  			(e.type === 'add' ? 'baselayerchange' : null);

  		if (type) {
  			this._map.fire(type, obj);
  		}
  	},

  	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see https://stackoverflow.com/a/119079)
  	_createRadioElement: function (name, checked) {

  		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
  				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

  		var radioFragment = document.createElement('div');
  		radioFragment.innerHTML = radioHtml;

  		return radioFragment.firstChild;
  	},

  	_addItem: function (obj) {
  		var label = document.createElement('label'),
  		    checked = this._map.hasLayer(obj.layer),
  		    input;

  		if (obj.overlay) {
  			input = document.createElement('input');
  			input.type = 'checkbox';
  			input.className = 'leaflet-control-layers-selector';
  			input.defaultChecked = checked;
  		} else {
  			input = this._createRadioElement('leaflet-base-layers_' + stamp(this), checked);
  		}

  		this._layerControlInputs.push(input);
  		input.layerId = stamp(obj.layer);

  		on(input, 'click', this._onInputClick, this);

  		var name = document.createElement('span');
  		name.innerHTML = ' ' + obj.name;

  		// Helps from preventing layer control flicker when checkboxes are disabled
  		// https://github.com/Leaflet/Leaflet/issues/2771
  		var holder = document.createElement('span');

  		label.appendChild(holder);
  		holder.appendChild(input);
  		holder.appendChild(name);

  		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
  		container.appendChild(label);

  		this._checkDisabledLayers();
  		return label;
  	},

  	_onInputClick: function () {
  		// expanding the control on mobile with a click can cause adding a layer - we don't want this
  		if (this._preventClick) {
  			return;
  		}

  		var inputs = this._layerControlInputs,
  		    input, layer;
  		var addedLayers = [],
  		    removedLayers = [];

  		this._handlingClick = true;

  		for (var i = inputs.length - 1; i >= 0; i--) {
  			input = inputs[i];
  			layer = this._getLayer(input.layerId).layer;

  			if (input.checked) {
  				addedLayers.push(layer);
  			} else if (!input.checked) {
  				removedLayers.push(layer);
  			}
  		}

  		// Bugfix issue 2318: Should remove all old layers before readding new ones
  		for (i = 0; i < removedLayers.length; i++) {
  			if (this._map.hasLayer(removedLayers[i])) {
  				this._map.removeLayer(removedLayers[i]);
  			}
  		}
  		for (i = 0; i < addedLayers.length; i++) {
  			if (!this._map.hasLayer(addedLayers[i])) {
  				this._map.addLayer(addedLayers[i]);
  			}
  		}

  		this._handlingClick = false;

  		this._refocusOnMap();
  	},

  	_checkDisabledLayers: function () {
  		var inputs = this._layerControlInputs,
  		    input,
  		    layer,
  		    zoom = this._map.getZoom();

  		for (var i = inputs.length - 1; i >= 0; i--) {
  			input = inputs[i];
  			layer = this._getLayer(input.layerId).layer;
  			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
  			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

  		}
  	},

  	_expandIfNotCollapsed: function () {
  		if (this._map && !this.options.collapsed) {
  			this.expand();
  		}
  		return this;
  	},

  	_expandSafely: function () {
  		var section = this._section;
  		this._preventClick = true;
  		on(section, 'click', preventDefault);
  		this.expand();
  		var that = this;
  		setTimeout(function () {
  			off(section, 'click', preventDefault);
  			that._preventClick = false;
  		});
  	}

  });


  // @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
  // Creates a layers control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
  var layers = function (baseLayers, overlays, options) {
  	return new Layers(baseLayers, overlays, options);
  };

  /*
   * @class Control.Zoom
   * @aka L.Control.Zoom
   * @inherits Control
   *
   * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
   */

  var Zoom = Control.extend({
  	// @section
  	// @aka Control.Zoom options
  	options: {
  		position: 'topleft',

  		// @option zoomInText: String = '<span aria-hidden="true">+</span>'
  		// The text set on the 'zoom in' button.
  		zoomInText: '<span aria-hidden="true">+</span>',

  		// @option zoomInTitle: String = 'Zoom in'
  		// The title set on the 'zoom in' button.
  		zoomInTitle: 'Zoom in',

  		// @option zoomOutText: String = '<span aria-hidden="true">&#x2212;</span>'
  		// The text set on the 'zoom out' button.
  		zoomOutText: '<span aria-hidden="true">&#x2212;</span>',

  		// @option zoomOutTitle: String = 'Zoom out'
  		// The title set on the 'zoom out' button.
  		zoomOutTitle: 'Zoom out'
  	},

  	onAdd: function (map) {
  		var zoomName = 'leaflet-control-zoom',
  		    container = create$1('div', zoomName + ' leaflet-bar'),
  		    options = this.options;

  		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
  		        zoomName + '-in',  container, this._zoomIn);
  		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
  		        zoomName + '-out', container, this._zoomOut);

  		this._updateDisabled();
  		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

  		return container;
  	},

  	onRemove: function (map) {
  		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  	},

  	disable: function () {
  		this._disabled = true;
  		this._updateDisabled();
  		return this;
  	},

  	enable: function () {
  		this._disabled = false;
  		this._updateDisabled();
  		return this;
  	},

  	_zoomIn: function (e) {
  		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
  			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
  		}
  	},

  	_zoomOut: function (e) {
  		if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
  			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
  		}
  	},

  	_createButton: function (html, title, className, container, fn) {
  		var link = create$1('a', className, container);
  		link.innerHTML = html;
  		link.href = '#';
  		link.title = title;

  		/*
  		 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
  		 */
  		link.setAttribute('role', 'button');
  		link.setAttribute('aria-label', title);

  		disableClickPropagation(link);
  		on(link, 'click', stop);
  		on(link, 'click', fn, this);
  		on(link, 'click', this._refocusOnMap, this);

  		return link;
  	},

  	_updateDisabled: function () {
  		var map = this._map,
  		    className = 'leaflet-disabled';

  		removeClass(this._zoomInButton, className);
  		removeClass(this._zoomOutButton, className);
  		this._zoomInButton.setAttribute('aria-disabled', 'false');
  		this._zoomOutButton.setAttribute('aria-disabled', 'false');

  		if (this._disabled || map._zoom === map.getMinZoom()) {
  			addClass(this._zoomOutButton, className);
  			this._zoomOutButton.setAttribute('aria-disabled', 'true');
  		}
  		if (this._disabled || map._zoom === map.getMaxZoom()) {
  			addClass(this._zoomInButton, className);
  			this._zoomInButton.setAttribute('aria-disabled', 'true');
  		}
  	}
  });

  // @namespace Map
  // @section Control options
  // @option zoomControl: Boolean = true
  // Whether a [zoom control](#control-zoom) is added to the map by default.
  Map$1.mergeOptions({
  	zoomControl: true
  });

  Map$1.addInitHook(function () {
  	if (this.options.zoomControl) {
  		// @section Controls
  		// @property zoomControl: Control.Zoom
  		// The default zoom control (only available if the
  		// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
  		this.zoomControl = new Zoom();
  		this.addControl(this.zoomControl);
  	}
  });

  // @namespace Control.Zoom
  // @factory L.control.zoom(options: Control.Zoom options)
  // Creates a zoom control
  var zoom = function (options) {
  	return new Zoom(options);
  };

  /*
   * @class Control.Scale
   * @aka L.Control.Scale
   * @inherits Control
   *
   * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
   *
   * @example
   *
   * ```js
   * L.control.scale().addTo(map);
   * ```
   */

  var Scale = Control.extend({
  	// @section
  	// @aka Control.Scale options
  	options: {
  		position: 'bottomleft',

  		// @option maxWidth: Number = 100
  		// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
  		maxWidth: 100,

  		// @option metric: Boolean = True
  		// Whether to show the metric scale line (m/km).
  		metric: true,

  		// @option imperial: Boolean = True
  		// Whether to show the imperial scale line (mi/ft).
  		imperial: true

  		// @option updateWhenIdle: Boolean = false
  		// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
  	},

  	onAdd: function (map) {
  		var className = 'leaflet-control-scale',
  		    container = create$1('div', className),
  		    options = this.options;

  		this._addScales(options, className + '-line', container);

  		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
  		map.whenReady(this._update, this);

  		return container;
  	},

  	onRemove: function (map) {
  		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
  	},

  	_addScales: function (options, className, container) {
  		if (options.metric) {
  			this._mScale = create$1('div', className, container);
  		}
  		if (options.imperial) {
  			this._iScale = create$1('div', className, container);
  		}
  	},

  	_update: function () {
  		var map = this._map,
  		    y = map.getSize().y / 2;

  		var maxMeters = map.distance(
  			map.containerPointToLatLng([0, y]),
  			map.containerPointToLatLng([this.options.maxWidth, y]));

  		this._updateScales(maxMeters);
  	},

  	_updateScales: function (maxMeters) {
  		if (this.options.metric && maxMeters) {
  			this._updateMetric(maxMeters);
  		}
  		if (this.options.imperial && maxMeters) {
  			this._updateImperial(maxMeters);
  		}
  	},

  	_updateMetric: function (maxMeters) {
  		var meters = this._getRoundNum(maxMeters),
  		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

  		this._updateScale(this._mScale, label, meters / maxMeters);
  	},

  	_updateImperial: function (maxMeters) {
  		var maxFeet = maxMeters * 3.2808399,
  		    maxMiles, miles, feet;

  		if (maxFeet > 5280) {
  			maxMiles = maxFeet / 5280;
  			miles = this._getRoundNum(maxMiles);
  			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

  		} else {
  			feet = this._getRoundNum(maxFeet);
  			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
  		}
  	},

  	_updateScale: function (scale, text, ratio) {
  		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
  		scale.innerHTML = text;
  	},

  	_getRoundNum: function (num) {
  		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
  		    d = num / pow10;

  		d = d >= 10 ? 10 :
  		    d >= 5 ? 5 :
  		    d >= 3 ? 3 :
  		    d >= 2 ? 2 : 1;

  		return pow10 * d;
  	}
  });


  // @factory L.control.scale(options?: Control.Scale options)
  // Creates an scale control with the given options.
  var scale = function (options) {
  	return new Scale(options);
  };

  var ukrainianFlag = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>';


  /*
   * @class Control.Attribution
   * @aka L.Control.Attribution
   * @inherits Control
   *
   * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
   */

  var Attribution = Control.extend({
  	// @section
  	// @aka Control.Attribution options
  	options: {
  		position: 'bottomright',

  		// @option prefix: String|false = 'Leaflet'
  		// The HTML text shown before the attributions. Pass `false` to disable.
  		prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' + (Browser.inlineSvg ? ukrainianFlag + ' ' : '') + 'Leaflet</a>'
  	},

  	initialize: function (options) {
  		setOptions(this, options);

  		this._attributions = {};
  	},

  	onAdd: function (map) {
  		map.attributionControl = this;
  		this._container = create$1('div', 'leaflet-control-attribution');
  		disableClickPropagation(this._container);

  		// TODO ugly, refactor
  		for (var i in map._layers) {
  			if (map._layers[i].getAttribution) {
  				this.addAttribution(map._layers[i].getAttribution());
  			}
  		}

  		this._update();

  		map.on('layeradd', this._addAttribution, this);

  		return this._container;
  	},

  	onRemove: function (map) {
  		map.off('layeradd', this._addAttribution, this);
  	},

  	_addAttribution: function (ev) {
  		if (ev.layer.getAttribution) {
  			this.addAttribution(ev.layer.getAttribution());
  			ev.layer.once('remove', function () {
  				this.removeAttribution(ev.layer.getAttribution());
  			}, this);
  		}
  	},

  	// @method setPrefix(prefix: String|false): this
  	// The HTML text shown before the attributions. Pass `false` to disable.
  	setPrefix: function (prefix) {
  		this.options.prefix = prefix;
  		this._update();
  		return this;
  	},

  	// @method addAttribution(text: String): this
  	// Adds an attribution text (e.g. `'&copy; OpenStreetMap contributors'`).
  	addAttribution: function (text) {
  		if (!text) { return this; }

  		if (!this._attributions[text]) {
  			this._attributions[text] = 0;
  		}
  		this._attributions[text]++;

  		this._update();

  		return this;
  	},

  	// @method removeAttribution(text: String): this
  	// Removes an attribution text.
  	removeAttribution: function (text) {
  		if (!text) { return this; }

  		if (this._attributions[text]) {
  			this._attributions[text]--;
  			this._update();
  		}

  		return this;
  	},

  	_update: function () {
  		if (!this._map) { return; }

  		var attribs = [];

  		for (var i in this._attributions) {
  			if (this._attributions[i]) {
  				attribs.push(i);
  			}
  		}

  		var prefixAndAttribs = [];

  		if (this.options.prefix) {
  			prefixAndAttribs.push(this.options.prefix);
  		}
  		if (attribs.length) {
  			prefixAndAttribs.push(attribs.join(', '));
  		}

  		this._container.innerHTML = prefixAndAttribs.join(' <span aria-hidden="true">|</span> ');
  	}
  });

  // @namespace Map
  // @section Control options
  // @option attributionControl: Boolean = true
  // Whether a [attribution control](#control-attribution) is added to the map by default.
  Map$1.mergeOptions({
  	attributionControl: true
  });

  Map$1.addInitHook(function () {
  	if (this.options.attributionControl) {
  		new Attribution().addTo(this);
  	}
  });

  // @namespace Control.Attribution
  // @factory L.control.attribution(options: Control.Attribution options)
  // Creates an attribution control.
  var attribution = function (options) {
  	return new Attribution(options);
  };

  Control.Layers = Layers;
  Control.Zoom = Zoom;
  Control.Scale = Scale;
  Control.Attribution = Attribution;

  control.layers = layers;
  control.zoom = zoom;
  control.scale = scale;
  control.attribution = attribution;

  /*
  	L.Handler is a base class for handler classes that are used internally to inject
  	interaction features like dragging to classes like Map and Marker.
  */

  // @class Handler
  // @aka L.Handler
  // Abstract class for map interaction handlers

  var Handler = Class.extend({
  	initialize: function (map) {
  		this._map = map;
  	},

  	// @method enable(): this
  	// Enables the handler
  	enable: function () {
  		if (this._enabled) { return this; }

  		this._enabled = true;
  		this.addHooks();
  		return this;
  	},

  	// @method disable(): this
  	// Disables the handler
  	disable: function () {
  		if (!this._enabled) { return this; }

  		this._enabled = false;
  		this.removeHooks();
  		return this;
  	},

  	// @method enabled(): Boolean
  	// Returns `true` if the handler is enabled
  	enabled: function () {
  		return !!this._enabled;
  	}

  	// @section Extension methods
  	// Classes inheriting from `Handler` must implement the two following methods:
  	// @method addHooks()
  	// Called when the handler is enabled, should add event hooks.
  	// @method removeHooks()
  	// Called when the handler is disabled, should remove the event hooks added previously.
  });

  // @section There is static function which can be called without instantiating L.Handler:
  // @function addTo(map: Map, name: String): this
  // Adds a new Handler to the given map with the given name.
  Handler.addTo = function (map, name) {
  	map.addHandler(name, this);
  	return this;
  };

  var Mixin = {Events: Events};

  /*
   * @class Draggable
   * @aka L.Draggable
   * @inherits Evented
   *
   * A class for making DOM elements draggable (including touch support).
   * Used internally for map and marker dragging. Only works for elements
   * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
   *
   * @example
   * ```js
   * var draggable = new L.Draggable(elementToDrag);
   * draggable.enable();
   * ```
   */

  var START = Browser.touch ? 'touchstart mousedown' : 'mousedown';

  var Draggable = Evented.extend({

  	options: {
  		// @section
  		// @aka Draggable options
  		// @option clickTolerance: Number = 3
  		// The max number of pixels a user can shift the mouse pointer during a click
  		// for it to be considered a valid click (as opposed to a mouse drag).
  		clickTolerance: 3
  	},

  	// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
  	// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
  	initialize: function (element, dragStartTarget, preventOutline, options) {
  		setOptions(this, options);

  		this._element = element;
  		this._dragStartTarget = dragStartTarget || element;
  		this._preventOutline = preventOutline;
  	},

  	// @method enable()
  	// Enables the dragging ability
  	enable: function () {
  		if (this._enabled) { return; }

  		on(this._dragStartTarget, START, this._onDown, this);

  		this._enabled = true;
  	},

  	// @method disable()
  	// Disables the dragging ability
  	disable: function () {
  		if (!this._enabled) { return; }

  		// If we're currently dragging this draggable,
  		// disabling it counts as first ending the drag.
  		if (Draggable._dragging === this) {
  			this.finishDrag(true);
  		}

  		off(this._dragStartTarget, START, this._onDown, this);

  		this._enabled = false;
  		this._moved = false;
  	},

  	_onDown: function (e) {
  		// Ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (!this._enabled) { return; }

  		this._moved = false;

  		if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

  		if (e.touches && e.touches.length !== 1) {
  			// Finish dragging to avoid conflict with touchZoom
  			if (Draggable._dragging === this) {
  				this.finishDrag();
  			}
  			return;
  		}

  		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
  		Draggable._dragging = this;  // Prevent dragging multiple objects at once.

  		if (this._preventOutline) {
  			preventOutline(this._element);
  		}

  		disableImageDrag();
  		disableTextSelection();

  		if (this._moving) { return; }

  		// @event down: Event
  		// Fired when a drag is about to start.
  		this.fire('down');

  		var first = e.touches ? e.touches[0] : e,
  		    sizedParent = getSizedParentNode(this._element);

  		this._startPoint = new Point(first.clientX, first.clientY);
  		this._startPos = getPosition(this._element);

  		// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
  		this._parentScale = getScale(sizedParent);

  		var mouseevent = e.type === 'mousedown';
  		on(document, mouseevent ? 'mousemove' : 'touchmove', this._onMove, this);
  		on(document, mouseevent ? 'mouseup' : 'touchend touchcancel', this._onUp, this);
  	},

  	_onMove: function (e) {
  		// Ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (!this._enabled) { return; }

  		if (e.touches && e.touches.length > 1) {
  			this._moved = true;
  			return;
  		}

  		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
  		    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

  		if (!offset.x && !offset.y) { return; }
  		if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

  		// We assume that the parent container's position, border and scale do not change for the duration of the drag.
  		// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
  		// and we can use the cached value for the scale.
  		offset.x /= this._parentScale.x;
  		offset.y /= this._parentScale.y;

  		preventDefault(e);

  		if (!this._moved) {
  			// @event dragstart: Event
  			// Fired when a drag starts
  			this.fire('dragstart');

  			this._moved = true;

  			addClass(document.body, 'leaflet-dragging');

  			this._lastTarget = e.target || e.srcElement;
  			// IE and Edge do not give the <use> element, so fetch it
  			// if necessary
  			if (window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance) {
  				this._lastTarget = this._lastTarget.correspondingUseElement;
  			}
  			addClass(this._lastTarget, 'leaflet-drag-target');
  		}

  		this._newPos = this._startPos.add(offset);
  		this._moving = true;

  		this._lastEvent = e;
  		this._updatePosition();
  	},

  	_updatePosition: function () {
  		var e = {originalEvent: this._lastEvent};

  		// @event predrag: Event
  		// Fired continuously during dragging *before* each corresponding
  		// update of the element's position.
  		this.fire('predrag', e);
  		setPosition(this._element, this._newPos);

  		// @event drag: Event
  		// Fired continuously during dragging.
  		this.fire('drag', e);
  	},

  	_onUp: function () {
  		// Ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (!this._enabled) { return; }
  		this.finishDrag();
  	},

  	finishDrag: function (noInertia) {
  		removeClass(document.body, 'leaflet-dragging');

  		if (this._lastTarget) {
  			removeClass(this._lastTarget, 'leaflet-drag-target');
  			this._lastTarget = null;
  		}

  		off(document, 'mousemove touchmove', this._onMove, this);
  		off(document, 'mouseup touchend touchcancel', this._onUp, this);

  		enableImageDrag();
  		enableTextSelection();

  		var fireDragend = this._moved && this._moving;

  		this._moving = false;
  		Draggable._dragging = false;

  		if (fireDragend) {
  			// @event dragend: DragEndEvent
  			// Fired when the drag ends.
  			this.fire('dragend', {
  				noInertia: noInertia,
  				distance: this._newPos.distanceTo(this._startPos)
  			});
  		}
  	}

  });

  /*
   * @namespace PolyUtil
   * Various utility functions for polygon geometries.
   */

  /* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
   * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
   * Used by Leaflet to only show polygon points that are on the screen or near, increasing
   * performance. Note that polygon points needs different algorithm for clipping
   * than polyline, so there's a separate method for it.
   */
  function clipPolygon(points, bounds, round) {
  	var clippedPoints,
  	    edges = [1, 4, 2, 8],
  	    i, j, k,
  	    a, b,
  	    len, edge, p;

  	for (i = 0, len = points.length; i < len; i++) {
  		points[i]._code = _getBitCode(points[i], bounds);
  	}

  	// for each edge (left, bottom, right, top)
  	for (k = 0; k < 4; k++) {
  		edge = edges[k];
  		clippedPoints = [];

  		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
  			a = points[i];
  			b = points[j];

  			// if a is inside the clip window
  			if (!(a._code & edge)) {
  				// if b is outside the clip window (a->b goes out of screen)
  				if (b._code & edge) {
  					p = _getEdgeIntersection(b, a, edge, bounds, round);
  					p._code = _getBitCode(p, bounds);
  					clippedPoints.push(p);
  				}
  				clippedPoints.push(a);

  			// else if b is inside the clip window (a->b enters the screen)
  			} else if (!(b._code & edge)) {
  				p = _getEdgeIntersection(b, a, edge, bounds, round);
  				p._code = _getBitCode(p, bounds);
  				clippedPoints.push(p);
  			}
  		}
  		points = clippedPoints;
  	}

  	return points;
  }

  /* @function polygonCenter(latlngs: LatLng[], crs: CRS): LatLng
   * Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the passed LatLngs (first ring) from a polygon.
   */
  function polygonCenter(latlngs, crs) {
  	var i, j, p1, p2, f, area, x, y, center;

  	if (!latlngs || latlngs.length === 0) {
  		throw new Error('latlngs not passed');
  	}

  	if (!isFlat(latlngs)) {
  		console.warn('latlngs are not flat! Only the first ring will be used');
  		latlngs = latlngs[0];
  	}

  	var centroidLatLng = toLatLng([0, 0]);

  	var bounds = toLatLngBounds(latlngs);
  	var areaBounds = bounds.getNorthWest().distanceTo(bounds.getSouthWest()) * bounds.getNorthEast().distanceTo(bounds.getNorthWest());
  	// tests showed that below 1700 rounding errors are happening
  	if (areaBounds < 1700) {
  		// getting a inexact center, to move the latlngs near to [0, 0] to prevent rounding errors
  		centroidLatLng = centroid(latlngs);
  	}

  	var len = latlngs.length;
  	var points = [];
  	for (i = 0; i < len; i++) {
  		var latlng = toLatLng(latlngs[i]);
  		points.push(crs.project(toLatLng([latlng.lat - centroidLatLng.lat, latlng.lng - centroidLatLng.lng])));
  	}

  	area = x = y = 0;

  	// polygon centroid algorithm;
  	for (i = 0, j = len - 1; i < len; j = i++) {
  		p1 = points[i];
  		p2 = points[j];

  		f = p1.y * p2.x - p2.y * p1.x;
  		x += (p1.x + p2.x) * f;
  		y += (p1.y + p2.y) * f;
  		area += f * 3;
  	}

  	if (area === 0) {
  		// Polygon is so small that all points are on same pixel.
  		center = points[0];
  	} else {
  		center = [x / area, y / area];
  	}

  	var latlngCenter = crs.unproject(toPoint(center));
  	return toLatLng([latlngCenter.lat + centroidLatLng.lat, latlngCenter.lng + centroidLatLng.lng]);
  }

  /* @function centroid(latlngs: LatLng[]): LatLng
   * Returns the 'center of mass' of the passed LatLngs.
   */
  function centroid(coords) {
  	var latSum = 0;
  	var lngSum = 0;
  	var len = 0;
  	for (var i = 0; i < coords.length; i++) {
  		var latlng = toLatLng(coords[i]);
  		latSum += latlng.lat;
  		lngSum += latlng.lng;
  		len++;
  	}
  	return toLatLng([latSum / len, lngSum / len]);
  }

  var PolyUtil = {
    __proto__: null,
    clipPolygon: clipPolygon,
    polygonCenter: polygonCenter,
    centroid: centroid
  };

  /*
   * @namespace LineUtil
   *
   * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
   */

  // Simplify polyline with vertex reduction and Douglas-Peucker simplification.
  // Improves rendering performance dramatically by lessening the number of points to draw.

  // @function simplify(points: Point[], tolerance: Number): Point[]
  // Dramatically reduces the number of points in a polyline while retaining
  // its shape and returns a new array of simplified points, using the
  // [Ramer-Douglas-Peucker algorithm](https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm).
  // Used for a huge performance boost when processing/displaying Leaflet polylines for
  // each zoom level and also reducing visual noise. tolerance affects the amount of
  // simplification (lesser value means higher quality but slower and with more points).
  // Also released as a separated micro-library [Simplify.js](https://mourner.github.io/simplify-js/).
  function simplify(points, tolerance) {
  	if (!tolerance || !points.length) {
  		return points.slice();
  	}

  	var sqTolerance = tolerance * tolerance;

  	    // stage 1: vertex reduction
  	    points = _reducePoints(points, sqTolerance);

  	    // stage 2: Douglas-Peucker simplification
  	    points = _simplifyDP(points, sqTolerance);

  	return points;
  }

  // @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
  // Returns the distance between point `p` and segment `p1` to `p2`.
  function pointToSegmentDistance(p, p1, p2) {
  	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
  }

  // @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
  // Returns the closest point from a point `p` on a segment `p1` to `p2`.
  function closestPointOnSegment(p, p1, p2) {
  	return _sqClosestPointOnSegment(p, p1, p2);
  }

  // Ramer-Douglas-Peucker simplification, see https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm
  function _simplifyDP(points, sqTolerance) {

  	var len = points.length,
  	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
  	    markers = new ArrayConstructor(len);

  	    markers[0] = markers[len - 1] = 1;

  	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

  	var i,
  	    newPoints = [];

  	for (i = 0; i < len; i++) {
  		if (markers[i]) {
  			newPoints.push(points[i]);
  		}
  	}

  	return newPoints;
  }

  function _simplifyDPStep(points, markers, sqTolerance, first, last) {

  	var maxSqDist = 0,
  	index, i, sqDist;

  	for (i = first + 1; i <= last - 1; i++) {
  		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

  		if (sqDist > maxSqDist) {
  			index = i;
  			maxSqDist = sqDist;
  		}
  	}

  	if (maxSqDist > sqTolerance) {
  		markers[index] = 1;

  		_simplifyDPStep(points, markers, sqTolerance, first, index);
  		_simplifyDPStep(points, markers, sqTolerance, index, last);
  	}
  }

  // reduce points that are too close to each other to a single point
  function _reducePoints(points, sqTolerance) {
  	var reducedPoints = [points[0]];

  	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
  		if (_sqDist(points[i], points[prev]) > sqTolerance) {
  			reducedPoints.push(points[i]);
  			prev = i;
  		}
  	}
  	if (prev < len - 1) {
  		reducedPoints.push(points[len - 1]);
  	}
  	return reducedPoints;
  }

  var _lastCode;

  // @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
  // Clips the segment a to b by rectangular bounds with the
  // [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
  // (modifying the segment points directly!). Used by Leaflet to only show polyline
  // points that are on the screen or near, increasing performance.
  function clipSegment(a, b, bounds, useLastCode, round) {
  	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
  	    codeB = _getBitCode(b, bounds),

  	    codeOut, p, newCode;

  	    // save 2nd code to avoid calculating it on the next segment
  	    _lastCode = codeB;

  	while (true) {
  		// if a,b is inside the clip window (trivial accept)
  		if (!(codeA | codeB)) {
  			return [a, b];
  		}

  		// if a,b is outside the clip window (trivial reject)
  		if (codeA & codeB) {
  			return false;
  		}

  		// other cases
  		codeOut = codeA || codeB;
  		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
  		newCode = _getBitCode(p, bounds);

  		if (codeOut === codeA) {
  			a = p;
  			codeA = newCode;
  		} else {
  			b = p;
  			codeB = newCode;
  		}
  	}
  }

  function _getEdgeIntersection(a, b, code, bounds, round) {
  	var dx = b.x - a.x,
  	    dy = b.y - a.y,
  	    min = bounds.min,
  	    max = bounds.max,
  	    x, y;

  	if (code & 8) { // top
  		x = a.x + dx * (max.y - a.y) / dy;
  		y = max.y;

  	} else if (code & 4) { // bottom
  		x = a.x + dx * (min.y - a.y) / dy;
  		y = min.y;

  	} else if (code & 2) { // right
  		x = max.x;
  		y = a.y + dy * (max.x - a.x) / dx;

  	} else if (code & 1) { // left
  		x = min.x;
  		y = a.y + dy * (min.x - a.x) / dx;
  	}

  	return new Point(x, y, round);
  }

  function _getBitCode(p, bounds) {
  	var code = 0;

  	if (p.x < bounds.min.x) { // left
  		code |= 1;
  	} else if (p.x > bounds.max.x) { // right
  		code |= 2;
  	}

  	if (p.y < bounds.min.y) { // bottom
  		code |= 4;
  	} else if (p.y > bounds.max.y) { // top
  		code |= 8;
  	}

  	return code;
  }

  // square distance (to avoid unnecessary Math.sqrt calls)
  function _sqDist(p1, p2) {
  	var dx = p2.x - p1.x,
  	    dy = p2.y - p1.y;
  	return dx * dx + dy * dy;
  }

  // return closest point on segment or distance to that point
  function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
  	var x = p1.x,
  	    y = p1.y,
  	    dx = p2.x - x,
  	    dy = p2.y - y,
  	    dot = dx * dx + dy * dy,
  	    t;

  	if (dot > 0) {
  		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

  		if (t > 1) {
  			x = p2.x;
  			y = p2.y;
  		} else if (t > 0) {
  			x += dx * t;
  			y += dy * t;
  		}
  	}

  	dx = p.x - x;
  	dy = p.y - y;

  	return sqDist ? dx * dx + dy * dy : new Point(x, y);
  }


  // @function isFlat(latlngs: LatLng[]): Boolean
  // Returns true if `latlngs` is a flat array, false is nested.
  function isFlat(latlngs) {
  	return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
  }

  function _flat(latlngs) {
  	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
  	return isFlat(latlngs);
  }

  /* @function polylineCenter(latlngs: LatLng[], crs: CRS): LatLng
   * Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the passed LatLngs (first ring) from a polyline.
   */
  function polylineCenter(latlngs, crs) {
  	var i, halfDist, segDist, dist, p1, p2, ratio, center;

  	if (!latlngs || latlngs.length === 0) {
  		throw new Error('latlngs not passed');
  	}

  	if (!isFlat(latlngs)) {
  		console.warn('latlngs are not flat! Only the first ring will be used');
  		latlngs = latlngs[0];
  	}

  	var centroidLatLng = toLatLng([0, 0]);

  	var bounds = toLatLngBounds(latlngs);
  	var areaBounds = bounds.getNorthWest().distanceTo(bounds.getSouthWest()) * bounds.getNorthEast().distanceTo(bounds.getNorthWest());
  	// tests showed that below 1700 rounding errors are happening
  	if (areaBounds < 1700) {
  		// getting a inexact center, to move the latlngs near to [0, 0] to prevent rounding errors
  		centroidLatLng = centroid(latlngs);
  	}

  	var len = latlngs.length;
  	var points = [];
  	for (i = 0; i < len; i++) {
  		var latlng = toLatLng(latlngs[i]);
  		points.push(crs.project(toLatLng([latlng.lat - centroidLatLng.lat, latlng.lng - centroidLatLng.lng])));
  	}

  	for (i = 0, halfDist = 0; i < len - 1; i++) {
  		halfDist += points[i].distanceTo(points[i + 1]) / 2;
  	}

  	// The line is so small in the current view that all points are on the same pixel.
  	if (halfDist === 0) {
  		center = points[0];
  	} else {
  		for (i = 0, dist = 0; i < len - 1; i++) {
  			p1 = points[i];
  			p2 = points[i + 1];
  			segDist = p1.distanceTo(p2);
  			dist += segDist;

  			if (dist > halfDist) {
  				ratio = (dist - halfDist) / segDist;
  				center = [
  					p2.x - ratio * (p2.x - p1.x),
  					p2.y - ratio * (p2.y - p1.y)
  				];
  				break;
  			}
  		}
  	}

  	var latlngCenter = crs.unproject(toPoint(center));
  	return toLatLng([latlngCenter.lat + centroidLatLng.lat, latlngCenter.lng + centroidLatLng.lng]);
  }

  var LineUtil = {
    __proto__: null,
    simplify: simplify,
    pointToSegmentDistance: pointToSegmentDistance,
    closestPointOnSegment: closestPointOnSegment,
    clipSegment: clipSegment,
    _getEdgeIntersection: _getEdgeIntersection,
    _getBitCode: _getBitCode,
    _sqClosestPointOnSegment: _sqClosestPointOnSegment,
    isFlat: isFlat,
    _flat: _flat,
    polylineCenter: polylineCenter
  };

  /*
   * @namespace Projection
   * @section
   * Leaflet comes with a set of already defined Projections out of the box:
   *
   * @projection L.Projection.LonLat
   *
   * Equirectangular, or Plate Carree projection — the most simple projection,
   * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
   * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
   * `EPSG:4326` and `Simple` CRS.
   */

  var LonLat = {
  	project: function (latlng) {
  		return new Point(latlng.lng, latlng.lat);
  	},

  	unproject: function (point) {
  		return new LatLng(point.y, point.x);
  	},

  	bounds: new Bounds([-180, -90], [180, 90])
  };

  /*
   * @namespace Projection
   * @projection L.Projection.Mercator
   *
   * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
   */

  var Mercator = {
  	R: 6378137,
  	R_MINOR: 6356752.314245179,

  	bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

  	project: function (latlng) {
  		var d = Math.PI / 180,
  		    r = this.R,
  		    y = latlng.lat * d,
  		    tmp = this.R_MINOR / r,
  		    e = Math.sqrt(1 - tmp * tmp),
  		    con = e * Math.sin(y);

  		var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
  		y = -r * Math.log(Math.max(ts, 1E-10));

  		return new Point(latlng.lng * d * r, y);
  	},

  	unproject: function (point) {
  		var d = 180 / Math.PI,
  		    r = this.R,
  		    tmp = this.R_MINOR / r,
  		    e = Math.sqrt(1 - tmp * tmp),
  		    ts = Math.exp(-point.y / r),
  		    phi = Math.PI / 2 - 2 * Math.atan(ts);

  		for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
  			con = e * Math.sin(phi);
  			con = Math.pow((1 - con) / (1 + con), e / 2);
  			dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
  			phi += dphi;
  		}

  		return new LatLng(phi * d, point.x * d / r);
  	}
  };

  /*
   * @class Projection

   * An object with methods for projecting geographical coordinates of the world onto
   * a flat surface (and back). See [Map projection](https://en.wikipedia.org/wiki/Map_projection).

   * @property bounds: Bounds
   * The bounds (specified in CRS units) where the projection is valid

   * @method project(latlng: LatLng): Point
   * Projects geographical coordinates into a 2D point.
   * Only accepts actual `L.LatLng` instances, not arrays.

   * @method unproject(point: Point): LatLng
   * The inverse of `project`. Projects a 2D point into a geographical location.
   * Only accepts actual `L.Point` instances, not arrays.

   * Note that the projection instances do not inherit from Leaflet's `Class` object,
   * and can't be instantiated. Also, new classes can't inherit from them,
   * and methods can't be added to them with the `include` function.

   */

  var index = {
    __proto__: null,
    LonLat: LonLat,
    Mercator: Mercator,
    SphericalMercator: SphericalMercator
  };

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG3395
   *
   * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
   */
  var EPSG3395 = extend({}, Earth, {
  	code: 'EPSG:3395',
  	projection: Mercator,

  	transformation: (function () {
  		var scale = 0.5 / (Math.PI * Mercator.R);
  		return toTransformation(scale, 0.5, -scale, 0.5);
  	}())
  });

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG4326
   *
   * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
   *
   * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
   * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
   * with this CRS, ensure that there are two 256x256 pixel tiles covering the
   * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
   * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
   */

  var EPSG4326 = extend({}, Earth, {
  	code: 'EPSG:4326',
  	projection: LonLat,
  	transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
  });

  /*
   * @namespace CRS
   * @crs L.CRS.Simple
   *
   * A simple CRS that maps longitude and latitude into `x` and `y` directly.
   * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
   * axis should still be inverted (going from bottom to top). `distance()` returns
   * simple euclidean distance.
   */

  var Simple = extend({}, CRS, {
  	projection: LonLat,
  	transformation: toTransformation(1, 0, -1, 0),

  	scale: function (zoom) {
  		return Math.pow(2, zoom);
  	},

  	zoom: function (scale) {
  		return Math.log(scale) / Math.LN2;
  	},

  	distance: function (latlng1, latlng2) {
  		var dx = latlng2.lng - latlng1.lng,
  		    dy = latlng2.lat - latlng1.lat;

  		return Math.sqrt(dx * dx + dy * dy);
  	},

  	infinite: true
  });

  CRS.Earth = Earth;
  CRS.EPSG3395 = EPSG3395;
  CRS.EPSG3857 = EPSG3857;
  CRS.EPSG900913 = EPSG900913;
  CRS.EPSG4326 = EPSG4326;
  CRS.Simple = Simple;

  /*
   * @class Layer
   * @inherits Evented
   * @aka L.Layer
   * @aka ILayer
   *
   * A set of methods from the Layer base class that all Leaflet layers use.
   * Inherits all methods, options and events from `L.Evented`.
   *
   * @example
   *
   * ```js
   * var layer = L.marker(latlng).addTo(map);
   * layer.addTo(map);
   * layer.remove();
   * ```
   *
   * @event add: Event
   * Fired after the layer is added to a map
   *
   * @event remove: Event
   * Fired after the layer is removed from a map
   */


  var Layer = Evented.extend({

  	// Classes extending `L.Layer` will inherit the following options:
  	options: {
  		// @option pane: String = 'overlayPane'
  		// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
  		pane: 'overlayPane',

  		// @option attribution: String = null
  		// String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
  		attribution: null,

  		bubblingMouseEvents: true
  	},

  	/* @section
  	 * Classes extending `L.Layer` will inherit the following methods:
  	 *
  	 * @method addTo(map: Map|LayerGroup): this
  	 * Adds the layer to the given map or layer group.
  	 */
  	addTo: function (map) {
  		map.addLayer(this);
  		return this;
  	},

  	// @method remove: this
  	// Removes the layer from the map it is currently active on.
  	remove: function () {
  		return this.removeFrom(this._map || this._mapToAdd);
  	},

  	// @method removeFrom(map: Map): this
  	// Removes the layer from the given map
  	//
  	// @alternative
  	// @method removeFrom(group: LayerGroup): this
  	// Removes the layer from the given `LayerGroup`
  	removeFrom: function (obj) {
  		if (obj) {
  			obj.removeLayer(this);
  		}
  		return this;
  	},

  	// @method getPane(name? : String): HTMLElement
  	// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
  	getPane: function (name) {
  		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
  	},

  	addInteractiveTarget: function (targetEl) {
  		this._map._targets[stamp(targetEl)] = this;
  		return this;
  	},

  	removeInteractiveTarget: function (targetEl) {
  		delete this._map._targets[stamp(targetEl)];
  		return this;
  	},

  	// @method getAttribution: String
  	// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
  	getAttribution: function () {
  		return this.options.attribution;
  	},

  	_layerAdd: function (e) {
  		var map = e.target;

  		// check in case layer gets added and then removed before the map is ready
  		if (!map.hasLayer(this)) { return; }

  		this._map = map;
  		this._zoomAnimated = map._zoomAnimated;

  		if (this.getEvents) {
  			var events = this.getEvents();
  			map.on(events, this);
  			this.once('remove', function () {
  				map.off(events, this);
  			}, this);
  		}

  		this.onAdd(map);

  		this.fire('add');
  		map.fire('layeradd', {layer: this});
  	}
  });

  /* @section Extension methods
   * @uninheritable
   *
   * Every layer should extend from `L.Layer` and (re-)implement the following methods.
   *
   * @method onAdd(map: Map): this
   * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
   *
   * @method onRemove(map: Map): this
   * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
   *
   * @method getEvents(): Object
   * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
   *
   * @method getAttribution(): String
   * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
   *
   * @method beforeAdd(map: Map): this
   * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
   */


  /* @namespace Map
   * @section Layer events
   *
   * @event layeradd: LayerEvent
   * Fired when a new layer is added to the map.
   *
   * @event layerremove: LayerEvent
   * Fired when some layer is removed from the map
   *
   * @section Methods for Layers and Controls
   */
  Map$1.include({
  	// @method addLayer(layer: Layer): this
  	// Adds the given layer to the map
  	addLayer: function (layer) {
  		if (!layer._layerAdd) {
  			throw new Error('The provided object is not a Layer.');
  		}

  		var id = stamp(layer);
  		if (this._layers[id]) { return this; }
  		this._layers[id] = layer;

  		layer._mapToAdd = this;

  		if (layer.beforeAdd) {
  			layer.beforeAdd(this);
  		}

  		this.whenReady(layer._layerAdd, layer);

  		return this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Removes the given layer from the map.
  	removeLayer: function (layer) {
  		var id = stamp(layer);

  		if (!this._layers[id]) { return this; }

  		if (this._loaded) {
  			layer.onRemove(this);
  		}

  		delete this._layers[id];

  		if (this._loaded) {
  			this.fire('layerremove', {layer: layer});
  			layer.fire('remove');
  		}

  		layer._map = layer._mapToAdd = null;

  		return this;
  	},

  	// @method hasLayer(layer: Layer): Boolean
  	// Returns `true` if the given layer is currently added to the map
  	hasLayer: function (layer) {
  		return stamp(layer) in this._layers;
  	},

  	/* @method eachLayer(fn: Function, context?: Object): this
  	 * Iterates over the layers of the map, optionally specifying context of the iterator function.
  	 * ```
  	 * map.eachLayer(function(layer){
  	 *     layer.bindPopup('Hello');
  	 * });
  	 * ```
  	 */
  	eachLayer: function (method, context) {
  		for (var i in this._layers) {
  			method.call(context, this._layers[i]);
  		}
  		return this;
  	},

  	_addLayers: function (layers) {
  		layers = layers ? (isArray(layers) ? layers : [layers]) : [];

  		for (var i = 0, len = layers.length; i < len; i++) {
  			this.addLayer(layers[i]);
  		}
  	},

  	_addZoomLimit: function (layer) {
  		if (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
  			this._zoomBoundLayers[stamp(layer)] = layer;
  			this._updateZoomLevels();
  		}
  	},

  	_removeZoomLimit: function (layer) {
  		var id = stamp(layer);

  		if (this._zoomBoundLayers[id]) {
  			delete this._zoomBoundLayers[id];
  			this._updateZoomLevels();
  		}
  	},

  	_updateZoomLevels: function () {
  		var minZoom = Infinity,
  		    maxZoom = -Infinity,
  		    oldZoomSpan = this._getZoomSpan();

  		for (var i in this._zoomBoundLayers) {
  			var options = this._zoomBoundLayers[i].options;

  			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
  			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
  		}

  		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
  		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

  		// @section Map state change events
  		// @event zoomlevelschange: Event
  		// Fired when the number of zoomlevels on the map is changed due
  		// to adding or removing a layer.
  		if (oldZoomSpan !== this._getZoomSpan()) {
  			this.fire('zoomlevelschange');
  		}

  		if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
  			this.setZoom(this._layersMaxZoom);
  		}
  		if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
  			this.setZoom(this._layersMinZoom);
  		}
  	}
  });

  /*
   * @class LayerGroup
   * @aka L.LayerGroup
   * @inherits Interactive layer
   *
   * Used to group several layers and handle them as one. If you add it to the map,
   * any layers added or removed from the group will be added/removed on the map as
   * well. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * L.layerGroup([marker1, marker2])
   * 	.addLayer(polyline)
   * 	.addTo(map);
   * ```
   */

  var LayerGroup = Layer.extend({

  	initialize: function (layers, options) {
  		setOptions(this, options);

  		this._layers = {};

  		var i, len;

  		if (layers) {
  			for (i = 0, len = layers.length; i < len; i++) {
  				this.addLayer(layers[i]);
  			}
  		}
  	},

  	// @method addLayer(layer: Layer): this
  	// Adds the given layer to the group.
  	addLayer: function (layer) {
  		var id = this.getLayerId(layer);

  		this._layers[id] = layer;

  		if (this._map) {
  			this._map.addLayer(layer);
  		}

  		return this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Removes the given layer from the group.
  	// @alternative
  	// @method removeLayer(id: Number): this
  	// Removes the layer with the given internal ID from the group.
  	removeLayer: function (layer) {
  		var id = layer in this._layers ? layer : this.getLayerId(layer);

  		if (this._map && this._layers[id]) {
  			this._map.removeLayer(this._layers[id]);
  		}

  		delete this._layers[id];

  		return this;
  	},

  	// @method hasLayer(layer: Layer): Boolean
  	// Returns `true` if the given layer is currently added to the group.
  	// @alternative
  	// @method hasLayer(id: Number): Boolean
  	// Returns `true` if the given internal ID is currently added to the group.
  	hasLayer: function (layer) {
  		var layerId = typeof layer === 'number' ? layer : this.getLayerId(layer);
  		return layerId in this._layers;
  	},

  	// @method clearLayers(): this
  	// Removes all the layers from the group.
  	clearLayers: function () {
  		return this.eachLayer(this.removeLayer, this);
  	},

  	// @method invoke(methodName: String, …): this
  	// Calls `methodName` on every layer contained in this group, passing any
  	// additional parameters. Has no effect if the layers contained do not
  	// implement `methodName`.
  	invoke: function (methodName) {
  		var args = Array.prototype.slice.call(arguments, 1),
  		    i, layer;

  		for (i in this._layers) {
  			layer = this._layers[i];

  			if (layer[methodName]) {
  				layer[methodName].apply(layer, args);
  			}
  		}

  		return this;
  	},

  	onAdd: function (map) {
  		this.eachLayer(map.addLayer, map);
  	},

  	onRemove: function (map) {
  		this.eachLayer(map.removeLayer, map);
  	},

  	// @method eachLayer(fn: Function, context?: Object): this
  	// Iterates over the layers of the group, optionally specifying context of the iterator function.
  	// ```js
  	// group.eachLayer(function (layer) {
  	// 	layer.bindPopup('Hello');
  	// });
  	// ```
  	eachLayer: function (method, context) {
  		for (var i in this._layers) {
  			method.call(context, this._layers[i]);
  		}
  		return this;
  	},

  	// @method getLayer(id: Number): Layer
  	// Returns the layer with the given internal ID.
  	getLayer: function (id) {
  		return this._layers[id];
  	},

  	// @method getLayers(): Layer[]
  	// Returns an array of all the layers added to the group.
  	getLayers: function () {
  		var layers = [];
  		this.eachLayer(layers.push, layers);
  		return layers;
  	},

  	// @method setZIndex(zIndex: Number): this
  	// Calls `setZIndex` on every layer contained in this group, passing the z-index.
  	setZIndex: function (zIndex) {
  		return this.invoke('setZIndex', zIndex);
  	},

  	// @method getLayerId(layer: Layer): Number
  	// Returns the internal ID for a layer
  	getLayerId: function (layer) {
  		return stamp(layer);
  	}
  });


  // @factory L.layerGroup(layers?: Layer[], options?: Object)
  // Create a layer group, optionally given an initial set of layers and an `options` object.
  var layerGroup = function (layers, options) {
  	return new LayerGroup(layers, options);
  };

  /*
   * @class FeatureGroup
   * @aka L.FeatureGroup
   * @inherits LayerGroup
   *
   * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
   *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
   *  * Events are propagated to the `FeatureGroup`, so if the group has an event
   * handler, it will handle events from any of the layers. This includes mouse events
   * and custom events.
   *  * Has `layeradd` and `layerremove` events
   *
   * @example
   *
   * ```js
   * L.featureGroup([marker1, marker2, polyline])
   * 	.bindPopup('Hello world!')
   * 	.on('click', function() { alert('Clicked on a member of the group!'); })
   * 	.addTo(map);
   * ```
   */

  var FeatureGroup = LayerGroup.extend({

  	addLayer: function (layer) {
  		if (this.hasLayer(layer)) {
  			return this;
  		}

  		layer.addEventParent(this);

  		LayerGroup.prototype.addLayer.call(this, layer);

  		// @event layeradd: LayerEvent
  		// Fired when a layer is added to this `FeatureGroup`
  		return this.fire('layeradd', {layer: layer});
  	},

  	removeLayer: function (layer) {
  		if (!this.hasLayer(layer)) {
  			return this;
  		}
  		if (layer in this._layers) {
  			layer = this._layers[layer];
  		}

  		layer.removeEventParent(this);

  		LayerGroup.prototype.removeLayer.call(this, layer);

  		// @event layerremove: LayerEvent
  		// Fired when a layer is removed from this `FeatureGroup`
  		return this.fire('layerremove', {layer: layer});
  	},

  	// @method setStyle(style: Path options): this
  	// Sets the given path options to each layer of the group that has a `setStyle` method.
  	setStyle: function (style) {
  		return this.invoke('setStyle', style);
  	},

  	// @method bringToFront(): this
  	// Brings the layer group to the top of all other layers
  	bringToFront: function () {
  		return this.invoke('bringToFront');
  	},

  	// @method bringToBack(): this
  	// Brings the layer group to the back of all other layers
  	bringToBack: function () {
  		return this.invoke('bringToBack');
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
  	getBounds: function () {
  		var bounds = new LatLngBounds();

  		for (var id in this._layers) {
  			var layer = this._layers[id];
  			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
  		}
  		return bounds;
  	}
  });

  // @factory L.featureGroup(layers?: Layer[], options?: Object)
  // Create a feature group, optionally given an initial set of layers and an `options` object.
  var featureGroup = function (layers, options) {
  	return new FeatureGroup(layers, options);
  };

  /*
   * @class Icon
   * @aka L.Icon
   *
   * Represents an icon to provide when creating a marker.
   *
   * @example
   *
   * ```js
   * var myIcon = L.icon({
   *     iconUrl: 'my-icon.png',
   *     iconRetinaUrl: 'my-icon@2x.png',
   *     iconSize: [38, 95],
   *     iconAnchor: [22, 94],
   *     popupAnchor: [-3, -76],
   *     shadowUrl: 'my-icon-shadow.png',
   *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
   *     shadowSize: [68, 95],
   *     shadowAnchor: [22, 94]
   * });
   *
   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
   * ```
   *
   * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
   *
   */

  var Icon = Class.extend({

  	/* @section
  	 * @aka Icon options
  	 *
  	 * @option iconUrl: String = null
  	 * **(required)** The URL to the icon image (absolute or relative to your script path).
  	 *
  	 * @option iconRetinaUrl: String = null
  	 * The URL to a retina sized version of the icon image (absolute or relative to your
  	 * script path). Used for Retina screen devices.
  	 *
  	 * @option iconSize: Point = null
  	 * Size of the icon image in pixels.
  	 *
  	 * @option iconAnchor: Point = null
  	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
  	 * will be aligned so that this point is at the marker's geographical location. Centered
  	 * by default if size is specified, also can be set in CSS with negative margins.
  	 *
  	 * @option popupAnchor: Point = [0, 0]
  	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
  	 *
  	 * @option tooltipAnchor: Point = [0, 0]
  	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
  	 *
  	 * @option shadowUrl: String = null
  	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
  	 *
  	 * @option shadowRetinaUrl: String = null
  	 *
  	 * @option shadowSize: Point = null
  	 * Size of the shadow image in pixels.
  	 *
  	 * @option shadowAnchor: Point = null
  	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
  	 * as iconAnchor if not specified).
  	 *
  	 * @option className: String = ''
  	 * A custom class name to assign to both icon and shadow images. Empty by default.
  	 */

  	options: {
  		popupAnchor: [0, 0],
  		tooltipAnchor: [0, 0],

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the tiles.
  		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
  	// Called internally when the icon has to be shown, returns a `<img>` HTML element
  	// styled according to the options.
  	createIcon: function (oldIcon) {
  		return this._createIcon('icon', oldIcon);
  	},

  	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
  	// As `createIcon`, but for the shadow beneath it.
  	createShadow: function (oldIcon) {
  		return this._createIcon('shadow', oldIcon);
  	},

  	_createIcon: function (name, oldIcon) {
  		var src = this._getIconUrl(name);

  		if (!src) {
  			if (name === 'icon') {
  				throw new Error('iconUrl not set in Icon options (see the docs).');
  			}
  			return null;
  		}

  		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
  		this._setIconStyles(img, name);

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		return img;
  	},

  	_setIconStyles: function (img, name) {
  		var options = this.options;
  		var sizeOption = options[name + 'Size'];

  		if (typeof sizeOption === 'number') {
  			sizeOption = [sizeOption, sizeOption];
  		}

  		var size = toPoint(sizeOption),
  		    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
  		            size && size.divideBy(2, true));

  		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

  		if (anchor) {
  			img.style.marginLeft = (-anchor.x) + 'px';
  			img.style.marginTop  = (-anchor.y) + 'px';
  		}

  		if (size) {
  			img.style.width  = size.x + 'px';
  			img.style.height = size.y + 'px';
  		}
  	},

  	_createImg: function (src, el) {
  		el = el || document.createElement('img');
  		el.src = src;
  		return el;
  	},

  	_getIconUrl: function (name) {
  		return Browser.retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
  	}
  });


  // @factory L.icon(options: Icon options)
  // Creates an icon instance with the given options.
  function icon(options) {
  	return new Icon(options);
  }

  /*
   * @miniclass Icon.Default (Icon)
   * @aka L.Icon.Default
   * @section
   *
   * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
   * no icon is specified. Points to the blue marker image distributed with Leaflet
   * releases.
   *
   * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
   * (which is a set of `Icon options`).
   *
   * If you want to _completely_ replace the default icon, override the
   * `L.Marker.prototype.options.icon` with your own icon instead.
   */

  var IconDefault = Icon.extend({

  	options: {
  		iconUrl:       'marker-icon.png',
  		iconRetinaUrl: 'marker-icon-2x.png',
  		shadowUrl:     'marker-shadow.png',
  		iconSize:    [25, 41],
  		iconAnchor:  [12, 41],
  		popupAnchor: [1, -34],
  		tooltipAnchor: [16, -28],
  		shadowSize:  [41, 41]
  	},

  	_getIconUrl: function (name) {
  		if (typeof IconDefault.imagePath !== 'string') {	// Deprecated, backwards-compatibility only
  			IconDefault.imagePath = this._detectIconPath();
  		}

  		// @option imagePath: String
  		// `Icon.Default` will try to auto-detect the location of the
  		// blue icon images. If you are placing these images in a non-standard
  		// way, set this option to point to the right path.
  		return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
  	},

  	_stripUrl: function (path) {	// separate function to use in tests
  		var strip = function (str, re, idx) {
  			var match = re.exec(str);
  			return match && match[idx];
  		};
  		path = strip(path, /^url\((['"])?(.+)\1\)$/, 2);
  		return path && strip(path, /^(.*)marker-icon\.png$/, 1);
  	},

  	_detectIconPath: function () {
  		var el = create$1('div',  'leaflet-default-icon-path', document.body);
  		var path = getStyle(el, 'background-image') ||
  		           getStyle(el, 'backgroundImage');	// IE8

  		document.body.removeChild(el);
  		path = this._stripUrl(path);
  		if (path) { return path; }
  		var link = document.querySelector('link[href$="leaflet.css"]');
  		if (!link) { return ''; }
  		return link.href.substring(0, link.href.length - 'leaflet.css'.length - 1);
  	}
  });

  /*
   * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
   */


  /* @namespace Marker
   * @section Interaction handlers
   *
   * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
   *
   * ```js
   * marker.dragging.disable();
   * ```
   *
   * @property dragging: Handler
   * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
   */

  var MarkerDrag = Handler.extend({
  	initialize: function (marker) {
  		this._marker = marker;
  	},

  	addHooks: function () {
  		var icon = this._marker._icon;

  		if (!this._draggable) {
  			this._draggable = new Draggable(icon, icon, true);
  		}

  		this._draggable.on({
  			dragstart: this._onDragStart,
  			predrag: this._onPreDrag,
  			drag: this._onDrag,
  			dragend: this._onDragEnd
  		}, this).enable();

  		addClass(icon, 'leaflet-marker-draggable');
  	},

  	removeHooks: function () {
  		this._draggable.off({
  			dragstart: this._onDragStart,
  			predrag: this._onPreDrag,
  			drag: this._onDrag,
  			dragend: this._onDragEnd
  		}, this).disable();

  		if (this._marker._icon) {
  			removeClass(this._marker._icon, 'leaflet-marker-draggable');
  		}
  	},

  	moved: function () {
  		return this._draggable && this._draggable._moved;
  	},

  	_adjustPan: function (e) {
  		var marker = this._marker,
  		    map = marker._map,
  		    speed = this._marker.options.autoPanSpeed,
  		    padding = this._marker.options.autoPanPadding,
  		    iconPos = getPosition(marker._icon),
  		    bounds = map.getPixelBounds(),
  		    origin = map.getPixelOrigin();

  		var panBounds = toBounds(
  			bounds.min._subtract(origin).add(padding),
  			bounds.max._subtract(origin).subtract(padding)
  		);

  		if (!panBounds.contains(iconPos)) {
  			// Compute incremental movement
  			var movement = toPoint(
  				(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
  				(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

  				(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
  				(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
  			).multiplyBy(speed);

  			map.panBy(movement, {animate: false});

  			this._draggable._newPos._add(movement);
  			this._draggable._startPos._add(movement);

  			setPosition(marker._icon, this._draggable._newPos);
  			this._onDrag(e);

  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
  		}
  	},

  	_onDragStart: function () {
  		// @section Dragging events
  		// @event dragstart: Event
  		// Fired when the user starts dragging the marker.

  		// @event movestart: Event
  		// Fired when the marker starts moving (because of dragging).

  		this._oldLatLng = this._marker.getLatLng();

  		// When using ES6 imports it could not be set when `Popup` was not imported as well
  		this._marker.closePopup && this._marker.closePopup();

  		this._marker
  			.fire('movestart')
  			.fire('dragstart');
  	},

  	_onPreDrag: function (e) {
  		if (this._marker.options.autoPan) {
  			cancelAnimFrame(this._panRequest);
  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
  		}
  	},

  	_onDrag: function (e) {
  		var marker = this._marker,
  		    shadow = marker._shadow,
  		    iconPos = getPosition(marker._icon),
  		    latlng = marker._map.layerPointToLatLng(iconPos);

  		// update shadow position
  		if (shadow) {
  			setPosition(shadow, iconPos);
  		}

  		marker._latlng = latlng;
  		e.latlng = latlng;
  		e.oldLatLng = this._oldLatLng;

  		// @event drag: Event
  		// Fired repeatedly while the user drags the marker.
  		marker
  		    .fire('move', e)
  		    .fire('drag', e);
  	},

  	_onDragEnd: function (e) {
  		// @event dragend: DragEndEvent
  		// Fired when the user stops dragging the marker.

  		 cancelAnimFrame(this._panRequest);

  		// @event moveend: Event
  		// Fired when the marker stops moving (because of dragging).
  		delete this._oldLatLng;
  		this._marker
  		    .fire('moveend')
  		    .fire('dragend', e);
  	}
  });

  /*
   * @class Marker
   * @inherits Interactive layer
   * @aka L.Marker
   * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * L.marker([50.5, 30.5]).addTo(map);
   * ```
   */

  var Marker = Layer.extend({

  	// @section
  	// @aka Marker options
  	options: {
  		// @option icon: Icon = *
  		// Icon instance to use for rendering the marker.
  		// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
  		// If not specified, a common instance of `L.Icon.Default` is used.
  		icon: new IconDefault(),

  		// Option inherited from "Interactive layer" abstract class
  		interactive: true,

  		// @option keyboard: Boolean = true
  		// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
  		keyboard: true,

  		// @option title: String = ''
  		// Text for the browser tooltip that appear on marker hover (no tooltip by default).
  		// [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
  		title: '',

  		// @option alt: String = 'Marker'
  		// Text for the `alt` attribute of the icon image.
  		// [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
  		alt: 'Marker',

  		// @option zIndexOffset: Number = 0
  		// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
  		zIndexOffset: 0,

  		// @option opacity: Number = 1.0
  		// The opacity of the marker.
  		opacity: 1,

  		// @option riseOnHover: Boolean = false
  		// If `true`, the marker will get on top of others when you hover the mouse over it.
  		riseOnHover: false,

  		// @option riseOffset: Number = 250
  		// The z-index offset used for the `riseOnHover` feature.
  		riseOffset: 250,

  		// @option pane: String = 'markerPane'
  		// `Map pane` where the markers icon will be added.
  		pane: 'markerPane',

  		// @option shadowPane: String = 'shadowPane'
  		// `Map pane` where the markers shadow will be added.
  		shadowPane: 'shadowPane',

  		// @option bubblingMouseEvents: Boolean = false
  		// When `true`, a mouse event on this marker will trigger the same event on the map
  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
  		bubblingMouseEvents: false,

  		// @option autoPanOnFocus: Boolean = true
  		// When `true`, the map will pan whenever the marker is focused (via
  		// e.g. pressing `tab` on the keyboard) to ensure the marker is
  		// visible within the map's bounds
  		autoPanOnFocus: true,

  		// @section Draggable marker options
  		// @option draggable: Boolean = false
  		// Whether the marker is draggable with mouse/touch or not.
  		draggable: false,

  		// @option autoPan: Boolean = false
  		// Whether to pan the map when dragging this marker near its edge or not.
  		autoPan: false,

  		// @option autoPanPadding: Point = Point(50, 50)
  		// Distance (in pixels to the left/right and to the top/bottom) of the
  		// map edge to start panning the map.
  		autoPanPadding: [50, 50],

  		// @option autoPanSpeed: Number = 10
  		// Number of pixels the map should pan by.
  		autoPanSpeed: 10
  	},

  	/* @section
  	 *
  	 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
  	 */

  	initialize: function (latlng, options) {
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);
  	},

  	onAdd: function (map) {
  		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

  		if (this._zoomAnimated) {
  			map.on('zoomanim', this._animateZoom, this);
  		}

  		this._initIcon();
  		this.update();
  	},

  	onRemove: function (map) {
  		if (this.dragging && this.dragging.enabled()) {
  			this.options.draggable = true;
  			this.dragging.removeHooks();
  		}
  		delete this.dragging;

  		if (this._zoomAnimated) {
  			map.off('zoomanim', this._animateZoom, this);
  		}

  		this._removeIcon();
  		this._removeShadow();
  	},

  	getEvents: function () {
  		return {
  			zoom: this.update,
  			viewreset: this.update
  		};
  	},

  	// @method getLatLng: LatLng
  	// Returns the current geographical position of the marker.
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setLatLng(latlng: LatLng): this
  	// Changes the marker position to the given point.
  	setLatLng: function (latlng) {
  		var oldLatLng = this._latlng;
  		this._latlng = toLatLng(latlng);
  		this.update();

  		// @event move: Event
  		// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
  	},

  	// @method setZIndexOffset(offset: Number): this
  	// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
  	setZIndexOffset: function (offset) {
  		this.options.zIndexOffset = offset;
  		return this.update();
  	},

  	// @method getIcon: Icon
  	// Returns the current icon used by the marker
  	getIcon: function () {
  		return this.options.icon;
  	},

  	// @method setIcon(icon: Icon): this
  	// Changes the marker icon.
  	setIcon: function (icon) {

  		this.options.icon = icon;

  		if (this._map) {
  			this._initIcon();
  			this.update();
  		}

  		if (this._popup) {
  			this.bindPopup(this._popup, this._popup.options);
  		}

  		return this;
  	},

  	getElement: function () {
  		return this._icon;
  	},

  	update: function () {

  		if (this._icon && this._map) {
  			var pos = this._map.latLngToLayerPoint(this._latlng).round();
  			this._setPos(pos);
  		}

  		return this;
  	},

  	_initIcon: function () {
  		var options = this.options,
  		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

  		var icon = options.icon.createIcon(this._icon),
  		    addIcon = false;

  		// if we're not reusing the icon, remove the old one and init new one
  		if (icon !== this._icon) {
  			if (this._icon) {
  				this._removeIcon();
  			}
  			addIcon = true;

  			if (options.title) {
  				icon.title = options.title;
  			}

  			if (icon.tagName === 'IMG') {
  				icon.alt = options.alt || '';
  			}
  		}

  		addClass(icon, classToAdd);

  		if (options.keyboard) {
  			icon.tabIndex = '0';
  			icon.setAttribute('role', 'button');
  		}

  		this._icon = icon;

  		if (options.riseOnHover) {
  			this.on({
  				mouseover: this._bringToFront,
  				mouseout: this._resetZIndex
  			});
  		}

  		if (this.options.autoPanOnFocus) {
  			on(icon, 'focus', this._panOnFocus, this);
  		}

  		var newShadow = options.icon.createShadow(this._shadow),
  		    addShadow = false;

  		if (newShadow !== this._shadow) {
  			this._removeShadow();
  			addShadow = true;
  		}

  		if (newShadow) {
  			addClass(newShadow, classToAdd);
  			newShadow.alt = '';
  		}
  		this._shadow = newShadow;


  		if (options.opacity < 1) {
  			this._updateOpacity();
  		}


  		if (addIcon) {
  			this.getPane().appendChild(this._icon);
  		}
  		this._initInteraction();
  		if (newShadow && addShadow) {
  			this.getPane(options.shadowPane).appendChild(this._shadow);
  		}
  	},

  	_removeIcon: function () {
  		if (this.options.riseOnHover) {
  			this.off({
  				mouseover: this._bringToFront,
  				mouseout: this._resetZIndex
  			});
  		}

  		if (this.options.autoPanOnFocus) {
  			off(this._icon, 'focus', this._panOnFocus, this);
  		}

  		remove(this._icon);
  		this.removeInteractiveTarget(this._icon);

  		this._icon = null;
  	},

  	_removeShadow: function () {
  		if (this._shadow) {
  			remove(this._shadow);
  		}
  		this._shadow = null;
  	},

  	_setPos: function (pos) {

  		if (this._icon) {
  			setPosition(this._icon, pos);
  		}

  		if (this._shadow) {
  			setPosition(this._shadow, pos);
  		}

  		this._zIndex = pos.y + this.options.zIndexOffset;

  		this._resetZIndex();
  	},

  	_updateZIndex: function (offset) {
  		if (this._icon) {
  			this._icon.style.zIndex = this._zIndex + offset;
  		}
  	},

  	_animateZoom: function (opt) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

  		this._setPos(pos);
  	},

  	_initInteraction: function () {

  		if (!this.options.interactive) { return; }

  		addClass(this._icon, 'leaflet-interactive');

  		this.addInteractiveTarget(this._icon);

  		if (MarkerDrag) {
  			var draggable = this.options.draggable;
  			if (this.dragging) {
  				draggable = this.dragging.enabled();
  				this.dragging.disable();
  			}

  			this.dragging = new MarkerDrag(this);

  			if (draggable) {
  				this.dragging.enable();
  			}
  		}
  	},

  	// @method setOpacity(opacity: Number): this
  	// Changes the opacity of the marker.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;
  		if (this._map) {
  			this._updateOpacity();
  		}

  		return this;
  	},

  	_updateOpacity: function () {
  		var opacity = this.options.opacity;

  		if (this._icon) {
  			setOpacity(this._icon, opacity);
  		}

  		if (this._shadow) {
  			setOpacity(this._shadow, opacity);
  		}
  	},

  	_bringToFront: function () {
  		this._updateZIndex(this.options.riseOffset);
  	},

  	_resetZIndex: function () {
  		this._updateZIndex(0);
  	},

  	_panOnFocus: function () {
  		var map = this._map;
  		if (!map) { return; }

  		var iconOpts = this.options.icon.options;
  		var size = iconOpts.iconSize ? toPoint(iconOpts.iconSize) : toPoint(0, 0);
  		var anchor = iconOpts.iconAnchor ? toPoint(iconOpts.iconAnchor) : toPoint(0, 0);

  		map.panInside(this._latlng, {
  			paddingTopLeft: anchor,
  			paddingBottomRight: size.subtract(anchor)
  		});
  	},

  	_getPopupAnchor: function () {
  		return this.options.icon.options.popupAnchor;
  	},

  	_getTooltipAnchor: function () {
  		return this.options.icon.options.tooltipAnchor;
  	}
  });


  // factory L.marker(latlng: LatLng, options? : Marker options)

  // @factory L.marker(latlng: LatLng, options? : Marker options)
  // Instantiates a Marker object given a geographical point and optionally an options object.
  function marker(latlng, options) {
  	return new Marker(latlng, options);
  }

  /*
   * @class Path
   * @aka L.Path
   * @inherits Interactive layer
   *
   * An abstract class that contains options and constants shared between vector
   * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
   */

  var Path = Layer.extend({

  	// @section
  	// @aka Path options
  	options: {
  		// @option stroke: Boolean = true
  		// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
  		stroke: true,

  		// @option color: String = '#3388ff'
  		// Stroke color
  		color: '#3388ff',

  		// @option weight: Number = 3
  		// Stroke width in pixels
  		weight: 3,

  		// @option opacity: Number = 1.0
  		// Stroke opacity
  		opacity: 1,

  		// @option lineCap: String= 'round'
  		// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
  		lineCap: 'round',

  		// @option lineJoin: String = 'round'
  		// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
  		lineJoin: 'round',

  		// @option dashArray: String = null
  		// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
  		dashArray: null,

  		// @option dashOffset: String = null
  		// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
  		dashOffset: null,

  		// @option fill: Boolean = depends
  		// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
  		fill: false,

  		// @option fillColor: String = *
  		// Fill color. Defaults to the value of the [`color`](#path-color) option
  		fillColor: null,

  		// @option fillOpacity: Number = 0.2
  		// Fill opacity.
  		fillOpacity: 0.2,

  		// @option fillRule: String = 'evenodd'
  		// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
  		fillRule: 'evenodd',

  		// className: '',

  		// Option inherited from "Interactive layer" abstract class
  		interactive: true,

  		// @option bubblingMouseEvents: Boolean = true
  		// When `true`, a mouse event on this path will trigger the same event on the map
  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
  		bubblingMouseEvents: true
  	},

  	beforeAdd: function (map) {
  		// Renderer is set here because we need to call renderer.getEvents
  		// before this.getEvents.
  		this._renderer = map.getRenderer(this);
  	},

  	onAdd: function () {
  		this._renderer._initPath(this);
  		this._reset();
  		this._renderer._addPath(this);
  	},

  	onRemove: function () {
  		this._renderer._removePath(this);
  	},

  	// @method redraw(): this
  	// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
  	redraw: function () {
  		if (this._map) {
  			this._renderer._updatePath(this);
  		}
  		return this;
  	},

  	// @method setStyle(style: Path options): this
  	// Changes the appearance of a Path based on the options in the `Path options` object.
  	setStyle: function (style) {
  		setOptions(this, style);
  		if (this._renderer) {
  			this._renderer._updateStyle(this);
  			if (this.options.stroke && style && Object.prototype.hasOwnProperty.call(style, 'weight')) {
  				this._updateBounds();
  			}
  		}
  		return this;
  	},

  	// @method bringToFront(): this
  	// Brings the layer to the top of all path layers.
  	bringToFront: function () {
  		if (this._renderer) {
  			this._renderer._bringToFront(this);
  		}
  		return this;
  	},

  	// @method bringToBack(): this
  	// Brings the layer to the bottom of all path layers.
  	bringToBack: function () {
  		if (this._renderer) {
  			this._renderer._bringToBack(this);
  		}
  		return this;
  	},

  	getElement: function () {
  		return this._path;
  	},

  	_reset: function () {
  		// defined in child classes
  		this._project();
  		this._update();
  	},

  	_clickTolerance: function () {
  		// used when doing hit detection for Canvas layers
  		return (this.options.stroke ? this.options.weight / 2 : 0) +
  		  (this._renderer.options.tolerance || 0);
  	}
  });

  /*
   * @class CircleMarker
   * @aka L.CircleMarker
   * @inherits Path
   *
   * A circle of a fixed size with radius specified in pixels. Extends `Path`.
   */

  var CircleMarker = Path.extend({

  	// @section
  	// @aka CircleMarker options
  	options: {
  		fill: true,

  		// @option radius: Number = 10
  		// Radius of the circle marker, in pixels
  		radius: 10
  	},

  	initialize: function (latlng, options) {
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);
  		this._radius = this.options.radius;
  	},

  	// @method setLatLng(latLng: LatLng): this
  	// Sets the position of a circle marker to a new location.
  	setLatLng: function (latlng) {
  		var oldLatLng = this._latlng;
  		this._latlng = toLatLng(latlng);
  		this.redraw();

  		// @event move: Event
  		// Fired when the marker is moved via [`setLatLng`](#circlemarker-setlatlng). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
  	},

  	// @method getLatLng(): LatLng
  	// Returns the current geographical position of the circle marker
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setRadius(radius: Number): this
  	// Sets the radius of a circle marker. Units are in pixels.
  	setRadius: function (radius) {
  		this.options.radius = this._radius = radius;
  		return this.redraw();
  	},

  	// @method getRadius(): Number
  	// Returns the current radius of the circle
  	getRadius: function () {
  		return this._radius;
  	},

  	setStyle : function (options) {
  		var radius = options && options.radius || this._radius;
  		Path.prototype.setStyle.call(this, options);
  		this.setRadius(radius);
  		return this;
  	},

  	_project: function () {
  		this._point = this._map.latLngToLayerPoint(this._latlng);
  		this._updateBounds();
  	},

  	_updateBounds: function () {
  		var r = this._radius,
  		    r2 = this._radiusY || r,
  		    w = this._clickTolerance(),
  		    p = [r + w, r2 + w];
  		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
  	},

  	_update: function () {
  		if (this._map) {
  			this._updatePath();
  		}
  	},

  	_updatePath: function () {
  		this._renderer._updateCircle(this);
  	},

  	_empty: function () {
  		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p) {
  		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
  	}
  });


  // @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
  // Instantiates a circle marker object given a geographical point, and an optional options object.
  function circleMarker(latlng, options) {
  	return new CircleMarker(latlng, options);
  }

  /*
   * @class Circle
   * @aka L.Circle
   * @inherits CircleMarker
   *
   * A class for drawing circle overlays on a map. Extends `CircleMarker`.
   *
   * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
   *
   * @example
   *
   * ```js
   * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
   * ```
   */

  var Circle = CircleMarker.extend({

  	initialize: function (latlng, options, legacyOptions) {
  		if (typeof options === 'number') {
  			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
  			options = extend({}, legacyOptions, {radius: options});
  		}
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);

  		if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

  		// @section
  		// @aka Circle options
  		// @option radius: Number; Radius of the circle, in meters.
  		this._mRadius = this.options.radius;
  	},

  	// @method setRadius(radius: Number): this
  	// Sets the radius of a circle. Units are in meters.
  	setRadius: function (radius) {
  		this._mRadius = radius;
  		return this.redraw();
  	},

  	// @method getRadius(): Number
  	// Returns the current radius of a circle. Units are in meters.
  	getRadius: function () {
  		return this._mRadius;
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the `LatLngBounds` of the path.
  	getBounds: function () {
  		var half = [this._radius, this._radiusY || this._radius];

  		return new LatLngBounds(
  			this._map.layerPointToLatLng(this._point.subtract(half)),
  			this._map.layerPointToLatLng(this._point.add(half)));
  	},

  	setStyle: Path.prototype.setStyle,

  	_project: function () {

  		var lng = this._latlng.lng,
  		    lat = this._latlng.lat,
  		    map = this._map,
  		    crs = map.options.crs;

  		if (crs.distance === Earth.distance) {
  			var d = Math.PI / 180,
  			    latR = (this._mRadius / Earth.R) / d,
  			    top = map.project([lat + latR, lng]),
  			    bottom = map.project([lat - latR, lng]),
  			    p = top.add(bottom).divideBy(2),
  			    lat2 = map.unproject(p).lat,
  			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
  			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

  			if (isNaN(lngR) || lngR === 0) {
  				lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
  			}

  			this._point = p.subtract(map.getPixelOrigin());
  			this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
  			this._radiusY = p.y - top.y;

  		} else {
  			var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

  			this._point = map.latLngToLayerPoint(this._latlng);
  			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
  		}

  		this._updateBounds();
  	}
  });

  // @factory L.circle(latlng: LatLng, options?: Circle options)
  // Instantiates a circle object given a geographical point, and an options object
  // which contains the circle radius.
  // @alternative
  // @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
  // Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
  // Do not use in new applications or plugins.
  function circle(latlng, options, legacyOptions) {
  	return new Circle(latlng, options, legacyOptions);
  }

  /*
   * @class Polyline
   * @aka L.Polyline
   * @inherits Path
   *
   * A class for drawing polyline overlays on a map. Extends `Path`.
   *
   * @example
   *
   * ```js
   * // create a red polyline from an array of LatLng points
   * var latlngs = [
   * 	[45.51, -122.68],
   * 	[37.77, -122.43],
   * 	[34.04, -118.2]
   * ];
   *
   * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
   *
   * // zoom the map to the polyline
   * map.fitBounds(polyline.getBounds());
   * ```
   *
   * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
   *
   * ```js
   * // create a red polyline from an array of arrays of LatLng points
   * var latlngs = [
   * 	[[45.51, -122.68],
   * 	 [37.77, -122.43],
   * 	 [34.04, -118.2]],
   * 	[[40.78, -73.91],
   * 	 [41.83, -87.62],
   * 	 [32.76, -96.72]]
   * ];
   * ```
   */


  var Polyline = Path.extend({

  	// @section
  	// @aka Polyline options
  	options: {
  		// @option smoothFactor: Number = 1.0
  		// How much to simplify the polyline on each zoom level. More means
  		// better performance and smoother look, and less means more accurate representation.
  		smoothFactor: 1.0,

  		// @option noClip: Boolean = false
  		// Disable polyline clipping.
  		noClip: false
  	},

  	initialize: function (latlngs, options) {
  		setOptions(this, options);
  		this._setLatLngs(latlngs);
  	},

  	// @method getLatLngs(): LatLng[]
  	// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
  	getLatLngs: function () {
  		return this._latlngs;
  	},

  	// @method setLatLngs(latlngs: LatLng[]): this
  	// Replaces all the points in the polyline with the given array of geographical points.
  	setLatLngs: function (latlngs) {
  		this._setLatLngs(latlngs);
  		return this.redraw();
  	},

  	// @method isEmpty(): Boolean
  	// Returns `true` if the Polyline has no LatLngs.
  	isEmpty: function () {
  		return !this._latlngs.length;
  	},

  	// @method closestLayerPoint(p: Point): Point
  	// Returns the point closest to `p` on the Polyline.
  	closestLayerPoint: function (p) {
  		var minDistance = Infinity,
  		    minPoint = null,
  		    closest = _sqClosestPointOnSegment,
  		    p1, p2;

  		for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
  			var points = this._parts[j];

  			for (var i = 1, len = points.length; i < len; i++) {
  				p1 = points[i - 1];
  				p2 = points[i];

  				var sqDist = closest(p, p1, p2, true);

  				if (sqDist < minDistance) {
  					minDistance = sqDist;
  					minPoint = closest(p, p1, p2);
  				}
  			}
  		}
  		if (minPoint) {
  			minPoint.distance = Math.sqrt(minDistance);
  		}
  		return minPoint;
  	},

  	// @method getCenter(): LatLng
  	// Returns the center ([centroid](https://en.wikipedia.org/wiki/Centroid)) of the polyline.
  	getCenter: function () {
  		// throws error when not yet added to map as this center calculation requires projected coordinates
  		if (!this._map) {
  			throw new Error('Must add layer to map before using getCenter()');
  		}
  		return polylineCenter(this._defaultShape(), this._map.options.crs);
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the `LatLngBounds` of the path.
  	getBounds: function () {
  		return this._bounds;
  	},

  	// @method addLatLng(latlng: LatLng, latlngs?: LatLng[]): this
  	// Adds a given point to the polyline. By default, adds to the first ring of
  	// the polyline in case of a multi-polyline, but can be overridden by passing
  	// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
  	addLatLng: function (latlng, latlngs) {
  		latlngs = latlngs || this._defaultShape();
  		latlng = toLatLng(latlng);
  		latlngs.push(latlng);
  		this._bounds.extend(latlng);
  		return this.redraw();
  	},

  	_setLatLngs: function (latlngs) {
  		this._bounds = new LatLngBounds();
  		this._latlngs = this._convertLatLngs(latlngs);
  	},

  	_defaultShape: function () {
  		return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
  	},

  	// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
  	_convertLatLngs: function (latlngs) {
  		var result = [],
  		    flat = isFlat(latlngs);

  		for (var i = 0, len = latlngs.length; i < len; i++) {
  			if (flat) {
  				result[i] = toLatLng(latlngs[i]);
  				this._bounds.extend(result[i]);
  			} else {
  				result[i] = this._convertLatLngs(latlngs[i]);
  			}
  		}

  		return result;
  	},

  	_project: function () {
  		var pxBounds = new Bounds();
  		this._rings = [];
  		this._projectLatlngs(this._latlngs, this._rings, pxBounds);

  		if (this._bounds.isValid() && pxBounds.isValid()) {
  			this._rawPxBounds = pxBounds;
  			this._updateBounds();
  		}
  	},

  	_updateBounds: function () {
  		var w = this._clickTolerance(),
  		    p = new Point(w, w);

  		if (!this._rawPxBounds) {
  			return;
  		}

  		this._pxBounds = new Bounds([
  			this._rawPxBounds.min.subtract(p),
  			this._rawPxBounds.max.add(p)
  		]);
  	},

  	// recursively turns latlngs into a set of rings with projected coordinates
  	_projectLatlngs: function (latlngs, result, projectedBounds) {
  		var flat = latlngs[0] instanceof LatLng,
  		    len = latlngs.length,
  		    i, ring;

  		if (flat) {
  			ring = [];
  			for (i = 0; i < len; i++) {
  				ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
  				projectedBounds.extend(ring[i]);
  			}
  			result.push(ring);
  		} else {
  			for (i = 0; i < len; i++) {
  				this._projectLatlngs(latlngs[i], result, projectedBounds);
  			}
  		}
  	},

  	// clip polyline by renderer bounds so that we have less to render for performance
  	_clipPoints: function () {
  		var bounds = this._renderer._bounds;

  		this._parts = [];
  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
  			return;
  		}

  		if (this.options.noClip) {
  			this._parts = this._rings;
  			return;
  		}

  		var parts = this._parts,
  		    i, j, k, len, len2, segment, points;

  		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
  			points = this._rings[i];

  			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
  				segment = clipSegment(points[j], points[j + 1], bounds, j, true);

  				if (!segment) { continue; }

  				parts[k] = parts[k] || [];
  				parts[k].push(segment[0]);

  				// if segment goes out of screen, or it's the last one, it's the end of the line part
  				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
  					parts[k].push(segment[1]);
  					k++;
  				}
  			}
  		}
  	},

  	// simplify each clipped part of the polyline for performance
  	_simplifyPoints: function () {
  		var parts = this._parts,
  		    tolerance = this.options.smoothFactor;

  		for (var i = 0, len = parts.length; i < len; i++) {
  			parts[i] = simplify(parts[i], tolerance);
  		}
  	},

  	_update: function () {
  		if (!this._map) { return; }

  		this._clipPoints();
  		this._simplifyPoints();
  		this._updatePath();
  	},

  	_updatePath: function () {
  		this._renderer._updatePoly(this);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p, closed) {
  		var i, j, k, len, len2, part,
  		    w = this._clickTolerance();

  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

  		// hit detection for polylines
  		for (i = 0, len = this._parts.length; i < len; i++) {
  			part = this._parts[i];

  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
  				if (!closed && (j === 0)) { continue; }

  				if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
  					return true;
  				}
  			}
  		}
  		return false;
  	}
  });

  // @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
  // Instantiates a polyline object given an array of geographical points and
  // optionally an options object. You can create a `Polyline` object with
  // multiple separate lines (`MultiPolyline`) by passing an array of arrays
  // of geographic points.
  function polyline(latlngs, options) {
  	return new Polyline(latlngs, options);
  }

  // Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
  Polyline._flat = _flat;

  /*
   * @class Polygon
   * @aka L.Polygon
   * @inherits Polyline
   *
   * A class for drawing polygon overlays on a map. Extends `Polyline`.
   *
   * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
   *
   *
   * @example
   *
   * ```js
   * // create a red polygon from an array of LatLng points
   * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
   *
   * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
   *
   * // zoom the map to the polygon
   * map.fitBounds(polygon.getBounds());
   * ```
   *
   * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
   *
   * ```js
   * var latlngs = [
   *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
   *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
   * ];
   * ```
   *
   * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
   *
   * ```js
   * var latlngs = [
   *   [ // first polygon
   *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
   *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
   *   ],
   *   [ // second polygon
   *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
   *   ]
   * ];
   * ```
   */

  var Polygon = Polyline.extend({

  	options: {
  		fill: true
  	},

  	isEmpty: function () {
  		return !this._latlngs.length || !this._latlngs[0].length;
  	},

  	// @method getCenter(): LatLng
  	// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the Polygon.
  	getCenter: function () {
  		// throws error when not yet added to map as this center calculation requires projected coordinates
  		if (!this._map) {
  			throw new Error('Must add layer to map before using getCenter()');
  		}
  		return polygonCenter(this._defaultShape(), this._map.options.crs);
  	},

  	_convertLatLngs: function (latlngs) {
  		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
  		    len = result.length;

  		// remove last point if it equals first one
  		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
  			result.pop();
  		}
  		return result;
  	},

  	_setLatLngs: function (latlngs) {
  		Polyline.prototype._setLatLngs.call(this, latlngs);
  		if (isFlat(this._latlngs)) {
  			this._latlngs = [this._latlngs];
  		}
  	},

  	_defaultShape: function () {
  		return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
  	},

  	_clipPoints: function () {
  		// polygons need a different clipping algorithm so we redefine that

  		var bounds = this._renderer._bounds,
  		    w = this.options.weight,
  		    p = new Point(w, w);

  		// increase clip padding by stroke width to avoid stroke on clip edges
  		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

  		this._parts = [];
  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
  			return;
  		}

  		if (this.options.noClip) {
  			this._parts = this._rings;
  			return;
  		}

  		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
  			clipped = clipPolygon(this._rings[i], bounds, true);
  			if (clipped.length) {
  				this._parts.push(clipped);
  			}
  		}
  	},

  	_updatePath: function () {
  		this._renderer._updatePoly(this, true);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p) {
  		var inside = false,
  		    part, p1, p2, i, j, k, len, len2;

  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

  		// ray casting algorithm for detecting if point is in polygon
  		for (i = 0, len = this._parts.length; i < len; i++) {
  			part = this._parts[i];

  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
  				p1 = part[j];
  				p2 = part[k];

  				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
  					inside = !inside;
  				}
  			}
  		}

  		// also check if it's on polygon stroke
  		return inside || Polyline.prototype._containsPoint.call(this, p, true);
  	}

  });


  // @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
  function polygon(latlngs, options) {
  	return new Polygon(latlngs, options);
  }

  /*
   * @class GeoJSON
   * @aka L.GeoJSON
   * @inherits FeatureGroup
   *
   * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
   * GeoJSON data and display it on the map. Extends `FeatureGroup`.
   *
   * @example
   *
   * ```js
   * L.geoJSON(data, {
   * 	style: function (feature) {
   * 		return {color: feature.properties.color};
   * 	}
   * }).bindPopup(function (layer) {
   * 	return layer.feature.properties.description;
   * }).addTo(map);
   * ```
   */

  var GeoJSON = FeatureGroup.extend({

  	/* @section
  	 * @aka GeoJSON options
  	 *
  	 * @option pointToLayer: Function = *
  	 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
  	 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
  	 * The default is to spawn a default `Marker`:
  	 * ```js
  	 * function(geoJsonPoint, latlng) {
  	 * 	return L.marker(latlng);
  	 * }
  	 * ```
  	 *
  	 * @option style: Function = *
  	 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
  	 * called internally when data is added.
  	 * The default value is to not override any defaults:
  	 * ```js
  	 * function (geoJsonFeature) {
  	 * 	return {}
  	 * }
  	 * ```
  	 *
  	 * @option onEachFeature: Function = *
  	 * A `Function` that will be called once for each created `Feature`, after it has
  	 * been created and styled. Useful for attaching events and popups to features.
  	 * The default is to do nothing with the newly created layers:
  	 * ```js
  	 * function (feature, layer) {}
  	 * ```
  	 *
  	 * @option filter: Function = *
  	 * A `Function` that will be used to decide whether to include a feature or not.
  	 * The default is to include all features:
  	 * ```js
  	 * function (geoJsonFeature) {
  	 * 	return true;
  	 * }
  	 * ```
  	 * Note: dynamically changing the `filter` option will have effect only on newly
  	 * added data. It will _not_ re-evaluate already included features.
  	 *
  	 * @option coordsToLatLng: Function = *
  	 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
  	 * The default is the `coordsToLatLng` static method.
  	 *
  	 * @option markersInheritOptions: Boolean = false
  	 * Whether default Markers for "Point" type Features inherit from group options.
  	 */

  	initialize: function (geojson, options) {
  		setOptions(this, options);

  		this._layers = {};

  		if (geojson) {
  			this.addData(geojson);
  		}
  	},

  	// @method addData( <GeoJSON> data ): this
  	// Adds a GeoJSON object to the layer.
  	addData: function (geojson) {
  		var features = isArray(geojson) ? geojson : geojson.features,
  		    i, len, feature;

  		if (features) {
  			for (i = 0, len = features.length; i < len; i++) {
  				// only add this if geometry or geometries are set and not null
  				feature = features[i];
  				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
  					this.addData(feature);
  				}
  			}
  			return this;
  		}

  		var options = this.options;

  		if (options.filter && !options.filter(geojson)) { return this; }

  		var layer = geometryToLayer(geojson, options);
  		if (!layer) {
  			return this;
  		}
  		layer.feature = asFeature(geojson);

  		layer.defaultOptions = layer.options;
  		this.resetStyle(layer);

  		if (options.onEachFeature) {
  			options.onEachFeature(geojson, layer);
  		}

  		return this.addLayer(layer);
  	},

  	// @method resetStyle( <Path> layer? ): this
  	// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
  	// If `layer` is omitted, the style of all features in the current layer is reset.
  	resetStyle: function (layer) {
  		if (layer === undefined) {
  			return this.eachLayer(this.resetStyle, this);
  		}
  		// reset any custom styles
  		layer.options = extend({}, layer.defaultOptions);
  		this._setLayerStyle(layer, this.options.style);
  		return this;
  	},

  	// @method setStyle( <Function> style ): this
  	// Changes styles of GeoJSON vector layers with the given style function.
  	setStyle: function (style) {
  		return this.eachLayer(function (layer) {
  			this._setLayerStyle(layer, style);
  		}, this);
  	},

  	_setLayerStyle: function (layer, style) {
  		if (layer.setStyle) {
  			if (typeof style === 'function') {
  				style = style(layer.feature);
  			}
  			layer.setStyle(style);
  		}
  	}
  });

  // @section
  // There are several static functions which can be called without instantiating L.GeoJSON:

  // @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
  // Creates a `Layer` from a given GeoJSON feature. Can use a custom
  // [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
  // functions if provided as options.
  function geometryToLayer(geojson, options) {

  	var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
  	    coords = geometry ? geometry.coordinates : null,
  	    layers = [],
  	    pointToLayer = options && options.pointToLayer,
  	    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
  	    latlng, latlngs, i, len;

  	if (!coords && !geometry) {
  		return null;
  	}

  	switch (geometry.type) {
  	case 'Point':
  		latlng = _coordsToLatLng(coords);
  		return _pointToLayer(pointToLayer, geojson, latlng, options);

  	case 'MultiPoint':
  		for (i = 0, len = coords.length; i < len; i++) {
  			latlng = _coordsToLatLng(coords[i]);
  			layers.push(_pointToLayer(pointToLayer, geojson, latlng, options));
  		}
  		return new FeatureGroup(layers);

  	case 'LineString':
  	case 'MultiLineString':
  		latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
  		return new Polyline(latlngs, options);

  	case 'Polygon':
  	case 'MultiPolygon':
  		latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
  		return new Polygon(latlngs, options);

  	case 'GeometryCollection':
  		for (i = 0, len = geometry.geometries.length; i < len; i++) {
  			var geoLayer = geometryToLayer({
  				geometry: geometry.geometries[i],
  				type: 'Feature',
  				properties: geojson.properties
  			}, options);

  			if (geoLayer) {
  				layers.push(geoLayer);
  			}
  		}
  		return new FeatureGroup(layers);

  	case 'FeatureCollection':
  		for (i = 0, len = geometry.features.length; i < len; i++) {
  			var featureLayer = geometryToLayer(geometry.features[i], options);

  			if (featureLayer) {
  				layers.push(featureLayer);
  			}
  		}
  		return new FeatureGroup(layers);

  	default:
  		throw new Error('Invalid GeoJSON object.');
  	}
  }

  function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
  	return pointToLayerFn ?
  		pointToLayerFn(geojson, latlng) :
  		new Marker(latlng, options && options.markersInheritOptions && options);
  }

  // @function coordsToLatLng(coords: Array): LatLng
  // Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
  // or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
  function coordsToLatLng(coords) {
  	return new LatLng(coords[1], coords[0], coords[2]);
  }

  // @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
  // Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
  // `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
  // Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
  function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
  	var latlngs = [];

  	for (var i = 0, len = coords.length, latlng; i < len; i++) {
  		latlng = levelsDeep ?
  			coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
  			(_coordsToLatLng || coordsToLatLng)(coords[i]);

  		latlngs.push(latlng);
  	}

  	return latlngs;
  }

  // @function latLngToCoords(latlng: LatLng, precision?: Number|false): Array
  // Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
  // Coordinates values are rounded with [`formatNum`](#util-formatnum) function.
  function latLngToCoords(latlng, precision) {
  	latlng = toLatLng(latlng);
  	return latlng.alt !== undefined ?
  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
  }

  // @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean, precision?: Number|false): Array
  // Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
  // `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
  // Coordinates values are rounded with [`formatNum`](#util-formatnum) function.
  function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
  	var coords = [];

  	for (var i = 0, len = latlngs.length; i < len; i++) {
  		// Check for flat arrays required to ensure unbalanced arrays are correctly converted in recursion
  		coords.push(levelsDeep ?
  			latLngsToCoords(latlngs[i], isFlat(latlngs[i]) ? 0 : levelsDeep - 1, closed, precision) :
  			latLngToCoords(latlngs[i], precision));
  	}

  	if (!levelsDeep && closed && coords.length > 0) {
  		coords.push(coords[0].slice());
  	}

  	return coords;
  }

  function getFeature(layer, newGeometry) {
  	return layer.feature ?
  		extend({}, layer.feature, {geometry: newGeometry}) :
  		asFeature(newGeometry);
  }

  // @function asFeature(geojson: Object): Object
  // Normalize GeoJSON geometries/features into GeoJSON features.
  function asFeature(geojson) {
  	if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
  		return geojson;
  	}

  	return {
  		type: 'Feature',
  		properties: {},
  		geometry: geojson
  	};
  }

  var PointToGeoJSON = {
  	toGeoJSON: function (precision) {
  		return getFeature(this, {
  			type: 'Point',
  			coordinates: latLngToCoords(this.getLatLng(), precision)
  		});
  	}
  };

  // @namespace Marker
  // @section Other methods
  // @method toGeoJSON(precision?: Number|false): Object
  // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
  // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
  Marker.include(PointToGeoJSON);

  // @namespace CircleMarker
  // @method toGeoJSON(precision?: Number|false): Object
  // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
  // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
  Circle.include(PointToGeoJSON);
  CircleMarker.include(PointToGeoJSON);


  // @namespace Polyline
  // @method toGeoJSON(precision?: Number|false): Object
  // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
  // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
  Polyline.include({
  	toGeoJSON: function (precision) {
  		var multi = !isFlat(this._latlngs);

  		var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

  		return getFeature(this, {
  			type: (multi ? 'Multi' : '') + 'LineString',
  			coordinates: coords
  		});
  	}
  });

  // @namespace Polygon
  // @method toGeoJSON(precision?: Number|false): Object
  // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
  // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
  Polygon.include({
  	toGeoJSON: function (precision) {
  		var holes = !isFlat(this._latlngs),
  		    multi = holes && !isFlat(this._latlngs[0]);

  		var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

  		if (!holes) {
  			coords = [coords];
  		}

  		return getFeature(this, {
  			type: (multi ? 'Multi' : '') + 'Polygon',
  			coordinates: coords
  		});
  	}
  });


  // @namespace LayerGroup
  LayerGroup.include({
  	toMultiPoint: function (precision) {
  		var coords = [];

  		this.eachLayer(function (layer) {
  			coords.push(layer.toGeoJSON(precision).geometry.coordinates);
  		});

  		return getFeature(this, {
  			type: 'MultiPoint',
  			coordinates: coords
  		});
  	},

  	// @method toGeoJSON(precision?: Number|false): Object
  	// Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
  	// Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
  	toGeoJSON: function (precision) {

  		var type = this.feature && this.feature.geometry && this.feature.geometry.type;

  		if (type === 'MultiPoint') {
  			return this.toMultiPoint(precision);
  		}

  		var isGeometryCollection = type === 'GeometryCollection',
  		    jsons = [];

  		this.eachLayer(function (layer) {
  			if (layer.toGeoJSON) {
  				var json = layer.toGeoJSON(precision);
  				if (isGeometryCollection) {
  					jsons.push(json.geometry);
  				} else {
  					var feature = asFeature(json);
  					// Squash nested feature collections
  					if (feature.type === 'FeatureCollection') {
  						jsons.push.apply(jsons, feature.features);
  					} else {
  						jsons.push(feature);
  					}
  				}
  			}
  		});

  		if (isGeometryCollection) {
  			return getFeature(this, {
  				geometries: jsons,
  				type: 'GeometryCollection'
  			});
  		}

  		return {
  			type: 'FeatureCollection',
  			features: jsons
  		};
  	}
  });

  // @namespace GeoJSON
  // @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
  // Creates a GeoJSON layer. Optionally accepts an object in
  // [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
  // (you can alternatively add it later with `addData` method) and an `options` object.
  function geoJSON(geojson, options) {
  	return new GeoJSON(geojson, options);
  }

  // Backward compatibility.
  var geoJson = geoJSON;

  /*
   * @class ImageOverlay
   * @aka L.ImageOverlay
   * @inherits Interactive layer
   *
   * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * var imageUrl = 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
   * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
   * L.imageOverlay(imageUrl, imageBounds).addTo(map);
   * ```
   */

  var ImageOverlay = Layer.extend({

  	// @section
  	// @aka ImageOverlay options
  	options: {
  		// @option opacity: Number = 1.0
  		// The opacity of the image overlay.
  		opacity: 1,

  		// @option alt: String = ''
  		// Text for the `alt` attribute of the image (useful for accessibility).
  		alt: '',

  		// @option interactive: Boolean = false
  		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
  		interactive: false,

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the image.
  		// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false,

  		// @option errorOverlayUrl: String = ''
  		// URL to the overlay image to show in place of the overlay that failed to load.
  		errorOverlayUrl: '',

  		// @option zIndex: Number = 1
  		// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
  		zIndex: 1,

  		// @option className: String = ''
  		// A custom class name to assign to the image. Empty by default.
  		className: ''
  	},

  	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
  		this._url = url;
  		this._bounds = toLatLngBounds(bounds);

  		setOptions(this, options);
  	},

  	onAdd: function () {
  		if (!this._image) {
  			this._initImage();

  			if (this.options.opacity < 1) {
  				this._updateOpacity();
  			}
  		}

  		if (this.options.interactive) {
  			addClass(this._image, 'leaflet-interactive');
  			this.addInteractiveTarget(this._image);
  		}

  		this.getPane().appendChild(this._image);
  		this._reset();
  	},

  	onRemove: function () {
  		remove(this._image);
  		if (this.options.interactive) {
  			this.removeInteractiveTarget(this._image);
  		}
  	},

  	// @method setOpacity(opacity: Number): this
  	// Sets the opacity of the overlay.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;

  		if (this._image) {
  			this._updateOpacity();
  		}
  		return this;
  	},

  	setStyle: function (styleOpts) {
  		if (styleOpts.opacity) {
  			this.setOpacity(styleOpts.opacity);
  		}
  		return this;
  	},

  	// @method bringToFront(): this
  	// Brings the layer to the top of all overlays.
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._image);
  		}
  		return this;
  	},

  	// @method bringToBack(): this
  	// Brings the layer to the bottom of all overlays.
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._image);
  		}
  		return this;
  	},

  	// @method setUrl(url: String): this
  	// Changes the URL of the image.
  	setUrl: function (url) {
  		this._url = url;

  		if (this._image) {
  			this._image.src = url;
  		}
  		return this;
  	},

  	// @method setBounds(bounds: LatLngBounds): this
  	// Update the bounds that this ImageOverlay covers
  	setBounds: function (bounds) {
  		this._bounds = toLatLngBounds(bounds);

  		if (this._map) {
  			this._reset();
  		}
  		return this;
  	},

  	getEvents: function () {
  		var events = {
  			zoom: this._reset,
  			viewreset: this._reset
  		};

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}

  		return events;
  	},

  	// @method setZIndex(value: Number): this
  	// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
  	setZIndex: function (value) {
  		this.options.zIndex = value;
  		this._updateZIndex();
  		return this;
  	},

  	// @method getBounds(): LatLngBounds
  	// Get the bounds that this ImageOverlay covers
  	getBounds: function () {
  		return this._bounds;
  	},

  	// @method getElement(): HTMLElement
  	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
  	// used by this overlay.
  	getElement: function () {
  		return this._image;
  	},

  	_initImage: function () {
  		var wasElementSupplied = this._url.tagName === 'IMG';
  		var img = this._image = wasElementSupplied ? this._url : create$1('img');

  		addClass(img, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(img, this.options.className); }

  		img.onselectstart = falseFn;
  		img.onmousemove = falseFn;

  		// @event load: Event
  		// Fired when the ImageOverlay layer has loaded its image
  		img.onload = bind(this.fire, this, 'load');
  		img.onerror = bind(this._overlayOnError, this, 'error');

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		if (this.options.zIndex) {
  			this._updateZIndex();
  		}

  		if (wasElementSupplied) {
  			this._url = img.src;
  			return;
  		}

  		img.src = this._url;
  		img.alt = this.options.alt;
  	},

  	_animateZoom: function (e) {
  		var scale = this._map.getZoomScale(e.zoom),
  		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

  		setTransform(this._image, offset, scale);
  	},

  	_reset: function () {
  		var image = this._image,
  		    bounds = new Bounds(
  		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
  		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
  		    size = bounds.getSize();

  		setPosition(image, bounds.min);

  		image.style.width  = size.x + 'px';
  		image.style.height = size.y + 'px';
  	},

  	_updateOpacity: function () {
  		setOpacity(this._image, this.options.opacity);
  	},

  	_updateZIndex: function () {
  		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
  			this._image.style.zIndex = this.options.zIndex;
  		}
  	},

  	_overlayOnError: function () {
  		// @event error: Event
  		// Fired when the ImageOverlay layer fails to load its image
  		this.fire('error');

  		var errorUrl = this.options.errorOverlayUrl;
  		if (errorUrl && this._url !== errorUrl) {
  			this._url = errorUrl;
  			this._image.src = errorUrl;
  		}
  	},

  	// @method getCenter(): LatLng
  	// Returns the center of the ImageOverlay.
  	getCenter: function () {
  		return this._bounds.getCenter();
  	}
  });

  // @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
  // Instantiates an image overlay object given the URL of the image and the
  // geographical bounds it is tied to.
  var imageOverlay = function (url, bounds, options) {
  	return new ImageOverlay(url, bounds, options);
  };

  /*
   * @class VideoOverlay
   * @aka L.VideoOverlay
   * @inherits ImageOverlay
   *
   * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
   *
   * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
   * HTML5 element.
   *
   * @example
   *
   * ```js
   * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
   * 	videoBounds = [[ 32, -130], [ 13, -100]];
   * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
   * ```
   */

  var VideoOverlay = ImageOverlay.extend({

  	// @section
  	// @aka VideoOverlay options
  	options: {
  		// @option autoplay: Boolean = true
  		// Whether the video starts playing automatically when loaded.
  		// On some browsers autoplay will only work with `muted: true`
  		autoplay: true,

  		// @option loop: Boolean = true
  		// Whether the video will loop back to the beginning when played.
  		loop: true,

  		// @option keepAspectRatio: Boolean = true
  		// Whether the video will save aspect ratio after the projection.
  		// Relevant for supported browsers. See [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
  		keepAspectRatio: true,

  		// @option muted: Boolean = false
  		// Whether the video starts on mute when loaded.
  		muted: false,

  		// @option playsInline: Boolean = true
  		// Mobile browsers will play the video right where it is instead of open it up in fullscreen mode.
  		playsInline: true
  	},

  	_initImage: function () {
  		var wasElementSupplied = this._url.tagName === 'VIDEO';
  		var vid = this._image = wasElementSupplied ? this._url : create$1('video');

  		addClass(vid, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(vid, this.options.className); }

  		vid.onselectstart = falseFn;
  		vid.onmousemove = falseFn;

  		// @event load: Event
  		// Fired when the video has finished loading the first frame
  		vid.onloadeddata = bind(this.fire, this, 'load');

  		if (wasElementSupplied) {
  			var sourceElements = vid.getElementsByTagName('source');
  			var sources = [];
  			for (var j = 0; j < sourceElements.length; j++) {
  				sources.push(sourceElements[j].src);
  			}

  			this._url = (sourceElements.length > 0) ? sources : [vid.src];
  			return;
  		}

  		if (!isArray(this._url)) { this._url = [this._url]; }

  		if (!this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(vid.style, 'objectFit')) {
  			vid.style['objectFit'] = 'fill';
  		}
  		vid.autoplay = !!this.options.autoplay;
  		vid.loop = !!this.options.loop;
  		vid.muted = !!this.options.muted;
  		vid.playsInline = !!this.options.playsInline;
  		for (var i = 0; i < this._url.length; i++) {
  			var source = create$1('source');
  			source.src = this._url[i];
  			vid.appendChild(source);
  		}
  	}

  	// @method getElement(): HTMLVideoElement
  	// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
  	// used by this overlay.
  });


  // @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
  // Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
  // geographical bounds it is tied to.

  function videoOverlay(video, bounds, options) {
  	return new VideoOverlay(video, bounds, options);
  }

  /*
   * @class SVGOverlay
   * @aka L.SVGOverlay
   * @inherits ImageOverlay
   *
   * Used to load, display and provide DOM access to an SVG file over specific bounds of the map. Extends `ImageOverlay`.
   *
   * An SVG overlay uses the [`<svg>`](https://developer.mozilla.org/docs/Web/SVG/Element/svg) element.
   *
   * @example
   *
   * ```js
   * var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
   * svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
   * svgElement.setAttribute('viewBox', "0 0 200 200");
   * svgElement.innerHTML = '<rect width="200" height="200"/><rect x="75" y="23" width="50" height="50" style="fill:red"/><rect x="75" y="123" width="50" height="50" style="fill:#0013ff"/>';
   * var svgElementBounds = [ [ 32, -130 ], [ 13, -100 ] ];
   * L.svgOverlay(svgElement, svgElementBounds).addTo(map);
   * ```
   */

  var SVGOverlay = ImageOverlay.extend({
  	_initImage: function () {
  		var el = this._image = this._url;

  		addClass(el, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(el, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(el, this.options.className); }

  		el.onselectstart = falseFn;
  		el.onmousemove = falseFn;
  	}

  	// @method getElement(): SVGElement
  	// Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
  	// used by this overlay.
  });


  // @factory L.svgOverlay(svg: String|SVGElement, bounds: LatLngBounds, options?: SVGOverlay options)
  // Instantiates an image overlay object given an SVG element and the geographical bounds it is tied to.
  // A viewBox attribute is required on the SVG element to zoom in and out properly.

  function svgOverlay(el, bounds, options) {
  	return new SVGOverlay(el, bounds, options);
  }

  /*
   * @class DivOverlay
   * @inherits Interactive layer
   * @aka L.DivOverlay
   * Base model for L.Popup and L.Tooltip. Inherit from it for custom overlays like plugins.
   */

  // @namespace DivOverlay
  var DivOverlay = Layer.extend({

  	// @section
  	// @aka DivOverlay options
  	options: {
  		// @option interactive: Boolean = false
  		// If true, the popup/tooltip will listen to the mouse events.
  		interactive: false,

  		// @option offset: Point = Point(0, 0)
  		// The offset of the overlay position.
  		offset: [0, 0],

  		// @option className: String = ''
  		// A custom CSS class name to assign to the overlay.
  		className: '',

  		// @option pane: String = undefined
  		// `Map pane` where the overlay will be added.
  		pane: undefined,

  		// @option content: String|HTMLElement|Function = ''
  		// Sets the HTML content of the overlay while initializing. If a function is passed the source layer will be
  		// passed to the function. The function should return a `String` or `HTMLElement` to be used in the overlay.
  		content: ''
  	},

  	initialize: function (options, source) {
  		if (options && (options instanceof LatLng || isArray(options))) {
  			this._latlng = toLatLng(options);
  			setOptions(this, source);
  		} else {
  			setOptions(this, options);
  			this._source = source;
  		}
  		if (this.options.content) {
  			this._content = this.options.content;
  		}
  	},

  	// @method openOn(map: Map): this
  	// Adds the overlay to the map.
  	// Alternative to `map.openPopup(popup)`/`.openTooltip(tooltip)`.
  	openOn: function (map) {
  		map = arguments.length ? map : this._source._map; // experimental, not the part of public api
  		if (!map.hasLayer(this)) {
  			map.addLayer(this);
  		}
  		return this;
  	},

  	// @method close(): this
  	// Closes the overlay.
  	// Alternative to `map.closePopup(popup)`/`.closeTooltip(tooltip)`
  	// and `layer.closePopup()`/`.closeTooltip()`.
  	close: function () {
  		if (this._map) {
  			this._map.removeLayer(this);
  		}
  		return this;
  	},

  	// @method toggle(layer?: Layer): this
  	// Opens or closes the overlay bound to layer depending on its current state.
  	// Argument may be omitted only for overlay bound to layer.
  	// Alternative to `layer.togglePopup()`/`.toggleTooltip()`.
  	toggle: function (layer) {
  		if (this._map) {
  			this.close();
  		} else {
  			if (arguments.length) {
  				this._source = layer;
  			} else {
  				layer = this._source;
  			}
  			this._prepareOpen();

  			// open the overlay on the map
  			this.openOn(layer._map);
  		}
  		return this;
  	},

  	onAdd: function (map) {
  		this._zoomAnimated = map._zoomAnimated;

  		if (!this._container) {
  			this._initLayout();
  		}

  		if (map._fadeAnimated) {
  			setOpacity(this._container, 0);
  		}

  		clearTimeout(this._removeTimeout);
  		this.getPane().appendChild(this._container);
  		this.update();

  		if (map._fadeAnimated) {
  			setOpacity(this._container, 1);
  		}

  		this.bringToFront();

  		if (this.options.interactive) {
  			addClass(this._container, 'leaflet-interactive');
  			this.addInteractiveTarget(this._container);
  		}
  	},

  	onRemove: function (map) {
  		if (map._fadeAnimated) {
  			setOpacity(this._container, 0);
  			this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
  		} else {
  			remove(this._container);
  		}

  		if (this.options.interactive) {
  			removeClass(this._container, 'leaflet-interactive');
  			this.removeInteractiveTarget(this._container);
  		}
  	},

  	// @namespace DivOverlay
  	// @method getLatLng: LatLng
  	// Returns the geographical point of the overlay.
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setLatLng(latlng: LatLng): this
  	// Sets the geographical point where the overlay will open.
  	setLatLng: function (latlng) {
  		this._latlng = toLatLng(latlng);
  		if (this._map) {
  			this._updatePosition();
  			this._adjustPan();
  		}
  		return this;
  	},

  	// @method getContent: String|HTMLElement
  	// Returns the content of the overlay.
  	getContent: function () {
  		return this._content;
  	},

  	// @method setContent(htmlContent: String|HTMLElement|Function): this
  	// Sets the HTML content of the overlay. If a function is passed the source layer will be passed to the function.
  	// The function should return a `String` or `HTMLElement` to be used in the overlay.
  	setContent: function (content) {
  		this._content = content;
  		this.update();
  		return this;
  	},

  	// @method getElement: String|HTMLElement
  	// Returns the HTML container of the overlay.
  	getElement: function () {
  		return this._container;
  	},

  	// @method update: null
  	// Updates the overlay content, layout and position. Useful for updating the overlay after something inside changed, e.g. image loaded.
  	update: function () {
  		if (!this._map) { return; }

  		this._container.style.visibility = 'hidden';

  		this._updateContent();
  		this._updateLayout();
  		this._updatePosition();

  		this._container.style.visibility = '';

  		this._adjustPan();
  	},

  	getEvents: function () {
  		var events = {
  			zoom: this._updatePosition,
  			viewreset: this._updatePosition
  		};

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}
  		return events;
  	},

  	// @method isOpen: Boolean
  	// Returns `true` when the overlay is visible on the map.
  	isOpen: function () {
  		return !!this._map && this._map.hasLayer(this);
  	},

  	// @method bringToFront: this
  	// Brings this overlay in front of other overlays (in the same map pane).
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._container);
  		}
  		return this;
  	},

  	// @method bringToBack: this
  	// Brings this overlay to the back of other overlays (in the same map pane).
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._container);
  		}
  		return this;
  	},

  	// prepare bound overlay to open: update latlng pos / content source (for FeatureGroup)
  	_prepareOpen: function (latlng) {
  		var source = this._source;
  		if (!source._map) { return false; }

  		if (source instanceof FeatureGroup) {
  			source = null;
  			var layers = this._source._layers;
  			for (var id in layers) {
  				if (layers[id]._map) {
  					source = layers[id];
  					break;
  				}
  			}
  			if (!source) { return false; } // Unable to get source layer.

  			// set overlay source to this layer
  			this._source = source;
  		}

  		if (!latlng) {
  			if (source.getCenter) {
  				latlng = source.getCenter();
  			} else if (source.getLatLng) {
  				latlng = source.getLatLng();
  			} else if (source.getBounds) {
  				latlng = source.getBounds().getCenter();
  			} else {
  				throw new Error('Unable to get source layer LatLng.');
  			}
  		}
  		this.setLatLng(latlng);

  		if (this._map) {
  			// update the overlay (content, layout, etc...)
  			this.update();
  		}

  		return true;
  	},

  	_updateContent: function () {
  		if (!this._content) { return; }

  		var node = this._contentNode;
  		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

  		if (typeof content === 'string') {
  			node.innerHTML = content;
  		} else {
  			while (node.hasChildNodes()) {
  				node.removeChild(node.firstChild);
  			}
  			node.appendChild(content);
  		}

  		// @namespace DivOverlay
  		// @section DivOverlay events
  		// @event contentupdate: Event
  		// Fired when the content of the overlay is updated
  		this.fire('contentupdate');
  	},

  	_updatePosition: function () {
  		if (!this._map) { return; }

  		var pos = this._map.latLngToLayerPoint(this._latlng),
  		    offset = toPoint(this.options.offset),
  		    anchor = this._getAnchor();

  		if (this._zoomAnimated) {
  			setPosition(this._container, pos.add(anchor));
  		} else {
  			offset = offset.add(pos).add(anchor);
  		}

  		var bottom = this._containerBottom = -offset.y,
  		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

  		// bottom position the overlay in case the height of the overlay changes (images loading etc)
  		this._container.style.bottom = bottom + 'px';
  		this._container.style.left = left + 'px';
  	},

  	_getAnchor: function () {
  		return [0, 0];
  	}

  });

  Map$1.include({
  	_initOverlay: function (OverlayClass, content, latlng, options) {
  		var overlay = content;
  		if (!(overlay instanceof OverlayClass)) {
  			overlay = new OverlayClass(options).setContent(content);
  		}
  		if (latlng) {
  			overlay.setLatLng(latlng);
  		}
  		return overlay;
  	}
  });


  Layer.include({
  	_initOverlay: function (OverlayClass, old, content, options) {
  		var overlay = content;
  		if (overlay instanceof OverlayClass) {
  			setOptions(overlay, options);
  			overlay._source = this;
  		} else {
  			overlay = (old && !options) ? old : new OverlayClass(options, this);
  			overlay.setContent(content);
  		}
  		return overlay;
  	}
  });

  /*
   * @class Popup
   * @inherits DivOverlay
   * @aka L.Popup
   * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
   * open popups while making sure that only one popup is open at one time
   * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
   *
   * @example
   *
   * If you want to just bind a popup to marker click and then open it, it's really easy:
   *
   * ```js
   * marker.bindPopup(popupContent).openPopup();
   * ```
   * Path overlays like polylines also have a `bindPopup` method.
   *
   * A popup can be also standalone:
   *
   * ```js
   * var popup = L.popup()
   * 	.setLatLng(latlng)
   * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
   * 	.openOn(map);
   * ```
   * or
   * ```js
   * var popup = L.popup(latlng, {content: '<p>Hello world!<br />This is a nice popup.</p>')
   * 	.openOn(map);
   * ```
   */


  // @namespace Popup
  var Popup = DivOverlay.extend({

  	// @section
  	// @aka Popup options
  	options: {
  		// @option pane: String = 'popupPane'
  		// `Map pane` where the popup will be added.
  		pane: 'popupPane',

  		// @option offset: Point = Point(0, 7)
  		// The offset of the popup position.
  		offset: [0, 7],

  		// @option maxWidth: Number = 300
  		// Max width of the popup, in pixels.
  		maxWidth: 300,

  		// @option minWidth: Number = 50
  		// Min width of the popup, in pixels.
  		minWidth: 50,

  		// @option maxHeight: Number = null
  		// If set, creates a scrollable container of the given height
  		// inside a popup if its content exceeds it.
  		// The scrollable container can be styled using the
  		// `leaflet-popup-scrolled` CSS class selector.
  		maxHeight: null,

  		// @option autoPan: Boolean = true
  		// Set it to `false` if you don't want the map to do panning animation
  		// to fit the opened popup.
  		autoPan: true,

  		// @option autoPanPaddingTopLeft: Point = null
  		// The margin between the popup and the top left corner of the map
  		// view after autopanning was performed.
  		autoPanPaddingTopLeft: null,

  		// @option autoPanPaddingBottomRight: Point = null
  		// The margin between the popup and the bottom right corner of the map
  		// view after autopanning was performed.
  		autoPanPaddingBottomRight: null,

  		// @option autoPanPadding: Point = Point(5, 5)
  		// Equivalent of setting both top left and bottom right autopan padding to the same value.
  		autoPanPadding: [5, 5],

  		// @option keepInView: Boolean = false
  		// Set it to `true` if you want to prevent users from panning the popup
  		// off of the screen while it is open.
  		keepInView: false,

  		// @option closeButton: Boolean = true
  		// Controls the presence of a close button in the popup.
  		closeButton: true,

  		// @option autoClose: Boolean = true
  		// Set it to `false` if you want to override the default behavior of
  		// the popup closing when another popup is opened.
  		autoClose: true,

  		// @option closeOnEscapeKey: Boolean = true
  		// Set it to `false` if you want to override the default behavior of
  		// the ESC key for closing of the popup.
  		closeOnEscapeKey: true,

  		// @option closeOnClick: Boolean = *
  		// Set it if you want to override the default behavior of the popup closing when user clicks
  		// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

  		// @option className: String = ''
  		// A custom CSS class name to assign to the popup.
  		className: ''
  	},

  	// @namespace Popup
  	// @method openOn(map: Map): this
  	// Alternative to `map.openPopup(popup)`.
  	// Adds the popup to the map and closes the previous one.
  	openOn: function (map) {
  		map = arguments.length ? map : this._source._map; // experimental, not the part of public api

  		if (!map.hasLayer(this) && map._popup && map._popup.options.autoClose) {
  			map.removeLayer(map._popup);
  		}
  		map._popup = this;

  		return DivOverlay.prototype.openOn.call(this, map);
  	},

  	onAdd: function (map) {
  		DivOverlay.prototype.onAdd.call(this, map);

  		// @namespace Map
  		// @section Popup events
  		// @event popupopen: PopupEvent
  		// Fired when a popup is opened in the map
  		map.fire('popupopen', {popup: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Popup events
  			// @event popupopen: PopupEvent
  			// Fired when a popup bound to this layer is opened
  			this._source.fire('popupopen', {popup: this}, true);
  			// For non-path layers, we toggle the popup when clicking
  			// again the layer, so prevent the map to reopen it.
  			if (!(this._source instanceof Path)) {
  				this._source.on('preclick', stopPropagation);
  			}
  		}
  	},

  	onRemove: function (map) {
  		DivOverlay.prototype.onRemove.call(this, map);

  		// @namespace Map
  		// @section Popup events
  		// @event popupclose: PopupEvent
  		// Fired when a popup in the map is closed
  		map.fire('popupclose', {popup: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Popup events
  			// @event popupclose: PopupEvent
  			// Fired when a popup bound to this layer is closed
  			this._source.fire('popupclose', {popup: this}, true);
  			if (!(this._source instanceof Path)) {
  				this._source.off('preclick', stopPropagation);
  			}
  		}
  	},

  	getEvents: function () {
  		var events = DivOverlay.prototype.getEvents.call(this);

  		if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
  			events.preclick = this.close;
  		}

  		if (this.options.keepInView) {
  			events.moveend = this._adjustPan;
  		}

  		return events;
  	},

  	_initLayout: function () {
  		var prefix = 'leaflet-popup',
  		    container = this._container = create$1('div',
  			prefix + ' ' + (this.options.className || '') +
  			' leaflet-zoom-animated');

  		var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
  		this._contentNode = create$1('div', prefix + '-content', wrapper);

  		disableClickPropagation(container);
  		disableScrollPropagation(this._contentNode);
  		on(container, 'contextmenu', stopPropagation);

  		this._tipContainer = create$1('div', prefix + '-tip-container', container);
  		this._tip = create$1('div', prefix + '-tip', this._tipContainer);

  		if (this.options.closeButton) {
  			var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
  			closeButton.setAttribute('role', 'button'); // overrides the implicit role=link of <a> elements #7399
  			closeButton.setAttribute('aria-label', 'Close popup');
  			closeButton.href = '#close';
  			closeButton.innerHTML = '<span aria-hidden="true">&#215;</span>';

  			on(closeButton, 'click', function (ev) {
  				preventDefault(ev);
  				this.close();
  			}, this);
  		}
  	},

  	_updateLayout: function () {
  		var container = this._contentNode,
  		    style = container.style;

  		style.width = '';
  		style.whiteSpace = 'nowrap';

  		var width = container.offsetWidth;
  		width = Math.min(width, this.options.maxWidth);
  		width = Math.max(width, this.options.minWidth);

  		style.width = (width + 1) + 'px';
  		style.whiteSpace = '';

  		style.height = '';

  		var height = container.offsetHeight,
  		    maxHeight = this.options.maxHeight,
  		    scrolledClass = 'leaflet-popup-scrolled';

  		if (maxHeight && height > maxHeight) {
  			style.height = maxHeight + 'px';
  			addClass(container, scrolledClass);
  		} else {
  			removeClass(container, scrolledClass);
  		}

  		this._containerWidth = this._container.offsetWidth;
  	},

  	_animateZoom: function (e) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
  		    anchor = this._getAnchor();
  		setPosition(this._container, pos.add(anchor));
  	},

  	_adjustPan: function () {
  		if (!this.options.autoPan) { return; }
  		if (this._map._panAnim) { this._map._panAnim.stop(); }

  		// We can endlessly recurse if keepInView is set and the view resets.
  		// Let's guard against that by exiting early if we're responding to our own autopan.
  		if (this._autopanning) {
  			this._autopanning = false;
  			return;
  		}

  		var map = this._map,
  		    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
  		    containerHeight = this._container.offsetHeight + marginBottom,
  		    containerWidth = this._containerWidth,
  		    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

  		layerPos._add(getPosition(this._container));

  		var containerPos = map.layerPointToContainerPoint(layerPos),
  		    padding = toPoint(this.options.autoPanPadding),
  		    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
  		    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
  		    size = map.getSize(),
  		    dx = 0,
  		    dy = 0;

  		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
  			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
  		}
  		if (containerPos.x - dx - paddingTL.x < 0) { // left
  			dx = containerPos.x - paddingTL.x;
  		}
  		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
  			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
  		}
  		if (containerPos.y - dy - paddingTL.y < 0) { // top
  			dy = containerPos.y - paddingTL.y;
  		}

  		// @namespace Map
  		// @section Popup events
  		// @event autopanstart: Event
  		// Fired when the map starts autopanning when opening a popup.
  		if (dx || dy) {
  			// Track that we're autopanning, as this function will be re-ran on moveend
  			if (this.options.keepInView) {
  				this._autopanning = true;
  			}

  			map
  			    .fire('autopanstart')
  			    .panBy([dx, dy]);
  		}
  	},

  	_getAnchor: function () {
  		// Where should we anchor the popup on the source layer?
  		return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
  	}

  });

  // @namespace Popup
  // @factory L.popup(options?: Popup options, source?: Layer)
  // Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
  // @alternative
  // @factory L.popup(latlng: LatLng, options?: Popup options)
  // Instantiates a `Popup` object given `latlng` where the popup will open and an optional `options` object that describes its appearance and location.
  var popup = function (options, source) {
  	return new Popup(options, source);
  };


  /* @namespace Map
   * @section Interaction Options
   * @option closePopupOnClick: Boolean = true
   * Set it to `false` if you don't want popups to close when user clicks the map.
   */
  Map$1.mergeOptions({
  	closePopupOnClick: true
  });


  // @namespace Map
  // @section Methods for Layers and Controls
  Map$1.include({
  	// @method openPopup(popup: Popup): this
  	// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
  	// @alternative
  	// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
  	// Creates a popup with the specified content and options and opens it in the given point on a map.
  	openPopup: function (popup, latlng, options) {
  		this._initOverlay(Popup, popup, latlng, options)
  		  .openOn(this);

  		return this;
  	},

  	// @method closePopup(popup?: Popup): this
  	// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
  	closePopup: function (popup) {
  		popup = arguments.length ? popup : this._popup;
  		if (popup) {
  			popup.close();
  		}
  		return this;
  	}
  });

  /*
   * @namespace Layer
   * @section Popup methods example
   *
   * All layers share a set of methods convenient for binding popups to it.
   *
   * ```js
   * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
   * layer.openPopup();
   * layer.closePopup();
   * ```
   *
   * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
   */

  // @section Popup methods
  Layer.include({

  	// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
  	// Binds a popup to the layer with the passed `content` and sets up the
  	// necessary event listeners. If a `Function` is passed it will receive
  	// the layer as the first argument and should return a `String` or `HTMLElement`.
  	bindPopup: function (content, options) {
  		this._popup = this._initOverlay(Popup, this._popup, content, options);
  		if (!this._popupHandlersAdded) {
  			this.on({
  				click: this._openPopup,
  				keypress: this._onKeyPress,
  				remove: this.closePopup,
  				move: this._movePopup
  			});
  			this._popupHandlersAdded = true;
  		}

  		return this;
  	},

  	// @method unbindPopup(): this
  	// Removes the popup previously bound with `bindPopup`.
  	unbindPopup: function () {
  		if (this._popup) {
  			this.off({
  				click: this._openPopup,
  				keypress: this._onKeyPress,
  				remove: this.closePopup,
  				move: this._movePopup
  			});
  			this._popupHandlersAdded = false;
  			this._popup = null;
  		}
  		return this;
  	},

  	// @method openPopup(latlng?: LatLng): this
  	// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
  	openPopup: function (latlng) {
  		if (this._popup) {
  			if (!(this instanceof FeatureGroup)) {
  				this._popup._source = this;
  			}
  			if (this._popup._prepareOpen(latlng || this._latlng)) {
  				// open the popup on the map
  				this._popup.openOn(this._map);
  			}
  		}
  		return this;
  	},

  	// @method closePopup(): this
  	// Closes the popup bound to this layer if it is open.
  	closePopup: function () {
  		if (this._popup) {
  			this._popup.close();
  		}
  		return this;
  	},

  	// @method togglePopup(): this
  	// Opens or closes the popup bound to this layer depending on its current state.
  	togglePopup: function () {
  		if (this._popup) {
  			this._popup.toggle(this);
  		}
  		return this;
  	},

  	// @method isPopupOpen(): boolean
  	// Returns `true` if the popup bound to this layer is currently open.
  	isPopupOpen: function () {
  		return (this._popup ? this._popup.isOpen() : false);
  	},

  	// @method setPopupContent(content: String|HTMLElement|Popup): this
  	// Sets the content of the popup bound to this layer.
  	setPopupContent: function (content) {
  		if (this._popup) {
  			this._popup.setContent(content);
  		}
  		return this;
  	},

  	// @method getPopup(): Popup
  	// Returns the popup bound to this layer.
  	getPopup: function () {
  		return this._popup;
  	},

  	_openPopup: function (e) {
  		if (!this._popup || !this._map) {
  			return;
  		}
  		// prevent map click
  		stop(e);

  		var target = e.layer || e.target;
  		if (this._popup._source === target && !(target instanceof Path)) {
  			// treat it like a marker and figure out
  			// if we should toggle it open/closed
  			if (this._map.hasLayer(this._popup)) {
  				this.closePopup();
  			} else {
  				this.openPopup(e.latlng);
  			}
  			return;
  		}
  		this._popup._source = target;
  		this.openPopup(e.latlng);
  	},

  	_movePopup: function (e) {
  		this._popup.setLatLng(e.latlng);
  	},

  	_onKeyPress: function (e) {
  		if (e.originalEvent.keyCode === 13) {
  			this._openPopup(e);
  		}
  	}
  });

  /*
   * @class Tooltip
   * @inherits DivOverlay
   * @aka L.Tooltip
   * Used to display small texts on top of map layers.
   *
   * @example
   * If you want to just bind a tooltip to marker:
   *
   * ```js
   * marker.bindTooltip("my tooltip text").openTooltip();
   * ```
   * Path overlays like polylines also have a `bindTooltip` method.
   *
   * A tooltip can be also standalone:
   *
   * ```js
   * var tooltip = L.tooltip()
   * 	.setLatLng(latlng)
   * 	.setContent('Hello world!<br />This is a nice tooltip.')
   * 	.addTo(map);
   * ```
   * or
   * ```js
   * var tooltip = L.tooltip(latlng, {content: 'Hello world!<br />This is a nice tooltip.'})
   * 	.addTo(map);
   * ```
   *
   *
   * Note about tooltip offset. Leaflet takes two options in consideration
   * for computing tooltip offsetting:
   * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
   *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
   *   move it to the bottom. Negatives will move to the left and top.
   * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
   *   should adapt this value if you use a custom icon.
   */


  // @namespace Tooltip
  var Tooltip = DivOverlay.extend({

  	// @section
  	// @aka Tooltip options
  	options: {
  		// @option pane: String = 'tooltipPane'
  		// `Map pane` where the tooltip will be added.
  		pane: 'tooltipPane',

  		// @option offset: Point = Point(0, 0)
  		// Optional offset of the tooltip position.
  		offset: [0, 0],

  		// @option direction: String = 'auto'
  		// Direction where to open the tooltip. Possible values are: `right`, `left`,
  		// `top`, `bottom`, `center`, `auto`.
  		// `auto` will dynamically switch between `right` and `left` according to the tooltip
  		// position on the map.
  		direction: 'auto',

  		// @option permanent: Boolean = false
  		// Whether to open the tooltip permanently or only on mouseover.
  		permanent: false,

  		// @option sticky: Boolean = false
  		// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
  		sticky: false,

  		// @option opacity: Number = 0.9
  		// Tooltip container opacity.
  		opacity: 0.9
  	},

  	onAdd: function (map) {
  		DivOverlay.prototype.onAdd.call(this, map);
  		this.setOpacity(this.options.opacity);

  		// @namespace Map
  		// @section Tooltip events
  		// @event tooltipopen: TooltipEvent
  		// Fired when a tooltip is opened in the map.
  		map.fire('tooltipopen', {tooltip: this});

  		if (this._source) {
  			this.addEventParent(this._source);

  			// @namespace Layer
  			// @section Tooltip events
  			// @event tooltipopen: TooltipEvent
  			// Fired when a tooltip bound to this layer is opened.
  			this._source.fire('tooltipopen', {tooltip: this}, true);
  		}
  	},

  	onRemove: function (map) {
  		DivOverlay.prototype.onRemove.call(this, map);

  		// @namespace Map
  		// @section Tooltip events
  		// @event tooltipclose: TooltipEvent
  		// Fired when a tooltip in the map is closed.
  		map.fire('tooltipclose', {tooltip: this});

  		if (this._source) {
  			this.removeEventParent(this._source);

  			// @namespace Layer
  			// @section Tooltip events
  			// @event tooltipclose: TooltipEvent
  			// Fired when a tooltip bound to this layer is closed.
  			this._source.fire('tooltipclose', {tooltip: this}, true);
  		}
  	},

  	getEvents: function () {
  		var events = DivOverlay.prototype.getEvents.call(this);

  		if (!this.options.permanent) {
  			events.preclick = this.close;
  		}

  		return events;
  	},

  	_initLayout: function () {
  		var prefix = 'leaflet-tooltip',
  		    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

  		this._contentNode = this._container = create$1('div', className);

  		this._container.setAttribute('role', 'tooltip');
  		this._container.setAttribute('id', 'leaflet-tooltip-' + stamp(this));
  	},

  	_updateLayout: function () {},

  	_adjustPan: function () {},

  	_setPosition: function (pos) {
  		var subX, subY,
  		    map = this._map,
  		    container = this._container,
  		    centerPoint = map.latLngToContainerPoint(map.getCenter()),
  		    tooltipPoint = map.layerPointToContainerPoint(pos),
  		    direction = this.options.direction,
  		    tooltipWidth = container.offsetWidth,
  		    tooltipHeight = container.offsetHeight,
  		    offset = toPoint(this.options.offset),
  		    anchor = this._getAnchor();

  		if (direction === 'top') {
  			subX = tooltipWidth / 2;
  			subY = tooltipHeight;
  		} else if (direction === 'bottom') {
  			subX = tooltipWidth / 2;
  			subY = 0;
  		} else if (direction === 'center') {
  			subX = tooltipWidth / 2;
  			subY = tooltipHeight / 2;
  		} else if (direction === 'right') {
  			subX = 0;
  			subY = tooltipHeight / 2;
  		} else if (direction === 'left') {
  			subX = tooltipWidth;
  			subY = tooltipHeight / 2;
  		} else if (tooltipPoint.x < centerPoint.x) {
  			direction = 'right';
  			subX = 0;
  			subY = tooltipHeight / 2;
  		} else {
  			direction = 'left';
  			subX = tooltipWidth + (offset.x + anchor.x) * 2;
  			subY = tooltipHeight / 2;
  		}

  		pos = pos.subtract(toPoint(subX, subY, true)).add(offset).add(anchor);

  		removeClass(container, 'leaflet-tooltip-right');
  		removeClass(container, 'leaflet-tooltip-left');
  		removeClass(container, 'leaflet-tooltip-top');
  		removeClass(container, 'leaflet-tooltip-bottom');
  		addClass(container, 'leaflet-tooltip-' + direction);
  		setPosition(container, pos);
  	},

  	_updatePosition: function () {
  		var pos = this._map.latLngToLayerPoint(this._latlng);
  		this._setPosition(pos);
  	},

  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;

  		if (this._container) {
  			setOpacity(this._container, opacity);
  		}
  	},

  	_animateZoom: function (e) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
  		this._setPosition(pos);
  	},

  	_getAnchor: function () {
  		// Where should we anchor the tooltip on the source layer?
  		return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
  	}

  });

  // @namespace Tooltip
  // @factory L.tooltip(options?: Tooltip options, source?: Layer)
  // Instantiates a `Tooltip` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
  // @alternative
  // @factory L.tooltip(latlng: LatLng, options?: Tooltip options)
  // Instantiates a `Tooltip` object given `latlng` where the tooltip will open and an optional `options` object that describes its appearance and location.
  var tooltip = function (options, source) {
  	return new Tooltip(options, source);
  };

  // @namespace Map
  // @section Methods for Layers and Controls
  Map$1.include({

  	// @method openTooltip(tooltip: Tooltip): this
  	// Opens the specified tooltip.
  	// @alternative
  	// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
  	// Creates a tooltip with the specified content and options and open it.
  	openTooltip: function (tooltip, latlng, options) {
  		this._initOverlay(Tooltip, tooltip, latlng, options)
  		  .openOn(this);

  		return this;
  	},

  	// @method closeTooltip(tooltip: Tooltip): this
  	// Closes the tooltip given as parameter.
  	closeTooltip: function (tooltip) {
  		tooltip.close();
  		return this;
  	}

  });

  /*
   * @namespace Layer
   * @section Tooltip methods example
   *
   * All layers share a set of methods convenient for binding tooltips to it.
   *
   * ```js
   * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
   * layer.openTooltip();
   * layer.closeTooltip();
   * ```
   */

  // @section Tooltip methods
  Layer.include({

  	// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
  	// Binds a tooltip to the layer with the passed `content` and sets up the
  	// necessary event listeners. If a `Function` is passed it will receive
  	// the layer as the first argument and should return a `String` or `HTMLElement`.
  	bindTooltip: function (content, options) {

  		if (this._tooltip && this.isTooltipOpen()) {
  			this.unbindTooltip();
  		}

  		this._tooltip = this._initOverlay(Tooltip, this._tooltip, content, options);
  		this._initTooltipInteractions();

  		if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
  			this.openTooltip();
  		}

  		return this;
  	},

  	// @method unbindTooltip(): this
  	// Removes the tooltip previously bound with `bindTooltip`.
  	unbindTooltip: function () {
  		if (this._tooltip) {
  			this._initTooltipInteractions(true);
  			this.closeTooltip();
  			this._tooltip = null;
  		}
  		return this;
  	},

  	_initTooltipInteractions: function (remove) {
  		if (!remove && this._tooltipHandlersAdded) { return; }
  		var onOff = remove ? 'off' : 'on',
  		    events = {
  			remove: this.closeTooltip,
  			move: this._moveTooltip
  		    };
  		if (!this._tooltip.options.permanent) {
  			events.mouseover = this._openTooltip;
  			events.mouseout = this.closeTooltip;
  			events.click = this._openTooltip;
  			if (this._map) {
  				this._addFocusListeners();
  			} else {
  				events.add = this._addFocusListeners;
  			}
  		} else {
  			events.add = this._openTooltip;
  		}
  		if (this._tooltip.options.sticky) {
  			events.mousemove = this._moveTooltip;
  		}
  		this[onOff](events);
  		this._tooltipHandlersAdded = !remove;
  	},

  	// @method openTooltip(latlng?: LatLng): this
  	// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
  	openTooltip: function (latlng) {
  		if (this._tooltip) {
  			if (!(this instanceof FeatureGroup)) {
  				this._tooltip._source = this;
  			}
  			if (this._tooltip._prepareOpen(latlng)) {
  				// open the tooltip on the map
  				this._tooltip.openOn(this._map);

  				if (this.getElement) {
  					this._setAriaDescribedByOnLayer(this);
  				} else if (this.eachLayer) {
  					this.eachLayer(this._setAriaDescribedByOnLayer, this);
  				}
  			}
  		}
  		return this;
  	},

  	// @method closeTooltip(): this
  	// Closes the tooltip bound to this layer if it is open.
  	closeTooltip: function () {
  		if (this._tooltip) {
  			return this._tooltip.close();
  		}
  	},

  	// @method toggleTooltip(): this
  	// Opens or closes the tooltip bound to this layer depending on its current state.
  	toggleTooltip: function () {
  		if (this._tooltip) {
  			this._tooltip.toggle(this);
  		}
  		return this;
  	},

  	// @method isTooltipOpen(): boolean
  	// Returns `true` if the tooltip bound to this layer is currently open.
  	isTooltipOpen: function () {
  		return this._tooltip.isOpen();
  	},

  	// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
  	// Sets the content of the tooltip bound to this layer.
  	setTooltipContent: function (content) {
  		if (this._tooltip) {
  			this._tooltip.setContent(content);
  		}
  		return this;
  	},

  	// @method getTooltip(): Tooltip
  	// Returns the tooltip bound to this layer.
  	getTooltip: function () {
  		return this._tooltip;
  	},

  	_addFocusListeners: function () {
  		if (this.getElement) {
  			this._addFocusListenersOnLayer(this);
  		} else if (this.eachLayer) {
  			this.eachLayer(this._addFocusListenersOnLayer, this);
  		}
  	},

  	_addFocusListenersOnLayer: function (layer) {
  		var el = typeof layer.getElement === 'function' && layer.getElement();
  		if (el) {
  			on(el, 'focus', function () {
  				this._tooltip._source = layer;
  				this.openTooltip();
  			}, this);
  			on(el, 'blur', this.closeTooltip, this);
  		}
  	},

  	_setAriaDescribedByOnLayer: function (layer) {
  		var el = typeof layer.getElement === 'function' && layer.getElement();
  		if (el) {
  			el.setAttribute('aria-describedby', this._tooltip._container.id);
  		}
  	},


  	_openTooltip: function (e) {
  		if (!this._tooltip || !this._map) {
  			return;
  		}

  		// If the map is moving, we will show the tooltip after it's done.
  		if (this._map.dragging && this._map.dragging.moving() && !this._openOnceFlag) {
  			this._openOnceFlag = true;
  			var that = this;
  			this._map.once('moveend', function () {
  				that._openOnceFlag = false;
  				that._openTooltip(e);
  			});
  			return;
  		}

  		this._tooltip._source = e.layer || e.target;

  		this.openTooltip(this._tooltip.options.sticky ? e.latlng : undefined);
  	},

  	_moveTooltip: function (e) {
  		var latlng = e.latlng, containerPoint, layerPoint;
  		if (this._tooltip.options.sticky && e.originalEvent) {
  			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
  			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
  			latlng = this._map.layerPointToLatLng(layerPoint);
  		}
  		this._tooltip.setLatLng(latlng);
  	}
  });

  /*
   * @class DivIcon
   * @aka L.DivIcon
   * @inherits Icon
   *
   * Represents a lightweight icon for markers that uses a simple `<div>`
   * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
   *
   * @example
   * ```js
   * var myIcon = L.divIcon({className: 'my-div-icon'});
   * // you can set .my-div-icon styles in CSS
   *
   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
   * ```
   *
   * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
   */

  var DivIcon = Icon.extend({
  	options: {
  		// @section
  		// @aka DivIcon options
  		iconSize: [12, 12], // also can be set through CSS

  		// iconAnchor: (Point),
  		// popupAnchor: (Point),

  		// @option html: String|HTMLElement = ''
  		// Custom HTML code to put inside the div element, empty by default. Alternatively,
  		// an instance of `HTMLElement`.
  		html: false,

  		// @option bgPos: Point = [0, 0]
  		// Optional relative position of the background, in pixels
  		bgPos: null,

  		className: 'leaflet-div-icon'
  	},

  	createIcon: function (oldIcon) {
  		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
  		    options = this.options;

  		if (options.html instanceof Element) {
  			empty(div);
  			div.appendChild(options.html);
  		} else {
  			div.innerHTML = options.html !== false ? options.html : '';
  		}

  		if (options.bgPos) {
  			var bgPos = toPoint(options.bgPos);
  			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
  		}
  		this._setIconStyles(div, 'icon');

  		return div;
  	},

  	createShadow: function () {
  		return null;
  	}
  });

  // @factory L.divIcon(options: DivIcon options)
  // Creates a `DivIcon` instance with the given options.
  function divIcon(options) {
  	return new DivIcon(options);
  }

  Icon.Default = IconDefault;

  /*
   * @class GridLayer
   * @inherits Layer
   * @aka L.GridLayer
   *
   * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
   * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
   *
   *
   * @section Synchronous usage
   * @example
   *
   * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
   *
   * ```js
   * var CanvasLayer = L.GridLayer.extend({
   *     createTile: function(coords){
   *         // create a <canvas> element for drawing
   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
   *
   *         // setup tile width and height according to the options
   *         var size = this.getTileSize();
   *         tile.width = size.x;
   *         tile.height = size.y;
   *
   *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
   *         var ctx = tile.getContext('2d');
   *
   *         // return the tile so it can be rendered on screen
   *         return tile;
   *     }
   * });
   * ```
   *
   * @section Asynchronous usage
   * @example
   *
   * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
   *
   * ```js
   * var CanvasLayer = L.GridLayer.extend({
   *     createTile: function(coords, done){
   *         var error;
   *
   *         // create a <canvas> element for drawing
   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
   *
   *         // setup tile width and height according to the options
   *         var size = this.getTileSize();
   *         tile.width = size.x;
   *         tile.height = size.y;
   *
   *         // draw something asynchronously and pass the tile to the done() callback
   *         setTimeout(function() {
   *             done(error, tile);
   *         }, 1000);
   *
   *         return tile;
   *     }
   * });
   * ```
   *
   * @section
   */


  var GridLayer = Layer.extend({

  	// @section
  	// @aka GridLayer options
  	options: {
  		// @option tileSize: Number|Point = 256
  		// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
  		tileSize: 256,

  		// @option opacity: Number = 1.0
  		// Opacity of the tiles. Can be used in the `createTile()` function.
  		opacity: 1,

  		// @option updateWhenIdle: Boolean = (depends)
  		// Load new tiles only when panning ends.
  		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
  		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
  		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
  		updateWhenIdle: Browser.mobile,

  		// @option updateWhenZooming: Boolean = true
  		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
  		updateWhenZooming: true,

  		// @option updateInterval: Number = 200
  		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
  		updateInterval: 200,

  		// @option zIndex: Number = 1
  		// The explicit zIndex of the tile layer.
  		zIndex: 1,

  		// @option bounds: LatLngBounds = undefined
  		// If set, tiles will only be loaded inside the set `LatLngBounds`.
  		bounds: null,

  		// @option minZoom: Number = 0
  		// The minimum zoom level down to which this layer will be displayed (inclusive).
  		minZoom: 0,

  		// @option maxZoom: Number = undefined
  		// The maximum zoom level up to which this layer will be displayed (inclusive).
  		maxZoom: undefined,

  		// @option maxNativeZoom: Number = undefined
  		// Maximum zoom number the tile source has available. If it is specified,
  		// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
  		// from `maxNativeZoom` level and auto-scaled.
  		maxNativeZoom: undefined,

  		// @option minNativeZoom: Number = undefined
  		// Minimum zoom number the tile source has available. If it is specified,
  		// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
  		// from `minNativeZoom` level and auto-scaled.
  		minNativeZoom: undefined,

  		// @option noWrap: Boolean = false
  		// Whether the layer is wrapped around the antimeridian. If `true`, the
  		// GridLayer will only be displayed once at low zoom levels. Has no
  		// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
  		// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
  		// tiles outside the CRS limits.
  		noWrap: false,

  		// @option pane: String = 'tilePane'
  		// `Map pane` where the grid layer will be added.
  		pane: 'tilePane',

  		// @option className: String = ''
  		// A custom class name to assign to the tile layer. Empty by default.
  		className: '',

  		// @option keepBuffer: Number = 2
  		// When panning the map, keep this many rows and columns of tiles before unloading them.
  		keepBuffer: 2
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	onAdd: function () {
  		this._initContainer();

  		this._levels = {};
  		this._tiles = {};

  		this._resetView(); // implicit _update() call
  	},

  	beforeAdd: function (map) {
  		map._addZoomLimit(this);
  	},

  	onRemove: function (map) {
  		this._removeAllTiles();
  		remove(this._container);
  		map._removeZoomLimit(this);
  		this._container = null;
  		this._tileZoom = undefined;
  	},

  	// @method bringToFront: this
  	// Brings the tile layer to the top of all tile layers.
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._container);
  			this._setAutoZIndex(Math.max);
  		}
  		return this;
  	},

  	// @method bringToBack: this
  	// Brings the tile layer to the bottom of all tile layers.
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._container);
  			this._setAutoZIndex(Math.min);
  		}
  		return this;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTML element that contains the tiles for this layer.
  	getContainer: function () {
  		return this._container;
  	},

  	// @method setOpacity(opacity: Number): this
  	// Changes the [opacity](#gridlayer-opacity) of the grid layer.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;
  		this._updateOpacity();
  		return this;
  	},

  	// @method setZIndex(zIndex: Number): this
  	// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
  	setZIndex: function (zIndex) {
  		this.options.zIndex = zIndex;
  		this._updateZIndex();

  		return this;
  	},

  	// @method isLoading: Boolean
  	// Returns `true` if any tile in the grid layer has not finished loading.
  	isLoading: function () {
  		return this._loading;
  	},

  	// @method redraw: this
  	// Causes the layer to clear all the tiles and request them again.
  	redraw: function () {
  		if (this._map) {
  			this._removeAllTiles();
  			var tileZoom = this._clampZoom(this._map.getZoom());
  			if (tileZoom !== this._tileZoom) {
  				this._tileZoom = tileZoom;
  				this._updateLevels();
  			}
  			this._update();
  		}
  		return this;
  	},

  	getEvents: function () {
  		var events = {
  			viewprereset: this._invalidateAll,
  			viewreset: this._resetView,
  			zoom: this._resetView,
  			moveend: this._onMoveEnd
  		};

  		if (!this.options.updateWhenIdle) {
  			// update tiles on move, but not more often than once per given interval
  			if (!this._onMove) {
  				this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
  			}

  			events.move = this._onMove;
  		}

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}

  		return events;
  	},

  	// @section Extension methods
  	// Layers extending `GridLayer` shall reimplement the following method.
  	// @method createTile(coords: Object, done?: Function): HTMLElement
  	// Called only internally, must be overridden by classes extending `GridLayer`.
  	// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
  	// is specified, it must be called when the tile has finished loading and drawing.
  	createTile: function () {
  		return document.createElement('div');
  	},

  	// @section
  	// @method getTileSize: Point
  	// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
  	getTileSize: function () {
  		var s = this.options.tileSize;
  		return s instanceof Point ? s : new Point(s, s);
  	},

  	_updateZIndex: function () {
  		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
  			this._container.style.zIndex = this.options.zIndex;
  		}
  	},

  	_setAutoZIndex: function (compare) {
  		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

  		var layers = this.getPane().children,
  		    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

  		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

  			zIndex = layers[i].style.zIndex;

  			if (layers[i] !== this._container && zIndex) {
  				edgeZIndex = compare(edgeZIndex, +zIndex);
  			}
  		}

  		if (isFinite(edgeZIndex)) {
  			this.options.zIndex = edgeZIndex + compare(-1, 1);
  			this._updateZIndex();
  		}
  	},

  	_updateOpacity: function () {
  		if (!this._map) { return; }

  		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
  		if (Browser.ielt9) { return; }

  		setOpacity(this._container, this.options.opacity);

  		var now = +new Date(),
  		    nextFrame = false,
  		    willPrune = false;

  		for (var key in this._tiles) {
  			var tile = this._tiles[key];
  			if (!tile.current || !tile.loaded) { continue; }

  			var fade = Math.min(1, (now - tile.loaded) / 200);

  			setOpacity(tile.el, fade);
  			if (fade < 1) {
  				nextFrame = true;
  			} else {
  				if (tile.active) {
  					willPrune = true;
  				} else {
  					this._onOpaqueTile(tile);
  				}
  				tile.active = true;
  			}
  		}

  		if (willPrune && !this._noPrune) { this._pruneTiles(); }

  		if (nextFrame) {
  			cancelAnimFrame(this._fadeFrame);
  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
  		}
  	},

  	_onOpaqueTile: falseFn,

  	_initContainer: function () {
  		if (this._container) { return; }

  		this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
  		this._updateZIndex();

  		if (this.options.opacity < 1) {
  			this._updateOpacity();
  		}

  		this.getPane().appendChild(this._container);
  	},

  	_updateLevels: function () {

  		var zoom = this._tileZoom,
  		    maxZoom = this.options.maxZoom;

  		if (zoom === undefined) { return undefined; }

  		for (var z in this._levels) {
  			z = Number(z);
  			if (this._levels[z].el.children.length || z === zoom) {
  				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
  				this._onUpdateLevel(z);
  			} else {
  				remove(this._levels[z].el);
  				this._removeTilesAtZoom(z);
  				this._onRemoveLevel(z);
  				delete this._levels[z];
  			}
  		}

  		var level = this._levels[zoom],
  		    map = this._map;

  		if (!level) {
  			level = this._levels[zoom] = {};

  			level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
  			level.el.style.zIndex = maxZoom;

  			level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
  			level.zoom = zoom;

  			this._setZoomTransform(level, map.getCenter(), map.getZoom());

  			// force the browser to consider the newly added element for transition
  			falseFn(level.el.offsetWidth);

  			this._onCreateLevel(level);
  		}

  		this._level = level;

  		return level;
  	},

  	_onUpdateLevel: falseFn,

  	_onRemoveLevel: falseFn,

  	_onCreateLevel: falseFn,

  	_pruneTiles: function () {
  		if (!this._map) {
  			return;
  		}

  		var key, tile;

  		var zoom = this._map.getZoom();
  		if (zoom > this.options.maxZoom ||
  			zoom < this.options.minZoom) {
  			this._removeAllTiles();
  			return;
  		}

  		for (key in this._tiles) {
  			tile = this._tiles[key];
  			tile.retain = tile.current;
  		}

  		for (key in this._tiles) {
  			tile = this._tiles[key];
  			if (tile.current && !tile.active) {
  				var coords = tile.coords;
  				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
  					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
  				}
  			}
  		}

  		for (key in this._tiles) {
  			if (!this._tiles[key].retain) {
  				this._removeTile(key);
  			}
  		}
  	},

  	_removeTilesAtZoom: function (zoom) {
  		for (var key in this._tiles) {
  			if (this._tiles[key].coords.z !== zoom) {
  				continue;
  			}
  			this._removeTile(key);
  		}
  	},

  	_removeAllTiles: function () {
  		for (var key in this._tiles) {
  			this._removeTile(key);
  		}
  	},

  	_invalidateAll: function () {
  		for (var z in this._levels) {
  			remove(this._levels[z].el);
  			this._onRemoveLevel(Number(z));
  			delete this._levels[z];
  		}
  		this._removeAllTiles();

  		this._tileZoom = undefined;
  	},

  	_retainParent: function (x, y, z, minZoom) {
  		var x2 = Math.floor(x / 2),
  		    y2 = Math.floor(y / 2),
  		    z2 = z - 1,
  		    coords2 = new Point(+x2, +y2);
  		coords2.z = +z2;

  		var key = this._tileCoordsToKey(coords2),
  		    tile = this._tiles[key];

  		if (tile && tile.active) {
  			tile.retain = true;
  			return true;

  		} else if (tile && tile.loaded) {
  			tile.retain = true;
  		}

  		if (z2 > minZoom) {
  			return this._retainParent(x2, y2, z2, minZoom);
  		}

  		return false;
  	},

  	_retainChildren: function (x, y, z, maxZoom) {

  		for (var i = 2 * x; i < 2 * x + 2; i++) {
  			for (var j = 2 * y; j < 2 * y + 2; j++) {

  				var coords = new Point(i, j);
  				coords.z = z + 1;

  				var key = this._tileCoordsToKey(coords),
  				    tile = this._tiles[key];

  				if (tile && tile.active) {
  					tile.retain = true;
  					continue;

  				} else if (tile && tile.loaded) {
  					tile.retain = true;
  				}

  				if (z + 1 < maxZoom) {
  					this._retainChildren(i, j, z + 1, maxZoom);
  				}
  			}
  		}
  	},

  	_resetView: function (e) {
  		var animating = e && (e.pinch || e.flyTo);
  		this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
  	},

  	_animateZoom: function (e) {
  		this._setView(e.center, e.zoom, true, e.noUpdate);
  	},

  	_clampZoom: function (zoom) {
  		var options = this.options;

  		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
  			return options.minNativeZoom;
  		}

  		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
  			return options.maxNativeZoom;
  		}

  		return zoom;
  	},

  	_setView: function (center, zoom, noPrune, noUpdate) {
  		var tileZoom = Math.round(zoom);
  		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
  		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
  			tileZoom = undefined;
  		} else {
  			tileZoom = this._clampZoom(tileZoom);
  		}

  		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

  		if (!noUpdate || tileZoomChanged) {

  			this._tileZoom = tileZoom;

  			if (this._abortLoading) {
  				this._abortLoading();
  			}

  			this._updateLevels();
  			this._resetGrid();

  			if (tileZoom !== undefined) {
  				this._update(center);
  			}

  			if (!noPrune) {
  				this._pruneTiles();
  			}

  			// Flag to prevent _updateOpacity from pruning tiles during
  			// a zoom anim or a pinch gesture
  			this._noPrune = !!noPrune;
  		}

  		this._setZoomTransforms(center, zoom);
  	},

  	_setZoomTransforms: function (center, zoom) {
  		for (var i in this._levels) {
  			this._setZoomTransform(this._levels[i], center, zoom);
  		}
  	},

  	_setZoomTransform: function (level, center, zoom) {
  		var scale = this._map.getZoomScale(zoom, level.zoom),
  		    translate = level.origin.multiplyBy(scale)
  		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

  		if (Browser.any3d) {
  			setTransform(level.el, translate, scale);
  		} else {
  			setPosition(level.el, translate);
  		}
  	},

  	_resetGrid: function () {
  		var map = this._map,
  		    crs = map.options.crs,
  		    tileSize = this._tileSize = this.getTileSize(),
  		    tileZoom = this._tileZoom;

  		var bounds = this._map.getPixelWorldBounds(this._tileZoom);
  		if (bounds) {
  			this._globalTileRange = this._pxBoundsToTileRange(bounds);
  		}

  		this._wrapX = crs.wrapLng && !this.options.noWrap && [
  			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
  			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
  		];
  		this._wrapY = crs.wrapLat && !this.options.noWrap && [
  			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
  			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
  		];
  	},

  	_onMoveEnd: function () {
  		if (!this._map || this._map._animatingZoom) { return; }

  		this._update();
  	},

  	_getTiledPixelBounds: function (center) {
  		var map = this._map,
  		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
  		    scale = map.getZoomScale(mapZoom, this._tileZoom),
  		    pixelCenter = map.project(center, this._tileZoom).floor(),
  		    halfSize = map.getSize().divideBy(scale * 2);

  		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
  	},

  	// Private method to load tiles in the grid's active zoom level according to map bounds
  	_update: function (center) {
  		var map = this._map;
  		if (!map) { return; }
  		var zoom = this._clampZoom(map.getZoom());

  		if (center === undefined) { center = map.getCenter(); }
  		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

  		var pixelBounds = this._getTiledPixelBounds(center),
  		    tileRange = this._pxBoundsToTileRange(pixelBounds),
  		    tileCenter = tileRange.getCenter(),
  		    queue = [],
  		    margin = this.options.keepBuffer,
  		    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
  		                              tileRange.getTopRight().add([margin, -margin]));

  		// Sanity check: panic if the tile range contains Infinity somewhere.
  		if (!(isFinite(tileRange.min.x) &&
  		      isFinite(tileRange.min.y) &&
  		      isFinite(tileRange.max.x) &&
  		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

  		for (var key in this._tiles) {
  			var c = this._tiles[key].coords;
  			if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
  				this._tiles[key].current = false;
  			}
  		}

  		// _update just loads more tiles. If the tile zoom level differs too much
  		// from the map's, let _setView reset levels and prune old tiles.
  		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

  		// create a queue of coordinates to load tiles from
  		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
  			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
  				var coords = new Point(i, j);
  				coords.z = this._tileZoom;

  				if (!this._isValidTile(coords)) { continue; }

  				var tile = this._tiles[this._tileCoordsToKey(coords)];
  				if (tile) {
  					tile.current = true;
  				} else {
  					queue.push(coords);
  				}
  			}
  		}

  		// sort tile queue to load tiles in order of their distance to center
  		queue.sort(function (a, b) {
  			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
  		});

  		if (queue.length !== 0) {
  			// if it's the first batch of tiles to load
  			if (!this._loading) {
  				this._loading = true;
  				// @event loading: Event
  				// Fired when the grid layer starts loading tiles.
  				this.fire('loading');
  			}

  			// create DOM fragment to append tiles in one batch
  			var fragment = document.createDocumentFragment();

  			for (i = 0; i < queue.length; i++) {
  				this._addTile(queue[i], fragment);
  			}

  			this._level.el.appendChild(fragment);
  		}
  	},

  	_isValidTile: function (coords) {
  		var crs = this._map.options.crs;

  		if (!crs.infinite) {
  			// don't load tile if it's out of bounds and not wrapped
  			var bounds = this._globalTileRange;
  			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
  			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
  		}

  		if (!this.options.bounds) { return true; }

  		// don't load tile if it doesn't intersect the bounds in options
  		var tileBounds = this._tileCoordsToBounds(coords);
  		return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
  	},

  	_keyToBounds: function (key) {
  		return this._tileCoordsToBounds(this._keyToTileCoords(key));
  	},

  	_tileCoordsToNwSe: function (coords) {
  		var map = this._map,
  		    tileSize = this.getTileSize(),
  		    nwPoint = coords.scaleBy(tileSize),
  		    sePoint = nwPoint.add(tileSize),
  		    nw = map.unproject(nwPoint, coords.z),
  		    se = map.unproject(sePoint, coords.z);
  		return [nw, se];
  	},

  	// converts tile coordinates to its geographical bounds
  	_tileCoordsToBounds: function (coords) {
  		var bp = this._tileCoordsToNwSe(coords),
  		    bounds = new LatLngBounds(bp[0], bp[1]);

  		if (!this.options.noWrap) {
  			bounds = this._map.wrapLatLngBounds(bounds);
  		}
  		return bounds;
  	},
  	// converts tile coordinates to key for the tile cache
  	_tileCoordsToKey: function (coords) {
  		return coords.x + ':' + coords.y + ':' + coords.z;
  	},

  	// converts tile cache key to coordinates
  	_keyToTileCoords: function (key) {
  		var k = key.split(':'),
  		    coords = new Point(+k[0], +k[1]);
  		coords.z = +k[2];
  		return coords;
  	},

  	_removeTile: function (key) {
  		var tile = this._tiles[key];
  		if (!tile) { return; }

  		remove(tile.el);

  		delete this._tiles[key];

  		// @event tileunload: TileEvent
  		// Fired when a tile is removed (e.g. when a tile goes off the screen).
  		this.fire('tileunload', {
  			tile: tile.el,
  			coords: this._keyToTileCoords(key)
  		});
  	},

  	_initTile: function (tile) {
  		addClass(tile, 'leaflet-tile');

  		var tileSize = this.getTileSize();
  		tile.style.width = tileSize.x + 'px';
  		tile.style.height = tileSize.y + 'px';

  		tile.onselectstart = falseFn;
  		tile.onmousemove = falseFn;

  		// update opacity on tiles in IE7-8 because of filter inheritance problems
  		if (Browser.ielt9 && this.options.opacity < 1) {
  			setOpacity(tile, this.options.opacity);
  		}
  	},

  	_addTile: function (coords, container) {
  		var tilePos = this._getTilePos(coords),
  		    key = this._tileCoordsToKey(coords);

  		var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

  		this._initTile(tile);

  		// if createTile is defined with a second argument ("done" callback),
  		// we know that tile is async and will be ready later; otherwise
  		if (this.createTile.length < 2) {
  			// mark tile as ready, but delay one frame for opacity animation to happen
  			requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
  		}

  		setPosition(tile, tilePos);

  		// save tile in cache
  		this._tiles[key] = {
  			el: tile,
  			coords: coords,
  			current: true
  		};

  		container.appendChild(tile);
  		// @event tileloadstart: TileEvent
  		// Fired when a tile is requested and starts loading.
  		this.fire('tileloadstart', {
  			tile: tile,
  			coords: coords
  		});
  	},

  	_tileReady: function (coords, err, tile) {
  		if (err) {
  			// @event tileerror: TileErrorEvent
  			// Fired when there is an error loading a tile.
  			this.fire('tileerror', {
  				error: err,
  				tile: tile,
  				coords: coords
  			});
  		}

  		var key = this._tileCoordsToKey(coords);

  		tile = this._tiles[key];
  		if (!tile) { return; }

  		tile.loaded = +new Date();
  		if (this._map._fadeAnimated) {
  			setOpacity(tile.el, 0);
  			cancelAnimFrame(this._fadeFrame);
  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
  		} else {
  			tile.active = true;
  			this._pruneTiles();
  		}

  		if (!err) {
  			addClass(tile.el, 'leaflet-tile-loaded');

  			// @event tileload: TileEvent
  			// Fired when a tile loads.
  			this.fire('tileload', {
  				tile: tile.el,
  				coords: coords
  			});
  		}

  		if (this._noTilesToLoad()) {
  			this._loading = false;
  			// @event load: Event
  			// Fired when the grid layer loaded all visible tiles.
  			this.fire('load');

  			if (Browser.ielt9 || !this._map._fadeAnimated) {
  				requestAnimFrame(this._pruneTiles, this);
  			} else {
  				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
  				// to trigger a pruning.
  				setTimeout(bind(this._pruneTiles, this), 250);
  			}
  		}
  	},

  	_getTilePos: function (coords) {
  		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
  	},

  	_wrapCoords: function (coords) {
  		var newCoords = new Point(
  			this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
  			this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
  		newCoords.z = coords.z;
  		return newCoords;
  	},

  	_pxBoundsToTileRange: function (bounds) {
  		var tileSize = this.getTileSize();
  		return new Bounds(
  			bounds.min.unscaleBy(tileSize).floor(),
  			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
  	},

  	_noTilesToLoad: function () {
  		for (var key in this._tiles) {
  			if (!this._tiles[key].loaded) { return false; }
  		}
  		return true;
  	}
  });

  // @factory L.gridLayer(options?: GridLayer options)
  // Creates a new instance of GridLayer with the supplied options.
  function gridLayer(options) {
  	return new GridLayer(options);
  }

  /*
   * @class TileLayer
   * @inherits GridLayer
   * @aka L.TileLayer
   * Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under `Layer`. Extends `GridLayer`.
   *
   * @example
   *
   * ```js
   * L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
   * ```
   *
   * @section URL template
   * @example
   *
   * A string of the following form:
   *
   * ```
   * 'https://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
   * ```
   *
   * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
   *
   * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
   *
   * ```
   * L.tileLayer('https://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
   * ```
   */


  var TileLayer = GridLayer.extend({

  	// @section
  	// @aka TileLayer options
  	options: {
  		// @option minZoom: Number = 0
  		// The minimum zoom level down to which this layer will be displayed (inclusive).
  		minZoom: 0,

  		// @option maxZoom: Number = 18
  		// The maximum zoom level up to which this layer will be displayed (inclusive).
  		maxZoom: 18,

  		// @option subdomains: String|String[] = 'abc'
  		// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
  		subdomains: 'abc',

  		// @option errorTileUrl: String = ''
  		// URL to the tile image to show in place of the tile that failed to load.
  		errorTileUrl: '',

  		// @option zoomOffset: Number = 0
  		// The zoom number used in tile URLs will be offset with this value.
  		zoomOffset: 0,

  		// @option tms: Boolean = false
  		// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
  		tms: false,

  		// @option zoomReverse: Boolean = false
  		// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
  		zoomReverse: false,

  		// @option detectRetina: Boolean = false
  		// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
  		detectRetina: false,

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the tiles.
  		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false,

  		// @option referrerPolicy: Boolean|String = false
  		// Whether the referrerPolicy attribute will be added to the tiles.
  		// If a String is provided, all tiles will have their referrerPolicy attribute set to the String provided.
  		// This may be needed if your map's rendering context has a strict default but your tile provider expects a valid referrer
  		// (e.g. to validate an API token).
  		// Refer to [HTMLImageElement.referrerPolicy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/referrerPolicy) for valid String values.
  		referrerPolicy: false
  	},

  	initialize: function (url, options) {

  		this._url = url;

  		options = setOptions(this, options);

  		// detecting retina displays, adjusting tileSize and zoom levels
  		if (options.detectRetina && Browser.retina && options.maxZoom > 0) {

  			options.tileSize = Math.floor(options.tileSize / 2);

  			if (!options.zoomReverse) {
  				options.zoomOffset++;
  				options.maxZoom = Math.max(options.minZoom, options.maxZoom - 1);
  			} else {
  				options.zoomOffset--;
  				options.minZoom = Math.min(options.maxZoom, options.minZoom + 1);
  			}

  			options.minZoom = Math.max(0, options.minZoom);
  		} else if (!options.zoomReverse) {
  			// make sure maxZoom is gte minZoom
  			options.maxZoom = Math.max(options.minZoom, options.maxZoom);
  		} else {
  			// make sure minZoom is lte maxZoom
  			options.minZoom = Math.min(options.maxZoom, options.minZoom);
  		}

  		if (typeof options.subdomains === 'string') {
  			options.subdomains = options.subdomains.split('');
  		}

  		this.on('tileunload', this._onTileRemove);
  	},

  	// @method setUrl(url: String, noRedraw?: Boolean): this
  	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
  	// If the URL does not change, the layer will not be redrawn unless
  	// the noRedraw parameter is set to false.
  	setUrl: function (url, noRedraw) {
  		if (this._url === url && noRedraw === undefined) {
  			noRedraw = true;
  		}

  		this._url = url;

  		if (!noRedraw) {
  			this.redraw();
  		}
  		return this;
  	},

  	// @method createTile(coords: Object, done?: Function): HTMLElement
  	// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
  	// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
  	// callback is called when the tile has been loaded.
  	createTile: function (coords, done) {
  		var tile = document.createElement('img');

  		on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
  		on(tile, 'error', bind(this._tileOnError, this, done, tile));

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		// for this new option we follow the documented behavior
  		// more closely by only setting the property when string
  		if (typeof this.options.referrerPolicy === 'string') {
  			tile.referrerPolicy = this.options.referrerPolicy;
  		}

  		// The alt attribute is set to the empty string,
  		// allowing screen readers to ignore the decorative image tiles.
  		// https://www.w3.org/WAI/tutorials/images/decorative/
  		// https://www.w3.org/TR/html-aria/#el-img-empty-alt
  		tile.alt = '';

  		tile.src = this.getTileUrl(coords);

  		return tile;
  	},

  	// @section Extension methods
  	// @uninheritable
  	// Layers extending `TileLayer` might reimplement the following method.
  	// @method getTileUrl(coords: Object): String
  	// Called only internally, returns the URL for a tile given its coordinates.
  	// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
  	getTileUrl: function (coords) {
  		var data = {
  			r: Browser.retina ? '@2x' : '',
  			s: this._getSubdomain(coords),
  			x: coords.x,
  			y: coords.y,
  			z: this._getZoomForUrl()
  		};
  		if (this._map && !this._map.options.crs.infinite) {
  			var invertedY = this._globalTileRange.max.y - coords.y;
  			if (this.options.tms) {
  				data['y'] = invertedY;
  			}
  			data['-y'] = invertedY;
  		}

  		return template(this._url, extend(data, this.options));
  	},

  	_tileOnLoad: function (done, tile) {
  		// For https://github.com/Leaflet/Leaflet/issues/3332
  		if (Browser.ielt9) {
  			setTimeout(bind(done, this, null, tile), 0);
  		} else {
  			done(null, tile);
  		}
  	},

  	_tileOnError: function (done, tile, e) {
  		var errorUrl = this.options.errorTileUrl;
  		if (errorUrl && tile.getAttribute('src') !== errorUrl) {
  			tile.src = errorUrl;
  		}
  		done(e, tile);
  	},

  	_onTileRemove: function (e) {
  		e.tile.onload = null;
  	},

  	_getZoomForUrl: function () {
  		var zoom = this._tileZoom,
  		maxZoom = this.options.maxZoom,
  		zoomReverse = this.options.zoomReverse,
  		zoomOffset = this.options.zoomOffset;

  		if (zoomReverse) {
  			zoom = maxZoom - zoom;
  		}

  		return zoom + zoomOffset;
  	},

  	_getSubdomain: function (tilePoint) {
  		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
  		return this.options.subdomains[index];
  	},

  	// stops loading all tiles in the background layer
  	_abortLoading: function () {
  		var i, tile;
  		for (i in this._tiles) {
  			if (this._tiles[i].coords.z !== this._tileZoom) {
  				tile = this._tiles[i].el;

  				tile.onload = falseFn;
  				tile.onerror = falseFn;

  				if (!tile.complete) {
  					tile.src = emptyImageUrl;
  					var coords = this._tiles[i].coords;
  					remove(tile);
  					delete this._tiles[i];
  					// @event tileabort: TileEvent
  					// Fired when a tile was loading but is now not wanted.
  					this.fire('tileabort', {
  						tile: tile,
  						coords: coords
  					});
  				}
  			}
  		}
  	},

  	_removeTile: function (key) {
  		var tile = this._tiles[key];
  		if (!tile) { return; }

  		// Cancels any pending http requests associated with the tile
  		tile.el.setAttribute('src', emptyImageUrl);

  		return GridLayer.prototype._removeTile.call(this, key);
  	},

  	_tileReady: function (coords, err, tile) {
  		if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
  			return;
  		}

  		return GridLayer.prototype._tileReady.call(this, coords, err, tile);
  	}
  });


  // @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
  // Instantiates a tile layer object given a `URL template` and optionally an options object.

  function tileLayer(url, options) {
  	return new TileLayer(url, options);
  }

  /*
   * @class TileLayer.WMS
   * @inherits TileLayer
   * @aka L.TileLayer.WMS
   * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
   *
   * @example
   *
   * ```js
   * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
   * 	layers: 'nexrad-n0r-900913',
   * 	format: 'image/png',
   * 	transparent: true,
   * 	attribution: "Weather data © 2012 IEM Nexrad"
   * });
   * ```
   */

  var TileLayerWMS = TileLayer.extend({

  	// @section
  	// @aka TileLayer.WMS options
  	// If any custom options not documented here are used, they will be sent to the
  	// WMS server as extra parameters in each request URL. This can be useful for
  	// [non-standard vendor WMS parameters](https://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
  	defaultWmsParams: {
  		service: 'WMS',
  		request: 'GetMap',

  		// @option layers: String = ''
  		// **(required)** Comma-separated list of WMS layers to show.
  		layers: '',

  		// @option styles: String = ''
  		// Comma-separated list of WMS styles.
  		styles: '',

  		// @option format: String = 'image/jpeg'
  		// WMS image format (use `'image/png'` for layers with transparency).
  		format: 'image/jpeg',

  		// @option transparent: Boolean = false
  		// If `true`, the WMS service will return images with transparency.
  		transparent: false,

  		// @option version: String = '1.1.1'
  		// Version of the WMS service to use
  		version: '1.1.1'
  	},

  	options: {
  		// @option crs: CRS = null
  		// Coordinate Reference System to use for the WMS requests, defaults to
  		// map CRS. Don't change this if you're not sure what it means.
  		crs: null,

  		// @option uppercase: Boolean = false
  		// If `true`, WMS request parameter keys will be uppercase.
  		uppercase: false
  	},

  	initialize: function (url, options) {

  		this._url = url;

  		var wmsParams = extend({}, this.defaultWmsParams);

  		// all keys that are not TileLayer options go to WMS params
  		for (var i in options) {
  			if (!(i in this.options)) {
  				wmsParams[i] = options[i];
  			}
  		}

  		options = setOptions(this, options);

  		var realRetina = options.detectRetina && Browser.retina ? 2 : 1;
  		var tileSize = this.getTileSize();
  		wmsParams.width = tileSize.x * realRetina;
  		wmsParams.height = tileSize.y * realRetina;

  		this.wmsParams = wmsParams;
  	},

  	onAdd: function (map) {

  		this._crs = this.options.crs || map.options.crs;
  		this._wmsVersion = parseFloat(this.wmsParams.version);

  		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
  		this.wmsParams[projectionKey] = this._crs.code;

  		TileLayer.prototype.onAdd.call(this, map);
  	},

  	getTileUrl: function (coords) {

  		var tileBounds = this._tileCoordsToNwSe(coords),
  		    crs = this._crs,
  		    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
  		    min = bounds.min,
  		    max = bounds.max,
  		    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
  		    [min.y, min.x, max.y, max.x] :
  		    [min.x, min.y, max.x, max.y]).join(','),
  		    url = TileLayer.prototype.getTileUrl.call(this, coords);
  		return url +
  			getParamString(this.wmsParams, url, this.options.uppercase) +
  			(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
  	},

  	// @method setParams(params: Object, noRedraw?: Boolean): this
  	// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
  	setParams: function (params, noRedraw) {

  		extend(this.wmsParams, params);

  		if (!noRedraw) {
  			this.redraw();
  		}

  		return this;
  	}
  });


  // @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
  // Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
  function tileLayerWMS(url, options) {
  	return new TileLayerWMS(url, options);
  }

  TileLayer.WMS = TileLayerWMS;
  tileLayer.wms = tileLayerWMS;

  /*
   * @class Renderer
   * @inherits Layer
   * @aka L.Renderer
   *
   * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
   * DOM container of the renderer, its bounds, and its zoom animation.
   *
   * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
   * itself can be added or removed to the map. All paths use a renderer, which can
   * be implicit (the map will decide the type of renderer and use it automatically)
   * or explicit (using the [`renderer`](#path-renderer) option of the path).
   *
   * Do not use this class directly, use `SVG` and `Canvas` instead.
   *
   * @event update: Event
   * Fired when the renderer updates its bounds, center and zoom, for example when
   * its map has moved
   */

  var Renderer$1 = Layer.extend({

  	// @section
  	// @aka Renderer options
  	options: {
  		// @option padding: Number = 0.1
  		// How much to extend the clip area around the map view (relative to its size)
  		// e.g. 0.1 would be 10% of map view in each direction
  		padding: 0.1
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  		stamp(this);
  		this._layers = this._layers || {};
  	},

  	onAdd: function () {
  		if (!this._container) {
  			this._initContainer(); // defined by renderer implementations

  			// always keep transform-origin as 0 0
  			addClass(this._container, 'leaflet-zoom-animated');
  		}

  		this.getPane().appendChild(this._container);
  		this._update();
  		this.on('update', this._updatePaths, this);
  	},

  	onRemove: function () {
  		this.off('update', this._updatePaths, this);
  		this._destroyContainer();
  	},

  	getEvents: function () {
  		var events = {
  			viewreset: this._reset,
  			zoom: this._onZoom,
  			moveend: this._update,
  			zoomend: this._onZoomEnd
  		};
  		if (this._zoomAnimated) {
  			events.zoomanim = this._onAnimZoom;
  		}
  		return events;
  	},

  	_onAnimZoom: function (ev) {
  		this._updateTransform(ev.center, ev.zoom);
  	},

  	_onZoom: function () {
  		this._updateTransform(this._map.getCenter(), this._map.getZoom());
  	},

  	_updateTransform: function (center, zoom) {
  		var scale = this._map.getZoomScale(zoom, this._zoom),
  		    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
  		    currentCenterPoint = this._map.project(this._center, zoom),

  		    topLeftOffset = viewHalf.multiplyBy(-scale).add(currentCenterPoint)
  				  .subtract(this._map._getNewPixelOrigin(center, zoom));

  		if (Browser.any3d) {
  			setTransform(this._container, topLeftOffset, scale);
  		} else {
  			setPosition(this._container, topLeftOffset);
  		}
  	},

  	_reset: function () {
  		this._update();
  		this._updateTransform(this._center, this._zoom);

  		for (var id in this._layers) {
  			this._layers[id]._reset();
  		}
  	},

  	_onZoomEnd: function () {
  		for (var id in this._layers) {
  			this._layers[id]._project();
  		}
  	},

  	_updatePaths: function () {
  		for (var id in this._layers) {
  			this._layers[id]._update();
  		}
  	},

  	_update: function () {
  		// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
  		// Subclasses are responsible of firing the 'update' event.
  		var p = this.options.padding,
  		    size = this._map.getSize(),
  		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

  		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

  		this._center = this._map.getCenter();
  		this._zoom = this._map.getZoom();
  	}
  });

  /*
   * @class Canvas
   * @inherits Renderer
   * @aka L.Canvas
   *
   * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
   * Inherits `Renderer`.
   *
   * Due to [technical limitations](https://caniuse.com/canvas), Canvas is not
   * available in all web browsers, notably IE8, and overlapping geometries might
   * not display properly in some edge cases.
   *
   * @example
   *
   * Use Canvas by default for all paths in the map:
   *
   * ```js
   * var map = L.map('map', {
   * 	renderer: L.canvas()
   * });
   * ```
   *
   * Use a Canvas renderer with extra padding for specific vector geometries:
   *
   * ```js
   * var map = L.map('map');
   * var myRenderer = L.canvas({ padding: 0.5 });
   * var line = L.polyline( coordinates, { renderer: myRenderer } );
   * var circle = L.circle( center, { renderer: myRenderer } );
   * ```
   */

  var Canvas = Renderer$1.extend({

  	// @section
  	// @aka Canvas options
  	options: {
  		// @option tolerance: Number = 0
  		// How much to extend the click tolerance around a path/object on the map.
  		tolerance: 0
  	},

  	getEvents: function () {
  		var events = Renderer$1.prototype.getEvents.call(this);
  		events.viewprereset = this._onViewPreReset;
  		return events;
  	},

  	_onViewPreReset: function () {
  		// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
  		this._postponeUpdatePaths = true;
  	},

  	onAdd: function () {
  		Renderer$1.prototype.onAdd.call(this);

  		// Redraw vectors since canvas is cleared upon removal,
  		// in case of removing the renderer itself from the map.
  		this._draw();
  	},

  	_initContainer: function () {
  		var container = this._container = document.createElement('canvas');

  		on(container, 'mousemove', this._onMouseMove, this);
  		on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
  		on(container, 'mouseout', this._handleMouseOut, this);
  		container['_leaflet_disable_events'] = true;

  		this._ctx = container.getContext('2d');
  	},

  	_destroyContainer: function () {
  		cancelAnimFrame(this._redrawRequest);
  		delete this._ctx;
  		remove(this._container);
  		off(this._container);
  		delete this._container;
  	},

  	_updatePaths: function () {
  		if (this._postponeUpdatePaths) { return; }

  		var layer;
  		this._redrawBounds = null;
  		for (var id in this._layers) {
  			layer = this._layers[id];
  			layer._update();
  		}
  		this._redraw();
  	},

  	_update: function () {
  		if (this._map._animatingZoom && this._bounds) { return; }

  		Renderer$1.prototype._update.call(this);

  		var b = this._bounds,
  		    container = this._container,
  		    size = b.getSize(),
  		    m = Browser.retina ? 2 : 1;

  		setPosition(container, b.min);

  		// set canvas size (also clearing it); use double size on retina
  		container.width = m * size.x;
  		container.height = m * size.y;
  		container.style.width = size.x + 'px';
  		container.style.height = size.y + 'px';

  		if (Browser.retina) {
  			this._ctx.scale(2, 2);
  		}

  		// translate so we use the same path coordinates after canvas element moves
  		this._ctx.translate(-b.min.x, -b.min.y);

  		// Tell paths to redraw themselves
  		this.fire('update');
  	},

  	_reset: function () {
  		Renderer$1.prototype._reset.call(this);

  		if (this._postponeUpdatePaths) {
  			this._postponeUpdatePaths = false;
  			this._updatePaths();
  		}
  	},

  	_initPath: function (layer) {
  		this._updateDashArray(layer);
  		this._layers[stamp(layer)] = layer;

  		var order = layer._order = {
  			layer: layer,
  			prev: this._drawLast,
  			next: null
  		};
  		if (this._drawLast) { this._drawLast.next = order; }
  		this._drawLast = order;
  		this._drawFirst = this._drawFirst || this._drawLast;
  	},

  	_addPath: function (layer) {
  		this._requestRedraw(layer);
  	},

  	_removePath: function (layer) {
  		var order = layer._order;
  		var next = order.next;
  		var prev = order.prev;

  		if (next) {
  			next.prev = prev;
  		} else {
  			this._drawLast = prev;
  		}
  		if (prev) {
  			prev.next = next;
  		} else {
  			this._drawFirst = next;
  		}

  		delete layer._order;

  		delete this._layers[stamp(layer)];

  		this._requestRedraw(layer);
  	},

  	_updatePath: function (layer) {
  		// Redraw the union of the layer's old pixel
  		// bounds and the new pixel bounds.
  		this._extendRedrawBounds(layer);
  		layer._project();
  		layer._update();
  		// The redraw will extend the redraw bounds
  		// with the new pixel bounds.
  		this._requestRedraw(layer);
  	},

  	_updateStyle: function (layer) {
  		this._updateDashArray(layer);
  		this._requestRedraw(layer);
  	},

  	_updateDashArray: function (layer) {
  		if (typeof layer.options.dashArray === 'string') {
  			var parts = layer.options.dashArray.split(/[, ]+/),
  			    dashArray = [],
  			    dashValue,
  			    i;
  			for (i = 0; i < parts.length; i++) {
  				dashValue = Number(parts[i]);
  				// Ignore dash array containing invalid lengths
  				if (isNaN(dashValue)) { return; }
  				dashArray.push(dashValue);
  			}
  			layer.options._dashArray = dashArray;
  		} else {
  			layer.options._dashArray = layer.options.dashArray;
  		}
  	},

  	_requestRedraw: function (layer) {
  		if (!this._map) { return; }

  		this._extendRedrawBounds(layer);
  		this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
  	},

  	_extendRedrawBounds: function (layer) {
  		if (layer._pxBounds) {
  			var padding = (layer.options.weight || 0) + 1;
  			this._redrawBounds = this._redrawBounds || new Bounds();
  			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
  			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
  		}
  	},

  	_redraw: function () {
  		this._redrawRequest = null;

  		if (this._redrawBounds) {
  			this._redrawBounds.min._floor();
  			this._redrawBounds.max._ceil();
  		}

  		this._clear(); // clear layers in redraw bounds
  		this._draw(); // draw layers

  		this._redrawBounds = null;
  	},

  	_clear: function () {
  		var bounds = this._redrawBounds;
  		if (bounds) {
  			var size = bounds.getSize();
  			this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
  		} else {
  			this._ctx.save();
  			this._ctx.setTransform(1, 0, 0, 1, 0, 0);
  			this._ctx.clearRect(0, 0, this._container.width, this._container.height);
  			this._ctx.restore();
  		}
  	},

  	_draw: function () {
  		var layer, bounds = this._redrawBounds;
  		this._ctx.save();
  		if (bounds) {
  			var size = bounds.getSize();
  			this._ctx.beginPath();
  			this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
  			this._ctx.clip();
  		}

  		this._drawing = true;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
  				layer._updatePath();
  			}
  		}

  		this._drawing = false;

  		this._ctx.restore();  // Restore state before clipping.
  	},

  	_updatePoly: function (layer, closed) {
  		if (!this._drawing) { return; }

  		var i, j, len2, p,
  		    parts = layer._parts,
  		    len = parts.length,
  		    ctx = this._ctx;

  		if (!len) { return; }

  		ctx.beginPath();

  		for (i = 0; i < len; i++) {
  			for (j = 0, len2 = parts[i].length; j < len2; j++) {
  				p = parts[i][j];
  				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
  			}
  			if (closed) {
  				ctx.closePath();
  			}
  		}

  		this._fillStroke(ctx, layer);

  		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
  	},

  	_updateCircle: function (layer) {

  		if (!this._drawing || layer._empty()) { return; }

  		var p = layer._point,
  		    ctx = this._ctx,
  		    r = Math.max(Math.round(layer._radius), 1),
  		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

  		if (s !== 1) {
  			ctx.save();
  			ctx.scale(1, s);
  		}

  		ctx.beginPath();
  		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

  		if (s !== 1) {
  			ctx.restore();
  		}

  		this._fillStroke(ctx, layer);
  	},

  	_fillStroke: function (ctx, layer) {
  		var options = layer.options;

  		if (options.fill) {
  			ctx.globalAlpha = options.fillOpacity;
  			ctx.fillStyle = options.fillColor || options.color;
  			ctx.fill(options.fillRule || 'evenodd');
  		}

  		if (options.stroke && options.weight !== 0) {
  			if (ctx.setLineDash) {
  				ctx.setLineDash(layer.options && layer.options._dashArray || []);
  			}
  			ctx.globalAlpha = options.opacity;
  			ctx.lineWidth = options.weight;
  			ctx.strokeStyle = options.color;
  			ctx.lineCap = options.lineCap;
  			ctx.lineJoin = options.lineJoin;
  			ctx.stroke();
  		}
  	},

  	// Canvas obviously doesn't have mouse events for individual drawn objects,
  	// so we emulate that by calculating what's under the mouse on mousemove/click manually

  	_onClick: function (e) {
  		var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (layer.options.interactive && layer._containsPoint(point)) {
  				if (!(e.type === 'click' || e.type === 'preclick') || !this._map._draggableMoved(layer)) {
  					clickedLayer = layer;
  				}
  			}
  		}
  		this._fireEvent(clickedLayer ? [clickedLayer] : false, e);
  	},

  	_onMouseMove: function (e) {
  		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

  		var point = this._map.mouseEventToLayerPoint(e);
  		this._handleMouseHover(e, point);
  	},


  	_handleMouseOut: function (e) {
  		var layer = this._hoveredLayer;
  		if (layer) {
  			// if we're leaving the layer, fire mouseout
  			removeClass(this._container, 'leaflet-interactive');
  			this._fireEvent([layer], e, 'mouseout');
  			this._hoveredLayer = null;
  			this._mouseHoverThrottled = false;
  		}
  	},

  	_handleMouseHover: function (e, point) {
  		if (this._mouseHoverThrottled) {
  			return;
  		}

  		var layer, candidateHoveredLayer;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (layer.options.interactive && layer._containsPoint(point)) {
  				candidateHoveredLayer = layer;
  			}
  		}

  		if (candidateHoveredLayer !== this._hoveredLayer) {
  			this._handleMouseOut(e);

  			if (candidateHoveredLayer) {
  				addClass(this._container, 'leaflet-interactive'); // change cursor
  				this._fireEvent([candidateHoveredLayer], e, 'mouseover');
  				this._hoveredLayer = candidateHoveredLayer;
  			}
  		}

  		this._fireEvent(this._hoveredLayer ? [this._hoveredLayer] : false, e);

  		this._mouseHoverThrottled = true;
  		setTimeout(bind(function () {
  			this._mouseHoverThrottled = false;
  		}, this), 32);
  	},

  	_fireEvent: function (layers, e, type) {
  		this._map._fireDOMEvent(e, type || e.type, layers);
  	},

  	_bringToFront: function (layer) {
  		var order = layer._order;

  		if (!order) { return; }

  		var next = order.next;
  		var prev = order.prev;

  		if (next) {
  			next.prev = prev;
  		} else {
  			// Already last
  			return;
  		}
  		if (prev) {
  			prev.next = next;
  		} else if (next) {
  			// Update first entry unless this is the
  			// single entry
  			this._drawFirst = next;
  		}

  		order.prev = this._drawLast;
  		this._drawLast.next = order;

  		order.next = null;
  		this._drawLast = order;

  		this._requestRedraw(layer);
  	},

  	_bringToBack: function (layer) {
  		var order = layer._order;

  		if (!order) { return; }

  		var next = order.next;
  		var prev = order.prev;

  		if (prev) {
  			prev.next = next;
  		} else {
  			// Already first
  			return;
  		}
  		if (next) {
  			next.prev = prev;
  		} else if (prev) {
  			// Update last entry unless this is the
  			// single entry
  			this._drawLast = prev;
  		}

  		order.prev = null;

  		order.next = this._drawFirst;
  		this._drawFirst.prev = order;
  		this._drawFirst = order;

  		this._requestRedraw(layer);
  	}
  });

  // @factory L.canvas(options?: Renderer options)
  // Creates a Canvas renderer with the given options.
  function canvas(options) {
  	return Browser.canvas ? new Canvas(options) : null;
  }

  /*
   * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
   */


  var vmlCreate = (function () {
  	try {
  		document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
  		return function (name) {
  			return document.createElement('<lvml:' + name + ' class="lvml">');
  		};
  	} catch (e) {
  		// Do not return fn from catch block so `e` can be garbage collected
  		// See https://github.com/Leaflet/Leaflet/pull/7279
  	}
  	return function (name) {
  		return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
  	};
  })();


  /*
   * @class SVG
   *
   *
   * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
   * with old versions of Internet Explorer.
   */

  // mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
  var vmlMixin = {

  	_initContainer: function () {
  		this._container = create$1('div', 'leaflet-vml-container');
  	},

  	_update: function () {
  		if (this._map._animatingZoom) { return; }
  		Renderer$1.prototype._update.call(this);
  		this.fire('update');
  	},

  	_initPath: function (layer) {
  		var container = layer._container = vmlCreate('shape');

  		addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

  		container.coordsize = '1 1';

  		layer._path = vmlCreate('path');
  		container.appendChild(layer._path);

  		this._updateStyle(layer);
  		this._layers[stamp(layer)] = layer;
  	},

  	_addPath: function (layer) {
  		var container = layer._container;
  		this._container.appendChild(container);

  		if (layer.options.interactive) {
  			layer.addInteractiveTarget(container);
  		}
  	},

  	_removePath: function (layer) {
  		var container = layer._container;
  		remove(container);
  		layer.removeInteractiveTarget(container);
  		delete this._layers[stamp(layer)];
  	},

  	_updateStyle: function (layer) {
  		var stroke = layer._stroke,
  		    fill = layer._fill,
  		    options = layer.options,
  		    container = layer._container;

  		container.stroked = !!options.stroke;
  		container.filled = !!options.fill;

  		if (options.stroke) {
  			if (!stroke) {
  				stroke = layer._stroke = vmlCreate('stroke');
  			}
  			container.appendChild(stroke);
  			stroke.weight = options.weight + 'px';
  			stroke.color = options.color;
  			stroke.opacity = options.opacity;

  			if (options.dashArray) {
  				stroke.dashStyle = isArray(options.dashArray) ?
  				    options.dashArray.join(' ') :
  				    options.dashArray.replace(/( *, *)/g, ' ');
  			} else {
  				stroke.dashStyle = '';
  			}
  			stroke.endcap = options.lineCap.replace('butt', 'flat');
  			stroke.joinstyle = options.lineJoin;

  		} else if (stroke) {
  			container.removeChild(stroke);
  			layer._stroke = null;
  		}

  		if (options.fill) {
  			if (!fill) {
  				fill = layer._fill = vmlCreate('fill');
  			}
  			container.appendChild(fill);
  			fill.color = options.fillColor || options.color;
  			fill.opacity = options.fillOpacity;

  		} else if (fill) {
  			container.removeChild(fill);
  			layer._fill = null;
  		}
  	},

  	_updateCircle: function (layer) {
  		var p = layer._point.round(),
  		    r = Math.round(layer._radius),
  		    r2 = Math.round(layer._radiusY || r);

  		this._setPath(layer, layer._empty() ? 'M0 0' :
  			'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
  	},

  	_setPath: function (layer, path) {
  		layer._path.v = path;
  	},

  	_bringToFront: function (layer) {
  		toFront(layer._container);
  	},

  	_bringToBack: function (layer) {
  		toBack(layer._container);
  	}
  };

  var create = Browser.vml ? vmlCreate : svgCreate;

  /*
   * @class SVG
   * @inherits Renderer
   * @aka L.SVG
   *
   * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
   * Inherits `Renderer`.
   *
   * Due to [technical limitations](https://caniuse.com/svg), SVG is not
   * available in all web browsers, notably Android 2.x and 3.x.
   *
   * Although SVG is not available on IE7 and IE8, these browsers support
   * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
   * (a now deprecated technology), and the SVG renderer will fall back to VML in
   * this case.
   *
   * @example
   *
   * Use SVG by default for all paths in the map:
   *
   * ```js
   * var map = L.map('map', {
   * 	renderer: L.svg()
   * });
   * ```
   *
   * Use a SVG renderer with extra padding for specific vector geometries:
   *
   * ```js
   * var map = L.map('map');
   * var myRenderer = L.svg({ padding: 0.5 });
   * var line = L.polyline( coordinates, { renderer: myRenderer } );
   * var circle = L.circle( center, { renderer: myRenderer } );
   * ```
   */

  var SVG = Renderer$1.extend({

  	_initContainer: function () {
  		this._container = create('svg');

  		// makes it possible to click through svg root; we'll reset it back in individual paths
  		this._container.setAttribute('pointer-events', 'none');

  		this._rootGroup = create('g');
  		this._container.appendChild(this._rootGroup);
  	},

  	_destroyContainer: function () {
  		remove(this._container);
  		off(this._container);
  		delete this._container;
  		delete this._rootGroup;
  		delete this._svgSize;
  	},

  	_update: function () {
  		if (this._map._animatingZoom && this._bounds) { return; }

  		Renderer$1.prototype._update.call(this);

  		var b = this._bounds,
  		    size = b.getSize(),
  		    container = this._container;

  		// set size of svg-container if changed
  		if (!this._svgSize || !this._svgSize.equals(size)) {
  			this._svgSize = size;
  			container.setAttribute('width', size.x);
  			container.setAttribute('height', size.y);
  		}

  		// movement: update container viewBox so that we don't have to change coordinates of individual layers
  		setPosition(container, b.min);
  		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

  		this.fire('update');
  	},

  	// methods below are called by vector layers implementations

  	_initPath: function (layer) {
  		var path = layer._path = create('path');

  		// @namespace Path
  		// @option className: String = null
  		// Custom class name set on an element. Only for SVG renderer.
  		if (layer.options.className) {
  			addClass(path, layer.options.className);
  		}

  		if (layer.options.interactive) {
  			addClass(path, 'leaflet-interactive');
  		}

  		this._updateStyle(layer);
  		this._layers[stamp(layer)] = layer;
  	},

  	_addPath: function (layer) {
  		if (!this._rootGroup) { this._initContainer(); }
  		this._rootGroup.appendChild(layer._path);
  		layer.addInteractiveTarget(layer._path);
  	},

  	_removePath: function (layer) {
  		remove(layer._path);
  		layer.removeInteractiveTarget(layer._path);
  		delete this._layers[stamp(layer)];
  	},

  	_updatePath: function (layer) {
  		layer._project();
  		layer._update();
  	},

  	_updateStyle: function (layer) {
  		var path = layer._path,
  		    options = layer.options;

  		if (!path) { return; }

  		if (options.stroke) {
  			path.setAttribute('stroke', options.color);
  			path.setAttribute('stroke-opacity', options.opacity);
  			path.setAttribute('stroke-width', options.weight);
  			path.setAttribute('stroke-linecap', options.lineCap);
  			path.setAttribute('stroke-linejoin', options.lineJoin);

  			if (options.dashArray) {
  				path.setAttribute('stroke-dasharray', options.dashArray);
  			} else {
  				path.removeAttribute('stroke-dasharray');
  			}

  			if (options.dashOffset) {
  				path.setAttribute('stroke-dashoffset', options.dashOffset);
  			} else {
  				path.removeAttribute('stroke-dashoffset');
  			}
  		} else {
  			path.setAttribute('stroke', 'none');
  		}

  		if (options.fill) {
  			path.setAttribute('fill', options.fillColor || options.color);
  			path.setAttribute('fill-opacity', options.fillOpacity);
  			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
  		} else {
  			path.setAttribute('fill', 'none');
  		}
  	},

  	_updatePoly: function (layer, closed) {
  		this._setPath(layer, pointsToPath(layer._parts, closed));
  	},

  	_updateCircle: function (layer) {
  		var p = layer._point,
  		    r = Math.max(Math.round(layer._radius), 1),
  		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
  		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

  		// drawing a circle with two half-arcs
  		var d = layer._empty() ? 'M0 0' :
  			'M' + (p.x - r) + ',' + p.y +
  			arc + (r * 2) + ',0 ' +
  			arc + (-r * 2) + ',0 ';

  		this._setPath(layer, d);
  	},

  	_setPath: function (layer, path) {
  		layer._path.setAttribute('d', path);
  	},

  	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
  	_bringToFront: function (layer) {
  		toFront(layer._path);
  	},

  	_bringToBack: function (layer) {
  		toBack(layer._path);
  	}
  });

  if (Browser.vml) {
  	SVG.include(vmlMixin);
  }

  // @namespace SVG
  // @factory L.svg(options?: Renderer options)
  // Creates a SVG renderer with the given options.
  function svg(options) {
  	return Browser.svg || Browser.vml ? new SVG(options) : null;
  }

  Map$1.include({
  	// @namespace Map; @method getRenderer(layer: Path): Renderer
  	// Returns the instance of `Renderer` that should be used to render the given
  	// `Path`. It will ensure that the `renderer` options of the map and paths
  	// are respected, and that the renderers do exist on the map.
  	getRenderer: function (layer) {
  		// @namespace Path; @option renderer: Renderer
  		// Use this specific instance of `Renderer` for this path. Takes
  		// precedence over the map's [default renderer](#map-renderer).
  		var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

  		if (!renderer) {
  			renderer = this._renderer = this._createRenderer();
  		}

  		if (!this.hasLayer(renderer)) {
  			this.addLayer(renderer);
  		}
  		return renderer;
  	},

  	_getPaneRenderer: function (name) {
  		if (name === 'overlayPane' || name === undefined) {
  			return false;
  		}

  		var renderer = this._paneRenderers[name];
  		if (renderer === undefined) {
  			renderer = this._createRenderer({pane: name});
  			this._paneRenderers[name] = renderer;
  		}
  		return renderer;
  	},

  	_createRenderer: function (options) {
  		// @namespace Map; @option preferCanvas: Boolean = false
  		// Whether `Path`s should be rendered on a `Canvas` renderer.
  		// By default, all `Path`s are rendered in a `SVG` renderer.
  		return (this.options.preferCanvas && canvas(options)) || svg(options);
  	}
  });

  /*
   * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
   */

  /*
   * @class Rectangle
   * @aka L.Rectangle
   * @inherits Polygon
   *
   * A class for drawing rectangle overlays on a map. Extends `Polygon`.
   *
   * @example
   *
   * ```js
   * // define rectangle geographical bounds
   * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
   *
   * // create an orange rectangle
   * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
   *
   * // zoom the map to the rectangle bounds
   * map.fitBounds(bounds);
   * ```
   *
   */


  var Rectangle = Polygon.extend({
  	initialize: function (latLngBounds, options) {
  		Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
  	},

  	// @method setBounds(latLngBounds: LatLngBounds): this
  	// Redraws the rectangle with the passed bounds.
  	setBounds: function (latLngBounds) {
  		return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
  	},

  	_boundsToLatLngs: function (latLngBounds) {
  		latLngBounds = toLatLngBounds(latLngBounds);
  		return [
  			latLngBounds.getSouthWest(),
  			latLngBounds.getNorthWest(),
  			latLngBounds.getNorthEast(),
  			latLngBounds.getSouthEast()
  		];
  	}
  });


  // @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
  function rectangle(latLngBounds, options) {
  	return new Rectangle(latLngBounds, options);
  }

  SVG.create = create;
  SVG.pointsToPath = pointsToPath;

  GeoJSON.geometryToLayer = geometryToLayer;
  GeoJSON.coordsToLatLng = coordsToLatLng;
  GeoJSON.coordsToLatLngs = coordsToLatLngs;
  GeoJSON.latLngToCoords = latLngToCoords;
  GeoJSON.latLngsToCoords = latLngsToCoords;
  GeoJSON.getFeature = getFeature;
  GeoJSON.asFeature = asFeature;

  /*
   * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
   * (zoom to a selected bounding box), enabled by default.
   */

  // @namespace Map
  // @section Interaction Options
  Map$1.mergeOptions({
  	// @option boxZoom: Boolean = true
  	// Whether the map can be zoomed to a rectangular area specified by
  	// dragging the mouse while pressing the shift key.
  	boxZoom: true
  });

  var BoxZoom = Handler.extend({
  	initialize: function (map) {
  		this._map = map;
  		this._container = map._container;
  		this._pane = map._panes.overlayPane;
  		this._resetStateTimeout = 0;
  		map.on('unload', this._destroy, this);
  	},

  	addHooks: function () {
  		on(this._container, 'mousedown', this._onMouseDown, this);
  	},

  	removeHooks: function () {
  		off(this._container, 'mousedown', this._onMouseDown, this);
  	},

  	moved: function () {
  		return this._moved;
  	},

  	_destroy: function () {
  		remove(this._pane);
  		delete this._pane;
  	},

  	_resetState: function () {
  		this._resetStateTimeout = 0;
  		this._moved = false;
  	},

  	_clearDeferredResetState: function () {
  		if (this._resetStateTimeout !== 0) {
  			clearTimeout(this._resetStateTimeout);
  			this._resetStateTimeout = 0;
  		}
  	},

  	_onMouseDown: function (e) {
  		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

  		// Clear the deferred resetState if it hasn't executed yet, otherwise it
  		// will interrupt the interaction and orphan a box element in the container.
  		this._clearDeferredResetState();
  		this._resetState();

  		disableTextSelection();
  		disableImageDrag();

  		this._startPoint = this._map.mouseEventToContainerPoint(e);

  		on(document, {
  			contextmenu: stop,
  			mousemove: this._onMouseMove,
  			mouseup: this._onMouseUp,
  			keydown: this._onKeyDown
  		}, this);
  	},

  	_onMouseMove: function (e) {
  		if (!this._moved) {
  			this._moved = true;

  			this._box = create$1('div', 'leaflet-zoom-box', this._container);
  			addClass(this._container, 'leaflet-crosshair');

  			this._map.fire('boxzoomstart');
  		}

  		this._point = this._map.mouseEventToContainerPoint(e);

  		var bounds = new Bounds(this._point, this._startPoint),
  		    size = bounds.getSize();

  		setPosition(this._box, bounds.min);

  		this._box.style.width  = size.x + 'px';
  		this._box.style.height = size.y + 'px';
  	},

  	_finish: function () {
  		if (this._moved) {
  			remove(this._box);
  			removeClass(this._container, 'leaflet-crosshair');
  		}

  		enableTextSelection();
  		enableImageDrag();

  		off(document, {
  			contextmenu: stop,
  			mousemove: this._onMouseMove,
  			mouseup: this._onMouseUp,
  			keydown: this._onKeyDown
  		}, this);
  	},

  	_onMouseUp: function (e) {
  		if ((e.which !== 1) && (e.button !== 1)) { return; }

  		this._finish();

  		if (!this._moved) { return; }
  		// Postpone to next JS tick so internal click event handling
  		// still see it as "moved".
  		this._clearDeferredResetState();
  		this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

  		var bounds = new LatLngBounds(
  		        this._map.containerPointToLatLng(this._startPoint),
  		        this._map.containerPointToLatLng(this._point));

  		this._map
  			.fitBounds(bounds)
  			.fire('boxzoomend', {boxZoomBounds: bounds});
  	},

  	_onKeyDown: function (e) {
  		if (e.keyCode === 27) {
  			this._finish();
  			this._clearDeferredResetState();
  			this._resetState();
  		}
  	}
  });

  // @section Handlers
  // @property boxZoom: Handler
  // Box (shift-drag with mouse) zoom handler.
  Map$1.addInitHook('addHandler', 'boxZoom', BoxZoom);

  /*
   * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
   */

  // @namespace Map
  // @section Interaction Options

  Map$1.mergeOptions({
  	// @option doubleClickZoom: Boolean|String = true
  	// Whether the map can be zoomed in by double clicking on it and
  	// zoomed out by double clicking while holding shift. If passed
  	// `'center'`, double-click zoom will zoom to the center of the
  	//  view regardless of where the mouse was.
  	doubleClickZoom: true
  });

  var DoubleClickZoom = Handler.extend({
  	addHooks: function () {
  		this._map.on('dblclick', this._onDoubleClick, this);
  	},

  	removeHooks: function () {
  		this._map.off('dblclick', this._onDoubleClick, this);
  	},

  	_onDoubleClick: function (e) {
  		var map = this._map,
  		    oldZoom = map.getZoom(),
  		    delta = map.options.zoomDelta,
  		    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

  		if (map.options.doubleClickZoom === 'center') {
  			map.setZoom(zoom);
  		} else {
  			map.setZoomAround(e.containerPoint, zoom);
  		}
  	}
  });

  // @section Handlers
  //
  // Map properties include interaction handlers that allow you to control
  // interaction behavior in runtime, enabling or disabling certain features such
  // as dragging or touch zoom (see `Handler` methods). For example:
  //
  // ```js
  // map.doubleClickZoom.disable();
  // ```
  //
  // @property doubleClickZoom: Handler
  // Double click zoom handler.
  Map$1.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

  /*
   * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
   */

  // @namespace Map
  // @section Interaction Options
  Map$1.mergeOptions({
  	// @option dragging: Boolean = true
  	// Whether the map is draggable with mouse/touch or not.
  	dragging: true,

  	// @section Panning Inertia Options
  	// @option inertia: Boolean = *
  	// If enabled, panning of the map will have an inertia effect where
  	// the map builds momentum while dragging and continues moving in
  	// the same direction for some time. Feels especially nice on touch
  	// devices. Enabled by default.
  	inertia: true,

  	// @option inertiaDeceleration: Number = 3000
  	// The rate with which the inertial movement slows down, in pixels/second².
  	inertiaDeceleration: 3400, // px/s^2

  	// @option inertiaMaxSpeed: Number = Infinity
  	// Max speed of the inertial movement, in pixels/second.
  	inertiaMaxSpeed: Infinity, // px/s

  	// @option easeLinearity: Number = 0.2
  	easeLinearity: 0.2,

  	// TODO refactor, move to CRS
  	// @option worldCopyJump: Boolean = false
  	// With this option enabled, the map tracks when you pan to another "copy"
  	// of the world and seamlessly jumps to the original one so that all overlays
  	// like markers and vector layers are still visible.
  	worldCopyJump: false,

  	// @option maxBoundsViscosity: Number = 0.0
  	// If `maxBounds` is set, this option will control how solid the bounds
  	// are when dragging the map around. The default value of `0.0` allows the
  	// user to drag outside the bounds at normal speed, higher values will
  	// slow down map dragging outside bounds, and `1.0` makes the bounds fully
  	// solid, preventing the user from dragging outside the bounds.
  	maxBoundsViscosity: 0.0
  });

  var Drag = Handler.extend({
  	addHooks: function () {
  		if (!this._draggable) {
  			var map = this._map;

  			this._draggable = new Draggable(map._mapPane, map._container);

  			this._draggable.on({
  				dragstart: this._onDragStart,
  				drag: this._onDrag,
  				dragend: this._onDragEnd
  			}, this);

  			this._draggable.on('predrag', this._onPreDragLimit, this);
  			if (map.options.worldCopyJump) {
  				this._draggable.on('predrag', this._onPreDragWrap, this);
  				map.on('zoomend', this._onZoomEnd, this);

  				map.whenReady(this._onZoomEnd, this);
  			}
  		}
  		addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
  		this._draggable.enable();
  		this._positions = [];
  		this._times = [];
  	},

  	removeHooks: function () {
  		removeClass(this._map._container, 'leaflet-grab');
  		removeClass(this._map._container, 'leaflet-touch-drag');
  		this._draggable.disable();
  	},

  	moved: function () {
  		return this._draggable && this._draggable._moved;
  	},

  	moving: function () {
  		return this._draggable && this._draggable._moving;
  	},

  	_onDragStart: function () {
  		var map = this._map;

  		map._stop();
  		if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
  			var bounds = toLatLngBounds(this._map.options.maxBounds);

  			this._offsetLimit = toBounds(
  				this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
  				this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
  					.add(this._map.getSize()));

  			this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
  		} else {
  			this._offsetLimit = null;
  		}

  		map
  		    .fire('movestart')
  		    .fire('dragstart');

  		if (map.options.inertia) {
  			this._positions = [];
  			this._times = [];
  		}
  	},

  	_onDrag: function (e) {
  		if (this._map.options.inertia) {
  			var time = this._lastTime = +new Date(),
  			    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

  			this._positions.push(pos);
  			this._times.push(time);

  			this._prunePositions(time);
  		}

  		this._map
  		    .fire('move', e)
  		    .fire('drag', e);
  	},

  	_prunePositions: function (time) {
  		while (this._positions.length > 1 && time - this._times[0] > 50) {
  			this._positions.shift();
  			this._times.shift();
  		}
  	},

  	_onZoomEnd: function () {
  		var pxCenter = this._map.getSize().divideBy(2),
  		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

  		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
  		this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
  	},

  	_viscousLimit: function (value, threshold) {
  		return value - (value - threshold) * this._viscosity;
  	},

  	_onPreDragLimit: function () {
  		if (!this._viscosity || !this._offsetLimit) { return; }

  		var offset = this._draggable._newPos.subtract(this._draggable._startPos);

  		var limit = this._offsetLimit;
  		if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
  		if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
  		if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
  		if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

  		this._draggable._newPos = this._draggable._startPos.add(offset);
  	},

  	_onPreDragWrap: function () {
  		// TODO refactor to be able to adjust map pane position after zoom
  		var worldWidth = this._worldWidth,
  		    halfWidth = Math.round(worldWidth / 2),
  		    dx = this._initialWorldOffset,
  		    x = this._draggable._newPos.x,
  		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
  		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
  		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

  		this._draggable._absPos = this._draggable._newPos.clone();
  		this._draggable._newPos.x = newX;
  	},

  	_onDragEnd: function (e) {
  		var map = this._map,
  		    options = map.options,

  		    noInertia = !options.inertia || e.noInertia || this._times.length < 2;

  		map.fire('dragend', e);

  		if (noInertia) {
  			map.fire('moveend');

  		} else {
  			this._prunePositions(+new Date());

  			var direction = this._lastPos.subtract(this._positions[0]),
  			    duration = (this._lastTime - this._times[0]) / 1000,
  			    ease = options.easeLinearity,

  			    speedVector = direction.multiplyBy(ease / duration),
  			    speed = speedVector.distanceTo([0, 0]),

  			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
  			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

  			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
  			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

  			if (!offset.x && !offset.y) {
  				map.fire('moveend');

  			} else {
  				offset = map._limitOffset(offset, map.options.maxBounds);

  				requestAnimFrame(function () {
  					map.panBy(offset, {
  						duration: decelerationDuration,
  						easeLinearity: ease,
  						noMoveStart: true,
  						animate: true
  					});
  				});
  			}
  		}
  	}
  });

  // @section Handlers
  // @property dragging: Handler
  // Map dragging handler (by both mouse and touch).
  Map$1.addInitHook('addHandler', 'dragging', Drag);

  /*
   * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
   */

  // @namespace Map
  // @section Keyboard Navigation Options
  Map$1.mergeOptions({
  	// @option keyboard: Boolean = true
  	// Makes the map focusable and allows users to navigate the map with keyboard
  	// arrows and `+`/`-` keys.
  	keyboard: true,

  	// @option keyboardPanDelta: Number = 80
  	// Amount of pixels to pan when pressing an arrow key.
  	keyboardPanDelta: 80
  });

  var Keyboard = Handler.extend({

  	keyCodes: {
  		left:    [37],
  		right:   [39],
  		down:    [40],
  		up:      [38],
  		zoomIn:  [187, 107, 61, 171],
  		zoomOut: [189, 109, 54, 173]
  	},

  	initialize: function (map) {
  		this._map = map;

  		this._setPanDelta(map.options.keyboardPanDelta);
  		this._setZoomDelta(map.options.zoomDelta);
  	},

  	addHooks: function () {
  		var container = this._map._container;

  		// make the container focusable by tabbing
  		if (container.tabIndex <= 0) {
  			container.tabIndex = '0';
  		}

  		on(container, {
  			focus: this._onFocus,
  			blur: this._onBlur,
  			mousedown: this._onMouseDown
  		}, this);

  		this._map.on({
  			focus: this._addHooks,
  			blur: this._removeHooks
  		}, this);
  	},

  	removeHooks: function () {
  		this._removeHooks();

  		off(this._map._container, {
  			focus: this._onFocus,
  			blur: this._onBlur,
  			mousedown: this._onMouseDown
  		}, this);

  		this._map.off({
  			focus: this._addHooks,
  			blur: this._removeHooks
  		}, this);
  	},

  	_onMouseDown: function () {
  		if (this._focused) { return; }

  		var body = document.body,
  		    docEl = document.documentElement,
  		    top = body.scrollTop || docEl.scrollTop,
  		    left = body.scrollLeft || docEl.scrollLeft;

  		this._map._container.focus();

  		window.scrollTo(left, top);
  	},

  	_onFocus: function () {
  		this._focused = true;
  		this._map.fire('focus');
  	},

  	_onBlur: function () {
  		this._focused = false;
  		this._map.fire('blur');
  	},

  	_setPanDelta: function (panDelta) {
  		var keys = this._panKeys = {},
  		    codes = this.keyCodes,
  		    i, len;

  		for (i = 0, len = codes.left.length; i < len; i++) {
  			keys[codes.left[i]] = [-1 * panDelta, 0];
  		}
  		for (i = 0, len = codes.right.length; i < len; i++) {
  			keys[codes.right[i]] = [panDelta, 0];
  		}
  		for (i = 0, len = codes.down.length; i < len; i++) {
  			keys[codes.down[i]] = [0, panDelta];
  		}
  		for (i = 0, len = codes.up.length; i < len; i++) {
  			keys[codes.up[i]] = [0, -1 * panDelta];
  		}
  	},

  	_setZoomDelta: function (zoomDelta) {
  		var keys = this._zoomKeys = {},
  		    codes = this.keyCodes,
  		    i, len;

  		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
  			keys[codes.zoomIn[i]] = zoomDelta;
  		}
  		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
  			keys[codes.zoomOut[i]] = -zoomDelta;
  		}
  	},

  	_addHooks: function () {
  		on(document, 'keydown', this._onKeyDown, this);
  	},

  	_removeHooks: function () {
  		off(document, 'keydown', this._onKeyDown, this);
  	},

  	_onKeyDown: function (e) {
  		if (e.altKey || e.ctrlKey || e.metaKey) { return; }

  		var key = e.keyCode,
  		    map = this._map,
  		    offset;

  		if (key in this._panKeys) {
  			if (!map._panAnim || !map._panAnim._inProgress) {
  				offset = this._panKeys[key];
  				if (e.shiftKey) {
  					offset = toPoint(offset).multiplyBy(3);
  				}

  				if (map.options.maxBounds) {
  					offset = map._limitOffset(toPoint(offset), map.options.maxBounds);
  				}

  				if (map.options.worldCopyJump) {
  					var newLatLng = map.wrapLatLng(map.unproject(map.project(map.getCenter()).add(offset)));
  					map.panTo(newLatLng);
  				} else {
  					map.panBy(offset);
  				}
  			}
  		} else if (key in this._zoomKeys) {
  			map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

  		} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
  			map.closePopup();

  		} else {
  			return;
  		}

  		stop(e);
  	}
  });

  // @section Handlers
  // @section Handlers
  // @property keyboard: Handler
  // Keyboard navigation handler.
  Map$1.addInitHook('addHandler', 'keyboard', Keyboard);

  /*
   * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
   */

  // @namespace Map
  // @section Interaction Options
  Map$1.mergeOptions({
  	// @section Mouse wheel options
  	// @option scrollWheelZoom: Boolean|String = true
  	// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
  	// it will zoom to the center of the view regardless of where the mouse was.
  	scrollWheelZoom: true,

  	// @option wheelDebounceTime: Number = 40
  	// Limits the rate at which a wheel can fire (in milliseconds). By default
  	// user can't zoom via wheel more often than once per 40 ms.
  	wheelDebounceTime: 40,

  	// @option wheelPxPerZoomLevel: Number = 60
  	// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
  	// mean a change of one full zoom level. Smaller values will make wheel-zooming
  	// faster (and vice versa).
  	wheelPxPerZoomLevel: 60
  });

  var ScrollWheelZoom = Handler.extend({
  	addHooks: function () {
  		on(this._map._container, 'wheel', this._onWheelScroll, this);

  		this._delta = 0;
  	},

  	removeHooks: function () {
  		off(this._map._container, 'wheel', this._onWheelScroll, this);
  	},

  	_onWheelScroll: function (e) {
  		var delta = getWheelDelta(e);

  		var debounce = this._map.options.wheelDebounceTime;

  		this._delta += delta;
  		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

  		if (!this._startTime) {
  			this._startTime = +new Date();
  		}

  		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

  		clearTimeout(this._timer);
  		this._timer = setTimeout(bind(this._performZoom, this), left);

  		stop(e);
  	},

  	_performZoom: function () {
  		var map = this._map,
  		    zoom = map.getZoom(),
  		    snap = this._map.options.zoomSnap || 0;

  		map._stop(); // stop panning and fly animations if any

  		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
  		var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
  		    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
  		    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
  		    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

  		this._delta = 0;
  		this._startTime = null;

  		if (!delta) { return; }

  		if (map.options.scrollWheelZoom === 'center') {
  			map.setZoom(zoom + delta);
  		} else {
  			map.setZoomAround(this._lastMousePos, zoom + delta);
  		}
  	}
  });

  // @section Handlers
  // @property scrollWheelZoom: Handler
  // Scroll wheel zoom handler.
  Map$1.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

  /*
   * L.Map.TapHold is used to simulate `contextmenu` event on long hold,
   * which otherwise is not fired by mobile Safari.
   */

  var tapHoldDelay = 600;

  // @namespace Map
  // @section Interaction Options
  Map$1.mergeOptions({
  	// @section Touch interaction options
  	// @option tapHold: Boolean
  	// Enables simulation of `contextmenu` event, default is `true` for mobile Safari.
  	tapHold: Browser.touchNative && Browser.safari && Browser.mobile,

  	// @option tapTolerance: Number = 15
  	// The max number of pixels a user can shift his finger during touch
  	// for it to be considered a valid tap.
  	tapTolerance: 15
  });

  var TapHold = Handler.extend({
  	addHooks: function () {
  		on(this._map._container, 'touchstart', this._onDown, this);
  	},

  	removeHooks: function () {
  		off(this._map._container, 'touchstart', this._onDown, this);
  	},

  	_onDown: function (e) {
  		clearTimeout(this._holdTimeout);
  		if (e.touches.length !== 1) { return; }

  		var first = e.touches[0];
  		this._startPos = this._newPos = new Point(first.clientX, first.clientY);

  		this._holdTimeout = setTimeout(bind(function () {
  			this._cancel();
  			if (!this._isTapValid()) { return; }

  			// prevent simulated mouse events https://w3c.github.io/touch-events/#mouse-events
  			on(document, 'touchend', preventDefault);
  			on(document, 'touchend touchcancel', this._cancelClickPrevent);
  			this._simulateEvent('contextmenu', first);
  		}, this), tapHoldDelay);

  		on(document, 'touchend touchcancel contextmenu', this._cancel, this);
  		on(document, 'touchmove', this._onMove, this);
  	},

  	_cancelClickPrevent: function cancelClickPrevent() {
  		off(document, 'touchend', preventDefault);
  		off(document, 'touchend touchcancel', cancelClickPrevent);
  	},

  	_cancel: function () {
  		clearTimeout(this._holdTimeout);
  		off(document, 'touchend touchcancel contextmenu', this._cancel, this);
  		off(document, 'touchmove', this._onMove, this);
  	},

  	_onMove: function (e) {
  		var first = e.touches[0];
  		this._newPos = new Point(first.clientX, first.clientY);
  	},

  	_isTapValid: function () {
  		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
  	},

  	_simulateEvent: function (type, e) {
  		var simulatedEvent = new MouseEvent(type, {
  			bubbles: true,
  			cancelable: true,
  			view: window,
  			// detail: 1,
  			screenX: e.screenX,
  			screenY: e.screenY,
  			clientX: e.clientX,
  			clientY: e.clientY,
  			// button: 2,
  			// buttons: 2
  		});

  		simulatedEvent._simulated = true;

  		e.target.dispatchEvent(simulatedEvent);
  	}
  });

  // @section Handlers
  // @property tapHold: Handler
  // Long tap handler to simulate `contextmenu` event (useful in mobile Safari).
  Map$1.addInitHook('addHandler', 'tapHold', TapHold);

  /*
   * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
   */

  // @namespace Map
  // @section Interaction Options
  Map$1.mergeOptions({
  	// @section Touch interaction options
  	// @option touchZoom: Boolean|String = *
  	// Whether the map can be zoomed by touch-dragging with two fingers. If
  	// passed `'center'`, it will zoom to the center of the view regardless of
  	// where the touch events (fingers) were. Enabled for touch-capable web
  	// browsers.
  	touchZoom: Browser.touch,

  	// @option bounceAtZoomLimits: Boolean = true
  	// Set it to false if you don't want the map to zoom beyond min/max zoom
  	// and then bounce back when pinch-zooming.
  	bounceAtZoomLimits: true
  });

  var TouchZoom = Handler.extend({
  	addHooks: function () {
  		addClass(this._map._container, 'leaflet-touch-zoom');
  		on(this._map._container, 'touchstart', this._onTouchStart, this);
  	},

  	removeHooks: function () {
  		removeClass(this._map._container, 'leaflet-touch-zoom');
  		off(this._map._container, 'touchstart', this._onTouchStart, this);
  	},

  	_onTouchStart: function (e) {
  		var map = this._map;
  		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

  		var p1 = map.mouseEventToContainerPoint(e.touches[0]),
  		    p2 = map.mouseEventToContainerPoint(e.touches[1]);

  		this._centerPoint = map.getSize()._divideBy(2);
  		this._startLatLng = map.containerPointToLatLng(this._centerPoint);
  		if (map.options.touchZoom !== 'center') {
  			this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
  		}

  		this._startDist = p1.distanceTo(p2);
  		this._startZoom = map.getZoom();

  		this._moved = false;
  		this._zooming = true;

  		map._stop();

  		on(document, 'touchmove', this._onTouchMove, this);
  		on(document, 'touchend touchcancel', this._onTouchEnd, this);

  		preventDefault(e);
  	},

  	_onTouchMove: function (e) {
  		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

  		var map = this._map,
  		    p1 = map.mouseEventToContainerPoint(e.touches[0]),
  		    p2 = map.mouseEventToContainerPoint(e.touches[1]),
  		    scale = p1.distanceTo(p2) / this._startDist;

  		this._zoom = map.getScaleZoom(scale, this._startZoom);

  		if (!map.options.bounceAtZoomLimits && (
  			(this._zoom < map.getMinZoom() && scale < 1) ||
  			(this._zoom > map.getMaxZoom() && scale > 1))) {
  			this._zoom = map._limitZoom(this._zoom);
  		}

  		if (map.options.touchZoom === 'center') {
  			this._center = this._startLatLng;
  			if (scale === 1) { return; }
  		} else {
  			// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
  			var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
  			if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
  			this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
  		}

  		if (!this._moved) {
  			map._moveStart(true, false);
  			this._moved = true;
  		}

  		cancelAnimFrame(this._animRequest);

  		var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false}, undefined);
  		this._animRequest = requestAnimFrame(moveFn, this, true);

  		preventDefault(e);
  	},

  	_onTouchEnd: function () {
  		if (!this._moved || !this._zooming) {
  			this._zooming = false;
  			return;
  		}

  		this._zooming = false;
  		cancelAnimFrame(this._animRequest);

  		off(document, 'touchmove', this._onTouchMove, this);
  		off(document, 'touchend touchcancel', this._onTouchEnd, this);

  		// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
  		if (this._map.options.zoomAnimation) {
  			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
  		} else {
  			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
  		}
  	}
  });

  // @section Handlers
  // @property touchZoom: Handler
  // Touch zoom handler.
  Map$1.addInitHook('addHandler', 'touchZoom', TouchZoom);

  Map$1.BoxZoom = BoxZoom;
  Map$1.DoubleClickZoom = DoubleClickZoom;
  Map$1.Drag = Drag;
  Map$1.Keyboard = Keyboard;
  Map$1.ScrollWheelZoom = ScrollWheelZoom;
  Map$1.TapHold = TapHold;
  Map$1.TouchZoom = TouchZoom;

  var L$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Bounds: Bounds,
    Browser: Browser,
    CRS: CRS,
    Canvas: Canvas,
    Circle: Circle,
    CircleMarker: CircleMarker,
    Class: Class,
    Control: Control,
    DivIcon: DivIcon,
    DivOverlay: DivOverlay,
    DomEvent: DomEvent,
    DomUtil: DomUtil,
    Draggable: Draggable,
    Evented: Evented,
    FeatureGroup: FeatureGroup,
    GeoJSON: GeoJSON,
    GridLayer: GridLayer,
    Handler: Handler,
    Icon: Icon,
    ImageOverlay: ImageOverlay,
    LatLng: LatLng,
    LatLngBounds: LatLngBounds,
    Layer: Layer,
    LayerGroup: LayerGroup,
    LineUtil: LineUtil,
    Map: Map$1,
    Marker: Marker,
    Mixin: Mixin,
    Path: Path,
    Point: Point,
    PolyUtil: PolyUtil,
    Polygon: Polygon,
    Polyline: Polyline,
    Popup: Popup,
    PosAnimation: PosAnimation,
    Projection: index,
    Rectangle: Rectangle,
    Renderer: Renderer$1,
    SVG: SVG,
    SVGOverlay: SVGOverlay,
    TileLayer: TileLayer,
    Tooltip: Tooltip,
    Transformation: Transformation,
    Util: Util,
    VideoOverlay: VideoOverlay,
    bind: bind,
    bounds: toBounds,
    canvas: canvas,
    circle: circle,
    circleMarker: circleMarker,
    control: control,
    divIcon: divIcon,
    extend: extend,
    featureGroup: featureGroup,
    geoJSON: geoJSON,
    geoJson: geoJson,
    gridLayer: gridLayer,
    icon: icon,
    imageOverlay: imageOverlay,
    latLng: toLatLng,
    latLngBounds: toLatLngBounds,
    layerGroup: layerGroup,
    map: createMap,
    marker: marker,
    point: toPoint,
    polygon: polygon,
    polyline: polyline,
    popup: popup,
    rectangle: rectangle,
    setOptions: setOptions,
    stamp: stamp,
    svg: svg,
    svgOverlay: svgOverlay,
    tileLayer: tileLayer,
    tooltip: tooltip,
    transformation: toTransformation,
    version: version,
    videoOverlay: videoOverlay
  });

  loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

  const Renderer = class extends defaultExport {
    id = 'leaflet'
    version = '1.9.4'
    L = L$1

    addMap ({ target, center, zoom }) {
      const [x, y] = center;
      this.map = createMap(target).setView([y, x], zoom);

      // Update map by element size
      const resizeObserver = new window.ResizeObserver(() => {
        this.map.invalidateSize();
      });
      resizeObserver.observe(target);

      return this.map
    }

    getTerraDrawAdapter ({ draw, L, map }) {
      if (!draw) return { state: 'skip' }

      this.terraDrawAdapter = new n({ lib: L, map });
      return this.getTerraDrawAdapter
    }

    setControl ({ map, control: control$1 }) {
      if (!control$1 || Object.values(control$1).filter(v => v).length === 0) { return { state: 'skip' } }

      if (control$1.fullscreen) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href =
          'https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/leaflet.fullscreen.css';
        document.body.append(css);

        const script = document.createElement('script');
        script.src =
          'https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/Leaflet.fullscreen.min.js';
        document.body.append(script);
        script.onload = () => {
          map.addControl(new Control.Fullscreen());
        };
      }
      if (control$1.scale) {
        control.scale().addTo(map);
      }
    }

    debugLayer () {
      GridLayer.GridDebug = GridLayer.extend({
        createTile: function (coords) {
          const tile = document.createElement('div');
          tile.style.outline = '2px solid';
          tile.style.fontWeight = 'bold';
          tile.style.fontSize = '14pt';
          tile.innerHTML = [coords.z, coords.x, coords.y].join('/');
          return tile
        },
      });

      return new GridLayer.GridDebug()
    }

    // Configure extra stuff
    setExtra (config) {
      const { map, debug } = config;
      if (!debug && !config.eval) return { state: 'skip' }

      if (debug === true) {
        map.addLayer(this.debugLayer());
      }
      if (config.eval) {
        this.evalScript(config.eval, [
          ['map', map],
          ['L', L$1],
        ]);
      }
    }

    addMarker (config) {
      const options = config.element
        ? {
            html: config.element.innerHTML,
            iconSize: config.size,
            iconAnchor: config.anchor,
          }
        : {
            html: this.svgPin.html,
            iconSize: this.svgPin.size,
            iconAnchor: this.svgPin.anchor,
          };
      const markerIcon = divIcon({
        ...options,
        className: 'marker',
      });
      const xy = Array.from(config.xy).reverse();
      const marker$1 = marker(xy, { icon: markerIcon })
        .addTo(this.map);
      const element = marker$1.getElement();
      element.classList.add('marker');

      element.remove = () => this.map.removeLayer(marker$1);
      return element
    }

    addTileData ({ map, data }) {
      const tileData = data.filter(d => d.type === 'tile');

      const baseLayers = {};
      const overlayMaps = {};
      if (tileData.length === 0) {
        const osmTile = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        tileLayer(osmTile).addTo(map);
      } else {
        tileData.forEach((datum, index) => {
          const customTile = datum.url;
          const layer = tileLayer(customTile);
          const title = datum.title ? datum.title : `Anonymous_${index}`;
          if (index === 0) {
            layer.addTo(map);
          }
          baseLayers[title] = layer;
        });
        const layerControl = control.layers(baseLayers, overlayMaps).addTo(map);
        map.removeControl(layerControl);
      }
    }

    addGPXFile ({ map, data }) {
      const gpxUrl = data.find(record => record.type === 'gpx');
      if (!gpxUrl) return { state: 'skip' }

      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/gpx.min.js';
      document.body.append(script);

      const options = {
        gpx_options: {
          joinTrackSegments: false,
        },
        polyline_options: {
          color: 'red',
          weight: 3,
          lineCap: 'round',
        },
        marker_options: {
          startIconUrl: null,
          endIconUrl: null,
          shadowUrl: '',
          wptIconUrls: {
            '': null,
          },
        },
        async: true,
      };
      script.onload = () => {
        new undefined(gpxUrl, options).addTo(map);
      };
    }

    updateCamera (options, animation) {
      const latLon = toLatLng(options.center[1], options.center[0]);
      if (animation) {
        this.map.flyTo(latLon, options.zoom);
      } else {
        this.map.setView(latLon, options.zoom);
      }
    }

    project ([lng, lat]) {
      return this.map.latLngToContainerPoint([lat, lng])
    }

    unproject ([x, y]) {
      const latLng = this.map.containerPointToLatLng([x, y]);
      return [latLng.lng, latLng.lat]
    }
  };

  const converter = config => ({ ...config, use: Renderer });
  const render = renderWith(converter);
  const renderByYaml = renderByYamlWith(converter);
  const renderByScriptTarget = renderByScriptTargetWith(converter);

  globalThis.mapclay = { render, renderByYaml };

  exports.default = Renderer;
  exports.render = render;
  exports.renderByScriptTarget = renderByScriptTarget;
  exports.renderByYaml = renderByYaml;

  Object.defineProperty(exports, '__esModule', { value: true });

  renderByScriptTarget()

}));
