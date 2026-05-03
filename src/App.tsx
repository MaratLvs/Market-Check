import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Target, AlertTriangle, Lightbulb, RefreshCw, Bookmark, BarChart3, TrendingUp, CheckCircle2, MessageCircle, X, Bot } from 'lucide-react';
import './App.css';

// --- TYPES ---
type Category = 'Опыт' | 'Навыки' | 'Доказательства' | 'Самостоятельность' | 'Деньги';

interface AnswerOption {
  id: string;
  text: string;
  points: number;
  feedback: string;
}

interface Question {
  id: number;
  category: Category;
  title: string;
  hint: string;
  options: AnswerOption[];
}

interface ResultProfile {
  minScore: number;
  maxScore: number;
  profileTitle: string;
  profileLabel: string;
  marketIndexLabel: string;
  shortDescription: string;
  marketMeaning: string;
  strength: string;
  risk: string;
  recommendations: string[];
  nextStep: string;
  toneTag: string;
}

interface DiagnosticPattern {
  id: string;
  condition: (scores: Record<Category, number>) => boolean;
  priority: number;
  insightTitle: string;
  insight: string;
  whyItHappens: string;
  marketEffect: string;
  growthDirection: string;
}

const DIAGNOSTIC_PATTERNS: DiagnosticPattern[] = [
  {
    id: 'pattern_4',
    priority: 100,
    condition: (s) => s['Опыт'] >= 3 && s['Навыки'] >= 3 && s['Доказательства'] <= 2,
    insightTitle: 'Ты сильнее, чем выглядишь снаружи',
    insight: 'Похоже, твой реальный уровень выше, чем то, как он сейчас представлен рынку. Здесь дело не в том, что тебе срочно нужно становиться лучше, а в том, что ценность нужно яснее показать.',
    whyItHappens: 'Опыт и навыки уже есть, но без кейсов, упаковки и понятной истории результата рынок видит только часть картины.',
    marketEffect: 'Из-за этого тебя могут воспринимать как просто исполнителя, хотя внутри уже есть уровень специалиста, который способен давать больше.',
    growthDirection: 'Сфокусируйся на упаковке: кейсы, портфолио, описание роли, результаты, до/после, отзывы, цифры и понятный оффер.'
  },
  {
    id: 'pattern_2',
    priority: 95,
    condition: (s) => s['Навыки'] >= 3 && s['Деньги'] <= 2,
    insightTitle: 'Навыки сильнее, чем уверенность в цене',
    insight: 'Ты уже умеешь создавать ценность, но, возможно, пока не до конца переводишь это в деньги. Это частая ситуация: профессиональный уровень растет быстрее, чем внутренняя готовность назвать цену.',
    whyItHappens: 'Когда нет ясной связи между работой и результатом для клиента или работодателя, цену сложнее обосновывать даже самому себе.',
    marketEffect: 'На рынке это может приводить к заниженному чеку, мягким переговорам и выбору условий, которые ниже твоего реального вклада.',
    growthDirection: 'Точка роста — не только в навыках, а в формулировке ценности: что именно ты меняешь, экономишь, ускоряешь или улучшаешь.'
  },
  {
    id: 'pattern_1',
    priority: 90,
    condition: (s) => s['Навыки'] >= 3 && s['Доказательства'] <= 2,
    insightTitle: 'Ценность есть, подтверждений пока мало',
    insight: 'Похоже, навыки у тебя уже есть, но рынку пока может не хватать доказательств. Это не про недостаток способностей — скорее про то, насколько ясно они видны снаружи.',
    whyItHappens: 'Ты можешь хорошо выполнять работу, но если нет кейсов, цифр, отзывов или понятных примеров, другим сложнее быстро поверить в твой уровень.',
    marketEffect: 'На рынке это может проявляться в осторожных клиентах, более низких предложениях или ощущении, что тебя недооценивают.',
    growthDirection: 'Собери 2–3 кейса, покажи процесс, результат и свою роль. Это может быстро усилить твою позицию без глобальной прокачки навыков.'
  },
  {
    id: 'pattern_6',
    priority: 90,
    condition: (s) => s['Опыт'] >= 3 && s['Навыки'] >= 3 && s['Доказательства'] >= 3 && s['Самостоятельность'] >= 3 && s['Деньги'] >= 3,
    insightTitle: 'У тебя уже есть рыночный рычаг',
    insight: 'Ты находишься на уровне, где ценность создается не только навыками, но и решениями, ответственностью и влиянием на результат.',
    whyItHappens: 'Когда опыт, навыки, доказательства, самостоятельность и понимание цены собраны вместе, рынок начинает покупать не просто выполнение задач, а мышление и результат.',
    marketEffect: 'Это может давать больше свободы в выборе проектов, переговорах, формате работы и уровне дохода.',
    growthDirection: 'Следующий шаг — масштабирование: авторская методология, консультации, продукты, сильный оффер или переход в роль партнера/эксперта.'
  },
  {
    id: 'pattern_7',
    priority: 88,
    condition: (s) => s['Доказательства'] >= 3 && s['Деньги'] <= 2,
    insightTitle: 'Доказательства есть, цена пока осторожная',
    insight: 'У тебя уже есть чем подтвердить свою ценность, но в денежном блоке может оставаться осторожность. Это значит, что опора для роста цены уже есть — её нужно научиться использовать.',
    whyItHappens: 'Иногда человек собирает опыт и кейсы, но продолжает оценивать себя по старой планке.',
    marketEffect: 'На рынке это может выглядеть так: ты уже можешь просить больше, но продолжаешь соглашаться на привычные условия.',
    growthDirection: 'Пересобери аргументацию цены через кейсы, результаты, пользу и уровень ответственности. Цена должна опираться не на смелость, а на доказательства.'
  },
  {
    id: 'pattern_8',
    priority: 87,
    condition: (s) => s['Самостоятельность'] >= 3 && s['Доказательства'] <= 2,
    insightTitle: 'Ответственности много, видимости мало',
    insight: 'Похоже, ты уже можешь принимать решения и влиять на процесс, но это пока недостаточно видно в твоей внешней упаковке.',
    whyItHappens: 'Так бывает, когда человек фактически ведет задачи глубже, чем описывает свою роль в портфолио, резюме или самопрезентации.',
    marketEffect: 'Рынок может не замечать твою самостоятельность и оценивать тебя ниже, чем позволяет реальный вклад.',
    growthDirection: 'Покажи не только что ты сделал, но и какие решения принимал, какие варианты выбирал и на какой результат повлиял.'
  },
  {
    id: 'pattern_3',
    priority: 85,
    condition: (s) => s['Опыт'] >= 3 && s['Самостоятельность'] <= 2,
    insightTitle: 'Опыта больше, чем влияния',
    insight: 'У тебя уже есть практическая база, но по ответам похоже, что ты чаще находишься в роли исполнителя, чем человека, который влияет на решения.',
    whyItHappens: 'Так бывает, когда опыт накапливается через задачи, но не превращается в самостоятельность, инициативу и ответственность за результат.',
    marketEffect: 'На рынке это может удерживать тебя в более операционной роли, даже если опыта уже достаточно для большего.',
    growthDirection: 'Следующий шаг — брать больше решений на себя: предлагать варианты, объяснять trade-off, вести часть процесса и показывать влияние на итог.'
  },
  {
    id: 'pattern_5',
    priority: 80,
    condition: (s) => s['Опыт'] <= 2 && s['Навыки'] <= 2 && s['Доказательства'] <= 2 && s['Самостоятельность'] <= 2 && s['Деньги'] <= 2,
    insightTitle: 'Сейчас формируется база',
    insight: 'Сейчас ты находишься на этапе сборки фундамента. Это не плохая точка — просто рынок пока не может устойчиво считать твою ценность.',
    whyItHappens: 'Когда мало опыта, доказательств и самостоятельности, цена и уверенность обычно тоже остаются нестабильными.',
    marketEffect: 'На рынке это может проявляться в сомнениях, небольших проектах, низком чеке или зависимости от внешней оценки.',
    growthDirection: 'Лучшее решение сейчас — не пытаться сразу прыгнуть выше, а собрать опору: один навык, несколько практических проектов и первые доказательства результата.'
  }
];

