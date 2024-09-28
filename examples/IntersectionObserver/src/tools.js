export const getUserAvatarUrl = (userName) => {
  return `https://api.dicebear.com/9.x/personas/svg?seed=${userName}`;
};
