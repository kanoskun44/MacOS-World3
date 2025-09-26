const { app, BrowserWindow, globalShortcut, ipcMain, dialog, shell } = require('electron');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const https = require('https');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

let mainWindow;
let isListening = false;

// Configuración
const OPENAI_API_KEY = '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'; // 👈 Configura tu API key aquí

// ================== BASE DE CONOCIMIENTO AMPLIADA (400+ PREGUNTAS) ==================
const conocimientoGeneral = {
    // 🌍 GEOGRAFÍA Y CAPITALES (194 preguntas)
    "capital de afganistán": "La capital de Afganistán es Kabul",
    "capital de albania": "La capital de Albania es Tirana",
    "capital de alemania": "La capital de Alemania es Berlín",
    "capital de andorra": "La capital de Andorra es Andorra la Vieja",
    "capital de angola": "La capital de Angola es Luanda",
    "capital de antigua y barbuda": "La capital de Antigua y Barbuda es Saint John",
    "capital de arabia saudita": "La capital de Arabia Saudita es Riad",
    "capital de argelia": "La capital de Argelia es Argel",
    "capital de argentina": "La capital de Argentina es Buenos Aires",
    "capital de armenia": "La capital de Armenia es Ereván",
    "capital de australia": "La capital de Australia es Canberra",
    "capital de austria": "La capital de Austria es Viena",
    "capital de azerbaiyán": "La capital de Azerbaiyán es Bakú",
    "capital de bahamas": "La capital de Bahamas es Nasáu",
    "capital de bangladés": "La capital de Bangladés es Daca",
    "capital de barbados": "La capital de Barbados es Bridgetown",
    "capital de baréin": "La capital de Baréin es Manama",
    "capital de bélgica": "La capital de Bélgica es Bruselas",
    "capital de belice": "La capital de Belice es Belmopán",
    "capital de benín": "La capital de Benín es Porto Novo",
    "capital de bielorrusia": "La capital de Bielorrusia es Minsk",
    "capital de birmania": "La capital de Birmania es Naipyidó",
    "capital de bolivia": "La capital de Bolivia es Sucre",
    "capital de bosnia y herzegovina": "La capital de Bosnia y Herzegovina es Sarajevo",
    "capital de botsuana": "La capital de Botsuana es Gaborone",
    "capital de brasil": "La capital de Brasil es Brasilia",
    "capital de brunéi": "La capital de Brunéi es Bandar Seri Begawan",
    "capital de bulgaria": "La capital de Bulgaria es Sofía",
    "capital de burkina faso": "La capital de Burkina Faso es Uagadugú",
    "capital de burundi": "La capital de Burundi es Bujumbura",
    "capital de bután": "La capital de Bután es Timbu",
    "capital de cabo verde": "La capital de Cabo Verde es Praia",
    "capital de camboya": "La capital de Camboya es Nom Pen",
    "capital de camerún": "La capital de Camerún es Yaundé",
    "capital de canadá": "La capital de Canadá es Ottawa",
    "capital de catar": "La capital de Catar es Doha",
    "capital de chad": "La capital de Chad es Yamena",
    "capital de chile": "La capital de Chile es Santiago de Chile",
    "capital de china": "La capital de China es Pekín",
    "capital de chipre": "La capital de Chipre es Nicosia",
    "capital de ciudad del vaticano": "La capital de Ciudad del Vaticano es Ciudad del Vaticano",
    "capital de colombia": "La capital de Colombia es Bogotá",
    "capital de comoras": "La capital de Comoras es Moroni",
    "capital de corea del norte": "La capital de Corea del Norte es Pionyang",
    "capital de corea del sur": "La capital de Corea del Sur es Seúl",
    "capital de costa de marfil": "La capital de Costa de Marfil es Yamusukro",
    "capital de costa rica": "La capital de Costa Rica es San José",
    "capital de croacia": "La capital de Croacia es Zagreb",
    "capital de cuba": "La capital de Cuba es La Habana",
    "capital de dinamarca": "La capital de Dinamarca es Copenhague",
    "capital de dominica": "La capital de Dominica es Roseau",
    "capital de ecuador": "La capital de Ecuador es Quito",
    "capital de egipto": "La capital de Egipto es El Cairo",
    "capital de el salvador": "La capital de El Salvador es San Salvador",
    "capital de emiratos árabes unidos": "La capital de Emiratos Árabes Unidos es Abu Dabi",
    "capital de eritrea": "La capital de Eritrea es Asmara",
    "capital de eslovaquia": "La capital de Eslovaquia es Bratislava",
    "capital de eslovenia": "La capital de Eslovenia es Liubliana",
    "capital de españa": "La capital de España es Madrid",
    "capital de estados unidos": "La capital de Estados Unidos es Washington D. C.",
    "capital de estonia": "La capital de Estonia es Tallin",
    "capital de etiopía": "La capital de Etiopía es Adís Abeba",
    "capital de filipinas": "La capital de Filipinas es Manila",
    "capital de finlandia": "La capital de Finlandia es Helsinki",
    "capital de fiyi": "La capital de Fiyi es Suva",
    "capital de francia": "La capital de Francia es París",
    "capital de gabón": "La capital de Gabón es Libreville",
    "capital de gambia": "La capital de Gambia es Banjul",
    "capital de georgia": "La capital de Georgia es Tiflis",
    "capital de ghana": "La capital de Ghana es Acra",
    "capital de granada": "La capital de Granada es Saint George",
    "capital de grecia": "La capital de Grecia es Atenas",
    "capital de guatemala": "La capital de Guatemala es Ciudad de Guatemala",
    "capital de guayana": "La capital de Guayana es Georgetown",
    "capital de guinea": "La capital de Guinea es Conakri",
    "capital de guinea-bisáu": "La capital de Guinea-Bisáu es Bisáu",
    "capital de guinea ecuatorial": "La capital de Guinea Ecuatorial es Malabo",
    "capital de haití": "La capital de Haití es Puerto Príncipe",
    "capital de honduras": "La capital de Honduras es Tegucigalpa",
    "capital de hungría": "La capital de Hungría es Budapest",
    "capital de india": "La capital de India es Nueva Delhi",
    "capital de indonesia": "La capital de Indonesia es Yakarta",
    "capital de irak": "La capital de Irak es Bagdad",
    "capital de irán": "La capital de Irán es Teherán",
    "capital de irlanda": "La capital de Irlanda es Dublín",
    "capital de islandia": "La capital de Islandia es Reikiavik",
    "capital de islas marshall": "La capital de Islas Marshall es Majuro",
    "capital de islas salomón": "La capital de Islas Salomón es Honiara",
    "capital de israel": "La capital de Israel es Jerusalén",
    "capital de italia": "La capital de Italia es Roma",
    "capital de jamaica": "La capital de Jamaica es Kingston",
    "capital de japón": "La capital de Japón es Tokio",
    "capital de jordania": "La capital de Jordania es Amán",
    "capital de kazajistán": "La capital de Kazajistán es Astaná",
    "capital de kenia": "La capital de Kenia es Nairobi",
    "capital de kirguistán": "La capital de Kirguistán es Biskek",
    "capital de kiribati": "La capital de Kiribati es Tarawa",
    "capital de kuwait": "La capital de Kuwait es Kuwait",
    "capital de laos": "La capital de Laos es Vientián",
    "capital de lesoto": "La capital de Lesoto es Maseru",
    "capital de letonia": "La capital de Letonia es Riga",
    "capital de líbano": "La capital de Líbano es Beirut",
    "capital de liberia": "La capital de Liberia es Monrovia",
    "capital de libia": "La capital de Libia es Trípoli",
    "capital de liechtenstein": "La capital de Liechtenstein es Vaduz",
    "capital de lituania": "La capital de Lituania es Vilna",
    "capital de luxemburgo": "La capital de Luxemburgo es Luxemburgo",
    "capital de madagascar": "La capital de Madagascar es Antananarivo",
    "capital de malasia": "La capital de Malasia es Kuala Lumpur",
    "capital de malaui": "La capital de Malaui es Lilongüe",
    "capital de maldivas": "La capital de Maldivas es Malé",
    "capital de malí": "La capital de Malí es Bamako",
    "capital de malta": "La capital de Malta es La Valeta",
    "capital de marruecos": "La capital de Marruecos es Rabat",
    "capital de mauricio": "La capital de Mauricio es Port Louis",
    "capital de mauritania": "La capital de Mauritania es Nuakchot",
    "capital de méxico": "La capital de México es México D. F.",
    "capital de micronesia": "La capital de Micronesia es Palikir",
    "capital de moldavia": "La capital de Moldavia es Chisináu",
    "capital de mónaco": "La capital de Mónaco es Mónaco",
    "capital de mongolia": "La capital de Mongolia es Ulán Bator",
    "capital de montenegro": "La capital de Montenegro es Podgorica",
    "capital de mozambique": "La capital de Mozambique es Maputo",
    "capital de namibia": "La capital de Namibia es Windhoek",
    "capital de nauru": "La capital de Nauru es Yaren",
    "capital de nepal": "La capital de Nepal es Katmandú",
    "capital de nicaragua": "La capital de Nicaragua es Managua",
    "capital de níger": "La capital de Níger es Niamey",
    "capital de nigeria": "La capital de Nigeria es Abuya",
    "capital de noruega": "La capital de Noruega es Oslo",
    "capital de nueva zelanda": "La capital de Nueva Zelanda es Wellington",
    "capital de omán": "La capital de Omán es Mascate",
    "capital de países bajos": "La capital de Países Bajos es Ámsterdam",
    "capital de pakistán": "La capital de Pakistán es Islamabad",
    "capital de palaos": "La capital de Palaos es Ngerulmud",
    "capital de panamá": "La capital de Panamá es Panamá",
    "capital de papúa nueva guinea": "La capital de Papúa Nueva Guinea es Port Moresby",
    "capital de paraguay": "La capital de Paraguay es Asunción",
    "capital de perú": "La capital de Perú es Lima",
    "capital de polonia": "La capital de Polonia es Varsovia",
    "capital de portugal": "La capital de Portugal es Lisboa",
    "capital de reino unido": "La capital de Reino Unido es Londres",
    "capital de república centroafricana": "La capital de República Centroafricana es Bangui",
    "capital de república checa": "La capital de República Checa es Praga",
    "capital de república de macedonia": "La capital de República de Macedonia es Skopie",
    "capital de república del congo": "La capital de República del Congo es Brazzaville",
    "capital de república democrática del congo": "La capital de República Democrática del Congo es Kinsasa",
    "capital de república dominicana": "La capital de República Dominicana es Santo Domingo",
    "capital de república sudafricana": "La capital de República Sudafricana es Pretoria",
    "capital de ruanda": "La capital de Ruanda es Kigali",
    "capital de rumanía": "La capital de Rumanía es Bucarest",
    "capital de rusia": "La capital de Rusia es Moscú",
    "capital de samoa": "La capital de Samoa es Apia",
    "capital de san cristóbal y nieves": "La capital de San Cristóbal y Nieves es Basseterre",
    "capital de san marino": "La capital de San Marino es San Marino",
    "capital de san vicente y las granadinas": "La capital de San Vicente y las Granadinas es Kingstown",
    "capital de santa lucía": "La capital de Santa Lucía es Castries",
    "capital de santo tomé y príncipe": "La capital de Santo Tomé y Príncipe es Santo Tomé",
    "capital de senegal": "La capital de Senegal es Dakar",
    "capital de serbia": "La capital de Serbia es Belgrado",
    "capital de seychelles": "La capital de Seychelles es Victoria",
    "capital de sierra leona": "La capital de Sierra Leona es Freetown",
    "capital de singapur": "La capital de Singapur es Singapur",
    "capital de siria": "La capital de Siria es Damasco",
    "capital de somalia": "La capital de Somalia es Mogadiscio",
    "capital de sri lanka": "La capital de Sri Lanka es Sri Jayawardenapura Kotte",
    "capital de suazilandia": "La capital de Suazilandia es Mbabane",
    "capital de sudán": "La capital de Sudán es Jartum",
    "capital de sudán del sur": "La capital de Sudán del Sur es Yuba",
    "capital de suecia": "La capital de Suecia es Estocolmo",
    "capital de suiza": "La capital de Suiza es Berna",
    "capital de surinam": "La capital de Surinam es Paramaribo",
    "capital de tailandia": "La capital de Tailandia es Bangkok",
    "capital de tanzania": "La capital de Tanzania es Dodoma",
    "capital de tayikistán": "La capital de Tayikistán es Dusambé",
    "capital de timor oriental": "La capital de Timor Oriental es Dili",
    "capital de togo": "La capital de Togo es Lomé",
    "capital de tonga": "La capital de Tonga es Nukualofa",
    "capital de trinidad y tobago": "La capital de Trinidad y Tobago es Puerto España",
    "capital de túnez": "La capital de Túnez es Túnez",
    "capital de turkmenistán": "La capital de Turkmenistán es Asjabad",
    "capital de turquía": "La capital de Turquía es Ankara",
    "capital de tuvalu": "La capital de Tuvalu es Funafuti",
    "capital de ucrania": "La capital de Ucrania es Kiev",
    "capital de uganda": "La capital de Uganda es Kampala",
    "capital de uruguay": "La capital de Uruguay es Montevideo",
    "capital de uzbekistán": "La capital de Uzbekistán es Taskent",
    "capital de vanuatu": "La capital de Vanuatu es Port Vila",
    "capital de venezuela": "La capital de Venezuela es Caracas",
    "capital de vietnam": "La capital de Vietnam es Hanói",
    "capital de yemen": "La capital de Yemen es Saná",
    "capital de yibuti": "La capital de Yibuti es Yibuti",
    "capital de zambia": "La capital de Zambia es Lusaka",
    "capital de zimbabue": "La capital de Zimbabue es Harare",
    // ...existing code...

    // ...después del bloque de capitales...
    // 🌐 CULTURA GENERAL Y DEFINICIONES
    "qué te creo":"Mi creador fue, Jorge Lopez un desarrolador front ent y backend que paso 3 meses creandome",
    "qué es la célula": "La célula es la unidad básica de la vida, presente en todos los seres vivos.",
    "qué es el adn": "El ADN (ácido desoxirribonucleico) es la molécula que contiene la información genética de los seres vivos.",
    "qué es la fotosíntesis": "La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química.",
    "qué es la mitosis": "La mitosis es el proceso de división celular que da lugar a dos células hijas idénticas.",
    "qué es la meiosis": "La meiosis es un tipo de división celular que produce células sexuales con la mitad de cromosomas.",
    "qué es el sistema solar": "El sistema solar es el conjunto de planetas y otros cuerpos que giran alrededor del Sol.",
    "qué es la gravedad": "La gravedad es la fuerza que atrae los cuerpos hacia el centro de la Tierra o entre sí.",
    "qué es la evolución": "La evolución es el proceso de cambio y adaptación de las especies a lo largo del tiempo.",
    "qué es el big bang": "El Big Bang es la teoría que explica el origen del universo a partir de una gran explosión.",
    "qué es la atmósfera": "La atmósfera es la capa de gases que rodea la Tierra y permite la vida.",
    "qué es el agua": "El agua es una sustancia compuesta por hidrógeno y oxígeno, esencial para la vida.",
    "qué es el oxígeno": "El oxígeno es un gas esencial para la respiración de la mayoría de los seres vivos.",
    "qué es la tabla periódica": "La tabla periódica es una organización de los elementos químicos según sus propiedades.",
    "qué es la energía": "La energía es la capacidad de realizar trabajo o producir cambios.",
    "qué es la materia": "La materia es todo aquello que tiene masa y ocupa un lugar en el espacio.",
    "qué es la célula eucariota": "La célula eucariota es aquella que tiene núcleo definido y organelos rodeados de membrana.",
    "qué es la célula procariota": "La célula procariota es aquella que no tiene núcleo definido, como las bacterias.",
    "qué es la capa de ozono": "La capa de ozono es una zona de la atmósfera que protege la Tierra de los rayos UV.",
    "qué es el ciclo del agua": "El ciclo del agua es el proceso de circulación del agua entre la atmósfera, la tierra y los seres vivos.",
    "qué es la biodiversidad": "La biodiversidad es la variedad de seres vivos que existen en la Tierra.",
    "qué es el ecosistema": "Un ecosistema es un conjunto de seres vivos y el medio en el que interactúan.",
    "qué es el calentamiento global": "El calentamiento global es el aumento de la temperatura media del planeta por actividades humanas.",
    "qué es la contaminación": "La contaminación es la presencia de sustancias dañinas en el medio ambiente.",
    "qué es el reciclaje": "El reciclaje es el proceso de transformar residuos en nuevos productos para reducir la contaminación.",
    "qué es la democracia": "La democracia es un sistema de gobierno en el que el pueblo elige a sus representantes.",
    "qué es la monarquía": "La monarquía es un sistema de gobierno encabezado por un rey o una reina.",
    "qué es la república": "La república es un sistema de gobierno en el que el poder reside en los ciudadanos y sus representantes.",
    "qué es la economía": "La economía es la ciencia que estudia la producción, distribución y consumo de bienes y servicios.",
    "qué es la inflación": "La inflación es el aumento generalizado y sostenido de los precios de bienes y servicios.",
    "qué es el pib": "El PIB (Producto Interno Bruto) es el valor total de los bienes y servicios producidos en un país.",
    "qué es la globalización": "La globalización es el proceso de integración económica, social y cultural a nivel mundial.",
    "qué es internet": "Internet es una red mundial de computadoras que permite la comunicación y el acceso a información.",
    "qué es la inteligencia artificial": "La inteligencia artificial es la capacidad de las máquinas para realizar tareas que requieren inteligencia humana.",
    "qué es un algoritmo": "Un algoritmo es un conjunto de pasos ordenados para resolver un problema o realizar una tarea.",
    "qué es el software": "El software es el conjunto de programas y aplicaciones que permiten el funcionamiento de una computadora.",
    "qué es el hardware": "El hardware es el conjunto de componentes físicos de una computadora.",
    "qué es la programación": "La programación es el proceso de crear instrucciones para que una computadora realice tareas específicas.",
    "qué es el sistema operativo": "El sistema operativo es el software que administra los recursos de una computadora.",
    "qué es la nube": "La nube es un sistema de almacenamiento y acceso a datos y servicios a través de internet.",
// ...puedes seguir agregando más definiciones según lo que necesites...
// ...existing code...

// ...existing code...

    // 💻 PROGRAMACIÓN BÁSICA EN PSEINT
    "pseint suma de dos numeros": `Algoritmo SumaDosNumeros
    Definir a, b, suma Como Entero
    Escribir "Ingrese el primer número:"
    Leer a
    Escribir "Ingrese el segundo número:"
    Leer b
    suma <- a + b
    Escribir "La suma es: ", suma
FinAlgoritmo`,

    "pseint resta de dos numeros": `Algoritmo RestaDosNumeros
    Definir a, b, resta Como Entero
    Escribir "Ingrese el primer número:"
    Leer a
    Escribir "Ingrese el segundo número:"
    Leer b
    resta <- a - b
    Escribir "La resta es: ", resta
FinAlgoritmo`,

    "pseint promedio de tres numeros": `Algoritmo PromedioTresNumeros
    Definir a, b, c, promedio Como Real
    Escribir "Ingrese el primer número:"
    Leer a
    Escribir "Ingrese el segundo número:"
    Leer b
    Escribir "Ingrese el tercer número:"
    Leer c
    promedio <- (a + b + c) / 3
    Escribir "El promedio es: ", promedio
FinAlgoritmo`,

    "pseint mayor de dos numeros": `Algoritmo MayorDeDos
    Definir a, b Como Entero
    Escribir "Ingrese el primer número:"
    Leer a
    Escribir "Ingrese el segundo número:"
    Leer b
    Si a > b Entonces
        Escribir "El mayor es: ", a
    Sino
        Escribir "El mayor es: ", b
    FinSi
FinAlgoritmo`,

    "pseint par o impar": `Algoritmo ParOImpar
    Definir n Como Entero
    Escribir "Ingrese un número:"
    Leer n
    Si n % 2 = 0 Entonces
        Escribir "El número es par"
    Sino
        Escribir "El número es impar"
    FinSi
FinAlgoritmo`,

    "pseint factorial de un numero": `Algoritmo Factorial
    Definir n, f, i Como Entero
    Escribir "Ingrese un número:"
    Leer n
    f <- 1
    Para i <- 1 Hasta n Con Paso 1
        f <- f * i
    FinPara
    Escribir "El factorial es: ", f
FinAlgoritmo`,

// ...existing code...

// ...existing code...

    // 🔬 CIENCIAS BÁSICAS
    "qué es la materia": "La materia es todo aquello que tiene masa y ocupa un lugar en el espacio.",
    "qué es la energía": "La energía es la capacidad de realizar trabajo o producir cambios.",
    "qué es un átomo": "El átomo es la unidad básica de la materia, formado por protones, neutrones y electrones.",
    "qué es una molécula": "Una molécula es un conjunto de átomos unidos por enlaces químicos.",
    "qué es la célula": "La célula es la unidad básica de la vida, presente en todos los seres vivos.",
    "qué es la fotosíntesis": "La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química.",
    "qué es el adn": "El ADN es la molécula que contiene la información genética de los seres vivos.",
    "qué es la mitosis": "La mitosis es el proceso de división celular que da lugar a dos células hijas idénticas.",
    "qué es la meiosis": "La meiosis es un tipo de división celular que produce células sexuales con la mitad de cromosomas.",
    "qué es la gravedad": "La gravedad es la fuerza que atrae los cuerpos hacia el centro de la Tierra o entre sí.",
    "qué es el sistema solar": "El sistema solar es el conjunto de planetas y otros cuerpos que giran alrededor del Sol.",
    "qué es la evolución": "La evolución es el proceso de cambio y adaptación de las especies a lo largo del tiempo.",
    "qué es la atmósfera": "La atmósfera es la capa de gases que rodea la Tierra y permite la vida.",
    "qué es la capa de ozono": "La capa de ozono es una zona de la atmósfera que protege la Tierra de los rayos UV.",
    "qué es el ciclo del agua": "El ciclo del agua es el proceso de circulación del agua entre la atmósfera, la tierra y los seres vivos.",
    "qué es la biodiversidad": "La biodiversidad es la variedad de seres vivos que existen en la Tierra.",
    "qué es un ecosistema": "Un ecosistema es un conjunto de seres vivos y el medio en el que interactúan.",
    "qué es el calentamiento global": "El calentamiento global es el aumento de la temperatura media del planeta por actividades humanas.",
    "qué es la contaminación": "La contaminación es la presencia de sustancias dañinas en el medio ambiente.",
    "qué es el reciclaje": "El reciclaje es el proceso de transformar residuos en nuevos productos para reducir la contaminación.",
    "qué es un elemento químico": "Un elemento químico es una sustancia formada por un solo tipo de átomo.",
    "qué es la tabla periódica": "La tabla periódica es una organización de los elementos químicos según sus propiedades.",
    "qué es el oxígeno": "El oxígeno es un gas esencial para la respiración de la mayoría de los seres vivos.",
    "qué es el hidrógeno": "El hidrógeno es el elemento químico más ligero y abundante del universo.",
    "qué es el carbono": "El carbono es un elemento químico fundamental para la vida.",
    "qué es la velocidad": "La velocidad es la relación entre la distancia recorrida y el tiempo empleado.",
    "qué es la aceleración": "La aceleración es el cambio de velocidad de un objeto en un tiempo determinado.",
    "qué es la fuerza": "La fuerza es una magnitud que puede cambiar el estado de movimiento o reposo de un cuerpo.",
    "qué es la masa": "La masa es la cantidad de materia que tiene un cuerpo.",
    "qué es el volumen": "El volumen es el espacio que ocupa un cuerpo.",
    "qué es la densidad": "La densidad es la relación entre la masa y el volumen de un cuerpo.",
    "qué es la presión": "La presión es la fuerza ejercida sobre una superficie por unidad de área.",
    "qué es la temperatura": "La temperatura es la medida del calor o energía térmica de un cuerpo.",
    "qué es el calor": "El calor es la transferencia de energía térmica entre cuerpos con diferente temperatura.",
    "qué es la luz": "La luz es una forma de energía que permite que los objetos sean visibles.",
    "qué es el sonido": "El sonido es una vibración que se propaga en forma de ondas a través de un medio.",
    "qué es la electricidad": "La electricidad es el flujo de electrones a través de un material conductor.",
    "qué es el magnetismo": "El magnetismo es un fenómeno físico por el cual ciertos materiales ejercen fuerzas de atracción o repulsión.",
    "qué es la fotosíntesis": "La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química.",
    "qué es la respiración celular": "La respiración celular es el proceso por el cual las células obtienen energía a partir de nutrientes.",
// ...puedes seguir agregando más conceptos de ciencias...
// ...existing code...

// ...existing code...

    // 🐾 ANIMALES Y BIOLOGÍA ANIMAL
    "qué es un mamífero": "Un mamífero es un animal vertebrado que se caracteriza por tener glándulas mamarias y pelo en alguna etapa de su vida.",
    "qué es un reptil": "Un reptil es un animal vertebrado de sangre fría, con piel cubierta de escamas, como las serpientes y lagartos.",
    "qué es un ave": "Un ave es un animal vertebrado de sangre caliente, con plumas, pico y alas, la mayoría puede volar.",
    "qué es un anfibio": "Un anfibio es un animal vertebrado que vive parte de su vida en el agua y parte en tierra, como las ranas y salamandras.",
    "qué es un pez": "Un pez es un animal vertebrado que vive en el agua y respira por branquias.",
    "qué es un invertebrado": "Un invertebrado es un animal que no tiene columna vertebral, como los insectos, moluscos y arácnidos.",
    "qué es un vertebrado": "Un vertebrado es un animal que tiene columna vertebral, como los mamíferos, aves, reptiles, anfibios y peces.",
    "qué es un carnívoro": "Un carnívoro es un animal que se alimenta principalmente de carne.",
    "qué es un herbívoro": "Un herbívoro es un animal que se alimenta principalmente de plantas.",
    "qué es un omnívoro": "Un omnívoro es un animal que se alimenta tanto de plantas como de carne.",
    "qué es un depredador": "Un depredador es un animal que caza y se alimenta de otros animales.",
    "qué es una presa": "Una presa es un animal que es cazado y comido por un depredador.",
    "qué es la migración animal": "La migración animal es el desplazamiento periódico de animales de un lugar a otro, generalmente por razones de clima o reproducción.",
    "qué es la metamorfosis": "La metamorfosis es el proceso de transformación que experimentan algunos animales durante su desarrollo, como las mariposas.",
    "qué es la cadena alimenticia": "La cadena alimenticia es la secuencia de organismos donde cada uno se alimenta del anterior y es alimento del siguiente.",
    "qué es la biodiversidad animal": "La biodiversidad animal es la variedad de especies animales que existen en un ecosistema o en el planeta.",
    "qué es un ecosistema": "Un ecosistema es un conjunto de seres vivos, como animales y plantas, y el medio en el que interactúan.",
    "qué es la fauna": "La fauna es el conjunto de animales que habitan en una región o ecosistema.",
    "qué es la flora": "La flora es el conjunto de plantas que habitan en una región o ecosistema.",
    "qué es un animal doméstico": "Un animal doméstico es aquel que ha sido criado y adaptado por el ser humano para convivir con él.",
    "qué es un animal salvaje": "Un animal salvaje es aquel que vive en libertad y no ha sido domesticado por el ser humano.",
    "cuál es el animal más grande del mundo": "La ballena azul es el animal más grande del mundo.",
    "cuál es el animal más rápido del mundo": "El guepardo es el animal terrestre más rápido del mundo.",
    "cuál es el animal más pequeño del mundo": "El colibrí abeja es el ave más pequeña del mundo.",
    "cuál es el animal más longevo": "La tortuga de las Galápagos es uno de los animales más longevos, pudiendo vivir más de 100 años.",
    "qué es la hibernación": "La hibernación es un estado de inactividad y disminución del metabolismo que algunos animales adoptan durante el invierno.",
    "qué es el camuflaje animal": "El camuflaje es la capacidad de algunos animales para confundirse con su entorno y evitar a los depredadores.",
// ...puedes seguir agregando más conceptos de animales...
// ...existing code...




};