function getMatchingDiagnosticPattern(categoryScores: Record<Category, number>): DiagnosticPattern | undefined {
  const matches = DIAGNOSTIC_PATTERNS.filter(pattern => pattern.condition(categoryScores));
  if (matches.length === 0) return undefined;
  
  return matches.reduce((prev, current) => {
    return (current.priority > prev.priority) ? current : prev;
  });
}

// --- DATA ---
const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Опыт',
    title: 'Сколько у тебя реальной практики?',
    hint: 'Не стаж в резюме, а именно опыт решения задач.',
    options: [
      { id: '1a', text: 'Меньше 1 года', points: 1, feedback: 'Вот тут рынок чувствует слабину' },
      { id: '1b', text: '1–3 года', points: 2, feedback: 'Норм, но есть куда усилиться' },
      { id: '1c', text: '3–5 лет', points: 3, feedback: 'Сильный ход' },
      { id: '1d', text: '5+ лет', points: 4, feedback: 'Ты играешь увереннее большинства' },
    ],
  },
  {
    id: 2,
    category: 'Навыки',
    title: 'Как ты оцениваешь свои навыки?',
    hint: 'Выбирай не самый приятный вариант, а самый честный.',
    options: [
      { id: '2a', text: 'Знаю базу', points: 1, feedback: 'Пока это зона роста' },
      { id: '2b', text: 'Уверенно работаю', points: 2, feedback: 'База есть, рычага пока мало' },
      { id: '2c', text: 'Решаю сложные задачи', points: 3, feedback: 'Это уже похоже на рыночную позицию' },
      { id: '2d', text: 'Обучаю других', points: 4, feedback: 'Это уже уровень влияния' },
    ],
  },
  {
    id: 3,
    category: 'Доказательства',
    title: 'Что у тебя есть в портфеле?',
    hint: 'Рынок верит не словам, а доказательствам.',
    options: [
      { id: '3a', text: 'Пока нет реальных проектов', points: 1, feedback: 'Здесь ты можешь терять деньги' },
      { id: '3b', text: 'Есть учебные работы', points: 2, feedback: 'Вот тут многие застревают' },
      { id: '3c', text: 'Есть реальные проекты', points: 3, feedback: 'Хорошая опора' },
      { id: '3d', text: 'Есть кейсы с результатами', points: 4, feedback: 'Сильно. Это можно монетизировать' },
    ],
  },
  {
    id: 4,
    category: 'Самостоятельность',
    title: 'Как ты работаешь с задачами?',
    hint: 'Здесь проверяется не исполнительность, а степень влияния.',
    options: [
      { id: '4a', text: 'Мне нужен постоянный контроль', points: 1, feedback: 'Вот тут рынок чувствует слабину' },
      { id: '4b', text: 'Работаю по понятному ТЗ', points: 2, feedback: 'Норм, но есть куда усилиться' },
      { id: '4c', text: 'Сам принимаю решения', points: 3, feedback: 'Сильный ход' },
      { id: '4d', text: 'Строю процессы и веду других', points: 4, feedback: 'Это уже уровень влияния' },
    ],
  },
  {
    id: 5,
    category: 'Деньги',
    title: 'Как ты относишься к своей цене?',
    hint: 'Цена — это не только про деньги. Это про уверенность в ценности.',
    options: [
      { id: '5a', text: 'Не знаю, сколько просить', points: 1, feedback: 'Здесь ты можешь терять деньги' },
      { id: '5b', text: 'Беру примерно как все', points: 2, feedback: 'База есть, рычага пока мало' },
      { id: '5c', text: 'Понимаю свою ценность', points: 3, feedback: 'Хорошая опора' },
      { id: '5d', text: 'Могу диктовать условия', points: 4, feedback: 'Ты играешь увереннее большинства' },
    ],
  },
];

