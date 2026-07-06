// =======================================================
// HOTSPOTS MODIS MENSUALES (2001-2025) - SSC
// USANDO MOD14A1 + MYD14A1
// =======================================================

// 1) AOI
var aoi = ee.FeatureCollection("projects/ee-cbi2243801703/assets/ssc_nuevopoli");
Map.centerObject(aoi, 11);
Map.addLayer(aoi, {}, "AOI SSC");

// 2) MODIS ACTIVE FIRE PRODUCTS
var terra = ee.ImageCollection("MODIS/061/MOD14A1")
  .filterBounds(aoi)
  .filterDate("2001-01-01", "2025-12-31");

var aqua = ee.ImageCollection("MODIS/061/MYD14A1")
  .filterBounds(aoi)
  .filterDate("2001-01-01", "2025-12-31");

// 3) UNIR COLECCIONES (TERRA + AQUA)
var modis_fire = terra.merge(aqua);

// 4) AÑOS Y MESES
var startYear = 2001;
var endYear   = 2025;

var years = ee.List.sequence(startYear, endYear);
var months = ee.List.sequence(1, 12);

// =======================================================
// 5) FUNCIÓN PARA CONTAR PIXELES CON FUEGO (FireMask)
// =======================================================
// FireMask: valores típicos:
// 0 = no fire
// 7, 8, 9 = fuego detectado (low/nominal/high confidence)

var tabla = ee.FeatureCollection(
  years.map(function(y) {
    y = ee.Number(y);

    return months.map(function(m) {
      m = ee.Number(m);

      var start = ee.Date.fromYMD(y, m, 1);
      var end = start.advance(1, "month");

      var firesMonth = modis_fire.filterDate(start, end);

      // Convertir a máscara binaria: 1 = hotspot detectado
      var fireBinary = firesMonth.map(function(img) {
        var fm = img.select("FireMask");
        var hotspot = fm.gte(7); // 7,8,9 son fuego
        return hotspot.rename("hotspot");
      });

      // Sumar hotspots del mes (conteo de pixeles detectados)
      var hotspotSum = fireBinary.sum();

      // Reducir dentro del AOI (conteo total)
      var n_hotspots = hotspotSum.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: aoi,
        scale: 1000,
        maxPixels: 1e13
      }).get("hotspot");

      return ee.Feature(null, {
        "anio": y,
        "mes": m,
        "n_hotspots_modis": n_hotspots,
        "fecha_inicio": start.format("YYYY-MM-dd"),
        "fecha_fin": end.format("YYYY-MM-dd")
      });

    });
  }).flatten()
);

// =======================================================
// 6) VER TABLA
// =======================================================

print("Hotspots MODIS mensual (Terra+Aqua)", tabla.limit(30));

// =======================================================
// 7) EXPORTAR A DRIVE
// =======================================================

Export.table.toDrive({
  collection: tabla,
  description: "Hotspots_MODIS_Mensual_2001_2025_SSC",
  fileFormat: "CSV"
});

// =======================================================
// VISUALIZAR HOTSPOTS EN UN MES ESPECÍFICO
// =======================================================

var startVis = "2025-03-01";
var endVis   = "2025-04-01";

var firesVis = modis_fire.filterDate(startVis, endVis);

// Mascara binaria de fuego
var fireBinaryVis = firesVis.map(function(img) {
  var fm = img.select("FireMask");
  return fm.gte(7).selfMask(); // solo deja pixeles con fuego
});

// Imagen suma del mes
var hotspotImg = fireBinaryVis.sum().clip(aoi);

// Visualización
Map.addLayer(hotspotImg, {min: 1, max: 5}, "Hotspots MODIS Marzo 2023");

// Conteo
var n_hotspots_vis = hotspotImg.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 1000,
  maxPixels: 1e13
});