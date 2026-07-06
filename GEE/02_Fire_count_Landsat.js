// =====================================================
// FRECUENCIA DE INCENDIOS 2001-2025
// Temporada: ENERO - ABRIL
// PRE: Ene-Feb
// POST: Mar-Abr
//
// 2001–2012 → Landsat 7
// 2013–2018 → Landsat 8
// 2020–2025 → Landsat 8 + Landsat 9
//
// Índice: NBR + dNBR
// Resolución final: 30 m
// ROI: SSC Asset
// =====================================================


// ==========================
// 1) ROI
// ==========================
var geometry = ee.FeatureCollection(
  "projects/ee-cbi2243801703/assets/ssc_nuevopoli"
);

var roi = geometry.geometry();

Map.centerObject(roi, 10);

Map.addLayer(
  geometry,
  {color: "blue"},
  "ROI SSC"
);


// ==========================
// 2) FUNCIÓN NBR GENERAL
// ==========================
function addNBR(image, nirBand, swir2Band) {

  var nbr = image
    .normalizedDifference([nirBand, swir2Band])
    .rename("NBR");

  return image.addBands(nbr);
}


// ==========================
// 3) SAFE COMPOSITE
// ==========================
function safeCompositeNBR(collection, scale) {

  var empty = ee.Image.constant(0)
    .rename("NBR")
    .clip(roi)
    .reproject({
      crs: "EPSG:4326",
      scale: scale
    });

  return ee.Image(
    ee.Algorithms.If(
      collection.size().gt(0),
      collection.select("NBR").median(),
      empty
    )
  );
}


// =====================================================
// LANDSAT 7 (2001-2012)
// =====================================================
function maskL7SR(image) {

  var qa = image.select("QA_PIXEL");

  var cloud = qa.bitwiseAnd(1 << 3).eq(0);

  var shadow = qa.bitwiseAnd(1 << 4).eq(0);

  var cirrus = qa.bitwiseAnd(1 << 2).eq(0);

  var mask = cloud.and(shadow).and(cirrus);

  return image
    .updateMask(mask)
    .multiply(0.0000275)
    .add(-0.2)
    .copyProperties(image, ["system:time_start"]);
}

function getL7Collection(startDate, endDate) {

  return ee.ImageCollection(
    "LANDSAT/LE07/C02/T1_L2"
  )
  .filterBounds(roi)
  .filterDate(startDate, endDate)
  .filter(ee.Filter.lt("CLOUD_COVER", 50))
  .map(maskL7SR)
  .map(function(img) {

    return img.clip(roi);

  })
  .map(function(img) {

    return addNBR(
      img,
      "SR_B4",
      "SR_B7"
    );

  })
  .select("NBR");
}

function getCompositeNBR_L7(collection) {

  return safeCompositeNBR(collection, 30);

}


// =====================================================
// LANDSAT 8 (2013-2018)
// =====================================================
function maskL8SR(image) {

  var qa = image.select("QA_PIXEL");

  var cloud = qa.bitwiseAnd(1 << 3).eq(0);

  var shadow = qa.bitwiseAnd(1 << 4).eq(0);

  var cirrus = qa.bitwiseAnd(1 << 2).eq(0);

  var mask = cloud.and(shadow).and(cirrus);

  return image
    .updateMask(mask)
    .multiply(0.0000275)
    .add(-0.2)
    .copyProperties(image, ["system:time_start"]);
}

function getL8Collection(startDate, endDate) {

  return ee.ImageCollection(
    "LANDSAT/LC08/C02/T1_L2"
  )
  .filterBounds(roi)
  .filterDate(startDate, endDate)
  .filter(ee.Filter.lt("CLOUD_COVER", 50))
  .map(maskL8SR)
  .map(function(img) {

    return img.clip(roi);

  })
  .map(function(img) {

    return addNBR(
      img,
      "SR_B5",
      "SR_B7"
    );

  })
  .select("NBR");
}

function getCompositeNBR_L8(collection) {

  return safeCompositeNBR(collection, 30);

}


// =====================================================
// LANDSAT 8 + 9 (2020-2025)
// =====================================================
function getL89Collection(startDate, endDate) {

  var l8 = ee.ImageCollection(
    "LANDSAT/LC08/C02/T1_L2"
  );

  var l9 = ee.ImageCollection(
    "LANDSAT/LC09/C02/T1_L2"
  );

  return l8.merge(l9)
    .filterBounds(roi)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt("CLOUD_COVER", 50))
    .map(maskL8SR)
    .map(function(img) {

      return img.clip(roi);

    })
    .map(function(img) {

      return addNBR(
        img,
        "SR_B5",
        "SR_B7"
      );

    })
    .select("NBR");
}

function getCompositeNBR_L89(startDate, endDate) {

  var coll = getL89Collection(
    startDate,
    endDate
  );

  return safeCompositeNBR(coll, 30);
}


// ==========================
// 4) UMBRAL dNBR
// ==========================
var dnbr_threshold = 0.20;


