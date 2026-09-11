# v0.1 — что где лежало

Состояние на тег `v0.1-corpus` (`77041f4`, 2026-09-11). Всё перечисленное
проверяется `git ls-tree v0.1-corpus …`; описания модулей взяты из их
собственных заголовочных комментариев, а не составлены по именам файлов.

---

## 1. Страницы: 88 компонентов + 5 прототипов

`src/pages/*.tsx` — 88 файлов верхнего уровня, `src/pages/prototypes/` — 5.
Маршрутизация: `wouter`, 93 элемента `<Route>` в `src/App.tsx`, из них 92
с атрибутом `path`; один без `path` — перехватчик несуществующих адресов.

Группировка ниже — тематическая, по смыслу разделов. В коде страницы лежат
одним плоским каталогом; иерархии подкаталогов у страниц нет.

### 1.1. Вход и первое знакомство (8)

`LandingPage`, `LandingPromoPage`, `SplashScreen`, `OnboardingPage`,
`EcoJourneyPage`, `PresentationPage`, `GenesisPage`, `SitePage`

Витрина и сценарий первого входа. `EcoJourneyPage` — таймлапс по
`eco-timeline.ts`, где планета меняет вид по мере прокрутки.

### 1.2. Карта, глобус, географическое исследование (6)

`WorldMapPage`, `EarthGlobePage`, `ExplorePage`, `ResourceExplorerPage`,
`ObservatoryPage`, `SatellitePage`

### 1.3. Сущности: объекты, субъекты, проекты, R&D (14)

`ObjectsPage`, `ObjectDetailPage`, `SubjectsPage`, `SubjectDetailPage`,
`StakeholderDetailPage`, `OrganizationDetailPage`, `ProjectsPage`,
`ProjectDetailPage`, `ProjectHubPage`, `ProjectLabPage`, `RDPage`,
`RDDetailPage`, `CatalogPage`, `CatalogDetailPage`

Ядро предметной области. Детальные страницы собраны поверх общего макета
`entity-types/` — семь типов сущности с единым контрактом.

### 1.4. Отраслевые домены (11)

`OilGasPage`, `OilGasIntegrationPage`, `EcologyPage`, `EnergyPage`,
`ClimatePage`, `AgritechPage`, `TransportPage`, `CircularPage`,
`WaterRecoveryPage`, `CityPage`, `DiagnosticsPage`

### 1.5. Мегапроект «Арал» (3)

`AralNexusPage`, `AralSeaProjectPage`, `AralWhitepaperPage`

### 1.6. Технологический слой (6)

`IoTPage`, `SensorsPage`, `RoboticsPage`, `DigitalTwinPage`,
`SimulatorPage`, `KnowledgeGraphPage`

### 1.7. Экономика и токен — раздел, вокруг которого прошла чистка (7)

`TokenomicsPage`, `TokenSalePage`, `BlockchainPage`, `TokenizationPage`,
`InvestFlowPage`, `InvestApplicationPage`, `MarketplacePage`

Пять из семи несут снятые утверждения (см. `claims-withdrawn.md`).
`TokenizationPage` — исключение: она описывает **модель** запечатывания
измерения в хэш-ноду, а не выпущенный актив, и потому уцелела целиком.

### 1.8. Управление, право, сообщество (7)

`DAOPage`, `RegulatoryPage`, `ConstructorPage`, `CommunityPage`,
`OpenSciencePage`, `DirectionsPage`, `EcosystemPage`

### 1.9. Партнёры, витрина, возможности (5)

`PartnersIndexPage`, `PartnerEntryPage`, `ShowcasePage`,
`TechMarketplacePage`, `OpportunitiesPage`

### 1.10. Рабочее пространство пользователя (9)

`DashboardPage`, `WorkspacePage`, `AnalyticsPage`, `AlertsPage`,
`MessagesPage`, `NewsFeedPage`, `UpdatesPage`, `ProfilePage`,
`SettingsPage`

### 1.11. Документы и вайтпейпер (4)

`WhitepaperPage`, `WhitepaperFullPage`, `DocumentsPage`, `RoadmapPage`

### 1.12. Доступ и служебные (8)

`AuthPage`, `ActivatePage`, `AdminInvitePage`, `ContactsPage`,
`QRSharePage`, `InnovationsPage`, `TIIFConferencePage`, `NotFoundPage`

### 1.13. Прототипы (5)

`src/pages/prototypes/`: `MonitorHeatmap`, `ObjectTwinHUD`, `ProjectGlass`,
`RDBento`, `SubjectBI` — макеты интерфейсных решений, не подключённые к
основной навигации.

---

## 2. Модули данных: 30 записей верхнего уровня

`src/data/` — 17 файлов `.ts` и 13 каталогов; всего 59 файлов `.ts`
рекурсивно.

### 2.1. Файлы верхнего уровня (17)

