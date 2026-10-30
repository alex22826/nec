/* =========================================================================
   NEC — демо-данные: каталог продукции и услуг, база знаний ИИ,
   каналы, сотрудники, переписки и заявки. Время считается от «сейчас».
   ========================================================================= */
(function () {
  const N = window.N = window.N || {};

  N.CATS = [
    { id: 'hydro', icon: 'droplet', name: { ru: 'Гидроэлектростанции', uz: 'Gidroelektr stansiyalar', en: 'Hydropower plants' }, kw: ['гэс', 'гидро', 'гидроэлектр', 'ges', 'gidro', 'hydro', 'турбин', 'turbina'] },
    { id: 'wind', icon: 'wind', name: { ru: 'Ветряные электростанции', uz: 'Shamol elektr stansiyalari', en: 'Wind power plants' }, kw: ['ветр', 'ветер', 'вэс', 'вэу', 'ветрогенератор', 'ветряк', 'shamol', 'wind'] },
    { id: 'hv', icon: 'zap', name: { ru: 'Высоковольтные щиты', uz: 'Yuqori kuchlanishli shitlar', en: 'High-voltage switchgear' }, kw: ['высоковольт', 'высокого напряжения', '10 кв', '6 кв', '35 кв', 'yuqori kuchlanish', 'high voltage', 'high-voltage', 'medium voltage'] },
    { id: 'lv', icon: 'panel', name: { ru: 'Низковольтные щиты', uz: 'Past kuchlanishli shitlar', en: 'Low-voltage panels' }, kw: ['низковольт', '0,4 кв', '0.4 кв', 'past kuchlanish', 'low voltage', 'low-voltage', 'щит', 'щиты', 'shit', 'switchboard'] },
    { id: 'parts', icon: 'cog', name: { ru: 'Запчасти и комплектующие', uz: 'Ehtiyot qismlar va butlovchilar', en: 'Spare parts and components' }, kw: ['запчаст', 'комплектующ', 'ehtiyot qism', 'butlovchi', 'spare part', 'components'] },
  ];
  N.SCATS = [
    { id: 'design', icon: 'ruler', name: { ru: 'Проектирование', uz: 'Loyihalash', en: 'Design' } },
    { id: 'build', icon: 'building', name: { ru: 'Строительство', uz: 'Qurilish', en: 'Construction' } },
    { id: 'install', icon: 'wrench', name: { ru: 'Монтаж и наладка', uz: 'Montaj va sozlash', en: 'Installation' } },
    { id: 'produce', icon: 'factory', name: { ru: 'Производство', uz: 'Ishlab chiqarish', en: 'Manufacturing' } },
    { id: 'service', icon: 'shield', name: { ru: 'Сервис', uz: 'Servis', en: 'Service' } },
  ];

  const P = (id, cat, sku, name, spec, price, stock, min, lead, kw, extra) =>
    Object.assign({ id, cat, sku, name, spec, price, stock, min, lead, kw, unit: 'pcs' }, extra);

  const products = [
    // гидроэлектростанции
    P('h15', 'hydro', 'NEC-H15', { ru: 'Микро-ГЭС 15 кВт', uz: 'Mikro GES 15 kVt', en: 'Micro hydro plant 15 kW' },
      { ru: 'Турбина Пелтона, напор 20-60 м, генератор и щит управления в комплекте', uz: "Pelton turbinasi, bosim 20-60 m, generator va boshqaruv shiti bilan", en: 'Pelton turbine, head 20-60 m, generator and control panel included' },
      18500, 3, 1, 45, ['микро-гэс', 'микро гэс', 'микрогэс', 'mikro ges', 'mikro-ges', 'micro hydro', 'micro-hydro'], { power: 15 }),
    P('h50', 'hydro', 'NEC-HC50', { ru: 'Контейнерная ГЭС 50 кВт', uz: 'Konteynerli GES 50 kVt', en: 'Containerized hydro plant 50 kW' },
      { ru: 'Турбина Банки, напор 5-25 м, полная заводская готовность в 20-футовом контейнере', uz: "Banki turbinasi, bosim 5-25 m, 20 futlik konteynerda to'liq zavod tayyorligida", en: 'Banki turbine, head 5-25 m, factory-assembled in a 20 ft container' },
      54000, 2, 1, 60, ['контейнер', 'konteyner', 'container'], { power: 50 }),
    P('h100', 'hydro', 'NEC-H100', { ru: 'Мини-ГЭС 100 кВт', uz: 'Mini GES 100 kVt', en: 'Mini hydro plant 100 kW' },
      { ru: 'Турбина Френсиса, напор 10-40 м, расход до 0,4 м³/с', uz: 'Frensis turbinasi, bosim 10-40 m, sarf 0,4 m³/s gacha', en: 'Francis turbine, head 10-40 m, flow up to 0.4 m³/s' },
      96000, 1, 1, 75, ['мини-гэс', 'мини гэс', 'минигэс', 'mini ges', 'mini-ges', 'mini hydro', 'mini-hydro'], { power: 100 }),
    P('h500', 'hydro', 'NEC-H500', { ru: 'Мини-ГЭС 500 кВт', uz: 'Mini GES 500 kVt', en: 'Mini hydro plant 500 kW' },
      { ru: 'Турбина Каплана для каналов и рек, напор 4-15 м', uz: 'Kanal va daryolar uchun Kaplan turbinasi, bosim 4-15 m', en: 'Kaplan turbine for canals and rivers, head 4-15 m' },
      410000, 0, 0, 120, ['мини-гэс', 'мини гэс', 'минигэс', 'mini ges', 'mini-ges', 'mini hydro', 'mini-hydro'], { power: 500 }),
    // ветряные электростанции
    P('w5', 'wind', 'NEC-W5', { ru: 'Ветроустановка 5 кВт', uz: 'Shamol qurilmasi 5 kVt', en: 'Wind turbine 5 kW' },
      { ru: 'Горизонтальная ось, мачта 12 м, старт при ветре 2,5 м/с', uz: "Gorizontal o'q, machta 12 m, shamol 2,5 m/s bo'lganda ishga tushadi", en: 'Horizontal axis, 12 m mast, cut-in wind speed 2.5 m/s' },
      6200, 12, 3, 30, ['ветроустановк'], { power: 5 }),
    P('w20', 'wind', 'NEC-W20', { ru: 'Ветроустановка 20 кВт', uz: 'Shamol qurilmasi 20 kVt', en: 'Wind turbine 20 kW' },
      { ru: 'Мачта 18 м, сетевой и автономный инвертор, IP65', uz: 'Machta 18 m, tarmoq va avtonom invertor, IP65', en: '18 m mast, grid-tie and off-grid inverter, IP65' },
      21800, 4, 2, 45, ['ветроустановк'], { power: 20 }),
    P('w100', 'wind', 'NEC-W100', { ru: 'Ветроустановка 100 кВт', uz: 'Shamol qurilmasi 100 kVt', en: 'Wind turbine 100 kW' },
      { ru: 'Для ветропарков, башня 30 м, управление шагом лопастей', uz: 'Shamol parklari uchun, minora 30 m, parrak qadamini boshqarish', en: 'For wind farms, 30 m tower, blade pitch control' },
      118000, 2, 1, 90, ['ветроустановк'], { power: 100 }),
    P('wh10', 'wind', 'NEC-WH10', { ru: 'Гибридная ветро-солнечная станция 10 кВт', uz: 'Gibrid shamol-quyosh stansiyasi 10 kVt', en: 'Hybrid wind-solar station 10 kW' },
      { ru: 'Ветроустановка 5 кВт, солнечные панели 5 кВт, аккумуляторы 20 кВт·ч', uz: "5 kVt shamol qurilmasi, 5 kVt quyosh panellari, 20 kVt·soat akkumulyator", en: '5 kW wind turbine, 5 kW solar panels, 20 kWh battery' },
      11400, 6, 2, 30, ['гибрид', 'солнеч', 'gibrid', 'quyosh', 'hybrid', 'solar'], { power: 10 }),
    // высоковольтные щиты
    P('kru', 'hv', 'NEC-KRU10', { ru: 'Ячейка КРУ-10 кВ', uz: 'KRU-10 kV yacheykasi', en: 'KRU-10 kV switchgear cell' },
      { ru: 'Выкатной вакуумный выключатель, 630 А, микропроцессорная защита', uz: "Chiqariladigan vakuum o'chirgich, 630 A, mikroprotsessorli himoya", en: 'Withdrawable vacuum breaker, 630 A, microprocessor protection' },
      14300, 8, 2, 40, ['кру', 'kru', 'ячейк', 'yacheyka', 'switchgear cell']),
    P('kso', 'hv', 'NEC-KSO298', { ru: 'Камера КСО-298 10 кВ', uz: 'KSO-298 kamerasi 10 kV', en: 'KSO-298 switch cabinet 10 kV' },
      { ru: 'Одностороннего обслуживания, выключатель нагрузки, 630 А', uz: "Bir tomonlama xizmat ko'rsatiladigan, yuklama o'chirgichi, 630 A", en: 'Single-sided service, load break switch, 630 A' },
      7900, 14, 4, 30, ['ксо', 'kso', 'камер', 'kamera']),
    P('ktp', 'hv', 'NEC-KTP630', { ru: 'КТП 630 кВА 10/0,4 кВ', uz: 'KTP 630 kVA 10/0,4 kV', en: 'Package substation 630 kVA 10/0.4 kV' },
      { ru: 'Комплектная трансформаторная подстанция киоскового типа, масляный трансформатор', uz: 'Kiosk turidagi komplekt transformator podstansiyasi, moyli transformator', en: 'Kiosk-type package substation with oil transformer' },
      38500, 2, 1, 50, ['ктп', 'ktp', 'подстанц', 'podstans', 'substation']),
    P('rm6', 'hv', 'NEC-RM6', { ru: 'Элегазовое КРУ RM6 10 кВ', uz: 'Elegazli KRU RM6 10 kV', en: 'SF6 ring main unit RM6 10 kV' },
      { ru: 'Моноблок на 3 присоединения для городских сетей', uz: 'Shahar tarmoqlari uchun 3 ulanishli monoblok', en: '3-way monoblock for urban networks' },
      16800, 0, 0, 45, ['rm6', 'элегаз', 'elegaz', 'sf6', 'ring main']),
    // низковольтные щиты
    P('grsh', 'lv', 'NEC-GRSH1600', { ru: 'ГРЩ 1600 А', uz: 'GRShch 1600 A', en: 'Main switchboard 1600 A' },
      { ru: 'Главный распределительный щит, воздушные автоматы, учет, IP54', uz: 'Asosiy taqsimlash shiti, havo avtomatlari, hisoblagich, IP54', en: 'Main distribution board, air circuit breakers, metering, IP54' },
      9600, 5, 2, 20, ['грщ', 'grsh', 'grshch', 'главный распредел', 'asosiy taqsimlash', 'main switchboard', 'main distribution', 'mdb']),
    P('vru', 'lv', 'NEC-VRU250', { ru: 'ВРУ-1 250 А', uz: 'VRU-1 250 A', en: 'Incoming panel VRU-1 250 A' },
      { ru: 'Вводно-распределительное устройство для зданий, 8 отходящих линий', uz: 'Binolar uchun kirish-taqsimlash qurilmasi, 8 ta chiquvchi liniya', en: 'Building incoming and distribution unit, 8 outgoing lines' },
      1450, 18, 5, 15, ['вру', 'vru', 'вводно', 'incoming panel']),
    P('shr', 'lv', 'NEC-SHR24', { ru: 'Щит распределительный ЩР-24', uz: 'ShR-24 taqsimlash shiti', en: 'Distribution board ShR-24' },
      { ru: 'Навесной, на 24 модуля, металлический корпус IP31', uz: 'Osma, 24 modulli, metall korpus IP31', en: 'Wall-mounted, 24 modules, metal enclosure IP31' },
      210, 64, 20, 10, ['щр', 'shr', 'щиток', 'щит распредел', 'taqsimlash shiti', 'distribution board']),
    P('shu', 'lv', 'NEC-SHU100', { ru: 'Щит учета с АВР 100 А', uz: 'AVR bilan hisob shiti 100 A', en: 'Metering panel with ATS 100 A' },
      { ru: 'Автоматический ввод резерва, счетчик, два ввода', uz: 'Zaxirani avtomatik ulash, hisoblagich, ikkita kirish', en: 'Automatic transfer switch, meter, two inputs' },
      1980, 9, 3, 15, ['щит учет', 'щу', 'авр', 'avr', 'hisob shiti', 'ats', 'metering']),
    P('ukrm', 'lv', 'NEC-UKRM200', { ru: 'УКРМ 0,4 кВ 200 квар', uz: 'UKRM 0,4 kV 200 kvar', en: 'Capacitor bank 0.4 kV 200 kvar' },
      { ru: 'Автоматическая компенсация реактивной мощности, 8 ступеней', uz: 'Reaktiv quvvatni avtomatik kompensatsiyalash, 8 pog\'ona', en: 'Automatic reactive power compensation, 8 steps' },
      4300, 3, 1, 25, ['укрм', 'ukrm', 'конденсатор', 'kondensator', 'capacitor', 'компенсац', 'kompensats', 'power factor']),
    // запчасти
    P('vcb', 'parts', 'NEC-BB10', { ru: 'Вакуумный выключатель BB/TEL-10', uz: "Vakuum o'chirgich BB/TEL-10", en: 'Vacuum circuit breaker BB/TEL-10' },
      { ru: '10 кВ, 1000 А, 20 кА, для КРУ и КСО', uz: '10 kV, 1000 A, 20 kA, KRU va KSO uchun', en: '10 kV, 1000 A, 20 kA, for KRU and KSO' },
      2450, 22, 5, 20, ['вакуумн', 'bb/tel', 'vakuum', 'vacuum']),
    P('ct', 'parts', 'NEC-TOL10', { ru: 'Трансформатор тока ТОЛ-10', uz: 'TOL-10 tok transformatori', en: 'Current transformer TOL-10' },
      { ru: '10 кВ, 50-1500/5 А, класс точности 0,5S', uz: '10 kV, 50-1500/5 A, aniqlik sinfi 0,5S', en: '10 kV, 50-1500/5 A, accuracy class 0.5S' },
      320, 40, 10, 15, ['трансформатор тока', 'тол-10', 'tol-10', 'tok transformator', 'current transformer']),
    P('acb', 'parts', 'NEC-ACB1600', { ru: 'Воздушный автомат 1600 А', uz: 'Havo avtomati 1600 A', en: 'Air circuit breaker 1600 A' },
      { ru: 'Выкатной, электронный расцепитель, 65 кА', uz: 'Chiqariladigan, elektron ajratgich, 65 kA', en: 'Withdrawable, electronic trip unit, 65 kA' },
      3150, 7, 2, 25, ['воздушный автомат', 'havo avtomat', 'air circuit breaker', 'acb']),
    P('mcb', 'parts', 'NEC-MCB63', { ru: 'Модульные автоматы 1-63 А', uz: 'Modulli avtomatlar 1-63 A', en: 'Modular circuit breakers 1-63 A' },
      { ru: 'Однополюсные и трехполюсные, характеристика C, 6 кА', uz: "Bir va uch qutbli, C xarakteristikasi, 6 kA", en: 'Single and three pole, C curve, 6 kA' },
      6, 1200, 200, 10, ['модульн', 'автомат', 'modulli', 'avtomat', 'mcb', 'circuit breaker']),
    P('relay', 'parts', 'NEC-RZ', { ru: 'Реле защиты микропроцессорное', uz: 'Mikroprotsessorli himoya relesi', en: 'Microprocessor protection relay' },
      { ru: 'МТЗ, ТО, ЗЗ, АПВ, связь по Modbus', uz: 'MTZ, TO, ZZ, APV, Modbus aloqasi', en: 'Overcurrent, earth fault, auto-reclose, Modbus' },
      890, 15, 4, 20, ['реле', 'rele', 'relay']),
    P('bus', 'parts', 'NEC-SHMT606', { ru: 'Шина медная ШМТ 60×6', uz: 'Mis shina ShMT 60×6', en: 'Copper busbar 60×6' },
      { ru: 'Для сборки щитов, цена за метр', uz: "Shit yig'ish uchun, narxi metr uchun", en: 'For switchboard assembly, price per meter' },
      38, 480, 100, 10, ['шина', 'шины', 'shina', 'busbar', 'медн'], { unit: 'm' }),
    P('blade', 'parts', 'NEC-BL20', { ru: 'Лопасти ВЭУ 20 кВт', uz: 'Shamol qurilmasi parraklari 20 kVt', en: 'Blade set for 20 kW wind turbine' },
      { ru: 'Комплект из 3 лопастей, стеклопластик', uz: 'Uchta parrakdan iborat komplekt, shisha plastik', en: 'Set of 3 blades, fiberglass' },
      2900, 2, 1, 35, ['лопаст', 'parrak', 'blade'], { unit: 'set' }),
    P('gen', 'parts', 'NEC-G15', { ru: 'Генератор для микро-ГЭС 15 кВт', uz: 'Mikro GES uchun generator 15 kVt', en: 'Generator for 15 kW micro hydro' },
      { ru: 'Синхронный, 400 В, 1500 об/мин', uz: 'Sinxron, 400 V, 1500 ayl/min', en: 'Synchronous, 400 V, 1500 rpm' },
      3700, 4, 1, 30, ['гидрогенератор', 'генератор для гэс', 'генератор гэс', 'gidrogenerator', 'hydro generator']),
    P('bear', 'parts', 'NEC-PU', { ru: 'Подшипниковый узел турбины ГЭС', uz: 'GES turbinasining podshipnik bloki', en: 'Hydro turbine bearing unit' },
      { ru: 'Для турбин 15-100 кВт, с уплотнениями', uz: 'Zichlagichlar bilan, 15-100 kVt turbinalar uchun', en: 'With seals, for 15-100 kW turbines' },
      1150, 6, 2, 25, ['подшипник', 'podshipnik', 'bearing']),
    P('ctrl', 'parts', 'NEC-CTR5', { ru: 'Контроллер заряда ВЭУ 5 кВт', uz: 'Shamol qurilmasi zaryad kontrolleri 5 kVt', en: 'Charge controller for 5 kW wind turbine' },
      { ru: 'MPPT, защита от перезаряда, торможение ротора', uz: "MPPT, ortiqcha zaryaddan himoya, rotorni tormozlash", en: 'MPPT, overcharge protection, rotor braking' },
      540, 11, 3, 15, ['контроллер', 'kontroller', 'controller']),
  ];

  const S = (id, cat, name, desc, price, unit, term, kw) => ({ id, cat, name, desc, price, unit, term, kw });
  const services = [
    S('s-design', 'design', { ru: 'Проектирование энергообъектов', uz: 'Energetika obyektlarini loyihalash', en: 'Power facility design' },
      { ru: 'ГЭС, ВЭС, подстанции и сети 0,4-35 кВ: изыскания, расчеты, рабочая документация, согласования', uz: "GES, SHES, podstansiyalar va 0,4-35 kV tarmoqlar: tadqiqot, hisob-kitob, ishchi hujjatlar, kelishuvlar", en: 'Hydro, wind, substations and 0.4-35 kV networks: surveys, calculations, working drawings, approvals' },
      4500, { ru: 'за проект', uz: 'loyiha uchun', en: 'per project' }, { ru: '30-60 дней', uz: '30-60 kun', en: '30-60 days' }, ['проект', 'loyiha', 'design', 'engineering']),
    S('s-hydro', 'build', { ru: 'Строительство мини-ГЭС под ключ', uz: 'Mini GESni kalit topshirish asosida qurish', en: 'Turnkey mini hydro construction' },
      { ru: 'Гидротехнические сооружения, водовод, здание станции, монтаж оборудования и подключение к сети', uz: "Gidrotexnik inshootlar, suv quvuri, stansiya binosi, uskunalarni o'rnatish va tarmoqqa ulash", en: 'Hydraulic structures, penstock, powerhouse, equipment installation and grid connection' },
      150000, { ru: 'за объект', uz: 'obyekt uchun', en: 'per site' }, { ru: '6-12 месяцев', uz: '6-12 oy', en: '6-12 months' }, ['под ключ', 'kalit topshir', 'turnkey', 'turn-key']),
    S('s-wind', 'build', { ru: 'Строительство ветропарков', uz: 'Shamol parklarini qurish', en: 'Wind farm construction' },
      { ru: 'Оценка ветрового потенциала, фундаменты, монтаж ВЭУ, подстанция и выдача мощности в сеть', uz: "Shamol salohiyatini baholash, poydevorlar, qurilmalarni o'rnatish, podstansiya va tarmoqqa ulash", en: 'Wind assessment, foundations, turbine erection, substation and grid connection' },
      90000, { ru: 'за объект', uz: 'obyekt uchun', en: 'per site' }, { ru: '4-9 месяцев', uz: '4-9 oy', en: '4-9 months' }, ['ветропарк', 'shamol park', 'wind farm', 'wind park']),
    S('s-install', 'install', { ru: 'Монтаж оборудования', uz: "Uskunalarni o'rnatish", en: 'Equipment installation' },
      { ru: 'Установка станций, щитов, КТП и ячеек силами собственных бригад', uz: "Stansiyalar, shitlar, KTP va yacheykalarni o'z brigadalarimiz bilan o'rnatish", en: 'Installation of plants, panels, substations and cells by our own crews' },
      800, { ru: 'за единицу', uz: 'birlik uchun', en: 'per unit' }, { ru: 'от 2 дней', uz: '2 kundan', en: 'from 2 days' }, ['монтаж', 'установк', 'montaj', "o'rnat", 'installation', 'install', 'mounting']),
    S('s-pnr', 'install', { ru: 'Пусконаладочные работы', uz: 'Ishga tushirish va sozlash ishlari', en: 'Commissioning' },
      { ru: 'Настройка защит и автоматики, испытания, ввод в эксплуатацию с актами', uz: "Himoya va avtomatikani sozlash, sinovlar, dalolatnomalar bilan foydalanishga topshirish", en: 'Protection and automation setup, testing, handover with certificates' },
      600, { ru: 'за объект', uz: 'obyekt uchun', en: 'per site' }, { ru: '3-10 дней', uz: '3-10 kun', en: '3-10 days' }, ['пусконалад', 'наладк', 'пнр', 'ввод в эксплуат', 'ishga tushir', 'sozla', 'commissioning', 'start-up']),
    S('s-panel', 'produce', { ru: 'Сборка щитов по схеме заказчика', uz: "Buyurtmachi sxemasi bo'yicha shit yig'ish", en: 'Custom panel assembly' },
      { ru: 'НКУ 0,4 кВ и ячейки 6-10 кВ на собственном производстве в Ташкенте', uz: "Toshkentdagi o'z ishlab chiqarishimizda 0,4 kV va 6-10 kV shitlar", en: '0.4 kV panels and 6-10 kV cells at our own plant in Tashkent' },
      300, { ru: 'за щит', uz: 'shit uchun', en: 'per panel' }, { ru: '10-20 дней', uz: '10-20 kun', en: '10-20 days' }, ['сборк', 'по схеме', "yig'ish", 'assembly', 'custom panel']),
    S('s-elmont', 'install', { ru: 'Электромонтажные работы 0,4-10 кВ', uz: 'Elektromontaj ishlari 0,4-10 kV', en: 'Electrical works 0.4-10 kV' },
      { ru: 'Кабельные линии, заземление, освещение, внутренние сети предприятий', uz: "Kabel liniyalari, yerga ulash, yoritish, korxonalarning ichki tarmoqlari", en: 'Cable lines, earthing, lighting, internal plant networks' },
      null, { ru: 'по смете', uz: 'smeta asosida', en: 'per estimate' }, { ru: 'по графику', uz: 'jadval asosida', en: 'as scheduled' }, ['электромонтаж', 'кабел', 'заземлен', 'elektromontaj', 'kabel', 'wiring', 'cabling']),
    S('s-civil', 'build', { ru: 'Строительно-монтажные работы', uz: 'Qurilish-montaj ishlari', en: 'Civil and erection works' },
      { ru: 'Фундаменты, ЛЭП, опоры, здания подстанций и технические помещения', uz: "Poydevorlar, elektr uzatish liniyalari, tayanchlar, podstansiya binolari", en: 'Foundations, power lines, poles, substation buildings' },
      null, { ru: 'по смете', uz: 'smeta asosida', en: 'per estimate' }, { ru: 'по графику', uz: 'jadval asosida', en: 'as scheduled' }, ['фундамент', 'лэп', 'опор', 'poydevor', 'foundation', 'power line']),
    S('s-service', 'service', { ru: 'Сервисное обслуживание станций', uz: "Stansiyalarga servis xizmati ko'rsatish", en: 'Plant maintenance' },
      { ru: 'Плановые осмотры, ремонт, удаленный мониторинг выработки', uz: "Rejali ko'riklar, ta'mirlash, ishlab chiqarishni masofadan kuzatish", en: 'Scheduled inspections, repairs, remote output monitoring' },
      250, { ru: 'в месяц', uz: 'oyiga', en: 'per month' }, { ru: 'по договору', uz: "shartnoma bo'yicha", en: 'under contract' }, ['обслуживан', 'сервис', 'ремонт', "xizmat ko'rsat", "ta'mir", 'servis', 'maintenance', 'repair']),
    S('s-audit', 'service', { ru: 'Энергоаудит предприятия', uz: 'Korxonani energoaudit qilish', en: 'Energy audit' },
      { ru: 'Замеры, анализ потерь, подбор компенсации и собственной генерации', uz: "O'lchovlar, yo'qotishlar tahlili, kompensatsiya va o'z generatsiyasini tanlash", en: 'Measurements, loss analysis, compensation and own generation sizing' },
      600, { ru: 'за объект', uz: 'obyekt uchun', en: 'per site' }, { ru: '5-14 дней', uz: '5-14 kun', en: '5-14 days' }, ['аудит', 'энергоаудит', 'audit', 'energoaudit']),
    S('s-delivery', 'service', { ru: 'Доставка и такелаж', uz: 'Yetkazib berish va takelaj', en: 'Delivery and rigging' },
      { ru: 'Перевозка по Узбекистану, разгрузка краном и установка на фундамент', uz: "O'zbekiston bo'ylab tashish, kran bilan tushirish va poydevorga o'rnatish", en: 'Transport across Uzbekistan, crane unloading and setting on foundation' },
      150, { ru: 'за рейс', uz: 'reys uchun', en: 'per trip' }, { ru: '1-4 дня', uz: '1-4 kun', en: '1-4 days' }, ['такелаж', 'takelaj', 'crane', 'rigging']),
  ];

  // база знаний: на нее опирается ИИ, когда вопрос не про конкретный товар
  const kb = [
    { id: 'kb1', title: { ru: 'Оплата и рассрочка', uz: "To'lov va muddatli to'lov", en: 'Payment and installments' },
      text: { ru: 'Работаем по договору: предоплата 30%, остаток перед отгрузкой. Для крупных проектов возможна рассрочка до 6 месяцев, ее согласовывает менеджер. Оплата в сумах по курсу ЦБ на день оплаты.', uz: "Shartnoma asosida ishlaymiz: 30% oldindan to'lov, qolgani jo'natishdan oldin. Yirik loyihalar uchun 6 oygacha muddatli to'lov mumkin, uni menejer kelishadi. To'lov to'lov kunidagi MB kursi bo'yicha so'mda.", en: 'We work under contract: 30% prepayment, the balance before shipment. Large projects can get installments of up to 6 months, approved by a manager. Payment in UZS at the Central Bank rate on the payment date.' },
      kw: ['оплат', 'рассроч', 'предоплат', "to'lov", 'muddatli', 'oldindan', 'payment', 'installment', 'prepay'] },
    { id: 'kb2', title: { ru: 'Гарантия', uz: 'Kafolat', en: 'Warranty' },
      text: { ru: 'Гарантия на станции 24 месяца, на щиты и запчасти 12 месяцев. Сервисная служба выезжает по всему Узбекистану.', uz: "Stansiyalarga kafolat 24 oy, shitlar va ehtiyot qismlarga 12 oy. Servis xizmati butun O'zbekiston bo'ylab chiqadi.", en: 'Warranty is 24 months for plants and 12 months for panels and parts. Our service team travels across Uzbekistan.' },
      kw: ['гарант', 'kafolat', 'warranty', 'guarantee'] },
    { id: 'kb3', title: { ru: 'Сертификаты и документы', uz: 'Sertifikatlar va hujjatlar', en: 'Certificates and documents' },
      text: { ru: 'Оборудование сертифицировано в O\'zstandart. К поставке прилагаем паспорт изделия, сертификат соответствия и протоколы заводских испытаний.', uz: "Uskunalar O'zstandartda sertifikatlangan. Yetkazib berishda mahsulot pasporti, muvofiqlik sertifikati va zavod sinovlari bayonnomalari beriladi.", en: "Equipment is certified by O'zstandart. Each delivery includes a product passport, certificate of conformity and factory test reports." },
      kw: ['сертифик', 'документ', 'паспорт', 'sertifikat', 'hujjat', 'certificate', 'documents'] },
    { id: 'kb4', title: { ru: 'Производство и сроки', uz: 'Ishlab chiqarish va muddatlar', en: 'Production and lead times' },
      text: { ru: 'Щиты собираем на собственном производстве в Ташкенте за 10-20 рабочих дней. Станции под заказ изготавливаем за 30-120 дней в зависимости от мощности.', uz: "Shitlarni Toshkentdagi o'z ishlab chiqarishimizda 10-20 ish kunida yig'amiz. Buyurtma asosidagi stansiyalar quvvatiga qarab 30-120 kunda tayyorlanadi.", en: 'Panels are assembled at our own plant in Tashkent in 10-20 working days. Made-to-order plants take 30-120 days depending on capacity.' },
      kw: ['производств', 'завод', 'изготов', 'ishlab chiqar', 'zavod', 'manufactur', 'factory', 'production'] },
    { id: 'kb5', title: { ru: 'Офис, склад и режим работы', uz: 'Ofis, ombor va ish tartibi', en: 'Office, warehouse and hours' },
      text: { ru: 'Офис и склад в Ташкенте, работаем Пн-Сб с 9:00 до 18:00. ИИ-менеджер отвечает в мессенджерах круглосуточно.', uz: "Ofis va ombor Toshkentda, Du-Sha 9:00 dan 18:00 gacha ishlaymiz. Sun'iy intellekt menejeri messenjerlarda kecha-kunduz javob beradi.", en: 'Office and warehouse in Tashkent, open Mon-Sat 9:00-18:00. The AI manager replies in messengers around the clock.' },
      kw: ['адрес', 'офис', 'где вы', 'режим', 'график', 'manzil', 'ofis', 'address', 'office', 'working hours'] },
  ];

  N.seed = () => {
    const now = Date.now();
    const ago = min => now - min * 6e4;
    const users = [
      { id: 'u1', login: 'admin', role: 'admin', name: { ru: 'Алишер Ахмедов', uz: 'Alisher Axmedov', en: 'Alisher Akhmedov' }, title: { ru: 'Руководитель', uz: 'Rahbar', en: 'Director' }, color: '#1d4ed8' },
      { id: 'u2', login: 'manager', role: 'manager', name: { ru: 'Камола Саидова', uz: 'Kamola Saidova', en: 'Kamola Saidova' }, title: { ru: 'Менеджер по продажам', uz: "Sotuv bo'yicha menejer", en: 'Sales manager' }, color: '#0f766e' },
      { id: 'u3', login: 'jasur', role: 'manager', name: { ru: 'Жасур Тошматов', uz: 'Jasur Toshmatov', en: 'Jasur Toshmatov' }, title: { ru: 'Инженер по продажам', uz: "Sotuv bo'yicha muhandis", en: 'Sales engineer' }, color: '#b45309' },
    ];
    const channels = [
      { id: 'tg', account: '@nec_energy_bot', on: true, auto: true, connectedAt: ago(60 * 24 * 46) },
      { id: 'wa', account: '+998 71 200 45 45', on: true, auto: true, connectedAt: ago(60 * 24 * 46) },
      { id: 'ig', account: '@nec.energy.uz', on: true, auto: true, connectedAt: ago(60 * 24 * 40) },
      { id: 'site', account: 'alex22826.github.io/nec-site', on: true, auto: true, connectedAt: ago(60 * 24 * 2) },
    ];

    const chats = [], leads = [];
    let num = 1040;
    const mk = (d) => {
      const c = {
        id: d.id, channel: d.ch, lang: d.lang, status: d.status, managerId: d.manager || null, unread: d.unread || 0,
        client: Object.assign({ name: '', handle: '', phone: '', company: '', inn: '', city: '' }, d.client),
        card: { items: d.items || [], services: d.services || [] }, ctx: {}, messages: [], createdAt: ago(d.msgs[0][1]), lastAt: 0,
      };
      d.msgs.forEach(([from, min, text, extra], i) => {
        const m = Object.assign({ id: d.id + 'm' + i, from, text: text || '', at: ago(min) }, extra);
        c.messages.push(m); c.lastAt = m.at;
      });
      if (d.status === 'wait') { c.waitSince = ago(d.waitMin); c.waitReason = d.waitReason; }
      const lead = {
        id: 'l' + d.id, num: ++num, chatId: c.id, channel: d.ch, stage: d.stage, managerId: d.manager || null,
        items: c.card.items.map(i => ({ pid: i.pid, qty: i.qty, ok: i.ok, price: products.find(p => p.id === i.pid).price })),
        services: c.card.services.map(sid => ({ sid, price: services.find(s => s.id === sid).price })),
        createdAt: c.createdAt, updatedAt: c.lastAt, note: d.note || '', shipped: d.stage === 'won',
      };
      c.leadId = lead.id;
      chats.push(c); leads.push(lead);
    };

    mk({ id: 'c9', ch: 'ig', lang: 'ru', status: 'closed', stage: 'lost', note: 'Нужны отдельные солнечные панели, такого в каталоге нет',
      client: { name: 'Бекзод', handle: '@bekzod_solar', city: 'Карши' },
      msgs: [
        ['client', 4320, 'Здравствуйте, солнечные панели на 50 кВт продаете?'],
        ['ai', 4320, 'Здравствуйте! Отдельно солнечные панели мы не поставляем. Есть гибридная ветро-солнечная станция 10 кВт за $11 400, на складе 6 шт. Рассмотрите такой вариант?'],
        ['client', 4300, 'Нет, нужны именно панели. Спасибо'],
        ['ai', 4300, 'Понимаю. Если понадобятся станции, щиты или монтаж, пишите в любое время.'],
        ['system', 4200, '', { sys: 'closed' }],
      ] });
    mk({ id: 'c6', ch: 'ig', lang: 'ru', status: 'closed', stage: 'won', manager: 'u3',
      client: { name: 'Сардор', handle: '@elektromontaj_pro', company: 'Elektromontaj Pro', city: 'Ташкент' },
      items: [{ pid: 'vcb', qty: 4, ok: true }],
      msgs: [
        ['client', 2900, 'Нужны вакуумные выключатели BB/TEL-10, 4 шт. Есть в наличии?'],
        ['ai', 2900, 'Да, вакуумный выключатель BB/TEL-10: $2 450, на складе 26 шт. За 4 шт: $9 800. Удобнее самовывоз со склада в Ташкенте или доставка?'],
        ['client', 2890, 'Самовывоз. Оформляйте счет, оплатим перечислением'],
        ['ai', 2890, 'Отлично! Менеджер Жасур Тошматов выставит счет и свяжется с вами в течение 15 минут.'],
        ['system', 2890, '', { sys: 'escalated', vars: { reason: 'contract', uid: 'u3' } }],
        ['system', 2880, '', { sys: 'taken', vars: { uid: 'u3' } }],
        ['manager', 2870, 'Сардор, добрый день! Счет отправил сюда в Direct. После оплаты выключатели будут готовы к отгрузке в течение дня.', { uid: 'u3' }],
        ['client', 2700, 'Оплатили, спасибо!'],
        ['system', 2690, '', { sys: 'won' }],
      ] });
    mk({ id: 'c5', ch: 'wa', lang: 'ru', status: 'manager', stage: 'offer', manager: 'u2',
      client: { name: 'Рустам Рашидов', handle: '+998 97 330 18 92', phone: '+998 97 330 18 92', company: 'Toshkent Qurilish Invest', city: 'Ташкент' },
      items: [{ pid: 'ktp', qty: 1, ok: true }, { pid: 'kso', qty: 6, ok: true }], services: ['s-design'],
      msgs: [
        ['client', 1500, 'Добрый день. Строим жилой комплекс в Юнусабаде, нужна КТП 630 кВА и камеры КСО, 6 штук.'],
        ['ai', 1500, 'Добрый день, Рустам! КТП 630 кВА 10/0,4 кВ: $38 500, на складе 2 шт. Камера КСО-298 10 кВ: $7 900, на складе 14 шт. Итого за КТП и 6 камер: $85 900. Нужен ли проект электроснабжения?'],
        ['client', 1490, 'Да, проект тоже нужен. И интересует рассрочка'],
        ['ai', 1490, 'Проектирование энергообъектов: от $4 500, срок 30-60 дней. Рассрочку до 6 месяцев согласовывает менеджер. Менеджер Камола Саидова свяжется с вами сегодня.'],
        ['system', 1490, '', { sys: 'escalated', vars: { reason: 'human', uid: 'u2' } }],
        ['system', 1460, '', { sys: 'taken', vars: { uid: 'u2' } }],
        ['manager', 1455, 'Рустам, добрый день! Это Камола, компания NEC. Отправила КП на почту. Рассрочка возможна на 6 месяцев при предоплате 30%. Удобно созвониться завтра в 10:00?', { uid: 'u2' }],
        ['client', 1440, 'Да, давайте в 10'],
        ['manager', 30, 'Рустам, напоминаю про звонок. Проект договора уже готов, отправлю после разговора.', { uid: 'u2' }],
      ] });
    mk({ id: 'c4', ch: 'tg', lang: 'en', status: 'ai', stage: 'qualify',
      client: { name: 'John Miller', handle: '@jmiller_sw', company: 'SunWind Partners', city: 'Navoi' },
      items: [{ pid: 'w100', qty: 4, ok: true }], services: ['s-install', 's-pnr'],
      msgs: [
        ['client', 180, 'Hi, we are developing a wind project near Navoi. Do you have 100 kW turbines in stock?'],
        ['ai', 180, 'Hello John! I am the AI manager of NEC. Wind turbine 100 kW: $118 000, 2 pcs in stock, more are made to order in 90 days. How many units do you need?'],
        ['client', 172, 'We need 4. What about installation and commissioning?'],
        ['ai', 172, '2 units can ship this week, the remaining 2 will be made in 90 days. Installation is from $800 per unit and commissioning from $600 per site. Total for equipment: $472 000. Please leave your name and phone number so our manager can contact you.'],
      ] });
    mk({ id: 'c1', ch: 'tg', lang: 'ru', status: 'ai', stage: 'qualify',
      client: { name: 'Фаррух Каримов', handle: '@farrukh_agro', company: 'Agro Energy Namangan', city: 'Наманган' },
      items: [{ pid: 'h100', qty: 1, ok: true }],
      msgs: [
        ['client', 95, 'Здравствуйте! Интересует мини-ГЭС для фермерского хозяйства, у нас рядом канал.'],
        ['ai', 95, 'Здравствуйте, Фаррух! Я ИИ-менеджер компании NEC. Мини-ГЭС есть на 100 и 500 кВт, для небольших объектов есть контейнерная ГЭС на 50 кВт. Для подбора нужны напор воды в метрах и расход, либо примерная мощность, которая нужна хозяйству.'],
        ['client', 88, 'Напор около 12 метров, нужно примерно 100 кВт. Мы из Agro Energy Namangan'],
        ['ai', 88, 'Под ваши условия подходит Мини-ГЭС 100 кВт с турбиной Френсиса: $96 000, на складе 1 шт. Монтаж и пусконаладку тоже выполняем. Сколько станций рассматриваете?'],
        ['client', 61, 'Пока одну. Можете скинуть характеристики?'],
        ['ai', 61, 'Отправляю паспорт станции. Оставьте, пожалуйста, номер телефона: инженер уточнит параметры канала и рассчитает годовую выработку.'],
      ] });
    mk({ id: 'c3', ch: 'ig', lang: 'ru', status: 'ai', stage: 'qualify', unread: 2,
      client: { name: 'Азиз', handle: '@greenhouse_bukhara', city: 'Бухара' },
      items: [{ pid: 'w5', qty: 3, ok: true }],
      msgs: [
        ['client', 48, 'Добрый день, сколько стоит ветряк на 5 кВт? Для теплицы'],
        ['ai', 48, 'Добрый день! Ветроустановка 5 кВт: $6 200, на складе 12 шт. Для теплиц часто берут гибридную ветро-солнечную станцию 10 кВт за $11 400, она дает энергию и в безветренные дни. Сколько установок рассматриваете?'],
        ['client', 40, 'Думаю 3 штуки. А доставка в Бухару есть?'],
        ['ai', 40, 'Да, доставляем по всему Узбекистану. Бухара: срок 2-3 дня, стоимость от $150. Три ветроустановки 5 кВт: $18 600 без монтажа. Оставьте, пожалуйста, имя и номер телефона, чтобы менеджер мог с вами связаться.'],
      ] });
    mk({ id: 'c2', ch: 'wa', lang: 'uz', status: 'wait', stage: 'contract', manager: 'u2', waitMin: 12, waitReason: 'contract',
      client: { name: 'Dilnoza Yusupova', handle: '+998 90 214 55 08', phone: '+998 90 214 55 08', company: '"Samarqand Tekstil" MCHJ', inn: '305112784', city: 'Samarqand' },
      items: [{ pid: 'grsh', qty: 2, ok: true }, { pid: 'vru', qty: 4, ok: true }], services: ['s-install'],
      msgs: [
        ['client', 34, 'Assalomu alaykum. Sexga GRShch 1600 A kerak, 2 dona. Narxi qancha?'],
        ['ai', 34, "Va alaykum assalom, Dilnoza! GRShch 1600 A: $9 600, omborda 5 dona bor. 2 dona uchun jami: $19 200. Montaj ham kerakmi?"],
        ['client', 25, 'Ha, montaj ham kerak. Yana VRU 250 A, 4 dona'],
        ['ai', 25, "VRU-1 250 A: $1 450, omborda 18 dona bor. Uskunalar bo'yicha jami: $25 000, montaj $800 dan. Tijoriy taklif tayyorlaymi?"],
        ['client', 12, 'Shartnoma tuzamiz. STIR 305 112 784, rekvizitlarni yuboraman'],
        ['ai', 12, "Ajoyib! So'rovingizni menejer Kamola Saidovaga topshirdim. U siz bilan 15 daqiqa ichida +998 90 214 55 08 raqami orqali bog'lanadi va shartnomani tayyorlaydi."],
        ['system', 12, '', { sys: 'escalated', vars: { reason: 'contract', uid: 'u2' } }],
      ] });
    mk({ id: 'c7', ch: 'tg', lang: 'uz', status: 'ai', stage: 'qualify', unread: 2,
      client: { name: 'Shahzod', handle: '@shahzod_t' },
      items: [{ pid: 'blade', qty: 1, ok: true }],
      msgs: [
        ['client', 9, 'Salom, shamol generatori 20 kVt uchun parrak bormi?'],
        ['ai', 9, 'Salom, Shahzod! Shamol qurilmasi parraklari 20 kVt: $2 900, omborda 2 komplekt bor. Nechta kerak?'],
        ['client', 7, "1 komplekt. Qachon olib ketsam bo'ladi?"],
        ['ai', 7, "Bugunoq olib ketishingiz mumkin, ombor Toshkentda, Du-Sha 9:00-18:00. Ismingiz va telefon raqamingizni qoldirsangiz, buyurtmani band qilib qo'yaman."],
      ] });
    mk({ id: 'c8', ch: 'wa', lang: 'ru', status: 'ai', stage: 'qualify', unread: 1,
      client: { name: 'Ойбек', handle: '+998 91 605 77 31', phone: '+998 91 605 77 31', company: 'Fargona Elektr Servis', city: 'Фергана' },
      items: [{ pid: 'shr', qty: 40, ok: true }, { pid: 'mcb', qty: 1, ok: false }],
      msgs: [
        ['client', 3, 'Здравствуйте, нужны щиты ЩР-24, 40 штук, и автоматы к ним. Какая цена оптом? Мы из Ферганы, Fargona Elektr Servis'],
        ['ai', 3, 'Здравствуйте, Ойбек! Щит распределительный ЩР-24: $210, на складе 64 шт. За 40 шт: $8 400. Модульные автоматы 1-63 А: $6, на складе 1 200 шт. Оптовую скидку подтверждает менеджер. Сколько автоматов и какого номинала нужно?'],
      ] });

    chats.sort((a, b) => b.lastAt - a.lastAt);
    leads.sort((a, b) => b.createdAt - a.createdAt);
    const notes = [
      { id: 'n1', kind: 'lead', chatId: 'c8', at: ago(3), read: false },
      { id: 'n2', kind: 'contract', chatId: 'c2', at: ago(12), read: false },
      { id: 'n3', kind: 'human', chatId: 'c5', at: ago(1490), read: true },
      { id: 'n4', kind: 'contract', chatId: 'c6', at: ago(2890), read: true },
    ];

    return {
      v: N.DB_VERSION, seq: { lead: num },
      settings: {
        ai: { mode: 'demo', apiKey: '', model: 'claude-opus-5-5', name: 'NEC Assistant', tone: 'business', prompt: '', escalate: { human: true, question: true, kp: true } },
        sound: true,
      },
      users, channels, kb,
      products: JSON.parse(JSON.stringify(products)),
      services: JSON.parse(JSON.stringify(services)),
      chats, leads, notes,
    };
  };
})();
