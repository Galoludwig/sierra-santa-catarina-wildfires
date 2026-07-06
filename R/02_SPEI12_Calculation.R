# ============================================================
# CALCULO DE SPEI-12
# Sierra de Santa Catarina, CDMX
# ============================================================
#
# Input:
#   Data/Matriz_Correlacion7.csv
#
# Output:
#   Outputs/Matriz_Correlacion_SPEI12.csv
# ============================================================

# ------------------------------------------------------------
# Load required packages
# ------------------------------------------------------------
packages <- c("tidyverse", "SPEI", "zoo", "janitor")

install_if_missing <- function(pkg){
  if(!require(pkg, character.only = TRUE)){
    install.packages(pkg)
    library(pkg, character.only = TRUE)
  }
}

invisible(lapply(packages, install_if_missing))

# ------------------------------------------------------------
# Load data
# ------------------------------------------------------------
datos <- read.csv("Data/Matriz_Correlacion7.csv") %>%
  janitor::clean_names()

# ------------------------------------------------------------
# Sort observations
# ------------------------------------------------------------
datos <- datos %>%
  arrange(anio, mes)

# ------------------------------------------------------------
# Calculate mean air temperature
# ------------------------------------------------------------
datos <- datos %>%
  mutate(
    temp_media = (temp_max + temp_min) / 2
  )

# ------------------------------------------------------------
# Interpolate missing values
# ------------------------------------------------------------
datos <- datos %>%
  mutate(
    temp_media = zoo::na.approx(temp_media, na.rm = FALSE),
    precip     = zoo::na.approx(precip, na.rm = FALSE)
  )

# ------------------------------------------------------------
# Convert to monthly time series
# ------------------------------------------------------------
ts_temp <- ts(datos$temp_media, frequency = 12)
ts_precip <- ts(datos$precip, frequency = 12)

# ------------------------------------------------------------
# Calculate potential evapotranspiration (PET)
# ------------------------------------------------------------
pet <- SPEI::thornthwaite(ts_temp, lat = 19.3)

# ------------------------------------------------------------
# Water balance
# ------------------------------------------------------------
balance <- ts_precip - pet

# ------------------------------------------------------------
# Calculate SPEI-12
# ------------------------------------------------------------
spei12_obj <- SPEI::spei(balance, scale = 12)

# Extract fitted values
datos$spei12 <- as.numeric(spei12_obj$fitted)

# ------------------------------------------------------------
# Summary statistics
# ------------------------------------------------------------
summary(datos$spei12)

# ------------------------------------------------------------
# Export results
# ------------------------------------------------------------
write.csv(
  datos,
  "Outputs/Matriz_Correlacion_SPEI12.csv",
  row.names = FALSE
)

cat("SPEI-12 successfully calculated.\n")

# ============================================================
# End of script
# ============================================================