// Función para obtener recomendaciones de la API de OpenRouter
export const getFertilizerRecommendationFromAPI = async (parameters) => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    console.log("API Key OpenRouter presente:", !!apiKey);

    if (!apiKey) {
      throw new Error("API key de OpenRouter no configurada");
    }

    const url = "https://openrouter.ai/api/v1/chat/completions";

    const prompt = `Eres un experto agronómico guatemalteco. Analiza ESTOS valores específicos:

PARÁMETROS ACTUALES:
- Nitrógeno: ${parameters.nitrogen} ppm ${
      parameters.nitrogen < 60
        ? "⬇️ DEFICIENTE"
        : parameters.nitrogen > 120
        ? "⬆️ EXCESIVO"
        : "✅ ÓPTIMO"
    }
- Fósforo: ${parameters.phosphorus} ppm ${
      parameters.phosphorus < 30
        ? "⬇️ DEFICIENTE"
        : parameters.phosphorus > 60
        ? "⬆️ EXCESIVO"
        : "✅ ÓPTIMO"
    } 
- Potasio: ${parameters.potassium} ppm ${
      parameters.potassium < 100
        ? "⬇️ DEFICIENTE"
        : parameters.potassium > 200
        ? "⬆️ EXCESIVO"
        : "✅ ÓPTIMO"
    }
- pH: ${parameters.ph} ${
      parameters.ph < 5.5
        ? "⬇️ ÁCIDO"
        : parameters.ph > 7.0
        ? "⬆️ ALCALINO"
        : "✅ NEUTRO"
    }
- Humedad: ${parameters.humidity}%
- Temperatura: ${parameters.temperature}°C
- Luz solar: ${parameters.sunlight}%

DIAGNÓSTICO:
${
  parameters.nitrogen < 60
    ? "❌ DEFICIT de NITRÓGENO - Necesita fertilizante nitrogenado"
    : parameters.nitrogen > 120
    ? "⚠️ EXCESO de NITRÓGENO - Reducir aplicación de N"
    : "✅ Nitrógeno en niveles óptimos"
}
${
  parameters.phosphorus < 30
    ? "❌ DEFICIT CRÍTICO de FÓSFORO - Urge aplicación de P"
    : parameters.phosphorus > 60
    ? "⚠️ EXCESO de FÓSFORO - Evitar más aplicación de P"
    : "✅ Fósforo en niveles óptimos"
}
${
  parameters.potassium < 100
    ? "❌ DEFICIT de POTASIO - Aplicar fertilizante potásico"
    : parameters.potassium > 200
    ? "⚠️ EXCESO de POTASIO - Reducir aplicación de K"
    : "✅ Potasio en niveles óptimos"
}
${
  parameters.ph < 5.5
    ? "❌ pH ÁCIDO - Considerar encalado"
    : parameters.ph > 7.0
    ? "⚠️ pH ALCALINO - Considerar acidificación"
    : "✅ pH en rango óptimo"
}

RECOMENDACIÓN ESPECÍFICA para CULTIVO DE FRIJOL en SUELOS VOLCÁNICOS de GUATEMALA:

Genera una recomendación PERSONALIZADA basada en estos valores exactos. Si hay deficiencias, recomienda fertilizantes que las corrijan. Si hay excesos, sugiere ajustes.

DEVUELVE ÚNICAMENTE JSON con:
- name: Nombre ESPECÍFICO según necesidades (ej: "NPK 10-30-20 para deficit de P y K")
- dose: Dosis EXACTA calculada para estos parámetros (ej: "150 kg/ha aplicados en 2 etapas")
- link: Enlace real a producto en Guatemala (ej: "https://serviagro.com.gt/fertilizantes")
- price: Precio actual aproximado en Quetzales
- form: Formulación apropiada (granulado, líquido, etc.)
- schedule: Cronograma ESPECÍFICO (fechas y métodos de aplicación) COMO STRING, no como array
- effectiveness: % esperado según diagnóstico (ej: "95% efectivo para corregir deficit de fósforo")
- benefits: 5 beneficios CONCRETOS para esta situación específica
- disadvantages: 5 riesgos ESPECÍFICOS para estos parámetros

SOLO JSON, sin texto adicional.`;

    const requestBody = {
      model: "google/gemini-pro-1.5",
      messages: [
        {
          role: "system",
          content:
            "Eres un agrónomo especializado en Guatemala. Proporcionas ÚNICAMENTE JSON válido. Las recomendaciones deben ser ESPECÍFICAS y PERSONALIZADAS según los valores exactos de los parámetros. Nunca repitas la misma recomendación para valores diferentes. Analiza cada parámetro individualmente y genera una respuesta única para cada conjunto de datos. Incluye detalles específicos sobre dosis, cronograma y efectividad basados en los valores proporcionados.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7, // Aumentamos temperatura para más variedad
      max_tokens: 2500,
    };

    console.log("Enviando solicitud a OpenRouter API...");
    console.log("Parámetros enviados:", parameters);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://pmacajol.github.io/Agro-MAGU",
        "X-Title": "Agro-MAGU",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Status de respuesta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de OpenRouter API:", errorText);
      throw new Error(`Error en OpenRouter API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Respuesta completa de OpenRouter:", data);

    const content = data.choices[0].message.content;
    console.log("Contenido de la respuesta:", content);

    // Extraer JSON de la respuesta
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        console.log("JSON parseado exitosamente:", jsonResponse);
        return jsonResponse;
      } else {
        const jsonResponse = JSON.parse(content);
        console.log("JSON parseado exitosamente:", jsonResponse);
        return jsonResponse;
      }
    } catch (parseError) {
      console.error("Error parseando JSON:", parseError);
      console.error("Contenido que falló al parsear:", content);

      // Si falla el parseo, devolver una recomendación personalizada basada en parámetros
      return getPersonalizedFallback(parameters);
    }
  } catch (error) {
    console.error("Error al obtener recomendación de OpenRouter:", error);
    return getPersonalizedFallback(parameters);
  }
};

// Función de respaldo personalizada según parámetros
const getPersonalizedFallback = (parameters) => {
  console.log("Generando recomendación personalizada de respaldo...");

  // Lógica basada en los parámetros
  let recommendation;

  if (parameters.phosphorus < 30 && parameters.potassium < 100) {
    recommendation = {
      name: "Fertilizante NPK 10-30-20 para déficit de Fósforo y Potasio",
      dose: "200 kg/ha aplicados en 2 etapas: 100 kg al sembrar, 100 kg a los 30 días",
      link: "https://serviagro.com.gt/fertilizantes-fosfatados",
      price: "Q480 por bolsa de 50 kg",
      form: "Granulado de liberación controlada",
      schedule:
        "Aplicar al momento de siembra y a los 30 días después de la emergencia",
      effectiveness:
        "95% efectivo para corregir déficit de P y K en suelos volcánicos",
      benefits: [
        "Corrige el déficit crítico de fósforo (" +
          parameters.phosphorus +
          " ppm)",
        "Suple la deficiencia de potasio (" + parameters.potassium + " ppm)",
        "Mejora el desarrollo radicular en suelos volcánicos",
        "Aumenta la resistencia a sequías moderadas",
        "Optimiza la floración y fructificación del frijol",
      ],
      disadvantages: [
        "Costo elevado por alta concentración de fósforo",
        "Requiere aplicación precisa para evitar quemaduras",
        "Necesita humedad adecuada para su efectividad",
        "Puede ser fijado por suelos ácidos si no se corrige pH",
        "Almacenamiento inadecuado reduce efectividad",
      ],
    };
  } else if (parameters.nitrogen < 60) {
    recommendation = {
      name: "Fertilizante Nitrogenado Urea 46-0-0",
      dose:
        "150 kg/ha para déficit de nitrógeno (" + parameters.nitrogen + " ppm)",
      link: "https://serviagro.com.gt/fertilizantes-nitrogenados",
      price: "Q320 por bolsa de 50 kg",
      form: "Gránulos perlados",
      schedule: "Aplicar en cobertura a los 15 y 30 días después de siembra",
      effectiveness: "90% efectivo para corregir déficit de nitrógeno",
      benefits: [
        "Corrige déficit de nitrógeno (" + parameters.nitrogen + " ppm)",
        "Estimula crecimiento vegetativo rápido",
        "Aumenta biomasa y producción de hojas",
        "Mejora coloración verde del cultivo",
        "Fácil aplicación y absorción",
      ],
      disadvantages: [
        "Volatilización en altas temperaturas",
        "Puede acidificar el suelo con uso prolongado",
        "Requiere aplicación fraccionada",
        "Sensible a condiciones de humedad",
        "Pérdidas por lixiviación en lluvias intensas",
      ],
    };
  } else if (parameters.ph < 5.5) {
    recommendation = {
      name: "Encaje Agrícola Dolomítico + Fertilizante Balanceado",
      dose: "2 ton/ha de encaje + 150 kg/ha de NPK 15-15-15",
      link: "https://serviagro.com.gt/correctores-ph",
      price: "Q180 por tonelada de encaje + Q450 por fertilizante",
      form: "Polvo fino (encaje) + Granulado (fertilizante)",
      schedule: "Encajar 15 días antes de siembra, fertilizar al sembrar",
      effectiveness: "85% efectivo para corregir acidez del suelo",
      benefits: [
        "Corrige pH ácido (" + parameters.ph + ") del suelo",
        "Aporta calcio y magnesio esenciales",
        "Mejora disponibilidad de nutrientes",
        "Reduce toxicidad por aluminio",
        "Mejora estructura del suelo volcánico",
      ],
      disadvantages: [
        "Requiere tiempo para reacción (15-30 días)",
        "Aplicación laboriosa y costosa",
        "Efecto dependiente de humedad del suelo",
        "Puede afectar disponibilidad de algunos micronutrientes",
        "Necesita análisis de suelo posterior",
      ],
    };
  } else {
    // Recomendación balanceada por defecto
    recommendation = {
      name: "Fertilizante NPK 15-15-15 Balanceado DISA",
      dose: "180 kg/ha para mantenimiento de cultivo",
      link: "https://serviagro.com.gt/fertilizantes-balanceados",
      price: "Q450 por bolsa de 50 kg",
      form: "Granulado",
      schedule: "Aplicar 100 kg al sembrar y 80 kg a los 25 días",
      effectiveness: "92% en suelos con parámetros estables",
      benefits: [
        "Mantenimiento de nutrientes en niveles óptimos",
        "Balance ideal para cultivo de frijol",
        "Adaptado a suelos volcánicos guatemaltecos",
        "Mejora rendimiento y calidad de grano",
        "Fácil aplicación y disponibilidad",
      ],
      disadvantages: [
        "Puede no corregir deficiencias específicas",
        "Costo moderado para pequeños productores",
        "Requiere condiciones de humedad adecuadas",
        "Almacenamiento inadecuado reduce efectividad",
        "Aplicación excesiva puede causar desbalance",
      ],
    };
  }

  return recommendation;
};

// Función de respaldo genérica
export const getFallbackFertilizerRecommendation = () => {
  console.log("Usando función de respaldo genérica...");
  return {
    name: "Fertilizante NPK 15-15-15 DISA MF LB",
    dose: "20 kg por hectárea para maíz",
    link: "https://serviagro.com.gt/productos/fertilizantes/",
    price: "Q450 por bolsa de 50 kg",
    form: "Granulado",
    schedule: "Aplicar temprano en la mañana o al final de la tarde",
    effectiveness: "92% en suelos con pH 6.0-7.0",
    benefits: [
      "Incrementa el rendimiento de maíz hasta un 25%",
      "Mejora la resistencia a sequías moderadas",
      "Favorece el desarrollo radicular en suelos volcánicos",
      "Aumenta la eficiencia en el uso del agua",
      "Proporciona nutrientes balanceados para cultivos básicos",
    ],
    disadvantages: [
      "Sin fertilización, el rendimiento de frijol puede caer hasta un 35%",
      "Mayor susceptibilidad a plagas comunes en la región",
      "Disminución de la calidad nutricional de los cultivos",
      "Reducción en la capacidad de retención de agua del suelo",
      "Desequilibrio nutricional que afecta el desarrollo de frutos",
    ],
  };
};
