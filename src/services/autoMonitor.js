// src/services/autoMonitor.js

import { getFertilizerRecommendationFromAPI } from "./fertilizerAITelegram.jsx";
import { telegramNotifier } from "./telegramNotifier.js";

// Umbrales para alertas automáticas en cultivo de frijol (Guatemala)
const ALERT_THRESHOLDS = {
  nitrogen: { min: 60, max: 120, critical: 40 },
  phosphorus: { min: 30, max: 60, critical: 20 },
  potassium: { min: 100, max: 200, critical: 80 },
  ph: { min: 5.5, max: 7.0, criticalLow: 5.0, criticalHigh: 7.5 },
  humidity: { min: 60, max: 85, critical: 50 },
  temperature: { min: 18, max: 30, criticalLow: 12, criticalHigh: 35 },
  sunlight: { min: 70, max: 95, critical: 60 },
};

/**
 * Servicio de monitoreo automático con alertas por telegramNotifier
 */
export class AutoMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertHistory = [];
  }

  /**
   * Inicia el monitoreo automático
   */
  startAutomaticMonitoring(intervalMinutes = 30) {
    if (this.isMonitoring) {
      console.log("⚠️ El monitoreo automático ya está activo");
      return;
    }

    this.isMonitoring = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(
      `🔍 Iniciando monitoreo automático cada ${intervalMinutes} minutos...`
    );

    // Ejecutar inmediatamente el primer monitoreo
    this.executeMonitoringCycle();

    // Programar monitoreos periódicos
    this.monitoringInterval = setInterval(() => {
      this.executeMonitoringCycle();
    }, intervalMs);

    // Enviar confirmación por telegramNotifier
    telegramNotifier.sendtelegramNotifierMessage(
      `🔔 <b>Sistema de Monitoreo Activado</b>\n\n` +
        `Se ha iniciado el monitoreo automático para cultivo de frijol.\n` +
        `• Intervalo: cada ${intervalMinutes} minutos\n` +
        `• Fecha: ${new Date().toLocaleString("es-GT")}\n\n` +
        `<i>Recibirás alertas cuando se detecten condiciones críticas</i>`
    );
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

        // 4. Enviar alerta por telegramNotifier
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
        "https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/lecturas/ultima/1",
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
    const t = ALERT_THRESHOLDS;

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
   * Envía notificación de alerta por telegramNotifier
   */
  async sendAlertNotification(sensorData, fertilizerData) {
    try {
      console.log("📨 Enviando notificación de alerta...");

      // Enviar alerta crítica con parámetros
      await telegramNotifier.sendCriticalAlert(sensorData, fertilizerData);

      // Enviar recomendación completa del fertilizante
      await telegramNotifier.sendFertilizerAlert(fertilizerData);

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

    // Simula diferentes escenarios para testing
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
      // Escenario advertencia - pH ácido
      {
        nitrogen: 75,
        phosphorus: 35,
        potassium: 120,
        ph: 5.4,
        humidity: 70,
        temperature: 22,
        sunlight: 85,
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

  /**
   * Ejecuta una prueba manual del sistema
   */
  async testSystem() {
    console.log("🧪 Ejecutando prueba del sistema...");

    try {
      // Probar conexión con telegramNotifier
      await telegramNotifier.testBotConnection();

      // Probar con datos de prueba
      const testData = this.getMockSensorData();
      const recommendation = await getFertilizerRecommendationFromAPI(testData);
      await telegramNotifier.sendFertilizerAlert(recommendation);

      console.log("✅ Prueba del sistema completada exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error en prueba del sistema:", error);
      return false;
    }
  }

  /**
   * Envía una recomendación existente por telegramNotifier (para testing)
   */
  async sendExistingRecommendation() {
    const existingData = {
      name: "Fertilizante Triple 15 (NPK 15-15-15)",
      dose: "200-250 kg/hectárea",
      form: "Granulado, aplicado al suelo",
      schedule:
        "Aplicar 50% al momento de siembra y 50% a los 20-25 días después de la emergencia",
      effectiveness: "Mejora visible en 3-4 semanas",
      price: "Q950-1,200 por quintal (50 kg)",
      benefits: [
        "Equilibra deficiencias de N, P y K",
        "Estimula crecimiento vegetativo y radicular",
        "Aumenta resistencia a sequías",
        "Mejora formación de vainas",
        "Disponible en cooperativas locales",
      ],
      disadvantages: [
        "Posible lixiviación de nitrógeno en suelos húmedos",
        "Requiere riego controlado para absorción",
        "Mayor costo vs. fertilizantes simples",
        "Sensibilidad a excesos en aplicación",
        "No aporta micronutrientes",
      ],
      link: "https://www.inta.gob.gt/recomendaciones-fertilizacion-frijol",
    };

    await telegramNotifier.sendFertilizerAlert(existingData);
  }
}

// Instancia singleton
export const autoMonitor = new AutoMonitorService();
