# ============================================================
# MATRIZ DE CORRELACIONES - MODELOS DE INCENDIOS
# Sierra de Santa Catarina
# ============================================================


# ------------------------------------------------------------
# 1. LIBRERÍAS
# ------------------------------------------------------------

library(tidyverse)
library(psych)
library(janitor)


# ------------------------------------------------------------
# 2. CARGAR BASE DE DATOS
# ------------------------------------------------------------

datos <- read.csv("C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion7.csv")

# limpiar nombres de columnas
datos <- clean_names(datos)


# ------------------------------------------------------------
# 3. FILTRAR PERIODO DE ESTUDIO
# SOLO 2015–2025
# ------------------------------------------------------------

datos <- datos %>%
  filter(anio >= 2001 & anio <= 2025)


# ------------------------------------------------------------
# 4. REVISAR VARIABLES DISPONIBLES
# ------------------------------------------------------------

names(datos)


# ------------------------------------------------------------
# 5. ELIMINAR VARIABLES DE TIEMPO PARA MATRIZ GENERAL
# ------------------------------------------------------------

datos_general <- datos %>%
  select(-anio, -mes)



# ============================================================
# MODELO A
# Sensibilidad climática de los incendios
# ============================================================

modelo_A <- datos %>%
  select(
    f_count,
    temp_max,
    temp_max_anom,
    solar_rad,
    rh,
    vpd,
    wind_speed,
    lst_trend,
    nino3_4,
    
  )


pdf("MODELO_A_Sensibilidad_climatica_incendios-2001-2025_final10.pdf", width = 10, height = 10)

pairs.panels(
  modelo_A,
  method = "pearson",
  hist.col = "cyan",
  density = TRUE,
  ellipses = TRUE,
  stars = TRUE,
  main = "Model A - Climate sensitivity of fires - 2001-2025"
)

dev.off()


# ============================================================
# MODELO B
# Determinantes del combustible seco
# ============================================================

modelo_B <- datos %>%
  select(
    nbr_monthly,
    dead_ratio,
    rh,
    spei12,
    vpd,
    temp_max_anom,
    nino3_4,
    
  )


pdf("MODELO_B_Determinantes del combustible seco-2001-2025_final10.pdf", width = 10, height = 10)

pairs.panels(
  modelo_C,
  method = "pearson",
  hist.col = "cyan",
  density = TRUE,
  ellipses = TRUE,
  stars = TRUE,
  main = "Model C - Determinants of dry fuel -2001-2025"
)

dev.off()

# ============================================================
# MODELO C
# Dinámica de ocurrencia de incendios
# ============================================================

modelo_B <- datos %>%
  select(
    f_count,
    n_hotspots_modis,
    temp_max_anom,
    precip,
    solar_rad,
    rh,
    kndvi_monthly,
    wind_speed,
    vpd,
    lst_trend,
    nino3_4,
  )


pdf("MODELO_C_Dinamica_ocurrencia_incendios-2001-2025_final10.pdf", width = 10, height = 10)

pairs.panels(
  modelo_B,
  method = "pearson",
  hist.col = "cyan",
  density = TRUE,
  ellipses = TRUE,
  stars = TRUE,
  main = "Model B - Fire Occurrence Dynamics - 2001-2025"
)

dev.off()




# ------------------------------------------------------------
# PANEL A
# ------------------------------------------------------------

pairs.panels(
  modelo_A,
  method = "pearson",
  hist.col = "cyan",
  density = TRUE,
  ellipses = TRUE,
  stars = TRUE,
  cex = 0.55,
  cex.labels = 0.7,
  main = "A) Climate sensitivity of fires"
)

# ------------------------------------------------------------
# PANEL B
# ------------------------------------------------------------

pairs.panels(
  modelo_C,
  method = "pearson",
  hist.col = "cyan",
  density = TRUE,
  ellipses = TRUE,
  stars = TRUE,
  cex = 0.65,
  cex.labels = 0.8,
  main = "B) Dry fuel determinants"
)


# ------------------------------------------------------------
# PANEL C
# ------------------------------------------------------------

pairs.panels(
  modelo_B,
  method = "pearson",
  hist.col = "cyan",
  density = TRUE,
  ellipses = TRUE,
  stars = TRUE,
  cex = 0.50,
  cex.labels = 0.65,
  main = "C) Fire occurrence dynamics"
)


dev.off()

