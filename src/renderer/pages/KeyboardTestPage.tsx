import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './KeyboardTestPage.css';

export default function KeyboardTestPage() {
  const [input, setInput] = useState('');
  const [layout, setLayout] = useState('default');
  const [currentLayout, setCurrentLayout] = useState<'ru' | 'en' | 'numeric'>('ru');
  const keyboardRef = useRef<any>(null);

  const onChange = (newInput: string) => {
    setInput(newInput);
  };

  const onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayout(layout === 'default' ? 'shift' : 'default');
    }

    if (button === '{enter}') {
      setInput(input + '\n');
    }

    if (button === '{bksp}') {
      setInput(input.slice(0, -1));
    }

    if (button === '{space}') {
      setInput(input + ' ');
    }
  };

  const handleLayoutSwitch = (newLayout: 'ru' | 'en' | 'numeric') => {
    setCurrentLayout(newLayout);
    setLayout('default');
  };

  const handleClear = () => {
    setInput('');
    keyboardRef.current?.clearInput();
  };

  // Русская раскладка
  const russianLayout = {
    default: [
      'й ц у к е н г ш щ з х ъ {bksp}',
      'ф ы в а п р о л д ж э',
      '{shift} я ч с м и т ь б ю . {shift}',
      '{space}',
    ],
    shift: [
      'Й Ц У К Е Н Г Ш Щ З Х Ъ {bksp}',
      'Ф Ы В А П Р О Л Д Ж Э',
      '{shift} Я Ч С М И Т Ь Б Ю , {shift}',
      '{space}',
    ],
  };

  // Английская раскладка
  const englishLayout = {
    default: [
      'q w e r t y u i o p [ ] {bksp}',
      'a s d f g h j k l ; \'',
      '{shift} z x c v b n m , . / {shift}',
      '{space}',
    ],
    shift: [
      'Q W E R T Y U I O P { } {bksp}',
      'A S D F G H J K L : "',
      '{shift} Z X C V B N M < > ? {shift}',
      '{space}',
    ],
  };

  // Цифровая раскладка
  const numericLayout = {
    default: [
      '1 2 3 4 5 6 7 8 9 0 {bksp}',
      '! @ # $ % ^ & * ( )',
      '+ - = / * . , : ; ?',
      '{space}',
    ],
  };

  const getCurrentLayoutObj = () => {
    switch (currentLayout) {
      case 'ru':
        return russianLayout;
      case 'en':
        return englishLayout;
      case 'numeric':
        return numericLayout;
      default:
        return russianLayout;
    }
  };

  return (
    <div className="container keyboard-container">
      <div className="page-header">
        <h1>⌨️ Сенсорная клавиатура</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="test-info">
        <p>
          Тестирование сенсорной клавиатуры для ATOL OPTIMA v7:
        </p>
        <ul>
          <li>Русская QWERTY раскладка</li>
          <li>Английская QWERTY раскладка</li>
          <li>Цифровая клавиатура</li>
          <li>Быстрое переключение между раскладками</li>
          <li>Поддержка Shift и специальных символов</li>
        </ul>
      </div>

      <div className="keyboard-demo">
        <div className="output-section">
          <h2>Ввод текста:</h2>
          <div className="output-display">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Начните печатать на сенсорной клавиатуре..."
              rows={8}
            />
          </div>
          <div className="output-stats">
            <span>Символов: {input.length}</span>
            <span>Слов: {input.trim().split(/\s+/).filter(Boolean).length}</span>
            <button type="button" onClick={handleClear} className="danger">
              🗑️ Очистить
            </button>
          </div>
        </div>

        <div className="keyboard-wrapper">
          <div className="layout-switcher">
            <button
              type="button"
              className={currentLayout === 'ru' ? 'active' : ''}
              onClick={() => handleLayoutSwitch('ru')}
            >
              🇷🇺 Русский
            </button>
            <button
              type="button"
              className={currentLayout === 'en' ? 'active' : ''}
              onClick={() => handleLayoutSwitch('en')}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              className={currentLayout === 'numeric' ? 'active' : ''}
              onClick={() => handleLayoutSwitch('numeric')}
            >
              🔢 123
            </button>
          </div>

          <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r)}
            layoutName={layout}
            layout={getCurrentLayoutObj()}
            onChange={onChange}
            onKeyPress={onKeyPress}
            theme="hg-theme-default keyboard-custom"
            buttonTheme={[
              {
                class: 'keyboard-special',
                buttons: '{shift} {bksp} {space}',
              },
            ]}
          />

          <div className="keyboard-tips">
            <p>💡 <strong>Совет:</strong> Используйте кнопки раскладки для переключения языка</p>
            <p>⌨️ <strong>Shift:</strong> Удерживайте для заглавных букв</p>
            <p>🔙 <strong>Backspace:</strong> Удаление последнего символа</p>
          </div>
        </div>

        <div className="test-phrases">
          <h3>Тестовые фразы:</h3>
          <div className="phrases-grid">
            <button type="button" onClick={() => setInput('Заказ #1234 готов')}>
              Заказ #1234 готов
            </button>
            <button type="button" onClick={() => setInput('Клиент: Иванов Иван')}>
              Клиент: Иванов Иван
            </button>
            <button type="button" onClick={() => setInput('+7 (999) 123-45-67')}>
              +7 (999) 123-45-67
            </button>
            <button type="button" onClick={() => setInput('Адрес: ул. Ленина, д. 10')}>
              Адрес: ул. Ленина, д. 10
            </button>
            <button type="button" onClick={() => setInput('Order #5678 ready')}>
              Order #5678 ready
            </button>
            <button type="button" onClick={() => setInput('Total: 1250.50 ₽')}>
              Total: 1250.50 ₽
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
