import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import {
  ConfirmationNumberOutlined,
  PriorityHighOutlined,
  TimerOutlined,
  PeopleOutlined,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { tickets, users } from '../../data/mockData';
import KpiCard from '../../components/dashboard/KpiCard';
import AlertCard from '../../components/dashboard/AlertCard';

export default function ManagerDashboard() {
  const { user } = useAuth();

  // ────────────────────────────────────────────────────────────
  // CALCULS DES KPIs
  // ────────────────────────────────────────────────────────────
  
  // Total tickets ouverts
  const ticketsOuverts = tickets.filter(t => t.statut === 'open' || t.statut === 'assigned').length;

  // Tickets critiques non assignés
  const ticketsCritiques = tickets.filter(t => t.priorite === 'critical' && !t.technicienId).length;

  // Délai moyen de résolution (en heures) - Simulé
  const delaiMoyen = 4.2;

  // Techniciens actifs
  const techniciensActifs = users.filter(u => u.role === 'technician').length;

  // ────────────────────────────────────────────────────────────
  // DONNÉES POUR BARCHART - Tickets par statut
  // ────────────────────────────────────────────────────────────
  const ticketParStatut = [
    { statut: 'Ouverts', count: tickets.filter(t => t.statut === 'open').length, fill: '#3B82F6' },
    { statut: 'Assignés', count: tickets.filter(t => t.statut === 'assigned').length, fill: '#3B82F6' },
    { statut: 'En cours', count: tickets.filter(t => t.statut === 'in_progress').length, fill: '#F59E0B' },
    { statut: 'Résolus', count: tickets.filter(t => t.statut === 'resolved').length, fill: '#22C55E' },
    { statut: 'Clôturés', count: tickets.filter(t => t.statut === 'closed').length, fill: '#6B7280' },
  ];

  // ────────────────────────────────────────────────────────────
  // DONNÉES POUR LINECHART - Évolution 7 derniers jours
  // ────────────────────────────────────────────────────────────
  const evolutionTickets = [
    { jour: 'Lun', tickets: 2 },
    { jour: 'Mar', tickets: 3 },
    { jour: 'Mer', tickets: 1 },
    { jour: 'Jeu', tickets: 4 },
    { jour: 'Ven', tickets: 2 },
    { jour: 'Sam', tickets: 1 },
    { jour: 'Dim', tickets: 0 },
  ];

  // ────────────────────────────────────────────────────────────
  // ALERTES - Tickets critiques non assignés
  // ────────────────────────────────────────────────────────────
  const alertes = tickets.filter(t => t.priorite === 'critical' && !t.technicienId);

  // ────────────────────────────────────────────────────────────
  // PERFORMANCE ÉQUIPE - Tickets résolus par technicien
  // ────────────────────────────────────────────────────────────
  const techniciens = users.filter(u => u.role === 'technician');
  const performanceEquipe = techniciens.map(tech => {
    const ticketsResolus = tickets.filter(
      t => t.technicienId === tech.id && t.statut === 'resolved'
    ).length;
    
    return {
      nom: tech.nom,
      resolus: ticketsResolus,
      competences: tech.competences?.join(', ') || 'N/A',
    };
  });

  // ────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', marginBottom: 1 }}>
          Dashboard Manager
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280' }}>
          Bienvenue, {user?.nom || user?.name || 'Manager'} 👋
        </Typography>
      </Box>

      {/* ────── KPIs Cards ────── */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={ConfirmationNumberOutlined}
            value={ticketsOuverts}
            label="Tickets ouverts"
            color="#2563EB"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={PriorityHighOutlined}
            value={ticketsCritiques}
            label="Tickets critiques"
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={TimerOutlined}
            value={`${delaiMoyen}h`}
            label="Délai moyen résolution"
            color="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={PeopleOutlined}
            value={techniciensActifs}
            label="Techniciens actifs"
            color="#22C55E"
          />
        </Grid>
      </Grid>

      {/* ────── Row: Charts ────── */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {/* BarChart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ padding: '24px !important' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', marginBottom: 3 }}>
                Tickets par statut
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ticketParStatut}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="statut" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #E5E7EB',
                      fontSize: '13px'
                    }} 
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {ticketParStatut.map((entry, index) => (
                      <Bar key={index} dataKey="count" fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* LineChart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ padding: '24px !important' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', marginBottom: 3 }}>
                Évolution sur 7 jours
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={evolutionTickets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="jour" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #E5E7EB',
                      fontSize: '13px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#2563EB" 
                    strokeWidth={3}
                    dot={{ fill: '#2563EB', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ────── Row: Alertes + Performance ────── */}
      <Grid container spacing={3}>
        {/* Alertes */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ padding: 3, borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              🔴 Alertes critiques
            </Typography>
            
            {alertes.length === 0 ? (
              <Box sx={{ textAlign: 'center', padding: 4 }}>
                <Typography sx={{ color: '#22C55E', fontWeight: 600 }}>
                  ✅ Aucune alerte critique
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {alertes.map(ticket => (
                  <AlertCard key={ticket.id} ticket={ticket} />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Performance Équipe */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ padding: 3, borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              📊 Performance de l'équipe
            </Typography>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '12px 8px', 
                      color: '#6B7280',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}>
                      Technicien
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '12px 8px', 
                      color: '#6B7280',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}>
                      Compétences
                    </th>
                    <th style={{ 
                      textAlign: 'center', 
                      padding: '12px 8px', 
                      color: '#6B7280',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}>
                      Résolus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceEquipe.map((tech, index) => (
                    <tr 
                      key={index}
                      style={{ 
                        borderBottom: '1px solid #F3F4F6',
                      }}
                    >
                      <td style={{ 
                        padding: '16px 8px',
                        color: '#111827',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}>
                        {tech.nom}
                      </td>
                      <td style={{ 
                        padding: '16px 8px',
                        color: '#6B7280',
                        fontSize: '13px'
                      }}>
                        {tech.competences}
                      </td>
                      <td style={{ 
                        padding: '16px 8px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          background: tech.resolus > 0 ? '#DCFCE7' : '#F3F4F6',
                          color: tech.resolus > 0 ? '#16A34A' : '#6B7280',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {tech.resolus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}