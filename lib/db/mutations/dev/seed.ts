import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { generatePrefixedId } from "@/lib/utils/server-utils";

// ─── Address pairs with pre-computed coordinates, geometries, distances ───

interface AddressPair {
    pickup: { street: string; number: string; lat: number; lng: number };
    delivery: { street: string; number: string; lat: number; lng: number };
    distanceM: number;
    durationS: number;
    geometry: { type: "LineString"; coordinates: number[][] };
}

const ADDRESS_PAIRS: AddressPair[] = [
    {
        pickup: { street: "Avenida Alem", number: "1250", lat: -38.701923, lng: -62.270961 },
        delivery: { street: "Chiclana", number: "450", lat: -38.722043, lng: -62.261356 },
        distanceM: 3531.9,
        durationS: 409.5,
        geometry: { type: "LineString", coordinates: [[-62.27091,-38.701995],[-62.271458,-38.70223],[-62.271757,-38.702358],[-62.272347,-38.702812],[-62.273121,-38.702216],[-62.273789,-38.701679],[-62.27485,-38.702529],[-62.27569,-38.703413],[-62.276567,-38.704303],[-62.277618,-38.705107],[-62.276959,-38.705629],[-62.278081,-38.706537],[-62.278812,-38.707144],[-62.279788,-38.707917],[-62.279906,-38.70797],[-62.279443,-38.708316],[-62.278835,-38.70877],[-62.277724,-38.70965],[-62.277468,-38.70985],[-62.276947,-38.710256],[-62.276338,-38.710713],[-62.275786,-38.711132],[-62.275265,-38.711497],[-62.274125,-38.71237],[-62.272987,-38.713234],[-62.272656,-38.713483],[-62.271886,-38.714064],[-62.270745,-38.714954],[-62.269581,-38.715836],[-62.268458,-38.716655],[-62.267954,-38.717043],[-62.267807,-38.717157],[-62.267349,-38.71751],[-62.266962,-38.717808],[-62.266316,-38.718307],[-62.265684,-38.718794],[-62.265302,-38.719089],[-62.264522,-38.71969],[-62.26417,-38.719961],[-62.263124,-38.720768],[-62.262951,-38.720899],[-62.262519,-38.721232],[-62.261977,-38.72165],[-62.261612,-38.721931],[-62.261487,-38.722027],[-62.261411,-38.722086],[-62.261411,-38.722086]] },
    },
    {
        pickup: { street: "Alsina", number: "320", lat: -38.715661, lng: -62.261334 },
        delivery: { street: "Estomba", number: "810", lat: -38.711478, lng: -62.275509 },
        distanceM: 2443.3,
        durationS: 326.1,
        geometry: { type: "LineString", coordinates: [[-62.261268,-38.71571],[-62.26097,-38.715467],[-62.260459,-38.715049],[-62.260161,-38.714799],[-62.260106,-38.714752],[-62.260166,-38.714669],[-62.260241,-38.714622],[-62.260373,-38.714449],[-62.260969,-38.713673],[-62.261292,-38.713292],[-62.261623,-38.71282],[-62.262024,-38.713154],[-62.262463,-38.713513],[-62.263556,-38.71441],[-62.264571,-38.715243],[-62.265706,-38.716176],[-62.266846,-38.715326],[-62.267953,-38.714476],[-62.269096,-38.713585],[-62.270228,-38.712683],[-62.271326,-38.711829],[-62.27235,-38.711007],[-62.273227,-38.711686],[-62.274125,-38.71237],[-62.275165,-38.713199],[-62.276259,-38.712367],[-62.276814,-38.711946],[-62.275786,-38.711132],[-62.275412,-38.711394],[-62.275412,-38.711394]] },
    },
    {
        pickup: { street: "San Martin", number: "150", lat: -38.718139, lng: -62.263072 },
        delivery: { street: "Zelarrayan", number: "1205", lat: -38.706345, lng: -62.278131 },
        distanceM: 1851.3,
        durationS: 284.3,
        geometry: { type: "LineString", coordinates: [[-62.263144,-38.718193],[-62.263679,-38.717759],[-62.263979,-38.717525],[-62.26434,-38.717243],[-62.264813,-38.716873],[-62.265373,-38.716436],[-62.265706,-38.716176],[-62.266846,-38.715326],[-62.267953,-38.714476],[-62.269096,-38.713585],[-62.270228,-38.712683],[-62.271326,-38.711829],[-62.27235,-38.711007],[-62.273589,-38.710072],[-62.274625,-38.70922],[-62.275922,-38.7082],[-62.277009,-38.707372],[-62.278081,-38.706537],[-62.278229,-38.706421],[-62.278229,-38.706421]] },
    },
    {
        pickup: { street: "Mitre", number: "540", lat: -38.711418, lng: -62.269551 },
        delivery: { street: "Soler", number: "255", lat: -38.718417, lng: -62.261097 },
        distanceM: 1070.6,
        durationS: 242.7,
        geometry: { type: "LineString", coordinates: [[-62.269445,-38.71134],[-62.269024,-38.711687],[-62.267893,-38.712614],[-62.267769,-38.712714],[-62.266792,-38.713503],[-62.266026,-38.714127],[-62.265685,-38.714404],[-62.264571,-38.715243],[-62.263715,-38.715948],[-62.262613,-38.71684],[-62.261929,-38.717395],[-62.26152,-38.717726],[-62.260898,-38.718281],[-62.260898,-38.718281]] },
    },
    {
        pickup: { street: "Belgrano", number: "110", lat: -38.718412, lng: -62.262449 },
        delivery: { street: "Donado", number: "620", lat: -38.726438, lng: -62.271914 },
        distanceM: 1213.5,
        durationS: 249.4,
        geometry: { type: "LineString", coordinates: [[-62.262388,-38.718456],[-62.2626,-38.718635],[-62.263166,-38.719112],[-62.263573,-38.719455],[-62.26417,-38.719961],[-62.264774,-38.720477],[-62.265388,-38.721004],[-62.266089,-38.7216],[-62.26643,-38.721872],[-62.266848,-38.72223],[-62.26718,-38.722508],[-62.268306,-38.723448],[-62.269414,-38.724354],[-62.27047,-38.725233],[-62.270566,-38.725278],[-62.270683,-38.725334],[-62.27169,-38.726112],[-62.272008,-38.726367],[-62.272008,-38.726367]] },
    },
    {
        pickup: { street: "Fitz Roy", number: "350", lat: -38.724807, lng: -62.267662 },
        delivery: { street: "O Higgins", number: "905", lat: -38.735974, lng: -62.285975 },
        distanceM: 2826.0,
        durationS: 317.1,
        geometry: { type: "LineString", coordinates: [[-62.267763,-38.724733],[-62.267205,-38.724266],[-62.268306,-38.723448],[-62.26944,-38.722633],[-62.270641,-38.721717],[-62.27176,-38.722599],[-62.272891,-38.723491],[-62.27396,-38.724359],[-62.274712,-38.72497],[-62.275016,-38.725218],[-62.276114,-38.72611],[-62.277158,-38.726959],[-62.277228,-38.727016],[-62.279225,-38.728659],[-62.279298,-38.728722],[-62.280387,-38.729594],[-62.280925,-38.730025],[-62.281447,-38.730447],[-62.28231,-38.73113],[-62.282551,-38.731326],[-62.283126,-38.731786],[-62.283405,-38.73201],[-62.283632,-38.732191],[-62.284482,-38.732871],[-62.284807,-38.733131],[-62.285555,-38.73373],[-62.286633,-38.734596],[-62.287615,-38.735384],[-62.287713,-38.735462],[-62.287251,-38.735823],[-62.286513,-38.73641],[-62.285975,-38.735974],[-62.285975,-38.735974]] },
    },
    {
        pickup: { street: "Brown", number: "1120", lat: -38.729417, lng: -62.255558 },
        delivery: { street: "Vieytes", number: "415", lat: -38.716358, lng: -62.273 },
        distanceM: 2097.2,
        durationS: 222.1,
        geometry: { type: "LineString", coordinates: [[-62.255668,-38.729505],[-62.255898,-38.729329],[-62.25706,-38.728459],[-62.25755,-38.728085],[-62.258202,-38.727592],[-62.25875,-38.727156],[-62.259328,-38.726717],[-62.260465,-38.725846],[-62.260878,-38.725527],[-62.261624,-38.724961],[-62.262792,-38.724082],[-62.263836,-38.723296],[-62.264478,-38.722813],[-62.264984,-38.722432],[-62.26535,-38.722156],[-62.265504,-38.72204],[-62.266089,-38.7216],[-62.266434,-38.72134],[-62.266904,-38.720986],[-62.267232,-38.720739],[-62.268339,-38.719906],[-62.268659,-38.719682],[-62.268719,-38.719639],[-62.269405,-38.719159],[-62.270511,-38.718343],[-62.271593,-38.717524],[-62.272791,-38.716631],[-62.273074,-38.716418],[-62.273074,-38.716418]] },
    },
    {
        pickup: { street: "Castelli", number: "750", lat: -38.715491, lng: -62.279122 },
        delivery: { street: "Rondeau", number: "155", lat: -38.718738, lng: -62.27119 },
        distanceM: 1085.9,
        durationS: 130.3,
        geometry: { type: "LineString", coordinates: [[-62.279,-38.715395],[-62.279517,-38.714998],[-62.278415,-38.714127],[-62.277362,-38.714935],[-62.276214,-38.715817],[-62.275069,-38.716658],[-62.273877,-38.717525],[-62.272684,-38.718438],[-62.271578,-38.719248],[-62.271074,-38.718821],[-62.271074,-38.718821]] },
    },
    {
        pickup: { street: "Patricios", number: "205", lat: -38.715902, lng: -62.276585 },
        delivery: { street: "Casanova", number: "850", lat: -38.709871, lng: -62.26836 },
        distanceM: 980.0,
        durationS: 117.6,
        geometry: { type: "LineString", coordinates: [[-62.276447,-38.716006],[-62.276214,-38.715817],[-62.275079,-38.714917],[-62.274033,-38.714059],[-62.272987,-38.713234],[-62.271326,-38.711829],[-62.269949,-38.710925],[-62.268841,-38.710189],[-62.26836,-38.709871],[-62.26836,-38.709871]] },
    },
    {
        pickup: { street: "11 de Abril", number: "315", lat: -38.711634, lng: -62.266486 },
        delivery: { street: "12 de Octubre", number: "1420", lat: -38.711252, lng: -62.259812 },
        distanceM: 1162.7,
        durationS: 145.3,
        geometry: { type: "LineString", coordinates: [[-62.266558,-38.711572],[-62.265611,-38.710898],[-62.263975,-38.709754],[-62.263332,-38.710592],[-62.262831,-38.711246],[-62.262371,-38.711845],[-62.261623,-38.71282],[-62.261292,-38.713292],[-62.260969,-38.713673],[-62.259726,-38.712647],[-62.259087,-38.712116],[-62.259771,-38.711301],[-62.259812,-38.711252],[-62.259812,-38.711252]] },
    },
    {
        pickup: { street: "Sarmiento", number: "650", lat: -38.710811, lng: -62.259355 },
        delivery: { street: "Rodriguez", number: "960", lat: -38.707465, lng: -62.256974 },
        distanceM: 634.0,
        durationS: 143.3,
        geometry: { type: "LineString", coordinates: [[-62.25926,-38.710881],[-62.259771,-38.711301],[-62.260165,-38.71082],[-62.260533,-38.710384],[-62.259777,-38.709795],[-62.258918,-38.709125],[-62.258077,-38.708482],[-62.257626,-38.708108],[-62.257059,-38.707675],[-62.256883,-38.707534],[-62.256883,-38.707534]] },
    },
    {
        pickup: { street: "Zapiola", number: "410", lat: -38.710799, lng: -62.265917 },
        delivery: { street: "Urquiza", number: "730", lat: -38.704298, lng: -62.262689 },
        distanceM: 1219.6,
        durationS: 168.5,
        geometry: { type: "LineString", coordinates: [[-62.26581,-38.710724],[-62.265611,-38.710898],[-62.263975,-38.709754],[-62.264367,-38.709242],[-62.26489,-38.708565],[-62.265396,-38.70791],[-62.266267,-38.706782],[-62.266411,-38.706609],[-62.267114,-38.705877],[-62.265063,-38.704744],[-62.264956,-38.704656],[-62.264009,-38.704174],[-62.263165,-38.703727],[-62.26257,-38.704209],[-62.26257,-38.704209]] },
    },
    {
        pickup: { street: "Naposta", number: "805", lat: -38.720049, lng: -62.251123 },
        delivery: { street: "Cordoba", number: "1115", lat: -38.670561, lng: -62.2335 },
        distanceM: 8027.8,
        durationS: 818.5,
        geometry: { type: "LineString", coordinates: [[-62.251076,-38.719976],[-62.25226,-38.720353],[-62.25339,-38.719198],[-62.251672,-38.716989],[-62.250247,-38.715937],[-62.249924,-38.715856],[-62.248446,-38.714574],[-62.245678,-38.712406],[-62.242838,-38.710122],[-62.243653,-38.708351],[-62.246421,-38.706398],[-62.247606,-38.705569],[-62.249843,-38.704016],[-62.249576,-38.703125],[-62.244819,-38.699492],[-62.238107,-38.694505],[-62.234657,-38.691438],[-62.234417,-38.691346],[-62.234142,-38.691085],[-62.233953,-38.690761],[-62.231147,-38.688233],[-62.227751,-38.685481],[-62.226028,-38.684108],[-62.223577,-38.682153],[-62.222751,-38.681621],[-62.222191,-38.681618],[-62.221999,-38.681438],[-62.222236,-38.681057],[-62.223097,-38.680611],[-62.226656,-38.677768],[-62.229425,-38.675476],[-62.233684,-38.672384],[-62.234326,-38.671287],[-62.233488,-38.670551],[-62.2335,-38.670561]] },
    },
    {
        pickup: { street: "Mendoza", number: "350", lat: -38.71278, lng: -62.283597 },
        delivery: { street: "Peru", number: "610", lat: -38.677403, lng: -62.236845 },
        distanceM: 7196.6,
        durationS: 696.1,
        geometry: { type: "LineString", coordinates: [[-62.283693,-38.712708],[-62.283111,-38.712267],[-62.282937,-38.712253],[-62.280774,-38.710569],[-62.281763,-38.709806],[-62.283252,-38.708695],[-62.284457,-38.707777],[-62.282338,-38.706081],[-62.280494,-38.704619],[-62.278317,-38.702897],[-62.276396,-38.701376],[-62.27433,-38.69974],[-62.272949,-38.698619],[-62.273329,-38.69806],[-62.273797,-38.697344],[-62.274093,-38.69693],[-62.275862,-38.69558],[-62.273403,-38.693589],[-62.272847,-38.693156],[-62.271552,-38.692728],[-62.267969,-38.691609],[-62.267202,-38.691361],[-62.26647,-38.691125],[-62.265729,-38.690887],[-62.265004,-38.690654],[-62.264488,-38.690489],[-62.262904,-38.689989],[-62.26221,-38.689887],[-62.259676,-38.689776],[-62.259348,-38.689713],[-62.257281,-38.688995],[-62.25425,-38.688303],[-62.252007,-38.687706],[-62.250258,-38.687118],[-62.246693,-38.685526],[-62.243733,-38.684183],[-62.24171,-38.683255],[-62.239759,-38.682334],[-62.237041,-38.680891],[-62.233972,-38.679249],[-62.23386,-38.678748],[-62.235991,-38.677115],[-62.236845,-38.677403]] },
    },
    {
        pickup: { street: "Charlone", number: "920", lat: -38.723397, lng: -62.294878 },
        delivery: { street: "Viamonte", number: "250", lat: -38.720735, lng: -62.274464 },
        distanceM: 2755.6,
        durationS: 388.3,
        geometry: { type: "LineString", coordinates: [[-62.294878,-38.723397],[-62.295846,-38.724174],[-62.295151,-38.724703],[-62.294453,-38.725235],[-62.293343,-38.726079],[-62.292275,-38.725222],[-62.29119,-38.724352],[-62.290324,-38.723658],[-62.289253,-38.722799],[-62.288178,-38.721938],[-62.285999,-38.720199],[-62.284927,-38.719353],[-62.283819,-38.72019],[-62.282721,-38.721038],[-62.28166,-38.720181],[-62.280565,-38.719306],[-62.279441,-38.72017],[-62.27835,-38.721003],[-62.277366,-38.720201],[-62.277245,-38.720163],[-62.277082,-38.720151],[-62.276116,-38.719353],[-62.274885,-38.720266],[-62.274366,-38.720655],[-62.274366,-38.720655]] },
    },
    {
        pickup: { street: "Bravard", number: "505", lat: -38.716023, lng: -62.283146 },
        delivery: { street: "Holdich", number: "845", lat: -38.720503, lng: -62.28445 },
        distanceM: 702.2,
        durationS: 84.3,
        geometry: { type: "LineString", coordinates: [[-62.283053,-38.716092],[-62.283882,-38.716769],[-62.282773,-38.717612],[-62.281684,-38.718467],[-62.282752,-38.719333],[-62.283819,-38.72019],[-62.284331,-38.720595],[-62.284331,-38.720595]] },
    },
    {
        pickup: { street: "Gorriti", number: "155", lat: -38.717909, lng: -62.272298 },
        delivery: { street: "Blandengues", number: "605", lat: -38.720283, lng: -62.279652 },
        distanceM: 923.3,
        durationS: 110.8,
        geometry: { type: "LineString", coordinates: [[-62.272167,-38.718004],[-62.272684,-38.718438],[-62.273769,-38.719341],[-62.274978,-38.718421],[-62.276179,-38.71753],[-62.277309,-38.71846],[-62.278353,-38.719323],[-62.279441,-38.72017],[-62.279615,-38.720311],[-62.279615,-38.720311]] },
    },
    {
        pickup: { street: "Villarino", number: "450", lat: -38.72731, lng: -62.266711 },
        delivery: { street: "Saavedra", number: "710", lat: -38.726759, lng: -62.261262 },
        distanceM: 666.9,
        durationS: 80.0,
        geometry: { type: "LineString", coordinates: [[-62.266804,-38.727239],[-62.266179,-38.726744],[-62.265082,-38.725869],[-62.26386,-38.72492],[-62.262698,-38.725824],[-62.261543,-38.72669],[-62.261356,-38.726833],[-62.261356,-38.726833]] },
    },
    {
        pickup: { street: "Caronti", number: "310", lat: -38.710574, lng: -62.267885 },
        delivery: { street: "Darregueira", number: "555", lat: -38.727306, lng: -62.265672 },
        distanceM: 2607.9,
        durationS: 312.4,
        geometry: { type: "LineString", coordinates: [[-62.267758,-38.710669],[-62.267994,-38.710862],[-62.269024,-38.711687],[-62.270228,-38.712683],[-62.271886,-38.714064],[-62.270745,-38.714954],[-62.269581,-38.715836],[-62.270581,-38.716675],[-62.271593,-38.717524],[-62.272684,-38.718438],[-62.271578,-38.719248],[-62.270475,-38.720052],[-62.269448,-38.720776],[-62.269867,-38.721106],[-62.270641,-38.721717],[-62.27176,-38.722599],[-62.270514,-38.723526],[-62.269414,-38.724354],[-62.268306,-38.725188],[-62.267214,-38.725978],[-62.266179,-38.726744],[-62.265555,-38.727211],[-62.265555,-38.727211]] },
    },
    {
        pickup: { street: "Brandsen", number: "805", lat: -38.716099, lng: -62.25028 },
        delivery: { street: "Corrientes", number: "215", lat: -38.714529, lng: -62.257288 },
        distanceM: 974.0,
        durationS: 143.2,
        geometry: { type: "LineString", coordinates: [[-62.250365,-38.715998],[-62.250498,-38.716067],[-62.251082,-38.716509],[-62.251672,-38.716989],[-62.252272,-38.717454],[-62.253832,-38.718677],[-62.254292,-38.718061],[-62.254462,-38.717834],[-62.254618,-38.71763],[-62.254797,-38.717434],[-62.255574,-38.716478],[-62.25582,-38.716155],[-62.256346,-38.715493],[-62.256482,-38.715326],[-62.256886,-38.714854],[-62.257065,-38.714642],[-62.257199,-38.714483],[-62.257199,-38.714483]] },
    },
];

