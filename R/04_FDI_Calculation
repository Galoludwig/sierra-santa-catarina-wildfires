# ============================================================
# CALCULO FDI (HOTSPOTS POR 100 ha) + GRAFICA + EXPORTACION
# Sierra de Santa Catarina (SSC) 2001-2025
# ============================================================

if (!require(dplyr)) install.packages("dplyr")
if (!require(janitor)) install.packages("janitor")
if (!require(ggplot2)) install.packages("ggplot2")

library(dplyr)
library(janitor)
library(ggplot2)

# ============================================================
# 1. CARGAR DATOS
# ============================================================

datos <- read.csv("C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion7.csv") %>%
  clean_names()

# ============================================================
# 2. FILTRAR PERIODO
# ============================================================

datos <- datos %>%
  filter(anio >= 2001 & anio <= 2025)

# ============================================================
# 3. AREA DEL AOI SSC (HECTAREAS)
# ============================================================

area_ha <- 2166

# ============================================================
# 4. CALCULAR FDI (HOTSPOTS POR 100 ha) POR MES
# ============================================================

datos <- datos %>%
  mutate(
    fdi_100ha = (n_hotspots_modis / area_ha) * 100
  )

# ============================================================
# 5. CREAR FECHA (PARA SERIE TEMPORAL)
# ============================================================

datos <- datos %>%
  mutate(
    fecha = as.Date(paste(anio, mes, "01", sep = "-"))
  ) %>%
  arrange(fecha)

# ============================================================
# 6. TABLA FINAL PARA EXPORTAR
# ============================================================

tabla_fdi <- datos %>%
  select(anio, mes, n_hotspots_modis, fdi_100ha) %>%
  arrange(anio, mes)

print(head(tabla_fdi, 20))

# ============================================================
# 7. EXPORTAR TABLA A CSV
# ============================================================

write.csv(tabla_fdi,
          "FDI_100ha_Mensual_SSC_2001_2025_landsat.csv",
          row.names = FALSE)

cat("CSV exportado: FDI_100ha_Mensual_SSC_2001_2025_landsat.csv\n")

# ============================================================
# 8. GRAFICA RECOMENDADA (SERIE TEMPORAL FDI)
# ============================================================

grafica_fdi <- ggplot(datos, aes(x = fecha, y = fdi_100ha)) +
  geom_line(linewidth = 0.7) +
  geom_point(size = 1.4) +
  labs(
    title = "Índice de Densidad de Incendios (FDI) mensual (2001–2025)",
    subtitle = "Hotspots MODIS por 100 hectáreas en la Sierra de Santa Catarina",
    x = "Año",
    y = "FDI (hotspots / 100 ha)"
  ) +
  theme_classic(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold"),
    plot.subtitle = element_text(size = 11)
  )

print(grafica_fdi)

# ============================================================
# 9. GUARDAR GRAFICA EN PNG (CALIDAD PUBLICACION)
# ============================================================

ggsave("FDI_100ha_SerieTemporal_SSC_2001_2025.png",
       plot = grafica_fdi,
       width = 12,
       height = 6,
       dpi = 600)

cat("Figura exportada: FDI_100ha_SerieTemporal_SSC_2001_2025.png\n")

# ============================================================
# 10. GRAFICA EXTRA (PROMEDIO MENSUAL CLIMATOLOGICO)
# ============================================================

promedio_mensual <- datos %>%
  group_by(mes) %>%
  summarise(
    fdi_promedio = mean(fdi_100ha, na.rm = TRUE),
    fdi_sd = sd(fdi_100ha, na.rm = TRUE)
  )

grafica_clima <- ggplot(promedio_mensual, aes(x = mes, y = fdi_promedio)) +
  geom_col() +
  geom_errorbar(aes(ymin = fdi_promedio - fdi_sd,
                    ymax = fdi_promedio + fdi_sd),
                width = 0.2) +
  scale_x_continuous(breaks = 1:12) +
  labs(
    title = "FDI promedio mensual (climatología 2001–2025)",
    subtitle = "Media ± desviación estándar",
    x = "Mes",
    y = "FDI promedio (hotspots / 100 ha)"
  ) +
  theme_classic(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold"),
    plot.subtitle = element_text(size = 11)
  )

print(grafica_clima)

ggsave("FDI_100ha_ClimatologiaMensual_SSC_2001_2025.png",
       plot = grafica_clima,
       width = 10,
       height = 5,
       dpi = 600)

cat("Figura exportada: FDI_100ha_ClimatologiaMensual_SSC_2001_2025.png\n")

