// ==========================================
// 1. ÁREA DE INTERÉS (SSC)
// ==========================================

var AOI = ee.FeatureCollection("projects/ee-cbi2243801703/assets/ssc_nuevopoli");

// Centrar mapa
Map.centerObject(AOI, 11);
Map.addLayer(AOI, {color: 'red'}, 'SSC AOI');

// ==========================================
// 2. COLECCIÓN ERA5-LAND (MENSUAL)
// ==========================================

var era5 = ee.ImageCollection('ECMWF/ERA5_LAND/MONTHLY_AGGR')
  .filterBounds(AOI)
  .filterDate('2001-01-01', '2025-12-31');

// ==========================================
// 3. FUNCIÓN PARA CALCULAR VPD (CON CLIP)
// ==========================================

var calcVPD = function(img) {

  // 🔥 RECORTAR AL AOI
  img = img.clip(AOI);

  // Temperatura (K → °C)
  var T = img.select('temperature_2m').subtract(273.15);
  
  // Dew point (K → °C)
  var Td = img.select('dewpoint_temperature_2m').subtract(273.15);

  // Saturation vapor pressure (es)
  var es = T.expression(
    '0.6108 * exp((17.27 * T) / (T + 237.3))',
    {T: T}
  );

  // Actual vapor pressure (ea)
  var ea = Td.expression(
    '0.6108 * exp((17.27 * Td) / (Td + 237.3))',
    {Td: Td}
  );

  // VPD (kPa)
  var vpd = es.subtract(ea).rename('VPD');

  return img.addBands([
    vpd,
    T.rename('Temp_C'),
    Td.rename('DewPoint_C')
  ]);
};

// Aplicar función
var era5_vpd = era5.map(calcVPD);

// ==========================================
// 4. EXTRAER PROMEDIO MENSUAL EN EL AOI
// ==========================================

var serie = era5_vpd.map(function(img) {
  
  var stats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: AOI.geometry().dissolve(), // 🔥 SOLO tu área
    scale: 1000,
    maxPixels: 1e13
  });
  
  return ee.Feature(null, {
    'date': img.date().format('YYYY-MM'),
    'ANIO': img.date().format('YYYY'),
    'MES': img.date().format('MM'),
    'VPD': stats.get('VPD'),
    'Temp_C': stats.get('Temp_C'),
    'DewPoint_C': stats.get('DewPoint_C')
  });
});

// ==========================================
// 5. EXPORTAR A CSV
// ==========================================

Export.table.toDrive({
  collection: serie,
  description: 'ERA5_VPD_SSC_2001_2025',
  fileFormat: 'CSV'
});

// ==========================================
// 6. VISUALIZACIÓN (VERIFICACIÓN)
// ==========================================

var ejemplo = era5_vpd.first();

// VPD recortado
Map.addLayer(
  ejemplo.select('VPD'),
  {min: 0, max: 3, palette: ['blue', 'yellow', 'red']},
  'VPD (recortado)'
);

// Temperatura recortada
Map.addLayer(
  ejemplo.select('Temp_C'),
  {min: 0, max: 40, palette: ['blue', 'green', 'red']},
  'Temperatura (recortada)'
);