// ─── Receiver data ───

const RECEIVER_NAMES = [
    "Maria Garcia", "Juan Rodriguez", "Ana Fernandez", "Carlos Lopez",
    "Laura Martinez", "Diego Sanchez", "Valentina Torres", "Martin Gonzalez",
    "Camila Diaz", "Santiago Romero", "Lucia Alvarez", "Nicolas Herrera",
    "Sofia Morales", "Tomas Silva", "Mariana Castro", "Joaquin Ruiz",
    "Florencia Ortiz", "Mateo Gomez", "Isabella Ramos", "Lucas Mendez",
];

const RECEIVER_PHONES = [
    "2915550001", "2915550002", "2915550003", "2915550004",
    "2915550005", "2915550006", "2915550007", "2915550008",
    "2915550009", "2915550010", "2915550011", "2915550012",
    "2915550013", "2915550014", "2915550015", "2915550016",
    "2915550017", "2915550018", "2915550019", "2915550020",
];

// ─── Weight/price tiers ───

interface WeightTier {
    weightKg: number;
    dimensions: { width: number; height: number; depth: number };
    pricePerKm: number;
}

const WEIGHT_TIERS: WeightTier[] = [
    { weightKg: 2.5, dimensions: { width: 20, height: 15, depth: 10 }, pricePerKm: 0.50 },
    { weightKg: 5.0, dimensions: { width: 30, height: 25, depth: 20 }, pricePerKm: 0.50 },
    { weightKg: 12.0, dimensions: { width: 40, height: 35, depth: 25 }, pricePerKm: 1.00 },
    { weightKg: 25.0, dimensions: { width: 50, height: 40, depth: 30 }, pricePerKm: 1.00 },
    { weightKg: 45.0, dimensions: { width: 60, height: 50, depth: 40 }, pricePerKm: 2.00 },
    { weightKg: 120.0, dimensions: { width: 80, height: 70, depth: 60 }, pricePerKm: 4.00 },
    { weightKg: 280.0, dimensions: { width: 100, height: 90, depth: 80 }, pricePerKm: 8.00 },
];

