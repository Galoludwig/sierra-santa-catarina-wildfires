// ============================================================
// Script: 03_RelativeHumidity.js
//
// Description:
// Calculates monthly relative humidity (RH) from ERA5-Land
// monthly air temperature and dew point temperature using
// the FAO-56 formulation.
//
// Study area:
// Sierra de Santa Catarina, Mexico City, Mexico
//
// Period:
// January 2001 - December 2025
// ============================================================


// ------------------------------------------------------------
// 1. STUDY AREA
// ------------------------------------------------------------
var aoi = ee.FeatureCollection(
    "projects/ee-cbi2243801703/assets/ssc_nuevopoli"
);

Map.centerObject(aoi, 11);
Map.addLayer(aoi, {color: 'red'}, 'SSC');


// ------------------------------------------------------------
// 2. PERIOD
// ------------------------------------------------------------
var startDate = '2001-01-01';
var endDate   = '2025-12-31';


// ------------------------------------------------------------
// 3. ERA5-LAND MONTHLY
// ------------------------------------------------------------
var era5 = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR")
    .filterDate(startDate, endDate)
    .filterBounds(aoi);


// ------------------------------------------------------------
// 4. FUNCTION TO CALCULATE RH
// ------------------------------------------------------------
var RHcollection = era5.map(function(img){

  // Air temperature (°C)
  var T = img.select('temperature_2m')
             .subtract(273.15);

  // Dew point temperature (°C)
  var Td = img.select('dewpoint_temperature_2m')
              .subtract(273.15);

  // Saturation vapor pressure
  var es = T.expression(
    '0.6108 * exp((17.27*T)/(T+237.3))',
    {
      T: T
    });

  // Actual vapor pressure
  var ea = Td.expression(
    '0.6108 * exp((17.27*Td)/(Td+237.3))',
    {
      Td: Td
    });

  // Relative Humidity (%)
  var RH = ea.divide(es)
             .multiply(100)
             .rename('RH');

  return RH.copyProperties(img, ['system:time_start']);
});


// ------------------------------------------------------------
// 5. MONTHLY MEAN RH OVER THE STUDY AREA
// ------------------------------------------------------------
var RHtable = RHcollection.map(function(img){

  var stats = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 11132,
    maxPixels: 1e13
  });

  var date = ee.Date(img.get('system:time_start'));

  return ee.Feature(null,{
    year: date.get('year'),
    month: date.get('month'),
    RH: stats.get('RH')
  });

});


// ------------------------------------------------------------
// 6. EXPORT TABLE
// ------------------------------------------------------------
Export.table.toDrive({
  collection: RHtable,
  description: 'SSC_RelativeHumidity_2001_2025',
  fileFormat: 'CSV'
});


// ------------------------------------------------------------
// 7. VISUALIZATION
// ------------------------------------------------------------
var lastImage = ee.Image(RHcollection.sort('system:time_start', false).first());

Map.addLayer(
  lastImage.clip(aoi),
  {
    min: 20,
    max: 100,
    palette: [
      'brown',
      'orange',
      'yellow',
      'lightgreen',
      'green',
      'darkgreen'
    ]
  },
  'Relative Humidity (%)'
);

print('Monthly Relative Humidity', RHtable);