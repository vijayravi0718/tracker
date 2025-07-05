// tracker.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { get, set } from 'idb-keyval';

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function Tracker() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [choresByMonth, setChoresByMonth] = useState({});
  const [habitData, setHabitData] = useState({});
  const [newChore, setNewChore] = useState('');
  const [editChoreIndex, setEditChoreIndex] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [visibleChoreIndex, setVisibleChoreIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  useEffect(() => {
    const loadData = async () => {
      const chores = await get('choresByMonth');
      const habits = await get('habitData');
      if (chores) setChoresByMonth(chores);
      if (habits) setHabitData(habits);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      set('choresByMonth', choresByMonth);
    }
  }, [choresByMonth, loading]);

  useEffect(() => {
    if (!loading) {
      set('habitData', habitData);
    }
  }, [habitData, loading]);

  useEffect(() => {
    const requestPersistentStorage = async () => {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log('🔐 Persistent storage:', isPersisted ? 'Granted' : 'Denied');
      }
    };
    requestPersistentStorage();
  }, []);

  const handleAddChore = () => {
    if (newChore.trim() !== '') {
      setChoresByMonth(prev => {
        const monthChores = [...(prev[monthKey] || [])];
        if (editChoreIndex !== null) {
          monthChores[editChoreIndex] = newChore.trim();
        } else {
          monthChores.push(newChore.trim());
        }
        return { ...prev, [monthKey]: monthChores };
      });
      setNewChore('');
      setEditChoreIndex(null);
      setVisibleChoreIndex(null);
    }
  };

  const handleEditChore = (index) => {
    setNewChore(chores[index]);
    setEditChoreIndex(index);
  };

  const handleDeleteChore = () => {
    setChoresByMonth(prev => {
      const updated = [...(prev[monthKey] || [])];
      updated.splice(confirmDeleteIndex, 1);
      return { ...prev, [monthKey]: updated };
    });
    setConfirmDeleteIndex(null);
    setVisibleChoreIndex(null);
  };

  const handleMark = (date, chore) => {
    setHabitData(prev => {
      const updated = { ...prev };
      if (!updated[date]) updated[date] = {};
      const current = updated[date][chore];
      let next = null;
      if (current === null || current === undefined) next = 'yes';
      else if (current === 'yes') next = 'no';
      else if (current === 'no') next = null;
      updated[date][chore] = next;
      return updated;
    });
  };

  const getStatus = (date, chore) => {
    return habitData[date]?.[chore] || null;
  };

  const chores = choresByMonth[monthKey] || [];
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const monthNames = [...Array(12)].map((_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom align="center">Habit Tracker</Typography>

      <Grid container spacing={2} justifyContent="center" alignItems="center" marginBottom={2}>
        <Grid item>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthNames.map((name, index) => (
              <MenuItem key={index} value={index}>{name}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <TextField
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            label="Year"
            InputProps={{ inputProps: { min: 2000, max: 2099 } }}
          />
        </Grid>
        <Grid item>
          <TextField
            value={newChore}
            onChange={(e) => setNewChore(e.target.value)}
            label={editChoreIndex !== null ? "Edit Chore" : "Add Chore"}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleAddChore}>
            {editChoreIndex !== null ? "Update" : "Add"}
          </Button>
        </Grid>
      </Grid>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Day</TableCell>
              {chores.map((chore, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  onClick={() => setVisibleChoreIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                    <span>{chore}</span>
                    {visibleChoreIndex === idx && (
                      <>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditChore(idx); }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(idx); }}><DeleteIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <TableRow key={day}>
                  <TableCell align="center">{day}</TableCell>
                  {chores.map((chore, j) => {
                    const status = getStatus(dateStr, chore);
                    return (
                      <TableCell
                        key={j}
                        onClick={() => handleMark(dateStr, chore)}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                      >
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            width: '36px',
                            height: '36px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              status === 'yes' ? '#e6ffe6' :
                              status === 'no' ? '#ffe6e6' : '#fff'
                          }}
                        >
                          {status === 'yes' && <CheckIcon color="success" />}
                          {status === 'no' && <CloseIcon color="error" />}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={confirmDeleteIndex !== null}
        onClose={() => setConfirmDeleteIndex(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this chore from this month? This won't affect other months.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteIndex(null)}>Cancel</Button>
          <Button onClick={handleDeleteChore} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