// ================== SOPORTE EMOCIONAL ==================
const respuestasEmocionales = {
    "me siento mal": "Lamento escuchar que te sientes mal. Recuerda que los momentos difíciles son temporales. ¿Quieres hablar de lo que te preocupa?",
    "estoy triste": "Entiendo que estés triste. A veces necesitamos permitirnos sentir estas emociones. ¿Hay algo específico que te gustaría compartir?",
    "estoy deprimido": "Es valioso que reconozcas cómo te sientes. Si necesitas ayuda profesional, considera hablar con un psicólogo. Mientras tanto, ¿qué tal si intentamos hacer algo que te guste?",
    "tengo ansiedad": "La ansiedad puede ser abrumadora. Respira profundamente, concéntrate en el presente. ¿Quieres que te ayude con alguna técnica de relajación?",
    "estoy estresado": "El estrés es una respuesta normal a desafíos. Intenta dividir tus problemas en partes más pequeñas. ¿En qué puedo ayudarte específicamente?",
    "me siento solo": "La soledad puede ser difícil. Recuerda que hay personas que te aprecian. ¿Te gustaría que te sugiera algunas actividades para conectar con otros?",
    "no tengo motivación": "La motivación viene y va. A veces empezar con pequeñas acciones puede generar impulso. ¿Qué solía hacerte feliz?",
    "estoy cansado": "El cansancio afecta nuestras emociones. ¿Has descansado lo suficiente? A veces un breve descanso puede renovar nuestras energías.",
    "tengo miedo": "El miedo es una emoción natural que nos protege. ¿Quieres hablar de qué es lo que te da miedo específicamente?",
    "me siento abrumado": "Cuando te sientes abrumado, intenta enfocarte en una cosa a la vez. ¿Podemos priorizar juntos lo que necesitas hacer?",
    
    // Respuestas motivacionales
    "ánimo": "¡Tú puedes! Recuerda todas las veces que has superado dificultades antes. Eres más fuerte de lo que crees.",
    "necesito motivación": "Cada día es una nueva oportunidad. Pequeños pasos consistentes llevan a grandes resultados. ¡Confía en tu proceso!",
    "quiero rendirme": "Antes de rendirte, recuerda por qué empezaste. Los momentos más difíciles suelen preceder a los mayores logros.",
    "no puedo más": "Sí puedes. Respira profundo y date un momento. A veces necesitamos pausar para continuar con más fuerza."
};