| Модуль | Что содержит |
|---|---|
| `objects-data.ts` | База инфраструктурных объектов Центральной Азии: `PlatformObject`, исторические ряды по годам, цвета типов и кризисных состояний |
| `subjects-data.ts` | Организации, ведомства, корпорации (`PlatformSubject`); подмешивает `subjects/oilgas-subjects` |
| `projects-data.ts` | Проекты (`PlatformProject`), статусы, определения портфелей; подмешивает `projects/oilgas-projects` |
| `rd-data.ts` | Инициативы R&D (`RDItem`) из документов VODPROM / VODeco / LoopOrb |
| `solution-data.ts` | Технологические решения на грани внедрения (`SolutionItem`) |
| `catalog-data.ts` | Каталог: производители, институты, стартапы, технологии, оборудование |
| `completed-projects-data.ts` | Исторический портфель проектов водоподготовки 2003–2016 (`CompletedProject`) |
| `vodprom-data.ts` | Сводная база объектов, субъектов и проектов линии VODPROM |
| `regions-data.ts` | Водные регионы мира (`WaterRegion`); источники — World Bank, FAO AQUASTAT, UN-Water |
| `water-bodies-data.ts` | Водные тела как отдельная сущность карты |
| `charvakoye-object.ts` | Чарвакское водохранилище — развёрнутая карточка `FullObjectData`, бассейн Чирчика |
| `map-markers.ts` | Агрегатор: обходит модули сущностей и отдаёт плоский список маркеров с координатами |
| `project-groups.ts` | Логические кластеры проектов как bbox-зоны карты и записи легенды |
| `campaigns-overview.ts` | Обзор кампаний: город-остров, переброс паводковых вод и прочие тиражируемые модули |
| `karakalpak-campaign.ts` | Кампания «Каракалпакия»: экономика, эффекты по векторам, библиотеки знаний, MRV/DePIN |
| `eco-timeline.ts` | Фазы таймлапса воды и параметры внешнего вида глобуса для каждой фазы |
| `ecosystem.ts` | Онбординг: роли входа, интересы-домены, узлы экосистемы |

### 2.2. Каталоги (13)

| Каталог | Файлы | Что содержит |
|---|---|---|
| `objects/` | 7 | Полные карточки объектов: экология, нефтегаз (базовый, расширенный, узбекистанский), региональные, узбекистанские |
| `oilgas/` | 3 | Модуль «Газнефть»: каталог позиций, расширение, методологии добычи/переработки/транспорта |
| `entity-types/` | 8 | Единый контракт детальной страницы для семи типов сущности + общий `types.ts` |
| `opportunities/` | 4 | Реестр возможностей (гранты, конкурсы): Центральная Азия, международные, сборка с валидацией |
| `geo/` | 3 | Гео-источники: Natural Earth через CDN, предфильтрованные слои Центральной Азии, стили слоёв |
| `whitepaper/` | — | **Отсутствует в v0.1.** Появился после тега |
| `apis/` | 3 | Каталог внешних источников с полем `probe` — результатом реального запроса |
| `ecosystem/` | 3 | Программы экосистемы со статусом, выведенным из фактического состояния кода |
| `projects/` | 4 | Развёрнутые проекты (`shirin`), нефтегазовые проекты, контракт `ProjectData` |
| `partners/` | 2 | Восемь партнёрских входов: адрес, презентация, онбординг, срез вайтпейпера, набор позиций |
| `showcase/` | 2 | Витрина контура: четыре поставщика (UNICAP, LabForge, DAOCIV, ArkheOS) |
| `tokenization/` | 1 | Модель запечатывания измерения в хэш-ноду; «сертификатов выдано 0» |
| `diagnostics/` | 1 | Развёртка позиции `OG-RD-VIB-001` — сквозная вибро-волновая диагностика |
| `subjects/` | 1 | Нефтегазовые субъекты: операторы, регуляторы, сервисные компании |

---

## 3. Компоненты, несущие дисциплину корпуса

Отдельно от данных: несколько компонентов существуют не ради вёрстки, а
ради того, чтобы правила корпуса были видны в интерфейсе.

| Компонент | Назначение |
|---|---|
| `src/components/WithdrawnNotice.tsx` | Единый макет страницы со снятым предложением: перечень снятого с причинами |
| `src/components/object/GapText.tsx` | Вывод маркеров `⟨заполнить⟩` / `⟨не решено⟩` без вырезания |
| `src/components/object/SourcesBlock.tsx` | Источники объекта; пустой список не прячется |
| `src/components/object/CoordPrecisionBlock.tsx` | Точность координат как отдельная величина |
| `src/components/object/RelatedEntitiesBlock.tsx` | Связи объекта с другими сущностями |

---

## 4. Расчётного слоя в v0.1 нет

`src/lib/` на теге содержит вспомогательное: брендинг, домены, издание,
типы, i18n, карта, маршрутизация, Supabase, web3. Каталога
`src/lib/economy/` не существует — коэффициент гармонии, оценка сценариев
и золотой путь появились после v0.1. См. `../../EVOLUTION.md`.
