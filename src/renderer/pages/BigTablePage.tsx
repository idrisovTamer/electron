import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './BigTablePage.css';

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  time: string;
  customerName: string;
  items: number;
  total: number;
  status: string;
  paymentMethod: string;
  cashier: string;
}

const statuses = ['Новый', 'Готовится', 'Готов', 'Доставляется', 'Закрыт', 'Отменен'];
const paymentMethods = ['Наличные', 'Карта', 'Онлайн'];
const cashiers = ['Иванов И.И.', 'Петрова А.С.', 'Сидоров П.Р.', 'Козлова М.В.'];

const generateOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  const names = [
    'Алексеев', 'Богданов', 'Васильев', 'Григорьев', 'Дмитриев',
    'Егоров', 'Жуков', 'Захаров', 'Иванов', 'Казаков',
  ];

  for (let i = 1; i <= count; i += 1) {
    const date = new Date(2024, 0, Math.floor(Math.random() * 30) + 1);
    orders.push({
      id: i,
      orderNumber: `ORD-${String(i).padStart(6, '0')}`,
      date: date.toLocaleDateString('ru-RU'),
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      customerName: `${names[Math.floor(Math.random() * names.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
      items: Math.floor(Math.random() * 15) + 1,
      total: Math.floor(Math.random() * 5000) + 500,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      cashier: cashiers[Math.floor(Math.random() * cashiers.length)],
    });
  }
  return orders;
};

export default function BigTablePage() {
  const [rowCount, setRowCount] = useState(5000);
  const [sortField, setSortField] = useState<keyof Order | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const orders = useMemo(() => generateOrders(rowCount), [rowCount]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (filterStatus !== 'Все') {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [orders, filterStatus, searchQuery]);

  const sortedOrders = useMemo(() => {
    if (!sortField) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredOrders, sortField, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedOrders, currentPage]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handleSort = useCallback((field: keyof Order) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const handleChangeRowCount = useCallback((count: number) => {
    setRowCount(count);
    setCurrentPage(1);
  }, []);

  const totalSum = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.total, 0),
    [filteredOrders]
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1>📊 Большая таблица заказов</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="controls-panel">
        <div className="control-group">
          <label htmlFor="row-count">
            Количество строк:
            <select
              id="row-count"
              value={rowCount}
              onChange={(e) => handleChangeRowCount(Number(e.target.value))}
            >
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
              <option value={20000}>20,000</option>
            </select>
          </label>
        </div>

        <div className="control-group">
          <label htmlFor="filter-status">
            Фильтр по статусу:
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Все">Все</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="control-group">
          <input
            type="text"
            placeholder="Поиск по номеру или имени..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
      </div>

      <div className="stats-panel">
        <div className="stat-card">
          <span className="stat-label">Всего заказов:</span>
          <span className="stat-value">{orders.length.toLocaleString('ru-RU')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Отфильтровано:</span>
          <span className="stat-value">{filteredOrders.length.toLocaleString('ru-RU')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Общая сумма:</span>
          <span className="stat-value">{totalSum.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('orderNumber')}>
                Номер заказа{' '}
                {sortField === 'orderNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('date')}>
                Дата {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('time')}>
                Время {sortField === 'time' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('customerName')}>
                Клиент{' '}
                {sortField === 'customerName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('items')}>
                Позиций {sortField === 'items' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('total')}>
                Сумма {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                Статус {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('paymentMethod')}>
                Оплата{' '}
                {sortField === 'paymentMethod' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('cashier')}>
                Кассир {sortField === 'cashier' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td className="order-number">{order.orderNumber}</td>
                <td>{order.date}</td>
                <td>{order.time}</td>
                <td>{order.customerName}</td>
                <td>{order.items}</td>
                <td className="total">{order.total.toLocaleString('ru-RU')} ₽</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.paymentMethod}</td>
                <td>{order.cashier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          ← Предыдущая
        </button>
        <span className="page-info">
          Страница {currentPage} из {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Следующая →
        </button>
      </div>
    </div>
  );
}
