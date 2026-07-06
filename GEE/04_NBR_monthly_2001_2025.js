// ============================================================
// NBR MENSUAL (CSV) + dNBR ANUAL (ENERO vs ABRIL)
// Landsat 5, 7, 8, 9 (2001–2025) - Colección 2 Nivel 2
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
var cloudThreshold = 30;   // menos de 30% nubes

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
// 4) ESCALADO + BANDAS PARA NBR
// ------------------------------------------------------------
function scaleAndSelectL57(img) {
  // Landsat 5 y 7: NIR=B4, SWIR2=B7
  return img.select(['SR_B4','SR_B7'], ['NIR','SWIR2'])
    .multiply(0.0000275).add(-0.2)
    .copyProperties(img, ['system:time_start']);
}

function scaleAndSelectL89(img) {
  // Landsat 8 y 9: NIR=B5, SWIR2=B7
  return img.select(['SR_B5','SR_B7'], ['NIR','SWIR2'])
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
// 6) FUNCIÓN SEGURA PARA NBR
// ------------------------------------------------------------
function getNBR_safe(startDate, endDate) {

  var col = landsatAll.filterDate(startDate, endDate);
  var count = col.size();

  var empty = ee.Image(0).rename("NBR").updateMask(ee.Image(0));

  return ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      col.median().clip(aoi)
        .normalizedDifference(['NIR','SWIR2'])
        .rename('NBR'),
      empty
    )
  );
}

// ============================================================
// A) NBR MENSUAL (2001-01 a 2025-12) → CSV
// ============================================================

var months = ee.List.sequence(startYear, endYear).map(function(y){
  y = ee.Number(y);
  return ee.List.sequence(1, 12).map(function(m){
    return ee.Date.fromYMD(y, m, 1);
  });
}).flatten();

var nbrMonthlyTable = ee.FeatureCollection(months.map(function(d){

  d = ee.Date(d);
  var start = d;
  var end = d.advance(1, 'month');

  var nbr = getNBR_safe(start, end);

  var mean = nbr.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi.geometry(),
    scale: 30,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'date': start.format('YYYY-MM'),
    'year': start.get('year'),
    'month': start.get('month'),
    'NBR_mean': mean.get('NBR')
  });

}));

Export.table.toDrive({
  collection: nbrMonthlyTable,
  description: 'SSC_NBR_MENSUAL_2001_2025',
  fileFormat: 'CSV'
});

print("Tabla NBR mensual:", nbrMonthlyTable);

// ============================================================
// B) dNBR ANUAL (ENERO vs ABRIL) → CSV
// ============================================================

var years = ee.List.sequence(startYear, endYear);

var dnbrAnnualTable = ee.FeatureCollection(years.map(function(y){

  y = ee.Number(y);

  // PRE: ENERO
  var preStart = ee.Date.fromYMD(y, 1, 1);
  var preEnd = preStart.advance(1, 'month');

  // POST: ABRIL
  var postStart = ee.Date.fromYMD(y, 4, 1);
  var postEnd = postStart.advance(1, 'month');

  var nbr_pre = getNBR_safe(preStart, preEnd);
  var nbr_post = getNBR_safe(postStart, postEnd);

  var dnbr = nbr_pre.subtract(nbr_post).rename("dNBR");

  var mean = dnbr.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi.geometry(),
    scale: 30,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'year': y,
    'pre_date': preStart.format('YYYY-MM'),
    'post_date': postStart.format('YYYY-MM'),
    'dNBR_mean': mean.get('dNBR')
  });

}));

Export.table.toDrive({
  collection: dnbrAnnualTable,
  description: 'SSC_dNBR_PRE_ENE_POST_ABR_2001_2025',
  fileFormat: 'CSV'
});

print("Tabla dNBR anual (Enero vs Abril):", dnbrAnnualTable);