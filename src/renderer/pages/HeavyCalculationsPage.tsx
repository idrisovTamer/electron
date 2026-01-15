import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './HeavyCalculationsPage.css';

interface BenchmarkResult {
  name: string;
  duration: number;
  operations: number;
  result?: string | number;
}

const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const fibonacciIterative = (n: number): number => {
  if (n <= 1) return n;
  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i += 1) {
    const temp = curr;
    curr += prev;
    prev = temp;
  }
  return curr;
};

const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

const generateLargeArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 10000));
};

const quickSort = (arr: number[]): number[] => {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter((x) => x < pivot);
  const middle = arr.filter((x) => x === pivot);
  const right = arr.filter((x) => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
};

const bubbleSort = (arr: number[]): number[] => {
  const sorted = [...arr];
  const { length } = sorted;
  for (let i = 0; i < length; i += 1) {
    for (let j = 0; j < length - 1 - i; j += 1) {
      if (sorted[j] > sorted[j + 1]) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }
  return sorted;
};

const matrixMultiply = (size: number): number => {
  const matrixA = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.random())
  );
  const matrixB = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.random())
  );
  const result = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      for (let k = 0; k < size; k += 1) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result[0][0];
};

export default function HeavyCalculationsPage() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runBenchmark = useCallback(
    (name: string, fn: () => void, operations: number): BenchmarkResult => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      return {
        name,
        duration: end - start,
        operations,
        result: typeof result === 'number' ? result.toFixed(2) : String(result),
      };
    },
    []
  );

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const testResults: BenchmarkResult[] = [];

    const tests = [
      {
        name: 'Fibonacci рекурсивный (n=35)',
        fn: () => fibonacci(35),
        ops: 1,
      },
      {
        name: 'Fibonacci итеративный (n=10000)',
        fn: () => fibonacciIterative(10000),
        ops: 10000,
      },
      {
        name: 'Поиск простых чисел (1-50000)',
        fn: () => {
          let count = 0;
          for (let i = 1; i <= 50000; i += 1) {
            if (isPrime(i)) count += 1;
          }
          return count;
        },
        ops: 50000,
      },
      {
        name: 'Быстрая сортировка (100000 элементов)',
        fn: () => {
          const arr = generateLargeArray(100000);
          quickSort(arr);
          return 'OK';
        },
        ops: 100000,
      },
      {
        name: 'Пузырьковая сортировка (5000 элементов)',
        fn: () => {
          const arr = generateLargeArray(5000);
          bubbleSort(arr);
          return 'OK';
        },
        ops: 5000,
      },
      {
        name: 'Умножение матриц 100x100',
        fn: () => matrixMultiply(100),
        ops: 1000000,
      },
      {
        name: 'Обработка строк (1M операций)',
        fn: () => {
          let result = '';
          for (let i = 0; i < 1000000; i += 1) {
            result = `test${i}`.toUpperCase().toLowerCase();
          }
          return result;
        },
        ops: 1000000,
      },
      {
        name: 'Фильтрация массива (1M элементов)',
        fn: () => {
          const arr = generateLargeArray(1000000);
          const filtered = arr.filter((x) => x > 5000);
          return filtered.length;
        },
        ops: 1000000,
      },
      {
        name: 'Map + Reduce (500k элементов)',
        fn: () => {
          const arr = generateLargeArray(500000);
          return arr.map((x) => x * 2).reduce((sum, x) => sum + x, 0);
        },
        ops: 500000,
      },
      {
        name: 'JSON serialize/parse (большой объект)',
        fn: () => {
          const obj = {
            data: generateLargeArray(10000),
            nested: {
              items: generateLargeArray(5000),
              metadata: { timestamp: Date.now() },
            },
          };
          const json = JSON.stringify(obj);
          JSON.parse(json);
          return json.length;
        },
        ops: 15000,
      },
    ];

    for (let i = 0; i < tests.length; i += 1) {
      const test = tests[i];
      await new Promise((resolve) => {
        setTimeout(() => {
          const result = runBenchmark(test.name, test.fn, test.ops);
          testResults.push(result);
          setProgress(((i + 1) / tests.length) * 100);
          resolve(undefined);
        }, 100);
      });
    }

    setResults(testResults);
    setIsRunning(false);
  }, [runBenchmark]);

  const totalDuration = useMemo(
    () => results.reduce((sum, r) => sum + r.duration, 0),
    [results]
  );

  const averageDuration = useMemo(
    () => (results.length > 0 ? totalDuration / results.length : 0),
    [totalDuration, results.length]
  );

  const slowestTest = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((max, r) => (r.duration > max.duration ? r : max));
  }, [results]);

  const fastestTest = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((min, r) => (r.duration < min.duration ? r : min));
  }, [results]);

  return (
    <div className="container">
      <div className="page-header">
        <h1>🧮 Сложные вычисления</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="test-info">
        <p>
          Этот тест проверяет производительность процессора при выполнении различных
          вычислительных задач:
        </p>
        <ul>
          <li>Рекурсивные и итеративные алгоритмы</li>
          <li>Поиск простых чисел</li>
          <li>Различные алгоритмы сортировки</li>
          <li>Матричные вычисления</li>
          <li>Обработка строк и массивов</li>
          <li>Сериализация/десериализация данных</li>
        </ul>
      </div>

      <div className="controls">
        <button
          type="button"
          onClick={runAllTests}
          disabled={isRunning}
          className={isRunning ? 'running' : ''}
        >
          {isRunning ? `Выполняется... ${progress.toFixed(0)}%` : 'Запустить все тесты'}
        </button>
      </div>

      {isRunning && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="summary-panel">
            <div className="summary-card">
              <span className="summary-label">Всего тестов:</span>
              <span className="summary-value">{results.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Общее время:</span>
              <span className="summary-value">{totalDuration.toFixed(2)} мс</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Среднее время:</span>
              <span className="summary-value">{averageDuration.toFixed(2)} мс</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Самый быстрый:</span>
              <span className="summary-value small">
                {fastestTest?.name.substring(0, 20)}...
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Самый медленный:</span>
              <span className="summary-value small">
                {slowestTest?.name.substring(0, 20)}...
              </span>
            </div>
          </div>

          <div className="results-container">
            <h2>Результаты тестов</h2>
            <div className="results-table">
              <div className="results-header">
                <div className="result-col">Тест</div>
                <div className="result-col">Операций</div>
                <div className="result-col">Время (мс)</div>
                <div className="result-col">Оп/мс</div>
                <div className="result-col">Результат</div>
              </div>
              {results.map((result, index) => (
                <div key={result.name} className="results-row">
                  <div className="result-col">
                    <span className="test-number">{index + 1}.</span> {result.name}
                  </div>
                  <div className="result-col">
                    {result.operations.toLocaleString('ru-RU')}
                  </div>
                  <div className="result-col duration">
                    {result.duration.toFixed(2)}
                  </div>
                  <div className="result-col">
                    {(result.operations / result.duration).toFixed(0)}
                  </div>
                  <div className="result-col result-value">{result.result}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
