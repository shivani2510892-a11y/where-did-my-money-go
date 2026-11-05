export const categoryLibrary = {
  essentials: {
    title: 'Essentials',
    color: '#10b981', // green
    bgTint: 'rgba(16, 185, 129, 0.1)',
    items: [
      { id: 'groceries', name: 'Groceries', icon: 'ShoppingBag', emoji: '🛒' },
      { id: 'transport', name: 'Transport', icon: 'Car', emoji: '🚗' },
      { id: 'household', name: 'Household', icon: 'Home', emoji: '🏠' },
      { id: 'bills', name: 'Bills', icon: 'FileText', emoji: '💸' },
      { id: 'daily_essentials', name: 'Daily essentials', icon: 'Sparkles', emoji: '🧼' },
    ]
  },
  education: {
    title: 'Education',
    color: '#3b82f6', // blue
    bgTint: 'rgba(59, 130, 246, 0.1)',
    items: [
      { id: 'college', name: 'College', icon: 'GraduationCap', emoji: '🎓' },
      { id: 'books', name: 'Books', icon: 'Book', emoji: '📚' },
      { id: 'stationery', name: 'Stationery', icon: 'PenTool', emoji: '✏️' },
      { id: 'courses', name: 'Courses', icon: 'Laptop', emoji: '💻' },
      { id: 'projects', name: 'Projects', icon: 'Cpu', emoji: '🔧' },
    ]
  },
  foodLifestyle: {
    title: 'Food & Lifestyle',
    color: '#f97316', // orange
    bgTint: 'rgba(249, 115, 22, 0.1)',
    items: [
      { id: 'food', name: 'Food', icon: 'Utensils', emoji: '🍱' },
      { id: 'snacks', name: 'Snacks', icon: 'Cookie', emoji: '🍪' },
      { id: 'cafes', name: 'Cafes', icon: 'Coffee', emoji: '☕' },
      { id: 'entertainment', name: 'Entertainment', icon: 'Film', emoji: '🎬' },
      { id: 'eating_out', name: 'Eating out', icon: 'GlassWater', emoji: '🍔' },
    ]
  },
  personalCare: {
    title: 'Personal Care',
    color: '#ec4899', // pink
    bgTint: 'rgba(236, 72, 153, 0.1)',
    items: [
      { id: 'skincare', name: 'Skincare', icon: 'Heart', emoji: '🧴' },
      { id: 'haircare', name: 'Haircare', icon: 'Scissors', emoji: '💇' },
      { id: 'makeup', name: 'Makeup', icon: 'Eye', emoji: '💅' },
      { id: 'accessories', name: 'Accessories', icon: 'Watch', emoji: '⌚' },
      { id: 'clothing', name: 'Clothing', icon: 'Shirt', emoji: '👕' },
    ]
  },
  health: {
    title: 'Health',
    color: '#ef4444', // red
    bgTint: 'rgba(239, 68, 68, 0.1)',
    items: [
      { id: 'medical', name: 'Medical', icon: 'Activity', emoji: '🏥' },
      { id: 'pharmacy', name: 'Pharmacy', icon: 'Pills', emoji: '💊' },
      { id: 'fitness', name: 'Fitness', icon: 'Dumbbell', emoji: '💪' },
    ]
  },
  other: {
    title: 'Other',
    color: '#6b7280', // gray
    bgTint: 'rgba(107, 114, 128, 0.1)',
    items: [
      { id: 'travel', name: 'Travel', icon: 'Compass', emoji: '✈️' },
      { id: 'gifts', name: 'Gifts', icon: 'Gift', emoji: '🎁' },
      { id: 'subscriptions', name: 'Subscriptions', icon: 'Calendar', emoji: '📅' },
      { id: 'miscellaneous', name: 'Miscellaneous', icon: 'HelpCircle', emoji: '⚙️' },
    ]
  }
};
