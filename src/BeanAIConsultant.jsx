// Función para obtener la última lectura del sensor
const fetchLatestSensorData = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/lecturas/ultima/1");
    if (!response.ok) {
      throw new Error(`Error al obtener datos del sensor: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

// Función para obtener recomendaciones de la API de OpenRouter
export const getFertilizerRecommendationFromAPI = async () => {
  try {
    // Obtener datos del sensor
    const sensorData = await fetchLatestSensorData();

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    console.log("API Key OpenRouter presente:", !!apiKey);
    console.log("Datos del sensor:", sensorData);

    if (!apiKey) {
      throw new Error("API key de OpenRouter no configurada");
    }

    const url = "https://openrouter.ai/api/v1/chat/completions";

    // Mapear los nombres de campos en español a inglés
    const parameters = {
      nitrogen: sensorData.nitrogeno || 0,
      phosphorus: sensorData.fosforo || 0,
      potassium: sensorData.potasio || 0,
      ph: sensorData.ph || 0,
      humidity: sensorData.humedad || 0,
      temperature: sensorData.temperatura || 0,
      sunlight: sensorData.luz_solar || 0,
    };

    const prompt = `Eres un experto agronómico especializado en cultivos de frijol en Guatemala. Analiza ESTOS valores específicos de suelo:

PARÁMETROS ACTUALES DE SUELO GUATEMALTECO:
- Nitrógeno: ${parameters.nitrogen} ppm ${
      parameters.nitrogen < 50
        ? "⬇️ DEFICIENTE (típico en suelos volcánicos de Guatemala)"
        : parameters.nitrogen > 100
        ? "⬆️ EXCESIVO (poco común en suelos guatemaltecos)"
        : "✅ ÓPTIMO para frijol en Guatemala"
    }
- Fósforo: ${parameters.phosphorus} ppm ${
      parameters.phosphorus < 20
        ? "⬇️ DEFICIENTE (común en suelos ácidos de Guatemala)"
        : parameters.phosphorus > 50
        ? "⬆️ EXCESIVO"
        : "✅ ÓPTIMO para frijol"
    } 
- Potasio: ${parameters.potassium} ppm ${
      parameters.potassium < 80
        ? "⬇️ DEFICIENTE (frecuente en suelos lixiviados)"
        : parameters.potassium > 180
        ? "⬆️ EXCESIVO"
        : "✅ ÓPTIMO"
    }
- pH: ${parameters.ph} ${
      parameters.ph < 5.5
        ? "⬇️ ÁCIDO (típico de suelos volcánicos guatemaltecos)"
        : parameters.ph > 7.2
        ? "⬆️ ALCALINO (poco común)"
        : "✅ NEUTRO (ideal para frijol)"
    }
- Humedad: ${parameters.humidity}% ${
      parameters.humidity < 60
        ? "⬇️ BAJA"
        : parameters.humidity > 85
        ? "⬆️ ALTA"
        : "✅ ÓPTIMA"
    }
- Temperatura: ${parameters.temperature}°C ${
      parameters.temperature < 18
        ? "⬇️ FRÍA"
        : parameters.temperature > 28
        ? "⬆️ CALIENTE"
        : "✅ ÓPTIMA"
    }
- Luz solar: ${parameters.sunlight}% ${
      parameters.sunlight < 70 ? "⬇️ INSUFICIENTE" : "✅ ADECUADA"
    }

DIAGNÓSTICO PARA CULTIVO DE FRIJOL EN GUATEMALA:
${
  parameters.nitrogen < 50
    ? "❌ DEFICIT de NITRÓGENO - Común en suelos guatemaltecos, necesita fertilizante nitrogenado como urea o sulfato de amonio"
    : parameters.nitrogen > 100
    ? "⚠️ EXCESO de NITRÓGENO - Reducir aplicación de N para evitar crecimiento vegetativo excesivo"
    : "✅ Nitrógeno en niveles óptimos para frijol en Guatemala"
}
${
  parameters.phosphorus < 20
    ? "❌ DEFICIT CRÍTICO de FÓSFORO - Muy común en suelos ácidos de Guatemala. Urge aplicación de roca fosfórica o superfosfato"
    : parameters.phosphorus > 50
    ? "⚠️ EXCESO de FÓSFORO - Evitar más aplicación de P"
    : "✅ Fósforo en niveles óptimos para suelos guatemaltecos"
}
${
  parameters.potassium < 80
    ? "❌ DEFICIT de POTASIO - Frecuente en suelos lixiviados de Guatemala. Aplicar cloruro de potasio o sulfato de potasio"
    : parameters.potassium > 180
    ? "⚠️ EXCESO de POTASIO - Reducir aplicación de K"
    : "✅ Potasio en niveles óptimos"
}
${
  parameters.ph < 5.5
    ? "❌ pH ÁCIDO - Típico de suelos volcánicos guatemaltecos. Considerar encalado con dolomita o calcítica"
    : parameters.ph > 7.2
    ? "⚠️ pH ALCALINO - Poco común en Guatemala. Considerar acidificación con azufre"
    : "✅ pH en rango óptimo para frijol en Guatemala"
}

RECOMENDACIÓN ESPECÍFICA para CULTIVO DE FRIJOL en SUELOS VOLCÁNICOS de GUATEMALA:

Genera una recomendación PERSONALIZADA basada en estos valores exactos. Considera:
1. Las condiciones específicas de Guatemala (suelos volcánicos, clima)
2. Fertilizantes disponibles localmente (DISA, FERTICA, etc.)
3. Precios en Quetzales y disponibilidad en tiendas agrícolas guatemaltecas
4. Época del año y condiciones climáticas actuales
5. Variedades de frijol comunes en Guatemala (ICTAs, Negro Quiché, etc.)

DEVUELVE ÚNICAMENTE JSON con:
- name: Nombre ESPECÍFICO según necesidades (ej: "Fertilizante DISA 10-30-10 para suelos ácidos")
- dose: Dosis EXACTA calculada para estos parámetros (ej: "2 quintales por manzana aplicados al suelo")
- link: Enlace real a producto en Guatemala (ej: "https://agroserviciosgt.com/fertilizantes")
- price: Precio actual aproximado en Quetzales (ej: "Q350 por quintal")
- form: Formulación apropiada (granulado, líquido, etc.)
- schedule: Cronograma ESPECÍFICO COMO STRING (ej: "Aplicar 50% a la siembra y 50% a los 25 días")
- effectiveness: % esperado según diagnóstico (ej: "90% efectivo para corregir deficit de fósforo")
- benefits: 5 beneficios CONCRETOS para esta situación específica
- disadvantages: 5 riesgos ESPECÍFICOS para estos parámetros

SOLO JSON, sin texto adicional.`;

    const requestBody = {
      model: "google/gemini-pro-1.5",
      messages: [
        {
          role: "system",
          content:
            "Eres un agrónomo especializado en cultivos de frijol en Guatemala. Proporcionas ÚNICAMENTE JSON válido con recomendaciones específicas para las condiciones guatemaltecas. Incluye siempre precios en Quetzales y productos disponibles localmente.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    };

    console.log("Enviando solicitud a OpenRouter API...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://pmacajol.github.io/Agro-MAGU",
        "X-Title": "Agro-MAGU - Asistente Agronómico Guatemala",
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
    console.log("Respuesta de OpenRouter:", data);

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
        // Intentar parsear directamente
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
    // En caso de error, obtener datos del sensor y generar recomendación de respaldo
    try {
      const sensorData = await fetchLatestSensorData();
      const parameters = {
        nitrogen: sensorData.nitrogeno || 0,
        phosphorus: sensorData.fosforo || 0,
        potassium: sensorData.potasio || 0,
        ph: sensorData.ph || 0,
        humidity: sensorData.humedad || 0,
        temperature: sensorData.temperatura || 0,
        sunlight: sensorData.luz_solar || 0,
      };
      return getPersonalizedFallback(parameters);
    } catch (sensorError) {
      console.error("Error al obtener datos del sensor:", sensorError);
      return getFallbackFertilizerRecommendation();
    }
  }
};

// Función de respaldo personalizada según parámetros
const getPersonalizedFallback = (parameters) => {
  console.log("Generando recomendación personalizada de respaldo...");

  // Lógica basada en los parámetros para Guatemala
  let recommendation;

  if (parameters.ph < 5.5) {
    // Suelo ácido común en Guatemala
    recommendation = {
      name: "Encaje Agrícola Dolomítico + Fertilizante DISA 10-30-10",
      dose: "1.5 toneladas de encaje por manzana + 3 quintales de 10-30-10",
      link: "https://agroserviciosgt.com/encajes-y-fertilizantes",
      price: "Q1,200 por tonelada de encaje + Q1,050 por fertilizante",
      form: "Polvo (encaje) + Granulado (fertilizante)",
      schedule: "Encajar 15 días antes de siembra, fertilizar al sembrar",
      effectiveness: "85% efectivo para corregir acidez y mejorar nutrientes",
      benefits: [
        "Corrige pH ácido típico de suelos volcánicos guatemaltecos",
        "Aporta calcio y magnesio esenciales para el frijol",
        "Mejora disponibilidad de fósforo en suelos ácidos",
        "Aumenta efectividad de fertilizantes aplicados",
        "Mejora estructura del suelo y retención de humedad",
      ],
      disadvantages: [
        "Requiere tiempo para reacción (15-30 días)",
        "Inversión inicial elevada para pequeños productores",
        "Transporte y aplicación requieren maquinaria",
        "Efecto dependiente de humedad del suelo",
        "Necesita análisis de suelo posterior para ajustes",
      ],
    };
  } else if (parameters.phosphorus < 20) {
    // Déficit de fósforo común en Guatemala
    recommendation = {
      name: "Superfosfato Triple DISA + Abono Orgánico",
      dose: "2 quintales de superfosfato + 20 quintales de gallinaza por manzana",
      link: "https://agroserviciosgt.com/fosfatos",
      price: "Q380 por quintal de superfosfato + Q25 por quintal de gallinaza",
      form: "Granulado + Orgánico",
      schedule: "Aplicar 100% a la siembra, incorporar al suelo",
      effectiveness: "90% efectivo para corregir déficit de fósforo",
      benefits: [
        "Corrige déficit crítico de fósforo (" +
          parameters.phosphorus +
          " ppm)",
        "Mejora desarrollo radicular en suelos volcánicos",
        "Aumenta resistencia a sequías moderadas",
        "Favorece floración y llenado de grano",
        "El componente orgánico mejora la microbiota del suelo",
      ],
      disadvantages: [
        "El superfosfato puede acidificar más el suelo",
        "La gallinaza requiere compostaje previo para evitar fitotoxicidad",
        "Aplicación manual es laboriosa",
        "Puede atraer plagas si no se incorpora adecuadamente",
        "Efecto lento en suelos muy ácidos",
      ],
    };
  } else if (parameters.nitrogen < 50) {
    recommendation = {
      name: "Urea DISA 46-0-0 + Abono Verde (Mucuna)",
      dose: "1.5 quintales de urea + siembra de mucuna como abono verde",
      link: "https://agroserviciosgt.com/urea",
      price: "Q320 por quintal de urea + Q150 por manzana de semilla de mucuna",
      form: "Gránulos perlados + Semilla",
      schedule:
        "Aplicar urea a los 20 días después de siembra, sembrar mucuna post-cosecha",
      effectiveness: "88% efectivo para mejorar nitrógeno en suelo",
      benefits: [
        "Corrige déficit de nitrógeno (" + parameters.nitrogen + " ppm)",
        "La mucuna fija nitrógeno atmosférico para el próximo ciclo",
        "Mejora la materia orgánica del suelo",
        "Control natural de malezas con la mucuna",
        "Reduce erosión en suelos de ladera",
      ],
      disadvantages: [
        "La urea requiere aplicación precisa para evitar volatilización",
        "La mucuna requiere manejo adecuado para no competir con cultivo principal",
        "Efecto no inmediato con el abono verde",
        "Riesgo de quemadura con urea si no se incorpora",
        "Manejo de mucuna requiere conocimiento técnico",
      ],
    };
  } else {
    // Recomendación balanceada para Guatemala
    recommendation = {
      name: "Fertilizante NPK 15-15-15 DISA para Frijol",
      dose: "3 quintales por manzana aplicados en dos etapas",
      link: "https://agroserviciosgt.com/balanceados",
      price: "Q420 por quintal",
      form: "Granulado de liberación controlada",
      schedule: "Aplicar 2 quintales al surcar y 1 quintal a los 25 días",
      effectiveness: "92% en suelos con parámetros estables",
      benefits: [
        "Balance ideal para frijol en condiciones guatemaltecas",
        "Mejora rendimiento y calidad de grano",
        "Fácil aplicación y disponibilidad en todo el país",
        "Adaptado a suelos volcánicos de Guatemala",
        "Aporta micronutrientes esenciales para el cultivo",
      ],
      disadvantages: [
        "Costo elevado para pequeños productores",
        "Puede no corregir deficiencias específicas muy marcadas",
        "Requiere condiciones de humedad adecuadas para su efectividad",
        "Almacenamiento inadecuado reduce efectividad",
        "Aplicación excesiva puede causar desbalance nutricional",
      ],
    };
  }

  return recommendation;
};

// Función de respaldo genérica para Guatemala
export const getFallbackFertilizerRecommendation = () => {
  console.log("Usando función de respaldo genérica para Guatemala...");
  return {
    name: "Fertilizante Triple 15 DISA para Cultivos Básicos",
    dose: "3 quintales por manzana aplicados al suelo",
    link: "https://agroserviciosgt.com/fertilizantes",
    price: "Q400 por quintal",
    form: "Granulado",
    schedule:
      "Aplicar 50% a la siembra y 50% a los 25-30 días después de siembra",
    effectiveness: "90% en condiciones normales de cultivo",
    benefits: [
      "Aumenta el rendimiento del frijol hasta un 40%",
      "Mejora la resistencia a sequías moderadas",
      "Favorece el desarrollo radicular en suelos volcánicos",
      "Aumenta la eficiencia en el uso del agua",
      "Proporciona nutrientes balanceados para cultivos básicos",
    ],
    disadvantages: [
      "Sin fertilización, el rendimiento de frijol puede caer hasta un 50%",
      "Mayor susceptibilidad a plagas comunes en la región",
      "Disminución de la calidad nutricional de los granos",
      "Reducción en la capacidad de retención de agua del suelo",
      "Desequilibrio nutricional que afecta el desarrollo de vainas",
    ],
  };
};
