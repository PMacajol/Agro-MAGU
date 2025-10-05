// telegramIA.jsx - Servicio unificado de recomendación y notificación para Telegram

// =============================================================================
// CONFIGURACIÓN Y CONSTANTES
// =============================================================================

const CONFIG = {
  // Configuración de OpenRouter API
  openRouter: {
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY_Telegram,
    model: "openai/gpt-4.1-mini",
  },
  // Configuración de Telegram Bot
  telegram: {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    apiUrl: "https://api.telegram.org/bot",
    defaultChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID,
  },
  // Umbrales para alertas automáticas
  thresholds: {
    nitrogen: { min: 60, max: 120, critical: 40 },
    phosphorus: { min: 30, max: 60, critical: 20 },
    potassium: { min: 100, max: 200, critical: 80 },
    ph: { min: 5.5, max: 7.0, criticalLow: 5.0, criticalHigh: 7.5 },
    humidity: { min: 60, max: 85, critical: 50 },
    temperature: { min: 18, max: 30, criticalLow: 12, criticalHigh: 35 },
    sunlight: { min: 70, max: 95, critical: 60 },
  },
};

// =============================================================================
// SERVICIO DE RECOMENDACIÓN POR IA (OpenRouter)
// =============================================================================

/**
 * Obtiene recomendaciones de fertilizantes desde OpenRouter API
 */
