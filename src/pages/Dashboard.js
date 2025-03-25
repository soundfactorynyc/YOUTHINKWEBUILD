import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth.currentUser) return;
      
      try {
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const projectsData = [];
        
        querySnapshot.forEach((doc) => {
          projectsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    
    try {
      await deleteDoc(doc(db, 'projects', selectedProject.id));
      setProjects(projects.filter(project => project.id !== selectedProject.id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
    
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Projects
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          to="/generate"
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              You don't have any projects yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first website with our AI generator
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              component={Link}
              to="/generate"
            >
              Create New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {project.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    size="small" 
                    component={Link} 
                    to={`/preview/${project.id}`}
                    aria-label="Preview"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    component={Link} 
                    to={`/edit/${project.id}`}
                    aria-label="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(project)}
                    aria-label="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
