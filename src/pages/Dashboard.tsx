import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format, addMonths, subMonths } from 'date-fns';
import { useBudget } from '../contexts/BudgetContext';
import AddExpenseDialog from '../components/AddExpenseDialog';

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    categories,
    getCategories,
    getBudgets,
    getExpenses,
    selectedMonth,
    setSelectedMonth,
    getCategorySpent,
    getCategoryBudget,
    getCategoryRemaining,
    isOverBudget,
  } = useBudget();
  const [addExpenseOpen, setAddExpenseOpen] = React.useState(false);
  const [month,selectMonth]=useState<string>('')
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
    selectMonth(monthString)
    if (option) {
      setSelectedMonth(option.date);
    }
  };
  useEffect(() => {
    getCategories()
    if (month) {
      getExpenses(month)
      getBudgets(month)
    }
  }, [month])
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          {!isMobile && (
            <Fab
              color="primary"
              aria-label="add expense"
              onClick={() => setAddExpenseOpen(true)}
              sx={{ boxShadow: 3 }}
            >
              <AddIcon />
            </Fab>
          )}
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

      {/* Category Cards */}
      <Grid container spacing={3}>
        {categories.map((category) => {
          const spent = getCategorySpent(category._id);
          const budget = getCategoryBudget(category._id);
          const remaining = getCategoryRemaining(category._id);
          const overBudget = isOverBudget(category._id);
          const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                        }}
                      />
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    {overBudget && (
                      <Chip
                        label="OVER BUDGET"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ${spent.toFixed(2)} / ${budget.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progress.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: overBudget ? theme.palette.error.main : category.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Remaining:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: overBudget ? theme.palette.error.main : theme.palette.success.main,
                      }}
                    >
                      ${Math.abs(remaining).toFixed(2)}
                      {overBudget && ' over'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <AddExpenseDialog
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />
    </Box>
  );
}