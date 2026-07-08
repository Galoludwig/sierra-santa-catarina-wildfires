# =========================
# MODELO C
# Dinámica temporal de incendios
# =========================

# Librerías
library(lme4)
library(performance)
library(dplyr)
library(janitor)

# =========================
# Cargar datos
# =========================

datos <- read.csv("C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion7.csv")

datos <- clean_names(datos)

# =========================
# Filtrar periodo
# =========================

modelo_C <- datos %>%
  filter(anio >= 2001 & anio <= 2025) %>%
  
  select(
    n_incendios,
    kndvi_mean,
    rh,
    vel_viento,
    spei12,
    nino3_4,
    anio,
    mes
  ) %>%
  
  na.omit()

# =========================
# Escalar variables
# =========================

modelo_C <- modelo_C %>%
  mutate(across(
    c(
      kndvi_mean,
      rh,
      vel_viento,
      spei12,
      nino3_4
    ),
    ~ as.numeric(scale(.))
  ))

# =========================
# Factores aleatorios
# =========================

modelo_C$anio <- as.factor(modelo_C$anio)
modelo_C$mes  <- as.factor(modelo_C$mes)

# =========================
# GLMM Poisson
# =========================

modelo_poisson_C <- glmer(
  
  n_incendios ~
    kndvi_mean +
    rh +
    vel_viento +
    spei12 +
    nino3_4 +
    (1 | anio) +
    (1 | mes),
  
  data = modelo_C,
  
  family = poisson(link = "log"),
  
  control = glmerControl(
    optimizer = "bobyqa",
    optCtrl = list(maxfun = 2e5)
  )
)

# =========================
# Resumen
# =========================

summary(modelo_poisson_C)

# =========================
# Efectos multiplicativos
# =========================

exp(fixef(modelo_poisson_C))

# =========================
# Sobredispersión
# =========================

check_overdispersion(modelo_poisson_C)

# =========================
# Colinealidad
# =========================

check_collinearity(modelo_poisson_C)

# =========================
# R² marginal y condicional
# =========================

r2(modelo_poisson_C)

# =========================
# Exportar resultados
# =========================

write.csv(
  as.data.frame(summary(modelo_poisson_C)$coefficients),
  "modelo_poisson_C_final.csv"
)