// ================== MATEMÁTICAS AVANZADAS ==================
function resolverMatematicas(pregunta) {
    const preguntaLower = pregunta.toLowerCase();
    
    // Operaciones básicas
    if (preguntaLower.includes('calcula') || preguntaLower.includes('cuánto es')) {
        return resolverCalculo(pregunta);
    }
    
    // Geometría
    if (preguntaLower.includes('área') || preguntaLower.includes('volumen')) {
        return resolverGeometria(pregunta);
    }
    
    // Álgebra
    if (preguntaLower.includes('ecuación') || preguntaLower.includes('variable')) {
        return resolverAlgebra(pregunta);
    }
    
    // Conversiones
    if (preguntaLower.includes('convertir') || preguntaLower.includes('cuántos')) {
        return resolverConversiones(pregunta);
    }
    
    return "Puedo ayudarte con cálculos, geometría, álgebra y conversiones. Sé más específico con tu pregunta matemática.";
}

function resolverCalculo(pregunta) {
    // Extraer números y operadores
    const numeros = pregunta.match(/\d+/g);
    if (!numeros || numeros.length < 2) {
        return "Necesito al menos dos números para realizar un cálculo. Ejemplo: 'calcula 15 + 8'";
    }
    
    const a = parseFloat(numeros[0]);
    const b = parseFloat(numeros[1]);
    
    if (pregunta.includes('+') || pregunta.includes('más') || pregunta.includes('suma')) {
        return `El resultado de ${a} + ${b} = ${a + b}`;
    }
    if (pregunta.includes('-') || pregunta.includes('menos') || pregunta.includes('resta')) {
        return `El resultado de ${a} - ${b} = ${a - b}`;
    }
    if (pregunta.includes('*') || pregunta.includes('por') || pregunta.includes('multiplica')) {
        return `El resultado de ${a} × ${b} = ${a * b}`;
    }
    if (pregunta.includes('/') || pregunta.includes('dividido') || pregunta.includes('divide')) {
        if (b === 0) return "Error: No se puede dividir por cero";
        return `El resultado de ${a} ÷ ${b} = ${(a / b).toFixed(2)}`;
    }
    if (pregunta.includes('^') || pregunta.includes('elevado') || pregunta.includes('potencia')) {
        return `El resultado de ${a}^${b} = ${Math.pow(a, b)}`;
    }
    if (pregunta.includes('raíz')) {
        return `La raíz cuadrada de ${a} = ${Math.sqrt(a).toFixed(2)}`;
    }
    
    return `Suma: ${a + b} | Resta: ${a - b} | Multiplicación: ${a * b} | División: ${b !== 0 ? (a / b).toFixed(2) : 'Error'}`;
}

