# =========================================
# MODELO BETA REGRESSION (GLMM)
# NBR_MENSUAL ~ variables climáticas
# GLMM Beta (glmmTMB) - link logit
# =========================================

library(tidyverse)
library(janitor)
library(glmmTMB)
library(performance)
library(DHARMa)
library(car)

# ============================================================
# 1) CARGAR DATOS
# ============================================================

datos <- read.csv("C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion7.csv")
datos <- clean_names(datos)

# ============================================================
# 2) SELECCIONAR VARIABLES
# ============================================================

modelo_C <- datos %>%
  select(
    nbr_mensual,
    dead_ratio,
    rh,
    spei12,
    vpd,
    temp_max_anom,
    nino3_4,
    anio,
    mes
  ) %>%
  na.omit()

summary(modelo_C$nbr_mensual)

# ============================================================
# 3) RE-ESCALAR NBR a (0,1) para distribución Beta
# ============================================================

min_nbr <- min(modelo_C$nbr_mensual)
max_nbr <- max(modelo_C$nbr_mensual)

modelo_C <- modelo_C %>%
  mutate(
    nbr_scaled = (nbr_mensual - min_nbr) / (max_nbr - min_nbr)
  )

# Ajuste para evitar 0 y 1 exactos
n <- nrow(modelo_C)

modelo_C <- modelo_C %>%
  mutate(
    nbr_beta = (nbr_scaled * (n - 1) + 0.5) / n
  )

summary(modelo_C$nbr_beta)

# ============================================================
# 4) ESCALAR PREDICTORES
# ============================================================

modelo_C <- modelo_C %>%
  mutate(across(
    c(rh, spei12, vpd, temp_max_anom, nino3_4),
    ~ as.numeric(scale(.))
  ))

# ============================================================
# 5) AJUSTAR GLMM Beta (logit)
# ============================================================

modelo_nbr_glmm <- glmmTMB(
  nbr_beta ~ dead_ratio + rh + spei12 + vpd + temp_max_anom + nino3_4 +
    (1 | anio) + (1 | mes),
  data = modelo_C,
  family = beta_family(link = "logit")
)

# ============================================================
# 6) RESULTADOS
# ============================================================

summary(modelo_nbr_glmm)

# ============================================================
# 7) MÉTRICAS
# ============================================================

cat("\n====================================\n")
cat("MÉTRICAS GLMM Beta (logit) NBR_MENSUAL\n")
cat("====================================\n")

cat("AIC:", AIC(modelo_nbr_glmm), "\n")
cat("BIC:", BIC(modelo_nbr_glmm), "\n")

cat("\nR2 del modelo:\n")
print(r2(modelo_nbr_glmm))

# ============================================================
# 8) COLINEALIDAD (VIF aproximado)
# ============================================================

modelo_vif <- lm(
  nbr_beta ~ dead_ratio + rh + spei12 + vpd + temp_max_anom + nino3_4,
  data = modelo_C
)

cat("\n====================================\n")
cat("VIF (Multicolinealidad)\n")
cat("====================================\n")
print(vif(modelo_vif))

# ============================================================
# 9) DIAGNÓSTICOS DHARMa
# ============================================================

cat("\n====================================\n")
cat("DIAGNÓSTICOS DHARMa\n")
cat("====================================\n")

res <- simulateResiduals(modelo_nbr_glmm, n = 1000)
plot(res)

testDispersion(res)
testUniformity(res)
testZeroInflation(res)

