var DND = {
  razas: [
    {
      nombre: 'Dragonborn',
      subrazas: [],
      bonos: {str:2, cha:1},
      velocidad: 30,
      idiomas: ['Común', 'Dragónico'],
      rasgos: [
        {nombre: 'Ascendencia Dracónica', descripcion: 'Eliges un tipo de dragón. El daño de tu arma de aliento y tu resistencia se determinan por ese tipo.'},
        {nombre: 'Arma de Aliento', descripcion: 'Puedes usar tu acción para exhalar energía destructiva. Tu aliento inflige daño según tu ascendencia en un área (cono de 15 pies o línea de 30 pies). CD = 8 + tu bonificador de Competencia + tu modificador de Constitución. Puedes usarlo una vez por descanso corto o largo.'},
        {nombre: 'Resistencia Dracónica', descripcion: 'Tienes resistencia al tipo de daño asociado a tu ascendencia dracónica.'}
      ]
    },
    {
      nombre: 'Dwarf',
      subrazas: ['Hill Dwarf', 'Mountain Dwarf'],
      bonos: {con:2},
      velocidad: 25,
      idiomas: ['Común', 'Enano'],
      rasgos: [
        {nombre: 'Visión en la Oscuridad', descripcion: 'Puedes ver en luz tenue a 60 pies como si fuera luz brillante, y en oscuridad como si fuera luz tenue.'},
        {nombre: 'Resistencia Enana', descripcion: 'Tienes ventaja en tiradas de salvación contra veneno y resistencia al daño por veneno.'},
        {nombre: 'Entrenamiento de Combate Enano', descripcion: 'Tienes competencia con hachas de batalla, hachas de mano, martillos de guerra y martillos ligeros.'},
        {nombre: 'Competencia con Herramientas', descripcion: 'Tienes competencia con herramientas de artesano a tu elección: herramientas de herrero, suministros de cervecero o herramientas de albañil.'},
        {nombre: 'Conocimiento de Piedra', descripcion: 'Siempre que hagas una prueba de Inteligencia (Historia) relacionada con el origen de un trabajo de piedra, eres considerado competente y puedes duplicar tu bonificador de competencia.'}
      ]
    },
    {
      nombre: 'Elf',
      subrazas: ['High Elf', 'Wood Elf', 'Dark Elf (Drow)'],
      bonos: {dex:2},
      velocidad: 30,
      idiomas: ['Común', 'Élfico'],
      rasgos: [
        {nombre: 'Visión en la Oscuridad', descripcion: 'Puedes ver en luz tenue a 60 pies como si fuera luz brillante, y en oscuridad como si fuera luz tenue.'},
        {nombre: 'Ascendencia Feérica', descripcion: 'Tienes ventaja en tiradas de salvación contra ser hechizado y la magia no puede ponerte a dormir.'},
        {nombre: 'Trance', descripcion: 'Los elfos no duermen. En lugar de dormir, entran en un trance profundo durante 4 horas. Descansas como si hubieras dormido 8 horas.'},
        {nombre: 'Percepción Aguda', descripcion: 'Tienes competencia en la habilidad de Percepción.'}
      ]
    },
    {
      nombre: 'Gnome',
      subrazas: ['Forest Gnome', 'Rock Gnome'],
      bonos: {int:2},
      velocidad: 25,
      idiomas: ['Común', 'Gnómico'],
      rasgos: [
        {nombre: 'Visión en la Oscuridad', descripcion: 'Puedes ver en luz tenue a 60 pies como si fuera luz brillante, y en oscuridad como si fuera luz tenue.'},
        {nombre: 'Astucia Gnómica', descripcion: 'Tienes ventaja en tiradas de salvación de Inteligencia, Sabiduría y Carisma contra magia.'}
      ]
    },
    {
      nombre: 'Half-Elf',
      subrazas: [],
      bonos: {cha:2},
      bonos_eleccion: 2,
      velocidad: 30,
      idiomas: ['Común', 'Élfico'],
      rasgos: [
        {nombre: 'Visión en la Oscuridad', descripcion: 'Puedes ver en luz tenue a 60 pies como si fuera luz brillante, y en oscuridad como si fuera luz tenue.'},
        {nombre: 'Ascendencia Feérica', descripcion: 'Tienes ventaja en tiradas de salvación contra ser hechizado y la magia no puede ponerte a dormir.'},
        {nombre: 'Versatilidad en Habilidades', descripcion: 'Obtienes competencia en dos habilidades a tu elección.'}
      ]
    },
    {
      nombre: 'Half-Orc',
      subrazas: [],
      bonos: {str:2, con:1},
      velocidad: 30,
      idiomas: ['Común', 'Orco'],
      rasgos: [
        {nombre: 'Visión en la Oscuridad', descripcion: 'Puedes ver en luz tenue a 60 pies como si fuera luz brillante, y en oscuridad como si fuera luz tenue.'},
        {nombre: 'Aguante Incansable', descripcion: 'Cuando recibes daño que reduce tus puntos de golpe a 0 pero no te mata directamente, puedes reducir ese daño a 1. No puedes usar este rasgo de nuevo hasta que completes un descanso largo.'},
        {nombre: 'Ataques Salvajes', descripcion: 'Cuando obtienes un golpe crítico con un ataque de arma cuerpo a cuerpo, puedes tirar uno de los dados de daño del arma adicionalmente y añadirlo al daño extra del crítico.'},
        {nombre: 'Intimidación Poderosa', descripcion: 'Tienes competencia en la habilidad de Intimidación.'}
      ]
    },
    {
      nombre: 'Halfling',
      subrazas: ['Lightfoot Halfling', 'Stout Halfling'],
      bonos: {dex:2},
      velocidad: 25,
      idiomas: ['Común', 'Mediano'],
      rasgos: [
        {nombre: 'Afortunado', descripcion: 'Cuando obtienes un 1 natural en una tirada de ataque, prueba de habilidad o tirada de salvación, puedes volver a tirar el dado y debes usar el nuevo resultado.'},
        {nombre: 'Valiente', descripcion: 'Tienes ventaja en tiradas de salvación contra ser asustado.'},
        {nombre: 'Sigilo Natural', descripcion: 'Puedes intentar esconderte incluso cuando solo estés oculto por una criatura que sea al menos un tamaño más grande que tú.'}
      ]
    },
    {
      nombre: 'Human',
      subrazas: ['Human', 'Variant Human'],
      bonos: {str:1, dex:1, con:1, int:1, wis:1, cha:1},
      velocidad: 30,
      idiomas: ['Común'],
      rasgos_extra: [
        {nombre: 'Idioma Adicional', descripcion: 'Puedes hablar, leer y escribir un idioma adicional a tu elección.'}
      ]
    },
    {
      nombre: 'Tiefling',
      subrazas: [],
      bonos: {cha:2, int:1},
      velocidad: 30,
      idiomas: ['Común', 'Infernal'],
      rasgos: [
        {nombre: 'Visión en la Oscuridad', descripcion: 'Puedes ver en luz tenue a 60 pies como si fuera luz brillante, y en oscuridad como si fuera luz tenue.'},
        {nombre: 'Resistencia Infernal', descripcion: 'Tienes resistencia al daño por fuego.'},
        {nombre: 'Legado Infernal', descripcion: 'Conoces el truco Taumaturgia. Cuando alcanzas el nivel 3, puedes lanzar el hechizo Reprensión Infernal como un hechizo de nivel 2 una vez por descanso largo. Cuando alcanzas el nivel 5, puedes lanzar el hechizo Oscuridad una vez por descanso largo. El Carisma es tu habilidad para lanzar estos hechizos.'}
      ]
    }
  ],
  subrazas: [
    {nombre: 'Hill Dwarf', raza: 'Dwarf', bonos: {wis:1, con:0}, rasgos: [{nombre: 'Tenacidad Enana', descripcion: 'Tu máximo de puntos de golpe aumenta en 1 y aumenta en 1 adicional cada vez que ganas un nivel.'}]},
    {nombre: 'Mountain Dwarf', raza: 'Dwarf', bonos: {str:2}, rasgos: [{nombre: 'Entrenamiento en Armadura Enana', descripcion: 'Tienes competencia con armaduras ligeras y medias.'}]},
    {nombre: 'High Elf', raza: 'Elf', bonos: {int:1}, rasgos: [{nombre: 'Entrenamiento Élfico con Armas', descripcion: 'Tienes competencia con espadas largas, espadas cortas, arcos cortos y arcos largos.'}, {nombre: 'Truco', descripcion: 'Conoces un truco a tu elección de la lista de hechizos de mago. La Inteligencia es tu habilidad para lanzarlo.'}, {nombre: 'Idioma Adicional', descripcion: 'Puedes hablar, leer y escribir un idioma adicional a tu elección.'}]},
    {nombre: 'Wood Elf', raza: 'Elf', bonos: {wis:1}, rasgos: [{nombre: 'Entrenamiento Élfico con Armas', descripcion: 'Tienes competencia con espadas largas, espadas cortas, arcos cortos y arcos largos.'}, {nombre: 'Paso Rápido', descripcion: 'Tu velocidad de caminata aumenta a 35 pies.'}, {nombre: 'Máscara Salvaje', descripcion: 'Puedes intentar esconderte incluso cuando solo estés ligeramente oscurecido por follaje, lluvia, nieve, niebla u otro fenómeno natural.'}]},
    {nombre: 'Dark Elf (Drow)', raza: 'Elf', bonos: {cha:1}, rasgos: [{nombre: 'Entrenamiento Drow con Armas', descripcion: 'Tienes competencia con espadas cortas, estoques y ballestas de mano.'}, {nombre: 'Vista Superior en la Oscuridad', descripcion: 'Tu visión en la oscuridad se extiende a 120 pies.'}, {nombre: 'Sensibilidad a la Luz Solar', descripcion: 'Tienes desventaja en tiradas de ataque y pruebas de Sabiduría (Percepción) relacionadas con la vista cuando tú, tu objetivo o lo que intentas percibir está bajo luz solar directa.'}, {nombre: 'Magia Drow', descripcion: 'Conoces el truco Luces Danzantes. Cuando alcanzas el nivel 3, puedes lanzar Hechizar Persona una vez por descanso largo. Cuando alcanzas el nivel 5, puedes lanzar Oscuridad una vez por descanso largo. El Carisma es tu habilidad para lanzarlos.'}]},
    {nombre: 'Forest Gnome', raza: 'Gnome', bonos: {dex:1}, rasgos: [{nombre: 'Ilusionista Menor', descripcion: 'Conoces el truco Ilusión Menor. La Inteligencia es tu habilidad para lanzarlo.'}, {nombre: 'Hablar con Bestias Menores', descripcion: 'Puedes comunicar ideas simples a bestias pequeñas o más pequeñas.'}]},
    {nombre: 'Rock Gnome', raza: 'Gnome', bonos: {con:1}, rasgos: [{nombre: 'Conocimiento de Artesano', descripcion: 'Siempre que hagas una prueba de Inteligencia (Historia) relacionada con un objeto mágico, alquímico o tecnológico, puedes duplicar tu bonificador de competencia.'}, {nombre: 'Inventor', descripcion: 'Tienes competencia con herramientas de artesano. Puedes pasar 1 hora y 10 gp para construir un artefacto mecánico pequeño: ingenio de cuerda, mechero, molinillo de música, juguete de cuerda, o reloj autolimpiante.'}]},
    {nombre: 'Lightfoot Halfling', raza: 'Halfling', bonos: {cha:1}, rasgos: [{nombre: 'Sigilo Natural', descripcion: 'Puedes intentar esconderte incluso cuando solo estés oculto por una criatura que sea al menos un tamaño más grande que tú.'}]},
    {nombre: 'Stout Halfling', raza: 'Halfling', bonos: {con:1}, rasgos: [{nombre: 'Resistencia Fuerte', descripcion: 'Tienes ventaja en tiradas de salvación contra veneno y resistencia al daño por veneno.'}]},
    {nombre: 'Human', raza: 'Human', bonos: {str:1, dex:1, con:1, int:1, wis:1, cha:1}, rasgos: []},
    {nombre: 'Variant Human', raza: 'Human', bonos: {str:1, dex:1, con:1, int:1, wis:1, cha:1}, rasgos: [{nombre: 'Dote', descripcion: 'Obtienes una dote a tu elección.'}, {nombre: 'Competencia en Habilidad', descripcion: 'Obtienes competencia en una habilidad a tu elección.'}]}
  ],
  clases: [
    {
      nombre: 'Barbarian',
      dado_golpe: 'd12',
      competencias: {
        armaduras: ['Armadura ligera', 'Armadura media', 'Escudos'],
        armas: ['Armas simples', 'Armas marciales'],
        salvaciones: ['Fuerza', 'Constitución'],
        habilidades: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
        habilidades_elige: 2
      },
      equipo: ['Un hacha de batalla o cualquier arma marcial cuerpo a cuerpo', 'Dos hachas de mano o cualquier arma simple', 'Un equipo de explorador y cuatro jabalinas'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Ira', descripcion: 'En tu turno, puedes entrar en ira como acción bonus. Mientras estés en ira, ganas ventaja en pruebas de Fuerza y tiradas de salvación de Fuerza, bonificador de daño cuerpo a cuerpo igual a tu bonificador de Competencia, resistencia a daño contundente, perforante y cortante, y no puedes lanzar hechizos ni concentrarte. Dura 1 minuto o hasta que termines como acción bonus, caigas inconsciente o no ataques o recibas daño en un turno. Tienes 2 usos por nivel 1, aumentan a 3 en nivel 3, 4 en nivel 6, 5 en nivel 12, 6 en nivel 17. Recuperas todos los usos en un descanso largo.'},
          {nombre: 'Defensa Sin Armadura', descripcion: 'Mientras no lleves armadura, tu CA es igual a 10 + tu modificador de Destreza + tu modificador de Constitución.'}
        ],
        2: [
          {nombre: 'Ataque Temerario', descripcion: 'Puedes realizar un ataque cuerpo a cuerpo con ventaja. Hasta tu próximo turno, todos los ataques contra ti tienen ventaja.'},
          {nombre: 'Sentido del Peligro', descripcion: 'Tienes ventaja en tiradas de salvación de Destreza contra efectos que puedas ver, como trampas y hechizos.'}
        ],
        3: [
          {nombre: 'Camino Primitivo', descripcion: 'Eliges un camino primitivo. Otorga rasgos en niveles 3, 6, 10 y 14.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1. No puedes exceder 20.'}],
        5: [
          {nombre: 'Ataque Extra', descripcion: 'Puedes atacar dos veces en lugar de una cuando realizas la acción de Atacar en tu turno.'},
          {nombre: 'Movimiento Rápido', descripcion: 'Tu velocidad aumenta en 10 pies mientras no lleves armadura pesada.'}
        ],
        6: [{nombre: 'Rasgo de Camino', descripcion: 'Obtienes un rasgo de tu camino primitivo.'}],
        7: [
          {nombre: 'Instinto Salvaje', descripcion: 'Tienes ventaja en tiradas de iniciativa. Además, si eres sorprendido al inicio del combate, puedes actuar normalmente en tu primer turno si entras en ira.'}
        ],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [
          {nombre: 'Crítico Brutal', descripcion: 'Tiras un dado de daño adicional al determinar el daño extra de un golpe crítico con un ataque cuerpo a cuerpo.'}
        ],
        10: [
          {nombre: 'Rasgo de Camino', descripcion: 'Obtienes un rasgo de tu camino primitivo.'},
          {nombre: 'Resistencia Totémica', descripcion: 'Obtienes resistencia a un tipo de daño adicional.'}
        ],
        11: [
          {nombre: 'Ira Implacable', descripcion: 'Mientras estás en ira, no puedes morir por fallar tiradas de salvación de muerte si tienes 0 puntos de golpe. Sigues haciendo tiradas de salvación de muerte y recibes daño normalmente.'}
        ],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [
          {nombre: 'Crítico Brutal', descripcion: 'Tiras dos dados de daño adicional al determinar el daño extra de un golpe crítico.'}
        ],
        14: [{nombre: 'Rasgo de Camino', descripcion: 'Obtienes un rasgo de tu camino primitivo.'}],
        15: [
          {nombre: 'Ira Persistente', descripcion: 'Tu ira solo termina si caes inconsciente o eliges terminarla como acción bonus.'}
        ],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Crítico Brutal', descripcion: 'Tiras tres dados de daño adicional al determinar el daño extra de un golpe crítico.'}
        ],
        18: [
          {nombre: 'Poderío Indomable', descripcion: 'Si tu total de una prueba de Fuerza es menor que tu puntuación de Fuerza, puedes usar ese número en su lugar.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Campeón Primitivo', descripcion: 'Tu máximo de Fuerza y Constitución aumentan en 4 y tu máximo aumenta a 24.'}
        ]
      }
    },
    {
      nombre: 'Bard',
      dado_golpe: 'd8',
      spellSlots: [
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,1],
        [4,3,3,3,3,1,1,1,1],
        [4,3,3,3,3,2,1,1,1],
        [4,3,3,3,3,2,2,1,1],
      ],
      competencias: {
        armaduras: ['Armadura ligera'],
        armas: ['Armas simples', 'Ballesta de mano', 'Espada larga', 'Estoque', 'Espada corta'],
        salvaciones: ['Destreza', 'Carisma'],
        habilidades: ['Cualquier'],
        habilidades_elige: 3
      },
      equipo: ['Un estoque o una espada larga o cualquier arma simple', 'Un equipo de diplomático o un equipo de entretenido', 'Un laúd u otro instrumento musical', 'Armadura de cuero y una daga'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de la lista de bardos. Conoces dos trucos y cuatro hechizos de nivel 1. El Carisma es tu habilidad de lanzamiento de conjuros.'},
          {nombre: 'Inspiración de Bardo', descripcion: 'Como acción bonus, puedes inspirar a una criatura a 60 pies. Gana un dado de Inspiración de Bardo (d6) que puede añadir a una prueba de habilidad, tirada de ataque o salvación. Dura 10 minutos. Tienes tantos usos como tu modificador de Carisma (mínimo 1). Los usos se recuperan en un descanso largo. El dado aumenta a d8 en nivel 5, d10 en nivel 10, d12 en nivel 15.'}
        ],
        2: [
          {nombre: 'Canción de Descanso', descripcion: 'Durante un descanso corto, si tú o cualquier aliado que pueda escucharte gasta Dados de Golpe para recuperar puntos de golpe, recupera puntos de golpe adicionales iguales a tu dado de Inspiración de Bardo.'},
          {nombre: 'Versatilidad Experta', descripcion: 'Eliges dos competencias de habilidad o una competencia de habilidad y competencia con herramientas. Tu bonificador de competencia se duplica para cualquier prueba que uses esas competencias.'}
        ],
        3: [
          {nombre: 'Colegio de Bardos', descripcion: 'Eliges un colegio de bardos. Otorga rasgos en niveles 3, 6 y 14.'},
          {nombre: 'Experto', descripcion: 'Eliges dos competencias de habilidad más y tu bonificador de competencia se duplica para cualquier prueba que las use.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [
          {nombre: 'Inspiración de Bardo (d8)', descripcion: 'Tu dado de Inspiración de Bardo pasa a ser d8.'},
          {nombre: 'Fuente de Inspiración', descripcion: 'Recuperas todos tus usos de Inspiración de Bardo en un descanso corto o largo.'}
        ],
        6: [
          {nombre: 'Contrahechizo', descripcion: 'Puedes usar tu reacción para intentar interrumpir un hechizo cuando una criatura a 60 pies lo lanza. Haz una prueba de Carisma CD 10 + nivel del hechizo. En éxito, el hechizo falla.'},
          {nombre: 'Rasgo de Colegio', descripcion: 'Obtienes un rasgo de tu colegio de bardos.'}
        ],
        7: [{nombre: 'Conocimiento de Colegio', descripcion: 'Puedes añadir la mitad de tu bonificador de competencia a cualquier prueba de habilidad que no incluya tu bonificador de competencia.'}],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [{nombre: 'Canción de Descanso (d10)', descripcion: 'Los puntos de golpe adicionales de tu Canción de Descanso pasan a ser d10.'}],
        10: [
          {nombre: 'Inspiración de Bardo (d10)', descripcion: 'Tu dado de Inspiración de Bardo pasa a ser d10.'},
          {nombre: 'Secretos Mágicos', descripcion: 'Aprendes dos hechizos de cualquier clase de nivel 3 o menor. Son hechizos de bardo para ti.'}
        ],
        11: [{nombre: 'Conocimiento de Colegio', descripcion: 'Puedes añadir la mitad de tu bonificador de competencia a cualquier prueba de habilidad que no incluya tu bonificador de competencia.'}],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Canción de Descanso (d12)', descripcion: 'Los puntos de golpe adicionales de tu Canción de Descanso pasan a ser d12.'}],
        14: [
          {nombre: 'Inspiración de Bardo (d12)', descripcion: 'Tu dado de Inspiración de Bardo pasa a ser d12.'},
          {nombre: 'Rasgo de Colegio', descripcion: 'Obtienes un rasgo de tu colegio de bardos.'},
          {nombre: 'Secretos Mágicos', descripcion: 'Aprendes dos hechizos de cualquier clase de nivel 5 o menor.'}
        ],
        15: [{nombre: 'Conocimiento de Colegio', descripcion: 'Puedes añadir la mitad de tu bonificador de competencia a cualquier prueba de habilidad que no incluya tu bonificador de competencia.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [{nombre: 'Canción de Descanso (d12)', descripcion: 'Los puntos de golpe adicionales de tu Canción de Descanso usan d12.'}],
        18: [{nombre: 'Secretos Mágicos', descripcion: 'Aprendes dos hechizos de cualquier clase de nivel 7 o menor.'}],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Inspiración Superior', descripcion: 'Cuando realizas una tirada de iniciativa y no te quedan usos de Inspiración de Bardo, recuperas un uso.'}
        ]
      }
    },
    {
      nombre: 'Cleric',
      dado_golpe: 'd8',
      spellSlots: [
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,1],
        [4,3,3,3,3,1,1,1,1],
        [4,3,3,3,3,2,1,1,1],
        [4,3,3,3,3,2,2,1,1],
      ],
      competencias: {
        armaduras: ['Armadura ligera', 'Armadura media', 'Escudos'],
        armas: ['Armas simples'],
        salvaciones: ['Sabiduría', 'Carisma'],
        habilidades: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
        habilidades_elige: 2
      },
      equipo: ['Una maza o un martillo de guerra', 'Armadura de escamas, armadura de cuero o cota de mallas', 'Un escudo o un arma simple', 'Un emblema sagrado', 'Un equipo de sacerdote'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de clérigo. Conoces tres trucos y preparas un número de hechizos igual a tu modificador de Sabiduría + tu nivel de clérigo. La Sabiduría es tu habilidad de lanzamiento de conjuros.'},
          {nombre: 'Dominio Divino', descripcion: 'Eliges un dominio divino que otorga hechizos de dominio y rasgos en niveles 1, 2, 6, 8 y 17.'}
        ],
        2: [
          {nombre: 'Canalizar Divinidad', descripcion: 'Puedes canalizar energía divina. Obtienes un uso por descanso corto o largo. Los usos aumentan en nivel 6 y 18.'},
          {nombre: 'Rasgo de Dominio', descripcion: 'Obtienes un rasgo de tu dominio.'}
        ],
        3: [{nombre: 'Hechizos de Nivel 2', descripcion: 'Puedes lanzar hechizos de nivel 2.'}],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [{nombre: 'Destruir No Muertos (CD)', descripcion: 'Los no muertos con CR menor o igual a la mitad de tu nivel de clérigo son destruidos si fallan su salvación.'}],
        6: [
          {nombre: 'Canalizar Divinidad (2 usos)', descripcion: 'Ahora tienes dos usos de Canalizar Divinidad entre descansos.'},
          {nombre: 'Rasgo de Dominio', descripcion: 'Obtienes un rasgo de tu dominio.'}
        ],
        7: [{nombre: 'Hechizos de Nivel 4', descripcion: 'Puedes lanzar hechizos de nivel 4.'}],
        8: [
          {nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'},
          {nombre: 'Rasgo de Dominio', descripcion: 'Obtienes un rasgo de tu dominio.'},
          {nombre: 'Destruir No Muertos', descripcion: 'Aumenta el CR de no muertos que puedes destruir.'}
        ],
        9: [{nombre: 'Hechizos de Nivel 5', descripcion: 'Puedes lanzar hechizos de nivel 5.'}],
        10: [{nombre: 'Intervención Divina', descripcion: 'Puedes pedir la intervención de tu deidad. Tira un porcentaje: 10 o menos tiene éxito. Al nivel 20 tiene éxito automático.'}],
        11: [{nombre: 'Hechizos de Nivel 6', descripcion: 'Puedes lanzar hechizos de nivel 6.'}],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Hechizos de Nivel 7', descripcion: 'Puedes lanzar hechizos de nivel 7.'}],
        14: [{nombre: 'Rasgo de Dominio', descripcion: 'Obtienes un rasgo de tu dominio.'}],
        15: [{nombre: 'Hechizos de Nivel 8', descripcion: 'Puedes lanzar hechizos de nivel 8.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Hechizos de Nivel 9', descripcion: 'Puedes lanzar hechizos de nivel 9.'},
          {nombre: 'Rasgo de Dominio', descripcion: 'Obtienes un rasgo de tu dominio.'}
        ],
        18: [{nombre: 'Canalizar Divinidad (3 usos)', descripcion: 'Ahora tienes tres usos de Canalizar Divinidad entre descansos.'}],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [{nombre: 'Intervención Divina (Automática)', descripcion: 'Tu petición de intervención divina tiene éxito automáticamente. Puedes usar este rasgo de nuevo después de 2d4 días.'}]
      }
    },
    {
      nombre: 'Druid',
      dado_golpe: 'd8',
      spellSlots: [
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,1],
        [4,3,3,3,3,1,1,1,1],
        [4,3,3,3,3,2,1,1,1],
        [4,3,3,3,3,2,2,1,1],
      ],
      competencias: {
        armaduras: ['Armadura ligera', 'Armadura media', 'Escudos'],
        armas: ['Clavas', 'Dagas', 'Dardos', 'Jabalinas', 'Mazas', 'Bastones', 'Cimitarras', 'Hoces', 'Hondas', 'Lanzas'],
        salvaciones: ['Inteligencia', 'Sabiduría'],
        habilidades: ['Animal Handling', 'Arcana', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
        habilidades_elige: 2
      },
      equipo: ['Un escudo de madera o cualquier arma simple', 'Una cimitarra o cualquier arma cuerpo a cuerpo simple', 'Una armadura de cuero o una cota de anillas', 'Un equipo de explorador', 'Un foco druídico'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de druida. Conoces dos trucos y preparas un número de hechizos igual a tu modificador de Sabiduría + tu nivel de druida. La Sabiduría es tu habilidad de lanzamiento.'},
          {nombre: 'Druídico', descripcion: 'Conoces el idioma secreto de los druidas.'}
        ],
        2: [
          {nombre: 'Forma Salvaje', descripcion: 'Puedes usar tu acción para transformarte en una bestia que hayas visto. Se aplican reglas según el CR. 2 usos por descanso corto/largo. Dura horas igual a la mitad de tu nivel de druida.'}
        ],
        3: [{nombre: 'Círculo Druídico', descripcion: 'Eliges un círculo druídico. Otorga rasgos en niveles 2, 3, 6, 10 y 14.'}],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [{nombre: 'Hechizos de Nivel 3', descripcion: 'Puedes lanzar hechizos de nivel 3.'}],
        6: [{nombre: 'Rasgo de Círculo', descripcion: 'Obtienes un rasgo de tu círculo druídico.'}],
        7: [{nombre: 'Hechizos de Nivel 4', descripcion: 'Puedes lanzar hechizos de nivel 4.'}],
        8: [
          {nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'},
          {nombre: 'Forma Salvaje Mejorada', descripcion: 'Puedes transformarte en bestias de CR 1.'}
        ],
        9: [{nombre: 'Hechizos de Nivel 5', descripcion: 'Puedes lanzar hechizos de nivel 5.'}],
        10: [
          {nombre: 'Rasgo de Círculo', descripcion: 'Obtienes un rasgo de tu círculo druídico.'}
        ],
        11: [{nombre: 'Hechizos de Nivel 6', descripcion: 'Puedes lanzar hechizos de nivel 6.'}],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Hechizos de Nivel 7', descripcion: 'Puedes lanzar hechizos de nivel 7.'}],
        14: [
          {nombre: 'Rasgo de Círculo', descripcion: 'Obtienes un rasgo de tu círculo druídico.'}
        ],
        15: [{nombre: 'Hechizos de Nivel 8', descripcion: 'Puedes lanzar hechizos de nivel 8.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [{nombre: 'Hechizos de Nivel 9', descripcion: 'Puedes lanzar hechizos de nivel 9.'}],
        18: [
          {nombre: 'Cuerpo Etéreo', descripcion: 'Puedes lanzar el hechizo de Caminar Etéreo sobre ti mismo sin gastar espacio de hechizo.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [{nombre: 'Arconte Druídico', descripcion: 'Puedes usar Forma Salvaje un número ilimitado de veces. Puedes ignorar componentes verbales y somáticos al lanzar hechizos.'}]
      }
    },
    {
      nombre: 'Fighter',
      dado_golpe: 'd10',
      competencias: {
        armaduras: ['Todas las armaduras', 'Escudos'],
        armas: ['Armas simples', 'Armas marciales'],
        salvaciones: ['Fuerza', 'Constitución'],
        habilidades: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
        habilidades_elige: 2
      },
      equipo: ['Una cota de mallas o una armadura de cuero, arco largo y 20 flechas', 'Un arma marcial y un escudo o dos armas marciales', 'Un arma simple y un equipo de mazmorra'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Estilo de Combate', descripcion: 'Eliges un estilo de combate que otorga un bonificador especial a tus ataques.'},
          {nombre: 'Segundo Aliento', descripcion: 'En tu turno, puedes usar una acción bonus para recuperar 1d10 + tu nivel de guerrero puntos de golpe. Puedes usarlo una vez por descanso corto o largo.'}
        ],
        2: [
          {nombre: 'Impulso Marcial', descripcion: 'Puedes tener un uso adicional de Impulso Marcial. Recuperas todos los usos al terminar un descanso corto o largo.'}
        ],
        3: [
          {nombre: 'Arquetipo Marcial', descripcion: 'Eliges un arquetipo marcial. Otorga rasgos en niveles 3, 7, 10, 15 y 18.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [
          {nombre: 'Ataque Extra', descripcion: 'Puedes atacar dos veces en lugar de una cuando realizas la acción de Atacar.'}
        ],
        6: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        7: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo marcial.'}],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [{nombre: 'Indomable', descripcion: 'Puedes repetir una tirada de salvación fallida una vez por descanso largo. Se usa más veces en niveles 13 y 17.'}],
        10: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo marcial.'}],
        11: [
          {nombre: 'Ataque Extra (2)', descripcion: 'Puedes atacar tres veces en lugar de una cuando realizas la acción de Atacar.'}
        ],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Indomable (2 usos)', descripcion: 'Puedes usar Indomable dos veces entre descansos largos.'}],
        14: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        15: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo marcial.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Indomable (3 usos)', descripcion: 'Puedes usar Indomable tres veces entre descansos largos.'},
          {nombre: 'Impulso Marcial (2 usos)', descripcion: 'Tienes dos usos de Impulso Marcial.'}
        ],
        18: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo marcial.'}],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Ataque Extra (3)', descripcion: 'Puedes atacar cuatro veces en lugar de una cuando realizas la acción de Atacar.'}
        ]
      }
    },
    {
      nombre: 'Monk',
      dado_golpe: 'd8',
      competencias: {
        armaduras: ['Ninguna'],
        armas: ['Armas simples', 'Espadas cortas'],
        salvaciones: ['Fuerza', 'Destreza'],
        habilidades: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
        habilidades_elige: 2
      },
      equipo: ['Una espada corta o cualquier arma simple', 'Un equipo de mazmorra o un equipo de explorador', '10 dardos'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Defensa Sin Armadura', descripcion: 'Mientras no lleves armadura ni escudo, tu CA es igual a 10 + tu modificador de Destreza + tu modificador de Sabiduría.'},
          {nombre: 'Art Marcial', descripcion: 'Puedes usar Destreza en lugar de Fuerza para ataques desarmados y armas de monje. Tu dado de daño marcial es d4. Puedes hacer un ataque desarmado como acción bonus después de la acción de Atacar.'}
        ],
        2: [
          {nombre: 'Puntos de Ki', descripcion: 'Tienes un número de puntos de Ki igual a tu nivel de monje. Se recuperan en un descanso corto o largo. Puedes usar tu acción bonus para gastar 1 punto de Ki y hacer dos ataques desarmados.'},
          {nombre: 'Movimiento Sin Armadura', descripcion: 'Tu velocidad aumenta en 10 pies mientras no lleves armadura ni escudo.'}
        ],
        3: [
          {nombre: 'Tradición Monástica', descripcion: 'Eliges una tradición monástica. Otorga rasgos en niveles 3, 6, 11 y 17.'},
          {nombre: 'Desviar Proyectiles', descripcion: 'Puedes usar tu reacción para reducir el daño de un proyectil en 1d10 + tu nivel de monje + tu modificador de Destreza. Si reduces a 0, puedes gastar 1 punto de Ki para devolverlo.'}
        ],
        4: [
          {nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'},
          {nombre: 'Caída de Hoja', descripcion: 'Ignoras daño por caída hasta 5 veces tu nivel de monje.'}
        ],
        5: [
          {nombre: 'Ataque Extra', descripcion: 'Puedes atacar dos veces en lugar de una.'},
          {nombre: 'Golpe Aturdidor', descripcion: 'Gasta 1 punto de Ki al golpear con un ataque cuerpo a cuerpo para forzar una salvación de Constitución o quedar aturdido hasta el final de tu próximo turno.'},
          {nombre: 'Dado de Art Marcial (d6)', descripcion: 'Tu dado de daño marcial aumenta a d6.'}
        ],
        6: [
          {nombre: 'Rasgo de Tradición', descripcion: 'Obtienes un rasgo de tu tradición.'},
          {nombre: 'Golpes Potenciados con Ki', descripcion: 'Tus ataques desarmados cuentan como mágicos para superar resistencias e inmunidades.'}
        ],
        7: [
          {nombre: 'Evasión', descripcion: 'Si estás sujeto a un efecto que permite una salvación de Destreza para la mitad del daño, no recibes daño si tienes éxito y la mitad si fallas.'},
          {nombre: 'Quietud Mental', descripcion: 'Tienes ventaja en tiradas de salvación contra ser hechizado o asustado.'}
        ],
        8: [
          {nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}
        ],
        9: [
          {nombre: 'Movimiento Sin Armadura (15 pies)', descripcion: 'Tu velocidad aumenta en 15 pies en lugar de 10.'}
        ],
        10: [
          {nombre: 'Pureza Corporal', descripcion: 'Eres inmune a enfermedades y veneno.'}
        ],
        11: [
          {nombre: 'Dado de Art Marcial (d8)', descripcion: 'Tu dado de daño marcial aumenta a d8.'},
          {nombre: 'Rasgo de Tradición', descripcion: 'Obtienes un rasgo de tu tradición.'}
        ],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Idioma del Sol y la Luna', descripcion: 'Puedes entender y ser entendido por cualquier ser vivo.'}],
        14: [{nombre: 'Alma de Diamante', descripcion: 'Tienes competencia en todas las tiradas de salvación. Puedes gastar 1 punto de Ki para repetir una salvación fallida.'}],
        15: [{nombre: 'Cuerpo Atemporal', descripcion: 'No sufres los efectos del envejecimiento ni puedes ser envejecido mágicamente.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Rasgo de Tradición', descripcion: 'Obtienes un rasgo de tu tradición.'},
          {nombre: 'Dado de Art Marcial (d10)', descripcion: 'Tu dado de daño marcial aumenta a d10.'}
        ],
        18: [
          {nombre: 'Movimiento Sin Armadura (30 pies)', descripcion: 'Tu velocidad aumenta en 30 pies en lugar de 10.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Autoperfección', descripcion: 'Si tienes 0 puntos de Ki al inicio de tu turno, ganas 4 puntos de Ki.'}
        ]
      }
    },
    {
      nombre: 'Paladin',
      dado_golpe: 'd10',
      spellSlots: [
        [0,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
      ],
      competencias: {
        armaduras: ['Todas las armaduras', 'Escudos'],
        armas: ['Armas simples', 'Armas marciales'],
        salvaciones: ['Sabiduría', 'Carisma'],
        habilidades: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
        habilidades_elige: 2
      },
      equipo: ['Un arma marcial y un escudo o dos armas marciales', 'Cinco jabalinas', 'Un equipo de sacerdote o un equipo de explorador', 'Una cota de mallas y un emblema sagrado'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Sentido Divino', descripcion: 'Como acción, puedes detectar celestiales, infernales o no muertos a 60 pies. Dura hasta el final de tu próximo turno.'},
          {nombre: 'Imposición de Manos', descripcion: 'Tienes una reserva de curación de 5 x tu nivel de paladín. Como acción, puedes curar a una criatura que tocas. También puedes gastar 5 puntos para curar una enfermedad o veneno.'}
        ],
        2: [
          {nombre: 'Estilo de Combate', descripcion: 'Eliges un estilo de combate.'},
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de paladín. Preparas un número de hechizos igual a tu modificador de Carisma + la mitad de tu nivel de paladín (mínimo 1). El Carisma es tu habilidad de lanzamiento.'}
        ],
        3: [
          {nombre: 'Salud Divina', descripcion: 'Eres inmune a enfermedades.'},
          {nombre: 'Juramento Divino', descripcion: 'Eliges un juramento. Otorga rasgos en niveles 3, 7, 15 y 20.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [{nombre: 'Ataque Extra', descripcion: 'Puedes atacar dos veces en lugar de una.'}],
        6: [
          {nombre: 'Protección de Aura', descripcion: 'Tú y las criaturas amistosas a 10 pies tenéis un bonificador a las tiradas de salvación igual a tu modificador de Carisma (mínimo +1).'}
        ],
        7: [{nombre: 'Rasgo de Juramento', descripcion: 'Obtienes un rasgo de tu juramento.'}],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [{nombre: 'Hechizos de Nivel 3', descripcion: 'Puedes lanzar hechizos de nivel 3.'}],
        10: [
          {nombre: 'Aura de Valor', descripcion: 'Tú y las criaturas amistosas a 10 pies no podéis ser asustados.'}
        ],
        11: [
          {nombre: 'Golpe Divino', descripcion: 'Cuando golpeas con un ataque cuerpo a cuerpo, infliges 1d8 de daño radiante adicional. 2d8 contra no muertos e infernales.'}
        ],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Hechizos de Nivel 4', descripcion: 'Puedes lanzar hechizos de nivel 4.'}],
        14: [
          {nombre: 'Toque Purificador', descripcion: 'Puedes usar tu acción para terminar un hechizo sobre ti o una criatura que toques. Puedes usarlo un número de veces igual a tu modificador de Carisma (mínimo 1) por descanso largo.'}
        ],
        15: [{nombre: 'Rasgo de Juramento', descripcion: 'Obtienes un rasgo de tu juramento.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [{nombre: 'Hechizos de Nivel 5', descripcion: 'Puedes lanzar hechizos de nivel 5.'}],
        18: [
          {nombre: 'Aura Mejorada', descripcion: 'El alcance de tus auras aumenta a 30 pies.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [{nombre: 'Rasgo de Juramento', descripcion: 'Obtienes un rasgo de tu juramento.'}]
      }
    },
    {
      nombre: 'Ranger',
      dado_golpe: 'd10',
      spellSlots: [
        [0,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
      ],
      competencias: {
        armaduras: ['Armadura ligera', 'Armadura media', 'Escudos'],
        armas: ['Armas simples', 'Armas marciales'],
        salvaciones: ['Fuerza', 'Destreza'],
        habilidades: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
        habilidades_elige: 3
      },
      equipo: ['Una cota de escamas o una armadura de cuero', 'Dos espadas cortas o dos armas simples cuerpo a cuerpo', 'Un equipo de mazmorra o un equipo de explorador', 'Un arco largo y una aljaba con 20 flechas'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Enemigo Favorito', descripcion: 'Eliges un tipo de enemigo favorito: aberraciones, bestias, celestiales, constructos, dragones, elementales, feéricos, infernales, gigantes, monstruosidades, limos, plantas, no muertos. Tienes ventaja en pruebas de Supervivencia y ventaja en pruebas de Inteligencia para recordar información. Además, aprendes un idioma que hable tu enemigo.'},
          {nombre: 'Explorador Natural', descripcion: 'Eliges un tipo de terreno favorito: ártico, costa, desierto, bosque, pradera, montaña, pantano, Infraoscuridad. Tus pruebas de Inteligencia y Sabiduría relacionadas con el terreno tienen bonificador duplicado.'}
        ],
        2: [
          {nombre: 'Estilo de Combate', descripcion: 'Eliges un estilo de combate: Arquero, Combate con Dos Armas, o Defensa.'},
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de explorador. Conoces dos trucos y preparas un número de hechizos igual a tu modificador de Sabiduría. La Sabiduría es tu habilidad de lanzamiento.'}
        ],
        3: [
          {nombre: 'Arquetipo de Explorador', descripcion: 'Eliges un arquetipo de explorador. Otorga rasgos en niveles 3, 7, 11 y 15.'},
          {nombre: 'Conciencia Primitiva', descripcion: 'Puedes gastar 1 minuto para sentir si hay enemigos favoritos a 5 millas.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [
          {nombre: 'Ataque Extra', descripcion: 'Puedes atacar dos veces en lugar de una.'}
        ],
        6: [
          {nombre: 'Enemigo Favorito Mejorado', descripcion: 'Eliges un enemigo favorito adicional. Ganas un bonificador de +2 al daño contra tus enemigos favoritos.'}
        ],
        7: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo de explorador.'}],
        8: [
          {nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'},
          {nombre: 'Pasos Agrestes', descripcion: 'Puedes moverte a través de terreno difícil no mágico sin penalización.'}
        ],
        9: [{nombre: 'Hechizos de Nivel 3', descripcion: 'Puedes lanzar hechizos de nivel 3.'}],
        10: [
          {nombre: 'Explorador Natural Mejorado', descripcion: 'Eliges un terreno favorito adicional. Además, las criaturas tienen desventaja en emboscadas.'},
          {nombre: 'Ocultarse Sin Dejar Rastro', descripcion: 'Puedes esconderte cuando solo estés ligeramente oscurecido.'}
        ],
        11: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo de explorador.'}],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Hechizos de Nivel 4', descripcion: 'Puedes lanzar hechizos de nivel 4.'}],
        14: [
          {nombre: 'Enemigo Favorito Mejorado', descripcion: 'Eliges un enemigo favorito adicional. Tu bonificador de daño contra enemigos favoritos aumenta a +4.'}
        ],
        15: [{nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo de explorador.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [{nombre: 'Hechizos de Nivel 5', descripcion: 'Puedes lanzar hechizos de nivel 5.'}],
        18: [
          {nombre: 'Sentidos Salvajes', descripcion: 'Puedes ver 30 pies en la oscuridad. Si ya tienes visión en la oscuridad, el alcance se duplica.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Matador de Enemigos', descripcion: 'Una vez por turno, puedes añadir tu modificador de Sabiduría a una tirada de ataque o daño contra un enemigo favorito.'}
        ]
      }
    },
    {
      nombre: 'Rogue',
      dado_golpe: 'd8',
      competencias: {
        armaduras: ['Armadura ligera'],
        armas: ['Armas simples', 'Ballesta de mano', 'Espada larga', 'Estoque', 'Espada corta'],
        salvaciones: ['Destreza', 'Inteligencia'],
        habilidades: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
        habilidades_elige: 4
      },
      equipo: ['Un estoque o una espada corta', 'Un arco corto y una aljaba con 20 flechas o una espada corta', 'Un equipo de mazmorra o un equipo de explorador', 'Armadura de cuero, dos dagas y herramientas de ladrón'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Ataque Furtivo', descripcion: 'Una vez por turno, puedes infligir 1d6 de daño adicional a una criatura que golpees con un ataque con ventaja o si un aliado está a 5 pies. Debes usar un arma a distancia o un arma cuerpo a cuerpo con la propiedad de sutileza. El daño aumenta en 1d6 cada dos niveles.'},
          {nombre: 'Jerga de Ladrones', descripcion: 'Conoces la jerga secreta de los ladrones.'},
          {nombre: 'Percepción Experta', descripcion: 'Eliges una competencia de habilidad adicional y tu bonificador de competencia se duplica para cualquier prueba que la use.'}
        ],
        2: [
          {nombre: 'Acción Astuta', descripcion: 'Puedes usar una acción bonus para Esprintar, Separarte o Esconderte.'}
        ],
        3: [
          {nombre: 'Arquetipo de Pícaro', descripcion: 'Eliges un arquetipo de pícaro. Otorga rasgos en niveles 3, 9, 13 y 17.'},
          {nombre: 'Ataque Furtivo (2d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 2d6.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [
          {nombre: 'Ataque Furtivo (3d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 3d6.'},
          {nombre: 'Esquivar Instintivo', descripcion: 'Cuando un atacante que puedes ver te golpea, puedes usar tu reacción para reducir el daño a la mitad.'}
        ],
        6: [
          {nombre: 'Percepción Experta', descripcion: 'Eliges otra competencia de habilidad y tu bonificador de competencia se duplica para ella.'}
        ],
        7: [
          {nombre: 'Evasión', descripcion: 'Si estás sujeto a un efecto que permite una salvación de Destreza para la mitad del daño, no recibes daño si tienes éxito y la mitad si fallas.'},
          {nombre: 'Ataque Furtivo (4d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 4d6.'}
        ],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [
          {nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo de pícaro.'},
          {nombre: 'Ataque Furtivo (5d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 5d6.'}
        ],
        10: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        11: [
          {nombre: 'Talento Confiable', descripcion: 'Siempre que hagas una prueba de habilidad con la que tengas competencia, puedes tratar un resultado de 9 o menos en el d20 como un 10.'},
          {nombre: 'Ataque Furtivo (6d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 6d6.'}
        ],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [
          {nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo de pícaro.'},
          {nombre: 'Ataque Furtivo (7d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 7d6.'}
        ],
        14: [
          {nombre: 'Sentir Ciego', descripcion: 'Percibes la ubicación de cualquier criatura oculta o invisible a 10 pies.'}
        ],
        15: [
          {nombre: 'Mente Esquiva', descripcion: 'Tienes ventaja en tiradas de salvación de Inteligencia, Sabiduría y Carisma.'},
          {nombre: 'Ataque Furtivo (8d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 8d6.'}
        ],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Rasgo de Arquetipo', descripcion: 'Obtienes un rasgo de tu arquetipo de pícaro.'},
          {nombre: 'Ataque Furtivo (9d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 9d6.'}
        ],
        18: [{nombre: 'Esquivar Instintivo Mejorado', descripcion: 'No necesitas ver al atacante para usar Esquivar Instintivo.'}],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Golpe de Suerte', descripcion: 'Cuando fallas un ataque, puedes convertirlo en un éxito. Una vez por descanso corto.'},
          {nombre: 'Ataque Furtivo (10d6)', descripcion: 'Tu daño de Ataque Furtivo aumenta a 10d6.'}
        ]
      }
    },
    {
      nombre: 'Sorcerer',
      dado_golpe: 'd6',
      spellSlots: [
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,1],
        [4,3,3,3,3,1,1,1,1],
        [4,3,3,3,3,2,1,1,1],
        [4,3,3,3,3,2,2,1,1],
      ],
      competencias: {
        armaduras: ['Ninguna'],
        armas: ['Dagas', 'Dardos', 'Hondas', 'Bastones', 'Ballesta ligera'],
        salvaciones: ['Constitución', 'Carisma'],
        habilidades: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
        habilidades_elige: 2
      },
      equipo: ['Una ballesta ligera y 20 virotes o cualquier arma simple', 'Un equipo de mazmorra o un equipo de explorador', 'Dos dagas', 'Un foco arcano'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de hechicero. Conoces cuatro trucos y dos hechizos de nivel 1. El Carisma es tu habilidad de lanzamiento.'},
          {nombre: 'Origen Mágico', descripcion: 'Eliges un origen mágico. Otorga rasgos en niveles 1, 6, 14 y 18.'}
        ],
        2: [
          {nombre: 'Puntos de Hechicería', descripcion: 'Tienes un número de puntos de hechicería igual a tu nivel de hechicero. Se recuperan en un descanso largo. Puedes convertir espacios de hechizo en puntos y viceversa.'},
          {nombre: 'Metamagia', descripcion: 'Aprendes dos opciones de Metamagia. Puedes gastar puntos de hechicería para modificar tus hechizos.'}
        ],
        3: [{nombre: 'Metamagia (3 opciones)', descripcion: 'Aprendes una opción adicional de Metamagia.'}],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [{nombre: 'Hechizos de Nivel 3', descripcion: 'Puedes lanzar hechizos de nivel 3.'}],
        6: [{nombre: 'Rasgo de Origen', descripcion: 'Obtienes un rasgo de tu origen mágico.'}],
        7: [{nombre: 'Hechizos de Nivel 4', descripcion: 'Puedes lanzar hechizos de nivel 4.'}],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [{nombre: 'Hechizos de Nivel 5', descripcion: 'Puedes lanzar hechizos de nivel 5.'}],
        10: [
          {nombre: 'Metamagia (4 opciones)', descripcion: 'Aprendes una opción adicional de Metamagia.'}
        ],
        11: [{nombre: 'Hechizos de Nivel 6', descripcion: 'Puedes lanzar hechizos de nivel 6.'}],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Hechizos de Nivel 7', descripcion: 'Puedes lanzar hechizos de nivel 7.'}],
        14: [{nombre: 'Rasgo de Origen', descripcion: 'Obtienes un rasgo de tu origen mágico.'}],
        15: [{nombre: 'Hechizos de Nivel 8', descripcion: 'Puedes lanzar hechizos de nivel 8.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Metamagia (5 opciones)', descripcion: 'Aprendes una opción adicional de Metamagia.'},
          {nombre: 'Hechizos de Nivel 9', descripcion: 'Puedes lanzar hechizos de nivel 9.'}
        ],
        18: [{nombre: 'Rasgo de Origen', descripcion: 'Obtienes un rasgo de tu origen mágico.'}],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Recuperación de Hechicería', descripcion: 'Cuando terminas un descanso corto, recuperas 4 puntos de hechicería.'}
        ]
      }
    },
    {
      nombre: 'Warlock',
      dado_golpe: 'd8',
      spellSlots: [
        [1,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,0,0,0,0,0,0,0,0],
        [4,0,0,0,0,0,0,0,0],
        [4,0,0,0,0,0,0,0,0],
        [4,0,0,0,0,0,0,0,0],
      ],
      competencias: {
        armaduras: ['Armadura ligera'],
        armas: ['Armas simples'],
        salvaciones: ['Sabiduría', 'Carisma'],
        habilidades: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
        habilidades_elige: 2
      },
      equipo: ['Una ballesta ligera y 20 virotes o cualquier arma simple', 'Un equipo de mazmorra o un equipo de explorador', 'Una daga', 'Un foco arcano'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de brujo. Conoces dos trucos y dos hechizos de nivel 1. El Carisma es tu habilidad de lanzamiento. Tus espacios de hechizo se recuperan en un descanso corto.'},
          {nombre: 'Beneficio de Otrosmundano', descripcion: 'Eliges un beneficio de otrosmundano. Otorga rasgos en niveles 1, 6, 10, 14.'}
        ],
        2: [
          {nombre: 'Invocaciones Místicas', descripcion: 'Aprendes dos invocaciones místicas a tu elección.'}
        ],
        3: [
          {nombre: 'Beneficio de Otrosmundano', descripcion: 'Rasgo de beneficio.'},
          {nombre: 'Espacio de Hechizo de Nivel 2', descripcion: 'Tus espacios de hechizo pasan a ser de nivel 2.'}
        ],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [
          {nombre: 'Espacio de Hechizo de Nivel 3', descripcion: 'Tus espacios de hechizo pasan a ser de nivel 3.'},
          {nombre: 'Invocaciones Místicas', descripcion: 'Aprendes una invocación adicional.'}
        ],
        6: [{nombre: 'Rasgo de Beneficio', descripcion: 'Obtienes un rasgo de tu beneficio de otrosmundano.'}],
        7: [
          {nombre: 'Espacio de Hechizo de Nivel 4', descripcion: 'Tus espacios de hechizo pasan a ser de nivel 4.'},
          {nombre: 'Invocaciones Místicas', descripcion: 'Aprendes una invocación adicional.'}
        ],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [
          {nombre: 'Espacio de Hechizo de Nivel 5', descripcion: 'Tus espacios de hechizo pasan a ser de nivel 5.'},
          {nombre: 'Invocaciones Místicas', descripcion: 'Aprendes una invocación adicional.'}
        ],
        10: [{nombre: 'Rasgo de Beneficio', descripcion: 'Obtienes un rasgo de tu beneficio de otrosmundano.'}],
        11: [
          {nombre: 'Arcano Místico (Nivel 6)', descripcion: 'Puedes lanzar un hechizo de nivel 6 una vez por descanso largo.'}
        ],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [
          {nombre: 'Arcano Místico (Nivel 7)', descripcion: 'Puedes lanzar un hechizo de nivel 7 una vez por descanso largo.'}
        ],
        14: [{nombre: 'Rasgo de Beneficio', descripcion: 'Obtienes un rasgo de tu beneficio de otrosmundano.'}],
        15: [
          {nombre: 'Arcano Místico (Nivel 8)', descripcion: 'Puedes lanzar un hechizo de nivel 8 una vez por descanso largo.'},
          {nombre: 'Invocaciones Místicas', descripcion: 'Aprendes una invocación adicional.'}
        ],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [
          {nombre: 'Arcano Místico (Nivel 9)', descripcion: 'Puedes lanzar un hechizo de nivel 9 una vez por descanso largo.'},
          {nombre: 'Espacio de Hechizo', descripcion: 'Tienes 4 espacios de hechizo en lugar de 2.'}
        ],
        18: [
          {nombre: 'Invocaciones Místicas', descripcion: 'Aprendes una invocación adicional.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Maestro de Invocaciones', descripcion: 'Puedes recuperar todos tus espacios de hechizo una vez por descanso largo sin necesidad de un descanso corto.'}
        ]
      }
    },
    {
      nombre: 'Wizard',
      dado_golpe: 'd6',
      spellSlots: [
        [2,0,0,0,0,0,0,0,0],
        [3,0,0,0,0,0,0,0,0],
        [4,2,0,0,0,0,0,0,0],
        [4,3,0,0,0,0,0,0,0],
        [4,3,2,0,0,0,0,0,0],
        [4,3,3,0,0,0,0,0,0],
        [4,3,3,1,0,0,0,0,0],
        [4,3,3,2,0,0,0,0,0],
        [4,3,3,3,1,0,0,0,0],
        [4,3,3,3,2,0,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,0,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,0,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,0],
        [4,3,3,3,2,1,1,1,1],
        [4,3,3,3,3,1,1,1,1],
        [4,3,3,3,3,2,1,1,1],
        [4,3,3,3,3,2,2,1,1],
      ],
      competencias: {
        armaduras: ['Ninguna'],
        armas: ['Dagas', 'Dardos', 'Hondas', 'Bastones', 'Ballesta ligera'],
        salvaciones: ['Inteligencia', 'Sabiduría'],
        habilidades: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
        habilidades_elige: 2
      },
      equipo: ['Un bastón o una daga', 'Un equipo de erudito o un equipo de explorador', 'Un grimorio', 'Una bolsa de componentes o un foco arcano'],
      rasgos_por_nivel: {
        1: [
          {nombre: 'Lanzamiento de Conjuros', descripcion: 'Puedes lanzar hechizos de mago. Conoces tres trucos y tienes seis hechizos de nivel 1 en tu grimorio. Pre paras un número de hechizos igual a tu nivel de mago + tu modificador de Inteligencia. La Inteligencia es tu habilidad de lanzamiento.'},
          {nombre: 'Recuperación Arcana', descripcion: 'Una vez por día, después de un descanso corto, puedes recuperar espacios de hechizo con un nivel total igual a la mitad de tu nivel de mago (mínimo 1).'}
        ],
        2: [
          {nombre: 'Tradición Arcana', descripcion: 'Eliges una tradición arcana. Otorga rasgos en niveles 2, 6, 10 y 14.'}
        ],
        3: [{nombre: 'Hechizos de Nivel 2', descripcion: 'Puedes aprender y lanzar hechizos de nivel 2.'}],
        4: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        5: [{nombre: 'Hechizos de Nivel 3', descripcion: 'Puedes aprender y lanzar hechizos de nivel 3.'}],
        6: [{nombre: 'Rasgo de Tradición', descripcion: 'Obtienes un rasgo de tu tradición arcana.'}],
        7: [{nombre: 'Hechizos de Nivel 4', descripcion: 'Puedes aprender y lanzar hechizos de nivel 4.'}],
        8: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        9: [{nombre: 'Hechizos de Nivel 5', descripcion: 'Puedes aprender y lanzar hechizos de nivel 5.'}],
        10: [{nombre: 'Rasgo de Tradición', descripcion: 'Obtienes un rasgo de tu tradición arcana.'}],
        11: [{nombre: 'Hechizos de Nivel 6', descripcion: 'Puedes aprender y lanzar hechizos de nivel 6.'}],
        12: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        13: [{nombre: 'Hechizos de Nivel 7', descripcion: 'Puedes aprender y lanzar hechizos de nivel 7.'}],
        14: [{nombre: 'Rasgo de Tradición', descripcion: 'Obtienes un rasgo de tu tradición arcana.'}],
        15: [{nombre: 'Hechizos de Nivel 8', descripcion: 'Puedes aprender y lanzar hechizos de nivel 8.'}],
        16: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        17: [{nombre: 'Hechizos de Nivel 9', descripcion: 'Puedes aprender y lanzar hechizos de nivel 9.'}],
        18: [
          {nombre: 'Hechizos de Dominio', descripcion: 'Aprendes un hechizo de nivel 1 y de nivel 2 de tu escuela de magia.'}
        ],
        19: [{nombre: 'Mejora de Puntuación de Característica', descripcion: 'Aumentas una puntuación de característica en 2, o dos en 1.'}],
        20: [
          {nombre: 'Hechizos de Dominio Mejorados', descripcion: 'Aprendes un hechizo de nivel 3 y de nivel 4 de tu escuela de magia.'}
        ]
      }
    }
  ],
  trasfondos: [
    {
      nombre: 'Acolyte',
      competencias_habilidades: ['Insight', 'Religion'],
      equipo: ['Un símbolo sagrado', 'Un libro de oraciones', '5 velas', 'Un incensario', 'Vestiduras religiosas', 'Un equipo de sacerdote', 'Una bolsa con 15 gp'],
      rasgo: {nombre: 'Refugio de los Fieles', descripcion: 'Puedes recibir curación y cuidado en un templo de tu fe. Tú y tus compañeros podéis alojaros en los templos de tu deidad.'}
    },
    {
      nombre: 'Charlatan',
      competencias_habilidades: ['Deception', 'Sleight of Hand'],
      equipo: ['Un disfraz', 'Herramientas de falsificador', 'Un artículo de valor falso', 'Un equipo de estafador', 'Una bolsa con 15 gp'],
      rasgo: {nombre: 'Estafa Favorita', descripcion: 'Tienes una estafa favorita que usas para engañar a la gente. Puedes crear documentos falsos, imitar caligrafía o hacer trampas en juegos.'}
    },
    {
      nombre: 'Criminal',
      competencias_habilidades: ['Deception', 'Stealth'],
      equipo: ['Una ganzúa', 'Herramientas de ladrón', 'Un equipo de mazmorra', 'Una bolsa con 15 gp'],
      rasgo: {nombre: 'Contacto Criminal', descripcion: 'Tienes un contacto de confianza en el inframundo criminal que puede proporcionarte información y favores a cambio de un pago.'}
    },
    {
      nombre: 'Entertainer',
      competencias_habilidades: ['Acrobatics', 'Performance'],
      equipo: ['Un instrumento musical', 'Un disfraz', 'Un equipo de entretenido', 'Una bolsa con 15 gp'],
      rasgo: {nombre: 'Público Cautivador', descripcion: 'Siempre puedes encontrar un lugar para actuar. Recibes alojamiento gratuito y comida modesta por tu actuación.'}
    },
    {
      nombre: 'Folk Hero',
      competencias_habilidades: ['Animal Handling', 'Survival'],
      equipo: ['Herramientas de artesano', 'Una pala', 'Una olla de hierro', 'Un equipo de explorador', 'Una bolsa con 10 gp'],
      rasgo: {nombre: 'Rusticidad', descripcion: 'Los aldeanos te reciben con hospitalidad y te ayudan contra los abusos de los nobles y otras figuras de autoridad.'}
    },
    {
      nombre: 'Guild Artisan',
      competencias_habilidades: ['Insight', 'Persuasion'],
      equipo: ['Herramientas de artesano', 'Una carta de membrecía del gremio', 'Un equipo de artesano', 'Una bolsa con 15 gp'],
      rasgo: {nombre: 'Membresía de Gremio', descripcion: 'Puedes acceder a los recursos del gremio: alojamiento, comida, contactos comerciales y protección legal.'}
    },
    {
      nombre: 'Hermit',
      competencias_habilidades: ['Medicine', 'Religion'],
      equipo: ['Un cojín de meditación', 'Una manta de viaje', 'Un equipo de erudito', 'Una lámpara', 'Un aceite', 'Una bolsa con 5 gp'],
      rasgo: {nombre: 'Descubrimiento', descripcion: 'Has hecho un descubrimiento privado durante tu reclusión. Podría ser un secreto religioso, filosófico o la ubicación de algo importante.'}
    },
    {
      nombre: 'Noble',
      competencias_habilidades: ['History', 'Persuasion'],
      equipo: ['Un sello de famila', 'Un pergamino genealógico', 'Ropa de calidad', 'Un escudero o sirviente', 'Una bolsa con 25 gp'],
      rasgo: {nombre: 'Posición Privilegiada', descripcion: 'Eres recibido en la alta sociedad y la gente tiende a respetar tu estatus. Puedes acceder a eventos de la nobleza.'}
    },
    {
      nombre: 'Outlander',
      competencias_habilidades: ['Athletics', 'Survival'],
      equipo: ['Un bastón', 'Una trampa para caza', 'Un trofeo de caza', 'Un equipo de viajero', 'Una bolsa con 10 gp'],
      rasgo: {nombre: 'Gran Viajero', descripcion: 'Tienes una memoria excelente para mapas y geografía. Siempre puedes recordar el terreno general y los recursos de la zona.'}
    },
    {
      nombre: 'Sage',
      competencias_habilidades: ['Arcana', 'History'],
      equipo: ['Un frasco de tinta', 'Una pluma', 'Un cuchillo de papel', 'Un libro de historia', 'Un equipo de erudito', 'Una bolsa con 10 gp'],
      rasgo: {nombre: 'Investigador', descripcion: 'Puedes acceder a bibliotecas, archivos y eruditos locales para obtener información sobre temas de tu especialidad.'}
    },
    {
      nombre: 'Sailor',
      competencias_habilidades: ['Athletics', 'Perception'],
      equipo: ['Una cuerda de 50 pies', 'Un amuleto de la suerte', 'Un equipo de marinero', 'Una bolsa con 10 gp'],
      rasgo: {nombre: 'Pasaje de Barco', descripcion: 'Puedes encontrar trabajo y pasaje en barcos. Siempre puedes convencer a capitanes para que te lleven a cambio de trabajo.'}
    },
    {
      nombre: 'Soldier',
      competencias_habilidades: ['Athletics', 'Intimidation'],
      equipo: ['Una insignia de rango', 'Un trofeo de guerra', 'Un dado y una baraja', 'Un equipo de soldado', 'Una bolsa con 10 gp'],
      rasgo: {nombre: 'Rango Militar', descripcion: 'Los soldados y guardias respetan tu autoridad. Puedes acceder a instalaciones militares y ejercer autoridad sobre reclutas.'}
    },
    {
      nombre: 'Urchin',
      competencias_habilidades: ['Sleight of Hand', 'Stealth'],
      equipo: ['Una cuerda de 10 pies', 'Un ratón mascota', 'Un recuerdo de tus padres', 'Un equipo de mazmorra', 'Una bolsa con 10 gp'],
      rasgo: {nombre: 'Pies Ligeros', descripcion: 'Puedes moverte por la ciudad el doble de rápido. Conoces los atajos y escondites de cualquier asentamiento urbano.'}
    }
  ],
  habilidades: {
    'Fuerza': ['Athletics'],
    'Destreza': ['Acrobatics', 'Sleight of Hand', 'Stealth'],
    'Constitución': [],
    'Inteligencia': ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
    'Sabiduría': ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'],
    'Carisma': ['Deception', 'Intimidation', 'Performance', 'Persuasion']
  },
  hechizos: [
    {nombre: 'Mano de Mago', nivel: 0, escuela: 'Taumaturgia', tiempo: '1 acción', alcance: '30 pies', componentes: 'V, S', duracion: '1 minuto', descripcion: 'Aparece una mano espectral que puede manipular objetos, abrir puertas o recoger objetos sueltos.', clases: ['Bard','Sorcerer','Warlock','Wizard']},
    {nombre: 'Luz', nivel: 0, escuela: 'Evocación', tiempo: '1 acción', alcance: 'Toque', componentes: 'V, M', duracion: '1 hora', descripcion: 'Tocas un objeto para que emita luz brillante en un radio de 20 pies y luz tenue 20 pies más.', clases: ['Bard','Cleric','Sorcerer','Wizard']},
    {nombre: 'Prestidigitación', nivel: 0, escuela: 'Taumaturgia', tiempo: '1 acción', alcance: '10 pies', componentes: 'V, S', duracion: '1 hora', descripcion: 'Truco menor que puede limpiar, calentar, enfriar, saborear o crear pequeños efectos inofensivos.', clases: ['Bard','Sorcerer','Warlock','Wizard']},
    {nombre: 'Llama Sagrada', nivel: 0, escuela: 'Evocación', tiempo: '1 acción', alcance: '60 pies', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Un rayo de luz divina golpea a una criatura. 1d8 de daño radiante. No aplica bonificador de característica al daño.', clases: ['Cleric']},
    {nombre: 'Impacto Certero', nivel: 0, escuela: 'Adivinación', tiempo: '1 acción', alcance: '30 pies', componentes: 'V, S', duracion: '1 ronda', descripcion: 'Tocas a una criatura. La próxima vez que la golpees antes del final de tu próximo turno, causas 1d6 de daño adicional.', clases: ['Bard','Warlock','Wizard']},
    {nombre: 'Hoja de Fuego', nivel: 0, escuela: 'Evocación', tiempo: '1 acción', alcance: 'Personal', componentes: 'V, M', duracion: '1 minuto', descripcion: 'Una hoja de fuego aparece en tu mano. Ataque cuerpo a cuerpo con 1d8 de daño de fuego. Al nivel 5+ el daño aumenta.', clases: ['Sorcerer','Warlock','Wizard']},
    {nombre: 'Perro de Guardia', nivel: 0, escuela: 'Conjuración', tiempo: '1 acción', alcance: '30 pies', componentes: 'V, S', duracion: '8 horas', descripcion: 'Creas un perro espectral que vigila un área. Ladra si una criatura se acerca.', clases: ['Wizard']},
    {nombre: 'Toque Helado', nivel: 0, escuela: 'Nigromancia', tiempo: '1 acción', alcance: '120 pies', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Un rayo de energía helada daña a una criatura y evita que recupere puntos de golpe hasta tu próximo turno.', clases: ['Sorcerer','Warlock','Wizard']},
    {nombre: 'Amigos', nivel: 0, escuela: 'Encantamiento', tiempo: '1 acción', alcance: 'Personal', componentes: 'S, M', duracion: '1 minuto', descripcion: 'Ganas ventaja en pruebas de Carisma contra una criatura. Al terminar, la criatura sabe que la has manipulado.', clases: ['Bard','Sorcerer','Warlock','Wizard']},
    {nombre: 'Rociada de Veneno', nivel: 0, escuela: 'Conjuración', tiempo: '1 acción', alcance: '10 pies', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Extiendes la mano y rocías veneno a una criatura que puedes ver. 1d12 de daño de veneno.', clases: ['Druid','Sorcerer','Warlock','Wizard']},
    {nombre: 'Curar Heridas', nivel: 1, escuela: 'Evocación', tiempo: '1 acción', alcance: 'Toque', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Una criatura recupera 1d8 + tu modificador de habilidad de lanzamiento de conjuros puntos de golpe.', clases: ['Bard','Cleric','Druid','Paladin','Ranger']},
    {nombre: 'Bola de Fuego', nivel: 3, escuela: 'Evocación', tiempo: '1 acción', alcance: '150 pies', componentes: 'V, S, M', duracion: 'Instantáneo', descripcion: 'Un punto de luz estalla en una explosión de fuego. Radio de 20 pies. 8d6 de daño de fuego, salvación de Destreza para la mitad.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Misil Mágico', nivel: 1, escuela: 'Evocación', tiempo: '1 acción', alcance: '120 pies', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Tres proyectiles mágicos golpean automáticamente a una o más criaturas. Cada uno causa 1d4 + 1 de daño de fuerza.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Escudo', nivel: 1, escuela: 'Ablación', tiempo: '1 reacción', alcance: 'Personal', componentes: 'V, S', duracion: '1 ronda', descripcion: 'Una barrera invisible te protege. Tu CA aumenta en +5 y no recibes daño del hechizo Misil Mágico.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Detección de Magia', nivel: 1, escuela: 'Adivinación', tiempo: '1 acción', alcance: 'Personal', componentes: 'V, S', duracion: 'Concentración, 10 minutos', descripcion: 'Sientes la presencia de magia a 30 pies. Puedes ver un aura mágica alrededor de objetos y criaturas visibles.', clases: ['Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Wizard']},
    {nombre: 'Dormir', nivel: 1, escuela: 'Encantamiento', tiempo: '1 acción', alcance: '90 pies', componentes: 'V, S, M', duracion: 'Instantáneo', descripcion: '5d8 de puntos de golpe de criaturas caen dormidas. Las criaturas con menos de 5 PV se ven afectadas primero.', clases: ['Bard','Sorcerer','Wizard']},
    {nombre: 'Telaraña', nivel: 2, escuela: 'Conjuración', tiempo: '1 acción', alcance: '60 pies', componentes: 'V, S, M', duracion: 'Concentración, 1 hora', descripcion: 'Creas una capa de telarañas pegajosas en un radio de 20 pies. Terreno difícil. Las criaturas atrapadas deben hacer una salvación de Destreza.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Invisibilidad', nivel: 2, escuela: 'Ilusión', tiempo: '1 acción', alcance: 'Toque', componentes: 'V, S, M', duracion: 'Concentración, 1 hora', descripcion: 'La criatura que tocas se vuelve invisible. El hechizo termina si la criatura ataca o lanza un hechizo.', clases: ['Bard','Sorcerer','Warlock','Wizard']},
    {nombre: 'Relámpago', nivel: 3, escuela: 'Evocación', tiempo: '1 acción', alcance: '100 pies', componentes: 'V, S, M', duracion: 'Instantáneo', descripcion: 'Un rayo de 100 por 5 pies causa 8d6 de daño de relámpago. Salvación de Destreza para la mitad.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Polimorfar', nivel: 4, escuela: 'Transmutación', tiempo: '1 acción', alcance: '60 pies', componentes: 'V, S, M', duracion: 'Concentración, 1 hora', descripcion: 'Transformas a una criatura en una bestia con CR igual o menor al nivel de la criatura objetivo.', clases: ['Bard','Sorcerer','Wizard']},
    {nombre: 'Muro de Fuego', nivel: 4, escuela: 'Evocación', tiempo: '1 acción', alcance: '120 pies', componentes: 'V, S, M', duracion: 'Concentración, 1 minuto', descripcion: 'Creas un muro de fuego de 60 por 20 pies. Causa 5d8 de daño de fuego a las criaturas que lo atraviesan.', clases: ['Druid','Sorcerer','Warlock','Wizard']},
    {nombre: 'Curar Heridas en Masa', nivel: 5, escuela: 'Evocación', tiempo: '1 acción', alcance: '60 pies', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Restauras 3d8 + tu modificador de habilidad de lanzamiento puntos de golpe a hasta seis criaturas en un radio de 30 pies.', clases: ['Bard','Cleric','Druid']},
    {nombre: 'Levantar Muertos', nivel: 5, escuela: 'Nigromancia', tiempo: '1 hora', alcance: 'Toque', componentes: 'V, S, M', duracion: 'Instantáneo', descripcion: 'Devuelves a la vida a una criatura que ha muerto en los últimos 10 días. La criatura vuelve con 1 punto de golpe.', clases: ['Cleric','Paladin']},
    {nombre: 'Desintegrar', nivel: 6, escuela: 'Transmutación', tiempo: '1 acción', alcance: '60 pies', componentes: 'V, S, M', duracion: 'Instantáneo', descripcion: 'Un fino rayo verde reduce a una criatura o a un objeto a cenizas. 10d6 + 40 de daño de fuerza.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Globo de Invulnerabilidad', nivel: 6, escuela: 'Ablación', tiempo: '1 acción', alcance: 'Personal', componentes: 'V, S, M', duracion: 'Concentración, 1 minuto', descripcion: 'Una burbuja mágica te rodea. Los hechizos de nivel 5 o menor no pueden afectarte.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Teleportar', nivel: 7, escuela: 'Conjuración', tiempo: '1 acción', alcance: '10 pies', componentes: 'V', duracion: 'Instantáneo', descripcion: 'Tú y hasta 8 criaturas voluntarias sois transportados a un destino conocido. Puede fallar dependiendo de la familiaridad.', clases: ['Bard','Sorcerer','Wizard']},
    {nombre: 'Palabra de Poder: Aturdir', nivel: 8, escuela: 'Encantamiento', tiempo: '1 acción', alcance: '60 pies', componentes: 'V', duracion: 'Instantáneo', descripcion: 'Una criatura con 150 puntos de golpe o menos queda aturdida sin salvación.', clases: ['Bard','Sorcerer','Warlock','Wizard']},
    {nombre: 'Deseo', nivel: 9, escuela: 'Conjuración', tiempo: '1 acción', alcance: 'Ilimitado', componentes: 'V', duracion: 'Instantáneo', descripcion: 'El hechizo más poderoso. Puedes alterar la realidad para lograr cualquier efecto que describas. El DM puede limitar el efecto.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Tormenta de Meteoros', nivel: 9, escuela: 'Evocación', tiempo: '1 acción', alcance: '1 milla', componentes: 'V, S', duracion: 'Instantáneo', descripcion: 'Cuatro meteoros impactan en puntos que elijas. Cada uno causa 20d6 de daño de fuego y 20d6 de daño contundente en un radio de 40 pies.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Resurrección Verdadera', nivel: 9, escuela: 'Nigromancia', tiempo: '1 hora', alcance: 'Toque', componentes: 'V, S, M', duracion: 'Instantáneo', descripcion: 'Devuelves la vida a una criatura muerta en los últimos 200 años. Incluso puede regenerar partes del cuerpo perdidas.', clases: ['Cleric','Druid']},
    {nombre: 'Parálisis', nivel: 1, escuela: 'Encantamiento', tiempo: '1 acción', alcance: '60 pies', componentes: 'V, S', duracion: 'Concentración, 1 minuto', descripcion: 'Una criatura que falla una salvación de Sabiduría queda paralizada. Repite la salvación al final de cada turno.', clases: ['Bard','Cleric','Druid','Sorcerer','Warlock','Wizard']},
    {nombre: 'Bendecir', nivel: 1, escuela: 'Encantamiento', tiempo: '1 acción', alcance: '30 pies', componentes: 'V, S, M', duracion: 'Concentración, 1 minuto', descripcion: 'Hasta tres criaturas añaden 1d4 a las tiradas de ataque y salvaciones.', clases: ['Cleric','Paladin']},
    {nombre: 'Palabra de Curación', nivel: 1, escuela: 'Evocación', tiempo: '1 acción bonus', alcance: '60 pies', componentes: 'V', duracion: 'Instantáneo', descripcion: 'Una criatura recupera 1d4 + tu modificador de habilidad de lanzamiento puntos de golpe.', clases: ['Bard','Cleric','Druid']},
    {nombre: 'Armadura de Mago', nivel: 1, escuela: 'Ablación', tiempo: '1 acción', alcance: 'Toque', componentes: 'V, S, M', duracion: '8 horas', descripcion: 'Tocas a una criatura dispuesta. Su CA base pasa a ser 13 + su modificador de Destreza.', clases: ['Sorcerer','Wizard']},
    {nombre: 'Aliento de Fuego', nivel: 2, escuela: 'Evocación', tiempo: '1 acción', alcance: 'Personal', componentes: 'V, S, M', duracion: 'Concentración, 1 minuto', descripcion: 'Exhalas fuego en un cono de 15 pies. 3d6 de daño de fuego, salvación de Destreza para la mitad.', clases: ['Druid','Sorcerer','Wizard']},
    {nombre: 'Volar', nivel: 3, escuela: 'Transmutación', tiempo: '1 acción', alcance: 'Toque', componentes: 'V, S, M', duracion: 'Concentración, 10 minutos', descripcion: 'Una criatura obtiene una velocidad de vuelo de 60 pies.', clases: ['Sorcerer','Warlock','Wizard']},
    {nombre: 'Mano de Bigby', nivel: 5, escuela: 'Evocación', tiempo: '1 acción', alcance: '120 pies', componentes: 'V, S, M', duracion: 'Concentración, 1 minuto', descripcion: 'Una mano de fuerza invisible de 10 pies puede empujar, agarrar, golpear o proteger. Golpe: 4d8 de daño de fuerza.', clases: ['Wizard']}
  ],
  equipo: {
    armas_simples: [
      {nombre: 'Clava', daño: '1d4', tipo: 'Contundente', propiedades: 'Ligera'},
      {nombre: 'Daga', daño: '1d4', tipo: 'Perforante', propiedades: 'Sutil, ligera, arrojadiza (20/60)'},
      {nombre: 'Gran Hacha', daño: '1d12', tipo: 'Cortante', propiedades: 'Pesada, de dos manos'},
      {nombre: 'Hacha de Mano', daño: '1d6', tipo: 'Cortante', propiedades: 'Ligera, arrojadiza (20/60)'},
      {nombre: 'Jabalina', daño: '1d6', tipo: 'Perforante', propiedades: 'Arrojadiza (30/120)'},
      {nombre: 'Maza', daño: '1d6', tipo: 'Contundente', propiedades: '-'},
      {nombre: 'Bastón', daño: '1d6', tipo: 'Contundente', propiedades: 'Versátil (1d8)'},
      {nombre: 'Cimitarra', daño: '1d6', tipo: 'Cortante', propiedades: 'Ligera, sutil'},
      {nombre: 'Hoz', daño: '1d4', tipo: 'Cortante', propiedades: 'Ligera'},
      {nombre: 'Honda', daño: '1d4', tipo: 'Contundente', propiedades: 'Munición (30/120)'},
      {nombre: 'Lanza', daño: '1d6', tipo: 'Perforante', propiedades: 'Versátil (1d8), arrojadiza (20/60)'},
      {nombre: 'Ballesta Ligera', daño: '1d8', tipo: 'Perforante', propiedades: 'Munición (80/320), recarga, a dos manos'},
      {nombre: 'Dardo', daño: '1d4', tipo: 'Perforante', propiedades: 'Sutil, arrojadiza (20/60)'}
    ],
    armas_marciales: [
      {nombre: 'Estoque', daño: '1d8', tipo: 'Perforante', propiedades: 'Sutil'},
      {nombre: 'Espada Larga', daño: '1d8', tipo: 'Cortante', propiedades: 'Versátil (1d10)'},
      {nombre: 'Hacha de Batalla', daño: '1d8', tipo: 'Cortante', propiedades: 'Versátil (1d10)'},
      {nombre: 'Martillo de Guerra', daño: '1d8', tipo: 'Contundente', propiedades: 'Versátil (1d10)'},
      {nombre: 'Espada Corta', daño: '1d6', tipo: 'Cortante', propiedades: 'Ligera, sutil'},
      {nombre: 'Ballesta de Mano', daño: '1d6', tipo: 'Perforante', propiedades: 'Munición (30/120), ligera, recarga'},
      {nombre: 'Ballesta Pesada', daño: '1d10', tipo: 'Perforante', propiedades: 'Munición (100/400), pesada, recarga, a dos manos'},
      {nombre: 'Arco Largo', daño: '1d8', tipo: 'Perforante', propiedades: 'Munición (150/600), pesada, a dos manos'},
      {nombre: 'Arco Corto', daño: '1d6', tipo: 'Perforante', propiedades: 'Munición (80/320), a dos manos'},
      {nombre: 'Gran Espada', daño: '2d6', tipo: 'Cortante', propiedades: 'Pesada, a dos manos'},
      {nombre: 'Gran Hacha de Guerra', daño: '1d12', tipo: 'Cortante', propiedades: 'Pesada, a dos manos'},
      {nombre: 'Maza Pesada', daño: '1d8', tipo: 'Contundente', propiedades: 'A dos manos'},
      {nombre: 'Alabarda', daño: '1d10', tipo: 'Cortante', propiedades: 'Pesada, alcance, a dos manos'},
      {nombre: 'Martillo de Guerra a Dos Manos', daño: '2d6', tipo: 'Contundente', propiedades: 'Pesada, a dos manos'}
    ],
    armaduras: [
      {nombre: 'Acolchada', ca: 11, tipo: 'Ligera', fuerza: 0, sigilo: 'Desventaja', precio: '5 gp'},
      {nombre: 'Cuero', ca: 11, tipo: 'Ligera', fuerza: 0, sigilo: '-', precio: '10 gp'},
      {nombre: 'Cuero Tachonado', ca: 12, tipo: 'Ligera', fuerza: 0, sigilo: '-', precio: '45 gp'},
      {nombre: 'Pieles', ca: 12, tipo: 'Media', fuerza: 0, sigilo: '-', precio: '15 gp'},
      {nombre: 'Camisote de Mallas', ca: 13, tipo: 'Media', fuerza: 0, sigilo: '-', precio: '50 gp'},
      {nombre: 'Escamas', ca: 14, tipo: 'Media', fuerza: 0, sigilo: 'Desventaja', precio: '400 gp'},
      {nombre: 'Placas y Mallas', ca: 15, tipo: 'Media', fuerza: 0, sigilo: 'Desventaja', precio: '600 gp'},
      {nombre: 'Media Placa', ca: 15, tipo: 'Media', fuerza: 0, sigilo: 'Desventaja', precio: '750 gp'},
      {nombre: 'Anillas', ca: 14, tipo: 'Pesada', fuerza: 0, sigilo: 'Desventaja', precio: '30 gp'},
      {nombre: 'Cota de Mallas', ca: 16, tipo: 'Pesada', fuerza: 13, sigilo: 'Desventaja', precio: '75 gp'},
      {nombre: 'Armadura de Placas', ca: 18, tipo: 'Pesada', fuerza: 15, sigilo: 'Desventaja', precio: '1500 gp'},
      {nombre: 'Escudo', ca: 2, tipo: 'Escudo', fuerza: 0, sigilo: '-', precio: '10 gp'}
    ],
    equipo_aventurero: [
      {nombre: 'Mochila', precio: '2 gp'},
      {nombre: 'Cuerda de cáñamo (50 pies)', precio: '1 gp'},
      {nombre: 'Antorchas (10)', precio: '1 sp'},
      {nombre: 'Yesca y pedernal', precio: '5 sp'},
      {nombre: 'Raciones (1 día)', precio: '5 sp'},
      {nombre: 'Odre de agua', precio: '2 sp'},
      {nombre: 'Cuerda de seda (50 pies)', precio: '10 gp'},
      {nombre: 'Pértiga (10 pies)', precio: '2 sp'},
      {nombre: 'Martillo y pitones (10)', precio: '1 gp'},
      {nombre: 'Grapa', precio: '5 sp'},
      {nombre: 'Linterna', precio: '5 gp'},
      {nombre: 'Aceite (1 frasco)', precio: '1 sp'},
      {nombre: 'Tiza (1 pieza)', precio: '1 cp'},
      {nombre: 'Bolsa de dormir', precio: '1 gp'},
      {nombre: 'Manta de viaje', precio: '2 gp'},
      {nombre: 'Kit de disfraz', precio: '25 gp'},
      {nombre: 'Kit de falsificación', precio: '15 gp'},
      {nombre: 'Kit de envenenador', precio: '50 gp'},
      {nombre: 'Kit de herboristería', precio: '5 gp'},
      {nombre: 'Piedra de afilar', precio: '2 cp'},
      {nombre: 'Saco', precio: '1 cp'},
      {nombre: 'Cobertor', precio: '1 gp'},
      {nombre: 'Ropa fina', precio: '15 gp'},
      {nombre: 'Ropa de viaje', precio: '2 gp'},
      {nombre: 'Candado', precio: '10 gp'},
      {nombre: 'Ganzúas', precio: '25 gp'}
    ]
  },
  bestiario: [
    {nombre:'Goblin', tamaño:'Pequeño', tipo:'Humanoide', ca:15, pg:'7 (2d6)', velocidad:'30 pies', des:14, fuer:8, con:10, int:10, sab:8, car:8, habilidades:{Sigilo:'+6'}, sentidos:'Visión oscura 60 pies', idiomas:'Común, Goblin', cr:'1/4', acciones:[{nombre:'Espada Corta', desc:'+4 a golpear, 1d6+2 perforante'},{nombre:'Arco Corto', desc:'+4 a golpear, 1d6+2 perforante'}], rasgos:[{nombre:'Huida Astuta', desc:'Puede esquivar o esconderse como acción bonus.'},{nombre:'Ataque Furtivo', desc:'Causa 2d6 de daño extra si tiene ventaja.'}]},
    {nombre:'Orco', tamaño:'Mediano', tipo:'Humanoide', ca:13, pg:'15 (2d8+6)', velocidad:'30 pies', des:12, fuer:16, con:16, int:7, sab:11, car:10, habilidades:{Intimidación:'+2'}, sentidos:'Visión oscura 60 pies', idiomas:'Común, Orco', cr:'1/2', acciones:[{nombre:'Gran Hacha', desc:'+5 a golpear, 1d12+3 cortante'},{nombre:'Jabalina', desc:'+5 a golpear, 1d6+3 perforante'}], rasgos:[{nombre:'Aguante', desc:'Cuando el orco es reducido a 0 PG pero no muerto, puede quedar a 1 PG.'},{nombre:'Carga Agresiva', desc:'El orco puede moverse hasta su velocidad hacia una criatura hostil que pueda ver como acción bonus.'}]},
    {nombre:'Hobgoblin', tamaño:'Mediano', tipo:'Humanoide', ca:18, pg:'11 (2d8+2)', velocidad:'30 pies', des:12, fuer:15, con:12, int:10, sab:10, car:9, habilidades:{}, sentidos:'Visión oscura 60 pies', idiomas:'Común, Goblin', cr:'1/2', acciones:[{nombre:'Espada Larga', desc:'+4 a golpear, 1d8+2 cortante (1d10+2 a dos manos)'},{nombre:'Arco Largo', desc:'+3 a golpear, 1d8+1 perforante'}], rasgos:[{nombre:'Ventaja Marcial', desc:'Una vez por turno, si el hobgoblin tiene aliados a 5 pies, causa 2d6 de daño extra.'}]},
    {nombre:'Esqueleto', tamaño:'Mediano', tipo:'No-muerto', ca:13, pg:'13 (2d8+4)', velocidad:'30 pies', des:14, fuer:10, con:15, int:6, sab:8, car:5, habilidades:{}, sentidos:'Visión oscura 60 pies', idiomas:'Común', cr:'1/4', acciones:[{nombre:'Espada Corta', desc:'+4 a golpear, 1d6+2 perforante'},{nombre:'Arco Corto', desc:'+4 a golpear, 1d6+2 perforante'}], rasgos:[{nombre:'Vulnerabilidades', desc:'Daño contundente.'},{nombre:'Inmunidades', desc:'Veneno, agotamiento.'}]},
    {nombre:'Zombi', tamaño:'Mediano', tipo:'No-muerto', ca:8, pg:'22 (3d8+9)', velocidad:'20 pies', des:6, fuer:13, con:16, int:3, sab:6, car:5, habilidades:{}, sentidos:'Visión oscura 60 pies', idiomas:'Común', cr:'1/4', acciones:[{nombre:'Puñetazo', desc:'+3 a golpear, 1d6+1 contundente'}], rasgos:[{nombre:'Fortaleza de No-muerto', desc:'Si el daño lo reduce a 0 PG, hace una TS de CON CD 5+daño recibido. Si tiene éxito, queda a 1 PG.'},{nombre:'Inmunidades', desc:'Veneno, agotamiento.'}]},
    {nombre:'Lobo', tamaño:'Mediano', tipo:'Bestia', ca:13, pg:'11 (2d8+2)', velocidad:'40 pies', des:15, fuer:12, con:12, int:3, sab:12, car:6, habilidades:{Percepción:'+3',Sigilo:'+4'}, sentidos:'Percepción 40 pies', idiomas:'—', cr:'1/4', acciones:[{nombre:'Mordisco', desc:'+4 a golpear, 2d4+2 perforante. TS de FUE CD 11 o derribado.'}], rasgos:[{nombre:'Olfato Agudo', desc:'Ventaja en pruebas de Sabiduría (Percepción) que usen olfato.'},{nombre:'Tácticas de Manada', desc:'Ventaja en ataques si un aliado está a 5 pies del objetivo.'}]},
    {nombre:'Oso Negro', tamaño:'Grande', tipo:'Bestia', ca:11, pg:'19 (3d10+3)', velocidad:'40 pies, trepar 30 pies', des:10, fuer:15, con:14, int:2, sab:12, car:7, habilidades:{Percepción:'+3'}, sentidos:'Percepción 30 pies', idiomas:'—', cr:'1/2', acciones:[{nombre:'Golpe', desc:'+3 a golpear, 1d6+1 contundente'},{nombre:'Mordisco', desc:'+3 a golpear, 1d8+1 perforante'}], rasgos:[{nombre:'Olfato Agudo', desc:'Ventaja en Percepción usando olfato.'}]},
    {nombre:'Bandido', tamaño:'Mediano', tipo:'Humanoide', ca:12, pg:'11 (2d8+2)', velocidad:'30 pies', des:12, fuer:11, con:12, int:10, sab:10, car:10, habilidades:{}, sentidos:'—', idiomas:'Común', cr:'1/8', acciones:[{nombre:'Cimitarra', desc:'+3 a golpear, 1d6+1 cortante'},{nombre:'Ballesta Ligera', desc:'+3 a golpear, 1d8+1 perforante'}], rasgos:[]},
    {nombre:'Ladrón', tamaño:'Mediano', tipo:'Humanoide', ca:14, pg:'13 (3d8)', velocidad:'30 pies', des:15, fuer:10, con:10, int:12, sab:10, car:12, habilidades:{Acrobacias:'+4',Juego_de_Manos:'+4',Sigilo:'+6',Percepción:'+2'}, sentidos:'—', idiomas:'Común, Jerga de ladrones', cr:'1/2', acciones:[{nombre:'Espada Corta', desc:'+4 a golpear, 1d6+2 perforante'},{nombre:'Ballesta de Mano', desc:'+4 a golpear, 1d6+2 perforante'}], rasgos:[{nombre:'Ataque Furtivo', desc:'Causa 1d6 extra si tiene ventaja.'},{nombre:'Evasión', desc:'Sin daño en TS de DES exitosas.'}]},
    {nombre:'Gnoll', tamaño:'Mediano', tipo:'Humanoide', ca:15, pg:'22 (5d8)', velocidad:'30 pies', des:12, fuer:14, con:11, int:6, sab:10, car:7, habilidades:{}, sentidos:'Visión oscura 60 pies', idiomas:'Gnoll, Común', cr:'1/2', acciones:[{nombre:'Mordisco', desc:'+4 a golpear, 1d4+2 perforante'},{nombre:'Lanza', desc:'+4 a golpear, 1d6+2 perforante (1d8 a dos manos)'},{nombre:'Arco Corto', desc:'+3 a golpear, 1d6+1 perforante'}], rasgos:[{nombre:'Rastro de Sangre', desc:'Ventaja en ataques contra criaturas sin PG máximos.'}]},
    {nombre:'Espectro', tamaño:'Mediano', tipo:'No-muerto', ca:11, pg:'22 (5d8)', velocidad:'0 pies, volar 50 pies', des:11, fuer:1, con:10, int:10, sab:10, car:11, habilidades:{}, sentidos:'Visión oscura 60 pies', idiomas:'Común', cr:'1', acciones:[{nombre:'Toque Drenador', desc:'+3 a golpear, 3d6 de daño necrótico. El objetivo reduce su máximo de PG.'}], rasgos:[{nombre:'Movimiento Incorpóreo', desc:'Puede atravesar criaturas y objetos.'},{nombre:'Inmunidades', desc:'Veneno, necrótico, agotamiento, derribado, agarrado, paralizado.'}]},
    {nombre:'Gelatina Verde', tamaño:'Grande', tipo:'Cieno', ca:6, pg:'84 (8d10+40)', velocidad:'15 pies, trepar 15 pies', des:1, fuer:12, con:20, int:1, sab:6, car:1, habilidades:{}, sentidos:'Ciego más allá de 60 pies, visión ciega 60 pies', idiomas:'—', cr:'2', acciones:[{nombre:'Seudo-pie', desc:'+3 a golpear, 2d6+1 contundente + 2d6 ácido'}], rasgos:[{nombre:'Dividirse', desc:'Si recibe daño cortante/relámpago se divide en dos.'},{nombre:'Disolver', desc:'Corroe armadura/arma al contacto.'},{nombre:'Abrasión', desc:'2d6 de daño ácido a cualquier criatura que lo toque.'}]},
    {nombre:'Arpía', tamaño:'Mediano', tipo:'Monstruosidad', ca:11, pg:'38 (7d8+7)', velocidad:'20 pies, volar 40 pies', des:13, fuer:12, con:12, int:7, sab:10, car:13, habilidades:{}, sentidos:'—', idiomas:'Común', cr:'1', acciones:[{nombre:'Garras', desc:'+3 a golpear, 2d4+1 cortante'},{nombre:'Canto Seductor', desc:'TS de SAB CD 11 o la criatura se acerca a la arpía.'}], rasgos:[]},
    {nombre:'Basilisco', tamaño:'Mediano', tipo:'Monstruosidad', ca:15, pg:'45 (6d8+18)', velocidad:'20 pies', des:8, fuer:15, con:16, int:2, sab:8, car:7, habilidades:{}, sentidos:'Visión oscura 60 pies', idiomas:'—', cr:'3', acciones:[{nombre:'Mordisco', desc:'+5 a golpear, 2d6+2 perforante + 2d6 veneno'}], rasgos:[{nombre:'Mirada Petrificante', desc:'Si el basilisco ve a una criatura a 30 pies, esta debe hacer TS de CON CD 12. Si falla dos veces, queda petrificada.'}]},
    {nombre:'Quimera', tamaño:'Grande', tipo:'Monstruosidad', ca:14, pg:'62 (9d10+36)', velocidad:'30 pies, volar 60 pies', des:11, fuer:19, con:17, int:3, sab:12, car:10, habilidades:{Percepción:'+8'}, sentidos:'Visión oscura 60 pies', idiomas:'Común', cr:'6', acciones:[{nombre:'Mordisco', desc:'+7 a golpear, 2d6+4 perforante'},{nombre:'Cornada', desc:'+7 a golpear, 1d12+4 contundente'},{nombre:'Garras', desc:'+7 a golpear, 2d6+4 cortante'},{nombre:'Aliento de Fuego', desc:'CD 15 DES, 7d8 de daño de fuego en cono.'}], rasgos:[]},
    {nombre:'Dragón Joven (Rojo)', tamaño:'Grande', tipo:'Dragón', ca:18, pg:'119 (14d10+42)', velocidad:'40 pies, volar 80 pies', des:10, fuer:23, con:19, int:14, sab:11, car:19, habilidades:{Percepción:'+9',Sigilo:'+5'}, sentidos:'Visión ciega 30 pies, visión oscura 120 pies', idiomas:'Común, Dragónico', cr:'10', acciones:[{nombre:'Mordisco', desc:'+10 a golpear, 2d10+6 perforante + 2d6 fuego'},{nombre:'Garras', desc:'+10 a golpear, 2d6+6 cortante'},{nombre:'Aliento de Fuego', desc:'CD 19 DES, 16d6 de daño de fuego en cono.'}], rasgos:[{nombre:'Resistencia Legendaria', desc:'3 veces al día, puede tener éxito en una TS fallida.'}]},
  ],
  alineamientos: ['Legal Bueno', 'Neutral Bueno', 'Caótico Bueno', 'Legal Neutral', 'Neutral', 'Caótico Neutral', 'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado'],
  tiradas_dados_golpe: {
    'Barbarian': 'd12',
    'Bard': 'd8',
    'Cleric': 'd8',
    'Druid': 'd8',
    'Fighter': 'd10',
    'Monk': 'd8',
    'Paladin': 'd10',
    'Ranger': 'd10',
    'Rogue': 'd8',
    'Sorcerer': 'd6',
    'Warlock': 'd8',
    'Wizard': 'd6'
  }
};
// English aliases for HTML interface
(function(e){
  e.races=e.razas; e.subraces=e.subrazas; e.classes=e.clases; e.backgrounds=e.trasfondos;
  e.spells=e.hechizos; e.skillsByAbility=e.habilidades;
  e.armor=e.equipo&&e.equipo.armaduras?e.equipo.armaduras:[];
  e.conditions=[];
  // Add computed aliases for class properties
  var clsList = e.clases || [];
  clsList.forEach(function(c){
    if(c.dado_golpe && !c.hitDie) c.hitDie = parseInt(c.dado_golpe.replace('d',''));
    if(c.competencias && c.competencias.salvaciones && !c.savingThrows) c.savingThrows = c.competencias.salvaciones;
  });
})(DND);
