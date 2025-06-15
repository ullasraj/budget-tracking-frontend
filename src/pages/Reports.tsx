import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, addMonths, subMonths } from 'date-fns';
import { useBudget } from '../contexts/BudgetContext';

export default function Reports() {
  const theme = useTheme();
  const {
    categories,
    getCategories,
    getExpenses,
    getBudgets,
    selectedMonth,
    setSelectedMonth,
    getCategorySpent,
    getCategoryBudget,
    getCategoryRemaining,
  } = useBudget();

  const [month,setMonth]=useState<string>('')
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(subMonths(new Date(), 6), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
      date,
    };
  });

  const handleMonthChange = (monthString: string) => {
    const option = monthOptions.find(opt => opt.value === monthString);
    setMonth(monthString)
    if (option) {
      setSelectedMonth(option.date);
    }
  };

  const chartData = categories.map(category => {
    const spent = getCategorySpent(category._id);
    const budget = getCategoryBudget(category._id);
    const remaining = getCategoryRemaining(category._id);
    
    return {
      name: category.name,
      spent,
      budget,
      remaining: Math.max(remaining, 0),
      color: category.color,
      isOverBudget: remaining < 0,
    };
  });

  const tableData = categories.map(category => {
    const spent = getCategorySpent(category._id);
    const budget = getCategoryBudget(category._id);
    const remaining = getCategoryRemaining(category._id);
    console.log(spent)
    return {
      id: category._id,
      name: category.name,
      color: category.color,
      spent,
      budget,
      remaining,
      isOverBudget: remaining < 0,
    };
  });
useEffect(()=>{
  getCategories()
  if(month){
    getBudgets(month)
    getExpenses(month)
  }
},[month])
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Reports
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={format(selectedMonth, 'yyyy-MM')}
            label="Month"
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Budget vs Spending Overview
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar dataKey="budget" fill="#e0e0e0" name="Budget" />
                    <Bar dataKey="spent" name="Spent">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Budget
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ${chartData.reduce((sum, item) => sum + item.budget, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    ${chartData.reduce((sum, item) => sum + item.spent, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Remaining
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      color: chartData.reduce((sum, item) => sum + (item.budget - item.spent), 0) >= 0 
                        ? 'success.main' 
                        : 'error.main' 
                    }}
                  >
                    ${chartData.reduce((sum, item) => sum + (item.budget - item.spent), 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Detailed Breakdown
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Budget</TableCell>
                      <TableCell align="right">Spent</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: row.color,
                              }}
                            />
                            {row.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">${row.budget.toFixed(2)}</TableCell>
                        <TableCell align="right">${row.spent.toFixed(2)}</TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: row.isOverBudget ? 'error.main' : 'success.main',
                            fontWeight: 600 
                          }}
                        >
                          ${Math.abs(row.remaining).toFixed(2)}
                          {row.isOverBudget && ' over'}
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: row.isOverBudget ? 'error.main' : 'success.main',
                              mx: 'auto',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}