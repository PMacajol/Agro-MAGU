// Función para obtener recomendaciones de la API de OpenRouter
export const getFertilizerRecommendationFromAPI = async (parameters) => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    console.log("API Key OpenRouter presente:", !!apiKey);

    if (!apiKey) {
      throw new Error("API key de OpenRouter no configurada");
    }

    const url = "https://openrouter.ai/api/v1/chat/completions";

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
Genera una recomendación PRECISA considerando los parámetros exactos proporcionados. La recomendación debe ser ESPECÍFICA para el cultivo de frijol en Guatemala.

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

Las dosis deben basarse en:
- Requerimiento de N para frijol: 36 kg N por tonelada de rendimiento
- Cálculos precisos por MANZANA (0.70 hectáreas)
- Condiciones específicas de suelo volcánico guatemalteco

SOLO JSON, sin texto adicional.`;

    const requestBody = {
      model: "openai/gpt-4.1-mini",
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

  // Escenario 1: Déficit crítico de Fósforo y Potasio
  if (parameters.phosphorus < 30 && parameters.potassium < 100) {
    recommendation = {
      diagnostico: `Déficit crítico de Fósforo (${parameters.phosphorus} ppm) y Potasio (${parameters.potassium} ppm) detectado en suelo volcánico. Niveles por debajo de los rangos óptimos (P: 30-60 ppm, K: 100-200 ppm) limitan severamente el desarrollo radicular y la resistencia a sequía.`,
      nombre_recomendacion:
        "Fertilizante Fosfo-Potásico para Suelos Volcánicos",
      dosis_manzana: "90-110 lb/manzana de fórmula 10-30-20 aplicado al surco",
      producto_sugerido: "NPK 10-30-20 granulado de liberación controlada",
      precio_aproximado: "GTQ 650-800 por manzana (dependiendo de la zona)",
      esquema_aplicacion:
        "Aplicar 60 lb/manzana a la siembra y 40-50 lb/manzana en la floración. Incorporar ligeramente al suelo para reducir fijación en suelos volcánicos.",
      eficacia_esperada:
        "92% para corregir deficiencias de P y K en condiciones de manejo adecuado",
      beneficios_tecnicos: [
        "Corrige el déficit crítico de Fósforo en suelos volcánicos con alta capacidad de fijación",
        "Suple la deficiencia de Potasio mejorando la resistencia hídrica del cultivo",
        "Mejora el desarrollo radicular y la eficiencia en el uso de agua",
        "Aumenta el amarre de vainas y el llenado uniforme del grano",
        "Reduce el impacto del estrés por sequías intermitentes en el Corredor Seco",
      ],
      precauciones: [
        "La aplicación excesiva puede inmovilizar micronutrientes como el Zinc",
        "No aplicar en contacto directo con la semilla por riesgo de fitotoxicidad",
        "En suelos muy ácidos (pH < 5.5), la efectividad se reduce sin encalado previo",
        "Requiere humedad adecuada para la disponibilidad nutrimental",
        "El Fósforo es susceptible a fijación en suelos volcánicos si no se incorpora correctamente",
      ],
      recomendaciones_complementarias: [
        "Realizar encalado si el pH es menor a 5.5 (usar 1-2 ton/manzana de dolomita)",
        "Incorporar materia orgánica (5-10 ton/manzana de gallinaza) para mejorar la eficiencia del Fósforo",
        "Considerar el sistema K'uxu'rum con madrecacao para aporte natural de Nitrógeno",
        "Mantener cobertura vegetal para reducir estrés por temperatura y conservar humedad",
        "Realizar análisis de suelo cada 2 ciclos para ajustar la fertilización",
      ],
    };
  }
  // Escenario 2: Déficit de Nitrógeno
  else if (parameters.nitrogen < 60) {
    recommendation = {
      diagnostico: `Déficit de Nitrógeno (${parameters.nitrogen} ppm) detectado. Nivel por debajo del rango óptimo (60-120 ppm) para frijol, limitando el crecimiento vegetativo y la producción de biomasa.`,
      nombre_recomendacion: "Fertilizante Nitrogenado de Liberación Controlada",
      dosis_manzana: "80-100 lb/manzana de Urea 46-0-0 aplicado en cobertura",
      producto_sugerido: "Urea 46-0-0 gránulos perlados",
      precio_aproximado: "GTQ 350-450 por manzana",
      esquema_aplicacion:
        "Aplicar 40 lb/manzana a los 15 días después de siembra y 40-60 lb/manzana a los 30 días. Aplicar preferiblemente antes de lluvias ligeras.",
      eficacia_esperada:
        "88-92% para corregir déficit de Nitrógeno en condiciones de buena humedad",
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
  // Escenario 3: pH Ácido
  else if (parameters.ph < 5.5) {
    recommendation = {
      diagnostico: `pH ácido (${parameters.ph}) detectado. Fuera del rango óptimo para frijol (6.0-6.5), reduciendo la disponibilidad de Fósforo y aumentando toxicidad por Aluminio.`,
      nombre_recomendacion: "Encalado Correctivo + Fertilizante Acidotolerante",
      dosis_manzana:
        "1.5-2 ton/manzana de cal dolomítica + 120 lb/manzana de NPK 12-24-12 acidotolerante",
      producto_sugerido:
        "Cal dolomítica (CaMg(CO3)2) + NPK 12-24-12 con azufre",
      precio_aproximado:
        "GTQ 1,200-1,500 por manzana (incluye encalado y fertilización)",
      esquema_aplicacion:
        "Aplicar cal 30 días antes de siembra, incorporar a 15-20 cm de profundidad. Fertilizar con NPK al momento de siembra y a los 25 días.",
      eficacia_esperada:
        "85% para corrección de acidez y 90% para disponibilidad de nutrientes",
      beneficios_tecnicos: [
        "Eleva el pH a niveles óptimos para disponibilidad nutrimental",
        "Reduce la toxicidad por Aluminio y Manganeso en suelos ácidos",
        "Aporta Calcio y Magnesio esenciales para desarrollo celular",
        "Mejora la eficiencia de fertilizantes fosfatados",
        "Aumenta la actividad microbiana beneficiosa del suelo",
      ],
      precauciones: [
        "Requiere 30-45 días para reacción completa con el suelo",
        "Aplicación excesiva puede causar deficiencias de micronutrientes",
        "No mezclar directamente con fertilizantes nitrogenados",
        "Efectividad dependiente de humedad y temperatura del suelo",
        "Necesita análisis de suelo posterior para verificar corrección",
      ],
      recomendaciones_complementarias: [
        "Realizar análisis de suelo 60 días después del encalado",
        "Usar variedades de frijol tolerantes a acidez como ICTA Ligero",
        "Incorporar materia orgánica para buffer de pH (8-10 ton/manzana)",
        "Evitar fertilizantes acidificantes como sulfato amónico",
        "Monitorear niveles de Zinc y Boro después del encalado",
      ],
    };
  }
  // Escenario 4: Exceso de Nutrientes
  else if (
    parameters.nitrogen > 120 ||
    parameters.phosphorus > 60 ||
    parameters.potassium > 200
  ) {
    recommendation = {
      diagnostico: `Exceso de nutrientes detectado: N ${parameters.nitrogen} ppm, P ${parameters.phosphorus} ppm, K ${parameters.potassium} ppm. Puede causar desbalances nutricionales y toxicidades.`,
      nombre_recomendacion: "Fertilización de Mantenimiento Balanceada",
      dosis_manzana: "60-80 lb/manzana de NPK 15-15-15 según análisis foliar",
      producto_sugerido: "NPK 15-15-15 de liberación gradual",
      precio_aproximado: "GTQ 400-550 por manzana",
      esquema_aplicacion:
        "Aplicar 40 lb/manzana a la siembra y 20-40 lb/manzana según monitoreo foliar a los 35 días. Reducir dosis si hay excesos evidentes.",
      eficacia_esperada:
        "94% para mantenimiento de cultivo sin agravar excesos",
      beneficios_tecnicos: [
        "Proporciona nutrición balanceada sin exacerbar excesos existentes",
        "Mantiene niveles óptimos para desarrollo reproductivo",
        "Reduce riesgo de toxicidades por desbalance nutricional",
        "Mejora eficiencia en uso de nutrientes ya presentes en el suelo",
        "Previene lixiviación de nitratos y contaminación de acuíferos",
      ],
      precauciones: [
        "Realizar análisis foliar antes de segunda aplicación",
        "Monitorear síntomas de toxicidad por excesos (quemaduras, clorosis)",
        "Evitar aplicación en suelos con drenaje deficiente",
        "Considerar reducción de riego si hay exceso de Nitrógeno",
        "Ajustar dosis según precipitaciones esperadas",
      ],
      recomendaciones_complementarias: [
        "Realizar análisis foliar cada 3 semanas durante ciclo",
        "Implementar cultivos de cobertura para consumir excesos de nutrientes",
        "Usar riego controlado para evitar lixiviación de nitratos",
        "Considerar siembra de variedades eficientes en uso de nutrientes",
        "Monitorear calidad de agua en zonas de recarga hídrica",
      ],
    };
  }
  // Escenario 5: Parámetros Óptimos - Mantenimiento
  else {
    recommendation = {
      diagnostico: `Parámetros dentro de rangos óptimos: N ${parameters.nitrogen} ppm, P ${parameters.phosphorus} ppm, K ${parameters.potassium} ppm, pH ${parameters.ph}. Condiciones favorables para alta productividad.`,
      nombre_recomendacion:
        "Fertilización de Alta Precisión para Máximo Rendimiento",
      dosis_manzana: "100-120 lb/manzana de NPK 17-17-17 con micronutrientes",
      producto_sugerido: "NPK 17-17-17 + Zn, B, Mo complejado",
      precio_aproximado: "GTQ 600-750 por manzana",
      esquema_aplicacion:
        "Aplicar 60 lb/manzana a la siembra, 30 lb/manzana en floración y 30 lb/manzana en formación de vainas. Aplicaciones precisas según estado fenológico.",
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

// Función de respaldo genérica actualizada para manzana
export const getFallbackFertilizerRecommendation = () => {
  console.log("Usando función de respaldo genérica...");
  return {
    diagnostico:
      "Recomendación general para cultivo de frijol en condiciones típicas guatemaltecas",
    nombre_recomendacion: "Fertilizante Balanceado DISA para Frijol",
    dosis_manzana: "80-100 lb/manzana de NPK 15-15-15",
    producto_sugerido: "NPK 15-15-15 granulado de alta solubilidad",
    precio_aproximado: "GTQ 450-600 por manzana",
    esquema_aplicacion:
      "Aplicar 50 lb/manzana al momento de siembra y 30-50 lb/manzana a los 25-30 días después de siembra. Incorporar ligeramente al suelo.",
    eficacia_esperada: "90-95% en suelos con pH 6.0-7.0 y buena humedad",
    beneficios_tecnicos: [
      "Aporta nutrición balanceada para todas las etapas del cultivo",
      "Mejora el desarrollo radicular en suelos volcánicos",
      "Aumenta la resistencia a sequías moderadas del Corredor Seco",
      "Optimiza el amarre de vainas y llenado de grano",
      "Incrementa el rendimiento en 20-25% sobre testigo sin fertilizar",
    ],
    precauciones: [
      "No aplicar en contacto directo con la semilla",
      "Ajustar dosis según análisis de suelo específico",
      "Requiere humedad adecuada para máxima eficiencia",
      "Almacenar en lugar seco y fresco para mantener calidad",
      "Usar equipo de protección durante la aplicación",
    ],
    recomendaciones_complementarias: [
      "Realizar análisis de suelo cada 2 ciclos de cultivo",
      "Implementar rotación maíz-frijol para sostenibilidad",
      "Usar cobertura vegetal para conservar humedad",
      "Considerar inoculación con rizobio para fijación de Nitrógeno",
      "Mantener registros de rendimiento para ajustes futuros",
    ],
  };
};
