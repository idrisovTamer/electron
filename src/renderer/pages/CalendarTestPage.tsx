import { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { format, addDays, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-calendar/dist/Calendar.css';
import './CalendarTestPage.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  id: number;
  date: Date;
  title: string;
  type: 'delivery' | 'booking' | 'meeting' | 'task';
}

const eventTypes = {
  delivery: { label: 'Доставка', color: '#4CAF50' },
  booking: { label: 'Бронь', color: '#2196F3' },
  meeting: { label: 'Встреча', color: '#FF9800' },
  task: { label: 'Задача', color: '#f44336' },
};

export default function CalendarTestPage() {
  const [singleDate, setSingleDate] = useState<Value>(new Date());
  const [rangeDate, setRangeDate] = useState<Value>([new Date(), addDays(new Date(), 7)]);
  const [multipleCalendars, setMultipleCalendars] = useState([new Date(), addMonths(new Date(), 1), addMonths(new Date(), 2)]);
  const [events, setEvents] = useState<Event[]>([
    { id: 1, date: new Date(), title: 'Заказ #1234', type: 'delivery' },
    { id: 2, date: addDays(new Date(), 1), title: 'Стол 5 - 18:00', type: 'booking' },
    { id: 3, date: addDays(new Date(), 2), title: 'Поставщик', type: 'meeting' },
    { id: 4, date: addDays(new Date(), 3), title: 'Инвентаризация', type: 'task' },
    { id: 5, date: addDays(new Date(), 5), title: 'Заказ #1235', type: 'delivery' },
  ]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(
        (event) => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      if (dayEvents.length > 0) {
        return (
          <div className="calendar-events">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="calendar-event-dot"
                style={{ background: eventTypes[event.type].color }}
                title={event.title}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      const dayEvents = events.filter(
        (event) => format(event.date, 'yyyy-MM-dd') === format(value, 'yyyy-MM-dd')
      );
      if (dayEvents.length > 0) {
        setSelectedEvent(dayEvents[0]);
      } else {
        setSelectedEvent(null);
      }
    }
  };

  const addNewEvent = () => {
    const newEvent: Event = {
      id: events.length + 1,
      date: addDays(new Date(), Math.floor(Math.random() * 30)),
      title: `Событие #${events.length + 1}`,
      type: ['delivery', 'booking', 'meeting', 'task'][Math.floor(Math.random() * 4)] as any,
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="container calendar-container">
      <div className="page-header">
        <h1>📅 Календарь и датапикер</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="test-info">
        <p>
          Тестирование производительности календаря:
        </p>
        <ul>
          <li>Одиночный выбор даты</li>
          <li>Выбор диапазона дат</li>
          <li>Несколько календарей одновременно</li>
          <li>События и маркеры на датах</li>
          <li>Локализация (русский язык)</li>
        </ul>
      </div>

      <div className="calendar-grid">
        <div className="calendar-section">
          <h2>📆 Одиночная дата</h2>
          <Calendar
            onChange={setSingleDate}
            value={singleDate}
            locale="ru-RU"
            className="custom-calendar"
          />
          <div className="selected-info">
            {singleDate instanceof Date && (
              <p>
                Выбрано: <strong>{format(singleDate, 'dd MMMM yyyy, EEEE', { locale: ru })}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="calendar-section">
          <h2>📅 Диапазон дат</h2>
          <Calendar
            onChange={setRangeDate}
            value={rangeDate}
            selectRange
            locale="ru-RU"
            className="custom-calendar"
          />
          <div className="selected-info">
            {Array.isArray(rangeDate) && rangeDate[0] && rangeDate[1] && (
              <div>
                <p>
                  От: <strong>{format(rangeDate[0], 'dd MMM yyyy', { locale: ru })}</strong>
                </p>
                <p>
                  До: <strong>{format(rangeDate[1], 'dd MMM yyyy', { locale: ru })}</strong>
                </p>
                <p>
                  Дней: <strong>
                    {Math.ceil((rangeDate[1].getTime() - rangeDate[0].getTime()) / (1000 * 60 * 60 * 24))}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="calendar-section full-width">
          <h2>🗓️ С событиями</h2>
          <div className="events-header">
            <button type="button" onClick={addNewEvent}>
              ➕ Добавить событие
            </button>
            <div className="event-legend">
              {Object.entries(eventTypes).map(([key, { label, color }]) => (
                <span key={key} className="legend-item">
                  <span className="legend-dot" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <Calendar
            onChange={handleDateClick}
            value={singleDate}
            tileContent={tileContent}
            locale="ru-RU"
            className="custom-calendar events-calendar"
          />
          {selectedEvent && (
            <div className="event-details">
              <h3>Детали события:</h3>
              <p><strong>Дата:</strong> {format(selectedEvent.date, 'dd MMMM yyyy', { locale: ru })}</p>
              <p><strong>Название:</strong> {selectedEvent.title}</p>
              <p>
                <strong>Тип:</strong>{' '}
                <span style={{ color: eventTypes[selectedEvent.type].color }}>
                  {eventTypes[selectedEvent.type].label}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="calendar-section full-width">
          <h2>📊 Множественные календари</h2>
          <div className="multiple-calendars">
            {multipleCalendars.map((date, index) => (
              <div key={index} className="mini-calendar">
                <h3>{format(date, 'LLLL yyyy', { locale: ru })}</h3>
                <Calendar
                  value={date}
                  locale="ru-RU"
                  className="custom-calendar small"
                  showNavigation={false}
                />
              </div>
            ))}
          </div>
          <div className="calendar-controls">
            <button
              type="button"
              onClick={() => {
                setMultipleCalendars(multipleCalendars.map((d) => subMonths(d, 1)));
              }}
            >
              ← Предыдущий месяц
            </button>
            <button
              type="button"
              onClick={() => {
                setMultipleCalendars([new Date(), addMonths(new Date(), 1), addMonths(new Date(), 2)]);
              }}
              className="secondary"
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={() => {
                setMultipleCalendars(multipleCalendars.map((d) => addMonths(d, 1)));
              }}
            >
              Следующий месяц →
            </button>
          </div>
        </div>

        <div className="calendar-section full-width">
          <h2>📋 Все события ({events.length})</h2>
          <div className="events-list">
            {events
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event) => (
                <div
                  key={event.id}
                  className="event-item"
                  style={{ borderLeftColor: eventTypes[event.type].color }}
                >
                  <div className="event-date">
                    {format(event.date, 'dd MMM', { locale: ru })}
                  </div>
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <span className="event-type">{eventTypes[event.type].label}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
