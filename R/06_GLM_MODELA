# ============================================================
# GLMM POISSON - INCENDIOS Y CLIMA
# ============================================================

library(dplyr)
library(janitor)
library(lme4)
library(performance)

# ============================================================
# CARGAR DATOS
# ============================================================

datos <- read.csv(
  "C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion7.csv"
)

datos <- clean_names(datos)

# ============================================================
# FILTRAR PERIODO
# ============================================================

datos <- datos %>%
  filter(anio >= 2001 & anio <= 2025)

# ============================================================
# VARIABLES
# ============================================================

modelo_final <- datos %>%
  select(
    n_incendios,
    temp_max,
    rh,
    vel_viento,
    spei12,
    nino3_4,
    anio,
    mes
  ) %>%
  na.omit()

# ============================================================
# ESTANDARIZAR
# ============================================================

modelo_final <- modelo_final %>%
  mutate(across(
    c(temp_max, rh, vel_viento, spei12, nino3_4),
    ~ as.numeric(scale(.))
  ))

# ============================================================
# FACTORES
# ============================================================

modelo_final$anio <- as.factor(modelo_final$anio)
modelo_final$mes  <- as.factor(modelo_final$mes)

# ============================================================
# MODELO POISSON
# ============================================================

modelo_poisson <- glmer(
  n_incendios ~ temp_max + rh + vel_viento +
    spei12 + nino3_4 +
    (1 | anio) + (1 | mes),
  
  data = modelo_final,
  
  family = poisson(link = "log"),
  
  control = glmerControl(
    optimizer = "bobyqa",
    optCtrl = list(maxfun = 2e5)
  )
)

# ============================================================
# RESULTADOS
# ============================================================

summary(modelo_poisson)

# Efectos multiplicativos
exp(fixef(modelo_poisson))

# ============================================================
# DIAGNÓSTICOS
# ============================================================

check_overdispersion(modelo_poisson)

check_collinearity(modelo_poisson)

r2(modelo_poisson)

# ============================================================
# EXPORTAR
# ============================================================

write.csv(
  as.data.frame(summary(modelo_poisson)$coefficients),
  "modelo_poisson_tempmax.csv"
)

