export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR");
};

export const getDaysRemaining = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date() > new Date(dueDate);
};