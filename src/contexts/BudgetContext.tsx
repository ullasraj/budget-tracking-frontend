import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Axios from '../custom-axios.';
import { toast } from 'react-toastify';

export interface Category {
  _id: string;
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Budget {
  _id: string,
  id: string;
  categoryId: string;
  month: string; // YYYY-MM format
  amount: number;
  year?: number
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  date: Date;
  description?: string;
}

interface BudgetContextType {
  categories: Category[];
  budgets: Budget[];
  expenses: Expense[];
  selectedMonth: Date;
  getExpenses:(month:string)=>void,
  getBudgets: (month: string) => void,
  getCategories: () => void,
  setSelectedMonth: (date: Date) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string,month:string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<{ success: boolean; withinBudget: boolean }>;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getCategorySpent: (categoryId: string, month?: Date) => number;
  getCategoryBudget: (categoryId: string, month?: Date) => number;
  getCategoryRemaining: (categoryId: string, month?: Date) => number;
  isOverBudget: (categoryId: string, month?: Date) => boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}

const defaultCategories: Category[] = [];

const defaultBudgets: Budget[] = [];

const defaultExpenses: Expense[] = [
  { id: '1', categoryId: '1', amount: 45.50, date: new Date(), description: 'Lunch at restaurant' },
  { id: '2', categoryId: '2', amount: 25.00, date: new Date(), description: 'Gas station' },
  { id: '3', categoryId: '3', amount: 89.99, date: new Date(), description: 'Online shopping' },
  { id: '4', categoryId: '1', amount: 32.75, date: new Date(), description: 'Grocery store' },
  { id: '5', categoryId: '4', amount: 15.00, date: new Date(), description: 'Movie ticket' },
];

interface BudgetProviderProps {
  children: ReactNode;
}

export function BudgetProvider({ children }: BudgetProviderProps) {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.post(
        "/create-category",
        { ...category },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Category Created Successful")
        await getCategories()
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...category } : cat));
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.put(
        `/category/${id}`,
        { ...category },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Category Updated Successful")
        await getCategories()
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  };

  const deleteCategory = async (id: string) => {
    const token = localStorage.getItem('access_token');

    try {

      const response = await Axios.delete(
        `/category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Category Deleted Successful")
        getCategories()
        // toast.success("Category Updated Successful")
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setBudgets(prev => prev.filter(budget => budget.categoryId !== id));
    setExpenses(prev => prev.filter(expense => expense.categoryId !== id));
  };

  const getCategories = async () => {
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.get(
        `/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error, data } = response.data;
      if (status == "Ok") {
        setCategories(data.data)
        // toast.success("Category Updated Successful")
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  }

  const getBudgets = async (month: string) => {
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.get(
        `/get-month-budget?month=${month}`,
        {

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error, data } = response.data;
      if (status == "Ok") {
        setBudgets(data.data)
        // toast.success("Category Updated Successful")
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  }

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    console.log("add budget", budget)
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.post(
        "/create-budget",
        { ...budget },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Budget Created Successful")
        await getBudgets(budget.month)
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  };

  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    console.log("add budget", budget)
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.post(
        `/budgets/${id}`,
        { ...budget },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Budget Created Successful")
        await getBudgets(`${budget.year}-${budget.month}`)
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  };

  const deleteBudget = async(id: string,month:string) => {
    const token = localStorage.getItem('access_token');

    try {

      const response = await Axios.delete(
        `/budgets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error } = response.data;
      if (status == "Ok") {
        toast.success("Budget Deleted Successful")
        getBudgets(month)
        // toast.success("Category Updated Successful")
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<{ success: boolean; withinBudget: boolean }> => {
    
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };

    setExpenses(prev => [...prev, newExpense]);

   
    const currentSpent = getCategorySpent(expense.categoryId, expense.date);
    const budget = getCategoryBudget(expense.categoryId, expense.date);
    const newTotal = currentSpent + expense.amount;
    console.log("add expense",currentSpent,budget,newTotal)
    const withinBudget = newTotal <= budget;

    return { success: true, withinBudget };
  };
 const getExpenses = async (month: string) => {
    const token = localStorage.getItem('access_token');
    try {

      const response = await Axios.get(
        `/get-month-expense?month=${month}`,
        {

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { status, error, data } = response.data;
      if (status == "Ok") {
        setExpenses(data.data)
        // toast.success("Category Updated Successful")
      } else {
        throw new Error(error.message);

      }
    } catch (error) {

      throw new Error('Signup failed');
    }
  }
  const updateExpense = (id: string, expense: Partial<Expense>) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...expense } : exp));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const getCategorySpent = (categoryId: string, month: Date = selectedMonth): number => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    return expenses
      .filter(expense =>
        expense.categoryId === categoryId &&
        expense.date >= monthStart &&
        expense.date <= monthEnd
      )
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryBudget = (categoryId: string, month: Date = selectedMonth): number => {
    const monthKey = format(month, 'yyyy-MM');
    console.log("monthKey",monthKey,budgets)
    
    const budget = budgets.find(b => b.categoryId === categoryId && Number(b.month) == Number(monthKey.split("-")[1]));
    return budget?.amount || 0;
  };

  const getCategoryRemaining = (categoryId: string, month: Date = selectedMonth): number => {
    const spent = getCategorySpent(categoryId, month);
    const budget = getCategoryBudget(categoryId, month);
    return budget - spent;
  };

  const isOverBudget = (categoryId: string, month: Date = selectedMonth): boolean => {
    return getCategoryRemaining(categoryId, month) < 0;
  };

  const value = {
    categories,
    budgets,
    expenses,
    selectedMonth,
    setSelectedMonth,
    addCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addExpense,
    getExpenses,
    getBudgets,
    updateExpense,
    deleteExpense,
    getCategorySpent,
    getCategoryBudget,
    getCategoryRemaining,
    isOverBudget,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}