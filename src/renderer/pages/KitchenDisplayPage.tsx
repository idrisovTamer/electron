import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './KitchenDisplayPage.css';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
}

interface KitchenOrder {
  id: number;
  orderNumber: string;
  tableNumber: string;
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready';
  startTime: number;
  station: string;
  priority: 'normal' | 'urgent';
}

const stations = ['Горячий цех', 'Холодный цех', 'Бар', 'Гриль'];
const dishes = [
  'Бургер классический',
  'Бургер чизбургер',
  'Картофель фри',
  'Наггетсы',
  'Салат Цезарь',
  'Суп томатный',
  'Стейк рибай',
  'Курица гриль',
  'Паста карбонара',
  'Пицца маргарита',
  'Кола',
  'Сок апельсиновый',
  'Кофе эспрессо',
  'Чай зеленый',
];

const generateRandomOrder = (id: number): KitchenOrder => {
  const itemCount = Math.floor(Math.random() * 5) + 1;
  const items: OrderItem[] = Array.from({ length: itemCount }, (_, i) => ({
    id: i,
    name: dishes[Math.floor(Math.random() * dishes.length)],
    quantity: Math.floor(Math.random() * 3) + 1,
  }));

  return {
    id,
    orderNumber: `#${String(id).padStart(4, '0')}`,
    tableNumber: `Стол ${Math.floor(Math.random() * 30) + 1}`,
    items,
    status: 'new',
    startTime: Date.now(),
    station: stations[Math.floor(Math.random() * stations.length)],
    priority: Math.random() > 0.8 ? 'urgent' : 'normal',
  };
};

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [orderCount, setOrderCount] = useState(20);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isAutoUpdate, setIsAutoUpdate] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>('Все');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');

  const generateOrders = useCallback((count: number) => {
    const newOrders = Array.from({ length: count }, (_, i) => generateRandomOrder(i + 1));
    setOrders(newOrders);
  }, []);

  useEffect(() => {
    generateOrders(orderCount);
  }, [orderCount, generateOrders]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAutoUpdate) return undefined;

    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        const updated = prevOrders.map((order) => {
          const elapsed = Date.now() - order.startTime;

          if (elapsed > 180000 && order.status !== 'ready') {
            return { ...order, status: 'ready' as const };
          }
          if (elapsed > 60000 && order.status === 'new') {
            return { ...order, status: 'preparing' as const };
          }
          return order;
        });

        if (Math.random() > 0.7) {
          const newOrder = generateRandomOrder(Math.max(...updated.map((o) => o.id)) + 1);
          return [...updated, newOrder];
        }

        if (Math.random() > 0.8 && updated.length > 10) {
          return updated.filter((o) => o.status !== 'ready' || Math.random() > 0.5);
        }

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoUpdate]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (selectedStation !== 'Все') {
      filtered = filtered.filter((order) => order.station === selectedStation);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      }
      return a.startTime - b.startTime;
    });
  }, [orders, selectedStation, sortBy]);

  const stats = useMemo(() => {
    return {
      new: orders.filter((o) => o.status === 'new').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      total: orders.length,
      urgent: orders.filter((o) => o.priority === 'urgent').length,
    };
  }, [orders]);

  const handleStatusChange = useCallback((orderId: number, newStatus: KitchenOrder['status']) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
  }, []);

  const handleRemoveOrder = useCallback((orderId: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }, []);

  return (
    <div className="container kitchen-container">
      <div className="page-header">
        <h1>👨‍🍳 Кухонный экран</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="kitchen-controls">
        <div className="control-row">
          <div className="control-group">
            <label htmlFor="order-count">
              Количество заказов:
              <select
                id="order-count"
                value={orderCount}
                onChange={(e) => setOrderCount(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>

          <div className="control-group">
            <label htmlFor="station-filter">
              Фильтр по станции:
              <select
                id="station-filter"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                <option value="Все">Все станции</option>
                {stations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="control-group">
            <label htmlFor="sort-by">
              Сортировка:
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'priority')}
              >
                <option value="time">По времени</option>
                <option value="priority">По приоритету</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setIsAutoUpdate(!isAutoUpdate)}
            className={isAutoUpdate ? 'secondary' : ''}
          >
            {isAutoUpdate ? '⏸ Остановить авто-обновление' : '▶ Запустить авто-обновление'}
          </button>

          <button type="button" onClick={() => generateOrders(orderCount)}>
            🔄 Обновить заказы
          </button>
        </div>
      </div>

      <div className="kitchen-stats">
        <div className="stat-badge new">Новые: {stats.new}</div>
        <div className="stat-badge preparing">Готовятся: {stats.preparing}</div>
        <div className="stat-badge ready">Готовые: {stats.ready}</div>
        <div className="stat-badge urgent">Срочные: {stats.urgent}</div>
        <div className="stat-badge total">Всего: {stats.total}</div>
      </div>

      <div className="orders-grid">
        {filteredOrders.map((order) => {
          const elapsed = currentTime - order.startTime;
          const isOvertime = elapsed > 300000; // 5 minutes

          return (
            <div
              key={order.id}
              className={`order-card ${order.status} ${order.priority} ${isOvertime ? 'overtime' : ''}`}
            >
              <div className="order-header">
                <div className="order-info">
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="table-number">{order.tableNumber}</span>
                  {order.priority === 'urgent' && <span className="urgent-badge">🔥 СРОЧНО</span>}
                </div>
                <div className="order-timer">{formatTime(elapsed)}</div>
              </div>

              <div className="order-station">{order.station}</div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                ))}
              </div>

              <div className="order-actions">
                {order.status === 'new' && (
                  <button
                    type="button"
                    className="action-btn preparing"
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                  >
                    Начать готовку
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    type="button"
                    className="action-btn ready"
                    onClick={() => handleStatusChange(order.id, 'ready')}
                  >
                    Готово
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    type="button"
                    className="action-btn remove"
                    onClick={() => handleRemoveOrder(order.id)}
                  >
                    Убрать
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">
          <p>Нет заказов для отображения</p>
        </div>
      )}
    </div>
  );
}