const PROFILES: ResultProfile[] = [
  {
    minScore: 5,
    maxScore: 8,
    profileTitle: 'Ты в начале пути',
    profileLabel: 'Потенциал без опоры',
    marketIndexLabel: 'Зона формирования',
    shortDescription: 'Сейчас ты скорее набираешь базу, чем уверенно продаешь свою ценность. Это нормально: рынок еще не видит в тебе устойчивого специалиста.',
    marketMeaning: 'На рынке это обычно проявляется так: сложно аргументировать цену, мало уверенности в переговорах, а выбор проектов часто зависит не от тебя.',
    strength: 'У тебя есть пространство для быстрого роста: на этом этапе даже один сильный проект может заметно изменить позицию.',
    risk: 'Главный риск — слишком рано пытаться продавать себя дорого без доказательств и понятной базы.',
    recommendations: [
      'Выбери один навык и прокачай его до уверенного уровня',
      'Сделай 2–3 реальных проекта, даже небольших',
      'Собери первые доказательства: кейсы, отзывы, примеры работы'
    ],
    nextStep: 'Твоя первая задача — не поднимать цену, а создать доказательства ценности.',
    toneTag: 'Стартовая сборка',
  },
  {
    minScore: 9,
    maxScore: 12,
    profileTitle: 'Ты на уровне, но недожимаешь',
    profileLabel: 'Специалист с нераскрытой ценностью',
    marketIndexLabel: 'Рабочая позиция',
    shortDescription: 'У тебя уже есть база, но ты, скорее всего, используешь ее не на максимум. Рынок может видеть в тебе исполнителя, хотя внутри уже есть больше.',
    marketMeaning: 'На рынке это часто выглядит так: ты можешь делать хорошую работу, но не всегда умеешь показать результат, объяснить свою ценность и уверенно говорить о деньгах.',
    strength: 'У тебя уже есть фундамент. Его можно превратить в более сильную позицию через упаковку и доказательства.',
    risk: 'Главный риск — оставаться удобным исполнителем и брать меньше, чем позволяет твой реальный уровень.',
    recommendations: [
      'Перепиши самопрезентацию через результаты, а не навыки',
      'Упакуй 2–3 проекта в понятные кейсы',
      'Начни брать больше ответственности за итог, а не только за задачу'
    ],
    nextStep: 'Тебе нужно не больше стараться, а яснее показывать, за что тебе платят.',
    toneTag: 'Недожатый потенциал',
  },
  {
    minScore: 13,
    maxScore: 16,
    profileTitle: 'Ты уверенный специалист',
    profileLabel: 'Рыночный игрок',
    marketIndexLabel: 'Сильная позиция',
    shortDescription: 'Ты уже понимаешь свою ценность и можешь выбирать проекты осознаннее. Твоя позиция достаточно крепкая, чтобы не просто искать возможности, а фильтровать их.',
    marketMeaning: 'На рынке это значит, что ты можешь претендовать на более интересные задачи, обсуждать условия увереннее и строить карьеру не только через опыт, но и через стратегию.',
    strength: 'Твоя сила — в сочетании навыков, самостоятельности и понимания своей ценности.',
    risk: 'Главный риск — застрять на комфортном уровне и перестать усиливать видимость, кейсы и переговорную позицию.',
    recommendations: [
      'Выбирай проекты, где есть рост и влияние',
      'Развивай портфолио через измеримые результаты',
      'Усиливай личную упаковку: кейсы, профиль, оффер, коммуникацию'
    ],
    nextStep: 'Тебе пора перестать просто выполнять задачи и начать управлять своей рыночной траекторией.',
    toneTag: 'Сильная база',
  },
  {
    minScore: 17,
    maxScore: 20,
    profileTitle: 'Ты играешь в другой лиге',
    profileLabel: 'Специалист с рыночным рычагом',
    marketIndexLabel: 'Премиальная позиция',
    shortDescription: 'Ты влияешь на результат, умеешь принимать решения и понимаешь свою ценность. На этом уровне рынок покупает не просто твое время, а твое мышление.',
    marketMeaning: 'На рынке это значит, что ты можешь диктовать условия, выбирать клиентов или работодателей, запускать свои продукты и выходить за рамки роли исполнителя.',
    strength: 'Твоя сила — в способности создавать результат, брать ответственность и мыслить шире задачи.',
    risk: 'Главный риск — продолжать продавать себя как специалиста, когда уже можно играть как эксперт, партнер или создатель продукта.',
    recommendations: [
      'Масштабируйся через продукты, консультации или авторские решения',
      'Упакуй экспертизу в систему, методологию или предложение',
      'Думай как владелец: ищи рычаги, а не просто новые задачи'
    ],
    nextStep: 'Твоя следующая точка роста — не еще больше работать, а построить систему вокруг своей ценности.',
    toneTag: 'Другая лига',
  }
];

