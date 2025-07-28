import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

const schema = yup.object({
  name: yup.string().required("Category name is required"),
  type: yup.string().oneOf(["income", "expense"]).required("Type is required"),
});

const Category = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch (err: any) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await axios.post("/categories", data);
      toast.success("Category added");
      fetchCategories();
      reset();
    } catch (err: any) {
      toast.error("Failed to add category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-white p-6">
      <div className="max-w-3xl mx-auto bg-white/90 shadow-xl rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-3xl font-bold text-indigo-700">Manage Categories</h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700">Category Name</label>
            <input
              {...register("name")}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Rent or Salary"
            />
            <p className="text-red-500 text-sm">{errors.name?.message}</p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700">Type</label>
            <select
              {...register("type")}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <p className="text-red-500 text-sm">{errors.type?.message}</p>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            ➕ Add Category
          </button>
        </form>

        {/* Category List */}
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-gray-500 italic">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-white rounded-lg shadow-md"
              >
                <div>
                  <p className="font-semibold text-gray-800">{cat.name}</p>
                  <p className="text-sm text-gray-600">({cat.type})</p>
                </div>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
