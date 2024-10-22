param = {
  name: "침수흔적도",

  serverUrl:
    "www.safemap.go.kr/sm/apis.do?apikey=89B1UZBS-89B1-89B1-89B1-89B1UZBSFR",

  layername: "A2SM_FLUDMARKS",

  styles: "",
};

var wmsLayer = new OpenLayers.Layer.WMS(
  param.name,
  param.serverUrl,

  {
    layers: "" + param.layername,

    styles: param.styles,

    format: "image/png",

    exceptions: "text/xml",

    transparent: true,
  },

  { isBaseLayer: false }
);
