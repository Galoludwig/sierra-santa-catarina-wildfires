# Wildfire Drivers in the Sierra de Santa Catarina (2001–2025)

## Overview

This repository contains the datasets, Google Earth Engine (GEE) scripts, R scripts, and figures used in the study:

**Biophysical and climatic drivers of wildfire occurrence in the Sierra de Santa Catarina (Mexico City, Mexico) from 2001 to 2025.**

The study integrates remote sensing, climatic variables, and generalized linear mixed models (GLMMs) to identify the main drivers of wildfire occurrence and vegetation fuel dynamics in a peri-urban volcanic ecosystem.

---

## Authors

* Galo Ludwig Márquez-Villalba
** Felipe Omar Tapia-Silva
*** Antonio Zoilo Márquez-García

* Graduate Program in Energy and Environment
** Applied Geomatics Laboratory for Natural Resources
*** Geology and Limnology Laboratory
Universidad Autónoma Metropolitana – Iztapalapa
Mexico City, Mexico

---

# Repository Structure

```text
.
├── Data/
│   ├── Monthly_Wildfire_Climate_Dataset_2001_2025.csv
│   └── SSC_boundary.geojson
│
├── GEE/
│   ├── 01_Dead_Ratio_Landsat.js
│   ├── 02_Fire_count_Landsat.js
│   ├── 03_NDVI_KNDVI_2001_2025.js
│   ├── 04_NBR_monthly_2001_2025.js
│   ├── 05_HOTSPOTS_MODIS.js
│   ├── 06_VPD.js
│   └── 07_RH.js
│
├── R/
│   ├── 01_Wildfire_Frequency.R
│   ├── 02_Wildfire_Trend.R
│   ├── 03_SPEI12_Calculation.R
│   ├── 04_FDI_Calculation.R
│   ├── 05_CorrelationAnalysis.R
│   ├── 06_GLM_MODEL_A.R
│   ├── 07_GLM_MODEL_B.R
│   └── 08_GLM_MODEL_C.R
│
├── Figures/
│   ├── Fig_1_Location_of_the_Sierra_de_Santa_Catarina_(SSC)_within_Mexico_City.png
│   ├── Fig_2_Overall_Approach_for_evaluating_drivers_of_fire_occurrence_and_dry_fuel_accumulation_in_the_SSC.png
│   ├── Fig_3_Spatial_distribution_map_of_wildfire_frequency_(A),_fire_seasonality_(B),_and_annual_wildfire_trend_(C)_in_the_Sierra_de_Santa_Catarina_(SSC),_Mexico_City,_during_the_2001–2025_period.png
│   ├── Fig_4_Seasonal_contrast_between_dry_and_rainy_conditions_in_the_SSC_CDMX_Mexico_City.png
│   ├── Fig_5_Model_A_Climatic_sensitivity_of_wildfires_(2001-2025).tif
│   ├── Fig_6_Model_B_Determinants_of_dry_fuel_(2001-2025).tif
│   ├── Fig_7_Model_C_Wildfire_occurrence_dynamics.tif
│   └── Fig_8_Evidence_of_the_wildfire_that_occurred_on_March_5_2022_on_Mazatepec_Volcano_Sierra_de_Santa_Catarina.
│  
├── README.md
├── LICENSE
└── CITATION.cff
```

---

# Data

## Monthly_Wildfire_Climate_Dataset_2001_2025.csv

Monthly dataset covering the period **January 2001–December 2025** used in all statistical analyses.

The dataset contains wildfire occurrence, vegetation indices, climatic variables, and fire-weather indicators used in the GLMM analyses, including:

* Wildfire count
* Burned area
* NDVI
* kNDVI
* NBR
* Relative Humidity (RH)
* Maximum Temperature
* Vapor Pressure Deficit (VPD)
* Wind Speed
* SPEI12
* Niño 3.4 Index
* Fire Danger Index (FDI)
* Additional environmental variables described in the manuscript.

---

## SSC_boundary.geojson

Polygon representing the boundary of the Sierra de Santa Catarina (SSC), used for image processing, spatial analyses, and figure generation.

---

# Google Earth Engine (GEE) Scripts

