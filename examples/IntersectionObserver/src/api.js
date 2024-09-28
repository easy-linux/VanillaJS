const API_URL = "https://jsonplaceholder.typicode.com";

// Функция для получения постов с пагинацией
export const getPosts = async (page = 1, limit = 30) => {
  const response = await fetch(`${API_URL}/posts?_page=${page}&_limit=${limit}`);
  const posts = await response.json();
  return posts;
};

// Функция для получения пользователей
export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  const users = await response.json();
  return users;
};


// Функция для получения пользователя по ID
export const getUserById = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка: Не удалось получить данные пользователя с ID ${userId}`);
      }
  
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
    }
  };

// Функция для получения комментариев для поста
export const getCommentsForPost = async (postId) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`);
  const comments = await response.json();
  return comments;
};
