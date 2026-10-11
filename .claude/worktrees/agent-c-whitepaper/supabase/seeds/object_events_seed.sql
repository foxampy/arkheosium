-- Aral Sea critical events
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, severity, source_name, verified) VALUES
('OBJ-ARAL-SEA', '1960-01-01', 'milestone', 'Начало советской ирригационной программы', 'СССР запускает масштабный забор воды из Амударьи и Сырдарьи для хлопковых полей. Начало деградации Аральского моря.', 'critical', 'FAO', true),
('OBJ-ARAL-SEA', '1987-01-01', 'incident', 'Море разделяется на два водоёма', 'Уровень воды упал настолько, что море разделилось на Северное и Южное Аральское море.', 'critical', 'UNEP', true),
('OBJ-ARAL-SEA', '2007-01-01', 'incident', 'Южная часть практически исчезает', 'Южное Аральское море сократилось до 10% от объёма 1960 года. Ежегодные пыльные бури несут токсичные соли.', 'critical', 'NASA/USGS', true),
('OBJ-ARAL-SEA', '2005-01-01', 'milestone', 'Строительство дамбы Кок-Арал', 'Казахстан строит дамбу стоимостью $85M для восстановления Северного Аральского моря. Уровень воды поднялся на 3 м за 2 года.', null, 'World Bank', true),
('OBJ-ARAL-SEA', '2023-01-01', 'milestone', 'Северное море восстанавливается', 'Уровень Малого Арала стабилизировался. Рыболовство частично возобновлено. Южная часть остаётся критической.', null, 'IFAS', true);

-- Colorado River / Lake Mead
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, cost_usd, severity, source_name, verified) VALUES
('OBJ-COLORADO-RIVER-001', '1922-01-01', 'milestone', 'Colorado River Compact подписан', '7 штатов США делят воду. Базовые расчёты завышены из-за аномально влажного периода.', null, null, 'US Bureau of Reclamation', true),
('OBJ-COLORADO-RIVER-001', '1935-01-01', 'construction', 'Завершение плотины Гувера', 'Строительство плотины Гувера — $49M (1935 = ~$900M сегодня). Создаёт озеро Мид.', 49000000, null, 'US Bureau of Reclamation', true),
('OBJ-COLORADO-RIVER-001', '2000-01-01', 'incident', 'Начало многолетней засухи', 'Уровень озера Мид начинает падение, которое продолжится 22 года.', null, 'high', 'USBR', true),
('OBJ-COLORADO-RIVER-001', '2021-08-16', 'incident', 'Первый официальный дефицит воды', 'Впервые в истории США объявлен официальный дефицит воды в бассейне Колорадо. Уровень Мид = 35%.', null, 'critical', 'US Bureau of Reclamation', true),
('OBJ-COLORADO-RIVER-001', '2022-08-01', 'incident', 'Исторический минимум — 27% мощности', 'Озеро Мид достигает исторического минимума 1040 футов. Угроза остановки ГЭС Гувера.', null, 'critical', 'USBR/NASA', true),
('OBJ-COLORADO-RIVER-001', '2023-05-01', 'milestone', 'Экстренное соглашение 7 штатов', 'Штаты договорились сократить водопотребление на 3 млн акро-футов до 2026 года. Стоимость компенсаций: $1.2B.', 1200000000, null, 'US DOI', true);

-- Lake Chad
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, severity, source_name, verified) VALUES
('OBJ-LAKE-CHAD-001', '1963-01-01', 'milestone', 'Максимальная площадь — 25,000 км²', 'Пиковое значение площади озера. Начало систематических измерений.', null, 'LCBC', true),
('OBJ-LAKE-CHAD-001', '1973-01-01', 'incident', 'Засуха Сахеля — первый кризис', 'Площадь озера сокращается до 11,000 км². Первый массовый кризис водоснабжения региона.', 'high', 'UN', true),
('OBJ-LAKE-CHAD-001', '2000-01-01', 'incident', 'Озеро теряет 90% площади', 'Площадь сократилась до 2,500 км². Более 30 млн человек под угрозой.', 'critical', 'UNEP/NASA', true),
('OBJ-LAKE-CHAD-001', '2017-01-01', 'incident', 'Связь с Боко Харам', 'ООН признаёт деградацию озера одной из причин нестабильности и конфликтов в регионе.', 'critical', 'UNDP', true);

-- Amu Darya
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, cost_usd, severity, source_name, verified) VALUES
('OBJ-AMU-DARYA-001', '1950-01-01', 'construction', 'Большой Ферганский канал', 'Строительство одного из крупнейших ирригационных каналов в истории ЦА. Длина 270 км.', 500000000, null, 'USSR Minvodkhoz', true),
('OBJ-AMU-DARYA-001', '1979-01-01', 'construction', 'Каракумский канал завершён', 'Длина 1375 км, пропускная способность 500 м³/с. Отводит 45% стока Амударьи в Туркменистан.', 2000000000, null, 'USSR', true),
('OBJ-AMU-DARYA-001', '2023-01-01', 'incident', 'Критический уровень стока', 'Среднегодовой сток снизился до 30 км³/год против исторической нормы 80 км³/год.', null, 'critical', 'CAWATER-INFO', true);
