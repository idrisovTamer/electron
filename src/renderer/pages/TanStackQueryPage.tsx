import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useQueries, useInfiniteQuery } from '@tanstack/react-query';
import './TanStackQueryPage.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

const fetchPosts = async (page: number = 1): Promise<Post[]> => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`);
  if (!response.ok) throw new Error('Network error');
  return response.json();
};

const fetchUser = async (userId: number): Promise<User> => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  if (!response.ok) throw new Error('Network error');
  return response.json();
};

const fetchComments = async (postId: number) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
  if (!response.ok) throw new Error('Network error');
  return response.json();
};

function QueriesDemo() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Single query
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(1),
  });

  // Parallel queries
  const userQueries = useQueries({
    queries: (posts || []).slice(0, 5).map((post) => ({
      queryKey: ['user', post.userId],
      queryFn: () => fetchUser(post.userId),
      enabled: !!posts,
    })),
  });

  // Comments query (dependent)
  const { data: comments } = useQuery({
    queryKey: ['comments', selectedPostId],
    queryFn: () => fetchComments(selectedPostId!),
    enabled: selectedPostId !== null,
  });

  // Infinite query
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts-infinite'],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error.message}</div>;

  return (
    <div className="queries-demo">
      <div className="query-section">
        <h2>📡 Single Query (Посты)</h2>
        <button type="button" onClick={() => refetch()}>
          🔄 Обновить
        </button>
        <div className="posts-list">
          {posts?.slice(0, 5).map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => setSelectedPostId(post.id)}
            >
              <h3>{post.title}</h3>
              <p>{post.body.substring(0, 100)}...</p>
              {selectedPostId === post.id && comments && (
                <div className="comments">
                  <strong>Комментарии ({comments.length}):</strong>
                  {comments.slice(0, 2).map((comment: any) => (
                    <p key={comment.id}>{comment.body.substring(0, 50)}...</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="query-section">
        <h2>⚡ Parallel Queries (Пользователи)</h2>
        <div className="users-grid">
          {userQueries.map((query, index) => (
            <div key={index} className="user-card">
              {query.isLoading ? (
                <div>Загрузка...</div>
              ) : query.error ? (
                <div>Ошибка</div>
              ) : query.data ? (
                <>
                  <h4>{query.data.name}</h4>
                  <p>{query.data.email}</p>
                  <p>{query.data.phone}</p>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="query-section">
        <h2>♾️ Infinite Query</h2>
        <div className="infinite-list">
          {infiniteData?.pages.map((page, pageIndex) => (
            <div key={pageIndex}>
              {page.map((post) => (
                <div key={post.id} className="infinite-item">
                  {post.id}. {post.title}
                </div>
              ))}
            </div>
          ))}
        </div>
        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Загрузка...' : 'Загрузить ещё'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TanStackQueryPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>⚡ TanStack Query (React Query)</h1>
        <Link to="/">
          <button type="button" className="back-button">
            ← Назад
          </button>
        </Link>
      </div>

      <div className="test-info">
        <p>
          Тестирование производительности при работе с данными:
        </p>
        <ul>
          <li>Single queries - одиночные запросы с кешированием</li>
          <li>Parallel queries - параллельные запросы (5 одновременно)</li>
          <li>Dependent queries - зависимые запросы</li>
          <li>Infinite queries - бесконечная прокрутка</li>
          <li>Автоматическое кеширование и инвалидация</li>
        </ul>
      </div>

      <QueryClientProvider client={queryClient}>
        <QueriesDemo />
      </QueryClientProvider>
    </div>
  );
}
