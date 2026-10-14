import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO SEED DE NUTRICIÓN DEPORTIVA ENDURANCE (SiS / VICTORIA) ---');

  // 1. Limpieza de pedidos y productos de prueba anteriores
  await prisma.detallePedido.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.categoria.deleteMany({});
  console.log('✓ Tablas anteriores limpiadas correctamente.');

  // 2. Crear / Actualizar usuario Administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@victoria.com' },
    update: {
      password: adminPassword,
      nombre: 'Admin Victoria',
      rol: 'ADMIN',
    },
    create: {
      email: 'admin@victoria.com',
      password: adminPassword,
      nombre: 'Admin Victoria',
      rol: 'ADMIN',
    },
  });
  console.log(`✓ Usuario Administrador configurado: ${admin.email}`);

  // 3. Crear las 4 Categorías Oficiales
  const officialCategories = [
    { nombre: 'Geles Energéticos', slug: 'geles-energeticos' },
    { nombre: 'Hidratación y Electrolitos', slug: 'hidratacion-electrolitos' },
    { nombre: 'Bebidas Energéticas', slug: 'bebidas-energeticas' },
    { nombre: 'Packs y Rendimiento', slug: 'packs-rendimiento' },
  ];

  const createdCategories: Record<string, any> = {};

  for (const cat of officialCategories) {
    const createdCat = await prisma.categoria.create({
      data: {
        nombre: cat.nombre,
        slug: cat.slug,
      },
    });
    createdCategories[cat.slug] = createdCat;
  }
  console.log(`✓ 4 Categorías oficiales creadas:`, Object.keys(createdCategories).join(', '));

  // 4. Catálogo Oficial SiS (Science in Sport / Endurance)
  const officialProducts = [
    // --- GELES ENERGÉTICOS ---
    {
      nombre: 'SiS GO Isotonic Energy Gel 60ml',
      slug: 'sis-go-isotonic-energy-gel-60ml',
      categoriaSlug: 'geles-energeticos',
      precio: 12500,
      precioAntes: 14000,
      stock: 150,
      badges: ['ISOTÓNICO', 'FAST ENERGY', '0 AZÚCAR AGREGADA'],
      descripcion: 'El primer gel energético verdaderamente isotónico del mundo. Proporciona 22g de carbohidratos de asimilación inmediata sin necesidad de tomar agua, minimizando el riesgo de molestias gastrointestinales durante entrenamientos y competencias de resistencia.',
      beneficios: [
        '22g de carbohidratos de absorción ultrarrápida',
        'Fórmula verdaderamente isotónica (no requiere agua adicional)',
        'Fácil de digerir en momentos de máxima frecuencia cardíaca',
        'Apto para veganos y libre de gluten',
        'Certificación Informed Sport (libre de sustancias prohibidas)'
      ],
      especificaciones: {
        "Contenido": "60 ml",
        "Carbohidratos": "22g por gel",
        "Calorías": "87 kcal",
        "Azúcar": "0.6g",
        "Uso Recomendado": "Fondos de running, ciclismo, triatlón",
        "Origen": "Reino Unido (SiS)"
      },
      modoUso: 'Consumir 1 gel cada 20-30 minutos durante el ejercicio intenso. No es necesario acompañar con agua, aunque se recomienda mantener una hidratación general adecuada.',
      imagen: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      nombre: 'SiS GO Energy + Electrolyte Gel 60ml',
      slug: 'sis-go-energy-electrolyte-gel-60ml',
      categoriaSlug: 'geles-energeticos',
      precio: 14500,
      precioAntes: 16500,
      stock: 120,
      badges: ['ELECTROLITOS', 'ANTI-CALAMBRES', 'ENDURANCE'],
      descripcion: 'Combina 22g de energía isotónica con electrolitos clave (118mg de sodio, potasio y magnesio) para reponer las sales minerales perdidas por sudoración en climas cálidos y carreras exigentes.',
      beneficios: [
        '22g de carbohidratos de alta biodisponibilidad',
        '118mg de Sodio para evitar la hiponatremia',
        'Previene calambres y descompensaciones musculares',
        'Sabor refrescante y ligero, no empalaga',
        'Certificación Informed Sport'
      ],
      especificaciones: {
        "Contenido": "60 ml",
        "Sodio": "118 mg",
        "Potasio": "9.5 mg",
        "Magnesio": "1.5 mg",
        "Calorías": "87 kcal",
        "Uso Recomendado": "Climas cálidos, alta sudoración, +90 min ejercicio"
      },
      modoUso: 'Tomar 1 gel cada 30-45 minutos en sesiones con calor extremo o sudoración abundante para equilibrar energía y sales minerales.',
      imagen: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      nombre: 'SiS Beta Fuel Gel + Nootropics 60ml',
      slug: 'sis-beta-fuel-gel-nootropics-60ml',
      categoriaSlug: 'geles-energeticos',
      precio: 19500,
      precioAntes: 22500,
      stock: 90,
      badges: ['40G CARBS', 'NOOTROPICS', 'ELITE FOCUS'],
      descripcion: 'La cúspide de la nutrición endurance. Proporciona una descomunal dosis de 40g de carbohidratos en relación óptima 1:0.8 (maltodextrina a fructosa) reforzada con 200mg de cafeína, L-teanina y Citicolina Cognizin® para un rendimiento físico y enfoque mental sobrehumano en etapas finales de carrera.',
      beneficios: [
        '40g de carbohidratos con ratio optimizado 1:0.8',
        'Potenciado con 200mg de Cafeína para activar el SNC',
        'L-Teanina y Citicolina Cognizin® para claridad cognitiva bajo fatiga extrema',
        'Permite tolerar hasta 120g de carbohidratos por hora',
        'Testado y utilizado por equipos del WorldTour y atletas olímpicos'
      ],
      especificaciones: {
        "Contenido": "60 ml",
        "Carbohidratos": "40g",
        "Cafeína": "200 mg",
        "L-Teanina": "200 mg",
        "Cognizin®": "250 mg",
        "Relación": "Maltodextrina a Fructosa 1:0.8"
      },
      modoUso: 'Consumir máximo 1 gel al día, preferiblemente en el último tercio de una carrera o entrenamiento largo (ej. últimos 15-20km de un fondo o maratón) cuando el cansancio físico y mental es crítico.',
      imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },

    // --- HIDRATACIÓN Y ELECTROLITOS ---
    {
      nombre: 'SiS GO Hydro Pastillas de Hidratación (Tubo x 20)',
      slug: 'sis-go-hydro-pastillas-hidratacion-tubo-20',
      categoriaSlug: 'hidratacion-electrolitos',
      precio: 58000,
      precioAntes: 65000,
      stock: 80,
      badges: ['ZERO AZÚCAR', 'ELECTROLITOS', 'TOP HYDRATION'],
      descripcion: 'Tabletas efervescentes de hidratación rápida prácticamente libres de calorías (menos de 9 kcal por toma). Desarrolladas originalmente para el equipo de vela británico en los Juegos Olímpicos de Beijing 2008, ofrecen niveles exactos de sodio (30 mmol/L) para una retención óptima de líquidos.',
      beneficios: [
        'Reposición celular instantánea de electrolitos esenciales',
        'Menos de 9 calorías por porción (ideal para entrenamientos en ayunas o control de peso)',
        'Nivel científico comprobado de sodio (30 mmol/L)',
        'Disolución rápida y efervescente en 500ml de agua',
        'Certificado Informed Sport'
      ],
      especificaciones: {
        "Presentación": "Tubo x 20 tabletas",
        "Sodio": "350 mg por tableta",
        "Calorías": "8.7 kcal",
        "Azúcar": "0g",
        "Porciones": "20 caramañolas de 500ml"
      },
      modoUso: 'Disolver 1 pastilla efervescente en 500 ml de agua. Consumir antes, durante o después de entrenamientos intensos para reponer líquidos perdidos por sudoración.',
      imagen: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      nombre: 'SiS GO Hydro + Caffeine (Tubo x 20)',
      slug: 'sis-go-hydro-caffeine-tubo-20',
      categoriaSlug: 'hidratacion-electrolitos',
      precio: 62000,
      precioAntes: 70000,
      stock: 70,
      badges: ['75MG CAFEÍNA', 'ZERO CALS', 'ENERGÍA + ELECTROLITOS'],
      descripcion: 'Todas las bondades de hidratación científica de GO Hydro con el agregado de 75mg de cafeína de grado farmacéutico. Estimula la alerta mental, reduce la percepción del esfuerzo y mantiene el equilibrio electrolítico sin aportar azúcar ni calorías.',
      beneficios: [
        '75mg de cafeína para combatir la fatiga neuromuscular',
        'Sodio, potasio, calcio y magnesio en proporciones fisiológicas',
        'Prácticamente cero calorías (9 kcal)',
        'Excelente para el inicio de fondos o madrugadas frías',
        'Informed Sport Certified'
      ],
      especificaciones: {
        "Presentación": "Tubo x 20 tabletas",
        "Cafeína": "75 mg",
        "Sodio": "350 mg",
        "Calorías": "9 kcal",
        "Porciones": "20 bebidas de 500ml"
      },
      modoUso: 'Disolver 1 tableta en 500 ml de agua fría. Tomar 30-45 minutos antes de la actividad física o durante tramos de alta exigencia mental.',
      imagen: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      nombre: 'SiS GO Hydro Sobres Individuales (Caja x 10 sobres)',
      slug: 'sis-go-hydro-sobres-individuales-caja-10',
      categoriaSlug: 'hidratacion-electrolitos',
      precio: 68000,
      precioAntes: 75000,
      stock: 60,
      badges: ['FORMATO VIAJE', 'DOSIS EXACTA', 'ALTA DISOLUCIÓN'],
      descripcion: 'La misma fórmula de hidratación líder en formato de sobres individuales sellados herméticamente contra la humedad. Ideales para llevar en el bolsillo del jersey, chaleco de hidratación o mochila de trail sin riesgo de que se deterioren con el sudor o la lluvia.',
      beneficios: [
        'Sobres impermeables ultra portátiles',
        'Dosis milimétrica para bidones y caramañolas de 500ml',
        'Cero azúcar, sodio optimizado y disolución instantánea',
        'Protección total contra la humedad exterior',
        'Apto para vegetarianos y veganos'
      ],
      especificaciones: {
        "Presentación": "Caja x 10 sobres individuales",
        "Contenido": "4.5g por sobre",
        "Sodio": "350 mg",
        "Calorías": "9 kcal",
        "Compatibilidad": "Bidones de 500-750ml"
      },
      modoUso: 'Vaciar el contenido de 1 sobre en 500 ml de agua, agitar durante 15 segundos hasta disolución completa y consumir durante el entrenamiento.',
      imagen: 'https://images.unsplash.com/photo-1550572017-edd951b55104?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },

    // --- BEBIDAS ENERGÉTICAS ---
    {
      nombre: 'SiS GO Electrolyte Polvo 1.6kg',
      slug: 'sis-go-electrolyte-polvo-1-6kg',
      categoriaSlug: 'bebidas-energeticas',
      precio: 245000,
      precioAntes: 275000,
      stock: 40,
      badges: ['1.6 KG PRO', '36G CARBS', '40 SERVICIOS'],
      descripcion: 'Bebida de carbohidratos y electrolitos en formato grande de 1.6 kg para deportistas serios. Proporciona 36g de carbohidratos de vaciado gástrico acelerado junto a sodio, potasio, calcio y magnesio. Diseñada para mantener tanto la energía muscular como la hidratación constante durante salidas de más de 2 horas en bicicleta o entrenamientos de ultra resistencia.',
      beneficios: [
        '36g de carbohidratos de fácil absorción por porción',
        'Rinde 40 porciones de 500ml de solución energética e isotónica',
        'Promueve un vaciado gástrico rápido sin pesadez estomacal',
        'Equilibrio electrolítico científicamente dosificado',
        'Fabricado bajo estrictos controles Informed Sport'
      ],
      especificaciones: {
        "Peso Neto": "1.600 g (1.6 kg)",
        "Porciones": "40 servicios",
        "Carbohidratos por toma": "36g",
        "Calorías": "146 kcal",
        "Sodio": "200 mg",
        "Sabor": "Limón / Frutas Tropicales"
      },
      modoUso: 'Mezclar 2 medidas colmadas (aprox. 40g) con 500ml de agua en un bidón. Agitar enérgicamente. Consumir 500ml por cada 45-60 minutos de ejercicio intenso.',
      imagen: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      nombre: 'SiS GO Electrolyte Polvo 500g',
      slug: 'sis-go-electrolyte-polvo-500g',
      categoriaSlug: 'bebidas-energeticas',
      precio: 115000,
      precioAntes: 130000,
      stock: 65,
      badges: ['500G COMPACTO', 'DOBLE ACCIÓN', '12 SERVICIOS'],
      descripcion: 'La versión compacta de 500g de GO Electrolyte, perfecta para atletas que inician ciclos de entrenamiento específico o para llevar a viajes y competencias. Aporta energía constante e hidratación superior combinando maltodextrina de rápida digestión y sales minerales.',
      beneficios: [
        'Formato versátil para 12-13 entrenamientos clave',
        '36g de carbohidratos para retrasar el agotamiento de glucógeno',
        'Previene la deshidratación y calambres durante el fondo',
        'Suave para el estómago, sin acidez ni regusto químico',
        'Libre de sustancias prohibidas acreditado por Informed Sport'
      ],
      especificaciones: {
        "Peso Neto": "500 g",
        "Porciones": "12-13 servicios",
        "Carbohidratos por toma": "36g",
        "Calorías": "146 kcal",
        "Sodio": "200 mg"
      },
      modoUso: 'Disolver 40g (2 scoops) en 500ml de agua. Tomar a sorbos continuos durante la primera y segunda hora de esfuerzo aeróbico.',
      imagen: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },

    // --- PACKS Y RENDIMIENTO ---
    {
      nombre: 'Pack Endurance Pro SiS (Bebida 500g + 6 Geles + Tubo Hydro)',
      slug: 'pack-endurance-pro-sis',
      categoriaSlug: 'packs-rendimiento',
      precio: 195000,
      precioAntes: 220000,
      stock: 35,
      badges: ['COMBO COMPLETO', 'AHORRO 12%', 'READY TO RACE'],
      descripcion: 'El stack definitivo para ciclistas, corredores y triatletas. Incluye 1 pote de GO Electrolyte 500g para el bidón, 6 Geles GO Isotonic de sabores variados para energía instantánea en ruta, y 1 Tubo de Pastillas Hydro para reposición de sales. Todo lo necesario para un fin de semana épico de competencia.',
      beneficios: [
        'Estrategia nutricional completa: Hidratación + Carbohidratos + Electrolitos',
        'Ahorro del 12% frente a la compra individual',
        'Ideal para fondos de ciclismo (+100km) o medias maratones',
        'Cero improvisación el día de la prueba'
      ],
      especificaciones: {
        "Contenido": "1x GO Electrolyte 500g + 6x Geles GO 60ml + 1x Tubo Hydro 20 tabs",
        "Objetivo": "Competición y fondos de más de 3 horas",
        "Nivel": "Amateur y Élite"
      },
      modoUso: 'Bidón 1 con GO Electrolyte para hidratación y carbohidratos constantes. Tomar 1 gel GO cada 30-40 min. Usar 1 pastilla Hydro en bidón 2 en condiciones de alta sudoración.',
      imagen: 'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      nombre: 'Pack Maratón & Fondo Beta Fuel (6x Beta Fuel Nootropics + 1x Hydro Cafeína)',
      slug: 'pack-maraton-fondo-beta-fuel',
      categoriaSlug: 'packs-rendimiento',
      precio: 155000,
      precioAntes: 178000,
      stock: 25,
      badges: ['ALTO RENDIMIENTO', '240G CARBS', 'ENFOQUE NOOTRÓPICO'],
      descripcion: 'Diseñado específicamente para romper PB (marcas personales) en 42K de calle, trail de montaña o carreras de ruta. Combina la ultra potencia de 6 geles Beta Fuel con nootrópicos y cafeína junto al tubo Hydro + Cafeína para asegurar cero pájaras y un enfoque mental impenetrable de principio a fin.',
      beneficios: [
        '40g de carbohidratos por gel para asimilar hasta 90-120g/hora',
        'Nootrópicos de grado farmacéutico para enfoque en momentos de agonía',
        'Cafeína dosificada para evitar caídas de potencia',
        'Diseñado con la tecnología de campeones mundiales de maratón e Ineos Grenadiers'
      ],
      especificaciones: {
        "Contenido": "6x Beta Fuel + Nootropics 60ml + 1x Tubo Hydro Caffeine 20 tabs",
        "Uso": "Maratón 42K, Gran Fondo ciclismo, Triatlón 70.3 / Ironman"
      },
      modoUso: 'Tomar Hydro Cafeína en los primeros 10-15km y alternar 1 gel Beta Fuel cada 35-45 minutos manteniendo ritmo de carrera.',
      imagen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const prod of officialProducts) {
    const cat = createdCategories[prod.categoriaSlug];
    if (!cat) continue;

    await prisma.producto.create({
      data: {
        nombre: prod.nombre,
        slug: prod.slug,
        descripcion: prod.descripcion,
        precio: prod.precio,
        precioAntes: prod.precioAntes,
        stock: prod.stock,
        imagen: prod.imagen,
        badges: prod.badges,
        beneficios: prod.beneficios,
        especificaciones: prod.especificaciones,
        modoUso: prod.modoUso,
        activo: true,
        categoriaId: cat.id,
      },
    });
    console.log(`  + Producto registrado: [${cat.nombre}] ${prod.nombre}`);
  }

  console.log(`✓ ${officialProducts.length} Productos oficiales insertados con éxito.`);
  console.log('--- SEED COMPLETADO SATISFACTORIAMENTE ---');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