// =====================================================
// 5) FUNCIÓN QUEMADO POR AÑO
// =====================================================
function burnedYear(year) {

  year = ee.Number(year).toInt();

  var yearStr = year.format();

  var startPre = ee.Date.fromYMD(
    year,
    1,
    1
  );

  var endPre = ee.Date.fromYMD(
    year,
    2,
    28
  );

  var startPost = ee.Date.fromYMD(
    year,
    3,
    1
  );

  var endPost = ee.Date.fromYMD(
    year,
    4,
    30
  );

  // ======================
  // PRE NBR
  // ======================
  var preNBR = ee.Image(

    ee.Algorithms.If(

      year.lte(2012),

      getCompositeNBR_L7(
        getL7Collection(
          startPre,
          endPre
        )
      ),

      ee.Algorithms.If(

        year.gte(2013)
          .and(year.lte(2018)),

        getCompositeNBR_L8(
          getL8Collection(
            startPre,
            endPre
          )
        ),

        ee.Algorithms.If(

          year.gte(2020)
            .and(year.lte(2025)),

          getCompositeNBR_L89(
            startPre,
            endPre
          ),

          ee.Image.constant(0)
            .rename("NBR")
            .clip(roi)

        )
      )
    )
  );


  // ======================
  // POST NBR
  // ======================
  var postNBR = ee.Image(

    ee.Algorithms.If(

      year.lte(2012),

      getCompositeNBR_L7(
        getL7Collection(
          startPost,
          endPost
        )
      ),

      ee.Algorithms.If(

        year.gte(2013)
          .and(year.lte(2018)),

        getCompositeNBR_L8(
          getL8Collection(
            startPost,
            endPost
          )
        ),

        ee.Algorithms.If(

          year.gte(2020)
            .and(year.lte(2025)),

          getCompositeNBR_L89(
            startPost,
            endPost
          ),

          ee.Image.constant(0)
            .rename("NBR")
            .clip(roi)

        )
      )
    )
  );


  // ======================
  // dNBR
  // ======================
  var dNBR = preNBR.subtract(postNBR);


  // ======================
  // PIXELES QUEMADOS
  // ======================
  var burned = dNBR
    .gt(dnbr_threshold)
    .rename(
      ee.String("burned_")
      .cat(yearStr)
    );

  return burned
    .clip(roi)
    .set("year", year);
}


// =====================================================
// 6) LISTA EXACTA DE AÑOS
// =====================================================
var yearsAll = ee.List.sequence(2001, 2012)

  .cat(
    ee.List.sequence(2013, 2018)
  )

  .cat(
    ee.List.sequence(2020, 2025)
  );

print(
  "Años usados:",
  yearsAll
);


// =====================================================
// 7) MAPAS BINARIOS POR AÑO
// =====================================================
var burnedList = yearsAll.map(function(y) {

  return burnedYear(y);

});

var burnedCollection = ee.ImageCollection
  .fromImages(burnedList);


// =====================================================
// 8) MULTIBANDA
// =====================================================
var burnedMultiBand =
  burnedCollection.toBands();


// =====================================================
// 9) LIMPIAR NOMBRES
// =====================================================
var bandNames =
  burnedMultiBand.bandNames();

var cleanBandNames =
  bandNames.map(function(b) {

    b = ee.String(b);

    return b
      .split("_")
      .slice(1)
      .join("_");

});

burnedMultiBand =
  burnedMultiBand.rename(
    cleanBandNames
  );


// =====================================================
// 10) FRECUENCIA TOTAL
// =====================================================
var fireFrequency =
  burnedMultiBand

  .reduce(ee.Reducer.sum())

  .clip(roi)

  .rename(
    "Fire_Frequency_2001_2025"
  );


// =====================================================
// 11) VISUALIZACIÓN
// =====================================================
var freqVis = {

  min: 0,

  max: 25,

  palette: [
    "white",
    "yellow",
    "orange",
    "red",
    "black"
  ]

};

Map.addLayer(

  fireFrequency,

  freqVis,

  "🔥 Frecuencia incendios 2001-2025"

);


// =====================================================
// 12) ÁREA TOTAL QUEMADA
// =====================================================

// 1 = quemado alguna vez
var burnedEver = fireFrequency
  .gt(0)
  .rename("BurnedEver");


// Área por pixel
var burnedArea_m2 = burnedEver
  .multiply(ee.Image.pixelArea());


// Sumar área total
var totalArea_m2 =
  burnedArea_m2.reduceRegion({

    reducer: ee.Reducer.sum(),

    geometry: roi,

    scale: 30,

    maxPixels: 1e13

});


// Convertir a hectáreas
var totalArea_ha =
  ee.Number(
    totalArea_m2.get("BurnedEver")
  )
  .divide(10000);

print(
  "🔥 Área total quemada (ha):",
  totalArea_ha
);


// =====================================================
// 13) EXPORTAR
// =====================================================
Export.image.toDrive({

  image: fireFrequency.toInt16(),

  description:
    "Fire_Frequency_2001_2025_Landsat",

  folder:
    "GEE_FIRE_RESULTS",

  fileNamePrefix:
    "Fire_Frequency_2001_2025_Landsat",

  region: roi,

  scale: 30,

  crs: "EPSG:4326",

  maxPixels: 1e13,

  fileFormat: "GeoTIFF",

  formatOptions: {
    cloudOptimized: true
  }

});