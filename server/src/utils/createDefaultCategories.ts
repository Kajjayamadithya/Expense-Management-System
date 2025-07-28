import Category from "../models/Category";

export const createDefaultCategories = async (userId: string) => {
  const defaults = [
    { name: "Salary", type: "income" },
    { name: "Freelancing", type: "income" },
    { name: "Food", type: "expense" },
    { name: "Rent", type: "expense" },
    { name: "Shopping", type: "expense" },
    { name: "Utilities", type: "expense" }
  ];

  const categoryPromises = defaults.map((cat) =>
    Category.create({ ...cat, user: userId })
  );

  await Promise.all(categoryPromises);
};