// ─── User IDs ───

const OPERATOR_ID = "usr_01KT27KCG3MXET3RA9KCSKHWQ4";
const CARLOS_ID = "usr_carlos_mendez";
const ANA_ID = "usr_ana_torres";

// ─── Seed function ───

export async function seedDatabase() {
    const now = new Date();

    // 1. Clean existing data (NOT users, NOT quotes)
    await prisma.shipment.deleteMany();
    await prisma.rate.deleteMany();
    await prisma.trackingSequence.deleteMany();

    console.log("[SEED] Cleaned shipments, rates, tracking sequences");

    // 2. Create users if they don't exist
    let usersCreated = 0;

    const carlosExists = await prisma.user.findUnique({ where: { id: CARLOS_ID } });
    if (!carlosExists) {
        await prisma.user.create({
            data: {
                id: CARLOS_ID,
                clerk_user_id: "user_carlos_mendez_seed",
                email: "carlos.mendez+clerk_test@unihousing.com",
                full_name: "Carlos Mendez",
                role: "logistics",
                banned: true,
            },
        });
        usersCreated++;
    }

    const anaExists = await prisma.user.findUnique({ where: { id: ANA_ID } });
    if (!anaExists) {
        await prisma.user.create({
            data: {
                id: ANA_ID,
                clerk_user_id: "user_ana_torres_seed",
                email: "ana.torres+clerk_test@unihousing.com",
                full_name: "Ana Torres",
                role: "logistics",
                banned: false,
            },
        });
        usersCreated++;
    }

    console.log(`[SEED] Users created: ${usersCreated}`);

    // 3. Create rates
    const tarifas = [
        { id: "trf_01J", weight_range: { min: 0, max: 30 }, price_per_km: 0.50 },
        { id: "trf_02J", weight_range: { min: 31, max: 100 }, price_per_km: 1.00 },
        { id: "trf_03J", weight_range: { min: 101, max: 250 }, price_per_km: 2.00 },
        { id: "trf_04J", weight_range: { min: 251, max: 600 }, price_per_km: 4.00 },
        { id: "trf_05J", weight_range: { min: 601, max: 99999 }, price_per_km: 8.00 },
    ];

    for (const t of tarifas) {
        await prisma.rate.create({ data: t });
    }

    console.log("[SEED] Created 5 rates");

    // 4. Reset tracking sequence and get starting number
    const year = now.getFullYear();
    let trackingCounter = 1;

    function nextTrackingCode(): string {
        const code = `BB-${String(trackingCounter).padStart(6, '0')}-${year}`;
        trackingCounter++;
        return code;
    }

    // 5. Create shipments
    let shipmentsCreated = 0;
    let pairIndex = 0;

    function nextPair() {
        const pair = ADDRESS_PAIRS[pairIndex % ADDRESS_PAIRS.length];
        pairIndex++;
        return pair;
    }

    function nextReceiver() {
        const idx = shipmentsCreated % RECEIVER_NAMES.length;
        return { name: RECEIVER_NAMES[idx], phone: RECEIVER_PHONES[idx] };
    }

    function nextTier() {
        return WEIGHT_TIERS[shipmentsCreated % WEIGHT_TIERS.length];
    }

    function daysAgo(days: number): Date {
        const d = new Date(now);
        d.setDate(d.getDate() - days);
        return d;
    }

    function hoursAgo(hours: number): Date {
        const d = new Date(now);
        d.setHours(d.getHours() - hours);
        return d;
    }

    function createShipmentData(
        pair: AddressPair,
        status: string,
        logisticsId: string | null,
        createdAt: Date,
        pickedUpAt: Date | null,
        deliveredAt: Date | null,
    ) {
        const receiver = nextReceiver();
        const tier = nextTier();
        const distanceKm = pair.distanceM / 1000;
        const price = Math.round(tier.pricePerKm * distanceKm * 1200 * 100) / 100; // ARS (approx USD*1200)

        return {
            id: generatePrefixedId("shp"),
            order_id: generatePrefixedId("ord"),
            quote_id: generatePrefixedId("qte"),
            buyer_id: generatePrefixedId("usr"),
            seller_id: generatePrefixedId("usr"),
            receiver_name: receiver.name,
            receiver_phone: receiver.phone,
            weight: tier.weightKg,
            dimensions: tier.dimensions,
            pickup_address: { street: pair.pickup.street, number: pair.pickup.number, city: "Bahia Blanca", zip: "8000" },
            delivery_address: { street: pair.delivery.street, number: pair.delivery.number, city: "Bahia Blanca", zip: "8000" },
            tracking_code: nextTrackingCode(),
            price,
            pickup_lat: pair.pickup.lat,
            pickup_lng: pair.pickup.lng,
            delivery_lat: pair.delivery.lat,
            delivery_lng: pair.delivery.lng,
            route_geometry: pair.geometry as Prisma.InputJsonValue,
            route_distance: pair.distanceM,
            route_duration: pair.durationS,
            status,
            logistics_id: logisticsId,
            created_at: createdAt,
            picked_up_at: pickedUpAt,
            delivered_at: deliveredAt,
        };
    }

    // ── Group 1: Delivered TODAY (3) ──
    for (let i = 0; i < 3; i++) {
        const pair = nextPair();
        const created = hoursAgo(8 - i * 2);
        const pickedUp = hoursAgo(6 - i * 2);
        const delivered = hoursAgo(2 - i);
        await prisma.shipment.create({
            data: createShipmentData(pair, "delivered", OPERATOR_ID, created, pickedUp, delivered),
        });
        shipmentsCreated++;
    }

    // ── Group 2: Active (4) ──
    // pending_pickup (1)
    {
        const pair = nextPair();
        const created = hoursAgo(1);
        await prisma.shipment.create({
            data: createShipmentData(pair, "pending_pickup", OPERATOR_ID, created, null, null),
        });
        shipmentsCreated++;
    }
    // picked_up (1)
    {
        const pair = nextPair();
        const created = hoursAgo(3);
        const pickedUp = hoursAgo(1);
        await prisma.shipment.create({
            data: createShipmentData(pair, "picked_up", OPERATOR_ID, created, pickedUp, null),
        });
        shipmentsCreated++;
    }
    // in_transit (2)
    for (let i = 0; i < 2; i++) {
        const pair = nextPair();
        const created = hoursAgo(5 - i);
        const pickedUp = hoursAgo(3 - i);
        await prisma.shipment.create({
            data: createShipmentData(pair, "in_transit", OPERATOR_ID, created, pickedUp, null),
        });
        shipmentsCreated++;
    }

    // ── Group 3: Historical delivered for operator (23, spread over 6 weeks) ──
    for (let i = 0; i < 23; i++) {
        const pair = nextPair();
        const daysBack = 7 + Math.floor(i * 35 / 23); // spread over 6 weeks (7 to 42 days)
        const created = daysAgo(daysBack);
        const pickedUp = new Date(created.getTime() + 2 * 3600000);
        const delivered = new Date(created.getTime() + 8 * 3600000);
        await prisma.shipment.create({
            data: createShipmentData(pair, "delivered", OPERATOR_ID, created, pickedUp, delivered),
        });
        shipmentsCreated++;
    }

    // ── Group 4: Unassigned waiting_for_courier (10) ──
    for (let i = 0; i < 10; i++) {
        const pair = nextPair();
        const created = hoursAgo(12 - i);
        await prisma.shipment.create({
            data: createShipmentData(pair, "waiting_for_courier", null, created, null, null),
        });
        shipmentsCreated++;
    }

    // ── Group 5: Carlos Mendez (6) ──
    const carlosStatuses: { status: string; daysBack: number; pickedUp: boolean; delivered: boolean }[] = [
        { status: "pending_pickup", daysBack: 1,  pickedUp: false, delivered: false },
        { status: "picked_up",      daysBack: 2,  pickedUp: true,  delivered: false },
        { status: "in_transit",     daysBack: 3,  pickedUp: true,  delivered: false },
        { status: "delivered",      daysBack: 5,  pickedUp: true,  delivered: true },
        { status: "delivered",      daysBack: 9,  pickedUp: true,  delivered: true },
        { status: "delivered",      daysBack: 13, pickedUp: true,  delivered: true },
    ];
    for (const c of carlosStatuses) {
        const pair = nextPair();
        const created = hoursAgo(c.daysBack * 24);
        const pickedUp = c.pickedUp ? new Date(created.getTime() + 2 * 3600000) : null;
        const delivered = c.delivered ? new Date(created.getTime() + 6 * 3600000) : null;
        await prisma.shipment.create({
            data: createShipmentData(pair, c.status, CARLOS_ID, created, pickedUp, delivered),
        });
        shipmentsCreated++;
    }

    // ── Group 6: Ana Torres historical (3) ──
    for (let i = 0; i < 3; i++) {
        const pair = nextPair();
        const daysBack = 10 + i * 7;
        const created = daysAgo(daysBack);
        const pickedUp = new Date(created.getTime() + 3 * 3600000);
        const delivered = new Date(created.getTime() + 10 * 3600000);
        await prisma.shipment.create({
            data: createShipmentData(pair, "delivered", ANA_ID, created, pickedUp, delivered),
        });
        shipmentsCreated++;
    }

    console.log(`[SEED] Created ${shipmentsCreated} shipments`);

    // Update tracking sequence
    await prisma.trackingSequence.upsert({
        where: { year },
        update: { last_number: trackingCounter - 1 },
        create: { year, last_number: trackingCounter - 1 },
    });

    return {
        success: true,
        message: `Seed completado — ${shipmentsCreated} envios, ${usersCreated} usuarios creados`,
        shipmentsCreated,
        usersCreated,
    };
}