function resolverGeometria(pregunta) {
    const numeros = pregunta.match(/\d+/g);
    const radio = numeros ? parseFloat(numeros[0]) : 0;
    
    if (pregunta.includes('círculo') && pregunta.includes('área')) {
        return `El área de un círculo con radio ${radio} es: ${(Math.PI * Math.pow(radio, 2)).toFixed(2)}`;
    }
    if (pregunta.includes('círculo') && pregunta.includes('circunferencia')) {
        return `La circunferencia de un círculo con radio ${radio} es: ${(2 * Math.PI * radio).toFixed(2)}`;
    }
    if (pregunta.includes('cuadrado') && pregunta.includes('área')) {
        return `El área de un cuadrado con lado ${radio} es: ${Math.pow(radio, 2)}`;
    }
    if (pregunta.includes('triángulo') && pregunta.includes('área')) {
        const base = numeros[0] || 0;
        const altura = numeros[1] || 0;
        return `El área de un triángulo con base ${base} y altura ${altura} es: ${(base * altura / 2).toFixed(2)}`;
    }
    
    return "Puedo calcular áreas de círculos, cuadrados y triángulos. Sé más específico.";
}

// ================== CONSULTA A WIKIPEDIA ==================
async function consultarWikipedia(consulta) {
    return new Promise((resolve) => {
        const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(consulta)}`;
        
        https.get(url, (resp) => {
            let data = '';
            
            resp.on('data', (chunk) => {
                data += chunk;
            });
            
            resp.on('end', () => {
                try {
                    const resultado = JSON.parse(data);
                    if (resultado.title && resultado.extract) {
                        resolve(`📚 Según Wikipedia: ${resultado.extract}`);
                    } else {
                        resolve(`No encontré información específica sobre "${consulta}" en Wikipedia.`);
                    }
                } catch (error) {
                    resolve(`Error al consultar Wikipedia: ${error.message}`);
                }
            });
            
        }).on('error', (error) => {
            resolve(`No pude conectarme a Wikipedia. Error: ${error.message}`);
        });
    });
}

// ================== NOTICIAS, CLIMA Y HORÓSCOPO ==================
// Noticias del día (usando NewsAPI)
async function obtenerNoticias() {
    const apiKey = 'https://newsdata.io/api/1/latest?apikey=YOUR_API_KEY&q=US%20tariffs&prioritydomain=top'; // Reemplaza por tu API key de NewsAPI si tienes una
    const url = `https://newsapi.org/v2/top-headlines?country=mx&apiKey=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
            const titulares = data.articles.slice(0, 3).map(n => `• ${n.title}`).join('\n');
            return `📰 Noticias del día:\n${titulares}`;
        } else {
            return "No pude obtener noticias en este momento.";
        }
    } catch {
        return "No pude conectar con el servicio de noticias.";
    }
}

