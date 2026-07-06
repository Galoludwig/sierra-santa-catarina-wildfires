// ============================================================
// NDVI y KNDVI MENSUAL (CSV) + GRÁFICA COMPARATIVA
// Landsat 5,7,8,9 (2001–2025) - Colección 2 Nivel 2
// Sierra de Santa Catarina (AOI)
// ============================================================

// ------------------------------------------------------------
// 1) AOI
// ------------------------------------------------------------
var aoi = ee.FeatureCollection("projects/ee-cbi2243801703/assets/ssc_nuevopoli");
Map.centerObject(aoi, 12);
Map.addLayer(aoi, {}, "AOI");

// ------------------------------------------------------------
// 2) PARÁMETROS
// ------------------------------------------------------------
var startYear = 2001;
var endYear   = 2025;
var cloudThreshold = 30;  // <30% nubes

// ------------------------------------------------------------
// 3) MÁSCARA DE NUBES (QA_PIXEL)
// ------------------------------------------------------------
function maskLandsatC2L2(image) {
  var qa = image.select('QA_PIXEL');

  var mask = qa.bitwiseAnd(1 << 0).eq(0)
    .and(qa.bitwiseAnd(1 << 1).eq(0))
    .and(qa.bitwiseAnd(1 << 2).eq(0))
    .and(qa.bitwiseAnd(1 << 3).eq(0))
    .and(qa.bitwiseAnd(1 << 4).eq(0))
    .and(qa.bitwiseAnd(1 << 5).eq(0));

  return image.updateMask(mask);
}

// ------------------------------------------------------------
// 4) ESCALADO + BANDAS PARA NDVI (NIR y RED)
// ------------------------------------------------------------
function scaleAndSelectL57(img) {
  // Landsat 5 y 7: RED=B3, NIR=B4
  return img.select(['SR_B3','SR_B4'], ['RED','NIR'])
    .multiply(0.0000275).add(-0.2)
    .copyProperties(img, ['system:time_start']);
}

function scaleAndSelectL89(img) {
  // Landsat 8 y 9: RED=B4, NIR=B5
  return img.select(['SR_B4','SR_B5'], ['RED','NIR'])
    .multiply(0.0000275).add(-0.2)
    .copyProperties(img, ['system:time_start']);
}

// ------------------------------------------------------------
// 5) COLECCIÓN UNIFICADA LANDSAT 5-9
// ------------------------------------------------------------
var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', cloudThreshold))
  .map(maskLandsatC2L2)
  .map(scaleAndSelectL57);

var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', cloudThreshold))
  .map(maskLandsatC2L2)
  .map(scaleAndSelectL57);

var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', cloudThreshold))
  .map(maskLandsatC2L2)
  .map(scaleAndSelectL89);

var l9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUD_COVER', cloudThreshold))
  .map(maskLandsatC2L2)
  .map(scaleAndSelectL89);

var landsatAll = l5.merge(l7).merge(l8).merge(l9);

// ------------------------------------------------------------
// 6) FUNCIÓN SEGURA NDVI + KNDVI
// KNDVI = tanh(NDVI^2)
// ------------------------------------------------------------
function getNDVI_KNDVI_safe(startDate, endDate) {

  var col = landsatAll.filterDate(startDate, endDate);
  var count = col.size();

  var empty = ee.Image(0).rename("NDVI").updateMask(ee.Image(0));

  var ndvi = ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      col.median().clip(aoi)
        .normalizedDifference(['NIR','RED'])
        .rename('NDVI'),
      empty
    )
  );

  var kndvi = ndvi.pow(2).tanh().rename("KNDVI");

  return ndvi.addBands(kndvi);
}

// ------------------------------------------------------------
// 7) LISTA DE MESES (2001-01 a 2025-12)
// ------------------------------------------------------------
var months = ee.List.sequence(startYear, endYear).map(function(y){
  y = ee.Number(y);
  return ee.List.sequence(1, 12).map(function(m){
    return ee.Date.fromYMD(y, m, 1);
  });
}).flatten();

// ------------------------------------------------------------
// 8) TABLA MENSUAL NDVI y KNDVI
// ------------------------------------------------------------
var tableMonthly = ee.FeatureCollection(months.map(function(d){

  d = ee.Date(d);
  var start = d;
  var end = d.advance(1, 'month');

  var img = getNDVI_KNDVI_safe(start, end);

  var stats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi.geometry(),
    scale: 30,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'date': start.format('YYYY-MM'),
    'year': start.get('year'),
    'month': start.get('month'),
    'NDVI_mean': stats.get('NDVI'),
    'KNDVI_mean': stats.get('KNDVI')
  });

}));

print("Tabla mensual NDVI y KNDVI:", tableMonthly);

// ------------------------------------------------------------
// 9) EXPORTAR CSV
// ------------------------------------------------------------
Export.table.toDrive({
  collection: tableMonthly,
  description: 'SSC_NDVI_KNDVI_MENSUAL_2001_2025',
  fileFormat: 'CSV'
});

// ------------------------------------------------------------
// 10) GRÁFICA COMPARATIVA (NDVI vs KNDVI)
// ------------------------------------------------------------
var chart = ui.Chart.feature.byFeature({
  features: tableMonthly,
  xProperty: 'date',
  yProperties: ['NDVI_mean','KNDVI_mean']
})
.setChartType('LineChart')
.setOptions({
  title: 'NDVI vs KNDVI mensual (2001–2025) - Sierra de Santa Catarina',
  hAxis: {title: 'Fecha (Año-Mes)', slantedText: true, slantedTextAngle: 45},
  vAxis: {title: 'Índice'},
  lineWidth: 2,
  pointSize: 0,
  series: {
    0: {label: 'NDVI'},
    1: {label: 'KNDVI'}
  }
});

print(chart);