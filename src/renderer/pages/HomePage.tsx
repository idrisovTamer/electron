import { Link } from 'react-router-dom';
import './HomePage.css';

interface TestCard {
  title: string;
  description: string;
  path: string;
  icon: string;
  difficulty: 'low' | 'medium' | 'high' | 'extreme';
}

const tests: TestCard[] = [
  {
    title: 'Большая таблица',
    description: 'Рендеринг и работа с таблицей из 5000+ строк. Сортировка, фильтрация, виртуализация.',
    path: '/big-table',
    icon: '📊',
    difficulty: 'high',
  },
  {
    title: 'Сложные вычисления',
    description: 'Математические операции, сортировки массивов, фильтрации больших данных.',
    path: '/calculations',
    icon: '🧮',
    difficulty: 'extreme',
  },
  {
    title: 'Canvas анимации',
    description: 'Графика и анимации с использованием Canvas. Частицы, графики, визуализации.',
    path: '/canvas',
    icon: '🎨',
    difficulty: 'high',
  },
  {
    title: 'Кухонный экран',
    description: 'Имитация экрана кухни с 50+ заказами, таймерами, обновлениями в реальном времени.',
    path: '/kitchen',
    icon: '👨‍🍳',
    difficulty: 'extreme',
  },
];

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'low':
      return '#4CAF50';
    case 'medium':
      return '#FF9800';
    case 'high':
      return '#FF5722';
    case 'extreme':
      return '#D32F2F';
    default:
      return '#757575';
  }
};

const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'low':
      return 'Легко';
    case 'medium':
      return 'Средне';
    case 'high':
      return 'Тяжело';
    case 'extreme':
      return 'Экстрим';
    default:
      return '';
  }
};

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>🚀 Стресс-тест ATOL OPTIMA v7</h1>
        <p className="subtitle">
          Тестирование производительности терминала для POS-системы
        </p>
      </div>

      <div className="system-info">
        <div className="info-card">
          <span className="info-label">Дата:</span>
          <span className="info-value">{new Date().toLocaleDateString('ru-RU')}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Время:</span>
          <span className="info-value">{new Date().toLocaleTimeString('ru-RU')}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Платформа:</span>
          <span className="info-value">{navigator.platform}</span>
        </div>
      </div>

      <div className="tests-grid">
        {tests.map((test) => (
          <Link to={test.path} key={test.path} className="test-card-link">
            <div className="test-card">
              <div className="test-icon">{test.icon}</div>
              <h2 className="test-title">{test.title}</h2>
              <p className="test-description">{test.description}</p>
              <div
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(test.difficulty) }}
              >
                {getDifficultyText(test.difficulty)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="footer">
        <p>
          💡 Совет: Запускайте тесты последовательно и следите за
          производительностью системы
        </p>
      </div>
    </div>
  );
}
