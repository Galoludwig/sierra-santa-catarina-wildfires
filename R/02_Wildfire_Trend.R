#===========================================================
# TENDENCIA ANUAL DE INCENDIOS + SUPERFICIE QUEMADA
# Línea roja = incendios
# Barras grises = superficie quemada
#===========================================================

library(tidyverse)
library(janitor)
library(Kendall)
library(trend)
library(scales)

#-----------------------------------------------------------
# 1) Fuente Times New Roman (Windows)
#-----------------------------------------------------------
windowsFonts(Times = windowsFont("Times New Roman"))

#-----------------------------------------------------------
# 2) Cargar datos
#-----------------------------------------------------------
datos <- read.csv("C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion7.csv")
datos <- clean_names(datos)

#-----------------------------------------------------------
# 3) Preparar datos
#-----------------------------------------------------------
datos$anio <- as.numeric(datos$anio)

datos <- datos %>%
  filter(anio >= 2001 & anio <= 2025)

#-----------------------------------------------------------
# 4) Resumen anual
#-----------------------------------------------------------
resumen_anual <- datos %>%
  group_by(anio) %>%
  summarise(
    incendios   = sum(f_count, na.rm = TRUE),
    sup_quemada = sum(b_surface, na.rm = TRUE)
  ) %>%
  ungroup() %>%
  complete(
    anio = 2001:2025,
    fill = list(
      incendios = 0,
      sup_quemada = 0
    )
  )

#-----------------------------------------------------------
# 5) Mann-Kendall
#-----------------------------------------------------------
mk <- MannKendall(resumen_anual$incendios)
tau   <- mk$tau
p_val <- mk$sl

#-----------------------------------------------------------
# 6) Sen's slope
#-----------------------------------------------------------
sen <- sens.slope(resumen_anual$incendios)
pendiente <- sen$estimates

#-----------------------------------------------------------
# 7) Modelo lineal para IC (visual)
#-----------------------------------------------------------
modelo <- lm(incendios ~ anio, data = resumen_anual)
pred <- predict(modelo, interval = "confidence")

resumen_anual <- resumen_anual %>%
  mutate(
    fit = pred[, "fit"],
    lwr = pred[, "lwr"],
    upr = pred[, "upr"]
  )

#-----------------------------------------------------------
# 8) Escalado para doble eje
#-----------------------------------------------------------
factor_escala <- max(resumen_anual$incendios, na.rm = TRUE) /
  max(resumen_anual$sup_quemada, na.rm = TRUE)

#-----------------------------------------------------------
# 9) p formateado
#-----------------------------------------------------------
p_label <- ifelse(
  p_val < 0.001,
  "p < 0.001*",
  paste0("p = ", round(p_val, 3))
)

#-----------------------------------------------------------
# 10) Figura
#-----------------------------------------------------------
fig_tendencia <- ggplot(resumen_anual, aes(x = anio)) +
  
  # Barras superficie quemada
  geom_col(
    aes(y = sup_quemada * factor_escala),
    fill = "#4e7cae",
    alpha = 0.7,
    width = 0.7
  ) +
  
  # Banda de confianza
  geom_ribbon(
    aes(
      ymin = pmax(lwr, 0),
      ymax = upr
    ),
    fill = "grey60",
    alpha = 0.2
  ) +
  
  # Línea observada
  geom_line(
    aes(y = incendios),
    color = "#D1495B",
    linewidth = 1.2
  ) +
  
  # Puntos
  geom_point(
    aes(y = incendios),
    color = "#D1495B",
    size = 2.3
  ) +
  
  # Tendencia
  geom_line(
    aes(y = fit),
    color = "black",
    linewidth = 1,
    linetype = "dashed"
  ) +
  
  # Texto estadístico
  annotate(
    "text",
    x = 2003,
    y = min(resumen_anual$incendios, na.rm = TRUE) +
      0.40 * diff(range(resumen_anual$incendios, na.rm = TRUE)),
    hjust = 0,
    label = paste0(
      "Mann-Kendall \u03C4 = ", round(tau, 2),
      "\nSen's slope = ", round(pendiente, 2),
      "\n", p_label
    ),
    size = 3.5,
    color = "black"
  ) +
  
  # Eje Y principal y secundario
  scale_y_continuous(
    name = "Number of fires",
    
    sec.axis = sec_axis(
      ~ . / factor_escala,
      name = "Burned area (ha)"
    ),
    
    expand = expansion(mult = c(0.08, 0.05))
  ) +
  
  labs(
    x = "Year"
  ) +
  
  theme_classic(base_size = 13, base_family = "Times") +
  theme(
    axis.text = element_text(color = "black"),
    axis.line = element_line(linewidth = 0.6),
    axis.ticks = element_line(linewidth = 0.6),
    plot.margin = margin(10, 15, 10, 15),
    
    axis.title.y.left = element_text(color = "#D1495B"),
    axis.title.y.right = element_text(color = "#4e7cae")
  )

#-----------------------------------------------------------
# 11) Mostrar figura
#-----------------------------------------------------------
fig_tendencia

#-----------------------------------------------------------
# 12) Exportar
#-----------------------------------------------------------
ggsave(
  "Tendencia_Incendios_SupQuemada_FINAL.png",
  fig_tendencia,
  width = 7,
  height = 4,
  dpi = 600
)

ggsave(
  "Tendencia_Incendios_SupQuemada_FINAL.tiff",
  fig_tendencia,
  width = 7,
  height = 4,
  dpi = 600,
  compression = "lzw"
)

#-----------------------------------------------------------
# 13) Consola
#-----------------------------------------------------------
cat("Mann-Kendall tau:", round(tau, 3), "\n")
cat("p-value:", p_label, "\n")
cat("Sen's slope:", round(pendiente, 3), "\n")

