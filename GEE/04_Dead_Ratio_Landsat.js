// ======================================================
// DEAD RATIO (DR) MENSUAL LANDSAT 5 + 7 + 8 + 9 (2001-2025)
// Basado en Burgan et al. (1998) / Vega-Nieva et al. (2019)
// AOI: Sierra de Santa Catarina (SSC)
// ======================================================

// -----------------------------
// 0. PARAMETRO
// -----------------------------
var YEAR = 2025;   // <-- CAMBIA EL AÑO AQUI

// -----------------------------
// 1. AREA DE ESTUDIO
// -----------------------------
var ssc = ee.FeatureCollection(
  'projects/ee-cbi2243801703/assets/ssc_nuevopoli'
).geometry();

Map.centerObject(ssc, 12);
Map.addLayer(ssc, {color:'red'}, 'AOI');


// -----------------------------
// 2. MASCARA NUBES LANDSAT (QA_PIXEL)
// -----------------------------
function maskLandsat(image) {
  var qa = image.select('QA_PIXEL');

  // Bits QA_PIXEL (Collection 2 L2)
  var fill   = qa.bitwiseAnd(1 << 0).eq(0);
  var cloud  = qa.bitwiseAnd(1 << 3).eq(0);
  var shadow = qa.bitwiseAnd(1 << 4).eq(0);
  var snow   = qa.bitwiseAnd(1 << 5).eq(0);
  var cirrus = qa.bitwiseAnd(1 << 2).eq(0);

  var mask = fill.and(cloud).and(shadow).and(snow).and(cirrus);

  return image.updateMask(mask);
}


// -----------------------------
// 3. ESCALAMIENTO LANDSAT SR (REFLECTANCIA REAL)
// -----------------------------
function applyScaleFactors(image) {

  // Reflectancia = DN * 0.0000275 - 0.2
  var optical = image.select('SR_B.*')
    .multiply(0.0000275)
    .add(-0.2);

  return image.addBands(optical, null, true);
}


// -----------------------------
// 4. RENOMBRAR BANDAS A NOMBRES GENERALES
// -----------------------------
function renameL5L7(img) {
  return img.select(
    ['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'],
    ['BLUE','GREEN','RED','NIR','SWIR1','SWIR2']
  );
}

function renameL8L9(img) {
  return img.select(
    ['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'],
    ['BLUE','GREEN','RED','NIR','SWIR1','SWIR2']
  );
}


// -----------------------------
// 5. COLECCIONES LANDSAT (2001-2025)
// -----------------------------
var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(ssc)
  .filterDate('2001-01-01', '2011-12-31')
  .map(maskLandsat)
  .map(applyScaleFactors)
  .map(renameL5L7);

var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(ssc)
  .filterDate('2001-01-01', '2021-12-31')   // Landsat 7 hasta 2021
  .map(maskLandsat)
  .map(applyScaleFactors)
  .map(renameL5L7);

var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(ssc)
  .filterDate('2013-01-01', '2025-12-31')
  .map(maskLandsat)
  .map(applyScaleFactors)
  .map(renameL8L9);

var l9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterBounds(ssc)
  .filterDate('2021-01-01', '2025-12-31')
  .map(maskLandsat)
  .map(applyScaleFactors)
  .map(renameL8L9);

// Merge total
var col = l5.merge(l7).merge(l8).merge(l9);


// -----------------------------
// 6. NDVI HISTORICO PARA NDVImin y NDVImax (2001-2025)
// -----------------------------
var ndviCol = col.map(function(img){
  return img.normalizedDifference(['NIR','RED']).rename('NDVI');
});

var ndvi_min = ndviCol.min();
var ndvi_max = ndviCol.max();


// -----------------------------
// 7. DR MENSUAL (Burgan et al. 1998)
// -----------------------------
var meses = ee.List.sequence(1,12);

var monthlyDR = ee.ImageCollection.fromImages(
  meses.map(function(m){

    var start = ee.Date.fromYMD(YEAR, m, 1);
    var end = start.advance(1, 'month');

    var monthCol = col.filterDate(start, end);

    // Si el mes no tiene imágenes, usa la mediana global
    var img = ee.Image(
      ee.Algorithms.If(
        monthCol.size().gt(0),
        monthCol.median(),
        col.median()
      )
    ).clip(ssc);

    // NDVI0
    var ndvi0 = img.normalizedDifference(['NIR','RED']).rename('NDVI0');

    // RG = ((NDVI0 - NDVImin) / (NDVImax - NDVImin)) * 100
    var rg = ndvi0.subtract(ndvi_min)
      .divide(ndvi_max.subtract(ndvi_min))
      .multiply(100);

    // LRmax según Burgan et al. (1998)
    var lrmax = ndvi_max.expression(
      '35 + 40 * ((NDVImax - 0.2) / (0.8 - 0.2))', {
        NDVImax: ndvi_max
    });

    // LR = RG * LRmax / 100
    var lr = rg.multiply(lrmax).divide(100);

    // DR = (100 - LR) / 100
    var dr = ee.Image(100)
      .subtract(lr)
      .divide(100)
      .clamp(0,1)
      .rename('DR');

    // -------------------------
    // MASCARAS OPCIONALES
    // -------------------------
    var ndmi = img.normalizedDifference(['NIR','SWIR1']);
    var ndbi = img.normalizedDifference(['SWIR1','NIR']);

    var bsi = img.expression(
      '((SWIR + RED) - (NIR + BLUE)) / ((SWIR + RED) + (NIR + BLUE))', {
        SWIR: img.select('SWIR1'),
        RED: img.select('RED'),
        NIR: img.select('NIR'),
        BLUE: img.select('BLUE')
    });

    var veg = ndvi0.gt(0.2).and(ndmi.gt(0));
    var bare = bsi.gt(0.2).or(ndbi.gt(0.1));

    var dr_final = dr.updateMask(veg.and(bare.not()));

    return dr_final
      .set('month', m)
      .set('year', YEAR)
      .set('system:time_start', start.millis());
  })
);


// -----------------------------
// 8. VISUALIZACION MAPAS
// -----------------------------
var nombres = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

for (var i = 1; i <= 12; i++) {

  var img = monthlyDR
    .filter(ee.Filter.eq('month', i))
    .first();

  Map.addLayer(
    img,
    {
      min: 0.2,
      max: 0.8,
      palette: ['green','yellow','red']
    },
    'DR ' + nombres[i-1] + ' ' + YEAR,
    false
  );
}


// -----------------------------
// 9. GRAFICA DR PROMEDIO MENSUAL
// -----------------------------
var chart = ui.Chart.image.series({
  imageCollection: monthlyDR,
  region: ssc,
  reducer: ee.Reducer.mean(),
  scale: 30
}).setOptions({
  title: 'Dead Ratio (DR) mensual - ' + YEAR + ' (Landsat 5/7/8/9)',
  vAxis: {title: 'DR (0–1)'},
  hAxis: {title: 'Fecha'},
  lineWidth: 3,
  pointSize: 5
});

print(chart);