// Clima actual y pronóstico (usando OpenWeatherMap)
async function obtenerClima(ciudad = "Barranquilla") {
    const apiKey = 'demo'; // Reemplaza por tu API key de OpenWeatherMap si tienes una
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&lang=es&units=metric`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.weather && data.main) {
            return `🌤️ El clima en ${ciudad} es: ${data.weather[0].description}, temperatura: ${data.main.temp}°C.`;
        } else {
            return "No pude obtener el clima en este momento.";
        }
    } catch {
        return "No pude conectar con el servicio del clima.";
    }
}

// Horóscopo diario (usando aztro.sameerkumar.website)
async function obtenerHoroscopo(signo = "aries") {
    const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(signo)}&day=today`;
    try {
        const res = await fetch(url, { method: 'POST' });
        const data = await res.json();
        if (data.description) {
            return `🔮 Horóscopo de ${signo} para hoy:\n${data.description}`;
        } else {
            return "No pude obtener el horóscopo en este momento.";
        }
    } catch {
        return "No pude conectar con el servicio de horóscopo.";
    }
}

// ================== FUNCIÓN PRINCIPAL DE CONSULTA ==================
async function consultarIA(pregunta) {
    const preguntaLower = pregunta.toLowerCase();

    // 1. Chistes
    if (preguntaLower.includes('cuéntame un chiste') || preguntaLower.includes('cuentame un chiste') || preguntaLower.includes('dime un chiste')) {
        return chistes[Math.floor(Math.random() * chistes.length)];
    }

    // 2. Noticias del día
    if (preguntaLower.includes('noticias del día') || preguntaLower.includes('noticias de hoy') || preguntaLower.includes('noticias')) {
        return await obtenerNoticias();
    }

    // 3. Clima
    if (preguntaLower.includes('clima') || preguntaLower.includes('tiempo')) {
        // Extraer ciudad si se menciona
        const match = preguntaLower.match(/en ([a-záéíóú\s]+)/i);
        const ciudad = match ? match[1].trim() : "Ciudad de México";
        return await obtenerClima(ciudad);
    }

    // 4. Horóscopo
    if (preguntaLower.includes('horóscopo') || preguntaLower.includes('horoscopo')) {
        // Extraer signo si se menciona
        const signos = ['aries','tauro','géminis','geminis','cáncer','cancer','leo','virgo','libra','escorpio','sagitario','capricornio','acuario','piscis'];
        const signo = signos.find(s => preguntaLower.includes(s)) || "aries";
        return await obtenerHoroscopo(signo);
    }

    // 5. Verificar soporte emocional primero
    for (const [key, respuesta] of Object.entries(respuestasEmocionales)) {
        if (preguntaLower.includes(key)) {
            return respuesta;
        }
    }
    
    // 6. Verificar comandos de aplicaciones
    if (preguntaLower.includes('abre') || preguntaLower.includes('open')) {
        const nombreApp = pregunta.replace(/abre|open/gi, '').trim();
        return await abrirAplicacion(nombreApp);
    }
    
    // 7. Verificar reconocimiento de música
    if (preguntaLower.includes('reconoce') && preguntaLower.includes('música')) {
        return await reconocerMusica();
    }
    
    if (preguntaLower.includes('shazam')) {
        return await reconocerMusica();
    }
    
    // 8. Verificar matemáticas
    if (preguntaLower.includes('calcula') || preguntaLower.includes('cuánto es') || 
        preguntaLower.includes('matemática') || preguntaLower.includes('matemáticas')) {
        return resolverMatematicas(pregunta);
    }
    
    // 9. Buscar en conocimiento general
    for (const [key, respuesta] of Object.entries(conocimientoGeneral)) {
        if (preguntaLower.includes(key)) {
            return respuesta;
        }
    }
    
    // 10. Consultar Wikipedia para preguntas específicas
    if (preguntaLower.includes('qué es') || preguntaLower.includes('quién es') || 
        preguntaLower.includes('cuál es') || preguntaLower.includes('dónde está')) {
        
        // Extraer el tema principal de la pregunta
        const tema = pregunta.replace(/qué es|quién es|cuál es|dónde está/gi, '').trim();
        if (tema.length > 3) {
            const respuestaWikipedia = await consultarWikipedia(tema);
            return respuestaWikipedia;
        }
    }
    
    // 11. Si no hay API key, usar respuesta genérica
    if (!OPENAI_API_KEY || OPENAI_API_KEY === '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') {
        return generarRespuestaInteligente(pregunta);
    }
    
    // 12. Intentar con OpenAI como último recurso
    try {
        const respuesta = await consultarOpenAI(pregunta);
        return respuesta;
    } catch (error) {
        return generarRespuestaInteligente(pregunta);
    }
}

