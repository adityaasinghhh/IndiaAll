/**
 * Editorial content for the INDIA ALL corporate redesign.
 *
 * Keeping copy in one typed-by-shape object makes the homepage, navigation,
 * shared sections and new corporate pages consistent in all three supported
 * languages. Facts are limited to the company history and contact details
 * already present in the project; no volumes, certifications or facilities are
 * invented.
 */

export const siteContent = {
  en: {
    utility: {
      tagline: 'International sourcing & trade',
      presence: 'India · Brazil · Canada',
      signIn: 'Client sign in',
      dashboard: 'My account',
    },
    nav: {
      about: 'About Us',
      products: 'Products & Commodities',
      sourcing: 'Global Sourcing',
      opportunities: 'Business Opportunities',
      story: 'Our Story',
      contact: 'Contact',
      cta: 'Discuss Your Requirements',
      menu: 'Open menu',
      close: 'Close menu',
      productsLabel: 'Explore categories',
      viewAll: 'View all products',
      getInTouch: 'Contact our team',
    },
    hero: {
      eyebrow: 'International sourcing · Commodity trading',
      titleTop: 'Connecting Global Markets.',
      titleBottom: 'Delivering Trusted Trade Solutions.',
     description:
       'INDIA ALL is an integrated international import, export, and trading firm dedicated to simplifying global trade. We specialize in handling customized orders directly, taking complete ownership of the import-export lifecycle to ensure smooth delivery. Beyond order fulfillment, we actively engage in strategic global trading, connecting buyers and suppliers across key industries with integrity, speed, and efficiency.',
      primary: 'Explore Our Products',
      secondary: 'Discuss Your Requirements',
      metaLeft: 'Source · Connect · Deliver',
      metaRight: 'Established 2018',
      imageAlt: 'Aerial view of an international container port with cranes and stacked freight containers',
    },
    capabilities: {
      eyebrow: 'How we work',
      title: 'From first enquiry to a clear route forward.',
      intro:
        'We bring structure to international sourcing by understanding the requirement first, then coordinating the right products, suppliers and commercial conversations.',
      image: '/images/editorial/port.jpg',
      imageAlt: 'Container ship berthed at a commercial port',
      imageCaption: 'International shipping infrastructure',
      steps: [
        {
          number: '01',
          title: 'Source',
          text: 'Identify suitable products and suppliers based on buyer requirements.',
        },
        {
          number: '02',
          title: 'Connect',
          text: 'Coordinate buyers, suppliers and commercial requirements across markets.',
        },
        {
          number: '03',
          title: 'Deliver',
          text: 'Support order coordination and trade processes from origin to destination.',
        },
      ],
      note:
        'Our role is commercial coordination. Transportation and logistics are handled by appointed service providers.',
    },
    commodities: {
      eyebrow: 'Products & commodities',
      title: 'A portfolio shaped around real trade requirements.',
      intro:
        'Selected categories for industrial buyers, distributors and businesses that need a clear commercial route to the products they trade.',
      viewAll: 'View the full catalogue',
      categories: [
        {
          id: 'agriculture',
          name: 'Agricultural Commodities',
          description:
            'Wheat, corn, soybeans, pulses and oilseeds sourced around defined quality and volume requirements.',
          image: '/images/editorial/wheat.jpg',
          alt: 'Golden wheat ears ready for harvest',
          href: '/products?category=agriculture',
          linkLabel: 'View commodities',
        },
        {
          id: 'metals',
          name: 'Industrial Raw Materials',
          description:
            'Metals, minerals and industrial inputs for manufacturing, processing and production requirements.',
          image: '/images/editorial/steel.jpg',
          alt: 'Coiled steel in an industrial storage facility',
          href: '/products?category=metals',
          linkLabel: 'View materials',
        },
        {
          id: 'energy',
          name: 'Energy Commodities',
          description:
            'Petroleum products, coal and related energy commodities for industrial and commercial applications.',
          image: '/images/editorial/energy.jpg',
          alt: 'Bulk coal stockpiled at an industrial terminal',
          href: '/products?category=energy',
          linkLabel: 'View commodities',
        },
        {
          id: 'food',
          name: 'Food & Specialty Products',
          description:
            'Rice, sugar, oils and specialty ingredients for wholesale, food service and processing needs.',
          image: '/images/editorial/food.jpg',
          alt: 'A selection of spices and specialty food ingredients',
          href: '/products?category=food',
          linkLabel: 'View products',
        },
        {
          id: 'consumer',
          name: 'Consumer Goods',
          description:
            'Packaged products and everyday consumer goods for retail, wholesale and distribution channels.',
          image: '/images/editorial/consumer.jpg',
          alt: 'Fresh produce displayed at a grocery retailer',
          href: '/enquiry?enquiry=consumer-goods',
          linkLabel: 'Request details',
        },
      ],
    },
    story: {
      eyebrow: 'Our story',
      title: 'Bridging Continents, Connecting Cultures',
      lead:
        'Our journey began in 2018 during a series of international travels. As we moved across different continents, we noticed a striking gap in the market: authentic, high-quality Indian products, South American products etc—especially rich agricultural goods that India produces in abundance—were either unavailable or inaccessible to everyday consumers around the world. We saw millions of people missing out on nutritious, traditional products simply because the global supply chain was disconnected.',

    p1:
        'Driven by a passion for quality and fairness, we set out to bridge this gap. We started by connecting the supply chain directly from the source, removing unnecessary intermediaries and making genuine, premium-quality agricultural and traditional products accessible at honest, budget-friendly prices.',

    p2:
        'In 2021, we officially expanded and established our presence across India, Brazil, and Canada. Our purpose is to promote global wellness through natural, wholesome agricultural products and maintain radical transparency through open, honest, and ethical business practices at every step of trade—from farm to table.',
      milestones: [
        {
          year: '2018',
          title: 'The journey begins',
          text: 'INDIA ALL is founded with a focus on international trade and improved access to quality products.',
        },
        {
          year: '2021',
          title: 'Presence across three markets',
          text: 'Our presence is established across India, Brazil and Canada.',
        },
      ],
      cta: 'Read our story',
      primaryImage: '/images/editorial/origin.jpg',
      primaryAlt: 'A farmer navigating a boat through a palm oil plantation',
      primaryCaption: 'Origins and producer communities',
      secondaryImage: '/images/editorial/field.jpg',
      secondaryAlt: 'Agricultural fields at sunset',
      secondaryCaption: 'Agricultural supply chains',
    },
    founder: {
      eyebrow: 'Our commitment',
      title: 'Making Global Trade Simpler.',
      lead:
        'We are an end-to-end import, export, and trading company committed to making international commerce simple, efficient, and reliable.',

    p1:
       'Acting as both trusted trade intermediaries and direct supply partners, we manage full order fulfillment from origin to final destination.',

    p2:
       ' Our vision is to serve as a single, dependable bridge for buyers and sellers worldwide—delivering value, quality, and complete trade solutions under one roof.',
      principles: [
        {
          title: 'Transparent by default',
          text: 'Clear expectations, documented requirements and direct communication at every stage.',
        },
        {
          title: 'Relationships that last',
          text: 'Supplier and buyer relationships built on consistency rather than one-off transactions.',
        },
        {
          title: 'Quality in the detail',
          text: 'Specifications, origins and commercial terms considered before commitments are made.',
        },
        {
          title: 'Coordinated trade',
          text: 'A single point of coordination across markets, suppliers and buyer requirements.',
        },
      ],
      name: 'Pramod Kumar',
      role: 'Founder, INDIA ALL',
      noteLabel: 'A note from our founder',
    },
    opportunities: {
      eyebrow: 'Business opportunities',
      title:
        'Unlocking Global Sourcing Potential.',

    intro:
      'Through our extensive network of verified producers and international markets, we identify high-demand commodities, emerging product lines, and specialized goods tailored to market trends. We bridge supply and demand by sourcing premium products with verified quality, competitive pricing, and reliable supply chains.',
      cta: 'Explore a Partnership',
      image: '/images/editorial/partnership.jpg',
      imageAlt: 'Two business people shaking hands after a meeting',
      imageCaption: 'Long-term relationships, built one conversation at a time.',
      items: [
        {
          number: '01',
          title: 'Industrial Raw Materials & Energy Commodities',
          text: 'High-grade industrial raw materials and energy commodities.',
          linkLabel: 'Explore opportunities',
          href: '/enquiry?enquiry=sourcing-partnership',
        },
        {
           number: '02',
           title: 'Agri-Commodities & Specialty Products',
           text: 'Agri-commodities and specialized food and beverage products.',
           linkLabel: 'Explore opportunities',
           href: '/enquiry?enquiry=buyer-supplier',
        },
        {
          number: '03',
          title: 'Consumer Goods & Global Suppliers',
          text: 'Consumer goods, niche market imports, and vetted international supplier networks with strict quality assurance.',
          linkLabel: 'Explore opportunities',
          href: '/enquiry?enquiry=distribution',
        },
      ],
    },
    presence: {
      eyebrow: 'International presence',
      title: 'Three markets. One coordinated approach.',
      intro:
        'Since 2021, INDIA ALL has maintained a presence across India, Brazil and Canada, connecting complementary markets and supporting trade conversations across regions.',
      established: 'Presence established in 2021',
      note:
        'Presence refers to our operating locations in these markets. It does not represent owned ports, warehouses or logistics facilities.',
      locations: [
        {
          country: 'India',
          region: 'South Asia',
          address: 'Bakhtawarpur, Delhi 110036',
        },
        {
          country: 'Brazil',
          region: 'South America',
          address: 'Tapes, Rio Grande do Sul 96760-000',
        },
        {
          country: 'Canada',
          region: 'North America',
          address: 'Edmonton, Alberta',
        },
      ],
    },
    contact: {
      eyebrow: 'Start a conversation',
      title: 'Let’s Discuss Your Trade Requirements.',
      intro:
        'Tell us what you are looking for, the market you are working in and the commercial context. We will review your enquiry and respond using the details you provide.',
      emailLabel: 'Business enquiries',
      email: 'Info@indiaall.org',
      stepsTitle: 'What happens next',
      steps: [
        'Share your product, market and commercial requirements.',
        'We review the details and identify the appropriate route.',
        'We respond directly using the contact information provided.',
      ],
      form: {
        name: 'Full name',
        company: 'Company',
        email: 'Business email',
        country: 'Country',
        phone: 'Phone',
        optional: 'Optional',
        enquiryType: 'Enquiry type',
        product: 'Product or commodity',
        message: 'Message',
        selectPlaceholder: 'Please select',
        otherProduct: 'Other / not listed',
        enquiryTypes: [
          'Product sourcing',
          'Bulk supply',
          'Supplier partnership',
          'Distribution opportunity',
          'General trade enquiry',
        ],
        messagePlaceholder:
          'Include the product, specification, volume, destination and any commercial context that will help us review your requirement.',
        consent:
          'I consent to INDIA ALL processing the information above to respond to this enquiry.',
        submit: 'Submit Enquiry',
        submitting: 'Sending enquiry…',
      },
      success: {
        title: 'Enquiry received.',
        text:
          'Thank you. Your requirements have been sent to our team. We will review the details and respond using the contact information provided.',
        again: 'Submit another enquiry',
      },
      errors: {
        required: 'This field is required.',
        email: 'Please enter a valid business email address.',
        consent: 'Please confirm your consent before submitting.',
        submit: 'We could not send your enquiry. Please try again or contact us by email.',
      },
      disclaimer:
        'Submitting this form does not create a binding order or commercial commitment.',
    },
    footer: {
      description:
        'An international trading company connecting buyers and suppliers through commodity sourcing, supplier relationships and coordinated cross-border trade.',
      companyTitle: 'Company',
      productsTitle: 'Products & commodities',
      workTitle: 'Work with us',
      presenceTitle: 'Presence',
      links: {
        about: 'About Us',
        story: 'Our Story',
        sourcing: 'Global Sourcing',
        opportunities: 'Business Opportunities',
        contact: 'Contact',
        catalogue: 'Product catalogue',
        bulk: 'Custom bulk requirements',
        enquiry: 'Business enquiry',
        sourcingPartnership: 'Sourcing partnerships',
        distribution: 'Distribution opportunities',
        signIn: 'Client sign in',
      },
      rights: '© 2026 INDIA ALL. All rights reserved.',
      photography: 'Selected photography sourced from Unsplash.',
      language: 'Language',
    },
    pages: {
      about: {
        eyebrow: 'About INDIA ALL',
        title: 'Trade built on clarity, relationships and follow-through.',
        intro:
          'We are an international trading company working with buyers and suppliers across agricultural, industrial, energy and consumer categories.',
      },
      products: {
        eyebrow: 'Products & commodities',
        title: 'A considered portfolio for international trade.',
        intro:
          'Explore the products and commodities we discuss with buyers and suppliers across markets. Every enquiry is reviewed against your specification, volume and destination.',
        note:
          'Product availability is confirmed against each requirement. A category listing does not represent stock on hand.',
      },
      sourcing: {
        eyebrow: 'Global sourcing',
        title: 'Requirements first. Sourcing second.',
        intro:
          'We begin with the product, specification, volume and market, then coordinate suitable supply and the commercial conversation that follows.',
        considerationsTitle: 'What we establish before we source',
        considerations: [
          'Product specification and quality expectations',
          'Volume, packaging and destination market',
          'Origin options and supplier capability',
          'Documentation and commercial terms',
          'Timing and the route to agreement',
        ],
        ctaTitle: 'Have a sourcing requirement?',
        ctaText: 'Share the details and we will review the right route forward.',
      },
      opportunities: {
        eyebrow: 'Business opportunities',
        title:
          'Unlocking Global Sourcing Potential.',

        intro:
          'Through our extensive network of verified producers and international markets, we identify high-demand commodities, emerging product lines, and specialized goods tailored to market trends. We bridge supply and demand by sourcing premium products with verified quality, competitive pricing, and reliable supply chains.',
        partnersIntro:
          'Our conversations are shaped by the role each business plays in the supply chain and the market it serves.',
        partners: [
          'Importers and exporters',
          'Producers and processors',
          'Distributors and wholesalers',
          'Manufacturers and retailers',
        ],
        ctaTitle: 'Looking for a trade partner?',
        ctaText: 'Tell us about your business and the opportunity you have in mind.',
      },
      story: {
        eyebrow: 'Our story',
        title: 'The story behind INDIA ALL.',
        intro:
          'From a focused trading idea in 2018 to a presence across three markets, our direction has stayed the same.',
      },
      contact: {
        eyebrow: 'Contact',
        title: 'Let’s Discuss Your Trade Requirements.',
        formHeading: 'Tell us what you are looking to source.',
        intro:
          'Use the form below for product sourcing, supplier partnerships, distribution conversations or a general trade enquiry.',
      },
      enquiry: {
        eyebrow: 'Business enquiry',
        title: 'Tell us what you need to move forward.',
        intro:
          'Use this form for product sourcing, bulk supply, supplier partnerships or a general trade enquiry. Our team reviews each submission individually.',
      },
      bulkOrder: {
        eyebrow: 'Bulk requirements',
        title: 'Custom bulk requirements.',
        intro:
          'For volume-specific sourcing, include the product, specification, quantity and destination so we can review the requirement properly.',
      },
    },
    common: {
      loading: 'Loading…',
      backHome: 'Return home',
      allProducts: 'All products',
      discuss: 'Discuss your requirements',
      catalogue: 'View catalogue',
    },
  },

  es: {
    utility: {
      tagline: 'Abastecimiento y comercio internacional',
      presence: 'India · Brasil · Canadá',
      signIn: 'Acceso de clientes',
      dashboard: 'Mi cuenta',
    },
    nav: {
      about: 'Quiénes somos',
      products: 'Productos y materias primas',
      sourcing: 'Abastecimiento global',
      opportunities: 'Oportunidades de negocio',
      story: 'Nuestra historia',
      contact: 'Contacto',
      cta: 'Hablemos de sus necesidades',
      menu: 'Abrir menú',
      close: 'Cerrar menú',
      productsLabel: 'Explorar categorías',
      viewAll: 'Ver todos los productos',
      getInTouch: 'Contactar con el equipo',
    },
    hero: {
      eyebrow: 'Abastecimiento internacional · Comercio de materias primas',
      titleTop: 'Conectamos mercados globales.',
      titleBottom: 'Ofrecemos soluciones comerciales fiables.',
      description:
        'INDIA ALL conecta a compradores y proveedores mediante abastecimiento internacional, comercio de materias primas y soluciones comerciales coordinadas en función de las necesidades de cada empresa.',
      primary: 'Explorar productos',
      secondary: 'Hablemos de sus necesidades',
      metaLeft: 'Origen · Conexión · Entrega',
      metaRight: 'Fundada en 2018',
      imageAlt: 'Vista aérea de un puerto internacional de contenedores con grúas y contenedores apilados',
    },
    capabilities: {
      eyebrow: 'Cómo trabajamos',
      title: 'De la primera consulta a una ruta clara.',
      intro:
        'Aportamos estructura al abastecimiento internacional: primero entendemos la necesidad y después coordinamos productos, proveedores y conversaciones comerciales.',
      image: '/images/editorial/port.jpg',
      imageAlt: 'Buque portacontenedores atracado en un puerto comercial',
      imageCaption: 'Infraestructura portuaria internacional',
      steps: [
        {
          number: '01',
          title: 'Origen',
          text: 'Identificamos productos y proveedores adecuados según los requisitos del comprador.',
        },
        {
          number: '02',
          title: 'Conexión',
          text: 'Coordinamos compradores, proveedores y requisitos comerciales entre mercados.',
        },
        {
          number: '03',
          title: 'Entrega',
          text: 'Apoyamos la coordinación de pedidos y los procesos comerciales desde el origen hasta el destino.',
        },
      ],
      note:
        'Nuestro papel es la coordinación comercial. El transporte y la logística son gestionados por proveedores designados.',
    },
    commodities: {
      eyebrow: 'Productos y materias primas',
      title: 'Una cartera construida en torno a necesidades comerciales reales.',
      intro:
        'Categorías seleccionadas para compradores industriales, distribuidores y empresas que necesitan una ruta comercial clara hacia los productos que comercializan.',
      viewAll: 'Ver el catálogo completo',
      categories: [
        {
          id: 'agriculture',
          name: 'Materias primas agrícolas',
          description:
            'Trigo, maíz, soja, legumbres y semillas oleaginosas según requisitos definidos de calidad y volumen.',
          image: '/images/editorial/wheat.jpg',
          alt: 'Espigas de trigo doradas listas para la cosecha',
          href: '/products?category=agriculture',
          linkLabel: 'Ver materias primas',
        },
        {
          id: 'metals',
          name: 'Materias primas industriales',
          description:
            'Metales, minerales y suministros industriales para procesos de fabricación, transformación y producción.',
          image: '/images/editorial/steel.jpg',
          alt: 'Bobinas de acero en una instalación industrial',
          href: '/products?category=metals',
          linkLabel: 'Ver materiales',
        },
        {
          id: 'energy',
          name: 'Materias primas energéticas',
          description:
            'Productos petrolíferos, carbón y otras materias primas energéticas para aplicaciones industriales y comerciales.',
          image: '/images/editorial/energy.jpg',
          alt: 'Carbón a granel almacenado en una terminal industrial',
          href: '/products?category=energy',
          linkLabel: 'Ver materias primas',
        },
        {
          id: 'food',
          name: 'Alimentos y productos especiales',
          description:
            'Arroz, azúcar, aceites e ingredientes especiales para mayoristas, restauración y procesos alimentarios.',
          image: '/images/editorial/food.jpg',
          alt: 'Selección de especias e ingredientes alimentarios especiales',
          href: '/products?category=food',
          linkLabel: 'Ver productos',
        },
        {
          id: 'consumer',
          name: 'Bienes de consumo',
          description:
            'Productos envasados y artículos de consumo diario para canales minoristas, mayoristas y de distribución.',
          image: '/images/editorial/consumer.jpg',
          alt: 'Productos frescos expuestos en un comercio minorista',
          href: '/enquiry?enquiry=consumer-goods',
          linkLabel: 'Solicitar información',
        },
      ],
    },
    story: {
      eyebrow: 'Nuestra historia',
      title: 'Unimos continentes. Conectamos oportunidades.',
      lead:
        'INDIA ALL es una empresa comercial internacional construida sobre una idea sencilla: un mejor acceso a productos de calidad crea mejores oportunidades entre mercados.',
      p1:
        'Nuestro recorrido comenzó en 2018, con el objetivo de conectar a compradores y proveedores más allá de las fronteras y facilitar las conversaciones de comercio internacional.',
      p2:
        'En 2021 establecimos nuestra presencia en India, Brasil y Canadá. Estos tres mercados siguen definiendo nuestra forma de abastecer, coordinar y construir relaciones con socios.',
      milestones: [
        {
          year: '2018',
          title: 'Comienza el recorrido',
          text: 'Se funda INDIA ALL con un enfoque en el comercio internacional y un mejor acceso a productos de calidad.',
        },
        {
          year: '2021',
          title: 'Presencia en tres mercados',
          text: 'Establecemos nuestra presencia en India, Brasil y Canadá.',
        },
      ],
      cta: 'Conocer nuestra historia',
      primaryImage: '/images/editorial/origin.jpg',
      primaryAlt: 'Un agricultor navega en barca por una plantación de palma aceitera',
      primaryCaption: 'Orígenes y comunidades productoras',
      secondaryImage: '/images/editorial/field.jpg',
      secondaryAlt: 'Campos agrícolas al atardecer',
      secondaryCaption: 'Cadenas de suministro agrícola',
    },
    founder: {
      eyebrow: 'Nuestro compromiso',
      title: 'Hacer el comercio global más sencillo.',
      lead:
        'El comercio internacional es complejo por naturaleza. Nuestro papel es hacer que el camino entre una necesidad y un acuerdo sea más claro, transparente y coordinado.',
      p1:
        'Nos comprometemos con prácticas comerciales transparentes, relaciones fiables con proveedores y un abastecimiento consciente de la calidad. Cada conversación parte de la necesidad del comprador, la especificación del producto y el contexto comercial.',
      p2:
        'Al coordinar información, documentación y comunicación entre mercados, ayudamos a reducir fricciones en el comercio transfronterizo sin exagerar lo que ninguna parte puede controlar por sí sola.',
      principles: [
        {
          title: 'Transparencia desde el inicio',
          text: 'Expectativas claras, requisitos documentados y comunicación directa en cada etapa.',
        },
        {
          title: 'Relaciones duraderas',
          text: 'Relaciones con proveedores y compradores basadas en la constancia, no en operaciones puntuales.',
        },
        {
          title: 'Calidad en el detalle',
          text: 'Especificaciones, orígenes y condiciones comerciales analizados antes de asumir compromisos.',
        },
        {
          title: 'Comercio coordinado',
          text: 'Un único punto de coordinación entre mercados, proveedores y necesidades del comprador.',
        },
      ],
      name: 'Pramod Kumar',
      role: 'Fundador, INDIA ALL',
      noteLabel: 'Una nota de nuestro fundador',
    },
    opportunities: {
      eyebrow: 'Oportunidades de negocio',
      title: 'Construyamos la próxima relación comercial.',
      intro:
        'Trabajamos con empresas que valoran requisitos claros, una comunicación fiable y un enfoque reflexivo del comercio internacional.',
      cta: 'Explorar una alianza',
      image: '/images/editorial/partnership.jpg',
      imageAlt: 'Dos profesionales estrechan la mano tras una reunión',
      imageCaption: 'Relaciones duraderas, construidas conversación a conversación.',
      items: [
        {
          number: '01',
          title: 'Alianzas de abastecimiento',
          text: 'Para productores, transformadores y proveedores que buscan una vía reflexiva hacia compradores internacionales y nuevas relaciones comerciales.',
          linkLabel: 'Hablemos de abastecimiento',
          href: '/enquiry?enquiry=sourcing-partnership',
        },
        {
          number: '02',
          title: 'Conexiones entre compradores y proveedores',
          text: 'Para compradores que necesitan identificar suministro adecuado, comparar opciones y coordinar requisitos entre mercados.',
          linkLabel: 'Iniciar una conversación',
          href: '/enquiry?enquiry=buyer-supplier',
        },
        {
          number: '03',
          title: 'Distribución y oportunidades comerciales',
          text: 'Para empresas que exploran representación, distribución u oportunidades comerciales conjuntas en nuestros mercados activos.',
          linkLabel: 'Explorar distribución',
          href: '/enquiry?enquiry=distribution',
        },
      ],
    },
    presence: {
      eyebrow: 'Presencia internacional',
      title: 'Tres mercados. Un enfoque coordinado.',
      intro:
        'Desde 2021, INDIA ALL mantiene presencia en India, Brasil y Canadá, conectando mercados complementarios y apoyando conversaciones comerciales entre regiones.',
      established: 'Presencia establecida en 2021',
      note:
        'La presencia se refiere a nuestras ubicaciones operativas en estos mercados. No representa puertos, almacenes o instalaciones logísticas propias.',
      locations: [
        { country: 'India', region: 'Asia del Sur', address: 'Bakhtawarpur, Delhi 110036' },
        { country: 'Brasil', region: 'América del Sur', address: 'Tapes, Rio Grande do Sul 96760-000' },
        { country: 'Canadá', region: 'América del Norte', address: 'Edmonton, Alberta' },
      ],
    },
    contact: {
      eyebrow: 'Iniciemos una conversación',
      title: 'Hablemos de sus necesidades comerciales.',
      intro:
        'Cuéntenos qué busca, en qué mercado opera y cuál es el contexto comercial. Revisaremos su consulta y responderemos utilizando los datos que nos proporcione.',
      emailLabel: 'Consultas empresariales',
      email: 'Info@indiaall.org',
      stepsTitle: 'Qué sucede a continuación',
      steps: [
        'Comparta sus necesidades de producto, mercado y condiciones comerciales.',
        'Revisamos los detalles e identificamos la vía adecuada.',
        'Respondemos directamente utilizando la información de contacto facilitada.',
      ],
      form: {
        name: 'Nombre completo',
        company: 'Empresa',
        email: 'Correo corporativo',
        country: 'País',
        phone: 'Teléfono',
        optional: 'Opcional',
        enquiryType: 'Tipo de consulta',
        product: 'Producto o materia prima',
        message: 'Mensaje',
        selectPlaceholder: 'Seleccione',
        otherProduct: 'Otro / no incluido',
        enquiryTypes: [
          'Abastecimiento de producto',
          'Suministro a granel',
          'Alianza con proveedores',
          'Oportunidad de distribución',
          'Consulta comercial general',
        ],
        messagePlaceholder:
          'Incluya el producto, la especificación, el volumen, el destino y cualquier contexto comercial que nos ayude a revisar su necesidad.',
        consent:
          'Acepto que INDIA ALL trate la información anterior para responder a esta consulta.',
        submit: 'Enviar consulta',
        submitting: 'Enviando consulta…',
      },
      success: {
        title: 'Consulta recibida.',
        text:
          'Gracias. Sus requisitos se han enviado a nuestro equipo. Revisaremos los detalles y responderemos utilizando la información de contacto facilitada.',
        again: 'Enviar otra consulta',
      },
      errors: {
        required: 'Este campo es obligatorio.',
        email: 'Introduzca un correo corporativo válido.',
        consent: 'Confirme su consentimiento antes de enviar.',
        submit: 'No pudimos enviar su consulta. Inténtelo de nuevo o contáctenos por correo.',
      },
      disclaimer:
        'El envío de este formulario no crea un pedido ni un compromiso comercial vinculante.',
    },
    footer: {
      description:
        'Una empresa comercial internacional que conecta compradores y proveedores mediante abastecimiento de materias primas, relaciones con proveedores y comercio transfronterizo coordinado.',
      companyTitle: 'Empresa',
      productsTitle: 'Productos y materias primas',
      workTitle: 'Trabaje con nosotros',
      presenceTitle: 'Presencia',
      links: {
        about: 'Quiénes somos',
        story: 'Nuestra historia',
        sourcing: 'Abastecimiento global',
        opportunities: 'Oportunidades de negocio',
        contact: 'Contacto',
        catalogue: 'Catálogo de productos',
        bulk: 'Necesidades a granel',
        enquiry: 'Consulta empresarial',
        sourcingPartnership: 'Alianzas de abastecimiento',
        distribution: 'Oportunidades de distribución',
        signIn: 'Acceso de clientes',
      },
      rights: '© 2026 INDIA ALL. Todos los derechos reservados.',
      photography: 'Fotografías seleccionadas de Unsplash.',
      language: 'Idioma',
    },
    pages: {
      about: {
        eyebrow: 'Sobre INDIA ALL',
        title: 'Comercio basado en claridad, relaciones y seguimiento.',
        intro:
          'Somos una empresa comercial internacional que trabaja con compradores y proveedores en categorías agrícolas, industriales, energéticas y de consumo.',
      },
      products: {
        eyebrow: 'Productos y materias primas',
        title: 'Una cartera reflexiva para el comercio internacional.',
        intro:
          'Explore los productos y materias primas que tratamos con compradores y proveedores en distintos mercados. Cada consulta se revisa según su especificación, volumen y destino.',
        note:
          'La disponibilidad se confirma para cada necesidad. La inclusión en una categoría no representa existencias disponibles.',
      },
      sourcing: {
        eyebrow: 'Abastecimiento global',
        title: 'Primero los requisitos. Después el abastecimiento.',
        intro:
          'Comenzamos por el producto, la especificación, el volumen y el mercado; después coordinamos el suministro adecuado y la conversación comercial.',
        considerationsTitle: 'Qué definimos antes de abastecer',
        considerations: [
          'Especificación del producto y expectativas de calidad',
          'Volumen, embalaje y mercado de destino',
          'Opciones de origen y capacidad del proveedor',
          'Documentación y condiciones comerciales',
          'Plazos y ruta hacia el acuerdo',
        ],
        ctaTitle: '¿Tiene una necesidad de abastecimiento?',
        ctaText: 'Comparta los detalles y revisaremos la vía adecuada.',
      },
      opportunities: {
        eyebrow: 'Oportunidades de negocio',
        title: 'Alianzas que impulsan el comercio.',
        intro:
          'Construimos relaciones de trabajo con empresas que valoran requisitos claros, comunicación fiable y un enfoque reflexivo del comercio transfronterizo.',
        partnersTitle: 'Con quién trabajamos',
        partnersIntro:
          'Nuestras conversaciones se definen por el papel de cada empresa en la cadena de suministro y el mercado al que sirve.',
        partners: [
          'Importadores y exportadores',
          'Productores y transformadores',
          'Distribuidores y mayoristas',
          'Fabricantes y minoristas',
        ],
        ctaTitle: '¿Busca un socio comercial?',
        ctaText: 'Cuéntenos sobre su empresa y la oportunidad que tiene en mente.',
      },
      story: {
        eyebrow: 'Nuestra historia',
        title: 'La historia detrás de INDIA ALL.',
        intro:
          'De una idea comercial concreta en 2018 a una presencia en tres mercados, nuestra dirección sigue siendo la misma.',
      },
      contact: {
        eyebrow: 'Contacto',
        title: 'Hablemos de sus necesidades comerciales.',
        formHeading: 'Cuéntenos qué desea abastecer.',
        intro:
          'Utilice el formulario para abastecimiento de productos, alianzas con proveedores, conversaciones de distribución o una consulta comercial general.',
      },
      enquiry: {
        eyebrow: 'Consulta empresarial',
        title: 'Cuéntenos qué necesita para avanzar.',
        intro:
          'Utilice este formulario para abastecimiento, suministro a granel, alianzas con proveedores o una consulta comercial general. Nuestro equipo revisa cada envío individualmente.',
      },
      bulkOrder: {
        eyebrow: 'Necesidades a granel',
        title: 'Necesidades a granel personalizadas.',
        intro:
          'Para abastecimiento por volumen, incluya el producto, la especificación, la cantidad y el destino para que podamos revisar la necesidad correctamente.',
      },
    },
    common: {
      loading: 'Cargando…',
      backHome: 'Volver al inicio',
      allProducts: 'Todos los productos',
      discuss: 'Hablemos de sus necesidades',
      catalogue: 'Ver catálogo',
    },
  },

  pt: {
    utility: {
      tagline: 'Abastecimento e comércio internacional',
      presence: 'Índia · Brasil · Canadá',
      signIn: 'Acesso de clientes',
      dashboard: 'Minha conta',
    },
    nav: {
      about: 'Sobre nós',
      products: 'Produtos e commodities',
      sourcing: 'Abastecimento global',
      opportunities: 'Oportunidades de negócio',
      story: 'Nossa história',
      contact: 'Contato',
      cta: 'Vamos conversar sobre suas necessidades',
      menu: 'Abrir menu',
      close: 'Fechar menu',
      productsLabel: 'Explorar categorias',
      viewAll: 'Ver todos os produtos',
      getInTouch: 'Falar com a equipe',
    },
    hero: {
      eyebrow: 'Abastecimento internacional · Comércio de commodities',
      titleTop: 'Conectamos mercados globais.',
      titleBottom: 'Entregamos soluções comerciais confiáveis.',
      description:
        'A INDIA ALL conecta compradores e fornecedores por meio de abastecimento internacional, comércio de commodities e soluções comerciais coordenadas de acordo com as necessidades de cada empresa.',
      primary: 'Explorar produtos',
      secondary: 'Vamos conversar sobre suas necessidades',
      metaLeft: 'Origem · Conexão · Entrega',
      metaRight: 'Fundada em 2018',
      imageAlt: 'Vista aérea de um porto internacional de contêineres com guindastes e contêineres empilhados',
    },
    capabilities: {
      eyebrow: 'Como trabalhamos',
      title: 'Da primeira consulta a um caminho claro.',
      intro:
        'Damos estrutura ao abastecimento internacional: primeiro entendemos a necessidade e depois coordenamos produtos, fornecedores e conversas comerciais.',
      image: '/images/editorial/port.jpg',
      imageAlt: 'Navio porta-contêineres atracado em um porto comercial',
      imageCaption: 'Infraestrutura portuária internacional',
      steps: [
        {
          number: '01',
          title: 'Origem',
          text: 'Identificamos produtos e fornecedores adequados com base nos requisitos do comprador.',
        },
        {
          number: '02',
          title: 'Conexão',
          text: 'Coordenamos compradores, fornecedores e requisitos comerciais entre mercados.',
        },
        {
          number: '03',
          title: 'Entrega',
          text: 'Apoiamos a coordenação de pedidos e os processos comerciais da origem ao destino.',
        },
      ],
      note:
        'Nosso papel é a coordenação comercial. O transporte e a logística são realizados por prestadores de serviços designados.',
    },
    commodities: {
      eyebrow: 'Produtos e commodities',
      title: 'Um portfólio construído em torno de necessidades comerciais reais.',
      intro:
        'Categorias selecionadas para compradores industriais, distribuidores e empresas que precisam de um caminho comercial claro para os produtos que negociam.',
      viewAll: 'Ver o catálogo completo',
      categories: [
        {
          id: 'agriculture',
          name: 'Commodities agrícolas',
          description:
            'Trigo, milho, soja, leguminosas e oleaginosas com requisitos definidos de qualidade e volume.',
          image: '/images/editorial/wheat.jpg',
          alt: 'Espigas de trigo douradas prontas para a colheita',
          href: '/products?category=agriculture',
          linkLabel: 'Ver commodities',
        },
        {
          id: 'metals',
          name: 'Matérias-primas industriais',
          description:
            'Metais, minerais e insumos industriais para necessidades de fabricação, processamento e produção.',
          image: '/images/editorial/steel.jpg',
          alt: 'Bobinas de aço em uma instalação industrial',
          href: '/products?category=metals',
          linkLabel: 'Ver materiais',
        },
        {
          id: 'energy',
          name: 'Commodities energéticas',
          description:
            'Derivados de petróleo, carvão e outras commodities energéticas para aplicações industriais e comerciais.',
          image: '/images/editorial/energy.jpg',
          alt: 'Carvão a granel armazenado em um terminal industrial',
          href: '/products?category=energy',
          linkLabel: 'Ver commodities',
        },
        {
          id: 'food',
          name: 'Alimentos e produtos especiais',
          description:
            'Arroz, açúcar, óleos e ingredientes especiais para atacado, food service e processamento.',
          image: '/images/editorial/food.jpg',
          alt: 'Seleção de especiarias e ingredientes alimentares especiais',
          href: '/products?category=food',
          linkLabel: 'Ver produtos',
        },
        {
          id: 'consumer',
          name: 'Bens de consumo',
          description:
            'Produtos embalados e bens de consumo cotidianos para canais de varejo, atacado e distribuição.',
          image: '/images/editorial/consumer.jpg',
          alt: 'Produtos frescos expostos em um varejista',
          href: '/enquiry?enquiry=consumer-goods',
          linkLabel: 'Solicitar informações',
        },
      ],
    },
    story: {
      eyebrow: 'Nossa história',
      title: 'Unimos continentes. Conectamos oportunidades.',
      lead:
        'A INDIA ALL é uma empresa de comércio internacional construída em torno de uma ideia simples: melhor acesso a produtos de qualidade cria melhores oportunidades entre mercados.',
      p1:
        'Nossa trajetória começou em 2018, com foco em conectar compradores e fornecedores além das fronteiras e tornar as conversas de comércio internacional mais fáceis de conduzir.',
      p2:
        'Em 2021, estabelecemos nossa presença na Índia, no Brasil e no Canadá. Esses três mercados continuam a orientar nossa forma de abastecer, coordenar e construir relações com parceiros.',
      milestones: [
        {
          year: '2018',
          title: 'A trajetória começa',
          text: 'A INDIA ALL é fundada com foco em comércio internacional e melhor acesso a produtos de qualidade.',
        },
        {
          year: '2021',
          title: 'Presença em três mercados',
          text: 'Nossa presença é estabelecida na Índia, no Brasil e no Canadá.',
        },
      ],
      cta: 'Conhecer nossa história',
      primaryImage: '/images/editorial/origin.jpg',
      primaryAlt: 'Um agricultor navega em um barco por uma plantação de dendê',
      primaryCaption: 'Origens e comunidades produtoras',
      secondaryImage: '/images/editorial/field.jpg',
      secondaryAlt: 'Campos agrícolas ao pôr do sol',
      secondaryCaption: 'Cadeias de abastecimento agrícola',
    },
    founder: {
      eyebrow: 'Nosso compromisso',
      title: 'Tornar o comércio global mais simples.',
      lead:
        'O comércio internacional é complexo por natureza. Nosso papel é tornar o caminho entre uma necessidade e um acordo mais claro, transparente e coordenado.',
      p1:
        'Temos o compromisso com práticas comerciais transparentes, relações confiáveis com fornecedores e abastecimento atento à qualidade. Cada conversa começa pela necessidade do comprador, pela especificação do produto e pelo contexto comercial.',
      p2:
        'Ao coordenar informações, documentos e comunicação entre mercados, ajudamos a reduzir atritos no comércio transfronteiriço sem exagerar o que qualquer parte pode controlar sozinha.',
      principles: [
        {
          title: 'Transparência desde o início',
          text: 'Expectativas claras, requisitos documentados e comunicação direta em cada etapa.',
        },
        {
          title: 'Relações duradouras',
          text: 'Relações com fornecedores e compradores baseadas em consistência, não em transações isoladas.',
        },
        {
          title: 'Qualidade no detalhe',
          text: 'Especificações, origens e condições comerciais consideradas antes de qualquer compromisso.',
        },
        {
          title: 'Comércio coordenado',
          text: 'Um único ponto de coordenação entre mercados, fornecedores e necessidades do comprador.',
        },
      ],
      name: 'Pramod Kumar',
      role: 'Fundador, INDIA ALL',
      noteLabel: 'Uma nota do nosso fundador',
    },
    opportunities: {
      eyebrow: 'Oportunidades de negócio',
      title: 'Construa a próxima relação comercial conosco.',
      intro:
        'Trabalhamos com empresas que valorizam requisitos claros, comunicação confiável e uma abordagem criteriosa do comércio internacional.',
      cta: 'Explorar uma parceria',
      image: '/images/editorial/partnership.jpg',
      imageAlt: 'Dois profissionais apertando as mãos após uma reunião',
      imageCaption: 'Relações duradouras, construídas conversa a conversa.',
      items: [
        {
          number: '01',
          title: 'Parcerias de abastecimento',
          text: 'Para produtores, processadores e fornecedores que buscam um caminho criterioso para compradores internacionais e novas relações comerciais.',
          linkLabel: 'Conversar sobre abastecimento',
          href: '/enquiry?enquiry=sourcing-partnership',
        },
        {
          number: '02',
          title: 'Conexões entre compradores e fornecedores',
          text: 'Para compradores que precisam identificar fornecedores adequados, comparar opções e coordenar requisitos entre mercados.',
          linkLabel: 'Iniciar uma conversa',
          href: '/enquiry?enquiry=buyer-supplier',
        },
        {
          number: '03',
          title: 'Distribuição e oportunidades comerciais',
          text: 'Para empresas que exploram representação, distribuição ou oportunidades comerciais conjuntas em nossos mercados ativos.',
          linkLabel: 'Explorar distribuição',
          href: '/enquiry?enquiry=distribution',
        },
      ],
    },
    presence: {
      eyebrow: 'Presença internacional',
      title: 'Três mercados. Uma abordagem coordenada.',
      intro:
        'Desde 2021, a INDIA ALL mantém presença na Índia, no Brasil e no Canadá, conectando mercados complementares e apoiando conversas comerciais entre regiões.',
      established: 'Presença estabelecida em 2021',
      note:
        'A presença refere-se às nossas localidades operacionais nesses mercados. Não representa portos, armazéns ou instalações logísticas próprias.',
      locations: [
        { country: 'Índia', region: 'Ásia do Sul', address: 'Bakhtawarpur, Delhi 110036' },
        { country: 'Brasil', region: 'América do Sul', address: 'Tapes, Rio Grande do Sul 96760-000' },
        { country: 'Canadá', region: 'América do Norte', address: 'Edmonton, Alberta' },
      ],
    },
    contact: {
      eyebrow: 'Inicie uma conversa',
      title: 'Vamos conversar sobre suas necessidades comerciais.',
      intro:
        'Conte-nos o que procura, em qual mercado atua e qual é o contexto comercial. Revisaremos sua consulta e responderemos com os dados fornecidos.',
      emailLabel: 'Consultas empresariais',
      email: 'Info@indiaall.org',
      stepsTitle: 'O que acontece a seguir',
      steps: [
        'Compartilhe suas necessidades de produto, mercado e condições comerciais.',
        'Revisamos os detalhes e identificamos o caminho adequado.',
        'Respondemos diretamente usando as informações de contato fornecidas.',
      ],
      form: {
        name: 'Nome completo',
        company: 'Empresa',
        email: 'E-mail corporativo',
        country: 'País',
        phone: 'Telefone',
        optional: 'Opcional',
        enquiryType: 'Tipo de consulta',
        product: 'Produto ou commodity',
        message: 'Mensagem',
        selectPlaceholder: 'Selecione',
        otherProduct: 'Outro / não listado',
        enquiryTypes: [
          'Abastecimento de produto',
          'Fornecimento a granel',
          'Parceria com fornecedores',
          'Oportunidade de distribuição',
          'Consulta comercial geral',
        ],
        messagePlaceholder:
          'Inclua o produto, a especificação, o volume, o destino e qualquer contexto comercial que ajude a revisar sua necessidade.',
        consent:
          'Concordo que a INDIA ALL trate as informações acima para responder a esta consulta.',
        submit: 'Enviar consulta',
        submitting: 'Enviando consulta…',
      },
      success: {
        title: 'Consulta recebida.',
        text:
          'Obrigado. Seus requisitos foram enviados à nossa equipe. Revisaremos os detalhes e responderemos usando as informações de contato fornecidas.',
        again: 'Enviar outra consulta',
      },
      errors: {
        required: 'Este campo é obrigatório.',
        email: 'Informe um e-mail corporativo válido.',
        consent: 'Confirme seu consentimento antes de enviar.',
        submit: 'Não foi possível enviar sua consulta. Tente novamente ou fale conosco por e-mail.',
      },
      disclaimer:
        'O envio deste formulário não cria um pedido nem um compromisso comercial vinculante.',
    },
    footer: {
      description:
        'Uma empresa de comércio internacional que conecta compradores e fornecedores por meio de abastecimento de commodities, relações com fornecedores e comércio transfronteiriço coordenado.',
      companyTitle: 'Empresa',
      productsTitle: 'Produtos e commodities',
      workTitle: 'Trabalhe conosco',
      presenceTitle: 'Presença',
      links: {
        about: 'Sobre nós',
        story: 'Nossa história',
        sourcing: 'Abastecimento global',
        opportunities: 'Oportunidades de negócio',
        contact: 'Contato',
        catalogue: 'Catálogo de produtos',
        bulk: 'Necessidades a granel',
        enquiry: 'Consulta empresarial',
        sourcingPartnership: 'Parcerias de abastecimento',
        distribution: 'Oportunidades de distribuição',
        signIn: 'Acesso de clientes',
      },
      rights: '© 2026 INDIA ALL. Todos os direitos reservados.',
      photography: 'Fotografias selecionadas do Unsplash.',
      language: 'Idioma',
    },
    pages: {
      about: {
        eyebrow: 'Sobre a INDIA ALL',
        title: 'Comércio baseado em clareza, relações e acompanhamento.',
        intro:
          'Somos uma empresa de comércio internacional que trabalha com compradores e fornecedores nas categorias agrícola, industrial, energética e de bens de consumo.',
      },
      products: {
        eyebrow: 'Produtos e commodities',
        title: 'Um portfólio criterioso para o comércio internacional.',
        intro:
          'Explore os produtos e commodities que discutimos com compradores e fornecedores em diferentes mercados. Cada consulta é revisada conforme sua especificação, volume e destino.',
        note:
          'A disponibilidade é confirmada para cada necessidade. A inclusão em uma categoria não representa estoque disponível.',
      },
      sourcing: {
        eyebrow: 'Abastecimento global',
        title: 'Primeiro os requisitos. Depois o abastecimento.',
        intro:
          'Começamos pelo produto, especificação, volume e mercado; depois coordenamos o fornecimento adequado e a conversa comercial.',
        considerationsTitle: 'O que definimos antes de abastecer',
        considerations: [
          'Especificação do produto e expectativas de qualidade',
          'Volume, embalagem e mercado de destino',
          'Opções de origem e capacidade do fornecedor',
          'Documentação e condições comerciais',
          'Prazos e caminho para o acordo',
        ],
        ctaTitle: 'Tem uma necessidade de abastecimento?',
        ctaText: 'Compartilhe os detalhes e revisaremos o caminho adequado.',
      },
      opportunities: {
        eyebrow: 'Oportunidades de negócio',
        title: 'Parcerias que impulsionam o comércio.',
        intro:
          'Construímos relações de trabalho com empresas que valorizam requisitos claros, comunicação confiável e uma abordagem criteriosa do comércio transfronteiriço.',
        partnersTitle: 'Com quem trabalhamos',
        partnersIntro:
          'Nossas conversas são definidas pelo papel de cada empresa na cadeia de abastecimento e pelo mercado que atende.',
        partners: [
          'Importadores e exportadores',
          'Produtores e processadores',
          'Distribuidores e atacadistas',
          'Fabricantes e varejistas',
        ],
        ctaTitle: 'Procura um parceiro comercial?',
        ctaText: 'Conte-nos sobre sua empresa e a oportunidade que tem em mente.',
      },
      story: {
        eyebrow: 'Nossa história',
        title: 'A história por trás da INDIA ALL.',
        intro:
          'De uma ideia comercial focada em 2018 a uma presença em três mercados, nossa direção permanece a mesma.',
      },
      contact: {
        eyebrow: 'Contato',
        title: 'Vamos conversar sobre suas necessidades comerciais.',
        formHeading: 'Conte-nos o que procura abastecer.',
        intro:
          'Use o formulário para abastecimento de produtos, parcerias com fornecedores, conversas de distribuição ou uma consulta comercial geral.',
      },
      enquiry: {
        eyebrow: 'Consulta empresarial',
        title: 'Conte-nos o que precisa para avançar.',
        intro:
          'Use este formulário para abastecimento, fornecimento a granel, parcerias com fornecedores ou uma consulta comercial geral. Nossa equipe revisa cada envio individualmente.',
      },
      bulkOrder: {
        eyebrow: 'Necessidades a granel',
        title: 'Necessidades a granel personalizadas.',
        intro:
          'Para abastecimento por volume, inclua o produto, a especificação, a quantidade e o destino para que possamos revisar a necessidade corretamente.',
      },
    },
    common: {
      loading: 'Carregando…',
      backHome: 'Voltar ao início',
      allProducts: 'Todos os produtos',
      discuss: 'Vamos conversar sobre suas necessidades',
      catalogue: 'Ver catálogo',
    },
  },
}

export function getSiteContent(lang) {
  return siteContent[lang] || siteContent.en
}
