import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { format, addMonths, subMonths } from 'date-fns';
import { useBudget } from '../contexts/BudgetContext';

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FF8A80', '#80CBC4', '#81C784', '#FFB74D', '#F06292', '#BA68C8',
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const {
    categories,
    budgets,
    selectedMonth,
    getBudgets,
    setSelectedMonth,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    getCategoryBudget,
  } = useBudget();

  const [tabValue, setTabValue] = useState(0);
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    category?: any;
    isEdit: boolean;
  }>({ open: false, isEdit: false });
  const [budgetMonth, setBudgetMonth] = useState(format(selectedMonth, 'yyyy-MM'));

  // Category dialog state
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(colorOptions[0]);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(subMonths(new Date(), 6), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
      date,
    };
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenCategoryDialog = (category?: any) => {
    if (category) {
      setCategoryName(category.name);
      setCategoryColor(category.color);
      setCategoryDialog({ open: true, category, isEdit: true });
    } else {
      setCategoryName('');
      setCategoryColor(colorOptions[0]);
      setCategoryDialog({ open: true, isEdit: false });
    }
  };

  useEffect(() => {
    getCategories()
  }, [])
  const handleCloseCategoryDialog = () => {
    setCategoryDialog({ open: false, isEdit: false });
    setCategoryName('');
    setCategoryColor(colorOptions[0]);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;
    console.log("category edit", categoryDialog.isEdit)
    if (categoryDialog.isEdit && categoryDialog.category) {
      updateCategory(categoryDialog.category._id, {
        name: categoryName,
        color: categoryColor,
      });
    } else {
      addCategory({
        _id: "",
        name: categoryName,
        color: categoryColor,
      });
    }
    handleCloseCategoryDialog();
  };

  const handleDeleteCategory = async (category: any) => {
    if (window.confirm(`Are you sure you want to delete this category ? This will also delete all related expenses and budgets.`)) {
      await deleteCategory(category._id);
    }
  };

  // const handleBudgetChange = (categoryId: any, value: string) => {
  //   const amount = parseFloat(value) || 0;
  //   const existingBudget = budgets.find(b => b.categoryId === categoryId && b.month === budgetMonth);

  //   if (existingBudget) {
  //     updateBudget(existingBudget.id, { limit: amount });
  //   } else {
  //     addBudget({
  //       categoryId,
  //       month: budgetMonth,
  //       limit: amount,
  //     });
  //   }
  // };



  const getBudgetForCategory = (categoryId: string) => {
    console.log("list", budgets, categoryId)
    const budget = budgets.find(b => b.categoryId === categoryId && Number(b.month) == Number(budgetMonth.split("-")[1]) && Number(b.year) == Number(budgetMonth.split("-")[0]));
    console.log("budget", budget, budgetMonth)
    return budget?.amount || 0;
  };

  const getBudgetExist = (categoryId: string) => {
    console.log("list", budgets, categoryId)
    const budget = budgets.find(b => b.categoryId === categoryId && Number(b.month) == Number(budgetMonth.split("-")[1]) && Number(b.year) == Number(budgetMonth.split("-")[0]));
    console.log("budget", budget, budgetMonth)
    return budget?._id || null;
  };
  const [editedBudgets, setEditedBudgets] = useState<{ [key: string]: number }>({});
  const handleBudgetChange = (categoryId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    console.log(amount, categoryId, "category")
    setEditedBudgets(prev => ({ ...prev, [categoryId]: amount }));
  };
  const handleUpdate = (categoryId: string) => {
    console.log("handle updated", editedBudgets)
    const newAmount = editedBudgets[categoryId];
    const existingBudget = budgets.find(
      b => b.categoryId === categoryId && Number(b.month) == Number(budgetMonth.split("-")[1]) && Number(b.year) == Number(budgetMonth.split("-")[0])
    );

    if (existingBudget) {
      updateBudget(existingBudget.id, { amount: newAmount });
    } else {
      addBudget({ categoryId, month: budgetMonth, amount: newAmount, _id: "" });
    }
  };

  const handleCancel = (categoryId: string) => {
    const original = getBudgetForCategory(categoryId);
    setEditedBudgets(prev => ({ ...prev, [categoryId]: original }));
  };

  const handleDelete = (categoryId: string) => {
    const existingBudget = budgets.find(
      b => b.categoryId === categoryId && Number(b.month) == Number(budgetMonth.split("-")[1]) && Number(b.year) == Number(budgetMonth.split("-")[0])
    );
    if (existingBudget && window.confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(existingBudget._id, budgetMonth);
      setEditedBudgets(prev => {
        const newEdits = { ...prev };
        delete newEdits[categoryId];
        return newEdits;
      });
    }
  };

  useEffect(() => {
    setEditedBudgets({});

    getBudgets(budgetMonth)

  }, [budgetMonth])
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Categories" />
            <Tab label="Budgets" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Manage Categories
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCategoryDialog()}
              >
                Add Category
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: category.color,
                            }}
                          />
                          {category.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.color}
                          sx={{
                            backgroundColor: category.color,
                            color: 'white',
                            fontFamily: 'monospace',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenCategoryDialog(category)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        {category._id && <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <DeleteIcon />
                        </IconButton>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Set Monthly Budgets
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={budgetMonth}
                  label="Month"
                  onChange={(e) => setBudgetMonth(e.target.value)}
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
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: category.color,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        label="Monthly Budget"
                        type="number"
                        value={editedBudgets[category._id] ?? getBudgetForCategory(category._id)}

                        onChange={(e) => handleBudgetChange(category._id, e.target.value)}
                        InputProps={{
                          startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" color="primary" onClick={() => handleUpdate(category._id)}>
                          {getBudgetExist(category._id) ? "Update" : "Create"}
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => handleCancel(category._id)}>
                          Cancel
                        </Button>
                        {getBudgetExist(category._id) && <Button variant="outlined" color="error" onClick={() => handleDelete(category._id)}>
                          Delete
                        </Button>}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

          </TabPanel>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialog.open} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {categoryDialog.isEdit ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              fullWidth
              required
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Choose Color
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colorOptions.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: categoryColor === color ? '3px solid #000' : '2px solid transparent',
                      transition: 'border 0.2s',
                      '&:hover': {
                        border: '2px solid #666',
                      },
                    }}
                    onClick={() => setCategoryColor(color)}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={!categoryName.trim()}
          >
            {categoryDialog.isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}