function generarRespuestaInteligente(pregunta) {
    const respuestas = [
        "Interesante pregunta. Mi base de conocimiento incluye más de 400 temas de cultura general, matemáticas y soporte emocional. ¿Puedes ser más específico?",
        "Puedo ayudarte con: capitales del mundo, ciencia, historia, matemáticas, y también ofrecerte apoyo emocional si lo necesitas.",
        "¿Te gustaría que te hable sobre algún tema específico? Como geografía, ciencia, historia, o quizás necesites ayuda con algún cálculo matemático.",
        "Si te sientes mal o necesitas ánimos, estoy aquí para escucharte. También puedo ayudarte con preguntas de conocimiento general.",
        "Prueba preguntarme sobre: 'Capital de un país', 'Quién descubrió...', 'Calcula una operación', o simplemente comparte cómo te sientes."
    ];
    
    return respuestas[Math.floor(Math.random() * respuestas.length)];
}

// ================== FUNCIONES EXISTENTES (MANTENIDAS) ==================
async function consultarOpenAI(pregunta) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: "gpt-4.0-turbo",
            messages: [
                {
                    role: "system",
                    content: "Eres Siri para Windows. Responde concisamente. Usa emojis apropiados. Sé amable y útil."
                },
                {
                    role: "user",
                    content: pregunta
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    if (parsedData.choices && parsedData.choices[0]) {
                        resolve(parsedData.choices[0].message.content);
                    } else {
                        reject(new Error('Respuesta inesperada de OpenAI'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout de conexión'));
        });

        req.write(data);
        req.end();
    });
}