export const getFertilizerRecommendationFromAPI = async (parameters) => {
  try {
    const apiKey = CONFIG.openRouter.apiKey;

    console.log(
      "🔑 Verificando API Key OpenRouter...",
      apiKey ? "Presente" : "Faltante"
    );

    if (!apiKey) {
      throw new Error(
        "API key de OpenRouter no configurada en variables de entorno"
      );
    }

    const prompt = `Eres un ingeniero agrónomo guatemalteco con 25 años de experiencia especializada en cultivo de frijol. Proporciona recomendaciones TÉCNICAS y PRÁCTICAS para pequeños y medianos agricultores. Las dosis deben calcularse estrictamente por MANZANA (1 manzana = 0.70 hectáreas = 7,000 m²).

ANÁLISIS DE SUELO proporcionado:
- Nitrógeno (N): ${parameters.nitrogen} ppm
- Fósforo (P): ${parameters.phosphorus} ppm
- Potasio (K): ${parameters.potassium} ppm
- pH del suelo: ${parameters.ph}
- Humedad: ${parameters.humidity}%
- Temperatura: ${parameters.temperature}°C
- Luz solar: ${parameters.sunlight}%

INTERPRETACIÓN AGRONÓMICA:
- Nitrógeno (N): ${
      parameters.nitrogen < 60
        ? "DEFICIENTE"
        : parameters.nitrogen > 120
        ? "EXCESIVO"
        : "ÓPTIMO"
    } para frijol. Rango óptimo: 60-120 ppm.
- Fósforo (P): ${
      parameters.phosphorus < 30
        ? "DEFICIENTE"
        : parameters.phosphorus > 60
        ? "EXCESIVO"
        : "ÓPTIMO"
    } para frijol. Rango óptimo: 30-60 ppm.
- Potasio (K): ${
      parameters.potassium < 100
        ? "DEFICIENTE"
        : parameters.potassium > 200
        ? "EXCESIVO"
        : "ÓPTIMO"
    } para frijol. Rango óptimo: 100-200 ppm.
- pH: ${
      parameters.ph < 5.5
        ? "ÁCIDO"
        : parameters.ph > 7.0
        ? "ALCALINO"
        : "NEUTRO"
    }. Rango ideal para frijol: 6.0-6.5.

CONSIDERACIONES ESPECÍFICAS PARA GUATEMALA:
- Los suelos volcánicos tienen alta capacidad de fijación de fósforo
- En el Corredor Seco, priorizar la retención de humedad mediante cobertura y materia orgánica
- El sistema K'uxu'rum (madre cacao + maíz + frijol) mejora la humedad del suelo y aporta nitrógeno

RECOMENDACIÓN REQUERIDA:
Genera una recomendación PRECISA considerando los parámetros exactos proporcionados.

DEVUELVE ÚNICAMENTE un objeto JSON con esta estructura:
{
  "diagnostico": "Breve diagnóstico técnico basado en los parámetros",
  "nombre_recomendacion": "Nombre específico de la recomendación", 
  "dosis_manzana": "Cantidad exacta por manzana (ej: 100-120 lb/manzana de fórmula 10-30-10)",
  "producto_sugerido": "Fórmula NPK específica y tipo",
  "precio_aproximado": "Precio en Quetzales (GTQ) por manzana",
  "esquema_aplicacion": "Etapas y momentos de aplicación detallados",
  "eficacia_esperada": "% de efectividad para corregir las deficiencias",
  "beneficios_tecnicos": ["5 beneficios agronómicos específicos"],
  "precauciones": ["5 riesgos o consideraciones técnicas"],
  "recomendaciones_complementarias": ["Manejo de suelo, riego, otras prácticas"]
}

SOLO JSON, sin texto adicional.`;

    const requestBody = {
      model: CONFIG.openRouter.model,
      messages: [
        {
          role: "system",
          content:
            "Eres un ingeniero agrónomo especializado en cultivos de frijol en Guatemala, con 25 años de experiencia. Proporcionas ÚNICAMENTE JSON válido sin comentarios adicionales. Tus recomendaciones son técnicas, prácticas y específicas para las condiciones guatemaltecas, usando siempre MANZANA como unidad de superficie.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    };

    console.log("🌐 Enviando solicitud a OpenRouter API...");

    const response = await fetch(CONFIG.openRouter.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://pmacajol.github.io/Agro-MAGU",
        "X-Title": "Agro-MAGU",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📨 Status de respuesta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de OpenRouter API:", errorText);
      throw new Error(
        `Error en OpenRouter API: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Respuesta completa de OpenRouter recibida");

    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Respuesta de API vacía o mal formada");
    }

    console.log("📝 Contenido de la respuesta:", content);

    // Extraer y validar JSON de la respuesta
    return parseAIResponse(content, parameters);
  } catch (error) {
    console.error("💥 Error al obtener recomendación de OpenRouter:", error);
    return getPersonalizedFallback(parameters);
  }
};

/**
 * Parsea y valida la respuesta de la IA
 */
const parseAIResponse = (content, parameters) => {
  try {
    // Intentar parsear directamente
    const directParse = JSON.parse(content);
    if (isValidRecommendation(directParse)) {
      console.log("✅ JSON parseado directamente");
      return directParse;
    }
  } catch (directError) {
    console.log("⚠️ Parseo directo fallido, intentando extraer JSON...");
  }

  // Intentar extraer JSON del contenido
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedParse = JSON.parse(jsonMatch[0]);
      if (isValidRecommendation(extractedParse)) {
        console.log("✅ JSON extraído y parseado exitosamente");
        return extractedParse;
      }
    }
  } catch (extractError) {
    console.error("❌ Error extrayendo JSON:", extractError);
  }

  // Si todo falla, usar respaldo
  console.log("🔄 Usando respaldo personalizado");
  return getPersonalizedFallback(parameters);
};

/**
 * Valida la estructura del objeto de recomendación
 */
const isValidRecommendation = (obj) => {
  const requiredFields = [
    "diagnostico",
    "nombre_recomendacion",
    "dosis_manzana",
    "producto_sugerido",
    "precio_aproximado",
    "esquema_aplicacion",
  ];

  return requiredFields.every(
    (field) =>
      obj.hasOwnProperty(field) &&
      obj[field] !== null &&
      obj[field] !== undefined
  );
};

// =============================================================================
// FUNCIONES DE RESPALDO
// =============================================================================

/**
 * Función de respaldo personalizada según parámetros
 */
const getPersonalizedFallback = (parameters) => {
  console.log("🔄 Generando recomendación personalizada de respaldo...");

  // Lógica basada en los parámetros
  let recommendation;

  // Escenario 1: Déficit crítico de Fósforo y Potasio
  if (parameters.phosphorus < 30 && parameters.potassium < 100) {
    recommendation = {
      diagnostico: `Déficit crítico de Fósforo (${parameters.phosphorus} ppm) y Potasio (${parameters.potassium} ppm) detectado en suelo volcánico.`,
      nombre_recomendacion:
        "Fertilizante Fosfo-Potásico para Suelos Volcánicos",
      dosis_manzana: "90-110 lb/manzana de fórmula 10-30-20 aplicado al surco",
      producto_sugerido: "NPK 10-30-20 granulado de liberación controlada",
      precio_aproximado: "GTQ 650-800 por manzana",
      esquema_aplicacion:
        "Aplicar 60 lb/manzana a la siembra y 40-50 lb/manzana en la floración.",
      eficacia_esperada: "92% para corregir deficiencias de P y K",
      beneficios_tecnicos: [
        "Corrige el déficit crítico de Fósforo en suelos volcánicos",
        "Suple la deficiencia de Potasio mejorando la resistencia hídrica",
        "Mejora el desarrollo radicular y la eficiencia en el uso de agua",
        "Aumenta el amarre de vainas y el llenado uniforme del grano",
        "Reduce el impacto del estrés por sequías intermitentes",
      ],
      precauciones: [
        "La aplicación excesiva puede inmovilizar micronutrientes como el Zinc",
        "No aplicar en contacto directo con la semilla por riesgo de fitotoxicidad",
        "En suelos muy ácidos (pH < 5.5), la efectividad se reduce sin encalado previo",
        "Requiere humedad adecuada para la disponibilidad nutrimental",
        "El Fósforo es susceptible a fijación en suelos volcánicos",
      ],
      recomendaciones_complementarias: [
        "Realizar encalado si el pH es menor a 5.5",
        "Incorporar materia orgánica (5-10 ton/manzana de gallinaza)",
        "Considerar el sistema K'uxu'rum con madrecacao para aporte natural de Nitrógeno",
        "Mantener cobertura vegetal para reducir estrés por temperatura",
        "Realizar análisis de suelo cada 2 ciclos para ajustar la fertilización",
      ],
    };
  }
  // Escenario 2: Déficit de Nitrógeno
  else if (parameters.nitrogen < 60) {
    recommendation = {
      diagnostico: `Déficit de Nitrógeno (${parameters.nitrogen} ppm) detectado.`,
      nombre_recomendacion: "Fertilizante Nitrogenado de Liberación Controlada",
      dosis_manzana: "80-100 lb/manzana de Urea 46-0-0 aplicado en cobertura",
      producto_sugerido: "Urea 46-0-0 gránulos perlados",
      precio_aproximado: "GTQ 350-450 por manzana",
      esquema_aplicacion:
        "Aplicar 40 lb/manzana a los 15 días después de siembra y 40-60 lb/manzana a los 30 días.",
      eficacia_esperada: "88-92% para corregir déficit de Nitrógeno",
      beneficios_tecnicos: [
        "Corrige rápidamente el déficit de Nitrógeno para crecimiento vegetativo",
        "Estimula la producción de hojas y área foliar para mejor fotosíntesis",
        "Mejora el color verde del cultivo en 10-15 días después de aplicación",
        "Aumenta la biomasa total y capacidad productiva de la planta",
        "Fácil aplicación y rápida disponibilidad para la planta",
      ],
      precauciones: [
        "Alta susceptibilidad a pérdidas por volatilización en temperaturas > 30°C",
        "Puede acidificar el suelo con uso continuo sin encalado",
        "Requiere aplicación fraccionada para maximizar eficiencia",
        "Sensible a condiciones de humedad excesiva o deficiente",
        "Pérdidas por lixiviación en lluvias intensas después de aplicación",
      ],
      recomendaciones_complementarias: [
        "Incorporar abonos verdes como mucuna o canavalia para fijación biológica de N",
        "Usar inhibidores de ureasa en aplicaciones con altas temperaturas",
        "Implementar riego por goteo para mayor eficiencia en uso de nitrógeno",
        "Monitorear niveles de Nitrógeno cada 3 semanas durante crecimiento",
        "Combinar con fuentes orgánicas como gallinaza (2-3 ton/manzana)",
      ],
    };
  }
  // Escenario 3: Parámetros Óptimos - Mantenimiento
  else {
    recommendation = {
      diagnostico: `Parámetros dentro de rangos óptimos: N ${parameters.nitrogen} ppm, P ${parameters.phosphorus} ppm, K ${parameters.potassium} ppm, pH ${parameters.ph}.`,
      nombre_recomendacion:
        "Fertilización de Alta Precisión para Máximo Rendimiento",
      dosis_manzana: "100-120 lb/manzana de NPK 17-17-17 con micronutrientes",
      producto_sugerido: "NPK 17-17-17 + Zn, B, Mo complejado",
      precio_aproximado: "GTQ 600-750 por manzana",
      esquema_aplicacion:
        "Aplicar 60 lb/manzana a la siembra, 30 lb/manzana en floración y 30 lb/manzana en formación de vainas.",
      eficacia_esperada:
        "96% para maximizar rendimiento en condiciones óptimas",
      beneficios_tecnicos: [
        "Maximiza el potencial genético del cultivo en condiciones favorables",
        "Aporta micronutrientes críticos para llenado uniforme de grano",
        "Mejora calidad comercial del grano (tamaño, color, peso)",
        "Aumenta resistencia a estrés biótico y abiótico final de ciclo",
        "Optimiza eficiencia en uso de agua y nutrientes disponibles",
      ],
      precauciones: [
        "No exceder dosis para evitar desbalances nutricionales",
        "Monitorear constantemente humedad del suelo para máxima eficiencia",
        "Ajustar aplicaciones según condiciones climáticas reales",
        "Verificar compatibilidad con productos de protección vegetal",
        "Considerar análisis de tejido para ajustes finos",
      ],
      recomendaciones_complementarias: [
        "Implementar riego por goteo para máxima eficiencia nutrimental",
        "Usar tensiómetros para manejo preciso de humedad",
        "Realizar aplicaciones foliares de micronutrientes en floración",
        "Mantener registros detallados para replicar éxito en próximos ciclos",
        "Considerar inoculación con rizobio para fijación biológica adicional",
      ],
    };
  }

  return recommendation;
};

// =============================================================================
// SERVICIO DE NOTIFICACIONES POR TELEGRAM
// =============================================================================

export class TelegramNotifier {
  constructor() {
    this.botToken = CONFIG.telegram.botToken;
    this.apiUrl = CONFIG.telegram.apiUrl;

    if (!this.botToken) {
      console.warn("⚠️ Token de bot de Telegram no configurado");
    }
  }

  /**
   * Envía una recomendación de fertilizante por Telegram
   */
  async sendFertilizerAlert(fertilizerData, chatId = null) {
    try {
      const targetChatId = chatId || CONFIG.telegram.defaultChatId;

      if (!this.botToken || !targetChatId) {
        console.error("❌ Configuración de Telegram incompleta");
        return false;
      }

      console.log("📤 Enviando alerta por Telegram...");

      const message = this.formatFertilizerMessage(fertilizerData);

      const url = `${this.apiUrl}${this.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: "HTML",
          disable_notification: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Telegram API error: ${errorData.description || response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Alerta de Telegram enviada exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error enviando mensaje por Telegram:", error);
      return false;
    }
  }

  /**
   * Formatea los datos del fertilizante en un mensaje legible para Telegram
   */
  formatFertilizerMessage(fertilizerData) {
    const {
      diagnostico,
      nombre_recomendacion,
      dosis_manzana,
      producto_sugerido,
      precio_aproximado,
      esquema_aplicacion,
      eficacia_esperada,
      beneficios_tecnicos = [],
      precauciones = [],
      recomendaciones_complementarias = [],
    } = fertilizerData;

    let message = `🌱 <b>RECOMENDACIÓN DE FERTILIZACIÓN - CULTIVO DE FRIJOL</b> 🌱\n\n`;

    message += `<b>🔍 Diagnóstico:</b>\n<i>${diagnostico}</i>\n\n`;

    message += `<b>🧪 Recomendación:</b>\n<code>${nombre_recomendacion}</code>\n\n`;

    message += `<b>📊 Detalles de Aplicación:</b>\n`;
    message += `• <b>Dosis por manzana:</b> ${dosis_manzana}\n`;
    message += `• <b>Producto sugerido:</b> ${producto_sugerido}\n`;
    message += `• <b>Precio estimado:</b> ${precio_aproximado}\n`;
    message += `• <b>Esquema:</b> ${esquema_aplicacion}\n`;
    message += `• <b>Eficacia esperada:</b> ${eficacia_esperada}\n\n`;

    if (beneficios_tecnicos.length > 0) {
      message += `<b>✅ Beneficios Técnicos:</b>\n`;
      beneficios_tecnicos.forEach((beneficio, index) => {
        if (index < 5) {
          // Limitar a 5 beneficios
          message += `• ${beneficio}\n`;
        }
      });
      message += `\n`;
    }

    if (precauciones.length > 0) {
      message += `<b>⚠️ Precauciones:</b>\n`;
      precauciones.forEach((precaucion, index) => {
        if (index < 5) {
          // Limitar a 5 precauciones
          message += `• ${precaucion}\n`;
        }
      });
      message += `\n`;
    }

    message += `<b>📍 Monitoreo para cultivo de frijol en Guatemala</b>`;
    message += `\n<b>🕒 Fecha:</b> ${new Date().toLocaleString("es-GT")}`;

    return message;
  }

  /**
   * Verifica que el bot esté funcionando
   */
  async testBotConnection() {
    try {
      if (!this.botToken) {
        throw new Error("Token de bot no configurado");
      }

      const url = `${this.apiUrl}${this.botToken}/getMe`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No se pudo conectar con el bot de Telegram");
      }

      const data = await response.json();
      console.log("✅ Bot de Telegram conectado:", data.result.username);
      return data.result;
    } catch (error) {
      console.error("❌ Error conectando con el bot:", error);
      throw error;
    }
  }
}

// =============================================================================
// SERVICIO DE MONITOREO AUTOMÁTICO
// =============================================================================

export class AutoMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertHistory = [];
    this.telegramNotifier = new TelegramNotifier();
    this.lastExecutionTime = null;
    this.nextExecutionTime = null;
    this.onCountdownUpdate = null; // Callback para actualizar UI
  }

  /**
   * Inicia el monitoreo automático
   */
  startAutomaticMonitoring(intervalMinutes = 5, onCountdownUpdate = null) {
    if (this.isMonitoring) {
      console.log("⚠️ El monitoreo automático ya está activo");
      return;
    }

    this.isMonitoring = true;
    this.onCountdownUpdate = onCountdownUpdate;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(
      `🔍 Iniciando monitoreo automático cada ${intervalMinutes} minutos...`
    );

    // Calcular próximo tiempo de ejecución
    const now = Date.now();
    if (!this.nextExecutionTime || this.nextExecutionTime <= now) {
      // Si no hay próximo tiempo o ya pasó, ejecutar inmediatamente
      this.nextExecutionTime = now;
    }

    // Programar el próximo ciclo
    this.scheduleNextExecution();

    return true;
  }

  scheduleNextExecution() {
    if (!this.isMonitoring) return;

    const now = Date.now();
    const intervalMs = 5 * 60 * 1000; // 5 minutos

    // Si ya es tiempo de ejecutar, hacerlo inmediatamente
    if (this.nextExecutionTime <= now) {
      this.executeMonitoringCycle();
      this.nextExecutionTime = now + intervalMs;
    }

    // Calcular tiempo hasta próxima ejecución
    const timeUntilNext = this.nextExecutionTime - now;

    // Programar el próximo ciclo
    setTimeout(() => {
      if (this.isMonitoring) {
        this.executeMonitoringCycle();
        this.nextExecutionTime = Date.now() + intervalMs;
        this.scheduleNextExecution(); // Programar el siguiente
      }
    }, timeUntilNext);

    console.log(
      `⏰ Próximo monitoreo programado en ${Math.round(
        timeUntilNext / 1000
      )} segundos`
    );

    // Iniciar contador regresivo si hay callback
    if (this.onCountdownUpdate) {
      this.startCountdown(timeUntilNext);
    }
  }

  startCountdown(totalTime) {
    let remainingTime = totalTime;

    const countdownInterval = setInterval(() => {
      remainingTime -= 1000;

      if (remainingTime <= 0 || !this.isMonitoring) {
        clearInterval(countdownInterval);
        return;
      }

      // El contador sigue funcionando internamente pero no actualiza la UI
      // Solo actualizamos la UI si el callback existe y queremos mostrar el contador
      // Por ahora lo dejamos sin actualización de UI
    }, 1000);
  }

  getMonitoringInfo() {
    const now = Date.now();
    const timeUntilNext = this.nextExecutionTime
      ? this.nextExecutionTime - now
      : 0;

    return {
      isMonitoring: this.isMonitoring,
      totalAlerts: this.alertHistory.length,
      lastAlert: this.alertHistory[0] || null,
      nextExecutionTime: this.nextExecutionTime,
      timeUntilNext: Math.max(0, timeUntilNext),
      lastCheck: this.lastExecutionTime || null,
    };
  }
  /**
   * Detiene el monitoreo automático
   */
  stopAutomaticMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log("🛑 Monitoreo automático detenido");

    return true;
  }

  /**
   * Ejecuta un ciclo completo de monitoreo
   */
  async executeMonitoringCycle() {
    try {
      console.log("🌱 Ejecutando ciclo de monitoreo...");

      // 1. Obtener datos del sensor local
      const sensorData = await this.fetchSensorData();
      if (!sensorData) {
        console.error("❌ No se pudieron obtener datos del sensor");
        return;
      }

      // 2. Verificar si hay condiciones de alerta
      const hasAlert = this.checkAlertConditions(sensorData);

      if (hasAlert) {
        console.log(
          "🚨 Condiciones de alerta detectadas, generando recomendación..."
        );

        // 3. Obtener recomendación de fertilizante
        const fertilizerRecommendation =
          await getFertilizerRecommendationFromAPI(sensorData);

        // 4. Enviar alerta por Telegram
        await this.sendAlertNotification(sensorData, fertilizerRecommendation);

        // 5. Registrar en historial
        this.recordAlert(sensorData, fertilizerRecommendation);
      } else {
        console.log("✅ Parámetros dentro de rangos normales");
      }
    } catch (error) {
      console.error("💥 Error en ciclo de monitoreo:", error);
    }
  }

  /**
   * Obtiene datos del endpoint local del sensor
   */
  async fetchSensorData() {
    try {
      console.log("📡 Consultando datos del sensor local...");

      const response = await fetch(
        "https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/lecturas/promedio-hoy/1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Datos del sensor recibidos:", data);

      return this.normalizeSensorData(data);
    } catch (error) {
      console.error("❌ Error obteniendo datos del sensor:", error);
      return this.getMockSensorData();
    }
  }

  /**
   * Normaliza los datos del sensor
   */
  normalizeSensorData(rawData) {
    // Asume que la API retorna un array y tomamos el último registro
    const lastReading = Array.isArray(rawData) ? rawData[0] : rawData;

    return {
      nitrogen:
        lastReading.nitrogen || lastReading.nitrogeno || lastReading.n || 0,
      phosphorus:
        lastReading.phosphorus || lastReading.fosforo || lastReading.p || 0,
      potassium:
        lastReading.potassium || lastReading.potasio || lastReading.k || 0,
      ph: lastReading.ph || lastReading.pH || 6.5,
      humidity:
        lastReading.humidity || lastReading.humedad || lastReading.h || 0,
      temperature:
        lastReading.temperature ||
        lastReading.temperatura ||
        lastReading.temp ||
        0,
      sunlight:
        lastReading.sunlight || lastReading.luz_solar || lastReading.luz || 0,
      timestamp:
        lastReading.timestamp || lastReading.fecha || new Date().toISOString(),
    };
  }

  /**
   * Verifica condiciones de alerta basado en los umbrales
   */
  checkAlertConditions(sensorData) {
    const t = CONFIG.thresholds;

    // Verificar condiciones críticas
    if (sensorData.nitrogen < t.nitrogen.critical) return true;
    if (sensorData.phosphorus < t.phosphorus.critical) return true;
    if (sensorData.potassium < t.potassium.critical) return true;
    if (sensorData.ph < t.ph.criticalLow || sensorData.ph > t.ph.criticalHigh)
      return true;
    if (
      sensorData.temperature < t.temperature.criticalLow ||
      sensorData.temperature > t.temperature.criticalHigh
    )
      return true;

    // Verificar condiciones de advertencia
    if (
      sensorData.nitrogen < t.nitrogen.min ||
      sensorData.nitrogen > t.nitrogen.max
    )
      return true;
    if (
      sensorData.phosphorus < t.phosphorus.min ||
      sensorData.phosphorus > t.phosphorus.max
    )
      return true;
    if (
      sensorData.potassium < t.potassium.min ||
      sensorData.potassium > t.potassium.max
    )
      return true;
    if (sensorData.ph < t.ph.min || sensorData.ph > t.ph.max) return true;

    return false;
  }

  /**
   * Envía notificación de alerta por Telegram
   */
  async sendAlertNotification(sensorData, fertilizerData) {
    try {
      console.log("📨 Enviando notificación de alerta...");

      // Enviar recomendación completa del fertilizante
      await this.telegramNotifier.sendFertilizerAlert(fertilizerData);

      console.log("✅ Notificaciones de alerta enviadas exitosamente");
    } catch (error) {
      console.error("❌ Error enviando notificaciones:", error);
      throw error;
    }
  }

  /**
   * Registra alerta en el historial
   */
  recordAlert(sensorData, fertilizerData) {
    const alertRecord = {
      timestamp: new Date().toISOString(),
      sensorData: { ...sensorData },
      fertilizerRecommendation: { ...fertilizerData },
      notified: true,
    };

    this.alertHistory.unshift(alertRecord);

    // Mantener sólo últimos 50 registros
    if (this.alertHistory.length > 50) {
      this.alertHistory = this.alertHistory.slice(0, 50);
    }
  }

  /**
   * Proporciona datos de prueba para desarrollo
   */
  getMockSensorData() {
    console.log("🔄 Usando datos de prueba para desarrollo...");

    const scenarios = [
      // Escenario crítico - deficiencia múltiple
      {
        nitrogen: 35,
        phosphorus: 15,
        potassium: 70,
        ph: 5.2,
        humidity: 65,
        temperature: 25,
        sunlight: 80,
      },
      // Escenario normal
      {
        nitrogen: 85,
        phosphorus: 45,
        potassium: 150,
        ph: 6.5,
        humidity: 75,
        temperature: 24,
        sunlight: 90,
      },
    ];

    const randomScenario =
      scenarios[Math.floor(Math.random() * scenarios.length)];

    return {
      ...randomScenario,
      timestamp: new Date().toISOString(),
      isMockData: true,
    };
  }

  /**
   * Obtiene el estado actual del monitoreo
   */
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      totalAlerts: this.alertHistory.length,
      lastAlert: this.alertHistory[0] || null,
      lastCheck: new Date().toISOString(),
    };
  }
}

// =============================================================================
// INSTANCIAS SINGLETON PARA USO GLOBAL
// =============================================================================

export const telegramNotifier = new TelegramNotifier();
export const autoMonitor = new AutoMonitorService();