// --- APP COMPONENT ---
export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qId -> points
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= QUESTIONS.length && isStarted;

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleAnswer = (option: AnswerOption) => {
    if (selectedAnswerId || isShowingFeedback) return;
    
    setSelectedAnswerId(option.id);
    setSelectedFeedback(option.feedback);
    setIsShowingFeedback(true);
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.points }));

    setTimeout(() => {
      setIsShowingFeedback(false);
      setSelectedAnswerId(null);
      setCurrentQuestionIndex(prev => prev + 1);
    }, 850);
  };

  const handleRestart = () => {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setAnswers({});
    setIsShowingFeedback(false);
    setSelectedFeedback('');
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // --- RENDERING LOGIC ---
  if (!isStarted) {
    return (
      <div className="app-container">
        <div className="bg-glow"></div>
        <main className="main-content">
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-badge">
                <Target size={16} />
                <span>Рыночная самодиагностика</span>
              </div>
              <h1 className="t-display">Сколько ты реально стоишь на рынке</h1>
              <p className="t-h3" style={{ color: 'var(--c-text-soft)', fontWeight: 500 }}>
                Ответь на 5 вопросов и получи не просто баллы, а честную расшифровку своей позиции.
              </p>
              <p className="t-caption">5 вопросов · 2 минуты · без воды</p>
              <button className="btn-primary" onClick={handleStart} style={{ marginTop: '16px' }}>
                Проверить себя <ArrowRight size={20} />
              </button>
            </div>
            
            <div className="hero-preview">
              <div className="hero-preview-card">
                <div style={{ color: 'var(--c-text-sec)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Твой профиль</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-emerald)', marginBottom: '16px' }}>Специалист с рыночным рычагом</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>87</span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--c-text-sec)', paddingBottom: '6px' }}>/100</span>
                </div>
                <div style={{ color: 'var(--c-lime)', fontWeight: 600, fontSize: '0.875rem' }}>Премиальная позиция</div>
                
                <div className="preview-chips">
                  <span className="chip">Деньги</span>
                  <span className="chip">Навыки</span>
                  <span className="chip">Кейсы</span>
                  <span className="chip">Цена</span>
                  <span className="chip">Позиция</span>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isFinished) {
    const progressPercent = (currentQuestionIndex / QUESTIONS.length) * 100;
    
    return (
      <div className="app-container">
        <div className="bg-glow"></div>
        <main className="main-content">
          <section className="quiz-section">
            <div className="progress-container">
              <div className="progress-header">
                <span>Вопрос {currentQuestionIndex + 1} из {QUESTIONS.length}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="question-card glass-card">
              <div className="question-header">
                <div style={{ color: 'var(--c-emerald)', fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentQuestion.category}
                </div>
                <h2 className="t-h2">{currentQuestion.title}</h2>
                <p className="question-hint">{currentQuestion.hint}</p>
              </div>

              <div className="options-grid">
                {currentQuestion.options.map(option => {
                  const isSelected = selectedAnswerId === option.id;
                  const isDisabled = selectedAnswerId !== null;
                  
                  return (
                    <button
                      key={option.id}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      disabled={isDisabled}
                      onClick={() => handleAnswer(option)}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        {isShowingFeedback && (
          <div className="feedback-overlay">
            <div className="feedback-text">{selectedFeedback}</div>
          </div>
        )}
      </div>
    );
  }

  // --- RESULT COMPUTATION ---
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const marketIndex = Math.round(((totalScore - 5) / 15) * 100);
  const clampedIndex = Math.min(100, Math.max(0, marketIndex));
  
  const resultProfile = PROFILES.find(p => totalScore >= p.minScore && totalScore <= p.maxScore) || PROFILES[0];

  const categoryScores = QUESTIONS.reduce((acc, q) => {
    acc[q.category] = answers[q.id] || 0;
    return acc;
  }, {} as Record<Category, number>);

  const diagnosticPattern = getMatchingDiagnosticPattern(categoryScores);

  const getStatusText = (points: number) => {
    switch(points) {
      case 1: return 'зона роста';
      case 2: return 'база есть';
      case 3: return 'сильная опора';
      case 4: return 'рыночный рычаг';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      <main className="main-content" style={{ marginTop: '24px' }}>
        <section className="result-section">
          
          <div className="result-dashboard-grid">
            {/* PATTERN CARD */}
            {diagnosticPattern && (
              <div className="diagnostic-pattern-card glass-card" style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                <div className="pattern-header">
                  <Lightbulb size={20} color="var(--c-gold)" />
                  <span style={{ color: 'var(--c-gold)' }}>Что у тебя происходит сейчас</span>
                </div>
                <h3 className="t-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '16px', marginTop: '16px' }}>{diagnosticPattern.insightTitle}</h3>
                <p style={{ fontSize: '1.125rem', lineHeight: '1.6', color: 'var(--c-text-main)', marginBottom: '24px' }}>{diagnosticPattern.insight}</p>
                
                <div className="pattern-details" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  <div className="pattern-block">
                    <div className="pattern-block-title">Почему так</div>
                    <p>{diagnosticPattern.whyItHappens}</p>
                  </div>
                  <div className="pattern-block">
                    <div className="pattern-block-title">Что это меняет</div>
                    <p>{diagnosticPattern.marketEffect}</p>
                  </div>
                  <div className="pattern-block">
                    <div className="pattern-block-title">Куда расти дальше</div>
                    <p>{diagnosticPattern.growthDirection}</p>
                  </div>
                </div>
              </div>
            )}

            {/* HERO CARD */}
            <div className="profile-hero-card glass-card">
              <div className="profile-header">
                <div className="profile-meta">
                  <div>
                    <span className="tag-accent">{resultProfile.toneTag}</span>
                    <div style={{ color: 'var(--c-text-sec)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '16px' }}>
                      {resultProfile.profileLabel}
                    </div>
                  </div>
                  <div className="index-display">
                    <div className="index-score">{clampedIndex}<span style={{ fontSize: '1.25rem', color: 'var(--c-text-sec)', verticalAlign: 'top', marginLeft: '2px' }}>/100</span></div>
                    <div className="index-label">{resultProfile.marketIndexLabel}</div>
                  </div>
                </div>
                <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{resultProfile.profileTitle}</h2>
              </div>
              <p className="profile-desc">{resultProfile.shortDescription}</p>
            </div>

            {/* INSIGHTS */}
            <div className="insight-card glass-card market">
              <div className="insight-header"><BarChart3 size={18} /> Как это выглядит на рынке</div>
              <p className="t-body">{resultProfile.marketMeaning}</p>
            </div>

            <div className="insight-card glass-card strength">
              <div className="insight-header"><Zap size={18} /> Твоя сильная сторона</div>
              <p className="t-body">{resultProfile.strength}</p>
            </div>

            <div className="insight-card glass-card risk">
              <div className="insight-header"><AlertTriangle size={18} /> Главный риск</div>
              <p className="t-body">{resultProfile.risk}</p>
            </div>

            {/* BREAKDOWN */}
            <div className="breakdown-section glass-card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Разбор по параметрам</div>
              <div className="breakdown-list">
                {QUESTIONS.map(q => {
                  const pts = answers[q.id];
                  const percent = (pts / 4) * 100;
                  return (
                    <div className="breakdown-item" key={q.id}>
                      <div className="bd-name">{q.category}</div>
                      <div className="bd-bar"><div className="bd-fill" style={{ width: `${percent}%` }}></div></div>
                      <div className="bd-status">{pts}/4 · {getStatusText(pts)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="actions-section" style={{ gridColumn: '1 / -1' }}>
              <h3 className="t-h2" style={{ marginBottom: '16px' }}>Что делать дальше</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <ul className="recommendations-list glass-card" style={{ padding: '24px' }}>
                  {resultProfile.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
                <div className="next-step-card glass-card">
                  <div className="insight-header" style={{ color: 'var(--c-emerald)', marginBottom: '8px' }}><Target size={18} /> Главный следующий шаг</div>
                  <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--c-text-main)' }}>{resultProfile.nextStep}</p>
                </div>
              </div>
            </div>
            
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
             <p style={{ color: 'var(--c-text-sec)', textAlign: 'center', maxWidth: '400px' }}>
              Можно остаться на этом уровне. А можно начать расти осознанно — через навыки, доказательства, упаковку и цену.
             </p>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
               <button className="btn-primary" onClick={handleRestart}>Пройти заново <RefreshCw size={18} /></button>
               <button className="btn-secondary" onClick={handleSave}>
                 {isSaved ? <><CheckCircle2 size={18} color="var(--c-lime)" /> Результат зафиксирован</> : <><Bookmark size={18} /> Сохранить результат</>}
               </button>
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--c-text-sec)', marginTop: '8px' }}>Ответы не сохраняются. Это честная самопроверка, не приговор.</p>
          </div>
        </section>
        
        <MarketCoach 
          profile={resultProfile}
          marketIndex={clampedIndex}
          pattern={diagnosticPattern}
          categoryScores={categoryScores}
        />
      </main>
      <Footer />
    </div>
  );
}

// --- ASSISTANT ---
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const ASSISTANT_QUESTIONS = [
  "Почему у меня такой результат?",
  "Что улучшить первым?",
  "Где я могу терять деньги?",
  "Как усилить позицию за 7 дней?",
  "Я не согласен с результатом"
] as const;

interface MarketCoachProps {
  profile: ResultProfile;
  marketIndex: number;
  pattern: DiagnosticPattern | undefined;
  categoryScores: Record<Category, number>;
}

function MarketCoach({ profile, marketIndex, pattern, categoryScores }: MarketCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      text: 'Привет! Я Market Coach. Помогу интерпретировать результат и наметить следующие шаги. Что бы тебе хотелось разобрать?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
  const strongest = sortedCategories[0][0];
  const weakest = sortedCategories[sortedCategories.length - 1][0];

  const getAssistantResponse = (q: string): string => {
    switch (q) {
      case "Почему у меня такой результат?":
        return `Твой индекс — ${marketIndex}/100, это соответствует уровню «${profile.profileTitle}». ${pattern ? pattern.insight : `По ответам видно, что твоя уверенная опора — это ${strongest}, а зона роста — ${weakest}.`} Это не оценка способностей, а текущий снимок того, как твоя ценность может восприниматься снаружи.`;
        
      case "Что улучшить первым?":
        let weakAdvice = '';
        if (weakest === 'Деньги') weakAdvice = 'Попробуй проанализировать, почему называть более высокую цену пока может быть некомфортно.';
        else if (weakest === 'Доказательства') weakAdvice = 'Самое простое действие — упаковать 1-2 недавних понятных кейса.';
        else if (weakest === 'Навыки') weakAdvice = 'Стоит выбрать один ключевой современный навык в твоей нише и точечно его усилить.';
        else if (weakest === 'Опыт') weakAdvice = 'Здесь поможет только время и практика: бери небольшие, но реальные проекты, чтобы накопить насмотренность.';
        else if (weakest === 'Самостоятельность') weakAdvice = 'Попробуй в следующем проекте взять на себя ответственность не только за задачу, но и за одно ключевое решение.';
        
        return `Сейчас лучше всего сфокусироваться на категории «${weakest}». Именно она может снижать общую видимость твоей ценности. ${weakAdvice}`;

      case "Где я могу терять деньги?":
        return `Чаще всего потери происходят там, где есть разрыв между фактическим уровнем и тем, как он представлен. Твоя сильная категория — «${strongest}», а требующая внимания — «${weakest}». Если ты делаешь много, но это не подкреплено в зоне «${weakest}», рынок может реагировать более низкими чеками. Точка роста — сократить этот разрыв.`;

      case "Как усилить позицию за 7 дней?":
        return `Глобальные изменения требуют времени, но за неделю можно усилить видимость того, что уже есть. Первое: ${pattern ? pattern.growthDirection : profile.nextStep} Второе: выбери одну сильную задачу из своего опыта и опиши её по структуре «Задача → Мои решения → Итог».`;

      case "Я не согласен с результатом":
        return `Это нормально! Любая диагностика — это лишь зеркало твоих ответов в моменте, а не абсолютная истина. Возможно, ты оцениваешь себя строже, чем есть на самом деле, или специфика твоей сферы отличается. Попробуй взять из результата только то, что кажется тебе полезным. Например, мысль о том, что зона роста — «${weakest}», внутренне откликается?`;
        
      default:
        return "Я могу ответить на вопросы из списка, чтобы помочь тебе точнее интерпретировать профиль.";
    }
  };

  const handleOptionClick = (question: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    
    // Имитация "думающего" ассистента перед ответом
    setTimeout(() => {
      const responseText = getAssistantResponse(question);
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText };
      setMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  return (
    <>
      <button 
        className="assistant-fab" 
        onClick={() => setIsOpen(true)}
        aria-label="Открыть Market Coach ассистента"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="assistant-window glass-card" style={{ padding: 0 }}>
          <div className="assistant-header">
            <div className="assistant-title">
              <Bot size={20} color="var(--c-emerald)" />
              <span>Market Coach</span>
            </div>
            <button 
              className="assistant-close"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть ассистента"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="assistant-body">
            {messages.map((m) => (
              <div key={m.id} className={`chat-message ${m.role}`}>
                {m.text}
              </div>
            ))}
            
            <div className="assistant-options">
              {ASSISTANT_QUESTIONS.map((q) => (
                <button 
                  key={q} 
                  className="assistant-option-btn"
                  onClick={() => handleOptionClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>Диагностика рыночной позиции специалиста</div>
      <div>© 2026 Market Check</div>
    </footer>
  );
}