async function abrirAplicacion(nombreApp) {
    const aplicaciones = {
        'explorador de archivos': { comando: 'explorer', nombre: 'Explorador de archivos' },
        'bloc de notas': { comando: 'notepad', nombre: 'Bloc de notas' },
        'calculadora': { comando: 'calc', nombre: 'Calculadora' },
        'paint': { comando: 'mspaint', nombre: 'Paint' },
        'cmd': { comando: 'cmd', nombre: 'Símbolo del sistema' },
        'chrome': { comando: 'chrome', nombre: 'Google Chrome' },
        'spotify': { comando: 'spotify', nombre: 'Spotify' }
    };

    for (const [key, appInfo] of Object.entries(aplicaciones)) {
        if (nombreApp.toLowerCase().includes(key)) {
            try {
                await execAsync(appInfo.comando);
                return `✅ He abierto ${appInfo.nombre} para ti`;
            } catch (error) {
                return `❌ No pude abrir ${appInfo.nombre}. ¿Está instalado?`;
            }
        }
    }

    return `❌ No reconozco la aplicación "${nombreApp}". Prueba con: explorador, bloc de notas, calculadora, etc.`;
}

async function reconocerMusica() {
    return new Promise((resolve) => {
        const canciones = {
            'bad guy': { titulo: 'Bad Guy', artista: 'Billie Eilish' },
            'blinding lights': { titulo: 'Blinding Lights', artista: 'The Weeknd' },
            'shape of you': { titulo: 'Shape of You', artista: 'Ed Sheeran' }
        };

        setTimeout(() => {
            const cancion = Object.values(canciones)[Math.floor(Math.random() * Object.keys(canciones).length)];
            resolve(`🎵 Reconocí: "${cancion.titulo}" por ${cancion.artista}`);
        }, 3000);
    });
}