The **GEE/** directory contains the JavaScript scripts used to derive remotely sensed variables from Landsat, MODIS, and ERA5-Land datasets.

| Script                          | Description                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **01_Dead_Ratio_Landsat.js**    | Calculates the monthly Dead Ratio index from Landsat imagery.                                   |
| **02_Fire_count_Landsat.js**    | Estimates monthly wildfire counts from Landsat burned-area detections.                          |
| **03_NDVI_KNDVI_2001_2025.js**  | Computes monthly NDVI and kernel NDVI (kNDVI) for 2001–2025.                                    |
| **04_NBR_monthly_2001_2025.js** | Calculates monthly Normalized Burn Ratio (NBR).                                                 |
| **05_HOTSPOTS_MODIS.js**        | Extracts monthly MODIS Active Fire (hotspot) detections.                                        |
| **06_VPD.js**                   | Calculates monthly Vapor Pressure Deficit (VPD) from ERA5-Land.                                 |
| **07_RH.js**                    | Calculates monthly Relative Humidity (RH) from ERA5-Land temperature and dew-point temperature. |

---

# R Scripts

The **R/** directory contains the statistical analyses and data-processing workflow.

| Script                       | Description                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **01_Wildfire_Frequency.R**  | Calculates monthly and annual wildfire frequency.                                                                      |
| **02_Wildfire_Trend.R**      | Evaluates temporal wildfire trends using Mann–Kendall and Sen's slope analyses.                                        |
| **03_SPEI12_Calculation.R**  | Calculates the 12-month Standardized Precipitation–Evapotranspiration Index (SPEI12).                                  |
| **04_FDI_Calculation.R**     | Calculates the Fire Danger Index (FDI).                                                                                |
| **05_CorrelationAnalysis.R** | Computes Pearson correlation matrices among wildfire, climatic, and vegetation variables.                              |
| **06_GLM_MODEL_A.R**         | Fits Model A evaluating the climatic sensitivity of wildfire occurrence using generalized linear mixed models (GLMMs). |
| **07_GLM_MODEL_B.R**         | Fits Model B evaluating the determinants of vegetation fuel dynamics (NBR).                                            |
| **08_GLM_MODEL_C.R**         | Fits Model C evaluating wildfire occurrence dynamics using climatic and vegetation predictors.                         |

---

# Figures

The **Figures/** directory contains the figures presented in the manuscript.

| Figure | Description |
|---------|-------------|
| **Fig_1_Location_of_the_Sierra_de_Santa_Catarina_(SSC)_within_Mexico_City.tif** | Location of the Sierra de Santa Catarina (SSC), a peri-urban volcanic protected area located in eastern Mexico City, Mexico. |
| **Fig_2_Overall_Approach_for_evaluating_drivers_of_fire_occurrence_and_dry_fuel_accumulation_in_the_SSC.tif** | Conceptual workflow illustrating the integration of remote sensing, climatic variables, and generalized linear mixed models (GLMMs) used to identify the drivers of wildfire occurrence and vegetation fuel dynamics. |
| **Fig_3_Spatial_distribution_map_of_wildfire_frequency_(A),_fire_seasonality_(B),_and_annual_wildfire_trend_(C)_in_the_Sierra_de_Santa_Catarina_(SSC),_Mexico_City,_during_the_2001–2025_period.tif** | Spatial distribution of wildfire frequency (A), seasonal wildfire occurrence (B), and annual wildfire trend (C) in the Sierra de Santa Catarina during 2001–2025. |
| **Fig_4_Seasonal_contrast_between_dry_and_rainy_conditions_in_the_SSC_CDMX_Mexico_City.tif** | Seasonal comparison between the dry and rainy seasons in the Sierra de Santa Catarina, highlighting differences in vegetation condition and landscape characteristics. |
| **Fig_5_Model_A_Climatic_sensitivity_of_wildfires_(2001-2025).tif** | Pearson correlation matrix showing the relationships between wildfire occurrence and climatic variables used in Model A. |
| **Fig_6_Model_B_Determinants_of_dry_fuel_(2001-2025).tif** | Pearson correlation matrix showing the relationships between vegetation fuel dynamics (NBR) and climatic variables used in Model B. |
| **Fig_7_Model_C_Wildfire_occurrence_dynamics.tif** | Pearson correlation matrix showing the relationships among wildfire occurrence, vegetation condition (kNDVI), and climatic variables used in Model C. |                                                         
---

# Data Sources

The analyses integrate publicly available datasets from:

* Landsat Collection 2 Level-2 (USGS)
* MODIS Active Fire Product (NASA FIRMS)
* ERA5-Land Reanalysis (Copernicus Climate Change Service)
* NOAA Climate Prediction Center (Niño 3.4 Index)
* Standardized Precipitation–Evapotranspiration Index (SPEI)
* Meteorological observations from Los Reyes Weather Station (Servicio Meteorológico Nacional)

---

# Software Requirements

## Software

* Google Earth Engine
* R (≥ 4.4)
* RStudio

## Main R packages

* tidyverse
* terra
* sf
* glmmTMB
* lme4
* performance
* DHARMa
* MuMIn
* lubridate
* Kendall
* trend
* psych
* corrplot
* SPEI

---

# Workflow

The complete workflow follows these steps:

1. Generate remote sensing variables in Google Earth Engine.
2. Export monthly datasets.
3. Calculate climatic indicators (SPEI12 and FDI).
4. Merge climatic, wildfire, and vegetation datasets.
5. Perform exploratory and correlation analyses.
6. Fit GLMM Models A–C.
7. Generate figures and tables.

---

# Reproducibility

All analyses presented in the manuscript can be reproduced using the scripts included in this repository.

Run the scripts sequentially following their numerical order.

---

# Citation

If you use this repository, please cite:

Márquez-Villalba, G. L., Tapia-Silva, F. O. & Márquez-García, A. Z. (2026). *Wildfire Drivers in the Sierra de Santa Catarina (2001–2025).* Zenodo. https://doi.org/XXXXXXXXXX



---

# License

This repository is distributed under the **MIT License**.

---

# Contact

**Felipe Omar Tapia-Silva

Applied Geomatics Laboratory for Natural Resources

Universidad Autónoma Metropolitana – Iztapalapa

Mexico City, Mexico
