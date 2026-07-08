#===========================================================
# FIGURA ESTÉTICA TIPO NATURE (Times New Roman - sistema)
# Barras = superficie quemada
# Línea = número de incendios (eje secundario)
# Marzo centrado en el eje X
# SIN etiquetas
#===========================================================

library(tidyverse)
library(janitor)
library(scales)

#-----------------------------------------------------------
# 1) (Opcional pero recomendado en Windows)
#-----------------------------------------------------------
windowsFonts(Times = windowsFont("Times New Roman"))

#-----------------------------------------------------------
# 2) Cargar datos
#-----------------------------------------------------------
datos <- read.csv("C:/Users/ludov/OneDrive/Escritorio/SSC/MATRIZ_CORRELACION/Matriz_Correlacion6.csv")
datos <- clean_names(datos)

#-----------------------------------------------------------
# 3) Asegurar mes numérico
#-----------------------------------------------------------
datos$mes <- as.numeric(datos$mes)

#-----------------------------------------------------------
# 4) Resumen mensual
#-----------------------------------------------------------
resumen_mensual <- datos %>%
  group_by(mes) %>%
  summarise(
    sup_quemada = sum(sup_quemada, na.rm = TRUE),
    n_incendios = sum(n_incendios, na.rm = TRUE)
  ) %>%
  ungroup() %>%
  complete(mes = 1:12,
           fill = list(sup_quemada = 0,
                       n_incendios = 0))

#-----------------------------------------------------------
# 5) Mes pico (Marzo)
#-----------------------------------------------------------
mes_pico <- 3
pos_centro <- 6

mes_inicio <- mes_pico - (pos_centro - 1)
if(mes_inicio <= 0) mes_inicio <- mes_inicio + 12

orden_meses_centrado <- c(mes_inicio:12, 1:(mes_inicio-1))

resumen_mensual$mes_factor <- factor(resumen_mensual$mes,
                                     levels = orden_meses_centrado)

#-----------------------------------------------------------
# 6) Etiquetas meses
#-----------------------------------------------------------
meses_txt <- c("Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec")

#-----------------------------------------------------------
# 7) Escala secundaria
#-----------------------------------------------------------
factor_escala <- max(resumen_mensual$sup_quemada, na.rm = TRUE) /
  max(resumen_mensual$n_incendios, na.rm = TRUE)

#-----------------------------------------------------------
# 8) Posición de marzo
#-----------------------------------------------------------
pos_marzo <- which(levels(resumen_mensual$mes_factor) == mes_pico)

#-----------------------------------------------------------
# 9) Colores
#-----------------------------------------------------------
color_barras <- "#3B6EA5"
color_linea  <- "#D1495B"
color_peak   <- "#F4D35E"

#-----------------------------------------------------------
# 10) Figura
#-----------------------------------------------------------
fig_ciclo <- ggplot(resumen_mensual, aes(x = mes_factor)) +
  
  annotate("rect",
           xmin = pos_marzo - 0.5,
           xmax = pos_marzo + 0.5,
           ymin = -Inf, ymax = Inf,
           alpha = 0.08,
           fill = color_peak) +
  
  geom_col(aes(y = sup_quemada),
           fill = color_barras,
           width = 0.75,
           alpha = 0.9) +
  
  geom_line(aes(y = n_incendios * factor_escala, group = 1),
            color = color_linea,
            linewidth = 0.9) +
  
  geom_point(aes(y = n_incendios * factor_escala),
             color = color_linea,
             size = 2.4) +
  
  scale_y_continuous(
    name = "Burned area (ha)",
    labels = comma,
    sec.axis = sec_axis(~ . / factor_escala,
                        name = "Number of fires"),
    expand = expansion(mult = c(0.02, 0.2))
  ) +
  
  scale_x_discrete(labels = meses_txt[orden_meses_centrado]) +
  
  labs(x = NULL) +
  
  theme_classic(base_size = 13, base_family = "Times") +
  theme(
    axis.title.y.left  = element_text(size = 13, face = "bold", color = color_barras),
    axis.title.y.right = element_text(size = 13, face = "bold", color = color_linea),
    axis.text = element_text(color = "black"),
    axis.line = element_line(linewidth = 0.6),
    axis.ticks = element_line(linewidth = 0.6),
    plot.margin = margin(10, 15, 10, 15)
  )

#-----------------------------------------------------------
# 11) Mostrar figura
#-----------------------------------------------------------
fig_ciclo

#-----------------------------------------------------------
# 12) Exportar (calidad publicación)
#-----------------------------------------------------------
ggsave("Fig_CicloMensual_Incendios.png",
       fig_ciclo,
       width = 1.1,
       height = 0.5,
       dpi = 300)

ggsave("Fig_CicloMensual_Incendios.tiff",
       fig_ciclo,
       width = 1.1,
       height = 0.5,
       dpi = 300,
       compression = "lzw")

#-----------------------------------------------------------
# 13) Confirmación
#-----------------------------------------------------------
cat("Mes pico centrado:", meses_txt[mes_pico], "\n")
cat("Orden eje X:\n")
print(meses_txt[orden_meses_centrado])