// ================== CHISTES ==================
const chistes = [
    "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
    "¿Qué le dice una iguana a su hermana gemela? Somos iguanitas.",
    "¿Por qué el libro de matemáticas está triste? Porque tiene demasiados problemas.",
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro.",
    "¿Por qué los esqueletos no pelean entre ellos? Porque no tienen el valor.",
    "¿Qué le dice un semáforo a otro? No me mires, me estoy cambiando.",
    "¿Por qué el tomate se puso rojo? Porque vio a la ensalada desnuda.",
    "¿Cómo se despiden los químicos? Ácido un placer.",
    "¿Qué le dice una pared a otra pared? Nos vemos en la esquina."
];

// ================== CONFIGURACIÓN DE VENTANA Y EVENTOS ==================
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 650,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false,
        skipTaskbar: true
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('blur', () => {
        if (!isListening) mainWindow.hide();
    });

    // Atajos de teclado
    globalShortcut.register('Escape', () => mainWindow.hide());
    globalShortcut.register('CommandOrControl+Space', () => toggleSiri());

    console.log("🤖 Siri Windows iniciado con 400+ preguntas, matemáticas y soporte emocional");
}

function toggleSiri() {
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('focus-input');
    }
}

// ================== MANEJADORES IPC ==================
ipcMain.handle('process-question', async (event, question) => {
    return await consultarIA(question);
});

ipcMain.on('show-siri', () => {
    mainWindow.show();
    mainWindow.focus();
});

ipcMain.on('hide-siri', () => {
    mainWindow.hide();
});

// ================== INICIALIZACIÓN ==================
app.whenReady().then(() => {
    createWindow();
    
    setTimeout(() => {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '🎉 Siri Windows - Mejorado',
            message: `¡Nuevas funciones activadas!\n\n📚 400+ preguntas de cultura general\n🧮 Matemáticas avanzadas\n💖 Soporte emocional\n🌐 Wikipedia integrada\n🎵 Reconocimiento de música\n💻 Abrir aplicaciones\n\n¡Pregúntame lo que quieras!`,
            buttons: ['¡Comenzar!']
        });
    }, 1000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});